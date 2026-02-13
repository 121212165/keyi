/**
 * 可意AI心理医生 - Vercel API (JavaScript)
 */

const SYSTEM_PROMPT = `你是一个温暖、专业AI心理陪伴助手，名为"可意"。

核心理念：
- 温暖：让人感到被接纳，不评判
- 专业：基于心理学原理回应
- 智慧：帮助用户看到盲点
- 边界：知道什么是AI能做的，什么不能

响应原则：
1. 先共情，再引导
2. 不急于给建议，先倾听
3. 用开放式问题帮助用户探索
4. 保持温暖和耐心
5. 如果用户提到想死、自杀等念头，要引导他们寻求专业帮助

禁止行为：
- 不给出具体的医疗诊断
- 不替代专业心理治疗
- 不在用户强烈反对时就医建议
- 不泄露用户隐私

用户现在想和你聊聊，请根据以上原则回应。`;

// 简单的内存存储
const sessions = new Map();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  try {
    // 健康检查
    if (method === 'GET' && url === '/api/health') {
      return res.status(200).json({ status: 'healthy' });
    }

    // 创建会话
    if (method === 'POST' && url === '/api/chat/sessions') {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessions.set(sessionId, []);
      return res.status(200).json({ session_id: sessionId });
    }

    // 发送消息
    const chatMatch = url.match(/\/api\/chat\/sessions\/([^/]+)\/messages/);
    if (method === 'POST' && chatMatch) {
      const sessionId = chatMatch[1];
      const { message } = req.body;

      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
      }

      // 添加用户消息
      sessions.get(sessionId).push({ role: 'user', content: message });

      // 生成回复
      const response = await generateResponse(message, sessions.get(sessionId));

      // 添加AI回复
      sessions.get(sessionId).push({ role: 'assistant', content: response });

      return res.status(200).json({ response, session_id: sessionId });
    }

    // 获取历史
    const historyMatch = url.match(/\/api\/chat\/sessions\/([^/]+)\/history/);
    if (method === 'GET' && historyMatch) {
      const sessionId = historyMatch[1];
      const messages = sessions.get(sessionId) || [];
      return res.status(200).json({ messages });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function generateResponse(message, history) {
  const zhipuKey = process.env.ZHIPU_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  // 优先用智谱
  if (zhipuKey) {
    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${zhipuKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error('智谱错误:', e);
    }
  }

  // 备用OpenAI
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error('OpenAI错误:', e);
    }
  }

  // 默认回复
  return fallbackResponse(message);
}

function fallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('累') || msg.includes('压力') || msg.includes('焦虑') || msg.includes('烦')) {
    return '我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？';
  }
  if (msg.includes('难过') || msg.includes('伤心') || msg.includes('哭') || msg.includes('抑郁')) {
    return '我感受到你现在的难过。眼泪有时候是情绪的出口，想说说我能为你做些什么吗？';
  }
  if (msg.includes('想死') || msg.includes('自杀') || msg.includes('不想活')) {
    return '我听到你感觉很绝望。请拨打心理危机干预热线：400-161-9995';
  }
  if (msg.includes('谢谢') || msg.includes('感谢') || msg.includes('好')) {
    return '不用谢。我在这里陪你。还想聊些什么吗？';
  }

  return '我在这里听你说。如果愿意的话，可以多说说你的想法和感受。';
}
