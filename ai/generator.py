"""
FitAI - Rule-Based Workout Plan Generator (Mode A)

Generates workout plans based on:
- User profile (goal, level, days_per_week, equipment)
- Available exercises
- Deterministic seed for reproducibility
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional


class WorkoutPlanGenerator:
    """
    Rule-based workout plan generator
    
    Split strategies based on days_per_week:
    - 3 days: Full Body A, Full Body B, Full Body C
    - 4 days: Upper A, Lower A, Upper B, Lower B
    - 5 days: Push, Pull, Legs, Upper, Lower
    - 6 days: Push, Pull, Legs, Push, Pull, Legs
    """
    
    # Muscle group to split type mapping
    PUSH_MUSCLES = ['chest', 'shoulders', 'triceps']
    PULL_MUSCLES = ['back', 'biceps']
    LEG_MUSCLES = ['legs']
    CORE_MUSCLES = ['core']
    
    UPPER_MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps']
    LOWER_MUSCLES = ['legs', 'core']
    
    # Sets/reps templates by goal
    GOAL_TEMPLATES = {
        'fat_loss': {
            'sets_range': (3, 4),
            'reps_options': ['12-15', '15-20', '12-15'],
            'rest_sec': 45,
            'exercises_per_group': 2
        },
        'muscle_gain': {
            'sets_range': (3, 4),
            'reps_options': ['8-10', '10-12', '6-8'],
            'rest_sec': 90,
            'exercises_per_group': 3
        },
        'maintenance': {
            'sets_range': (2, 3),
            'reps_options': ['10-12', '12-15'],
            'rest_sec': 60,
            'exercises_per_group': 2
        }
    }
    
    # Level adjustments
    LEVEL_MODIFIERS = {
        'beginner': {'sets_mod': -1, 'exercises_mod': -1},
        'intermediate': {'sets_mod': 0, 'exercises_mod': 0},
        'advanced': {'sets_mod': 1, 'exercises_mod': 1}
    }
    
    def __init__(self):
        pass
    
    def generate_plan(
        self,
        profile: Dict[str, Any],
        exercises: List[Dict[str, Any]],
        week_start: str,
        seed: int
    ) -> Dict[str, Any]:
        """Generate a 7-day workout plan"""
        
        random.seed(seed)
        
        days_per_week = profile.get('days_per_week', 3)
        goal = profile.get('goal', 'maintenance')
        level = profile.get('level', 'beginner')
        equipment = profile.get('equipment', 'none')
        session_minutes = profile.get('session_minutes', 45)
        availability = profile.get('availability', {})
        
        # Filter exercises by equipment level
        available_exercises = self._filter_exercises(exercises, equipment, level)
        
        # Get split strategy
        split = self._get_split_strategy(days_per_week)
        
        # Get available days based on user availability
        workout_days = self._get_workout_days(week_start, days_per_week, availability)
        
        # Generate each workout day
        plan_days = []
        for i, (date, split_type) in enumerate(zip(workout_days, split)):
            day_plan = self._generate_day(
                date=date,
                split_type=split_type,
                exercises=available_exercises,
                goal=goal,
                level=level,
                session_minutes=session_minutes,
                day_index=i
            )
            plan_days.append(day_plan)
        
        # Generate principles and notes
        principles = self._generate_principles(goal, level, days_per_week)
        notes = self._generate_notes(goal, equipment)
        
        return {
            'week_start': week_start,
            'days': plan_days,
            'principles': principles,
            'notes': notes
        }
    
    def generate_adjusted_plan(
        self,
        profile: Dict[str, Any],
        exercises: List[Dict[str, Any]],
        week_start: str,
        previous_plan: Dict[str, Any],
        logs_summary: Dict[str, Any],
        seed: int
    ) -> Dict[str, Any]:
        """Generate adjusted plan based on previous week's performance"""
        
        random.seed(seed)
        
        # Analyze logs to make adjustments
        completion_rate = logs_summary.get('completion_rate', 100)
        avg_fatigue = logs_summary.get('average_fatigue')
        
        # Adjust profile based on performance
        adjusted_profile = profile.copy()
        
        # If completion rate is low, reduce intensity
        if completion_rate < 50:
            if adjusted_profile.get('days_per_week', 3) > 3:
                adjusted_profile['days_per_week'] = adjusted_profile['days_per_week'] - 1
        
        # If fatigue is high (4-5), reduce session time
        if avg_fatigue and avg_fatigue >= 4:
            current_minutes = adjusted_profile.get('session_minutes', 45)
            adjusted_profile['session_minutes'] = max(20, current_minutes - 10)
        
        # If fatigue is low (1-2) and completion is high, increase intensity
        if avg_fatigue and avg_fatigue <= 2 and completion_rate >= 80:
            current_minutes = adjusted_profile.get('session_minutes', 45)
            adjusted_profile['session_minutes'] = min(90, current_minutes + 10)
        
        # Generate base plan with adjusted profile
        plan = self.generate_plan(
            profile=adjusted_profile,
            exercises=exercises,
            week_start=week_start,
            seed=seed
        )
        
        # Add adjustment-specific notes
        adjustment_notes = self._generate_adjustment_notes(
            completion_rate, avg_fatigue, profile, adjusted_profile
        )
        plan['notes'] = adjustment_notes + plan['notes']
        
        return plan
    
    def _filter_exercises(
        self,
        exercises: List[Dict[str, Any]],
        equipment: str,
        level: str
    ) -> List[Dict[str, Any]]:
        """Filter exercises based on equipment and difficulty level"""
        
        equipment_levels = {
            'none': ['none'],
            'home': ['none', 'home'],
            'gym': ['none', 'home', 'gym']
        }
        
        difficulty_levels = {
            'beginner': ['beginner'],
            'intermediate': ['beginner', 'intermediate'],
            'advanced': ['beginner', 'intermediate', 'advanced']
        }
        
        allowed_equipment = equipment_levels.get(equipment, ['none'])
        allowed_difficulty = difficulty_levels.get(level, ['beginner'])
        
        filtered = [
            ex for ex in exercises
            if ex.get('equipment') in allowed_equipment
            and ex.get('difficulty') in allowed_difficulty
        ]
        
        return filtered
    
    def _get_split_strategy(self, days_per_week: int) -> List[str]:
        """Get workout split based on days per week"""
        
        splits = {
            3: ['Full Body A', 'Full Body B', 'Full Body C'],
            4: ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
            5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
            6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
        }
        
        return splits.get(days_per_week, splits[3])
    
    def _get_workout_days(
        self,
        week_start: str,
        days_per_week: int,
        availability: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Get dates for workout days based on availability"""
        
        start_date = datetime.strptime(week_start, '%Y-%m-%d')
        
        # Default patterns (spread throughout week)
        default_patterns = {
            3: [0, 2, 4],  # Mon, Wed, Fri
            4: [0, 1, 3, 4],  # Mon, Tue, Thu, Fri
            5: [0, 1, 2, 4, 5],  # Mon-Wed, Fri, Sat
            6: [0, 1, 2, 3, 4, 5]  # Mon-Sat
        }
        
        day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        
        # Try to use availability if provided
        if availability:
            available_days = []
            for i, day_name in enumerate(day_names):
                day_info = availability.get(day_name, {})
                if isinstance(day_info, dict) and day_info.get('available', False):
                    available_days.append(i)
            
            if len(available_days) >= days_per_week:
                # Use available days
                selected_days = available_days[:days_per_week]
            else:
                # Fall back to default pattern
                selected_days = default_patterns.get(days_per_week, [0, 2, 4])
        else:
            selected_days = default_patterns.get(days_per_week, [0, 2, 4])
        
        # Convert to dates
        workout_dates = []
        for day_offset in selected_days:
            date = start_date + timedelta(days=day_offset)
            workout_dates.append(date.strftime('%Y-%m-%d'))
        
        return workout_dates
    
    def _generate_day(
        self,
        date: str,
        split_type: str,
        exercises: List[Dict[str, Any]],
        goal: str,
        level: str,
        session_minutes: int,
        day_index: int
    ) -> Dict[str, Any]:
        """Generate a single workout day"""
        
        # Get muscle groups for this split
        target_muscles = self._get_muscles_for_split(split_type)
        
        # Get goal template
        template = self.GOAL_TEMPLATES.get(goal, self.GOAL_TEMPLATES['maintenance'])
        level_mod = self.LEVEL_MODIFIERS.get(level, self.LEVEL_MODIFIERS['intermediate'])
        
        # Filter exercises for target muscles
        target_exercises = [
            ex for ex in exercises
            if ex.get('muscle_group') in target_muscles
        ]
        
        # Calculate exercises per muscle group based on time
        approx_exercises = max(4, min(8, session_minutes // 8))
        exercises_per_group = template['exercises_per_group'] + level_mod['exercises_mod']
        
        # Select exercises
        sessions = []
        used_exercises = set()
        
        for muscle in target_muscles:
            muscle_exercises = [
                ex for ex in target_exercises
                if ex.get('muscle_group') == muscle and ex['name'] not in used_exercises
            ]
            
            # Shuffle and select
            random.shuffle(muscle_exercises)
            selected = muscle_exercises[:exercises_per_group]
            
            for ex in selected:
                used_exercises.add(ex['name'])
                
                sets = random.randint(*template['sets_range']) + level_mod['sets_mod']
                sets = max(2, min(5, sets))
                reps = random.choice(template['reps_options'])
                
                sessions.append({
                    'exercise': ex['name'],
                    'sets': sets,
                    'reps': reps,
                    'rest_sec': template['rest_sec'],
                    'notes': ex.get('description', '')
                })
        
        # Limit sessions based on time
        max_sessions = session_minutes // 6
        sessions = sessions[:max_sessions]
        
        # Estimate actual minutes
        estimated_minutes = len(sessions) * 6
        
        return {
            'date': date,
            'title': split_type,
            'sessions': sessions,
            'estimated_minutes': estimated_minutes
        }
    
    def _get_muscles_for_split(self, split_type: str) -> List[str]:
        """Get target muscle groups for a split type"""
        
        split_mapping = {
            'Full Body A': ['chest', 'back', 'legs', 'core'],
            'Full Body B': ['shoulders', 'back', 'legs', 'biceps', 'triceps'],
            'Full Body C': ['chest', 'shoulders', 'legs', 'core'],
            'Upper A': ['chest', 'back', 'shoulders'],
            'Upper B': ['back', 'biceps', 'triceps', 'shoulders'],
            'Lower A': ['legs', 'core'],
            'Lower B': ['legs', 'core'],
            'Upper': ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
            'Lower': ['legs', 'core'],
            'Push': ['chest', 'shoulders', 'triceps'],
            'Pull': ['back', 'biceps'],
            'Legs': ['legs', 'core']
        }
        
        return split_mapping.get(split_type, ['chest', 'back', 'legs'])
    
    def _generate_principles(
        self,
        goal: str,
        level: str,
        days_per_week: int
    ) -> List[str]:
        """Generate training principles based on profile"""
        
        principles = []
        
        # Goal-specific principles
        if goal == 'fat_loss':
            principles.extend([
                "Tập trung vào số lần lặp cao (12-15) để tối đa hóa đốt calo",
                "Giữ thời gian nghỉ ngắn (45-60 giây) để duy trì nhịp tim cao",
                "Cân nhắc thêm 10-15 phút cardio sau khi tập tạ"
            ])
        elif goal == 'muscle_gain':
            principles.extend([
                "Tăng tải dần: cố gắng tăng tạ hoặc số lần lặp mỗi tuần",
                "Tập trung vào động tác có kiểm soát với form chuẩn",
                "Nghỉ 90-120 giây giữa các hiệp để phục hồi tối ưu"
            ])
        else:  # maintenance
            principles.extend([
                "Duy trì khối lượng tập luyện ổn định từ tuần này sang tuần khác",
                "Tập trung vào các bài tập compound để hiệu quả hơn",
                "Cân bằng cường độ với thời gian phục hồi"
            ])
        
        # Level-specific
        if level == 'beginner':
            principles.append("Tập trung học form đúng trước khi tăng tạ")
        elif level == 'advanced':
            principles.append("Cân nhắc áp dụng kỹ thuật nâng cao như drop sets hoặc supersets")
        
        # Days per week
        if days_per_week >= 5:
            principles.append("Với tần suất tập cao, ưu tiên giấc ngủ và dinh dưỡng để phục hồi")
        
        return principles
    
    def _generate_notes(self, goal: str, equipment: str) -> List[str]:
        """Generate general notes for the plan"""
        
        notes = [
            "Khởi động 5-10 phút trước mỗi buổi tập",
            "Uống đủ nước trong suốt buổi tập",
            "Lắng nghe cơ thể và nghỉ ngơi nếu cảm thấy quá mệt"
        ]
        
        if equipment == 'none':
            notes.append("Tập trung vào thời gian căng cơ để tối đa hóa hiệu quả bài tập tự trọng")
        elif equipment == 'home':
            notes.append("Sử dụng tăng tải dần với tạ và dây kháng lực có sẵn")
        else:
            notes.append("Tận dụng đa dạng thiết bị phòng gym để cô lập các nhóm cơ")
        
        if goal == 'fat_loss':
            notes.append("Duy trì thâm hụt calo nhẹ để đạt kết quả giảm mỡ tối ưu")
        elif goal == 'muscle_gain':
            notes.append("Đảm bảo nạp đủ protein (1.6-2.2g mỗi kg trọng lượng cơ thể)")
        
        return notes
    
    def _generate_adjustment_notes(
        self,
        completion_rate: int,
        avg_fatigue: Optional[float],
        original_profile: Dict[str, Any],
        adjusted_profile: Dict[str, Any]
    ) -> List[str]:
        """Generate notes explaining plan adjustments"""
        
        notes = []
        
        if completion_rate < 50:
            notes.append(f"Dựa trên tỷ lệ hoàn thành {completion_rate}% tuần trước, chúng tôi đã giảm số ngày tập để dễ tuân thủ hơn")
        elif completion_rate >= 80:
            notes.append(f"Tuyệt vời! Bạn đã hoàn thành {completion_rate}% bài tập tuần trước!")
        
        if avg_fatigue:
            if avg_fatigue >= 4:
                notes.append(f"Mức độ mệt mỏi trung bình của bạn cao ({avg_fatigue}/5). Các buổi tập tuần này sẽ ngắn hơn để phục hồi tốt hơn")
            elif avg_fatigue <= 2:
                notes.append(f"Mức độ mệt mỏi của bạn thấp ({avg_fatigue}/5). Cân nhắc tăng cường độ tuần này")
        
        # Note any profile changes
        if adjusted_profile.get('session_minutes') != original_profile.get('session_minutes'):
            notes.append(f"Thời lượng buổi tập được điều chỉnh thành {adjusted_profile['session_minutes']} phút")
        
        if adjusted_profile.get('days_per_week') != original_profile.get('days_per_week'):
            notes.append(f"Số ngày tập được điều chỉnh thành {adjusted_profile['days_per_week']} ngày/tuần")
        
        return notes

