import { useState } from 'react'
import { Card, List, Tag, Button, message } from 'antd'
import EmotionTrend from '../components/EmotionTrend'

export default function ProfilePage() {
  const [assessments] = useState([
    {
      id: '1',
      scale_type: 'PHQ-9',
      score: 12,
      level: '中度抑郁',
      completed_at: '2026-02-01',
    },
    {
      id: '2',
      scale_type: 'GAD-7',
      score: 8,
      level: '轻度焦虑',
      completed_at: '2026-01-28',
    },
  ])

  const [emotions] = useState([
    {
      date: '2026-02-02T10:00:00',
      primary_emotion: 'anxiety',
      intensity: 'medium',
      confidence: 0.85,
    },
    {
      date: '2026-02-02T14:30:00',
      primary_emotion: 'sadness',
      intensity: 'low',
      confidence: 0.75,
    },
    {
      date: '2026-02-01T09:00:00',
      primary_emotion: 'joy',
      intensity: 'high',
      confidence: 0.90,
    },
  ])

  const getLevelColor = (level: string) => {
    if (level.includes('重度')) return 'red'
    if (level.includes('中度')) return 'orange'
    if (level.includes('轻度')) return 'yellow'
    return 'green'
  }

  const handleDeleteData = () => {
    message.warning('数据删除功能需要后端支持')
  }

  const handleExportData = () => {
    message.warning('数据导出功能需要后端支持')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <EmotionTrend emotions={emotions} />
      
      <Card title="个人中心">
        <div style={{ marginBottom: '30px' }}>
          <h3>评估历史</h3>
          <List
            dataSource={assessments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link">查看详情</Button>,
                ]}
              >
                <List.Item.Meta
                  title={`${item.scale_type} - ${item.level}`}
                  description={`完成时间: ${item.completed_at}`}
                />
                <Tag color={getLevelColor(item.level)}>{item.score}分</Tag>
              </List.Item>
            )}
          />
        </div>

        <div>
          <h3>数据管理</h3>
          <Button 
            type="primary" 
            danger 
            style={{ marginRight: '10px' }}
            onClick={handleDeleteData}
          >
            删除所有数据
          </Button>
          <Button onClick={handleExportData}>导出数据</Button>
        </div>
      </Card>
    </div>
  )
}