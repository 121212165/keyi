import { Layout } from 'antd'
import ChatPage from './pages/ChatPage'

const { Header, Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#1890ff', padding: '0 20px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '20px' }}>可意 - AI心理陪伴</h1>
      </Header>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <ChatPage />
      </Content>
    </Layout>
  )
}

export default App