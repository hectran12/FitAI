"""
FitAI - Gemini AI Client (Mode B)

Optional integration with Google Gemini API for enhanced
human-friendly notes and principles in workout plans.

Falls back silently to Mode A if GEMINI_API_KEY is not available.
"""

import os
import json
from typing import Dict, Any, Optional

# Try to import google-generativeai, gracefully handle if not installed
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class GeminiClient:
    """
    Optional Gemini AI integration for plan enhancement
    
    Mode B: When GEMINI_API_KEY is present, uses Gemini to generate
    more human-friendly and personalized notes/principles.
    
    Falls back silently if:
    - GEMINI_API_KEY is not set
    - google-generativeai package is not installed
    - API call fails for any reason
    """
    
    def __init__(self):
        """
        Initialize Gemini client from gemini.json config file
        
        Config file location: ai/gemini.json
        {
            "api_key": "YOUR_API_KEY_HERE",
            "model": "gemini-1.5-flash",
            "enabled": true,
            "generation_config": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 1024
            }
        }
        """
        self.model = None
        self.config = self._load_config()
        
        # Check if enabled
        if not self.config.get('enabled', True):
            print("ℹ Gemini disabled in config")
            return
        
        # Get API key from config or environment
        self.api_key = self.config.get('api_key') or os.environ.get('GEMINI_API_KEY')
        self.model_name = self.config.get('model', 'gemini-1.5-flash')
        self.generation_config = self.config.get('generation_config', {})
        
        if not self.api_key:
            print("ℹ Gemini API key not set - using rule-based generator (Mode A)")
            print("  → Set api_key in ai/gemini.json or GEMINI_API_KEY env variable")
            return
            
        if not GENAI_AVAILABLE:
            print("ℹ google-generativeai not installed")
            print("  → Run: pip install google-generativeai")
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                self.model_name,
                generation_config=self.generation_config if self.generation_config else None
            )
            print(f"✓ Gemini AI initialized: {self.model_name}")
        except Exception as e:
            print(f"✗ Failed to initialize Gemini: {e}")
            self.model = None
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from gemini.json"""
        config_path = os.path.join(os.path.dirname(__file__), 'gemini.json')
        
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    print(f"✓ Loaded config from gemini.json")
                    return config
        except Exception as e:
            print(f"⚠ Error loading gemini.json: {e}")
        
        return {}
    
    def is_available(self) -> bool:
        """Check if Gemini API is available"""
        return self.model is not None
    
    def enhance_plan(
        self,
        plan: Dict[str, Any],
        profile: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Enhance plan with Gemini-generated notes and principles
        
        Returns None if enhancement fails, allowing fallback to Mode A
        """
        if not self.is_available():
            return None
        
        try:
            prompt = self._build_enhance_prompt(plan, profile)
            response = self.model.generate_content(prompt)
            
            # Parse response
            result = self._parse_enhancement_response(response.text)
            return result
            
        except Exception as e:
            print(f"Gemini enhancement failed: {e}")
            return None
    
    def enhance_adjusted_plan(
        self,
        plan: Dict[str, Any],
        profile: Dict[str, Any],
        logs_summary: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Enhance adjusted plan with context-aware notes
        """
        if not self.is_available():
            return None
        
        try:
            prompt = self._build_adjustment_prompt(plan, profile, logs_summary)
            response = self.model.generate_content(prompt)
            
            result = self._parse_enhancement_response(response.text)
            return result
            
        except Exception as e:
            print(f"Gemini adjustment enhancement failed: {e}")
            return None
    
    def _build_enhance_prompt(
        self,
        plan: Dict[str, Any],
        profile: Dict[str, Any]
    ) -> str:
        """Build prompt for plan enhancement"""
        
        goal_desc = {
            'fat_loss': 'giảm mỡ và duy trì cơ bắp',
            'muscle_gain': 'tăng cơ và sức mạnh',
            'maintenance': 'duy trì thể lực hiện tại'
        }.get(profile.get('goal', 'maintenance'), 'thể dục chung')
        
        level_desc = {
            'beginner': 'người mới bắt đầu',
            'intermediate': 'trung cấp',
            'advanced': 'nâng cao'
        }.get(profile.get('level', 'intermediate'), 'trung cấp')
        
        days = len(plan.get('days', []))
        
        prompt = f"""Bạn là huấn luyện viên thể hình chuyên nghiệp đang tạo nội dung động viên và giáo dục cho kế hoạch tập luyện.

Hồ sơ khách hàng:
- Mục tiêu: {goal_desc}
- Trình độ: {level_desc}
- Số ngày tập: {days} ngày/tuần
- Thiết bị: {profile.get('equipment', 'cơ bản')}

Kế hoạch tập luyện có {days} ngày tập với các phân chia sau:
{', '.join([d.get('title', 'Buổi tập') for d in plan.get('days', [])])}

Hãy tạo:
1. 3-5 nguyên tắc tập luyện (lời khuyên cụ thể, thực tế)
2. 3-4 ghi chú thực hành (mẹo để thành công)

Định dạng phản hồi dạng JSON:
{{
    "principles": ["nguyên tắc 1", "nguyên tắc 2", ...],
    "notes": ["ghi chú 1", "ghi chú 2", ...]
}}

Giữ mỗi mục ngắn gọn (1-2 câu). Hãy động viên và chuyên nghiệp.
Viết hoàn toàn bằng tiếng Việt.
Chỉ xuất JSON, không có văn bản khác."""

        return prompt
    
    def _build_adjustment_prompt(
        self,
        plan: Dict[str, Any],
        profile: Dict[str, Any],
        logs_summary: Dict[str, Any]
    ) -> str:
        """Build prompt for adjusted plan enhancement"""
        
        completion_rate = logs_summary.get('completion_rate', 0)
        avg_fatigue = logs_summary.get('average_fatigue')
        
        goal_desc = {
            'fat_loss': 'giảm mỡ',
            'muscle_gain': 'tăng cơ',
            'maintenance': 'duy trì thể lực'
        }.get(profile.get('goal', 'maintenance'), 'thể dục')
        
        level_desc = {
            'beginner': 'người mới',
            'intermediate': 'trung cấp',
            'advanced': 'nâng cao'
        }.get(profile.get('level', 'intermediate'), 'trung cấp')
        
        prompt = f"""Bạn là huấn luyện viên thể hình chuyên nghiệp đang phản hồi về kế hoạch tập đã điều chỉnh.

Kết quả tuần trước:
- Tỷ lệ hoàn thành: {completion_rate}%
- Mức độ mệt mỏi trung bình: {avg_fatigue}/5
- Mục tiêu: {goal_desc}
- Trình độ: {level_desc}

Dựa trên dữ liệu này, chúng tôi đã điều chỉnh kế hoạch tuần tới.

Hãy tạo:
1. 2-3 nguyên tắc động viên/điều chỉnh dựa trên hiệu suất
2. 2-3 ghi chú thực hành cho tuần mới

Định dạng JSON:
{{
    "principles": ["nguyên tắc 1", "nguyên tắc 2", ...],
    "notes": ["ghi chú 1", "ghi chú 2", ...]
}}

Hãy động viên bất kể tỷ lệ hoàn thành. Tập trung vào tiến bộ bền vững.
Viết hoàn toàn bằng tiếng Việt.
Chỉ xuất JSON, không có văn bản khác."""

        return prompt
    
    def _parse_enhancement_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        """Parse Gemini response to extract principles and notes"""
        
        try:
            # Try to extract JSON from response
            text = response_text.strip()
            
            # Handle potential markdown code blocks
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            text = text.strip()
            
            # Parse JSON
            data = json.loads(text)
            
            # Validate structure
            if 'principles' not in data or 'notes' not in data:
                return None
            
            return {
                'principles': data['principles'][:5],  # Limit to 5
                'notes': data['notes'][:5]  # Limit to 5
            }
            
        except json.JSONDecodeError:
            print(f"Failed to parse Gemini response as JSON")
            return None
        except Exception as e:
            print(f"Error parsing enhancement response: {e}")
            return None
