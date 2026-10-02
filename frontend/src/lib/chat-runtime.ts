import { detectRisk, type RiskLevel } from './domain/detect-risk'
import { crisisReplyFor, crisisReplyForLevel } from './domain/crisis-reply'
import {
  advanceInterview,
  interviewLevel,
  interviewQuestion,
  parseAnswer,
  startInterview,
  type InterviewState,
  type InterviewStep,
} from './domain/interview'

export type CrisisLevel = RiskLevel

export interface CrisisDetectionResult {
  level: CrisisLevel
  keyword: string
  response: string
  score: number
  /** 进行中的五问访谈进度；null 表示本轮之后没有待问的问题 */
  interview: InterviewState | null
}

export interface AssistantArtifacts {
  cleanReply: string
  metadata: Record<string, unknown>
  sessionMemory: Record<string, unknown>
}

const INTERVIEW_STEPS: InterviewStep[] = [
  'screening',
  'frequency',
  'plan',
  'preparation',
  'timeframe',
  'done',
]

/** emotion_summary 是 JSONB，读回来的形状不可信，逐字段校验后才恢复访谈进度。 */
export function readInterview(summary: Record<string, unknown> | null | undefined): InterviewState | null {
  const raw = summary?.crisis_interview
  if (typeof raw !== 'object' || raw === null) return null

  const candidate = raw as { step?: unknown; answers?: unknown }
  if (typeof candidate.step !== 'string' || !INTERVIEW_STEPS.includes(candidate.step as InterviewStep)) return null
  if (candidate.step === 'done') return null
  if (typeof candidate.answers !== 'object' || candidate.answers === null) return null

  const answers: InterviewState['answers'] = {}
  for (const [step, value] of Object.entries(candidate.answers)) {
    if (value === 'yes' || value === 'no' || value === 'unsure') {
      answers[step as InterviewStep] = value
    }
  }

  return { step: candidate.step as InterviewStep, answers }
}

export function withCrisisInterview(
  summary: Record<string, unknown>,
  interview: InterviewState | null,
): Record<string, unknown> {
  const next = { ...summary }
  if (interview) next.crisis_interview = interview
  else delete next.crisis_interview
  return next
}

/**
 * 每轮用户消息先过这里。命中即短路：不调模型，直接给分级危机回应。
 * high 级会开启（或继续）手册 §7.2 的五问——只有问到“计划/准备/时间意图”才允许升级为 critical。
 */
export function planCrisisTurn(
  message: string,
  saved: InterviewState | null,
): CrisisDetectionResult | null {
  if (saved) {
    const answer = parseAnswer(message) ?? 'unsure'
    const next = advanceInterview(saved, answer)
    const level = interviewLevel(next)
    const question = interviewQuestion(next)

    if (question) {
      return { level, keyword: 'crisis_interview', response: question, score: 0, interview: next }
    }

    // 访谈结论为低风险时不再占位回答，交回正常对话，避免把用户困在危机问答里。
    if (level === 'low') return null
    return {
      level,
      keyword: 'crisis_interview',
      response: crisisReplyForLevel(level),
      score: 0,
      interview: null,
    }
  }

  const assessment = detectRisk(message)
  if (assessment.level === 'low') return null

  const keyword = assessment.hits[0]?.term ?? '危机信号'
  // 命中本身已构成第一问（是否存在意念）的肯定证据，所以从频率问起。
  const interview = assessment.level === 'high' ? advanceInterview(startInterview(), 'yes') : null

  return {
    level: assessment.level,
    keyword,
    response: crisisReplyFor(assessment),
    score: assessment.score,
    interview,
  }
}

export function detectCrisis(message: string): CrisisDetectionResult | null {
  return planCrisisTurn(message, null)
}

const THERAPY_TAGS = ['THERAPY_RECORD', 'DESENSITIZE_RECORD', 'SLEEP_RECORD'] as const

export function getVisibleReplyFromRaw(rawReply: string): string {
  const indexes = THERAPY_TAGS
    .map((tag) => rawReply.indexOf(`<${tag}>`))
    .filter((index) => index >= 0)

  if (indexes.length === 0) {
    return rawReply
  }

  return rawReply.slice(0, Math.min(...indexes)).trimEnd()
}

export function extractAssistantArtifacts(
  rawReply: string,
  therapyMode: string,
  existingSummary: Record<string, unknown> | null | undefined,
): AssistantArtifacts {
  const metadata =
    therapyMode === 'cbt'
      ? extractTaggedJson(rawReply, 'THERAPY_RECORD')
      : therapyMode === 'desensitize'
        ? extractTaggedJson(rawReply, 'DESENSITIZE_RECORD')
        : therapyMode === 'sleep'
          ? extractTaggedJson(rawReply, 'SLEEP_RECORD')
          : {}

  const cleanReply = stripTaggedArtifacts(rawReply).trim()
  const sessionMemory = buildSessionMemory(existingSummary, therapyMode, metadata)

  return {
    cleanReply,
    metadata,
    sessionMemory,
  }
}

function extractTaggedJson(rawReply: string, tagName: (typeof THERAPY_TAGS)[number]): Record<string, unknown> {
  const pattern = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`)
  const match = rawReply.match(pattern)

  if (!match?.[1]) {
    return {}
  }

  try {
    const parsed = JSON.parse(match[1])
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function stripTaggedArtifacts(rawReply: string): string {
  return THERAPY_TAGS.reduce(
    (result, tagName) => result.replace(new RegExp(`\\s*<${tagName}>[\\s\\S]*?</${tagName}>\\s*`, 'g'), ''),
    rawReply,
  )
}

function buildSessionMemory(
  existingSummary: Record<string, unknown> | null | undefined,
  therapyMode: string,
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const baseSummary =
    typeof existingSummary === 'object' && existingSummary !== null && !Array.isArray(existingSummary)
      ? existingSummary
      : {}

  const nextSummary: Record<string, unknown> = {
    ...baseSummary,
    therapy_mode: therapyMode,
    updated_at: new Date().toISOString(),
  }

  // 能走到普通回复，说明危机访谈已让位于正常对话；留着它会把用户锁在问卷里。
  delete nextSummary.crisis_interview

  if (typeof metadata.emotional_state === 'string' && metadata.emotional_state.trim()) {
    nextSummary.emotional_state = metadata.emotional_state
  }

  if (typeof metadata.current_phase === 'string' && metadata.current_phase.trim()) {
    nextSummary.current_phase = metadata.current_phase
  }

  if (typeof metadata.stage === 'string' && metadata.stage.trim()) {
    nextSummary.stage = metadata.stage
  }

  if (typeof metadata.current_level === 'number') {
    nextSummary.current_level = metadata.current_level
  }

  if (typeof metadata.sud_score === 'number') {
    nextSummary.sud_score = metadata.sud_score
  }

  if (Array.isArray(metadata.cognitive_distortions)) {
    nextSummary.cognitive_distortions = metadata.cognitive_distortions
  }

  if (typeof metadata.sleep_efficiency === 'number') {
    nextSummary.sleep_efficiency = metadata.sleep_efficiency
  }

  if (typeof metadata.sleep_window_min === 'number') {
    nextSummary.sleep_window_min = metadata.sleep_window_min
  }

  if (typeof metadata.awake_count === 'number') {
    nextSummary.awake_count = metadata.awake_count
  }

  return nextSummary
}
