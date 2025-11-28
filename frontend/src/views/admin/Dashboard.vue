<template>
  <div class="admin-dashboard">
    <!-- 管理后台专用顶部导航栏 -->
    <header class="admin-header">
      <div class="header-left">
        <el-icon :size="24" class="logo-icon"><School /></el-icon>
        <span class="header-title">大学生涯模拟 - 后台管理</span>
      </div>
      <div class="header-right">
        <span class="admin-name">{{ adminInfo?.username || '管理员' }}</span>
        <el-button text type="danger" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出
        </el-button>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="dashboard-container">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <el-icon :size="24" class="text-secondary-500"><Setting /></el-icon>
          <h2>后台管理</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="scripts">
            <el-icon><Document /></el-icon>
            <span>剧本管理</span>
          </el-menu-item>
          <el-menu-item index="map">
            <el-icon><Location /></el-icon>
            <span>地图按钮管理</span>
          </el-menu-item>
          <el-menu-item index="badges">
            <el-icon><Medal /></el-icon>
            <span>勋章管理</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="announcements">
            <el-icon><Bell /></el-icon>
            <span>公告管理</span>
          </el-menu-item>
          <el-menu-item index="credits">
            <el-icon><UserFilled /></el-icon>
            <span>制作者名单</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 右侧主要区域 -->
      <main class="dashboard-main">
        <!-- 仪表盘视图 -->
        <div v-if="activeMenu === 'dashboard'" class="dashboard-view">
          <h1 class="page-title">数据概览</h1>

          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon bg-blue-500">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">总用户数</span>
                <span class="stat-value">{{ stats.totalUsers }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon bg-green-500">
                <el-icon :size="32"><DocumentCopy /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">总存档数</span>
                <span class="stat-value">{{ stats.totalSaves }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon bg-purple-500">
                <el-icon :size="32"><Document /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">剧本总数</span>
                <span class="stat-value">{{ stats.totalScripts }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon bg-yellow-500">
                <el-icon :size="32"><Medal /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">勋章总数</span>
                <span class="stat-value">{{ stats.totalBadges }}</span>
              </div>
            </div>
          </div>

          <!-- 详细数据表格 -->
          <div class="data-sections">
            <!-- 剧本类型分布 -->
            <div class="data-card">
              <h3 class="card-title">剧本类型分布</h3>
              <div ref="typeChartRef" class="chart-container"></div>
            </div>

            <!-- 场景事件占比 -->
            <div class="data-card">
              <h3 class="card-title">场景事件占比</h3>
              <div ref="locationChartRef" class="chart-container"></div>
            </div>

            <!-- 最近活动 -->
            <div class="data-card full-width">
              <h3 class="card-title">最近活动</h3>
              <el-table :data="recentActivities" stripe class="activity-table">
                <el-table-column prop="username" label="用户" width="120" />
                <el-table-column prop="action" label="操作" width="150" />
                <el-table-column prop="saveName" label="存档" width="150" />
                <el-table-column prop="details" label="详情" />
                <el-table-column prop="createdAt" label="时间" width="180">
                  <template #default="scope">
                    {{ formatDateTime(scope.row.createdAt) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>

        <!-- 剧本管理视图 -->
        <div v-else-if="activeMenu === 'scripts'" class="scripts-view">
          <ScriptManagement />
        </div>

        <!-- 地图管理视图 -->
        <div v-else-if="activeMenu === 'map'" class="map-view">
          <MapManagement />
        </div>

        <!-- 勋章管理视图 -->
        <div v-else-if="activeMenu === 'badges'" class="badges-view">
          <BadgeManagement />
        </div>

        <!-- 用户管理视图 -->
        <div v-else-if="activeMenu === 'users'" class="users-view">
          <UserManagement />
        </div>

        <!-- 系统设置视图 -->
        <div v-else-if="activeMenu === 'settings'" class="settings-view">
          <SystemSettings />
        </div>

        <!-- 公告管理视图 -->
        <div v-else-if="activeMenu === 'announcements'" class="announcements-view">
          <AnnouncementManagement />
        </div>

        <!-- 制作者名单视图 -->
        <div v-else-if="activeMenu === 'credits'" class="credits-view">
          <CreditsManagement />
        </div>

        <!-- 其他视图占位 -->
        <div v-else class="placeholder-view">
          <el-icon :size="60" class="text-gray-300"><WarnTriangleFilled /></el-icon>
          <p class="text-gray-400 mt-4">该功能正在开发中...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Setting,
  DataAnalysis,
  Document,
  Location,
  Medal,
  User,
  UserFilled,
  DocumentCopy,
  WarnTriangleFilled,
  School,
  SwitchButton,
  Bell
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import ScriptManagement from '@/components/admin/ScriptManagement.vue'
import MapManagement from '@/components/admin/MapManagement.vue'
import SystemSettings from '@/components/admin/SystemSettings.vue'
import BadgeManagement from '@/components/admin/BadgeManagement.vue'
import UserManagement from '@/components/admin/UserManagement.vue'
import AnnouncementManagement from '@/components/admin/AnnouncementManagement.vue'
import CreditsManagement from '@/components/admin/CreditsManagement.vue'
import request from '@/services/api'
import { getSceneLabel, SCENE_CONFIGS } from '@/config/scenes'

const router = useRouter()
const activeMenu = ref('dashboard')
const typeChartRef = ref<HTMLDivElement>()
const locationChartRef = ref<HTMLDivElement>()

// 获取管理员信息
const adminInfo = computed(() => {
  const info = localStorage.getItem('adminInfo')
  return info ? JSON.parse(info) : null
})

// 退出登录
const handleLogout = async () => {
  try {
    await request.post('/admin/logout')
  } catch (error) {
    // 忽略错误，直接清除本地存储
  }
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminInfo')
  ElMessage.success('已退出登录')
  router.push('/admin')
}

const stats = ref({
  totalUsers: 0,
  totalSaves: 0,
  totalScripts: 0,
  totalBadges: 0,
  scriptsByType: {} as Record<string, number>,
  scriptsByLocation: {} as Record<string, number>
})

const recentActivities = ref<any[]>([])

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const getLocationLabel = (location: string) => {
  return getSceneLabel(location)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化剧本类型分布图表
const initTypeChart = () => {
  if (!typeChartRef.value) return

  const chart = echarts.init(typeChartRef.value)
  const data = [
    { value: stats.value.scriptsByType.main || 0, name: '主线剧本', itemStyle: { color: '#409EFF' } },
    { value: stats.value.scriptsByType.branch || 0, name: '支线剧本', itemStyle: { color: '#909399' } },
    { value: stats.value.scriptsByType.special || 0, name: '特殊剧本', itemStyle: { color: '#E6A23C' } }
  ]

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: data,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx) => idx * 100
      }
    ]
  }

  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => chart.resize())
}

// 初始化场景分布图表（场景事件占比饼图）
const initLocationChart = () => {
  if (!locationChartRef.value) return

  const chart = echarts.init(locationChartRef.value)

  // 使用场景配置中的颜色
  const getSceneColor = (location: string) => {
    const scene = SCENE_CONFIGS.find(s => s.location === location || s.id === location)
    return scene?.color || '#909399'
  }

  // 计算总事件数（用于tooltip显示）
  const totalEvents = Object.values(stats.value.scriptsByLocation).reduce((sum, count) => sum + (count as number), 0)

  const data = Object.entries(stats.value.scriptsByLocation).map(([location, count]) => ({
    value: count,
    name: getLocationLabel(location),
    itemStyle: { color: getSceneColor(location) }
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = totalEvents > 0 ? ((params.value / totalEvents) * 100).toFixed(1) : '0'
        return `${params.name}: ${params.value} (${percent}%)`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center',
      type: 'scroll'
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: data,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx) => idx * 100
      }
    ]
  }

  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => chart.resize())
}

const loadDashboardData = async () => {
  try {
    const res = await request.get('/admin/dashboard')
    stats.value = res.data.stats
    recentActivities.value = res.data.recentActivities || []

    // 数据加载后初始化图表
    await nextTick()
    initTypeChart()
    initLocationChart()
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    ElMessage.error('加载仪表盘数据失败')
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

/* 管理后台顶部导航 */
.admin-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  color: #1A8FFF;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name {
  font-size: 14px;
  color: #606266;
}

.dashboard-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.admin-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.admin-menu {
  flex: 1;
  border: none;
}

.admin-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
}

/* 主要内容区 */
.dashboard-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 24px 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

/* 数据卡片 */
.data-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.data-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.data-card.full-width {
  grid-column: 1 / -1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 300px;
}

/* 活动表格 */
.activity-table {
  width: 100%;
}

/* 占位视图 */
.placeholder-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}
</style>
