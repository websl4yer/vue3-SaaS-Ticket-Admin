<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎语与操作区 -->
    <el-card class="mb-4" shadow="hover">
      <div class="welcome-header">
        <div class="welcome-text">
          <h2 class="text-xl font-bold" style="margin: 0 0 10px 0;">早安，{{ userStore.username }} 👋</h2>
          <p class="text-gray-500" style="margin: 0;">
            当前角色：<el-tag :type="isAdmin ? 'danger' : 'success'">{{ userStore.role }}</el-tag>
          </p>
        </div>
        
        <!-- 🌟 高光时刻：测试我们手写的 v-permission 指令 -->
        <div class="action-buttons">
          <!-- 这个按钮只有 admin 登录时才会存在于 DOM 中，tenant 登录时会直接从物理层面消失 -->
          <el-button v-permission="['admin']" type="danger" icon="Setting">
            平台核心参数设置 (仅Admin可见)
          </el-button>
          
          <!-- 这个按钮大家都能看 -->
          <el-button v-permission="['admin', 'tenant']" type="primary" icon="Download">
            导出当月运营报表
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 🌟 核心逻辑：v-if 控制不同角色的宏观视图 -->
    
    <!-- 👑 Admin 视图：上帝视角 -->
    <div v-if="isAdmin" class="admin-view">
      <el-row :gutter="20">
        <!-- 左侧：流量趋势 -->
        <el-col :span="16">
          <el-card header="全平台求助趋势 (近7天)" shadow="hover">
            <BaseChart :option="lineChartOption" height="350px" />
          </el-card>
        </el-col>
        <!-- 右侧：接单排行 -->
        <el-col :span="8">
          <el-card header="服务商接单 Top5" shadow="hover">
            <BaseChart :option="barChartOption" height="350px" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 🏢 Tenant 视图：专注自家业务 -->
    <div v-else class="tenant-view">
      <el-row>
        <el-col :span="12">
          <el-card header="工单状态分布" shadow="hover">
            <BaseChart :option="pieChartOption" height="400px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card" shadow="hover" style="height: 400px; margin-left: 20px;">
            <template #header>
              <div class="card-header">
                <span style="font-weight: bold;">快捷操作</span>
              </div>
            </template>
            <div class="text item" style="display: flex; flex-direction: column; align-items: flex-start; gap: 20px;">
              <el-button type="primary" size="large" @click="$router.push('/requests')">
                立即处理待办工单 🚀
              </el-button>
              <div style="padding: 15px; background: #f4f4f5; border-radius: 8px; width: 100%;">
                <p style="margin: 0; color: #606266;">本月服务评分：⭐⭐⭐⭐⭐ (4.9)</p>
                <p style="margin: 10px 0 0 0; color: #606266;">本月投诉率：<span style="color: #67C23A; font-weight: bold;">0.12%</span></p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
// 🌟 性能考点：引入 shallowRef 替代 ref
import { computed, shallowRef } from 'vue'
import { useUserStore } from '@/store/user'
import BaseChart from '@/components/BaseChart.vue'

const userStore = useUserStore()

// 判断是否为管理员 (用于控制宏观的大模块显示)
const isAdmin = computed(() => userStore.role === 'admin')

// ==========================================
// 🚀 Vue3 性能黑科技：shallowRef
// ==========================================
// ECharts 的 Option 对象非常庞大且层级极深。
// 如果用普通的 `ref`，Vue 会递归遍历这个对象的所有属性，把它们全部转换成 Proxy（响应式代理）。
// 这会导致极其严重的性能开销（渲染卡顿）。
// 使用 `shallowRef` 告诉 Vue：“只需要监听 option 这个变量本身的地址变化即可，不要去管它内部嵌套了多少层属性”。

// 1. 折线图配置 (Admin)
const lineChartOption = shallowRef({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '求助量',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210],
      areaStyle: {},
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '完成量',
      type: 'line',
      smooth: true,
      data: [220, 182, 191, 234, 290, 330, 310],
      itemStyle: { color: '#67C23A' }
    }
  ]
})

// 2. 柱状图配置 (Admin)
const barChartOption = shallowRef({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: ['极速修', '家政帮', '闪送达', 'IT无忧', '顺丰快修'] },
  yAxis: { type: 'value' },
  series: [
    {
      data: [120, 200, 150, 80, 70],
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        borderRadius: [5, 5, 0, 0],
        color: '#E6A23C'
      }
    }
  ]
})

// 3. 饼图配置 (Tenant)
const pieChartOption = shallowRef({
  tooltip: { trigger: 'item' },
  legend: { top: '5%', left: 'center' },
  series: [
    {
      name: '工单状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 40, fontWeight: 'bold' }
      },
      data: [
        { value: 1048, name: '已完成' },
        { value: 735, name: '处理中' },
        { value: 580, name: '待接单' },
        { value: 484, name: '已取消' },
        { value: 300, name: '投诉中' }
      ]
    }
  ]
})
</script>

<style scoped>
.mb-4 { 
  margin-bottom: 20px; 
}
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-buttons {
  display: flex;
  gap: 12px;
}
</style>