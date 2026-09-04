"""
Vercel Serverless 入口 - 将 FastAPI 包装为 Serverless Function
"""
from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
