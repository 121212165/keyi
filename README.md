# 可意 AI 心理支持 | Keyi

可意是一个以 **CBT（认知行为疗法）为主线**、按需加入 **阶段化暴露训练** 的中文 AI 心理支持应用。系统提供持续对话、治疗计划、跨会话记忆和用户可撤回的数据控制能力。

> 可意是心理健康辅助工具，不提供诊断，也不能替代心理咨询师、临床心理师或精神科医生。处于即时危险时，请优先联系当地急救、危机干预热线或可信赖的人。

## 产品模型

- **CBT 主线**：默认使用 CBT 框架整理情境、自动化想法、情绪、行为和可执行练习。
- **暴露训练插件**：只有在用户知情并主动选择后，才在 CBT 主线中进入准备、层级建立、练习和复盘阶段；它不是第二套平行治疗计划。
- **三层上下文**：当前会话消息、会话摘要、经筛选的长期记忆按固定顺序参与后续对话。
- **用户可控记忆**：用户可以查看系统保留的长期记忆并撤回；撤回后不再注入后续提示词。
- **安全边界**：危机识别和求助资源优先于一般对话生成。

## 架构

项目采用 **Supabase-first 单栈架构**：

```text
Browser
  └─ Next.js UI
       └─ Next.js Route Handlers (/api/v1/*)
            ├─ Supabase Auth
            ├─ Supabase Postgres + RLS
            └─ OpenAI-compatible LLM endpoint
```

- `frontend/`：Next.js 16 应用、UI 和唯一正式 API 层。
- `supabase/`：数据库迁移、RLS、索引和本地 Supabase 配置。
- `docs/`：架构、API、部署和数据治理说明。
- `backend/`：历史 FastAPI 实现（legacy）；不是默认运行路径，也不应承接新功能。若旧分支仍包含该目录，仅用于迁移对照。

## 本地开发

### 前置条件

- Node.js 20+
- npm 10+
- 一个 Supabase 项目；需要本地数据库时安装 Supabase CLI
- 一个兼容 OpenAI Chat Completions/SSE 的模型服务

### 环境变量

在 `frontend/.env.local` 中配置：

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-role-key>

LLM_BASE_URL=https://<provider>/v1
LLM_API_KEY=<server-only-api-key>
LLM_MODEL=<model-name>

# 可选。默认使用同源 /api；仅在反向代理或兼容部署时设置。
NEXT_PUBLIC_API_URL=
```

- `SUPABASE_SERVICE_KEY`、`LLM_API_KEY` 只能存在于服务端环境变量。
- 不要使用 `NEXT_PUBLIC_*` 暴露任何密钥。
- 浏览器通过 Bearer access token 调用同源 Route Handler；服务端再次向 Supabase 验证身份。

### 运行与检查

```bash
cd frontend
npm install
npm run dev

npm run lint
npm run build
```

数据库迁移和生产部署见 `docs/DEPLOYMENT.md`。

## API 约定

正式接口位于 `/api/v1`。新接口统一使用 `{ success, data, error }` JSON 包络。迁移期间前端同时接受历史裸数组/裸对象返回，API 不应长期依赖该兼容行为。详细契约见 `docs/API-CONTRACT.md`。

## 数据与隐私

- 所有用户数据表启用 RLS，并以 `auth.uid()` 隔离。
- 长期记忆只保存与连续支持相关、相对稳定且达到置信阈值的信息。
- 临时情绪、模型推测和高敏感细节不得自动升级为长期记忆。
- 记忆撤回采用可审计的软删除状态；被撤回数据不再进入模型上下文。
- Service Role 仅用于受控的服务器端 Route Handler，不能绕过应用层归属校验。

完整规则见 `docs/DATA-GOVERNANCE.md`。

## 部署

推荐使用 Vercel 部署 `frontend/` 与 Next.js Route Handlers，Supabase 承担 Auth、Postgres、RLS 和迁移，模型由 Route Handler 在服务端调用。不再需要 Railway/FastAPI 才能运行主应用。

部署步骤、回滚和验收清单见 `docs/DEPLOYMENT.md`。

## 许可证

MIT License
