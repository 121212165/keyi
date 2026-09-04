import { requireAuth } from '@/lib/auth'
import { fail, jsonBody, ok, textField } from '@/lib/api'
import { chatContext, ownedSession, saveAssistantMessage, saveUserMessage } from '@/lib/chat-service'
import { completionText, requestLlm } from '@/lib/llm'
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
    let reply = crisis?.response ?? ''
    if (context) {
      reply = await completionText(await requestLlm(context.system, context.messages, false))
    }
    const assistant = await saveAssistantMessage(auth.db, { ...session, pending_user_message: message }, reply)
    return ok({ message_id: userMessage.id, reply, reply_id: assistant.id, timestamp: assistant.created_at })
  } catch (error) {
    return fail(error, '发送消息失败')
  }
}
