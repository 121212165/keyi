"""
对话服务模块 - Supabase PostgreSQL
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import UUID
from app.models import ChatSession, Message
from app.services.zhipu_service import zhipu_service, PSYCHOLOGIST_SYSTEM_PROMPT


class ChatService:
    """对话服务类"""

    def __init__(self):
        pass

    async def create_session(self, user_id: str, db: AsyncSession) -> str:
        """创建新对话会话"""
        session = ChatSession(
            id=uuid.uuid4(),
            user_id=uuid.UUID(user_id),  # 转换为 UUID
            title='新对话',
            started_at=datetime.utcnow(),
            message_count=0,
        )
        db.add(session)
        await db.commit()
        return str(session.id)

    async def send_message(
        self,
        session_id: str,
        user_id: str,
        message: str,
        db: AsyncSession,
    ) -> dict:
        """
        发送消息，获取AI回复

        Args:
            session_id: 会话ID
            user_id: 用户ID
            message: 用户消息
            db: 数据库会话

        Returns:
            包含消息和AI回复的字典
        """
        # 1. 获取会话历史
        history = await self.get_history(session_id, db)

        # 2. 构建消息列表
        messages = [
            {"role": "system", "content": PSYCHOLOGIST_SYSTEM_PROMPT}
        ]

        # 添加历史消息
        for msg in history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # 3. 调用智谱AI获取回复
        ai_reply = await zhipu_service.chat(messages=messages)

        # 4. 保存用户消息到数据库
        user_msg = Message(
            id=uuid.uuid4(),
            session_id=uuid.UUID(session_id),
            role="user",
            content=message,
            created_at=datetime.utcnow(),
        )
        db.add(user_msg)

        # 5. 保存AI回复到数据库
        assistant_msg = Message(
            id=uuid.uuid4(),
            session_id=uuid.UUID(session_id),
            role="assistant",
            content=ai_reply,
            created_at=datetime.utcnow(),
        )
        db.add(assistant_msg)

        # 6. 更新会话信息
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()

        if session:
            session.message_count += 2
            session.updated_at = datetime.utcnow()

        await db.commit()

        return {
            "message_id": str(user_msg.id),
            "reply": ai_reply,
            "reply_id": str(assistant_msg.id),
            "timestamp": user_msg.created_at.isoformat(),
        }

    async def get_history(
        self,
        session_id: str,
        db: AsyncSession,
        limit: int = 50,
    ) -> List[dict]:
        """
        获取会话历史

        Args:
            session_id: 会话ID
            db: 数据库会话
            limit: 最大消息数量

        Returns:
            消息列表
        """
        result = await db.execute(
            select(Message)
            .where(Message.session_id == uuid.UUID(session_id))
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        messages = result.scalars().all()

        return [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat(),
                "emotion": msg.emotion,
            }
            for msg in messages
        ]

    async def get_sessions(
        self,
        user_id: str,
        db: AsyncSession,
    ) -> List[dict]:
        """
        获取用户的所有会话

        Args:
            user_id: 用户ID
            db: 数据库会话

        Returns:
            会话列表
        """
        result = await db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == uuid.UUID(user_id))
            .order_by(ChatSession.started_at.desc())
        )
        sessions = result.scalars().all()

        return [
            {
                "id": str(session.id),
                "title": session.title,
                "started_at": session.started_at.isoformat(),
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
                "message_count": session.message_count or 0,
            }
            for session in sessions
        ]

    async def delete_session(
        self,
        session_id: str,
        db: AsyncSession,
    ) -> bool:
        """
        删除会话及所有消息 (级联删除由数据库处理)

        Args:
            session_id: 会话ID
            db: 数据库会话

        Returns:
            是否成功
        """
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()

        if session:
            await db.delete(session)
            await db.commit()
            return True

        return False

    async def update_session_title(
        self,
        session_id: str,
        title: str,
        db: AsyncSession,
    ) -> bool:
        """更新会话标题"""
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()

        if session:
            session.title = title
            await db.commit()
            return True

        return False


# 单例实例
chat_service = ChatService()
