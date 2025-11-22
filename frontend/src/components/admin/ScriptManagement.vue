<template>
  <div class="script-management">
    <div class="management-header">
      <h1 class="page-title">剧本管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreateScript">
        创建剧本
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="剧本类型" clearable class="filter-item">
        <el-option label="主线" value="main" />
        <el-option label="支线" value="branch" />
        <el-option label="特殊" value="special" />
      </el-select>
      <el-select v-model="filterLocation" placeholder="场景" clearable class="filter-item">
        <el-option label="校门口" value="gate" />
        <el-option label="广场" value="plaza" />
        <el-option label="图书馆" value="library" />
        <el-option label="宿舍" value="dormitory" />
        <el-option label="体育馆" value="stadium" />
        <el-option label="教学楼" value="academic" />
        <el-option label="校园" value="campus" />
      </el-select>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索标题或内容"
        :prefix-icon="Search"
        clearable
        class="filter-item search-input"
      />
    </div>

    <!-- 剧本列表 -->
    <div class="scripts-table">
      <el-table :data="filteredScripts" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagStyle(scope.row.type)">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="场景" width="120">
          <template #default="scope">
            {{ getLocationLabel(scope.row.location) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览" show-overflow-tooltip />
        <el-table-column label="触发条件" width="180">
          <template #default="scope">
            <div class="condition-summary">
              <span v-if="scope.row.triggerCondition?.semester">
                学期: {{ scope.row.triggerCondition.semester.join(', ') }}
              </span>
              <span v-if="scope.row.triggerCondition?.week">
                周: {{ scope.row.triggerCondition.week.join(', ') }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="选项数" width="80" align="center">
          <template #default="scope">
            {{ scope.row.options?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEditScript(scope.row)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="handleDuplicateScript(scope.row)">
              复制
            </el-button>
            <el-button link type="danger" size="small" @click="handleDeleteScript(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑/创建对话框 -->
    <el-dialog
      v-model="showEditorDialog"
      :title="isEditing ? '编辑剧本' : '创建剧本'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="currentScript" label-width="100px" class="script-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-form-item label="标题" required>
            <el-input v-model="currentScript.title" placeholder="输入剧本标题" />
          </el-form-item>
          <el-form-item label="类型" required>
            <el-radio-group v-model="currentScript.type">
              <el-radio value="main">主线</el-radio>
              <el-radio value="branch">支线</el-radio>
              <el-radio value="special">特殊</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="场景" required>
            <el-select v-model="currentScript.location" placeholder="选择场景">
              <el-option label="校门口" value="gate" />
              <el-option label="广场" value="plaza" />
              <el-option label="图书馆" value="library" />
              <el-option label="宿舍" value="dormitory" />
              <el-option label="体育馆" value="stadium" />
              <el-option label="教学楼" value="academic" />
              <el-option label="校园" value="campus" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容" required>
            <el-input
              v-model="currentScript.content"
              type="textarea"
              :rows="4"
              placeholder="输入剧本内容描述"
            />
          </el-form-item>
        </div>

        <!-- 触发条件 -->
        <div class="form-section">
          <h3 class="section-title">触发条件</h3>
          <el-form-item label="学期">
            <el-select
              v-model="currentScript.triggerCondition.semester"
              multiple
              placeholder="选择学期（可多选）"
              class="w-full"
            >
              <el-option v-for="i in 8" :key="i" :label="`第 ${i} 学期`" :value="i" />
            </el-select>
          </el-form-item>
          <el-form-item label="周数">
            <el-select
              v-model="currentScript.triggerCondition.week"
              multiple
              placeholder="选择周数（可多选）"
              class="w-full"
            >
              <el-option v-for="i in 16" :key="i" :label="`第 ${i} 周`" :value="i" />
            </el-select>
          </el-form-item>
          <el-form-item label="最低属性">
            <div class="attributes-input">
              <el-input-number
                v-model="currentScript.triggerCondition.minAttributes.de"
                :min="0"
                :max="100"
                placeholder="德育"
                size="small"
              />
              <el-input-number
                v-model="currentScript.triggerCondition.minAttributes.zhi"
                :min="0"
                :max="100"
                placeholder="智育"
                size="small"
              />
              <el-input-number
                v-model="currentScript.triggerCondition.minAttributes.ti"
                :min="0"
                :max="100"
                placeholder="体育"
                size="small"
              />
              <el-input-number
                v-model="currentScript.triggerCondition.minAttributes.mei"
                :min="0"
                :max="100"
                placeholder="美育"
                size="small"
              />
              <el-input-number
                v-model="currentScript.triggerCondition.minAttributes.lao"
                :min="0"
                :max="100"
                placeholder="劳育"
                size="small"
              />
            </div>
          </el-form-item>
          <el-form-item label="前置剧本">
            <el-select
              v-model="currentScript.triggerCondition.requiredScripts"
              multiple
              placeholder="选择需要完成的前置剧本"
              class="w-full"
            >
              <el-option
                v-for="script in allScripts"
                :key="script.id"
                :label="`#${script.id} ${script.title}`"
                :value="script.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 选项列表 -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">选项列表</h3>
            <el-button size="small" :icon="Plus" @click="handleAddOption">
              添加选项
            </el-button>
          </div>
          <div class="options-list">
            <div
              v-for="(option, index) in currentScript.options"
              :key="index"
              class="option-item"
            >
              <div class="option-header">
                <span class="option-number">选项 {{ index + 1 }}</span>
                <el-button
                  link
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleRemoveOption(index)"
                >
                  删除
                </el-button>
              </div>
              <el-input
                v-model="option.text"
                placeholder="输入选项文本"
                class="option-text-input"
              />
              <div class="attribute-changes">
                <span class="label">属性变化：</span>
                <el-input-number
                  v-model="option.attributeChanges.de"
                  :min="-100"
                  :max="100"
                  placeholder="德"
                  size="small"
                  class="attr-input"
                />
                <el-input-number
                  v-model="option.attributeChanges.zhi"
                  :min="-100"
                  :max="100"
                  placeholder="智"
                  size="small"
                  class="attr-input"
                />
                <el-input-number
                  v-model="option.attributeChanges.ti"
                  :min="-100"
                  :max="100"
                  placeholder="体"
                  size="small"
                  class="attr-input"
                />
                <el-input-number
                  v-model="option.attributeChanges.mei"
                  :min="-100"
                  :max="100"
                  placeholder="美"
                  size="small"
                  class="attr-input"
                />
                <el-input-number
                  v-model="option.attributeChanges.lao"
                  :min="-100"
                  :max="100"
                  placeholder="劳"
                  size="small"
                  class="attr-input"
                />
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="showEditorDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveScript" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Delete } from '@element-plus/icons-vue'
import request from '@/services/api'
import type { Script } from '@/types'

const loading = ref(false)
const saving = ref(false)
const allScripts = ref<Script[]>([])
const filterType = ref('')
const filterLocation = ref('')
const searchKeyword = ref('')
const showEditorDialog = ref(false)
const isEditing = ref(false)

const emptyScript = () => ({
  id: 0,
  title: '',
  content: '',
  type: 'branch' as const,
  location: 'campus',
  triggerCondition: {
    semester: [],
    week: [],
    minAttributes: {},
    requiredScripts: []
  },
  options: []
})

const currentScript = ref<any>(emptyScript())

const filteredScripts = computed(() => {
  return allScripts.value.filter(script => {
    if (filterType.value && script.type !== filterType.value) return false
    if (filterLocation.value && script.location !== filterLocation.value) return false
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      return (
        script.title.toLowerCase().includes(keyword) ||
        script.content.toLowerCase().includes(keyword)
      )
    }
    return true
  })
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

const loadScripts = async () => {
  try {
    loading.value = true
    const res = await request.get('/admin/scripts')
    allScripts.value = res.data.scripts || []
  } catch (error) {
    console.error('Failed to load scripts:', error)
    ElMessage.error('加载剧本列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreateScript = () => {
  isEditing.value = false
  currentScript.value = emptyScript()
  showEditorDialog.value = true
}

const handleEditScript = (script: Script) => {
  isEditing.value = true
  currentScript.value = JSON.parse(JSON.stringify(script))
  showEditorDialog.value = true
}

const handleDuplicateScript = (script: Script) => {
  isEditing.value = false
  const duplicated = JSON.parse(JSON.stringify(script))
  duplicated.id = 0
  duplicated.title = `${script.title} (副本)`
  currentScript.value = duplicated
  showEditorDialog.value = true
}

const handleDeleteScript = async (script: Script) => {
  try {
    await ElMessageBox.confirm(`确定要删除剧本"${script.title}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/admin/scripts/${script.id}`)
    ElMessage.success('删除成功')
    loadScripts()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete script:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleAddOption = () => {
  currentScript.value.options.push({
    id: currentScript.value.options.length + 1,
    text: '',
    attributeChanges: {}
  })
}

const handleRemoveOption = (index: number) => {
  currentScript.value.options.splice(index, 1)
}

const handleSaveScript = async () => {
  try {
    saving.value = true

    if (isEditing.value) {
      await request.put(`/admin/scripts/${currentScript.value.id}`, currentScript.value)
      ElMessage.success('更新成功')
    } else {
      await request.post('/admin/scripts', currentScript.value)
      ElMessage.success('创建成功')
    }

    showEditorDialog.value = false
    loadScripts()
  } catch (error) {
    console.error('Failed to save script:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadScripts()
})
</script>

<style scoped>
.script-management {
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-item {
  width: 160px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.scripts-table {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.condition-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

/* 表单样式 */
.script-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 12px;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.attributes-input {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.option-number {
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.option-text-input {
  margin-bottom: 12px;
}

.attribute-changes {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.attribute-changes .label {
  font-size: 13px;
  color: #606266;
  margin-right: 4px;
}

.attr-input {
  width: 100px;
}

.w-full {
  width: 100%;
}
</style>
