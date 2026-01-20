"""
FitAI - Pydantic Models

Data models for API request/response validation
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ProfileData(BaseModel):
    """User fitness profile"""
    goal: str  # fat_loss, muscle_gain, maintenance
    level: str  # beginner, intermediate, advanced
    days_per_week: int  # 3-6
    session_minutes: int  # 20-90
    equipment: str  # none, home, gym
    constraints: Optional[str] = None
    availability: Optional[Dict[str, Any]] = None


class Exercise(BaseModel):
    """Exercise data from database"""
    name: str
    muscle_group: str
    equipment: str
    difficulty: str
    description: Optional[str] = None


class SessionItem(BaseModel):
    """Single exercise in a workout session"""
    exercise: str
    sets: int
    reps: str
    rest_sec: int
    notes: Optional[str] = None


class PlanDay(BaseModel):
    """Single day in a workout plan"""
    date: str
    title: str
    sessions: List[SessionItem]
    estimated_minutes: int


class PlanResponse(BaseModel):
    """Complete workout plan response"""
    week_start: str
    days: List[PlanDay]
    principles: List[str]
    notes: List[str]


class LogSummary(BaseModel):
    """Summary of a single day's workout log"""
    date: str
    title: str
    status: str  # done, skipped, pending
    fatigue_rating: Optional[int] = None
    notes: Optional[str] = None


class PreviousPlan(BaseModel):
    """Previous week's plan with logs for adjustment"""
    week_start: str
    principles: Optional[List[str]] = None
    days: List[LogSummary]


class LogsStatistics(BaseModel):
    """Aggregate statistics from workout logs"""
    completed_days: int
    total_days: int
    completion_rate: int
    average_fatigue: Optional[float] = None


class GeneratePlanRequest(BaseModel):
    """Request body for plan generation"""
    user_id: int
    week_start: str  # YYYY-MM-DD
    profile: ProfileData
    exercises: List[Exercise]


class AdjustPlanRequest(BaseModel):
    """Request body for plan adjustment"""
    user_id: int
    week_start: str
    profile: ProfileData
    exercises: List[Exercise]
    previous_plan: PreviousPlan
    logs_summary: LogsStatistics
