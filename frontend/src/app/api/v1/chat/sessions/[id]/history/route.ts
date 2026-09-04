import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { history } from '@/lib/chat-service'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params
    const messages = await history(auth.db, auth.userId, id)
    return ok(messages, { messages })
  } catch (error) {
    return fail(error, '获取消息历史失败')
  }
}
