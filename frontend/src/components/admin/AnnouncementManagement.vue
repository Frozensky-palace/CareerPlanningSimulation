<template>
  <div class="announcement-management">
    <div class="management-header">
      <h1 class="page-title">公告管理</h1>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        发布公告
      </el-button>
    </div>

    <!-- 公告列表 -->
    <div class="announcement-list" v-loading="loading">
      <el-table :data="announcements" stripe class="data-table">
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isPublished ? 'success' : 'info'" size="small">
              {{ scope.row.isPublished ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" text size="small" @click="openEditDialog(scope.row)">
              编辑
            </el-button>
            <el-button
              :type="scope.row.isPublished ? 'warning' : 'success'"
              text
              size="small"
              @click="togglePublish(scope.row)"
            >
              {{ scope.row.isPublished ? '取消发布' : '发布' }}
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '发布公告'"
      width="700px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入公告内容，支持HTML"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.isPublished"
            active-text="已发布"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '发布' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/services/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const announcements = ref<any[]>([])
const formRef = ref<FormInstance>()
const currentId = ref<number | null>(null)

const form = reactive({
  title: '',
  content: '',
  isPublished: true
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadAnnouncements = async () => {
  try {
    loading.value = true
    const res = await request.get('/admin/announcements')
    announcements.value = res.data.announcements || []
  } catch (error) {
    console.error('Failed to load announcements:', error)
    ElMessage.error('加载公告失败')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  currentId.value = null
  form.title = ''
  form.content = ''
  form.isPublished = true
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  currentId.value = row.id
  form.title = row.title
  form.content = row.content
  form.isPublished = row.isPublished
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true

        if (isEdit.value) {
          await request.put(`/admin/announcements/${currentId.value}`, form)
          ElMessage.success('更新成功')
        } else {
          await request.post('/admin/announcements', form)
          ElMessage.success('发布成功')
        }

        dialogVisible.value = false
        loadAnnouncements()
      } catch (error) {
        console.error('Submit error:', error)
        ElMessage.error('操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const togglePublish = async (row: any) => {
  try {
    await request.put(`/admin/announcements/${row.id}`, {
      isPublished: !row.isPublished
    })
    ElMessage.success(row.isPublished ? '已取消发布' : '已发布')
    loadAnnouncements()
  } catch (error) {
    console.error('Toggle publish error:', error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除公告"${row.title}"吗？`, '确认删除', {
      type: 'warning'
    })

    await request.delete(`/admin/announcements/${row.id}`)
    ElMessage.success('删除成功')
    loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.announcement-management {
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

.announcement-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
}
</style>
