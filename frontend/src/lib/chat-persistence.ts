import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export interface TurnContext {
  sessionId: string
  now: string
}

/**
 * 回合持久化。用户消息与助手消息分开落库，是为了让「模型挂了」不再连带丢掉用户说过的话。
 * api/v1/chat/sessions/[id]/messages/route.ts（非流式，当前前端不可达）仍是旧的同写路径，
 * 由 A3′ 迁移到这里；迁移前它不参与本轮 P0 修复。
 */

async function bumpSession(
  sessionId: string,
  extraFields: Record<string, unknown>,
): Promise<string | null> {
  // 重新读取再自增：请求开始时缓存的旧值在双开标号下会把计数写歪。
  const { data: current } = await supabaseAdmin()
    .from('chat_sessions')
    .select('message_count, title')
    .eq('id', sessionId)
    .single()

  const patch: Record<string, unknown> = {
    ...extraFields,
    message_count: (current?.message_count ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabaseAdmin().from('chat_sessions').update(patch).eq('id', sessionId)
  return error ? `会话更新失败: ${error.message}` : null
}

/** 落用户消息并即时定标题，使会话在侧栏立刻可见。返回 null 表示成功。 */
export async function recordUserTurn(
  ctx: TurnContext & { message: string },
): Promise<{ userMessageId: string; error: string | null }> {
  const userMessageId = crypto.randomUUID()

  const { error: insertError } = await supabaseAdmin().from('messages').insert({
    id: userMessageId,
    session_id: ctx.sessionId,
    role: 'user',
    content: ctx.message,
    created_at: ctx.now,
  })

  if (insertError) {
    return { userMessageId, error: `用户消息未保存: ${insertError.message}` }
  }

  const title = ctx.message.length > 20 ? `${ctx.message.slice(0, 20)}...` : ctx.message
  const { data: session } = await supabaseAdmin()
    .from('chat_sessions')
    .select('title')
    .eq('id', ctx.sessionId)
    .single()

  const extraFields: Record<string, unknown> = {}
  if (!session?.title || session.title === '新对话') extraFields.title = title

  const bumpError = await bumpSession(ctx.sessionId, extraFields)
  return { userMessageId, error: bumpError }
}

/** 落助手消息（metadata 不被接受时降级为无 metadata 重写）并更新会话记忆。 */
export async function recordAssistantTurn(
  ctx: TurnContext & {
    assistantMessageId: string
    content: string
    metadata: Record<string, unknown>
    sessionMemory: Record<string, unknown>
  },
): Promise<string | null> {
  // id 由调用方给定：SSE 里推给前端的 reply_id 必须与落库行一致。
  const row = {
    id: ctx.assistantMessageId,
    session_id: ctx.sessionId,
    role: 'assistant',
    content: ctx.content,
    created_at: ctx.now,
    metadata: ctx.metadata,
  }

  const first = await supabaseAdmin().from('messages').insert(row)
  if (first.error) {
    const { id, session_id, role, content, created_at } = row
    const fallback = await supabaseAdmin()
      .from('messages')
      .insert({ id, session_id, role, content, created_at })
    if (fallback.error) return `助手消息未保存: ${fallback.error.message}`
  }

  return bumpSession(ctx.sessionId, { emotion_summary: ctx.sessionMemory })
}

export async function logCrisisEvent(args: {
  sessionId: string
  userId: string
  userMessage: string
  responseGiven: string
  alertLevel: string
  detectedKeyword: string
}): Promise<void> {
  const { error } = await supabaseAdmin().from('crisis_events').insert({
    id: crypto.randomUUID(),
    session_id: args.sessionId,
    user_id: args.userId,
    alert_level: args.alertLevel,
    detected_keyword: args.detectedKeyword,
    user_message: args.userMessage,
    response_given: args.responseGiven,
    metadata: {},
    created_at: new Date().toISOString(),
  })

  if (error) console.error('记录危机事件失败:', error)
}
