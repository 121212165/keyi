# Design Document - MVP心理对话系统

## Overview

可意AI心理医生MVP版本的设计文档。本系统采用极简架构，专注于提供基于高级工作流手册的温暖、专业的心理对话服务。

核心设计理念：
- **简单优先**：MVP阶段避免过度设计
- **用户体验**：流畅的对话交互
- **可扩展性**：为未来功能预留接口
- **成本控制**：使用免费/低成本服务

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │           React前端应用                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │ ChatPage   │  │ ChatStore  │  │ API Client│  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │        LocalStorage (会话存储)             │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                  Vercel Edge Network                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Edge Function: /api/chat                 │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  1. 接收用户消息                           │  │  │
│  │  │  2. 添加系统提示词（工作流手册）           │  │  │
│  │  │  3. 调用OpenAI API                         │  │  │
│  │  │  4. 返回AI回复                             │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                    OpenAI API                            │
│              GPT-3.5-turbo / GPT-4                       │
└─────────────────────────────────────────────────────────┘
```

### 技术栈选择

**前端**：
- React 18 + TypeScript
- Redux Toolkit (状态管理)
- Tailwind CSS (样式)
- Vite (构建工具)

**后端**：
- Vercel Edge Functions (无服务器)
- TypeScript

**AI模型**：
- OpenAI GPT-3.5-turbo (主要)
- GPT-4 (可选升级)

**存储**：
- LocalStorage (MVP阶段)
- 未来可扩展：Supabase

**部署**：
- Vercel (前端 + Edge Functions)

## Components and Interfaces

### 前端组件结构

```
frontend/src/
├── pages/
│   └── ChatPage.tsx              # 主对话页面
├── components/
│   ├── MessageList.tsx           # 消息列表
│   ├── MessageItem.tsx           # 单条消息
│   ├── ChatInput.tsx             # 输入框
│   └── LoadingIndicator.tsx     # 加载指示器
├── store/
│   └── slices/
│       └── chatSlice.ts          # 对话状态管理
├── api/
│   └── chat.ts                   # API客户端
├── types/
│   └── chat.ts                   # 类型定义
└── utils/
    └── storage.ts                # LocalStorage工具
```

### 核心接口定义

#### Message接口

```typescript
interface Message {
  id: string;                    // 消息唯一ID
  role: 'user' | 'assistant';    // 角色
  content: string;               // 消息内容
  timestamp: number;             // 时间戳
}
```

#### Session接口

```typescript
interface Session {
  id: string;                    // 会话ID
  messages: Message[];           // 消息列表
  createdAt: number;             // 创建时间
  updatedAt: number;             // 更新时间
}
```

#### ChatState接口

```typescript
interface ChatState {
  currentSession: Session | null;  // 当前会话
  isLoading: boolean;              // 加载状态
  error: string | null;            // 错误信息
}
```

### API接口设计

#### POST /api/chat

**请求**：
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant',
    content: string
  }>
}
```

**响应**：
```typescript
{
  reply: string  // AI回复内容
}
```

**错误响应**：
```typescript
{
  error: string  // 错误描述
}
```

## Data Models

### LocalStorage数据结构

#### 当前会话

```typescript
// Key: 'current_session'
{
  id: string,
  messages: Message[],
  createdAt: number,
  updatedAt: number
}
```

#### 会话列表（未来扩展）

```typescript
// Key: 'sessions'
{
  [sessionId: string]: Session
}
```

### 数据流

```
用户输入消息
    ↓
添加到本地状态 (Redux)
    ↓
保存到LocalStorage
    ↓
发送到API
    ↓
接收AI回复
    ↓
添加到本地状态
    ↓
保存到LocalStorage
    ↓
更新UI
```

## Correctness Properties

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### Property 1: 消息顺序一致性

*For any* 会话，消息列表中的消息应该按照时间戳严格递增排序

**Validates: Requirements 1.4, 3.4**

### Property 2: 会话数据持久化

*For any* 有效的会话对象，序列化后反序列化应该产生等价的对象（round-trip property）

**Validates: Requirements 4.3, 4.4**

### Property 3: 空消息拒绝

*For any* 仅包含空白字符的字符串，系统应该拒绝发送并保持当前状态不变

**Validates: Requirements 1.3**

### Property 4: API响应时间

*For any* 正常的API请求，响应时间应该在3秒内

**Validates: Requirements 7.1**

### Property 5: 错误恢复

*For any* API调用失败，系统应该返回友好的错误消息并允许用户重试

**Validates: Requirements 6.1, 6.4**

### Property 6: 对话上下文连贯性

*For any* 包含至少10轮对话的会话，发送给LLM的上下文应该包含所有历史消息

**Validates: Requirements 2.4**

### Property 7: 系统提示词一致性

*For any* API调用，第一条消息应该始终是包含工作流手册内容的系统提示词

**Validates: Requirements 2.1**

### Property 8: LocalStorage容量管理

*For any* 会话，当消息数量超过100条时，系统应该能够正常存储和读取

**Validates: Requirements 7.4**

## Error Handling

### 错误分类

#### 1. 网络错误

**场景**：
- 无网络连接
- 请求超时
- DNS解析失败

**处理策略**：
```typescript
try {
  const response = await fetch('/api/chat', {...});
} catch (error) {
  if (error instanceof TypeError) {
    // 网络错误
    showError('网络连接失败，请检查您的网络设置');
  }
}
```

#### 2. API错误

**场景**：
- OpenAI API限流
- API密钥无效
- 服务器错误

**处理策略**：
```typescript
if (!response.ok) {
  if (response.status === 429) {
    showError('请求过于频繁，请稍后再试');
  } else if (response.status === 500) {
    showError('服务暂时不可用，请稍后再试');
  } else {
    showError('抱歉，出现了一些问题');
  }
}
```

#### 3. 存储错误

**场景**：
- LocalStorage已满
- 浏览器禁用存储
- 数据损坏

**处理策略**：
```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // 清理旧数据
    clearOldSessions();
    retry();
  } else {
    // 降级：仅内存存储
    useMemoryStorage();
  }
}
```

#### 4. 输入验证错误

**场景**：
- 消息为空
- 消息过长
- 非法字符

**处理策略**：
```typescript
function validateMessage(content: string): ValidationResult {
  if (!content.trim()) {
    return { valid: false, error: '消息不能为空' };
  }
  if (content.length > 2000) {
    return { valid: false, error: '消息过长，请精简后重试' };
  }
  return { valid: true };
}
```

### 错误恢复机制

#### 重试策略

```typescript
async function sendMessageWithRetry(
  message: string,
  maxRetries: number = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendMessage(message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // 指数退避
    }
  }
}
```

#### 降级策略

```typescript
// 如果API不可用，显示友好提示
if (apiUnavailable) {
  showMessage({
    role: 'assistant',
    content: '抱歉，我现在无法回复。您可以：\n1. 稍后再试\n2. 刷新页面\n3. 联系技术支持'
  });
}
```

### 用户反馈

所有错误都应该：
1. 使用友好的语言
2. 提供可行的解决方案
3. 不暴露技术细节
4. 记录到日志（用于调试）

## Testing Strategy

### 测试方法

本项目采用**双重测试策略**：
- **单元测试**：验证具体示例、边缘情况和错误条件
- **属性测试**：验证通用属性在所有输入下都成立

两种测试方法互补，共同确保全面覆盖。

### 单元测试

**测试框架**：Vitest + React Testing Library

**测试范围**：
- 组件渲染
- 用户交互
- 状态管理
- API调用
- 存储操作

**示例测试**：

```typescript
describe('ChatInput', () => {
  it('should prevent sending empty messages', () => {
    const { getByRole } = render(<ChatInput />);
    const input = getByRole('textbox');
    const button = getByRole('button');
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);
    
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
  
  it('should show error when API fails', async () => {
    mockAPI.mockRejectedValue(new Error('API Error'));
    
    const { getByText } = render(<ChatPage />);
    await sendTestMessage('Hello');
    
    expect(getByText(/无法回复/)).toBeInTheDocument();
  });
});
```

### 属性测试

**测试框架**：fast-check (JavaScript属性测试库)

**配置**：
- 每个属性测试运行100次迭代
- 使用随机生成的输入数据
- 每个测试引用对应的设计属性

**示例测试**：

```typescript
import fc from 'fast-check';

describe('Property Tests', () => {
  // Feature: mvp-chat-system, Property 2: 会话数据持久化
  it('should preserve session data through serialization', () => {
    fc.assert(
      fc.property(
        fc.array(messageArbitrary, { minLength: 1, maxLength: 50 }),
        (messages) => {
          const session = createSession(messages);
          const serialized = JSON.stringify(session);
          const deserialized = JSON.parse(serialized);
          
          expect(deserialized).toEqual(session);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: mvp-chat-system, Property 3: 空消息拒绝
  it('should reject whitespace-only messages', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1 }),
        (whitespace) => {
          const result = validateMessage(whitespace);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: mvp-chat-system, Property 1: 消息顺序一致性
  it('should maintain message order by timestamp', () => {
    fc.assert(
      fc.property(
        fc.array(messageArbitrary, { minLength: 2, maxLength: 20 }),
        (messages) => {
          const session = createSession(messages);
          const timestamps = session.messages.map(m => m.timestamp);
          
          for (let i = 1; i < timestamps.length; i++) {
            expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 测试数据生成器

```typescript
// 消息生成器
const messageArbitrary = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom('user', 'assistant'),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  timestamp: fc.integer({ min: 0, max: Date.now() })
});

// 会话生成器
const sessionArbitrary = fc.record({
  id: fc.uuid(),
  messages: fc.array(messageArbitrary, { minLength: 1, maxLength: 100 }),
  createdAt: fc.integer({ min: 0, max: Date.now() }),
  updatedAt: fc.integer({ min: 0, max: Date.now() })
});
```

### 集成测试

**测试场景**：
1. 完整对话流程
2. 页面刷新后恢复会话
3. 网络错误恢复
4. 多轮对话上下文

**示例**：

```typescript
describe('Integration Tests', () => {
  it('should complete a full conversation flow', async () => {
    const { getByRole, getByText } = render(<App />);
    
    // 发送第一条消息
    await sendMessage('你好');
    expect(getByText(/你好/)).toBeInTheDocument();
    
    // 等待AI回复
    await waitFor(() => {
      expect(getByText(/很高兴/)).toBeInTheDocument();
    });
    
    // 发送第二条消息
    await sendMessage('我最近压力很大');
    await waitFor(() => {
      expect(getByText(/理解/)).toBeInTheDocument();
    });
    
    // 验证LocalStorage
    const session = JSON.parse(localStorage.getItem('current_session'));
    expect(session.messages).toHaveLength(4); // 2条用户 + 2条AI
  });
});
```

### 端到端测试（可选）

**工具**：Playwright

**场景**：
- 真实浏览器环境测试
- 跨浏览器兼容性
- 移动端响应式

### 测试覆盖率目标

- 单元测试覆盖率：≥ 80%
- 核心功能覆盖率：≥ 90%
- 属性测试：所有correctness properties都有对应测试

### 持续集成

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage
```

