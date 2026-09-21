import { supabaseAdmin } from '@/lib/supabase'

export type Authenticated = { ok: true; userId: string }
export type Rejected = { ok: false; status: number; message: string }

/**
 * Bearer 鉴权。这段样板此前在 6 个路由里逐字重复，任何一处漏掉 `.eq('user_id', ...)`
 * 就是越权读别人会话——收敛到一个入口才好审计。
 */
export async function authenticate(req: Request): Promise<Authenticated | Rejected> {
  const header = req.headers.get('authorization')

  if (!header?.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: '未提供认证令牌' }
  }

  const { data, error } = await supabaseAdmin().auth.getUser(header.slice(7))

  if (error || !data.user) {
    return { ok: false, status: 401, message: '认证失败，请重新登录' }
  }

  return { ok: true, userId: data.user.id }
}
