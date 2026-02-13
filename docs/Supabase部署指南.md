# Supabase 部署指南

## 步骤1：注册Supabase

1. 打开 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 登录

---

## 步骤2：创建项目

1. 点击 "New project"
2. 填写信息：
   - Name: `keyi`
   - Database Password: 设置密码（记住）
   - Region: 选择 `Northeast Asia (Tokyo)` 或 `Singapore`
3. 点击 "Create new project"
4. 等待创建完成（1-2分钟）

---

## 步骤3：部署Edge Function

### 方式A：使用Supabase CLI（推荐）

1. 安装Supabase CLI：
```bash
# Windows (使用winget)
winget install supabase.cli

# 或者使用npm
npm install -g supabase
```

2. 登录：
```bash
supabase login
```

3. 初始化：
```bash
cd supabase
supabase link --project-ref <你的project-ref>
```
（project-ref在Supabase后台URL中，如 `https://supabase.com/dashboard/project/abc123`）

4. 部署：
```bash
supabase functions deploy chat
```

5. 设置环境变量：
```bash
supabase secrets set ZHIPU_API_KEY=你的智谱API密钥
```

### 方式B：直接在Supabase后台

1. 进入 Edge Functions 页面
2. 点击 "New function"
3. 复制 `supabase/functions/chat/index.ts` 的内容
4. 保存
5. 在 "Secrets" 中添加 `ZHIPU_API_KEY`

---

## 步骤4：获取API地址

部署完成后，在 Edge Functions 页面找到 `chat` 函数，点击查看详情：

```
https://<project-ref>.supabase.co/functions/v1/chat
```

---

## 步骤5：配置前端

在 Vercel 前端环境变量中添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://<project-ref>.supabase.co/functions/v1/chat` |

---

## 测试

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}'
```

应该返回：
```json
{
  "response": "你好，我是可意...",
  "session_id": "new"
}
```

---

## 费用

| 项目 | 免费额度 |
|------|----------|
| Edge Functions | 500,000 次/月 |
| 数据库 | 500MB |
| 带宽 | 1GB/月 |

足够个人项目使用！

---

## 完整流程

1. ✅ 注册 Supabase
2. ✅ 创建项目
3. ✅ 部署 Edge Function
4. ✅ 设置 ZHIPU_API_KEY
5. ✅ 获取API地址
6. ✅ 配置 Vercel 前端

完成后告诉我你的 Supabase 函数 URL，我来帮你测试！
