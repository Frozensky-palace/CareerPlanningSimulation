<template>
  <div class="map-management">
    <div class="management-header">
      <h1 class="page-title">地图按钮管理</h1>
      <div class="header-actions">
        <el-button @click="handleResetPositions" :icon="RefreshLeft">
          重置为默认位置
        </el-button>
        <el-button type="primary" @click="handleSavePositions" :loading="saving" :icon="Check">
          保存所有位置
        </el-button>
      </div>
    </div>

    <div class="map-editor-container">
      <!-- 左侧：地图预览 -->
      <div class="map-preview-section">
        <div class="preview-header">
          <h3>地图预览</h3>
          <div class="preview-controls">
            <el-switch
              v-model="showLocationZones"
              active-text="显示场景区域"
              inactive-text="隐藏区域"
              style="margin-right: 16px"
            />
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
            @click="handleCanvasClick"
          >
            <!-- 背景地图 -->
            <img
              ref="mapImageRef"
              src="/images/campus-bg.webp"
              alt="校园地图"
              class="map-background"
              @load="handleImageLoad"
              @error="handleImageError"
            />

            <!-- 交互层：包含网格、场景区域和按钮 -->
            <div
              ref="interactionLayerRef"
              class="interaction-layer"
              :class="{ 'show-grid': showGrid }"
              :style="interactionLayerStyle"
            >
              <!-- 场景区域覆盖层 -->
              <div v-if="showLocationZones" class="location-zones-overlay">
                <div
                  v-for="(zone, location) in locationZones"
                  :key="location"
                  class="location-zone"
                  :style="{
                    left: zone.x + '%',
                    top: zone.y + '%',
                    width: zone.width + '%',
                    height: zone.height + '%'
                  }"
                >
                  <span class="zone-label">{{ getLocationLabel(location) }}</span>
                </div>
              </div>

              <!-- 可拖拽的事件按钮 -->
              <div
                v-for="item in scriptPositions"
                :key="item.script.id"
                class="draggable-button"
                :class="{ active: selectedScriptId === item.script.id }"
                :style="{
                  left: item.position.x + '%',
                  top: item.position.y + '%'
                }"
                @mousedown="handleMouseDown($event, item.script.id)"
                @click.stop="handleSelectScript(item.script.id)"
              >
                <div class="button-content">
                  <el-tag :type="getTypeTagStyle(item.script.type)" size="small">
                    {{ item.script.title }}
                  </el-tag>
                  <div class="position-info">
                    {{ Math.round(item.position.x) }}, {{ Math.round(item.position.y) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：位置列表和控制 -->
      <div class="position-list-section">
        <h3 class="section-title">剧本位置列表</h3>

        <!-- 场景筛选 -->
        <el-select
          v-model="filterLocation"
          placeholder="按场景筛选"
          clearable
          class="location-filter"
        >
          <el-option label="校门口" value="gate" />
          <el-option label="广场" value="plaza" />
          <el-option label="图书馆" value="library" />
          <el-option label="宿舍" value="dormitory" />
          <el-option label="体育馆" value="stadium" />
          <el-option label="教学楼" value="academic" />
          <el-option label="校园" value="campus" />
        </el-select>

        <!-- 位置列表 -->
        <div class="position-items">
          <div
            v-for="item in filteredPositions"
            :key="item.script.id"
            class="position-item"
            :class="{ selected: selectedScriptId === item.script.id }"
            @click="handleSelectScript(item.script.id)"
          >
            <div class="item-header">
              <span class="script-id">#{{ item.script.id }}</span>
              <el-tag :type="getTypeTagStyle(item.script.type)" size="small">
                {{ getTypeLabel(item.script.type) }}
              </el-tag>
            </div>
            <div class="script-title">{{ item.script.title }}</div>
            <div class="script-location">
              <el-icon><Location /></el-icon>
              {{ getLocationLabel(item.script.location) }}
            </div>
            <div class="position-controls">
              <el-input-number
                v-model="item.position.x"
                :min="0"
                :max="100"
                :step="0.5"
                size="small"
                class="position-input"
              >
                <template #prefix>X:</template>
              </el-input-number>
              <el-input-number
                v-model="item.position.y"
                :min="0"
                :max="100"
                :step="0.5"
                size="small"
                class="position-input"
              >
                <template #prefix>Y:</template>
              </el-input-number>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshLeft, Check, Location } from '@element-plus/icons-vue'
import request from '@/services/api'
import type { Script } from '@/types'

const saving = ref(false)
const showGrid = ref(true)
const showLocationZones = ref(false)
const filterLocation = ref('')
const selectedScriptId = ref<number | null>(null)
const mapCanvasRef = ref<HTMLElement | null>(null)
const mapImageRef = ref<HTMLImageElement>()
const interactionLayerRef = ref<HTMLDivElement>()
const interactionLayerStyle = ref<Record<string, string>>({})
const draggingScriptId = ref<number | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

interface ScriptPosition {
  script: Script
  position: { x: number; y: number }
}

const scriptPositions = ref<ScriptPosition[]>([])

// 场景区域定义（根据实际地图布局划分）
const locationZones: Record<string, { x: number; y: number; width: number; height: number }> = {
  dormitory: { x: 5, y: 8, width: 18, height: 22 },     // 宿舍 - 左上区域（红色建筑群）
  library: { x: 5, y: 32, width: 20, height: 25 },      // 图书馆 - 左中区域（绿色草坪区）
  academic: { x: 28, y: 5, width: 25, height: 30 },     // 教学楼 - 中上区域（主教学楼群）
  plaza: { x: 28, y: 38, width: 25, height: 25 },       // 广场 - 中心区域（中央广场）
  campus: { x: 56, y: 25, width: 22, height: 35 },      // 校园 - 右中区域（图书馆、体育场）
  stadium: { x: 80, y: 8, width: 17, height: 25 },      // 体育馆 - 右上区域（体育设施）
  gate: { x: 38, y: 68, width: 24, height: 25 }         // 校门口 - 底部中央（入口区域）
}

// 默认位置配置 - 根据实际地图场景位置
const defaultPositions: Record<string, { x: number; y: number }[]> = {
  dormitory: [
    { x: 14, y: 18 },  // 宿舍区中心
    { x: 10, y: 15 },
    { x: 18, y: 22 }
  ],
  library: [
    { x: 15, y: 45 },  // 图书馆区域
    { x: 12, y: 42 },
    { x: 18, y: 48 }
  ],
  academic: [
    { x: 40, y: 18 },  // 教学楼中心
    { x: 35, y: 15 },
    { x: 45, y: 22 }
  ],
  plaza: [
    { x: 40, y: 50 },  // 广场中心
    { x: 35, y: 48 },
    { x: 45, y: 52 }
  ],
  campus: [
    { x: 67, y: 42 },  // 校园中央
    { x: 62, y: 38 },
    { x: 72, y: 46 },
    { x: 67, y: 50 }
  ],
  stadium: [
    { x: 88, y: 18 },  // 体育馆
    { x: 84, y: 15 },
    { x: 92, y: 22 }
  ],
  gate: [
    { x: 50, y: 80 },  // 校门口
    { x: 45, y: 78 }
  ]
}

const filteredPositions = computed(() => {
  if (!filterLocation.value) return scriptPositions.value
  return scriptPositions.value.filter(
    item => item.script.location === filterLocation.value
  )
})

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    main: '主线',
    branch: '支线',
    special: '特殊'
  }
  return labels[type] || type
}

const getTypeTagStyle = (type: string) => {
  const styles: Record<string, any> = {
    main: 'primary',
    branch: '',
    special: 'warning'
  }
  return styles[type] || 'info'
}

const getLocationLabel = (location: string) => {
  const labels: Record<string, string> = {
    gate: '校门口',
    plaza: '广场',
    library: '图书馆',
    dormitory: '宿舍',
    stadium: '体育馆',
    academic: '教学楼',
    campus: '校园'
  }
  return labels[location] || location
}

const loadScriptPositions = async () => {
  try {
    const res = await request.get('/admin/scripts')
    const scripts = res.data.scripts || []

    // 尝试加载已保存的位置
    let savedPositions: Record<number, { x: number; y: number }> = {}
    try {
      const posRes = await request.get('/admin/map-positions')
      savedPositions = posRes.data.positions || {}
    } catch (error) {
      console.log('No saved positions found, using defaults')
    }

    // 为每个剧本分配位置
    const positions: ScriptPosition[] = []
    const usedPositions = new Map<string, number>()

    scripts.forEach((script: Script) => {
      // 如果有保存的位置，优先使用
      if (savedPositions[script.id]) {
        positions.push({
          script,
          position: savedPositions[script.id]
        })
        return
      }

      // 否则使用默认位置
      const locationPositions = defaultPositions[script.location] || defaultPositions.campus
      const locationKey = script.location
      const usedCount = usedPositions.get(locationKey) || 0
      const posIndex = usedCount % locationPositions.length

      const basePos = locationPositions[posIndex]
      const offset = Math.floor(usedCount / locationPositions.length) * 8
      const position = {
        x: basePos.x + (offset > 0 ? (Math.random() * 10 - 5 + offset) : 0),
        y: basePos.y + (offset > 0 ? (Math.random() * 10 - 5) : 0)
      }

      positions.push({ script, position })
      usedPositions.set(locationKey, usedCount + 1)
    })

    scriptPositions.value = positions
  } catch (error) {
    console.error('Failed to load script positions:', error)
    ElMessage.error('加载数据失败')
  }
}

// 计算交互层的位置和尺寸，使其与图片完全对齐
const updateInteractionLayerPosition = () => {
  if (!mapImageRef.value) return

  const img = mapImageRef.value
  const containerWidth = img.parentElement?.clientWidth || 0
  const containerHeight = img.parentElement?.clientHeight || 0
  const imgNaturalWidth = img.naturalWidth
  const imgNaturalHeight = img.naturalHeight

  if (!imgNaturalWidth || !imgNaturalHeight) return

  // 计算图片实际显示的宽高（object-fit: contain）
  const containerRatio = containerWidth / containerHeight
  const imageRatio = imgNaturalWidth / imgNaturalHeight

  let displayWidth: number
  let displayHeight: number
  let offsetX: number
  let offsetY: number

  if (containerRatio > imageRatio) {
    // 容器更宽，图片高度占满，宽度居中
    displayHeight = containerHeight
    displayWidth = displayHeight * imageRatio
    offsetX = (containerWidth - displayWidth) / 2
    offsetY = 0
  } else {
    // 容器更高，图片宽度占满，高度居中
    displayWidth = containerWidth
    displayHeight = displayWidth / imageRatio
    offsetX = 0
    offsetY = (containerHeight - displayHeight) / 2
  }

  interactionLayerStyle.value = {
    position: 'absolute',
    left: `${offsetX}px`,
    top: `${offsetY}px`,
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    pointerEvents: 'auto'
  }

  console.log('交互层位置已更新:', interactionLayerStyle.value)
}

const handleImageLoad = () => {
  console.log('地图图片已加载')
  // 使用 nextTick 确保 DOM 更新完成
  setTimeout(() => {
    updateInteractionLayerPosition()
  }, 0)
}

const handleSelectScript = (scriptId: number) => {
  selectedScriptId.value = scriptId
}

const handleMouseDown = (event: MouseEvent, scriptId: number) => {
  event.preventDefault()
  draggingScriptId.value = scriptId
  selectedScriptId.value = scriptId

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!draggingScriptId.value || !interactionLayerRef.value) return

  const layer = interactionLayerRef.value
  const layerRect = layer.getBoundingClientRect()

  // 计算相对于交互层的位置百分比
  const x = ((event.clientX - layerRect.left - dragOffset.value.x) / layerRect.width) * 100
  const y = ((event.clientY - layerRect.top - dragOffset.value.y) / layerRect.height) * 100

  // 限制在范围内
  const clampedX = Math.max(0, Math.min(100, x))
  const clampedY = Math.max(0, Math.min(100, y))

  // 更新位置
  const item = scriptPositions.value.find(p => p.script.id === draggingScriptId.value)
  if (item) {
    item.position.x = clampedX
    item.position.y = clampedY
  }
}

const handleMouseUp = () => {
  draggingScriptId.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleCanvasClick = (event: MouseEvent) => {
  // 点击空白处取消选择
  if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('map-background')) {
    selectedScriptId.value = null
  }
}

const handleResetPositions = async () => {
  try {
    await ElMessage.confirm('确定要将所有按钮重置为默认位置吗？', '重置确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } as any)

    loadScriptPositions()
    ElMessage.success('已重置为默认位置')
  } catch (error) {
    // User cancelled
  }
}

const handleSavePositions = async () => {
  try {
    saving.value = true

    const positions: Record<number, { x: number; y: number }> = {}
    scriptPositions.value.forEach(item => {
      positions[item.script.id] = {
        x: item.position.x,
        y: item.position.y
      }
    })

    await request.post('/admin/map-positions', { positions })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('Failed to save positions:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleImageError = () => {
  ElMessage.error('背景图片加载失败')
}

// 监听窗口大小变化
const handleResize = () => {
  updateInteractionLayerPosition()
}

onMounted(() => {
  loadScriptPositions()
  window.addEventListener('resize', handleResize)

  // 尝试初始更新（以防图片已缓存）
  setTimeout(() => {
    if (mapImageRef.value?.complete) {
      console.log('图片已缓存，立即更新位置')
      updateInteractionLayerPosition()
    }
  }, 100)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
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
  align-items: center;
  justify-content: center;
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
  object-fit: contain;
  object-position: center;
  pointer-events: none;
}

/* 交互层 - 与图片对齐，通过 JS 动态设置位置 */
.interaction-layer {
  /* position 和其他属性通过 interactionLayerStyle 动态设置 */
}

/* 网格覆盖层 - 放在交互层上 */
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

.draggable-button {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: move;
  z-index: 10;
  transition: transform 0.2s;
}

.draggable-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 20;
}

.draggable-button.active {
  z-index: 30;
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid transparent;
}

.draggable-button.active .button-content {
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.position-info {
  font-size: 10px;
  color: #909399;
  font-family: monospace;
}

/* 右侧位置列表 */
.position-list-section {
  width: 320px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.location-filter {
  width: 100%;
  margin-bottom: 16px;
}

.position-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.position-item {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.position-item:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.position-item.selected {
  border-color: #409EFF;
  background: #e6f4ff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.script-id {
  font-size: 12px;
  color: #909399;
  font-weight: 600;
}

.script-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.script-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  margin-bottom: 12px;
}

.position-controls {
  display: flex;
  gap: 8px;
}

.position-input {
  flex: 1;
}

/* 场景区域覆盖层 */
.location-zones-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.location-zone {
  position: absolute;
  border: 2px dashed rgba(26, 143, 255, 0.6);
  background: rgba(26, 143, 255, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.location-zone:hover {
  background: rgba(26, 143, 255, 0.15);
  border-color: rgba(26, 143, 255, 0.9);
}

.zone-label {
  font-size: 14px;
  font-weight: 600;
  color: #1A8FFF;
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff,
    0 0 8px rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  white-space: nowrap;
}
</style>
