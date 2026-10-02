import type { RiskLevel } from './detect-risk'

export type InterviewStep = 'screening' | 'frequency' | 'plan' | 'preparation' | 'timeframe' | 'done'
export type Answer = 'yes' | 'no' | 'unsure'

export interface InterviewState {
  step: InterviewStep
  answers: Partial<Record<InterviewStep, Answer>>
}

/** 手册 §7.2 的筛查→频率→计划→准备→时间意图五问；一问未答完就不升级为 critical。 */
const QUESTIONS: Record<Exclude<InterviewStep, 'done'>, string> = {
  screening: '我想先确认一件事，你可以只回答“是”或“不是”：最近你有没有出现过不想活、或者觉得活着没什么意思的念头？',
  frequency: '这种念头出现的频率高吗？是偶尔闪一下，还是经常出现？',
  plan: '你有没有想过具体的方法？',
  preparation: '为这个念头做过准备吗？比如查过方法、准备好东西、或者把重要的事情交代掉？',
  timeframe: '你有没有打算就在近期——今天或者这一两周之内——真的去做？',
}

const ORDER: Exclude<InterviewStep, 'done'>[] = [
  'screening',
  'frequency',
  'plan',
  'preparation',
  'timeframe',
]

export function startInterview(): InterviewState {
  return { step: 'screening', answers: {} }
}

export function interviewQuestion(state: InterviewState): string | null {
  if (state.step === 'done') return null
  return QUESTIONS[state.step]
}

export function isInterviewComplete(state: InterviewState): boolean {
  return state.step === 'done'
}

/**
 * 先判否再判是：`没有` 里含 `有`、`不会` 里含 `会`，反过来会把否定读成肯定。
 */
export function parseAnswer(text: string): Answer | null {
  const t = text.trim()
  if (/没有|不会|不曾|没想过|不至于|不是|还好|没打算/.test(t)) return 'no'
  if (/不知道|说不清|也许|可能|不太清楚|不确定/.test(t)) return 'unsure'
  if (/^(是的?|嗯+|对|有|想过|经常|会|确实)/.test(t)) return 'yes'
  if (/不想活|想死|活着没意思|结束/.test(t)) return 'yes'
  return null
}

export function advanceInterview(state: InterviewState, answer: Answer): InterviewState {
  if (state.step === 'done') return state

  const answers = { ...state.answers, [state.step]: answer }
  if (answer === 'no') return { step: 'done', answers }

  const currentIndex = ORDER.indexOf(state.step)
  const next = currentIndex >= 0 && currentIndex < ORDER.length - 1 ? ORDER[currentIndex + 1] : 'done'
  return { step: next, answers }
}

/**
 * 手册 §7.2 的分级口径：critical 必须有“时间意图”或“计划 + 准备行为”同时成立。
 * 只有意念、频率也不高 → medium（仍给资源，但不占用紧急页），避免把问卷变成永久拦路。
 */
export function interviewLevel(state: InterviewState): RiskLevel {
  const { answers } = state
  if (answers.screening === 'no') return 'low'
  if (answers.timeframe === 'yes') return 'critical'
  if (answers.plan === 'yes' && answers.preparation === 'yes') return 'critical'
  if (answers.plan === 'yes' || answers.preparation === 'yes') return 'high'
  if (answers.frequency === 'yes') return 'high'
  if (answers.screening === 'yes') return 'medium'
  if (answers.screening === 'unsure') return 'medium'
  return 'low'
}
