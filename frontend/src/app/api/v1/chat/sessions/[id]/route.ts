import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { deleteSession, ownedSession } from '@/lib/chat-service'

interface Context { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params
    const session = await ownedSession(auth.db, auth.userId, id)
    return ok(session, { session })
  } catch (error) {
    return fail(error, '获取会话失败')
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params
    return ok(await deleteSession(auth.db, auth.userId, id))
  } catch (error) {
    return fail(error, '删除会话失败')
  }
}
