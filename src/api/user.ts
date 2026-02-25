// src/api/user.ts
// 真实企业开发中，会这么写：
// import service from '../utils/request'
// export const loginApi = (data: any) => service.post('/api/login', data)

// 纯前端阶段，我们在这里模拟一个真实的 Axios 响应数据结构：
export const loginApi = (loginForm: {username: string,password: string}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟账号密码校验
      if (loginForm.username === 'admin' && loginForm.password === '3768') {
        resolve({
          code: 200,
          data: { token: 'mock-token-admin', role: 'admin' },
          message: '登录成功'
        })
      } else if (loginForm.username === 'tenant' && loginForm.password === '3768') {
        resolve({
          code: 200,
          data: { token: 'mock-token-tenant', role: 'tenant' },
          message: '登录成功'
        })
      } else {
        // 模拟请求失败 (会进入拦截器的 error)
        reject({
          response: {
            status: 400,
            data: { message: '账号或密码错误' }
          }
        })
      }
    }, 500) // 模拟 500ms 网络延迟
  })
}