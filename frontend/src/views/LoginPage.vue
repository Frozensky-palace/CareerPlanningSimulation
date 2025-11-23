<template>
  <div class="min-h-screen bg-primary-light">
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-gray-100 py-3 px-6">
      <div class="max-w-6xl mx-auto flex items-center gap-2">
        <el-icon :size="20" class="text-secondary-500 cursor-pointer hover:opacity-70" @click="router.push('/')">
          <ArrowLeft />
        </el-icon>
        <span class="font-semibold text-lg text-gray-800">返回首页</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex items-center justify-center px-4 py-12 md:py-16">
      <div class="w-full max-w-md">
        <!-- 标题区 -->
        <div class="text-center mb-6 animate-fade-in">
          <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-soft flex items-center justify-center">
            <el-icon :size="32" class="text-secondary-500"><User /></el-icon>
          </div>
          <h2 class="text-2xl font-bold text-contrast mb-2">
            {{ isLogin ? '欢迎回来' : '开始你的旅程' }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ isLogin ? '登录并继续你的模拟' : '创建账号，开启大学生涯模拟' }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="bg-white rounded-2xl shadow-medium p-6 md:p-8 animate-scale-in">
          <el-form :model="form" :rules="rules" ref="formRef" size="large">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
                :prefix-icon="User"
                class="!rounded-xl"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                class="!rounded-xl"
              />
            </el-form-item>

            <el-form-item v-if="!isLogin" prop="email">
              <el-input
                v-model="form.email"
                placeholder="邮箱"
                :prefix-icon="Message"
                class="!rounded-xl"
              />
            </el-form-item>

            <el-form-item class="mb-4">
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                class="!w-full !h-12 !rounded-xl !text-base !bg-secondary-500 !border-secondary-500 !text-white hover:!bg-secondary-600 hover:!border-secondary-600 shadow-glow-blue hover:shadow-lg transition-all"
              >
                {{ isLogin ? '登录' : '注册' }}
              </el-button>
            </el-form-item>

            <!-- 切换登录/注册 -->
            <div class="text-center">
              <span class="text-sm text-gray-500">
                {{ isLogin ? '还没有账号？' : '已有账号？' }}
              </span>
              <el-link
                type="primary"
                :underline="false"
                @click="toggleMode"
                class="text-sm ml-1"
              >
                {{ isLogin ? '立即注册' : '立即登录' }}
              </el-link>
            </div>
          </el-form>
        </div>

        <!-- 底部提示 -->
        <div class="mt-6 text-center text-xs text-gray-400">
          <p>登录即表示同意《用户协议》和《隐私政策》</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Message, ArrowLeft } from '@element-plus/icons-vue'
import request from '@/services/api'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  email: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isLogin.value) {
          const res = await request.post('/auth/login', {
            username: form.username,
            password: form.password
          })

          userStore.setToken(res.data.token)
          userStore.setUser(res.data.user)

          ElMessage.success('登录成功')
          router.push('/initial-setup')
        } else {
          await request.post('/auth/register', form)
          ElMessage.success('注册成功，请登录')
          isLogin.value = true
          formRef.value?.resetFields()
        }
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
:deep(.el-input__wrapper) {
  border-radius: 0.75rem;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #1A8FFF;
  --el-button-border-color: #1A8FFF;
  --el-button-hover-bg-color: #0070E0;
  --el-button-hover-border-color: #0070E0;
}
</style>
