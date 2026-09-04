import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { revokeMemory } from '@/lib/memory-service'

async function revoke(request: Request, params: Promise<{ id: string }>) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const reason = typeof body.reason === 'string' ? body.reason : undefined
    return ok(await revokeMemory(auth.db, auth.userId, id, reason))
  } catch (error) {
    return fail(error, '撤回记忆失败')
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return revoke(request, params)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return revoke(request, params)
}
