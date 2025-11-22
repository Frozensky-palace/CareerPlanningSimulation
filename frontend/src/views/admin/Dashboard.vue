<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <TopNavBar @open-profile="showProfilePanel = true" />

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
              </el-icon>
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
              <div class="type-distribution">
                <div class="type-item">
                  <div class="type-header">
                    <el-tag type="primary">主线</el-tag>
                    <span class="type-count">{{ stats.scriptsByType.main || 0 }}</span>
                  </div>
                  <el-progress
                    :percentage="getScriptTypePercentage('main')"
                    :show-text="false"
                    color="#409EFF"
                  />
                </div>
                <div class="type-item">
                  <div class="type-header">
                    <el-tag>支线</el-tag>
                    <span class="type-count">{{ stats.scriptsByType.branch || 0 }}</span>
                  </div>
                  <el-progress
                    :percentage="getScriptTypePercentage('branch')"
                    :show-text="false"
                    color="#909399"
                  />
                </div>
                <div class="type-item">
                  <div class="type-header">
                    <el-tag type="warning">特殊</el-tag>
                    <span class="type-count">{{ stats.scriptsByType.special || 0 }}</span>
                  </div>
                  <el-progress
                    :percentage="getScriptTypePercentage('special')"
                    :show-text="false"
                    color="#E6A23C"
                  />
                </div>
              </div>
            </div>

            <!-- 场景分布 -->
            <div class="data-card">
              <h3 class="card-title">场景分布</h3>
              <div class="location-list">
                <div
                  v-for="(count, location) in stats.scriptsByLocation"
                  :key="location"
                  class="location-item"
                >
                  <span class="location-name">{{ getLocationLabel(location) }}</span>
                  <div class="location-bar-container">
                    <div
                      class="location-bar"
                      :style="{ width: getLocationPercentage(location) + '%' }"
                    ></div>
                  </div>
                  <span class="location-count">{{ count }}</span>
                </div>
              </div>
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

        <!-- 其他视图占位 -->
        <div v-else class="placeholder-view">
          <el-icon :size="60" class="text-gray-300"><WarnTriangleFilled /></el-icon>
          <p class="text-gray-400 mt-4">该功能正在开发中...</p>
        </div>
      </main>
    </div>

    <!-- 个人信息面板 -->
    <UserProfile v-model="showProfilePanel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  DataAnalysis,
  Document,
  Location,
  Medal,
  User,
  DocumentCopy,
  WarnTriangleFilled
} from '@element-plus/icons-vue'
import TopNavBar from '@/components/layout/TopNavBar.vue'
import UserProfile from '@/components/user/UserProfile.vue'
import ScriptManagement from '@/components/admin/ScriptManagement.vue'
import MapManagement from '@/components/admin/MapManagement.vue'
import request from '@/services/api'

const activeMenu = ref('dashboard')
const showProfilePanel = ref(false)

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

const getScriptTypePercentage = (type: string) => {
  const total = stats.value.totalScripts
  if (total === 0) return 0
  const count = stats.value.scriptsByType[type] || 0
  return Math.round((count / total) * 100)
}

const getLocationPercentage = (location: string) => {
  const total = Object.values(stats.value.scriptsByLocation).reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  const count = stats.value.scriptsByLocation[location] || 0
  return Math.round((count / total) * 100)
}

const getLocationLabel = (location: string) => {
  const labels: Record<string, string> = {
    gate: '校门口',
    plaza: '广场',
    library: '图书馆',
    dormitory: '宿舍',
    stadium: '体育馆',
    academic: '教学楼',
    campus: '校园'
  }
  return labels[location] || location
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadDashboardData = async () => {
  try {
    const res = await request.get('/admin/dashboard')
    stats.value = res.data.stats
    recentActivities.value = res.data.recentActivities || []
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

/* 剧本类型分布 */
.type-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-count {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

/* 场景分布 */
.location-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.location-name {
  width: 80px;
  font-size: 13px;
  color: #606266;
}

.location-bar-container {
  flex: 1;
  height: 20px;
  background: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.location-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.3s;
}

.location-count {
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
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
