import pytest
from app.services.assessment_service import AssessmentService
from app.schemas import ScaleType


@pytest.mark.assessment
@pytest.mark.unit
class TestAssessmentService:
    @pytest.fixture
    def assessment_service(self):
        return AssessmentService()

    def test_get_phq9_scale(self, assessment_service):
        scale = assessment_service.get_scale(ScaleType.PHQ_9)

        assert scale is not None
        assert scale["title"] == "患者健康问卷-9项 (PHQ-9)"
        assert len(scale["questions"]) == 9
        assert len(scale["options"]) == 4
        assert len(scale["levels"]) == 5

    def test_get_gad7_scale(self, assessment_service):
        scale = assessment_service.get_scale(ScaleType.GAD_7)

        assert scale is not None
        assert scale["title"] == "广泛性焦虑障碍-7项 (GAD-7)"
        assert len(scale["questions"]) == 7
        assert len(scale["options"]) == 4
        assert len(scale["levels"]) == 4

    def test_get_pss10_scale(self, assessment_service):
        scale = assessment_service.get_scale(ScaleType.PSS_10)

        assert scale is not None
        assert scale["title"] == "感知压力量表-10项 (PSS-10)"
        assert len(scale["questions"]) == 10
        assert len(scale["options"]) == 5
        assert len(scale["levels"]) == 3

    def test_calculate_phq9_score(self, assessment_service):
        answers = [0, 1, 2, 3, 0, 1, 2, 3, 0]
        score = assessment_service.calculate_score(ScaleType.PHQ_9, answers)

        assert score == 12

    def test_calculate_gad7_score(self, assessment_service):
        answers = [0, 1, 2, 3, 0, 1, 2]
        score = assessment_service.calculate_score(ScaleType.GAD_7, answers)

        assert score == 9

    def test_calculate_pss10_score(self, assessment_service):
        answers = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]
        score = assessment_service.calculate_score(ScaleType.PSS_10, answers)

        assert score == 20

    def test_phq9_level_no_depression(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PHQ_9, 4)

        assert level == "无抑郁"

    def test_phq9_level_mild(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PHQ_9, 7)

        assert level == "轻度抑郁"

    def test_phq9_level_moderate(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PHQ_9, 12)

        assert level == "中度抑郁"

    def test_phq9_level_moderately_severe(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PHQ_9, 17)

        assert level == "中重度抑郁"

    def test_phq9_level_severe(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PHQ_9, 24)

        assert level == "重度抑郁"

    def test_gad7_level_no_anxiety(self, assessment_service):
        level = assessment_service.get_level(ScaleType.GAD_7, 4)

        assert level == "无焦虑"

    def test_gad7_level_mild(self, assessment_service):
        level = assessment_service.get_level(ScaleType.GAD_7, 7)

        assert level == "轻度焦虑"

    def test_gad7_level_moderate(self, assessment_service):
        level = assessment_service.get_level(ScaleType.GAD_7, 12)

        assert level == "中度焦虑"

    def test_gad7_level_severe(self, assessment_service):
        level = assessment_service.get_level(ScaleType.GAD_7, 18)

        assert level == "重度焦虑"

    def test_pss10_level_low(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PSS_10, 10)

        assert level == "低压力"

    def test_pss10_level_medium(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PSS_10, 20)

        assert level == "中等压力"

    def test_pss10_level_high(self, assessment_service):
        level = assessment_service.get_level(ScaleType.PSS_10, 35)

        assert level == "高压力"

    @pytest.mark.asyncio
    async def test_submit_phq9_assessment(self, assessment_service):
        user_id = "test_user_001"
        answers = [0, 1, 2, 3, 0, 1, 2, 3, 0]

        result = await assessment_service.submit_assessment(
            user_id, ScaleType.PHQ_9, answers
        )

        assert result.scale_type == ScaleType.PHQ_9
        assert result.score == 12
        assert result.level == "中度抑郁"
        assert result.answers == answers

    @pytest.mark.asyncio
    async def test_submit_gad7_assessment(self, assessment_service):
        user_id = "test_user_001"
        answers = [0, 1, 2, 3, 0, 1, 2]

        result = await assessment_service.submit_assessment(
            user_id, ScaleType.GAD_7, answers
        )

        assert result.scale_type == ScaleType.GAD_7
        assert result.score == 9
        assert result.level == "轻度焦虑"
        assert result.answers == answers

    @pytest.mark.asyncio
    async def test_submit_pss10_assessment(self, assessment_service):
        user_id = "test_user_001"
        answers = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]

        result = await assessment_service.submit_assessment(
            user_id, ScaleType.PSS_10, answers
        )

        assert result.scale_type == ScaleType.PSS_10
        assert result.score == 20
        assert result.level == "中等压力"
        assert result.answers == answers

    def test_invalid_scale_type(self, assessment_service):
        scale = assessment_service.get_scale("invalid_scale")

        assert scale is None

    def test_boundary_score_phq9(self, assessment_service):
        assert assessment_service.get_level(ScaleType.PHQ_9, 0) == "无抑郁"
        assert assessment_service.get_level(ScaleType.PHQ_9, 27) == "重度抑郁"

    def test_boundary_score_gad7(self, assessment_service):
        assert assessment_service.get_level(ScaleType.GAD_7, 0) == "无焦虑"
        assert assessment_service.get_level(ScaleType.GAD_7, 21) == "重度焦虑"

    def test_boundary_score_pss10(self, assessment_service):
        assert assessment_service.get_level(ScaleType.PSS_10, 0) == "低压力"
        assert assessment_service.get_level(ScaleType.PSS_10, 40) == "高压力"
