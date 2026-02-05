# 导入Pydantic基础模型和字段
from pydantic import BaseModel, Field
# 导入类型提示
from typing import List, Optional
# 导入日期时间
from datetime import datetime
# 导入枚举
from enum import Enum


class EmotionType(str, Enum):
    """情绪类型枚举"""
    JOY = "joy"  # 快乐
    ANGER = "anger"  # 愤怒
    SADNESS = "sadness"  # 悲伤
    FEAR = "fear"  # 恐惧
    DISGUST = "disgust"  # 厌恶
    SURPRISE = "surprise"  # 惊讶
    ANXIETY = "anxiety"  # 焦虑
    DEPRESSION = "depression"  # 抑郁
    LONELINESS = "loneliness"  # 孤独
    GUILT = "guilt"  # 内疚


class EmotionIntensity(str, Enum):
    """情绪强度枚举"""
    LOW = "low"  # 低强度
    MEDIUM = "medium"  # 中等强度
    HIGH = "high"  # 高强度


class AlertLevel(str, Enum):
    """预警级别枚举"""
    LEVEL_1 = "level_1"  # 一级预警
    LEVEL_2 = "level_2"  # 二级预警
    LEVEL_3 = "level_3"  # 三级预警


class EmotionResult(BaseModel):
    """情绪分析结果模型"""
    primary_emotion: EmotionType  # 主要情绪
    secondary_emotions: List[EmotionType]  # 次要情绪列表
    intensity: EmotionIntensity  # 情绪强度
    confidence: float = Field(ge=0.0, le=1.0)  # 置信度，范围0.0-1.0


class Message(BaseModel):
    """聊天消息模型"""
    id: str  # 消息ID
    role: str  # 角色（用户/助手）
    content: str  # 消息内容
    timestamp: datetime  # 时间戳
    emotion: Optional[EmotionResult] = None  # 情绪分析结果（可选）


class ChatSession(BaseModel):
    """聊天会话模型"""
    id: str  # 会话ID
    user_id: str  # 用户ID
    started_at: datetime  # 开始时间
    ended_at: Optional[datetime] = None  # 结束时间（可选）
    messages: List[Message] = []  # 消息列表
    emotion_summary: Optional[dict] = None  # 情绪摘要（可选）
    risk_flag: bool = False  # 风险标志


class ScaleType(str, Enum):
    """评估量表类型枚举"""
    PHQ_9 = "phq_9"  # 抑郁症筛查量表
    GAD_7 = "gad_7"  # 焦虑症筛查量表
    PSS_10 = "pss_10"  # 感知压力量表


class AssessmentResult(BaseModel):
    """评估结果模型"""
    scale_type: ScaleType  # 量表类型
    score: int  # 得分
    level: str  # 等级
    completed_at: datetime  # 完成时间
    answers: List[int]  # 答案列表


class SuggestionType(str, Enum):
    """建议类型枚举"""
    EMOTION_REGULATION = "emotion_regulation"  # 情绪调节
    COGNITIVE_ADJUSTMENT = "cognitive_adjustment"  # 认知调整
    BEHAVIORAL_ACTIVATION = "behavioral_activation"  # 行为激活
    STRESS_MANAGEMENT = "stress_management"  # 压力管理


class Suggestion(BaseModel):
    """建议模型"""
    type: SuggestionType  # 建议类型
    title: str  # 标题
    description: str  # 描述
    steps: List[str]  # 步骤列表


class Alert(BaseModel):
    """预警模型"""
    id: str  # 预警ID
    user_id: str  # 用户ID
    level: AlertLevel  # 预警级别
    trigger_reason: str  # 触发原因
    triggered_at: datetime  # 触发时间
    resolved_at: Optional[datetime] = None  # 解决时间（可选）
    resources_provided: List[dict] = []  # 提供的资源列表