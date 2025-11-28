<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    class="scene-events-dialog"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <!-- 场景头部信息 -->
    <div v-if="scene" class="scene-header" :style="{ '--scene-color': scene.color }">
      <div class="scene-icon-wrapper">
        <img
          v-if="iconUrl"
          :src="iconUrl"
          :alt="scene.name"
          class="header-icon"
          @error="iconLoadError = true"
        />
        <el-icon v-else :size="32" class="fallback-icon">
          <component :is="fallbackIcon" />
        </el-icon>
      </div>
      <div class="scene-info">
        <h3 class="scene-name">{{ scene.name }}</h3>
        <p class="event-summary">
          共 {{ events.length }} 个事件，
          <span class="available-count">{{ availableEvents.length }} 个可参与</span>
        </p>
      </div>
    </div>

    <!-- 事件列表 -->
    <div class="events-container">
      <div v-if="events.length === 0" class="empty-state">
        <el-icon :size="48" class="text-gray-300">
          <DocumentDelete />
        </el-icon>
        <p class="text-gray-400 mt-2">该场景暂无事件</p>
      </div>

      <div v-else class="events-list">
        <div
          v-for="event in sortedEvents"
          :key="event.id"
          class="event-item"
          :class="{
            'available': event.status === 'available',
            'locked': event.status === 'locked',
            'completed': event.status === 'completed'
          }"
          @click="handleEventClick(event)"
        >
          <!-- 状态图标 -->
          <div class="event-status-icon">
            <el-icon v-if="event.status === 'completed'" class="text-green-500">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else-if="event.status === 'locked'" class="text-gray-400">
              <Lock />
            </el-icon>
            <el-icon v-else class="text-blue-500">
              <VideoPlay />
            </el-icon>
          </div>

          <!-- 事件信息 -->
          <div class="event-info">
            <div class="event-title-row">
              <span class="event-title">{{ event.title }}</span>
              <el-tag
                v-if="event.type === 'main'"
                type="primary"
                size="small"
                class="event-type-tag"
              >
                主线
              </el-tag>
              <el-tag
                v-else-if="event.type === 'special'"
                type="warning"
                size="small"
                class="event-type-tag"
              >
                特殊
              </el-tag>
            </div>
            <p v-if="event.status === 'locked' && event.unlockReason" class="unlock-reason">
              <el-icon><Lock /></el-icon>
              {{ event.unlockReason }}
            </p>
          </div>

          <!-- 进入按钮 -->
          <el-button
            v-if="event.status === 'available'"
            type="primary"
            size="small"
            class="enter-btn"
          >
            进入
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DocumentDelete,
  CircleCheckFilled,
  Lock,
  VideoPlay,
  Trophy,
  Reading,
  Basketball,
  House,
  OfficeBuilding,
  School,
  Sunny,
  Flag,
  Star
} from '@element-plus/icons-vue'
import type { Script } from '@/types'
import type { SceneConfig } from '@/config/scenes'

interface Props {
  modelValue: boolean
  scene: SceneConfig | null
  events: Script[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select-event': [event: Script]
}>()

const iconLoadError = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  return props.scene ? `${props.scene.name} - 事件列表` : '事件列表'
})

const iconUrl = computed(() => {
  if (!props.scene || iconLoadError.value) return null
  return `/images/icons/${props.scene.icon}`
})

// 备用图标
const fallbackIcon = computed(() => {
  if (!props.scene) return School
  const iconMap: Record<string, any> = {
    stadium: Basketball,
    dormitory: House,
    plaza: Sunny,
    library: Reading,
    academic: OfficeBuilding,
    student_center: Star,
    club_center: Flag,
    research_base: Trophy,
    maker_space: School
  }
  return iconMap[props.scene.id] || School
})

// 可用事件
const availableEvents = computed(() => {
  return props.events.filter(e => e.status === 'available')
})

// 排序后的事件列表（可用 > 锁定 > 已完成）
const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      available: 0,
      locked: 1,
      completed: 2
    }
    return (statusOrder[a.status || 'locked'] || 1) - (statusOrder[b.status || 'locked'] || 1)
  })
})

// 监听场景变化，重置图标错误状态
watch(() => props.scene, () => {
  iconLoadError.value = false
})

const handleEventClick = (event: Script) => {
  if (event.status === 'available') {
    emit('select-event', event)
    visible.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.scene-events-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.scene-events-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* 场景头部 */
.scene-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e7eb;
}

.scene-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--scene-color);
}

.header-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.fallback-icon {
  color: var(--scene-color);
}

.scene-info {
  flex: 1;
}

.scene-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.event-summary {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #606266;
}

.available-count {
  color: #409EFF;
  font-weight: 600;
}

/* 事件容器 */
.events-container {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

/* 事件列表 */
.events-list {
  padding: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.event-item:last-child {
  margin-bottom: 0;
}

.event-item.available {
  background: #f0f9ff;
  border-color: #bfdbfe;
  cursor: pointer;
}

.event-item.available:hover {
  background: #e0f2fe;
  border-color: #93c5fd;
  transform: translateX(4px);
}

.event-item.locked {
  opacity: 0.7;
  background: #f5f5f5;
}

.event-item.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

/* 状态图标 */
.event-status-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

/* 事件信息 */
.event-info {
  flex: 1;
  min-width: 0;
}

.event-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.event-type-tag {
  flex-shrink: 0;
}

.unlock-reason {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.unlock-reason .el-icon {
  font-size: 12px;
}

/* 进入按钮 */
.enter-btn {
  flex-shrink: 0;
}
</style>
