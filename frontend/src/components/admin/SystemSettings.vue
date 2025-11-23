<template>
  <div class="system-settings">
    <div class="management-header">
      <h1 class="page-title">系统设置</h1>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存设置
      </el-button>
    </div>

    <el-form
      ref="formRef"
      :model="settings"
      label-width="180px"
      class="settings-form"
      v-loading="loading"
    >
      <!-- 游戏基础设置 -->
      <div class="settings-section">
        <h3 class="section-title">游戏基础设置</h3>
        <el-form-item label="网站名称">
          <el-input v-model="settings.site_name" placeholder="大学生涯数字孪生平台" />
        </el-form-item>
        <el-form-item label="初始属性总和">
          <el-input-number
            v-model="settings.game_initial_attributes_total"
            :min="100"
            :max="500"
            :step="10"
          />
          <span class="form-tip">用户初始化时可分配的属性总点数</span>
        </el-form-item>
      </div>

      <!-- 学期管理设置 -->
      <div class="settings-section">
        <h3 class="section-title">学期管理</h3>
        <el-form-item label="最大学期数">
          <el-input-number
            v-model="settings.game_max_semester"
            :min="4"
            :max="12"
            :step="1"
          />
          <span class="form-tip">游戏允许的最大学期数（通常为8学期）</span>
        </el-form-item>
        <el-form-item label="每学期可触发事件数">
          <el-input-number
            v-model="settings.game_events_per_phase"
            :min="5"
            :max="50"
            :step="1"
          />
          <span class="form-tip">每个学期阶段玩家可以触发的事件数量</span>
        </el-form-item>
        <el-form-item label="每学期周数">
          <el-input-number
            v-model="settings.game_weeks_per_semester"
            :min="12"
            :max="20"
            :step="1"
          />
          <span class="form-tip">每个学期包含的周数</span>
        </el-form-item>
      </div>

      <!-- 事件触发设置 -->
      <div class="settings-section">
        <h3 class="section-title">事件触发规则</h3>
        <el-form-item label="主线事件权重">
          <el-slider
            v-model="settings.event_weight_main"
            :min="1"
            :max="10"
            show-stops
            :marks="{ 1: '低', 5: '中', 10: '高' }"
          />
          <span class="form-tip">主线剧本在随机事件中的出现权重</span>
        </el-form-item>
        <el-form-item label="支线事件权重">
          <el-slider
            v-model="settings.event_weight_branch"
            :min="1"
            :max="10"
            show-stops
            :marks="{ 1: '低', 5: '中', 10: '高' }"
          />
          <span class="form-tip">支线剧本在随机事件中的出现权重</span>
        </el-form-item>
        <el-form-item label="特殊事件权重">
          <el-slider
            v-model="settings.event_weight_special"
            :min="1"
            :max="10"
            show-stops
            :marks="{ 1: '低', 5: '中', 10: '高' }"
          />
          <span class="form-tip">特殊剧本在随机事件中的出现权重</span>
        </el-form-item>
        <el-form-item label="允许重复事件">
          <el-switch v-model="settings.allow_repeat_events" />
          <span class="form-tip">是否允许同一事件在游戏中多次出现</span>
        </el-form-item>
      </div>

      <!-- 属性限制设置 -->
      <div class="settings-section">
        <h3 class="section-title">属性限制</h3>
        <el-form-item label="单项属性最大值">
          <el-input-number
            v-model="settings.max_single_attribute"
            :min="100"
            :max="1000"
            :step="10"
          />
          <span class="form-tip">每个属性的最大值限制</span>
        </el-form-item>
        <el-form-item label="单项属性最小值">
          <el-input-number
            v-model="settings.min_single_attribute"
            :min="0"
            :max="50"
            :step="5"
          />
          <span class="form-tip">每个属性的最小值限制</span>
        </el-form-item>
      </div>

      <!-- 结算设置 -->
      <div class="settings-section">
        <h3 class="section-title">结算规则</h3>
        <el-form-item label="优秀属性阈值">
          <el-input-number
            v-model="settings.excellent_threshold"
            :min="50"
            :max="200"
            :step="10"
          />
          <span class="form-tip">判定属性达到"优秀"等级的最低值</span>
        </el-form-item>
        <el-form-item label="良好属性阈值">
          <el-input-number
            v-model="settings.good_threshold"
            :min="30"
            :max="150"
            :step="10"
          />
          <span class="form-tip">判定属性达到"良好"等级的最低值</span>
        </el-form-item>
        <el-form-item label="合格属性阈值">
          <el-input-number
            v-model="settings.pass_threshold"
            :min="20"
            :max="100"
            :step="10"
          />
          <span class="form-tip">判定属性达到"合格"等级的最低值</span>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import request from '@/services/api'

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)

const settings = ref({
  // 基础设置
  site_name: '大学生涯数字孪生平台',
  game_initial_attributes_total: 250,

  // 学期管理
  game_max_semester: 8,
  game_events_per_phase: 10,
  game_weeks_per_semester: 16,

  // 事件权重
  event_weight_main: 5,
  event_weight_branch: 5,
  event_weight_special: 3,
  allow_repeat_events: false,

  // 属性限制
  max_single_attribute: 200,
  min_single_attribute: 0,

  // 结算规则
  excellent_threshold: 80,
  good_threshold: 60,
  pass_threshold: 40
})

const loadSettings = async () => {
  try {
    loading.value = true
    const res = await request.get('/admin/settings')

    // 后端返回的是对象格式 { key: value }
    const settingsData = res.data.settings || {}
    Object.entries(settingsData).forEach(([key, value]) => {
      // 根据键的类型转换值
      if (key in settings.value) {
        if (key.startsWith('allow_')) {
          // 布尔类型
          (settings.value as any)[key] = value === 'true' || value === true
        } else if (key.includes('name')) {
          // 字符串类型
          (settings.value as any)[key] = String(value).replace(/^"|"$/g, '')
        } else {
          // 数字类型
          (settings.value as any)[key] = Number(value)
        }
      }
    })
  } catch (error) {
    console.error('Failed to load settings:', error)
    ElMessage.error('加载系统设置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  try {
    saving.value = true

    // 后端期望对象格式 { key: value }
    await request.put('/admin/settings', { settings: settings.value })
    ElMessage.success('设置已保存')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.system-settings {
  padding: 24px;
  max-width: 1200px;
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

.settings-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A8FFF;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #1A8FFF;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
