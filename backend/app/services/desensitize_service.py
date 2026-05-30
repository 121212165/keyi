"""
系统脱敏疗法服务
实现 TherapyProtocol 接口
"""

import json
import re

from app.prompts import get_system_prompt
from app.services.therapy_base import TherapyProtocol, TherapyResponse
from app.services.zhipu_service import zhipu_service


class DesensitizeService(TherapyProtocol):
    """系统脱敏疗法服务"""

    @property
    def mode(self) -> str:
        return "desensitize"

    @property
    def system_prompt_name(self) -> str:
        return "desensitize"

    async def process(
        self,
        session_id: str,
        user_message: str,
        history: list[dict],
    ) -> TherapyResponse:
        """
        处理脱敏疗法对话

        1. 构建带脱敏 system prompt 的消息列表
        2. 调用 LLM 获取回复
        3. 解析脱敏记录 JSON（如果存在）
        """
        system_prompt = get_system_prompt("desensitize")

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

        # 解析脱敏记录
        metadata = self._extract_desensitize_record(reply)
        clean_reply = self._remove_desensitize_record(reply)

        return TherapyResponse(
            reply=clean_reply,
            therapy_mode="desensitize",
            metadata=metadata,
        )

    def _extract_desensitize_record(self, reply: str) -> dict:
        """从回复中提取 DESENSITIZE_RECORD JSON"""
        match = re.search(
            r"<DESENSITIZE_RECORD>(.*?)</DESENSITIZE_RECORD>",
            reply,
            re.DOTALL,
        )
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        return {}

    def _remove_desensitize_record(self, reply: str) -> str:
        """从回复中移除 DESENSITIZE_RECORD 标记"""
        return re.sub(
            r"\s*<DESENSITIZE_RECORD>.*?</DESENSITIZE_RECORD>\s*",
            "",
            reply,
            flags=re.DOTALL,
        ).strip()


# 单例实例
desensitize_service = DesensitizeService()
