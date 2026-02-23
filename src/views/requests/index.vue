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
      <el-table :data="filteredData" border style="width: 100%">
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
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 1. TS 类型定义 ---
interface RequestTicket {
  id: string
  title: string
  customer: string
  tenantName: string
  createTime: string
  status: 'pending' | 'processing' | 'completed' | 'closed'
}

// --- 2. 状态与数据 ---
const searchParams = ref({
  status: '',
  keyword: ''
})

const allData = ref<RequestTicket[]>([]) // 总数据池
const filteredData = ref<RequestTicket[]>([]) // 表格渲染用的过滤后数据

// --- 3. 辅助函数（状态转译） ---
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

const handleSearch = () =>{
  //搜索参数
  const {status, keyword} = searchParams.value
  // 如果没有搜索条件，显示所有数据
  if(!status && !keyword){
    filteredData.value = [...allData.value]
    return
  }  
  filteredData.value = allData.value.filter(item =>{
    const matchStatus = !status || item.status === status
    const matchKeywords = !keyword || 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.customer.toLowerCase().includes(keyword.toLowerCase())
    return matchStatus && matchKeywords
  })
}

const resetSearch = () =>{
  searchParams.value.keyword = ''
  searchParams.value.status = ''
  handleSearch()
}

const handleForceClose = (row: RequestTicket) => {
  ElMessageBox.confirm(
    `确定要强制关闭工单 ${row.id} 吗？关闭后将无法恢复。`,
    '后台干预警告',
    {
      confirmButtonText: '强制关闭',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 你的代码：
    // 1. 将 row 的 status 修改为 'closed'
    // 2. 弹出 ElMessage.success('工单已强制关闭')
    // 3. 可选：由于 Vue 的响应式，row.status 改了表格可能会变，但严谨起见，调用 handleSearch()
    row.status = 'closed'
    ElMessage.success("工单已强制关闭")
    handleSearch()
  }).catch(() => {
    // 点击取消，啥也不干
  })
}

// --- 4. 初始化与持久化 (复习 Day 3 知识点) ---
onMounted(() => {
  const localData = localStorage.getItem('mock_requests')
  if (localData) {
    allData.value = JSON.parse(localData)
  } else {
    // 初始假数据
    allData.value = [
      { id: 'REQ001', title: '办公室空调漏水', customer: '张三', tenantName: '', createTime: '2023-10-24 10:00:00', status: 'pending' },
      { id: 'REQ002', title: '公司网络瘫痪需要排查', customer: '李四', tenantName: '迅捷网络', createTime: '2023-10-24 09:30:00', status: 'processing' },
      { id: 'REQ003', title: '前台打印机加墨', customer: '王五', tenantName: '快修耗材', createTime: '2023-10-23 15:00:00', status: 'completed' },
    ]
  }
  handleSearch() // 页面加载时执行一次检索，把 allData 灌入 filteredData
})

watch(allData, (newVal) => {
  localStorage.setItem('mock_requests', JSON.stringify(newVal))
}, { deep: true })


</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}
</style>