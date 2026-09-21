import { describe, expect, it } from 'vitest'
import { detectRisk } from './detect-risk'

/** 误报：这些句子绝不能升到 high/critical —— 弹全屏危机页会吓退真正需要帮助的人。 */
const MUST_NOT_ESCALATE: Array<[string, string]> = [
  ['我不想死', '否定式'],
  ['我没有想死', '否定式'],
  ['最近压力不大', '无风险'],
  ['这电影没意思', '口语“没意思”'],
  ['饭吃完了', '“完了”不等于“一了百了”'],
  ['去年死去的猫让我难过', '过去时 + 他人客体'],
  ['他说活着没意义', '转述'],
  ['如果一个人想结束一切会怎样', '假设句'],
  ['我朋友说她不想活了，我该怎么帮她', '转述他人'],
  ['我今天不太舒服，吃了药', '“吃药”作常规义'],
  ['这个方案没办法', '口语“没办法”'],
]

/** 漏报：这些必须升到 high 及以上。 */
const MUST_ESCALATE: Array<[string, 'high' | 'critical']> = [
  ['我想死了', 'high'],
  ['我不想活了', 'high'],
  ['我觉得活着没意义', 'high'],
  ['我用刀割伤自己', 'high'],
  ['我已经买好了药', 'critical'],
  ['我写好了遗书', 'critical'],
  ['我查过怎么结束生命', 'critical'],
  ['kill myself', 'high'],
  ['I want to end my life', 'high'],
]

describe('危机词库：误报回归', () => {
  it.each(MUST_NOT_ESCALATE)('「%s」不升级（%#）', (text) => {
    const result = detectRisk(text)
    expect(['low', 'medium']).toContain(result.level)
  })
})

describe('危机词库：漏报回归', () => {
  it.each(MUST_ESCALATE)('「%s」至少 %s', (text, min) => {
    const result = detectRisk(text)
    const rank = { low: 0, medium: 1, high: 2, critical: 3 }
    expect(rank[result.level]).toBeGreaterThanOrEqual(rank[min])
  })
})

describe('分级依据', () => {
  it('计划/准备信号直接 critical，且带 hasPlanOrPreparation', () => {
    const result = detectRisk('我把事情都安顿好了')
    expect(result.hasPlanOrPreparation).toBe(true)
    expect(result.level).toBe('critical')
  })

  it('同一大类堆词不会溢出到 critical', () => {
    const stacked = detectRisk('不想活 活不下去 想死 死了算了 一了百了 活着没意义 结束一切')
    expect(stacked.level).toBe('high')
    expect(stacked.score).toBeLessThan(15)
  })

  it('过去时衰减但不归零', () => {
    const now = detectRisk('我现在就想死')
    const past = detectRisk('我以前想过死')
    expect(past.score).toBeLessThan(now.score)
    expect(past.score).toBeGreaterThan(0)
  })

  it('英文按小写匹配（旧实现对中文 toLowerCase 是空操作，英文词条一条都没有）', () => {
    expect(detectRisk('I want to KILL MYSELF').level).not.toBe('low')
  })

  it('命中被抵消时记入 suppressed，便于复盘而不是静默丢弃', () => {
    const result = detectRisk('我不想死')
    expect(result.hits).toHaveLength(0)
    expect(result.suppressed.length).toBeGreaterThan(0)
  })
})
