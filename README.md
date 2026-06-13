# keyi

一个 AI 心理医生 — 基于 Next.js + Supabase + Claude API 构建。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + React 19 + Tailwind CSS 4 |
| 状态管理 | Zustand |
| 后端 | Next.js API Routes (App Router) |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| LLM | Claude API (streaming) |

## 快速开始

```bash
cd frontend
npm install
cp .env.example .env.local  # 填入 Supabase 和 LLM 密钥
npm run dev
```

## 环境变量

在 `frontend/.env.local` 中配置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LLM_BASE_URL=https://api.anthropic.com
LLM_API_KEY=your_claude_api_key
```

## 项目结构

```
frontend/
├── src/
│   ├── app/           # Next.js App Router 页面 + API Routes
│   ├── components/    # React 组件
│   ├── lib/           # 工具库 (supabase, prompts, safety)
│   └── store/         # Zustand 状态管理
├── package.json
└── tsconfig.json
supabase/
└── migrations/        # 数据库迁移
```

## 治疗模式

- **自由对话** — 温暖的支持性对话
- **CBT 认知疗法** — 认知行为疗法，识别负性思维模式
- **系统脱敏** — 渐进式暴露，克服恐惧和焦虑

## 部署

项目已配置 Vercel 部署。推送到 `main` 分支即可自动部署。

---

*最后更新: 2026-06-14*
