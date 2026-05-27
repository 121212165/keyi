"""
System Prompt 管理模块
从 markdown 文件加载提示词模板
"""
import os
from functools import lru_cache


@lru_cache(maxsize=10)
def load_prompt(name: str) -> str:
    """
    加载指定名称的提示词文件

    Args:
        name: 提示词文件名（不含 .md 扩展名）

    Returns:
        提示词内容
    """
    prompt_dir = os.path.dirname(__file__)
    path = os.path.join(prompt_dir, f"{name}.md")
    with open(path, encoding="utf-8") as f:
        return f.read().strip()


def get_system_prompt(mode: str = "general") -> str:
    """
    根据疗法模式获取完整的 system prompt

    Args:
        mode: 疗法模式 (general | cbt | desensitize)

    Returns:
        完整的 system prompt
    """
    base = load_prompt("base_psychologist")

    if mode == "cbt":
        return base + "\n\n" + load_prompt("cbt")
    elif mode == "desensitize":
        return base + "\n\n" + load_prompt("desensitize")
    else:
        return base
