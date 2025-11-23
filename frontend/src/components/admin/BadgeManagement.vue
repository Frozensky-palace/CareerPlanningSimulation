<template>
  <div class="badge-management">
    <div class="management-header">
      <h1 class="page-title">勋章管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreateBadge">
        创建勋章
      </el-button>
    </div>

    <!-- 勋章列表 -->
    <div class="badges-grid" v-loading="loading">
      <div
        v-for="badge in badges"
        :key="badge.id"
        class="badge-card"
      >
        <div class="badge-icon">
          <el-icon :size="48" :color="getIconColor(badge.icon)">
            <component :is="getIconComponent(badge.icon)" />
          </el-icon>
        </div>
        <div class="badge-info">
          <h3 class="badge-name">{{ badge.name }}</h3>
          <p class="badge-description">{{ badge.description }}</p>
          <div class="badge-condition">
            <el-tag size="small" type="info">
              {{ formatCondition(badge.unlockCondition) }}
            </el-tag>
          </div>
        </div>
        <div class="badge-actions">
          <el-button link type="primary" @click="handleEditBadge(badge)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDeleteBadge(badge)">
            删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && badges.length === 0" class="empty-state">
        <el-icon :size="60" class="text-gray-300"><Medal /></el-icon>
        <p class="text-gray-400 mt-4">暂无勋章，点击右上角创建</p>
      </div>
    </div>

    <!-- 编辑/创建对话框 -->
    <el-dialog
      v-model="showEditorDialog"
      :title="isEditing ? '编辑勋章' : '创建勋章'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="currentBadge" label-width="100px" class="badge-form">
        <el-form-item label="勋章名称" required>
          <el-input v-model="currentBadge.name" placeholder="输入勋章名称" />
        </el-form-item>

        <el-form-item label="描述" required>
          <el-input
            v-model="currentBadge.description"
            type="textarea"
            :rows="3"
            placeholder="输入勋章描述"
          />
        </el-form-item>

        <el-form-item label="图标">
          <el-select v-model="currentBadge.icon" placeholder="选择图标">
            <el-option label="奖杯 (Trophy)" value="Trophy" />
            <el-option label="奖牌 (Medal)" value="Medal" />
            <el-option label="星星 (Star)" value="Star" />
            <el-option label="王冠 (Crown)" value="Crown" />
            <el-option label="书籍 (Reading)" value="Reading" />
            <el-option label="毕业帽 (GraduationCap)" value="GraduationCap" />
            <el-option label="火焰 (Fire)" value="Fire" />
            <el-option label="心形 (Heart)" value="Heart" />
          </el-select>
        </el-form-item>

        <el-form-item label="解锁条件类型" required>
          <el-radio-group v-model="currentBadge.unlockCondition.type">
            <el-radio value="attribute">属性达标</el-radio>
            <el-radio value="script">完成剧本</el-radio>
            <el-radio value="semester">完成学期</el-radio>
            <el-radio value="badge_count">获得勋章数</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 属性达标条件 -->
        <template v-if="currentBadge.unlockCondition.type === 'attribute'">
          <el-form-item label="目标属性">
            <el-select v-model="currentBadge.unlockCondition.target">
              <el-option label="德育" value="de" />
              <el-option label="智育" value="zhi" />
              <el-option label="体育" value="ti" />
              <el-option label="美育" value="mei" />
              <el-option label="劳育" value="lao" />
              <el-option label="总和" value="total" />
            </el-select>
          </el-form-item>
          <el-form-item label="最低值">
            <el-input-number
              v-model="currentBadge.unlockCondition.minValue"
              :min="0"
              :max="1000"
            />
          </el-form-item>
        </template>

        <!-- 完成剧本条件 -->
        <template v-if="currentBadge.unlockCondition.type === 'script'">
          <el-form-item label="需要完成的剧本数">
            <el-input-number
              v-model="currentBadge.unlockCondition.scriptCount"
              :min="1"
              :max="100"
            />
          </el-form-item>
        </template>

        <!-- 完成学期条件 -->
        <template v-if="currentBadge.unlockCondition.type === 'semester'">
          <el-form-item label="需要完成的学期数">
            <el-input-number
              v-model="currentBadge.unlockCondition.semesterCount"
              :min="1"
              :max="8"
            />
          </el-form-item>
        </template>

        <!-- 获得勋章数条件 -->
        <template v-if="currentBadge.unlockCondition.type === 'badge_count'">
          <el-form-item label="需要获得的勋章数">
            <el-input-number
              v-model="currentBadge.unlockCondition.badgeCount"
              :min="1"
              :max="50"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="showEditorDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBadge" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Medal, Trophy, Star, Reading } from '@element-plus/icons-vue'
import request from '@/services/api'

interface Badge {
  id: number
  name: string
  description: string
  icon: string
  unlockCondition: {
    type: 'attribute' | 'script' | 'semester' | 'badge_count'
    target?: string
    minValue?: number
    scriptCount?: number
    semesterCount?: number
    badgeCount?: number
  }
}

const loading = ref(false)
const saving = ref(false)
const badges = ref<Badge[]>([])
const showEditorDialog = ref(false)
const isEditing = ref(false)

const emptyBadge = (): Badge => ({
  id: 0,
  name: '',
  description: '',
  icon: 'Trophy',
  unlockCondition: {
    type: 'attribute',
    target: 'de',
    minValue: 50
  }
})

const currentBadge = ref<Badge>(emptyBadge())

const iconComponents: Record<string, any> = {
  Trophy: markRaw(Trophy),
  Medal: markRaw(Medal),
  Star: markRaw(Star),
  Reading: markRaw(Reading),
  Crown: markRaw(Trophy),
  GraduationCap: markRaw(Reading),
  Fire: markRaw(Star),
  Heart: markRaw(Medal)
}

const iconColors: Record<string, string> = {
  Trophy: '#FFD700',
  Medal: '#1A8FFF',
  Star: '#FF9500',
  Reading: '#67C23A',
  Crown: '#FFD700',
  GraduationCap: '#303133',
  Fire: '#F56C6C',
  Heart: '#F56C6C'
}

const getIconComponent = (icon: string) => iconComponents[icon] || Trophy
const getIconColor = (icon: string) => iconColors[icon] || '#1A8FFF'

const formatCondition = (condition: Badge['unlockCondition']) => {
  const attrLabels: Record<string, string> = {
    de: '德育', zhi: '智育', ti: '体育', mei: '美育', lao: '劳育', total: '总和'
  }
  switch (condition.type) {
    case 'attribute':
      return `${attrLabels[condition.target || 'de']}达到${condition.minValue || 0}`
    case 'script':
      return `完成${condition.scriptCount || 0}个剧本`
    case 'semester':
      return `完成${condition.semesterCount || 0}个学期`
    case 'badge_count':
      return `获得${condition.badgeCount || 0}个勋章`
    default:
      return '未知条件'
  }
}

const loadBadges = async () => {
  try {
    loading.value = true
    const res = await request.get('/admin/badges')
    badges.value = res.data.badges || []
  } catch (error) {
    console.error('Failed to load badges:', error)
    ElMessage.error('加载勋章列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreateBadge = () => {
  isEditing.value = false
  currentBadge.value = emptyBadge()
  showEditorDialog.value = true
}

const handleEditBadge = (badge: Badge) => {
  isEditing.value = true
  currentBadge.value = JSON.parse(JSON.stringify(badge))
  // 确保unlockCondition有完整结构
  if (!currentBadge.value.unlockCondition) {
    currentBadge.value.unlockCondition = { type: 'attribute', target: 'de', minValue: 50 }
  }
  showEditorDialog.value = true
}

const handleDeleteBadge = async (badge: Badge) => {
  try {
    await ElMessageBox.confirm(`确定要删除勋章"${badge.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/admin/badges/${badge.id}`)
    ElMessage.success('删除成功')
    loadBadges()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete badge:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSaveBadge = async () => {
  if (!currentBadge.value.name || !currentBadge.value.description) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    saving.value = true

    if (isEditing.value) {
      await request.put(`/admin/badges/${currentBadge.value.id}`, currentBadge.value)
      ElMessage.success('更新成功')
    } else {
      await request.post('/admin/badges', currentBadge.value)
      ElMessage.success('创建成功')
    }

    showEditorDialog.value = false
    loadBadges()
  } catch (error) {
    console.error('Failed to save badge:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadBadges()
})
</script>

<style scoped>
.badge-management {
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

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.badge-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.badge-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.badge-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-info {
  flex: 1;
  min-width: 0;
}

.badge-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.badge-description {
  font-size: 13px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.badge-condition {
  margin-top: auto;
}

.badge-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.badge-form {
  padding: 0 20px;
}
</style>
