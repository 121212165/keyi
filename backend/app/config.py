from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置类，从环境变量中读取配置"""
    DATABASE_URL: Optional[str] = None  # 数据库连接URL
    MONGODB_URL: Optional[str] = None  # MongoDB连接URL
    REDIS_URL: Optional[str] = None  # Redis连接URL
    SECRET_KEY: str = "your-secret-key-here"  # JWT密钥
    ALGORITHM: str = "HS256"  # JWT加密算法
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 访问令牌过期时间（分钟）
    OPENAI_API_KEY: Optional[str] = None  # OpenAI API密钥
    OPENAI_MODEL: str = "gpt-3.5-turbo"  # OpenAI模型
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"  # OpenAI API地址
    ANTHROPIC_API_KEY: Optional[str] = None  # Anthropic API密钥
    ENVIRONMENT: str = "development"  # 运行环境
    LOG_LEVEL: str = "INFO"  # 日志级别

    class Config:
        """配置类"""
        env_file = ".env"  # 环境变量文件路径


settings = Settings()  # 创建配置实例