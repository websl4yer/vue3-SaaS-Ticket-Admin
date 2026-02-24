<template>
  <!-- 图表容器，通过 ref 获取 DOM 实例 -->
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
// 引入 echarts 核心
import * as echarts from 'echarts'

// 1. 定义父组件传进来的参数 (props)
const props = defineProps({
  option: {
    type: Object,
    required: true // 图表配置项是必须的
  },
  width: {
    type: String,
    default: '100%' // 默认宽度撑满父容器
  },
  height: {
    type: String,
    default: '300px' // 默认高度 300px
  }
})

// 2. 准备 DOM 容器和 ECharts 实例变量
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 3. 初始化图表的方法
const initChart = () => {
  if (!chartRef.value) return // 防御性编程：如果没有 DOM 直接 return
  // 初始化 ECharts 实例
  chartInstance = echarts.init(chartRef.value)
  // 注入数据
  chartInstance.setOption(props.option)
}

// 4. 处理屏幕缩放自适应的方法
const resizeHandler = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 5. 生命周期管理（面试必考点！！！）
onMounted(() => {
  initChart()
  // 监听浏览器窗口大小改变
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  // 组件销毁时，必须移除监听器，防止内存泄漏
  window.removeEventListener('resize', resizeHandler)
  if (chartInstance) {
    chartInstance.dispose() // 销毁 echarts 实例
  }
})

// 6. 监听传入的 option 变化（实现数据动态更新）
watch(
  () => props.option,
  (newVal) => {
    if (chartInstance) {
      chartInstance.setOption(newVal)
    }
  },
  { deep: true } // 深度监听对象内部属性的变化
)


</script>
    
<style scoped>
/* 此处无需特别样式，宽高由父组件传入控制 */
</style>