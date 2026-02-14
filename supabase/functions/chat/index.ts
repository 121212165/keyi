// 可意AI心理医生 - Supabase Edge Function
// 同时支持：前端query参数格式 + JSON Body格式

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams
    const action = searchParams.get('action') || ''
    const sessionId = searchParams.get('session_id') || ''

    // 解析Body
    const body = await req.json().catch(() => ({}))
    const message = body.message || body.content || ''

    console.log('收到请求:', { action, sessionId, message })

    // === 前端query参数格式支持 ===
    // POST /chat?action=create
    if (action === 'create') {
      return new Response(JSON.stringify({
        success: true,
        session_id: sessionId || crypto.randomUUID(),
        message: '会话创建成功'
      }), { headers: corsHeaders })
    }

    // POST /chat?session_id=xxx
    if (sessionId && !action) {
      if (!message) {
        return new Response(JSON.stringify({
          error: '消息内容不能为空'
        }), { status: 400, headers: corsHeaders })
      }

      // 危机检测
      const crisisResult = detectCrisis(message)

      if (crisisResult.isCrisis) {
        console.log('检测到危机:', crisisResult)
        return new Response(JSON.stringify({
          response: crisisResult.response,
          alert_level: crisisResult.level,
          detected_keyword: crisisResult.keyword,
          timestamp: new Date().toISOString()
        }), { headers: corsHeaders })
      }

      // 正常回复
      return new Response(JSON.stringify({
        response: `我收到了："${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        alert_level: 'none',
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders })
    }

    // GET /chat?session_id=xxx&action=history
    if (action === 'history' && sessionId) {
      return new Response(JSON.stringify({
        success: true,
        messages: [],
        session_id: sessionId
      }), { headers: corsHeaders })
    }

    // GET /chat?action=health
    if (action === 'health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders })
    }

    // === JSON Body格式支持 ===
    // POST /chat { message: "xxx" }
    if (message) {
      const crisisResult = detectCrisis(message)

      if (crisisResult.isCrisis) {
        return new Response(JSON.stringify({
          response: crisisResult.response,
          alert_level: crisisResult.level,
          detected_keyword: crisisResult.keyword,
          timestamp: new Date().toISOString()
        }), { headers: corsHeaders })
      }

      return new Response(JSON.stringify({
        response: `收到消息："${message.substring(0, 50)}..."`,
        alert_level: 'none',
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders })
    }

    // 默认返回帮助信息
    return new Response(JSON.stringify({
      message: '可意AI心理医生 API',
      endpoints: {
        'POST /chat { message: "xxx" }': '发送消息',
        'POST /chat?action=create': '创建会话',
        'POST /chat?session_id=xxx': '发送消息（兼容前端）',
        'GET /chat?session_id=xxx&action=history': '获取历史'
      }
    }), { headers: corsHeaders })

  } catch (error: any) {
    console.error('错误:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})

// 危机检测函数
function detectCrisis(message: string): {
  isCrisis: boolean
  level: string
  keyword: string
  response: string
} {
  const crisisKeywords = [
    { keyword: '自杀', level: 'critical', response: '我听到你了。你说"自杀"，这让我很担心你。\n\n【重要】如果你正在考虑伤害自己，请拨打心理援助热线：\n- 全国心理援助热线: 400-161-9995 (24小时)\n- 北京心理危机干预中心: 010-82951332\n\n你愿意告诉我更多吗？我在这里陪着你。' },
    { keyword: '想死', level: 'critical', response: '我听到你了。你说"想死"，这让我很担心你。\n\n【重要】如果你正在考虑伤害自己，请拨打心理援助热线：\n- 全国心理援助热线: 400-161-9995 (24小时)\n\n你愿意告诉我更多吗？我在这里陪着你。' },
    { keyword: '不想活了', level: 'critical', response: '我听到你了。你说"不想活了"，我能感受到你现在很痛苦。\n\n【重要】请拨打心理援助热线: 400-161-9995 (24小时)\n\n你愿意告诉我更多吗？我在这里陪着你。' },
    { keyword: '自残', level: 'critical', response: '谢谢你告诉我这些。你说"自残"，我能感受到你现在很难受。\n\n【重要】请拨打心理援助热线: 400-161-9995\n\n我会陪着你。' },
    { keyword: '结束生命', level: 'critical', response: '我听到你了。你说"结束生命"，这让我很担心你。\n\n【重要】请立即拨打: 400-161-9995 (24小时)\n\n你愿意告诉我更多吗？' },
    { keyword: '绝望', level: 'high', response: '听起来你现在很绝望。感谢你告诉我这些。\n\n如果感觉太难熬，可以拨打热线聊聊: 400-161-9995' },
    { keyword: '活着没意义', level: 'high', response: '我能感受到你说"活着没意义"时的痛苦。\n\n如果需要倾诉，我在这里。如果感觉太难熬，可以拨打: 400-161-9995' },
    { keyword: '活不下去', level: 'high', response: '你说"活不下去"，我听到了。你现在一定很难受。\n\n请拨打: 400-161-9995，我会陪你。' },
    { keyword: '崩溃', level: 'medium', response: '听起来你快崩溃了。我能理解这很难受。\n\n深呼吸一下，如果需要，拨打: 400-161-9995' },
    { keyword: '痛苦到无法承受', level: 'high', response: '你说"痛苦到无法承受"，我听到了。\n\n这不是你的错，请拨打心理援助热线: 400-161-9995' },
    { keyword: '活着没意思', level: 'high', response: '我能感受到你说"活着没意思"时的无力和痛苦。\n\n如果愿意，可以告诉我更多。如果太难熬，拨打: 400-161-9995' }
  ]

  for (const item of crisisKeywords) {
    if (message.includes(item.keyword)) {
      return {
        isCrisis: true,
        level: item.level,
        keyword: item.keyword,
        response: item.response
      }
    }
  }

  return {
    isCrisis: false,
    level: 'none',
    keyword: '',
    response: ''
  }
}
