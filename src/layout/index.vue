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
            :index="item.path">
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