<template>
  <div class="avatar-display" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas
      ref="canvasRef"
      :width="size"
      :height="size"
      class="avatar-canvas"
    ></canvas>
    <div v-if="loading" class="avatar-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  config?: {
    hair?: string    // 发型ID
    clothes?: string // 服装ID
    accessory?: string // 配饰ID
  }
  size?: number      // 画布大小
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({ hair: 'hair1', clothes: 'clothes1', accessory: 'none' }),
  size: 300
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(false)

// 图层资源映射 - 实际项目中应该从服务器加载
const avatarParts: Record<string, Record<string, string>> = {
  hair: {
    hair1: '/images/avatar/hair1.png',
    hair2: '/images/avatar/hair2.png',
    hair3: '/images/avatar/hair3.png',
  },
  clothes: {
    clothes1: '/images/avatar/clothes1.png',
    clothes2: '/images/avatar/clothes2.png',
    clothes3: '/images/avatar/clothes3.png',
  },
  accessory: {
    none: '',
    glasses: '/images/avatar/glasses.png',
    hat: '/images/avatar/hat.png',
    scarf: '/images/avatar/scarf.png',
  }
}

// 绘制多层图像
const renderAvatar = async () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  loading.value = true

  try {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景圆形
    ctx.fillStyle = '#f0f2f5'
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2)
    ctx.fill()

    // 按顺序加载并绘制各层
    const layers = [
      { type: 'clothes', id: props.config?.clothes || 'clothes1' },
      { type: 'hair', id: props.config?.hair || 'hair1' },
      { type: 'accessory', id: props.config?.accessory || 'none' }
    ]

    for (const layer of layers) {
      if (layer.id === 'none' || !layer.id) continue

      const imagePath = avatarParts[layer.type]?.[layer.id]
      if (!imagePath) continue

      await loadAndDrawImage(ctx, imagePath, canvas.width, canvas.height)
    }
  } catch (error) {
    console.error('渲染形象失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载并绘制单张图片
const loadAndDrawImage = (
  ctx: CanvasRenderingContext2D,
  src: string,
  width: number,
  height: number
): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      // 绘制图片，保持居中
      const scale = Math.min(width / img.width, height / img.height)
      const x = (width - img.width * scale) / 2
      const y = (height - img.height * scale) / 2
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      resolve()
    }

    img.onerror = () => {
      console.warn(`图片加载失败: ${src}`)
      resolve() // 即使失败也继续
    }

    img.src = src
  })
}

// 监听配置变化，重新渲染
watch(() => props.config, () => {
  nextTick(() => renderAvatar())
}, { deep: true })

onMounted(() => {
  nextTick(() => renderAvatar())
})

// 暴露方法供父组件调用
defineExpose({
  render: renderAvatar
})
</script>

<style scoped>
.avatar-display {
  position: relative;
  display: inline-block;
}

.avatar-canvas {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
