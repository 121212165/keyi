import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未提供认证令牌' }, { status: 401 })
    }

    const token = authHeader.slice(7)

    const { data: userData, error: authError } = await supabaseAdmin().auth.getUser(token)

    if (authError || !userData.user) {
      return NextResponse.json({ error: '认证失败，请重新登录' }, { status: 401 })
    }

    const { id } = await params

    // Verify session belongs to user
    const { data: session, error: fetchError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single()

    if (fetchError || !session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    const { data: messages, error: queryError } = await supabaseAdmin()
      .from('messages')
      .select('id, role, content, created_at, emotion')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (queryError) {
      console.error('查询消息历史失败:', queryError)
      return NextResponse.json({ error: '获取消息历史失败' }, { status: 500 })
    }

    const formattedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      emotion: msg.emotion,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (e) {
    console.error('GET history error:', e)
    return NextResponse.json({ error: '获取消息历史失败' }, { status: 500 })
  }
}
