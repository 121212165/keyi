"""
Supabase database wrapper - replaces SQLAlchemy for serverless compatibility.

Uses the Supabase Python client (sync) for all database operations.
FastAPI handles sync functions in thread pools automatically.
"""
import uuid
from datetime import datetime
from typing import Any, Optional

from supabase import create_client, Client

from app.config import settings

# ---------------------------------------------------------------------------
# Client initialization
# ---------------------------------------------------------------------------

_client: Optional[Client] = None


def get_client() -> Optional[Client]:
    """Return the Supabase client, creating it on first call.

    Returns None if SUPABASE_URL or SUPABASE_SERVICE_KEY is not configured.
    """
    global _client
    if _client is not None:
        return _client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None

    _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


# ---------------------------------------------------------------------------
# Chat Sessions
# ---------------------------------------------------------------------------

def create_chat_session(
    user_id: str,
    title: str = "新对话",
    therapy_mode: str = "general",
) -> Optional[dict]:
    """Create a new chat session and return its data dict.

    Returns None if Supabase is not configured.
    """
    client = get_client()
    if client is None:
        return None

    now = datetime.utcnow().isoformat()
    payload = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "started_at": now,
        "updated_at": now,
        "emotion_summary": {},
        "message_count": 0,
        "therapy_mode": therapy_mode,
    }
    result = client.table("chat_sessions").insert(payload).execute()
    rows = result.data
    return rows[0] if rows else None


def get_chat_session(session_id: str) -> Optional[dict]:
    """Fetch a single chat session by id."""
    client = get_client()
    if client is None:
        return None

    result = (
        client.table("chat_sessions")
        .select("*")
        .eq("id", session_id)
        .limit(1)
        .execute()
    )
    rows = result.data
    return rows[0] if rows else None


def get_user_sessions(user_id: str) -> list[dict]:
    """Return all sessions for a user, newest first."""
    client = get_client()
    if client is None:
        return []

    result = (
        client.table("chat_sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .execute()
    )
    return result.data or []


def update_session(session_id: str, fields: dict[str, Any]) -> bool:
    """Update arbitrary fields on a chat session. Returns True on success."""
    client = get_client()
    if client is None:
        return False

    fields["updated_at"] = datetime.utcnow().isoformat()
    result = (
        client.table("chat_sessions")
        .update(fields)
        .eq("id", session_id)
        .execute()
    )
    return len(result.data) > 0


def update_session_title(session_id: str, title: str) -> bool:
    """Convenience wrapper to update only the title."""
    return update_session(session_id, {"title": title})


def increment_message_count(session_id: str, delta: int = 2) -> bool:
    """Fetch the current count, then update it by *delta*.

    Supabase REST does not support SQL expressions in UPDATE values,
    so we read-then-write.  This is acceptable for the low-traffic
    server-side use-case.
    """
    client = get_client()
    if client is None:
        return False

    session = get_chat_session(session_id)
    if session is None:
        return False

    current = session.get("message_count") or 0
    return update_session(session_id, {"message_count": current + delta})


def delete_chat_session(session_id: str) -> bool:
    """Delete a session.  Messages with FK cascade are deleted by the DB."""
    client = get_client()
    if client is None:
        return False

    # Delete messages explicitly first (in case cascade is not configured)
    client.table("messages").delete().eq("session_id", session_id).execute()
    result = (
        client.table("chat_sessions")
        .delete()
        .eq("id", session_id)
        .execute()
    )
    return len(result.data) > 0


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

def create_message(
    session_id: str,
    role: str,
    content: str,
    emotion: Optional[dict] = None,
) -> Optional[dict]:
    """Insert a message row and return the inserted data."""
    client = get_client()
    if client is None:
        return None

    payload: dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "created_at": datetime.utcnow().isoformat(),
    }
    if emotion is not None:
        payload["emotion"] = emotion

    result = client.table("messages").insert(payload).execute()
    rows = result.data
    return rows[0] if rows else None


def get_session_messages(session_id: str, limit: int = 50) -> list[dict]:
    """Return messages for a session in chronological order."""
    client = get_client()
    if client is None:
        return []

    result = (
        client.table("messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", desc=False)
        .limit(limit)
        .execute()
    )
    return result.data or []
