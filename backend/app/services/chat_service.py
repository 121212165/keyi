from typing import List, Optional, Dict
from datetime import datetime
from app.schemas import Message, ChatSession, EmotionResult
from app.services.emotion_service import EmotionRecognitionEngine
from app.services.alert_service import AlertService


class ChatService:
    def __init__(self):
        self.emotion_engine = EmotionRecognitionEngine()
        self.alert_service = AlertService()
        self.sessions: Dict[str, ChatSession] = {}
        self.message_counter = 0

    async def create_session(self, user_id: str) -> str:
        session_id = f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_id}"
        
        welcome_message = Message(
            id=str(self._get_next_message_id()),
            role="assistant",
            content="你好，我是AI心理医生，很高兴能陪伴你。今天想聊聊什么呢？",
            timestamp=datetime.now(),
            emotion=None,
        )

        session = ChatSession(
            id=session_id,
            user_id=user_id,
            started_at=datetime.now(),
            ended_at=None,
            messages=[welcome_message],
            emotion_summary={},
            risk_flag=False,
        )

        self.sessions[session_id] = session
        return session_id

    async def send_message(
        self, session_id: str, user_id: str, message: str
    ) -> Dict:
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError("Session not found")

        emotion_result = await self.emotion_engine.analyze(message)

        user_message = Message(
            id=str(self._get_next_message_id()),
            role="user",
            content=message,
            timestamp=datetime.now(),
            emotion=emotion_result,
        )

        session.messages.append(user_message)

        alert_level = await self.alert_service.check_risk(user_id, message)
        if alert_level.value == "level_1":
            session.risk_flag = True
            response = await self._generate_crisis_response(alert_level)
        else:
            response = await self._generate_response(message, emotion_result, session.messages)

        assistant_message = Message(
            id=str(self._get_next_message_id()),
            role="assistant",
            content=response,
            timestamp=datetime.now(),
            emotion=None,
        )

        session.messages.append(assistant_message)

        return {
            "response": response,
            "emotion": emotion_result.model_dump(),
            "alert_level": alert_level.value if alert_level.value != "level_3" else None,
            "message_id": assistant_message.id,
        }

    async def get_history(self, session_id: str) -> List[Dict]:
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError("Session not found")

        return [msg.model_dump() for msg in session.messages]

    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        return self.sessions.get(session_id)

    async def analyze_emotion(self, text: str) -> EmotionResult:
        return await self.emotion_engine.analyze(text)

    def _get_next_message_id(self) -> int:
        self.message_counter += 1
        return self.message_counter

    async def _generate_response(
        self, user_message: str, emotion: EmotionResult, history: List[Message]
    ) -> str:
        primary_emotion = emotion.primary_emotion.value
        intensity = emotion.intensity.value

        response_templates = {
            "joy": [
                "很高兴听到你这样说！能多告诉我一些让你开心的事情吗？",
                "这真是太棒了！保持这种积极的心情，你最近还有什么其他开心的事情吗？",
            ],
            "sadness": [
                "我理解你现在的感受，这种感觉一定很难受。能具体说说是什么让你感到难过吗？",
                "听到你这样说，我很关心你。这种情绪持续多久了？",
            ],
            "anger": [
                "我能感觉到你现在很生气，这种感觉是可以理解的。是什么事情让你感到愤怒呢？",
                "生气是正常的情绪反应。能和我分享一下发生了什么吗？",
            ],
            "fear": [
                "我能理解你的担心，这种焦虑感确实让人不舒服。具体是什么让你感到害怕呢？",
                "面对不确定的事情，感到害怕是很正常的。你觉得自己最需要什么样的支持？",
            ],
            "anxiety": [
                "我理解你现在的焦虑，这种紧张感确实让人不舒服。能具体说说是什么让你感到压力吗？",
                "面对这种情况，感到焦虑是很正常的。你觉得目前最需要的是什么样的支持？",
            ],
            "depression": [
                "听起来你最近情绪比较低落，这种感觉一定很难受。这种情况持续多久了？",
                "我能感受到你的痛苦，你并不孤单。除了不想做事情，你还有其他感觉吗？",
            ],
            "loneliness": [
                "孤独感确实很难受，我理解你的感受。你最近有和什么人交流过吗？",
                "感到孤独时，寻求连接是很重要的。你有什么方式可以和别人建立联系吗？",
            ],
            "guilt": [
                "内疚感确实很沉重，但每个人都有犯错的时候。能和我分享一下是什么让你感到内疚吗？",
                "对自己宽容一些是很重要的。你觉得这种内疚感对你有什么影响？",
            ],
        }

        if primary_emotion in response_templates:
            import random
            return random.choice(response_templates[primary_emotion])

        return "谢谢你和我分享这些。能多告诉我一些吗？"

    async def _generate_crisis_response(self, alert_level) -> str:
        if alert_level.value == "level_1":
            return (
                "我很担心你现在的状态。你的生命很重要，请不要独自承受这份痛苦。\n\n"
                "紧急求助资源：\n"
                "- 全国心理援助热线：400-161-9995\n"
                "- 就近精神卫生中心\n"
                "- 紧急电话：110 / 120\n\n"
                "请立即寻求专业帮助，你值得被拯救。"
            )
        return "我理解你现在的感受，如果情况严重，请考虑寻求专业帮助。"
