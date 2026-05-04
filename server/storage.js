import { createClient } from '@supabase/supabase-js'

/** Avatar & documents persist on Supabase Storage when these env vars are set (required on Vercel). */
export function useRemoteFiles() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_STORAGE_BUCKET,
  )
}

function bucket() {
  return process.env.SUPABASE_STORAGE_BUCKET
}

export function getSupabaseAdmin() {
  if (!useRemoteFiles()) return null
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

export async function remotePut(key, data, contentType) {
  const sb = getSupabaseAdmin()
  const { error } = await sb.storage.from(bucket()).upload(key, data, {
    contentType: contentType || 'application/octet-stream',
    upsert: true,
  })
  if (error) throw error
}

export async function remoteRemove(key) {
  const sb = getSupabaseAdmin()
  if (!sb || !key) return
  await sb.storage.from(bucket()).remove([key])
}

export async function remoteDownloadBuffer(key) {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.storage.from(bucket()).download(key)
  if (error) throw error
  return Buffer.from(await data.arrayBuffer())
}
