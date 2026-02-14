import { useState, useEffect, useRef } from 'react'
import { Input, Button, List, Card, message, Modal, Spin } from 'antd'
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
  const [sending, setSending] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertContent, setAlertContent] = useState('')
  const listRef = useRef<any>(null)

  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    setLoading(true)
    try {
      const response = await api.chat.createSession()
      setSessionId(response.session_id)

      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: '你好，我是可意，你的AI心理陪伴助手。很高兴你来到这里。无论你现在想倾诉什么，或者只是想找人说说话，我都在。今天想聊些什么呢？',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('初始化会话失败:', error)
      message.error(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
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
    setSending(true)

    try {
      const data = await api.chat.sendMessage(sessionId, inputValue)

      // 危机预警：显示弹窗，不添加到消息列表
      if (data.alert_level) {
        setAlertContent(data.response)
        setAlertVisible(true)
      } else {
        // 正常回复：添加到消息列表
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      message.error('发送消息失败，请重试')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Card
        title="心理咨询对话"
        style={{ height: 'calc(100vh - 120px)' }}
        loading={loading}
      >
        <List
          ref={listRef}
          style={{ height: 'calc(100% - 80px)', overflowY: 'auto', marginBottom: '20px' }}
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item
              style={{
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '10px',
                border: 'none',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: msg.role === 'user' ? '#1890ff' : '#f5f5f5',
                  color: msg.role === 'user' ? 'white' : 'black',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {msg.content}
              </div>
            </List.Item>
          )}
        />

        {/* 发送中状态提示 */}
        {sending && (
          <div style={{ marginBottom: '10px', color: '#999', fontSize: '12px' }}>
            <Spin size="small" /> 正在思考...
          </div>
        )}

        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          disabled={loading || sending}
          placeholder="输入你想说的话..."
          suffix={
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={loading || sending || !inputValue.trim()}
              loading={sending}
            >
              发送
            </Button>
          }
        />
      </Card>

      <Modal
        title={
          <span style={{ color: '#ff4d4f' }}>紧急预警</span>
        }
        open={alertVisible}
        onOk={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
        footer={[
          <Button key="close" type="primary" danger onClick={() => setAlertVisible(false)}>
            我已了解
          </Button>,
        ]}
        width={600}
      >
        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
          {alertContent}
        </div>
      </Modal>
    </>
  )
}