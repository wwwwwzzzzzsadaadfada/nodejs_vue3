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
            <el-select v-model="queryParams.roleType" placeholder="请选择角色" clearable>
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
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
const adminList = ref([
  {
    id: 1,
    username: 'admin',
    nickname: '超级管理员',
    roleType: 2,
    status: 1,
    createTime: '2024-01-01 12:00:00',
    gradeLevels: ['小学', '初中', '高中']
  },
  {
    id: 2,
    username: 'test',
    nickname: '测试账号',
    roleType: 1,
    status: 1,
    createTime: '2024-01-02 12:00:00',
    gradeLevels: ['小学']
  }
])

// 查询方法
const handleQuery = () => {
  loading.value = true
  // TODO: 调用后端接口获取数据
  setTimeout(() => {
    loading.value = false
    total.value = adminList.value.length
    ElMessage.success('查询成功')
  }, 500)
}

// 重置查询
const resetQuery = () => {
  queryParams.username = ''
  queryParams.roleType = ''
  handleQuery()
}

// 新增管理员
const handleAdd = () => {
  ElMessage.info('新增管理员功能开发中...')
}

// 编辑管理员
const handleEdit = (row) => {
  ElMessage.info('编辑管理员功能开发中...')
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
  ).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 修改状态
const handleStatusChange = (row) => {
  ElMessage.success(`${row.status === 1 ? '禁用' : '启用'}成功`)
}

// 分页方法
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  handleQuery()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  handleQuery()
}

// 初始化
onMounted(() => {
  handleQuery()
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
</style> 