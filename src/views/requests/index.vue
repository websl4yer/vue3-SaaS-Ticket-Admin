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

    <!-- 2. 表格展示区 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="工单号" width="100" />
        <el-table-column prop="title" label="求助标题" min-width="150" />
        <el-table-column prop="customer" label="发布人" width="120" />
        <el-table-column prop="tenantName" label="接单服务商" width="150" />
        <el-table-column prop="createTime" label="发布时间" width="180" />
        
        <!-- 状态列：使用作用域插槽和 el-tag -->
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status !== 'completed' && row.status !== 'closed'" 
              type="danger" 
              link 
              @click="handleForceClose(row)"
            >
              强制关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// ==========================================
// 🌟 重点：模拟后端的 API 接口函数 
// ==========================================
const mockFetchRequestsApi = (params: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let dbData = []
      
      // 🛡️ 防御性编程：加 try-catch 拦截 JSON 解析错误
      // 如果报错，直接降级为空数组，防止整个页面白屏！
      try {
        const localRaw = localStorage.getItem('mock_requests')
        if (localRaw) {
          dbData = JSON.parse(localRaw)
        }
      } catch (error) {
        console.error('本地数据解析失败，已重置', error)
        dbData = [] 
      }

      // 如果数据为空，初始化假数据
      if (dbData.length === 0) {
        dbData = [
          { id: 'REQ001', title: '办公室空调漏水', customer: '张三', tenantName: '办公室', createTime: '2023-10-24 10:00:00', status: 'pending' },
          { id: 'REQ002', title: '公司网络瘫痪需要排查', customer: '李四', tenantName: '迅捷网络', createTime: '2023-10-24 09:30:00', status: 'processing' },
          { id: 'REQ003', title: '前台打印机加墨', customer: '王五', tenantName: '快修耗材', createTime: '2023-10-23 15:00:00', status: 'completed' },
        ]
        localStorage.setItem('mock_requests', JSON.stringify(dbData))
      }

      // 模拟后端过滤
      const { status, keyword } = params
      let result = dbData
      if (status) {
        result = result.filter((item: any) => item.status === status)
      }
      if (keyword) {
        result = result.filter((item: any) => 
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
    let dbData = JSON.parse(localStorage.getItem('mock_requests') || '[]')
    const index = dbData.findIndex((item: any) => item.id === row.id)
    if (index !== -1) {
      dbData[index].status = 'closed'
      localStorage.setItem('mock_requests', JSON.stringify(dbData))
    }
    ElMessage.success("工单已强制关闭")
    handleSearch() 
  }).catch(() => {})
}

// ==========================================
// 🚨 修复：必须把这两个方法写完整，不能只放注释！
// ==========================================
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
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

// --- 4. 初始化 ---
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}
</style>