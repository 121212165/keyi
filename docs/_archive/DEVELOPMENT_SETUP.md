# AI心理医生 - 开发环境配置指南

## 目录

1. [系统要求](#系统要求)
2. [后端环境配置](#后端环境配置)
3. [前端环境配置](#前端环境配置)
4. [数据库配置](#数据库配置)
5. [测试环境配置](#测试环境配置)
6. [开发工作流](#开发工作流)
7. [常见问题](#常见问题)

---

## 系统要求

### 最低配置
- **操作系统**: Windows 10+, macOS 10.15+, 或 Linux (Ubuntu 20.04+)
- **内存**: 8GB RAM
- **磁盘空间**: 10GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置
- **操作系统**: Windows 11, macOS 12+, 或 Linux (Ubuntu 22.04+)
- **内存**: 16GB RAM
- **磁盘空间**: 20GB 可用空间
- **CPU**: 4核心或更高

---

## 后端环境配置

### 1. 安装 Python

#### Windows
```powershell
# 下载并安装 Python 3.9 或更高版本
# 访问: https://www.python.org/downloads/
# 安装时勾选 "Add Python to PATH"
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install python@3.9

# 或使用 pyenv
brew install pyenv
pyenv install 3.9.18
pyenv global 3.9.18
```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3-pip
```

### 2. 创建虚拟环境

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. 安装依赖

```bash
# 升级 pip
pip install --upgrade pip

# 安装项目依赖
pip install -r requirements.txt

# 或使用 pyproject.toml
pip install -e .
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入实际配置
# 推荐使用 VS Code 或其他编辑器编辑
```

**必需的环境变量:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_psychologist
MONGODB_URL=mongodb://localhost:27017/ai_psychologist
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 5. 启动后端服务

```bash
# 开发模式（支持热重载）
python run.py

# 或使用 uvicorn 直接启动
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

服务将在 `http://localhost:8000` 启动

### 6. 验证后端安装

```bash
# 访问健康检查端点
curl http://localhost:8000/health

# 访问 API 文档
# 打开浏览器访问: http://localhost:8000/docs
```

---

## 前端环境配置

### 1. 安装 Node.js

#### Windows
```powershell
# 下载并安装 Node.js 18 LTS
# 访问: https://nodejs.org/
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install node@18
```

#### Linux (Ubuntu)
```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. 验证安装

```bash
node --version  # 应该显示 v18.x.x
npm --version   # 应该显示 9.x.x 或更高
```

### 3. 安装依赖

```bash
# 进入前端目录
cd frontend

# 安装项目依赖
npm install

# 或使用 yarn
yarn install
```

### 4. 启动前端开发服务器

```bash
# 开发模式（支持热重载）
npm run dev

# 或使用 yarn
yarn dev
```

前端将在 `http://localhost:3000` 启动

### 5. 验证前端安装

打开浏览器访问 `http://localhost:3000`，应该能看到 AI心理医生的主界面

---

## 数据库配置

### PostgreSQL

#### 安装 PostgreSQL

**Windows:**
```powershell
# 下载并安装 PostgreSQL
# 访问: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 创建数据库

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库和用户
CREATE DATABASE ai_psychologist;
CREATE USER ai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_psychologist TO ai_user;
\q
```

### MongoDB

#### 安装 MongoDB

**Windows:**
```powershell
# 下载并安装 MongoDB Community Server
# 访问: https://www.mongodb.com/try/download/community
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# 导入 MongoDB 公钥
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# 添加 MongoDB 仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# 安装 MongoDB
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

### Redis

#### 安装 Redis

**Windows:**
```powershell
# 使用 WSL 或 Docker
# 或下载 Redis for Windows
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu):**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

---

## 测试环境配置

### 后端测试

```bash
# 进入后端目录
cd backend

# 激活虚拟环境
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# 运行所有测试
pytest

# 运行特定标记的测试
pytest -m unit          # 只运行单元测试
pytest -m integration    # 只运行集成测试
pytest -m emotion       # 只运行情绪识别测试

# 运行测试并生成覆盖率报告
pytest --cov=app --cov-report=html

# 查看覆盖率报告
# 打开 htmlcov/index.html
```

### 前端测试

```bash
# 进入前端目录
cd frontend

# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看覆盖率报告
# 打开 coverage/index.html
```

### 使用测试脚本

**Windows:**
```bash
# 运行后端测试
scripts\run_tests.bat

# 运行前端测试
scripts\run_frontend_tests.bat
```

**Linux/macOS:**
```bash
# 运行后端测试
chmod +x scripts/run_tests.sh
./scripts/run_tests.sh

# 运行前端测试
chmod +x scripts/run_frontend_tests.sh
./scripts/run_frontend_tests.sh
```

---

## 开发工作流

### 1. TDD 开发流程

```bash
# 步骤 1: 编写测试用例
# 在 tests/ 目录下创建或修改测试文件

# 步骤 2: 运行测试（应该失败）
pytest tests/test_new_feature.py -v

# 步骤 3: 实现功能代码
# 在 app/ 目录下实现功能

# 步骤 4: 运行测试（应该通过）
pytest tests/test_new_feature.py -v

# 步骤 5: 检查覆盖率
pytest --cov=app --cov-report=term-missing

# 步骤 6: 提交代码
git add .
git commit -m "feat: implement new feature"
```

### 2. 代码质量检查

```bash
# 后端代码格式化
black app tests

# 后端代码排序
isort app tests

# 后端代码检查
flake8 app tests

# 后端类型检查
mypy app

# 前端代码检查
npm run lint

# 前端代码格式化
npm run format
```

### 3. 运行完整测试套件

```bash
# 后端
pytest --cov=app --cov-report=html --cov-report=xml

# 前端
npm run test:coverage

# 生成测试报告
python scripts/generate_test_report.py
```

---

## 常见问题

### 问题 1: Python 虚拟环境激活失败

**Windows:**
```powershell
# 检查执行策略
Get-ExecutionPolicy

# 如果是 Restricted，更改为 RemoteSigned
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 问题 2: npm install 失败

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 3: 数据库连接失败

```bash
# 检查数据库服务是否运行

# PostgreSQL
sudo systemctl status postgresql

# MongoDB
sudo systemctl status mongod

# Redis
sudo systemctl status redis

# 检查端口是否被占用
netstat -an | grep 5432  # PostgreSQL
netstat -an | grep 27017  # MongoDB
netstat -an | grep 6379   # Redis
```

### 问题 4: 测试失败

```bash
# 查看详细错误信息
pytest -v --tb=long

# 只运行失败的测试
pytest --lf

# 进入调试模式
pytest --pdb
```

### 问题 5: 端口被占用

```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :8000

# Linux/macOS
lsof -i :8000

# 终止进程
# Windows
taskkill /PID <PID> /F

# Linux/macOS
kill -9 <PID>
```

---

## 依赖包版本信息

### 后端主要依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| fastapi | 0.104.1 | Web 框架 |
| uvicorn | 0.24.0 | ASGI 服务器 |
| sqlalchemy | 2.0.23 | ORM |
| psycopg2-binary | 2.9.9 | PostgreSQL 驱动 |
| pymongo | 4.6.0 | MongoDB 驱动 |
| redis | 5.0.1 | Redis 客户端 |
| pydantic | 2.5.0 | 数据验证 |
| pytest | 7.4.3 | 测试框架 |
| pytest-cov | 4.1.0 | 测试覆盖率 |

### 前端主要依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| react | 18.2.0 | UI 框架 |
| typescript | 5.3.3 | 类型系统 |
| antd | 5.12.2 | UI 组件库 |
| @reduxjs/toolkit | 2.0.1 | 状态管理 |
| axios | 1.6.2 | HTTP 客户端 |
| vitest | 1.0.4 | 测试框架 |
| @vitest/coverage-v8 | 1.0.4 | 测试覆盖率 |

---

## 获取帮助

- **文档**: 查看项目 README.md
- **问题反馈**: 提交 GitHub Issue
- **技术支持**: 联系开发团队

---

**最后更新**: 2026-02-02
