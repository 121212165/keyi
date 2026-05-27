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

    # LLM 配置（默认使用小米 MiMo）
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "mimo-v2.5-pro"
    LLM_BASE_URL: str = "https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages"
    LLM_PROVIDER: str = "anthropic"  # "anthropic" | "openai" | "zhipu"

    # 兼容旧配置（智谱AI）
    ZHIPU_API_KEY: Optional[str] = None
    ZHIPU_MODEL: str = "glm-4.7-flash"

    # Supabase PostgreSQL 连接字符串
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
