"""
LLM 服务 - 支持小米 MiMo (Anthropic 兼容) 和智谱 AI
"""

import json
from collections.abc import AsyncGenerator

import httpx

from app.config import settings


class LLMService:
    """统一 LLM 对话服务"""

    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self._configure_provider()

    def _configure_provider(self):
        """根据 provider 配置 API 参数"""
        if self.provider == "anthropic":
            self.api_key = settings.LLM_API_KEY
            self.model = settings.LLM_MODEL
            self.base_url = settings.LLM_BASE_URL
        elif self.provider == "zhipu":
            self.api_key = settings.ZHIPU_API_KEY
            self.model = settings.ZHIPU_MODEL
            self.base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        else:
            # OpenAI 兼容格式
            self.api_key = settings.LLM_API_KEY
            self.model = settings.LLM_MODEL
            self.base_url = settings.LLM_BASE_URL

    async def chat(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> str:
        """
        发送对话请求，获取 AI 回复

        Args:
            messages: 对话历史消息列表
            system_prompt: 系统提示词

        Returns:
            AI 回复文本
        """
        if self.provider == "anthropic":
            return await self._chat_anthropic(messages, system_prompt)
        else:
            return await self._chat_openai(messages, system_prompt)

    async def _chat_anthropic(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> str:
        """Anthropic Messages API 格式调用"""
        payload = {
            "model": self.model,
            "max_tokens": 2048,
            "messages": messages,
        }
        if system_prompt:
            payload["system"] = system_prompt

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
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
                # Anthropic 格式: content 数组，可能包含 thinking 和 text 块
                content_blocks = data.get("content", [])
                for block in content_blocks:
                    if block.get("type") == "text":
                        return block.get("text", "")
                # 如果没有 text 块，尝试第一个块
                if content_blocks:
                    return content_blocks[0].get("text", content_blocks[0].get("thinking", ""))
                return ""
        except httpx.HTTPStatusError as e:
            raise Exception(
                f"LLM调用失败: HTTP {e.response.status_code} - {e.response.text}"
            ) from e
        except Exception as e:
            raise Exception(f"LLM调用失败: {str(e)}") from e

    async def _chat_openai(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> str:
        """OpenAI 兼容格式调用（智谱 AI、OpenAI 等）"""
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
            raise Exception(
                f"LLM调用失败: HTTP {e.response.status_code} - {e.response.text}"
            ) from e
        except Exception as e:
            raise Exception(f"LLM调用失败: {str(e)}") from e

    async def chat_stream(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """流式获取 AI 回复"""
        if self.provider == "anthropic":
            async for chunk in self._stream_anthropic(messages, system_prompt):
                yield chunk
        else:
            async for chunk in self._stream_openai(messages, system_prompt):
                yield chunk

    async def _stream_anthropic(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Anthropic 流式调用"""
        payload = {
            "model": self.model,
            "max_tokens": 2048,
            "messages": messages,
            "stream": True,
        }
        if system_prompt:
            payload["system"] = system_prompt

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }

        try:
            async with (
                httpx.AsyncClient(timeout=60.0) as client,
                client.stream("POST", self.base_url, json=payload, headers=headers) as response,
            ):
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        try:
                            obj = json.loads(data)
                            if obj.get("type") == "content_block_delta":
                                text = obj.get("delta", {}).get("text", "")
                                if text:
                                    yield text
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise Exception(f"LLM流式调用失败: {str(e)}") from e

    async def _stream_openai(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """OpenAI 兼容流式调用"""
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
            async with (
                httpx.AsyncClient(timeout=60.0) as client,
                client.stream("POST", self.base_url, json=payload, headers=headers) as response,
            ):
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
            raise Exception(f"LLM流式调用失败: {str(e)}") from e


# 心理医生系统提示词（保留兼容性）
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
zhipu_service = LLMService()
