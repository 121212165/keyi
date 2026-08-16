import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSystemPrompt } from '@/lib/prompts'
import {
  detectCrisis,
  extractAssistantArtifacts,
  getVisibleReplyFromRaw,
} from '@/lib/chat-runtime'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '请提供消息内容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未提供认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.slice(7)
    const { data: userData, error: authError } = await supabaseAdmin().auth.getUser(token)

    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: '认证失败，请重新登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: session, error: sessionError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userData.user.id)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: '会话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const therapyMode = session.therapy_mode || 'general'
    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()
    const now = new Date().toISOString()
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

      return createCrisisSseResponse({
        userMessageId,
        assistantMessageId,
        responseText: crisisResult.response,
        alertLevel: crisisResult.level,
        detectedKeyword: crisisResult.keyword,
      })
    }

    const { data: history } = await supabaseAdmin()
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    const messages = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const systemPrompt = buildSystemPrompt(therapyMode)
    const llmBase = process.env.LLM_BASE_URL
    const llmKey = process.env.LLM_API_KEY

    if (!llmBase || !llmKey) {
      return new Response(JSON.stringify({ error: 'AI 服务未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let llmRes = await fetch(`${llmBase}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': llmKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text()
      console.error('LLM 流式请求失败:', llmRes.status, errText)

      if (llmRes.status === 529 || llmRes.status === 503 || llmRes.status === 429) {
        const retryRes = await fetch(`${llmBase}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': llmKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            stream: true,
          }),
        })

        if (retryRes.ok && retryRes.body) {
          llmRes = retryRes
        } else {
          return new Response(JSON.stringify({ error: 'AI 服务暂时繁忙，请稍后再试' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      } else {
        return new Response(JSON.stringify({ error: 'AI 服务暂时不可用，请稍后重试' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    if (!llmRes.body) {
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let rawReply = ''
    let visibleReply = ''

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const reader = llmRes.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let doneSent = false

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'message_start', message_id: userMessageId, reply_id: assistantMessageId })}\n\n`)
        )

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue

              const jsonStr = line.slice(6).trim()
              if (jsonStr === '[DONE]') continue

              try {
                const event = JSON.parse(jsonStr)

                if (event.type === 'content_block_delta' && event.delta?.text) {
                  rawReply += event.delta.text
                  const nextVisibleReply = getVisibleReplyFromRaw(rawReply)
                  const nextDelta = nextVisibleReply.slice(visibleReply.length)

                  if (nextDelta) {
                    visibleReply = nextVisibleReply
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: nextDelta })}\n\n`)
                    )
                  }
                }

                if (event.type === 'message_stop' && !doneSent) {
                  doneSent = true
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
                  )
                }
              } catch {
                continue
              }
            }
          }
        } catch (streamError) {
          console.error('流读取错误:', streamError)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: '流读取中断' })}\n\n`)
          )
        } finally {
          if (!doneSent) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            )
          }

          controller.close()

          try {
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
          } catch (dbError) {
            console.error('保存流式消息失败:', dbError)
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('流式消息接口错误:', error)
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function createCrisisSseResponse({
  userMessageId,
  assistantMessageId,
  responseText,
  alertLevel,
  detectedKeyword,
}: {
  userMessageId: string
  assistantMessageId: string
  responseText: string
  alertLevel: string
  detectedKeyword: string
}) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'message_start', message_id: userMessageId, reply_id: assistantMessageId })}\n\n`)
      )
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'crisis', alert_level: alertLevel, detected_keyword: detectedKeyword })}\n\n`)
      )
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: responseText })}\n\n`)
      )
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'done', alert_level: alertLevel })}\n\n`)
      )
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
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

interface ChatSessionRecord {
  message_count?: number | null
  title?: string | null
}
