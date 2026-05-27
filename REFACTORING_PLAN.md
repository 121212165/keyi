# 可意 AI 心理医生 — 重构计划

> 由 5 位角色（临床心理学家、软件架构师、UX/产品设计师、AI 工程师、项目经理）讨论编写
> 战略方向：先跑通简单有效的疗法链路（CBT 认知疗法 + 脱敏疗法），而不是试图取代心理医生

---

## 目录

1. [核心战略](#1-核心战略)
2. [Phase 0 — 清理与基础建设](#2-phase-0--清理与基础建设)
3. [Phase 1 — CBT 认知疗法 MVP](#3-phase-1--cbt-认知疗法-mvp)
4. [Phase 2 — 脱敏疗法与增强](#4-phase-2--脱敏疗法与增强)
5. [Phase 3 — 打磨与迭代](#5-phase-3--打磨与迭代)
6. [技术架构方案](#6-技术架构方案)
7. [Prompt 策略](#7-prompt-策略)
8. [UX/产品方案](#8-ux产品方案)
9. [风险管理](#9-风险管理)
10. [成功指标](#10-成功指标)

---

## 1. 核心战略

### 做什么

- **CBT 认知行为疗法** — 认知三角识别 + 自动负性思维(ANTs)挑战 + 认知重构
- **系统脱敏疗法** — 焦虑等级构建 + 渐进式暴露 + 放松训练

### 不做什么

- ❌ 不做诊断（不试图取代医生）
- ❌ 不做复杂的状态机
- ❌ 不做知识图谱
- ❌ 不做多模态

### 核心设计原则

> **疗法模式是 chat 之上的一层编排，而不是替代品。**

- 用多套 system prompt 切换代替独立服务模块
- LLM 负责"理解-判断-生成"闭环，后端只做路由和持久化
- 新增一种疗法 = 新增一个 prompt 文件 + 一个轻量 service，不改现有流程

---

## 2. Phase 0 — 清理与基础建设

### 第 0 周（3 天）

#### 废弃代码清理

| 文件 | 操作 |
|------|------|
| `backend/app/services_old/` 全部 8 个文件 | 删除 |
| `tests/test_alert_service.py` | 删除 |
| `tests/test_assessment_service.py` | 删除 |
| `tests/test_emotion_service.py` | 删除 |
| `tests/test_suggestion_service.py` | 删除 |

#### 冗余文档清理

- 保留 3 份：`supabase_schema.sql`、`功能清单.md`（如仍有效）、`MVP简化后端配置指南.md`（如仍有效）
- 其余 11+ 份文档归档或删除（Railway 部署教程、Vercel 部署教程、每日心理汇总灵感文档等已过时）

#### 代码瘦身

- 配置 `.gitignore` 排除构建产物、IDE 配置、缓存目录
- 删除不再使用的 `yarn.lock`（项目使用 npm）

#### BACKLOG: 架构师强烈建议 — 数据库迁移到 SQLite

> 当前 Supabase PostgreSQL 部署门槛高。建议默认使用 SQLite + aiosqlite，保留 PostgreSQL 作为可选。
> - 改动点：`models.py` 中的 `UUID(as_uuid=True)` 改为跨数据库兼容的 `String(36)`
> - `database.py` 默认指向 `sqlite+aiosqlite:///./keyi.db`
> - 如果设置了 `DATABASE_URL=postgresql://...`，自动使用 PostgreSQL
> - **是否立即执行？** 建议在 Phase 0 或 Phase 1 之间决策。

---

## 3. Phase 1 — CBT 认知疗法 MVP

### 目标：跑通一条完整的简易 CBT 链路

| 任务 | 预估工期 | 说明 |
|------|---------|------|
| **P1.1** 路由拆分 | 0.5 天 | 将 main.py 内联路由拆为 `routers/auth.py` + `routers/chat.py` + `routers/therapy.py`，每个 60-80 行 |
| **P1.2** CBT system prompt | 0.5 天 | 新建 `prompts/cbt.md`，包含认知三角框架 + 苏格拉底式提问 + 结构化输出 |
| **P1.3** 疗法模式切换 API | 0.5 天 | `POST /sessions` 增加 `therapy_mode` 参数，存储在 session 中 |
| **P1.4** 疗法服务基类 | 0.5 天 | `therapy_base.py` 定义 `TherapyProtocol` 接口 |
| **P1.5** CBT 前端入口 | 1 天 | 模式切换 UI + CBT 引导界面 |
| **P1.6** 会话标题自动生成 | 0.5 天 | 根据首条对话内容调用 AI 生成标题 |
| **P1.7** 情绪记录器 | 1 天 | 侧边栏底部 emoji 情绪记录 + 7 天趋势图 |

### Phase 1 验证标准

- [ ] 用户选择"CBT 练习"后，AI 严格按照 CBT 框架引导对话
- [ ] 用户可以看到"自动思维识别"、"认知重构中"等阶段标签
- [ ] 端到端测试通过：注册 → 登录 → 创建 CBT 会话 → 发送消息 → 收到结构化回复
- [ ] 后端 `pytest` 全部通过

---

## 4. Phase 2 — 脱敏疗法与增强

| 任务 | 预估工期 | 说明 |
|------|---------|------|
| **P2.1** 脱敏疗法 prompt | 0.5 天 | 焦虑等级构建 + 渐进暴露 + 放松训练引导 |
| **P2.2** 脱敏服务 & API | 0.5 天 | `desensitize_service.py` + `POST /therapy/desensitize/step` |
| **P2.3** 脱敏前端界面 | 2 天 | 焦虑等级列表 + 渐进进展展示 + 呼吸动画引导 |
| **P2.4** 流式响应 SSE | 1.5 天 | 后端 StreamingResponse + 前端 ReadableStream |
| **P2.5** ANTs 自动标记 | 1 天 | 气泡上的"标记"按钮 + 侧边栏 ANTs 记录分组 |
| **P2.6** 认知重构三步引导 | 1 天 | 证据检验 → 替代视角 → 重新归因 |

---

## 5. Phase 3 — 打磨与迭代

| 任务 | 说明 |
|------|------|
| 多模式切换 | 会话中切换疗法模式，保持对话连续性 |
| 危机干预 | `safety_detector.py` 独立模块，双重验证内容安全性 |
| 数据导出 | 用户可导出对话记录 |
| 移动端适配 | 侧边栏抽屉模式 + 宽高比适配 |
| 测试覆盖 | 后端 80%+，前端核心流程 |
| 部署简化 | 清理配置、对齐文档 |

---

## 6. 技术架构方案

### 6.1 后端目录结构（重构后）

```
backend/app/
├── main.py                   # 仅 FastAPI() + include_router
├── config.py                 # 配置（默认 SQLite，可选 PG）
├── database.py               # SQLAlchemy async 引擎
├── models.py                 # ORM 模型
├── schemas.py                # Pydantic 模型
├── routers/
│   ├── auth.py               # POST /register, /login, /logout, /me
│   ├── chat.py               # CRUD /sessions, POST /messages, /history
│   └── therapy.py            # POST /cbt/*, POST /desensitize/*
├── services/
│   ├── auth_service.py       # 认证服务
│   ├── chat_service.py       # 对话核心服务（分发消息到对应疗法）
│   ├── zhipu_service.py      # LLM 网关（保留，精简）
│   ├── therapy_base.py       # TherapyProtocol 接口
│   ├── cbt_service.py        # CBT 流程编排
│   └── desensitize_service.py
├── prompts/
│   ├── __init__.py           # load_prompt(name) 统一入口
│   ├── base_psychologist.md  # 通用心理医生人设
│   ├── cbt.md                # CBT 模式
│   └── desensitize.md        # 脱敏模式
└── safety.py                 # 危机检测独立模块
```

### 6.2 服务层协作模式

```
用户消息
  │
  ▼
chat_service.dispatch(session_id, message, therapy_mode="cbt")
  │
  ├── mode=None → 普通对话（现有流程）
  │
  ├── mode="cbt" → cbt_service.process(session, message)
  │     ├── 维护 CBT 阶段状态
  │     ├── 调用 zhipu_service.chat(..., prompt=CBT_PROMPT)
  │     └── 返回带疗法元数据的回复
  │
  └── mode="desensitize" → desensitize_service.process(session, message)
        ├── 维护暴露层级和焦虑评分
        ├── 调用 zhipu_service.chat(..., prompt=DESENSITIZE_PROMPT)
        └── 返回暴露进度和放松引导
```

### 6.3 System Prompt 管理

```python
# prompts/__init__.py
from functools import lru_cache

@lru_cache(maxsize=10)
def load_prompt(name: str) -> str:
    with open(f"app/prompts/{name}.md", encoding="utf-8") as f:
        return f.read().strip()
```

- 修改 prompt 只需编辑 markdown 文件，无需改代码
- 支持组合：base + cbt_section = 完整 CBT prompt

### 6.4 数据库简化（建议）

默认 SQLite，可选 PostgreSQL：

```python
# config.py
DATABASE_URL: str = "sqlite+aiosqlite:///./keyi.db"  # 默认本地
AUTH_PROVIDER: str = "builtin"   # "builtin" | "supabase" | "none"
```

这样开发环境和单机部署零依赖，需要时无缝切换到 PG。

### 6.5 前端重构

```
frontend/src/components/
├── chat/
│   ├── MessageList.tsx         # 消息列表（从 ChatInterface 拆分）
│   ├── MessageBubble.tsx       # 单条消息气泡
│   ├── ChatInput.tsx           # 输入框
│   └── TypingIndicator.tsx     # 输入指示器
├── sidebar/
│   ├── Sidebar.tsx
│   ├── SessionList.tsx
│   └── SessionItem.tsx
├── therapy/
│   ├── TherapyModeSelector.tsx # 模式切换
│   └── CognitiveTriadForm.tsx  # 认知三角表单
```

Zustand store 拆分：

```
frontend/src/store/
├── index.ts          # 组合导出
├── authSlice.ts      # user, token
├── chatSlice.ts      # sessions, messages
├── therapySlice.ts   # therapyMode, progress
└── uiSlice.ts        # sidebarOpen, loading
```

---

## 7. Prompt 策略

### 7.1 CBT 模式 System Prompt 核心框架

```
【核心框架】你使用认知三角模型（情境-想法-感受-行为）引导用户
【对话节奏】前 2-3 轮建立信任 → 发现 ANT → 温和进入重构
【苏格拉底式提问】
  - 禁止直接反驳用户（"你错了"）
  - 每次最多 1-2 个问题
  - 轮换使用：证据性问题 / 替代视角 / 去灾难化
【结构化回复】共情确认 → 认知探索 → 引导总结
【输出要求】每轮回复末尾附加 JSON 治疗记录
  <THERAPY_RECORD>{"cognitive_distortions":[...],"current_phase":"exploration"}<THERAPY_RECORD>
```

### 7.2 脱敏模式 System Prompt 核心框架

```
【阶段一】引导用户定义具体的恐惧/焦虑目标
【阶段二】收集 5-10 个相关情境，SUD 评分 0-100
【阶段三】渐进暴露：
  - 每次 SUD 提升不超过 10-15 分
  - 暴露前确认用户准备好
  - 暴露后引导放松训练（4-7-8 呼吸法）
【安全停止】用户 SUD > 70 或主动要求停止 → 立即退出到放松模式
```

### 7.3 Prompt 的"三层结构"

每层单独存为 markdown 文件，支持组合加载：

| 层 | 文件 | 内容 |
|----|------|------|
| 通用层 | `base_psychologist.md` | 角色人设、安全规范、伦理准则 |
| 模式层 | `cbt.md` / `desensitize.md` | 疗法特定的对话框架 |
| 指令层 | （嵌入回复中的 JSON 标签） | 治疗记录、情绪标签、安全标记 |

### 7.4 流式响应（Phase 2+）

```python
@app.post("/api/v1/chat/sessions/{id}/messages/stream")
async def send_message_stream(id: str, request: MessageRequest):
    async def event_generator():
        async for chunk in zhipu_service.chat_stream(messages):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

---

## 8. UX/产品方案

### 8.1 模式切换体验

```
┌─────────────────────────────────────┐
│  可意                               │
│  [自由对话] [CBT认知疗法] [系统脱敏]  │
└─────────────────────────────────────┘
```

- 自由对话是默认容器，CBT/脱敏是其上的结构化子模式
- 切换时当前内容自动保存折叠，新模式卡片浮入
- 底部保留"返回自由对话"链接
- 首次进入新模式时弹出三步引导向导

### 8.2 CBT 界面设计

**认知三角记录表单**（输入框上方工具栏按钮触发）：

```
┌─ 记录认知三角 ─────────────────────┐
│ 想法: [当时脑子里闪过了什么念头？]    │
│                                    │
│ 感受: [焦虑] [愤怒] [悲伤] [羞愧]   │
│                                    │
│ 行为: [你当时做了什么？]              │
│                                    │
│ [提交]                              │
└────────────────────────────────────┘
```

**ANTs 标记**：AI 回复气泡右上角小旗帜按钮，点击后高亮，侧边栏新增"ANTs 记录"分组。

### 8.3 脱敏界面设计

**焦虑等级列表**：可排序，每个条目 = 情境描述 + SUD 评分(0-100)

**渐进式暴露进度**：阶梯式进度条
- 灰色 = 未开始
- 蓝色 = 进行中
- 绿色 = 已完成
- 红点 = 放弃

**放松训练**：呼吸动画圆圈（吸气 4s → 屏息 4s → 呼气 6s），可选 30s/1min/2min

**紧急停止按钮**：红色，固定在输入区域左下角，始终可见

### 8.4 情绪可视化

- 侧边栏底部"情绪记录"：5 级 emoji 量表
- 7 天趋势折线图
- 数据存在用户 profile JSON 字段，不与消息内容关联

### 8.5 隐私保护

- 首次加载显示隐私说明横幅
- CBT/脱敏首次进入前弹出隐私确认框
- 对话气泡角落小锁图标
- "导出我的数据" + "删除所有数据"入口

---

## 9. 风险管理

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| 用户误以为是真医生 | 高 | 高 | 反复标注"AI 辅助工具，不能替代专业诊断" |
| 模型能力不足 | 中 | 高 | Prompt 嵌入决策树补偿；准备 fallback 到更强模型 |
| API 费用超支 | 中 | 中 | 设置会话历史窗口上限(最近 20 轮) |
| 敏感话题/危机信号 | 中 | 极高 | 独立 safety_detector，AI 回复前后双重验证 |
| 数据隐私泄露 | 低 | 极高 | Supabase RLS + 认证保护 + 日志脱敏 |
| SSE 连接中断 | 中 | 低 | 前端断线重连 + 消息队列 |

### 危机检测策略

```
Level 1 ─ 立即介入：自杀计划、具体方法、时间地点
  → 提供危机热线，建议前往急诊

Level 2 ─ 高度关注："不想活了"、"活着没意义"
  → 共情确认，温和询问，提供心理热线

Level 3 ─ 常规关注：持续低落但无自伤风险
  → 正常对话，提示专业帮助
```

---

## 10. 成功指标

### 核心指标（MVP 完成需全部满足）

| 指标 | 目标 |
|------|------|
| CBT 链路跑通 | 用户可选 CBT 模式 → 完成一轮结构化对话 → 收到重构建议 |
| 数据持久化 | 对话历史可保存和恢复 |
| 安全检测 | 危机检测已上线并测试通过 |
| 代码质量 | 后端 pytest 全通过 |

### 用户指标（上线后追踪）

| 指标 | 目标 |
|------|------|
| 次日留存率 | > 30% |
| 周活跃会话数 | > 2 次/周 |
| 单次会话时长 | > 5 分钟 |
| 注册→首次CBT转化率 | > 40% |

---

## 附录：Phase 0 快速清理清单

```bash
# 删除废弃代码
rm -rf backend/app/services_old/
rm -f backend/tests/test_alert_service.py
rm -f backend/tests/test_assessment_service.py
rm -f backend/tests/test_emotion_service.py
rm -f backend/tests/test_suggestion_service.py

# 归档冗余文档（只保留 3 份）
mkdir -p docs/_archive && mv docs/!(supabase_schema.sql|功能清单.md|MVP简化后端配置指南.md) docs/_archive/

# 确认清理后测试通过
cd backend && pytest
cd frontend && npm run build
```
