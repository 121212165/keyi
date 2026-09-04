import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { listMemories } from '@/lib/memory-service'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    const memories = await listMemories(auth.db, auth.userId)
    return ok(memories, { memories, count: memories.length })
  } catch (error) {
    return fail(error, '获取记忆失败')
  }
}
