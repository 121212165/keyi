import type { SupabaseClient } from '@supabase/supabase-js'
import { ApiError } from '@/lib/api'
import { dbError, isSchemaMissing } from '@/lib/db-errors'
import { promptMemories } from '@/lib/memory-service'
import { buildSystemPrompt } from '@/lib/prompts'
import { ensureCurrentPlan, safePlanStage } from '@/lib/therapy-service'

export async function ownedSession(db: SupabaseClient, userId: string, id: string) {
  const { data, error } = await db.from('chat_sessions').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
  if (error) throw dbError(error, '读取会话失败')
  if (!data) throw new ApiError(404, 'session_not_found', '会话不存在')
  return data
}

export async function listSessions(db: SupabaseClient, userId: string) {
  const { data, error } = await db.from('chat_sessions').select('*').eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw dbError(error, '获取会话列表失败')
  return data ?? []
}

export async function createSession(db: SupabaseClient, userId: string, therapyMode: string) {
  const plan = await ensureCurrentPlan(db, userId, true)
  const now = new Date().toISOString()
  const base = {
    id: crypto.randomUUID(), user_id: userId, title: '新对话', started_at: now, updated_at: now,
    emotion_summary: {}, message_count: 0, therapy_mode: therapyMode === 'desensitize' ? 'desensitize' : 'cbt',
  }
  let result = await db.from('chat_sessions').insert({
    ...base, plan_id: plan?.id ?? null, session_type: therapyMode === 'desensitize' ? 'exposure' : 'cbt',
    summary_status: 'not_requested',
  }).select('*').single()
  if (result.error && isSchemaMissing(result.error)) result = await db.from('chat_sessions').insert(base).select('*').single()
  if (result.error) throw dbError(result.error, '创建会话失败')
  return result.data
}

export async function deleteSession(db: SupabaseClient, userId: string, id: string) {
  await ownedSession(db, userId, id)
  const { error } = await db.from('chat_sessions').delete().eq('id', id).eq('user_id', userId)
  if (error) throw dbError(error, '删除会话失败')
  return { id, deleted: true, message: '删除成功' }
}

export async function history(db: SupabaseClient, userId: string, id: string, limit = 50) {
  await ownedSession(db, userId, id)
  const { data, error } = await db.from('messages').select('id,role,content,created_at,emotion')
    .eq('session_id', id).order('created_at', { ascending: true }).limit(limit)
  if (error) throw dbError(error, '获取消息历史失败')
  return (data ?? []).map((item: Record<string, unknown>) => ({ ...item, timestamp: item.created_at }))
}

export async function chatContext(db: SupabaseClient, userId: string, session: Record<string, unknown>, message: string) {
  const { data: recent, error } = await db.from('messages').select('role,content').eq('session_id', session.id)
    .order('created_at', { ascending: false }).limit(20)
  if (error) throw dbError(error, '读取最近消息失败')
  const memories = await promptMemories(db, userId, typeof session.plan_id === 'string' ? session.plan_id : null)
  const activeStage = await safePlanStage(db, userId)
  let summary = ''
  const summaryResult = await db.from('session_summaries').select('summary').eq('session_id', session.id)
    .eq('user_id', userId).eq('status', 'completed').order('version', { ascending: false }).limit(1).maybeSingle()
  if (!summaryResult.error) summary = summaryResult.data?.summary ?? ''
  else if (!isSchemaMissing(summaryResult.error)) console.error('读取会话摘要失败', summaryResult.error)
  const current = summary ? `<session_summary priority=lowest>${summary.slice(0, 2000)}</session_summary>\n\n${message}` : message
  return {
    system: buildSystemPrompt(String(session.therapy_mode ?? 'cbt'), { activeStage, ...memories }),
    messages: [...(recent ?? []).reverse(), { role: 'user', content: current }],
  }
}

export async function saveUserMessage(db: SupabaseClient, sessionId: string, content: string) {
  const item = { id: crypto.randomUUID(), session_id: sessionId, role: 'user', content, created_at: new Date().toISOString() }
  const { error } = await db.from('messages').insert(item)
  if (error) throw dbError(error, '保存用户消息失败')
  return item
}

export async function saveAssistantMessage(db: SupabaseClient, session: Record<string, unknown>, content: string, id = crypto.randomUUID()) {
  const now = new Date().toISOString()
  const item = { id, session_id: session.id, role: 'assistant', content, created_at: now }
  const { error } = await db.from('messages').insert(item)
  if (error) throw dbError(error, '保存助手消息失败')
  const countResult = await db.from('messages').select('*', { count: 'exact', head: true }).eq('session_id', session.id)
  const update: Record<string, unknown> = { updated_at: now, message_count: countResult.count ?? Number(session.message_count ?? 0) + 2 }
  if ((!session.title || session.title === '新对话') && typeof session.pending_user_message === 'string') {
    const source = session.pending_user_message
    update.title = source.length > 20 ? `${source.slice(0, 20)}...` : source
  }
  const { error: updateError } = await db.from('chat_sessions').update(update).eq('id', session.id).eq('user_id', session.user_id)
  if (updateError) throw dbError(updateError, '更新会话失败')
  return item
}
