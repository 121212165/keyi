"""
聊天相关路由
- 对话会话管理 (chat)
- 直接AI对话 (ai)
"""

import json

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.auth_service import auth_service
from app.services.chat_service import chat_service
from app.services.zhipu_service import zhipu_service

# ============ Pydantic Models ============


class MessageRequest(BaseModel):
    """发送消息请求"""

    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    """对话响应"""

    message_id: str
    reply: str
    reply_id: str
    timestamp: str


# ============ Routers ============

chat_router = APIRouter(prefix="/api/v1/chat", tags=["chat"])
ai_router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


async def _get_user_id(authorization: str | None = Header(None)) -> str:
    """从 authorization header 中获取 user_id"""
    user_id = "anonymous"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        user_result = await auth_service.get_user(token)
        if user_result["success"]:
            user_id = user_result["user"].id if user_result["user"] else "anonymous"
    return user_id


# ============ Chat Endpoints ============


@chat_router.post("/sessions")
async def create_session(
    therapy_mode: str = "general",
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """创建新对话会话"""
    user_id = await _get_user_id(authorization)
    session_id = await chat_service.create_session(user_id, db, therapy_mode=therapy_mode)
    return {"session_id": session_id, "therapy_mode": therapy_mode}


@chat_router.get("/sessions")
async def list_sessions(
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的会话列表"""
    user_id = await _get_user_id(authorization)
    sessions = await chat_service.get_sessions(user_id, db)
    return {"sessions": sessions}


@chat_router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: str,
    request: MessageRequest,
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """发送消息，获取AI回复"""
    user_id = await _get_user_id(authorization)

    try:
        result = await chat_service.send_message(
            session_id=session_id,
            user_id=user_id,
            message=request.message,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@chat_router.get("/sessions/{session_id}/history")
async def get_chat_history(
    session_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """获取对话历史"""
    try:
        messages = await chat_service.get_history(session_id, db, limit)
        return {"messages": messages}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@chat_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """删除会话"""
    success = await chat_service.delete_session(session_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"message": "删除成功"}


# ============ AI Chat Direct Endpoint ============


@ai_router.post("/chat")
async def ai_chat(
    request: MessageRequest,
    authorization: str | None = Header(None),
):
    """直接与AI对话（无需创建会话）"""
    user_id = await _get_user_id(authorization)

    messages = [{"role": "user", "content": request.message}]
    reply = await zhipu_service.chat(messages=messages)

    return {
        "reply": reply,
        "user_id": user_id,
    }


@chat_router.post("/sessions/{session_id}/messages/stream")
async def send_message_stream(
    session_id: str,
    request: MessageRequest,
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """流式发送消息，获取 AI 回复 (SSE)"""
    await _get_user_id(authorization)

    async def event_generator():
        try:
            # 获取历史和构建消息（简化版，不保存到数据库）
            history = await chat_service.get_history(session_id, db)

            import uuid as uuid_mod

            from sqlalchemy import select

            from app.models import ChatSession
            from app.prompts import get_system_prompt

            # 获取会话的疗法模式
            session_result = await db.execute(
                select(ChatSession).where(ChatSession.id == uuid_mod.UUID(session_id))
            )
            session_obj = session_result.scalar_one_or_none()
            therapy_mode = session_obj.therapy_mode if session_obj else "general"

            system_prompt = get_system_prompt(therapy_mode)

            messages = []
            for msg in history:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": request.message})

            full_reply = ""
            async for chunk in zhipu_service.chat_stream(
                messages=messages, system_prompt=system_prompt
            ):
                full_reply += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"

            # 流结束后保存消息到数据库
            import uuid
            from datetime import datetime

            from app.models import Message

            user_msg = Message(
                id=uuid.uuid4(),
                session_id=uuid_mod.UUID(session_id),
                role="user",
                content=request.message,
                created_at=datetime.utcnow(),
            )
            db.add(user_msg)

            assistant_msg = Message(
                id=uuid.uuid4(),
                session_id=uuid_mod.UUID(session_id),
                role="assistant",
                content=full_reply,
                created_at=datetime.utcnow(),
            )
            db.add(assistant_msg)

            if session_obj:
                session_obj.message_count += 2
                session_obj.updated_at = datetime.utcnow()

            await db.commit()

            yield f"data: {json.dumps({'done': True, 'message_id': str(user_msg.id)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
