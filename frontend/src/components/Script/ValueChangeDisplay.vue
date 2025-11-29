<template>
  <div v-if="hasChanges" class="value-change-display" :class="{ 'mini-mode': mini }">
    <div v-if="!compact && !mini" class="text-xs font-medium text-gray-600 mb-2">属性变化：</div>
    <div class="flex flex-wrap gap-2" :class="{ 'gap-1': mini }">
      <div
        v-for="item in displayChanges"
        :key="item.key"
        class="change-item rounded-lg font-medium animate-scale-in"
        :class="[item.class, mini ? 'mini-item' : 'px-3 py-1.5 text-sm']"
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
  mini?: boolean
}>(), {
  compact: false,
  mini: false
})

const hasChanges = computed(() => {
  return Object.values(props.changes).some(v => v !== 0 && v !== undefined)
})

const displayChanges = computed(() => {
  const items = []

  for (const [key, config] of Object.entries(ATTRIBUTE_CONFIG)) {
    const value = props.changes[key as keyof AttributeChanges]
    if (value && value !== 0) {
      const baseClass = value > 0
        ? (props.mini ? 'mini-positive' : 'bg-green-50 text-green-700 border border-green-200')
        : (props.mini ? 'mini-negative' : 'bg-red-50 text-red-700 border border-red-200')
      items.push({
        key,
        label: props.compact || props.mini ? config.key : config.label,
        change: value > 0 ? `+${value}` : `${value}`,
        class: baseClass
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

.mini-item {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.mini-positive {
  background: rgba(103, 194, 58, 0.2);
  color: #95d475;
  border: 1px solid rgba(103, 194, 58, 0.4);
}

.mini-negative {
  background: rgba(245, 108, 108, 0.2);
  color: #f89898;
  border: 1px solid rgba(245, 108, 108, 0.4);
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
