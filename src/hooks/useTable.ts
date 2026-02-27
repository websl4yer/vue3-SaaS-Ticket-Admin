// src/hooks/useTable.ts
import { ref } from 'vue'

/**
 * 通用表格 Hook
 * @param apiFunc 传入一个返回 Promise 的请求函数 (比如从 api/xxx.ts 导入的函数)
 */
export function useTable(apiFunc: Function) {
  // 1. 抽取通用的响应式状态
  const tableData = ref([])
  const loading = ref(false)
  
  // (暂留分页字段，虽然我们现在的 Mock 数据没做真分页，但这是企业级习惯)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 2. 抽取通用的加载逻辑
  const loadData = async (params = {}) => {
    loading.value = true
    try {
      // 执行外部传入的接口函数
      const res = await apiFunc({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...params // 允许外部传入额外的搜索条件
      })
      
      // 假设接口返回 { data: [...], total: 100 }
      tableData.value = res.data || res // 兼容不同的数据格式
      total.value = res.total || 0
      
    } catch (error) {
      console.error('表格数据加载失败', error)
    } finally {
      loading.value = false
    }
  }

  // 3. 暴露给外部组件使用
  return {
    tableData,
    loading,
    currentPage,
    pageSize,
    total,
    loadData
  }
}