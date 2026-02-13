import { useState, useEffect } from 'react'
import { Input, Button, List, Card, message, Modal } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { api } from '../api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertContent, setAlertContent] = useState('')

  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      const response = await api.chat.createSession()
      setSessionId(response.session_id)
      
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: '你好，我是AI心理医生，很高兴能陪伴你。今天想聊聊什么呢？',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    } catch (error) {
      message.error('初始化会话失败，请刷新页面重试')
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入消息')
      return
    }

    if (!sessionId) {
      message.error('会话未初始化，请刷新页面')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const data = await api.chat.sendMessage(sessionId, inputValue)

      if (data.alert_level) {
        setAlertContent(data.response)
        setAlertVisible(true)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      message.error('发送消息失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card title="心理咨询对话" style={{ height: 'calc(100vh - 120px)' }}>
        <List
          style={{ height: 'calc(100% - 60px)', overflowY: 'auto', marginBottom: '20px' }}
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item
              style={{
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '10px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                  color: msg.role === 'user' ? 'white' : 'black',
                }}
              >
                {msg.content}
              </div>
            </List.Item>
          )}
        />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          disabled={loading}
          placeholder="输入你的消息..."
          suffix={
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={loading}
            >
              发送
            </Button>
          }
        />
      </Card>
      <Modal
        title="紧急预警"
        visible={alertVisible}
        onOk={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAlertVisible(false)}>
            我已了解
          </Button>,
        ]}
        width={600}
      >
        <div style={{ whiteSpace: 'pre-line' }}>{alertContent}</div>
      </Modal>
    </>
  )
}