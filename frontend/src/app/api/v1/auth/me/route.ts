import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未提供认证令牌' }, { status: 401 })
    }

    const token = authHeader.slice(7)

    const { data, error } = await supabase().auth.getUser(token)

    if (error || !data.user) {
      return NextResponse.json({ error: '认证失败，请重新登录' }, { status: 401 })
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
    })
  } catch (e) {
    console.error('me error:', e)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}
