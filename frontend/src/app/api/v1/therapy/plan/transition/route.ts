import { requireAuth } from '@/lib/auth'
import { fail, jsonBody, ok } from '@/lib/api'
import { transitionPlan } from '@/lib/therapy-service'

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request)
    const view = await transitionPlan(auth.db, auth.userId, await jsonBody(request))
    return ok(view)
  } catch (error) {
    return fail(error, '转换治疗计划失败')
  }
}
