<template>
  <div class="script-detail-page">
    <!-- 顶部导航栏 -->
    <header class="script-header">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
          <el-icon :size="20" class="text-secondary-500 cursor-pointer hover:opacity-70" @click="handleBack">
            <ArrowLeft />
          </el-icon>
          <span class="font-semibold text-lg text-gray-800">{{ script?.title || '加载中...' }}</span>
        </div>
        <el-tag v-if="script" :type="getTypeTag()" size="small">
          {{ getTypeLabel() }}
        </el-tag>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="script-main">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- 加载中 -->
        <div v-if="loading" class="flex justify-center py-20">
          <el-icon class="is-loading" :size="40" color="#1A8FFF">
            <Loading />
          </el-icon>
        </div>

        <!-- 剧本内容 -->
        <div v-else-if="script" class="animate-fade-in">
          <!-- 背景图片 -->
          <div v-if="script.backgroundImage" class="background-image-wrapper mb-6">
            <img :src="getImageUrl(script.backgroundImage)" alt="剧本背景" class="background-image" />
          </div>

          <!-- 剧本内容卡片 -->
          <div class="bg-white rounded-2xl shadow-medium p-6 md:p-8 mb-6">
            <!-- 场景信息 -->
            <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <el-icon><Location /></el-icon>
              <span>{{ script.location }}</span>
            </div>

            <!-- 剧本文本 -->
            <div class="prose prose-sm max-w-none mb-6">
              <p class="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ script.content }}
              </p>
            </div>

            <!-- 选项列表 -->
            <div v-if="!selectedOption" class="space-y-3">
              <div class="text-sm font-medium text-gray-600 mb-3">请选择你的行动：</div>
              <div
                v-for="option in script.options"
                :key="option.id"
                class="option-card bg-gray-50 hover:bg-secondary-50 border-2 border-transparent hover:border-secondary-200 rounded-xl p-4 cursor-pointer transition-all group"
                @click="handleOptionClick(option)"
              >
                <div class="flex justify-between items-start">
                  <span class="text-sm text-gray-700 group-hover:text-secondary-700 flex-1">
                    {{ option.text }}
                  </span>
                  <el-icon :size="16" class="text-secondary-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight />
                  </el-icon>
                </div>

                <!-- 数值变化预览 -->
                <ValueChangeDisplay v-if="hasValueChanges(option)" :changes="option.attributeChanges" class="mt-2" compact />
              </div>
            </div>

            <!-- 反馈展示 -->
            <div v-else class="animate-slide-up">
              <div class="bg-secondary-50 border-l-4 border-secondary-500 rounded-lg p-4 mb-4">
                <p class="text-sm text-gray-700">你做出了选择...</p>
              </div>

              <!-- 数值变化动画 -->
              <ValueChangeDisplay :changes="selectedOption.attributeChanges" class="mb-4" />

              <!-- 继续按钮 -->
              <el-button
                type="primary"
                size="large"
                class="!w-full !rounded-xl !h-12 !bg-secondary-500 !border-secondary-500 !text-white hover:!bg-secondary-600 hover:!border-secondary-600 shadow-glow-blue"
                @click="handleContinue"
                :loading="continuing"
              >
                完成并返回
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { ArrowLeft, ArrowRight, Loading, Location } from '@element-plus/icons-vue'
import request from '@/services/api'
import { useGameStore } from '@/stores/gameStore'
import type { Script, ScriptOption } from '@/types'
import ValueChangeDisplay from '@/components/script/ValueChangeDisplay.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const loading = ref(true)
const continuing = ref(false)
const script = ref<Script | null>(null)
const selectedOption = ref<ScriptOption | null>(null)

const getTypeLabel = () => {
  const labels: Record<string, string> = {
    main: '主线剧本',
    branch: '支线剧本',
    special: '特殊事件'
  }
  return labels[script.value?.type || ''] || '剧本'
}

const getTypeTag = () => {
  const tags: Record<string, any> = {
    main: 'primary',
    branch: '',
    special: 'warning'
  }
  return tags[script.value?.type || ''] || 'info'
}

const hasValueChanges = (option: ScriptOption) => {
  const changes = option.attributeChanges
  return !!(changes.de || changes.zhi || changes.ti || changes.mei || changes.lao)
}

const loadScript = async () => {
  try {
    loading.value = true
    const scriptId = route.params.id

    // 获取剧本信息
    const res = await request.get(`/scripts/${scriptId}`)
    script.value = res.data?.script
  } catch (error) {
    console.error(error)
    ElMessage.error('加载剧本失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleOptionClick = (option: ScriptOption) => {
  selectedOption.value = option
}

const checkBadges = async () => {
  try {
    const saveId = gameStore.currentSave?.id
    if (!saveId) return

    const res = await request.post(`/badges/check/${saveId}`)
    const newlyUnlocked = res.data?.newlyUnlocked || []

    // 如果有新解锁的勋章，更新本地存档数据
    if (newlyUnlocked.length > 0) {
      // 重新获取存档数据以获取最新的 unlockedBadges
      const saveRes = await request.get(`/saves/${saveId}`)
      if (saveRes.data?.save) {
        gameStore.setCurrentSave(saveRes.data.save)
      }
    }

    // 显示新解锁勋章通知
    for (const badge of newlyUnlocked) {
      ElNotification({
        title: '解锁勋章！',
        message: `恭喜获得「${badge.name}」勋章`,
        type: 'success',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Check badges error:', error)
  }
}

const handleContinue = async () => {
  if (!selectedOption.value || !script.value) return

  continuing.value = true
  try {
    // 提交选择到后端，执行剧本
    const res = await request.post(`/scripts/${script.value.id}/execute`, {
      saveId: gameStore.currentSave?.id,
      optionId: selectedOption.value.id
    })

    // 更新本地存档数据
    if (res.data?.save) {
      gameStore.setCurrentSave(res.data.save)
    }

    // 检查勋章解锁
    await checkBadges()

    ElMessage.success('剧本完成！')

    // 检查是否需要触发结算
    if (res.data?.needSettlement) {
      router.push('/settlement')
    } else if (res.data?.nextScriptId) {
      // 如果有下一个剧本（事件链），跳转到下一个剧本
      router.replace(`/script/${res.data.nextScriptId}`)
    } else {
      router.push('/campus-map')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('执行失败，请重试')
  } finally {
    continuing.value = false
  }
}

const handleBack = () => {
  router.push('/campus-map')
}

const getImageUrl = (url: string) => {
  if (url.startsWith('http')) return url
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`
}

// 监听路由参数变化，用于事件链跳转时重新加载剧本
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      // 重置状态
      selectedOption.value = null
      script.value = null
      loadScript()
    }
  }
)

onMounted(() => {
  loadScript()
})
</script>

<style scoped>
.script-detail-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.script-header {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 24px;
}

.script-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.background-image-wrapper {
  width: 100%;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.background-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.option-card {
  position: relative;
}

.option-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #1A8FFF;
  transition: height 0.3s;
  border-radius: 0 2px 2px 0;
}

.option-card:hover::before {
  height: 60%;
}

.prose p {
  margin: 0;
}
</style>
