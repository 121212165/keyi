import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (_client) return _client
  _client = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_KEY ?? '',
  )
  return _client
}

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin
  _admin = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? '',
  )
  return _admin
}
