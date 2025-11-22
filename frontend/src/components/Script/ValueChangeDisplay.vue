<template>
  <div v-if="hasChanges" class="value-change-display">
    <div v-if="!compact" class="text-xs font-medium text-gray-600 mb-2">属性变化：</div>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="item in displayChanges"
        :key="item.key"
        class="change-item px-3 py-1.5 rounded-lg text-sm font-medium animate-scale-in"
        :class="item.class"
      >
        <span class="opacity-80">{{ item.label }}</span>
        <span class="ml-1">{{ item.change }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AttributeChanges } from '@/types'
import { ATTRIBUTE_CONFIG } from '@/types'

const props = withDefaults(defineProps<{
  changes: AttributeChanges
  compact?: boolean
}>(), {
  compact: false
})

const hasChanges = computed(() => {
  return Object.values(props.changes).some(v => v !== 0 && v !== undefined)
})

const displayChanges = computed(() => {
  const items = []

  for (const [key, config] of Object.entries(ATTRIBUTE_CONFIG)) {
    const value = props.changes[key as keyof AttributeChanges]
    if (value && value !== 0) {
      items.push({
        key,
        label: props.compact ? config.key : config.label,
        change: value > 0 ? `+${value}` : `${value}`,
        class: value > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
      })
    }
  }

  return items
})
</script>

<style scoped>
.change-item {
  display: inline-flex;
  align-items: center;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
