from typing import List
from app.schemas import EmotionType, EmotionIntensity, SuggestionType, Suggestion


class SuggestionService:
    def __init__(self):
        self.suggestion_library = {
            SuggestionType.EMOTION_REGULATION: [
                Suggestion(
                    type=SuggestionType.EMOTION_REGULATION,
                    title="深呼吸练习",
                    description="通过深呼吸来放松身心，缓解紧张情绪",
                    steps=[
                        "找一个安静的地方坐下或躺下",
                        "闭上眼睛，将注意力集中在呼吸上",
                        "用鼻子缓慢吸气4秒",
                        "屏住呼吸7秒",
                        "用嘴巴缓慢呼气8秒",
                        "重复这个过程10-15次",
                    ],
                ),
                Suggestion(
                    type=SuggestionType.EMOTION_REGULATION,
                    title="正念冥想",
                    description="通过正念练习来觉察和接纳当前的情绪",
                    steps=[
                        "找一个安静舒适的地方坐下",
                        "闭上眼睛，感受身体的重量",
                        "将注意力集中在呼吸上",
                        "观察思绪的来去，不评判它们",
                        "当注意力分散时，温柔地将其带回呼吸",
                        "练习10-20分钟",
                    ],
                ),
            ],
            SuggestionType.COGNITIVE_ADJUSTMENT: [
                Suggestion(
                    type=SuggestionType.COGNITIVE_ADJUSTMENT,
                    title="认知重构",
                    description="识别和改变消极的思维模式",
                    steps=[
                        "记录让你感到困扰的想法",
                        "问自己：这个想法有证据支持吗？",
                        "寻找替代的、更积极的解释",
                        "评估这个想法对你情绪的影响",
                        "尝试用更平衡的观点来看待问题",
                    ],
                ),
                Suggestion(
                    type=SuggestionType.COGNITIVE_ADJUSTMENT,
                    title="积极自我对话",
                    description="用鼓励性的语言与自己对话",
                    steps=[
                        "注意你内心的自我对话",
                        "识别消极的自我批评",
                        "用更温和、鼓励性的语言替代它们",
                        "提醒自己过去的成功经历",
                        "对自己说一些鼓励的话",
                    ],
                ),
            ],
            SuggestionType.BEHAVIORAL_ACTIVATION: [
                Suggestion(
                    type=SuggestionType.BEHAVIORAL_ACTIVATION,
                    title="适度运动",
                    description="通过身体活动来改善情绪",
                    steps=[
                        "选择你喜欢的运动方式（散步、跑步、瑜伽等）",
                        "从短时间开始，比如10-15分钟",
                        "逐渐增加运动时间到30分钟",
                        "每周至少运动3-4次",
                        "运动后注意身体和情绪的变化",
                    ],
                ),
                Suggestion(
                    type=SuggestionType.BEHAVIORAL_ACTIVATION,
                    title="社交活动",
                    description="与他人建立联系，减少孤独感",
                    steps=[
                        "列出你想要联系的朋友或家人",
                        "主动发起联系，打个电话或发个信息",
                        "计划一次见面或线上交流",
                        "参加一些你感兴趣的社交活动",
                        "保持定期的社交联系",
                    ],
                ),
            ],
            SuggestionType.STRESS_MANAGEMENT: [
                Suggestion(
                    type=SuggestionType.STRESS_MANAGEMENT,
                    title="时间管理",
                    description="合理安排时间，减少压力",
                    steps=[
                        "列出所有需要完成的任务",
                        "按重要性和紧急性对任务排序",
                        "为每个任务设定明确的截止日期",
                        "将大任务分解成小步骤",
                        "定期回顾和调整计划",
                    ],
                ),
                Suggestion(
                    type=SuggestionType.STRESS_MANAGEMENT,
                    title="优先级排序",
                    description="学会区分重要和紧急的事情",
                    steps=[
                        "识别对你最重要的事情",
                        "学会说\"不\"，拒绝不重要的事情",
                        "专注于高价值任务",
                        "将时间分配给真正重要的事情",
                        "定期评估和调整优先级",
                    ],
                ),
            ],
        }

    async def generate_suggestions(
        self,
        emotion: EmotionType,
        intensity: EmotionIntensity,
    ) -> List[Suggestion]:
        suggestions = []

        if emotion in [EmotionType.ANXIETY, EmotionType.FEAR]:
            suggestions.extend(self.suggestion_library[SuggestionType.EMOTION_REGULATION])
            suggestions.extend(self.suggestion_library[SuggestionType.COGNITIVE_ADJUSTMENT])

        elif emotion in [EmotionType.DEPRESSION, EmotionType.SADNESS]:
            suggestions.extend(self.suggestion_library[SuggestionType.BEHAVIORAL_ACTIVATION])
            suggestions.extend(self.suggestion_library[SuggestionType.COGNITIVE_ADJUSTMENT])

        elif emotion == EmotionType.ANGER:
            suggestions.extend(self.suggestion_library[SuggestionType.EMOTION_REGULATION])
            suggestions.extend(self.suggestion_library[SuggestionType.COGNITIVE_ADJUSTMENT])

        elif emotion in [EmotionType.LONELINESS]:
            suggestions.extend(self.suggestion_library[SuggestionType.BEHAVIORAL_ACTIVATION])

        else:
            suggestions.extend(self.suggestion_library[SuggestionType.EMOTION_REGULATION])

        if intensity == EmotionIntensity.HIGH:
            suggestions.extend(self.suggestion_library[SuggestionType.STRESS_MANAGEMENT])

        if intensity == EmotionIntensity.HIGH:
            stress_suggestions = [s for s in suggestions if s.type == SuggestionType.STRESS_MANAGEMENT]
            other_suggestions = [s for s in suggestions if s.type != SuggestionType.STRESS_MANAGEMENT]
            return stress_suggestions[:1] + other_suggestions[:2]

        return suggestions[:3]