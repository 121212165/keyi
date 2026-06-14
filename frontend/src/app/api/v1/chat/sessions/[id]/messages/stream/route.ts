import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSystemPrompt } from '@/lib/prompts'
import { detectCrisis } from '@/lib/safety'

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

    const crisis = detectCrisis(message)
    if (crisis) {
      return new Response(JSON.stringify({
        type: 'crisis',
        message: crisis.response,
      }), {
        status: 200,
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
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: '会话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
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

    const systemPrompt = buildSystemPrompt(session.therapy_mode || 'general')

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
      const errText = await llmRes.text().catch(() => '')
      console.error('LLM 流式请求失败:', llmRes.status, errText)

      if ([429, 500, 502, 503].includes(llmRes.status)) {
        await new Promise(r => setTimeout(r, 2000))
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

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()
    const now = new Date().toISOString()
    let fullReply = ''

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const reader = llmRes.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

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
                  fullReply += event.delta.text
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`)
                  )
                }

                if (event.type === 'message_stop') {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
                  )
                }
              } catch {
                // skip malformed data
              }
            }
          }
        } catch (streamError) {
          console.error('流读取错误:', streamError)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: '流读取中断' })}\n\n`)
          )
        } finally {
          controller.close()

          try {
            await supabaseAdmin().from('messages').insert({
              id: userMessageId,
              session_id: sessionId,
              role: 'user',
              content: message,
              created_at: now,
            })

            await supabaseAdmin().from('messages').insert({
              id: assistantMessageId,
              session_id: sessionId,
              role: 'assistant',
              content: fullReply,
              created_at: now,
            })

            const newCount = (session.message_count || 0) + 2
            const updateFields: Record<string, unknown> = {
              message_count: newCount,
              updated_at: now,
            }

            if (!session.title || session.title === '新对话') {
              updateFields.title = message.length > 20
                ? message.slice(0, 20) + '...'
                : message
            }

            await supabaseAdmin()
              .from('chat_sessions')
              .update(updateFields)
              .eq('id', sessionId)
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
