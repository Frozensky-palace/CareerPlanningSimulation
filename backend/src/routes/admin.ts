import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { User, Save, Script, Badge } from '../models/index.js'
import { Op } from 'sequelize'

const router = express.Router()

// 所有后台路由都需要认证
router.use(authMiddleware)

// ============ 仪表盘数据 ============

/**
 * GET /api/admin/dashboard
 * 获取仪表盘统计数据
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 统计用户总数
    const totalUsers = await User.count()

    // 统计存档总数
    const totalSaves = await Save.count()

    // 统计剧本总数
    const totalScripts = await Script.count()

    // 统计勋章总数
    const totalBadges = await Badge.count()

    // 按类型统计剧本
    const scripts = await Script.findAll()
    const scriptsByType: Record<string, number> = {}
    const scriptsByLocation: Record<string, number> = {}

    scripts.forEach(script => {
      scriptsByType[script.type] = (scriptsByType[script.type] || 0) + 1
      scriptsByLocation[script.location] = (scriptsByLocation[script.location] || 0) + 1
    })

    // 获取最近活动（最近创建的存档）
    const recentSaves = await Save.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['username'] }]
    })

    const recentActivities = recentSaves.map(save => ({
      username: save.user?.username || '未知用户',
      action: '创建存档',
      saveName: save.name,
      details: `第 ${save.semester} 学期，第 ${save.week} 周`,
      createdAt: save.createdAt
    }))

    res.json({
      stats: {
        totalUsers,
        totalSaves,
        totalScripts,
        totalBadges,
        scriptsByType,
        scriptsByLocation
      },
      recentActivities
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ error: '获取仪表盘数据失败' })
  }
})

// ============ 剧本管理 ============

/**
 * GET /api/admin/scripts
 * 获取所有剧本（不考虑触发条件）
 */
router.get('/scripts', async (req, res) => {
  try {
    const scripts = await Script.findAll({
      order: [['id', 'ASC']]
    })

    res.json({ scripts })
  } catch (error) {
    console.error('Get scripts error:', error)
    res.status(500).json({ error: '获取剧本列表失败' })
  }
})

/**
 * POST /api/admin/scripts
 * 创建新剧本
 */
router.post('/scripts', async (req, res) => {
  try {
    const { title, content, type, location, triggerCondition, options } = req.body

    if (!title || !content || !type || !location) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const script = await Script.create({
      title,
      content,
      type,
      location,
      triggerCondition: triggerCondition || {},
      options: options || []
    })

    res.json({ script })
  } catch (error) {
    console.error('Create script error:', error)
    res.status(500).json({ error: '创建剧本失败' })
  }
})

/**
 * PUT /api/admin/scripts/:id
 * 更新剧本
 */
router.put('/scripts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, type, location, triggerCondition, options } = req.body

    const script = await Script.findByPk(id)
    if (!script) {
      return res.status(404).json({ error: '剧本不存在' })
    }

    await script.update({
      title,
      content,
      type,
      location,
      triggerCondition: triggerCondition || {},
      options: options || []
    })

    res.json({ script })
  } catch (error) {
    console.error('Update script error:', error)
    res.status(500).json({ error: '更新剧本失败' })
  }
})

/**
 * DELETE /api/admin/scripts/:id
 * 删除剧本
 */
router.delete('/scripts/:id', async (req, res) => {
  try {
    const { id } = req.params

    const script = await Script.findByPk(id)
    if (!script) {
      return res.status(404).json({ error: '剧本不存在' })
    }

    await script.destroy()

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete script error:', error)
    res.status(500).json({ error: '删除剧本失败' })
  }
})

// ============ 地图位置管理 ============

/**
 * GET /api/admin/map-positions
 * 获取保存的地图位置配置
 */
router.get('/map-positions', async (req, res) => {
  try {
    // 这里可以从数据库或配置文件读取
    // 暂时返回空对象，表示使用默认位置
    res.json({ positions: {} })
  } catch (error) {
    console.error('Get map positions error:', error)
    res.status(500).json({ error: '获取地图位置失败' })
  }
})

/**
 * POST /api/admin/map-positions
 * 保存地图位置配置
 */
router.post('/map-positions', async (req, res) => {
  try {
    const { positions } = req.body

    // 这里可以保存到数据库或配置文件
    // 暂时只返回成功
    console.log('Saving map positions:', positions)

    res.json({ message: '保存成功' })
  } catch (error) {
    console.error('Save map positions error:', error)
    res.status(500).json({ error: '保存地图位置失败' })
  }
})

// ============ 勋章管理 ============

/**
 * GET /api/admin/badges
 * 获取所有勋章
 */
router.get('/badges', async (req, res) => {
  try {
    const badges = await Badge.findAll({
      order: [['id', 'ASC']]
    })

    res.json({ badges })
  } catch (error) {
    console.error('Get badges error:', error)
    res.status(500).json({ error: '获取勋章列表失败' })
  }
})

/**
 * POST /api/admin/badges
 * 创建勋章
 */
router.post('/badges', async (req, res) => {
  try {
    const { name, description, icon, unlockCondition } = req.body

    if (!name || !description || !unlockCondition) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const badge = await Badge.create({
      name,
      description,
      icon: icon || 'Trophy',
      unlockCondition
    })

    res.json({ badge })
  } catch (error) {
    console.error('Create badge error:', error)
    res.status(500).json({ error: '创建勋章失败' })
  }
})

/**
 * PUT /api/admin/badges/:id
 * 更新勋章
 */
router.put('/badges/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, icon, unlockCondition } = req.body

    const badge = await Badge.findByPk(id)
    if (!badge) {
      return res.status(404).json({ error: '勋章不存在' })
    }

    await badge.update({
      name,
      description,
      icon: icon || badge.icon,
      unlockCondition
    })

    res.json({ badge })
  } catch (error) {
    console.error('Update badge error:', error)
    res.status(500).json({ error: '更新勋章失败' })
  }
})

/**
 * DELETE /api/admin/badges/:id
 * 删除勋章
 */
router.delete('/badges/:id', async (req, res) => {
  try {
    const { id } = req.params

    const badge = await Badge.findByPk(id)
    if (!badge) {
      return res.status(404).json({ error: '勋章不存在' })
    }

    await badge.destroy()

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete badge error:', error)
    res.status(500).json({ error: '删除勋章失败' })
  }
})

// ============ 用户管理 ============

/**
 * GET /api/admin/users
 * 获取所有用户
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    res.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

export default router
