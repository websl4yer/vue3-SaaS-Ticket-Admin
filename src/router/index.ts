import { createRouter, createWebHistory } from 'vue-router'
// 注意：必须引入 store，但不能在最外层直接调用 useUserStore()
import { useUserStore } from '@/store/user'
import { compareTime } from 'element-plus/es/components/time-select/src/utils.mjs'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'

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
    name: 'Layout',
    component: () => import('@/layout/index.vue'), // 🌟 这里指向我们将要新建的 Layout 组件
    redirect: '/dashboard', // 访问 / 直接重定向到仪表盘
    children:[{
        path: 'dashboard', // 注意：子路由的 path 前面通常不加 /，它会自动拼接成 /dashboard
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/index.vue')
      },
      {
        path: 'requests',
        name: 'Requests',
        component: () => import('@/views/requests/index.vue')
      },
      {
        path: 'tenants',
        name: 'Tenants',
        component: () => import('@/views/tenants/index.vue')
      }]
  }
]

// 2. 创建路由器实例
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes
})

//路由守卫逻辑
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