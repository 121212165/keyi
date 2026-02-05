"""情感识别引擎模块

该模块提供了基于关键词匹配的情感识别功能，能够分析文本中的情感倾向。
"""
from typing import List, Optional
from app.schemas import EmotionType, EmotionIntensity, EmotionResult


class EmotionRecognitionEngine:
    """情感识别引擎类
    
    通过关键词匹配来识别文本中的情感类型、强度和置信度。
    """
    
    def __init__(self):
        """初始化情感识别引擎，定义各种情感类型对应的关键词列表"""
        # 情感关键词字典：将每种情感类型映射到对应的中文关键词列表
        self.emotion_keywords = {
            EmotionType.JOY: ["开心", "快乐", "高兴", "幸福", "满足", "愉快"],
            EmotionType.ANGER: ["生气", "愤怒", "恼火", "烦躁", "恨", "不满"],
            EmotionType.SADNESS: ["难过", "悲伤", "痛苦", "伤心", "沮丧", "失落"],
            EmotionType.FEAR: ["害怕", "恐惧", "担心", "焦虑", "紧张", "不安"],
            EmotionType.DISGUST: ["恶心", "讨厌", "反感", "厌恶", "排斥"],
            EmotionType.SURPRISE: ["惊讶", "意外", "震惊", "吃惊", "诧异"],
            EmotionType.ANXIETY: ["焦虑", "担心", "紧张", "不安", "忧虑", "压力"],
            EmotionType.DEPRESSION: ["抑郁", "消沉", "绝望", "无望", "空虚", "麻木"],
            EmotionType.LONELINESS: ["孤独", "寂寞", "孤单", "没人陪伴", "独自"],
            EmotionType.GUILT: ["内疚", "自责", "后悔", "愧疚", "对不起"],
        }

    async def analyze(self, text: str) -> EmotionResult:
        """分析文本中的情感
        
        Args:
            text: 待分析的文本内容
            
        Returns:
            EmotionResult: 包含主要情感、次要情感、强度和置信度的结果对象
        """
        # 统计每种情感的关键词出现次数
        emotion_scores = {}
        for emotion, keywords in self.emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                emotion_scores[emotion] = score

        # 如果没有检测到任何情感关键词，返回默认结果
        if not emotion_scores:
            return EmotionResult(
                primary_emotion=EmotionType.FEAR,
                secondary_emotions=[],
                intensity=EmotionIntensity.LOW,
                confidence=0.5,
            )

        # 确定主要情感（得分最高的情感）
        primary_emotion = max(emotion_scores, key=emotion_scores.get)
        # 确定次要情感（除主要情感外的其他检测到的情感）
        secondary_emotions = [
            e for e in emotion_scores.keys() if e != primary_emotion
        ]

        # 根据最高得分确定情感强度
        max_score = max(emotion_scores.values())
        if max_score >= 3:
            intensity = EmotionIntensity.HIGH
        elif max_score >= 2:
            intensity = EmotionIntensity.MEDIUM
        else:
            intensity = EmotionIntensity.LOW

        # 计算置信度：基于关键词出现次数，最高不超过0.9
        confidence = min(0.9, 0.5 + max_score * 0.1)

        return EmotionResult(
            primary_emotion=primary_emotion,
            secondary_emotions=secondary_emotions,
            intensity=intensity,
            confidence=confidence,
        )