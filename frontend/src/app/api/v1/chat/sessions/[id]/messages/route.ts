import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSystemPrompt } from '@/lib/prompts'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '请提供消息内容' }, { status: 400 })
    }

    // 获取会话信息
    const { data: session, error: sessionError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    // 获取历史消息
    const { data: history } = await supabaseAdmin()
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(50)

    // 构建消息数组
    const messages = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(session.therapy_mode || 'general')

    // 调用 LLM API
    const llmBase = process.env.LLM_BASE_URL
    const llmKey = process.env.LLM_API_KEY

    if (!llmBase || !llmKey) {
      return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 })
    }

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
        messages,
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text()
      console.error('LLM 请求失败:', llmRes.status, errText)
      return NextResponse.json({ error: 'AI 服务暂时不可用，请稍后重试' }, { status: 502 })
    }

    const llmData = await llmRes.json()
    const reply = llmData.content?.[0]?.text || ''

    // 保存用户消息
    const userMessageId = crypto.randomUUID()
    const now = new Date().toISOString()

    await supabaseAdmin().from('messages').insert({
      id: userMessageId,
      session_id: sessionId,
      role: 'user',
      content: message,
      created_at: now,
    })

    // 保存助手消息
    const assistantMessageId = crypto.randomUUID()
    await supabaseAdmin().from('messages').insert({
      id: assistantMessageId,
      session_id: sessionId,
      role: 'assistant',
      content: reply,
      created_at: now,
    })

    // 更新会话消息计数
    const newCount = (session.message_count || 0) + 2
    const updateFields: Record<string, unknown> = {
      message_count: newCount,
      updated_at: now,
    }

    // 首条消息时自动生成标题
    if (!session.title || session.title === '新对话') {
      updateFields.title = message.length > 20
        ? message.slice(0, 20) + '...'
        : message
    }

    await supabaseAdmin()
      .from('chat_sessions')
      .update(updateFields)
      .eq('id', sessionId)

    return NextResponse.json({
      message_id: userMessageId,
      reply,
      reply_id: assistantMessageId,
      timestamp: now,
    })
  } catch (error) {
    console.error('发送消息接口错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
