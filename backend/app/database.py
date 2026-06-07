"""
数据库连接管理 - Supabase PostgreSQL (supabase-py client)

This module previously used SQLAlchemy + asyncpg.
It now delegates to app.db which uses the Supabase REST client,
making the app compatible with serverless environments (Vercel).
"""

# Re-export the Supabase client getter so existing imports like
#   from app.database import get_db
# can still be resolved during the transition.
from app.db import get_client  # noqa: F401

# Kept for backwards compatibility with any code that still imports init_db.
# Supabase tables are managed externally (SQL migrations / dashboard).


async def init_db() -> None:
    """No-op: Supabase tables are created externally."""
    pass


# Provide a stub get_db that yields nothing, so any lingering
# Depends(get_db) references fail fast at import time with a clear message.
async def get_db():  # type: ignore[misc]
    """Deprecated stub -- remove all Depends(get_db) usage."""
    raise RuntimeError(
        "get_db() is no longer supported. "
        "Use app.db functions directly instead."
    )
    yield  # make this an async generator for FastAPI Depends compatibility
