import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const { error } = await supabase().auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: '登出成功' })
  } catch (e) {
    console.error('logout error:', e)
    return NextResponse.json({ error: '登出失败' }, { status: 500 })
  }
}
