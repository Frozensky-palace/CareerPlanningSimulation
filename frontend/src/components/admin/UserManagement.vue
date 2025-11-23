<template>
  <div class="user-management">
    <div class="management-header">
      <h1 class="page-title">用户管理</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱"
          :prefix-icon="Search"
          clearable
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-table">
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column label="存档数" width="100" align="center">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.saveCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleViewDetail(scope.row)">
              查看详情
            </el-button>
            <el-button link type="danger" @click="handleDeleteUser(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="用户详情"
      width="800px"
      :close-on-click-modal="true"
    >
      <div class="user-detail" v-if="selectedUser" v-loading="detailLoading">
        <div class="detail-header">
          <div class="user-avatar">
            <el-icon :size="48"><User /></el-icon>
          </div>
          <div class="user-info">
            <h2 class="username">{{ selectedUser.username }}</h2>
            <p class="email">{{ selectedUser.email }}</p>
            <p class="registered">注册于 {{ formatDateTime(selectedUser.createdAt) }}</p>
          </div>
        </div>

        <el-divider />

        <h3 class="section-title">存档列表</h3>
        <div v-if="userSaves.length > 0" class="saves-list">
          <div v-for="save in userSaves" :key="save.id" class="save-item">
            <div class="save-header">
              <span class="save-name">{{ save.name }}</span>
              <el-tag size="small">第 {{ save.semester }} 学期</el-tag>
            </div>
            <div class="save-meta">
              <span>第 {{ save.week }} 周</span>
              <span>•</span>
              <span>{{ save.currentPhase === 'opening' ? '期初' : save.currentPhase === 'midterm' ? '期中' : '期末' }}</span>
              <span>•</span>
              <span>剩余事件: {{ save.remainingEvents }}</span>
            </div>
            <div class="save-attributes">
              <el-tag type="danger" size="small">德: {{ save.attributes?.de || 0 }}</el-tag>
              <el-tag type="primary" size="small">智: {{ save.attributes?.zhi || 0 }}</el-tag>
              <el-tag type="success" size="small">体: {{ save.attributes?.ti || 0 }}</el-tag>
              <el-tag type="warning" size="small">美: {{ save.attributes?.mei || 0 }}</el-tag>
              <el-tag type="info" size="small">劳: {{ save.attributes?.lao || 0 }}</el-tag>
            </div>
            <div class="save-time">
              更新于 {{ formatDateTime(save.updatedAt) }}
            </div>
          </div>
        </div>
        <div v-else class="empty-saves">
          <el-icon :size="40" class="text-gray-300"><DocumentCopy /></el-icon>
          <p class="text-gray-400 mt-2">该用户暂无存档</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, DocumentCopy } from '@element-plus/icons-vue'
import request from '@/services/api'

interface UserInfo {
  id: number
  username: string
  email: string
  createdAt: string
  saveCount?: number
}

interface SaveInfo {
  id: number
  name: string
  semester: number
  week: number
  currentPhase: string
  remainingEvents: number
  attributes: {
    de: number
    zhi: number
    ti: number
    mei: number
    lao: number
  }
  updatedAt: string
}

const loading = ref(false)
const detailLoading = ref(false)
const users = ref<UserInfo[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const showDetailDialog = ref(false)
const selectedUser = ref<UserInfo | null>(null)
const userSaves = ref<SaveInfo[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadUsers = async () => {
  try {
    loading.value = true
    const res = await request.get('/admin/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value || undefined
      }
    })
    users.value = res.data.users || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('Failed to load users:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 300)
}

const handleViewDetail = async (user: UserInfo) => {
  selectedUser.value = user
  showDetailDialog.value = true
  userSaves.value = []

  try {
    detailLoading.value = true
    const res = await request.get(`/admin/users/${user.id}`)
    userSaves.value = res.data.saves || []
  } catch (error) {
    console.error('Failed to load user detail:', error)
    ElMessage.error('加载用户详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleDeleteUser = async (user: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.username}"吗？\n此操作将同时删除该用户的所有存档数据，且不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await request.delete(`/admin/users/${user.id}`)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 24px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.search-input {
  width: 300px;
}

.users-table {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* 用户详情样式 */
.user-detail {
  padding: 0 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1A8FFF 0%, #0057D9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.email {
  font-size: 14px;
  color: #606266;
  margin: 0 0 4px 0;
}

.registered {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.saves-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.save-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.save-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.save-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.save-meta {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.save-attributes {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.save-time {
  font-size: 12px;
  color: #909399;
}

.empty-saves {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
