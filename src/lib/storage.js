import { supabase } from './supabase'

const BUCKET = 'calendar-assets'

// Path shape enforced by the storage RLS policy: {calendar_id}/{edit_token}/filename
function pathFor(calendarId, editToken, filename) {
  return `${calendarId}/${editToken}/${filename}`
}

export async function uploadCalendarAsset(calendarId, editToken, file, filename) {
  const path = pathFor(calendarId, editToken, filename)
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw error
  return path
}

export function publicAssetUrl(path) {
  if (!path) return null
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function removeCalendarAsset(path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

// Recursively lists every file under a folder — Storage's .list() only
// returns one level at a time, and our layout nests gifts/ and theme/
// subfolders under {calendar_id}/{edit_token}/.
async function listFilesRecursive(prefix) {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (error || !data) return []

  const files = []
  for (const entry of data) {
    const entryPath = `${prefix}/${entry.name}`
    if (entry.id) {
      files.push(entryPath) // has an id => it's a real file, not a folder placeholder
    } else {
      files.push(...(await listFilesRecursive(entryPath)))
    }
  }
  return files
}

export async function removeCalendarFolder(calendarId, editToken) {
  const prefix = `${calendarId}/${editToken}`
  const files = await listFilesRecursive(prefix)
  if (files.length === 0) return
  await supabase.storage.from(BUCKET).remove(files)
}
