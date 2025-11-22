<template>
  <div class="min-h-screen bg-primary-light">
    <!-- 黑色顶块 -->
    <header class="bg-contrast text-white py-3 px-6 shadow-medium">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-icon :size="24" class="text-secondary-500"><Setting /></el-icon>
          <span class="font-semibold text-lg">初始配置</span>
        </div>
        <div class="text-sm opacity-60">第 {{ step }} / 2 步</div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-2xl mx-auto px-4 py-8">
      <!-- 步骤1：选择或创建存档 -->
      <div v-if="step === 1" class="animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-contrast mb-2">选择存档</h2>
          <p class="text-sm text-gray-500">继续已有存档或创建新存档</p>
        </div>

        <!-- 存档列表 -->
        <div class="space-y-3 mb-6">
          <div
            v-for="save in saves"
            :key="save.id"
            class="bg-white rounded-xl p-4 shadow-soft hover:shadow-medium transition-shadow cursor-pointer border-2"
            :class="selectedSaveId === save.id ? 'border-secondary-500' : 'border-transparent'"
            @click="selectSave(save)"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-medium text-contrast">{{ save.name }}</span>
              <el-tag size="small" type="success">
                大{{ Math.ceil(save.semester / 2) }}
              </el-tag>
            </div>
            <div class="flex gap-3 text-xs">
              <span class="text-attr-de">德 {{ save.attributes.de }}</span>
              <span class="text-attr-zhi">智 {{ save.attributes.zhi }}</span>
              <span class="text-attr-ti">体 {{ save.attributes.ti }}</span>
              <span class="text-attr-mei">美 {{ save.attributes.mei }}</span>
              <span class="text-attr-lao">劳 {{ save.attributes.lao }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              第 {{ save.semester }} 学期 · 第 {{ save.week }} 周
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <el-button
            v-if="selectedSaveId"
            type="primary"
            size="large"
            class="flex-1 !rounded-xl !h-12 !bg-secondary-500 !border-secondary-500 !text-white hover:!bg-secondary-600 hover:!border-secondary-600 shadow-glow-blue"
            @click="continueGame"
          >
            继续游戏
          </el-button>
          <el-button
            size="large"
            class="flex-1 !rounded-xl !h-12 !border-2 !border-secondary-300 !text-secondary-600 hover:!bg-secondary-50"
            @click="step = 2"
          >
            <el-icon class="mr-1"><Plus /></el-icon>
            新建存档
          </el-button>
        </div>
      </div>

      <!-- 步骤2：配置初始数值 -->
      <div v-if="step === 2" class="animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-contrast mb-2">配置初始属性</h2>
          <p class="text-sm text-gray-500">拖动滑块调整五维数值（总和为250）</p>
        </div>

        <!-- 存档名称 -->
        <div class="bg-white rounded-xl p-4 shadow-soft mb-4">
          <el-input
            v-model="saveName"
            placeholder="输入存档名称"
            size="large"
            :prefix-icon="Edit"
          />
        </div>

        <!-- 数值配置 -->
        <div class="bg-white rounded-xl p-4 shadow-soft mb-4">
          <div
            v-for="item in values"
            :key="item.key"
            class="mb-4 last:mb-0"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: item.color }"
                ></span>
                <span class="text-sm font-medium text-contrast">{{ item.label }}</span>
              </div>
              <span class="text-sm font-bold" :style="{ color: item.color }">
                {{ item.value }}
              </span>
            </div>
            <el-slider
              v-model="item.value"
              :min="0"
              :max="100"
              :show-tooltip="false"
              class="custom-slider"
              :style="{ '--slider-color': item.color }"
            />
          </div>
        </div>

        <!-- 总和提示 -->
        <div
          class="rounded-xl p-3 mb-4 text-sm flex justify-between items-center"
          :class="totalValue === 250 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'"
        >
          <span>总和：{{ totalValue }} / 250</span>
          <span>{{ totalValue === 250 ? '数值合理' : '请调整数值' }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <el-button
            size="large"
            class="!rounded-xl !h-12"
            @click="step = 1"
            v-if="saves.length > 0"
          >
            返回
          </el-button>
          <el-button
            type="primary"
            size="large"
            class="flex-1 !rounded-xl !h-12 !bg-secondary-500 !border-secondary-500 !text-white hover:!bg-secondary-600 hover:!border-secondary-600 shadow-glow-blue"
            @click="handleConfirm"
            :disabled="totalValue !== 250 || !saveName.trim()"
            :loading="loading"
          >
            确认并开始
          </el-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Plus, Edit } from '@element-plus/icons-vue'
import request from '@/services/api'
import { useGameStore } from '@/stores/gameStore'
import type { UserSave } from '@/types'

const router = useRouter()
const gameStore = useGameStore()

const step = ref(1)
const loading = ref(false)
const saves = ref<UserSave[]>([])
const selectedSaveId = ref<number | null>(null)
const saveName = ref('存档 1')

const values = reactive([
  { key: 'de', label: '德育', value: 50, color: '#F56C6C' },
  { key: 'zhi', label: '智育', value: 50, color: '#409EFF' },
  { key: 'ti', label: '体育', value: 50, color: '#67C23A' },
  { key: 'mei', label: '美育', value: 50, color: '#E6A23C' },
  { key: 'lao', label: '劳育', value: 50, color: '#909399' }
])

const totalValue = computed(() => {
  return values.reduce((sum, item) => sum + item.value, 0)
})

const selectSave = (save: UserSave) => {
  selectedSaveId.value = save.id
}

const continueGame = () => {
  const save = saves.value.find(s => s.id === selectedSaveId.value)
  if (save) {
    gameStore.setCurrentSave(save)
    router.push('/campus-map')
  }
}

const loadSaves = async () => {
  try {
    const res = await request.get('/saves')
    saves.value = res.data?.saves || []
    if (saves.value.length === 0) {
      step.value = 2
    }
    saveName.value = `存档 ${saves.value.length + 1}`
  } catch (error) {
    console.error(error)
    step.value = 2
  }
}

const handleConfirm = async () => {
  loading.value = true
  try {
    const saveData = {
      name: saveName.value.trim(),
      attributes: {
        de: values[0].value,
        zhi: values[1].value,
        ti: values[2].value,
        mei: values[3].value,
        lao: values[4].value
      }
    }

    const res = await request.post('/saves', saveData)
    gameStore.setCurrentSave(res.data.save)

    ElMessage.success('创建成功！')
    router.push('/campus-map')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSaves()
})
</script>

<style scoped>
.custom-slider :deep(.el-slider__runway) {
  height: 6px;
  background-color: #E5E7EB;
}

.custom-slider :deep(.el-slider__bar) {
  height: 6px;
  background-color: var(--slider-color);
}

.custom-slider :deep(.el-slider__button) {
  width: 16px;
  height: 16px;
  border: 2px solid var(--slider-color);
}

:deep(.el-button--primary) {
  --el-button-bg-color: #1A8FFF;
  --el-button-border-color: #1A8FFF;
  --el-button-hover-bg-color: #0070E0;
  --el-button-hover-border-color: #0070E0;
}
</style>
