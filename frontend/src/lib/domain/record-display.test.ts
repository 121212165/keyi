import { describe, expect, it } from 'vitest'
import { recordChips } from './record-display'

describe('recordChips', () => {
  it('把已落库的 CBT / 脱敏 / 睡眠记录显示成可读标签', () => {
    const chips = recordChips({
      emotional_state: '焦虑',
      sud_score: 62,
      sleep_efficiency: 0.71,
      cognitive_distortions: ['灾难化', '读心术'],
      awake_count: 3,
    })

    expect(chips).toContain('情绪：焦虑')
    expect(chips).toContain('焦虑 SUD：62')
    expect(chips).toContain('睡眠效率：71%')
    expect(chips).toContain('思维陷阱：灾难化、读心术')
    expect(chips).toContain('夜醒次数：3')
  })

  it('没有记录时不给空壳', () => {
    expect(recordChips({})).toEqual([])
    expect(recordChips(null)).toEqual([])
    expect(recordChips(undefined)).toEqual([])
    expect(recordChips({ type: 'crisis_response' })).toEqual([])
  })

  it('脏值不显示（NaN 会被写成“焦虑 SUD：NaN”糊在界面上）', () => {
    const chips = recordChips({
      sud_score: Number.NaN,
      emotional_state: '   ',
      cognitive_distortions: [null, 7, '灾难化'],
      sleep_efficiency: 'high',
    })
    expect(chips).toEqual(['思维陷阱：灾难化'])
  })
})
