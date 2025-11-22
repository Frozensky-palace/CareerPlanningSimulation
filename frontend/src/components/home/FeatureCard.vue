<template>
  <div class="feature-card bg-white rounded-xl p-3 shadow-soft hover:shadow-medium transition-shadow">
    <el-icon :size="20" class="text-secondary-500 mb-2">
      <component :is="iconComponent" />
    </el-icon>
    <div class="font-medium text-contrast text-sm">{{ title }}</div>
    <div class="text-gray-400 mt-0.5">{{ desc }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendCharts, Document, Trophy } from '@element-plus/icons-vue'

const props = defineProps<{
  icon: string
  title: string
  desc: string
}>()

const iconMap: Record<string, any> = {
  TrendCharts,
  Document,
  Trophy
}

const iconComponent = computed(() => iconMap[props.icon] || Document)
</script>
