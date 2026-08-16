import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSystemPrompt } from '@/lib/prompts'
import { detectCrisis, extractAssistantArtifacts } from '@/lib/chat-runtime'

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

    const authHeader = req.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未提供认证令牌' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: userData, error: authError } = await supabaseAdmin().auth.getUser(token)

    if (authError || !userData.user) {
      return NextResponse.json({ error: '认证失败，请重新登录' }, { status: 401 })
    }

    const { data: session, error: sessionError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userData.user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()
    const now = new Date().toISOString()
    const therapyMode = session.therapy_mode || 'general'
    const crisisResult = detectCrisis(message)

    if (crisisResult) {
      const sessionMemory = {
        ...(session.emotion_summary || {}),
        therapy_mode: therapyMode,
        last_crisis_level: crisisResult.level,
        last_crisis_keyword: crisisResult.keyword,
        updated_at: now,
      }

      await persistConversation({
        sessionId,
        session,
        now,
        userMessageId,
        assistantMessageId,
        userMessage: message,
        assistantReply: crisisResult.response,
        assistantMetadata: {
          type: 'crisis_response',
          alert_level: crisisResult.level,
          detected_keyword: crisisResult.keyword,
        },
        sessionMemory,
      })

      await logCrisisEvent({
        sessionId,
        userId: userData.user.id,
        userMessage: message,
        responseGiven: crisisResult.response,
        alertLevel: crisisResult.level,
        detectedKeyword: crisisResult.keyword,
      })

      return NextResponse.json({
        message_id: userMessageId,
        reply: crisisResult.response,
        reply_id: assistantMessageId,
        timestamp: now,
        alert_level: crisisResult.level,
        detected_keyword: crisisResult.keyword,
        type: 'crisis',
      })
    }

    const { data: history } = await supabaseAdmin()
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(50)

    const messages = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const systemPrompt = buildSystemPrompt(therapyMode)
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
    const rawReply = llmData.content?.[0]?.text || ''
    const { cleanReply, metadata, sessionMemory } = extractAssistantArtifacts(
      rawReply,
      therapyMode,
      session.emotion_summary,
    )

    await persistConversation({
      sessionId,
      session,
      now,
      userMessageId,
      assistantMessageId,
      userMessage: message,
      assistantReply: cleanReply,
      assistantMetadata: metadata,
      sessionMemory,
    })

    return NextResponse.json({
      message_id: userMessageId,
      reply: cleanReply,
      reply_id: assistantMessageId,
      timestamp: now,
    })
  } catch (error) {
    console.error('发送消息接口错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

async function persistConversation({
  sessionId,
  session,
  now,
  userMessageId,
  assistantMessageId,
  userMessage,
  assistantReply,
  assistantMetadata,
  sessionMemory,
}: {
  sessionId: string
  session: ChatSessionRecord
  now: string
  userMessageId: string
  assistantMessageId: string
  userMessage: string
  assistantReply: string
  assistantMetadata: Record<string, unknown>
  sessionMemory: Record<string, unknown>
}) {
  const rows = [
    {
      id: userMessageId,
      session_id: sessionId,
      role: 'user',
      content: userMessage,
      created_at: now,
    },
    {
      id: assistantMessageId,
      session_id: sessionId,
      role: 'assistant',
      content: assistantReply,
      created_at: now,
      metadata: assistantMetadata,
    },
  ]

  const insertResult = await supabaseAdmin().from('messages').insert(rows)

  if (insertResult.error) {
    const fallbackResult = await supabaseAdmin().from('messages').insert(
      rows.map((row) => {
        const fallbackRow = { ...row } as typeof row & { metadata?: Record<string, unknown> }
        delete fallbackRow.metadata
        return fallbackRow
      }),
    )

    if (fallbackResult.error) {
      throw fallbackResult.error
    }
  }

  const updateFields: Record<string, unknown> = {
    message_count: (session.message_count || 0) + 2,
    updated_at: now,
    emotion_summary: sessionMemory,
  }

  if (!session.title || session.title === '新对话') {
    updateFields.title = userMessage.length > 20
      ? `${userMessage.slice(0, 20)}...`
      : userMessage
  }

  const { error: updateError } = await supabaseAdmin()
    .from('chat_sessions')
    .update(updateFields)
    .eq('id', sessionId)

  if (updateError) {
    throw updateError
  }
}

interface ChatSessionRecord {
  message_count?: number | null
  title?: string | null
}

async function logCrisisEvent({
  sessionId,
  userId,
  userMessage,
  responseGiven,
  alertLevel,
  detectedKeyword,
}: {
  sessionId: string
  userId: string
  userMessage: string
  responseGiven: string
  alertLevel: string
  detectedKeyword: string
}) {
  const { error } = await supabaseAdmin().from('crisis_events').insert({
    id: crypto.randomUUID(),
    session_id: sessionId,
    user_id: userId,
    alert_level: alertLevel,
    detected_keyword: detectedKeyword,
    user_message: userMessage,
    response_given: responseGiven,
    metadata: {},
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('记录危机事件失败:', error)
  }
}
