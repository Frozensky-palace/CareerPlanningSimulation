<template>
  <el-dialog
    v-model="visible"
    title="我的勋章"
    width="90%"
    :max-width="500"
    class="badge-dialog"
  >
    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center py-10">
      <el-icon class="is-loading" :size="32" color="#1A8FFF">
        <Loading />
      </el-icon>
    </div>

    <!-- 勋章内容 -->
    <div v-else>
      <!-- 统计 -->
      <div class="text-center mb-4">
        <span class="text-gray-500 text-sm">已解锁</span>
        <span class="text-secondary-600 font-bold text-lg mx-2">{{ unlockedCount }}</span>
        <span class="text-gray-500 text-sm">/ {{ badges.length }}</span>
      </div>

      <!-- 勋章网格 -->
      <div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
        <el-tooltip
          v-for="badge in badges"
          :key="badge.id"
          :content="badge.unlocked ? badge.name : `${badge.description}`"
          placement="top"
        >
          <div
            class="badge-item flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all"
            :class="badge.unlocked ? 'bg-secondary-50 hover:bg-secondary-100' : 'bg-gray-100 opacity-50'"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mb-1"
              :class="badge.unlocked ? 'bg-secondary-500 text-white' : 'bg-gray-300 text-gray-500'"
            >
              <el-icon :size="20">
                <component :is="getIconComponent(badge.icon)" />
              </el-icon>
            </div>
            <span
              class="text-xs text-center truncate w-full"
              :class="badge.unlocked ? 'text-gray-700' : 'text-gray-400'"
            >
              {{ badge.unlocked ? badge.name : '???' }}
            </span>
          </div>
        </el-tooltip>
      </div>

      <!-- 空状态 -->
      <div v-if="badges.length === 0" class="text-center py-10">
        <el-icon :size="48" class="text-gray-300 mb-2">
          <Medal />
        </el-icon>
        <p class="text-gray-400 text-sm">暂无勋章数据</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Loading,
  Medal,
  Trophy,
  Star,
  Sunny,
  Flag,
  Calendar,
  Promotion
} from '@element-plus/icons-vue'
import request from '@/services/api'
import { useGameStore } from '@/stores/gameStore'

interface Badge {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const gameStore = useGameStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const badges = ref<Badge[]>([])

const unlockedCount = computed(() => badges.value.filter(b => b.unlocked).length)

// 图标映射
const iconMap: Record<string, any> = {
  Trophy,
  Medal,
  Star,
  Sunny,
  Flag,
  Calendar,
  Promotion,
  Tools: Medal,
  GraduationCap: Trophy
}

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Medal
}

const loadBadges = async () => {
  loading.value = true
  try {
    const saveId = gameStore.currentSave?.id
    const res = await request.get('/badges', {
      params: { saveId }
    })
    badges.value = res.data?.badges || []
  } catch (error) {
    console.error('Load badges error:', error)
    badges.value = []
  } finally {
    loading.value = false
  }
}

// 监听打开状态
watch(() => props.modelValue, (val) => {
  if (val) {
    loadBadges()
  }
})
</script>

<style scoped>
.badge-item {
  min-height: 70px;
}
</style>
