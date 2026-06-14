import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
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

    // Check if session exists and belongs to user
    const { data: session, error: fetchError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single()

    if (fetchError || !session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    // Delete messages first
    const { error: messagesDeleteError } = await supabaseAdmin()
      .from('messages')
      .delete()
      .eq('session_id', id)

    if (messagesDeleteError) {
      console.error('删除消息失败:', messagesDeleteError)
      return NextResponse.json({ error: '删除消息失败' }, { status: 500 })
    }

    // Delete session
    const { error: sessionDeleteError } = await supabaseAdmin()
      .from('chat_sessions')
      .delete()
      .eq('id', id)

    if (sessionDeleteError) {
      console.error('删除会话失败:', sessionDeleteError)
      return NextResponse.json({ error: '删除会话失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '删除成功' })
  } catch (e) {
    console.error('DELETE session error:', e)
    return NextResponse.json({ error: '删除会话失败' }, { status: 500 })
  }
}
