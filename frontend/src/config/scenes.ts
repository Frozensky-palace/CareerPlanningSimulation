// 场景配置 - 9个固定场景按钮
export interface SceneConfig {
  id: string
  name: string
  location: string  // 对应剧本的 location 字段
  icon: string      // 图标文件名（放在 /images/icons/ 目录下）
  color: string     // 主题色
  position: {       // 在地图上的固定位置（百分比）
    x: number
    y: number
  }
}

// 9个场景的配置（位置根据提供的地图图片精确调整）
export const SCENE_CONFIGS: SceneConfig[] = [
  {
    id: 'stadium',
    name: '田径场',
    location: 'stadium',
    icon: 'stadium.webp',
    color: '#FF7043',  // 橙色
    position: { x: 40, y: 15 }  // 顶部中间偏左，田径场位置
  },
  {
    id: 'dormitory',
    name: '我的宿舍',
    location: 'dormitory',
    icon: 'dormitory.webp',
    color: '#42A5F5',  // 蓝色
    position: { x: 23, y: 21 }  // 左上角宿舍区
  },
  {
    id: 'plaza',
    name: '文化广场',
    location: 'plaza',
    icon: 'plaza.webp',
    color: '#66BB6A',  // 绿色
    position: { x: 68, y: 25 }  // 右上角，湖边文化广场
  },
  {
    id: 'library',
    name: '图书馆',
    location: 'library',
    icon: 'library.webp',
    color: '#29B6F6',  // 浅蓝色
    position: { x: 40, y: 38 }  // 中间偏上，图书馆建筑
  },
  {
    id: 'academic',
    name: '一课大楼',
    location: 'academic',
    icon: 'academic.webp',
    color: '#81C784',  // 浅绿色
    position: { x: 48, y: 60 }  // 中间位置，教学楼群
  },
  {
    id: 'student_center',
    name: '学生发展中心',
    location: 'student_center',
    icon: 'student_center.webp',
    color: '#F48FB1',  // 粉色
    position: { x: 75, y: 45 }  // 右侧中间
  },
  {
    id: 'club_center',
    name: '社团发展中心',
    location: 'club_center',
    icon: 'club_center.webp',
    color: '#BA68C8',  // 紫色
    position: { x: 25, y: 55 }  // 左侧中间
  },
  {
    id: 'research_base',
    name: '科研孵化基地',
    location: 'research_base',
    icon: 'research_base.webp',
    color: '#4DD0E1',  // 青色
    position: { x: 42, y: 82 }  // 中下偏左
  },
  {
    id: 'maker_space',
    name: '创客空间',
    location: 'maker_space',
    icon: 'maker_space.webp',
    color: '#FFB74D',  // 橙黄色
    position: { x: 54, y: 80 }  // 右下角
  }
]

// 场景名称映射（用于显示）
export const SCENE_LABELS: Record<string, string> = {
  stadium: '田径场',
  dormitory: '我的宿舍',
  plaza: '文化广场',
  library: '图书馆',
  academic: '一课大楼',
  student_center: '学生发展中心',
  club_center: '社团发展中心',
  research_base: '科研孵化基地',
  maker_space: '创客空间',
  // 兼容旧的 location 值
  gate: '校门口',
  campus: '校园'
}

// 获取场景配置
export const getSceneConfig = (locationOrId: string): SceneConfig | undefined => {
  return SCENE_CONFIGS.find(s => s.id === locationOrId || s.location === locationOrId)
}

// 获取场景名称
export const getSceneLabel = (location: string): string => {
  return SCENE_LABELS[location] || location
}
