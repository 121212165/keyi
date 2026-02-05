import pytest
from app.services.emotion_service import EmotionRecognitionEngine
from app.schemas import EmotionType, EmotionIntensity


@pytest.mark.emotion
@pytest.mark.unit
class TestEmotionRecognitionEngine:
    @pytest.fixture
    def emotion_engine(self):
        return EmotionRecognitionEngine()

    @pytest.mark.asyncio
    async def test_recognize_joy_emotion(self, emotion_engine):
        text = "我今天真的很开心，感到很幸福"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion == EmotionType.JOY
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_recognize_sadness_emotion(self, emotion_engine):
        text = "我最近很难过，感觉很痛苦"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion == EmotionType.SADNESS
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_recognize_anxiety_emotion(self, emotion_engine):
        text = "我很担心，感到很焦虑，压力很大"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion in [EmotionType.ANXIETY, EmotionType.FEAR]
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_recognize_anger_emotion(self, emotion_engine):
        text = "我很生气，感到很愤怒"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion == EmotionType.ANGER
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_recognize_depression_emotion(self, emotion_engine):
        text = "我感到很抑郁，很绝望，没有希望"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion == EmotionType.DEPRESSION
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_recognize_loneliness_emotion(self, emotion_engine):
        text = "我感到很孤独，很寂寞"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion == EmotionType.LONELINESS
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_recognize_guilt_emotion(self, emotion_engine):
        text = "我感到很内疚，很自责"
        result = await emotion_engine.analyze(text)

        assert result.primary_emotion == EmotionType.GUILT
        assert result.intensity in [EmotionIntensity.MEDIUM, EmotionIntensity.HIGH]
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_emotion_intensity_low(self, emotion_engine):
        text = "我有点不开心"
        result = await emotion_engine.analyze(text)

        assert result.intensity == EmotionIntensity.LOW
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_emotion_intensity_high(self, emotion_engine):
        text = "我非常非常开心，特别幸福，感到很满足，很愉快"
        result = await emotion_engine.analyze(text)

        assert result.intensity == EmotionIntensity.HIGH
        assert result.confidence >= 0.7

    @pytest.mark.asyncio
    async def test_multiple_emotions(self, emotion_engine):
        text = "我既感到焦虑又感到难过"
        result = await emotion_engine.analyze(text)

        assert len(result.secondary_emotions) >= 1
        assert result.confidence >= 0.5

    @pytest.mark.asyncio
    async def test_no_emotion_keywords(self, emotion_engine):
        text = "今天天气不错"
        result = await emotion_engine.analyze(text)

        assert result.confidence >= 0.5
        assert result.intensity == EmotionIntensity.LOW

    @pytest.mark.asyncio
    async def test_confidence_calculation(self, emotion_engine):
        text = "我很开心很开心开心"
        result = await emotion_engine.analyze(text)

        assert result.confidence >= 0.7

    @pytest.mark.asyncio
    async def test_response_time(self, emotion_engine):
        import time

        text = "我今天很开心"
        start_time = time.time()

        result = await emotion_engine.analyze(text)
        end_time = time.time()

        assert (end_time - start_time) < 1.0
        assert result is not None