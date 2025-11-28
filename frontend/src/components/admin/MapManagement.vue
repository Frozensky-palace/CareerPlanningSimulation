<template>
  <div class="map-management">
    <div class="management-header">
      <h1 class="page-title">场景管理</h1>
      <p class="page-desc">管理9个固定场景的事件分布，场景位置已在配置中固定</p>
    </div>

    <div class="map-editor-container">
      <!-- 左侧：地图预览 -->
      <div class="map-preview-section">
        <div class="preview-header">
          <h3>地图预览</h3>
          <div class="preview-controls">
            <el-switch
              v-model="showGrid"
              active-text="显示网格"
              inactive-text="隐藏网格"
            />
          </div>
        </div>

        <div class="map-canvas-wrapper">
          <div
            ref="mapCanvasRef"
            class="map-canvas"
            :class="{ 'show-grid': showGrid }"
          >
            <!-- 背景地图 -->
            <img
              ref="mapImageRef"
              src="/images/campus-bg.webp"
              alt="校园地图"
              class="map-background"
              @load="handleImageLoad"
            />

            <!-- 交互层：固定场景按钮 -->
            <div
              ref="interactionLayerRef"
              class="interaction-layer"
              :class="{ 'show-grid': showGrid }"
              :style="interactionLayerStyle"
            >
              <!-- 场景按钮（固定位置，不可拖拽） -->
              <div
                v-for="scene in SCENE_CONFIGS"
                :key="scene.id"
                class="scene-marker"
                :class="{ active: selectedSceneId === scene.id }"
                :style="{
                  left: scene.position.x + '%',
                  top: scene.position.y + '%',
                  '--scene-color': scene.color
                }"
                @click="handleSelectScene(scene.id)"
              >
                <div class="marker-body">
                  <img
                    :src="`/images/icons/${scene.icon}`"
                    :alt="scene.name"
                    class="marker-icon"
                    @error="(e: Event) => handleIconError(e, scene.id)"
                  />
                </div>
                <div class="marker-label">{{ scene.name }}</div>
                <div class="marker-badge" :class="{ 'has-events': getSceneEventCount(scene.location) > 0 }">
                  {{ getSceneEventCount(scene.location) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：场景详情 -->
      <div class="scene-detail-section">
        <h3 class="section-title">场景列表</h3>

        <div class="scene-list">
          <div
            v-for="scene in SCENE_CONFIGS"
            :key="scene.id"
            class="scene-item"
            :class="{ selected: selectedSceneId === scene.id }"
            @click="handleSelectScene(scene.id)"
          >
            <div class="scene-header">
              <div class="scene-icon-wrapper" :style="{ borderColor: scene.color }">
                <img
                  :src="`/images/icons/${scene.icon}`"
                  :alt="scene.name"
                  class="scene-icon"
                  @error="(e: Event) => handleIconError(e, scene.id)"
                />
              </div>
              <div class="scene-info">
                <span class="scene-name">{{ scene.name }}</span>
                <span class="scene-location">location: {{ scene.location }}</span>
              </div>
              <div class="scene-stats">
                <span class="event-count" :style="{ color: scene.color }">
                  {{ getSceneEventCount(scene.location) }}
                </span>
                <span class="event-label">个事件</span>
              </div>
            </div>

            <!-- 展开的事件列表 -->
            <div v-if="selectedSceneId === scene.id" class="scene-events">
              <div class="events-header">
                <span>关联事件</span>
                <el-tag size="small" type="info">{{ getSceneEvents(scene.location).length }} 个</el-tag>
              </div>
              <div v-if="getSceneEvents(scene.location).length === 0" class="no-events">
                暂无关联事件
              </div>
              <div v-else class="events-list">
                <div
                  v-for="script in getSceneEvents(scene.location)"
                  :key="script.id"
                  class="event-item"
                >
                  <span class="event-id">#{{ script.id }}</span>
                  <span class="event-title">{{ script.title }}</span>
                  <el-tag
                    :type="script.type === 'main' ? 'primary' : script.type === 'special' ? 'warning' : 'info'"
                    size="small"
                  >
                    {{ script.type === 'main' ? '主线' : script.type === 'special' ? '特殊' : '支线' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 位置说明 -->
        <div class="position-info-panel">
          <h4>位置配置说明</h4>
          <p>场景按钮位置在 <code>src/config/scenes.ts</code> 中配置，修改后需重新构建生效。</p>
          <p>如需调整位置，请修改对应场景的 <code>position</code> 属性（x, y 为百分比值）。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import type { Script } from '@/types'
import { SCENE_CONFIGS } from '@/config/scenes'

const showGrid = ref(false)
const selectedSceneId = ref<string | null>(null)
const mapCanvasRef = ref<HTMLElement | null>(null)
const mapImageRef = ref<HTMLImageElement>()
const interactionLayerRef = ref<HTMLDivElement>()
const interactionLayerStyle = ref<Record<string, string>>({})

const allScripts = ref<Script[]>([])
const iconErrors = ref<Set<string>>(new Set())

// 获取某个场景的事件数量
const getSceneEventCount = (location: string) => {
  return allScripts.value.filter(s => s.location === location).length
}

// 获取某个场景的事件列表
const getSceneEvents = (location: string) => {
  return allScripts.value.filter(s => s.location === location)
}

// 处理图标加载错误
const handleIconError = (event: Event, sceneId: string) => {
  iconErrors.value.add(sceneId)
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const loadData = async () => {
  try {
    const scriptsRes = await request.get('/admin/scripts')
    allScripts.value = scriptsRes.data.scripts || []
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error('加载数据失败')
  }
}

const handleSelectScene = (sceneId: string) => {
  selectedSceneId.value = selectedSceneId.value === sceneId ? null : sceneId
}

const updateInteractionLayerPosition = () => {
  if (!mapImageRef.value) return

  const img = mapImageRef.value
  const rect = img.getBoundingClientRect()

  interactionLayerStyle.value = {
    position: 'absolute',
    left: '0',
    top: '0',
    width: rect.width + 'px',
    height: rect.height + 'px',
    pointerEvents: 'auto'
  }
}

const handleImageLoad = () => {
  setTimeout(() => {
    updateInteractionLayerPosition()
  }, 0)
}

const handleResize = () => {
  updateInteractionLayerPosition()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)

  setTimeout(() => {
    if (mapImageRef.value?.complete) {
      updateInteractionLayerPosition()
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.map-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.management-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.map-editor-container {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
}

/* 左侧地图预览 */
.map-preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 0;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.preview-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.map-canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  border-radius: 8px;
  background: #1a1f2e;
  overflow: hidden;
  min-height: 0;
}

.map-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: default;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}

.interaction-layer.show-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 10%),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 10%);
  background-size: 10% 10%;
  pointer-events: none;
  z-index: 2;
}

/* 场景标记 */
.scene-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.scene-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 20;
}

.scene-marker.active {
  transform: translate(-50%, -50%) scale(1.15);
  z-index: 30;
}

.marker-body {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid var(--scene-color);
  transition: all 0.2s;
}

.scene-marker.active .marker-body {
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.marker-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.marker-label {
  margin-top: 4px;
  padding: 2px 8px;
  background: var(--scene-color);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
}

.marker-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #909399;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-badge.has-events {
  background: #409EFF;
}

/* 右侧场景列表 */
.scene-detail-section {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  flex-shrink: 0;
}

.scene-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.scene-item {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.scene-item:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.scene-item.selected {
  border-color: #409EFF;
  background: #e6f4ff;
}

.scene-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scene-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.scene-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.scene-info {
  flex: 1;
  min-width: 0;
}

.scene-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.scene-location {
  display: block;
  font-size: 11px;
  color: #909399;
  font-family: monospace;
}

.scene-stats {
  text-align: right;
  flex-shrink: 0;
}

.event-count {
  display: block;
  font-size: 20px;
  font-weight: 700;
}

.event-label {
  display: block;
  font-size: 11px;
  color: #909399;
}

/* 展开的事件列表 */
.scene-events {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.no-events {
  padding: 16px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.events-list {
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 6px;
}

.event-item:last-child {
  margin-bottom: 0;
}

.event-id {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
  flex-shrink: 0;
}

.event-title {
  flex: 1;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 位置说明面板 */
.position-info-panel {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-shrink: 0;
}

.position-info-panel h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.position-info-panel p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.position-info-panel p:last-child {
  margin-bottom: 0;
}

.position-info-panel code {
  background: #e6e8eb;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}
</style>
