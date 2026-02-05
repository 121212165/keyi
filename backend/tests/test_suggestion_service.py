import pytest
from app.services.suggestion_service import SuggestionService
from app.schemas import EmotionType, EmotionIntensity, SuggestionType


@pytest.mark.suggestion
@pytest.mark.unit
class TestSuggestionService:
    @pytest.fixture
    def suggestion_service(self):
        return SuggestionService()

    @pytest.mark.asyncio
    async def test_generate_suggestions_for_anxiety(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.ANXIETY, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) > 0
        assert len(suggestions) <= 3
        for suggestion in suggestions:
            assert suggestion.type in [
                SuggestionType.EMOTION_REGULATION,
                SuggestionType.COGNITIVE_ADJUSTMENT,
            ]
            assert len(suggestion.title) > 0
            assert len(suggestion.description) > 0
            assert len(suggestion.steps) > 0

    @pytest.mark.asyncio
    async def test_generate_suggestions_for_depression(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.DEPRESSION, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) > 0
        assert len(suggestions) <= 3
        for suggestion in suggestions:
            assert suggestion.type in [
                SuggestionType.BEHAVIORAL_ACTIVATION,
                SuggestionType.COGNITIVE_ADJUSTMENT,
            ]

    @pytest.mark.asyncio
    async def test_generate_suggestions_for_anger(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.ANGER, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) > 0
        assert len(suggestions) <= 3
        for suggestion in suggestions:
            assert suggestion.type in [
                SuggestionType.EMOTION_REGULATION,
                SuggestionType.COGNITIVE_ADJUSTMENT,
            ]

    @pytest.mark.asyncio
    async def test_generate_suggestions_for_loneliness(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.LONELINESS, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) > 0
        assert len(suggestions) <= 3
        for suggestion in suggestions:
            assert suggestion.type == SuggestionType.BEHAVIORAL_ACTIVATION

    @pytest.mark.asyncio
    async def test_generate_suggestions_high_intensity(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.ANXIETY, EmotionIntensity.HIGH
        )

        assert len(suggestions) > 0
        has_stress_management = any(
            s.type == SuggestionType.STRESS_MANAGEMENT for s in suggestions
        )
        assert has_stress_management

    @pytest.mark.asyncio
    async def test_generate_suggestions_low_intensity(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.JOY, EmotionIntensity.LOW
        )

        assert len(suggestions) > 0
        has_stress_management = any(
            s.type == SuggestionType.STRESS_MANAGEMENT for s in suggestions
        )
        assert not has_stress_management

    def test_suggestion_library_structure(self, suggestion_service):
        assert SuggestionType.EMOTION_REGULATION in suggestion_service.suggestion_library
        assert SuggestionType.COGNITIVE_ADJUSTMENT in suggestion_service.suggestion_library
        assert (
            SuggestionType.BEHAVIORAL_ACTIVATION in suggestion_service.suggestion_library
        )
        assert SuggestionType.STRESS_MANAGEMENT in suggestion_service.suggestion_library

    def test_emotion_regulation_suggestions(self, suggestion_service):
        suggestions = suggestion_service.suggestion_library[
            SuggestionType.EMOTION_REGULATION
        ]

        assert len(suggestions) >= 2
        for suggestion in suggestions:
            assert len(suggestion.title) > 0
            assert len(suggestion.description) > 0
            assert len(suggestion.steps) >= 3

    def test_cognitive_adjustment_suggestions(self, suggestion_service):
        suggestions = suggestion_service.suggestion_library[
            SuggestionType.COGNITIVE_ADJUSTMENT
        ]

        assert len(suggestions) >= 2
        for suggestion in suggestions:
            assert len(suggestion.title) > 0
            assert len(suggestion.description) > 0
            assert len(suggestion.steps) >= 3

    def test_behavioral_activation_suggestions(self, suggestion_service):
        suggestions = suggestion_service.suggestion_library[
            SuggestionType.BEHAVIORAL_ACTIVATION
        ]

        assert len(suggestions) >= 2
        for suggestion in suggestions:
            assert len(suggestion.title) > 0
            assert len(suggestion.description) > 0
            assert len(suggestion.steps) >= 3

    def test_stress_management_suggestions(self, suggestion_service):
        suggestions = suggestion_service.suggestion_library[
            SuggestionType.STRESS_MANAGEMENT
        ]

        assert len(suggestions) >= 2
        for suggestion in suggestions:
            assert len(suggestion.title) > 0
            assert len(suggestion.description) > 0
            assert len(suggestion.steps) >= 3

    @pytest.mark.asyncio
    async def test_suggestion_content_quality(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.ANXIETY, EmotionIntensity.MEDIUM
        )

        for suggestion in suggestions:
            assert len(suggestion.title) > 0
            assert len(suggestion.description) > 10
            assert len(suggestion.steps) >= 3
            for step in suggestion.steps:
                assert len(step) > 5

    @pytest.mark.asyncio
    async def test_suggestions_limit(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.ANXIETY, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) <= 3

    @pytest.mark.asyncio
    async def test_generate_suggestions_for_fear(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.FEAR, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) > 0
        for suggestion in suggestions:
            assert suggestion.type in [
                SuggestionType.EMOTION_REGULATION,
                SuggestionType.COGNITIVE_ADJUSTMENT,
            ]

    @pytest.mark.asyncio
    async def test_generate_suggestions_for_sadness(self, suggestion_service):
        suggestions = await suggestion_service.generate_suggestions(
            EmotionType.SADNESS, EmotionIntensity.MEDIUM
        )

        assert len(suggestions) > 0
        for suggestion in suggestions:
            assert suggestion.type in [
                SuggestionType.BEHAVIORAL_ACTIVATION,
                SuggestionType.COGNITIVE_ADJUSTMENT,
            ]
