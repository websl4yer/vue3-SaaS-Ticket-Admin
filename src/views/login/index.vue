<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>SaaS 工单运营平台</span>
        </div>
      </template>

      <!-- 绑定 rules 用于表单验证（后续可加），这里先只用 model -->
      <el-form :model="loginForm" label-width="60px">
        <el-form-item label="账号">
          <el-input 
            v-model="loginForm.username" 
            placeholder="admin / tenant" 
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码">
          <!-- @keyup.enter="handleLogin" 意思是：在密码框按回车键也能触发登录 -->
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="任意密码" 
            show-password
            prefix-icon="Lock"
            @keyup.enter="handleLogin" 
          />
        </el-form-item>

        <el-form-item>
          <!-- :loading="loading"：如果 loading 为 true，按钮会转圈且不可点 -->
          <el-button 
            type="primary" 
            class="login-btn" 
            :loading="loading" 
            @click="handleLogin"
          >
            立即登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
// 1. 引入路由钩子，用于跳转页面
import { useRouter } from 'vue-router'
// 2. 引入我们刚才写的 Store
import { useUserStore } from '@/store/user'
// 3. 引入 Element Plus 的消息提示组件
import { ElMessage } from 'element-plus'
// 引入图标（可选）
// import { User, Lock } from '@element-plus/icons-vue' 

// ============================
// 初始化核心实例
// ============================
const router = useRouter()      // 获取路由遥控器
const userStore = useUserStore() // 获取用户仓库实例

// ============================
// 定义响应式数据
// ============================
// 定义 loading 状态，默认 false (不转圈)
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: 'admin',
  password: ''
})

// ============================
// 业务逻辑方法
// ============================
// 注意：因为内部有 await，所以函数必须标记为 async
const handleLogin = async () => {
  // 1. 开始转圈圈
  if(loginForm.password === '' || loginForm.username === ''){
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    // 2. 调用 Store 里的登录动作
    // await 意思是：等 userStore.login 这个异步函数跑完，拿到结果再往下走
    const success = await userStore.login(loginForm)

    // 3. 根据结果判断
    if (success) {
      // 成功提示 (绿色弹窗)
      ElMessage.success('登录成功，正在跳转...')
      
      // 4. 路由跳转：跳到首页 ('/')
      // 注意：如果 router/index.ts 还没配置 '/' 路由，这里可能会报错
      router.push('/')
    } else {
      // 失败提示 (红色弹窗)
      ElMessage.error('登录失败：账号只能是 admin 或 tenant')
    }
  } catch (error) {
    ElMessage.error('系统异常，请稍后重试')
  } finally {
    // 5. 无论成功失败，最后都要停止转圈圈
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}
.login-btn {
  width: 100%;
}
</style>