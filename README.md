# 可意AI心理医生 | Keyi AI Psychologist

免费的AI心理医生应用，提供CBT认知行为疗法、系统脱敏训练和情绪疏导三种专业心理治疗模式。24小时在线，无需预约，支持中文。

## 功能特性

| 功能 | 说明 |
|------|------|
| 💬 自由对话 | 像和朋友聊天一样倾诉困扰，获得温暖的回应和支持 |
| 🧠 CBT认知疗法 | 认知三角记录（想法-感受-行为）、自动化思维标记（ANTs） |
| 🌊 系统脱敏 | 通过渐进式暴露，逐步克服恐惧和焦虑 |
| 📝 情绪记录 | 记录和追踪情绪变化，了解自己的情绪模式 |
| 🔒 会话管理 | 多会话支持，历史记录回顾 |

## 什么是CBT认知行为疗法？

CBT（Cognitive Behavioral Therapy）是目前循证级别最高的心理治疗方法之一。Meta分析显示，CBT对焦虑障碍的效应量达0.73（中等偏大），对抑郁症的效应量为0.66。

可意AI将CBT的核心技术集成到AI对话中：
- **认知三角记录**：记录引发情绪的事件、你的想法和感受
- **自动化思维标记（ANTs）**：识别灾难化、非黑即白、读心术等思维陷阱
- **苏格拉底式提问**：通过提问挑战不合理信念

## 技术栈

- **前端**：Next.js 16 + TypeScript + Tailwind CSS
- **后端**：FastAPI + Python 3.11+
- **数据库**：Supabase (PostgreSQL)
- **AI模型**：智谱AI GLM-4.7-Flash
- **部署**：Vercel (前端) + Railway (后端)

## 快速开始

```bash
# 后端
cd backend
python -m venv venv
pip install -r requirements.txt
python run.py

# 前端
cd frontend
npm install
npm run dev
```

## 项目结构

```
keyi/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── routers/     # API 路由 (auth, chat, therapy)
│   │   ├── services/    # 业务逻辑
│   │   ├── prompts/     # AI 提示词 (CBT, 系统脱敏)
│   │   └── models.py    # 数据模型
│   └── tests/           # 测试
├── frontend/            # Next.js 前端
│   └── src/
│       ├── app/         # 页面路由
│       ├── components/  # React 组件
│       └── store/       # 状态管理
└── supabase/            # 数据库配置
```

## 使用场景

- **日常情绪管理**：工作压力、人际关系困扰时需要一个倾听者
- **焦虑自助**：社交焦虑、考试焦虑、特定恐惧的自助练习
- **思维模式探索**：识别负性自动化思维，改善思维习惯
- **心理咨询前准备**：在见咨询师之前整理自己的想法和感受

## 重要提示

可意AI是心理健康辅助工具，不能替代专业心理咨询师或精神科医生的诊断和治疗。如果你正在经历严重的心理困扰，请联系：

- 全国24小时心理援助热线：**400-161-9995**
- 北京心理危机研究与干预中心：**010-82951332**

## 许可证

MIT License

---

*温暖、专业、有同理心的AI心理健康助手*
