"""
FitAI - Chat Handler
Handles AI chat, food calorie analysis, and body analysis using Gemini
"""

import os
import json
import base64
from typing import Dict, Any, Optional, List

try:
    import google.generativeai as genai
    from PIL import Image
    import io
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class ChatHandler:
    """
    Handles PT AI chat functionality with Gemini
    
    Features:
    - General fitness Q&A
    - Food image calorie analysis
    - Body image analysis with improvement suggestions
    - Conversation summarization
    """
    
    def __init__(self, gemini_client):
        self.gemini_client = gemini_client
        self.model = gemini_client.model if gemini_client else None
        
        # System prompts
        self.chat_system_prompt = """Bạn là PT AI - Huấn luyện viên cá nhân AI chuyên nghiệp. 
Bạn tư vấn về:
- Kỹ thuật tập luyện đúng cách
- Dinh dưỡng và chế độ ăn
- Lịch tập và phục hồi
- Động lực và mindset

Quy tắc:
- Trả lời ngắn gọn, dễ hiểu bằng tiếng Việt
- Đưa ra lời khuyên thực tế, an toàn
- Khuyến khích người dùng kiên trì
- Nếu câu hỏi về y tế nghiêm trọng, khuyên họ gặp bác sĩ"""

        self.food_analysis_prompt = """Bạn là chuyên gia dinh dưỡng AI. Phân tích ảnh thức ăn và ước tính:

1. Tên các món ăn trong ảnh
2. Ước tính calories tổng
3. Phân tích macro (protein, carbs, fat)
4. Đánh giá: tốt/trung bình/không tốt cho fitness
5. Gợi ý cải thiện nếu có

Trả lời dạng JSON:
{
    "foods": ["món 1", "món 2"],
    "total_calories": 500,
    "protein_g": 30,
    "carbs_g": 50,
    "fat_g": 15,
    "fiber_g": 5,
    "rating": "good/average/poor",
    "rating_reason": "Lý do đánh giá",
    "suggestions": ["Gợi ý 1", "Gợi ý 2"],
    "summary": "Tóm tắt ngắn về bữa ăn"
}"""

        self.body_analysis_prompt = """Bạn là huấn luyện viên thể hình AI. Phân tích ảnh body và đưa ra:

1. Đánh giá tổng quan về hình thể
2. Các nhóm cơ cần tập trung phát triển
3. Các nhóm cơ đã phát triển tốt
4. Gợi ý bài tập cụ thể
5. Mục tiêu ngắn hạn (4-8 tuần)

LƯU Ý: Đây chỉ là đánh giá sơ bộ dựa trên hình ảnh, không thay thế tư vấn chuyên gia.

Trả lời dạng JSON:
{
    "overall_assessment": "Đánh giá tổng quan",
    "body_type": "ectomorph/mesomorph/endomorph",
    "strengths": ["Nhóm cơ tốt 1", "Nhóm cơ tốt 2"],
    "areas_to_improve": ["Nhóm cơ cần cải thiện 1", "Nhóm cơ cần cải thiện 2"],
    "recommended_exercises": [
        {"muscle": "chest", "exercises": ["Bài tập 1", "Bài tập 2"]},
        {"muscle": "back", "exercises": ["Bài tập 1"]}
    ],
    "short_term_goals": ["Mục tiêu 1", "Mục tiêu 2"],
    "tips": ["Mẹo 1", "Mẹo 2"],
    "disclaimer": "Lưu ý về giới hạn của phân tích"
}"""

    def is_available(self) -> bool:
        """Check if chat is available"""
        return self.model is not None
    
    async def chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Process a chat message and return AI response
        
        Args:
            message: User message
            conversation_history: Previous messages for context
        
        Returns:
            AI response string
        """
        if not self.is_available():
            return "Xin lỗi, PT AI đang không khả dụng. Vui lòng thử lại sau."
        
        try:
            # Build conversation context
            messages = []
            
            # Add system prompt
            messages.append({"role": "user", "parts": [self.chat_system_prompt]})
            messages.append({"role": "model", "parts": ["Tôi hiểu. Tôi là PT AI, sẵn sàng tư vấn về tập luyện và dinh dưỡng."]})
            
            # Add conversation history (last 10 messages for context)
            if conversation_history:
                for msg in conversation_history[-10:]:
                    role = "user" if msg["role"] == "user" else "model"
                    messages.append({"role": role, "parts": [msg["content"]]})
            
            # Add current message
            messages.append({"role": "user", "parts": [message]})
            
            # Generate response
            chat = self.model.start_chat(history=messages[:-1])
            response = chat.send_message(message)
            
            return response.text
            
        except Exception as e:
            print(f"Chat error: {e}")
            return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại."
    
    async def analyze_food(self, image_data: bytes) -> Dict[str, Any]:
        """
        Analyze food image and estimate calories
        
        Args:
            image_data: Image bytes
        
        Returns:
            Dict with calorie and nutrition analysis
        """
        if not self.is_available():
            return {"error": "PT AI không khả dụng"}
        
        try:
            # Create image part for Gemini
            image_part = {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(image_data).decode()
            }
            
            # Generate analysis
            response = self.model.generate_content([
                self.food_analysis_prompt,
                image_part
            ])
            
            # Parse JSON response
            text = response.text.strip()
            
            # Handle markdown code blocks
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            result = json.loads(text.strip())
            result["success"] = True
            return result
            
        except json.JSONDecodeError:
            return {
                "success": True,
                "summary": response.text if 'response' in dir() else "Không thể phân tích ảnh",
                "total_calories": 0,
                "error": "Không thể parse kết quả"
            }
        except Exception as e:
            print(f"Food analysis error: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_body(self, image_data: bytes) -> Dict[str, Any]:
        """
        Analyze body image and provide improvement suggestions
        
        Args:
            image_data: Image bytes
        
        Returns:
            Dict with body analysis and recommendations
        """
        if not self.is_available():
            return {"error": "PT AI không khả dụng"}
        
        try:
            # Create image part for Gemini
            image_part = {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(image_data).decode()
            }
            
            # Generate analysis
            response = self.model.generate_content([
                self.body_analysis_prompt,
                image_part
            ])
            
            # Parse JSON response
            text = response.text.strip()
            
            # Handle markdown code blocks
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            result = json.loads(text.strip())
            result["success"] = True
            return result
            
        except json.JSONDecodeError:
            return {
                "success": True,
                "overall_assessment": response.text if 'response' in dir() else "Không thể phân tích ảnh",
                "error": "Không thể parse kết quả"
            }
        except Exception as e:
            print(f"Body analysis error: {e}")
            return {"success": False, "error": str(e)}
    
    async def summarize_conversation(
        self,
        messages: List[Dict[str, str]]
    ) -> str:
        """
        Summarize a conversation when reaching message limit
        
        Args:
            messages: List of conversation messages
        
        Returns:
            Summary string
        """
        if not self.is_available():
            return "Tóm tắt cuộc trò chuyện không khả dụng."
        
        try:
            # Build conversation text
            conversation_text = "\n".join([
                f"{'User' if m['role'] == 'user' else 'PT AI'}: {m['content']}"
                for m in messages[-50:]  # Last 50 messages
            ])
            
            prompt = f"""Tóm tắt cuộc trò chuyện sau thành một đoạn ngắn gọn (tối đa 200 từ).
Highlight các chủ đề chính, lời khuyên quan trọng, và tiến trình của người dùng.

Cuộc trò chuyện:
{conversation_text}

Tóm tắt:"""
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Summarize error: {e}")
            return "Không thể tạo tóm tắt."
