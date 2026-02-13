"""
LLM服务 - MVP版本
支持 OpenAI 和 智谱AI
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
    """支持多种LLM的服务"""

    def __init__(self):
        # 智谱AI配置
        self.zhipu_api_key = os.getenv("ZHIPU_API_KEY", "")
        # OpenAI配置
        self.openai_api_key = settings.OPENAI_API_KEY or ""
        self.model = settings.OPENAI_MODEL
        self.base_url = settings.OPENAI_BASE_URL

    async def chat(self, message: str, history: List[Dict] = None) -> str:
        """生成回复"""
        # 优先使用智谱AI
        if self.zhipu_api_key:
            try:
                return await self._call_zhipu(message, history or [])
            except Exception as e:
                print(f"智谱AI调用失败: {e}")

        # 备用OpenAI
        if self.openai_api_key:
            try:
                return await self._call_openai(message, history or [])
            except Exception as e:
                print(f"OpenAI调用失败: {e}")

        # 都没有就用本地回复
        return self._fallback_response(message)

    async def _call_zhipu(self, message: str, history: List[Dict]) -> str:
        """调用智谱AI API"""
        import httpx

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in history[-10:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        messages.append({"role": "user", "content": message})

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://open.bigmodel.cn/api/paas/v4/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.zhipu_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "glm-4-flash",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )

            if response.status_code != 200:
                raise Exception(f"智谱API错误: {response.status_code}")

            result = response.json()
            return result["choices"][0]["message"]["content"]

    async def _call_openai(self, message: str, history: List[Dict]) -> str:
        """调用OpenAI API"""
        import httpx

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in history[-10:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        messages.append({"role": "user", "content": message})

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_api_key}",
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
                raise Exception(f"OpenAI API错误: {response.status_code}")

            result = response.json()
            return result["choices"][0]["message"]["content"]

    def _fallback_response(self, message: str) -> str:
        """当API不可用时的默认回复"""
        message_lower = message.lower()

        if any(word in message_lower for word in ["累", "压力", "焦虑", "烦"]):
            return "我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？"

        if any(word in message_lower for word in ["难过", "伤心", "哭", "抑郁"]):
            return "我感受到你现在的难过。眼泪有时候是情绪的出口，想说说我能为你做些什么吗？"

        if any(word in message_lower for word in ["想死", "自杀", "不想活", "活着没意思"]):
            return "我听到你感觉很绝望。你愿意告诉我发生了什么吗？如果你有具体的想法或计划，请拨打心理危机干预热线：400-161-9995"

        if any(word in message_lower for word in ["谢谢", "感谢", "好"]):
            return "不用谢。我在这里陪你。还想聊些什么吗？"

        return "我在这里听你说。如果愿意的话，可以多说说你的想法和感受。"


llm_service = LLMService()
