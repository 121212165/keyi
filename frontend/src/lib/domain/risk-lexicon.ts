export type RiskCategory =
  | 'suicide_ideation'
  | 'suicide_plan'
  | 'self_harm'
  | 'harm_others'
  | 'psychosis'
  | 'hopelessness'
  | 'functional_impairment'
  | 'substance'

export interface RiskTerm {
  term: string
  category: RiskCategory
  weight: number
  /**
   * 日常口语高频歧义词（“太累了”“没意思”“吃药”）单独出现不足以判风险，
   * 必须与第一人称/情绪语境共现才计分，否则会把“饭吃完了”“这电影没意思”弹成危机。
   */
  needsContext?: boolean
  /** 英文词条按小写匹配；中文不做 toLowerCase（那是空操作，且旧实现据此误以为支持了英文） */
  ascii?: boolean
}

/**
 * 全仓唯一的危机词库。
 * 合并自旧 chat-runtime.ts 里那 4 条生效词，与另一份从未被引用的 13 条词表（含英文表达），
 * 并补上此前两边都缺的 `想死` 之外的自伤手段与英文表达。
 */
export const RISK_TERMS: readonly RiskTerm[] = [
  // 自杀意念
  { term: '不想活', category: 'suicide_ideation', weight: 8 },
  { term: '不想活了', category: 'suicide_ideation', weight: 8 },
  { term: '活不下去', category: 'suicide_ideation', weight: 7 },
  { term: '想死', category: 'suicide_ideation', weight: 7 },
  { term: '想过死', category: 'suicide_ideation', weight: 6 },
  { term: '死了算了', category: 'suicide_ideation', weight: 7 },
  { term: '结束生命', category: 'suicide_ideation', weight: 8 },
  { term: '结束一切', category: 'suicide_ideation', weight: 7 },
  { term: '一了百了', category: 'suicide_ideation', weight: 6 },
  { term: '活着没意义', category: 'suicide_ideation', weight: 7 },
  { term: '解脱', category: 'suicide_ideation', weight: 5, needsContext: true },
  { term: '太累了', category: 'suicide_ideation', weight: 3, needsContext: true },
  { term: '没意思', category: 'suicide_ideation', weight: 3, needsContext: true },

  // 计划与准备（手册 §7.2 第 3~5 问的对应信号，权重最高）
  { term: '遗书', category: 'suicide_plan', weight: 10 },
  { term: '立遗嘱', category: 'suicide_plan', weight: 10 },
  { term: '买好了药', category: 'suicide_plan', weight: 10 },
  { term: '买好药', category: 'suicide_plan', weight: 10 },
  { term: '查过方法', category: 'suicide_plan', weight: 8 },
  { term: '查过怎么', category: 'suicide_plan', weight: 10 },
  { term: '搜过怎么', category: 'suicide_plan', weight: 10 },
  { term: '搜索过方法', category: 'suicide_plan', weight: 8 },
  { term: '安顿好', category: 'suicide_plan', weight: 6, needsContext: true },

  // 自伤
  { term: '自残', category: 'self_harm', weight: 7 },
  { term: '割腕', category: 'self_harm', weight: 7 },
  { term: '伤害自己', category: 'self_harm', weight: 7 },
  { term: '割伤自己', category: 'self_harm', weight: 7 },
  { term: '撞墙', category: 'self_harm', weight: 5 },
  { term: '吃药', category: 'self_harm', weight: 4, needsContext: true },

  // 伤害他人（手册 §7.1 红色预警第二类）
  { term: '让他们后悔', category: 'harm_others', weight: 7 },
  { term: '杀掉', category: 'harm_others', weight: 8 },
  { term: '同归于尽', category: 'harm_others', weight: 10 },
  { term: '报复', category: 'harm_others', weight: 4, needsContext: true },

  // 精神病性症状（手册 §2.3 立即转介）
  { term: '有声音告诉我', category: 'psychosis', weight: 7 },
  { term: '听到别人听不到的', category: 'psychosis', weight: 7 },
  { term: '分不清现实', category: 'psychosis', weight: 6 },

  // 无望感与功能受损（黄色预警）
  { term: '撑不住', category: 'hopelessness', weight: 4 },
  { term: '看不到未来', category: 'hopelessness', weight: 4 },
  { term: '没指望', category: 'hopelessness', weight: 3, needsContext: true },
  { term: '没办法', category: 'hopelessness', weight: 2, needsContext: true },
  { term: '整夜睡不着', category: 'functional_impairment', weight: 3 },
  { term: '无法上班', category: 'functional_impairment', weight: 3 },
  { term: '不想见人', category: 'functional_impairment', weight: 2, needsContext: true },
  { term: '借酒', category: 'substance', weight: 4 },
  { term: '喝酒麻醉', category: 'substance', weight: 5 },

  // 英文
  { term: 'suicide', category: 'suicide_ideation', weight: 8, ascii: true },
  { term: 'kill myself', category: 'suicide_ideation', weight: 9, ascii: true },
  { term: 'want to die', category: 'suicide_ideation', weight: 8, ascii: true },
  { term: 'end my life', category: 'suicide_ideation', weight: 8, ascii: true },
  { term: 'end it all', category: 'suicide_ideation', weight: 7, ascii: true },
  { term: 'self-harm', category: 'self_harm', weight: 7, ascii: true },
  { term: 'hurt myself', category: 'self_harm', weight: 6, ascii: true },
]

/**
 * 命中同一大类多次不叠加到溢出。自杀意念的上限刻意压在 critical 阈值之下：
 * 只有出现“计划/准备”类信号、或跨类叠加，才允许升到 critical。
 */
export const CATEGORY_WEIGHT_CAP: Partial<Record<RiskCategory, number>> = {
  suicide_ideation: 9,
  self_harm: 9,
  hopelessness: 6,
  functional_impairment: 5,
}
