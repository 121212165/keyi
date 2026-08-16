/**
 * 治疗模式注册表 —— 全应用唯一事实源
 * 前端首页/聊天/选择器、后端 modes API 均从这里取数
 */
export type TherapyModeId = 'general' | 'cbt' | 'desensitize' | 'sleep'

export interface TherapyMode {
  id: TherapyModeId
  name: string
  shortName: string
  tagline: string
  description: string
  icon: string
  color: string
  gradient: string
  features: string[]
  welcome: string
}

export const THERAPY_MODES: TherapyMode[] = [
  {
    id: 'general',
    name: '自由倾诉',
    shortName: '倾诉',
    tagline: '想说就说，我在这里倾听、陪伴你',
    description:
      '普通的支持性对话，我会用心倾听你的困扰，给予温暖的回应与理解。适合日常情绪倾诉、压力释放、寻求陪伴。',
    icon: '💬',
    color: '#5b8a72',
    gradient: 'linear-gradient(135deg, #e8f1ea 0%, #f6f1e6 100%)',
    features: ['无需任何心理技巧', '温暖回应，随时在线', '适合倾诉压力与烦恼'],
    welcome:
      '你好，我是可意，一个温暖、专业、有同理心的 AI 心理医生。\n\n在这里你可以畅所欲言，我会用心倾听、陪伴和支持你。\n\n今天有什么想聊的吗？',
  },
  {
    id: 'cbt',
    name: 'CBT 认知疗法',
    shortName: 'CBT',
    tagline: '看清并改变让你痛苦的思维模式',
    description:
      '认知行为疗法（CBT），帮助识别和改变负性思维模式。支持认知三角记录（想法-感受-行为）和自动化思维标记（ANTs）。',
    icon: '🧠',
    color: '#2f5b4f',
    gradient: 'linear-gradient(135deg, #e3eee8 0%, #eef4e2 100%)',
    features: ['认知三角记录', '识别自动负性思维', '苏格拉底式提问引导'],
    welcome:
      '欢迎进入 CBT 认知疗法模式。\n\n我是可意，会陪你一起探索：遇到某件事时，你的想法、感受和行为是如何相互影响的。\n\n你最近有没有反复让你烦恼的念头，或一个具体的情境，想从它开始？',
  },
  {
    id: 'desensitize',
    name: '系统脱敏',
    shortName: '脱敏',
    tagline: '一步步，温和地面对你的恐惧',
    description:
      '通过渐进式暴露（Wolpe 交互抑制）克服特定恐惧或焦虑。从最轻微的刺激开始，逐步建立对恐惧情境的耐受力。',
    icon: '🌊',
    color: '#3e6e8e',
    gradient: 'linear-gradient(135deg, #e4eef4 0%, #eef2e2 100%)',
    features: ['4 阶段渐进暴露', 'SUD 焦虑等级评分', '配套放松训练'],
    welcome:
      '欢迎进入系统脱敏模式。\n\n我会带你用渐进式暴露的方法，从最轻微的情境开始，一步步面对你害怕的事情。\n\n先告诉我：你特别想克服的恐惧或焦虑是什么？',
  },
  {
    id: 'sleep',
    name: '睡眠改善',
    shortName: '睡眠',
    tagline: 'CBT-I：国际上最推荐的失眠一线疗法',
    description:
      '失眠认知行为疗法（CBT-I），美国睡眠医学会推荐的成人失眠一线非药物疗法。通过刺激控制、睡眠限制、认知重构与放松训练，科学改善入睡与睡眠质量。',
    icon: '🌙',
    color: '#5b4f8e',
    gradient: 'linear-gradient(135deg, #eae6f4 0%, #e4eef4 100%)',
    features: ['刺激控制：重建床与睡眠的连接', '睡眠限制：科学压缩、提升睡眠效率', '认知重构 + 放松训练'],
    welcome:
      '欢迎进入睡眠改善模式（CBT-I）。\n\nCBT-I 是国际上最推荐、循证级别最高的帮助入睡疗法——它不是安眠药，而是通过调整行为和想法，科学重建你的睡眠。\n\n为了给你制定方案，我先了解一下你的情况：\n1. 你主要的问题是入睡困难、半夜易醒，还是醒得太早？\n2. 这种情况持续多久了？\n3. 你大概几点上床、几点起床？\n\n可以从第一条开始告诉我。',
  },
]

export function getTherapyMode(id: string | null | undefined): TherapyMode {
  return THERAPY_MODES.find((m) => m.id === id) ?? THERAPY_MODES[0]
}
