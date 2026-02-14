from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置类，从环境变量中读取配置"""
    # Supabase配置（主要数据库）
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # AI API配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    ANTHROPIC_API_KEY: Optional[str] = None
    ZHIPU_API_KEY: Optional[str] = None

    # 安全配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

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