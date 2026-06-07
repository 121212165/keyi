"""
对话服务模块 - Supabase PostgreSQL (via supabase-py client)
"""
from typing import Optional, List

from app import db
from app.services.zhipu_service import zhipu_service
from app.prompts import get_system_prompt


class ChatService:
    """对话服务类"""

    def __init__(self) -> None:
        pass

    # ------------------------------------------------------------------
    # Session management
    # ------------------------------------------------------------------

    def create_session(
        self,
        user_id: str,
        therapy_mode: str = "general",
    ) -> Optional[str]:
        """创建新对话会话，返回 session_id 或 None"""
        session = db.create_chat_session(
            user_id=user_id,
            therapy_mode=therapy_mode,
        )
        if session is None:
            return None
        return session["id"]

    def get_sessions(self, user_id: str) -> List[dict]:
        """获取用户的所有会话"""
        sessions = db.get_user_sessions(user_id)
        return [
            {
                "id": s["id"],
                "title": s.get("title", "新对话"),
                "started_at": s.get("started_at"),
                "updated_at": s.get("updated_at"),
                "message_count": s.get("message_count") or 0,
            }
            for s in sessions
        ]

    def delete_session(self, session_id: str) -> bool:
        """删除会话及所有消息"""
        return db.delete_chat_session(session_id)

    def update_session_title(self, session_id: str, title: str) -> bool:
        """更新会话标题"""
        return db.update_session_title(session_id, title)

    # ------------------------------------------------------------------
    # History
    # ------------------------------------------------------------------

    def get_history(
        self,
        session_id: str,
        limit: int = 50,
    ) -> List[dict]:
        """获取会话历史"""
        messages = db.get_session_messages(session_id, limit=limit)
        return [
            {
                "id": m["id"],
                "role": m["role"],
                "content": m["content"],
                "timestamp": m.get("created_at"),
                "emotion": m.get("emotion"),
            }
            for m in messages
        ]

    # ------------------------------------------------------------------
    # Messaging
    # ------------------------------------------------------------------

    async def send_message(
        self,
        session_id: str,
        user_id: str,
        message: str,
    ) -> dict:
        """
        发送消息，获取AI回复

        Args:
            session_id: 会话ID
            user_id: 用户ID
            message: 用户消息

        Returns:
            包含消息和AI回复的字典
        """
        # 1. 获取会话历史
        history = self.get_history(session_id)

        # 获取会话的疗法模式
        session_data = db.get_chat_session(session_id)
        therapy_mode = (session_data or {}).get("therapy_mode", "general")

        # 2. 构建消息列表
        system_prompt = get_system_prompt(therapy_mode)
        messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # 3. 调用AI获取回复
        ai_reply = await zhipu_service.chat(messages=messages)

        # 4. 保存用户消息到数据库
        user_msg = db.create_message(
            session_id=session_id,
            role="user",
            content=message,
        )

        # 5. 保存AI回复到数据库
        assistant_msg = db.create_message(
            session_id=session_id,
            role="assistant",
            content=ai_reply,
        )

        # 6. 自动生成会话标题（仅在第一条用户消息时）
        if session_data:
            msg_count = session_data.get("message_count") or 0
            title = session_data.get("title", "新对话")
            if title == "新对话" and msg_count <= 1:
                try:
                    new_title = await self._generate_title(message, ai_reply)
                    db.update_session_title(session_id, new_title)
                except Exception:
                    pass  # 标题生成失败不影响主流程

        # 7. 更新消息计数
        db.increment_message_count(session_id, delta=2)

        return {
            "message_id": user_msg["id"] if user_msg else "",
            "reply": ai_reply,
            "reply_id": assistant_msg["id"] if assistant_msg else "",
            "timestamp": user_msg["created_at"] if user_msg else "",
        }

    # ------------------------------------------------------------------
    # Title generation (private)
    # ------------------------------------------------------------------

    async def _generate_title(self, user_message: str, ai_reply: str) -> str:
        """根据第一条对话内容生成简短标题"""
        title_prompt = f"""根据以下对话内容，生成一个简短的标题（不超过15个字）。
只输出标题本身，不要任何其他内容。

用户：{user_message[:100]}
AI：{ai_reply[:100]}"""

        title = await zhipu_service.chat(
            messages=[{"role": "user", "content": title_prompt}],
        )
        # 清理标题，去掉引号等
        title = title.strip().strip('"').strip("'").strip("《》")
        return title[:15] if title else "新对话"


# 单例实例
chat_service = ChatService()
