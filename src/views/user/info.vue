<template>
  <div class="user-info-container">
    <!-- 固定区域 -->
    <div class="fixed-header">
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select 
              v-model="queryParams.roleType" 
              placeholder="请选择角色" 
              clearable
              style="width: 180px;"
            >
              <el-option label="超级管理员" :value="2" />
              <el-option label="普通管理员" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 表格标题区域 -->
      <div class="table-header-card">
        <div class="table-header">
          <span class="header-title">管理员列表</span>
          <el-button type="primary" @click="handleAdd">新增管理员</el-button>
        </div>
      </div>
    </div>

    <!-- 表格区域（可滚动） -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="adminList"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="roleType" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.roleType === 2 ? 'success' : ''">
              {{ scope.row.roleType === 2 ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="gradeLevels" label="负责学段" min-width="180">
          <template #default="scope">
            <el-tag 
              v-for="grade in scope.row.gradeLevels"
              :key="grade"
              class="grade-tag"
            >
              {{ grade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="primary" link @click="handleDelete(scope.row)">删除</el-button>
            <el-button 
              type="primary" 
              link 
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-config-provider :locale="zhCn">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            :pager-count="7"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-config-provider>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="dialogForm.nickname" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="dialogForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="roleType">
          <el-select v-model="dialogForm.roleType" placeholder="请选择角色">
            <el-option label="超级管理员" :value="2" />
            <el-option label="普通管理员" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责学段" prop="gradeLevels">
          <el-select
            v-model="dialogForm.gradeLevels"
            multiple
            placeholder="请选择负责学段"
          >
            <el-option label="小学" value="小学" />
            <el-option label="初中" value="初中" />
            <el-option label="高中" value="高中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogSubmit" :loading="dialogLoading">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, addUser, updateUser, deleteUser, changeUserStatus } from '@/api/user'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  roleType: ''
})

// 表格数据
const loading = ref(false)
const total = ref(0)
const adminList = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogType = ref('add') // add 或 edit
const dialogFormRef = ref(null)
const dialogForm = reactive({
  username: '',
  nickname: '',
  password: '',
  roleType: 1,
  gradeLevels: []
})

const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '新增管理员' : '编辑管理员'
})

const dialogRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ],
  roleType: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  gradeLevels: [
    { required: true, message: '请选择负责学段', trigger: 'change' }
  ]
}

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    adminList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.username = ''
  queryParams.roleType = ''
  handleQuery()
}

// 新增管理员
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  dialogForm.username = ''
  dialogForm.nickname = ''
  dialogForm.password = ''
  dialogForm.roleType = 1
  dialogForm.gradeLevels = []
  
  // 等待 DOM 更新后重置表单验证
  nextTick(() => {
    if (dialogFormRef.value) {
      dialogFormRef.value.resetFields()
    }
  })
}

// 编辑管理员
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(dialogForm, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    roleType: row.roleType,
    gradeLevels: row.gradeLevels
  })
}

// 提交表单
const handleDialogSubmit = async () => {
  if (!dialogFormRef.value) return
  
  try {
    await dialogFormRef.value.validate()
    dialogLoading.value = true
    
    if (dialogType.value === 'add') {
      await addUser(dialogForm)
      ElMessage.success('添加成功')
    } else {
      await updateUser(dialogForm.id, dialogForm)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    dialogLoading.value = false
  }
}

// 删除管理员
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确认要删除该管理员吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 修改状态
const handleStatusChange = async (row) => {
  try {
    await changeUserStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success(`${row.status === 1 ? '禁用' : '启用'}成功`)
    getList()
  } catch (error) {
    console.error('状态修改失败:', error)
  }
}

// 分页方法
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  getList()
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.user-info-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  position: relative;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f0f2f5;
  padding: 20px 20px 0 20px;
}

.search-card {
  margin-bottom: 20px;
  background-color: #fff;
}

.search-form {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.table-header-card {
  background-color: #fff;
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
  background-color: #fff;
  margin: 0 20px;
  border-radius: 4px;
}

.grade-tag {
  margin-right: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 20px !important;
}

/* 自定义滚动条样式 */
.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: #ddd;
}

.table-container::-webkit-scrollbar-track {
  border-radius: 3px;
  background: #f5f5f5;
}

.pagination-container :deep(.el-pagination.is-background) .btn-next,
.pagination-container :deep(.el-pagination.is-background) .btn-prev,
.pagination-container :deep(.el-pagination.is-background) .el-pager li {
  margin: 0 4px;
  min-width: 32px;
  border-radius: 4px;
}

.pagination-container :deep(.el-pagination.is-background) .el-pager li:not(.is-disabled).is-active {
  background-color: #409EFF;
}

/* 可以添加全局的 select 样式 */
:deep(.el-select) {
  width: 180px;
}

/* 或者给特定的 select 添加类名样式 */
.role-select {
  width: 180px;
}
</style> 