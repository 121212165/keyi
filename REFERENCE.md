# 可意AI心理医生 - AI产品与开源参考大全

> 本文件汇总了AI相关产品的设计模式、技术架构和最佳实践，涵盖对话AI、心理健康、AI Agent等多个领域

---

## 目录

1. [对话式AI产品](#1-对话式ai产品)
2. [心理健康AI产品](#2-心理健康ai产品)
3. [AI Agent框架](#3-ai-agent框架)
4. [LLM应用开发](#4-llm应用开发)
5. [前端UI/UX设计](#5-前端uiux设计)
6. [监控与日志](#6-监控与日志)
7. [安全与伦理](#7-安全与伦理)
8. [部署与架构](#8-部署与架构)

---

## 1. 对话式AI产品

### 1.1 通用对话模式 (参考: ChatGPT, Claude, Gemini)

```typescript
// 对话上下文管理
interface ConversationContext {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: number;
  }>;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
}

// 上下文窗口管理
function manageContext(context: ConversationContext): ConversationContext {
  const maxMessages = 20;
  if (context.messages.length > maxMessages) {
    // 保留系统提示 + 最近消息 + 摘要
    const summary = generateSummary(context.messages.slice(0, -maxMessages));
    return {
      ...context,
      messages: [
        context.messages[0], // system
        { role: 'assistant', content: `...前文摘要: ${summary}` },
        ...context.messages.slice(-maxMessages + 1)
      ]
    };
  }
  return context;
}
```

### 1.2 角色扮演AI (参考: Character.AI, NovelAI)

```typescript
// 角色定义
interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  speakingStyle: string;
  systemPrompt: string;
  avatarUrl?: string;
}

// 可意角色配置
const KEYI_CHARACTER: Character = {
  id: 'keyi',
  name: '可意',
  description: '温暖的心理AI助手',
  personality: '同理心、耐心、温暖、不评判',
  speakingStyle: '温柔、简洁、有力量，善用比喻',
  systemPrompt: `你是可意，一位专业的AI心理助手...
  // 详细的人格定义
  `
};
```

### 1.3 多模态对话 (参考: GPT-4V, Claude Vision)

```typescript
// 多模态输入处理
async function processMultimodalInput(input: {
  text?: string;
  image?: string; // base64
  audio?: string;
}) {
  const content = [];

  if (input.text) {
    content.push({ type: 'text', text: input.text });
  }

  if (input.image) {
    content.push({
      type: 'image_url',
      image_url: { url: input.image }
    });
  }

  return await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [{ role: 'user', content }]
  });
}
```

---

## 2. 心理健康AI产品

### 2.1 危机检测系统 (参考: Woebot, Wysa, 7 Cups)

```typescript
// 危机等级分类器
type CrisisLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

interface CrisisAssessment {
  level: CrisisLevel;
  detectedKeywords: string[];
  confidence: number;
  shouldAlert: boolean;
  recommendedResponse: string;
}

// 多维度危机检测
async function assessCrisis(
  message: string,
  history: Message[],
  userSentiment: number
): Promise<CrisisAssessment> {
  const keywords = detectCrisisKeywords(message);
  const sentiment = analyzeSentiment(message);

  // 累积分析
  const crisisPattern = analyzeCrisisPattern(history);
  const escalationRisk = calculateEscalationRisk(history);

  // 综合评分
  const score = calculateCrisisScore(
    keywords,
    sentiment,
    crisisPattern,
    escalationRisk
  );

  return {
    level: scoreToLevel(score),
    detectedKeywords: keywords,
    confidence: calculateConfidence(keywords, sentiment),
    shouldAlert: score > threshold,
    recommendedResponse: getResponseForLevel(score)
  };
}
```

### 2.2 情绪追踪 (参考: Daylio, Moodflow)

```typescript
// 情绪数据模型
interface MoodEntry {
  id: string;
  userId: string;
  timestamp: Date;
  mood: number; // 1-10
  emotions: string[]; // ['sad', 'anxious', 'hopeful']
  activities?: string[];
  note?: string;
  triggers?: string[];
  aiInsight?: string;
}

// 情绪趋势分析
function analyzeMoodTrend(entries: MoodEntry[]): {
  trend: 'improving' | 'stable' | 'declining';
  averageMood: number;
  dominantEmotions: string[];
  recommendations: string[];
} {
  // 计算移动平均
  const movingAvg = calculateMovingAverage(entries.map(e => e.mood));

  // 情绪频率统计
  const emotionCounts = countEmotions(entries);

  return {
    trend: determineTrend(movingAvg),
    averageMood: calculateAverage(entries.map(e => e.mood)),
    dominantEmotions: getTopEmotions(emotionCounts),
    recommendations: generateRecommendations(movingAvg, emotionCounts)
  };
}
```

### 2.3 CBT认知训练 (参考: MoodTools, Thinkitude)

```typescript
// 认知重构练习
interface CognitiveDistortion {
  type: string;
  description: string;
  challengeQuestions: string[];
  reframedThought: string;
}

// 常见认知扭曲类型
const COGNITIVE_DISTORTIONS = {
  allOrNothing: {
    type: '非黑即白思维',
    description: '用极端方式看待事物',
    challengeQuestions: [
      '有没有中间状态？',
      '如果朋友这样想，你会怎么说？'
    ]
  },
  catastrophizing: {
    type: '灾难化思维',
    description: '把事情往最坏的方向想',
    challengeQuestions: [
      '最坏情况发生的概率有多大？',
      '即使发生了，你能应对吗？'
    ]
  },
  mindReading: {
    type: '读心术',
    description: '假设知道别人在想什么',
    challengeQuestions: [
      '有什么证据支持你的想法？',
      '有没有其他可能的解释？'
    ]
  }
};
```

### 2.4 正念引导 (参考: Headspace, Calm)

```typescript
// 正念练习配置
interface MindfulnessExercise {
  id: string;
  title: string;
  duration: number; // 秒
  type: 'breathing' | 'body-scan' | 'meditation' | 'grounding';
  steps: Array<{
    timestamp: number;
    instruction: string;
    audioCue?: string;
  }>;
}

// 呼吸练习
const BREATHING_EXERCISES = {
  boxBreathing: {
    name: '方形呼吸法',
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfterExhale: 4
    },
    steps: [
      { time: 0, instruction: '舒服地坐着，闭上眼睛' },
      { time: 5, instruction: '吸气...1...2...3...4' },
      { time: 9, instruction: '屏住...1...2...3...4' },
      { time: 13, instruction: '呼气...1...2...3...4' }
    ]
  },
 478呼吸: {
    name: '4-7-8呼吸法',
    pattern: {
      inhale: 4,
      hold: 7,
      exhale: 8
    }
  }
};
```

---

## 3. AI Agent框架

### 3.1 自主Agent (参考: AutoGPT, BabyAGI, LangChain Agents)

```typescript
// Agent任务循环
class TaskAgent {
  goals: string[];
  memory: VectorStore;
  tools: Tool[];

  async run(initialTask: string): Promise<void> {
    const taskList = await decomposeTask(initialTask);

    while (taskList.hasNext()) {
      const task = taskList.pop();

      // 思考
      const thought = await this.think(task);

      // 执行
      const result = await this.execute(task, thought);

      // 反思
      await this.reflect(task, result);

      // 存储记忆
      await this.memory.add({
        task,
        thought,
        result,
        timestamp: Date.now()
      });

      // 检查是否达成目标
      if (this.checkGoalsCompletion()) {
        break;
      }
    }
  }
}
```

### 3.2 多角色协作 (参考: CrewAI, AutoGen)

```typescript
// 多Agent协作系统
interface Agent {
  id: string;
  role: string;
  goal: string;
  backstory: string;
  systemPrompt: string;
}

interface Task {
  id: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  dependencies?: string[];
}

// CrewAI模式
const CRISIS_TEAM = {
  agents: [
    {
      id: 'assessor',
      role: '危机评估员',
      goal: '准确评估用户危机程度',
      backstory: '你是专业心理危机干预专家...'
    },
    {
      id: 'supporter',
      role: '情感支持者',
      goal: '为用户提供情感支持',
      backstory: '你是温暖有同理心的心理助手...'
    },
    {
      id: 'resource_manager',
      role: '资源协调员',
      goal: '提供合适的专业帮助资源',
      backstory: '你熟悉各种心理援助资源...'
    }
  ],
  tasks: [
    { agent: 'assessor', description: '分析用户消息，评估危机等级' },
    { agent: 'supporter', description: '根据评估结果提供回应' },
    { agent: 'resource_manager', description: '推荐相关资源' }
  ]
};
```

### 3.3 RAG知识库 (参考: Perplexity, YouChat)

```typescript
// 检索增强生成
interface RAGSystem {
  documents: Document[];
  embeddings: VectorStore;
  retriever: (query: string) => Promise<Document[]>;
  generator: (context: string, query: string) => Promise<string>;
}

// 心理知识库RAG
const PSYCH_KNOWLEDGE_BASE = {
  documents: [
    {
      id: 'anxiety_basics',
      category: 'anxiety',
      content: '焦虑是一种常见的情绪反应...',
      metadata: { author: '专业心理来源', reviewed: true }
    },
    {
      id: 'depression_basics',
      category: 'depression',
      content: '抑郁症是一种常见的心理健康问题...',
      metadata: { author: '专业心理来源', reviewed: true }
    }
  ],

  async retrieve(query: string): Promise<Document[]> {
    const queryEmbedding = await embed(query);
    return await semanticSearch(queryEmbedding, this.documents);
  }
};
```

---

## 4. LLM应用开发

### 4.1 Prompt工程 (参考: OpenAI Cookbook, Anthropic Guide)

```typescript
// 高级Prompt模板
interface PromptTemplate {
  template: string;
  variables: string[];
  examples?: Array<{ input: string; output: string }>;
  constraints?: string[];
}

// Few-shot Prompting
const CRISIS_PROMPT_TEMPLATE: PromptTemplate = {
  template: `
你是一位专业的心理危机干预专家。你的任务是识别用户消息中的危机信号，
并提供适当的回应。

## 任务
1. 分析用户消息，识别危机关键词
2. 评估危机等级 (低/中/高/严重)
3. 生成适当的回应

## 危机关键词
- 严重: 自杀、自残、想死、结束生命
- 高: 绝望、活着没意义、痛苦到无法承受
- 中: 难过、焦虑、压力大、孤独

## 示例

示例1:
用户: "我最近总是睡不着，觉得活着很累"
分析: 检测到"活着很累"可能是绝望信号
危机等级: 中
回应: "听到你最近睡不好，还感到累，我能感受到你的不容易...

示例2:
用户: "我想自杀"
分析: 检测到严重危机关键词
危机等级: 严重
回应: "我听到你了，你说的这些非常重要...

## 当前对话
用户: {userMessage}

分析: {analysis}
危机等级: {crisisLevel}
回应: `,

  variables: ['userMessage', 'analysis', 'crisisLevel']
};
```

### 4.2 Function Calling (参考: OpenAI Tools)

```typescript
// 定义工具函数
const TOOLS = [
  {
    name: 'assess_crisis',
    description: '评估用户消息的危机等级',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '用户消息' },
        history: { type: 'array', description: '对话历史' }
      },
      required: ['message']
    }
  },
  {
    name: 'get_resources',
    description: '获取心理援助资源',
    parameters: {
      type: 'object',
      properties: {
        crisisLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
      }
    }
  },
  {
    name: 'log_interaction',
    description: '记录这次交互用于改进',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        message: { type: 'string' },
        response: { type: 'string' },
        crisisLevel: { type: 'string' }
      }
    }
  }
];
```

### 4.3 Token优化 (参考: LangChain TokenSplitters)

```typescript
// Token管理
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // 粗略估算
}

function optimizeContext(
  messages: Message[],
  maxTokens: number,
  reserveForResponse: number = 500
): Message[] {
  const availableTokens = maxTokens - reserveForResponse;
  let currentTokens = 0;
  const selected: Message[] = [];

  // 从最新消息开始选择
  for (let i = messages.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(messages[i].content);
    if (currentTokens + tokens <= availableTokens) {
      selected.unshift(messages[i]);
      currentTokens += tokens;
    } else {
      break;
    }
  }

  return selected;
}
```

### 4.4 流式响应 (参考: Vercel AI SDK)

```typescript
// 流式API处理
async function streamChat(
  messages: Message[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    stream: true
  });

  let fullResponse = '';
  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  return fullResponse;
}

// Vercel AI SDK模式
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4'),
    messages,
    system: SYSTEM_PROMPT,
    onFinish: async ({ text, usage }) => {
      // 保存对话历史
      await saveConversation(messages, text, usage);
    }
  });

  return result.toDataStreamResponse();
}
```

---

## 5. 前端UI/UX设计

### 5.1 对话界面 (参考: ChatGPT, Claude)

```typescript
// 消息气泡组件
interface MessageBubble {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  isStreaming?: boolean;
}

// 打字机效果
function useTypewriter(text: string, speed: number = 30) {
  const [displayed, setDisplayed] = useState('');
  const index = useRef(0);

  useEffect(() => {
    if (index.current < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, index.current + 1));
        index.current++;
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [text, speed]);

  return displayed;
}
```

### 5.2 情感反馈 (参考: Messenger Reactions)

```typescript
// 消息反馈组件
interface FeedbackOption {
  emoji: string;
  label: string;
  action: 'helpful' | 'not_helpful' | 'creative' | 'accurate';
}

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  { emoji: '👍', label: '有帮助', action: 'helpful' },
  { emoji: '👎', label: '没帮助', action: 'not_helpful' },
  { emoji: '💡', label: '有启发', action: 'creative' },
  { emoji: '🎯', label: '准确', action: 'accurate' }
];

// 心情追踪
const MOOD_OPTIONS = [
  { emoji: '😊', value: 5, label: '很好' },
  { emoji: '🙂', value: 4, label: '不错' },
  { emoji: '😐', value: 3, label: '一般' },
  { emoji: '😔', value: 2, label: '低落' },
  { emoji: '😢', value: 1, label: '很难过' }
];
```

### 5.3 无障碍设计 (参考: WCAG)

```typescript
// 无障碍对话界面
function AccessibleChat() {
  return (
    <div role="log" aria-live="polite">
      <ScreenReaderAnnouncement message={aiTyping ? 'AI正在输入...' : ''} />

      {messages.map(msg => (
        <article
          role="logentry"
          aria-label={`${msg.role === 'user' ? '你' : '可意'}说`}
        >
          <VisuallyHidden>
            {new Date(msg.timestamp).toLocaleTimeString()}
          </VisuallyHidden>
          <MessageContent content={msg.content} />
        </article>
      ))}
    </div>
  );
}
```

---

## 6. 监控与日志

### 6.1 错误追踪 (参考: Sentry)

```typescript
// 错误上报
import * as Sentry from '@sentry/deno';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // 敏感数据脱敏
  beforeSend(event) {
    if (event.message?.includes('user message')) {
      event.message = '[FILTERED] User message hidden';
    }
    return event;
  }
});

// 自定义错误边界
try {
  await processMessage(message);
} catch (error) {
  Sentry.captureException(error, {
    extra: {
      messageLength: message.length,
      hasCrisisKeywords: detectCrisisKeywords(message).length > 0
    }
  });
  throw new Error('消息处理失败，请重试');
}
```

### 6.2 性能监控 (参考: Datadog, New Relic)

```typescript
// 性能指标
interface PerformanceMetrics {
  responseTime: number;
  tokenCount: number;
  cost: number;
  cacheHit: boolean;
}

async function trackPerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const start = performance.now();
  const result = await operation();
  const duration = performance.now() - start;

  await metricsClient.record({
    name: operationName,
    duration,
    timestamp: Date.now()
  });

  return result;
}
```

### 6.3 使用分析 (参考: Mixpanel, Amplitude)

```typescript
// 埋点事件
const EVENTS = {
  CONVERSATION_START: 'conversation_started',
  MESSAGE_SENT: 'message_sent',
  CRISIS_DETECTED: 'crisis_detected',
  RESOURCE_CLICKED: 'resource_clicked',
  FEEDBACK_GIVEN: 'feedback_given',
  CONVERSATION_END: 'conversation_ended'
};

// 事件追踪
function track(event: string, properties?: Record<string, any>) {
  analytics.track(event, {
    ...properties,
    timestamp: Date.now(),
    userId: getCurrentUserId()
  });
}

// 使用示例
track(EVENTS.CRISIS_DETECTED, {
  crisisLevel: 'high',
  detectedKeywords: ['想死', '绝望'],
  responseGiven: 'crisis_support'
});
```

---

## 7. 安全与伦理

### 7.1 内容过滤 (参考: OpenAI Moderation API)

```typescript
// 多层内容安全
interface SafetyResult {
  isSafe: boolean;
  categories: {
    sexual: number;
    violence: number;
    selfHarm: number;
    harassment: number;
  };
  flaggedReason?: string;
}

async function checkContentSafety(text: string): Promise<SafetyResult> {
  // 1. 关键词过滤
  const keywords = blocklist.filter(k => text.includes(k));
  if (keywords.length > 0) {
    return { isSafe: false, categories: {}, flaggedReason: `关键词: ${keywords.join(', ')}` };
  }

  // 2. AI内容审核
  const moderation = await openai.moderations.create({ input: text });

  return {
    isSafe: !moderation.results[0].flagged,
    categories: moderation.results[0].category_scores,
    flaggedReason: moderation.results[0].flagged ? 'AI检测到敏感内容' : undefined
  };
}
```

### 7.2 数据脱敏 (参考: HIPAA Compliance)

```typescript
// 敏感信息识别与脱敏
const SENSITIVE_PATTERNS = [
  { pattern: /\b\d{11}\b/g, type: '手机号', replace: '***' },
  { pattern: /\b[\w.-]+@[\w.-]+\.\w+\b/g, type: '邮箱', replace: '***@***.com' },
  { pattern: /\b\d{6}\b/g, type: '身份证号片段', replace: '******' }
];

function sanitizeMessage(message: string): string {
  let sanitized = message;

  for (const { pattern, replace } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replace);
  }

  return sanitized;
}

// 日志脱敏
function sanitizeForLog(message: any): any {
  if (typeof message === 'string') {
    return sanitizeMessage(message);
  }
  if (typeof message === 'object') {
    const sanitized = { ...message };
    for (const key in sanitized) {
      if (PII_FIELDS.includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLog(sanitized[key]);
      }
    }
    return sanitized;
  }
  return message;
}
```

### 7.3 用户同意与透明性

```typescript
// 隐私设置
interface PrivacySettings {
  collectConversationHistory: boolean;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  dataRetentionDays: number;
  canDeleteData: boolean;
}

// 用户同意管理
const CONSENT_REQUIREMENTS = [
  {
    id: 'terms_of_service',
    title: '服务条款',
    required: true,
    description: '使用可意服务即表示同意服务条款'
  },
  {
    id: 'privacy_policy',
    title: '隐私政策',
    required: true,
    description: '我们如何收集和使用您的数据'
  },
  {
    id: 'crisis_disclaimer',
    title: '危机情况说明',
    required: true,
    description: '了解可意的适用边界和危机情况处理'
  }
];
```

---

## 8. 部署与架构

### 8.1 Edge Functions (参考: Vercel, Supabase)

```typescript
// Edge Function模板
export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, userId } = await req.json();

    // 危机检测
    const crisisAssessment = await assessCrisis(message, history);

    if (crisisAssessment.shouldAlert) {
      await logCrisisEvent({ userId, message, crisisAssessment });
    }

    // 生成回复
    const response = await generateResponse(message, history, crisisAssessment);

    return new Response(JSON.stringify({
      response,
      alert_level: crisisAssessment.level,
      timestamp: new Date().toISOString()
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: '处理消息时出错'
    }), { status: 500, headers: corsHeaders });
  }
}
```

### 8.2 数据库设计 (参考: Supabase Schema)

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  privacy_consent JSONB DEFAULT '{}'
);

-- 对话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  risk_level TEXT DEFAULT 'low'
);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 危机事件表
CREATE TABLE crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  alert_level TEXT NOT NULL,
  keywords JSONB,
  response_given TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS策略
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own messages"
  ON messages FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE id IN (
      SELECT user_id FROM conversations WHERE id = messages.conversation_id
    )
  ));
```

### 8.3 CDN与缓存 (参考: Vercel Edge Config)

```typescript
// Edge缓存策略
const CACHE_CONFIG = {
  '/api/chat': {
    browser: 'no-store',
    edge: 'no-cache',
    staleWhileRevalidate: 0
  },
  '/resources/**': {
    browser: 'public, max-age=3600',
    edge: 'public, max-age=86400, staleWhileRevalidate=604800'
  }
};

// 缓存响应
function cacheResponse(response: Response, path: string): Response {
  const config = CACHE_CONFIG[path as keyof typeof CACHE_CONFIG];
  if (!config) return response;

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', config.edge);

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
```

---

## 相关资源汇总

### 开源项目

| 类别 | 项目 | 借鉴点 | URL |
|------|------|--------|-----|
| **对话框架** | Botpress | 对话流程、意图识别 | https://github.com/botpress/botpress |
| **对话框架** | Microsoft Bot Framework | 企业级对话系统 | https://github.com/Microsoft/botframework-sdk |
| **LLM框架** | LangChain | RAG、Agent、工具调用 | https://github.com/langchain-ai/langchain |
| **LLM框架** | LlamaIndex | 知识库检索 | https://github.com/run-llama/llama_index |
| **AI安全** | Guardrails AI | 输入/输出安全过滤 | https://github.com/guardrails-ai/guardrails |
| **前端SDK** | Vercel AI SDK | 流式响应、Hook | https://github.com/vercel/ai |
| **监控** | Sentry | 错误追踪 | https://github.com/getsentry/sentry |
| **心理健康** | Woebot | CBT对话模式 | https://woebothealth.com/ |
| **心理健康** | Wysa | 情绪追踪、练习 | https://www.wysa.com/ |
| **Agent** | AutoGPT | 自主任务执行 | https://github.com/Significant-Gravitas/AutoGPT |
| **Agent** | CrewAI | 多Agent协作 | https://github.com/joaomdmoura/crewAI |

### API与服务

| 服务 | 用途 | URL |
|------|------|-----|
| OpenAI | LLM API | https://platform.openai.com/ |
| Anthropic Claude | LLM API | https://www.anthropic.com/ |
| Supabase | 后端即服务 | https://supabase.com/ |
| Vercel | 前端部署 | https://vercel.com/ |
| Pinecone | 向量数据库 | https://www.pinecone.io/ |
| Weights & Biases | ML监控 | https://wandb.ai/ |

### 学习资源

| 类型 | 资源 |
|------|------|
| Prompt工程 | https://platform.openai.com/docs/guides/prompt-engineering |
| AI安全指南 | https://platform.openai.com/docs/guides/moderation |
| 心理健康资源 | https://www.iasp.info/resources/Crisis_Centres/ |
| 对话设计 | https://developers.facebook.com/blog/post/2023/05/02/messenger-conversation-design/ |

---

## 总结

本文件涵盖：

1. **对话AI**: ChatGPT、Claude、Character.AI模式
2. **心理健康**: Woebot、Wysa、7 Cups最佳实践
3. **AI Agent**: AutoGPT、CrewAI、LangChain Agents
4. **LLM开发**: Prompt工程、Function Calling、RAG
5. **前端UI**: 打字机效果、情感反馈、无障碍
6. **监控**: Sentry、性能追踪、使用分析
7. **安全**: 内容过滤、数据脱敏、隐私合规
8. **部署**: Edge Functions、数据库、缓存

---

*最后更新: 2024-02-14*
