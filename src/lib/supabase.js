import { createClient } from '@supabase/supabase-js'
import { localClient } from './localClient'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Without Supabase keys (e.g. the GitHub Pages build) the app runs in local mode:
// calendars and images are stored in this browser only.
export const isLocalMode = !(url && anonKey)

export const supabase = isLocalMode ? localClient : createClient(url, anonKey)
