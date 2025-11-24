<template>
  <div class="credits-management">
    <div class="management-header">
      <h1 class="page-title">制作者名单管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="addGroup">
          <el-icon><Plus /></el-icon>
          添加分组
        </el-button>
        <el-button type="success" @click="handleSave" :loading="saving">
          保存更改
        </el-button>
      </div>
    </div>

    <div class="credits-editor" v-loading="loading">
      <div v-if="credits.length === 0" class="empty-state">
        <el-empty description="暂无制作者信息">
          <el-button type="primary" @click="addGroup">添加第一个分组</el-button>
        </el-empty>
      </div>

      <draggable
        v-else
        v-model="credits"
        item-key="id"
        handle=".group-handle"
        class="credits-list"
      >
        <template #item="{ element, index }">
          <div class="credits-group-card">
            <div class="group-header">
              <div class="group-handle">
                <el-icon><Rank /></el-icon>
              </div>
              <el-input
                v-model="element.title"
                placeholder="分组名称（如：策划组、开发组）"
                class="group-title-input"
              />
              <el-button type="danger" text @click="removeGroup(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <div class="group-members">
              <div class="members-label">成员列表：</div>
              <div class="members-tags">
                <el-tag
                  v-for="(member, mIndex) in element.members"
                  :key="mIndex"
                  closable
                  @close="removeMember(index, mIndex)"
                  class="member-tag"
                >
                  {{ member }}
                </el-tag>
                <el-input
                  v-if="element.isAdding"
                  v-model="element.newMember"
                  class="new-member-input"
                  size="small"
                  placeholder="输入成员名"
                  @keyup.enter="confirmAddMember(index)"
                  @blur="confirmAddMember(index)"
                  ref="newMemberInputRef"
                />
                <el-button
                  v-else
                  size="small"
                  class="add-member-btn"
                  @click="startAddMember(index)"
                >
                  <el-icon><Plus /></el-icon>
                  添加成员
                </el-button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 预览 -->
    <div class="preview-section">
      <h3 class="preview-title">预览效果</h3>
      <div class="preview-content">
        <div v-if="credits.length === 0" class="empty-preview">暂无制作者信息</div>
        <div v-for="(group, index) in credits" :key="index" class="preview-group">
          <h4 class="preview-group-title">{{ group.title || '未命名分组' }}</h4>
          <div class="preview-members">
            <span v-for="(member, mIndex) in group.members" :key="mIndex" class="preview-member">
              {{ member }}
            </span>
            <span v-if="group.members.length === 0" class="no-members">暂无成员</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Rank } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import request from '@/services/api'

interface CreditGroup {
  id: number
  title: string
  members: string[]
  isAdding?: boolean
  newMember?: string
}

const loading = ref(false)
const saving = ref(false)
const credits = ref<CreditGroup[]>([])
const newMemberInputRef = ref<any[]>([])

const loadCredits = async () => {
  try {
    loading.value = true
    const res = await request.get('/admin/credits')
    const data = res.data.credits || []
    credits.value = data.map((g: any, i: number) => ({
      id: Date.now() + i,
      title: g.title,
      members: g.members || [],
      isAdding: false,
      newMember: ''
    }))
  } catch (error) {
    console.error('Failed to load credits:', error)
    ElMessage.error('加载制作者名单失败')
  } finally {
    loading.value = false
  }
}

const addGroup = () => {
  credits.value.push({
    id: Date.now(),
    title: '',
    members: [],
    isAdding: false,
    newMember: ''
  })
}

const removeGroup = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该分组吗？', '确认删除', {
      type: 'warning'
    })
    credits.value.splice(index, 1)
  } catch {
    // 用户取消
  }
}

const startAddMember = (groupIndex: number) => {
  credits.value[groupIndex].isAdding = true
  credits.value[groupIndex].newMember = ''
  nextTick(() => {
    // 聚焦输入框
    const inputs = document.querySelectorAll('.new-member-input input')
    if (inputs.length > 0) {
      (inputs[0] as HTMLInputElement).focus()
    }
  })
}

const confirmAddMember = (groupIndex: number) => {
  const group = credits.value[groupIndex]
  if (group.newMember && group.newMember.trim()) {
    group.members.push(group.newMember.trim())
  }
  group.isAdding = false
  group.newMember = ''
}

const removeMember = (groupIndex: number, memberIndex: number) => {
  credits.value[groupIndex].members.splice(memberIndex, 1)
}

const handleSave = async () => {
  try {
    saving.value = true

    // 清理数据，只保存必要字段
    const cleanData = credits.value.map(g => ({
      title: g.title,
      members: g.members
    }))

    await request.put('/admin/credits', { credits: cleanData })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('Save error:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCredits()
})
</script>

<style scoped>
.credits-management {
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

.credits-editor {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.credits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.credits-group-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.group-handle {
  cursor: move;
  color: #909399;
  padding: 4px;
}

.group-handle:hover {
  color: #1A8FFF;
}

.group-title-input {
  flex: 1;
}

.group-members {
  padding-left: 36px;
}

.members-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.members-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.member-tag {
  font-size: 13px;
}

.new-member-input {
  width: 120px;
}

.add-member-btn {
  border-style: dashed;
}

.empty-state {
  padding: 40px;
}

/* 预览区域 */
.preview-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-content {
  max-height: 300px;
  overflow-y: auto;
}

.preview-group {
  margin-bottom: 20px;
}

.preview-group:last-child {
  margin-bottom: 0;
}

.preview-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #1A8FFF;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1A8FFF;
}

.preview-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-member {
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
}

.empty-preview,
.no-members {
  color: #909399;
  font-size: 13px;
}
</style>
