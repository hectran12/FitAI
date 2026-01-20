"""
FitAI - Python AI Service
FastAPI application for workout plan generation

Modes:
- Mode A (default): Rule-based plan generator (always available offline)
- Mode B (optional): Gemini AI enhancement when GEMINI_API_KEY is present
"""

import os
import hashlib
import random
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from generator import WorkoutPlanGenerator
from gemini_client import GeminiClient
from chat_handler import ChatHandler

# Initialize FastAPI app
app = FastAPI(
    title="FitAI Plan Generator",
    description="AI-powered workout plan generation service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
generator = WorkoutPlanGenerator()
gemini_client = GeminiClient()
chat_handler = ChatHandler(gemini_client)


# ============== Pydantic Models ==============

class ProfileData(BaseModel):
    goal: str  # fat_loss, muscle_gain, maintenance
    level: str  # beginner, intermediate, advanced
    days_per_week: int  # 3-6
    session_minutes: int  # 20-90
    equipment: str  # none, home, gym
    constraints: Optional[str] = None
    availability: Optional[Dict[str, Any]] = None


class Exercise(BaseModel):
    name: str
    muscle_group: str
    equipment: str
    difficulty: str
    description: Optional[str] = None


class GeneratePlanRequest(BaseModel):
    user_id: int
    week_start: str  # YYYY-MM-DD
    profile: ProfileData
    exercises: List[Exercise]


class LogSummary(BaseModel):
    date: str
    title: str
    status: str  # done, skipped, pending
    fatigue_rating: Optional[int] = None
    notes: Optional[str] = None


class PreviousPlan(BaseModel):
    week_start: str
    principles: Optional[List[str]] = None
    days: List[LogSummary]


class LogsStatistics(BaseModel):
    completed_days: int
    total_days: int
    completion_rate: int
    average_fatigue: Optional[float] = None


class AdjustPlanRequest(BaseModel):
    user_id: int
    week_start: str
    profile: ProfileData
    exercises: List[Exercise]
    previous_plan: PreviousPlan
    logs_summary: LogsStatistics


class SessionItem(BaseModel):
    exercise: str
    sets: int
    reps: str
    rest_sec: int
    notes: Optional[str] = None


class PlanDay(BaseModel):
    date: str
    title: str
    sessions: List[SessionItem]
    estimated_minutes: int


class PlanResponse(BaseModel):
    week_start: str
    days: List[PlanDay]
    principles: List[str]
    notes: List[str]


# ============== Endpoints ==============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FitAI Plan Generator",
        "version": "1.0.0",
        "gemini_available": gemini_client.is_available(),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/generate_plan", response_model=PlanResponse)
async def generate_plan(request: GeneratePlanRequest):
    """
    Generate a 7-day workout plan based on user profile
    
    Uses rule-based generator (Mode A) and optionally enhances
    with Gemini AI for notes/principles (Mode B)
    """
    try:
        # Generate deterministic seed from user_id + week_start
        seed_string = f"{request.user_id}-{request.week_start}"
        seed = int(hashlib.md5(seed_string.encode()).hexdigest()[:8], 16)
        
        # Convert exercises to dict format
        exercises_dict = [ex.model_dump() for ex in request.exercises]
        
        # Generate plan using rule-based generator (Mode A)
        plan = generator.generate_plan(
            profile=request.profile.model_dump(),
            exercises=exercises_dict,
            week_start=request.week_start,
            seed=seed
        )
        
        # Optionally enhance with Gemini (Mode B)
        if gemini_client.is_available():
            enhanced = gemini_client.enhance_plan(
                plan=plan,
                profile=request.profile.model_dump()
            )
            if enhanced:
                plan['principles'] = enhanced.get('principles', plan['principles'])
                plan['notes'] = enhanced.get('notes', plan['notes'])
        
        return PlanResponse(**plan)
        
    except Exception as e:
        print(f"Error generating plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/adjust_plan", response_model=PlanResponse)
async def adjust_plan(request: AdjustPlanRequest):
    """
    Generate adjusted plan for next week based on previous week's logs
    
    Considers:
    - Completion rate
    - Average fatigue levels
    - Skipped sessions
    """
    try:
        # Generate deterministic seed
        seed_string = f"{request.user_id}-{request.week_start}-adjusted"
        seed = int(hashlib.md5(seed_string.encode()).hexdigest()[:8], 16)
        
        # Convert exercises to dict format
        exercises_dict = [ex.model_dump() for ex in request.exercises]
        
        # Generate adjusted plan
        plan = generator.generate_adjusted_plan(
            profile=request.profile.model_dump(),
            exercises=exercises_dict,
            week_start=request.week_start,
            previous_plan=request.previous_plan.model_dump(),
            logs_summary=request.logs_summary.model_dump(),
            seed=seed
        )
        
        # Optionally enhance with Gemini
        if gemini_client.is_available():
            enhanced = gemini_client.enhance_adjusted_plan(
                plan=plan,
                profile=request.profile.model_dump(),
                logs_summary=request.logs_summary.model_dump()
            )
            if enhanced:
                plan['principles'] = enhanced.get('principles', plan['principles'])
                plan['notes'] = enhanced.get('notes', plan['notes'])
        
        return PlanResponse(**plan)
        
    except Exception as e:
        print(f"Error adjusting plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== Chat Models ==============

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    success: bool = True


class AnalysisResponse(BaseModel):
    success: bool
    data: Dict[str, Any]


class SummarizeRequest(BaseModel):
    messages: List[ChatMessage]


class SummarizeResponse(BaseModel):
    summary: str
    success: bool = True


# ============== Chat Endpoints ==============

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return AI response
    """
    try:
        # Convert history to dict format
        history = None
        if request.conversation_history:
            history = [{"role": m.role, "content": m.content} for m in request.conversation_history]
        
        response = await chat_handler.chat(request.message, history)
        
        return ChatResponse(response=response, success=True)
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze_food", response_model=AnalysisResponse)
async def analyze_food(image: UploadFile = File(...)):
    """
    Analyze food image and estimate calories
    """
    try:
        # Read image data
        image_data = await image.read()
        
        # Analyze
        result = await chat_handler.analyze_food(image_data)
        
        return AnalysisResponse(success=result.get("success", False), data=result)
        
    except Exception as e:
        print(f"Food analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze_body", response_model=AnalysisResponse)
async def analyze_body(image: UploadFile = File(...)):
    """
    Analyze body image and provide improvement suggestions
    """
    try:
        # Read image data
        image_data = await image.read()
        
        # Analyze
        result = await chat_handler.analyze_body(image_data)
        
        return AnalysisResponse(success=result.get("success", False), data=result)
        
    except Exception as e:
        print(f"Body analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_conversation(request: SummarizeRequest):
    """
    Summarize a conversation
    """
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        summary = await chat_handler.summarize_conversation(messages)
        
        return SummarizeResponse(summary=summary, success=True)
        
    except Exception as e:
        print(f"Summarize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

