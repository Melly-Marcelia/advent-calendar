import { createRouter, createWebHashHistory } from 'vue-router'
import DemoView from '../views/DemoView.vue'

// Without Supabase keys (e.g. the GitHub Pages demo build) only the demo is available.
export const hasBackend = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

const backendRoutes = [
  { path: '/', name: 'create', component: () => import('../views/CreateView.vue') },
  { path: '/e/:editToken', name: 'edit', component: () => import('../views/EditView.vue'), props: true },
  { path: '/s/:shareToken', name: 'share', component: () => import('../views/ShareView.vue'), props: true },
]

// Hash history so deep links (/#/s/...) work on static hosts like GitHub Pages.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/demo', name: 'demo', component: DemoView },
    ...(hasBackend ? backendRoutes : [{ path: '/:pathMatch(.*)*', redirect: { name: 'demo' } }]),
  ],
})
