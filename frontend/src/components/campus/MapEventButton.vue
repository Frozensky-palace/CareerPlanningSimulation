<template>
  <div
    class="map-event-button absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
    :class="buttonClass"
    :style="positionStyle"
    @click="handleClick"
  >
    <!-- 外圈脉冲动画 -->
    <div
      v-if="!isLocked && !isCompleted"
      class="absolute inset-0 rounded-full animate-ping opacity-75"
      :class="pulseClass"
    ></div>

    <!-- 按钮主体 -->
    <div
      class="relative w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg transition-all"
      :class="mainButtonClass"
    >
      <!-- 图标 -->
      <el-icon :size="24" :class="iconClass">
        <component :is="iconComponent" />
      </el-icon>

      <!-- 类型标签 -->
      <div class="absolute -top-2 -right-2">
        <el-tag
          v-if="script.type === 'main'"
          type="primary"
          size="small"
          class="!rounded-full !px-2 !py-0 !text-xs"
        >
          主线
        </el-tag>
        <el-tag
          v-else-if="script.type === 'special'"
          type="warning"
          size="small"
          class="!rounded-full !px-2 !py-0 !text-xs"
        >
          特殊
        </el-tag>
      </div>

      <!-- 锁定标记 -->
      <div
        v-if="isLocked"
        class="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center"
      >
        <el-icon :size="20" class="text-white">
          <Lock />
        </el-icon>
      </div>

      <!-- 完成标记 -->
      <div
        v-if="isCompleted"
        class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
      >
        <el-icon :size="14" class="text-white">
          <Check />
        </el-icon>
      </div>
    </div>

    <!-- 标题提示 -->
    <div
      class="absolute top-full mt-2 px-3 py-1 bg-black bg-opacity-75 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
      {{ script.title }}
      <div v-if="isLocked && script.unlockReason" class="text-yellow-300 text-xs mt-1">
        {{ script.unlockReason }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  School,
  Reading,
  Basketball,
  Sunny,
  House,
  OfficeBuilding,
  Trophy,
  Lock,
  Check
} from '@element-plus/icons-vue'
import type { Script } from '@/types'

interface Props {
  script: Script
  position: {
    x: number  // 百分比位置 0-100
    y: number  // 百分比位置 0-100
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [script: Script]
}>()

const isLocked = computed(() => props.script.status === 'locked')
const isCompleted = computed(() => props.script.status === 'completed')

const handleClick = () => {
  if (!isLocked.value && !isCompleted.value) {
    emit('click', props.script)
  }
}

// 位置样式
const positionStyle = computed(() => ({
  left: `${props.position.x}%`,
  top: `${props.position.y}%`
}))

// 根据场景选择图标
const iconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    gate: School,
    library: Reading,
    stadium: Basketball,
    plaza: Sunny,
    dormitory: House,
    academic: OfficeBuilding,
    campus: School
  }
  return iconMap[props.script.location] || School
})

// 按钮样式类
const buttonClass = computed(() => {
  if (isLocked.value) {
    return 'cursor-not-allowed'
  }
  if (isCompleted.value) {
    return 'cursor-default'
  }
  return 'cursor-pointer hover:scale-110'
})

const mainButtonClass = computed(() => {
  if (isLocked.value) {
    return 'bg-gray-400 border-2 border-gray-500'
  }
  if (isCompleted.value) {
    return 'bg-gray-200 border-2 border-gray-300'
  }

  // 根据类型设置颜色
  if (props.script.type === 'main') {
    return 'bg-blue-500 border-2 border-blue-600 group-hover:bg-blue-600'
  } else if (props.script.type === 'special') {
    return 'bg-yellow-500 border-2 border-yellow-600 group-hover:bg-yellow-600'
  }
  return 'bg-white border-2 border-blue-300 group-hover:border-blue-500'
})

const iconClass = computed(() => {
  if (isLocked.value || isCompleted.value) {
    return 'text-gray-600'
  }
  if (props.script.type === 'main' || props.script.type === 'special') {
    return 'text-white'
  }
  return 'text-blue-500'
})

const pulseClass = computed(() => {
  if (props.script.type === 'main') {
    return 'bg-blue-500'
  } else if (props.script.type === 'special') {
    return 'bg-yellow-500'
  }
  return 'bg-blue-300'
})
</script>

<style scoped>
.map-event-button {
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
