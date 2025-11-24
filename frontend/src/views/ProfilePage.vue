<template>
  <div class="profile-page min-h-screen bg-primary-light">
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-gray-100 py-3 px-6">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-icon :size="20" class="text-secondary-500 cursor-pointer hover:opacity-70" @click="goBack">
            <ArrowLeft />
          </el-icon>
          <span class="font-semibold text-lg text-gray-800">个人信息</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 左侧：基本信息 -->
        <div class="profile-card">
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>基本信息</span>
          </div>
          <div class="card-body">
            <div class="user-avatar-section">
              <div class="avatar-large">
                <el-icon :size="60"><UserFilled /></el-icon>
              </div>
              <div class="user-basic-info">
                <h2 class="username">{{ userStore.username }}</h2>
                <p class="user-email">{{ userStore.user?.email || '未设置邮箱' }}</p>
                <p class="user-created">注册于 {{ formatDate(userStore.user?.createdAt) }}</p>
              </div>
            </div>

            <div class="info-list">
              <div class="info-item">
                <span class="info-label">用户ID</span>
                <span class="info-value">{{ userStore.userId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">账号状态</span>
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：存档统计 -->
        <div class="profile-card">
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>游戏数据</span>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ saves.length }}</div>
                <div class="stat-label">存档数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ completedScriptsCount }}</div>
                <div class="stat-label">已完成剧本</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ unlockedBadgesCount }}</div>
                <div class="stat-label">已获勋章</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 五维雷达图 -->
        <div class="profile-card md:col-span-2">
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>五维成长数据</span>
          </div>
          <div class="card-body">
            <template v-if="currentSave">
              <div class="radar-section">
                <div ref="radarChartRef" class="radar-chart"></div>
                <div class="attributes-detail">
                  <div
                    v-for="(item, index) in attributesList"
                    :key="index"
                    class="attr-row"
                  >
                    <div class="attr-info">
                      <span class="attr-dot" :style="{ background: item.color }"></span>
                      <span class="attr-name">{{ item.label }}</span>
                    </div>
                    <div class="attr-bar-wrapper">
                      <div
                        class="attr-bar"
                        :style="{ width: `${item.value}%`, background: item.color }"
                      ></div>
                    </div>
                    <span class="attr-value" :style="{ color: item.color }">{{ item.value }}</span>
                  </div>
                </div>
              </div>
              <div class="current-save-info">
                <el-tag type="info">当前存档: {{ currentSave.name }}</el-tag>
                <span class="save-progress">
                  第 {{ currentSave.semester }} 学期 · 第 {{ currentSave.week }} 周
                </span>
              </div>
            </template>
            <template v-else>
              <div class="empty-state">
                <el-icon :size="48" class="text-gray-300"><TrendCharts /></el-icon>
                <p class="mt-4 text-gray-500">暂无存档数据</p>
                <p class="text-sm text-gray-400">开始游戏后可在此查看五维属性成长</p>
                <el-button type="primary" class="mt-4" @click="goToSetup">开始游戏</el-button>
              </div>
            </template>
          </div>
        </div>

        <!-- 存档列表 -->
        <div class="profile-card md:col-span-2">
          <div class="card-header">
            <el-icon><FolderOpened /></el-icon>
            <span>我的存档</span>
          </div>
          <div class="card-body">
            <div v-if="saves.length === 0" class="empty-state">
              <p class="text-gray-500">暂无存档</p>
            </div>
            <div v-else class="saves-list">
              <div
                v-for="save in saves"
                :key="save.id"
                class="save-item"
                :class="{ active: currentSave?.id === save.id }"
                @click="selectSave(save)"
              >
                <div class="save-info">
                  <div class="save-name">{{ save.name }}</div>
                  <div class="save-meta">
                    第 {{ save.semester }} 学期 · 第 {{ save.week }} 周
                  </div>
                </div>
                <div class="save-attrs">
                  <span class="attr" style="color: #F56C6C">德{{ save.attributes.de }}</span>
                  <span class="attr" style="color: #409EFF">智{{ save.attributes.zhi }}</span>
                  <span class="attr" style="color: #67C23A">体{{ save.attributes.ti }}</span>
                  <span class="attr" style="color: #E6A23C">美{{ save.attributes.mei }}</span>
                  <span class="attr" style="color: #909399">劳{{ save.attributes.lao }}</span>
                </div>
                <el-tag v-if="currentSave?.id === save.id" type="primary" size="small">当前</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  User,
  UserFilled,
  Document,
  TrendCharts,
  FolderOpened
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/userStore'
import { useGameStore } from '@/stores/gameStore'
import request from '@/services/api'
import type { Save } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const saves = ref<Save[]>([])
const radarChartRef = ref<HTMLDivElement>()
let radarChart: echarts.ECharts | null = null

const currentSave = computed(() => gameStore.currentSave)

const completedScriptsCount = computed(() => {
  return saves.value.reduce((sum, save) => sum + (save.completedScripts?.length || 0), 0)
})

const unlockedBadgesCount = computed(() => {
  return saves.value.reduce((sum, save) => sum + (save.unlockedBadges?.length || 0), 0)
})

const attributesList = computed(() => {
  if (!currentSave.value) return []
  const attrs = currentSave.value.attributes
  return [
    { key: 'de', label: '德育', value: attrs.de, color: '#F56C6C' },
    { key: 'zhi', label: '智育', value: attrs.zhi, color: '#409EFF' },
    { key: 'ti', label: '体育', value: attrs.ti, color: '#67C23A' },
    { key: 'mei', label: '美育', value: attrs.mei, color: '#E6A23C' },
    { key: 'lao', label: '劳育', value: attrs.lao, color: '#909399' }
  ]
})

const formatDate = (date: string | undefined) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

const goBack = () => {
  router.push('/')
}

const goToSetup = () => {
  router.push('/initial-setup')
}

const selectSave = (save: Save) => {
  gameStore.setCurrentSave(save)
  nextTick(() => {
    initRadarChart()
  })
}

const loadSaves = async () => {
  try {
    const res = await request.get('/saves')
    saves.value = res.data.saves || []
  } catch (error) {
    console.error('Failed to load saves:', error)
  }
}

const initRadarChart = () => {
  if (!radarChartRef.value || !currentSave.value) return

  if (radarChart) {
    radarChart.dispose()
  }

  radarChart = echarts.init(radarChartRef.value)

  const attrs = currentSave.value.attributes
  const data = [attrs.de, attrs.zhi, attrs.ti, attrs.mei, attrs.lao]

  const option: echarts.EChartsOption = {
    radar: {
      indicator: [
        { name: '德育', max: 100, color: '#F56C6C' },
        { name: '智育', max: 100, color: '#409EFF' },
        { name: '体育', max: 100, color: '#67C23A' },
        { name: '美育', max: 100, color: '#E6A23C' },
        { name: '劳育', max: 100, color: '#909399' }
      ],
      radius: '70%',
      axisName: {
        color: '#333',
        fontSize: 13,
        fontWeight: 'bold'
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(26, 143, 255, 0.02)', 'rgba(26, 143, 255, 0.05)', 'rgba(26, 143, 255, 0.08)', 'rgba(26, 143, 255, 0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(26, 143, 255, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(26, 143, 255, 0.3)'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data,
            name: '当前属性',
            areaStyle: {
              color: 'rgba(26, 143, 255, 0.35)'
            },
            lineStyle: {
              color: '#1A8FFF',
              width: 2
            },
            itemStyle: {
              color: '#1A8FFF'
            },
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      }
    ]
  }

  radarChart.setOption(option)
}

watch(currentSave, () => {
  nextTick(() => {
    initRadarChart()
  })
}, { deep: true })

onMounted(() => {
  loadSaves()
  nextTick(() => {
    initRadarChart()
  })

  window.addEventListener('resize', () => {
    radarChart?.resize()
  })
})
</script>

<style scoped>
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
  color: white;
  font-weight: 600;
  font-size: 15px;
}

.card-body {
  padding: 20px;
}

/* 用户头像区域 */
.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A8FFF;
}

.user-basic-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
}

.user-email {
  color: #606266;
  font-size: 14px;
  margin: 0 0 4px;
}

.user-created {
  color: #909399;
  font-size: 13px;
  margin: 0;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 600;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1A8FFF;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #606266;
}

/* 雷达图区域 */
.radar-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
}

.radar-chart {
  width: 100%;
  height: 300px;
}

.attributes-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attr-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attr-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 60px;
}

.attr-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.attr-name {
  font-size: 14px;
  color: #303133;
}

.attr-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.attr-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.attr-value {
  font-size: 16px;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
}

.current-save-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.save-progress {
  color: #606266;
  font-size: 14px;
}

/* 存档列表 */
.saves-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.save-item:hover {
  background: #f0f7ff;
}

.save-item.active {
  border-color: #1A8FFF;
  background: #f0f7ff;
}

.save-info {
  flex: 1;
}

.save-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.save-meta {
  font-size: 13px;
  color: #909399;
}

.save-attrs {
  display: flex;
  gap: 12px;
}

.save-attrs .attr {
  font-size: 13px;
  font-weight: 600;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .radar-section {
    grid-template-columns: 1fr;
  }

  .radar-chart {
    height: 250px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .user-avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
