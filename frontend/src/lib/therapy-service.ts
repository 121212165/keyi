import type { SupabaseClient } from '@supabase/supabase-js'
import { ApiError } from '@/lib/api'
import { dbError } from '@/lib/db-errors'

const MAIN_STEPS = [
  { position: 0, title: '识别当前困扰', metadata: { stage: 'cbt_assessment', kind: 'cbt' } },
  { position: 10, title: '识别自动化想法', metadata: { stage: 'cbt_formulation', kind: 'cbt' } },
  { position: 20, title: '练习替代视角与行动', metadata: { stage: 'cbt_action', kind: 'cbt' } },
]

const EXPOSURE_STEPS = [
  { position: 100, title: '暴露准备与知情同意', metadata: { stage: 'exposure_preparation', kind: 'exposure' } },
  { position: 110, title: '建立 SUDS 暴露层级', metadata: { stage: 'hierarchy_building', kind: 'exposure' } },
  { position: 120, title: '渐进暴露练习', metadata: { stage: 'exposure_practice', kind: 'exposure' } },
  { position: 130, title: '暴露复盘', metadata: { stage: 'exposure_review', kind: 'exposure' } },
]

type JsonMap = Record<string, unknown>

function metadata(value: unknown): JsonMap {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonMap : {}
}

export async function findCurrentPlan(db: SupabaseClient, userId: string) {
  const { data, error } = await db.from('therapy_plans').select('*').eq('user_id', userId)
    .in('status', ['active', 'paused']).order('updated_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw dbError(error, '获取治疗计划失败')
  return data
}

export async function ensureCurrentPlan(db: SupabaseClient, userId: string, tolerateMissing = false) {
  try {
    const existing = await findCurrentPlan(db, userId)
    if (existing) return existing
    const now = new Date().toISOString()
    const { data: plan, error } = await db.from('therapy_plans').insert({
      user_id: userId,
      title: 'CBT 主线计划',
      status: 'active',
      therapy_mode: 'cbt',
      started_at: now,
      metadata: { plan_type: 'mainline', primary_method: 'cbt', active_stage: 'cbt_core', exposure_status: 'inactive' },
    }).select('*').single()
    if (error) throw dbError(error, '创建治疗计划失败')
    const { error: stepError } = await db.from('therapy_plan_steps').insert(MAIN_STEPS.map((step, index) => ({
      ...step, plan_id: plan.id, user_id: userId, status: index === 0 ? 'in_progress' : 'pending',
    })))
    if (stepError) throw dbError(stepError, '创建治疗计划步骤失败')
    return plan
  } catch (error) {
    if (tolerateMissing && error instanceof ApiError && error.code === 'database_migration_required') return null
    throw error
  }
}

export async function getPlanView(db: SupabaseClient, userId: string) {
  const plan = await ensureCurrentPlan(db, userId)
  const { data: steps, error } = await db.from('therapy_plan_steps').select('*').eq('plan_id', plan.id)
    .eq('user_id', userId).order('position', { ascending: true })
  if (error) throw dbError(error, '获取治疗步骤失败')
  return { plan: { ...plan, active_stage: metadata(plan.metadata).active_stage ?? 'cbt_core' }, steps: steps ?? [] }
}

export async function transitionPlan(db: SupabaseClient, userId: string, input: JsonMap) {
  const action = typeof input.action === 'string' ? input.action : ''
  const plan = await ensureCurrentPlan(db, userId)
  const planMetadata = metadata(plan.metadata)
  const now = new Date().toISOString()

  if (action === 'start_exposure') {
    const { data: existing, error: readError } = await db.from('therapy_plan_steps').select('position')
      .eq('plan_id', plan.id).gte('position', 100).limit(1)
    if (readError) throw dbError(readError, '读取暴露步骤失败')
    if (!existing?.length) {
      const { error } = await db.from('therapy_plan_steps').insert(EXPOSURE_STEPS.map((step, index) => ({
        ...step, plan_id: plan.id, user_id: userId, status: index === 0 ? 'in_progress' : 'pending',
      })))
      if (error) throw dbError(error, '创建暴露训练步骤失败')
    }
    planMetadata.active_stage = 'exposure_preparation'
    planMetadata.exposure_status = 'active'
  } else if (action === 'pause_exposure') {
    planMetadata.active_stage = 'cbt_core'
    planMetadata.exposure_status = 'paused'
  } else if (action === 'complete_exposure') {
    planMetadata.active_stage = 'cbt_core'
    planMetadata.exposure_status = 'completed'
  } else if (action === 'complete_step') {
    const stepId = typeof input.step_id === 'string' ? input.step_id : ''
    if (!stepId) throw new ApiError(400, 'validation_error', '缺少 step_id')
    const { data: step, error } = await db.from('therapy_plan_steps').select('*').eq('id', stepId)
      .eq('plan_id', plan.id).eq('user_id', userId).maybeSingle()
    if (error) throw dbError(error, '读取治疗步骤失败')
    if (!step) throw new ApiError(404, 'step_not_found', '治疗步骤不存在')
    const { error: updateError } = await db.from('therapy_plan_steps').update({ status: 'completed', completed_at: now })
      .eq('id', stepId).eq('user_id', userId)
    if (updateError) throw dbError(updateError, '更新治疗步骤失败')
    const { data: next } = await db.from('therapy_plan_steps').select('*').eq('plan_id', plan.id)
      .eq('user_id', userId).gt('position', step.position).neq('status', 'completed').order('position').limit(1).maybeSingle()
    if (next) {
      await db.from('therapy_plan_steps').update({ status: 'in_progress' }).eq('id', next.id).eq('user_id', userId)
      planMetadata.active_stage = metadata(next.metadata).stage ?? 'cbt_core'
    }
  } else {
    throw new ApiError(400, 'invalid_transition', '不支持的计划转换动作')
  }

  const transitions = Array.isArray(planMetadata.transitions) ? planMetadata.transitions.slice(-19) : []
  planMetadata.transitions = [...transitions, { action, at: now }]
  const { error } = await db.from('therapy_plans').update({ metadata: planMetadata, updated_at: now })
    .eq('id', plan.id).eq('user_id', userId)
  if (error) throw dbError(error, '更新治疗计划失败')
  return getPlanView(db, userId)
}

export async function safePlanStage(db: SupabaseClient, userId: string): Promise<string> {
  try {
    const plan = await findCurrentPlan(db, userId)
    return String(metadata(plan?.metadata).active_stage ?? 'cbt_core')
  } catch (error) {
    if (error instanceof ApiError && error.code === 'database_migration_required') return 'cbt_core'
    throw error
  }
}
