<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎语 -->
    <el-card class="mb-4">
      <div class="welcome-box">
        <h2 class="text-xl font-bold">早安，{{ userStore.username }} 👋</h2>
        <p class="text-gray-500 mt-2">
          当前角色：<el-tag :type="isAdmin ? 'danger' : 'success'">{{ userStore.role }}</el-tag>
        </p>
      </div>
    </el-card>

    <!-- 🌟 核心逻辑：v-if 控制不同角色的视图 -->
    
    <!-- 👑 Admin 视图：上帝视角 -->
    <div v-if="isAdmin" class="admin-view">
      <el-row :gutter="20">
        <!-- 左侧：流量趋势 -->
        <el-col :span="16">
          <el-card header="全平台求助趋势 (近7天)">
            <BaseChart :option="lineChartOption" height="350px" />
          </el-card>
        </el-col>
        <!-- 右侧：接单排行 -->
        <el-col :span="8">
          <el-card header="服务商接单 Top5">
            <BaseChart :option="barChartOption" height="350px" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 🏢 Tenant 视图：专注自家业务 -->
    <div v-else class="tenant-view">
      <el-row>
        <el-col :span="12">
          <el-card header="工单状态分布">
            <BaseChart :option="pieChartOption" height="400px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card" style="height: 400px; margin-left: 20px;">
            <template #header>
              <div class="card-header">
                <span>快捷操作</span>
              </div>
            </template>
            <div class="text item">
              <el-button type="primary" @click="$router.push('/requests')">处理待办工单</el-button>
              <div style="margin-top: 20px; color: #666;">
                您的服务评分：⭐⭐⭐⭐⭐ (4.9)
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import BaseChart from '@/components/BaseChart.vue' // 引入咱们封装好的组件

const userStore = useUserStore()

// 判断是否为管理员
const isAdmin = computed(() => userStore.role === 'admin')

/* 
 * 下面是 ECharts 的配置项 (Option)
 * 在真实项目中，这些数据通常来自 API 接口
 * 这里我们模拟静态数据
 */

// 1. 折线图配置 (Admin)
const lineChartOption = ref({
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
      smooth: true, // 平滑曲线
      data: [120, 132, 101, 134, 90, 230, 210],
      areaStyle: {}, // 区域填充颜色
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
const barChartOption = ref({
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
        borderRadius: [5, 5, 0, 0], // 圆角
        color: '#E6A23C'
      }
    }
  ]
})

// 3. 饼图配置 (Tenant)
const pieChartOption = ref({
  tooltip: { trigger: 'item' },
  legend: { top: '5%', left: 'center' },
  series: [
    {
      name: '工单状态',
      type: 'pie',
      radius: ['40%', '70%'], // 环形图
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
.mb-4 { margin-bottom: 20px; }
</style>