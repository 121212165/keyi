import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticate } from '@/lib/api-auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticate(req)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status })
    }

    const { id } = await params

    // Check if session exists and belongs to user
    const { data: session, error: fetchError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', auth.userId)
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
