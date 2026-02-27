<template>
  <div class="categories-container">
    <el-card shadow="never">
      <!-- 顶部工具栏 -->
      <div class="toolbar" style="margin-bottom: 20px;">
        <!-- 🌟 考点 1：权限指令！租户端不允许新增分类，按钮直接消失 -->
        <el-button v-permission="['admin']" type="primary" icon="Plus" @click="handleCreate">
          新增求助分类
        </el-button>
        <span v-permission="['tenant']" style="color: #909399; font-size: 14px;">
          提示：租户仅可查看平台支持的求助分类，如需新增请联系平台管理员。
        </span>
      </div>

      <!-- 🌟 考点 2：极其清爽的表格绑定 (全靠 Hook) -->
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="icon" label="App端图标(Icon)" width="150" align="center" />
        <el-table-column prop="sort" label="排序权重" width="100" align="center" />
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 🌟 考点 1 再次出现：操作列权限控制 -->
        <el-table-column v-permission="['admin']" label="操作" width="150" align="center">
          <template #default="{row}">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 (Admin 专用) -->
    <el-dialog v-model="dialogVisible" :title="formModel.id ? '编辑分类' : '新增分类'" width="400px">
      <el-form :model="formModel" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="formModel.name" placeholder="如：管道疏通" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formModel.sort" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formModel.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable } from '@/hooks/useTable'
import { getCategoriesApi, type Category } from '@/api/category'

// ==========================================
// 🚀 核心状态 (Hook 注入)
// 一行代码搞定 tableData, loading 和拉取数据的方法！
// ==========================================
const { tableData, loading, loadData } = useTable(getCategoriesApi)

// ==========================================
// 表单状态管理
// ==========================================
const dialogVisible = ref(false)
const formModel = reactive({
  id: 0,
  name: '',
  icon: 'Setting',
  sort: 1,
  status: 1
})

const handleCreate = () => {
  formModel.id = 0
  formModel.name = ''
  formModel.sort = 1
  formModel.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  Object.assign(formModel, row)
  dialogVisible.value = true
}

// ==========================================
// 模拟与后端 API 交互 (提交与删除)
// ==========================================
const handleSubmit = () => {
  let dbData = JSON.parse(localStorage.getItem('mock_categories') || '[]')
  if (formModel.id) {
    const index = dbData.findIndex((item: any) => item.id === formModel.id)
    if (index > -1) dbData[index] = { ...formModel }
    ElMessage.success('修改成功')
  } else {
    dbData.push({ ...formModel, id: Date.now() })
    ElMessage.success('新增成功')
  }
  localStorage.setItem('mock_categories', JSON.stringify(dbData))
  dialogVisible.value = false
  
  // 🌟 Hook 威力：改完数据库，直接调 loadData() 刷新表格！
  loadData()
}

const handleDelete = (row: Category) => {
  ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？`, '警告', { type: 'warning' }).then(() => {
    let dbData = JSON.parse(localStorage.getItem('mock_categories') || '[]')
    dbData = dbData.filter((item: any) => item.id !== row.id)
    localStorage.setItem('mock_categories', JSON.stringify(dbData))
    ElMessage.success('删除成功')
    
    // 🌟 Hook 威力：删完数据，重新拉取！
    loadData()
  }).catch(() => {})
}

// 页面加载时拉取数据
onMounted(() => {
  loadData()
})
</script>