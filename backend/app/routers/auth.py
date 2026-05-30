"""
认证相关路由
用户注册、登录、登出、获取当前用户信息
"""

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


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
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: dict | None = None


# ============ Auth Endpoints ============


@router.post("/register", response_model=TokenResponse)
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


@router.post("/login", response_model=TokenResponse)
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


@router.post("/logout")
async def logout(authorization: str | None = Header(None)):
    """用户登出"""
    await auth_service.sign_out()
    return {"message": "登出成功"}


@router.get("/me")
async def get_me(authorization: str | None = Header(None)):
    """获取当前用户信息"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")

    token = authorization.replace("Bearer ", "")
    result = await auth_service.get_user(token)

    if not result["success"]:
        raise HTTPException(status_code=401, detail=result.get("error", "获取用户信息失败"))

    return {"user": result["user"]}
