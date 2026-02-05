from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models import Base

# 创建数据库引擎
# pool_pre_ping: 在每次连接前检查连接是否有效
# pool_recycle: 连接在3600秒后自动回收，防止连接过期
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# 创建数据库会话工厂
# autocommit=False: 不自动提交事务
# autoflush=False: 不自动刷新会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# 获取数据库会话的依赖注入函数
# 用于FastAPI的依赖注入系统
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 初始化数据库
# 创建所有定义的表结构
def init_db():
    Base.metadata.create_all(bind=engine)