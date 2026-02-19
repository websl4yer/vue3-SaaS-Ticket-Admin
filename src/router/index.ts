import { createRouter, createWebHistory } from 'vue-router'
// 注意：必须引入 store，但不能在最外层直接调用 useUserStore()
import { useUserStore } from '@/store/user'

// 1. 定义路由表
const routes = [
  {
    path: '/login',
    name: 'Login',
    // 路由懒加载：只有访问这个页面时才会加载组件，优化性能
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue')
  }
]

// 2. 创建路由器实例
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes
})

router.beforeEach((to,from,next) => {
  const userStore = useUserStore();
  const hasToken = !!userStore.token;
  if (hasToken) {
    // 1. 已登录
    if (to.path === '/login') {
      next('/') // 已登录就没必要去登录页了，强制去首页
    } else {
      next() // 其他页面放行
    }
  } else {
    // 2. 未登录
    if (to.path === '/login') {
      next() // 登录页本身就在白名单，放行
    } else {
      next('/login') // 没 token 想去其他地方？踢回登录页
    }
  }
})

export default router