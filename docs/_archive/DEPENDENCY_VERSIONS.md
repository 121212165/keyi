# AI心理医生 - 依赖包版本控制文档

## 版本控制策略

本项目使用严格的依赖版本控制，确保开发、测试和生产环境的一致性。

---

## 后端依赖版本

### 核心框架

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
```

**版本说明:**
- FastAPI 0.104.1: 稳定版本，支持异步操作和自动 API 文档生成
- Uvicorn 0.24.0: ASGI 服务器，支持热重载和 WebSocket
- Pydantic 2.5.0: 数据验证和序列化，支持类型提示

### 数据库

```txt
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pymongo==4.6.0
redis==5.0.1
alembic==1.13.0
```

**版本说明:**
- SQLAlchemy 2.0.23: ORM 框架，支持异步操作
- psycopg2-binary 2.9.9: PostgreSQL 驱动
- PyMongo 4.6.0: MongoDB 驱动
- Redis 5.0.1: Redis 客户端
- Alembic 1.13.0: 数据库迁移工具

### 认证与安全

```txt
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

**版本说明:**
- python-jose 3.3.0: JWT 令牌处理
- passlib 1.7.4: 密码哈希
- python-multipart 0.0.6: 文件上传支持

### AI/ML

```txt
transformers==4.35.2
torch==2.1.1
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.4
openai==1.3.7
anthropic==0.7.8
```

**版本说明:**
- transformers 4.35.2: Hugging Face 模型库
- torch 2.1.1: PyTorch 深度学习框架
- scikit-learn 1.3.2: 机器学习库
- numpy 1.26.2: 数值计算库
- pandas 2.1.4: 数据处理库
- openai 1.3.7: OpenAI API 客户端
- anthropic 0.7.8: Anthropic API 客户端

### 测试

```txt
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pytest-mock==3.12.0
httpx==0.25.2
faker==20.1.0
```

**版本说明:**
- pytest 7.4.3: 测试框架
- pytest-asyncio 0.21.1: 异步测试支持
- pytest-cov 4.1.0: 测试覆盖率
- pytest-mock 3.12.0: Mock 工具
- httpx 0.25.2: HTTP 客户端（测试用）
- faker 20.1.0: 测试数据生成

### 工具

```txt
aiofiles==23.2.1
celery==5.3.4
python-dotenv==1.0.0
```

**版本说明:**
- aiofiles 23.2.1: 异步文件操作
- celery 5.3.4: 异步任务队列
- python-dotenv 1.0.0: 环境变量管理

---

## 前端依赖版本

### 核心框架

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.3"
}
```

**版本说明:**
- React 18.2.0: UI 框架
- TypeScript 5.3.3: 类型系统

### 构建工具

```json
{
  "vite": "^5.0.8",
  "@vitejs/plugin-react": "^4.2.1"
}
```

**版本说明:**
- Vite 5.0.8: 快速构建工具
- @vitejs/plugin-react 4.2.1: React 插件

### UI 组件

```json
{
  "antd": "^5.12.2",
  "@ant-design/icons": "^5.2.6"
}
```

**版本说明:**
- Ant Design 5.12.2: UI 组件库
- @ant-design/icons 5.2.6: 图标库

### 状态管理

```json
{
  "@reduxjs/toolkit": "^2.0.1",
  "react-redux": "^9.0.4"
}
```

**版本说明:**
- Redux Toolkit 2.0.1: 状态管理
- react-redux 9.0.4: React 绑定

### 路由

```json
{
  "react-router-dom": "^6.20.0"
}
```

**版本说明:**
- React Router 6.20.0: 路由管理

### HTTP 客户端

```json
{
  "axios": "^1.6.2"
}
```

**版本说明:**
- Axios 1.6.2: HTTP 客户端

### 工具库

```json
{
  "dayjs": "^1.11.10",
  "recharts": "^2.10.3"
}
```

**版本说明:**
- Day.js 1.11.10: 日期处理
- Recharts 2.10.3: 图表库

### 测试

```json
{
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1",
  "vitest": "^1.0.4",
  "@vitest/ui": "^1.0.4",
  "@vitest/coverage-v8": "^1.0.4",
  "jsdom": "^23.0.1"
}
```

**版本说明:**
- @testing-library/react 14.1.2: React 测试工具
- Vitest 1.0.4: 测试框架
- @vitest/coverage-v8 1.0.4: 测试覆盖率

### 代码质量

```json
{
  "@typescript-eslint/eslint-plugin": "^6.14.0",
  "@typescript-eslint/parser": "^6.14.0",
  "eslint": "^8.55.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.5"
}
```

**版本说明:**
- ESLint 8.55.0: 代码检查
- TypeScript ESLint 6.14.0: TypeScript 支持

---

## 版本更新策略

### 依赖更新流程

1. **评估更新**
   - 检查更新日志
   - 评估兼容性
   - 测试新版本

2. **小版本更新** (x.y.z → x.y.(z+1))
   - 可以直接更新
   - 运行测试验证
   - 提交 PR

3. **次版本更新** (x.y.z → x.(y+1).0)
   - 需要代码审查
   - 完整测试
   - 更新文档

4. **主版本更新** (x.y.z → (x+1).0.0)
   - 需要团队讨论
   - 充分测试
   - 迁移指南

### 安全更新

```bash
# 检查安全漏洞
pip check

# 使用 pip-audit
pip install pip-audit
pip-audit

# 使用 npm audit
npm audit
npm audit fix
```

### 锁定版本

```bash
# 后端 - 生成 requirements.lock
pip freeze > requirements.lock

# 前端 - package-lock.json 已自动生成
npm install
```

---

## 兼容性矩阵

### Python 版本

| Python 版本 | 支持 | 备注 |
|-------------|------|------|
| 3.9 | ✅ | 推荐版本 |
| 3.10 | ✅ | 支持 |
| 3.11 | ✅ | 支持 |
| 3.12 | ⚠️ | 需要测试 |
| 3.8 | ❌ | 不支持 |

### Node.js 版本

| Node.js 版本 | 支持 | 备注 |
|--------------|------|------|
| 18.x | ✅ | 推荐版本 |
| 20.x | ✅ | 支持 |
| 16.x | ⚠️ | 需要测试 |
| 14.x | ❌ | 不支持 |

### 浏览器支持

| 浏览器 | 版本 | 支持 |
|---------|------|------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

---

## 故障排除

### 依赖冲突

```bash
# 后端 - 解决依赖冲突
pip install --upgrade pip
pip install --upgrade setuptools
pip install --force-reinstall -r requirements.txt

# 前端 - 解决依赖冲突
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 版本锁定

```bash
# 后端 - 使用 pip-tools
pip install pip-tools
pip-compile requirements.in

# 前端 - 使用 npm shrinkwrap
npm shrinkwrap
```

---

## 维护计划

### 定期检查

- **每周**: 检查安全更新
- **每月**: 评估依赖更新
- **每季度**: 主版本更新评估

### 更新日志

记录所有依赖更新，包括:
- 更新日期
- 更新原因
- 影响范围
- 测试结果

---

**最后更新**: 2026-02-02
