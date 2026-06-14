import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refresh_token } = body

    if (!refresh_token) {
      return NextResponse.json({ error: '缺少 refresh_token' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin().auth.refreshSession({ refresh_token })

    if (error || !data.session) {
      return NextResponse.json({ error: '刷新失败，请重新登录' }, { status: 401 })
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
  } catch (e) {
    console.error('Token refresh error:', e)
    return NextResponse.json({ error: '刷新失败' }, { status: 500 })
  }
}
