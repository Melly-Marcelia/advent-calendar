import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { isLocalMode } from './lib/supabase'
import { initLocalClient } from './lib/localClient'

// In local mode, load saved images from IndexedDB before anything renders them.
const ready = isLocalMode ? initLocalClient() : Promise.resolve()

ready.then(() => createApp(App).use(router).mount('#app'))
