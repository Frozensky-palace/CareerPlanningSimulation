import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/views/GuidePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/initial-setup',
    name: 'InitialSetup',
    component: () => import('@/views/InitialSetup.vue'),
    meta: { requiresAuth: true }
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
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('adminToken')

  // 管理员页面认证
  if (to.meta.requiresAdmin) {
    if (!adminToken) {
      next('/admin')
    } else {
      next()
    }
  }
  // 普通用户页面认证
  else if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
