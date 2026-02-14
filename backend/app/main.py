"""
可意AI心理医生 - 后端API
FastAPI + Supabase Auth + 智谱AI (GLM-4.7-Flash)
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from app.database import get_db, init_db
from app.services.chat_service import chat_service
from app.services.auth_service import auth_service
from app.services.zhipu_service import zhipu_service
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI(
    title="可意AI心理医生 API",
    description="温暖、专业、有同理心的AI心理健康助手",
    version="1.0.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Pydantic Models ============

class RegisterRequest(BaseModel):
    """用户注册请求"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """用户登录请求"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[dict] = None


class MessageRequest(BaseModel):
    """发送消息请求"""
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    """对话响应"""
    message_id: str
    reply: str
    reply_id: str
    timestamp: str


class SessionResponse(BaseModel):
    """会话响应"""
    id: str
    started_at: str
    ended_at: Optional[str] = None
    message_count: int


# ============ Health Endpoints ============

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "可意AI心理医生 API",
        "version": "1.0.0",
        "model": "glm-4.7-flash",
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


# ============ Auth Endpoints ============

@app.post("/api/v1/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """用户注册"""
    result = await auth_service.sign_up(
        email=request.email,
        password=request.password,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "注册失败"))

    return {
        "access_token": result["session"].access_token if result["session"] else "",
        "refresh_token": result["session"].refresh_token if result["session"] else None,
        "token_type": "bearer",
        "user": {
            "id": result["user"].id if result["user"] else None,
            "email": result["user"].email if result["user"] else None,
        },
    }


@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """用户登录"""
    result = await auth_service.sign_in(
        email=request.email,
        password=request.password,
    )

    if not result["success"]:
        raise HTTPException(status_code=401, detail=result.get("error", "登录失败"))

    return {
        "access_token": result["session"].access_token if result["session"] else "",
        "refresh_token": result["session"].refresh_token if result["session"] else None,
        "token_type": "bearer",
        "user": {
            "id": result["user"].id if result["user"] else None,
            "email": result["user"].email if result["user"] else None,
        },
    }


@app.post("/api/v1/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """用户登出"""
    await auth_service.sign_out()
    return {"message": "登出成功"}


@app.get("/api/v1/auth/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """获取当前用户信息"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")

    token = authorization.replace("Bearer ", "")
    result = await auth_service.get_user(token)

    if not result["success"]:
        raise HTTPException(status_code=401, detail=result.get("error", "获取用户信息失败"))

    return {"user": result["user"]}


# ============ Chat Endpoints ============

@app.post("/api/v1/chat/sessions")
async def create_session(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """创建新对话会话"""
    user_id = "anonymous"  # 未登录用户使用匿名ID
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        user_result = await auth_service.get_user(token)
        if user_result["success"]:
            user_id = user_result["user"].id if user_result["user"] else "anonymous"

    session_id = await chat_service.create_session(user_id)
    return {"session_id": session_id}


@app.get("/api/v1/chat/sessions")
async def list_sessions(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的会话列表"""
    user_id = "anonymous"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        user_result = await auth_service.get_user(token)
        if user_result["success"]:
            user_id = user_result["user"].id if user_result["user"] else "anonymous"

    sessions = await chat_service.get_sessions(user_id, db)
    return {"sessions": sessions}


@app.post("/api/v1/chat/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: str,
    request: MessageRequest,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """发送消息，获取AI回复"""
    user_id = "anonymous"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        user_result = await auth_service.get_user(token)
        if user_result["success"]:
            user_id = user_result["user"].id if user_result["user"] else "anonymous"

    try:
        result = await chat_service.send_message(
            session_id=session_id,
            user_id=user_id,
            message=request.message,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/chat/sessions/{session_id}/history")
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
        raise HTTPException(status_code=404, detail=str(e))


@app.delete("/api/v1/chat/sessions/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """删除会话"""
    success = await chat_service.delete_session(session_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"message": "删除成功"}


# ============ AI Chat Direct Endpoint ============

@app.post("/api/v1/ai/chat")
async def ai_chat(
    request: MessageRequest,
    authorization: Optional[str] = Header(None),
):
    """直接与AI对话（无需创建会话）"""
    user_id = "anonymous"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        user_result = await auth_service.get_user(token)
        if user_result["success"]:
            user_id = user_result["user"].id if user_result["user"] else "anonymous"

    messages = [{"role": "user", "content": request.message}]
    reply = await zhipu_service.chat(messages=messages)

    return {
        "reply": reply,
        "user_id": user_id,
    }


# ============ Startup Event ============

@app.on_event("startup")
async def startup():
    """启动时初始化数据库"""
    await init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
