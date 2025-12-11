<template>
  <div class="script-detail-page">
    <!-- 背景图片层 -->
    <div class="background-layer" :style="backgroundStyle"></div>

    <!-- 顶部导航栏 -->
    <header class="script-header">
      <div class="header-content">
        <div class="header-left">
          <el-icon :size="20" class="back-icon" @click="handleBack">
            <ArrowLeft />
          </el-icon>
          <span class="script-title">{{ script?.title || '加载中...' }}</span>
        </div>
        <el-tag v-if="script" :type="getTypeTag()" size="small">
          {{ getTypeLabel() }}
        </el-tag>
      </div>
    </header>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading" :size="40" color="#1A8FFF">
        <Loading />
      </el-icon>
    </div>

    <!-- 主内容区 -->
    <main v-else-if="script" class="script-main">
      <!-- 选项按钮区域（独立的长按钮，在屏幕中间偏下） -->
      <transition name="fade-up">
        <div v-if="showOptions && !selectedOption" class="options-area">
          <div
            v-for="option in script.options"
            :key="option.id"
            class="option-btn"
            @click="handleOptionClick(option)"
          >
            <span class="option-text">{{ option.text }}</span>
            <div v-if="hasValueChanges(option)" class="option-preview">
              <ValueChangeDisplay :changes="option.attributeChanges" compact />
            </div>
            <el-icon class="option-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </transition>

      <!-- 底部内容面板 -->
      <div class="narrator-panel">
        <div class="narrator-content">
          <!-- 场景标签 -->
          <div class="scene-tag">
            <el-icon><Location /></el-icon>
            <span>{{ getLocationLabel(script.location) }}</span>
          </div>

          <!-- 内容显示区域（未选择选项时） -->
          <div v-if="!selectedOption" class="content-area">
            <!-- 当前段落内容 -->
            <div class="narrator-text" @click="handleContentClick">
              <p>{{ currentContent }}</p>
            </div>

            <!-- 段落导航指示器 -->
            <div v-if="totalSegments > 1" class="segment-nav">
              <div
                v-for="i in totalSegments"
                :key="i"
                class="segment-dot"
                :class="{ active: i - 1 === currentSegmentIndex, visited: i - 1 < currentSegmentIndex }"
                @click="goToSegment(i - 1)"
              >
                {{ i }}
              </div>
              <span class="segment-hint">{{ currentSegmentIndex + 1 }} / {{ totalSegments }}</span>
            </div>

            <!-- 点击提示 -->
            <div v-if="!contentFinished" class="click-hint">
              <el-icon><ArrowRight /></el-icon>
              <span>{{ isLastSegment ? '点击选择行动' : '点击继续' }}</span>
            </div>
          </div>

          <!-- 结果反馈（选择后显示） -->
          <div v-else class="result-area">
            <div class="result-feedback">
              <p class="result-text">你做出了选择...</p>
              <ValueChangeDisplay :changes="selectedOption.attributeChanges" />
            </div>
            <el-button
              type="primary"
              size="large"
              class="continue-btn"
              @click="handleContinue"
              :loading="continuing"
            >
              {{ getContinueButtonText() }}
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { ArrowLeft, ArrowRight, Loading, Location } from '@element-plus/icons-vue'
import request, { getResourceUrl } from '@/services/api'
import { useGameStore } from '@/stores/gameStore'
import type { Script, ScriptOption } from '@/types'
import ValueChangeDisplay from '@/components/Script/ValueChangeDisplay.vue'
import { getSceneLabel } from '@/config/scenes'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const loading = ref(true)
const continuing = ref(false)
const script = ref<Script | null>(null)
const selectedOption = ref<ScriptOption | null>(null)
const currentSegmentIndex = ref(0)
const contentFinished = ref(false)  // 是否已阅读完所有内容

// 获取所有内容段落
const contentSegments = computed(() => {
  if (!script.value) return []
  // 优先使用 contents 数组，确保是真正的数组类型（防止字符串被当作字符数组）
  if (script.value.contents && Array.isArray(script.value.contents) && script.value.contents.length > 0) {
    return script.value.contents
  }
  return script.value.content ? [script.value.content] : []
})

// 总段落数
const totalSegments = computed(() => contentSegments.value.length)

// 当前显示的内容
const currentContent = computed(() => {
  return contentSegments.value[currentSegmentIndex.value] || ''
})

// 是否在最后一段
const isLastSegment = computed(() => {
  return currentSegmentIndex.value >= totalSegments.value - 1
})

// 是否显示选项（最后一段内容看完后再次点击）
const showOptions = computed(() => {
  return contentFinished.value
})

// 背景样式
const backgroundStyle = computed(() => {
  if (!script.value?.backgroundImage) {
    return {
      backgroundColor: '#1a1a2e'
    }
  }
  const imageUrl = getImageUrl(script.value.backgroundImage)
  return {
    backgroundImage: `url(${imageUrl})`
  }
})

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

const getLocationLabel = (location: string) => {
  return getSceneLabel(location)
}

const hasValueChanges = (option: ScriptOption) => {
  const changes = option.attributeChanges
  return !!(changes.de || changes.zhi || changes.ti || changes.mei || changes.lao)
}

const getContinueButtonText = () => {
  if (selectedOption.value?.nextScriptId) {
    return '继续'
  }
  return '完成并返回'
}

// 点击内容区域，前进到下一段或显示选项
const handleContentClick = () => {
  if (currentSegmentIndex.value < totalSegments.value - 1) {
    // 还有下一段内容
    currentSegmentIndex.value++
  } else if (!contentFinished.value) {
    // 已经是最后一段，再次点击显示选项
    contentFinished.value = true
  }
}

// 点击段落指示器跳转到指定段落
const goToSegment = (index: number) => {
  // 只能跳转到已看过的段落或当前段落
  if (index <= currentSegmentIndex.value) {
    currentSegmentIndex.value = index
  }
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

    // 检查是否需要触发结算
    if (res.data?.needSettlement) {
      router.push('/settlement')
    } else if (res.data?.nextScriptId) {
      // 如果有下一个剧本（事件链），跳转到下一个剧本
      router.replace(`/script/${res.data.nextScriptId}`)
    } else if (selectedOption.value?.nextScriptId) {
      // 选项自带跳转
      router.replace(`/script/${selectedOption.value.nextScriptId}`)
    } else {
      ElMessage.success('剧本完成！')
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
  return getResourceUrl(url)
}

// 监听路由参数变化，用于事件链跳转时重新加载剧本
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      // 重置状态
      selectedOption.value = null
      script.value = null
      currentSegmentIndex.value = 0
      contentFinished.value = false
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
  overflow: hidden;
  position: relative;
  background-color: #e8f0f8;
}

/* 背景层 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

/* 顶部导航 */
.script-header {
  position: relative;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  height: 56px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-icon {
  color: #1A8FFF;
  cursor: pointer;
  transition: opacity 0.2s;
}

.back-icon:hover {
  opacity: 0.7;
}

.script-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.3px;
}

/* 加载中 */
.loading-overlay {
  position: absolute;
  top: 56px;
  left: 0;
  width: 100%;
  height: calc(100% - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  background: rgba(232, 240, 248, 0.8);
}

/* 主内容 */
.script-main {
  flex: 1;
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
}

/* 选项按钮区域 */
.options-area {
  position: absolute;
  bottom: 400px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  animation: slideUp 0.4s ease-out backwards;
}

.option-btn:nth-child(1) { animation-delay: 0.05s; }
.option-btn:nth-child(2) { animation-delay: 0.1s; }
.option-btn:nth-child(3) { animation-delay: 0.15s; }
.option-btn:nth-child(4) { animation-delay: 0.2s; }
.option-btn:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-btn:hover {
  background: rgba(240, 247, 255, 0.95);
  border-color: #1A8FFF;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(26, 143, 255, 0.15);
}

.option-text {
  flex: 1;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

.option-preview {
  flex-shrink: 0;
}

.option-arrow {
  color: #adb5bd;
  font-size: 14px;
  transition: transform 0.3s, color 0.3s;
}

.option-btn:hover .option-arrow {
  color: #1A8FFF;
  transform: translateX(3px);
}

/* 底部内容面板 */
.narrator-panel {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 24px;
}

.narrator-content {
  max-width: 900px;
  margin: 0 auto;
}

/* 场景标签 */
.scene-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f0f7ff;
  border: 1px solid #bae0ff;
  border-radius: 20px;
  color: #1A8FFF;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

/* 内容区域 */
.content-area {
  animation: fadeIn 0.3s ease;
}

/* 叙述文本 */
.narrator-text {
  background: #f8f9fa;
  border-left: 3px solid #1A8FFF;
  padding: 16px 20px;
  border-radius: 0 12px 12px 0;
  margin-bottom: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.narrator-text:hover {
  background: #f0f4f8;
}

.narrator-text p {
  margin: 0;
  color: #495057;
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 段落导航 */
.segment-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.segment-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #e9ecef;
  color: #6c757d;
  border: 2px solid transparent;
}

.segment-dot.visited {
  background: #d4edda;
  color: #28a745;
  border-color: #28a745;
}

.segment-dot.active {
  background: #1A8FFF;
  color: #fff;
  border-color: #1A8FFF;
  transform: scale(1.1);
}

.segment-dot:hover:not(.active) {
  background: #dee2e6;
}

.segment-hint {
  margin-left: auto;
  font-size: 13px;
  color: #6c757d;
}

/* 点击提示 */
.click-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #1A8FFF;
  font-size: 13px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 结果区域 */
.result-area {
  animation: fadeInUp 0.4s ease;
}

.result-feedback {
  background: #f0f7ff;
  border: 1px solid #bae0ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.result-text {
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 16px 0;
}

.continue-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
  border: none;
}

.continue-btn:hover {
  background: linear-gradient(135deg, #0070E0 0%, #005bb5 100%);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式 */
@media (max-width: 768px) {
  .script-main {
    padding: 16px;
  }

  .narrator-panel {
    padding: 20px;
    border-radius: 12px;
  }

  .narrator-text {
    padding: 12px 16px;
  }

  .narrator-text p {
    font-size: 14px;
  }

  .options-area {
    bottom: 200px;
    width: 94%;
    gap: 8px;
  }

  .option-btn {
    padding: 10px 12px;
  }

  .option-text {
    font-size: 13px;
  }

  .segment-dot {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
}
</style>
