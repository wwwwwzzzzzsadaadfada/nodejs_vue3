import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/info',
    meta: { title: '用户信息管理' },
    children: [
      {
        path: 'info',
        name: 'UserInfo',
        component: () => import('@/views/user/info.vue'),
        meta: { title: '信息管理' }
      },
      {
        path: 'password',
        name: 'UserPassword',
        component: () => import('@/views/user/password.vue'),
        meta: { title: '修改密码' }
      }
    ]
  }
  // ... 其他路由配置
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router 