// A browser-only stand-in for the Supabase client, used when no Supabase keys
// are configured (e.g. the GitHub Pages build). It implements just the slice
// of the client the app uses — rpc() and storage.from() — so every view works
// unchanged. Calendar rows live in localStorage; uploaded images live in
// IndexedDB and are served as object URLs. Everything stays on this device.

const DB_KEY = 'advent-calendar:local-db'
const IDB_NAME = 'advent-calendar'
const IDB_STORE = 'assets'

// path -> object URL, filled by initLocalClient() and kept in sync on upload/remove
// so getPublicUrl() can stay synchronous like the real client.
const urlCache = new Map()

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadDb() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) ?? { calendars: [] }
  } catch {
    return { calendars: [] }
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idb(mode, fn) {
  const db = await openIdb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, mode)
    const result = fn(tx.objectStore(IDB_STORE))
    tx.oncomplete = () => resolve(result?.result ?? result)
    tx.onerror = () => reject(tx.error)
  })
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function notFound() {
  return { data: null, error: { message: 'not found' } }
}

// ---------------------------------------------------------------------------
// RPC functions — mirror supabase/migrations/*.sql
// ---------------------------------------------------------------------------

function publicView(c) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    year: c.year,
    unlock_mode: c.unlock_mode,
    frames: c.frames.map((f) => ({ ...f })),
  }
}

// SQL's coalesce(new, old): null/undefined means "leave unchanged".
const coalesce = (next, prev) => (next ?? prev)
// The real update_frame stores '' for removed images; normalise that to null.
const pathOrNull = (p) => (p === '' ? null : p)

const rpcs = {
  create_calendar() {
    const db = loadDb()
    const calendar = {
      id: crypto.randomUUID(),
      edit_token: randomToken(),
      share_token: randomToken(),
      title: 'Advent Calendar',
      subtitle: 'Open one door each day of December to reveal a little surprise',
      year: new Date().getFullYear(),
      // Try-it-out calendars start unlocked so every door can be previewed right away.
      unlock_mode: 'always',
      created_at: new Date().toISOString(),
      frames: Array.from({ length: 24 }, (_, i) => ({
        day: i + 1,
        message: '',
        gift_image_path: null,
        gift_code_path: null,
        default_image_path: null,
        hover_image_path: null,
      })),
    }
    db.calendars.push(calendar)
    saveDb(db)
    return {
      data: [{ calendar_id: calendar.id, edit_token: calendar.edit_token, share_token: calendar.share_token }],
      error: null,
    }
  },

  get_calendar_by_share_token({ p_token }) {
    const c = loadDb().calendars.find((c) => c.share_token === p_token)
    return c ? { data: publicView(c), error: null } : notFound()
  },

  get_calendar_by_edit_token({ p_token }) {
    const c = loadDb().calendars.find((c) => c.edit_token === p_token)
    if (!c) return notFound()
    return { data: { ...publicView(c), edit_token: c.edit_token, share_token: c.share_token }, error: null }
  },

  update_calendar_settings({ p_edit_token, p_title, p_subtitle, p_unlock_mode }) {
    const db = loadDb()
    const c = db.calendars.find((c) => c.edit_token === p_edit_token)
    if (!c) return notFound()
    c.title = coalesce(p_title, c.title)
    c.subtitle = coalesce(p_subtitle, c.subtitle)
    c.unlock_mode = coalesce(p_unlock_mode, c.unlock_mode)
    saveDb(db)
    return { data: null, error: null }
  },

  update_frame(args) {
    const db = loadDb()
    const c = db.calendars.find((c) => c.edit_token === args.p_edit_token)
    if (!c) return notFound()
    const f = c.frames.find((f) => f.day === args.p_day)
    if (f) {
      f.message = coalesce(args.p_message, f.message)
      f.gift_image_path = pathOrNull(coalesce(args.p_gift_image_path, f.gift_image_path))
      f.gift_code_path = pathOrNull(coalesce(args.p_gift_code_path, f.gift_code_path))
      f.default_image_path = pathOrNull(coalesce(args.p_default_image_path, f.default_image_path))
      f.hover_image_path = pathOrNull(coalesce(args.p_hover_image_path, f.hover_image_path))
      saveDb(db)
    }
    return { data: null, error: null }
  },

  delete_calendar({ p_edit_token }) {
    const db = loadDb()
    const before = db.calendars.length
    db.calendars = db.calendars.filter((c) => c.edit_token !== p_edit_token)
    if (db.calendars.length === before) return notFound()
    saveDb(db)
    return { data: null, error: null }
  },
}

async function rpc(name, args = {}) {
  const fn = rpcs[name]
  if (!fn) return { data: null, error: { message: `unknown rpc ${name}` } }
  try {
    return fn(args)
  } catch (error) {
    // Most likely localStorage is full or blocked (private browsing).
    return { data: null, error }
  }
}

// ---------------------------------------------------------------------------
// Storage — single bucket, keyed by path
// ---------------------------------------------------------------------------

function setCachedUrl(path, blob) {
  const old = urlCache.get(path)
  if (old) URL.revokeObjectURL(old)
  urlCache.set(path, URL.createObjectURL(blob))
}

function dropCachedUrl(path) {
  const old = urlCache.get(path)
  if (old) URL.revokeObjectURL(old)
  urlCache.delete(path)
}

const bucket = {
  async upload(path, file) {
    try {
      await idb('readwrite', (store) => store.put(file, path))
      setCachedUrl(path, file)
      return { data: { path }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  getPublicUrl(path) {
    return { data: { publicUrl: urlCache.get(path) ?? null } }
  },

  async remove(paths) {
    try {
      await idb('readwrite', (store) => paths.forEach((p) => store.delete(p)))
      paths.forEach(dropCachedUrl)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Lists one level under `prefix`, matching the real client's shape:
  // files carry an `id`, sub-folders don't.
  async list(prefix) {
    const entries = new Map()
    for (const path of urlCache.keys()) {
      if (!path.startsWith(`${prefix}/`)) continue
      const [name, ...rest] = path.slice(prefix.length + 1).split('/')
      entries.set(name, rest.length ? { name, id: null } : { name, id: path })
    }
    return { data: [...entries.values()], error: null }
  },
}

export const localClient = {
  rpc,
  storage: { from: () => bucket },
}

// Loads every stored image into object URLs before the app mounts.
export async function initLocalClient() {
  try {
    const db = await openIdb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (!cursor) return
        setCachedUrl(cursor.key, cursor.value)
        cursor.continue()
      }
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // IndexedDB unavailable (e.g. some private modes) — the app still works, just without saved images.
  }
}
