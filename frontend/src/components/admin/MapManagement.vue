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
              src="/images/campus-bg.webp"
              alt="校园地图"
              class="map-background"
              @error="handleImageError"
            />

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
const filterLocation = ref('')
const selectedScriptId = ref<number | null>(null)
const mapCanvasRef = ref<HTMLElement | null>(null)
const draggingScriptId = ref<number | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

interface ScriptPosition {
  script: Script
  position: { x: number; y: number }
}

const scriptPositions = ref<ScriptPosition[]>([])

// 默认位置配置 - 根据典型校园地图布局优化
const defaultPositions: Record<string, { x: number; y: number }[]> = {
  gate: [
    { x: 50, y: 90 },  // 校门口 - 地图底部中央
    { x: 48, y: 88 }   // 校门附近第二个位置
  ],
  plaza: [
    { x: 50, y: 72 },  // 广场 - 校门进来后的中央区域
    { x: 45, y: 75 },
    { x: 55, y: 75 }
  ],
  library: [
    { x: 28, y: 45 },  // 图书馆 - 左中区域
    { x: 32, y: 48 },
    { x: 25, y: 50 }
  ],
  dormitory: [
    { x: 18, y: 62 },  // 宿舍 - 左下区域
    { x: 15, y: 68 },
    { x: 22, y: 65 }
  ],
  stadium: [
    { x: 82, y: 62 },  // 体育馆 - 右下区域
    { x: 85, y: 68 },
    { x: 78, y: 65 }
  ],
  academic: [
    { x: 72, y: 45 },  // 教学楼 - 右中区域
    { x: 68, y: 48 },
    { x: 75, y: 50 }
  ],
  campus: [
    { x: 50, y: 35 },  // 校园中央 - 上中区域
    { x: 45, y: 38 },
    { x: 55, y: 38 },
    { x: 50, y: 42 }
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
  if (!draggingScriptId.value || !mapCanvasRef.value) return

  const canvas = mapCanvasRef.value
  const canvasRect = canvas.getBoundingClientRect()

  // 计算相对于画布的位置百分比
  const x = ((event.clientX - canvasRect.left - dragOffset.value.x) / canvasRect.width) * 100
  const y = ((event.clientY - canvasRect.top - dragOffset.value.y) / canvasRect.height) * 100

  // 限制在画布范围内
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

onMounted(() => {
  loadScriptPositions()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
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
  height: 0;
  padding-bottom: 75%; /* 4:3 宽高比 */
  cursor: default;
  max-height: 100%;
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

/* 网格覆盖层 - 放在图片上面 */
.map-canvas.show-grid::before {
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
</style>
