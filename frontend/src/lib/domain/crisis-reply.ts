import type { RiskAssessment, RiskLevel } from './detect-risk'

export interface Hotline {
  label: string
  number: string
  kind: 'emergency' | 'national' | 'regional'
}

/**
 * 号码原样沿用仓库既有写法（app/page.tsx 与旧 chat-runtime.ts 里的三个号码，格式取 page.tsx 那种）。
 * 新增号码（如全国统一心理援助热线）需人工核实后再加，危机路径上不凭印象填号码。
 */
export const HOTLINES: readonly Hotline[] = [
  { label: '急救', number: '120', kind: 'emergency' },
  { label: '全国心理援助热线', number: '400-161-9995', kind: 'national' },
  { label: '北京心理危机研究与干预中心', number: '010-82951332', kind: 'regional' },
  { label: '生命热线', number: '400-821-1215', kind: 'national' },
]

export const CRISIS_HOTLINE_TEXT = HOTLINES.map((h) => `- ${h.label}：${h.number}`).join('\n')

function criticalPlanResponse(): string {
  return `我很担心你的安全。你已经想到了具体的做法，甚至做了准备——这已经超出了我能陪你承受的范围。

此刻最重要的一件事，是让你身边有人知道你现在的情况。

请立即联系：
${CRISIS_HOTLINE_TEXT}

如果此刻你觉得自己可能马上会行动，请拨打 120，或去最近的医院急诊。

你愿意告诉我，你现在身边有人吗？`
}

function ideationResponse(term: string): string {
  return `我听到你说“${term}”，我很在意你现在的状态。

请先做一件事：不要独处。联系一位你信得过的人，把现在的感受告诉 TA 一点点也可以。如果风险在升高，请立刻拨打下面的号码，或去急诊——求助不是软弱：
${CRISIS_HOTLINE_TEXT}

我想多了解一点：这种念头最近出现的频率高吗？是偶尔闪过，还是经常出现？`
}

function selfHarmResponse(): string {
  return `听到你提到伤害自己，我很担心你现在的安全。

请先把可能伤到自己的东西放到自己够不着的地方，然后联系一位信得过的人陪在你身边。如果伤口需要处理，或你觉得自己快控制不住，请立刻拨打 120 或心理援助热线：
${CRISIS_HOTLINE_TEXT}

你愿意告诉我，你现在处在安全的环境里吗？`
}

function harmOthersResponse(): string {
  return `我听到了你有很强的愤怒和伤害对方的念头，这种被压到极限的感觉是真实的，你不需要为它独自承担。

但“具体去伤害某个人”这件事已经超出了我能陪你去做的范围——继续谈下去可能会让情况变糟。请先联系下面的人，把现在的冲动说出来：
${CRISIS_HOTLINE_TEXT}

如果已经临近行动，请立刻拨打 120。`
}

function psychosisResponse(): string {
  return `你描述的这些体验——听到别人听不到的声音、分不清什么是真实——是需要精神科医生当面评估的信号，不是我能帮你判断的。

这不代表你“严重到没救”，恰恰相反，这类情况对专业治疗的反应通常很好。关键是尽快让医生看一眼：
- 最理想：让家人或朋友陪同，去当地精神卫生中心或三甲医院心理/精神科门诊
- 如果一个人且害怕：拨打 ${HOTLINES[1].number}，让 TA 陪你度过联系上医生之前的这段时间

在那之前，我会继续陪着你。`
}

function mediumResponse(): string {
  return `你说的这些我听到了，听起来这段时间你被压得很紧。

我不会给你下判断，但有一个请求：如果这种状态让你已经连续多天上不了班、睡不着、或者开始用酒/药物去压它，请把它当作需要专业支持的信号，而不是靠自己扛过去：
${CRISIS_HOTLINE_TEXT}

我想问你一件事：这种“撑不住”持续多久了？大概是从什么时候开始的？`
}

export function crisisReplyFor(assessment: RiskAssessment, level: RiskLevel = assessment.level): string {
  const categories = new Set(assessment.categories)

  if (level === 'critical') return criticalPlanResponse()
  if (categories.has('psychosis')) return psychosisResponse()
  if (categories.has('harm_others')) return harmOthersResponse()
  if (categories.has('self_harm') && !categories.has('suicide_ideation')) return selfHarmResponse()
  if (level === 'high') return ideationResponse(assessment.hits[0]?.term ?? '这些话')
  return mediumResponse()
}

const NO_NEW_HIT: RiskAssessment = {
  level: 'low',
  score: 0,
  hits: [],
  suppressed: [],
  categories: [],
  hasPlanOrPreparation: false,
}

/** 五问访谈只产出等级、没有新关键词命中时用。 */
export function crisisReplyForLevel(level: RiskLevel): string {
  return crisisReplyFor(NO_NEW_HIT, level)
}
