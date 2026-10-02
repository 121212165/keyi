interface RecordField {
  key: string
  label: string
  percent?: boolean
  /** SUD / 睡眠效率这类字段只接受数字：metadata 没有 schema 约束，字符串会直接糊到界面上。 */
  numeric?: boolean
}

const RECORD_FIELDS: RecordField[] = [
  { key: 'emotional_state', label: '情绪' },
  { key: 'current_phase', label: '阶段' },
  { key: 'stage', label: '练习阶段' },
  { key: 'current_level', label: '暴露层级', numeric: true },
  { key: 'sud_score', label: '焦虑 SUD', numeric: true },
  { key: 'sleep_efficiency', label: '睡眠效率', percent: true, numeric: true },
  { key: 'awake_count', label: '夜醒次数', numeric: true },
]

/**
 * `messages.metadata` 里的 CBT / 脱敏 / 睡眠记录此前只写不读，用户从来看不到自己做过的练习。
 * 这里把它们压成可读标签；脏值（非字符串、NaN、数组里的 null）不显示。
 */
export function recordChips(metadata: Record<string, unknown> | undefined | null): string[] {
  if (typeof metadata !== 'object' || metadata === null) return []

  const chips: string[] = []
  for (const { key, label, percent, numeric } of RECORD_FIELDS) {
    const value = metadata[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      chips.push(percent ? `${label}：${Math.round(value * 100)}%` : `${label}：${value}`)
    } else if (!numeric && typeof value === 'string' && value.trim()) {
      chips.push(`${label}：${value.trim()}`)
    }
  }

  const distortions = metadata.cognitive_distortions
  if (Array.isArray(distortions)) {
    const names = distortions.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    )
    if (names.length) chips.push(`思维陷阱：${names.join('、')}`)
  }

  return chips
}
