import { ApiError } from '@/lib/api'

interface DbError { code?: string; message?: string }

export function isSchemaMissing(error: DbError | null | undefined): boolean {
  return Boolean(error && ['42P01', '42703', 'PGRST200', 'PGRST204', 'PGRST205'].includes(error.code ?? ''))
}

export function dbError(error: DbError, message: string): ApiError {
  if (isSchemaMissing(error)) return new ApiError(503, 'database_migration_required', '数据库迁移尚未完成')
  console.error(message, error)
  return new ApiError(500, 'database_error', message)
}
