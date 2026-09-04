BEGIN;

-- Supabase-first therapy plans and three-layer memory storage.
-- user_id remains TEXT for compatibility with the existing chat_sessions schema.

CREATE TABLE public.therapy_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL CHECK (BTRIM(user_id) <> ''),
    title TEXT NOT NULL DEFAULT 'Therapy plan',
    description TEXT,
    goals JSONB NOT NULL DEFAULT '[]'::JSONB,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    therapy_mode TEXT NOT NULL DEFAULT 'general' CHECK (BTRIM(therapy_mode) <> ''),
    started_at TIMESTAMPTZ,
    target_end_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT therapy_plans_id_user_id_key UNIQUE (id, user_id)
);

CREATE TABLE public.therapy_plan_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    user_id TEXT NOT NULL CHECK (BTRIM(user_id) <> ''),
    position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT therapy_plan_steps_plan_owner_fkey
        FOREIGN KEY (plan_id, user_id)
        REFERENCES public.therapy_plans (id, user_id) ON DELETE CASCADE,
    CONSTRAINT therapy_plan_steps_plan_position_key UNIQUE (plan_id, position)
);

ALTER TABLE public.chat_sessions
    ADD COLUMN plan_id UUID REFERENCES public.therapy_plans (id) ON DELETE SET NULL,
    ADD COLUMN session_type TEXT NOT NULL DEFAULT 'general'
        CHECK (BTRIM(session_type) <> ''),
    ADD COLUMN summary_status TEXT NOT NULL DEFAULT 'not_requested'
        CHECK (summary_status IN (
            'not_requested', 'pending', 'processing', 'completed', 'failed', 'stale'
        )),
    ADD CONSTRAINT chat_sessions_id_user_id_key UNIQUE (id, user_id);

CREATE TABLE public.memory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL CHECK (BTRIM(user_id) <> ''),
    session_id UUID REFERENCES public.chat_sessions (id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.therapy_plans (id) ON DELETE SET NULL,
    memory_layer TEXT NOT NULL
        CHECK (memory_layer IN ('working', 'episodic', 'semantic')),
    memory_type TEXT NOT NULL DEFAULT 'observation' CHECK (BTRIM(memory_type) <> ''),
    content TEXT NOT NULL CHECK (BTRIM(content) <> ''),
    importance NUMERIC(4, 3) NOT NULL DEFAULT 0.500 CHECK (importance BETWEEN 0 AND 1),
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence BETWEEN 0 AND 1),
    source JSONB NOT NULL DEFAULT '{}'::JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    expires_at TIMESTAMPTZ,
    retracted_at TIMESTAMPTZ,
    retracted_by TEXT CHECK (retracted_by IS NULL OR retracted_by = user_id),
    retraction_reason TEXT,
    deleted_at TIMESTAMPTZ,
    deleted_by TEXT CHECK (deleted_by IS NULL OR deleted_by = user_id),
    deletion_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.session_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id TEXT NOT NULL CHECK (BTRIM(user_id) <> ''),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'stale')),
    summary TEXT,
    key_points JSONB NOT NULL DEFAULT '[]'::JSONB,
    emotions JSONB NOT NULL DEFAULT '{}'::JSONB,
    risks JSONB NOT NULL DEFAULT '[]'::JSONB,
    action_items JSONB NOT NULL DEFAULT '[]'::JSONB,
    source_message_count INTEGER NOT NULL DEFAULT 0 CHECK (source_message_count >= 0),
    model TEXT,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT session_summaries_session_owner_fkey
        FOREIGN KEY (session_id, user_id)
        REFERENCES public.chat_sessions (id, user_id) ON DELETE CASCADE,
    CONSTRAINT session_summaries_session_version_key UNIQUE (session_id, version)
);

CREATE OR REPLACE FUNCTION public.keyi_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.keyi_enforce_owned_references()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF TG_TABLE_NAME = 'chat_sessions' THEN
        IF NEW.plan_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.therapy_plans AS plan
            WHERE plan.id = NEW.plan_id AND plan.user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'chat session plan must belong to the same user'
                USING ERRCODE = '23503';
        END IF;
    ELSIF TG_TABLE_NAME = 'memory_items' THEN
        IF NEW.session_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.chat_sessions AS session
            WHERE session.id = NEW.session_id AND session.user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'memory session must belong to the same user'
                USING ERRCODE = '23503';
        END IF;

        IF NEW.plan_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.therapy_plans AS plan
            WHERE plan.id = NEW.plan_id AND plan.user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'memory plan must belong to the same user'
                USING ERRCODE = '23503';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.keyi_set_memory_audit_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, auth
AS $$
DECLARE
    actor_id TEXT := auth.uid()::TEXT;
BEGIN
    IF NEW.retracted_at IS DISTINCT FROM OLD.retracted_at THEN
        IF NEW.retracted_at IS NULL THEN
            NEW.retracted_by = NULL;
            NEW.retraction_reason = NULL;
        ELSIF actor_id IS NOT NULL THEN
            NEW.retracted_by = actor_id;
        END IF;
    END IF;

    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
        IF NEW.deleted_at IS NULL THEN
            NEW.deleted_by = NULL;
            NEW.deletion_reason = NULL;
        ELSIF actor_id IS NOT NULL THEN
            NEW.deleted_by = actor_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.keyi_sync_session_summary_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    target_session_id UUID;
    latest_status TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_session_id := OLD.session_id;
    ELSE
        target_session_id := NEW.session_id;
    END IF;

    SELECT summary.status INTO latest_status
    FROM public.session_summaries AS summary
    WHERE summary.session_id = target_session_id
    ORDER BY summary.version DESC, summary.updated_at DESC
    LIMIT 1;

    UPDATE public.chat_sessions
    SET summary_status = COALESCE(latest_status, 'not_requested')
    WHERE id = target_session_id;

    IF TG_OP = 'UPDATE' AND OLD.session_id IS DISTINCT FROM NEW.session_id THEN
        SELECT summary.status INTO latest_status
        FROM public.session_summaries AS summary
        WHERE summary.session_id = OLD.session_id
        ORDER BY summary.version DESC, summary.updated_at DESC
        LIMIT 1;

        UPDATE public.chat_sessions
        SET summary_status = COALESCE(latest_status, 'not_requested')
        WHERE id = OLD.session_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.keyi_enforce_owned_references() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.keyi_sync_session_summary_status() FROM PUBLIC;

CREATE TRIGGER keyi_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.keyi_set_updated_at();
CREATE TRIGGER keyi_therapy_plans_updated_at
    BEFORE UPDATE ON public.therapy_plans
    FOR EACH ROW EXECUTE FUNCTION public.keyi_set_updated_at();
CREATE TRIGGER keyi_therapy_plan_steps_updated_at
    BEFORE UPDATE ON public.therapy_plan_steps
    FOR EACH ROW EXECUTE FUNCTION public.keyi_set_updated_at();
CREATE TRIGGER keyi_memory_items_updated_at
    BEFORE UPDATE ON public.memory_items
    FOR EACH ROW EXECUTE FUNCTION public.keyi_set_updated_at();
CREATE TRIGGER keyi_memory_items_audit
    BEFORE UPDATE OF retracted_at, deleted_at ON public.memory_items
    FOR EACH ROW EXECUTE FUNCTION public.keyi_set_memory_audit_fields();
CREATE TRIGGER keyi_session_summaries_updated_at
    BEFORE UPDATE ON public.session_summaries
    FOR EACH ROW EXECUTE FUNCTION public.keyi_set_updated_at();
CREATE TRIGGER keyi_chat_sessions_plan_owner
    BEFORE INSERT OR UPDATE OF plan_id, user_id ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.keyi_enforce_owned_references();
CREATE TRIGGER keyi_memory_items_owner
    BEFORE INSERT OR UPDATE OF session_id, plan_id, user_id ON public.memory_items
    FOR EACH ROW EXECUTE FUNCTION public.keyi_enforce_owned_references();
CREATE TRIGGER keyi_session_summaries_status
    AFTER INSERT OR UPDATE OR DELETE ON public.session_summaries
    FOR EACH ROW EXECUTE FUNCTION public.keyi_sync_session_summary_status();

CREATE INDEX idx_chat_sessions_user_updated
    ON public.chat_sessions (user_id, updated_at DESC);
CREATE INDEX idx_chat_sessions_plan_id
    ON public.chat_sessions (plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX idx_chat_sessions_summary_status
    ON public.chat_sessions (user_id, summary_status, updated_at DESC);
CREATE INDEX idx_therapy_plans_user_status
    ON public.therapy_plans (user_id, status, updated_at DESC);
CREATE INDEX idx_therapy_plan_steps_user_status
    ON public.therapy_plan_steps (user_id, status, updated_at DESC);
CREATE INDEX idx_memory_items_active_retrieval
    ON public.memory_items (user_id, memory_layer, importance DESC, updated_at DESC)
    WHERE deleted_at IS NULL AND retracted_at IS NULL;
CREATE INDEX idx_memory_items_session
    ON public.memory_items (session_id, created_at DESC) WHERE session_id IS NOT NULL;
CREATE INDEX idx_memory_items_plan
    ON public.memory_items (plan_id, created_at DESC) WHERE plan_id IS NOT NULL;
CREATE INDEX idx_memory_items_expiration
    ON public.memory_items (expires_at) WHERE expires_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_session_summaries_user_status
    ON public.session_summaries (user_id, status, updated_at DESC);
CREATE INDEX idx_session_summaries_session_latest
    ON public.session_summaries (session_id, version DESC, updated_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_plan_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;

-- Remove any pre-existing policy that grants unrestricted access to user data.
DROP POLICY IF EXISTS allow_all_chat_sessions ON public.chat_sessions;
DROP POLICY IF EXISTS allow_all_messages ON public.messages;

DO $$
DECLARE
    open_policy RECORD;
BEGIN
    FOR open_policy IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
              'chat_sessions', 'messages', 'therapy_plans',
              'therapy_plan_steps', 'memory_items', 'session_summaries'
          )
          AND (
              LOWER(REGEXP_REPLACE(COALESCE(qual, ''), '[()[:space:]]', '', 'g')) = 'true'
              OR LOWER(REGEXP_REPLACE(COALESCE(with_check, ''), '[()[:space:]]', '', 'g')) = 'true'
          )
    LOOP
        EXECUTE FORMAT(
            'DROP POLICY IF EXISTS %I ON public.%I',
            open_policy.policyname,
            open_policy.tablename
        );
    END LOOP;
END;
$$;

CREATE POLICY chat_sessions_select_own
    ON public.chat_sessions FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY chat_sessions_insert_own
    ON public.chat_sessions FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY chat_sessions_update_own
    ON public.chat_sessions FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT)
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY chat_sessions_delete_own
    ON public.chat_sessions FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);

CREATE POLICY messages_select_own
    ON public.messages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions AS session
            WHERE session.id = messages.session_id
              AND session.user_id = (SELECT auth.uid())::TEXT
        )
    );
CREATE POLICY messages_insert_own
    ON public.messages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_sessions AS session
            WHERE session.id = messages.session_id
              AND session.user_id = (SELECT auth.uid())::TEXT
        )
    );
CREATE POLICY messages_update_own
    ON public.messages FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions AS session
            WHERE session.id = messages.session_id
              AND session.user_id = (SELECT auth.uid())::TEXT
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_sessions AS session
            WHERE session.id = messages.session_id
              AND session.user_id = (SELECT auth.uid())::TEXT
        )
    );
CREATE POLICY messages_delete_own
    ON public.messages FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions AS session
            WHERE session.id = messages.session_id
              AND session.user_id = (SELECT auth.uid())::TEXT
        )
    );

CREATE POLICY therapy_plans_select_own
    ON public.therapy_plans FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY therapy_plans_insert_own
    ON public.therapy_plans FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY therapy_plans_update_own
    ON public.therapy_plans FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT)
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY therapy_plans_delete_own
    ON public.therapy_plans FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);

CREATE POLICY therapy_plan_steps_select_own
    ON public.therapy_plan_steps FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY therapy_plan_steps_insert_own
    ON public.therapy_plan_steps FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY therapy_plan_steps_update_own
    ON public.therapy_plan_steps FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT)
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY therapy_plan_steps_delete_own
    ON public.therapy_plan_steps FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);

CREATE POLICY memory_items_select_own
    ON public.memory_items FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY memory_items_insert_own
    ON public.memory_items FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY memory_items_update_own
    ON public.memory_items FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT)
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);

CREATE POLICY session_summaries_select_own
    ON public.session_summaries FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY session_summaries_insert_own
    ON public.session_summaries FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY session_summaries_update_own
    ON public.session_summaries FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT)
    WITH CHECK (user_id = (SELECT auth.uid())::TEXT);
CREATE POLICY session_summaries_delete_own
    ON public.session_summaries FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid())::TEXT);

REVOKE ALL ON TABLE public.chat_sessions FROM anon;
REVOKE ALL ON TABLE public.messages FROM anon;
REVOKE ALL ON TABLE public.therapy_plans FROM anon;
REVOKE ALL ON TABLE public.therapy_plan_steps FROM anon;
REVOKE ALL ON TABLE public.memory_items FROM anon;
REVOKE ALL ON TABLE public.session_summaries FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chat_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.therapy_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.therapy_plan_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.memory_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.session_summaries TO authenticated;

COMMENT ON COLUMN public.memory_items.memory_layer IS
    'Three-layer memory: working, episodic, or semantic.';
COMMENT ON COLUMN public.memory_items.retracted_at IS
    'Withdrawal timestamp. Clear this field to restore the memory item.';
COMMENT ON COLUMN public.memory_items.deleted_at IS
    'Soft-deletion timestamp. Authenticated users intentionally have no hard-delete grant.';

COMMIT;
