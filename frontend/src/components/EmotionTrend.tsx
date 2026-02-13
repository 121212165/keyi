import { Card, Row, Col, Statistic, Tag } from 'antd'

interface EmotionTrendProps {
  emotions: Array<{
    date: string
    primary_emotion: string
    intensity: string
    confidence: number
  }>
}

export default function EmotionTrend({ emotions }: EmotionTrendProps) {
  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: '#52c41a',
      anger: '#ff4d4f',
      sadness: '#1890ff',
      fear: '#722ed1',
      disgust: '#faad14',
      surprise: '#eb2f96',
      anxiety: '#fa8c16',
      depression: '#595959',
      loneliness: '#13c2c2',
      guilt: '#a0d911',
    }
    return colors[emotion] || '#8c8c8c'
  }

  const getIntensityColor = (intensity: string) => {
    if (intensity === 'high') return 'red'
    if (intensity === 'medium') return 'orange'
    return 'green'
  }

  const getEmotionLabel = (emotion: string) => {
    const labels: Record<string, string> = {
      joy: '喜悦',
      anger: '愤怒',
      sadness: '悲伤',
      fear: '恐惧',
      disgust: '厌恶',
      surprise: '惊讶',
      anxiety: '焦虑',
      depression: '抑郁',
      loneliness: '孤独',
      guilt: '内疚',
    }
    return labels[emotion] || emotion
  }

  const getIntensityLabel = (intensity: string) => {
    const labels: Record<string, string> = {
      low: '轻微',
      medium: '中等',
      high: '强烈',
    }
    return labels[intensity] || intensity
  }

  const emotionCounts = emotions.reduce((acc, curr) => {
    acc[curr.primary_emotion] = (acc[curr.primary_emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostFrequentEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
  const averageConfidence = emotions.length > 0
    ? emotions.reduce((sum, curr) => sum + curr.confidence, 0) / emotions.length
    : 0

  return (
    <Card title="情绪趋势分析">
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Statistic
            title="记录次数"
            value={emotions.length}
            suffix="次"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="最常见情绪"
            value={mostFrequentEmotion ? getEmotionLabel(mostFrequentEmotion[0]) : '-'}
            valueStyle={{ color: getEmotionColor(mostFrequentEmotion?.[0] || '') }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="平均置信度"
            value={averageConfidence}
            precision={2}
            suffix="%"
          />
        </Col>
      </Row>

      <div style={{ marginBottom: '20px' }}>
        <h3>情绪分布</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.entries(emotionCounts).map(([emotion, count]) => (
            <Tag
              key={emotion}
              color={getEmotionColor(emotion)}
              style={{ fontSize: '14px', padding: '5px 10px' }}
            >
              {getEmotionLabel(emotion)}: {count}
            </Tag>
          ))}
        </div>
      </div>

      <div>
        <h3>最近情绪记录</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {emotions.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              暂无情绪记录
            </p>
          ) : (
            emotions.slice().reverse().map((emotion, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Tag
                    color={getEmotionColor(emotion.primary_emotion)}
                    style={{ marginRight: '10px' }}
                  >
                    {getEmotionLabel(emotion.primary_emotion)}
                  </Tag>
                  <Tag color={getIntensityColor(emotion.intensity)}>
                    {getIntensityLabel(emotion.intensity)}
                  </Tag>
                </div>
                <div style={{ color: '#999', fontSize: '12px' }}>
                  {new Date(emotion.date).toLocaleString('zh-CN')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}