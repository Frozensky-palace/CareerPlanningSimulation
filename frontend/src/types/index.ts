// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  createdAt?: string
}

// 五维属性
export interface Attributes {
  de: number   // 德
  zhi: number  // 智
  ti: number   // 体
  mei: number  // 美
  lao: number  // 劳
}

// 存档相关类型
export interface Save {
  id: number
  userId: number
  name: string
  semester: number           // 当前学期 1-8
  week: number              // 当前周 1-20
  currentPhase: 'opening' | 'midterm' | 'final'  // 当前阶段
  remainingEvents: number    // 剩余事件数
  attributes: Attributes
  completedScripts: number[]
  unlockedBadges: number[]
  createdAt?: string
  updatedAt?: string
}

// 旧类型别名（向后兼容）
export type UserSave = Save

// 属性变化
export interface AttributeChanges {
  de?: number
  zhi?: number
  ti?: number
  mei?: number
  lao?: number
}

// 旧类型别名
export type ValueChanges = AttributeChanges

// 剧本选项
export interface ScriptOption {
  id: number
  text: string
  attributeChanges: AttributeChanges
  nextScriptId?: number | null
}

// 触发条件
export interface TriggerCondition {
  semester?: number[]
  week?: number[]
  minAttributes?: AttributeChanges
  requiredScripts?: number[]
}

// 剧本
export interface Script {
  id: number
  title: string
  content: string
  contents?: string[]  // 多段内容数组，用于分段显示
  type: 'main' | 'branch' | 'special'
  location: string
  backgroundImage?: string | null  // 剧本背景图片URL
  options: ScriptOption[]
  triggerCondition: TriggerCondition
  isActive: boolean
  status?: 'available' | 'locked' | 'completed'  // 解锁状态
  unlockReason?: string | null  // 未解锁原因
  createdAt?: string
  updatedAt?: string
}

// 剧本节点（简化）
export interface ScriptNode {
  id: number
  script_id: number
  content: string
  options: ScriptOption[]
}

// 勋章
export interface Badge {
  id: number
  name: string
  description: string
  icon_url: string
  unlock_condition: any
  unlocked?: boolean
  unlocked_at?: string
}

// 形象配置
export interface AvatarConfig {
  hair: string
  clothes: string
  accessory: string
}

// 解锁条件（旧类型）
export interface UnlockCondition {
  type: 'event' | 'value'
  event_id?: number
  target?: 'de' | 'zhi' | 'ti' | 'mei' | 'lao'
  min?: number
  max?: number
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message?: string
  data?: T
}

// 属性显示配置
export const ATTRIBUTE_CONFIG = {
  de: { label: '德育', color: '#F56C6C', key: '德' },
  zhi: { label: '智育', color: '#409EFF', key: '智' },
  ti: { label: '体育', color: '#67C23A', key: '体' },
  mei: { label: '美育', color: '#E6A23C', key: '美' },
  lao: { label: '劳育', color: '#909399', key: '劳' }
} as const

export type AttributeKey = keyof typeof ATTRIBUTE_CONFIG
