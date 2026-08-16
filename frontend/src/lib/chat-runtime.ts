export type CrisisLevel = 'low' | 'medium' | 'high' | 'critical'

export interface CrisisDetectionResult {
  level: CrisisLevel
  keyword: string
  response: string
}

export interface AssistantArtifacts {
  cleanReply: string
  metadata: Record<string, unknown>
  sessionMemory: Record<string, unknown>
}

const CRISIS_KEYWORDS: Array<{ keyword: string; level: CrisisLevel; response: string }> = [
  {
    keyword: '自杀',
    level: 'critical',
    response:
      '我听到你提到了自杀，这让我非常担心你当前的安全。如果你现在有伤害自己的打算，请立刻联系当地紧急救援，或尽快联系可信任的家人朋友陪在你身边。\n\n你也可以马上联系心理援助资源：\n- 全国心理援助热线：400-161-9995\n- 北京心理危机干预中心：010-8295-1332\n\n如果你愿意，也可以直接告诉我：你现在是否一个人？身边有没有可以马上联系的人？',
  },
  {
    keyword: '不想活',
    level: 'high',
    response:
      '听到你说“不想活”，我很在意你现在的状态。此刻最重要的是先确保你不是一个人承受。请尽快联系一位可信任的人陪着你，并考虑立即拨打心理援助热线或当地急救电话。\n\n如果你愿意，可以先告诉我：你现在是否安全？身边有没有可以立刻联系的人？',
  },
  {
    keyword: '活不下去',
    level: 'high',
    response:
      '你说“活不下去”，说明你现在可能非常痛苦。先把安全放在第一位：请尽量不要独处，联系家人、朋友或其他可信任的人陪着你。必要时请立刻联系当地急救或心理危机热线。\n\n如果你愿意，我可以先陪你一起把眼前最紧急的一步确认下来。',
  },
  {
    keyword: '伤害自己',
    level: 'high',
    response:
      '听到你提到伤害自己，我很担心你现在的安全。请先把可能伤害到自己的物品移开，并尽快联系一位可信任的人陪在你身边；如果风险正在升高，请立即拨打当地急救电话或心理援助热线。\n\n你愿意告诉我，你现在是否处在安全的环境里吗？',
  },
]

const THERAPY_TAGS = ['THERAPY_RECORD', 'DESENSITIZE_RECORD', 'SLEEP_RECORD'] as const

export function detectCrisis(message: string): CrisisDetectionResult | null {
  for (const item of CRISIS_KEYWORDS) {
    if (message.includes(item.keyword)) {
      return {
        level: item.level,
        keyword: item.keyword,
        response: item.response,
      }
    }
  }

  return null
}

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
