# Vercel 部署前端详细教程

## 步骤1：注册/登录 Vercel

1. 打开 https://vercel.com
2. 点击 "Sign Up" 使用 GitHub 账号登录
3. 完成授权

---

## 步骤2：创建新项目

1. 登录后，点击 "Add New..." -> "Project"

![Add New Project](https://vercel.com/images/docs/add-new-project.png)

2. 在 "Import Git Repository" 页面搜索 `keyi`
3. 找到 `121212165/keyi` 仓库
4. 点击 "Import"

![Import repository](https://vercel.com/images/docs/import-repository.png)

---

## 步骤3：配置项目

1. 看到 "Configure Project" 页面

2. **重要**：修改 "Root Directory" 为 `frontend`
   - 点击右边的设置图标
   - 选择 `frontend` 目录
   - 点击 "Yes"

3. 其他设置保持默认：
   - Framework Preset: `Other` 或 `Vite`（会自动检测）
   - Build Command: `npm run build`（或留空）
   - Output Directory: `dist`（或留空）

4. 点击 "Deploy"

---

## 步骤4：等待部署

1. 看到部署进度页面
2. 等待显示 "Ready" （约1-2分钟）
3. 点击 "Visit" 查看你的网站

---

## 步骤5：配置后端API地址（重要！）

前端部署好后，需要告诉它后端在哪里：

1. 在 Vercel 项目页面，点击 "Settings" -> "Environment Variables"

![Environment Variables](https://vercel.com/images/docs/environment-variables.png)

2. 点击 "Add New"

3. 添加变量：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE_URL` | 你的后端地址（等Railway部署好后填入，格式：`https://xxx.railway.app`） |

4. 添加后点击保存
5. **重要**：点击 "Deployments"，触发一次重新部署

---

## 步骤6：验证

1. 打开你的 Vercel URL
2. 应该能看到聊天界面
3. 发送一条消息测试

---

## 常见问题

### Q: 页面显示空白
A: 检查浏览器控制台是否有错误，可能需要配置 VITE_API_BASE_URL

### Q: 发送消息没反应
A: 检查后端是否部署成功，API地址是否正确

### Q: 怎么知道后端URL？
A: Railway 部署完成后，顶部显示的URL就是后端地址

### Q: 部署出错怎么办
A: 查看 Vercel 日志，常见问题是：
- Root Directory 设置错误
- 环境变量没填

---

## 完整流程

1. ✅ 先部署 Railway 后端
2. ✅ 获得后端URL（形如 `https://xxx.railway.app`）
3. ✅ 部署 Vercel 前端
4. ✅ 在 Vercel 添加 `VITE_API_BASE_URL` 环境变量
5. ✅ 重新部署
6. ✅ 测试聊天功能

完成后告诉我你的部署地址，我来帮你测试！
