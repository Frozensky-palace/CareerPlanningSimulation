<template>
  <el-dialog
    v-model="visible"
    title="个人资料"
    width="800px"
    :close-on-click-modal="false"
    class="profile-dialog"
  >
    <el-tabs v-model="activeTab" class="profile-tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="info">
        <div class="info-section">
          <div class="avatar-section">
            <el-avatar :size="100" class="user-avatar-large">
              <el-icon :size="50"><User /></el-icon>
            </el-avatar>
            <el-button text class="change-avatar-btn">更换头像</el-button>
          </div>

          <div class="info-details">
            <template v-if="!isEditingInfo">
              <div class="detail-item">
                <label>用户名</label>
                <span>{{ userStore.username }}</span>
              </div>
              <div class="detail-item">
                <label>邮箱</label>
                <span>{{ userStore.email || '未设置' }}</span>
              </div>
              <div class="detail-item">
                <label>注册时间</label>
                <span>{{ formatDate(userStore.createdAt) }}</span>
              </div>
              <el-button type="primary" @click="startEditInfo">编辑资料</el-button>
            </template>

            <template v-else>
              <el-form :model="editForm" label-position="top">
                <el-form-item label="用户名">
                  <el-input v-model="editForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="editForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="新密码（留空则不修改）">
                  <el-input v-model="editForm.password" type="password" placeholder="请输入新密码" show-password />
                </el-form-item>
              </el-form>
              <div class="edit-actions">
                <el-button @click="cancelEditInfo">取消</el-button>
                <el-button type="primary" @click="saveUserInfo" :loading="savingInfo">保存</el-button>
              </div>
            </template>
          </div>
        </div>
      </el-tab-pane>

      <!-- 游戏数据 -->
      <el-tab-pane label="游戏数据" name="stats">
        <div class="stats-section">
          <!-- 当前存档 -->
          <div v-if="currentSave" class="current-save">
            <h3>当前存档</h3>
            <div class="save-card">
              <div class="save-header">
                <span class="save-name">{{ currentSave.name }}</span>
                <el-tag type="success">大{{ Math.ceil(currentSave.semester / 2) }}</el-tag>
              </div>
              <div class="save-progress">
                <div class="progress-item">
                  <span class="label">学期</span>
                  <span class="value">{{ currentSave.semester }} / 8</span>
                </div>
                <div class="progress-item">
                  <span class="label">周数</span>
                  <span class="value">{{ currentSave.week }} / 16</span>
                </div>
                <div class="progress-item">
                  <span class="label">完成事件</span>
                  <span class="value">{{ currentSave.completedScripts.length }}</span>
                </div>
              </div>

              <!-- 五维属性雷达图 -->
              <div class="radar-chart-container">
                <div ref="radarChartRef" class="radar-chart"></div>
              </div>

              <!-- 五维属性数值 -->
              <div class="attributes-list">
                <div
                  v-for="attr in attributesData"
                  :key="attr.key"
                  class="attribute-item"
                >
                  <div class="attr-header">
                    <span class="attr-label" :style="{ color: attr.color }">{{ attr.label }}</span>
                    <span class="attr-value">{{ attr.value }}</span>
                  </div>
                  <el-progress
                    :percentage="attr.value"
                    :stroke-width="8"
                    :color="attr.color"
                    :show-text="false"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 游戏统计 -->
          <div class="game-statistics">
            <h3>游戏统计</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <el-icon class="stat-icon" color="#409EFF"><TrendCharts /></el-icon>
                <span class="stat-value">{{ totalSaves }}</span>
                <span class="stat-label">创建存档数</span>
              </div>
              <div class="stat-card">
                <el-icon class="stat-icon" color="#67C23A"><Trophy /></el-icon>
                <span class="stat-value">{{ unlockedBadgesCount }}</span>
                <span class="stat-label">解锁勋章</span>
              </div>
              <div class="stat-card">
                <el-icon class="stat-icon" color="#E6A23C"><Document /></el-icon>
                <span class="stat-value">{{ totalEventsCompleted }}</span>
                <span class="stat-label">完成事件</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 我的勋章 -->
      <el-tab-pane label="我的勋章" name="badges">
        <div class="badges-section">
          <div class="badges-stats">
            <span class="unlock-progress">
              已解锁 {{ unlockedBadges.length }} / {{ allBadges.length }} 个勋章
            </span>
            <el-progress
              :percentage="badgeProgress"
              :stroke-width="8"
              :color="badgeProgressColor"
            />
          </div>

          <div class="badges-grid">
            <div
              v-for="badge in allBadges"
              :key="badge.id"
              class="badge-item"
              :class="{ unlocked: isBadgeUnlocked(badge.id), locked: !isBadgeUnlocked(badge.id) }"
            >
              <div class="badge-icon">
                <el-icon :size="40">
                  <component :is="getBadgeIcon(badge.icon)" />
                </el-icon>
              </div>
              <div class="badge-info">
                <h4 class="badge-name">{{ isBadgeUnlocked(badge.id) ? badge.name : '???' }}</h4>
                <p class="badge-desc">{{ isBadgeUnlocked(badge.id) ? badge.description : '未解锁' }}</p>
              </div>
              <div v-if="isBadgeUnlocked(badge.id)" class="badge-unlocked-mark">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import {
  User,
  TrendCharts,
  Trophy,
  Document,
  CircleCheck,
  Medal,
  Star,
  Sunny,
  Tools,
  Flag,
  Promotion,
  Calendar,
  Reading
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { useGameStore } from '@/stores/gameStore'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import * as echarts from 'echarts'

const visible = defineModel<boolean>({ required: true })

const userStore = useUserStore()
const gameStore = useGameStore()

const activeTab = ref('info')
const allBadges = ref<any[]>([])
const unlockedBadges = ref<number[]>([])
const totalSaves = ref(0)

// 个人信息编辑
const isEditingInfo = ref(false)
const savingInfo = ref(false)
const editForm = ref({
  username: '',
  email: '',
  password: ''
})

// 雷达图
const radarChartRef = ref<HTMLElement>()
let radarChart: echarts.ECharts | null = null

const currentSave = computed(() => gameStore.currentSave)

const attributesData = computed(() => {
  const attrs = currentSave.value?.attributes
  if (!attrs) return []
  return [
    { key: 'de', label: '德育', value: attrs.de, color: '#F56C6C' },
    { key: 'zhi', label: '智育', value: attrs.zhi, color: '#409EFF' },
    { key: 'ti', label: '体育', value: attrs.ti, color: '#67C23A' },
    { key: 'mei', label: '美育', value: attrs.mei, color: '#E6A23C' },
    { key: 'lao', label: '劳育', value: attrs.lao, color: '#909399' }
  ]
})

const unlockedBadgesCount = computed(() => unlockedBadges.value.length)
const totalEventsCompleted = computed(() => currentSave.value?.completedScripts.length || 0)

const badgeProgress = computed(() => {
  if (allBadges.value.length === 0) return 0
  return Math.round((unlockedBadges.value.length / allBadges.value.length) * 100)
})

const badgeProgressColor = computed(() => {
  const progress = badgeProgress.value
  if (progress < 30) return '#F56C6C'
  if (progress < 70) return '#E6A23C'
  return '#67C23A'
})

const isBadgeUnlocked = (badgeId: number) => {
  // 优先使用 badge 对象的 unlocked 属性（后端返回的），作为备选使用本地列表
  const badge = allBadges.value.find((b: any) => b.id === badgeId)
  if (badge && badge.unlocked !== undefined) {
    return badge.unlocked
  }
  return unlockedBadges.value.includes(badgeId)
}

const getBadgeIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Trophy,
    Medal,
    Star,
    Sunny,
    Tools,
    Flag,
    Promotion,
    Calendar,
    Reading
  }
  return iconMap[iconName] || Trophy
}

const formatDate = (date?: string) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 个人信息编辑功能
const startEditInfo = () => {
  editForm.value = {
    username: userStore.username || '',
    email: userStore.email || '',
    password: ''
  }
  isEditingInfo.value = true
}

const cancelEditInfo = () => {
  isEditingInfo.value = false
}

const saveUserInfo = async () => {
  try {
    savingInfo.value = true
    const updateData: any = {}
    if (editForm.value.username) updateData.username = editForm.value.username
    if (editForm.value.email) updateData.email = editForm.value.email
    if (editForm.value.password) updateData.password = editForm.value.password

    await request.put('/auth/profile', updateData)

    // 更新本地store
    if (editForm.value.username) userStore.setUsername(editForm.value.username)
    if (editForm.value.email) userStore.setEmail(editForm.value.email)

    ElMessage.success('个人信息更新成功')
    isEditingInfo.value = false
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新失败')
  } finally {
    savingInfo.value = false
  }
}

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value) return

  if (radarChart) {
    radarChart.dispose()
  }

  radarChart = echarts.init(radarChartRef.value)

  const attrs = currentSave.value?.attributes
  if (!attrs) return

  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: '德育', max: 100 },
        { name: '智育', max: 100 },
        { name: '体育', max: 100 },
        { name: '美育', max: 100 },
        { name: '劳育', max: 100 }
      ],
      center: ['50%', '50%'],
      radius: '70%',
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#303133',
        fontSize: 14,
        fontWeight: 600
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#d1d5db'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [attrs.de, attrs.zhi, attrs.ti, attrs.mei, attrs.lao],
            name: '五维属性',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409EFF',
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
    ]
  }

  radarChart.setOption(option)
}

const loadBadges = async () => {
  try {
    const saveId = currentSave.value?.id
    console.log('[Badge] Loading badges for saveId:', saveId)
    if (!saveId) return

    const res = await request.get('/badges', { params: { saveId } })
    console.log('[Badge] Response:', res.data)
    allBadges.value = res.data?.badges || []

    // 从返回的badges中提取已解锁的勋章ID
    unlockedBadges.value = allBadges.value
      .filter((badge: any) => badge.unlocked)
      .map((badge: any) => badge.id)
    console.log('[Badge] Unlocked badges:', unlockedBadges.value)
  } catch (error) {
    console.error('Load badges error:', error)
  }
}

const loadSavesCount = async () => {
  try {
    const res = await request.get('/saves')
    totalSaves.value = res.data?.saves.length || 0
  } catch (error) {
    console.error('Load saves error:', error)
  }
}

// 监听tab切换到游戏数据时初始化雷达图
watch([activeTab, visible], ([newTab, isVisible]) => {
  if (newTab === 'stats' && isVisible) {
    nextTick(() => {
      setTimeout(() => {
        initRadarChart()
      }, 100)
    })
  }
})

// 监听属性变化重新绘制
watch(() => currentSave.value?.attributes, () => {
  if (activeTab.value === 'stats' && visible.value) {
    nextTick(() => {
      initRadarChart()
    })
  }
}, { deep: true })

// 监听勋章变化，重新加载勋章列表
watch(() => currentSave.value?.unlockedBadges, () => {
  if (visible.value) {
    loadBadges()
  }
}, { deep: true })

// 监听对话框打开，重新加载勋章
watch(visible, (isVisible) => {
  if (isVisible) {
    loadBadges()
    loadSavesCount()
  }
})

onMounted(() => {
  loadBadges()
  loadSavesCount()
})
</script>

<style scoped>
.profile-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.profile-tabs {
  min-height: 500px;
}

.profile-tabs :deep(.el-tabs__content) {
  padding: 20px;
}

/* 基本信息 */
.info-section {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-avatar-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.change-avatar-btn {
  font-size: 12px;
}

.info-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.detail-item span {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 游戏数据 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-save h3,
.game-statistics h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.save-card {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
}

.save-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.save-name {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.save-progress {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-item .label {
  font-size: 12px;
  color: #909399;
}

.progress-item .value {
  font-size: 16px;
  font-weight: 700;
  color: #409EFF;
}

/* 雷达图 */
.radar-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.radar-chart {
  width: 400px;
  height: 320px;
}

/* 五维属性数值列表 */
.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.attribute-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attr-label {
  font-size: 14px;
  font-weight: 600;
}

.attr-value {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 勋章 */
.badges-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badges-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
}

.unlock-progress {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.badge-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.badge-item.unlocked {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4ff 100%);
  border-color: #409EFF;
}

.badge-item.locked {
  background: #f5f7fa;
  opacity: 0.6;
}

.badge-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
}

.badge-item.locked .badge-icon {
  background: #dcdfe6;
  color: #909399;
}

.badge-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.badge-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.badge-unlocked-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
}
</style>
