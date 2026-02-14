"""
认证服务 (Supabase Auth)
"""
from typing import Optional, Dict, Any
from supabase import create_client, Client
from app.config import settings


class AuthService:
    """Supabase认证服务"""

    def __init__(self):
        self.client: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )

    async def sign_up(
        self,
        email: str,
        password: str,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        用户注册

        Args:
            email: 邮箱
            password: 密码
            **kwargs: 其他参数（如用户名等）

        Returns:
            注册结果
        """
        if not self.client:
            raise Exception("Supabase未配置")

        try:
            result = self.client.auth.sign_up({
                "email": email,
                "password": password,
                **kwargs,
            })
            return {
                "success": True,
                "user": result.user,
                "session": result.session,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    async def sign_in(
        self,
        email: str,
        password: str,
    ) -> Dict[str, Any]:
        """
        用户登录

        Args:
            email: 邮箱
            password: 密码

        Returns:
            登录结果
        """
        if not self.client:
            raise Exception("Supabase未配置")

        try:
            result = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password,
            })
            return {
                "success": True,
                "user": result.user,
                "session": result.session,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    async def sign_out(self) -> bool:
        """
        用户登出

        Returns:
            是否成功
        """
        if not self.client:
            return True  # 未配置时视为成功

        try:
            self.client.auth.sign_out()
            return True
        except Exception:
            return False

    async def get_user(self, token: str) -> Dict[str, Any]:
        """
        获取当前用户信息

        Args:
            token: 访问令牌

        Returns:
            用户信息
        """
        if not self.client:
            raise Exception("Supabase未配置")

        try:
            result = self.client.auth.get_user(token)
            return {
                "success": True,
                "user": result.user,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    async def verify_token(self, token: str) -> bool:
        """
        验证令牌是否有效

        Args:
            token: JWT令牌

        Returns:
            是否有效
        """
        if not self.client:
            return False

        try:
            result = self.client.auth.get_user(token)
            return result.user is not None
        except Exception:
            return False

    def refresh_session(self, refresh_token: str) -> Dict[str, Any]:
        """
        刷新会话

        Args:
            refresh_token: 刷新令牌

        Returns:
            新的会话信息
        """
        if not self.client:
            raise Exception("Supabase未配置")

        try:
            result = self.client.auth.refresh_session(refresh_token)
            return {
                "success": True,
                "session": result.session,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }


# 单例实例
auth_service = AuthService()
