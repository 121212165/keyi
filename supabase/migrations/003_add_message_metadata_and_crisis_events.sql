ALTER TABLE messages
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS crisis_events (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    alert_level TEXT NOT NULL,
    detected_keyword TEXT,
    user_message TEXT NOT NULL,
    response_given TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crisis_events_session_id ON crisis_events(session_id);
CREATE INDEX IF NOT EXISTS idx_crisis_events_user_id ON crisis_events(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_events_created_at ON crisis_events(created_at DESC);

ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all_crisis_events
ON crisis_events FOR ALL USING (true) WITH CHECK (true);
