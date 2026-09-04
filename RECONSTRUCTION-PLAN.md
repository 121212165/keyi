# Supabase-first 重构执行计划

## 目标状态

```text
Next.js UI + Route Handlers
  ├─ Supabase Auth
  ├─ Supabase Postgres / RLS
  ├─ CBT mainline therapy plan
  ├─ staged exposure plugin
  ├─ session summaries + revocable memory
  └─ server-side LLM adapter
```

## 工作流

### Phase 1：数据底座

- [ ] 保留并兼容 `chat_sessions`、`messages`。
- [ ] 新增 `therapy_plans`、`therapy_plan_steps`、`session_summaries`、`memory_items`。
- [ ] `chat_sessions` 关联计划并记录会话类型、摘要状态。
- [ ] 移除开放式 RLS，所有用户数据按 `auth.uid()` 隔离。
- [ ] 为 active plan、会话时间线、记忆状态和来源增加索引。

### Phase 2：服务与 API

- [ ] 集中 Bearer token 验证、错误映射和统一响应包络。
- [ ] 统一会话列表、创建、详情、删除、历史和消息接口。
- [ ] 创建会话时绑定当前 active CBT 主线计划。
- [ ] 提供治疗计划查询和阶段 transition 接口。
- [ ] 提供长期记忆列表和撤回接口。
- [ ] 流式完成后生成摘要与候选记忆；失败不影响主响应。

### Phase 3：产品兼容

- [ ] 保留现有聊天、会话侧边栏和移动端交互。
- [ ] 默认将 CBT 展示为主线，而不是三个平级治疗产品。
- [ ] 增加轻量治疗工作台，显示当前阶段与暴露训练进度。
- [ ] 增加记忆查看与撤回入口。
- [ ] 前端兼容统一包络和迁移期裸数据返回。

### Phase 4：部署收敛

- [ ] Vercel 只构建 `frontend/`。
- [ ] 配置 Supabase 与 LLM 的服务端环境变量。
- [ ] 应用 Supabase migrations 并执行 RLS 双用户测试。
- [ ] 将 FastAPI/Railway 标记为 legacy，停止新增能力。
- [ ] 完成生产 smoke test 后移除遗留部署流量。

## API 表面

| 方法 | 路径 | 语义 |
| --- | --- | --- |
| `GET/POST` | `/api/v1/chat/sessions` | 列出或创建绑定主线计划的会话 |
| `GET/DELETE` | `/api/v1/chat/sessions/:id` | 获取或删除自己的会话 |
| `GET` | `/api/v1/chat/sessions/:id/history` | 获取会话消息时间线 |
| `POST` | `/api/v1/chat/sessions/:id/messages/stream` | 注入分层上下文并流式回复 |
| `GET` | `/api/v1/therapy/modes` | 返回兼容展示信息，不建立并行状态机 |
| `GET` | `/api/v1/therapy/plan` | 获取 active CBT 主线、阶段和步骤 |
| `POST` | `/api/v1/therapy/plan/transition` | 进入、推进、暂停或完成暴露阶段 |
| `GET` | `/api/v1/memory` | 列出当前用户可见的 active 长期记忆 |
| `DELETE` | `/api/v1/memory/:id` | 撤回自己的长期记忆 |

完整响应与兼容规则见 `docs/API-CONTRACT.md`。

## 验收矩阵

| 范围 | 必须通过 |
| --- | --- |
| Auth | 缺失、过期、伪造 token 均返回 401；不会泄露其他用户存在性 |
| RLS | A 用户不能读写 B 用户任何会话、消息、计划、步骤、摘要或记忆 |
| Plan | 每个用户至多一个 active mainline；新会话自动绑定；阶段可恢复 |
| Exposure | 未经 transition 不进入；步骤有顺序；支持暂停/完成；不丢失 CBT 主线 |
| Memory | 只注入 active 高置信记忆；撤回后列表和 prompt 均不再使用 |
| Chat | 创建、历史、删除和 SSE 流式保持现有 UI 可用 |
| Failure | 摘要/记忆提取失败不破坏聊天；流中断不写入伪完整摘要 |
| Delivery | 文档与代码环境变量一致；lint/build 通过；生产 smoke test 通过 |

## Legacy 退出条件

只有同时满足以下条件，才删除遗留 FastAPI/Railway 资源：

1. 生产域名连续观察期内不再向 legacy backend 发送请求。
2. legacy 中没有独有定时任务、密钥或未迁移数据。
3. Next.js API 的聊天、计划、记忆和危机路径均通过验收。
4. 已记录回滚点，并确认 Supabase migration 可重复应用。
