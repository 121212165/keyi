import { requireAuth } from '@/lib/auth'
import { fail, ok } from '@/lib/api'
import { getPlanView } from '@/lib/therapy-service'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    const view = await getPlanView(auth.db, auth.userId)
    return ok(view)
  } catch (error) {
    return fail(error, '获取治疗计划失败')
  }
}
