<template>
  <div class="requests-container">
    <!-- 1. 顶部搜索区 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="工单状态">
          <el-select v-model="searchParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待接单" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="searchParams.keyword" placeholder="搜索求助标题" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 表格展示区 - 已升级为虚拟滚动 -->
    <div ref="tableContainerRef" class="table-v2-container">
      <el-table-v2
        v-if="tableWidth > 0"
        :columns="columns"
        :data="tableData"
        :width="tableWidth"
        :height="tableHeight"
        :loading="loading"
        fixed
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue'
import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'
import type { Column, TagProps } from 'element-plus'
import { useTable } from '@/hooks/useTable'

// --- 1. TS 类型定义 ---
interface RequestTicket {
  id: string
  title: string
  customer: string
  tenantName: string
  createTime: string
  status: 'pending' | 'processing' | 'completed' | 'closed'
}

// --- 2. 状态与搜索条件 ---
const searchParams = ref({
  status: '',
  keyword: ''
})

// 表格尺寸
const tableContainerRef = ref<HTMLDivElement>()
const tableWidth = ref(0)
const tableHeight = ref(0)

// 帮助函数
const getStatusType = (status: string): TagProps['type'] => {
  const map: Record<string, TagProps['type']> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    closed: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待接单',
    processing: '处理中',
    completed: '已完成',
    closed: '已关闭'
  }
  return map[status] || '未知'
}


// el-table-v2 的列定义
const columns: Column<RequestTicket>[] = [
  { key: 'id', dataKey: 'id', title: '工单号', width: 100 },
  { key: 'title', dataKey: 'title', title: '求助标题', width: 150 },
  { key: 'customer', dataKey: 'customer', title: '发布人', width: 120 },
  { key: 'tenantName', dataKey: 'tenantName', title: '接单服务商', width: 150 },
  { key: 'createTime', dataKey: 'createTime', title: '发布时间', width: 180 },
  {
    key: 'status',
    title: '状态',
    width: 100,
    align: 'center',
    cellRenderer: ({ rowData }) => h(
      ElTag,
      { type: getStatusType(rowData.status) },
      () => getStatusText(rowData.status)
    )
  },
  {
    key: 'operations',
    title: '操作',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      if (rowData.status !== 'completed' && rowData.status !== 'closed') {
        return h(
          ElButton,
          { type: 'danger', link: true, onClick: () => handleForceClose(rowData) },
          () => '强制关闭'
        )
      }
      return h('div') // 返回一个空的 VNode
    }
  }
]


// ==========================================
// 🌟 重点：模拟后端的 API 接口函数 
// ==========================================
const mockFetchRequestsApi = (params: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let dbData: RequestTicket[] = []

      try {
        const localRaw = localStorage.getItem('mock_requests')
        if (localRaw) {
          dbData = JSON.parse(localRaw)
        }
      } catch (error) {
        console.error('本地数据解析失败，已重置', error)
        dbData = [] 
      }

      if (dbData.length === 0) {
        dbData = [
          { id: 'REQ001', title: '办公室空调漏水', customer: '张三', tenantName: '办公室', createTime: '2023-10-24 10:00:00', status: 'pending' },
          { id: 'REQ002', title: '公司网络瘫痪需要排查', customer: '李四', tenantName: '迅捷网络', createTime: '2023-10-24 09:30:00', status: 'processing' },
          { id: 'REQ003', title: '前台打印机加墨', customer: '王五', tenantName: '快修耗材', createTime: '2023-10-23 15:00:00', status: 'completed' },
        ]
        localStorage.setItem('mock_requests', JSON.stringify(dbData))
      }

      const { status, keyword } = params
      let result = dbData
      if (status) {
        result = result.filter(item => item.status === status)
      }
      if (keyword) {
        result = result.filter(item => 
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.customer.toLowerCase().includes(keyword.toLowerCase())
        )
      }

      resolve({ data: result, total: result.length })
    }, 500)
  })
}

// ==========================================
// 🚀 核心：接入 useTable Hook
// ==========================================
const { tableData, loading, loadData } = useTable(mockFetchRequestsApi)

// --- 3. 业务操作 ---
const handleSearch = () => {
  loadData({ 
    status: searchParams.value.status, 
    keyword: searchParams.value.keyword 
  })
}

const resetSearch = () => {
  searchParams.value.keyword = ''
  searchParams.value.status = ''
  handleSearch()
}

const handleForceClose = (row: RequestTicket) => {
  ElMessageBox.confirm(`确定要强制关闭工单 ${row.id} 吗？`, '后台干预警告', { 
    confirmButtonText: '强制关闭', cancelButtonText: '取消', type: 'warning' 
  }).then(() => {
    let dbData: RequestTicket[] = JSON.parse(localStorage.getItem('mock_requests') || '[]')

    // 使用 find 定位，更类型安全
    const targetItem = dbData.find(item => item.id === row.id)
    if (targetItem) {
      targetItem.status = 'closed'
      localStorage.setItem('mock_requests', JSON.stringify(dbData))
      ElMessage.success("工单已强制关闭")
      handleSearch() 
    } else {
      ElMessage.error("未找到要操作的工单")
    }
  }).catch(() => {})
}


// 监听容器尺寸变化
let resizeObserver: ResizeObserver | null = null
const observeTableResize = () => {
  if (tableContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if(tableContainerRef.value) {
        tableWidth.value = tableContainerRef.value.offsetWidth
        tableHeight.value = tableContainerRef.value.offsetHeight
      }
    })
    resizeObserver.observe(tableContainerRef.value)
  }
}

// --- 4. 初始化 ---
onMounted(() => {
  handleSearch()
  observeTableResize()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.requests-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px); /* 减去layout的padding和header高度 */
}
.search-card {
  margin-bottom: 20px;
  flex-shrink: 0;
}
.table-v2-container {
  flex-grow: 1; /* 让表格容器占据所有剩余空间 */
}
</style>