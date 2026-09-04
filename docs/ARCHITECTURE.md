# 系统架构

## 组件职责

| 组件 | 职责 | 禁止事项 |
| --- | --- | --- |
| Next.js UI | 展示聊天、计划、记忆和错误状态 | 直接持有 Service Role 或 LLM key |
| Route Handlers | 鉴权、归属检查、业务编排、统一响应 | 将用户 token 写入日志 |
| Supabase Auth | 注册、登录、access token 身份 | 代替业务表的 `user_id` 条件 |
| Supabase Postgres | 会话、计划、摘要、记忆与 RLS | 使用全开放用户数据策略 |
| LLM adapter | 服务端模型调用与 SSE 转发 | 接收浏览器直连密钥 |

## 请求链路

1. 用户通过 Supabase Auth 登录，浏览器保存短期 access token。
2. UI 以 `Authorization: Bearer <token>` 调用同源 `/api/v1/*`。
3. Route Handler 向 Supabase 验证 token，并得到可信 `user.id`。
4. 数据查询同时使用 `user_id` 过滤和数据库 RLS。
5. 聊天服务按工作记忆、会话摘要、长期记忆、治疗计划的顺序组装上下文。
6. 模型响应通过 SSE 返回；持久化完成后再异步推进摘要和记忆候选。

## 疗法状态

`therapy_plans` 是唯一主线状态，默认 `primary_method = 'cbt'`。暴露训练通过 `therapy_plan_steps` 的阶段和 transition 进入，不创建第二个 active 计划。

建议阶段：

```text
assessment → formulation → skills → exposure_preparation
→ exposure_practice → consolidation → maintenance
```

进入暴露阶段前至少满足：用户明确选择、目标可描述、主观痛苦可评估、存在暂停路径。系统不得把危机状态或明显不适合自助的情境推进到暴露练习。

## 记忆层级

- **工作记忆**：当前会话窗口中的消息。
- **会话摘要**：一次会话的结构化压缩，用于恢复上下文。
- **长期记忆**：稳定事实、偏好、目标或治疗里程碑。

治疗流程状态由计划与步骤表承载，不使用长期记忆替代状态机。

## Legacy

历史 FastAPI backend 只作为迁移对照。正式架构不依赖 Python 服务、Railway 地址或 `VITE_API_BASE_URL`。任何需要新增能力的改动都应优先进入 Next.js API 与 Supabase。
