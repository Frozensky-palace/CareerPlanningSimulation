<template>
  <div class="campus-map-container">
    <!-- 黑色顶块 - 显示状态 -->
    <header class="bg-contrast text-white shadow-medium">
      <div class="px-4 py-2">
        <div class="flex justify-between items-center">
          <!-- 左侧：五维数值 -->
          <div class="flex items-center gap-4 text-xs">
            <div v-for="item in attributeDisplay" :key="item.key" class="flex items-center gap-1">
              <span class="opacity-60">{{ item.label }}</span>
              <span class="font-bold" :style="{ color: item.color }">{{ item.value }}</span>
            </div>
          </div>

          <!-- 右侧：菜单和信息 -->
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-2">
              <el-tag type="info" size="small">第 {{ gameStore.currentSemester }} 学期</el-tag>
              <el-tag type="success" size="small">第 {{ gameStore.currentWeek }} 周</el-tag>
              <el-tag :type="gameStore.remainingEvents > 3 ? 'warning' : 'danger'" size="small">
                剩余 {{ gameStore.remainingEvents }} 事件
              </el-tag>
            </div>
            <el-dropdown @command="handleMenuCommand">
              <el-icon :size="20" class="cursor-pointer hover:text-secondary-500 transition-colors">
                <Setting />
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="badges">我的勋章</el-dropdown-item>
                  <el-dropdown-item command="listView">列表视图</el-dropdown-item>
                  <el-dropdown-item command="saves">切换存档</el-dropdown-item>
                  <el-dropdown-item command="workshop">创作工坊</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </header>

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

    <!-- 勋章面板 -->
    <BadgePanel v-model="showBadgePanel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Loading, DocumentChecked } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/gameStore'
import { useUserStore } from '@/stores/userStore'
import request from '@/services/api'
import type { Script } from '@/types'
import EventCard from '@/components/campus/EventCard.vue'
import MapEventButton from '@/components/campus/MapEventButton.vue'
import BadgePanel from '@/components/badge/BadgePanel.vue'

const router = useRouter()
const gameStore = useGameStore()
const userStore = useUserStore()

const loading = ref(true)
const availableScripts = ref<Script[]>([])
const showBadgePanel = ref(false)
const viewMode = ref<'map' | 'list'>('map')  // 地图视图或列表视图

const attributeDisplay = computed(() => {
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

// 为每个事件分配地图位置
const scriptPositions = computed(() => {
  // 预设的地图位置（根据场景分布）
  const locationPositions: Record<string, { x: number; y: number }[]> = {
    gate: [{ x: 50, y: 85 }],  // 校门口（底部中央）
    plaza: [{ x: 50, y: 65 }],  // 广场（中下）
    library: [{ x: 25, y: 40 }, { x: 75, y: 40 }],  // 图书馆（左右两侧中部）
    academic: [{ x: 30, y: 25 }, { x: 70, y: 25 }],  // 教学楼（上部左右）
    dormitory: [{ x: 15, y: 70 }],  // 宿舍（左下）
    stadium: [{ x: 85, y: 70 }],  // 体育馆（右下）
    campus: [{ x: 50, y: 50 }]  // 其他（中央）
  }

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

const handleMenuCommand = (command: string) => {
  switch (command) {
    case 'badges':
      showBadgePanel.value = true
      break
    case 'listView':
      viewMode.value = viewMode.value === 'map' ? 'list' : 'map'
      break
    case 'saves':
      router.push('/initial-setup')
      break
    case 'workshop':
      router.push('/workshop')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
      break
  }
}

const handleImageError = (e: Event) => {
  console.error('背景图片加载失败:', e)
  ElMessage.error('背景图片加载失败，请检查图片路径')
}

onMounted(() => {
  if (!gameStore.currentSave) {
    ElMessage.warning('请先选择存档')
    router.push('/initial-setup')
    return
  }
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