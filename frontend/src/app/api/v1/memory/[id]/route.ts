import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { revokeMemory } from '@/lib/memory-service'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params
    const reason = new URL(request.url).searchParams.get('reason') ?? undefined
    return ok(await revokeMemory(auth.db, auth.userId, id, reason))
  } catch (error) {
    return fail(error, '撤回记忆失败')
  }
}
