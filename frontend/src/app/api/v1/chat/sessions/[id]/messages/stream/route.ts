import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticate } from '@/lib/api-auth'
import { buildSystemPrompt } from '@/lib/prompts'
import {
  extractAssistantArtifacts,
  getVisibleReplyFromRaw,
  planCrisisTurn,
  readInterview,
  withCrisisInterview,
} from '@/lib/chat-runtime'
import {
  logCrisisEvent,
  recordAssistantTurn,
  recordUserTurn,
} from '@/lib/chat-persistence'

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

    const auth = await authenticate(req)
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.message }), {
        status: auth.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: session, error: sessionError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', auth.userId)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: '会话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const therapyMode = session.therapy_mode || 'general'
    const assistantMessageId = crypto.randomUUID()
    const now = new Date().toISOString()

    const userTurn = await recordUserTurn({ sessionId, now, message })
    if (userTurn.error) {
      console.error(userTurn.error)
      return new Response(JSON.stringify({ error: '消息未能保存，请稍后重试' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const userMessageId = userTurn.userMessageId

    const crisisResult = planCrisisTurn(message, readInterview(session.emotion_summary))

    if (crisisResult) {
      const sessionMemory = withCrisisInterview(
        {
          ...(session.emotion_summary || {}),
          therapy_mode: therapyMode,
          last_crisis_level: crisisResult.level,
          last_crisis_keyword: crisisResult.keyword,
          last_crisis_score: crisisResult.score,
          updated_at: now,
        },
        crisisResult.interview,
      )

      // 危机话术必须先到达用户：落库失败只追加 store_error，不阻塞也不吞掉求助。
      let crisisStoreError: string | null = null
      try {
        crisisStoreError = await recordAssistantTurn({
          sessionId,
          now,
          assistantMessageId,
          content: crisisResult.response,
          metadata: {
            type: 'crisis_response',
            alert_level: crisisResult.level,
            detected_keyword: crisisResult.keyword,
          },
          sessionMemory,
        })
      } catch (error) {
        crisisStoreError = error instanceof Error ? error.message : String(error)
      }

      await logCrisisEvent({
        sessionId,
        userId: auth.userId,
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
        storeError: crisisStoreError,
      })
    }

    // ascending + limit 取的是「最早」N 条 —— 会话满 20 条后模型就再也看不到最近的对话。
    const { data: history } = await supabaseAdmin()
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20)

    // 本轮用户消息已先落库，窗口里天然含它；反转回时间正序供模型阅读。
    const messages = [...(history || [])].reverse()

    const systemPrompt = buildSystemPrompt(therapyMode, session.emotion_summary)
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
          let storeError: string | null = null

          try {
            const { cleanReply, metadata, sessionMemory } = extractAssistantArtifacts(
              rawReply,
              therapyMode,
              session.emotion_summary,
            )

            storeError = await recordAssistantTurn({
              sessionId,
              now,
              assistantMessageId,
              content: cleanReply,
              metadata,
              sessionMemory,
            })
          } catch (dbError) {
            console.error('保存流式消息失败:', dbError)
            storeError = dbError instanceof Error ? dbError.message : String(dbError)
          }

          if (!doneSent) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            )
          }

          // 落库失败必须让用户看见：否则界面显示成功而库里什么都没有，刷新即蒸发。
          if (storeError) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'store_error', error: storeError })}\n\n`)
            )
          }

          controller.close()
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
  storeError,
}: {
  userMessageId: string
  assistantMessageId: string
  responseText: string
  alertLevel: string
  detectedKeyword: string
  storeError: string | null
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
      if (storeError) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'store_error', error: storeError })}\n\n`)
        )
      }
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

