# 部署指南

## Supabase

1. 创建或选择 Supabase 项目。
2. 使用 Supabase CLI link 到目标 project ref。
3. 先在预览环境执行 migration、schema diff 和 RLS 双用户测试。
4. 确认 Auth 的 Site URL、Redirect URLs 和邮件策略与生产域名一致。

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
```

不要在生产 SQL Editor 中手工改表后跳过 migration 文件。

## Vercel 环境变量

| 变量 | 范围 | 必需 | 说明 |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Server | 是 | Supabase 项目 URL |
| `SUPABASE_KEY` | Server | 是 | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Server secret | 是 | 仅 Route Handler 使用 |
| `LLM_BASE_URL` | Server | 是 | OpenAI-compatible API base |
| `LLM_API_KEY` | Server secret | 是 | 模型供应商密钥 |
| `LLM_MODEL` | Server | 是 | 模型名 |
| `NEXT_PUBLIC_API_URL` | Browser | 否 | 默认留空，使用同源 `/api` |

Preview 环境不得使用真实用户数据。Service Role 和 LLM key 禁止使用 `NEXT_PUBLIC_*` 前缀。

## 发布前验证

```bash
cd frontend
npm ci
npm run lint
npm run build
```

部署后验证注册/登录、token refresh、创建与删除会话、history、SSE、危机响应、治疗计划、记忆撤回和双用户隔离。

## Legacy 退役

Railway/FastAPI 不再是正式依赖。确认无生产流量、无独有任务和无待迁移数据后再关闭旧服务，并保留部署 SHA、配置快照和回滚记录。
