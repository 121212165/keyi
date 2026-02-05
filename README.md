# AI心理医生 MVP - 项目总览

## 项目简介

AI心理医生是一款基于人工智能技术的心理健康辅助应用，旨在为用户提供基础的心理咨询对话服务。本项目采用测试驱动开发（TDD）方法论，确保代码质量和功能稳定性。

---

## 技术栈

### 后端
- **语言**: Python 3.9+
- **框架**: FastAPI
- **数据库**: PostgreSQL, MongoDB, Redis
- **测试**: pytest, pytest-cov, pytest-asyncio

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design 5
- **构建工具**: Vite
- **测试**: Vitest, @testing-library/react

---

## 项目结构

```
ai-psychologist/
├── backend/                    # 后端代码
│   ├── app/
│   │   ├── services/          # 业务逻辑服务
│   │   │   ├── emotion_service.py      # 情绪识别引擎
│   │   │   ├── assessment_service.py   # 心理评估模块
│   │   │   ├── suggestion_service.py   # 应对建议生成
│   │   │   └── alert_service.py       # 安全预警机制
│   │   ├── schemas.py          # 数据模型
│   │   ├── config.py          # 配置管理
│   │   └── main.py           # FastAPI 应用入口
│   ├── tests/                # 测试代码
│   │   ├── test_emotion_service.py
│   │   ├── test_assessment_service.py
│   │   ├── test_suggestion_service.py
│   │   ├── test_alert_service.py
│   │   └── test_chat_api.py
│   ├── requirements.txt       # Python 依赖
│   ├── pytest.ini           # pytest 配置
│   ├── .coveragerc         # coverage 配置
│   └── run.py              # 启动脚本
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   │   ├── ChatPage.tsx
│   │   │   ├── AssessmentPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── test/           # 前端测试
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json        # Node.js 依赖
│   ├── vite.config.ts     # Vite 配置
│   └── tsconfig.json      # TypeScript 配置
├── scripts/               # 自动化脚本
│   ├── run_tests.sh       # 运行后端测试 (Linux/macOS)
│   ├── run_tests.bat      # 运行后端测试 (Windows)
│   ├── run_frontend_tests.sh    # 运行前端测试 (Linux/macOS)
│   ├── run_frontend_tests.bat   # 运行前端测试 (Windows)
│   ├── generate_test_report.py # 生成测试报告
│   └── task_manager.py    # 任务管理工具
├── docs/                 # 文档
│   ├── DEVELOPMENT_SETUP.md      # 开发环境配置指南
│   ├── DEPENDENCY_VERSIONS.md   # 依赖包版本控制
│   ├── TASK_DIFFICULTY_GUIDELINES.md  # 任务难度分类指南
│   └── ISSUE_TEMPLATE.md        # 高难度问题文档模板
├── .trae/                # 项目管理
│   └── tasks/           # 任务跟踪
│       ├── templates/      # 任务模板
│       ├── active/         # 进行中的任务
│       ├── completed/      # 已完成的任务
│       └── archived/      # 已归档的任务
├── knowledge-base/        # 知识库
│   ├── by-module/       # 按模块组织
│   ├── by-difficulty/  # 按难度组织
│   ├── by-category/     # 按类别组织
│   ├── examples/        # 示例文档
│   └── index.json      # 知识库索引
└── .github/
    └── workflows/
        └── ci.yml         # CI/CD 配置
```

---

## 核心功能模块

### 1. 对话交互系统
- 自然语言对话界面
- 多轮对话支持（至少10轮）
- 实时情绪分析
- 对话历史管理

### 2. 情绪识别引擎
- 识别6种基本情绪（喜悦、愤怒、悲伤、恐惧、厌恶、惊讶）
- 识别常见复合情绪（焦虑、抑郁、孤独、内疚等）
- 判断情绪强度（轻微、中等、强烈）
- 准确率要求：基本情绪 ≥85%，复合情绪 ≥75%

### 3. 心理评估模块
- PHQ-9 抑郁症状评估
- GAD-7 焦虑症状评估
- PSS-10 压力水平评估
- 自动计算得分和等级
- 生成评估报告

### 4. 应对建议生成
- 情绪调节建议（深呼吸、正念冥想等）
- 认知调整建议（认知重构、积极自我对话等）
- 行为激活建议（适度运动、社交活动等）
- 压力管理建议（时间管理、优先级排序等）

### 5. 安全预警机制
- 识别高危关键词（自杀、自伤等）
- 三级预警系统
- 提供危机干预资源
- 危机识别召回率 ≥95%

---

## TDD 开发流程

### 1. 编写测试用例
```bash
# 在 tests/ 目录下创建测试文件
# 编写测试用例，描述期望的行为
```

### 2. 运行测试（预期失败）
```bash
pytest tests/test_new_feature.py -v
```

### 3. 实现功能代码
```bash
# 在 app/ 目录下实现功能
# 使测试通过
```

### 4. 运行测试（预期通过）
```bash
pytest tests/test_new_feature.py -v
```

### 5. 检查覆盖率
```bash
pytest --cov=app --cov-report=term-missing
```

### 6. 重构和优化
```bash
# 在保持测试通过的前提下优化代码
```

---

## 测试覆盖情况

### 后端测试
- **情绪识别引擎**: 13个测试用例
- **心理评估模块**: 20个测试用例
- **应对建议生成**: 15个测试用例
- **安全预警机制**: 15个测试用例
- **对话交互系统**: 8个测试用例
- **总计**: 71个测试用例

### 前端测试
- 待实现

### 目标覆盖率
- **单元测试覆盖率**: ≥80%
- **核心模块覆盖率**: ≥90%
- **集成测试覆盖率**: 100%

---

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6.0+
- Redis 7.0+

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-psychologist
```

#### 2. 配置后端
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

#### 3. 配置前端
```bash
cd frontend
npm install
```

#### 4. 启动服务

**后端:**
```bash
cd backend
python run.py
```

**前端:**
```bash
cd frontend
npm run dev
```

#### 5. 运行测试

**后端测试:**
```bash
cd backend
pytest --cov=app --cov-report=html
```

**前端测试:**
```bash
cd frontend
npm run test:coverage
```

---

## 文档

- [开发环境配置指南](docs/DEVELOPMENT_SETUP.md)
- [依赖包版本控制](docs/DEPENDENCY_VERSIONS.md)
- [任务难度分类指南](docs/TASK_DIFFICULTY_GUIDELINES.md)
- [问题文档模板](docs/ISSUE_TEMPLATE.md)
- [任务管理指南](docs/TASK_MANAGEMENT_GUIDE.md)
- [需求规格文档](AI心理医生MVP需求规格文档.md)

---

## 任务管理与知识库

### 任务难度分类

项目采用三级难度分类系统（低/中/高），基于以下标准：

- **技术复杂度**: 涉及的模块数量、技术难度
- **依赖关系**: 外部依赖数量和复杂度
- **实现时间**: 预估完成时间
- **风险等级**: 对系统的影响程度

详见 [任务难度分类指南](docs/TASK_DIFFICULTY_GUIDELINES.md)

### 任务跟踪

使用 `.trae/tasks/` 目录跟踪所有开发任务：

- **templates/**: 任务模板（低/中/高难度）
- **active/**: 进行中的任务
- **completed/**: 已完成的任务
- **archived/**: 已归档的任务

### 知识库

`knowledge-base/` 目录存储高难度问题的详细文档：

- **by-module/**: 按系统模块组织
- **by-difficulty/**: 按难度级别组织
- **by-category/**: 按问题类别组织
- **examples/**: 示例文档和模板
- **index.json**: 可搜索的知识库索引

所有高难度任务必须在知识库中创建相应的文档条目。

### 任务管理工具

使用 `scripts/task_manager.py` 工具管理任务和知识库：

```bash
# 创建新任务
python scripts/task_manager.py create-task --title "添加用户认证" --difficulty high --priority high

# 评估任务难度
python scripts/task_manager.py assess --modules 4 --dependencies 7 --hours 20 --research-needed --risk high

# 列出所有任务
python scripts/task_manager.py list-tasks --status all

# 添加知识库条目
python scripts/task_manager.py add-kb-entry --issue-id ISSUE_001 --title "聊天服务内存泄漏" --module chat --difficulty high --category bugs --severity critical

# 搜索知识库
python scripts/task_manager.py search-kb --query "情绪检测"
```

详见 [任务管理指南](docs/TASK_MANAGEMENT_GUIDE.md)

---

## 开发规范

### 代码风格
- **后端**: 遵循 PEP 8，使用 Black 格式化
- **前端**: 遵循 ESLint 规则，使用 Prettier 格式化

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 分支策略
- `main`: 生产环境
- `develop`: 开发环境
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支

---

## CI/CD

项目使用 GitHub Actions 进行持续集成和持续部署：

- **自动测试**: 每次 push 和 PR 自动运行测试
- **代码检查**: 自动运行 lint 和类型检查
- **覆盖率报告**: 自动生成并上传覆盖率报告
- **多版本测试**: 支持 Python 3.9, 3.10, 3.11

---

## 性能指标

### 响应时间要求
- 对话响应时间: < 3秒
- 评估提交响应: < 2秒
- 页面加载时间: < 2秒
- API响应时间: < 500ms
- 情绪识别延迟: < 1秒

### 准确率指标
- 基本情绪识别准确率: ≥85%
- 复合情绪识别准确率: ≥75%
- 对话意图识别准确率: ≥80%
- 评估结果一致性: ≥90%
- 危机识别召回率: ≥95%

### 并发处理能力
- 同时在线用户数: ≥10,000
- 峰值QPS: ≥1,000
- 数据库连接池: ≥100
- 缓存命中率: ≥80%

---

## 安全与隐私

### 数据安全
- HTTPS 加密传输
- 数据库加密存储
- 敏感字段 AES-256 加密
- 密钥定期轮换

### 用户隐私
- 匿名用户ID
- 最小化数据收集
- 用户数据删除功能
- 访问控制机制

### 合规要求
- 等保三级合规
- 符合《个人信息保护法》
- 符合《网络安全法》
- 符合《精神卫生法》

---

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目采用 MIT 许可证。

---

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: [team@example.com]

---

**最后更新**: 2026-02-02
