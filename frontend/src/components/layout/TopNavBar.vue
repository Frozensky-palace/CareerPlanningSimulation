<template>
  <header class="top-nav-bar">
    <div class="nav-container">
      <!-- 左侧：Logo 和标题 -->
      <div class="nav-left">
        <div class="logo-section" @click="handleLogoClick">
          <el-icon :size="24" class="logo-icon">
            <School />
          </el-icon>
          <span class="title">大学生涯模拟</span>
        </div>
      </div>

      <!-- 中间：游戏信息（仅在游戏中显示） -->
      <div v-if="showGameInfo" class="nav-center">
        <div class="game-info">
          <div class="info-item">
            <el-icon :size="16"><Calendar /></el-icon>
            <span>第 {{ currentSemester }} 学期</span>
          </div>
          <div class="divider"></div>
          <div class="info-item">
            <el-icon :size="16"><Clock /></el-icon>
            <span>第 {{ currentWeek }} 周</span>
          </div>
          <div class="divider"></div>
          <div class="info-item">
            <el-icon :size="16"><Document /></el-icon>
            <span>{{ remainingEvents }} 事件</span>
          </div>
        </div>
      </div>

      <!-- 右侧：用户信息和菜单 -->
      <div class="nav-right">
        <!-- 五维属性快速预览 -->
        <div v-if="showAttributes" class="attributes-preview">
          <div v-for="attr in attributes" :key="attr.key" class="attr-item">
            <span class="attr-dot" :style="{ backgroundColor: attr.color }"></span>
            <span class="attr-label">{{ attr.label }}</span>
            <span class="attr-value">{{ attr.value }}</span>
          </div>
        </div>

        <!-- 用户菜单 -->
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-menu">
            <el-avatar :size="28" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="username">{{ username }}</span>
            <el-icon :size="14" class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="saves" v-if="showGameInfo">
                <el-icon><Folder /></el-icon>
                切换存档
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  School,
  Calendar,
  Clock,
  Document,
  User,
  ArrowDown,
  Folder,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { useGameStore } from '@/stores/gameStore'

interface Props {
  showGameInfo?: boolean
  showAttributes?: boolean
}

withDefaults(defineProps<Props>(), {
  showGameInfo: false,
  showAttributes: false
})

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const username = computed(() => userStore.username || '游客')
const currentSemester = computed(() => gameStore.currentSemester)
const currentWeek = computed(() => gameStore.currentWeek)
const remainingEvents = computed(() => gameStore.remainingEvents)

const attributes = computed(() => {
  const attrs = gameStore.currentAttributes
  if (!attrs) return []
  return [
    { key: 'de', label: '德', value: attrs.de, color: '#F56C6C' },
    { key: 'zhi', label: '智', value: attrs.zhi, color: '#409EFF' },
    { key: 'ti', label: '体', value: attrs.ti, color: '#67C23A' },
    { key: 'mei', label: '美', value: attrs.mei, color: '#E6A23C' },
    { key: 'lao', label: '劳', value: attrs.lao, color: '#909399' }
  ]
})

const emit = defineEmits<{
  openProfile: []
}>()

const handleLogoClick = () => {
  if (userStore.isLoggedIn) {
    router.push('/initial-setup')
  } else {
    router.push('/')
  }
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      emit('openProfile')
      break
    case 'saves':
      gameStore.clearCurrentSave()
      router.push('/initial-setup')
      break
    case 'logout':
      userStore.logout()
      gameStore.clearCurrentSave()
      router.push('/login')
      ElMessage.success('已退出登录')
      break
  }
}
</script>

<style scoped>
.top-nav-bar {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* 左侧 */
.nav-left {
  flex-shrink: 0;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo-section:hover {
  opacity: 0.7;
}

.logo-icon {
  color: #1A8FFF;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.3px;
}

/* 中间 */
.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #495057;
  font-size: 13px;
  font-weight: 500;
}

.info-item .el-icon {
  color: #1A8FFF;
}

.divider {
  width: 1px;
  height: 14px;
  background: #dee2e6;
}

/* 右侧 */
.nav-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.attributes-preview {
  display: flex;
  gap: 14px;
  padding: 6px 14px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.attr-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #495057;
}

.attr-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.attr-label {
  font-weight: 500;
}

.attr-value {
  font-weight: 700;
  color: #2c3e50;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 5px;
  background: #f8f9fa;
  border-radius: 14px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s;
}

.user-menu:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.user-avatar {
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
  color: #fff;
}

.username {
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  color: #6c757d;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
    height: 52px;
  }

  .title {
    font-size: 16px;
  }

  .game-info {
    gap: 10px;
    padding: 5px 12px;
  }

  .info-item {
    font-size: 12px;
  }

  .attributes-preview {
    display: none;
  }
}
</style>
