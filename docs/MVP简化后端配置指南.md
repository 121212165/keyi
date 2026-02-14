# MVP简化后端配置指南

## 概述

本指南提供一个极简的后端配置方案，专注于MVP核心功能：对话服务。

## 方案选择

### 推荐方案：Vercel + Edge Functions

**优势**：
- 零配置部署
- 自动HTTPS
- 全球CDN
- 免费额度充足
- 无需管理服务器

### 技术栈

```
前端: React + TypeScript (已有)
后端: Vercel Edge Functions
LLM: OpenAI API (GPT-3.5-turbo)
存储: 浏览器 LocalStorage (MVP阶段)
```

## 快速开始

### 1. 创建简化的API端点

在项目根目录创建 `api` 文件夹：

```
项目根目录/
├── api/
│   └── chat.ts          # 对话API
├── frontend/            # 现有前端代码
└── docs/
```

### 2. 实现对话API (`api/chat.ts`)

```typescript
import { Configuration, OpenAIApi } from 'openai';

// 从环境变量读取API密钥
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 高级工作流手册作为系统提示词
const SYSTEM_PROMPT = `你是可意，一个温暖、专业的AI心理陪伴助手。

核心原则：
1. 温暖共情：让用户感到被理解和接纳
2. 专业倾听：使用PEERE模型（复述、情绪标注、具体化、肯定、支持）
3. 非评判性：避免对用户进行道德评判
4. 安全边界：不提供医疗诊断，危机情况引导专业帮助

回应风格：
- 简洁温暖，避免说教
- 多用开放式提问
- 适时给予肯定和支持
- 保持对话的连续性

记住：你的目标是陪伴和倾听，而非解决所有问题。`;

export default async function handler(req: Request) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();

    // 调用OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const reply = completion.data.choices[0].message?.content;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: '抱歉，我现在无法回复，请稍后再试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### 4. 配置 Vercel

创建 `vercel.json`（如果还没有）：

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 5. 前端调用示例

```typescript
// frontend/src/api.ts
export async function sendMessage(messages: Array<{role: string, content: string}>) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}
```

## 部署步骤

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署

```bash
vercel
```

### 4. 设置环境变量

在 Vercel Dashboard 中：
1. 进入项目设置
2. 找到 Environment Variables
3. 添加 `OPENAI_API_KEY`

### 5. 重新部署

```bash
vercel --prod
```

## 本地开发

### 1. 安装依赖

```bash
npm install openai
npm install -D @vercel/node
```

### 2. 启动开发服务器

```bash
vercel dev
```

这会在本地启动一个模拟Vercel环境的服务器。

## 成本估算

### OpenAI API (GPT-3.5-turbo)

- 价格：$0.002 / 1K tokens
- 估算：每次对话约500 tokens
- 成本：每次对话约 $0.001
- 1000次对话 ≈ $1

### Vercel

- 免费额度：
  - 100GB 带宽/月
  - 100小时 Edge Functions 执行时间/月
- MVP阶段完全免费

## 替代方案

### 方案2：Cloudflare Workers (更便宜)

如果需要更低成本：

```typescript
// workers/chat.ts
export default {
  async fetch(request: Request): Promise<Response> {
    // 类似的实现
  }
}
```

**优势**：
- 免费额度更大
- 全球边缘网络
- 响应更快

### 方案3：使用国产LLM (更便宜)

如果预算紧张，可以考虑：
- 通义千问 (阿里云)
- 文心一言 (百度)
- ChatGLM (智谱AI)

价格通常是OpenAI的1/10。

## 数据存储方案

### MVP阶段：LocalStorage

```typescript
// 前端存储
const saveChat = (sessionId: string, messages: Message[]) => {
  localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
};

const loadChat = (sessionId: string): Message[] => {
  const data = localStorage.getItem(`chat_${sessionId}`);
  return data ? JSON.parse(data) : [];
};
```

**优势**：
- 零成本
- 零配置
- 隐私保护（数据不离开用户设备）

**限制**：
- 不能跨设备同步
- 清除浏览器数据会丢失

### 未来扩展：Supabase (免费)

当需要跨设备同步时：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 保存对话
await supabase.from('messages').insert({
  session_id: sessionId,
  role: 'user',
  content: message,
});
```

**免费额度**：
- 500MB 数据库
- 1GB 文件存储
- 50,000 月活用户

## 监控和日志

### 简单的错误追踪

```typescript
// 在API中添加
try {
  // ... 业务逻辑
} catch (error) {
  // 记录到Vercel日志
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
  });
  
  // 返回友好错误
  return new Response(
    JSON.stringify({ error: '服务暂时不可用' }),
    { status: 500 }
  );
}
```

### 使用 Vercel Analytics (免费)

在 `vercel.json` 中启用：

```json
{
  "analytics": {
    "enable": true
  }
}
```

## 安全建议

### 1. API密钥保护

- ✅ 使用环境变量
- ✅ 不要提交到Git
- ✅ 定期轮换密钥

### 2. 速率限制

```typescript
// 简单的速率限制
const rateLimiter = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimiter.get(ip) || 0;
  
  if (now - lastRequest < 1000) { // 1秒内只能请求1次
    return false;
  }
  
  rateLimiter.set(ip, now);
  return true;
}
```

### 3. 输入验证

```typescript
function validateMessage(content: string): boolean {
  return (
    typeof content === 'string' &&
    content.length > 0 &&
    content.length < 2000
  );
}
```

## 总结

这个方案的优势：

✅ **极简**：只需要一个API文件
✅ **免费**：MVP阶段完全免费
✅ **快速**：10分钟内可以部署上线
✅ **可扩展**：未来可以轻松添加数据库
✅ **专业**：使用成熟的云服务

下一步：
1. 创建 `api/chat.ts`
2. 配置环境变量
3. 部署到Vercel
4. 测试对话功能

