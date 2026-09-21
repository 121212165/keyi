import { CATEGORY_WEIGHT_CAP, RISK_TERMS, type RiskCategory } from './risk-lexicon'
import { analyzeTermContext } from './risk-context'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskHit {
  term: string
  category: RiskCategory
  weight: number
  effectiveWeight: number
  negated: boolean
  reported: boolean
  past: boolean
  contextRequired: boolean
  contextPresent: boolean
}

export interface RiskAssessment {
  level: RiskLevel
  score: number
  hits: RiskHit[]
  /** 命中过但被否定/转述/语境不足抵消的词——保留下来供回归测试与复盘使用 */
  suppressed: RiskHit[]
  categories: RiskCategory[]
  hasPlanOrPreparation: boolean
}

/** 阈值集中在此，回归集靠它标定；不要散进判断分支。 */
export const RISK_THRESHOLDS = { medium: 4, high: 7, critical: 10 }

export const RISK_LEVELS: readonly RiskLevel[] = ['low', 'medium', 'high', 'critical']

function capCategory(total: number, category: RiskCategory): number {
  const cap = CATEGORY_WEIGHT_CAP[category]
  return cap === undefined ? total : Math.min(total, cap)
}

export function detectRisk(message: string): RiskAssessment {
  const haystack = message.toLowerCase()

  interface Candidate {
    index: number
    length: number
    entry: (typeof RISK_TERMS)[number]
  }

  const candidates: Candidate[] = []
  for (const entry of RISK_TERMS) {
    const index = entry.ascii ? haystack.indexOf(entry.term) : message.indexOf(entry.term)
    if (index >= 0) candidates.push({ index, length: entry.term.length, entry })
  }

  // 「不想活了」同时含「不想活」：不先去重，一句口语就能把分数顶到 critical。
  candidates.sort((a, b) => b.entry.weight - a.entry.weight || a.index - b.index)
  const accepted: Candidate[] = []
  for (const candidate of candidates) {
    const overlaps = accepted.some(
      (other) => candidate.index < other.index + other.length && other.index < candidate.index + candidate.length,
    )
    if (!overlaps) accepted.push(candidate)
  }

  const hits: RiskHit[] = []
  const suppressed: RiskHit[] = []

  for (const { index, length, entry } of accepted) {
    const ctx = analyzeTermContext(message, index, length)
    const hit: RiskHit = {
      term: entry.term,
      category: entry.category,
      weight: entry.weight,
      effectiveWeight: 0,
      negated: ctx.negated,
      reported: ctx.reported,
      past: ctx.past,
      contextRequired: entry.needsContext === true,
      contextPresent: ctx.selfMarker,
    }

    if (ctx.negated || ctx.reported) {
      suppressed.push(hit)
      continue
    }

    if (entry.needsContext && !ctx.selfMarker) {
      suppressed.push(hit)
      continue
    }

    // 过去时不等于风险解除，但显著衰减：`我以前想过死` 与 `我现在就想死` 不该同分。
    hit.effectiveWeight = ctx.past ? Math.max(1, Math.round(entry.weight * 0.4)) : entry.weight
    hits.push(hit)
  }

  const byCategory = new Map<RiskCategory, number>()
  for (const hit of hits) {
    byCategory.set(hit.category, (byCategory.get(hit.category) ?? 0) + hit.effectiveWeight)
  }

  let score = 0
  for (const [category, total] of byCategory) score += capCategory(total, category)

  const categories = [...byCategory.keys()]
  const hasPlanOrPreparation = byCategory.has('suicide_plan')
  const psychosisHigh = (byCategory.get('psychosis') ?? 0) >= 6
  const harmOthersImminent = hits.some(
    (hit) => hit.category === 'harm_others' && hit.weight >= 8,
  )

  let level: RiskLevel = 'low'
  if (hasPlanOrPreparation || score >= RISK_THRESHOLDS.critical) level = 'critical'
  else if (score >= RISK_THRESHOLDS.high || psychosisHigh || harmOthersImminent) level = 'high'
  else if (score >= RISK_THRESHOLDS.medium) level = 'medium'

  return { level, score, hits, suppressed, categories, hasPlanOrPreparation }
}
