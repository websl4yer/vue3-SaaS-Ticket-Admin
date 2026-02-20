// 引入 Pinia 的定义函数
import { defineStore } from 'pinia'
// 引入 Vue 的 ref，用于定义响应式数据
import { ref } from 'vue'

// 定义一个名为 'user' 的 Store
// export const useUserStore 是命名规范：use + Store名 + Store
export const useUserStore = defineStore('user', () => {
  
  // ==========================
  // 1. State (状态/数据)
  // ==========================
  
  // token: 登录凭证，默认是空字符串
  const token = ref(localStorage.getItem('token') || '') 
  // role: 用户角色 (admin 或 tenant)，用于后续权限控制
  const role = ref(localStorage.getItem('role') || '')
  // username: 用户名，用于在界面右上角展示
  const username = ref(localStorage.getItem('username') || '')

  // ==========================
  // 2. Actions (动作/方法)
  // ==========================

  // 模拟登录接口 (接收表单数据)
  // async 代表这是一个异步函数，内部可以使用 await
  const login = async (loginForm: { username: string; password: string }) => {
    
    // 模拟网络延迟：创建 Promise，500毫秒后自动 resolve
    // 这里的 await 意思是：暂停代码执行，等 500ms 也就是 setTimeout 结束后再往下走
    await new Promise((resolve) => setTimeout(resolve, 250))

    // 模拟后端验证逻辑
    // 如果是 admin 账号
    if (loginForm.username === 'admin' && loginForm.password === '3768') {
      token.value = 'mock-token-admin-123'
      role.value = 'admin' 
      username.value = '超级管理员'
      localStorage.setItem('token', token.value)
      localStorage.setItem('role', role.value)
      localStorage.setItem('username', username.value)
      return true // 返回成功
    } 
    // 如果是 tenant (租户) 账号
    else if (loginForm.username === 'tenant' && loginForm.password === '3768') {
      token.value = 'mock-token-tenant-456'
      role.value = 'tenant'
      username.value = '租户经理'
      localStorage.setItem('token', token.value)
      localStorage.setItem('role', role.value)
      localStorage.setItem('username', username.value)
      return true // 返回成功
    } 
    // 否则登录失败
    else {
      return false // 返回失败
    }
  }

  // logout 登出方法 (预留)
  const logout = () => {
    token.value = ''
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  // ==========================
  // 3. Return (暴露出去给组件用)
  // ==========================
  // 必须把组件需要用到的状态和方法 return 出去
  return {
    token,
    role,
    username,
    login,
    logout
  }
})