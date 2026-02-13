// Supabase Edge Function - 可意AI心理医生

const SYSTEM_PROMPT = `你是一个温暖，专业AI心理陪伴助手，名为"可意"。

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
- 不泄露用户隐私`

Deno.serve(async (req) => {
  // 设置CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { message, session_id } = await req.json()

    // 获取环境变量
    const zhipuKey = Deno.env.get('ZHIPU_API_KEY') || ''
    const openaiKey = Deno.env.get('OPENAI_API_KEY') || ''

    // 构建消息
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message }
    ]

    let response = ''

    // 优先使用智谱AI
    if (zhipuKey) {
      try {
        const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zhipuKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'glm-4-flash',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          })
        })

        if (res.ok) {
          const data = await res.json()
          response = data.choices[0].message.content
        }
      } catch (e) {
        console.error('智谱错误:', e)
      }
    }

    // 备用OpenAI
    if (!response && openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          })
        })

        if (res.ok) {
          const data = await res.json()
          response = data.choices[0].message.content
        }
      } catch (e) {
        console.error('OpenAI错误:', e)
      }
    }

    // 默认回复
    if (!response) {
      response = fallbackResponse(message)
    }

    return new Response(JSON.stringify({
      response,
      session_id: session_id || 'new'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})

function fallbackResponse(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('累') || msg.includes('压力') || msg.includes('焦虑')) {
    return '我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？'
  }
  if (msg.includes('难过') || msg.includes('伤心') || msg.includes('哭')) {
    return '我感受到你现在的难过。眼泪有时候是情绪的出口，想说说我能为你做些什么吗？'
  }
  if (msg.includes('想死') || msg.includes('自杀') || msg.includes('不想活')) {
    return '我听到你感觉很绝望。请拨打心理危机干预热线：400-161-9995'
  }
  return '我在这里听你说。如果愿意的话，可以多说说你的想法和感受。'
}
