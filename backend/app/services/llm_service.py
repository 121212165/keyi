"""
LLM服务 - MVP版本
使用OpenAI API生成对话回复
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from app.config import settings

# 工作流系统提示词
SYSTEM_PROMPT = """你是一个温暖、专业AI心理陪伴助手，名为"可意"。

核心理念：
- 温暖：让人感到被接纳，不评判
- 专业：基于心理学原理回应
- 智慧：帮助用户看到盲点
- 边界：知道什么是AI能做的，什么不能

响应原则：
1. 先共情，再引导
2. 不急于给建议，先倾听
3. 用开放式问题帮助用户探索
4. 保持温暖和耐心
5. 如果用户提到想死、自杀等念头，要引导他们寻求专业帮助

禁止行为：
- 不给出具体的医疗诊断
- 不替代专业心理治疗
- 不在用户强烈反对时就医建议
- 不泄露用户隐私

用户现在想和你聊聊，请根据以上原则回应。"""


class LLMService:
    """简单的LLM服务"""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY or ""
        self.model = settings.OPENAI_MODEL
        self.base_url = settings.OPENAI_BASE_URL

    async def chat(self, message: str, history: List[Dict] = None) -> str:
        """生成回复

        Args:
            message: 用户最新消息
            history: 对话历史

        Returns:
            AI回复内容
        """
        if not self.api_key:
            return self._fallback_response(message)

        try:
            return await self._call_openai(message, history or [])
        except Exception as e:
            print(f"LLM调用失败: {e}")
            return self._fallback_response(message)

    async def _call_openai(self, message: str, history: List[Dict]) -> str:
        """调用OpenAI API"""
        import httpx

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # 添加历史消息
        for msg in history[-10:]:  # 只保留最近10条
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        # 添加当前消息
        messages.append({"role": "user", "content": message})

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )

            if response.status_code != 200:
                return self._fallback_response(message)

            result = response.json()
            return result["choices"][0]["message"]["content"]

    def _fallback_response(self, message: str) -> str:
        """当API不可用时的默认回复"""
        message_lower = message.lower()

        # 简单的关键词响应
        if any(word in message_lower for word in ["累", "压力", "焦虑", "烦"]):
            return "我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？"

        if any(word in message_lower for word in ["难过", "伤心", "哭", "抑郁"]):
            return "我感受到你现在的难过。眼泪有时候是情绪的出口，想说说我能为你做些什么吗？"

        if any(word in message_lower for word in ["想死", "自杀", "不想活", "活着没意思"]):
            return "我听到你感觉很绝望。你愿意告诉我发生了什么吗？如果你有具体的想法或计划，请拨打心理危机干预热线：400-161-9995"

        if any(word in message_lower for word in ["谢谢", "感谢", "好"]):
            return "不用谢。我在这里陪你。还想聊些什么吗？"

        # 默认回复
        return "我在这里听你说。如果愿意的话，可以多说说你的想法和感受。"


# 全局实例
llm_service = LLMService()
