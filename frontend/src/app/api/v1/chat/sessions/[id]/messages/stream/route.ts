import { requireAuth } from '@/lib/auth'
import { fail, jsonBody, textField } from '@/lib/api'
import { chatContext, ownedSession, saveAssistantMessage, saveUserMessage } from '@/lib/chat-service'
import { requestLlm, sseJson, textDeltas } from '@/lib/llm'
import { detectCrisis } from '@/lib/safety'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    const body = await jsonBody(request)
    const message = textField(body.message, '消息内容')
    const { id } = await params
    const session = await ownedSession(auth.db, auth.userId, id)
    const crisis = detectCrisis(message)
    const context = crisis ? null : await chatContext(auth.db, auth.userId, session, message)
    const userMessage = await saveUserMessage(auth.db, id, message)
    const response = context ? await requestLlm(context.system, context.messages, true) : null
    const replyId = crypto.randomUUID()

    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = ''
        controller.enqueue(sseJson({ type: 'message_start', message_id: userMessage.id, reply_id: replyId }))
        try {
          if (crisis) {
            fullReply = crisis.response
            controller.enqueue(sseJson({ type: 'crisis', level: crisis.level }))
            controller.enqueue(sseJson({ type: 'delta', text: fullReply }))
          } else if (response) {
            for await (const delta of textDeltas(response)) {
              fullReply += delta
              controller.enqueue(sseJson({ type: 'delta', text: delta }))
            }
          }
          await saveAssistantMessage(auth.db, { ...session, pending_user_message: message }, fullReply, replyId)
          controller.enqueue(sseJson({ type: 'done' }))
        } catch (error) {
          console.error('流式回复失败', error)
          controller.enqueue(sseJson({ type: 'error', error: '流式回复中断' }))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' },
    })
  } catch (error) {
    return fail(error, '流式消息接口错误')
  }
}
