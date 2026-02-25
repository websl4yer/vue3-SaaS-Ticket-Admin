<template>
  <div class="tenants-container">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button type="primary" icon="Plus" @click="handleCreate">新增服务商</el-button>
    </div>

    <!-- 核心表格区 -->
    <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="服务商(公司)名称" min-width="180" />
      <el-table-column prop="contact" label="联系人" width="120" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="createTime" label="入驻时间" width="180" />
      
      <!-- 手写区：状态列 -->
      <el-table-column label="状态" width="100" align="center">
        <template #default="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '封禁' }}
          </el-tag>
        </template>
        <!-- 等待你手写插槽 -->
      </el-table-column>

      <!-- 手写区：操作列 -->
      <el-table-column label="操作" width="150" align="center">
        <template #default = "{row}">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <!-- 动态显示封禁和解封 -->
          <el-button :type="row.status === 1? 'danger' : 'success'" 
          link @click="handleToggleStatus(row)">{{ row.status === 1 ? '封禁' : '解封' }}</el-button>
        </template>
        <!-- 等待你手写插槽 -->
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="formModel.id ? '编辑服务商' : '新增服务商'" width="500px">
      <el-form :model="formModel" label-width="120px">
        <el-form-item label="服务商名称">
          <el-input v-model="formModel.name" placeholder="请输入公司全称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formModel.contact" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formModel.phone" placeholder="请输入联系人手机" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formModel.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">封禁</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch} from 'vue'
import { ElMessage, ElMessageBox} from 'element-plus'
import { getTenantsApi, updateTenantStatusApi,type Tenant  } from '@/api/tenant'

// 2. 响应式状态声明
const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref<Tenant[]>([])
const formModel = reactive({
  id: 0,
  name: '',
  contact: '',
  phone: '',
  status: 1 as 0 | 1 ,// 给 status 一个明确的类型/ 1: 正常, 0: 封禁
  createTime: ''
})

// 打开【新增】弹窗
const handleCreate = () => {
  // 先重置表单数据
  formModel.id = 0
  formModel.name = ''
  formModel.contact = ''
  formModel.phone = ''
  formModel.status = 1
  formModel.createTime = ''
  // 再显示弹窗
  dialogVisible.value = true
}

// 打开【编辑】弹窗
const handleEdit = (row: Tenant) => {
  // 使用传入的行数据，回填表单
  // Object.assign 是一个浅拷贝的好方法
  Object.assign(formModel, row)
  // 再显示弹窗
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (formModel.id) {
      // 编辑逻辑
      // 1. 在 tableData 数组中找到 id 匹配的项
      const index = tableData.value.findIndex(item => item.id === formModel.id)
      if (index > -1) {
        // 2. 更新该项的数据
        tableData.value[index] = { ...formModel }
      }
      ElMessage.success('编辑成功')
    } else {
      // 新增逻辑
      // 1. 创建一个新对象（给个模拟的 ID）
      const newItem: Tenant = { 
        ...formModel, 
        id: Date.now(), // 用时间戳模拟唯一 ID
        createTime: new Date().toLocaleString() // 模拟创建时间
      }
      // 2. 将新对象添加到数组开头
      tableData.value.unshift(newItem)
      ElMessage.success('新增成功')
    } 
    // 3. 关闭弹窗
    dialogVisible.value = false 
}

const handleToggleStatus = async (row: Tenant) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const actionText = row.status === 1 ? '封禁' : '解封';
  
  // 保存旧状态用于回滚
  const oldStatus = row.status;
  
  try {
    // 先更新本地状态（提供即时反馈）
    row.status = newStatus;
    
    // 调用API
    await updateTenantStatusApi(row.id, newStatus)
    
    ElMessage.success(`已成功${actionText}该服务商`)
  } catch (error) {
    // 如果接口报错，回滚到旧状态
    row.status = oldStatus;
    ElMessage.error('操作失败')
  }
}


const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await getTenantsApi();
    if (res.code === 200) {
      // 确保所有数据都有 createTime 字段
      tableData.value = res.data.map((item: Tenant) => ({
        ...item,
        createTime: item.createTime || new Date().toLocaleDateString()
      }));
    }
  } catch (error) {
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};



// ==========================================
// 魔法监控区：全自动本地化存储
// ==========================================
// watch 接收三个参数：
// 1. 要盯着谁看？(tableData)
// 2. 发现变化了干什么？((newData) => { ... })
// 3. 监控配置：{ deep: true } (深度监听，非常重要！)
watch(
  tableData, 
  (newData) => {
    // 只要 tableData 发生变化，立刻把它转换成 JSON 字符串，塞进本地存储
    localStorage.setItem('mock_tenant_list', JSON.stringify(newData))
    console.log('数据已自动存档！') // 你可以在控制台看到这句提示
  }, 
  { deep: true } 
)

// 使用 onMounted 生命周期钩子，确保在组件被挂载到页面上之后，
// 立刻自动调用一次 fetchData 函数，去获取初始数据。
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.tenants-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
}
</style>