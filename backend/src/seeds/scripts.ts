import { Script, Badge, Admin, SystemSetting } from '../models/index.js'

// 初始测试剧本数据
const seedScripts = [
  {
    title: '开学第一天',
    content: '今天是大学开学的第一天，你站在校门口，看着熙熙攘攘的人群，心中充满了期待和紧张。一位热情的学长学姐向你走来，询问是否需要帮助。',
    type: 'main' as const,
    location: 'gate',
    triggerCondition: {
      semester: [1],
      week: [1]
    },
    options: [
      {
        id: 1,
        text: '热情地打招呼，请他们带你熟悉校园',
        attributeChanges: { de: 3, zhi: 1 }
      },
      {
        id: 2,
        text: '礼貌地婉拒，自己探索校园',
        attributeChanges: { ti: 2, mei: 1 }
      },
      {
        id: 3,
        text: '询问图书馆在哪里',
        attributeChanges: { zhi: 3 }
      }
    ]
  },
  {
    title: '社团招新日',
    content: '校园里到处都是社团招新的摊位，五彩斑斓的海报和热情的宣传语吸引着你的目光。你看到了几个感兴趣的社团...',
    type: 'main' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1],
      week: [2, 3]
    },
    options: [
      {
        id: 1,
        text: '加入学生会，锻炼组织能力',
        attributeChanges: { de: 5, lao: 3 }
      },
      {
        id: 2,
        text: '加入文艺社，培养艺术修养',
        attributeChanges: { mei: 5, de: 2 }
      },
      {
        id: 3,
        text: '加入科技社，提升专业技能',
        attributeChanges: { zhi: 5, lao: 2 }
      },
      {
        id: 4,
        text: '加入体育社，强健体魄',
        attributeChanges: { ti: 5, de: 2 }
      }
    ]
  },
  {
    title: '图书馆奇遇',
    content: '你在图书馆自习时，发现旁边座位上留着一本笔记本。翻开一看，里面密密麻麻记着某门课程的重点笔记，字迹工整，内容详实。',
    type: 'branch' as const,
    location: 'library',
    triggerCondition: {
      semester: [1, 2]
    },
    options: [
      {
        id: 1,
        text: '交给图书馆失物招领处',
        attributeChanges: { de: 5 }
      },
      {
        id: 2,
        text: '翻看学习后归还',
        attributeChanges: { zhi: 3, de: -2 }
      },
      {
        id: 3,
        text: '发朋友圈寻找失主',
        attributeChanges: { de: 3, mei: 2 }
      }
    ]
  },
  {
    title: '期中考试周',
    content: '期中考试临近，你感觉压力很大。室友们讨论着各自的复习计划，有人通宵刷题，有人泡图书馆，也有人选择佛系面对。你决定...',
    type: 'main' as const,
    location: 'dormitory',
    triggerCondition: {
      semester: [1, 2, 3, 4],
      week: [8, 9]
    },
    options: [
      {
        id: 1,
        text: '制定详细计划，高效复习',
        attributeChanges: { zhi: 8, ti: -2 }
      },
      {
        id: 2,
        text: '组织学习小组，互帮互助',
        attributeChanges: { zhi: 5, de: 3, lao: 2 }
      },
      {
        id: 3,
        text: '保持正常作息，适度复习',
        attributeChanges: { zhi: 3, ti: 3, mei: 2 }
      }
    ]
  },
  {
    title: '志愿者招募',
    content: '学校正在招募周末社区服务志愿者，需要去敬老院陪伴老人。这会占用你的周末时间，但也是一次宝贵的社会实践机会。',
    type: 'branch' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1, 2, 3, 4, 5, 6]
    },
    options: [
      {
        id: 1,
        text: '积极报名参加',
        attributeChanges: { de: 8, lao: 5, ti: -2 }
      },
      {
        id: 2,
        text: '这次先不参加，以后有机会再说',
        attributeChanges: {}
      }
    ]
  },
  {
    title: '体育课选课',
    content: '新学期体育课选课开始了，有多种项目可选。你一直想尝试一些新的运动...',
    type: 'branch' as const,
    location: 'stadium',
    triggerCondition: {
      semester: [1, 2, 3, 4]
    },
    options: [
      {
        id: 1,
        text: '选择游泳，学习一项求生技能',
        attributeChanges: { ti: 6, mei: 2 }
      },
      {
        id: 2,
        text: '选择羽毛球，方便日常锻炼',
        attributeChanges: { ti: 5, de: 2 }
      },
      {
        id: 3,
        text: '选择太极拳，修身养性',
        attributeChanges: { ti: 3, mei: 3, de: 2 }
      },
      {
        id: 4,
        text: '选择健身，塑造形体',
        attributeChanges: { ti: 7, mei: 1 }
      }
    ]
  },
  {
    title: '创新创业大赛',
    content: '学校举办创新创业大赛，优秀项目有机会获得创业基金支持。你有一个想法已经酝酿很久了...',
    type: 'special' as const,
    location: 'academic',
    triggerCondition: {
      semester: [3, 4, 5, 6],
      minAttributes: { zhi: 60 }
    },
    options: [
      {
        id: 1,
        text: '组建团队，全力备赛',
        attributeChanges: { zhi: 10, lao: 8, de: 3, ti: -3 }
      },
      {
        id: 2,
        text: '先观摩学习，明年再参加',
        attributeChanges: { zhi: 3 }
      },
      {
        id: 3,
        text: '加入其他同学的团队',
        attributeChanges: { zhi: 5, lao: 5, de: 3 }
      }
    ]
  },
  {
    title: '课程设计作业',
    content: '专业课老师布置了一个综合性的课程设计，需要独立完成或小组合作。这个作业会影响期末成绩。',
    type: 'main' as const,
    location: 'academic',
    triggerCondition: {
      semester: [2, 3, 4, 5, 6]
    },
    options: [
      {
        id: 1,
        text: '独立完成，展示个人能力',
        attributeChanges: { zhi: 8, lao: 5 }
      },
      {
        id: 2,
        text: '组队合作，发挥各自优势',
        attributeChanges: { zhi: 5, de: 5, lao: 3 }
      },
      {
        id: 3,
        text: '主动帮助其他同学完成',
        attributeChanges: { de: 8, zhi: 2, lao: 3 }
      }
    ]
  },
  // === 事件链示例 ===
  {
    title: '图书馆自习入门',
    content: '听说图书馆是学习的好地方，你第一次走进图书馆，发现里面安静而神圣。在选择座位时，你注意到有人正在专注地学习...',
    type: 'branch' as const,
    location: 'library',
    triggerCondition: {
      semester: [1, 2, 3, 4, 5, 6]
    },
    options: [
      {
        id: 1,
        text: '找个安静的角落开始自习',
        attributeChanges: { zhi: 5 }
      },
      {
        id: 2,
        text: '观察周围学霸的学习方法',
        attributeChanges: { zhi: 3, de: 2 }
      }
    ]
  },
  {
    title: '学术讲座',
    content: '图书馆公告栏上贴着一张学术讲座的海报，主题是你感兴趣的领域。但是时间和你的其他安排有冲突...',
    type: 'branch' as const,
    location: 'library',
    triggerCondition: {
      semester: [1, 2, 3, 4, 5, 6],
      requiredScripts: [9]  // 需要先完成"图书馆自习入门"
    },
    options: [
      {
        id: 1,
        text: '调整计划，参加讲座',
        attributeChanges: { zhi: 8, mei: 2 }
      },
      {
        id: 2,
        text: '记下主题，以后自己查阅相关资料',
        attributeChanges: { zhi: 4 }
      }
    ]
  },
  {
    title: '科研入门',
    content: '在听完讲座后，一位教授对你印象深刻，邀请你参与他的科研项目。这是一个难得的机会，但需要投入大量时间...',
    type: 'special' as const,
    location: 'academic',
    triggerCondition: {
      semester: [2, 3, 4, 5, 6],
      requiredScripts: [10],  // 需要先完成"学术讲座"
      minAttributes: { zhi: 65 }  // 智育需要达到65
    },
    options: [
      {
        id: 1,
        text: '接受邀请，全身心投入',
        attributeChanges: { zhi: 15, lao: 8, ti: -5 }
      },
      {
        id: 2,
        text: '表示感谢，但暂时婉拒',
        attributeChanges: { de: 3 }
      },
      {
        id: 3,
        text: '询问能否以较轻松的方式参与',
        attributeChanges: { zhi: 8, lao: 3 }
      }
    ]
  }
]

// 勋章种子数据
const seedBadges = [
  {
    name: '学霸',
    description: '智育达到80分',
    icon: 'Trophy',
    unlockCondition: {
      type: 'attribute',
      attribute: 'zhi',
      minValue: 80
    }
  },
  {
    name: '运动健将',
    description: '体育达到80分',
    icon: 'Medal',
    unlockCondition: {
      type: 'attribute',
      attribute: 'ti',
      minValue: 80
    }
  },
  {
    name: '道德楷模',
    description: '德育达到80分',
    icon: 'Star',
    unlockCondition: {
      type: 'attribute',
      attribute: 'de',
      minValue: 80
    }
  },
  {
    name: '文艺之星',
    description: '美育达到80分',
    icon: 'Sunny',
    unlockCondition: {
      type: 'attribute',
      attribute: 'mei',
      minValue: 80
    }
  },
  {
    name: '劳动能手',
    description: '劳育达到80分',
    icon: 'Tools',
    unlockCondition: {
      type: 'attribute',
      attribute: 'lao',
      minValue: 80
    }
  },
  {
    name: '初出茅庐',
    description: '完成5个事件',
    icon: 'Flag',
    unlockCondition: {
      type: 'scripts',
      completedCount: 5
    }
  },
  {
    name: '渐入佳境',
    description: '完成15个事件',
    icon: 'Promotion',
    unlockCondition: {
      type: 'scripts',
      completedCount: 15
    }
  },
  {
    name: '校园达人',
    description: '完成30个事件',
    icon: 'Trophy',
    unlockCondition: {
      type: 'scripts',
      completedCount: 30
    }
  },
  {
    name: '大二学长',
    description: '进入第三学期',
    icon: 'Calendar',
    unlockCondition: {
      type: 'phase',
      semester: 3
    }
  },
  {
    name: '毕业在即',
    description: '进入第七学期',
    icon: 'GraduationCap',
    unlockCondition: {
      type: 'phase',
      semester: 7
    }
  }
]

// 默认系统设置
const defaultSettings = [
  {
    key: 'game_initial_attributes_total',
    value: '250',
    description: '初始属性点数总和'
  },
  {
    key: 'game_events_per_phase',
    value: '10',
    description: '每阶段可触发的事件数量'
  },
  {
    key: 'game_max_semester',
    value: '8',
    description: '最大学期数'
  },
  {
    key: 'site_name',
    value: '"大学生涯数字孪生平台"',
    description: '网站名称'
  }
]

export async function seedDatabase() {
  try {
    // 检查剧本是否已有数据
    const scriptCount = await Script.count()
    if (scriptCount === 0) {
      await Script.bulkCreate(seedScripts)
      console.log(`✓ Seeded ${seedScripts.length} scripts successfully`)
    } else {
      console.log('✓ Scripts already seeded, skipping...')
    }

    // 检查勋章是否已有数据
    const badgeCount = await Badge.count()
    if (badgeCount === 0) {
      await Badge.bulkCreate(seedBadges)
      console.log(`✓ Seeded ${seedBadges.length} badges successfully`)
    } else {
      console.log('✓ Badges already seeded, skipping...')
    }

    // 检查管理员是否已有数据，如果没有则创建默认超级管理员
    const adminCount = await Admin.count()
    if (adminCount === 0) {
      await Admin.create({
        username: 'admin',
        password: 'admin123',  // 默认密码，生产环境应该修改
        role: 'super_admin',
        email: 'admin@example.com'
      })
      console.log('✓ Created default admin account (username: admin, password: admin123)')
    } else {
      console.log('✓ Admin already exists, skipping...')
    }

    // 初始化系统设置
    const settingCount = await SystemSetting.count()
    if (settingCount === 0) {
      await SystemSetting.bulkCreate(defaultSettings)
      console.log(`✓ Seeded ${defaultSettings.length} system settings successfully`)
    } else {
      console.log('✓ System settings already exist, skipping...')
    }
  } catch (error) {
    console.error('✗ Failed to seed database:', error)
  }
}
