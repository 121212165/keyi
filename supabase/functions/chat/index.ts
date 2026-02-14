// Supabase Edge Function - 可意AI心理医生
// 支持：创建会话、发送消息、获取历史

const SYSTEM_PROMPT = `你是"可意"，一个温暖、专业的AI心理陪伴助手。

核心理念：
- 温暖：让人感到被接纳，不评判
- 专业：基于心理学原理回应
- 智慧：帮助用户看到盲点
- 边界：知道什么是AI能做的，什么不能

对话工作流：
1. 欢迎与破冰：让用户感到被理解
2. 情绪倾听与共情：使用PEERE模型
3. 问题探索与理解：渐进式深入问句
4. 引导与反馈：苏格拉底式认知重构
5. 干预与行动引导：着陆技术、呼吸练习
6. 结案与延续：温暖告别、记忆延续
7. 风险识别与危机处理

禁止行为：
- 不给出具体的医疗诊断
- 不替代专业心理治疗
- 不泄露用户隐私`

const CRISIS_KEYWORDS = [
  '自杀', '不想活了', '想死', '结束生命', '自残', '伤害自己',
  '活着没意义', '绝望', '无望', '没有希望'
]

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  // CORS
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
    const zhipuKey = Deno.env.get('ZHIPU_API_KEY') ?? ''
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    // 创建会话: POST /chat
    if (path === '/chat' && method === 'POST') {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`

      const welcomeMsg = {
        id: '1',
        role: 'assistant',
        content: '你好，我是可意，你的AI心理陪伴助手。很高兴你来到这里。无论你现在想倾诉什么，或者只是想找人说说话，我都在。今天想聊些什么呢？',
        timestamp: new Date().toISOString()
      }

      // 保存到数据库
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.from('conversations').insert({
          session_id: sessionId,
          messages: [welcomeMsg]
        }).catch(() => {})
      }

      return new Response(JSON.stringify({ session_id: sessionId }), { headers: corsHeaders })
    }

    // 发送消息: POST /chat/:sessionId/message
    const messageMatch = path.match(/^\/chat\/(.+)\/message$/)
    if (messageMatch && method === 'POST') {
      const sessionId = messageMatch[1]
      const { message } = await req.json().catch(() => ({ message: '' }))

      if (!message) {
        return new Response(JSON.stringify({ error: '消息不能为空' }), { status: 400, headers: corsHeaders })
      }

      // 危机检测
      for (const keyword of CRISIS_KEYWORDS) {
        if (message.includes(keyword)) {
          const crisisResponse = `我听到你感觉很绝望。\n\n我想确认一下，你刚才说的"${keyword}"，是只是有这样的念头，还是有具体的想法或计划？\n\n如果你现在感觉非常危险，我建议你立即联系：\n- 全国心理危机干预热线：400-161-9995\n- 或者去最近的医院急诊\n\n你并不是一个人，帮助是存在的。`

          return new Response(JSON.stringify({
            response: crisisResponse,
            alert_level: 'crisis'
          }), { headers: corsHeaders })
        }
      }

      // 获取历史
      let history: any[] = []
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data } = await supabase
          .from('conversations')
          .select('messages')
          .eq('session_id', sessionId)
          .single()
        if (data?.messages) history = data.messages
      }

      // 调用LLM
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ]

      let response = ''

      // 智谱AI
      if (zhipuKey) {
        try {
          const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${zhipuKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'glm-4-flash', messages, temperature: 0.7, max_tokens: 500 })
          })
          if (res.ok) {
            const data = await res.json()
            response = data.choices?.[0]?.message?.content ?? ''
          }
        } catch (e) { console.error('智谱错误', e) }
      }

      // OpenAI
      if (!response && openaiKey) {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, temperature: 0.7, max_tokens: 500 })
          })
          if (res.ok) {
            const data = await res.json()
            response = data.choices?.[0]?.message?.content ?? ''
          }
        } catch (e) { console.error('OpenAI错误', e) }
      }

      // Fallback
      if (!response) {
        const msg = message.toLowerCase()
        if (msg.includes('累') || msg.includes('焦虑')) response = '我听到你感觉很疲惫。能够说说是什么让你感到这么累吗？'
        else if (msg.includes('难过') || msg.includes('伤心')) response = '我感受到你现在的难过。眼泪有时候是情绪的出口，想说说我能为你做些什么吗？'
        else if (msg.includes('谢谢')) response = '不用谢。我在这里陪你。还想聊些什么吗？'
        else response = '我在这里听你说。如果愿意的话，可以多说说你的想法和感受。'
      }

      // 保存
      const userMsg = { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date().toISOString() }
      const assistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date().toISOString() }
      const newMessages = [...history, userMsg, assistantMsg]

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.from('conversations').update({ messages: newMessages }).eq('session_id', sessionId).catch(() => {})
      }

      return new Response(JSON.stringify({ response, alert_level: null }), { headers: corsHeaders })
    }

    // 获取历史: GET /chat/:sessionId/history
    const historyMatch = path.match(/^\/chat\/(.+)\/history$/)
    if (historyMatch && method === 'GET') {
      const sessionId = historyMatch[1]

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data } = await supabase
          .from('conversations')
          .select('messages')
          .eq('session_id', sessionId)
          .single()

        return new Response(JSON.stringify({ messages: data?.messages || [] }), { headers: corsHeaders })
      }
      return new Response(JSON.stringify({ messages: [] }), { headers: corsHeaders })
    }

    // 健康检查: GET /health
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'healthy' }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders })

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})

console.log('可意AI Edge Function 已启动')
