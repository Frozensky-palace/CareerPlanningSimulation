import { sequelize } from '../config/database.js'
import { Script } from '../models/index.js'

const newScripts = [
  {
    title: '初入大学的社团抉择',
    content: '大学校园主干道上，彩旗飘扬，各社团摊位前热闹非凡。你背着书包，好奇又犹豫地穿梭其中。\n\n【内心OS】哇，这么多社团！数智学生发展中心看起来很高级，志愿者协会好像很有意义，篮球队看起来超热血，书画社又很安静……到底选哪个呀？',
    type: 'branch' as const,
    location: 'plaza',
    backgroundImage: null,
    triggerCondition: {
      semester: [1],
      week: [2, 3]
    },
    options: [
      {
        id: 1,
        text: '走向数智学生发展中心',
        attributeChanges: { zhi: 2, de: 1 },
        nextScriptId: 13
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
    type: 'branch' as const,
    location: 'plaza',
    backgroundImage: null,
    triggerCondition: {
      semester: [1],
      requiredScripts: [12]
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
    type: 'branch' as const,
    location: 'plaza',
    backgroundImage: null,
    triggerCondition: {
      semester: [1],
      requiredScripts: [13]
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
    type: 'branch' as const,
    location: 'plaza',
    backgroundImage: null,
    triggerCondition: {
      semester: [1],
      requiredScripts: [14]
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
    type: 'special' as const,
    location: 'academic',
    backgroundImage: null,
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
    type: 'branch' as const,
    location: 'plaza',
    backgroundImage: null,
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

async function insertScripts() {
  try {
    await sequelize.authenticate()
    console.log('✓ Database connected')

    // 检查是否已存在
    const existingCount = await Script.count({
      where: {
        title: ['初入大学的社团抉择', '数智中心：初次接触']
      }
    })

    if (existingCount > 0) {
      console.log('✓ Scripts already exist, skipping...')
      process.exit(0)
    }

    // 批量插入
    await Script.bulkCreate(newScripts)
    console.log(`✓ Successfully inserted ${newScripts.length} new scripts`)

    process.exit(0)
  } catch (error) {
    console.error('✗ Failed to insert scripts:', error)
    process.exit(1)
  }
}

insertScripts()
