<template>
  <el-tooltip
    :disabled="!isLocked"
    :content="script.unlockReason || '未解锁'"
    placement="top"
  >
    <div
      class="event-card rounded-xl p-4 transition-all"
      :class="cardClass"
      @click="handleClick"
    >
      <!-- 顶部标记 -->
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
          <el-tag :type="typeTagStyle" size="small" class="!rounded-lg">
            {{ typeLabel }}
          </el-tag>
          <el-tag v-if="isCompleted" type="success" size="small" class="!rounded-lg">
            已完成
          </el-tag>
        </div>
        <el-icon
          v-if="script.type === 'special' && !isLocked"
          :size="16"
          class="text-yellow-500 animate-pulse"
        >
          <StarFilled />
        </el-icon>
        <el-icon
          v-if="isLocked"
          :size="16"
          class="text-gray-400"
        >
          <Lock />
        </el-icon>
      </div>

      <!-- 标题 -->
      <h3
        class="text-sm font-bold mb-2 line-clamp-2 transition-colors"
        :class="isLocked ? 'text-gray-400' : 'text-contrast group-hover:text-secondary-600'"
      >
        {{ script.title }}
      </h3>

      <!-- 场景信息 -->
      <div class="flex items-center gap-1 text-xs text-gray-400 mb-3">
        <el-icon :size="14"><Location /></el-icon>
        <span>{{ locationLabel }}</span>
      </div>

      <!-- 描述（剧本内容预览） -->
      <p class="text-xs line-clamp-2 mb-3" :class="isLocked ? 'text-gray-300' : 'text-gray-500'">
        {{ isLocked ? '???' : contentPreview }}
      </p>

      <!-- 底部信息 -->
      <div class="flex justify-between items-center text-xs">
        <span class="text-gray-400">{{ isLocked ? script.unlockReason : '官方' }}</span>
        <el-icon
          v-if="!isLocked && !isCompleted"
          :size="14"
          class="text-secondary-500 group-hover:translate-x-1 transition-transform"
        >
          <ArrowRight />
        </el-icon>
      </div>

      <!-- 装饰光效 -->
      <div
        v-if="script.type === 'main' && !isLocked"
        class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      ></div>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StarFilled, Location, ArrowRight, Lock } from '@element-plus/icons-vue'
import type { Script } from '@/types'

const props = defineProps<{
  script: Script
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const isLocked = computed(() => props.script.status === 'locked')
const isCompleted = computed(() => props.script.status === 'completed')

const handleClick = () => {
  if (!isLocked.value && !isCompleted.value) {
    emit('click')
  }
}

const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    main: '主线',
    branch: '支线',
    special: '特殊'
  }
  return labels[props.script.type] || '未知'
})

const typeTagStyle = computed(() => {
  if (isLocked.value) return 'info'
  const styles: Record<string, any> = {
    main: 'primary',
    branch: '',
    special: 'warning'
  }
  return styles[props.script.type] || 'info'
})

const cardClass = computed(() => {
  if (isLocked.value) {
    return 'bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60'
  }
  if (isCompleted.value) {
    return 'bg-gray-50 border border-gray-200 cursor-default opacity-70'
  }

  const baseClass = 'bg-white shadow-soft hover:shadow-medium cursor-pointer group'
  if (props.script.type === 'main') {
    return `${baseClass} border-2 border-secondary-100 hover:border-secondary-300`
  } else if (props.script.type === 'special') {
    return `${baseClass} border-2 border-yellow-100 hover:border-yellow-300`
  }
  return `${baseClass} border border-gray-100 hover:border-gray-200`
})

const locationLabel = computed(() => {
  const locations: Record<string, string> = {
    gate: '校门口',
    plaza: '广场',
    library: '图书馆',
    dormitory: '宿舍',
    stadium: '体育馆',
    academic: '教学楼',
    campus: '校园'
  }
  return locations[props.script.location] || props.script.location
})

const contentPreview = computed(() => {
  if (props.script.content.length > 50) {
    return props.script.content.substring(0, 50) + '...'
  }
  return props.script.content
})
</script>

<style scoped>
.event-card {
  position: relative;
  min-height: 160px;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
