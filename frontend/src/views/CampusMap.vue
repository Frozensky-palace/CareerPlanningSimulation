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
        <!-- 地图上的场景按钮（固定9个场景） -->
        <div class="button-layer">
          <SceneButton
            v-for="scene in SCENE_CONFIGS"
            :key="scene.id"
            :scene="scene"
            :event-count="getSceneEventCount(scene.location)"
            :available-count="getSceneAvailableCount(scene.location)"
            @click="handleSceneClick"
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

    <!-- 场景事件目录弹窗 -->
    <SceneEventsDialog
      v-model="showSceneDialog"
      :scene="selectedScene"
      :events="selectedSceneEvents"
      @select-event="handleScriptClick"
    />
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
import SceneButton from '@/components/campus/SceneButton.vue'
import SceneEventsDialog from '@/components/campus/SceneEventsDialog.vue'
import { SCENE_CONFIGS, type SceneConfig } from '@/config/scenes'

const router = useRouter()
const gameStore = useGameStore()

const loading = ref(true)
const availableScripts = ref<Script[]>([])
const showProfilePanel = ref(false)
const viewMode = ref<'map' | 'list'>('map')  // 地图视图或列表视图

// 场景事件弹窗
const showSceneDialog = ref(false)
const selectedScene = ref<SceneConfig | null>(null)

// 获取某个场景的事件总数
const getSceneEventCount = (location: string) => {
  return availableScripts.value.filter(s => s.location === location).length
}

// 获取某个场景的可用事件数
const getSceneAvailableCount = (location: string) => {
  return availableScripts.value.filter(s => s.location === location && s.status === 'available').length
}

// 获取选中场景的事件列表
const selectedSceneEvents = computed(() => {
  if (!selectedScene.value) return []
  return availableScripts.value.filter(s => s.location === selectedScene.value!.location)
})

// 处理场景点击
const handleSceneClick = (scene: SceneConfig) => {
  selectedScene.value = scene
  showSceneDialog.value = true
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

onMounted(async () => {
  if (!gameStore.currentSave) {
    ElMessage.warning('请先选择存档')
    router.push('/initial-setup')
    return
  }
  // 加载剧本列表
  await loadScripts()
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
}

.map-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/campus-bg.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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