<template>
  <div class="campus-map-container">
    <!-- 顶部导航栏 -->
    <TopNavBar show-game-info show-attributes @open-profile="showProfilePanel = true" />

    <!-- 地图主体 -->
    <main class="map-content">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <el-icon class="is-loading" :size="40" color="#1A8FFF">
          <Loading />
        </el-icon>
      </div>

      <!-- 地图视图 -->
      <div v-else-if="viewMode === 'map'" class="map-view">
        <!-- 背景地图图片 -->
        <img
          src="/images/campus-bg.webp"
          alt="校园地图"
          class="map-background"
          @error="handleImageError"
        />

        <!-- 地图上的事件按钮 -->
        <div class="button-layer">
          <MapEventButton
            v-for="(item, index) in scriptPositions"
            :key="item.script.id"
            :script="item.script"
            :position="item.position"
            @click="handleScriptClick"
          />
        </div>

        <!-- 无可用事件提示 -->
        <div
          v-if="availableScripts.filter(s => s.status === 'available').length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div class="bg-white bg-opacity-95 rounded-2xl p-8 shadow-2xl">
            <el-icon :size="60" class="text-gray-300 mb-4 mx-auto block">
              <DocumentChecked />
            </el-icon>
            <p class="text-gray-600 text-base mb-4">本阶段事件已完成</p>
            <el-button type="primary" size="large" class="!rounded-xl" @click="handleSettlement">
              进入结算
            </el-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="h-full overflow-y-auto bg-primary-light">
        <div class="max-w-6xl mx-auto p-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <EventCard
              v-for="script in availableScripts"
              :key="script.id"
              :script="script"
              @click="handleScriptClick(script)"
            />
          </div>

          <!-- 无事件提示 -->
          <div
            v-if="availableScripts.length === 0"
            class="flex flex-col items-center justify-center py-20"
          >
            <el-icon :size="60" class="text-gray-300 mb-4">
              <DocumentChecked />
            </el-icon>
            <p class="text-gray-400 text-sm">本阶段事件已完成</p>
            <el-button type="primary" class="mt-4 !rounded-xl" @click="handleSettlement">
              进入结算
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <!-- 个人信息面板 -->
    <UserProfile v-model="showProfilePanel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, DocumentChecked } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/gameStore'
import request from '@/services/api'
import type { Script } from '@/types'
import TopNavBar from '@/components/layout/TopNavBar.vue'
import UserProfile from '@/components/user/UserProfile.vue'
import EventCard from '@/components/campus/EventCard.vue'
import MapEventButton from '@/components/campus/MapEventButton.vue'

const router = useRouter()
const gameStore = useGameStore()

const loading = ref(true)
const availableScripts = ref<Script[]>([])
const showProfilePanel = ref(false)
const viewMode = ref<'map' | 'list'>('map')  // 地图视图或列表视图
const savedPositions = ref<Record<string, { x: number; y: number }[]>>({})

// 默认位置（当后台没有保存时使用）
const defaultPositions: Record<string, { x: number; y: number }[]> = {
  dormitory: [
    { x: 14, y: 18 },
    { x: 10, y: 15 },
    { x: 18, y: 22 }
  ],
  library: [
    { x: 15, y: 45 },
    { x: 12, y: 42 },
    { x: 18, y: 48 }
  ],
  academic: [
    { x: 40, y: 18 },
    { x: 35, y: 15 },
    { x: 45, y: 22 }
  ],
  plaza: [
    { x: 40, y: 50 },
    { x: 35, y: 48 },
    { x: 45, y: 52 }
  ],
  campus: [
    { x: 67, y: 42 },
    { x: 62, y: 38 },
    { x: 72, y: 46 },
    { x: 67, y: 50 }
  ],
  stadium: [
    { x: 88, y: 18 },
    { x: 84, y: 15 },
    { x: 92, y: 22 }
  ],
  gate: [
    { x: 50, y: 80 },
    { x: 45, y: 78 }
  ]
}

// 为每个事件分配地图位置
const scriptPositions = computed(() => {
  // 使用后台保存的位置，如果没有则使用默认位置
  const locationPositions = Object.keys(savedPositions.value).length > 0
    ? savedPositions.value
    : defaultPositions

  const result: Array<{ script: Script; position: { x: number; y: number } }> = []
  const usedPositions = new Map<string, number>()  // 记录每个位置使用次数

  availableScripts.value.forEach(script => {
    const positions = locationPositions[script.location] || locationPositions.campus
    const locationKey = script.location
    const usedCount = usedPositions.get(locationKey) || 0
    const posIndex = usedCount % positions.length

    // 如果同一位置有多个事件，稍微偏移
    const basePos = positions[posIndex]
    const offset = Math.floor(usedCount / positions.length) * 8  // 每轮偏移8%
    const position = {
      x: basePos.x + (offset > 0 ? (Math.random() * 10 - 5 + offset) : 0),
      y: basePos.y + (offset > 0 ? (Math.random() * 10 - 5) : 0)
    }

    result.push({ script, position })
    usedPositions.set(locationKey, usedCount + 1)
  })

  return result
})

const loadMapPositions = async () => {
  try {
    const res = await request.get('/scripts/map-positions')
    if (res.data?.positions && Object.keys(res.data.positions).length > 0) {
      savedPositions.value = res.data.positions
    }
  } catch (error) {
    console.error('加载地图位置配置失败:', error)
    // 失败时使用默认位置，不需要提示用户
  }
}

const loadScripts = async () => {
  try {
    loading.value = true
    const res = await request.get('/scripts', {
      params: {
        saveId: gameStore.currentSave?.id,
        location: 'all',
        includeAll: true  // 包含所有状态的事件
      }
    })
    availableScripts.value = res.data?.scripts || []
  } catch (error) {
    console.error(error)
    availableScripts.value = []
  } finally {
    loading.value = false
  }
}

const handleScriptClick = (script: Script) => {
  router.push(`/script/${script.id}`)
}

const handleSettlement = () => {
  router.push('/settlement')
}

const handleImageError = (e: Event) => {
  console.error('背景图片加载失败:', e)
  ElMessage.error('背景图片加载失败，请检查图片路径')
}

onMounted(async () => {
  if (!gameStore.currentSave) {
    ElMessage.warning('请先选择存档')
    router.push('/initial-setup')
    return
  }
  // 先加载地图位置配置，再加载事件
  await loadMapPositions()
  loadScripts()
})
</script>

<style scoped>
.campus-map-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.map-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #1a1f2e;
}

.map-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.button-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.button-layer > * {
  pointer-events: auto;
}
</style>