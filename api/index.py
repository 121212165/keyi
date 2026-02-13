"""
可意AI心理医生 - Vercel API
"""

import os
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 简单的内存存储
sessions: Dict[str, List[Dict]] = {}

class MessageRequest(BaseModel):
    message: str
    session_id: str = None

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/chat/sessions")
async def create_session():
    import uuid
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    sessions[session_id] = []
    return {"session_id": session_id}

@app.post("/api/chat/sessions/{session_id}/messages")
async def send_message(session_id: str, request: MessageRequest):
    if session_id not in sessions:
        sessions[session_id] = []

    # 添加用户消息
    sessions[session_id].append({"role": "user", "content": request.message})

    # 生成回复
    response = await generate_response(request.message, sessions[session_id])

    # 添加AI回复
    sessions[session_id].append({"role": "assistant", "content": response})

    return {"response": response, "session_id": session_id}

@app.get("/api/chat/sessions/{session_id}/history")
async def get_history(session_id: str):
    if session_id not in sessions:
        return {"messages": []}
    return {"messages": sessions[session_id]}

async def generate_response(message: str, history: List[Dict]) -> str:
    """生成回复"""
    import httpx

    zhipu_key = os.getenv("ZHIPU_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    # 优先用智谱
    if zhipu_key:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                r = await client.post(
                    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
                    headers={"Authorization": f"Bearer {zhipu_key}", "Content-Type": "application/json"},
                    json={"model": "glm-4-flash", "messages": messages, "temperature": 0.7, "max_tokens": 500}
                )
                if r.status_code == 200:
                    return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"智谱错误: {e}")

    # 备用OpenAI
    if openai_key:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                r = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                    json={"model": "gpt-3.5-turbo", "messages": messages, "temperature": 0.7, "max_tokens": 500}
                )
                if r.status_code == 200:
                    return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"OpenAI错误: {e}")

    # 默认回复
    return fallback_response(message)

def fallback_response(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["累", "压力", "焦虑", "烦"]):
        return "我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？"
    if any(w in msg for w in ["难过", "伤心", "哭", "抑郁"]):
        return "我感受到你现在的难过。眼泪有时候是情绪的出口，想说说我能为你做些什么吗？"
    if any(w in msg for w in ["想死", "自杀", "不想活"]):
        return "我听到你感觉很绝望。请拨打心理危机干预热线：400-161-9995"
    return "我在这里听你说。如果愿意的话，可以多说说你的想法和感受。"
