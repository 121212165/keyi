import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import ChatPage from './pages/ChatPage'
import AssessmentPage from './pages/AssessmentPage'
import ProfilePage from './pages/ProfilePage'

const { Header, Content, Sider } = Layout

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#1890ff', padding: '0 20px' }}>
          <h1 style={{ color: 'white', margin: 0 }}>AI心理医生</h1>
        </Header>
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>
            <div style={{ padding: '20px' }}>
              <a href="/" style={{ display: 'block', marginBottom: '10px' }}>对话</a>
              <a href="/assessment" style={{ display: 'block', marginBottom: '10px' }}>评估</a>
              <a href="/profile" style={{ display: 'block' }}>个人中心</a>
            </div>
          </Sider>
          <Content style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App