# 可意AI心理医生 - Agent 工作流规范

## 项目上下文

AI心理健康辅助应用，包含对话系统、情绪识别、心理评估等功能。

---

## MANDATORY: Agent Workflow

每次新的 Agent 会话都必须遵循此工作流程：

### Step 1: Initialize Environment

```bash
# 后端
cd backend
./venv/Scripts/python run.py

# 前端（新终端）
cd frontend
npm run dev
```

**DO NOT skip this step.** 确保服务正常运行后再继续。

### Step 2: Select Next Task

读取 `task.json`，选择**一个**任务来执行。

选择优先级：
1. 优先选择 `passes: false` 的任务
2. 考虑依赖关系，基础功能优先
3. 选择优先级最高的未完成任务

### Step 3: Implement the Task

仔细阅读任务描述和步骤，实现功能。
遵循项目现有代码模式和规范。

### Step 4: Test Thoroughly

#### 大幅度页面修改（新建页面、重写组件、修改核心交互）
- **必须在浏览器中测试！** 使用 Playwright MCP
- 验证页面加载和渲染
- 验证表单、按钮等交互功能
- 截图确认 UI 正确

#### 小幅度代码修改（修复 bug、调整样式）
- 运行后端测试: `cd backend && pytest`
- 运行前端 lint: `cd frontend && npm run lint`
- 如有疑虑，仍建议浏览器测试

#### 所有修改必须通过：
- 后端测试: `pytest` 无错误
- 前端 lint: `npm run lint` 无错误
- 前端构建: `npm run build` 成功
- 浏览器功能验证（UI 相关）

### Step 5: Update Progress

在 `progress.txt` 中记录：

```
## [日期] - Task: [任务标题]

### 完成内容：
- [具体变更]

### 测试方式：
- [如何测试]

### 备注：
- [其他说明]
```

### Step 6: Commit Changes

**重要：所有更改必须在同一个 commit 中提交！**

```bash
git add .
git commit -m "[任务描述] - completed"
```

流程：
1. 更新 `task.json`，将任务的 `passes` 从 `false` 改为 `true`
2. 更新 `progress.txt`
3. 一次性提交所有更改

---

## 阻塞处理

### 需要停止并请求人工介入的情况：

1. **缺少环境配置**
   - .env.local 需要真实 API 密钥
   - Supabase 项目需要创建和配置

2. **外部依赖不可用**
   - 第三方 API 服务宕机
   - 需要人工授权的 OAuth

3. **测试无法进行**
   - 需要真实用户账号
   - 依赖外部系统未部署

### 阻塞时的正确操作：

**禁止：**
- ❌ 提交 git commit
- ❌ 将 passes 设为 true
- ❌ 假装任务完成

**必须：**
- ✅ 在 progress.txt 记录当前进度和阻塞原因
- ✅ 输出清晰的阻塞信息，说明需要人工做什么
- ✅ 停止任务，等待人工介入

### 阻塞信息格式：

```
🚫 任务阻塞 - 需要人工介入

**当前任务**: [任务名称]

**已完成的工作**:
- [已完成的代码]

**阻塞原因**:
- [具体说明为什么无法继续]

**需要人工帮助**:
1. [步骤 1]
2. [步骤 2]

**解除阻塞后**:
- 运行 [命令] 继续任务
```

---

## 核心规则

1. **一次一任务** - 专注完成一个任务
2. **测试后标记** - 所有步骤验证通过后才标记 passes: true
3. **UI 必须浏览器测试** - 新建或大幅修改页面必须在浏览器验证
4. **记录 progress.txt** - 帮助后续 Agent 理解工作
5. **一次一提交** - 代码 + progress.txt + task.json 同时提交
6. **不删任务** - 只能用 false → true
7. **阻塞即停** - 遇阻不假装，记录后停止

---

## 常用命令

```bash
# 后端
cd backend
./venv/Scripts/python run.py      # 启动服务
pytest                             # 运行测试
pytest --cov=app --cov-report=term-missing  # 测试覆盖率

# 前端
cd frontend
npm run dev        # 启动开发服务器
npm run build     # 生产构建
npm run lint      # 运行 linter
```

---

## 项目结构

```
ai-psychologist/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── services/    # 业务逻辑
│   │   ├── main.py      # API 入口
│   │   └── config.py    # 配置
│   ├── tests/           # 测试代码
│   └── requirements.txt
├── frontend/            # React 前端
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # 公共组件
│   │   └── store/      # Redux store
│   └── package.json
├── task.json            # 任务清单
├── progress.txt        # 进度记录
└── CLAUDE.md           # 本文件
```
