from typing import List, Dict
from datetime import datetime
from app.schemas import AlertLevel, Alert


class AlertService:
    def __init__(self):
        self.high_risk_keywords = [
            "自杀",
            "结束生命",
            "不想活了",
            "自残",
            "伤害自己",
            "活着没意义",
            "再见",
            "最后一次",
        ]

        self.despair_keywords = [
            "绝望",
            "无望",
            "没有希望",
            "没有出路",
            "无法承受",
            "坚持不下去了",
        ]

        self.crisis_resources = {
            AlertLevel.LEVEL_1: [
                {"name": "全国心理援助热线", "phone": "400-161-9995"},
                {"name": "紧急电话", "phone": "110"},
                {"name": "急救电话", "phone": "120"},
            ],
            AlertLevel.LEVEL_2: [
                {"name": "全国心理援助热线", "phone": "400-161-9995"},
                {"name": "各地精神卫生中心", "url": "http://www.nimh.org.cn"},
            ],
            AlertLevel.LEVEL_3: [
                {"name": "心理咨询热线", "phone": "400-161-9995"},
            ],
        }

    async def check_risk(self, user_id: str, message: str) -> AlertLevel:
        for keyword in self.high_risk_keywords:
            if keyword in message:
                return AlertLevel.LEVEL_1

        for keyword in self.despair_keywords:
            if keyword in message:
                return AlertLevel.LEVEL_2

        return AlertLevel.LEVEL_3

    async def trigger_alert(
        self, user_id: str, level: AlertLevel, trigger_reason: str
    ) -> Alert:
        resources = self.crisis_resources.get(level, [])

        return Alert(
            id="alert_001",
            user_id=user_id,
            level=level,
            trigger_reason=trigger_reason,
            triggered_at=datetime.now(),
            resources_provided=resources,
        )

    def get_resources(self, alert_type: AlertLevel) -> List[Dict]:
        return self.crisis_resources.get(alert_type, [])