# Railway 部署后端详细教程

## 步骤1：注册/登录 Railway

1. 打开 https://railway.app
2. 点击 "Sign Up" 使用 GitHub 账号登录
3. 完成授权

---

## 步骤2：创建新项目

1. 登录后，点击 "New Project"
2. 选择 "Deploy from GitHub repo"

![Deploy from GitHub](https://railway.app/images/docs/deployFromGithub.png)

3. 在搜索框输入 `keyi` 找到你的仓库
4. 点击选择 `keyi` 仓库

---

## 步骤3：选择后端目录

1. Railway 会问 "Select a directory"
2. 选择 `backend` 目录
3. 点击 "Deploy"

![Select directory](https://railway.app/images/docs/selectDirectory.png)

---

## 步骤4：等待部署

1. 你会看到部署日志滚动
2. 等待显示 "Deployed" （可能需要2-3分钟）
3. 顶部会显示你的项目URL，格式类似：
   ```
   https://keyi-backend.up.railway.app
   ```
4. **记下这个URL，后面会用**

---

## 步骤5：配置环境变量

1. 在左侧菜单点击 "Variables"（变量）

![Variables](https://railway.app/images/docs/variables.png)

2. 点击 "New Variable"（新建变量）

3. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `ZHIPU_API_KEY` | 你的智谱API Key（形如 `xxxx-xxxx-xxxx`） |

4. 添加后点击保存
5. Railway 会自动重新部署

---

## 步骤6：验证部署成功

1. 打开你的后端URL（如 `https://xxx.railway.app`）
2. 访问 `https://xxx.railway.app/health`
3. 如果显示 `{"status":"healthy"}` 说明成功！

---

## 常见问题

### Q: 部署失败
A: 查看日志末尾的错误信息，常见问题：
- API Key 格式错误
- 依赖安装失败

### Q: 显示 "Build Failed"
A: 检查 Railway 日志，可能需要安装系统依赖

### Q: 不知道API Key在哪里
A: 访问 https://open.bigmodel.cn/ 登录后，在个人中心 -> API密钥 创建

### Q: 如何重新部署
A: 在 Railway 页面点击顶部 "Deploy" 按钮

---

## 下一步

后端部署成功后，去 Vercel 部署前端，然后告诉我后端URL，我帮你配置前端。
