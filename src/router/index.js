import { createRouter, createWebHashHistory } from 'vue-router'
import DemoView from '../views/DemoView.vue'

// Hash history so deep links (/#/s/...) work on static hosts like GitHub Pages.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'create', component: () => import('../views/CreateView.vue') },
    { path: '/demo', name: 'demo', component: DemoView },
    { path: '/e/:editToken', name: 'edit', component: () => import('../views/EditView.vue'), props: true },
    { path: '/s/:shareToken', name: 'share', component: () => import('../views/ShareView.vue'), props: true },
    { path: '/:pathMatch(.*)*', redirect: { name: 'create' } },
  ],
})
