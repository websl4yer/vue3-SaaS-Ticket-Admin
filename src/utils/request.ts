// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import router from '../router'

// 1. 创建 axios 实例
const service = axios.create({
  // import.meta.env.VITE_API_URL 是 Vite 获取环境变量的方式（这里假设配置了）
  baseURL: '/api', 
  timeout: 5000 // 请求超时时间 5秒
})

// 2. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
  (config) => {
    // 💡 思考1：如何获取 userStore？(提示：调用 useUserStore())
    const userStore = useUserStore()
    
    // 💡 思考2：如果 store 里有 token，如何将其添加到请求头？
    if (userStore.token) {
      // 标准写法：Bearer + 空格 + token
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
  (response) => {
    // 正常返回数据时，直接剥离 axios 的外层 data，返回业务数据
    return response.data
  },
  (error) => {
    // 发生 HTTP 错误时
    if (error.response) {
      // 💡 思考3：如何判断状态码是不是 401？
      if (error.response.status === 401) {
        const userStore = useUserStore()
        // 1. 清空 store 状态
        // 2. 弹窗提示
        ElMessage.error('登录状态已过期，请重新登录')
        
        // 3. 踢回登录页
        router.push('/login')
      } else {
        // 其他错误统一提示
        ElMessage.error(error.response.data.message || '网络请求失败')
      }
    } else {
      ElMessage.error('网络连接异常')
    }
    return Promise.reject(error)
  }
)

export default service
