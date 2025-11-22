<template>
  <div class="min-h-screen bg-primary-light flex flex-col">
    <!-- 黑色顶块 -->
    <header class="bg-contrast text-white py-3 px-6 shadow-medium">
      <div class="max-w-4xl mx-auto">
        <span class="font-semibold text-lg">阶段结算</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- 加载中 -->
        <div v-if="loading" class="flex justify-center py-20">
          <el-icon class="is-loading" :size="40" color="#1A8FFF">
            <Loading />
          </el-icon>
        </div>

        <!-- 结算内容 -->
        <div v-else-if="settlementData" class="space-y-6 animate-fade-in">
          <!-- 阶段信息卡片 -->
          <div class="bg-white rounded-2xl shadow-medium p-6">
            <div class="text-center mb-6">
              <div class="text-sm text-gray-500 mb-2">
                第 {{ settlementData.semester }} 学期
              </div>
              <div class="text-2xl font-bold text-secondary-600">
                {{ settlementData.phaseLabel }}结算
              </div>
            </div>

            <!-- 完成事件数 -->
            <div class="flex justify-center mb-6">
              <div class="bg-secondary-50 rounded-xl px-6 py-3">
                <span class="text-gray-600">本阶段完成事件：</span>
                <span class="text-secondary-600 font-bold text-xl ml-2">
                  {{ settlementData.completedCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 五维属性展示 -->
          <div class="bg-white rounded-2xl shadow-medium p-6">
            <h3 class="text-base font-semibold text-gray-700 mb-4">当前属性</h3>
            <div class="grid grid-cols-5 gap-3">
              <div
                v-for="attr in attributeList"
                :key="attr.key"
                class="text-center"
              >
                <div
                  class="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                  :style="{ backgroundColor: attr.color }"
                >
                  {{ attr.value }}
                </div>
                <div class="text-xs text-gray-500">{{ attr.label }}</div>
              </div>
            </div>
          </div>

          <!-- 评价内容 -->
          <div class="bg-white rounded-2xl shadow-medium p-6">
            <h3 class="text-base font-semibold text-gray-700 mb-4">阶段评价</h3>
            <div class="space-y-3">
              <div
                v-for="(evaluation, index) in settlementData.evaluations"
                :key="index"
                class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <el-icon class="text-secondary-500 mt-0.5" :size="16">
                  <CircleCheck />
                </el-icon>
                <span class="text-sm text-gray-700">{{ evaluation }}</span>
              </div>
            </div>
          </div>

          <!-- 继续按钮 -->
          <div class="pt-4">
            <el-button
              type="primary"
              size="large"
              class="!w-full !rounded-xl !h-12 !bg-secondary-500 !border-secondary-500 hover:!bg-secondary-600 shadow-glow-blue"
              :loading="confirming"
              @click="handleConfirm"
            >
              {{ nextPhaseText }}
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/gameStore'
import request from '@/services/api'
import { ATTRIBUTE_CONFIG } from '@/types'

const router = useRouter()
const gameStore = useGameStore()

const loading = ref(true)
const confirming = ref(false)
const settlementData = ref<any>(null)

const attributeList = computed(() => {
  if (!settlementData.value?.attributes) return []
  const attrs = settlementData.value.attributes
  return [
    { key: 'de', label: '德育', value: attrs.de, color: ATTRIBUTE_CONFIG.de.color },
    { key: 'zhi', label: '智育', value: attrs.zhi, color: ATTRIBUTE_CONFIG.zhi.color },
    { key: 'ti', label: '体育', value: attrs.ti, color: ATTRIBUTE_CONFIG.ti.color },
    { key: 'mei', label: '美育', value: attrs.mei, color: ATTRIBUTE_CONFIG.mei.color },
    { key: 'lao', label: '劳育', value: attrs.lao, color: ATTRIBUTE_CONFIG.lao.color }
  ]
})

const nextPhaseText = computed(() => {
  const phase = settlementData.value?.phase
  if (phase === 'final') {
    return '进入下一学期'
  }
  return '进入下一阶段'
})

const loadSettlement = async () => {
  try {
    loading.value = true
    const saveId = gameStore.currentSave?.id
    if (!saveId) {
      ElMessage.warning('请先选择存档')
      router.push('/initial-setup')
      return
    }

    const res = await request.get(`/settlement/${saveId}`)
    settlementData.value = res.data?.settlement
  } catch (error) {
    console.error(error)
    ElMessage.error('加载结算数据失败')
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  confirming.value = true
  try {
    const saveId = gameStore.currentSave?.id
    const res = await request.post(`/settlement/${saveId}/confirm`)

    // 更新本地存档
    if (res.data?.save) {
      gameStore.setCurrentSave(res.data.save)
    }

    ElMessage.success(`进入${res.data?.nextPhaseLabel || '下一阶段'}`)
    router.push('/campus-map')
  } catch (error) {
    console.error(error)
    ElMessage.error('确认结算失败')
  } finally {
    confirming.value = false
  }
}

onMounted(() => {
  loadSettlement()
})
</script>
