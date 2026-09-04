import { ok } from '@/lib/api'

export async function GET() {
  const modes = [
    { id: 'general', name: '支持性 CBT', description: '兼容入口；实际使用 CBT 主线', primary_method: 'cbt' },
    { id: 'cbt', name: 'CBT 主线', description: '识别想法、情绪、行为并练习可执行改变', primary_method: 'cbt' },
    { id: 'desensitize', name: '阶段化暴露训练', description: 'CBT 主线中的可暂停暴露插件', primary_method: 'cbt', plugin: 'exposure' },
  ]
  return ok(modes, { modes })
}
