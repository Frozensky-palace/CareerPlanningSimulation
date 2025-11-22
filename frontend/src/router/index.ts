import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/initial-setup',
    name: 'InitialSetup',
    component: () => import('@/views/InitialSetup.vue')
  },
  {
    path: '/campus-map',
    name: 'CampusMap',
    component: () => import('@/views/CampusMap.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/script/:id',
    name: 'ScriptDetail',
    component: () => import('@/views/ScriptDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settlement',
    name: 'Settlement',
    component: () => import('@/views/SettlementPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workshop',
    name: 'Workshop',
    component: () => import('@/views/WorkshopEditor.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
