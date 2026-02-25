// src/api/tenant.ts
// 模拟租户(服务商)相关的接口

// 定义租户接口（与组件保持一致）
export interface Tenant {
  id: number;
  name: string;
  contact: string;
  phone: string;
  status: number; // 1: 正常, 0: 封禁
  createTime: string;
}

// 模拟初始数据
const mockTenants: Tenant[] = [
  { id: 1, name: '重庆闪电维修局', contact: '张师傅', phone: '13800001111', status: 1, createTime: '2023-10-01' },
  { id: 2, name: '渝中区金牌家政', contact: '王阿姨', phone: '13900002222', status: 1, createTime: '2023-10-05' },
  { id: 3, name: '江北跑腿公司', contact: '李哥', phone: '13700003333', status: 0, createTime: '2023-11-12' },
]

// 统一的存储键名
const STORAGE_KEY = 'mock_tenant_list'

// API响应类型
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 1. 获取租户列表接口
export const getTenantsApi = (): Promise<ApiResponse<Tenant[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const localData = localStorage.getItem(STORAGE_KEY)
      const dataToReturn = localData ? JSON.parse(localData) : mockTenants
      
      resolve({
        code: 200,
        data: dataToReturn,
        message: '获取成功'
      })
    }, 600)
  })
}

// 2. 更新租户状态接口
export const updateTenantStatusApi = (id: number, status: number): Promise<ApiResponse<null>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const localData = localStorage.getItem(STORAGE_KEY)
      if (localData) {
        const tenants: Tenant[] = JSON.parse(localData)
        const updatedTenants = tenants.map(tenant => 
          tenant.id === id ? { ...tenant, status } : tenant
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTenants))
      }
      
      resolve({ code: 200, data: null, message: '状态更新成功' })
    }, 300)
  })
}
