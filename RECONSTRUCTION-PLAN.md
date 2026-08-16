# First-Principles Reconstruction Plan

> **Core thesis**: The prompt IS the product. Therapy modes are prompt variations, not software modules. Two backends is one too many.

## Current State Audit

| Metric | Current |
|--------|---------|
| Total source files | ~70+ |
| Total lines of code | ~5,000+ |
| Backends | 2 (Python FastAPI + Next.js API Routes) |
| Unused backend code | 100% (frontend talks to Next.js routes, not Python) |
| Prompt definitions | 3 copies (backend .md, backend .py constant, frontend .ts) |
| Planning/doc files | 6 (FIX-PLAN.md, REFACTORING_PLAN.md, REFERENCE.md, CLAUDE.md, README.md, FIRST-PRINCIPLES-RECONSTRUCTION.md) |
| Dead frontend components | 2 (EmotionRecorder, ANTsMarker — localStorage-only, not wired to any API) |
| Dead dependencies | 2 (axios, dayjs — can be replaced with native APIs) |

---

## Files to DELETE (41 files, ~3,200 lines removed)

### 1. Entire `backend/` directory (18 files)

| File | Reason |
|------|--------|
| `backend/app/__init__.py` | Unused — frontend talks to Next.js API Routes |
| `backend/app/main.py` | Duplicate server — Next.js is the actual server |
| `backend/app/config.py` | Config for dead Python server |
| `backend/app/database.py` | SQLAlchemy stub — unused, Supabase REST is used via `db.py` |
| `backend/app/db.py` | Supabase client wrapper — duplicated by `frontend/src/lib/supabase.ts` |
| `backend/app/models.py` | SQLAlchemy ORM models — never imported by any active code |
| `backend/app/schemas.py` | 107 lines of Pydantic models — unused (Next.js routes have their own validation) |
| `backend/app/routers/__init__.py` | Package init for dead routers |
| `backend/app/routers/auth.py` | Auth routes — duplicated by `frontend/src/app/api/v1/auth/` |
| `backend/app/routers/chat.py` | Chat routes — duplicated by `frontend/src/app/api/v1/chat/` |
| `backend/app/routers/therapy.py` | Therapy modes route — duplicated by `frontend/src/app/api/v1/therapy/` |
| `backend/app/services/__init__.py` | Package init for dead services |
| `backend/app/services/auth_service.py` | Supabase auth — duplicated by Next.js routes using `supabaseAdmin()` |
| `backend/app/services/chat_service.py` | Chat service — duplicated by Next.js stream route |
| `backend/app/services/zhipu_service.py` | LLM service — duplicated by Next.js stream route's direct `fetch()` |
| `backend/app/services/therapy_base.py` | ABC base class for therapy — unnecessary abstraction |
| `backend/app/services/cbt_service.py` | CBT service — prompt variation, not a service |
| `backend/app/services/desensitize_service.py` | Desensitize service — prompt variation, not a service |
| `backend/app/prompts/__init__.py` | Prompt loader — duplicated by `frontend/src/lib/prompts.ts` |
| `backend/app/prompts/base_psychologist.md` | Prompt file — duplicated in `frontend/src/lib/prompts.ts` |
| `backend/app/prompts/cbt.md` | CBT prompt — duplicated in `frontend/src/lib/prompts.ts` |
| `backend/app/prompts/desensitize.md` | Desensitize prompt — duplicated in `frontend/src/lib/prompts.ts` |
| `backend/app/services/__init__.py` | (already listed above) |
| `backend/tests/__init__.py` | Test package init |
| `backend/tests/test_chat_api.py` | Tests for dead Python server |
| `backend/run.py` | Server entry — dead |
| `backend/requirements.txt` | Python deps — dead |
| `backend/pyproject.toml` | Python project config — dead |
| `backend/pytest.ini` | Pytest config — dead |
| `backend/setup.cfg` | Python setup — dead |
| `backend/runtime.txt` | Python runtime version — dead |
| `backend/.coveragerc` | Coverage config — dead |
| `backend/.env.example` | Python env example — dead |
| `backend/.gitignore` | Python gitignore — dead |
| `backend/Dockerfile` | Python Docker — dead |
| `backend/railway.json` | Railway deploy for Python — dead |

### 2. Root-level Python/deploy files (5 files)

| File | Reason |
|------|--------|
| `api/index.py` | Vercel serverless entry for Python backend — dead |
| `requirements.txt` | Root Python requirements — dead |
| `Dockerfile` | Root Docker for Python — dead |
| `railway.json` | Railway config for Python — dead |
| `.railwayignore` | Railway ignore — dead |

### 3. Supabase Edge Function (1 file)

| File | Reason |
|------|--------|
| `supabase/functions/chat/index.ts` | Mock Edge Function — frontend doesn't call it; crisis detection is better done in the prompt |

### 4. Dead frontend components (5 files)

| File | Reason |
|------|--------|
| `frontend/src/components/therapy/EmotionRecorder.tsx` | 119 lines — localStorage-only emoji tracker; not core to "safe space to talk" |
| `frontend/src/components/therapy/ANTsMarker.tsx` | 142 lines — localStorage-only CBT tagging; not core; bloats sidebar |
| `frontend/src/components/therapy/CognitiveTriadForm.tsx` | 121 lines — CBT form; the AI can guide this through conversation |
| `frontend/src/components/therapy/DesensitizePanel.tsx` | 237 lines — SUD slider panel; the AI can guide this through conversation |
| `frontend/src/components/therapy/TherapyModeSelector.tsx` | 114 lines — replace with simpler inline tabs |

### 5. Dead frontend libs (2 files)

| File | Reason |
|------|--------|
| `frontend/src/lib/api.ts` | 110 lines — axios-based API client; `ChatInterface.tsx` already uses raw `fetch()` for streaming. The non-streaming functions (`sendMessage`, `chat`) are dead code. Replace with thin fetch wrappers. |
| `frontend/src/lib/prompts.ts` | 103 lines — keep content, but inline into the single API route that uses it |

### 6. Planning/doc files (5 files)

| File | Reason |
|------|--------|
| `FIX-PLAN.md` | Bug fix plan — execution artifact |
| `REFACTORING_PLAN.md` | Refactoring plan — superseded by this plan |
| `REFERENCE.md` | 1,074 lines of reference code snippets — not product code |
| `CLAUDE.md` | Agent workflow — references dead Python commands |
| `.kiro/specs/mvp-chat-system/design.md` | Spec artifact |
| `.kiro/specs/mvp-chat-system/requirements.md` | Spec artifact |

### 7. Dead scripts (4 files)

| File | Reason |
|------|--------|
| `scripts/generate_test_report.py` | Report generator for dead Python tests |
| `scripts/task_manager.py` | 685 lines — task management utility, not product code |
| `scripts/run_tests.bat` | Python test runner |
| `scripts/run_tests.sh` | Python test runner |
| `scripts/run_frontend_tests.bat` | Frontend test runner (no tests exist) |
| `scripts/run_frontend_tests.sh` | Frontend test runner (no tests exist) |

### 8. Dead Supabase migration (1 file)

| File | Reason |
|------|--------|
| `supabase/migrations/001_create_chat_tables.sql` | Old schema — uses `conversations`/`chat_messages` tables that don't match current code. Keep only `002`. |

### 9. Dead frontend config (1 file)

| File | Reason |
|------|--------|
| `frontend/README.md` | Default Next.js readme |

---

## Files to MODIFY (9 files)

### 1. `frontend/package.json`
- Remove `axios` dependency (use native `fetch`)
- Remove `dayjs` dependency (use native `Intl.RelativeTimeFormat`)
- Remove `@supabase/supabase-js` from deps (keep only if used in server routes — check)
- Result: 4 deps instead of 7

### 2. `frontend/src/store/index.ts`
- Remove `isLoading` / `setLoading` (unused — `ChatInterface.tsx` has its own `loading` state)
- Remove `_persist` field
- Clean up interface

### 3. `frontend/src/components/ChatInterface.tsx`
- Remove imports: `TherapyModeSelector`, `CognitiveTriadForm`, `DesensitizePanel`
- Remove state: `showTriadForm`, `showDesensitizePanel`
- Remove therapy panel JSX blocks
- Replace `TherapyModeSelector` with simple inline tab bar (3 buttons)
- Simplify therapy action buttons section
- Keep: streaming logic, session management, sidebar integration
- Target: ~200 lines (down from 296)

### 4. `frontend/src/components/sidebar/Sidebar.tsx`
- Remove imports: `EmotionRecorder`, `ANTsList`
- Remove `<EmotionRecorder />` and `<ANTsList />` from render
- Target: ~100 lines (down from 139)

### 5. `frontend/src/components/chat/MessageBubble.tsx`
- Remove import: `ANTsMarker`
- Remove `stripInternalTags` function (backend won't send therapy records)
- Remove `<ANTsMarker>` from render
- Replace `dayjs` with native `Date` formatting
- Target: ~30 lines (down from 53)

### 6. `frontend/src/components/sidebar/SessionItem.tsx`
- Replace `dayjs` with native `Intl.RelativeTimeFormat`
- Target: ~45 lines (down from 66)

### 7. `.github/workflows/ci.yml`
- Replace Python lint/test with Next.js lint/build
- Target: ~20 lines

### 8. `vercel.json`
- Keep as-is (already correct for Next.js)

### 9. `frontend/src/app/globals.css`
- Remove `.mode-dropdown` CSS (if TherapyModeSelector is simplified)
- Keep everything else

---

## Files to CREATE (2 files)

### 1. `frontend/src/app/api/v1/therapy/modes/route.ts`
Already exists — verify it returns the correct modes. If not, update to return:
```json
[
  { "id": "general", "name": "自由对话", "description": "..." },
  { "id": "cbt", "name": "CBT认知疗法", "description": "..." },
  { "id": "desensitize", "name": "系统脱敏", "description": "..." }
]
```

### 2. `frontend/src/lib/safety.ts`
Crisis keyword detection — extracted from the deleted Edge Function. Used by the stream route to intercept dangerous messages before sending to LLM.
```typescript
export function detectCrisis(message: string): {
  isCrisis: boolean;
  level: string;
  response: string;
} | null
```
~50 lines.

---

## Files to KEEP (as-is)

| File | Reason |
|------|--------|
| `.gitignore` | Correct |
| `README.md` | Keep, update content |
| `FIRST-PRINCIPLES-RECONSTRUCTION.md` | Reference doc |
| `frontend/src/app/layout.tsx` | Correct |
| `frontend/src/app/page.tsx` | Correct |
| `frontend/src/app/globals.css` | Correct (minor cleanup) |
| `frontend/src/app/api/health/route.ts` | Health check |
| `frontend/src/app/api/v1/auth/*` (5 files) | Auth routes — working |
| `frontend/src/app/api/v1/chat/sessions/route.ts` | Session CRUD — working |
| `frontend/src/app/api/v1/chat/sessions/[id]/route.ts` | Session delete |
| `frontend/src/app/api/v1/chat/sessions/[id]/messages/route.ts` | Non-stream messages |
| `frontend/src/app/api/v1/chat/sessions/[id]/messages/stream/route.ts` | Stream chat — core P0 |
| `frontend/src/app/api/v1/chat/sessions/[id]/history/route.ts` | History |
| `frontend/src/lib/supabase.ts` | Supabase client |
| `frontend/tsconfig.json` | TS config |
| `frontend/postcss.config.mjs` | PostCSS config |
| `frontend/eslint.config.mjs` | ESLint config |
| `frontend/next.config.ts` | Next.js config |
| `frontend/public/` | Static assets |
| `supabase/config.toml` | Supabase config |
| `supabase/migrations/002_create_keyi_tables.sql` | Correct schema |
| `docs/功能清单.md` | Feature list |
| `docs/MVP简化后端配置指南.md` | Config guide |
| `docs/supabase_schema.sql` | Schema reference |

---

## Execution Order

```
Phase 1: DELETE (remove dead code)
  Step 1.1: Delete entire backend/ directory
  Step 1.2: Delete api/, requirements.txt, Dockerfile, railway.json, .railwayignore
  Step 1.3: Delete supabase/functions/
  Step 1.4: Delete scripts/
  Step 1.5: Delete dead frontend components (5 therapy files)
  Step 1.6: Delete frontend/src/lib/api.ts
  Step 1.7: Delete planning docs (FIX-PLAN.md, REFACTORING_PLAN.md, REFERENCE.md, CLAUDE.md, .kiro/)
  Step 1.8: Delete supabase/migrations/001_create_chat_tables.sql

Phase 2: CREATE (add safety module)
  Step 2.1: Create frontend/src/lib/safety.ts (crisis detection)

Phase 3: MODIFY (simplify remaining code)
  Step 3.1: Update frontend/package.json (remove axios, dayjs)
  Step 3.2: Simplify frontend/src/store/index.ts
  Step 3.3: Rewrite frontend/src/components/ChatInterface.tsx
  Step 3.4: Simplify frontend/src/components/sidebar/Sidebar.tsx
  Step 3.5: Simplify frontend/src/components/chat/MessageBubble.tsx
  Step 3.6: Simplify frontend/src/components/sidebar/SessionItem.tsx
  Step 3.7: Integrate crisis detection into stream route
  Step 3.8: Update .github/workflows/ci.yml
  Step 3.9: Update README.md

Phase 4: VERIFY
  Step 4.1: npm install (verify clean deps)
  Step 4.2: npm run build (verify build passes)
  Step 4.3: npm run lint (verify no lint errors)
```

---

## Expected Final State

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total files | ~70+ | ~30 | **-57%** |
| Total lines | ~5,000+ | ~2,000 | **-60%** |
| Backends | 2 | 1 | **-50%** |
| npm dependencies | 7 | 4 | **-43%** |
| Python files | 18 | 0 | **-100%** |
| Therapy components | 5 | 0 (prompt-driven) | **-100%** |
| Prompt definitions | 3 copies | 1 (inline in stream route) | **-67%** |

### Final file tree (30 files):

```
keyi/
├── .git/
├── .gitignore
├── .github/workflows/ci.yml
├── FIRST-PRINCIPLES-RECONSTRUCTION.md
├── README.md
├── RECONSTRUCTION-PLAN.md
├── vercel.json
├── docs/
│   ├── 功能清单.md
│   ├── MVP简化后端配置指南.md
│   └── supabase_schema.sql
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 002_create_keyi_tables.sql
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    ├── .gitignore
    ├── vercel.json
    ├── public/
    └── src/
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx
        │   └── api/
        │       ├── health/route.ts
        │       └── v1/
        │           ├── auth/
        │           │   ├── login/route.ts
        │           │   ├── register/route.ts
        │           │   ├── logout/route.ts
        │           │   ├── me/route.ts
        │           │   └── refresh/route.ts
        │           ├── chat/
        │           │   ├── sessions/route.ts
        │           │   └── sessions/[id]/
        │           │       ├── route.ts
        │           │       ├── messages/route.ts
        │           │       ├── messages/stream/route.ts
        │           │       └── history/route.ts
        │           └── therapy/modes/route.ts
        ├── components/
        │   ├── AuthForm.tsx
        │   ├── ChatInterface.tsx
        │   ├── chat/
        │   │   ├── ChatInput.tsx
        │   │   ├── MessageBubble.tsx
        │   │   └── MessageList.tsx
        │   └── sidebar/
        │       ├── Sidebar.tsx
        │       └── SessionItem.tsx
        ├── lib/
        │   ├── safety.ts          ← NEW
        │   └── supabase.ts
        └── store/
            └── index.ts
```

---

## Musk's Razor Applied

> "If you're not adding things back in, you haven't deleted enough."

**What we deleted that might seem scary:**
- The entire Python backend → **Frontend already has working Next.js API routes that do the same thing**
- Therapy service classes → **Prompt switching achieves the same result with zero code**
- EmotionRecorder / ANTsMarker → **localStorage-only features that don't persist to DB; the AI can handle CBT tracking through conversation**
- axios → **Native fetch does everything we need**
- dayjs → **15 lines of native code replaces a 4KB dependency**

**What we kept that's non-obvious:**
- Supabase (auth + DB) → **Real persistence, real auth, RLS security**
- Zustand → **Lightweight, no boilerplate, works with SSR**
- The 3 therapy prompts → **The actual product differentiation lives here**
