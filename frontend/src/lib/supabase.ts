import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

function env(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]
    if (value) return value
  }
  throw new Error(`Missing environment variable: ${names.join(' or ')}`)
}

const url = () => env('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL')
const anonKey = () => env('SUPABASE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

export function supabase(): SupabaseClient {
  if (_client) return _client
  _client = createClient(url(), anonKey(), { auth: { persistSession: false } })
  return _client
}

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin
  _admin = createClient(url(), env('SUPABASE_SERVICE_KEY'), { auth: { persistSession: false } })
  return _admin
}

export function supabaseForToken(token: string): SupabaseClient {
  return createClient(url(), anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
