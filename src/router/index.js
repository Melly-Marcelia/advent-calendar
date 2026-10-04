import { createRouter, createWebHistory } from 'vue-router'
import CreateView from '../views/CreateView.vue'
import EditView from '../views/EditView.vue'
import ShareView from '../views/ShareView.vue'
import DemoView from '../views/DemoView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'create', component: CreateView },
    { path: '/demo', name: 'demo', component: DemoView },
    { path: '/e/:editToken', name: 'edit', component: EditView, props: true },
    { path: '/s/:shareToken', name: 'share', component: ShareView, props: true },
  ],
})
