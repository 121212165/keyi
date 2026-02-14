"""
智谱AI服务 (GLM-4.7-Flash) - HTTP方式调用
"""
import json
from typing import Optional, AsyncGenerator
import httpx
from app.config import settings


class ZhipuService:
    """智谱AI对话服务"""

    def __init__(self):
        self.api_key = settings.ZHIPU_API_KEY
        self.model = settings.ZHIPU_MODEL
        self.base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

    async def chat(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
    ) -> str:
        """
        发送对话请求，获取AI回复

        Args:
            messages: 对话历史消息列表，格式: [{"role": "user", "content": "..."}]
            system_prompt: 系统提示词

        Returns:
            AI回复文本
        """
        # 构建消息列表
        all_messages = messages.copy()
        if system_prompt:
            all_messages = [{"role": "system", "content": system_prompt}] + messages

        payload = {
            "model": self.model,
            "messages": all_messages,
            "stream": False,
            "max_tokens": 2048,
            "temperature": 0.7,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except httpx.HTTPStatusError as e:
            raise Exception(f"智谱AI调用失败: HTTP {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise Exception(f"智谱AI调用失败: {str(e)}")

    async def chat_stream(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        流式获取AI回复

        Args:
            messages: 对话历史消息列表
            system_prompt: 系统提示词

        Yields:
            AI回复的文本片段
        """
        all_messages = messages.copy()
        if system_prompt:
            all_messages = [{"role": "system", "content": system_prompt}] + messages

        payload = {
            "model": self.model,
            "messages": all_messages,
            "stream": True,
            "max_tokens": 2048,
            "temperature": 0.7,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    self.base_url,
                    json=payload,
                    headers=headers,
                ) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_lines():
                        if chunk.startswith("data: "):
                            data = chunk[6:]
                            if data == "[DONE]":
                                break
                            try:
                                obj = json.loads(data)
                                content = obj.get("choices", [{}])[0].get("delta", {}).get("content")
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                continue

        except Exception as e:
            raise Exception(f"智谱AI流式调用失败: {str(e)}")


# 心理医生系统提示词
PSYCHOLOGIST_SYSTEM_PROMPT = """你是可意，一个温暖、专业、有同理心的AI心理医生。

你的职责：
1. 倾听用户的困扰，给予支持和理解
2. 用温暖、平和的语气回应
3. 适当引导用户表达自己的感受
4. 提供心理健康方面的建议（但不替代专业医生诊断）
5. 保持专业边界，不做出医学诊断

注意事项：
- 始终保持耐心和关怀
- 尊重用户的感受和隐私
- 不评判、不批评
- 用简洁而有温度的语言回应"""


# 单例实例
zhipu_service = ZhipuService()
