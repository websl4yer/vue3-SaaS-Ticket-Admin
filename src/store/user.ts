// 引入 Pinia 的定义函数
import { defineStore } from 'pinia'
// 引入 Vue 的 ref，用于定义响应式数据
import { ref } from 'vue'

import { loginApi } from '@/api/user'

// 定义一个名为 'user' 的 Store
// export const useUserStore 是命名规范：use + Store名 + Store
export const useUserStore = defineStore('user', () => {
  
  // ==========================
  // 1. State (状态/数据)
  // ==========================
  
  // token: 登录凭证，默认是空字符串
  const token = ref(localStorage.getItem('user_token') || '') 
  // role: 用户角色 (admin 或 tenant)，用于后续权限控制
  const role = ref(localStorage.getItem('user_role') || '')
  // username: 用户名，用于在界面右上角展示
  const username = ref(localStorage.getItem('user_name') || '')

  // ==========================
  // 2. Actions (动作/方法)
  // ==========================

  // 模拟登录接口 (接收表单数据)
  // async 代表这是一个异步函数，内部可以使用 await
  const login = async (loginForm: { username: string; password: string }) => {
    try{
      const res: any = await loginApi(loginForm)

      if (res.code === 200) {
          token.value = res.data.token
          role.value = res.data.role
          username.value = loginForm.username
 
          // 3. 数据持久化到 localStorage
          localStorage.setItem('user_token', token.value)
          localStorage.setItem('user_role', role.value)
          localStorage.setItem('user_name', username.value)
          
          return true // 告诉外部登录成功
        }
      } 
    catch (error: any) {
      // 如果 API 内部 reject 了 (比如密码错误)，会抛到这里的 catch
      // 我们选择继续把错误抛出，让调用的 Vue 组件去处理弹窗
       throw error 
    }
  }

  // logout 登出方法 (预留)
    const logout = () => {
    token.value = ''
    role.value = ''
    username.value = ''
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_name')
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