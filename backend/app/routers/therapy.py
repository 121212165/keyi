"""
疗法路由模块
Phase 1 将实现 CBT 认知疗法
Phase 2 将实现系统脱敏疗法
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/therapy", tags=["therapy"])


@router.get("/modes")
async def get_therapy_modes():
    """获取可用的疗法模式列表"""
    return {
        "modes": [
            {"id": "general", "name": "自由对话", "description": "普通的支持性对话"},
            {"id": "cbt", "name": "CBT认知疗法", "description": "认知行为疗法，帮助识别和改变负性思维模式"},
            {"id": "desensitize", "name": "系统脱敏", "description": "通过渐进式暴露克服特定恐惧或焦虑"},
        ]
    }
