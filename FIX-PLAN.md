# 林序(keyi) Bug Fix Plan — 新窗口执行指南

## 项目概况

- **仓库**: `https://github.com/121212165/keyi`
- **本地路径**: `C:\Users\lenovo\keyi`
- **生产域名**: `https://565736.xyz` (Vercel)
- **技术栈**: Next.js 16 (App Router) + Tailwind v4 + Zustand + Supabase (Auth + DB) + 小米 MiMo LLM (Anthropic 兼容 API)
- **架构**: 前后端一体，Next.js API Routes 既做前端也做后端（`frontend/src/app/api/v1/`）

## 关键文件结构

```
frontend/src/
├── app/
│   ├── api/v1/
│   │   ├── auth/login/route.ts      # 登录
│   │   ├── auth/register/route.ts   # 注册
│   │   ├── chat/sessions/route.ts   # 会话 CRUD (GET/POST)
│   │   ├── chat/sessions/[id]/messages/stream/route.ts  # 流式聊天（已有，未使用）
│   │   ├── chat/sessions/[id]/history/route.ts          # 历史消息
│   │   └── ai/chat/route.ts         # 非流式聊天（当前使用，有多个 bug）
│   ├── globals.css                  # 设计令牌（已改为 warm-editorial）
│   ├── layout.tsx                   # 全局布局
│   └── page.tsx                     # 入口页
├── components/
│   ├── ChatInterface.tsx            # 主聊天界面（最大 bug 集中地）
│   ├── AuthForm.tsx                 # 登录表单
│   ├── sidebar/Sidebar.tsx          # 侧边栏
│   ├── sidebar/SessionItem.tsx      # 会话项
│   ├── chat/MessageBubble.tsx       # 消息气泡
│   ├── chat/MessageList.tsx         # 消息列表
│   ├── chat/ChatInput.tsx           # 输入框
│   └── therapy/                     # 治疗组件
├── lib/
│   ├── api.ts                       # Axios API 客户端（含 sendMessageStream，未使用）
│   ├── prompts.ts                   # AI 系统提示词（林序品牌）
│   └── supabase.ts                  # Supabase 客户端
└── store/index.ts                   # Zustand 状态管理
```

## Bug 清单（共 6 个，按优先级排序）

### Bug 1: 401 认证失败 — JWT 过期无刷新

**现象**: 创建会话返回 401
**根因**: 登录后只存了 `access_token`，没存 `refresh_token`。Supabase JWT 默认 1 小时过期。用户下次打开页面时 `restoreUser()` 从 localStorage 恢复的是过期 token。
**文件**:
- `components/AuthForm.tsx` ~line 50: 只存 `access_token`，丢弃了 `refresh_token`
- `store/index.ts` ~line 58-67: 没有 `refresh_token` 字段，没有刷新逻辑

**修复方案**:
1. `AuthForm.tsx`: 同时保存 `refresh_token`
2. `store/index.ts`: 增加 `refreshToken` 字段
3. 在 `lib/supabase.ts` 或新增 `lib/auth.ts` 中添加 token 刷新逻辑：在 API 请求前检查 token 是否即将过期，过期则用 `refresh_token` 换新 token

### Bug 2: 会话创建后 UI 不更新 — 响应字段名不匹配

**现象**: 会话实际创建成功了但侧边栏看不到
**根因**: `sessions/route.ts` POST 返回 `{ session_id: "..." }` 但 `ChatInterface.tsx` 期望 `res.data.id`
**文件**:
- `app/api/v1/chat/sessions/route.ts` ~line 45: 返回 `session_id`
- `components/ChatInterface.tsx` ~line 84: 读取 `res.data.id`

**修复方案**: 改 `route.ts` 返回 `{ id: sessionId, therapy_mode: therapyMode }`

### Bug 3: 侧边栏会话列表为空 — 响应格式不匹配

**现象**: 登录后侧边栏没有历史会话
**根因**: `sessions/route.ts` GET 返回 `{ sessions: [...] }` 但 `ChatInterface.tsx` ~line 64 做 `Array.isArray(res.data)` 判断，`res.data` 是对象不是数组
**文件**:
- `app/api/v1/chat/sessions/route.ts` ~line 82: 返回 `{ sessions: [...] }`
- `components/ChatInterface.tsx` ~line 64: `Array.isArray(res.data)` 永远为 false

**修复方案**: 改 `loadSessions` 为 `res.data.sessions`，或改 API 返回裸数组

### Bug 4: AI 响应慢 + 没有上下文 + 治疗模式不生效（一石三鸟）

**现象**: AI 回复慢、不记得之前的对话、CBT/脱敏模式无效
**根因**: `ChatInterface.tsx` 的 `handleSend` 调用 `/api/v1/ai/chat`（非流式），而这个端点：
- 不传历史消息（只发当前一条）
- 不读取 therapy_mode（硬编码 `'general'`）
- 不支持流式输出（用户等到全部生成完才看到）

**已有解决方案**: 流式端点 `chat/sessions/[id]/messages/stream/route.ts` 已经实现了：
- 加载最近 50 条历史消息
- 从 session 读取 therapy_mode 选择对应 system prompt
- SSE 流式输出

**修复方案**: 重写 `ChatInterface.tsx` 的 `handleSend`，改用流式端点：
```ts
const handleSend = async (content: string) => {
  if (!currentSessionId) await handleCreateSession();
  // 先创建 session（如果还没有）
  // 然后调用流式端点
  const response = await fetch(`/api/v1/chat/sessions/${currentSessionId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ message: content }),
  });

  // 解析 SSE 流，逐字显示
  const reader = response.body.getReader();
  // ... 解析 data: 行，增量更新消息
};
```

### Bug 5: 历史消息加载失败 — 响应格式不匹配

**现象**: 点击侧边栏会话不显示历史消息
**根因**: `history/route.ts` 返回 `{ messages: [...] }` 但 `ChatInterface.tsx` ~line 73 做 `Array.isArray(res.data)`
**文件**:
- `app/api/v1/chat/sessions/[id]/history/route.ts` ~line 57
- `components/ChatInterface.tsx` ~line 73

**修复方案**: 改 `loadSessionHistory` 为 `res.data.messages`

### Bug 6: 非流式 AI 端点有多处问题（可选修复）

**文件**: `app/api/v1/ai/chat/route.ts`
- line 20: `buildSystemPrompt('general')` 硬编码
- line 33: `messages: [{ role: 'user', content: message }]` 无历史
- 如果切换到流式端点，此文件可以不改（但建议加个注释标记为 deprecated）

## 执行顺序

```
Step 1: Bug 2 — 修 sessions/route.ts 返回字段名 (1 min)
Step 2: Bug 3 — 修 ChatInterface.tsx loadSessions 解析 (1 min)
Step 3: Bug 5 — 修 ChatInterface.tsx loadSessionHistory 解析 (1 min)
Step 4: Bug 1 — 修 AuthForm + store，增加 refresh_token 保存和刷新 (10 min)
Step 5: Bug 4 — 重写 handleSend 使用流式端点 (15 min)
Step 6: npm run build 验证
Step 7: git commit + push 触发 Vercel 部署
```

## 环境变量（已在 Vercel 配好，本地开发需要 .env）

```
SUPABASE_URL=https://wiiroxbqwgjfbeyjehkk.supabase.co
SUPABASE_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service_role key>
LLM_BASE_URL=https://token-plan-cn.xiaomimimo.com/anthropic
LLM_API_KEY=tp-c6ta1ha2vo2r95ja5pfhiyer3ioqvlgkgons8vfp6w4nm53o
LLM_MODEL=mimo-v2.5-pro
LLM_PROVIDER=anthropic
```

## Supabase 表结构（已创建）

```sql
-- chat_sessions: id(UUID PK), user_id, title, started_at, updated_at,
--   emotion_summary(JSONB), message_count, therapy_mode
-- messages: id(UUID PK), session_id(FK→chat_sessions.id ON DELETE CASCADE),
--   role, content, emotion(JSONB), created_at
```

## LLM API 格式（Anthropic Messages API）

```
POST {LLM_BASE_URL}/v1/messages
Headers: x-api-key, anthropic-version: 2023-06-01, Content-Type: application/json
Body: { model, max_tokens, system, messages: [{role, content}] }
流式: body 加 stream: true，响应为 SSE
```

## Git 提交规范

```
<type>: <description>
类型: feat, fix, refactor, docs, test, chore, perf, ci
```

## 验证清单

- [ ] `cd frontend && npm run build` 通过
- [ ] 登录/注册流程正常
- [ ] 创建会话后侧边栏出现新会话
- [ ] 发送消息后 AI 逐字流式回复
- [ ] AI 能记住之前的对话内容
- [ ] 切换 CBT/脱敏模式后 AI 按对应协议回复
- [ ] 侧边栏显示历史会话列表
- [ ] 点击历史会话能加载消息
