// src/api/category.ts
export interface Category {
  id: number
  name: string
  icon: string
  sort: number
  status: 1 | 0 // 1正常 0停用
}

// 模拟获取分类列表接口
export const getCategoriesApi = (params?: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let dbData = JSON.parse(localStorage.getItem('mock_categories') || '[]')
      // 如果没数据，初始化一点假数据
      if (dbData.length === 0) {
        dbData = [
          { id: 1, name: '家电维修', icon: 'Refrigerator', sort: 1, status: 1 },
          { id: 2, name: 'IT/电脑支持', icon: 'Monitor', sort: 2, status: 1 },
          { id: 3, name: '家政保洁', icon: 'Brush', sort: 3, status: 1 },
          { id: 4, name: '法律咨询', icon: 'Document', sort: 4, status: 0 },
        ]
        localStorage.setItem('mock_categories', JSON.stringify(dbData))
      }
      resolve({ data: dbData, total: dbData.length })
    }, 400) // 400ms 延迟，体验 loading 动画
  })
}