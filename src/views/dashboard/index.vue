<template>
  <div style="padding: 20px;">
    <h1>控制台 (Dashboard)</h1>
    <p>欢迎回来，{{ userStore.username }}！你的角色是：{{ userStore.role }}</p>
    <el-button type="danger" @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout() // 清空 Pinia 数据
  router.push('/login') // 跳回登录页
}
</script>