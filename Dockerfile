FROM python:3.11-slim

WORKDIR /app

# 只复制并安装后端依赖
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 复制后端代码
COPY backend/ /app

# 兼容 Railway 的动态端口
ENV PORT=8000

# 启动 FastAPI（使用 $PORT，如未提供则默认 8000）
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
