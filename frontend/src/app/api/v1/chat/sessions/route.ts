import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => ({}))
    const therapyMode = body.therapy_mode || 'default'

    const sessionId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error: insertError } = await supabaseAdmin()
      .from('chat_sessions')
      .insert({
        id: sessionId,
        user_id: userData.user.id,
        title: '新对话',
        started_at: now,
        updated_at: now,
        emotion_summary: {},
        message_count: 0,
        therapy_mode: therapyMode,
      })

    if (insertError) {
      console.error('创建会话失败:', insertError)
      return NextResponse.json({ error: '创建会话失败' }, { status: 500 })
    }

    return NextResponse.json({
      session_id: sessionId,
      therapy_mode: therapyMode,
    })
  } catch (e) {
    console.error('POST sessions error:', e)
    return NextResponse.json({ error: '创建会话失败' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
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

    const { data: sessions, error: queryError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('id, title, started_at, updated_at, message_count')
      .eq('user_id', userData.user.id)
      .order('started_at', { ascending: false })

    if (queryError) {
      console.error('查询会话失败:', queryError)
      return NextResponse.json({ error: '获取会话列表失败' }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (e) {
    console.error('GET sessions error:', e)
    return NextResponse.json({ error: '获取会话列表失败' }, { status: 500 })
  }
}
