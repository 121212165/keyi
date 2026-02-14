"""
Supabase 服务 - 用于存储对话历史和用户数据
"""

from supabase import create_client, Client
from app.config import settings
from typing import Optional, List, Dict, Any
from datetime import datetime


class SupabaseService:
    """Supabase 客户端封装"""

    def __init__(self):
        self.client: Optional[Client] = None
        self._initialize()

    def _initialize(self):
        """初始化 Supabase 客户端"""
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
                print("Supabase 客户端已初始化")
            except Exception as e:
                print(f"Supabase 初始化失败: {e}")
                self.client = None

    def is_connected(self) -> bool:
        """检查是否已连接"""
        return self.client is not None

    async def save_conversation(self, session_id: str, messages: List[Dict[str, Any]]) -> bool:
        """保存对话记录"""
        if not self.is_connected():
            return False

        try:
            data = {
                "session_id": session_id,
                "messages": messages,
                "created_at": datetime.now().isoformat()
            }
            result = self.client.table("conversations").insert(data).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f"保存对话失败: {e}")
            return False

    async def get_conversation(self, session_id: str) -> Optional[List[Dict]]:
        """获取对话记录"""
        if not self.is_connected():
            return None

        try:
            result = self.client.table("conversations") \
                .select("messages") \
                .eq("session_id", session_id) \
                .single() \
                .execute()
            return result.data.get("messages") if result.data else None
        except Exception as e:
            print(f"获取对话失败: {e}")
            return None

    async def save_chat_message(self, session_id: str, role: str, content: str, emotion: str = None) -> bool:
        """保存单条消息"""
        if not self.is_connected():
            return False

        try:
            data = {
                "session_id": session_id,
                "role": role,
                "content": content,
                "emotion": emotion,
                "timestamp": datetime.now().isoformat()
            }
            result = self.client.table("chat_messages").insert(data).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f"保存消息失败: {e}")
            return False

    async def get_chat_history(self, session_id: str, limit: int = 50) -> List[Dict]:
        """获取聊天历史"""
        if not self.is_connected():
            return []

        try:
            result = self.client.table("chat_messages") \
                .select("*") \
                .eq("session_id", session_id) \
                .order("timestamp", desc=False) \
                .limit(limit) \
                .execute()
            return result.data
        except Exception as e:
            print(f"获取历史失败: {e}")
            return []


# 全局实例
supabase_service = SupabaseService()
