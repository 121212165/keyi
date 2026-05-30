"""
疗法服务基类
定义所有疗法模块的通用接口
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class TherapyResponse:
    """疗法响应数据类"""

    reply: str
    therapy_mode: str
    metadata: dict = field(default_factory=dict)


class TherapyProtocol(ABC):
    """疗法协议抽象基类"""

    @property
    @abstractmethod
    def mode(self) -> str:
        """疗法模式标识符"""
        ...

    @property
    @abstractmethod
    def system_prompt_name(self) -> str:
        """对应的 system prompt 文件名（不含 .md）"""
        ...

    @abstractmethod
    async def process(
        self,
        session_id: str,
        user_message: str,
        history: list[dict],
    ) -> TherapyResponse:
        """
        处理用户消息，返回疗法响应

        Args:
            session_id: 会话ID
            user_message: 用户消息
            history: 历史消息列表

        Returns:
            TherapyResponse 包含回复和元数据
        """
        ...
