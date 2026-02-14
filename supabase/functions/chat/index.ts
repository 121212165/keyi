// 可意AI心理医生 - Supabase Edge Function

const SYSTEM_PROMPT = `你是"可意"，温暖专业的AI心理陪伴助手。`
const CRISIS_KEYWORDS = ['自杀', '不想活了', '想死', '自残', '绝望', '活着没意义']

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const method = req.method
  const searchParams = url.searchParams

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const zhipuKey = Deno.env.get('ZHIPU_API_KEY') ?? ''
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    // 获取 action 参数
    const action = searchParams.get('action') || searchParams.get('type') || ''
    const sessionId = searchParams.get('session_id') || 'default'

    console.log('Action:', action, 'Session:', sessionId)

    // 创建会话
    if (action === 'create' && method === 'POST') {
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
      return new Response(JSON.stringify({
        session_id: newSessionId,
        message: '你好，我是可意，你的AI心理陪伴助手。很高兴你来到这里。'
      }), { headers: corsHeaders })
    }

    // 发送消息
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const message = body.message || body.content || ''

      if (!message) {
        return new Response(JSON.stringify({ error: '消息不能为空' }), { status: 400, headers: corsHeaders })
      }

      // 危机检测
      for (const keyword of CRISIS_KEYWORDS) {
        if (message.includes(keyword)) {
          return new Response(JSON.stringify({
            response: `我听到你感觉很绝望。如果你有具体的想法或计划，请拨打：400-161-9995`,
            alert_level: 'crisis'
          }), { headers: corsHeaders })
        }
      }

      // 调用LLM
      const messages = [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }]
      let response = ''

      if (zhipuKey) {
        try {
          const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${zhipuKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'glm-4-flash', messages, temperature: 0.7, max_tokens: 200 })
          })
          if (res.ok) { const d = await res.json(); response = d.choices?.[0]?.message?.content ?? '' }
        } catch (e) { console.error('智谱错误', e) }
      }

      if (!response && openaiKey) {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, temperature: 0.7, max_tokens: 200 })
          })
          if (res.ok) { const d = await res.json(); response = d.choices?.[0]?.message?.content ?? '' }
        } catch (e) { console.error('OpenAI错误', e) }
      }

      if (!response) {
        const msg = message.toLowerCase()
        if (msg.includes('累') || msg.includes('焦虑')) response = '我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？'
        else if (msg.includes('难过')) response = '我感受到你现在的难过。想说说我能为你做些什么吗？'
        else response = '我在这里听你说。'
      }

      return new Response(JSON.stringify({ response, alert_level: null, session_id: sessionId }), { headers: corsHeaders })
    }

    // 健康检查
    if (action === 'health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'healthy', message: '可意AI运行正常' }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({
      error: 'Unknown action',
      usage: { create: 'POST ?action=create', send: 'POST ?session_id=xxx', health: 'GET ?action=health' }
    }), { status: 400, headers: corsHeaders })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})

console.log('可意AI Edge Function 已启动')
