<template>
  <div class="home-page min-h-screen bg-primary-light relative overflow-hidden flex flex-col">
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <!-- 渐变背景 -->
      <div class="gradient-bg"></div>

      <!-- 装饰圆圈 -->
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>

      <!-- 网格点阵 -->
      <div class="dot-pattern"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-gray-100 py-3 px-6 relative z-10">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-icon :size="24" class="text-secondary-500"><School /></el-icon>
          <span class="font-semibold text-lg text-gray-800">大学生涯模拟</span>
        </div>
        <nav class="flex gap-6 items-center">
          <span class="text-sm text-gray-500 hover:text-secondary-500 cursor-pointer transition-colors">关于</span>
          <span class="text-sm text-gray-500 hover:text-secondary-500 cursor-pointer transition-colors">帮助</span>
          <span
            class="text-sm text-gray-600 hover:text-secondary-500 cursor-pointer transition-colors flex items-center gap-1"
            @click="handleAdmin"
          >
            <el-icon :size="14"><Setting /></el-icon>
            后台管理
          </span>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 relative z-10">
      <!-- Hero区域 -->
      <div class="text-center max-w-2xl mx-auto animate-fade-in">
        <!-- Logo/图标区 -->
        <div class="mb-6 relative">
          <div class="w-20 h-20 mx-auto bg-white rounded-2xl shadow-soft flex items-center justify-center animate-float">
            <el-icon :size="40" class="text-secondary-500"><School /></el-icon>
          </div>
          <!-- 装饰光晕 -->
          <div class="absolute inset-0 w-20 h-20 mx-auto bg-secondary-500/20 rounded-2xl blur-xl"></div>
        </div>

        <!-- 标题 -->
        <h1 class="text-3xl md:text-4xl font-bold text-contrast mb-3 tracking-tight">
          大学生涯数字孪生平台
        </h1>

        <!-- 副标题 -->
        <p class="text-sm md:text-base text-gray-500 mb-8 leading-relaxed">
          模拟你的大学四年，探索不同选择带来的成长轨迹
        </p>

        <!-- 特性卡片 -->
        <div class="grid grid-cols-3 gap-3 mb-8 text-xs">
          <FeatureCard icon="TrendCharts" title="五维成长" desc="德智体美劳" />
          <FeatureCard icon="Document" title="剧本事件" desc="丰富剧情" />
          <FeatureCard icon="Trophy" title="成就系统" desc="解锁勋章" />
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <el-button
            type="primary"
            size="large"
            class="!rounded-xl !px-8 !h-12 !text-base !bg-secondary-500 !border-secondary-500 !text-white hover:!bg-secondary-600 hover:!border-secondary-600 shadow-glow-blue hover:shadow-lg transition-all"
            @click="handleStart"
          >
            <el-icon class="mr-2"><VideoPlay /></el-icon>
            开始模拟
          </el-button>
          <el-button
            size="large"
            class="!rounded-xl !px-8 !h-12 !text-base !border-secondary-200 !text-secondary-600 hover:!bg-secondary-50 transition-all"
            @click="handleLogin"
          >
            <el-icon class="mr-2"><User /></el-icon>
            登录账号
          </el-button>
        </div>
      </div>

      <!-- 底部装饰 -->
      <div class="mt-16 flex items-center gap-8 text-xs text-gray-400">
        <div class="flex items-center gap-1">
          <el-icon><UserFilled /></el-icon>
          <span>1,234 用户</span>
        </div>
        <div class="flex items-center gap-1">
          <el-icon><Document /></el-icon>
          <span>50+ 剧本</span>
        </div>
        <div class="flex items-center gap-1">
          <el-icon><Star /></el-icon>
          <span>4.8 评分</span>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="w-full py-3 text-center text-xs text-gray-400 bg-white/80 backdrop-blur-sm border-t border-gray-100 relative z-10 mt-auto">
      <span>© 2024 易班·大学生涯数字孪生平台</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGameStore } from '@/stores/gameStore'
import {
  School,
  VideoPlay,
  User,
  UserFilled,
  Document,
  Star,
  Setting
} from '@element-plus/icons-vue'
import FeatureCard from '@/components/home/FeatureCard.vue'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const handleStart = () => {
  console.log('handleStart - isLoggedIn:', userStore.isLoggedIn, 'currentSave:', !!gameStore.currentSave)

  if (userStore.isLoggedIn) {
    // 已登录，直接进入存档选择页面
    router.push('/initial-setup')
  } else {
    router.push('/login')
  }
}

const handleLogin = () => {
  router.push('/login')
}

const handleAdmin = () => {
  // 直接跳转，让路由守卫处理认证检查
  router.push('/admin')
}
</script>

<style scoped>
/* 背景装饰容器 */
.background-decorations {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* 渐变背景 */
.gradient-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 20%,
    rgba(26, 143, 255, 0.05) 0%,
    rgba(250, 250, 250, 0) 50%
  );
}

/* 装饰圆圈 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(26, 143, 255, 0.08), rgba(26, 143, 255, 0.02));
  backdrop-filter: blur(2px);
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -150px;
  animation: float-slow 20s ease-in-out infinite;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
  animation: float-slow 25s ease-in-out infinite reverse;
}

.circle-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 10%;
  animation: float-slow 30s ease-in-out infinite;
  opacity: 0.5;
}

/* 网格点阵 */
.dot-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(26, 143, 255, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.3;
}

/* 浮动动画 */
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

/* Element Plus按钮主题覆盖 */
:deep(.el-button--primary) {
  --el-button-bg-color: #1A8FFF;
  --el-button-border-color: #1A8FFF;
  --el-button-hover-bg-color: #0070E0;
  --el-button-hover-border-color: #0070E0;
}
</style>
