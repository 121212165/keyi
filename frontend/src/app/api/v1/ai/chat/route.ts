import { NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/lib/prompts'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '请提供消息内容' }, { status: 400 })
    }

    const llmBase = process.env.LLM_BASE_URL
    const llmKey = process.env.LLM_API_KEY

    if (!llmBase || !llmKey) {
      return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 })
    }

    const systemPrompt = buildSystemPrompt('general')

    const llmRes = await fetch(`${llmBase}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': llmKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text()
      console.error('LLM 请求失败:', llmRes.status, errText)
      return NextResponse.json({ error: 'AI 服务暂时不可用，请稍后重试' }, { status: 502 })
    }

    const data = await llmRes.json()
    const reply = data.content?.[0]?.text || ''

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI 聊天接口错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
