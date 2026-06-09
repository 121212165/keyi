-- 创建 chat_sessions 表（与代码对齐）
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT DEFAULT '新对话',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    emotion_summary JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0,
    therapy_mode TEXT DEFAULT 'general'
);

-- 创建 messages 表
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    emotion JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_chat_sessions" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages" ON messages FOR ALL USING (true) WITH CHECK (true);
