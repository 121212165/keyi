import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { createSession, listSessions } from '@/lib/chat-service'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    const sessions = await listSessions(auth.db, auth.userId)
    return ok(sessions, { sessions })
  } catch (error) {
    return fail(error, '获取会话列表失败')
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const mode = typeof body.therapy_mode === 'string' ? body.therapy_mode : 'cbt'
    const session = await createSession(auth.db, auth.userId, mode)
    return ok(session, { session })
  } catch (error) {
    return fail(error, '创建会话失败')
  }
}
