# keyi 可AI重构文档

> **元信息**
> - **一句话定位**：可意（keyi / 界面品牌名"林序"）是一个 AI 心理陪伴助手 Web 应用——Next.js 单页聊天界面 + Next.js API Routes 后端 + Supabase（Auth + PostgreSQL）+ Anthropic 协议兼容的 LLM 服务，提供自由对话 / CBT 认知疗法 / 系统脱敏三种治疗模式的流式 AI 对话。
> - **生成日期**：2026-07-28
> - **复现深度**：精确级（现状快照）——白名单文件逐字收录，其余文件规格化描述，目标是单凭本文档 AI 即可复现项目现状（含现存缺陷与技术债，均如实记录，不做修复）。
> - **与其他文档的关系声明**：
>   - `README.md`：面向用户的项目介绍，其技术栈描述（"FastAPI + Python 3.11+"、"Railway 部署"）**已过时**，与实际代码不符；本文档以代码实际状态为准。
>   - `FIRST-PRINCIPLES-RECONSTRUCTION.md`（45 行）与 `RECONSTRUCTION-PLAN.md`（371 行）：是"如何砍代码"的**未来改造计划**（第一性原理重构：删除双后端、砍死代码），方向与本文档相反但**不冲突**——本文档是"如何复现现状"的快照，如实记录双后端残骸并存的现状；两份计划的结论在本文档第 10 章单独引用，**本文档不预设其执行**。
>   - 注意：`RECONSTRUCTION-PLAN.md` 中列出的大量待删除文件（`backend/app/**`、`frontend/src/lib/api.ts`、`frontend/src/components/therapy/**`、`scripts/**`、`supabase/functions/**`、`supabase/migrations/001_*.sql` 等）在当前工作区**已经不存在**——说明计划的 Phase 1（删除）实际上已大部分执行完毕，但两份计划文档本身未更新。本文档记录的是删除后的现状。
> - **密钥零收录声明**：本文档不收录任何真实密钥/API Key。所有密钥only写环境变量名；在源文件中发现的疑似真实密钥值（见 `render.yaml`）一律以 `<占位>` 替代并显著标注。

---

## 1. 项目概述

### 1.1 定位

可意 AI 心理医生（英文名 Keyi AI Psychologist，聊天界面内 AI 人格名为"林序"，slogan"在林间找到安宁 / 森林里的倾听者"）：

- 免费的中文 AI 心理陪伴 Web 应用，24 小时在线，无需预约。
- 核心理念（引自 FIRST-PRINCIPLES-RECONSTRUCTION.md）：**The prompt IS the product**——产品差异化完全来自系统提示词质量，治疗模式本质是 prompt 变体而非软件模块。
- 三种治疗模式：`general`（自由对话）、`cbt`（CBT 认知行为疗法）、`desensitize`（系统脱敏，Wolpe 交互抑制四阶段）。
- 内置危机关键词检测：命中自杀/自残类关键词时不调用 LLM，直接返回危机干预热线文案。

### 1.2 编号功能清单（现状实际可用性标注）

| 编号 | 功能 | 实现位置 | 现状 |
|------|------|----------|------|
| F01 | 邮箱+密码注册（Supabase Auth，含邮箱验证） | `POST /api/v1/auth/register` + `AuthForm.tsx` | ✅ 可用 |
| F02 | 邮箱+密码登录 | `POST /api/v1/auth/login` | ✅ 可用 |
| F03 | 登出 | `POST /api/v1/auth/logout` + store `logout()` | ✅ 可用 |
| F04 | 获取当前用户信息 | `GET /api/v1/auth/me` | ✅ 可用（前端未实际调用） |
| F05 | Token 刷新 | `POST /api/v1/auth/refresh` | ✅ 可用（前端未实际调用） |
| F06 | 会话创建（带 therapy_mode） | `POST /api/v1/chat/sessions` | ✅ 可用 |
| F07 | 会话列表 | `GET /api/v1/chat/sessions` | ✅ 可用 |
| F08 | 会话删除 | `DELETE /api/v1/chat/sessions/{id}` | ✅ 可用 |
| F09 | 历史消息加载 | `GET /api/v1/chat/sessions/{id}/history` | ⚠️ 后端可用，但前端调用时**未带 Authorization 头**，实际返回 401（已知缺陷，见 §6.5/§7） |
| F10 | 流式 AI 对话（SSE） | `POST /api/v1/chat/sessions/{id}/messages/stream` | ✅ 可用，核心 P0 功能 |
| F11 | 非流式 AI 对话 | `POST /api/v1/chat/sessions/{id}/messages` | ✅ 后端存在，前端未使用；**无鉴权检查**（已知缺陷） |
| F12 | 无会话单轮对话 | `POST /api/v1/ai/chat` | ✅ 后端存在，前端未使用；无鉴权、无历史、无危机检测 |
| F13 | 治疗模式列表 | `GET /api/v1/therapy/modes` | ✅ 可用（前端硬编码了同样列表，未实际调用该接口） |
| F14 | 危机关键词检测 | `frontend/src/lib/safety.ts`，仅接入 stream 路由 | ✅ 可用 |
| F15 | 首条消息自动生成会话标题（截取前 20 字符） | messages / stream 路由内 | ✅ 可用 |
| F16 | 健康检查 | `GET /api/health` | ✅ 可用 |
| F17 | 匿名试用（"暂不登录，先试试"按钮） | `AuthForm.tsx` | ⚠️ 按钮存在，但点击后 `setUser(null,'')` + reload，仍回到登录页；聊天必须有 token（受保护路由 401），实质**不可匿名聊天** |
| F18 | SEO 内容页（5 个静态文章页 + sitemap + robots.txt + JSON-LD） | `app/what-is-cbt` 等 | ✅ 可用，纯静态 |
| F19 | 移动端抽屉式侧边栏 | `ChatInterface.tsx` + `Sidebar.tsx` | ✅ 可用 |
| F20 | 治疗模式 Tab 切换（桌面端） | `ChatInterface.tsx` | ⚠️ UI 可切换，但模式只在**创建会话时**写入 `chat_sessions.therapy_mode`；对已有会话切换 Tab 不生效（见 §6.2） |

### 1.3 前后端架构现状（双后端并存的如实说明）

```
浏览器 (React 19 客户端组件, Zustand store, localStorage 持久化 token)
   │  fetch /api/v1/**  (Bearer token)
   ▼
【实际生效后端】Next.js 16 App Router API Routes（frontend/src/app/api/**，13 个 route.ts）
   │  ├── @supabase/supabase-js (anon key → Auth; service key → 数据读写, 绕过 RLS)
   │  └── fetch ${LLM_BASE_URL}/v1/messages  (Anthropic Messages 协议, x-api-key, SSE 流式)
   ▼
Supabase 云端（Auth + PostgreSQL: chat_sessions / messages 两表）

【死后端残骸】backend/ 目录（仅剩 3 个文件）：
   backend/api/index.py     — Mangum 包装 FastAPI 的 Vercel 入口，import app.main（app/ 目录已被删除，import 必然失败，不可运行）
   backend/requirements.txt — 完整的 FastAPI 技术栈依赖清单（fastapi/uvicorn/sqlalchemy/supabase/mangum 等）
   backend/vercel.json      — @vercel/python 构建配置
   ↑ RECONSTRUCTION-PLAN.md 判定其"Unused backend code: 100%"，Phase 1 删除已执行大半（app/ 已不在），
     但这 3 个残留文件 + 根目录 render.yaml（指向 backend/Dockerfile，该 Dockerfile 也已不存在）仍在仓库中。
```

要点：

1. **前端项目即全栈项目**：所有业务 API 都是 Next.js API Routes，部署到 Vercel 即前后端一体。
2. **Python 后端不可运行**：`backend/api/index.py` 引用的 `app.main` 模块不存在；`render.yaml` 引用的 `backend/Dockerfile` 不存在。复现时只需按原样放置这 3 个文件与 render.yaml 即可还原现状，无需让其可运行。
3. **LLM 协议**：尽管 README/落地页宣传"智谱 AI GLM-4.7-Flash"，代码实际走 **Anthropic Messages API 协议**（`x-api-key` + `anthropic-version: 2023-06-01`，POST `{LLM_BASE_URL}/v1/messages`），默认模型字符串为 `claude-sonnet-4-20250514`，可通过 `LLM_MODEL`/`LLM_BASE_URL` 指向任何 Anthropic 协议兼容网关（render.yaml 中残留的配置指向小米 MiMo 的 anthropic 兼容端点）。文档如实记录代码行为，宣传文案不代表实现。
4. **鉴权模型**：无 cookie/session，纯 Bearer token（Supabase access_token），由前端存 localStorage（key=`keyi-user`）并手工附加到请求头；服务端用 `supabaseAdmin().auth.getUser(token)` 校验。
5. **数据安全模型**：服务端全部使用 service key（`supabaseAdmin()`）直连数据库，**RLS 实际被绕过**；migration 002 的 RLS 策略是 `allow_all`。数据隔离靠路由代码里的 `eq('user_id', ...)` 过滤（stream 与 messages 路由**未做**会话属主校验，见 §5）。

<!-- SECTION 1 END -->

---

## 2. 技术栈与环境

### 2.1 前端精确版本表（来源：frontend/package.json）

| 类别 | 包 | 版本声明 |
|------|-----|---------|
| 框架 | next | **16.1.6**（精确锁定） |
| UI | react | **19.2.3**（精确锁定） |
| UI | react-dom | **19.2.3**（精确锁定） |
| 数据 | @supabase/supabase-js | ^2.107.0 |
| 状态 | zustand | ^5.0.11 |
| dev | @tailwindcss/postcss | ^4 |
| dev | tailwindcss | ^4（v4，CSS-first 配置，无 tailwind.config.js） |
| dev | typescript | ^5 |
| dev | eslint | ^9 |
| dev | eslint-config-next | 16.1.6 |
| dev | @types/node | ^20 |
| dev | @types/react | ^19 |
| dev | @types/react-dom | ^19 |

`frontend/package.json` 全文逐字收录：

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build --no-turbopack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.107.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

注意 build 脚本使用 `--no-turbopack`（Next 16 默认 Turbopack，此处显式禁用，改用 webpack 构建）。

### 2.2 后端（死残骸）依赖表

`backend/requirements.txt` 全文逐字收录（仅为还原现状，安装后也无法运行，因 `app/` 包已不存在）：

```txt
fastapi>=0.100.0
uvicorn[standard]>=0.25.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
pydantic[email]>=2.5.0
httpx>=0.27.0
python-dotenv>=1.0.0
supabase>=2.0.0
pytest>=7.0.0
pytest-asyncio>=0.21.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
mangum>=0.17.0
```

### 2.3 运行时与工具版本

| 项 | 版本 | 依据 |
|----|------|------|
| Node.js | 20（CI 固定 `node-version: 20`） | `.github/workflows/ci.yml` |
| 包管理 | npm（CI 使用 `npm ci`，仓库有 package-lock.json） | ci.yml |
| Python | 3.11+（README 声明；死后端无 runtime 文件残留） | README |
| 数据库 | Supabase 云端 PostgreSQL（uuid-ossp 扩展） | schema |
| Supabase CLI | 可选，用于 migrations（config.toml 存在） | supabase/config.toml |

### 2.4 安装 / 运行 / 构建命令

```bash
# 前端（= 全栈应用）
cd frontend
npm install
# 本地开发前需在 frontend/.env.local 写入 §2.5 的环境变量
npm run dev        # http://localhost:3000
npm run build      # 生产构建（next build --no-turbopack）
npm run start      # 生产启动
npm run lint       # eslint

# CI（.github/workflows/ci.yml）：push/PR 到 main|master 时执行
#   working-directory: frontend → npm ci → npm run lint → npm run build
```

### 2.5 环境变量表（仅键名+用途+占位值；密钥零收录）

全部由 Next.js 服务端代码读取（`process.env.*`），本地放 `frontend/.env.local`，线上配在 Vercel 项目环境变量中：

| 变量名 | 用途 | 读取位置 | 占位示例 |
|--------|------|----------|----------|
| `SUPABASE_URL` | Supabase 项目 URL | `lib/supabase.ts`（两个 client 共用） | `https://<project-ref>.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key（用于 Auth 登录/注册/getUser） | `lib/supabase.ts` → `supabase()` | `<SUPABASE_ANON_KEY>` |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key（服务端读写数据，绕过 RLS）**高敏** | `lib/supabase.ts` → `supabaseAdmin()` | `<SUPABASE_SERVICE_ROLE_KEY>` |
| `LLM_BASE_URL` | LLM 网关基地址；代码会在其后拼接 `/v1/messages` | ai/chat、messages、stream 三个路由 | `https://<llm-gateway-host>` |
| `LLM_API_KEY` | LLM API 密钥（作为 `x-api-key` 头发送）**高敏** | 同上 | `<LLM_API_KEY>` |
| `LLM_MODEL` | 模型名（缺省 `claude-sonnet-4-20250514`） | 同上 | `mimo-v2.5-pro` 或任意 Anthropic 协议模型 |
| `NEXT_PUBLIC_API_URL` | API 前缀（前端 AuthForm 使用，缺省空串=同域） | `AuthForm.tsx` | 留空 |

死后端 render.yaml 中额外声明（仅历史残留，无代码消费）：`SECRET_KEY`（generateValue）、`LLM_PROVIDER`（=anthropic）、`LOG_LEVEL`（=INFO）。

⚠️ **重要拼接细节**：三个 LLM 路由均请求 `${LLM_BASE_URL}/v1/messages`，因此 `LLM_BASE_URL` 必须是**不含** `/v1/messages` 的基地址。而 render.yaml 残留配置里 `LLM_BASE_URL` 的值是完整端点 `https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages`——两者口径不一致，这是死后端(FastAPI 自行拼接方式不同)遗留的配置，照抄到 Next.js 环境会得到 `.../v1/messages/v1/messages` 的错误 URL。复现 Next.js 侧时应配 `https://token-plan-cn.xiaomimimo.com/anthropic`（或其他兼容网关的基地址）。

### 2.6 render.yaml 全文内嵌（含脱敏标注）

原文件位于仓库根目录，服务于**已死亡的 Python 后端**（引用的 `backend/Dockerfile` 已不存在，此配置当前不可部署）。原文件第 13 行 `LLM_API_KEY` 的 value 为**疑似真实密钥明文**（`tp-` 前缀的 48+ 字符 token），按安全红线以占位符替代并标注，其余逐字：

```yaml
services:
  - type: web
    name: keyi-api
    runtime: docker
    region: oregon
    plan: free
    rootDir: backend
    dockerfilePath: ./Dockerfile
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: LLM_API_KEY
        value: <占位:疑似真实LLM_API_KEY已脱敏-复现时填入自己的密钥或改用环境变量注入>
      - key: LLM_MODEL
        value: mimo-v2.5-pro
      - key: LLM_BASE_URL
        value: https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages
      - key: LLM_PROVIDER
        value: anthropic
      - key: LOG_LEVEL
        value: INFO
```

> ⚠️ 安全提示（超出快照职责的必要披露）：该密钥以明文形式提交在仓库中，应视为已泄露，建议项目所有者立即在提供商侧吊销轮换。本文档不收录其真实值。

### 2.7 vercel.json 全文内嵌（共 3 份）

根目录 `vercel.json`（**实际生效的部署配置**——Vercel 项目根指向仓库根，构建 frontend）：

```json
{
  "framework": "nextjs",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install"
}
```

`frontend/vercel.json`（冗余残留，若以 frontend 为根部署时生效）：

```json
{
  "framework": "nextjs"
}
```

`backend/vercel.json`（死后端残留，@vercel/python 构建，当前不可用）：

```json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

另有 `.vercel/project.json`（本地 vercel CLI 链接文件，含 `orgId`/`projectId` 两个字段，值为 Vercel 平台内部标识符 `team_...`/`prj_...`，非密钥；复现时由 `vercel link` 自动生成，无需手工创建）。

<!-- SECTION 2 END -->

---

## 3. 目录结构

带中文注释的完整目录树（现状快照；`node_modules/`、`.next/` 等生成物省略）：

```
keyi/
├── .github/
│   └── workflows/
│       └── ci.yml                        # CI：Node20 + npm ci + lint + build（仅 frontend）
├── .gitignore                            # 根忽略：env/Python产物/node产物/IDE/日志
├── .vercel/
│   └── project.json                      # vercel CLI 链接文件（orgId/projectId）
├── FIRST-PRINCIPLES-RECONSTRUCTION.md    # 45行 第一性原理重构论证（未来计划，见§10）
├── RECONSTRUCTION-PLAN.md                # 371行 删除清单/改造计划（大半已执行，见§10）
├── README.md                             # 项目介绍（技术栈段落已过时：仍写FastAPI+Railway）
├── render.yaml                           # 死后端Render部署配置（引用已删除的backend/Dockerfile；含泄露密钥→已在§2.6脱敏）
├── vercel.json                           # 实际生效：Vercel从仓库根构建frontend
├── backend/                              # ☠️ 死Python后端残骸（3文件，不可运行）
│   ├── api/
│   │   └── index.py                      # Mangum包装FastAPI入口；import app.main（app/已不存在→ImportError）
│   ├── requirements.txt                  # FastAPI全家桶依赖（见§2.2）
│   └── vercel.json                       # @vercel/python构建配置
├── docs/
│   ├── MVP简化后端配置指南.md             # 388行 早期MVP方案文档（Vercel Edge Function+OpenAI，含"可意"早期prompt，与现实现无关）
│   ├── supabase_schema.sql               # 141行 数据库Schema参考（含RLS/触发器；与实际migration有出入，见§4.3）
│   ├── 功能清单.md                        # 100行 功能规划清单（部分"待开发"项实际已完成，文档滞后）
│   └── _archive/                         # 10个归档文档（部署教程/依赖版本/UI清单等，均为历史资料，不参与运行）
│       ├── DEPENDENCY_VERSIONS.md
│       ├── DEVELOPMENT_SETUP.md
│       ├── ISSUE_TEMPLATE.md
│       ├── Railway部署教程.md
│       ├── Supabase部署指南.md
│       ├── UI优化清单.md
│       ├── Vercel部署教程.md
│       ├── 每日心理汇总功能灵感文档.md
│       ├── 邮箱验证问题说明.md
│       └── 部署指南.md
├── supabase/
│   ├── config.toml                       # Supabase CLI配置（project_id + functions.chat.verify_jwt=false残留）
│   └── migrations/
│       └── 002_create_keyi_tables.sql    # 34行 实际生效Schema（001已删除；与docs版有差异，见§4.3）
└── frontend/                             # ★ 全栈Next.js应用（实际产品本体）
    ├── .gitignore                        # Next.js标准忽略
    ├── eslint.config.mjs                 # flat config：next/core-web-vitals + next/typescript
    ├── next.config.ts                    # 空配置（默认值）
    ├── package.json                      # 见§2.1
    ├── package-lock.json                 # npm锁文件（234KB）
    ├── postcss.config.mjs                # 仅@tailwindcss/postcss插件（Tailwind v4）
    ├── tsconfig.json                     # strict；路径别名 @/* → ./src/*
    ├── vercel.json                       # 冗余：{"framework":"nextjs"}
    ├── public/
    │   ├── robots.txt                    # 允许主流bot；GPTBot Disallow；sitemap指向keyi.app
    │   ├── file.svg / globe.svg / next.svg / vercel.svg / window.svg  # create-next-app默认图标（未使用）
    └── src/
        ├── app/
        │   ├── favicon.ico               # 站点图标
        │   ├── globals.css               # 94行 Warm Editorial设计系统（CSS变量+Tailwind v4 @theme）
        │   ├── layout.tsx                # 根布局：中文SEO metadata + Organization/SoftwareApplication/WebSite JSON-LD
        │   ├── page.tsx                  # 落地页（营销长页：Hero/特性/流程/FAQ/免责声明）
        │   ├── sitemap.ts                # Next.js Metadata API sitemap（6个URL）
        │   ├── chat/
        │   │   └── page.tsx              # 聊天页入口：mounted守卫 + token有无 → ChatInterface | AuthForm
        │   ├── ai-psychologist/page.tsx          # SEO文章页：AI心理医生介绍（161行）
        │   ├── free-online-therapy/page.tsx      # SEO文章页：免费在线心理工具对比（146行）
        │   ├── gad7-anxiety-test/page.tsx        # SEO文章页：GAD-7量表静态展示（198行，无交互计分）
        │   ├── systematic-desensitization/page.tsx # SEO文章页：系统脱敏疗法（160行）
        │   ├── what-is-cbt/page.tsx              # SEO文章页：CBT介绍（169行）
        │   └── api/                      # ★ 实际生效后端（13个route.ts）
        │       ├── health/route.ts               # GET 健康检查
        │       └── v1/
        │           ├── ai/chat/route.ts          # POST 无会话单轮对话（无鉴权，前端未用）
        │           ├── auth/
        │           │   ├── login/route.ts        # POST 登录
        │           │   ├── logout/route.ts       # POST 登出
        │           │   ├── me/route.ts           # GET 当前用户
        │           │   ├── refresh/route.ts      # POST 刷新token
        │           │   └── register/route.ts     # POST 注册
        │           ├── chat/sessions/
        │           │   ├── route.ts              # POST创建会话 / GET会话列表
        │           │   └── [id]/
        │           │       ├── route.ts          # DELETE 删除会话（先删messages再删session）
        │           │       ├── history/route.ts  # GET 历史消息（≤50条）
        │           │       └── messages/
        │           │           ├── route.ts      # POST 非流式对话（无鉴权！前端未用）
        │           │           └── stream/route.ts # POST 流式对话SSE（核心，259行）
        │           └── therapy/modes/route.ts    # GET 治疗模式列表
        ├── components/
        │   ├── AuthForm.tsx              # 登录/注册表单（170行）
        │   ├── ChatInterface.tsx         # 聊天主界面容器（289行，流式消费/会话管理/模式Tab）
        │   ├── chat/
        │   │   ├── ChatInput.tsx         # 输入框（Enter发送，Shift+Enter换行）
        │   │   ├── MessageBubble.tsx     # 消息气泡（HH:mm时间戳）
        │   │   └── MessageList.tsx       # 消息列表（自动滚底+打字指示点）
        │   └── sidebar/
        │       ├── SessionItem.tsx       # 会话条目（相对时间/悬停删除）
        │       └── Sidebar.tsx           # 侧边栏（桌面常驻/移动抽屉双形态）
        ├── lib/
        │   ├── prompts.ts                # ★ 系统提示词（BASE/CBT/DESENSITIZE + buildSystemPrompt）
        │   ├── safety.ts                 # ★ 危机关键词检测（detectCrisis）
        │   └── supabase.ts               # 双客户端工厂：anon(supabase) / service(supabaseAdmin)，模块级单例
        └── store/
            └── index.ts                  # Zustand全局store（user/token/sessions/messages）+ localStorage恢复
```

统计：frontend/src 下业务源码 **35 个文件**（13 route.ts + 7 页面 + layout + sitemap + globals.css + favicon + 7 组件 + 3 lib + 1 store），仓库业务/配置文件合计约 55 个（不含 docs/_archive 与锁文件）。

<!-- SECTION 3 END -->

---

## 4. 数据模型

### 4.1 docs/supabase_schema.sql 全文逐字内嵌（141 行）

该文件是**文档参考版** Schema（含严格 RLS 与触发器）。注意：其 `user_id` 为 UUID、无 `therapy_mode` 列，与实际代码/migration 002 有出入（差异分析见 §4.3）。

```sql
-- ============================================
-- 可意AI心理医生 - Supabase 数据库 Schema
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- chat_sessions 表：存储对话会话
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,  -- 关联 Supabase Auth 用户
    title VARCHAR(255) DEFAULT '新对话',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    emotion_summary JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);

-- ============================================
-- messages 表：存储对话消息
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    emotion JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- ============================================
-- user_profiles 表：用户额外信息（可选）
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}'
);

-- ============================================
-- RLS (Row Level Security) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- chat_sessions: 用户只能看到自己的会话
CREATE POLICY "Users can view own sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- messages: 用户只能看到自己会话中的消息
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- user_profiles: 用户只能管理自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 触发器：自动创建 user_profiles
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, nickname)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 更新时间戳的函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 supabase/migrations/ 全部迁移文件内嵌

migrations 目录当前**仅有一个文件**：`002_create_keyi_tables.sql`（34 行；`001_create_chat_tables.sql` 已按 RECONSTRUCTION-PLAN 删除，序号 002 是历史残留证据）。这是**与代码对齐的实际生效 Schema**，全文逐字：

```sql
-- 创建 chat_sessions 表（与代码对齐）
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT DEFAULT '新对话',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    emotion_summary JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0,
    therapy_mode TEXT DEFAULT 'general'
);

-- 创建 messages 表
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    emotion JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_chat_sessions" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages" ON messages FOR ALL USING (true) WITH CHECK (true);
```

### 4.3 两版 Schema 差异对照（复现时以 migration 002 为准）

| 维度 | docs/supabase_schema.sql（参考版） | migrations/002（实际生效版） | 代码实际依赖 |
|------|-----------------------------------|------------------------------|--------------|
| chat_sessions.id | UUID DEFAULT uuid_generate_v4() | UUID 无默认值（**应用层生成** crypto.randomUUID） | 应用层生成 → 002 |
| chat_sessions.user_id | UUID | **TEXT** | 存 Supabase Auth user.id 字符串 → 002 |
| chat_sessions.therapy_mode | ❌ 无 | ✅ TEXT DEFAULT 'general' | stream 路由读取该列 → **必须用 002** |
| messages.id | UUID 默认生成 | UUID 无默认值（应用层生成） | 应用层生成 → 002 |
| user_profiles 表 | ✅ 有（含注册触发器） | ❌ 无 | 代码从未读写 user_profiles |
| RLS | 严格 per-user 策略 | allow_all（形同虚设） | 服务端用 service key，RLS 无论如何被绕过 |
| updated_at 触发器 | ✅ 有 | ❌ 无（应用层显式写 updated_at） | 应用层写 → 002 |

结论：**建库执行 002 即可让应用完整工作**；docs 版仅作历史参考，若误用 docs 版会因缺少 `therapy_mode` 列导致治疗模式静默失效（`session.therapy_mode` 为 undefined → 回退 'general'），并因 user_id 类型不符插入报错风险。

### 4.4 supabase/config.toml 要点（7 行，全文）

```toml
# Supabase configuration file
# https://supabase.com/docs/guides/local-development/cli/reference

project_id = "zrzwpucermocngirynkn"

[functions.chat]
verify_jwt = false
```

- `project_id`：Supabase CLI 链接的云端项目 ref（出现在公开 URL 中，非密钥）。复现时替换为自己的项目 ref。
- `[functions.chat]`：Edge Function `chat` 的配置残留——该函数源码（`supabase/functions/chat/index.ts`）已被删除，此配置块无实际作用，保留以还原现状。

### 4.5 实体关系与数据流

```
auth.users (Supabase托管)  1 ── n  chat_sessions (user_id TEXT = auth user id)
                                        1 ── n  messages (session_id UUID, ON DELETE CASCADE)
```

- 写路径：仅 stream / messages 两路由写 `messages`（每轮插入 user + assistant 两行，共享同一 `created_at` 时间戳）并更新 `chat_sessions.message_count/updated_at/title`。
- 读路径：sessions 列表（按 started_at 倒序）、history（按 created_at 升序 ≤50 条）、stream 内部上下文（≤20 条）。
- `emotion_summary`/`emotion` 字段：建表即有，**当前代码从不写入**（恒为默认值/NULL），history 会原样返回 `emotion`。

<!-- SECTION 4 END -->

---

## 5. API 契约

### 5.1 端点总览（实际生效路径 = Next.js API Routes，共 13 个 route 文件 / 14 个端点）

Python backend 无任何可用端点（入口 import 失败），下表全部由 `frontend/src/app/api/**` 提供。鉴权方式统一为 `Authorization: Bearer <supabase_access_token>` 请求头（标注"无"者不校验）。

| # | 方法 | 路径 | 鉴权 | 前端是否调用 | 文件 |
|---|------|------|------|--------------|------|
| 1 | GET | `/api/health` | 无 | 否 | `api/health/route.ts` |
| 2 | POST | `/api/v1/auth/register` | 无 | ✅ AuthForm | `api/v1/auth/register/route.ts` |
| 3 | POST | `/api/v1/auth/login` | 无 | ✅ AuthForm | `api/v1/auth/login/route.ts` |
| 4 | POST | `/api/v1/auth/logout` | 无 | 否（前端只清本地态） | `api/v1/auth/logout/route.ts` |
| 5 | GET | `/api/v1/auth/me` | Bearer | 否 | `api/v1/auth/me/route.ts` |
| 6 | POST | `/api/v1/auth/refresh` | 无（body 传 refresh_token） | 否 | `api/v1/auth/refresh/route.ts` |
| 7 | POST | `/api/v1/chat/sessions` | Bearer | ✅ ChatInterface | `api/v1/chat/sessions/route.ts` |
| 8 | GET | `/api/v1/chat/sessions` | Bearer | ✅ ChatInterface | 同上 |
| 9 | DELETE | `/api/v1/chat/sessions/{id}` | Bearer + 属主校验 | ✅ ChatInterface | `api/v1/chat/sessions/[id]/route.ts` |
| 10 | GET | `/api/v1/chat/sessions/{id}/history` | Bearer + 属主校验 | ⚠️ 调用但未带头→401 | `.../[id]/history/route.ts` |
| 11 | POST | `/api/v1/chat/sessions/{id}/messages` | **无**（缺陷） | 否 | `.../[id]/messages/route.ts` |
| 12 | POST | `/api/v1/chat/sessions/{id}/messages/stream` | Bearer（**无属主校验**，缺陷） | ✅ ChatInterface | `.../[id]/messages/stream/route.ts` |
| 13 | GET | `/api/v1/therapy/modes` | 无 | 否（前端硬编码） | `api/v1/therapy/modes/route.ts` |
| 14 | POST | `/api/v1/ai/chat` | 无 | 否 | `api/v1/ai/chat/route.ts` |

统一约定：错误响应一律 `{ "error": "<中文提示>" }`；无全局中间件，鉴权逻辑在每个路由内重复实现；服务端数据操作全部走 `supabaseAdmin()`（service key）。

### 5.2 各端点请求/响应 shape 与错误码

**#1 GET /api/health**
- 200：`{ "status": "healthy" }`

**#2 POST /api/v1/auth/register**
- 请求：`{ "email": string, "password": string }`
- 实现：`supabase().auth.signUp({email,password})`（anon client）
- 200：`{ "access_token": string(邮箱未验证时为 ""), "refresh_token": string|null, "token_type": "bearer", "user": {"id","email"}|null }`
- 400：`{error:"邮箱和密码不能为空"}` 或 `{error:<supabase错误message原文，英文>}`；500：`{error:"注册失败"}`
- 边界：Supabase 默认开启邮箱验证时 signUp 返回的 session 为 null → access_token 为空串，前端提示需先验证邮箱。

**#3 POST /api/v1/auth/login**
- 请求：`{ "email": string, "password": string }`
- 实现：`supabase().auth.signInWithPassword`
- 200：`{ "access_token", "refresh_token", "token_type": "bearer", "user": {"id","email"} }`
- 400：字段缺失或 supabase 错误（如 `Email not confirmed`、`Invalid login credentials` 英文原文透传）；500：`{error:"登录失败"}`

**#4 POST /api/v1/auth/logout**
- 无请求体。实现：`supabase().auth.signOut()`（注意：作用于服务端共享 anon client，无用户上下文，基本是 no-op）
- 200：`{ "message": "登出成功" }`；400/500：`{error}`

**#5 GET /api/v1/auth/me**
- 头：`Authorization: Bearer <token>`；实现：`supabase().auth.getUser(token)`
- 200：`{ "user": { "id", "email" } }`；401：`{error:"未提供认证令牌"|"认证失败，请重新登录"}`；500：`{error:"获取用户信息失败"}`

**#6 POST /api/v1/auth/refresh**
- 请求：`{ "refresh_token": string }`；实现：`supabaseAdmin().auth.refreshSession({refresh_token})`
- 200：`{ "access_token", "refresh_token" }`；400：`{error:"缺少 refresh_token"}`；401：`{error:"刷新失败，请重新登录"}`；500：`{error:"刷新失败"}`

**#7 POST /api/v1/chat/sessions（创建会话）**
- 头：Bearer；请求：`{ "therapy_mode"?: string }`（body 可为空，**缺省值是 `'default'` 而非 `'general'`**——与 prompts.ts 的 switch default 分支兼容，但属于命名不一致的现状细节）
- 实现：服务端 `crypto.randomUUID()` 生成 id，插入 `chat_sessions`（title='新对话', message_count=0, emotion_summary={}, therapy_mode=入参）
- 200：`{ "id": "<uuid>", "therapy_mode": "<mode>" }`
- 401：未带/无效 token；500：`{error:"创建会话失败"}`

**#8 GET /api/v1/chat/sessions（会话列表）**
- 头：Bearer；查询 `eq user_id` + `order started_at desc`
- 200：**裸数组** `[ { "id","title","started_at","updated_at","message_count" }, ... ]`（不含 therapy_mode）
- 401 / 500：`{error:"获取会话列表失败"}`
- 注：前端兼容两种形状（`data?.sessions || data`），实际返回裸数组。

**#9 DELETE /api/v1/chat/sessions/{id}**
- 头：Bearer；先 `eq id + eq user_id` 查存在性（属主校验 ✅）
- 顺序：先删该会话全部 messages，再删 session（不依赖级联，显式两步）
- 200：`{ "message": "删除成功" }`；401；404：`{error:"会话不存在"}`；500：`{error:"删除消息失败"|"删除会话失败"}`

**#10 GET /api/v1/chat/sessions/{id}/history**
- 头：Bearer；属主校验 ✅（eq id + eq user_id，失败即 404）
- 查询 messages：`order created_at asc, limit 50`，字段映射 `created_at → timestamp`
- 200：裸数组 `[ { "id","role","content","timestamp","emotion" }, ... ]`
- 401 / 404：`{error:"会话不存在"}` / 500
- ⚠️ 现状缺陷：前端 `loadSessionHistory` 调用时未附加 Authorization 头，故实际总是 401，历史加载静默失败（catch 后仅 console.error，消息区不变）。

**#11 POST /api/v1/chat/sessions/{id}/messages（非流式，前端未用）**
- 请求：`{ "message": string }`；**无任何鉴权/属主校验**（知道 session UUID 即可写入——现状缺陷）
- 无危机检测。上下文取该会话历史 ≤50 条 + 本条；system prompt 按 `session.therapy_mode || 'general'` 构建
- LLM 调用：POST `${LLM_BASE_URL}/v1/messages`，headers `Content-Type/x-api-key/anthropic-version:2023-06-01`，body `{model: LLM_MODEL||'claude-sonnet-4-20250514', max_tokens:2048, system, messages}`（非流式）
- 成功后：插入 user/assistant 两条消息（共享同一 now 时间戳）、message_count += 2、updated_at=now、若 title 为空或'新对话'则以首条消息前 20 字符+'...'为标题
- 200：`{ "message_id","reply","reply_id","timestamp" }`
- 400：`{error:"请提供消息内容"}`；404：`{error:"会话不存在"}`；500：`{error:"AI 服务未配置"|"服务器内部错误"}`；502：`{error:"AI 服务暂时不可用，请稍后重试"}`

**#12 POST /api/v1/chat/sessions/{id}/messages/stream（核心端点，SSE）**
- 请求：`{ "message": string }`；头：Bearer（getUser 校验 ✅，但**不校验会话属于该用户**——任何登录用户可向任意会话发消息，现状缺陷）
- 处理顺序（重要）：① 校验 message → ② **危机检测（在鉴权之前！未登录也会触发）** → ③ 鉴权 → ④ 查 session（404 若无）→ ⑤ 取历史 ≤20 条 → ⑥ 构建 system prompt → ⑦ 流式调 LLM
- 危机命中时返回 **200 + application/json**（非 SSE）：`{ "type": "crisis", "message": "<危机干预文案全文>" }`，**不调用 LLM、不写库**
- LLM 调用：同 #11 但 `max_tokens:1024, stream:true`；失败时若状态码 ∈ {429,500,502,503} 则等 2 秒重试一次，重试仍失败 → 502 `{error:"AI 服务暂时繁忙，请稍后再试"}`；其他失败状态码 → 502 `{error:"AI 服务暂时不可用，请稍后重试"}`
- 成功：返回 `text/event-stream`（headers 另含 `Cache-Control: no-cache`、`Connection: keep-alive`），自定义 SSE 事件协议（服务端将 Anthropic SSE 转译为简化协议）：
  ```
  data: {"type":"message_start","message_id":"<user消息uuid>","reply_id":"<assistant消息uuid>"}
  data: {"type":"delta","text":"<增量文本>"}     ← 由 Anthropic content_block_delta.delta.text 转出，出现多次
  data: {"type":"done"}                          ← 由 Anthropic message_stop 转出
  data: {"type":"error","error":"流读取中断"}     ← 仅上游读流异常时
  ```
- 落库时机：流结束后（finally 块，controller.close() 之后）插入 user + assistant 两条消息并更新会话（逻辑同 #11：count+2、updated_at、条件性标题）；**若中途异常，fullReply 为已收到的部分内容仍会落库**；DB 失败仅 console.error，不影响已发送的流。
- 400 / 401（两种文案）/ 404 / 500 / 502：均为 application/json `{error}`。

**#13 GET /api/v1/therapy/modes**
- 200：
  ```json
  {
    "modes": [
      { "id": "general", "name": "自由对话", "description": "普通的支持性对话" },
      { "id": "cbt", "name": "CBT认知疗法", "description": "认知行为疗法，帮助识别和改变负性思维模式" },
      { "id": "desensitize", "name": "系统脱敏", "description": "通过渐进式暴露克服特定恐惧或焦虑" }
    ]
  }
  ```

**#14 POST /api/v1/ai/chat（无会话单轮，前端未用）**
- 请求：`{ "message": string }`；无鉴权、无历史、无危机检测、不落库；system 固定 `buildSystemPrompt('general')`；`max_tokens:2048` 非流式
- 200：`{ "reply": string }`；400/500/502 同 #11 风格

### 5.3 Python backend api/ 端点

**无可用端点**。`backend/api/index.py` 全文（7 行，逐字）：

```python
"""
Vercel Serverless 入口 - 将 FastAPI 包装为 Serverless Function
"""
from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
```

`app.main` 所在的 `backend/app/` 目录已不存在于仓库，任何请求都会在 import 阶段抛 `ModuleNotFoundError`。复现现状 = 原样保留此文件即可，不需要（也无法）让它跑起来。

<!-- SECTION 5 END -->

---

## 6. 核心业务逻辑与算法

### 6.1 系统 Prompt 全文逐字收录（prompt IS the product）

来源：`frontend/src/lib/prompts.ts`。三个模板字符串常量 + 一个组装函数，为**全仓库唯一**的 prompt 定义（RECONSTRUCTION-PLAN 所述"3 份重复定义"中的后端两份已随 backend/app 删除）。

**BASE_PROMPT（所有模式共用基座）**：

```
你是林序，一个温暖、专业、有同理心的AI心理医生。

你的职责：
1. 倾听用户的困扰，给予支持和理解
2. 用温暖、平和的语气回应
3. 适当引导用户表达自己的感受
4. 提供心理健康方面的建议（但不替代专业医生诊断）
5. 保持专业边界，不做出医学诊断

注意事项：
- 始终保持耐心和关怀
- 尊重用户的感受和隐私
- 不评判、不批评
- 用简洁而有温度的语言回应
```

**CBT_PROMPT（cbt 模式追加，以 `\n\n` 拼接在 BASE 之后）**：

```
# CBT 认知行为疗法模式

你现在以认知行为疗法（CBT）治疗师的身份工作。

## 核心框架
你使用认知三角模型（情境 → 想法 → 感受 → 行为）来引导用户探索。

## 对话节奏
- 前 2-3 轮：建立信任，倾听，不急于诊断
- 发现自动负性思维后：温和地进入认知重构
- 每轮回复末尾使用开放式问题引导探索

## 苏格拉底式提问规则
1. 禁止直接反驳用户的负性思维
2. 每次最多提 1-2 个问题
3. 轮换使用：证据性问题、替代视角、去灾难化
4. 在提问前，先用一句话表达共情

## 结构化回应
你的回复应包含三个部分（自然融入对话，不使用标题）：
1. 共情确认
2. 认知探索
3. 引导总结

## 输出要求
在每轮回复的最末尾，附加一行治疗记录（不显示给用户）：
<THERAPY_RECORD>{"cognitive_distortions":[],"current_phase":"exploration","emotional_state":"..."}</THERAPY_RECORD>
```

**DESENSITIZE_PROMPT（desensitize 模式追加）**：

```
# 系统脱敏疗法模式（Wolpe 交互抑制）

你是一位系统脱敏治疗引导者。你必须严格按照以下 4 个阶段推进，每个阶段有明确的转换条件。

## 阶段管理（你必须跟踪当前阶段并在回复末尾报告）

### 阶段 1：建立关系 + 确认目标（最多 2 轮对话）
- 温暖地询问用户想克服什么恐惧或焦虑
- 确认目标后，简要解释系统脱敏的原理："我们会在放松的状态下，从最轻微的情境开始，一步步面对恐惧"
- **转换条件**：用户明确说出恐惧目标 → 立即进入阶段 2
- **不要在阶段 1 停留超过 2 轮**，如果用户已经表达了目标，直接推进

### 阶段 2：放松训练（2-3 轮对话）
- 教用户一个具体的放松技术，选择以下之一：
  - 4-7-8 呼吸法（吸气 4 秒，屏住 7 秒，呼气 8 秒）
  - 渐进性肌肉放松（从脚到头逐步紧绷-放松）
- 引导用户实际练习一次，并确认他们感受到了放松
- **转换条件**：用户确认学会了放松技术 → 进入阶段 3

### 阶段 3：构建焦虑等级（2-3 轮对话）
- 引导用户列出 5-10 个与恐惧相关的情境
- 每个情境需要 SUD 评分（0-100，0=完全放松，100=极度恐惧）
- 情境必须从最轻微到最强烈排列
- 可以使用用户提供的面板来输入，也可以通过对话收集
- **转换条件**：收集到至少 5 个情境并排序 → 进入阶段 4

### 阶段 4：渐进想象暴露（持续进行）
- 从 SUD 最低的情境开始
- 每一轮：
  1. 先引导用户做放松练习（简短版，1-2 句话）
  2. 让用户想象该情境（用生动的感官描述帮助想象）
  3. 询问当前 SUD
  4. 如果 SUD < 该情境的目标 SUD，确认可以进入下一个情境
- **每次 SUD 提升不超过 10-15 分**
- 如果用户 SUD > 70 或要求停止 → 立即引导放松，暂停暴露

## 关键规则
- 你必须主动推进阶段，不要被动等待
- 每次回复末尾必须附加阶段记录
- 如果用户在某个阶段已经完成，直接说"很好，我们进入下一步"然后推进
- 保持温暖、支持的语气，但要有方向感

## 输出要求
在每轮回复的最末尾，附加一行记录（这段内容会被系统自动隐藏，用户看不到）：
<DESENSITIZE_RECORD>{"current_level":0,"sud_score":0,"stage":"goal_confirmation"}</DESENSITIZE_RECORD>

stage 的可选值："goal_confirmation" | "relaxation_training" | "hierarchy_building" | "exposure"
current_level: 当前正在处理的焦虑等级序号（从 0 开始）
sud_score: 用户最近报告的 SUD 分数
```

**组装函数（逐字）**：

```typescript
export function buildSystemPrompt(therapyMode: string): string {
  switch (therapyMode) {
    case 'cbt':
      return `${BASE_PROMPT}\n\n${CBT_PROMPT}`
    case 'desensitize':
      return `${BASE_PROMPT}\n\n${DESENSITIZE_PROMPT}`
    default:
      return BASE_PROMPT
  }
}
```

⚠️ 现状边界：prompt 要求模型在回复末尾输出 `<THERAPY_RECORD>` / `<DESENSITIZE_RECORD>` 标签且声称"会被系统自动隐藏"，但**当前前端没有任何剥离这些标签的代码**（旧版 MessageBubble 的 `stripInternalTags` 已随重构删除）——若模型遵循指令，用户会直接看到该 JSON 尾巴。复现时保持原样（这是现状，不是要修的 bug）。

### 6.2 治疗模式切换逻辑

- 模式常量（前端硬编码于 `ChatInterface.tsx` 的 `THERAPY_MODES`，与 `/api/v1/therapy/modes` 返回内容一致但相互独立、互不引用）：`general`（自由对话）/ `cbt`（CBT认知疗法）/ `desensitize`（系统脱敏）。
- 切换链路：桌面端 Tab 点击 → `setTherapyMode(mode.id)`（仅本地 React state）→ **下一次**点击"+ 新对话"时随 `POST /api/v1/chat/sessions` 的 body `{therapy_mode}` 持久化到 `chat_sessions.therapy_mode` 列 → 该会话之后每次对话，stream 路由读 `session.therapy_mode || 'general'` → `buildSystemPrompt()`。
- 关键现状语义：**模式绑定在会话上、创建时一次性固化**。对已开启的会话切换 Tab 不改变其模式；无 PATCH 会话接口。移动端顶栏只显示当前模式名，无切换入口。
- 兜底链：sessions POST 缺省 body → `'default'` → buildSystemPrompt 落入 default 分支 → BASE_PROMPT（效果等同 general）。

### 6.3 危机关键词检测规则（safety.ts，关键词表逐字收录）

算法：将用户消息 `toLowerCase()` 后，对关键词表逐个做**子串包含**匹配（关键词也 toLowerCase），命中任意一个即判定危机（level 恒为 `'high'`），返回固定文案；否则返回 `null`。无正则、无分词、无多级分级。

**CRISIS_KEYWORDS 全表逐字（14 个，10 中文 + 4 英文）**：

```typescript
const CRISIS_KEYWORDS = [
  '自杀', '不想活', '想死', '结束生命', '活不下去',
  '自残', '割腕', '跳楼', '上吊', '吃药',
  'suicide', 'kill myself', 'end my life', 'self-harm',
]
```

**CRISIS_RESPONSE 固定回复全文逐字**：

```
我听到你说的这些话，我很担心你现在的安全。

你的感受很重要，你值得被帮助。请现在就联系专业的危机干预热线：

📞 全国24小时心理援助热线：400-161-9995
📞 北京心理危机研究与干预中心：010-82951332
📞 生命热线：400-821-1215

如果你在身边有人，请告诉他们你需要帮助。你不需要独自面对这些。
```

**detectCrisis 函数签名与返回 shape（逐字）**：

```typescript
export function detectCrisis(message: string): {
  isCrisis: boolean
  level: string
  response: string
} | null
```

接入点：**仅 stream 路由**（端点 #12），且位于鉴权之前；messages（#11）与 ai/chat（#14）不做危机检测。已知误报边界：`吃药` 会匹配"我在按时吃药"等正常语句——现状如此，如实记录。危机响应不写库、对话历史中不留痕。

### 6.4 对话流式响应端到端流程

```
用户在 ChatInput 按 Enter（或点发送按钮）
→ ChatInterface.handleSend(content)
   ① 若无 currentSessionId：先 await handleCreateSession() + 睡 100ms（等 store 更新的权宜之计）
   ② 本地乐观插入两条消息：user(临时id `temp-${Date.now()}`) + assistant 空壳(`assistant-${Date.now()}`)
   ③ setLoading(true)
   ④ POST /api/v1/chat/sessions/{sid}/messages/stream  (Bearer, {message})
      sid 取 currentSessionId，兜底 useStore.getState().currentSessionId
→ 服务端（见 §5.2 #12）：危机检测 → 鉴权 → 查会话 → 取20条历史 → build prompt
   → fetch LLM(stream:true, max_tokens:1024)
   失败重试：状态码 429/500/502/503 → sleep 2s → 重试 1 次
→ 服务端逐行解析 Anthropic SSE（"data: " 前缀、跳过 "[DONE]" 与坏 JSON 行），
   content_block_delta → 下发 {"type":"delta"}，message_stop → {"type":"done"}；
   同时在闭包累积 fullReply
→ 前端 reader 循环读流：按 \n 切行、残余存 buffer；解析 "data: " JSON；
   type==='delta' 时 fullReply += text，用 requestAnimationFrame 节流（rafId 守卫，每帧至多刷一次 UI），
   flushUI 将 store.messages 中 assistant 空壳的 content 替换为 fullReply
→ 流结束：cancelAnimationFrame + 最终 flushUI + loadSessions()（刷新侧边栏标题/计数）
→ 服务端 finally：落库 user/assistant 两条 + 更新会话（count/updated_at/条件标题）
→ 前端 catch（HTTP 非 2xx 或读流抛错）：assistant 空壳内容替换为固定文案
   "抱歉，我遇到了一些问题。请稍后再试。"
→ finally setLoading(false)
```

协议错位（现状如实记录）：危机命中时服务端返回 JSON 而非 SSE，前端仍按 SSE 逐行解析——`{"type":"crisis",...}` 不带 `data: ` 前缀，解析循环不会产生任何 delta，assistant 气泡最终停留为空字符串。**危机文案实际未展示给用户**——这是现状快照，复现时保持。

### 6.5 边界条件清单（现状行为含缺陷，复现必须原样保持）

1. **history 401**：前端加载历史消息不带 token → 永远 401 → 切换会话时消息区不更新（仅 console.error）。
2. **stream 无属主校验**：登录用户 A 可对用户 B 的 session id 发消息并获得基于 B 历史的回复。
3. **messages 路由零鉴权**：未登录也可对任意已知 session id 调非流式接口。
4. **危机检测先于鉴权**（stream）：未登录请求含危机词 → 200 crisis JSON。
5. **时间戳共享**：每轮 user/assistant 两条消息 `created_at` 完全相同；history 按 created_at asc 排序时依赖数据库对同值行的返回序（实践上按插入序 user 先于 assistant）。
6. **上下文窗口不对称**：stream 取最近 20 条，messages 取 50 条；均不做 token 裁剪，超长会话可能超 LLM 上限（无处理）。
7. **标题生成**：仅当 title 为空/'新对话' 时用首条消息截断（>20 字符加 `...`）；危机命中的消息不落库故不会成为标题。
8. **部分回复落库**：流中断时已累积的 fullReply（可能为空串）仍作为 assistant 消息落库。
9. **登出为纯前端行为**：清 store + localStorage(`keyi-user`) + reload；不调 /auth/logout；token 在 Supabase 侧仍有效直至过期。
10. **refresh 接口存在但无人调用**：token 过期后所有请求 401，前端无自动刷新，需要用户手动退出重登。
11. **欢迎消息**（id='welcome'，content 见 §7.4，timestamp 固定 `'2026-01-01T00:00:00.000Z'`）仅存在于前端 store，从不落库；新建会话后 `setMessages([WELCOME_MESSAGE])`。
12. **sessions POST 默认 therapy_mode='default'**（非 'general'），依赖 buildSystemPrompt 的 default 分支兜底。
13. **匿名试用死循环**："暂不登录，先试试" → `setUser(null,'')` + reload → 仍是登录页（见 §1.2 F17）。
14. **LLM 未配置**（缺 LLM_BASE_URL 或 LLM_API_KEY）→ 500 `{error:"AI 服务未配置"}`。

<!-- SECTION 6 END -->

---

## 7. 核心文件逐一说明【文档主体】

> 覆盖范围：frontend/src 全部 35 个业务源文件 + public 资产 + 前端 5 个配置文件 + CI + 后端残骸 3 文件 + 根目录文档/配置。13 个 API route.ts 的请求/响应契约已在 §5 逐端点给出，本章 §7.10 以逐文件实现要点表补齐；prompts.ts/safety.ts 的白名单内容已在 §6 逐字收录，本章给出文件结构说明并交叉引用。

### 7.1 frontend/src/lib/supabase.ts（23 行）——双 Supabase 客户端工厂

- **职责**：向所有 API 路由提供两个模块级单例 Supabase 客户端。
- **全文逐字**（文件很短，直接收录）：

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (_client) return _client
  _client = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_KEY ?? '',
  )
  return _client
}

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin
  _admin = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? '',
  )
  return _admin
}
```

- **实现要点**：惰性初始化 + 模块级缓存（每个 serverless 实例仅创建一次）；`supabase()`（anon key）只用于 auth 路由的登录/注册/刷新，`supabaseAdmin()`（service key）用于 token 校验（`auth.getUser(token)`）与全部数据读写（绕过 RLS）。
- **边界条件**：环境变量缺失时以空串创建 client，不抛错——首次真正调用 Supabase API 时才报错（fetch 失败/401）。

### 7.2 frontend/src/lib/prompts.ts ——系统提示词（prompt IS the product）

- **职责**：定义三个系统 prompt 常量与拼接函数，是产品的核心资产。
- **内容**：`BASE_PROMPT`、`CBT_PROMPT`、`DESENSITIZE_PROMPT` 三个模块级模板字符串常量（均不导出）+ `buildSystemPrompt(therapyMode: string): string` 唯一导出函数。**四者全文已在 §6.1 逐字收录**，复现时按 §6 原文创建本文件即可。
- **消费方**：`ai/chat`、`messages`、`stream` 三个路由 import `buildSystemPrompt`。
- **边界条件**：`buildSystemPrompt` 对未知 therapyMode（含 'default'、undefined）走 default 分支返回 `BASE_PROMPT`。

### 7.3 frontend/src/lib/safety.ts ——危机关键词检测

- **职责**：定义 `CRISIS_KEYWORDS`（14 词，中英混合）、`CRISIS_RESPONSE`（热线文案）、`detectCrisis(message: string): { isCrisis: boolean; level: string; response: string } | null`。**三者全文已在 §6.3 逐字收录**。
- **实现要点**：`detectCrisis` 将输入 `toLowerCase()` 后用 for-of 循环 + `includes` 做子串匹配，命中即返回 `{isCrisis:true, level:'high', response:CRISIS_RESPONSE}`，未命中返 `null`；无正则、无分词、无上下文判断（"我不想活得这么累"也会命中 "不想活"）。
- **消费方**：仅 `stream/route.ts`（在鉴权之前调用）。`messages` 与 `ai/chat` 路由**未接入**。

### 7.4 frontend/src/components/ChatInterface.tsx（290 行）——聊天主界面容器（前端核心）

- **职责**：聊天页登录态下的唯一顶层组件：编排 Sidebar/MessageList/ChatInput，负责会话 CRUD 调用、SSE 流式消费、治疗模式 Tab、移动端抽屉。
- **模块级常量（逐字收录）**：

```ts
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '你好，我是林序，一个温暖、专业、有同理心的AI心理医生。\n\n在这里，你可以畅所欲言，我会用心倾听、陪伴和支持你。\n\n今天有什么想聊的吗？',
  timestamp: '2026-01-01T00:00:00.000Z',
};

const THERAPY_MODES = [
  { id: 'general', name: '自由对话' },
  { id: 'cbt', name: 'CBT认知疗法' },
  { id: 'desensitize', name: '系统脱敏' },
];

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

- **本地 state**：`loading`（发送中）、`sidebarOpen`（移动抽屉）、`isCreatingSession`（防重复建会话）、`therapyMode`（默认 `'general'`）。全局数据全部来自 `useStore()`。
- **两个 useEffect**：① `token` 变化且非空 → `loadSessions()`；② `messages.length === 0 && !currentSessionId` → `setMessages([WELCOME_MESSAGE])`（首屏欢迎语）。
- **loadSessions**：`GET /api/v1/chat/sessions`（带 authHeaders）；响应取 `data?.sessions || data`，仅当为数组时 `setSessions`。
- **loadSessionHistory（缺陷点，逐字收录）**：

```ts
const loadSessionHistory = async (sessionId: string) => {
  try {
    const res = await fetch(`/api/v1/chat/sessions/${sessionId}/history`);
    const data = await res.json();
    const messagesData = data?.messages || data;
    if (Array.isArray(messagesData)) setMessages(messagesData);
  } catch (err) {
    console.error('加载历史消息失败:', err);
  }
};
```

  fetch **未带 authHeaders** → 服务端 401 → `data` 为 `{error:...}` 非数组 → 静默不更新消息区（§6.5 #1）。复现必须保持不带头。
- **handleCreateSession**：`isCreatingSession` 守卫 → `POST /api/v1/chat/sessions`，body `{ therapy_mode: therapyMode }`（★ 模式在此一次性固化）→ 成功后以**前端本地构造**的 Session 对象（title '新对话'、`new Date().toISOString()`、count 0）调 `addSession` + `setCurrentSession` + `clearMessages()` + `setMessages([WELCOME_MESSAGE])`。不使用服务端返回的 started_at。
- **handleSelectSession**：`setCurrentSession(sessionId)` + `loadSessionHistory(sessionId)`（后者必 401，见上）。
- **handleDeleteSession**：`e.stopPropagation()` → 原生 `confirm('确定要删除这个对话吗？')` → `DELETE /api/v1/chat/sessions/{id}`（带 auth）→ `removeSession`；若删的是当前会话再 `clearMessages()` + `setCurrentSession(null)`。不检查响应状态码（失败也会从 UI 移除）。
- **handleSend（核心流式消费，关键片段逐字）**：

```ts
const handleSend = async (content: string) => {
  if (!currentSessionId) {
    await handleCreateSession();
    await new Promise(r => setTimeout(r, 100));   // 等 store 更新的权宜之计
  }

  const userMsgId = `temp-${Date.now()}`;
  const assistantMsgId = `assistant-${Date.now()}`;

  addMessage({ id: userMsgId, role: 'user', content, timestamp: new Date().toISOString() });
  addMessage({ id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date().toISOString() });
  setLoading(true);

  try {
    const sid = currentSessionId || useStore.getState().currentSessionId;
    if (!sid) throw new Error('No session');

    const response = await fetch(`/api/v1/chat/sessions/${sid}/messages/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ message: content }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullReply = '';
    let rafId = 0;

    const flushUI = () => {
      const currentMessages = useStore.getState().messages;
      setMessages(currentMessages.map(m => m.id === assistantMsgId ? { ...m, content: fullReply } : m));
      rafId = 0;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'delta' && data.text) {
              fullReply += data.text;
              if (!rafId) rafId = requestAnimationFrame(flushUI);
            }
          } catch { /* skip */ }
        }
      }
    }

    if (rafId) cancelAnimationFrame(rafId);
    flushUI();
    loadSessions();
  } catch {
    const msgs = useStore.getState().messages.map(m =>
      m.id === assistantMsgId ? { ...m, content: '抱歉，我遇到了一些问题。请稍后再试。' } : m
    );
    setMessages(msgs);
  } finally {
    setLoading(false);
  }
};
```

  实现要点：只消费 `type==='delta'` 事件（`message_start`/`done`/`error`/`crisis` 均被忽略）；rAF 节流保证每帧至多一次 store 更新；`fullReply` 闭包累积，`flushUI` 用 `useStore.getState()` 取最新消息数组避免闭包过期。
- **JSX 结构**：移动端抽屉遮罩（`.drawer-overlay.active`）+ 固定定位 280px 抽屉（`cubic-bezier(0.23,1,0.32,1)` 300ms 滑入，注意样式为 `inset:0; left:auto` 且初始 `translateX(-100%)`——原样保留）+ 桌面常驻 `<Sidebar>` + 主区（移动端顶栏：汉堡按钮/Georgia 衬线"林序"/当前模式名；桌面端模式 Tab 条：激活态 `#2f5b4f` + 底部 3px 圆角指示条，hover 变 `#4c4037`）+ `<MessageList>` + `<ChatInput>`。全局背景 `#fbf6ee`。
- **handleLogout**：`logout()` + `window.location.reload()`（不调 /auth/logout 接口）。
- **边界条件**：切换 Tab 只改本地 `therapyMode`，对已有会话不产生任何请求（§1.2 F20）；`handleSend` 中创建会话后固定睡 100ms 再从 `useStore.getState()` 兜底取 sid——若创建失败 sid 仍为 null → throw → 错误文案。

### 7.5 frontend/src/components/AuthForm.tsx（171 行）——登录/注册表单

- **职责**：未登录态的全屏表单，登录/注册二合一（`isLogin` 切换），含匿名试用入口。
- **state**：`isLogin`(true)/`email`/`password`/`error`/`success`/`loading`；`success` 显示 10 秒后自动清除（`setTimeout` + cleanup）。
- **handleSubmit 要点**：`API_URL = process.env.NEXT_PUBLIC_API_URL || ''`；endpoint 按 `isLogin` 选 `/api/v1/auth/login` 或 `/api/v1/auth/register`；非 2xx 时取 `data.error || data.detail || '请求失败'`，若消息含 `'Email not confirmed'` 或 `'验证'` 则替换为固定中文提示 `'请先验证邮箱后再登录。查收您的邮件，点击验证链接后刷新页面再试。'`；成功后 `setUser(data.user || { id: '', email }, data.access_token, data.refresh_token)` + `window.location.reload()`。
  - ⚠️ 现状缺陷：**注册成功也走 setUser+reload 分支**，但 register 接口只返回 `{user, message}` 无 access_token → `setUser(user, undefined)` → localStorage 不写入（store 只在 `user && token` 时写）→ reload 后仍是登录页。`success` state 实际从未被 set（只被清除）。原样保留。
- **UI 要点**：品牌区（Georgia 衬线 2.5rem "林序" `#2f5b4f` + "在林间找到安宁"）；卡片 `#fffdf8`、radius 16px、阴影 `0 20px 52px rgba(32,25,20,0.12)`；输入框 focus 内联事件改边框 `#2f5b4f` + `0 0 0 3px rgba(47,91,79,0.15)` 光晕；密码 `minLength={6}`；注册态下方显示三条"注册说明"列表（验证邮件流程）；底部分隔线下"暂不登录，先试试"按钮：`onClick={() => { setUser(null, ''); window.location.reload(); }}`（死循环，§1.2 F17，原样保留）。

### 7.6 侧边栏组件组（components/sidebar/）

**7.6.1 Sidebar.tsx（133 行）**

- **职责**：双形态侧边栏：桌面端常驻（`hidden md:flex w-60`）/ 移动端抽屉（`isMobileDrawer` prop，280px 固定定位），同一份 `sidebarContent` JSX 复用。
- **Props**：`sessions/currentSessionId/isCreatingSession/onCreateSession/onSelectSession/onDeleteSession/user/onLogout/isMobileDrawer?/onClose?`——纯受控组件，无自有数据逻辑。
- **结构（上→下）**：① 品牌头（Georgia 衬线"林序" `#2f5b4f` + "森林里的倾听者"；抽屉态额外渲染 ✕ 关闭按钮）；② "+ 新对话"按钮（`#2f5b4f`，hover `#274d43`，创建中显示'创建中...'并 disabled）；③ 会话列表滚动区（空时显示"暂无历史记录"，`#9b5b32` 透明度 0.6；非空时 map 为 `SessionItem`，选中时额外 `onClose?.()` 关抽屉）；④ 底栏（有 user：邮箱 truncate max-w-[120px] + "退出"；无 user：整宽"退出登录"按钮）。
- **配色**：背景 `#f8f3ea`，右边框 `1px solid #ded2c3`。

**7.6.2 SessionItem.tsx（75 行）**

- **职责**：单个会话条目：标题截断 + 相对时间 + 悬停显示删除按钮（`opacity-0 group-hover:opacity-100`，垃圾桶 SVG，hover 变 `#b33a3a`）。
- **两个工具函数（逐字收录）**：

```ts
function getSessionTitle(session: Session): string {
  if (session.title && session.title !== '新对话') {
    return session.title.length > 15 ? session.title.substring(0, 15) + '...' : session.title;
  }
  return '新的对话';
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}
```

- **实现要点**：时间源为 `session.updated_at || session.started_at`；激活态背景 `rgba(47,91,79,0.08)` + 边框 `rgba(47,91,79,0.15)`，hover 非激活态背景 `#f1e3cf`；注意服务端 title 为 '新对话' 时 UI 显示为"新的对话"（两个文案故意不同，原样保留）。

### 7.7 聊天组件组（components/chat/）——纯 UI，分组说明

| 文件 | 行数 | 职责与实现要点 |
|------|------|----------------|
| `ChatInput.tsx` | 73 | 受控 textarea：Enter 发送（`e.preventDefault()`）、Shift+Enter 换行；`input.trim() && !loading` 才发送并清空；placeholder "在这里输入你想说的话..."；样式：minHeight 48px / maxHeight 34vh / fontSize 14px / lineHeight 1.6 / radius 12px，focus 光晕同 AuthForm；发送按钮 44×44 `#2f5b4f` 纸飞机 SVG，`disabled={loading || !input.trim()}`；外层限宽 `var(--chat-max-width)` 居中，顶边框 `#ded2c3`，背景 `#fffdf8` |
| `MessageList.tsx` | 49 | 滚动容器：`useEffect([messages])` 时 `messagesEndRef.scrollIntoView({behavior:'smooth'})` 自动滚底；map 渲染 `MessageBubble`（key=`msg.id \|\| index`）；`loading` 时尾部追加打字指示器：三个 2×2 圆点 `#9b5b32` 透明度 0.5，`animate-bounce` 错峰 delay 0/75ms/150ms，气泡样式同 assistant（`16px 16px 16px 4px` 圆角）；内容区限宽 `var(--chat-max-width)`，行间距 `space-y-5` |
| `MessageBubble.tsx` | 37 | 单条气泡：`isUser` 决定左右对齐与样式类（`chat-bubble-user`/`chat-bubble-assistant`，定义在 globals.css）；时间戳格式化为 `HH:mm`（手写 `padStart(2,'0')`）右对齐、透明度 0.6；`whiteSpace:'pre-wrap'` + `wordBreak:'break-word'`；user 气泡限宽 `min(70%, 480px)`，assistant 占满 100% |

边界：欢迎消息固定时间戳 `2026-01-01T00:00:00.000Z` → 气泡永远显示 `08:00`（UTC+8 本地化）；流式期间 assistant 空内容气泡与打字指示器**同时存在**（空气泡 + 三点动画各一个）。

### 7.8 App 入口层（app/ 根级文件）

**7.8.1 app/chat/page.tsx（39 行）——聊天页门控**

```
'use client' → mounted 守卫（useState(false)，useEffect 置 true）避免 hydration 闪烁
  → 未 mounted：居中加载屏（"可意" 4xl 粗体 text-primary-600 + "加载中..."）
  → 同一 useEffect 内：若 store 无 token 且无 user → restoreUser() 读 localStorage，
     saved.user && saved.token 才 setUser（注意：refreshToken 不传，恢复后丢失）
  → mounted 后：token && user ? <ChatInterface/> : <AuthForm/>
```

边界：页面无任何路由重定向，登录态切换完全靠 `window.location.reload()` 后重新走 restoreUser 分支。

**7.8.2 app/layout.tsx（101 行）——根布局 + SEO**

- `metadata` 导出：title "可意AI心理医生：免费在线 CBT 认知疗法 + 情绪疏导 | 24小时AI心理咨询"；description 提及"CBT/系统脱敏/情绪记录分析"；keywords 8 个中文词（AI心理医生/在线心理咨询/CBT认知疗法/免费心理辅导/情绪疏导/系统脱敏/焦虑自助/心理健康）；openGraph（locale zh_CN、siteName "可意AI"）、twitter card、canonical `https://keyi.app`、robots index/follow true。
- body 前 `<head>` 内嵌 `application/ld+json`：`@graph` 三节点—— Organization（`sameAs: ["https://github.com/121212165/keyi"]`）、SoftwareApplication（category HealthApplication、price 0 CNY）、WebSite，均用 `@id` 互引。
- body：`className="antialiased"`，内层 `div.min-h-screen.bg-gradient-to-b.from-warm-50.to-white` 包 children（warm-50 来自 globals.css `@theme` 的 `--color-warm-50:#fdf5ef`）。
- 注意：全站只有这一个 layout，`lang="zh-CN"`；未引入任何字体包（Inter 仅声明在 font-family 链，未通过 next/font 加载）。

**7.8.3 app/page.tsx（195 行）——营销落地页（服务端组件）**

纯静态长页，无 state，章节顺序与关键文案：

1. Hero：H1 "可意AI心理医生：免费在线 CBT 认知疗法 + 情绪疏导"；CTA `<Link href="/chat">免费开始对话</Link>` + 锚点 `#features` "了解更多"。
2. "什么是可意AI心理医生？"：文案宣称"由智谱AI GLM-4.7-Flash大模型驱动"（★ 与实际 Anthropic 协议不符，§1.3 已说明，原样保留）；引用"Meta分析效应量0.73"。
3. `#features` 三卡片：💬 自由对话 / 🧠 CBT 认知疗法（认知三角、ANTs）/ 🌊 系统脱敏。
4. "如何使用"四步：选择模式→开始对话→获得引导→持续成长。
5. "适合谁使用"四项 ✅ 列表。
6. ⚠️ 免责声明卡（amber 配色）：含热线 **400-161-9995** 与 **010-82951332**（与 safety.ts 危机文案同源）。
7. FAQ 五条（免费吗/能替代真人吗/CBT是什么/对话会保存吗/系统脱敏是什么）。
8. CTA "准备好开始了吗？" + Footer（"温暖、专业、有同理心的AI心理健康助手"）。

风格注意：落地页用的是 Tailwind 灰色系 + `primary-600`/`warm-50` 主题色乗类（依赖 globals.css `@theme` 注册），与聊天区的内联 hex 风格不同——两套写法并存是现状。

**7.8.4 app/globals.css（95 行）——Warm Editorial 设计系统（关键常量逐字）**

```css
:root {
  --background: #fbf6ee;  --foreground: #201914;  --surface: #fffdf8;
  --surface-warm: #f1e3cf; --muted: #7a6d63;       --border: #ded2c3;
  --border-soft: #eee4d7;  --accent: #2f5b4f;      --accent-terra: #9b5b32;
  --success: #4f8a4f;      --warn: #c9822f;        --danger: #b33a3a;
  --chat-max-width: 680px;
}
```

- `@import "tailwindcss"`（v4 写法，无 tailwind.config.js）；`@theme inline` 将上述变量映射为 `--color-*`，并定义 `--font-sans`(Inter 链)/`--font-mono`，以及两套完整色阶：`--color-primary-50..900`（森林绿，500=`#2f5b4f`、600=`#274d43`）与 `--color-warm-50..900`（陶土色，500=`#9b5b32`）。
- `body`：背景/前景变量 + Inter 字体链。
- 气泡类：`.chat-bubble-user { @apply text-white; background:#2f5b4f; border-radius:16px 16px 4px 16px; }`；`.chat-bubble-assistant { background:#fffdf8; color:#201914; border:1px solid #ded2c3; border-radius:16px 16px 16px 4px; }`。
- `.drawer-overlay`：固定全屏 `rgba(32,25,20,0.3)`，z-40，opacity 过渡 200ms `cubic-bezier(0.23,1,0.32,1)`，`.active` 时 opacity:1 + pointer-events:auto。

**7.8.5 app/sitemap.ts（45 行）与 public/robots.txt（20 行）**

- sitemap：Next Metadata API，baseUrl `https://keyi.app`，6 条：`/`(weekly, 1) → `/what-is-cbt`、`/ai-psychologist`、`/systematic-desensitization`(均 monthly, 0.8) → `/free-online-therapy`、`/gad7-anxiety-test`(monthly, 0.7)；`lastModified: new Date()`。⚠️ `/chat` 故意不在 sitemap。
- robots.txt 全文逐字：

```txt
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: GPTBot
Disallow: /

Sitemap: https://keyi.app/sitemap.xml
```

- public/ 其余：`favicon.ico`（在 src/app/ 下）与 5 个 create-next-app 默认 SVG（file/globe/next/vercel/window），均未被引用，原样保留。

### 7.9 SEO 文章页组（5 个静态服务端组件，分组说明）

公共模式（五页一致）：每页导出自己的 `export const metadata: Metadata`（独立 title/description/keywords/canonical `https://keyi.app/<slug>`）；正文为 `max-w-3xl` 左对齐长文（落地页风格的 Tailwind 灰色系）；均含指向 `/chat` 的 CTA `<Link>`与页尾免责/热线提示；页首有"← 返回首页"链接；无任何客户端交互（无 'use client'）。

| 路由 | 文件（行数） | 内容要点 |
|------|--------------|----------|
| `/what-is-cbt` | what-is-cbt/page.tsx（169） | CBT 定义、认知三角、ANTs 常见类型列表、适用症、与可意 CBT 模式的关系 |
| `/ai-psychologist` | ai-psychologist/page.tsx（161） | AI 心理医生能/不能做什么、与真人咨询对比表、隐私说明、使用建议 |
| `/systematic-desensitization` | systematic-desensitization/page.tsx（160） | Wolpe 系统脱敏四阶段（与 DESENSITIZE prompt 同源理论）、SUD 量表、恐惧阶梯示例 |
| `/free-online-therapy` | free-online-therapy/page.tsx（146） | 免费在线心理工具盘点/对比，可意定位与适用边界 |
| `/gad7-anxiety-test` | gad7-anxiety-test/page.tsx（198） | GAD-7 焦虑量表：7 题题干与 0-3 计分说明、分数段解读（0-4/5-9/10-14/15-21）、静态展示**无交互计分**，引导去 /chat 聊焦虑 |

复现策略：此五页为纯内容营销页，不影响任何功能链路；若逐字复现成本过高，可按上表要点重写同主题内容，但**路由 slug、metadata.canonical、与 sitemap.ts 的 6 条 URL 必须严格一致**。

### 7.10 API 路由文件逐个实现要点（13 个 route.ts；契约见 §5）

| # | 文件（frontend/src/app/api/ 下） | 导出 | 实现要点（补 §5 未尽细节） |
|---|--------------------------------|------|--------------------------------|
| 1 | `health/route.ts` | GET | 直接 `NextResponse.json({status:'ok'})`，无任何依赖 |
| 2 | `v1/auth/register/route.ts` | POST | `supabase().auth.signUp({email,password})`；成功返 `{user:{id,email}, message:'注册成功，请查收验证邮件'}`；Supabase 错误透传 `{error: error.message}` 400 |
| 3 | `v1/auth/login/route.ts` | POST | `signInWithPassword`；成功返 `{access_token, refresh_token, user:{id,email}}`；失败 401 |
| 4 | `v1/auth/logout/route.ts` | POST | 读 Bearer 头但**不验证**，固定返 `{message:'已退出登录'}`（无服务端会话可吊销） |
| 5 | `v1/auth/me/route.ts` | GET | Bearer → `supabaseAdmin().auth.getUser(token)` → `{id,email}`；无/坏 token 401 |
| 6 | `v1/auth/refresh/route.ts` | POST | body `{refresh_token}` → `supabase().auth.refreshSession`；返新 access/refresh token 对 |
| 7 | `v1/therapy/modes/route.ts` | GET | 硬编码返回三模式数组（id/name/description），无鉴权、无 DB |
| 8 | `v1/ai/chat/route.ts` | POST | 无鉴权；body `{message, therapy_mode?}` → buildSystemPrompt → 非流式调 LLM → `{reply}`；不落库、无历史、无危机检测 |
| 9 | `v1/chat/sessions/route.ts` | POST/GET | POST：鉴权 → `crypto.randomUUID()` 建 id → insert（therapy_mode 缺省 `'default'`，§6.5 #12）；GET：鉴权 → `eq('user_id', user.id)` 按 started_at 倒序 → `{sessions:[...]}` |
| 10 | `v1/chat/sessions/[id]/route.ts` | DELETE | 鉴权 + **校验属主**（`eq('user_id')` 查不到返 404）→ 先删 messages 再删 session（双 delete，不依赖 CASCADE） |
| 11 | `v1/chat/sessions/[id]/history/route.ts` | GET | 鉴权 + 属主校验 → messages 按 created_at 升序 limit 50 → `{messages:[{id,role,content,emotion,created_at}]}`（前端调用不带 token 故实际永远 401） |
| 12 | `v1/chat/sessions/[id]/messages/route.ts` | POST | **零鉴权**（§6.5 #3）；取50条历史 → 非流式 LLM → 落库两条 + 更新会话 → `{reply}` |
| 13 | `v1/chat/sessions/[id]/messages/stream/route.ts`（259 行，核心） | POST | 完整流程见 §6.4：危机检测（鉴权前）→ 鉴权 → 查会话（**不校属主**）→ 20条历史 → LLM SSE 转译（429/5xx 重试 1 次）→ finally 落库 |

公共实现模式：每个需鉴权路由内联同构代码——取 `request.headers.get('authorization')`，`startsWith('Bearer ')` 切片，`supabaseAdmin().auth.getUser(token)`，失败返 `NextResponse.json({error:'未登录'},{status:401})`（无共享中间件/工具函数，复制粘贴风格，原样保留）；LLM 调用均为 `fetch(\`${process.env.LLM_BASE_URL}/v1/messages\`, {headers:{'x-api-key':..., 'anthropic-version':'2023-06-01', 'Content-Type':'application/json'}})`。

#### 7.10.1 stream/route.ts 全文逐字收录（260 行，核心端点，白名单级精度）

该文件是整个产品的 P0 链路（危机检测 + 鉴权 + 上下文 + LLM 流式转译 + 落库），为保证复现精度全文收录（路径 `frontend/src/app/api/v1/chat/sessions/[id]/messages/stream/route.ts`）：

```ts
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSystemPrompt } from '@/lib/prompts'
import { detectCrisis } from '@/lib/safety'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '请提供消息内容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const crisis = detectCrisis(message)
    if (crisis) {
      return new Response(JSON.stringify({
        type: 'crisis',
        message: crisis.response,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未提供认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.slice(7)
    const { data: userData, error: authError } = await supabaseAdmin().auth.getUser(token)
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: '认证失败，请重新登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: session, error: sessionError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: '会话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: history } = await supabaseAdmin()
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    const messages = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const systemPrompt = buildSystemPrompt(session.therapy_mode || 'general')

    const llmBase = process.env.LLM_BASE_URL
    const llmKey = process.env.LLM_API_KEY

    if (!llmBase || !llmKey) {
      return new Response(JSON.stringify({ error: 'AI 服务未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let llmRes = await fetch(`${llmBase}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': llmKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text().catch(() => '')
      console.error('LLM 流式请求失败:', llmRes.status, errText)

      if ([429, 500, 502, 503].includes(llmRes.status)) {
        await new Promise(r => setTimeout(r, 2000))
        const retryRes = await fetch(`${llmBase}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': llmKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            stream: true,
          }),
        })
        if (retryRes.ok && retryRes.body) {
          llmRes = retryRes
        } else {
          return new Response(JSON.stringify({ error: 'AI 服务暂时繁忙，请稍后再试' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      } else {
        return new Response(JSON.stringify({ error: 'AI 服务暂时不可用，请稍后重试' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    if (!llmRes.body) {
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()
    const now = new Date().toISOString()
    let fullReply = ''

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const reader = llmRes.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'message_start', message_id: userMessageId, reply_id: assistantMessageId })}\n\n`)
        )

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue

              const jsonStr = line.slice(6).trim()
              if (jsonStr === '[DONE]') continue

              try {
                const event = JSON.parse(jsonStr)

                if (event.type === 'content_block_delta' && event.delta?.text) {
                  fullReply += event.delta.text
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`)
                  )
                }

                if (event.type === 'message_stop') {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
                  )
                }
              } catch {
                // skip malformed data
              }
            }
          }
        } catch (streamError) {
          console.error('流读取错误:', streamError)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: '流读取中断' })}\n\n`)
          )
        } finally {
          controller.close()

          try {
            await supabaseAdmin().from('messages').insert({
              id: userMessageId,
              session_id: sessionId,
              role: 'user',
              content: message,
              created_at: now,
            })

            await supabaseAdmin().from('messages').insert({
              id: assistantMessageId,
              session_id: sessionId,
              role: 'assistant',
              content: fullReply,
              created_at: now,
            })

            const newCount = (session.message_count || 0) + 2
            const updateFields: Record<string, unknown> = {
              message_count: newCount,
              updated_at: now,
            }

            if (!session.title || session.title === '新对话') {
              updateFields.title = message.length > 20
                ? message.slice(0, 20) + '...'
                : message
            }

            await supabaseAdmin()
              .from('chat_sessions')
              .update(updateFields)
              .eq('id', sessionId)
          } catch (dbError) {
            console.error('保存流式消息失败:', dbError)
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('流式消息接口错误:', error)
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

阅读要点（与 §6.4/§6.5 印证）：危机分支在鉴权之前且返回普通 JSON；查会话只按 id `.single()`，**无 `eq('user_id')` 属主校验**；重试只针对 429/500/502/503 且仅一次；落库在 ReadableStream 的 finally 中执行（即使流中断也落库 partial `fullReply`）；user/assistant 两条共用同一 `now` 时间戳；条件标题截断阈值 20 字符。

### 7.11 前端配置文件组

| 文件 | 内容要点 |
|------|----------|
| `next.config.ts`（8 行） | 空配置：`const nextConfig: NextConfig = { /* config options here */ };` 全默认 |
| `tsconfig.json`（35 行） | target ES2017、`strict: true`、`moduleResolution: "bundler"`、`jsx: "react-jsx"`、plugin `next`、路径别名 `"@/*": ["./src/*"]`；include 含 `.next/types/**/*.ts`、`.next/dev/types/**/*.ts`、`**/*.mts` |
| `postcss.config.mjs`（8 行） | 唯一插件 `"@tailwindcss/postcss": {}`（Tailwind v4） |
| `eslint.config.mjs`（19 行） | flat config：`defineConfig([...nextVitals, ...nextTs, globalIgnores(['.next/**','out/**','build/**','next-env.d.ts'])])`，import 自 'eslint/config' 与 'eslint-config-next/*' |
| `frontend/.gitignore` | create-next-app 标准（node_modules/.next/out/build/.env* 等） |
| 根 `.gitignore` | Python 产物（`__pycache__`/.venv）+ node 产物 + `.env*` + IDE + 日志（双后端时代遗留，覆盖两种技术栈） |
| `.github/workflows/ci.yml`（24 行） | name CI；push/PR 到 main\|master；单 job `build`：ubuntu-latest，`working-directory: frontend`，checkout@v4 → setup-node@v4（node 20、cache npm、cache-dependency-path frontend/package-lock.json）→ `npm ci` → `npm run lint` → `npm run build` |

### 7.12 后端残骸文件组（backend/，不可运行，原样复现）

- `backend/api/index.py`：全文已在 §5.3 逐字收录（`from app.main import app` + `handler = Mangum(app, lifespan="off")`）。`app/` 包不存在 → ImportError。
- `backend/requirements.txt`：全文已在 §2.2 逐字收录。
- `backend/vercel.json`：全文已在 §2.7 逐字收录。
- 复现要求：三文件按原路径原内容放置即可，**不要补写 app/ 使其可运行**（那将偏离现状快照）。

### 7.13 根目录文档与 docs/（非运行态资产）

| 文件 | 性质 | 复现策略 |
|------|------|----------|
| `README.md` | 项目介绍，技术栈段落已过时（FastAPI/Railway） | 保留原文；内容与实现冲突处以本文档为准 |
| `FIRST-PRINCIPLES-RECONSTRUCTION.md`（45 行） | 未来计划：第一性原理论证（见 §10.3） | 原样保留 |
| `RECONSTRUCTION-PLAN.md`（371 行） | 未来计划：删除清单/改造阶段（见 §10.3） | 原样保留 |
| `docs/supabase_schema.sql` | 参考版 Schema（§4.1 全文） | 按 §4.1 原文放置，**不要执行** |
| `docs/MVP简化后端配置指南.md`（388 行） | 早期 MVP 方案（Vercel Edge Function + OpenAI 协议，含"可意"早期 prompt 草稿），与现实现无关 | 原样保留；勿与 §6.1 现行 prompt 混淆 |
| `docs/功能清单.md`（100 行） | 功能规划清单，部分"待开发"项实际已完成（文档滞后） | 原样保留 |
| `docs/_archive/`（10 文件） | 历史部署教程/依赖版本/UI 清单等归档 | 原样保留（文件名清单见 §3 目录树） |

**第 7 章覆盖清单自检**：frontend/src 35 文件 = 13 route.ts（§7.10）+ 3 lib（§7.1– 7.3）+ 1 store（§6.5/§7.4 引用，store 全文结构见 §8.3）+ 7 组件（§7.4– 7.7）+ layout/page/chat页/globals.css/sitemap/favicon（§7.8）+ 5 SEO 页（§7.9）；另覆盖 public 资产、6 配置文件 + CI（§7.11）、后端残骸 3 文件（§7.12）、根文档与 docs（§7.13）。

<!-- SECTION 7 END -->

---

## 8. UI 与交互

### 8.1 路由表（App Router，共 7 个页面路由 + 14 个 API 端点）

| 路径 | 类型 | 渲染 | 说明 |
|------|------|------|------|
| `/` | 页面 | 服务端静态 | 营销落地页（§7.8.3） |
| `/chat` | 页面 | 客户端 | 产品主体：登录门控 + 聊天界面 |
| `/what-is-cbt` | 页面 | 服务端静态 | SEO 文章页 |
| `/ai-psychologist` | 页面 | 服务端静态 | SEO 文章页 |
| `/systematic-desensitization` | 页面 | 服务端静态 | SEO 文章页 |
| `/free-online-therapy` | 页面 | 服务端静态 | SEO 文章页 |
| `/gad7-anxiety-test` | 页面 | 服务端静态 | SEO 文章页（无交互计分） |
| `/sitemap.xml` | 生成路由 | — | 由 sitemap.ts 生成（6 URL） |
| `/robots.txt` | 静态文件 | — | public/ 直出 |
| `/api/**` | API | — | 14 端点（§5） |

无任何中间件（无 middleware.ts）、无动态段页面路由、无重定向配置。页面间导航只有：落地页/SEO 页 → `/chat`（Link），SEO 页 → `/`（返回首页）。`/chat` 内部无路由切换，全部状态驱动。

### 8.2 /chat 页面状态机

```
【阶段一：挂载门控】（app/chat/page.tsx）
  初始：mounted=false → 渲染加载屏（"可意 / 加载中..."）
  useEffect：mounted=true；若 store 无 user&token → restoreUser() 读 localStorage['keyi-user']
  分支：token && user ? ChatInterface : AuthForm

【阶段二 A：未登录（AuthForm）】
  状态：isLogin ↔（登录表单 ⇄ 注册表单，同一组件内切换）
  登录成功 → setUser(写 localStorage) → location.reload() → 重新走阶段一 → ChatInterface
  注册成功 → 无 token → reload 后仍回 AuthForm（需邮箱验证后手动登录）
  匿名试用 → setUser(null,'') → reload → 仍 AuthForm（死循环，现状）

【阶段二 B：已登录（ChatInterface）】
  空闲态：messages=[WELCOME_MESSAGE]，currentSessionId=null
  事件驱动转移：
    新对话按钮 → isCreatingSession=true → POST sessions → 新会话置顶+选中 → 回欢迎态
    选历史会话 → setCurrentSession → loadSessionHistory（现状 401，消息区不变）
    发送消息 → loading=true → 乐观插入 user+空 assistant → SSE 逐帧填充 → loading=false
                失败分支 → assistant 气泡填错误文案
    删会话 → confirm → DELETE → 从列表移除；若为当前会话 → 回空闲态（下一帧 effect 重新注入欢迎语）
    切模式 Tab → 仅改 therapyMode（影响下一次建会话）
    退出 → logout()（清 store+localStorage）→ reload → AuthForm
  移动端：sidebarOpen ↔ 抽屉开合（遮罩点击/✕/选中会话后自动关）
```

### 8.3 状态管理（frontend/src/store/index.ts，106 行）

- **单 store，无中间件**：`create<AppState>()` 裸用，不用 persist/devtools；持久化在 `setUser`/`logout` 内手写 localStorage（key **`'keyi-user'`**，值为 `JSON.stringify({user, token, refreshToken})`）。
- **State 形状与动作（接口逐字）**：

```ts
interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
interface Session { id: string; title: string; started_at: string; updated_at?: string; message_count: number; }
interface User { id: string; email: string; }

interface AppState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setUser: (user: User | null, token?: string, refreshToken?: string) => void;
  logout: () => void;

  sessions: Session[];
  currentSessionId: string | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (sessionId: string | null) => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;

  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}
```

- **关键动作语义**：
  - `setUser(user, token, refreshToken)`：写 state；仅当 `user && token` 同时真才写 localStorage，否则 `removeItem`（注册无 token/匿名试用都落在 remove 分支）。
  - `logout()`：一次性清空 user/token/refreshToken/sessions/currentSessionId/messages + removeItem。
  - `addSession(session)`：新会话**插到数组头部**并同时 `currentSessionId = session.id`（创建即选中）。
  - `removeSession(id)`：filter 删除；若删的是当前会话则 `currentSessionId=null`。
  - `restoreUser()`（模块导出函数，非 store 成员）：SSR 守卫（`typeof window`）+ try/catch JSON.parse，失败返 null 并 `console.error('恢复用户数据失败:', e)`。
- **订阅模式**：组件用解构 `useStore()` 全量订阅（不用 selector，每次 state 变化全组件重渲染——现状如此）；事件回调内用 `useStore.getState()` 取即时值（handleSend/flushUI）。

### 8.4 视觉设计约定（Warm Editorial，聊天区）

- 色板（全部在 §7.8.4 逐字）：米色背景 `#fbf6ee`，卡片/气泡面 `#fffdf8`，主色森林绿 `#2f5b4f`（hover `#274d43`），点缀陶土色 `#9b5b32`，正文墨色 `#201914`，次级文字 `#7a6d63`，边框 `#ded2c3`，危险 `#b33a3a`。
- 字体：品牌标题 `Georgia, 'Times New Roman', serif`；正文 Inter/系统栈。
- 尺寸常量：聊天内容列限宽 `--chat-max-width: 680px`；桌面侧边栏 `w-60`（240px）；移动抽屉 280px；断点仅用 Tailwind `md:`（768px）一档。
- 圆角体系：按钮/输入 10–12px，卡片 16px，气泡 16px 三角缺口（user 右下 4px / assistant 左下 4px）。
- 交互细节：hover 效果大量用内联 `onMouseEnter/Leave` 改 style（非 CSS 类）——这是代码风格现状，复现时保持；focus 光晕统一 `0 0 0 3px rgba(47,91,79,0.15)`；抽屉/遮罩缓动统一 `cubic-bezier(0.23, 1, 0.32, 1)`。

<!-- SECTION 8 END -->

---

## 9. 从零复现步骤

> 目标：在全新环境里复现与当前仓库完全一致的项目现状（含残骸与已知缺陷），并使其可运行。顺序执行，每步后面标注依据章节。

### 9.1 第一步：创建 Supabase 项目与数据库

1. 在 supabase.com 新建项目（任意 region），记录：项目 URL（`https://<ref>.supabase.co`）、anon key、service_role key。
2. Dashboard → Authentication → Providers：启用 Email（保持默认的"Confirm email"开启，与现状一致——注册后需邮箱验证才能登录，AuthForm 文案依赖此行为）。
3. SQL Editor 中**仅执行** `supabase/migrations/002_create_keyi_tables.sql`（§4.2 全文）。**不要执行** docs/supabase_schema.sql（§4.3 差异分析）。
4. 验收：Table Editor 可见 `chat_sessions`（含 `therapy_mode TEXT DEFAULT 'general'`、`user_id TEXT`）与 `messages` 两表，RLS 均为 allow_all 策略。

### 9.2 第二步：重建仓库骨架与静态文件

5. 按 §3 目录树创建全部目录；白名单文件逐字还原：`render.yaml`（§2.6，密钥位填自己的值或保留占位符）、三份 `vercel.json`（§2.7）、`supabase/config.toml`（§4.4，project_id 换成自己的 ref）、`002_create_keyi_tables.sql`（§4.2）、`docs/supabase_schema.sql`（§4.1）、`backend/` 三文件（§7.12）、`.github/workflows/ci.yml`（§7.11）、`robots.txt`（§7.8.5）。
6. 根目录文档（README、两份 RECONSTRUCTION 文档、docs/）按 §7.13 策略处理：若无原文可拷，可按其性质重写同主题内容并标注"重建版"，不影响运行。

### 9.3 第三步：搭建前端（= 全栈应用）

7. `npx create-next-app@16.1.6` 或手工创建 frontend/，使 `package.json` 与 §2.1 逐字一致（版本锁定、`build: next build --no-turbopack`），`npm install`。
8. 配置文件按 §7.11 还原（tsconfig 路径别名 `@/*`、eslint flat config、postcss 仅 Tailwind v4 插件、next.config 空）。
9. 按章节实现源码（建议顺序）：
   1. `lib/supabase.ts`（§7.1 全文）→ `lib/prompts.ts`（§6.1/§6.2 全文）→ `lib/safety.ts`（§6.3 全文）；
   2. `store/index.ts`（§8.3 接口+动作语义）；
   3. 13 个 API route（§5 契约 + §7.10 实现要点；stream 路由额外参照 §6.4 流程图与 SSE 转译协议）；
   4. 组件：`ChatInterface`（§7.4，含 WELCOME_MESSAGE/THERAPY_MODES 逐字）、`AuthForm`（§7.5）、sidebar 两件（§7.6）、chat 三件（§7.7）；
   5. 页面层：`globals.css`（§7.8.4）、`layout.tsx`（§7.8.2）、`page.tsx`（§7.8.3）、`chat/page.tsx`（§7.8.1）、`sitemap.ts`（§7.8.5）、5 个 SEO 页（§7.9）。
10. ⚠️ 复现红线：**不要"顺手修复"§6.5 的 14 条现状缺陷**（尤其 history 不带 token、messages 零鉴权、危机 JSON/SSE 错位、sessions 默认 'default'），否则不是现状快照。

### 9.4 第四步：配置环境变量并本地运行

11. 创建 `frontend/.env.local`（不入仓），填 §2.5 七键：

```env
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_KEY=<SUPABASE_ANON_KEY>
SUPABASE_SERVICE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
LLM_BASE_URL=https://<anthropic协议兼容网关基地址>   # 不含 /v1/messages！见 §2.5 警告
LLM_API_KEY=<LLM_API_KEY>
LLM_MODEL=<模型名，缺省 claude-sonnet-4-20250514>
NEXT_PUBLIC_API_URL=
```

12. `cd frontend && npm run dev` → 浏览器 `http://localhost:3000`。

### 9.5 第五步：部署

13. **Vercel（实际生效链路）**：仓库根导入 Vercel（根 `vercel.json` 已指定从 frontend 构建）；项目环境变量配第 11 步同名六键（NEXT_PUBLIC_API_URL 可省）；Deploy。`vercel link` 会自动生成 `.vercel/project.json`。
14. **Render（不部署）**：render.yaml 仅作残骸原样保留，其引用的 `backend/Dockerfile` 不存在，不可也不应部署（§1.3）。
15. **CI**：push 到 GitHub 后 ci.yml 自动跑 lint+build；两者必须绿（现状代码可通过 strict TS + eslint）。

### 9.6 验收标准（逐项可测）

| # | 验收项 | 期望结果 |
|---|--------|----------|
| A1 | `GET /api/health` | 200 `{"status":"ok"}` |
| A2 | 注册新邮箱 | 收到 Supabase 验证邮件；页面 reload 后仍在登录页（现状行为） |
| A3 | 邮箱验证后登录 | 进入聊天界面，欢迎气泡显示林序文案（§7.4 WELCOME_MESSAGE），时间戳 08:00 |
| A4 | 新建会话（任意模式 Tab）后发送"你好" | assistant 气泡逐字流式出现回复；侧边栏标题变为"你好"；DB messages 表新增 2 行且 created_at 相同 |
| A5 | 在 CBT Tab 下新建会话后提问 | 回复呈现 CBT 引导风格；DB 该会话 `therapy_mode='cbt'` |
| A6 | 直接点"发送"不先建会话 | 自动建会话（DB 中 `therapy_mode` 为当前 Tab 值）后正常回复 |
| A7 | 发送含"想死"的消息 | HTTP 200；**assistant 气泡保持空白**（危机 JSON 被 SSE 解析丢弃，§6.4 协议错位）；DB 不新增消息；用 curl 直读响应体可见 `{"type":"crisis","message":"...400-161-9995..."}` |
| A8 | 切换到历史会话 | 消息区**不加载历史**（保留当前内容），DevTools 可见 history 请求 401（现状行为 A9 验证接口本身可用） |
| A9 | `curl -H "Authorization: Bearer <token>" /api/v1/chat/sessions/<id>/history` | 200，返回升序消息数组（≤ 50 条） |
| A10 | 未带 token 调 `POST .../messages`（非流式） | 200 正常回复（零鉴权现状，§6.5 #3） |
| A11 | 删除会话 | confirm 弹窗 → 列表移除；DB 中 session 与其 messages 均被删除 |
| A12 | 退出登录 | 回登录页；localStorage 无 `keyi-user` |
| A13 | "暂不登录，先试试" | reload 后仍在登录页（死循环现状，§1.2 F17） |
| A14 | 访问 `/`、五个 SEO 页、`/sitemap.xml`、`/robots.txt` | 全部 200；sitemap 含 6 URL；页源码含 JSON-LD（仅 layout 注入的全局三节点） |
| A15 | `npm run lint && npm run build` | 均零错误退出 |
| A16 | 移动端视口（<768px） | 顶栏汉堡可开抽屉；选会话后抽屉自动关闭；桌面 Tab 条隐藏，顶栏右侧显示当前模式名 |
| A17 | backend 残骸 | `python -c "import sys; sys.path.insert(0,'backend/api')"` 后 import index 抛 ModuleNotFoundError（app 包不存在）——残骸状态复现成功的标志 |

<!-- SECTION 9 END -->

---

## 10. 不可文本化资产 / 已知技术债

### 10.1 不可文本化资产清单（复现缺口）

| # | 资产 | 说明 | 复现策略 |
|---|------|------|----------|
| 1 | 线上 Supabase 实例（project_id `zrzwpucermocngirynkn`）内的存量数据 | 已注册用户（auth.users）、历史会话与消息 | **不可复现**；新建空库即为"结构一致、数据为空"的合法快照 |
| 2 | Supabase 项目密钥（anon/service_role）与 Auth 邮件模板配置 | 密钥零收录；邮件模板未自定义（默认模板） | 新项目自动生成 |
| 3 | LLM 网关账号（render.yaml 残留指向小米 MiMo anthropic 兼容端点）及其 API Key | Key 已在 §2.6 脱敏；该网关需自行开通或替换 | 任意 Anthropic Messages 协议兼容网关均可（改 LLM_BASE_URL/LLM_MODEL） |
| 4 | Vercel 项目（orgId/projectId 见 .vercel/project.json）与其环境变量 | 平台侧状态 | `vercel link` 重建；环境变量按 §9.4 重配 |
| 5 | 域名 `keyi.app`（canonical/sitemap/robots 硬编码） | 域名所有权不可文本化 | 无域名时 SEO 元数据仍按原文硬编码复现（现状如此） |
| 6 | GitHub 仓库 `github.com/121212165/keyi`（JSON-LD sameAs 引用） | 平台侧资产 | 引用字符串原样保留 |
| 7 | `frontend/package-lock.json`（234KB 精确依赖树）与 `favicon.ico`/5 个默认 SVG 二进制内容 | 未逐字收录 | lock 由 `npm install` 重新生成（次级依赖可能微小漂移）；图标用 create-next-app 默认产物即可 |
| 8 | docs/ 历史文档与两份 RECONSTRUCTION 计划的完整原文 | 本文档仅摘录结论 | 若无原仓库可拷，按 §7.13 重建版策略处理（不影响运行） |

### 10.2 外部服务清单

| 服务 | 用途 | 状态 |
|------|------|------|
| Supabase（云） | Auth + PostgreSQL | ✅ 运行中，必需 |
| Anthropic 协议兼容 LLM 网关 | 对话生成 | ✅ 必需（具体供应商可替换） |
| Vercel | 前端+API 托管 | ✅ 实际部署平台 |
| Render | Python 后端托管 | ☠️ 残骸配置，不可部署 |
| GitHub Actions | CI（lint+build） | ✅ 随仓库生效 |
| 智谱 AI（GLM） | 仅存在于宣传文案 | ❌ 代码未接入（§1.3 #3） |

### 10.3 已知技术债（引用两份重构计划；本文档不预设其执行）

**来自 `FIRST-PRINCIPLES-RECONSTRUCTION.md`（45 行）的核心论断**：
- 产品的不可约化内核只有三件事：高质量 prompt、可靠的流式对话、危机安全网；"The prompt IS the product"。
- 双后端并存是最大结构性浪费：Python/FastAPI 后端应当删除，Next.js API Routes 已覆盖全部需求。
- 治疗模式是 prompt 变体而非软件模块，不应为每个模式建独立代码路径。

**来自 `RECONSTRUCTION-PLAN.md`（371 行）的要点与执行现状**：
- Phase 1（删除）：判定 backend 未使用代码占比 100%，列出 `backend/app/**`、`frontend/src/lib/api.ts`、`frontend/src/components/therapy/**`、`scripts/**`、`supabase/functions/**`、`001_create_chat_tables.sql` 等待删清单 —— **工作区实测这些路径已不存在，删除已大部分执行**；但 `backend/` 三残件、`render.yaml`、config.toml 的 `[functions.chat]` 残块仍未清——即"删干净"未完成，这正是本文档如实记录的双后端残骸现状。
- 计划中待修复项（未执行，与 §6.5 现状缺陷对应）：history 鉴权缺失、messages 零鉴权、stream 属主校验、危机响应协议统一为 SSE、匿名试用流程、token 自动刷新。
- **本文档立场重申**：以上均为"未来方向"，复现现状时一律**不执行**；若后续决定执行两份计划，应以它们为准并更新本快照文档。

**本文档额外识别的技术债（两份计划未覆盖）**：
1. render.yaml 明文密钥泄露（§2.6，应吊销轮换）。
2. LLM_BASE_URL 拼接口径不一致（§2.5 警告）。
3. RLS allow_all + service key 直连：数据隔离完全依赖应用层 `eq('user_id')`，而 stream/messages 路由恰好缺此校验（§1.3 #5）。
4. 宣传文案（智谱 GLM）与实现（Anthropic 协议）不符；README 技术栈段落过时。
5. 前端全量订阅 store、建会话后固定 sleep 100ms、hover 逻辑内联化等工程细节（均属风格/性能债，不影响功能）。

> 全文完。本文档为 keyi 项目 2026-07-28 现状快照；任何与仓库实际代码不一致之处，以仓库为准并应回写修订本文档。

<!-- SECTION 10 END -->
