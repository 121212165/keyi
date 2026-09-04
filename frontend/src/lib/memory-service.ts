import type { SupabaseClient } from '@supabase/supabase-js'
import { dbError, isSchemaMissing } from '@/lib/db-errors'

export async function listMemories(db: SupabaseClient, userId: string) {
  const { data, error } = await db.from('memory_items').select('*').eq('user_id', userId)
    .is('retracted_at', null).is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
  if (error) throw dbError(error, '获取记忆失败')
  return (data ?? []).map((item: Record<string, unknown>) => ({ ...item, status: 'active', source_session_id: item.session_id }))
}

export async function revokeMemory(db: SupabaseClient, userId: string, id: string, reason?: string) {
  const now = new Date().toISOString()
  const { error } = await db.from('memory_items').update({
    retracted_at: now, retracted_by: userId, retraction_reason: reason || 'user_requested',
  }).eq('id', id).eq('user_id', userId)
  if (error) throw dbError(error, '撤回记忆失败')
  return { id, status: 'revoked', retracted_at: now }
}

export async function promptMemories(db: SupabaseClient, userId: string, planId?: string | null) {
  const empty = { userMemory: [] as string[], therapyMemory: [] as string[] }
  try {
    const { data, error } = await db.from('memory_items').select('content,memory_type,memory_layer,plan_id,importance')
      .eq('user_id', userId).is('retracted_at', null).is('deleted_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('importance', { ascending: false }).limit(20)
    if (error) {
      if (isSchemaMissing(error)) return empty
      throw dbError(error, '读取提示词记忆失败')
    }
    for (const item of data ?? []) {
      const content = String(item.content).slice(0, 500)
      if (item.memory_type === 'user_memory' || item.memory_layer === 'semantic') empty.userMemory.push(content)
      else if ((item.memory_type === 'therapy_memory' || item.plan_id === planId) && (!item.plan_id || item.plan_id === planId)) empty.therapyMemory.push(content)
    }
    return empty
  } catch (error) {
    console.error('读取分层记忆失败，已降级为空上下文', error)
    return empty
  }
}
