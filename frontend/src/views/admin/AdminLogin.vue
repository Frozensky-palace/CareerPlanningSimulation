<template>
  <div class="admin-login">
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="gradient-bg"></div>
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="dot-pattern"></div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <el-icon :size="40" class="logo-icon"><School /></el-icon>
          <h1>后台管理系统</h1>
          <p>大学生涯数字孪生平台</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入管理员用户名"
              prefix-icon="User"
              size="large"
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              :disabled="loading"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <el-button text @click="goHome">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { School, ArrowLeft } from '@element-plus/icons-vue'
import request from '@/services/api'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = await request.post('/admin/login', form)

    // 存储管理员 token（与普通用户 token 分开）
    localStorage.setItem('adminToken', res.data.token)
    localStorage.setItem('adminInfo', JSON.stringify(res.data.admin))

    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decorations {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.gradient-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 20%,
    rgba(26, 143, 255, 0.08) 0%,
    rgba(250, 250, 250, 0) 50%
  );
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(26, 143, 255, 0.1), rgba(26, 143, 255, 0.03));
}

.circle-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -100px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
}

.dot-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(26, 143, 255, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.5;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  color: #1A8FFF;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: #1A8FFF;
  border-color: #1A8FFF;
}

.login-btn:hover {
  background: #0070E0;
  border-color: #0070E0;
}

.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.login-footer .el-button {
  color: #909399;
}

.login-footer .el-button:hover {
  color: #1A8FFF;
}
</style>
