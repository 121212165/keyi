from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置类，从环境变量中读取配置"""
    DATABASE_URL: str  # 数据库连接URL
    MONGODB_URL: str  # MongoDB连接URL
    REDIS_URL: str  # Redis连接URL
    SECRET_KEY: str  # JWT密钥
    ALGORITHM: str = "HS256"  # JWT加密算法
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 访问令牌过期时间（分钟）
    OPENAI_API_KEY: Optional[str] = None  # OpenAI API密钥
    ANTHROPIC_API_KEY: Optional[str] = None  # Anthropic API密钥
    ENVIRONMENT: str = "development"  # 运行环境
    LOG_LEVEL: str = "INFO"  # 日志级别

    class Config:
        """配置类"""
        env_file = ".env"  # 环境变量文件路径


settings = Settings()  # 创建配置实例