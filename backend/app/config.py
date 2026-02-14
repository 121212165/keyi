"""
配置管理
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置类，从环境变量中读取配置"""

    # Supabase 配置
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # 智谱 AI 配置 (只用 GLM-4.7-Flash)
    ZHIPU_API_KEY: Optional[str] = None
    ZHIPU_MODEL: str = "glm-4.7-flash"

    # Supabase PostgreSQL 连接字符串 (从环境变量读取或使用默认值)
    SUPABASE_DB_URL: str = ""

    # 安全配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # 环境配置
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    class Config:
        """配置类"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# 立即加载环境变量
settings = Settings(
    _env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
)
