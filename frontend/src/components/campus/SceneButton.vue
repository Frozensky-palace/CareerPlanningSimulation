<template>
  <div
    class="scene-button"
    :style="positionStyle"
    @click="handleClick"
  >
    <!-- 呼吸光晕动画 -->
    <div class="glow-ring" :style="{ '--scene-color': scene.color }"></div>

    <!-- 脉冲动画（有可用事件时显示） -->
    <div v-if="hasAvailableEvents" class="pulse-ring" :style="{ '--scene-color': scene.color }"></div>

    <!-- 按钮主体 -->
    <div class="button-body" :style="{ '--scene-color': scene.color }">
      <!-- 图标容器 -->
      <div class="icon-container">
        <img
          v-if="iconUrl"
          :src="iconUrl"
          :alt="scene.name"
          class="scene-icon"
          @error="handleIconError"
        />
        <el-icon v-else :size="24" class="fallback-icon">
          <component :is="fallbackIcon" />
        </el-icon>
      </div>
    </div>

    <!-- 场景名称标签 -->
    <div class="scene-label" :style="{ '--scene-color': scene.color }">
      {{ scene.name }}
    </div>

    <!-- 事件数量徽章 -->
    <div v-if="eventCount > 0" class="event-badge" :class="{ 'has-available': hasAvailableEvents }">
      {{ eventCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
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
import type { SceneConfig } from '@/config/scenes'

interface Props {
  scene: SceneConfig
  eventCount?: number      // 该场景的事件总数
  availableCount?: number  // 可用事件数
}

const props = withDefaults(defineProps<Props>(), {
  eventCount: 0,
  availableCount: 0
})

const emit = defineEmits<{
  click: [scene: SceneConfig]
}>()

const iconLoadError = ref(false)

// 计算图标URL
const iconUrl = computed(() => {
  if (iconLoadError.value) return null
  return `/images/icons/${props.scene.icon}`
})

// 是否有可用事件
const hasAvailableEvents = computed(() => props.availableCount > 0)

// 位置样式
const positionStyle = computed(() => ({
  left: `${props.scene.position.x}%`,
  top: `${props.scene.position.y}%`
}))

// 备用图标（当自定义图标加载失败时使用）
const fallbackIcon = computed(() => {
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

const handleIconError = () => {
  iconLoadError.value = true
}

const handleClick = () => {
  emit('click', props.scene)
}
</script>

<style scoped>
.scene-button {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scene-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 20;
}

.scene-button:active {
  transform: translate(-50%, -50%) scale(0.95);
}

/* 呼吸光晕 */
.glow-ring {
  position: absolute;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--scene-color) 0%, transparent 70%);
  opacity: 0.3;
  animation: glow-breathe 3s ease-in-out infinite;
}

@keyframes glow-breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

/* 脉冲动画（有可用事件时） */
.pulse-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid var(--scene-color);
  animation: pulse-expand 2s ease-out infinite;
}

@keyframes pulse-expand {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* 按钮主体 */
.button-body {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--scene-color);
  transition: all 0.3s ease;
}

.scene-button:hover .button-body {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, white 0%, #f0f4f8 100%);
}

/* 图标容器 */
.icon-container {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.scene-button:hover .scene-icon {
  transform: scale(1.1);
}

.fallback-icon {
  color: var(--scene-color);
}

/* 场景名称标签 */
.scene-label {
  margin-top: 8px;
  padding: 4px 12px;
  background: var(--scene-color);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.scene-button:hover .scene-label {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 事件数量徽章 */
.event-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #909399;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.event-badge.has-available {
  background: #F56C6C;
  animation: badge-bounce 1s ease-in-out infinite;
}

@keyframes badge-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
