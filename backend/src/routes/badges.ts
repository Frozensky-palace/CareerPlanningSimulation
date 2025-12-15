import express, { Router } from 'express'
import { QueryTypes } from 'sequelize'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { Badge, Save } from '../models/index.js'
import { sequelize } from '../config/database.js'

const router: Router = express.Router()

// 检查勋章解锁条件
const checkBadgeUnlock = (badge: any, save: any): boolean => {
  const condition = badge.unlockCondition
  if (!condition || !condition.type) return false

  switch (condition.type) {
    case 'attribute':
      // 检查属性值
      if (condition.attribute && condition.minValue !== undefined) {
        const attrValue = save.attributes[condition.attribute]
        return attrValue >= condition.minValue
      }
      return false

    case 'scripts':
      // 检查完成剧本数量
      if (condition.completedCount !== undefined) {
        return (save.completedScripts?.length || 0) >= condition.completedCount
      }
      // 检查特定剧本
      if (condition.scripts && condition.scripts.length > 0) {
        return condition.scripts.every((id: number) => save.completedScripts?.includes(id))
      }
      return false

    case 'phase':
      // 检查学期进度
      return save.semester >= (condition.semester || 1)

    default:
      return false
  }
}

// 获取所有勋章（包含解锁状态）
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { saveId } = req.query

    // 获取所有勋章
    const badges = await Badge.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    })

    // 如果有存档ID，计算解锁状态
    let badgesWithStatus = badges.map(badge => ({
      ...badge.toJSON(),
      unlocked: false
    }))

    if (saveId) {
      const save = await Save.findOne({
        where: {
          id: Number(saveId),
          userId: req.userId
        }
      })

      if (save) {
        const unlockedIds = save.unlockedBadges || []
        console.log(`[Badge GET] Save ${saveId} unlockedBadges:`, unlockedIds)
        badgesWithStatus = badges.map(badge => ({
          ...badge.toJSON(),
          unlocked: unlockedIds.includes(badge.id)
        }))
      }
    }

    res.json({
      code: 200,
      data: {
        badges: badgesWithStatus,
        total: badgesWithStatus.length,
        unlockedCount: badgesWithStatus.filter(b => b.unlocked).length
      }
    })
  } catch (error: any) {
    console.error('Get badges error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取勋章列表失败'
    })
  }
})

// 检查并解锁勋章
router.post('/check/:saveId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.saveId,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    // 获取所有未解锁的勋章
    const allBadges = await Badge.findAll({
      where: { isActive: true }
    })

    console.log(`[Badge] Initial save.unlockedBadges:`, save.unlockedBadges, `type:`, typeof save.unlockedBadges, `isArray:`, Array.isArray(save.unlockedBadges))

    // 确保是数组并创建副本
    const unlockedIds = Array.isArray(save.unlockedBadges) ? [...save.unlockedBadges] : []
    const newlyUnlocked: any[] = []

    console.log(`[Badge] unlockedIds after processing:`, unlockedIds)

    // 检查每个未解锁的勋章
    for (const badge of allBadges) {
      if (!unlockedIds.includes(badge.id)) {
        if (checkBadgeUnlock(badge, save)) {
          unlockedIds.push(badge.id)
          newlyUnlocked.push(badge.toJSON())
        }
      }
    }

    // 如果有新解锁的勋章，更新存档
    if (newlyUnlocked.length > 0) {
      console.log(`[Badge] Before save - unlockedBadges:`, save.unlockedBadges)
      console.log(`[Badge] New unlockedIds to save:`, unlockedIds)

      // 使用原始 SQL 更新 JSON 字段，确保数据正确保存
      await sequelize.query(
        `UPDATE saves SET unlockedBadges = ? WHERE id = ?`,
        {
          replacements: [JSON.stringify(unlockedIds), save.id],
          type: QueryTypes.UPDATE
        }
      )

      // 重新获取保存后的数据验证
      const updatedSave = await Save.findByPk(save.id)
      console.log(`[Badge] After save - unlockedBadges:`, updatedSave?.unlockedBadges)
      console.log(`[Badge] Unlocked ${newlyUnlocked.length} new badges for save ${save.id}:`, newlyUnlocked.map(b => b.id))
    }

    console.log(`[Badge] Check result - Total unlocked: ${unlockedIds.length}, Newly unlocked: ${newlyUnlocked.length}`)

    res.json({
      code: 200,
      data: {
        newlyUnlocked,
        totalUnlocked: unlockedIds.length
      }
    })
  } catch (error: any) {
    console.error('Check badges error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '检查勋章失败'
    })
  }
})

// 获取存档已解锁的勋章
router.get('/unlocked/:saveId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.saveId,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    const unlockedIds = save.unlockedBadges || []

    let unlockedBadges: any[] = []
    if (unlockedIds.length > 0) {
      const badges = await Badge.findAll({
        where: {
          id: unlockedIds,
          isActive: true
        }
      })
      unlockedBadges = badges.map(b => b.toJSON())
    }

    res.json({
      code: 200,
      data: {
        badges: unlockedBadges,
        total: unlockedBadges.length
      }
    })
  } catch (error: any) {
    console.error('Get unlocked badges error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取已解锁勋章失败'
    })
  }
})

export default router
