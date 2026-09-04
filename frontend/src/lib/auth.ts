import type { SupabaseClient, User } from '@supabase/supabase-js'
import { ApiError } from '@/lib/api'
import { supabaseAdmin, supabaseForToken } from '@/lib/supabase'

export interface AuthContext {
  user: User
  userId: string
  token: string
  db: SupabaseClient
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'missing_access_token', '未提供认证令牌')
  const token = header.slice(7).trim()
  const { data, error } = await supabaseAdmin().auth.getUser(token)
  if (error || !data.user) throw new ApiError(401, 'invalid_access_token', '认证失败，请重新登录')
  return { user: data.user, userId: data.user.id, token, db: supabaseForToken(token) }
}
