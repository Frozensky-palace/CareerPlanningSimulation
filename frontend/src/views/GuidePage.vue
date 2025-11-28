<template>
  <div class="guide-page">
    <!-- 背景图片 -->
    <div class="hero-background"></div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 主标题区域 -->
      <div class="title-section" :class="{ 'fade-in': mounted }">
        <h1 class="main-title">新手引导</h1>
        <p class="sub-title">了解模拟流程，开启你的大学生涯规划之旅</p>
      </div>

      <!-- 引导步骤区域 -->
      <div class="guide-wrapper" :class="{ 'slide-up': mounted }">
        <!-- 步骤1 -->
        <div
          class="guide-step"
          :class="{ 'active': currentStep === 1 }"
          @click="setStep(1)"
        >
          <div class="step-number">1</div>
          <div class="step-icon">
            <el-icon :size="48"><Setting /></el-icon>
          </div>
          <div class="step-content">
            <h3 class="step-title">设置初始数值</h3>
            <p class="step-desc">选择你的初始属性分配，规划你的大学起点</p>
            <div class="step-detail" v-show="currentStep === 1">
              <ul>
                <li>分配五维属性初始点数（德智体美劳）</li>
                <li>选择你的专业方向与兴趣领域</li>
                <li>确认后开始你的模拟之旅</li>
              </ul>
            </div>
          </div>
          <div class="step-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 步骤2 -->
        <div
          class="guide-step"
          :class="{ 'active': currentStep === 2 }"
          @click="setStep(2)"
        >
          <div class="step-number">2</div>
          <div class="step-icon">
            <el-icon :size="48"><Document /></el-icon>
          </div>
          <div class="step-content">
            <h3 class="step-title">完成剧本事件</h3>
            <p class="step-desc">参与校园活动，做出选择，获得属性提升</p>
            <div class="step-detail" v-show="currentStep === 2">
              <ul>
                <li>探索校园地图，发现各类事件</li>
                <li>根据剧情做出你的选择</li>
                <li>不同选择将带来不同的属性变化</li>
              </ul>
            </div>
          </div>
          <div class="step-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 步骤3 -->
        <div
          class="guide-step"
          :class="{ 'active': currentStep === 3 }"
          @click="setStep(3)"
        >
          <div class="step-number">3</div>
          <div class="step-icon">
            <el-icon :size="48"><Medal /></el-icon>
          </div>
          <div class="step-content">
            <h3 class="step-title">赢得勋章结算</h3>
            <p class="step-desc">完成学期目标，获取成就勋章，回顾成长历程</p>
            <div class="step-detail" v-show="currentStep === 3">
              <ul>
                <li>达成特定条件解锁成就勋章</li>
                <li>学期结束时查看综合评价</li>
                <li>回顾你的选择与成长轨迹</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤指示器 -->
      <div class="step-indicators" :class="{ 'fade-in': mounted }">
        <div
          v-for="i in 3"
          :key="i"
          class="indicator"
          :class="{ 'active': currentStep === i }"
          @click="setStep(i)"
        ></div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons" :class="{ 'fade-in': mounted }">
        <el-button
          type="primary"
          size="large"
          @click="handleStart"
          class="start-btn"
        >
          <el-icon><VideoPlay /></el-icon>
          开始设置
        </el-button>
        <el-button
          size="large"
          @click="handleBack"
          class="back-btn"
        >
          <el-icon><Back /></el-icon>
          返回主页
        </el-button>
      </div>

      <!-- 提示信息 -->
      <div class="guide-tip" :class="{ 'fade-in': mounted }">
        <el-icon><InfoFilled /></el-icon>
        <span>点击步骤卡片查看详细说明</span>
      </div>

      <!-- 底部版权 -->
      <footer class="page-footer">
        <span>© 2025 易班·沉浸式大学模拟规划平台</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Setting,
  Document,
  Medal,
  ArrowRight,
  VideoPlay,
  Back,
  InfoFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 动画状态
const mounted = ref(false)

// 当前选中的步骤
const currentStep = ref(1)

// 自动轮播定时器
let autoPlayTimer: number | null = null

// 设置当前步骤
const setStep = (step: number) => {
  currentStep.value = step
  // 用户手动切换时，重置自动轮播
  resetAutoPlay()
}

// 自动轮播
const startAutoPlay = () => {
  autoPlayTimer = window.setInterval(() => {
    currentStep.value = currentStep.value >= 3 ? 1 : currentStep.value + 1
  }, 4000)
}

// 重置自动轮播
const resetAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
  startAutoPlay()
}

// 开始设置
const handleStart = () => {
  router.push('/initial-setup')
}

// 返回主页
const handleBack = () => {
  router.push('/')
}

onMounted(() => {
  // 延迟显示动画
  setTimeout(() => {
    mounted.value = true
  }, 100)

  // 启动自动轮播
  startAutoPlay()
})
</script>

<style scoped>
.guide-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

/* 背景图片 */
.hero-background {
  position: absolute;
  inset: 0;
  background: url('/images/hero-background.webp') center/cover no-repeat;
  z-index: 0;
}

/* 主容器 */
.main-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* 标题区域 */
.title-section {
  text-align: center;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.title-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem;
  letter-spacing: 3px;
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 3px 10px rgba(0, 0, 0, 0.5);
}

.sub-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

/* 引导步骤区域 */
.guide-wrapper {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0.2s;
}

.guide-wrapper.slide-up {
  opacity: 1;
  transform: translateY(0);
}

/* 步骤卡片 */
.guide-step {
  flex: 1;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.guide-step:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(26, 143, 255, 0.25);
}

.guide-step.active {
  border-color: #1A8FFF;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(26, 143, 255, 0.3);
}

/* 步骤编号 */
.step-number {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

/* 步骤图标 */
.step-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.step-icon .el-icon {
  color: #1A8FFF;
}

.guide-step.active .step-icon {
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
}

.guide-step.active .step-icon .el-icon {
  color: white;
}

/* 步骤内容 */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
}

.step-desc {
  font-size: 0.9rem;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

/* 步骤详情 */
.step-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  animation: fadeIn 0.3s ease;
}

.step-detail ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.step-detail li {
  font-size: 0.85rem;
  color: #606266;
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.step-detail li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #1A8FFF;
  border-radius: 50%;
}

/* 步骤箭头 */
.step-arrow {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(26, 143, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.step-arrow .el-icon {
  color: #1A8FFF;
  font-size: 20px;
}

.guide-step:last-child .step-arrow {
  display: none;
}

/* 步骤指示器 */
.step-indicators {
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: all 0.8s ease;
  transition-delay: 0.4s;
}

.step-indicators.fade-in {
  opacity: 1;
}

.indicator {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: #1A8FFF;
  width: 32px;
  border-radius: 6px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transition: all 0.8s ease;
  transition-delay: 0.5s;
}

.action-buttons.fade-in {
  opacity: 1;
}

.start-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #1A8FFF 0%, #0070E0 100%);
  border: none;
}

.start-btn:hover {
  background: linear-gradient(135deg, #0070E0 0%, #005BBF 100%);
}

.back-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(26, 143, 255, 0.3);
  color: #303133;
}

.back-btn:hover {
  border-color: #1A8FFF;
  background: white;
}

/* 提示信息 */
.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  opacity: 0;
  transition: all 0.8s ease;
  transition-delay: 0.6s;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.guide-tip.fade-in {
  opacity: 1;
}

.guide-tip .el-icon {
  font-size: 18px;
}

/* 底部 */
.page-footer {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 1);
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin-top: 1rem;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .guide-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .guide-step {
    flex-direction: row;
    text-align: left;
    padding: 16px 20px;
  }

  .step-number {
    position: relative;
    top: auto;
    left: auto;
    margin-right: 12px;
  }

  .step-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 0;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .step-icon .el-icon {
    font-size: 32px !important;
  }

  .step-arrow {
    position: relative;
    right: auto;
    top: auto;
    transform: rotate(90deg);
    margin-left: auto;
  }

  .step-detail {
    display: none;
  }

  .guide-step.active .step-detail {
    display: block;
  }
}

@media (max-width: 600px) {
  .guide-page {
    padding: 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .sub-title {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .start-btn,
  .back-btn {
    width: 100%;
  }
}
</style>
