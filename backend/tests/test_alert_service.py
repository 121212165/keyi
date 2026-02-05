import pytest
from app.services.alert_service import AlertService
from app.schemas import AlertLevel


@pytest.mark.alert
@pytest.mark.unit
class TestAlertService:
    @pytest.fixture
    def alert_service(self):
        return AlertService()

    @pytest.mark.asyncio
    async def test_check_risk_level_1_suicide(self, alert_service):
        user_id = "test_user_001"
        message = "我想自杀，结束生命"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_1

    @pytest.mark.asyncio
    async def test_check_risk_level_1_self_harm(self, alert_service):
        user_id = "test_user_001"
        message = "我想自残，伤害自己"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_1

    @pytest.mark.asyncio
    async def test_check_risk_level_1_no_will_to_live(self, alert_service):
        user_id = "test_user_001"
        message = "我不想活了，活着没有意义"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_1

    @pytest.mark.asyncio
    async def test_check_risk_level_2_despair(self, alert_service):
        user_id = "test_user_001"
        message = "我感到很绝望，没有希望"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_2

    @pytest.mark.asyncio
    async def test_check_risk_level_2_hopeless(self, alert_service):
        user_id = "test_user_001"
        message = "我觉得没有出路，无法承受"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_2

    @pytest.mark.asyncio
    async def test_check_risk_level_3_normal(self, alert_service):
        user_id = "test_user_001"
        message = "我今天工作有点累"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_3

    @pytest.mark.asyncio
    async def test_trigger_alert_level_1(self, alert_service):
        user_id = "test_user_001"
        level = AlertLevel.LEVEL_1
        trigger_reason = "检测到自杀关键词"

        alert = await alert_service.trigger_alert(user_id, level, trigger_reason)

        assert alert.id == "alert_001"
        assert alert.user_id == user_id
        assert alert.level == level
        assert alert.trigger_reason == trigger_reason
        assert len(alert.resources_provided) >= 3
        has_hotline = any(
            "心理援助热线" in r.get("name", "") for r in alert.resources_provided
        )
        assert has_hotline

    @pytest.mark.asyncio
    async def test_trigger_alert_level_2(self, alert_service):
        user_id = "test_user_001"
        level = AlertLevel.LEVEL_2
        trigger_reason = "检测到绝望情绪"

        alert = await alert_service.trigger_alert(user_id, level, trigger_reason)

        assert alert.id == "alert_001"
        assert alert.user_id == user_id
        assert alert.level == level
        assert alert.trigger_reason == trigger_reason
        assert len(alert.resources_provided) >= 2

    @pytest.mark.asyncio
    async def test_trigger_alert_level_3(self, alert_service):
        user_id = "test_user_001"
        level = AlertLevel.LEVEL_3
        trigger_reason = "情绪持续低落"

        alert = await alert_service.trigger_alert(user_id, level, trigger_reason)

        assert alert.id == "alert_001"
        assert alert.user_id == user_id
        assert alert.level == level
        assert alert.trigger_reason == trigger_reason
        assert len(alert.resources_provided) >= 1

    def test_get_resources_level_1(self, alert_service):
        resources = alert_service.get_resources(AlertLevel.LEVEL_1)

        assert len(resources) >= 3
        has_hotline = any(
            "心理援助热线" in r.get("name", "") for r in resources
        )
        has_110 = any(r.get("phone") == "110" for r in resources)
        has_120 = any(r.get("phone") == "120" for r in resources)
        assert has_hotline
        assert has_110
        assert has_120

    def test_get_resources_level_2(self, alert_service):
        resources = alert_service.get_resources(AlertLevel.LEVEL_2)

        assert len(resources) >= 2
        has_hotline = any(
            "心理援助热线" in r.get("name", "") for r in resources
        )
        assert has_hotline

    def test_get_resources_level_3(self, alert_service):
        resources = alert_service.get_resources(AlertLevel.LEVEL_3)

        assert len(resources) >= 1

    def test_high_risk_keywords_exist(self, alert_service):
        assert "自杀" in alert_service.high_risk_keywords
        assert "结束生命" in alert_service.high_risk_keywords
        assert "不想活了" in alert_service.high_risk_keywords
        assert "自残" in alert_service.high_risk_keywords
        assert "伤害自己" in alert_service.high_risk_keywords

    def test_despair_keywords_exist(self, alert_service):
        assert "绝望" in alert_service.despair_keywords
        assert "无望" in alert_service.despair_keywords
        assert "没有希望" in alert_service.despair_keywords

    @pytest.mark.asyncio
    async def test_multiple_risk_keywords(self, alert_service):
        user_id = "test_user_001"
        message = "我想自杀，感到很绝望"

        level = await alert_service.check_risk(user_id, message)

        assert level == AlertLevel.LEVEL_1

    @pytest.mark.asyncio
    async def test_alert_resources_quality(self, alert_service):
        user_id = "test_user_001"
        level = AlertLevel.LEVEL_1
        trigger_reason = "测试预警"

        alert = await alert_service.trigger_alert(user_id, level, trigger_reason)

        for resource in alert.resources_provided:
            assert "name" in resource
            assert len(resource["name"]) > 0
            if "phone" in resource:
                assert len(resource["phone"]) > 0
            if "url" in resource:
                assert len(resource["url"]) > 0

    @pytest.mark.asyncio
    async def test_crisis_recall_rate(self, alert_service):
        test_cases = [
            ("我想自杀", AlertLevel.LEVEL_1),
            ("我想自残", AlertLevel.LEVEL_1),
            ("不想活了", AlertLevel.LEVEL_1),
            ("感到绝望", AlertLevel.LEVEL_2),
            ("没有希望", AlertLevel.LEVEL_2),
            ("今天天气不错", AlertLevel.LEVEL_3),
        ]

        correct_count = 0
        for message, expected_level in test_cases:
            detected_level = await alert_service.check_risk("test_user", message)
            if detected_level == expected_level:
                correct_count += 1

        recall_rate = correct_count / len(test_cases)
        assert recall_rate >= 0.95
