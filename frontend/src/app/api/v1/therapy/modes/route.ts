import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    modes: [
      { id: 'general', name: '自由对话', description: '普通的支持性对话' },
      { id: 'cbt', name: 'CBT认知疗法', description: '认知行为疗法，帮助识别和改变负性思维模式' },
      { id: 'desensitize', name: '系统脱敏', description: '通过渐进式暴露克服特定恐惧或焦虑' },
    ],
  })
}
