<template>
  <header class="top-nav-bar">
    <div class="nav-container">
      <!-- 左侧：Logo 和标题 -->
      <div class="nav-left">
        <div class="logo-section">
          <el-icon :size="28" class="logo-icon">
            <School />
          </el-icon>
          <span class="title">大学生活模拟</span>
        </div>
      </div>

      <!-- 中间：游戏信息（仅在游戏中显示） -->
      <div v-if="showGameInfo" class="nav-center">
        <div class="game-info">
          <div class="info-item">
            <el-icon :size="14"><Calendar /></el-icon>
            <span>第 {{ currentSemester }} 学期</span>
          </div>
          <div class="info-item">
            <el-icon :size="14"><Clock /></el-icon>
            <span>第 {{ currentWeek }} 周</span>
          </div>
          <div class="info-item">
            <el-icon :size="14"><Document /></el-icon>
            <span>剩余 {{ remainingEvents }} 事件</span>
          </div>
        </div>
      </div>

      <!-- 右侧：用户信息和菜单 -->
      <div class="nav-right">
        <!-- 五维属性快速预览 -->
        <div v-if="showAttributes" class="attributes-preview">
          <div v-for="attr in attributes" :key="attr.key" class="attr-item" :style="{ color: attr.color }">
            <span class="attr-label">{{ attr.label }}</span>
            <span class="attr-value">{{ attr.value }}</span>
          </div>
        </div>

        <!-- 用户菜单 -->
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-menu">
            <el-avatar :size="32" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="username">{{ username }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
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
              <el-dropdown-item command="admin" divided>
                <el-icon><Setting /></el-icon>
                后台管理
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
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { useGameStore } from '@/stores/gameStore'

interface Props {
  showGameInfo?: boolean
  showAttributes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      emit('openProfile')
      break
    case 'saves':
      router.push('/initial-setup')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
      break
  }
}
</script>

<style scoped>
.top-nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
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
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.logo-section:hover {
  transform: scale(1.02);
}

.logo-icon {
  color: #fff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

/* 中间 */
.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.game-info {
  display: flex;
  gap: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.info-item .el-icon {
  opacity: 0.9;
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
  gap: 12px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.attr-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.attr-label {
  opacity: 0.9;
}

.attr-value {
  font-weight: 700;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.user-avatar {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 600;
}

.username {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  color: #fff;
  font-size: 12px;
  opacity: 0.8;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }

  .title {
    font-size: 16px;
  }

  .game-info {
    gap: 12px;
    padding: 6px 12px;
  }

  .attributes-preview {
    display: none;
  }
}
</style>
