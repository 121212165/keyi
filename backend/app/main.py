"""
可意AI心理医生 - 后端API
FastAPI + Supabase Auth + 智谱AI (GLM-4.7-Flash)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, chat, therapy

app = FastAPI(
    title="可意AI心理医生 API",
    description="温暖、专业、有同理心的AI心理健康助手",
    version="1.0.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(chat.chat_router)
app.include_router(chat.ai_router)
app.include_router(therapy.router)


# ============ Health Endpoints ============

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "可意AI心理医生 API",
        "version": "1.0.0",
        "model": "glm-4.7-flash",
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
