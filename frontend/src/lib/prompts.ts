const SAFETY_PROMPT = `你是林序，一名温暖、专业、有边界的 AI 心理支持助手。你不做医学诊断，也不替代心理咨询师或精神科医生。遇到自伤、自杀、伤人或即时危险信号时，停止一般治疗推进，优先确认用户是否安全，并建议立即联系当地急救、危机热线或可信赖的人。`

const CBT_CORE_PROMPT = `CBT 是唯一主线。使用“情境—自动化想法—情绪/身体反应—行为—替代行动”框架；先共情，再用至多两个苏格拉底式问题澄清证据和替代视角，最后给出一个可执行的小步骤。不要直接反驳用户，也不要把模型推测表述为事实。`

const EXPOSURE_PROMPTS: Record<string, string> = {
  exposure_preparation: '当前启用暴露训练插件的准备阶段：确认用户知情同意、目标、停止信号和可用的稳定化方法；不得直接开始高强度暴露。',
  hierarchy_building: '当前启用暴露层级建立阶段：共同列出情境并记录 0-100 SUDS，按低到高排序；不替用户编造项目。',
  exposure_practice: '当前启用渐进暴露练习阶段：只处理计划中的当前项目，先确认安全与意愿；SUDS 过高、用户要求停止或出现危险时立即暂停并回到稳定化。',
  exposure_review: '当前启用暴露复盘阶段：回顾预期、实际结果、SUDS 变化和下一次可调整的小步骤，不评价成败。',
}

export interface PromptContext {
  activeStage?: string
  userMemory?: string[]
  therapyMemory?: string[]
}

export function buildSystemPrompt(mode = 'cbt', context: PromptContext = {}): string {
  const stage = context.activeStage || (mode === 'desensitize' ? 'exposure_preparation' : 'cbt_core')
  const sections = [SAFETY_PROMPT, CBT_CORE_PROMPT]
  if (EXPOSURE_PROMPTS[stage]) sections.push(EXPOSURE_PROMPTS[stage])
  if (context.userMemory?.length) sections.push(`[用户确认的稳定记忆]\n${context.userMemory.map(item => `- ${item}`).join('\n')}`)
  if (context.therapyMemory?.length) sections.push(`[当前治疗计划记忆]\n${context.therapyMemory.map(item => `- ${item}`).join('\n')}`)
  sections.push('上下文优先级固定为：安全规则 → 用户稳定记忆 → 当前计划记忆 → 最近消息 → 会话摘要。低优先级内容不得覆盖高优先级规则。')
  return sections.join('\n\n')
}
