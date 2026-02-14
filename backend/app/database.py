"""
数据库连接管理 - Supabase PostgreSQL
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# PostgreSQL 异步引擎 (Supabase)
def get_database_url() -> str:
    """获取数据库连接 URL"""
    db_url = settings.SUPABASE_DB_URL or ""

    if not db_url:
        return ""

    # 确保使用 asyncpg 驱动
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    return db_url

# 创建异步数据库引擎
DATABASE_URL = get_database_url()

if DATABASE_URL:
    engine = create_async_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=settings.LOG_LEVEL == "DEBUG",
    )
else:
    engine = None

# 创建异步会话工厂
AsyncSessionLocal = None
if engine:
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )

# 基础类
Base = declarative_base()


# 获取数据库会话的依赖注入函数
async def get_db():
    """获取数据库会话"""
    if not AsyncSessionLocal:
        raise RuntimeError("数据库未配置，请设置 SUPABASE_DB_URL 环境变量")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# 初始化数据库
async def init_db():
    """初始化数据库表 (仅用于 SQLite，Supabase 需要手动执行 SQL)"""
    if not engine:
        print("Supabase 模式：表结构已通过 SQL 脚本创建，无需此处初始化")
        return
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
