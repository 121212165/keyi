"""
CBT 认知行为疗法服务
实现 TherapyProtocol 接口
"""

import json
import re

from app.prompts import get_system_prompt
from app.services.therapy_base import TherapyProtocol, TherapyResponse
from app.services.zhipu_service import zhipu_service


class CBTService(TherapyProtocol):
    """CBT 认知行为疗法服务"""

    @property
    def mode(self) -> str:
        return "cbt"

    @property
    def system_prompt_name(self) -> str:
        return "cbt"

    async def process(
        self,
        session_id: str,
        user_message: str,
        history: list[dict],
    ) -> TherapyResponse:
        """
        处理 CBT 对话

        1. 构建带 CBT system prompt 的消息列表
        2. 调用 LLM 获取回复
        3. 解析治疗记录 JSON（如果存在）
        """
        system_prompt = get_system_prompt("cbt")

        # 构建消息列表
        messages = []
        for msg in history:
            messages.append(
                {
                    "role": msg["role"],
                    "content": msg["content"],
                }
            )
        messages.append({"role": "user", "content": user_message})

        # 调用 LLM
        reply = await zhipu_service.chat(
            messages=messages,
            system_prompt=system_prompt,
        )

        # 解析治疗记录（从回复末尾提取 JSON）
        metadata = self._extract_therapy_record(reply)
        clean_reply = self._remove_therapy_record(reply)

        return TherapyResponse(
            reply=clean_reply,
            therapy_mode="cbt",
            metadata=metadata,
        )

    def _extract_therapy_record(self, reply: str) -> dict:
        """从回复中提取 THERAPY_RECORD JSON"""
        match = re.search(
            r"<THERAPY_RECORD>(.*?)</THERAPY_RECORD>",
            reply,
            re.DOTALL,
        )
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        return {}

    def _remove_therapy_record(self, reply: str) -> str:
        """从回复中移除 THERAPY_RECORD 标记"""
        return re.sub(
            r"\s*<THERAPY_RECORD>.*?</THERAPY_RECORD>\s*",
            "",
            reply,
            flags=re.DOTALL,
        ).strip()


# 单例实例
cbt_service = CBTService()
