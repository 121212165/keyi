const CRISIS_KEYWORDS = [
  '自杀', '不想活', '想死', '结束生命', '活不下去',
  '自残', '割腕', '跳楼', '上吊', '吃药',
  'suicide', 'kill myself', 'end my life', 'self-harm',
]

const CRISIS_RESPONSE = `我听到你说的这些话，我很担心你现在的安全。

你的感受很重要，你值得被帮助。请现在就联系专业的危机干预热线：

📞 全国24小时心理援助热线：400-161-9995
📞 北京心理危机研究与干预中心：010-82951332
📞 生命热线：400-821-1215

如果你在身边有人，请告诉他们你需要帮助。你不需要独自面对这些。`

export function detectCrisis(message: string): {
  isCrisis: boolean
  level: string
  response: string
} | null {
  const lower = message.toLowerCase()
  for (const keyword of CRISIS_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      return {
        isCrisis: true,
        level: 'high',
        response: CRISIS_RESPONSE,
      }
    }
  }
  return null
}
