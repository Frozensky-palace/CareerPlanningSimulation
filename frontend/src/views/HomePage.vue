<template>
  <div class="home-page">
    <!-- 背景图片 -->
    <div class="hero-background"></div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 主标题区域 -->
      <div class="title-section" :class="{ 'fade-in': mounted }">
        <h1 class="main-title">大学生涯数字孪生平台</h1>
        <p class="sub-title">模拟你的大学四年，探索不同选择带来的成长轨迹</p>
      </div>

      <!-- 三栏布局 -->
      <div class="content-wrapper" :class="{ 'slide-up': mounted }">
      <!-- 左侧栏：个人账号状态 + 公告 -->
      <aside class="left-panel">
        <!-- 账号状态卡片 -->
        <div class="panel-card account-card">
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>账号状态</span>
          </div>
          <div class="card-body">
            <template v-if="userStore.isLoggedIn">
              <div class="user-info">
                <div class="avatar-wrapper">
                  <el-icon :size="40" class="avatar-icon"><UserFilled /></el-icon>
                </div>
                <div class="user-details">
                  <span class="username">{{ userStore.username }}</span>
                  <span class="user-status">已登录</span>
                </div>
              </div>
              <el-button type="danger" plain size="small" @click="handleLogout" class="logout-btn">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </template>
            <template v-else>
              <div class="login-prompt">
                <p>您尚未登录</p>
                <el-button type="primary" @click="handleLogin" class="login-btn">
                  <el-icon><User /></el-icon>
                  立即登录
                </el-button>
              </div>
            </template>
          </div>
        </div>

        <!-- 公告栏 -->
        <div class="panel-card announcement-card">
          <div class="card-header">
            <el-icon><Bell /></el-icon>
            <span>公告栏</span>
          </div>
          <div class="card-body announcement-list">
            <div v-if="announcements.length === 0" class="empty-state">
              暂无公告
            </div>
            <div
              v-for="(item, index) in announcements"
              :key="index"
              class="announcement-item"
              @click="showAnnouncementDetail(item)"
            >
              <div class="announcement-title">{{ item.title }}</div>
              <div class="announcement-date">{{ formatDate(item.createdAt) }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中间菜单区 -->
      <main class="center-panel">
        <div class="menu-grid">
          <button
            class="menu-btn primary-btn"
            @click="handleStartSimulation"
            :disabled="!userStore.isLoggedIn"
          >
            <el-icon :size="28"><VideoPlay /></el-icon>
            <span>开始模拟</span>
          </button>

          <button
            class="menu-btn"
            @click="handleContinueSimulation"
            :disabled="!userStore.isLoggedIn || !gameStore.currentSave"
          >
            <el-icon :size="28"><RefreshRight /></el-icon>
            <span>继续模拟</span>
          </button>

          <button
            class="menu-btn"
            @click="handleLoadSave"
            :disabled="!userStore.isLoggedIn"
          >
            <el-icon :size="28"><FolderOpened /></el-icon>
            <span>载入存档</span>
          </button>

          <button
            class="menu-btn"
            @click="handleProfile"
            :disabled="!userStore.isLoggedIn"
          >
            <el-icon :size="28"><User /></el-icon>
            <span>个人信息</span>
          </button>

          <button class="menu-btn" @click="handleAdmin">
            <el-icon :size="28"><Setting /></el-icon>
            <span>后台管理</span>
          </button>

          <button class="menu-btn" @click="handleWorkshop" disabled>
            <el-icon :size="28"><Box /></el-icon>
            <span>创意工坊</span>
            <span class="badge-soon">即将推出</span>
          </button>

          <button class="menu-btn" @click="showCredits">
            <el-icon :size="28"><InfoFilled /></el-icon>
            <span>制作者名单</span>
          </button>

          <button class="menu-btn exit-btn" @click="handleExit">
            <el-icon :size="28"><Close /></el-icon>
            <span>退出</span>
          </button>
        </div>
      </main>

      <!-- 右侧栏：五维雷达图 + Mod -->
      <aside class="right-panel">
        <!-- 五维成长系统 -->
        <div class="panel-card radar-card">
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>五维成长系统</span>
          </div>
          <div class="card-body">
            <template v-if="currentAttributes">
              <div ref="radarChartRef" class="radar-chart"></div>
              <div class="attributes-summary">
                <div class="attr-item" v-for="(value, key) in currentAttributes" :key="key">
                  <span class="attr-label" :style="{ color: getAttrColor(key as string) }">
                    {{ getAttrLabel(key as string) }}
                  </span>
                  <span class="attr-value">{{ value }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="empty-state">
                <p>暂无存档数据</p>
                <p class="hint">开始模拟后可查看五维属性</p>
              </div>
            </template>
          </div>
        </div>

        <!-- 已加载Mod -->
        <div class="panel-card mod-card">
          <div class="card-header">
            <el-icon><Cpu /></el-icon>
            <span>已加载Mod</span>
          </div>
          <div class="card-body">
            <div class="empty-state">
              <p>暂无加载的Mod</p>
              <p class="hint">创意工坊即将推出</p>
            </div>
          </div>
        </div>
      </aside>
    </div>

      <!-- 底部版权 -->
      <footer class="page-footer">
        <span>© 2024 易班·大学生涯数字孪生平台</span>
      </footer>
    </div>

    <!-- 制作者名单对话框 -->
    <el-dialog
      v-model="creditsDialogVisible"
      title="制作者名单"
      width="500px"
      class="credits-dialog"
    >
      <div class="credits-content">
        <div v-if="credits.length === 0" class="empty-state">暂无制作者信息</div>
        <div v-for="(group, index) in credits" :key="index" class="credits-group">
          <h4 class="credits-group-title">{{ group.title }}</h4>
          <div class="credits-members">
            <span v-for="(member, mIndex) in group.members" :key="mIndex" class="credits-member">
              {{ member }}
            </span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 公告详情对话框 -->
    <el-dialog
      v-model="announcementDialogVisible"
      :title="currentAnnouncement?.title || '公告详情'"
      width="600px"
      class="announcement-dialog"
    >
      <div class="announcement-detail">
        <div class="announcement-meta">
          <span>发布时间：{{ formatDate(currentAnnouncement?.createdAt) }}</span>
        </div>
        <div class="announcement-content" v-html="currentAnnouncement?.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  UserFilled,
  Bell,
  VideoPlay,
  RefreshRight,
  FolderOpened,
  Setting,
  Box,
  InfoFilled,
  Close,
  TrendCharts,
  Cpu,
  SwitchButton
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/userStore'
import { useGameStore } from '@/stores/gameStore'
import request from '@/services/api'
import { ATTRIBUTE_CONFIG } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

// 公告相关
const announcements = ref<any[]>([])
const announcementDialogVisible = ref(false)
const currentAnnouncement = ref<any>(null)

// 制作者名单
const credits = ref<any[]>([])
const creditsDialogVisible = ref(false)

// 动画状态
const mounted = ref(false)

// 雷达图
const radarChartRef = ref<HTMLDivElement>()
let radarChart: echarts.ECharts | null = null

// 计算当前存档的属性
const currentAttributes = computed(() => gameStore.currentAttributes)

// 获取属性颜色
const getAttrColor = (key: string) => {
  return ATTRIBUTE_CONFIG[key as keyof typeof ATTRIBUTE_CONFIG]?.color || '#409EFF'
}

// 获取属性标签
const getAttrLabel = (key: string) => {
  return ATTRIBUTE_CONFIG[key as keyof typeof ATTRIBUTE_CONFIG]?.key || key
}

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value) return

  // 如果没有当前属性，清理已存在的图表
  if (!currentAttributes.value) {
    if (radarChart) {
      radarChart.dispose()
      radarChart = null
    }
    return
  }

  if (radarChart) {
    radarChart.dispose()
  }

  try {
    radarChart = echarts.init(radarChartRef.value)

    const attrs = currentAttributes.value
    const data = [attrs.de || 0, attrs.zhi || 0, attrs.ti || 0, attrs.mei || 0, attrs.lao || 0]

    const option: echarts.EChartsOption = {
      radar: {
        indicator: [
          { name: '德育', max: 100, color: '#F56C6C' },
          { name: '智育', max: 100, color: '#409EFF' },
          { name: '体育', max: 100, color: '#67C23A' },
          { name: '美育', max: 100, color: '#E6A23C' },
          { name: '劳育', max: 100, color: '#909399' }
        ],
        radius: '65%',
        axisName: {
          color: '#333',
          fontSize: 12
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(26, 143, 255, 0.05)', 'rgba(26, 143, 255, 0.1)']
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
                color: 'rgba(26, 143, 255, 0.3)'
              },
              lineStyle: {
                color: '#1A8FFF',
                width: 2
              },
              itemStyle: {
                color: '#1A8FFF'
              }
            }
          ]
        }
      ]
    }

    radarChart.setOption(option)
  } catch (error) {
    console.error('Failed to initialize radar chart:', error)
  }
}

// 监听属性变化，更新雷达图
watch(currentAttributes, () => {
  nextTick(() => {
    initRadarChart()
  })
}, { deep: true })

// 加载公告
const loadAnnouncements = async () => {
  try {
    const res = await request.get('/public/announcements')
    announcements.value = res.data.announcements || []
  } catch (error) {
    console.error('Failed to load announcements:', error)
  }
}

// 加载制作者名单
const loadCredits = async () => {
  try {
    const res = await request.get('/public/credits')
    credits.value = res.data.credits || []
  } catch (error) {
    console.error('Failed to load credits:', error)
  }
}

// 显示公告详情
const showAnnouncementDetail = (item: any) => {
  currentAnnouncement.value = item
  announcementDialogVisible.value = true
}

// 显示制作者名单
const showCredits = () => {
  creditsDialogVisible.value = true
}

// 登录
const handleLogin = () => {
  router.push('/login')
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    userStore.logout()
    gameStore.clearCurrentSave()
    ElMessage.success('已退出登录')
  } catch {
    // 用户取消
  }
}

// 开始模拟
const handleStartSimulation = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/initial-setup')
}

// 继续模拟
const handleContinueSimulation = () => {
  if (!gameStore.currentSave) {
    ElMessage.warning('没有正在进行的存档')
    return
  }
  router.push('/campus-map')
}

// 载入存档
const handleLoadSave = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  router.push('/initial-setup')
}

// 个人信息
const handleProfile = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  router.push('/profile')
}

// 后台管理
const handleAdmin = () => {
  router.push('/admin')
}

// 创意工坊
const handleWorkshop = () => {
  ElMessage.info('创意工坊即将推出，敬请期待！')
}

// 退出
const handleExit = () => {
  ElMessageBox.confirm('确定要退出吗？', '提示', {
    type: 'warning'
  }).then(() => {
    window.close()
    // 如果无法关闭窗口，则跳转到关于页面或其他
    ElMessage.info('感谢使用！')
  }).catch(() => {})
}

onMounted(async () => {
  // 延迟显示动画
  setTimeout(() => {
    mounted.value = true
  }, 100)

  // 加载数据
  await Promise.allSettled([
    loadAnnouncements(),
    loadCredits()
  ])

  // 初始化雷达图
  await nextTick()
  initRadarChart()

  // 响应式处理
  window.addEventListener('resize', () => {
    radarChart?.resize()
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

/* 背景图片 */
.hero-background {
  position: absolute;
  inset: 0;
  background: url('/images/hero-background.webp') center/cover no-repeat;
  z-index: 0;
}

/* 主容器 */
.main-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 标题区域 */
.title-section {
  text-align: center;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.title-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.main-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.75rem;
  letter-spacing: 3px;
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 3px 10px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.4);
}

.sub-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  margin: 0;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* 三栏布局 */
.content-wrapper {
  display: grid;
  grid-template-columns: 300px auto 300px;
  gap: 3rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0.2s;
  align-items: start;
  justify-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper.slide-up {
  opacity: 1;
  transform: translateY(0);
}

/* 左右侧边栏 */
.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* 面板卡片 */
.panel-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.card-body {
  padding: 16px;
}

/* 账号状态卡片 */
.account-card {
  min-height: 180px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  color: #1A8FFF;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.user-status {
  font-size: 12px;
  color: #67C23A;
}

.logout-btn {
  width: 100%;
}

.login-prompt {
  text-align: center;
}

.login-prompt p {
  color: #909399;
  margin-bottom: 12px;
}

.login-btn {
  width: 100%;
}

/* 公告栏 */
.announcement-card {
  flex: 1;
}

.announcement-list {
  max-height: 280px;
  overflow-y: auto;
}

.announcement-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.announcement-item:hover {
  background: #f5f7fa;
  margin: 0 -16px;
  padding: 10px 16px;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announcement-date {
  font-size: 12px;
  color: #909399;
}

/* 中间菜单区 */
.center-panel {
  display: flex;
  align-items: start;
  justify-content: center;
  padding: 0;
  width: 100%;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 680px;
}

.menu-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 36px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(26, 143, 255, 0.25);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(26, 143, 255, 0.25);
  border-color: #1A8FFF;
  background: rgba(255, 255, 255, 0.95);
}

.menu-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-btn .el-icon {
  color: #1A8FFF;
  font-size: 26px;
}

.menu-btn.primary-btn {
  background: rgba(26, 143, 255, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  border-color: rgba(26, 143, 255, 0.3);
}

.menu-btn.primary-btn .el-icon {
  color: white;
}

.menu-btn.primary-btn:hover:not(:disabled) {
  background: rgba(0, 112, 224, 0.95);
  box-shadow: 0 6px 20px rgba(26, 143, 255, 0.4);
}

.menu-btn.exit-btn {
  border-color: rgba(245, 108, 108, 0.3);
}

.menu-btn.exit-btn .el-icon {
  color: #F56C6C;
}

.menu-btn.exit-btn:hover:not(:disabled) {
  border-color: #F56C6C;
  background: rgba(245, 108, 108, 0.05);
}

.badge-soon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  padding: 2px 6px;
  background: #E6A23C;
  color: white;
  border-radius: 4px;
  font-weight: 500;
}

/* 雷达图 */
.radar-card {
  flex: 1;
}

.radar-card .card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-chart {
  width: 100%;
  height: 240px;
  margin: 0 auto;
}

.attributes-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  width: 100%;
}

.attr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.attr-label {
  font-size: 12px;
  font-weight: 600;
}

.attr-value {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
}

/* Mod卡片 */
.mod-card {
  min-height: 180px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 4px;
}

/* 底部 */
.page-footer {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 1);
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4);
  margin-top: 1rem;
}

/* 对话框样式 */
.credits-content {
  max-height: 400px;
  overflow-y: auto;
}

.credits-group {
  margin-bottom: 20px;
}

.credits-group:last-child {
  margin-bottom: 0;
}

.credits-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A8FFF;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1A8FFF;
}

.credits-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.credits-member {
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #606266;
}

.announcement-detail {
  line-height: 1.8;
}

.announcement-meta {
  color: #909399;
  font-size: 13px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.announcement-content {
  color: #303133;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 1400px) {
  .content-wrapper {
    grid-template-columns: 280px auto 280px;
    gap: 2rem;
  }
}

@media (max-width: 1024px) {
  .home-page {
    padding: 1.5rem;
  }

  .main-container {
    gap: 1rem;
  }

  .content-wrapper {
    grid-template-columns: 260px auto 260px;
    gap: 1.5rem;
  }

  .main-title {
    font-size: 2.75rem;
  }

  .sub-title {
    font-size: 1.1rem;
  }

  .menu-grid {
    gap: 1rem;
  }

  .menu-btn {
    padding: 16px 12px;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 1rem;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }

  .left-panel,
  .right-panel {
    flex-direction: row;
    gap: 0.75rem;
  }

  .left-panel .panel-card,
  .right-panel .panel-card {
    flex: 1;
  }

  .main-title {
    font-size: 2.25rem;
  }

  .sub-title {
    font-size: 1rem;
  }

  .center-panel {
    padding: 1.5rem;
  }

  .menu-grid {
    gap: 1rem;
    max-width: 400px;
  }

  .menu-btn {
    padding: 16px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.5rem;
  }

  .sub-title {
    font-size: 0.85rem;
  }

  .left-panel,
  .right-panel {
    flex-direction: column;
  }

  .menu-btn {
    padding: 12px 8px;
    font-size: 12px;
  }

  .badge-soon {
    font-size: 9px;
    padding: 2px 4px;
  }
}
</style>
