import { Script, Badge, Admin, SystemSetting } from '../models/index.js'

// 初始测试剧本数据
const seedScripts = [
  {
    title: '开学第一天',
    content: '今天是大学开学的第一天，你站在校门口，看着熙熙攘攘的人群，心中充满了期待和紧张。一位热情的学长学姐向你走来，询问是否需要帮助。',
    contents: ['今天是大学开学的第一天，你站在校门口，看着熙熙攘攘的人群，心中充满了期待和紧张。一位热情的学长学姐向你走来，询问是否需要帮助。'],
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
    contents: ['校园里到处都是社团招新的摊位，五彩斑斓的海报和热情的宣传语吸引着你的目光。你看到了几个感兴趣的社团...'],
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
    contents: ['你在图书馆自习时，发现旁边座位上留着一本笔记本。翻开一看，里面密密麻麻记着某门课程的重点笔记，字迹工整，内容详实。'],
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
    contents: ['期中考试临近，你感觉压力很大。室友们讨论着各自的复习计划，有人通宵刷题，有人泡图书馆，也有人选择佛系面对。你决定...'],
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
    contents: ['学校正在招募周末社区服务志愿者，需要去敬老院陪伴老人。这会占用你的周末时间，但也是一次宝贵的社会实践机会。'],
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
    contents: ['新学期体育课选课开始了，有多种项目可选。你一直想尝试一些新的运动...'],
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
    contents: ['学校举办创新创业大赛，优秀项目有机会获得创业基金支持。你有一个想法已经酝酿很久了...'],
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
    contents: ['专业课老师布置了一个综合性的课程设计，需要独立完成或小组合作。这个作业会影响期末成绩。'],
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
    contents: ['听说图书馆是学习的好地方，你第一次走进图书馆，发现里面安静而神圣。在选择座位时，你注意到有人正在专注地学习...'],
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
    contents: ['图书馆公告栏上贴着一张学术讲座的海报，主题是你感兴趣的领域。但是时间和你的其他安排有冲突...'],
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
    contents: ['在听完讲座后，一位教授对你印象深刻，邀请你参与他的科研项目。这是一个难得的机会，但需要投入大量时间...'],
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
  },
  // === 数智学生发展中心支线（社团抉择事件链）===
  {
    title: '初入大学的社团抉择',
    content: '大学校园主干道上，彩旗飘扬，各社团摊位前热闹非凡。你背着书包，好奇又犹豫地穿梭其中。\n\n【内心OS】哇，这么多社团！数智学生发展中心看起来很高级，志愿者协会好似很有意义，篮球队看起来超热血，书画社又很安静……到底选哪个呀？',
    contents: ['大学校园主干道上，彩旗飘扬，各社团摊位前热闹非凡。你背着书包，好奇又犹豫地穿梭其中。\n\n【内心OS】哇，这么多社团！数智学生发展中心看起来很高级，志愿者协会好像很有意义，篮球队看起来超热血，书画社又很安静……到底选哪个呀？'],
    type: 'branch' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1],
      week: [2, 3]
    },
    options: [
      {
        id: 1,
        text: '走向数智学生发展中心',
        attributeChanges: { zhi: 2, de: 1 },
        nextScriptId: 13  // 链接到下一个剧本
      },
      {
        id: 2,
        text: '走向志愿者协会',
        attributeChanges: { de: 3, lao: 1 }
      },
      {
        id: 3,
        text: '走向篮球队',
        attributeChanges: { ti: 3, de: 1 }
      },
      {
        id: 4,
        text: '走向书画社',
        attributeChanges: { mei: 3, de: 1 }
      }
    ]
  },
  {
    title: '数智中心：初次接触',
    content: '小旭学长：（挥挥手）同学你好呀！喜欢学习软件使用技巧吗？数智学生发展中心招新啦！\n\n你：（接过宣传单）数智中心？我之前听人提过，就是能学软件还能搞活动的那个？\n\n小旭学长：没错！我们这儿能设计校园活动、学Excel和爬虫这些硬技能，还能认识一堆同频的小伙伴~\n\n你：（眼睛一亮）真的？但我这学期课不算少，有点拿不定主意……\n\n小旭学长：理解！不如我们先聊聊几个核心方向，你看看哪个最对胃口——第一个问题，你有没有兴趣和我们一起设计易班校园活动，让大家的课余生活更丰富？',
    contents: ['小旭学长：（挥挥手）同学你好呀！喜欢学习软件使用技巧吗？数智学生发展中心招新啦！\n\n你：（接过宣传单）数智中心？我之前听人提过，就是能学软件还能搞活动的那个？\n\n小旭学长：没错！我们这儿能设计校园活动、学Excel和爬虫这些硬技能，还能认识一堆同频的小伙伴~\n\n你：（眼睛一亮）真的？但我这学期课不算少，有点拿不定主意……\n\n小旭学长：理解！不如我们先聊聊几个核心方向，你看看哪个最对胃口——第一个问题，你有没有兴趣和我们一起设计易班校园活动，让大家的课余生活更丰富？'],
    type: 'branch' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1],
      requiredScripts: [12]  // 需要先完成"初入大学的社团抉择"
    },
    options: [
      {
        id: 1,
        text: '我超感兴趣！之前就觉得校园活动有点单一，一直想试试自己策划',
        attributeChanges: { zhi: 3, de: 2, mei: 1 },
        nextScriptId: 14
      },
      {
        id: 2,
        text: '我有点怕麻烦，策划活动要协调好多人吧？我可能应付不来',
        attributeChanges: { de: 2, zhi: 1 },
        nextScriptId: 14
      }
    ]
  },
  {
    title: '数智中心：学习软件技巧',
    content: '小旭学长：那我们来聊聊第二个方向——你想不想学实用的软件技巧？比如Excel数据处理，以后做课程报告、写论文都能用，我们还有网页爬虫的入门课。\n\n你想了想，上次做实验报告光整理数据就花了三天，要是会Excel技巧确实能省很多事。\n\n小旭学长：我们每周三晚有"软件小课堂"，今天晚上就有Excel数据透视表的课。学完就能上手实操，我们运营的公众号后台数据，还能让你练手分析，以后写简历也是实打实的加分项！',
    contents: ['小旭学长：那我们来聊聊第二个方向——你想不想学实用的软件技巧？比如Excel数据处理，以后做课程报告、写论文都能用，我们还有网页爬虫的入门课。\n\n你想了想，上次做实验报告光整理数据就花了三天，要是会Excel技巧确实能省很多事。\n\n小旭学长：我们每周三晚有"软件小课堂"，今天晚上就有Excel数据透视表的课。学完就能上手实操，我们运营的公众号后台数据，还能让你练手分析，以后写简历也是实打实的加分项！'],
    type: 'branch' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1],
      requiredScripts: [13]  // 需要先完成"数智中心：初次接触"
    },
    options: [
      {
        id: 1,
        text: '立刻报名！这正是我需要的技能',
        attributeChanges: { zhi: 4, lao: 2, de: 1 },
        nextScriptId: 15
      },
      {
        id: 2,
        text: '我怕学不会，对代码软件这些一窍不通……',
        attributeChanges: { de: 2, mei: 1 },
        nextScriptId: 15
      }
    ]
  },
  {
    title: '数智中心：结识志同道合的朋友',
    content: '小旭学长：最后一个问题，你想不想结识志同道合的朋友？我们社团有好多喜欢文化推广的同学，一起做华师特色文创，比如校训主题的帆布袋、数智IP表情包。像你要是有绘画基础的话，肯定特别受欢迎！\n\n你：文创？我平时挺喜欢画画的……\n\n小旭学长眼睛一亮：那简直是为你量身定做！我们正在做"华师四季"文创系列，需要插画师设计校园风景。你可以和文案组同学合作，把你的画做成明信片、笔记本，还能通过公众号推广收获一群好朋友！',
    contents: ['小旭学长：最后一个问题，你想不想结识志同道合的朋友？我们社团有好多喜欢文化推广的同学，一起做华师特色文创，比如校训主题的帆布袋、数智IP表情包。像你要是有绘画基础的话，肯定特别受欢迎！\n\n你：文创？我平时挺喜欢画画的……\n\n小旭学长眼睛一亮：那简直是为你量身定做！我们正在做"华师四季"文创系列，需要插画师设计校园风景。你可以和文案组同学合作，把你的画做成明信片、笔记本，还能通过公众号推广收获一群好朋友！'],
    type: 'branch' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1],
      requiredScripts: [14]  // 需要先完成"数智中心：学习软件技巧"
    },
    options: [
      {
        id: 1,
        text: '我太需要了！我决定加入数智学生发展中心！',
        attributeChanges: { mei: 4, de: 3, lao: 2 },
        nextScriptId: 16
      },
      {
        id: 2,
        text: '我习惯一个人做事，和别人合作总觉得不自在',
        attributeChanges: { de: 3, mei: 2 },
        nextScriptId: 17
      }
    ]
  },
  {
    title: '数智中心：正式加入（积极路线）',
    content: '你跟着小旭学长来到运营部办公室，同学们正围着文创样品讨论。有人看到你的绘画作品，立刻拉你加入"华师四季"的设计组。\n\n你的创意很快得到大家认可，第一次感受到团队协作的快乐。你在群里发了自己的第一张设计稿，收获了满屏的点赞和鼓励。\n\n【恭喜你成为数智学生发展中心的一员！在这里，你将收获技能、友谊与成长。】',
    contents: ['你跟着小旭学长来到运营部办公室，同学们正围着文创样品讨论。有人看到你的绘画作品，立刻拉你加入"华师四季"的设计组。\n\n你的创意很快得到大家认可，第一次感受到团队协作的快乐。你在群里发了自己的第一张设计稿，收获了满屏的点赞和鼓励。\n\n【恭喜你成为数智学生发展中心的一员！在这里，你将收获技能、友谊与成长。】'],
    type: 'special' as const,
    location: 'academic',
    triggerCondition: {
      semester: [1],
      requiredScripts: [15]
    },
    options: [
      {
        id: 1,
        text: '开始我的数智之旅！',
        attributeChanges: { zhi: 5, mei: 5, de: 3, lao: 3 }
      }
    ]
  },
  {
    title: '数智中心：保持联系（观望路线）',
    content: '小旭学长：没关系，尊重你的选择。这是我的联系方式，要是以后改变主意了，随时找我。其实数智学生发展中心也有独立工作的岗位，比如公众号排版、数据整理，你可以先关注我们的公众号"华师学工"看看。\n\n你接过名片，认真放进笔记本里，抬头看到运营部同学布置场地时的笑容，自己也悄悄弯了弯嘴角，把公众号二维码拍了下来。\n\n【一周后，你在朋友圈看到"数智文化节"的活动照片，发现有个互动环节和自己之前的想法不谋而合。你给小旭学长发了条消息："学长，下次小课堂还能参加吗？"】',
    contents: ['小旭学长：没关系，尊重你的选择。这是我的联系方式，要是以后改变主意了，随时找我。其实数智学生发展中心也有独立工作的岗位，比如公众号排版、数据整理，你可以先关注我们的公众号"华师学工"看看。\n\n你接过名片，认真放进笔记本里，抬头看到运营部同学布置场地时的笑容，自己也悄悄弯了弯嘴角，把公众号二维码拍了下来。\n\n【一周后，你在朋友圈看到"数智文化节"的活动照片，发现有个互动环节和自己之前的想法不谋而合。你给小旭学长发了条消息："学长，下次小课堂还能参加吗？"】'],
    type: 'branch' as const,
    location: 'plaza',
    triggerCondition: {
      semester: [1],
      requiredScripts: [15]
    },
    options: [
      {
        id: 1,
        text: '期待下次的相遇',
        attributeChanges: { de: 3, zhi: 2, mei: 2 }
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
