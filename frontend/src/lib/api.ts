import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message)
  }
}

export function ok<T>(data: T, aliases: Record<string, unknown> = {}): NextResponse {
  const legacy = data && typeof data === 'object' && !Array.isArray(data)
    ? data as Record<string, unknown>
    : {}
  return NextResponse.json({ success: true, data, error: null, ...legacy, ...aliases })
}

export function fail(error: unknown, fallback = '服务器内部错误'): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      data: null,
      error: error.message,
      error_detail: { code: error.code, message: error.message },
    }, { status: error.status })
  }
  console.error(fallback, error)
  return NextResponse.json({ success: false, data: null, error: fallback }, { status: 500 })
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json()
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
    return value as Record<string, unknown>
  } catch {
    throw new ApiError(400, 'invalid_json', '请求体不是有效的 JSON 对象')
  }
}

export function textField(value: unknown, name: string, maxLength = 8000): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'validation_error', `请提供${name}`)
  }
  const text = value.trim()
  if (text.length > maxLength) throw new ApiError(400, 'validation_error', `${name}过长`)
  return text
}
