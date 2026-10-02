import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticate } from '@/lib/api-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limitParam = Number(req.nextUrl.searchParams.get('limit') ?? '50')
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.trunc(limitParam), 1), 200)
      : 50

    const auth = await authenticate(req)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status })
    }

    const { id } = await params

    // Verify session belongs to user
    const { data: session, error: fetchError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', auth.userId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    // ascending + limit 会让用户打开老会话时只看到最老的 N 条；改为取最近再反转回时间正序
    // emotion 是从未写入过的僵尸列；CBT/SUD/睡眠记录一直在 metadata 里，但这里从不 select，
    // 导致用户永远看不到自己做过的治疗记录。
    const { data: messages, error: queryError } = await supabaseAdmin()
      .from('messages')
      .select('id, role, content, created_at, metadata')
      .eq('session_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (queryError) {
      console.error('查询消息历史失败:', queryError)
      return NextResponse.json({ error: '获取消息历史失败' }, { status: 500 })
    }

    const formattedMessages = (messages || []).reverse().map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      metadata: msg.metadata ?? {},
    }))

    return NextResponse.json(formattedMessages)
  } catch (e) {
    console.error('GET history error:', e)
    return NextResponse.json({ error: '获取消息历史失败' }, { status: 500 })
  }
}
