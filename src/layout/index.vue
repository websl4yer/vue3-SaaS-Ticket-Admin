<template>
  <el-container class="layout-container">
    <!-- 左侧边栏 -->
    <el-aside width="200px" class="aside">
        <div class="logo">SaaS 运营平台</div>
        <el-menu
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
            <el-menu-item
            v-for="item in filteredMenuList"
            :key="item.path"
            :index="item.path"
            @mouseenter="onMenuItemMouseEnter(item.path)"
            @mouseleave="onMenuItemMouseLeave"
            >
            <span>{{ item.name}}</span>
            </el-menu-item>
        </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部 Header -->
      <el-header class="header">
        <div class="header-left">欢迎回来！</div>
        <div class="header-right">
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <!-- 主体内容区 -->
      <el-main class="main">
        <!-- 核心：子路由的出口 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ref } from 'vue'
import { computed } from 'vue'

const router = useRouter()
const userStore = useUserStore()

// --- 路由预加载逻辑 ---
const prefetchedRoutes = new Set<string>()
let prefetchTimer: number | null = null

const doPrefetch = (path: string) => {
  if (prefetchedRoutes.has(path)) {
    return
  }
  const route = router.getRoutes().find(r => r.path === path)

  if (route && route.components && typeof route.components.default === 'function') {
    try {
      // 我们大胆地尝试调用它。
      // 如果它是一个懒加载函数，它会正常执行并返回一个 Promise。
      // 如果它是一个类组件构造函数，直接调用会抛出一个 TypeError，会被 catch 捕获。
      // @ts-expect-error TS2349: 我们知道此表达式可能不可调用，但 catch 块会处理该情况。
      route.components.default()

      // 标记为已预加载（只有在上面的调用没有抛出错误时才会执行）
      prefetchedRoutes.add(path)
    } catch (e) {
      // 静默地忽略错误。这很可能意味着我们尝试调用了一个组件构造函数，
      // 这不是我们想要预加载的目标，所以忽略是正确的行为。
    }
  }
}

// 鼠标进入菜单项，延迟 200ms 后触发预加载
const onMenuItemMouseEnter = (path: string) => {
  if (prefetchTimer) clearTimeout(prefetchTimer)
  prefetchTimer = window.setTimeout(() => {
    doPrefetch(path)
  }, 200)
}

// 鼠标离开菜单项，清除定时器
const onMenuItemMouseLeave = () => {
  if (prefetchTimer) {
    clearTimeout(prefetchTimer)
    prefetchTimer = null
  }
}
// --- 路由预加载逻辑结束 ---


const handleLogout = () => {
  userStore.logout() 
  router.push('/login')
}

const menuList = ref([
  {
    name: '运营大屏',
    path: '/dashboard',
    icon: 'DataAnalysis', // 顺便预留一个图标位，以后美化用
    roles:['admin','tenant']
  },
  {
    name: '服务号管理',
    path: '/tenants',
    icon: 'OfficeBuilding',
    roles:['admin']    
  },
  {
    name: '分类配置',
    path: '/categories',
    icon: 'Memo',
    roles:['admin']
  },
  {
    name: '全局求助监控',
    path: '/requests',
    icon: 'Monitor',
    roles:['admin','tenant']
  }
])

const filteredMenuList = computed(() => {
    const currentRole = userStore.role
    if(!currentRole) return[]
    return menuList.value.filter((item)=>{
        return item.roles.includes(currentRole)
    })
})

</script>

<style scoped>
/* 简单的全屏布局样式 */
.layout-container {
  height: 100vh;
  width: 100vw;
}
.aside {
  background-color: #304156;
  color: white;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>