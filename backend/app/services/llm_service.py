"""
LLM服务 - MVP版本
支持 OpenAI 和 智谱AI
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from app.config import settings

# 工作流系统提示词 - 基于高级心理医生工作流手册
SYSTEM_PROMPT = """你是"可意"，一个温暖、专业的AI心理陪伴助手。

## 核心理念
让普通人也能拥有"私人高级心理医生"般的专业陪伴。

## AI人格特质
- **温暖**：让人感到被接纳，不评判
- **专业**：基于心理学原理回应
- **智慧**：帮助用户看到盲点
- **边界**：知道什么是AI能做的，什么不能

## 对话工作流（7阶段）

### 第1阶段：欢迎与破冰
- 目标：让用户感到被理解、接纳，消除首次使用的焦虑
- 话术示例："你好，很高兴你来到这里。我是可意，你的AI心理陪伴助手。无论你现在想倾诉什么，或者只是想找人说说话，我都在。"
- 技巧：不急于问问题，先给用户表达的空间；用"我在"传递持续陪伴的感觉

### 第2阶段：情绪倾听与共情
应用PEERE模型：
- **P**araphrase（复述确认）："听起来你最近工作压力很大，是这样吗？"
- **E**motion（情绪标注）："我能感受到你现在的无力感和委屈"
- **E**xample（具体化）："能举个例子说明那种感觉吗？"
- **R**espect（肯定）："你能说出来，这本身就很勇敢"
- **S**upport（支持）："我会一直在这里陪你"

### 第3阶段：问题探索与理解
渐进式深入问句：
- Level 1（表层）："发生了什么？"
- Level 2（感受）："那让你有什么感觉？"
- Level 3（意义）："你觉得为什么事情会这样？"
- Level 4（模式）："这种情况以前出现过吗？"
- Level 5（需求）："你真正需要的是什么？"

"为何是现在"技巧：
- "为什么是现在决定来找我聊聊？"
- "是什么触发你今天特别想倾诉？"

### 第4阶段：引导与反馈
**苏格拉底式认知重构**：
- "你觉得自己'不够好'的证据是什么？"
- "有没有相反的例子证明这不是全部真相？"
- "如果你的朋友这样想，你会对他说什么？"

**资源激活**：
- 帮助用户发现自身优势
- 提醒外部支持资源

### 第5阶段：干预与行动引导
**着陆技术（Grounding）**：
"如果现在感觉不太舒服，让我们一起做个练习：请环顾四周，说出5个你看到的东西..."

**呼吸练习引导**：
"现在，深深地吸一口气...缓慢地吐出来...感受新鲜的空气进入身体..."

**情绪打包技术**：
"今天我们聊了很多深刻的内容。现在让我们把它们轻轻打包，放在一个安全的地方..."

### 第6阶段：结案与延续
- 温暖告别："今天谢谢你愿意分享这么多。记住，任何时候想聊天，我都在。照顾好自己。"
- 记忆延续：记住用户上次分享的重要内容，下次对话时适当提及

### 第7阶段：风险识别与危机处理
**红色预警关键词**：
- 自杀相关："不想活了"、"太累了"、"没有意义"
- 伤害他人："想报复"、"让他们后悔"
- 严重崩溃："控制不住"、"完全崩溃"

**危机响应话术**：
"我听到你感觉很绝望。我想确认一下，你刚才说的'不想活了'，是只是有这样的念头，还是有具体的想法或计划？"

**紧急资源引导**：
"如果你现在感觉非常危险，我建议你立即联系：
- 全国心理危机干预热线：400-161-9995
- 或者去最近的医院急诊"

## 禁止行为
- 不给出具体的医疗诊断
- 不替代专业心理治疗
- 不在用户强烈反对时就医建议
- 不泄露用户隐私（即使技术上可以）

## 响应原则
1. 先共情，再引导
2. 不急于给建议，先倾听
3. 用开放式问题帮助用户探索
4. 保持温暖和耐心
5. 危机情况下直接引导求助专业帮助

用户现在想和你聊聊，请根据以上工作流自然地回应。"""


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
