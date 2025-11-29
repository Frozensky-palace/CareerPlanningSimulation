<template>
  <div class="workshop-list">
    <!-- 背景 -->
    <div class="page-background"></div>

    <!-- 主内容 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <header class="page-header">
        <div class="header-left">
          <el-button text @click="goBack" class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
        </div>
        <h1 class="page-title">创意工坊</h1>
        <div class="header-right">
          <el-button type="primary" @click="createChain">
            <el-icon><Plus /></el-icon>
            新建剧本链
          </el-button>
        </div>
      </header>

      <!-- 剧本链列表 -->
      <div class="chains-container">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="chains.length === 0" class="empty-state">
          <el-icon :size="64"><Box /></el-icon>
          <h3>暂无剧本链</h3>
          <p>开始创作你的第一个剧本链吧！</p>
          <el-button type="primary" @click="createChain">
            <el-icon><Plus /></el-icon>
            新建剧本链
          </el-button>
        </div>

        <div v-else class="chains-grid">
          <div
            v-for="chain in chains"
            :key="chain.id"
            class="chain-card"
            @click="editChain(chain.id)"
          >
            <div class="chain-cover">
              <img v-if="chain.coverImage" :src="chain.coverImage" alt="封面" />
              <div v-else class="default-cover">
                <el-icon :size="48"><Document /></el-icon>
              </div>
              <div class="chain-status" :class="{ imported: chain.isImported }">
                {{ chain.isImported ? '已导入' : '未导入' }}
              </div>
            </div>
            <div class="chain-info">
              <h3 class="chain-title">{{ chain.title }}</h3>
              <p class="chain-desc">{{ chain.description || '暂无描述' }}</p>
              <div class="chain-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(chain.updatedAt) }}
                </span>
              </div>
            </div>
            <div class="chain-actions" @click.stop>
              <el-dropdown trigger="click">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editChain(chain.id)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="!chain.isImported"
                      @click="importChain(chain)"
                    >
                      <el-icon><Upload /></el-icon>
                      导入游戏
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-else
                      @click="unimportChain(chain)"
                    >
                      <el-icon><Download /></el-icon>
                      取消导入
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="deleteChain(chain)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建剧本链对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建剧本链"
      width="500px"
      class="create-dialog"
    >
      <el-form :model="newChainForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="newChainForm.title" placeholder="请输入剧本链标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newChainForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入剧本链描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :loading="creating">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Plus,
  Box,
  Document,
  Clock,
  MoreFilled,
  Edit,
  Upload,
  Download,
  Delete,
  Loading
} from '@element-plus/icons-vue'
import request from '@/services/api'

interface WorkshopChain {
  id: number
  title: string
  description: string
  coverImage: string | null
  rootScriptId: number | null
  isImported: boolean
  createdAt: string
  updatedAt: string
}

const router = useRouter()

const loading = ref(true)
const chains = ref<WorkshopChain[]>([])
const createDialogVisible = ref(false)
const creating = ref(false)
const newChainForm = ref({
  title: '',
  description: ''
})

// 加载剧本链列表
const loadChains = async () => {
  loading.value = true
  try {
    const res = await request.get('/workshop/chains')
    chains.value = res.data?.chains || []
  } catch (error) {
    console.error('Failed to load chains:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 新建剧本链
const createChain = () => {
  newChainForm.value = { title: '', description: '' }
  createDialogVisible.value = true
}

// 确认创建
const confirmCreate = async () => {
  if (!newChainForm.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }

  creating.value = true
  try {
    const res = await request.post('/workshop/chains', {
      title: newChainForm.value.title.trim(),
      description: newChainForm.value.description.trim()
    })
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    // 直接跳转到编辑页
    router.push(`/workshop/${res.data.chain.id}`)
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    creating.value = false
  }
}

// 编辑剧本链
const editChain = (id: number) => {
  router.push(`/workshop/${id}`)
}

// 导入游戏
const importChain = async (chain: WorkshopChain) => {
  try {
    await request.post(`/workshop/chains/${chain.id}/import`)
    ElMessage.success('导入成功')
    chain.isImported = true
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '导入失败')
  }
}

// 取消导入
const unimportChain = async (chain: WorkshopChain) => {
  try {
    await request.delete(`/workshop/chains/${chain.id}/import`)
    ElMessage.success('已取消导入')
    chain.isImported = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除剧本链
const deleteChain = async (chain: WorkshopChain) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${chain.title}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    await request.delete(`/workshop/chains/${chain.id}`)
    ElMessage.success('删除成功')
    chains.value = chains.value.filter(c => c.id !== chain.id)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadChains()
})
</script>

<style scoped>
.workshop-list {
  min-height: 100vh;
  position: relative;
}

.page-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4fc 50%, #dbeafe 100%);
  z-index: 0;
}

.main-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 顶部导航 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.back-btn {
  color: #606266;
  font-size: 14px;
}

.back-btn:hover {
  background: rgba(26, 143, 255, 0.1);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1A8FFF;
  margin: 0;
}

/* 状态展示 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #606266;
  text-align: center;
}

.loading-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state .el-icon {
  opacity: 0.6;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 24px;
  opacity: 0.8;
}

/* 剧本链网格 */
.chains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chain-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.chain-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.chain-cover {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chain-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  color: #c0c4cc;
}

.chain-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.5);
  color: white;
}

.chain-status.imported {
  background: rgba(103, 194, 58, 0.9);
}

.chain-info {
  padding: 16px;
}

.chain-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chain-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 42px;
}

.chain-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.chain-actions {
  position: absolute;
  top: 12px;
  left: 12px;
}

.chain-actions .el-button {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}

/* 对话框 */
:deep(.create-dialog) {
  border-radius: 16px;
}

/* 按钮样式增强 */
:deep(.el-button--primary) {
  background-color: #1A8FFF;
  border-color: #1A8FFF;
  color: white;
  font-weight: 500;
}

:deep(.el-button--primary:hover) {
  background-color: #0070E0;
  border-color: #0070E0;
}

:deep(.el-button--success) {
  background-color: #67C23A;
  border-color: #67C23A;
  color: white;
  font-weight: 500;
}

:deep(.el-button--success:hover) {
  background-color: #529b2e;
  border-color: #529b2e;
}

:deep(.el-button--danger) {
  background-color: #F56C6C;
  border-color: #F56C6C;
  color: white;
  font-weight: 500;
}

:deep(.el-button--danger:hover) {
  background-color: #dd3333;
  border-color: #dd3333;
}
</style>
