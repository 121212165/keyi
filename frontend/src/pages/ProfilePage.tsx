import { Card, Empty, Button, Alert, message } from 'antd'
import EmotionTrend from '../components/EmotionTrend'

export default function ProfilePage() {
  const handleDeleteData = () => {
    message.info('此功能将在后续版本中实现')
  }

  const handleExportData = () => {
    message.info('此功能将在后续版本中实现')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <EmotionTrend emotions={[]} />

      <Card title="个人中心">
        <Alert
          message="功能开发中"
          description="评估历史和数据分析功能正在开发中，将在后续版本中上线。"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <div style={{ marginBottom: '30px' }}>
          <h3>评估历史</h3>
          <Empty description="暂无评估记录" />
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