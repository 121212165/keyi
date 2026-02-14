from typing import List, Dict
from datetime import datetime
from app.schemas import ScaleType, AssessmentResult


class AssessmentService:
    def __init__(self):
        self.scales = {
            ScaleType.PHQ_9: {
                "title": "患者健康问卷-9项 (PHQ-9)",
                "description": "评估您最近两周的抑郁症状",
                "questions": [
                    "做事时提不起劲或没有兴趣",
                    "感到心情低落、沮丧或绝望",
                    "入睡困难、睡不安稳或睡眠过多",
                    "感到疲倦或没有活力",
                    "食欲不振或吃得太多",
                    "觉得自己很糟，或觉得自己很失败，让自己或家人失望",
                    "对事物专注有困难，例如阅读报纸或看电视时",
                    "动作、说话速度缓慢到别人已经察觉，或正好相反，烦躁或坐立不安",
                    "有不如死掉或用某种方式伤害自己的念头",
                ],
                "options": ["完全不会", "好几天", "一半以上的天数", "几乎每天"],
                "levels": {
                    (0, 4): "无抑郁",
                    (5, 9): "轻度抑郁",
                    (10, 14): "中度抑郁",
                    (15, 19): "中重度抑郁",
                    (20, 27): "重度抑郁",
                },
            },
            ScaleType.GAD_7: {
                "title": "广泛性焦虑障碍-7项 (GAD-7)",
                "description": "评估您最近两周的焦虑症状",
                "questions": [
                    "感到紧张、焦虑或急切",
                    "不能停止或控制担忧",
                    "对各种各样的事情担忧过多",
                    "很难放松下来",
                    "由于不安而无法静坐",
                    "变得容易烦恼或急躁",
                    "感到好像有什么可怕的事发生",
                ],
                "options": ["完全不会", "好几天", "一半以上的天数", "几乎每天"],
                "levels": {
                    (0, 4): "无焦虑",
                    (5, 9): "轻度焦虑",
                    (10, 14): "中度焦虑",
                    (15, 21): "重度焦虑",
                },
            },
            ScaleType.PSS_10: {
                "title": "感知压力量表-10项 (PSS-10)",
                "description": "评估您最近一个月的压力水平",
                "questions": [
                    "因意外发生的事情而心烦意乱",
                    "感觉无法控制生活中的重要事情",
                    "感觉神经紧张，压力很大",
                    "感到自信心不足以处理个人问题",
                    "感觉事情并非按预期发展",
                    "发现自己无法应付所有必须做的事情",
                    "因为事情超出控制而愤怒",
                    "感觉问题堆积如山，无法克服",
                    "感到生活中有很多事情让你感到压力",
                    "发现自己对一些小事反应过度",
                ],
                "options": ["从不", "几乎从不", "有时", "经常", "很经常"],
                "levels": {
                    (0, 13): "低压力",
                    (14, 26): "中等压力",
                    (27, 40): "高压力",
                },
            },
        }

    def get_scale(self, scale_type: ScaleType) -> Dict:
        return self.scales.get(scale_type)

    def calculate_score(self, scale_type: ScaleType, answers: List[int]) -> int:
        return sum(answers)

    def get_level(self, scale_type: ScaleType, score: int) -> str:
        scale = self.scales.get(scale_type)
        if not scale:
            return "未知"

        for (min_score, max_score), level in scale["levels"].items():
            if min_score <= score <= max_score:
                return level
        return "未知"

    async def submit_assessment(
        self, user_id: str, scale_type: ScaleType, answers: List[int]
    ) -> AssessmentResult:
        score = self.calculate_score(scale_type, answers)
        level = self.get_level(scale_type, score)

        return AssessmentResult(
            scale_type=scale_type,
            score=score,
            level=level,
            completed_at=datetime.now(),
            answers=answers,
        )