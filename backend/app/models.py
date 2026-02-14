# Database models for the application - Supabase PostgreSQL
from sqlalchemy import Column, String, DateTime, Integer, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class ChatSession(Base):
    """Chat session model for tracking user conversations."""
    __tablename__ = "chat_sessions"

    # Primary key using UUID (Supabase format)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Foreign key to User (Supabase auth.users.id is UUID)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    # Session title
    title = Column(String(255), default='新对话')
    # Session timestamps
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    # Emotion tracking
    emotion_summary = Column(JSON, default={})
    # Message count
    message_count = Column(Integer, default=0)


class Message(Base):
    """Message model for storing chat messages."""
    __tablename__ = "messages"

    # Primary key using UUID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Foreign key to ChatSession
    session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    # Message content
    role = Column(String(20), nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    # Emotion analysis result
    emotion = Column(JSON, nullable=True)
    # Timestamp
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class UserProfile(Base):
    """User profile model for storing additional user information."""
    __tablename__ = "user_profiles"

    # Primary key - links to Supabase auth.users
    user_id = Column(UUID(as_uuid=True), primary_key=True)
    # User nickname
    nickname = Column(String(100))
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    # User preferences
    preferences = Column(JSON, default={})
