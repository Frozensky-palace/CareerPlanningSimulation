<template>
  <div class="workshop-editor">
    <!-- 顶部工具栏 -->
    <header class="editor-header">
      <div class="header-left">
        <el-button text @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-input
          v-model="chainTitle"
          class="chain-title-input"
          placeholder="剧本链标题"
          @blur="saveChainInfo"
        />
      </div>
      <div class="header-center">
        <el-button-group>
          <el-button :type="activePanel === 'tree' ? 'primary' : 'default'" @click="activePanel = 'tree'">
            <el-icon><Share /></el-icon>
            树状图
          </el-button>
          <el-button :type="activePanel === 'editor' ? 'primary' : 'default'" @click="activePanel = 'editor'" :disabled="!selectedScript">
            <el-icon><Edit /></el-icon>
            编辑器
          </el-button>
        </el-button-group>
      </div>
      <div class="header-right">
        <el-button @click="toggleAiPanel">
          <el-icon><ChatLineRound /></el-icon>
          AI 助手
        </el-button>
        <el-button
          :type="chain?.isImported ? 'warning' : 'success'"
          @click="handleImport"
          :loading="importing"
        >
          <el-icon v-if="chain?.isImported"><Download /></el-icon>
          <el-icon v-else><Upload /></el-icon>
          {{ chain?.isImported ? '取消导入' : '导入游戏' }}
        </el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="editor-main">
      <!-- 树状图面板 -->
      <div class="tree-panel" v-show="activePanel === 'tree'">
        <div class="tree-toolbar">
          <el-button type="primary" size="small" @click="addScript">
            <el-icon><Plus /></el-icon>
            添加节点
          </el-button>
          <el-button size="small" @click="fitView">
            <el-icon><FullScreen /></el-icon>
            适应视图
          </el-button>
        </div>
        <VueFlow
          ref="vueFlowRef"
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-viewport="{ zoom: 1 }"
          :min-zoom="0.2"
          :max-zoom="2"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          fit-view-on-init
          @node-click="onNodeClick"
          @node-drag-stop="onNodeDragStop"
          @edge-click="onEdgeClick"
          class="vue-flow-container"
        >
          <template #node-script="{ data }">
            <div class="script-node" :class="{ 'is-entry': data.isEntryPoint, 'is-selected': data.id === selectedScript?.id }">
              <div class="node-header">
                <el-icon v-if="data.isEntryPoint" class="entry-icon"><Flag /></el-icon>
                <span class="node-title">{{ data.label }}</span>
              </div>
              <div class="node-content">
                {{ data.contentPreview || '暂无内容' }}
              </div>
              <div class="node-footer">
                <span class="option-count">{{ data.optionCount || 0 }} 个选项</span>
              </div>
            </div>
          </template>
          <Background pattern-color="#aaa" :gap="20" />
          <Controls />
          <MiniMap />
        </VueFlow>
      </div>

      <!-- 编辑器面板 -->
      <div class="editor-panel" v-show="activePanel === 'editor'">
        <div v-if="!selectedScript" class="no-selection">
          <el-icon :size="48"><Document /></el-icon>
          <p>请在树状图中选择一个节点进行编辑</p>
        </div>
        <div v-else class="script-editor">
          <!-- 基本信息 -->
          <div class="editor-section">
            <h3 class="section-title">基本信息</h3>
            <el-form label-width="80px">
              <el-form-item label="标题">
                <el-input v-model="selectedScript.title" placeholder="节点标题" @blur="saveScript" />
              </el-form-item>
              <el-form-item label="入口节点">
                <el-switch v-model="selectedScript.isEntryPoint" @change="setAsEntry" />
                <span class="form-hint">设为入口后，游戏将从此节点开始</span>
              </el-form-item>
              <el-form-item label="场景">
                <el-select v-model="selectedScript.location" @change="saveScript">
                  <el-option label="田径场" value="stadium" />
                  <el-option label="我的宿舍" value="dormitory" />
                  <el-option label="文化广场" value="plaza" />
                  <el-option label="图书馆" value="library" />
                  <el-option label="一课大楼" value="academic" />
                  <el-option label="学生发展中心" value="student_center" />
                  <el-option label="社团发展中心" value="club_center" />
                  <el-option label="科研孵化基地" value="research_base" />
                  <el-option label="创客空间" value="maker_space" />
                </el-select>
              </el-form-item>
              <el-form-item label="背景图">
                <el-input v-model="selectedScript.backgroundImage" placeholder="背景图片URL（可选）" @blur="saveScript" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 内容段落 -->
          <div class="editor-section">
            <div class="section-header">
              <h3 class="section-title">内容段落</h3>
              <el-button size="small" @click="addContent">
                <el-icon><Plus /></el-icon>
                添加段落
              </el-button>
            </div>
            <div class="contents-list">
              <div v-for="(_, index) in selectedScript.contents" :key="index" class="content-item">
                <el-input
                  v-model="selectedScript.contents[index]"
                  type="textarea"
                  :rows="2"
                  :placeholder="`段落 ${index + 1}`"
                  @blur="saveScript"
                />
                <el-button text type="danger" @click="removeContent(index)" :disabled="selectedScript.contents.length <= 1">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 选项 -->
          <div class="editor-section">
            <div class="section-header">
              <h3 class="section-title">选项</h3>
              <el-button size="small" @click="addOption">
                <el-icon><Plus /></el-icon>
                添加选项
              </el-button>
            </div>
            <div class="options-list">
              <div v-for="(option, index) in selectedScript.options" :key="index" class="option-item">
                <div class="option-main">
                  <el-input v-model="option.text" placeholder="选项文本" @blur="saveScript" />
                  <el-select v-model="option.nextScriptId" placeholder="跳转节点" clearable @change="saveScript">
                    <el-option
                      v-for="script in otherScripts"
                      :key="script.id"
                      :label="script.title"
                      :value="script.id"
                    />
                  </el-select>
                </div>
                <el-button text type="danger" @click="removeOption(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div v-if="selectedScript.options.length === 0" class="empty-hint">
                暂无选项，添加选项以创建分支
              </div>
            </div>
          </div>

          <!-- 删除节点 -->
          <div class="editor-section danger-zone">
            <el-button type="danger" @click="deleteCurrentScript">
              <el-icon><Delete /></el-icon>
              删除此节点
            </el-button>
          </div>
        </div>
      </div>

      <!-- AI 助手面板 -->
      <transition name="slide-right">
        <div class="ai-panel" v-show="showAiPanel">
          <div class="ai-header">
            <h3>AI 创作助手</h3>
            <el-button text @click="showAiPanel = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="ai-content">
            <div class="ai-messages">
              <div class="ai-placeholder">
                <el-icon :size="48"><ChatLineRound /></el-icon>
                <h4>AI 助手功能开发中</h4>
                <p>即将支持：</p>
                <ul>
                  <li>自动生成剧本内容</li>
                  <li>优化剧情描述</li>
                  <li>生成选项分支</li>
                  <li>剧情一致性检查</li>
                </ul>
              </div>
            </div>
            <div class="ai-input">
              <el-input
                v-model="aiPrompt"
                type="textarea"
                :rows="3"
                placeholder="描述你想要的剧情内容..."
                disabled
              />
              <el-button type="primary" disabled>
                <el-icon><Promotion /></el-icon>
                生成
              </el-button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Share,
  Edit,
  ChatLineRound,
  Upload,
  Download,
  Plus,
  FullScreen,
  Flag,
  Document,
  Delete,
  Close,
  Promotion
} from '@element-plus/icons-vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Node, Edge } from '@vue-flow/core'
import request from '@/services/api'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

interface WorkshopScript {
  id: number
  chainId: number
  title: string
  content: string
  contents: string[]
  backgroundImage: string | null
  location: string
  options: Array<{
    text: string
    nextScriptId: number | null
  }>
  position: { x: number; y: number }
  isEntryPoint: boolean
}

interface WorkshopChain {
  id: number
  title: string
  description: string
  coverImage: string | null
  rootScriptId: number | null
  isImported: boolean
}

const route = useRoute()
const router = useRouter()
const { fitView: vueFlowFitView } = useVueFlow()

const vueFlowRef = ref()
const chainId = computed(() => Number(route.params.id))

// 数据状态
const chain = ref<WorkshopChain | null>(null)
const scripts = ref<WorkshopScript[]>([])
const chainTitle = ref('')
const selectedScript = ref<WorkshopScript | null>(null)

// UI 状态
const activePanel = ref<'tree' | 'editor'>('tree')
const showAiPanel = ref(false)
const importing = ref(false)
const aiPrompt = ref('')

// Vue Flow 节点和边
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// 其他脚本（用于选项跳转选择）
const otherScripts = computed(() => {
  if (!selectedScript.value) return scripts.value
  return scripts.value.filter(s => s.id !== selectedScript.value!.id)
})

// 加载数据
const loadData = async () => {
  try {
    const res = await request.get(`/workshop/chains/${chainId.value}`)
    chain.value = res.data.chain
    scripts.value = res.data.scripts || []
    chainTitle.value = chain.value?.title || ''

    // 确保每个脚本都有 contents 数组
    scripts.value.forEach(script => {
      if (!script.contents || !Array.isArray(script.contents)) {
        script.contents = script.content ? [script.content] : ['']
      }
      if (!script.options || !Array.isArray(script.options)) {
        script.options = []
      }
      if (!script.position) {
        script.position = { x: 0, y: 0 }
      }
    })

    updateFlowData()
  } catch (error) {
    ElMessage.error('加载失败')
    router.push('/workshop')
  }
}

// 更新 Vue Flow 数据
const updateFlowData = () => {
  // 生成节点
  nodes.value = scripts.value.map((script, index) => ({
    id: String(script.id),
    type: 'script',
    position: script.position || { x: index * 300, y: 100 },
    data: {
      id: script.id,
      label: script.title || '未命名',
      contentPreview: (script.contents?.[0] || script.content || '').substring(0, 50),
      optionCount: script.options?.length || 0,
      isEntryPoint: script.isEntryPoint
    }
  }))

  // 生成边（根据选项的 nextScriptId）
  const newEdges: Edge[] = []
  scripts.value.forEach(script => {
    script.options?.forEach((option, optIndex) => {
      if (option.nextScriptId) {
        newEdges.push({
          id: `e${script.id}-${option.nextScriptId}-${optIndex}`,
          source: String(script.id),
          target: String(option.nextScriptId),
          label: option.text,
          type: 'smoothstep',
          animated: true
        })
      }
    })
  })
  edges.value = newEdges
}

// 保存剧本链信息
const saveChainInfo = async () => {
  if (!chain.value || !chainTitle.value.trim()) return
  try {
    await request.put(`/workshop/chains/${chainId.value}`, {
      title: chainTitle.value.trim()
    })
  } catch (error) {
    console.error('Save chain info error:', error)
  }
}

// 添加节点
const addScript = async () => {
  try {
    const isFirst = scripts.value.length === 0
    const res = await request.post(`/workshop/chains/${chainId.value}/scripts`, {
      title: '新节点',
      contents: ['请输入内容...'],
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      isEntryPoint: isFirst
    })

    const newScript = res.data.script
    newScript.contents = newScript.contents || ['']
    newScript.options = newScript.options || []
    scripts.value.push(newScript)
    updateFlowData()

    // 自动选中新节点
    selectedScript.value = newScript
    activePanel.value = 'editor'

    ElMessage.success('节点已添加')
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

// 节点点击
const onNodeClick = ({ node }: { node: Node }) => {
  const script = scripts.value.find(s => s.id === Number(node.id))
  if (script) {
    selectedScript.value = { ...script }
    activePanel.value = 'editor'
  }
}

// 节点拖拽结束
const onNodeDragStop = async ({ node }: { node: Node }) => {
  const script = scripts.value.find(s => s.id === Number(node.id))
  if (script) {
    script.position = node.position
    try {
      await request.patch('/workshop/scripts/positions', {
        positions: [{ scriptId: script.id, position: node.position }]
      })
    } catch (error) {
      console.error('Save position error:', error)
    }
  }
}

// 边点击
const onEdgeClick = ({ edge }: { edge: Edge }) => {
  const sourceScript = scripts.value.find(s => s.id === Number(edge.source))
  if (sourceScript) {
    selectedScript.value = { ...sourceScript }
    activePanel.value = 'editor'
  }
}

// 适应视图
const fitView = () => {
  nextTick(() => {
    vueFlowFitView()
  })
}

// 保存脚本
const saveScript = async () => {
  if (!selectedScript.value) return
  try {
    await request.put(`/workshop/scripts/${selectedScript.value.id}`, {
      title: selectedScript.value.title,
      contents: selectedScript.value.contents,
      backgroundImage: selectedScript.value.backgroundImage,
      location: selectedScript.value.location,
      options: selectedScript.value.options,
      isEntryPoint: selectedScript.value.isEntryPoint
    })

    // 更新本地数据
    const index = scripts.value.findIndex(s => s.id === selectedScript.value!.id)
    if (index !== -1) {
      scripts.value[index] = { ...selectedScript.value }
    }
    updateFlowData()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 设为入口
const setAsEntry = async () => {
  await saveScript()
  if (selectedScript.value?.isEntryPoint) {
    // 更新其他节点的入口状态
    scripts.value.forEach(s => {
      if (s.id !== selectedScript.value!.id) {
        s.isEntryPoint = false
      }
    })
    updateFlowData()
  }
}

// 添加内容段落
const addContent = () => {
  if (!selectedScript.value) return
  selectedScript.value.contents.push('')
}

// 删除内容段落
const removeContent = (index: number) => {
  if (!selectedScript.value || selectedScript.value.contents.length <= 1) return
  selectedScript.value.contents.splice(index, 1)
  saveScript()
}

// 添加选项
const addOption = () => {
  if (!selectedScript.value) return
  selectedScript.value.options.push({
    text: '',
    nextScriptId: null
  })
}

// 删除选项
const removeOption = (index: number) => {
  if (!selectedScript.value) return
  selectedScript.value.options.splice(index, 1)
  saveScript()
}

// 删除当前节点
const deleteCurrentScript = async () => {
  if (!selectedScript.value) return

  try {
    await ElMessageBox.confirm(
      '确定要删除此节点吗？此操作不可恢复。',
      '删除确认',
      { type: 'warning' }
    )

    await request.delete(`/workshop/scripts/${selectedScript.value.id}`)
    scripts.value = scripts.value.filter(s => s.id !== selectedScript.value!.id)
    selectedScript.value = null
    activePanel.value = 'tree'
    updateFlowData()
    ElMessage.success('节点已删除')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 切换 AI 面板
const toggleAiPanel = () => {
  showAiPanel.value = !showAiPanel.value
}

// 导入游戏
const handleImport = async () => {
  if (!chain.value) return

  if (chain.value.isImported) {
    // 取消导入
    try {
      await request.delete(`/workshop/chains/${chainId.value}/import`)
      chain.value.isImported = false
      ElMessage.success('已取消导入')
    } catch (error) {
      ElMessage.error('操作失败')
    }
  } else {
    // 导入
    importing.value = true
    try {
      await request.post(`/workshop/chains/${chainId.value}/import`)
      chain.value.isImported = true
      ElMessage.success('导入成功！可在游戏中体验')
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '导入失败')
    } finally {
      importing.value = false
    }
  }
}

// 返回
const goBack = () => {
  router.push('/workshop')
}

// 监听选中脚本变化
watch(selectedScript, (newVal) => {
  if (newVal) {
    // 确保有 contents 数组
    if (!newVal.contents || !Array.isArray(newVal.contents)) {
      newVal.contents = newVal.content ? [newVal.content] : ['']
    }
    if (!newVal.options || !Array.isArray(newVal.options)) {
      newVal.options = []
    }
  }
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.workshop-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部工具栏 */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: #606266;
}

.chain-title-input {
  width: 200px;
}

.chain-title-input :deep(.el-input__inner) {
  font-weight: 600;
  font-size: 16px;
}

.header-center {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主内容区 */
.editor-main {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* 树状图面板 */
.tree-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.tree-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.vue-flow-container {
  flex: 1;
}

/* 自定义节点样式 */
.script-node {
  min-width: 180px;
  max-width: 220px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.script-node:hover {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.script-node.is-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.script-node.is-entry {
  border-color: #67c23a;
}

.script-node.is-entry .node-header {
  background: linear-gradient(135deg, #67c23a 0%, #4cae4c 100%);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
}

.entry-icon {
  font-size: 14px;
}

.node-title {
  font-weight: 600;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-content {
  padding: 10px 12px;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 36px;
}

.node-footer {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 11px;
  color: #909399;
}

/* 编辑器面板 */
.editor-panel {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.no-selection p {
  margin-top: 16px;
}

.script-editor {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.editor-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
}

.section-header .section-title {
  margin: 0;
}

.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

/* 内容列表 */
.contents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.content-item .el-textarea {
  flex: 1;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-main {
  flex: 1;
  display: flex;
  gap: 8px;
}

.option-main .el-input {
  flex: 1;
}

.option-main .el-select {
  width: 180px;
}

.empty-hint {
  padding: 20px;
  text-align: center;
  color: #909399;
  background: #f5f7fa;
  border-radius: 8px;
}

/* 危险区域 */
.danger-zone {
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* AI 面板 */
.ai-panel {
  width: 360px;
  background: white;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.ai-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.ai-placeholder {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
}

.ai-placeholder .el-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.ai-placeholder h4 {
  margin: 0 0 16px;
  color: #606266;
}

.ai-placeholder p {
  margin: 0 0 8px;
}

.ai-placeholder ul {
  text-align: left;
  padding-left: 24px;
  margin: 0;
}

.ai-placeholder li {
  margin: 4px 0;
}

.ai-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-input .el-button {
  align-self: flex-end;
}

/* 动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Vue Flow 样式覆盖 */
:deep(.vue-flow__edge-path) {
  stroke: #409eff;
  stroke-width: 2;
}

:deep(.vue-flow__edge-text) {
  font-size: 11px;
  fill: #606266;
}

:deep(.vue-flow__minimap) {
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.vue-flow__controls) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 按钮样式增强 */
:deep(.el-button--primary) {
  background-color: #1A8FFF;
  border-color: #1A8FFF;
  color: white;
  font-weight: 500;
}

:deep(.el-button--primary:hover) {
  background-color: #0070E0;
  border-color: #0070E0;
}

:deep(.el-button--success) {
  background-color: #67C23A;
  border-color: #67C23A;
  color: white;
  font-weight: 500;
}

:deep(.el-button--success:hover) {
  background-color: #529b2e;
  border-color: #529b2e;
}

:deep(.el-button--danger) {
  background-color: #F56C6C;
  border-color: #F56C6C;
  color: white;
  font-weight: 500;
}

:deep(.el-button--danger:hover) {
  background-color: #dd3333;
  border-color: #dd3333;
}

:deep(.el-button--warning) {
  background-color: #E6A23C;
  border-color: #E6A23C;
  color: white;
  font-weight: 500;
}

:deep(.el-button--warning:hover) {
  background-color: #cf9236;
  border-color: #cf9236;
}
</style>
