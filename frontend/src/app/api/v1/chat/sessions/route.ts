import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticate } from '@/lib/api-auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status })
    }

    const body = await req.json().catch(() => ({}))
    const therapyMode = body.therapy_mode || 'general'

    const sessionId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error: insertError } = await supabaseAdmin()
      .from('chat_sessions')
      .insert({
        id: sessionId,
        user_id: auth.userId,
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
      id: sessionId,
      therapy_mode: therapyMode,
    })
  } catch (e) {
    console.error('POST sessions error:', e)
    return NextResponse.json({ error: '创建会话失败' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status })
    }

    const { data: sessions, error: queryError } = await supabaseAdmin()
      .from('chat_sessions')
      .select('id, title, started_at, updated_at, message_count, therapy_mode')
      .eq('user_id', auth.userId)
      .order('started_at', { ascending: false })

    if (queryError) {
      console.error('查询会话失败:', queryError)
      return NextResponse.json({ error: '获取会话列表失败' }, { status: 500 })
    }

    return NextResponse.json(sessions || [])
  } catch (e) {
    console.error('GET sessions error:', e)
    return NextResponse.json({ error: '获取会话列表失败' }, { status: 500 })
  }
}
