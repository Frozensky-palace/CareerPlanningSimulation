import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { Script, Save } from '../models/index.js'
import { Op } from 'sequelize'

const router = express.Router()

// 检查剧本解锁状态的辅助函数
interface UnlockResult {
  unlocked: boolean
  reason?: string
}

const checkScriptUnlock = (script: any, save: any): UnlockResult => {
  const condition = script.triggerCondition || {}
  const completed = save.completedScripts || []

  // 检查学期条件
  if (condition.semester && condition.semester.length > 0) {
    if (!condition.semester.includes(save.semester)) {
      return { unlocked: false, reason: `需要在第${condition.semester.join('/')}学期` }
    }
  }

  // 检查周条件
  if (condition.week && condition.week.length > 0) {
    if (!condition.week.includes(save.week)) {
      return { unlocked: false, reason: `需要在第${condition.week.join('/')}周` }
    }
  }

  // 检查前置剧本
  if (condition.requiredScripts && condition.requiredScripts.length > 0) {
    const hasAllRequired = condition.requiredScripts.every((id: number) => completed.includes(id))
    if (!hasAllRequired) {
      return { unlocked: false, reason: '需要完成前置事件' }
    }
  }

  // 检查属性要求
  if (condition.minAttributes) {
    const attrs = save.attributes
    for (const [key, minValue] of Object.entries(condition.minAttributes)) {
      if (attrs[key] < (minValue as number)) {
        const attrNames: Record<string, string> = { de: '德育', zhi: '智育', ti: '体育', mei: '美育', lao: '劳育' }
        return { unlocked: false, reason: `${attrNames[key] || key}需达到${minValue}` }
      }
    }
  }

  return { unlocked: true }
}

// 获取剧本列表（根据当前存档状态筛选可用剧本）
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { saveId, location, includeAll } = req.query

    // 获取存档信息
    let save = null
    if (saveId) {
      save = await Save.findOne({
        where: {
          id: saveId,
          userId: req.userId
        }
      })
    }

    // 构建查询条件
    const whereCondition: any = {
      isActive: true
    }

    if (location && location !== 'all') {
      whereCondition.location = location
    }

    const scripts = await Script.findAll({
      where: whereCondition,
      order: [['id', 'ASC']]
    })

    // 如果有存档，计算每个剧本的状态
    let resultScripts: any[] = scripts.map(s => s.toJSON())

    if (save) {
      const completed = save.completedScripts || []

      resultScripts = scripts.map(script => {
        const scriptJson = script.toJSON() as any
        const isCompleted = completed.includes(script.id)

        if (isCompleted) {
          return {
            ...scriptJson,
            status: 'completed',
            unlockReason: null
          }
        }

        const unlockResult = checkScriptUnlock(script, save)
        return {
          ...scriptJson,
          status: unlockResult.unlocked ? 'available' : 'locked',
          unlockReason: unlockResult.reason || null
        }
      })

      // 如果不需要返回所有剧本，只返回可用的
      if (!includeAll) {
        resultScripts = resultScripts.filter(s => s.status === 'available')
      }
    }

    res.json({
      code: 200,
      data: {
        scripts: resultScripts,
        total: resultScripts.length
      }
    })
  } catch (error: any) {
    console.error('Get scripts error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取剧本列表失败'
    })
  }
})

// 获取剧本详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const script = await Script.findByPk(req.params.id)

    if (!script) {
      return res.status(404).json({
        code: 404,
        message: '剧本不存在'
      })
    }

    res.json({
      code: 200,
      data: { script }
    })
  } catch (error: any) {
    console.error('Get script detail error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取剧本详情失败'
    })
  }
})

// 执行剧本选项
router.post('/:id/execute', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { saveId, optionId } = req.body
    const scriptId = parseInt(req.params.id)

    // 获取存档
    const save = await Save.findOne({
      where: {
        id: saveId,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    // 获取剧本
    const script = await Script.findByPk(scriptId)
    if (!script) {
      return res.status(404).json({
        code: 404,
        message: '剧本不存在'
      })
    }

    // 查找选项
    const options = script.options as any[]
    const selectedOption = options.find(opt => opt.id === optionId)

    if (!selectedOption) {
      return res.status(400).json({
        code: 400,
        message: '选项不存在'
      })
    }

    // 应用属性变化
    const changes = selectedOption.attributeChanges || {}
    const newAttributes = { ...save.attributes }

    if (changes.de) newAttributes.de = Math.max(0, Math.min(100, newAttributes.de + changes.de))
    if (changes.zhi) newAttributes.zhi = Math.max(0, Math.min(100, newAttributes.zhi + changes.zhi))
    if (changes.ti) newAttributes.ti = Math.max(0, Math.min(100, newAttributes.ti + changes.ti))
    if (changes.mei) newAttributes.mei = Math.max(0, Math.min(100, newAttributes.mei + changes.mei))
    if (changes.lao) newAttributes.lao = Math.max(0, Math.min(100, newAttributes.lao + changes.lao))

    // 更新已完成剧本
    const completedScripts = [...(save.completedScripts || []), scriptId]

    // 扣减剩余事件数
    const newRemainingEvents = Math.max(0, save.remainingEvents - 1)
    const needSettlement = newRemainingEvents === 0

    // 保存更新
    save.attributes = newAttributes
    save.completedScripts = completedScripts
    save.remainingEvents = newRemainingEvents
    await save.save()

    res.json({
      code: 200,
      message: '剧本执行成功',
      data: {
        save,
        attributeChanges: changes,
        nextScriptId: selectedOption.nextScriptId || null,
        needSettlement  // 告诉前端是否需要触发结算
      }
    })
  } catch (error: any) {
    console.error('Execute script error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '执行剧本失败'
    })
  }
})

// 创建UGC剧本（管理员功能，暂时开放）
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, type, location, options, triggerCondition } = req.body

    const script = await Script.create({
      title,
      content,
      type: type || 'branch',
      location: location || 'campus',
      options: options || [],
      triggerCondition: triggerCondition || {}
    })

    res.json({
      code: 200,
      message: '剧本创建成功',
      data: { script }
    })
  } catch (error: any) {
    console.error('Create script error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建剧本失败'
    })
  }
})

export default router
