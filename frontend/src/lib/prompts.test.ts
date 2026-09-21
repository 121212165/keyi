import { describe, expect, it } from 'vitest'
import { buildMemoryBrief, buildSystemPrompt } from './prompts'

describe('buildMemoryBrief', () => {
  it('把已落库的结构化记忆转成 prompt 简报', () => {
    const brief = buildMemoryBrief({
      emotional_state: '焦虑',
      sud_score: 62,
      cognitive_distortions: ['灾难化', '非黑即白'],
      sleep_efficiency: 0.71,
    })
    expect(brief).toContain('焦虑')
    expect(brief).toContain('62')
    expect(brief).toContain('灾难化')
    expect(brief).toContain('不要')
  })

  it('没有可用字段时返回空串，不往 prompt 里塞空段', () => {
    expect(buildMemoryBrief({})).toBe('')
    expect(buildMemoryBrief({ therapy_mode: 'cbt', updated_at: '2026-08-01' })).toBe('')
    expect(buildMemoryBrief(null)).toBe('')
    expect(buildMemoryBrief(undefined)).toBe('')
  })

  it('脏值（数组里混非字符串、NaN）不会被写进简报', () => {
    const brief = buildMemoryBrief({
      cognitive_distortions: [null, 42, '读心术'],
      sud_score: Number.NaN,
    })
    expect(brief).toContain('读心术')
    expect(brief).not.toContain('42')
    expect(brief).not.toContain('NaN')
  })

  it('模式提示词仍在前部，记忆附在末尾', () => {
    const withMemory = buildSystemPrompt('cbt', { emotional_state: '低落' })
    const without = buildSystemPrompt('cbt')
    expect(withMemory.startsWith(without)).toBe(true)
    expect(withMemory).toContain('低落')
  })

  it('general 模式也带得上记忆', () => {
    expect(buildSystemPrompt('general', { emotional_state: '麻木' })).toContain('麻木')
  })
})
