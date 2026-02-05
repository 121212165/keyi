# Database models for the application
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

Base = declarative_base()


class User(Base):
    """User model for storing user information and preferences."""
    __tablename__ = "users"

    # Primary key using UUID
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Anonymous identifier for privacy
    anonymous_id = Column(String(64), unique=True, nullable=False, index=True)
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow)
    # User settings and risk assessment
    preferences = Column(JSON, default={})
    risk_level = Column(String(20), default="low")


class ChatSession(Base):
    """Chat session model for tracking user conversations."""
    __tablename__ = "chat_sessions"

    # Primary key using UUID
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Foreign key to User
    user_id = Column(String, nullable=False, index=True)
    # Session timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    # Emotion tracking and risk assessment
    emotion_summary = Column(JSON, default={})
    risk_flag = Column(Boolean, default=False)


class Assessment(Base):
    """Assessment model for storing mental health assessment results."""
    __tablename__ = "assessments"

    # Primary key using UUID
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Foreign key to User
    user_id = Column(String, nullable=False, index=True)
    # Assessment details
    scale_type = Column(String(20), nullable=False)
    score = Column(Integer, nullable=False)
    level = Column(String(20), nullable=False)
    # Timestamp and response data
    completed_at = Column(DateTime, default=datetime.utcnow)
    answers = Column(JSON, nullable=False)


class Alert(Base):
    """Alert model for tracking risk alerts and interventions."""
    __tablename__ = "alerts"

    # Primary key using UUID
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Foreign key to User
    user_id = Column(String, nullable=False, index=True)
    # Alert details
    level = Column(String(20), nullable=False)
    trigger_reason = Column(String, nullable=True)
    # Timestamps and resolution
    triggered_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    # Support resources provided
    resources_provided = Column(JSON, default=[])