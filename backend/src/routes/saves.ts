import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { Save } from '../models/index.js'

const router = express.Router()

// 获取用户所有存档
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const saves = await Save.findAll({
      where: { userId: req.userId },
      order: [['updatedAt', 'DESC']]
    })

    res.json({
      code: 200,
      data: { saves }
    })
  } catch (error: any) {
    console.error('Get saves error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取存档列表失败'
    })
  }
})

// 创建新存档
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, attributes } = req.body

    // 验证属性值
    if (attributes) {
      const { de, zhi, ti, mei, lao } = attributes
      const total = de + zhi + ti + mei + lao
      if (total !== 250) {
        return res.status(400).json({
          code: 400,
          message: '属性值总和必须为250'
        })
      }
    }

    const save = await Save.create({
      userId: req.userId!,
      name: name || '新存档',
      attributes: attributes || { de: 50, zhi: 50, ti: 50, mei: 50, lao: 50 }
    })

    res.json({
      code: 200,
      message: '存档创建成功',
      data: { save }
    })
  } catch (error: any) {
    console.error('Create save error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建存档失败'
    })
  }
})

// 获取存档详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    res.json({
      code: 200,
      data: { save }
    })
  } catch (error: any) {
    console.error('Get save detail error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取存档详情失败'
    })
  }
})

// 更新存档
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    const { name, semester, week, attributes, completedScripts, unlockedBadges } = req.body

    // 更新字段
    if (name !== undefined) save.name = name
    if (semester !== undefined) save.semester = semester
    if (week !== undefined) save.week = week
    if (attributes !== undefined) save.attributes = attributes
    if (completedScripts !== undefined) save.completedScripts = completedScripts
    if (unlockedBadges !== undefined) save.unlockedBadges = unlockedBadges

    await save.save()

    res.json({
      code: 200,
      message: '存档更新成功',
      data: { save }
    })
  } catch (error: any) {
    console.error('Update save error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新存档失败'
    })
  }
})

// 删除存档
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    await save.destroy()

    res.json({
      code: 200,
      message: '存档删除成功'
    })
  } catch (error: any) {
    console.error('Delete save error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除存档失败'
    })
  }
})

export default router
