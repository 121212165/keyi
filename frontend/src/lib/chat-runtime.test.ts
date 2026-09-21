import { describe, expect, it } from 'vitest'
import { planCrisisTurn, readInterview, withCrisisInterview } from './chat-runtime'
import {
  advanceInterview,
  interviewLevel,
  interviewQuestion,
  parseAnswer,
  startInterview,
} from './domain/interview'

describe('parseAnswer', () => {
  it('否定优先于肯定（“没有”里含“有”）', () => {
    expect(parseAnswer('没有')).toBe('no')
    expect(parseAnswer('不会')).toBe('no')
    expect(parseAnswer('是的')).toBe('yes')
    expect(parseAnswer('嗯，经常这样')).toBe('yes')
    expect(parseAnswer('说不清')).toBe('unsure')
  })
})

describe('五问访谈状态机', () => {
  it('答“否”立即结束且不再升级', () => {
    let state = startInterview()
    state = advanceInterview(state, 'no')
    expect(state.step).toBe('done')
    expect(interviewLevel(state)).toBe('low')
  })

  it('答到“计划+准备”即可 critical，末问确认时间意图', () => {
    let state = startInterview()
    for (let step = 0; step < 3; step += 1) {
      expect(interviewQuestion(state)).toBeTruthy()
      state = advanceInterview(state, 'yes')
    }
    expect(state.step).toBe('preparation')
    expect(interviewLevel(state)).toBe('high')
    state = advanceInterview(state, 'yes')
    expect(interviewLevel(state)).toBe('critical')
    expect(state.step).toBe('timeframe')
  })

  it('只到“有计划、无准备”时停在 high 而不是 critical', () => {
    let state = advanceInterview(advanceInterview(startInterview(), 'yes'), 'yes')
    state = advanceInterview(state, 'yes')
    state = advanceInterview(state, 'no')
    expect(interviewLevel(state)).toBe('high')
  })
})

describe('planCrisisTurn 串联', () => {
  it('high 级命中会开启访谈并保留进度', () => {
    const turn = planCrisisTurn('我不想活了', null)
    expect(turn?.level).toBe('high')
    expect(turn?.interview?.step).toBe('frequency')
    expect(turn?.response).toContain('频率')
  })

  it('critical 级命中直接给紧急回应，不拖进问卷', () => {
    const turn = planCrisisTurn('我已经买好了药，也写了遗书', null)
    expect(turn?.level).toBe('critical')
    expect(turn?.interview).toBeNull()
    expect(turn?.response).toContain('120')
  })

  it('普通消息不进危机链路', () => {
    expect(planCrisisTurn('最近项目 deadline 很紧，我有点焦虑', null)).toBeNull()
  })

  it('访谈进行中回答“是”，下一问是计划', () => {
    const opened = planCrisisTurn('我不想活了', null)
    const next = planCrisisTurn('经常出现', opened?.interview ?? null)
    expect(next?.response).toContain('具体的方法')
    expect(next?.interview?.step).toBe('plan')
  })

  it('访谈逐问升级到 critical 时给出紧急页文案', () => {
    let interview = planCrisisTurn('我不想活了', null)?.interview ?? null
    interview = planCrisisTurn('经常', interview)?.interview ?? null
    interview = planCrisisTurn('想过', interview)?.interview ?? null
    interview = planCrisisTurn('有', interview)?.interview ?? null
    expect(interview?.step).toBe('timeframe')
    const final = planCrisisTurn('是，今晚', interview)
    expect(final?.level).toBe('critical')
    expect(final?.response).toContain('120')
  })

  it('访谈判定为“只有意念、无频率无计划”时降为 medium：给一次资源，不再连环追问', () => {
    const opened = planCrisisTurn('我不想活了', null)
    const settled = planCrisisTurn('其实不会，我就是太累了', opened?.interview ?? null)
    expect(settled?.level).toBe('medium')
    expect(settled?.interview).toBeNull()
    expect(settled?.response).toContain('400-161-9995')
  })
})

describe('emotion_summary 里的访谈状态', () => {
  it('可往返（写入后读回等价）', () => {
    const interview = planCrisisTurn('我不想活了', null)?.interview ?? null
    const summary = withCrisisInterview({ therapy_mode: 'cbt' }, interview)
    expect(readInterview(summary)).toEqual(interview)
  })

  it('脏 JSONB 不会让服务崩溃或恢复出假进度', () => {
    expect(readInterview({ crisis_interview: 'nonsense' })).toBeNull()
    expect(readInterview({ crisis_interview: { step: 'made_up' } })).toBeNull()
    expect(readInterview({ crisis_interview: { step: 'done', answers: {} } })).toBeNull()
    expect(readInterview(null)).toBeNull()
    expect(readInterview({ crisis_interview: { step: 'plan', answers: { screening: 'yes', bogus: 'x' } } })).toEqual({
      step: 'plan',
      answers: { screening: 'yes' },
    })
  })

  it('null 写入即清除进度', () => {
    const cleared = withCrisisInterview({ crisis_interview: { step: 'plan' } }, null)
    expect('crisis_interview' in cleared).toBe(false)
  })
})
