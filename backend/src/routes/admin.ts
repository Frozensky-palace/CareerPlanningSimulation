import express from 'express'
import jwt from 'jsonwebtoken'
import { adminAuthMiddleware, requireRole } from '../middleware/adminAuth.js'
import { User, Save, Script, Badge, Admin, AdminLog, SystemSetting } from '../models/index.js'
import { Op, fn, col, literal } from 'sequelize'
import type { AdminAction } from '../models/AdminLog.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// ============ 管理员认证 ============

/**
 * POST /api/admin/login
 * 管理员登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }

    const admin = await Admin.findOne({ where: { username } })
    if (!admin) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: '账号已被禁用' })
    }

    const isValid = await admin.validatePassword(password)
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 更新最后登录时间
    await admin.update({ lastLoginAt: new Date() })

    // 生成 token
    const token = jwt.sign(
      { adminId: admin.id, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // 记录登录日志
    await AdminLog.create({
      adminId: admin.id,
      action: 'login',
      ipAddress: req.ip
    })

    res.json({
      token,
      admin: admin.toSafeObject()
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: '登录失败' })
  }
})

/**
 * GET /api/admin/me
 * 获取当前管理员信息
 */
router.get('/me', adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin!.id)
    if (!admin) {
      return res.status(404).json({ error: '管理员不存在' })
    }
    res.json({ admin: admin.toSafeObject() })
  } catch (error) {
    console.error('Get admin info error:', error)
    res.status(500).json({ error: '获取信息失败' })
  }
})

/**
 * POST /api/admin/logout
 * 管理员登出
 */
router.post('/logout', adminAuthMiddleware, async (req, res) => {
  try {
    await AdminLog.create({
      adminId: req.admin!.id,
      action: 'logout',
      ipAddress: req.ip
    })
    res.json({ message: '登出成功' })
  } catch (error) {
    console.error('Admin logout error:', error)
    res.status(500).json({ error: '登出失败' })
  }
})

// 以下路由都需要管理员认证
router.use(adminAuthMiddleware)

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

    // 今日新增用户
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: today }
      }
    })

    // 今日新增存档
    const todaySaves = await Save.count({
      where: {
        createdAt: { [Op.gte]: today }
      }
    })

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
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    })

    const recentActivities = recentSaves.map(save => ({
      username: save.user?.username || '未知用户',
      action: '创建存档',
      saveName: save.name,
      details: `第 ${save.semester} 学期，第 ${save.week} 周`,
      createdAt: save.createdAt
    }))

    // 获取最近7天的用户增长数据
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const userGrowth = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    })

    res.json({
      stats: {
        totalUsers,
        totalSaves,
        totalScripts,
        totalBadges,
        todayUsers,
        todaySaves,
        scriptsByType,
        scriptsByLocation
      },
      recentActivities,
      userGrowth
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ error: '获取仪表盘数据失败' })
  }
})

// ============ 剧本管理 ============

/**
 * GET /api/admin/scripts
 * 获取所有剧本
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
 * 创建剧本
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

    await logAdminAction(req.admin!.id, 'create_script', 'script', script.id, `创建剧本: ${title}`, req.ip)

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

    await logAdminAction(req.admin!.id, 'update_script', 'script', script.id, `更新剧本: ${title}`, req.ip)

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

    const title = script.title
    await script.destroy()

    await logAdminAction(req.admin!.id, 'delete_script', 'script', parseInt(id), `删除剧本: ${title}`, req.ip)

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete script error:', error)
    res.status(500).json({ error: '删除剧本失败' })
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

    await logAdminAction(req.admin!.id, 'create_badge', 'badge', badge.id, `创建勋章: ${name}`, req.ip)

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

    await logAdminAction(req.admin!.id, 'update_badge', 'badge', badge.id, `更新勋章: ${name}`, req.ip)

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

    const name = badge.name
    await badge.destroy()

    await logAdminAction(req.admin!.id, 'delete_badge', 'badge', parseInt(id), `删除勋章: ${name}`, req.ip)

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
    const { page = 1, pageSize = 20, search } = req.query

    const where: any = {}
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'username', 'email', 'createdAt'],
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    })

    // 获取每个用户的存档数
    const userIds = users.map(u => u.id)
    const saveCounts = await Save.findAll({
      attributes: ['userId', [fn('COUNT', col('id')), 'count']],
      where: { userId: userIds },
      group: ['userId'],
      raw: true
    }) as any[]

    const saveCountMap = new Map(saveCounts.map(s => [s.userId, s.count]))

    const usersWithStats = users.map(user => ({
      ...user.toJSON(),
      saveCount: saveCountMap.get(user.id) || 0
    }))

    res.json({
      users: usersWithStats,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

/**
 * GET /api/admin/users/:id
 * 获取用户详情（包含存档）
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'createdAt']
    })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const saves = await Save.findAll({
      where: { userId: id },
      order: [['updatedAt', 'DESC']]
    })

    res.json({ user, saves })
  } catch (error) {
    console.error('Get user detail error:', error)
    res.status(500).json({ error: '获取用户详情失败' })
  }
})

/**
 * DELETE /api/admin/users/:id
 * 删除用户（需要 admin 权限）
 */
router.delete('/users/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 删除用户的所有存档
    await Save.destroy({ where: { userId: id } })
    // 删除用户
    const username = user.username
    await user.destroy()

    await logAdminAction(req.admin!.id, 'delete_user', 'user', parseInt(id), `删除用户: ${username}`, req.ip)

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: '删除用户失败' })
  }
})

// ============ 管理员管理（仅超级管理员） ============

/**
 * GET /api/admin/admins
 * 获取所有管理员
 */
router.get('/admins', requireRole('super_admin'), async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      order: [['createdAt', 'ASC']]
    })
    res.json({ admins })
  } catch (error) {
    console.error('Get admins error:', error)
    res.status(500).json({ error: '获取管理员列表失败' })
  }
})

/**
 * POST /api/admin/admins
 * 创建管理员
 */
router.post('/admins', requireRole('super_admin'), async (req, res) => {
  try {
    const { username, password, email, role } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '缺少用户名或密码' })
    }

    const existing = await Admin.findOne({ where: { username } })
    if (existing) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    const admin = await Admin.create({
      username,
      password,
      email,
      role: role || 'editor'
    })

    await logAdminAction(req.admin!.id, 'create_admin', 'admin', admin.id, `创建管理员: ${username}`, req.ip)

    res.json({ admin: admin.toSafeObject() })
  } catch (error) {
    console.error('Create admin error:', error)
    res.status(500).json({ error: '创建管理员失败' })
  }
})

/**
 * PUT /api/admin/admins/:id
 * 更新管理员
 */
router.put('/admins/:id', requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { email, role, isActive, password } = req.body

    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.status(404).json({ error: '管理员不存在' })
    }

    const updateData: any = { email, role, isActive }
    if (password) {
      updateData.password = password
    }

    await admin.update(updateData)

    await logAdminAction(req.admin!.id, 'update_admin', 'admin', admin.id, `更新管理员: ${admin.username}`, req.ip)

    res.json({ admin: admin.toSafeObject() })
  } catch (error) {
    console.error('Update admin error:', error)
    res.status(500).json({ error: '更新管理员失败' })
  }
})

/**
 * DELETE /api/admin/admins/:id
 * 删除管理员
 */
router.delete('/admins/:id', requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params

    if (parseInt(id) === req.admin!.id) {
      return res.status(400).json({ error: '不能删除自己' })
    }

    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.status(404).json({ error: '管理员不存在' })
    }

    const username = admin.username
    await admin.destroy()

    await logAdminAction(req.admin!.id, 'delete_admin', 'admin', parseInt(id), `删除管理员: ${username}`, req.ip)

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete admin error:', error)
    res.status(500).json({ error: '删除管理员失败' })
  }
})

// ============ 系统设置 ============

/**
 * GET /api/admin/settings
 * 获取所有系统设置
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await SystemSetting.findAll()
    const settingsMap: Record<string, any> = {}
    settings.forEach(s => {
      try {
        settingsMap[s.key] = JSON.parse(s.value)
      } catch {
        settingsMap[s.key] = s.value
      }
    })
    res.json({ settings: settingsMap })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: '获取系统设置失败' })
  }
})

/**
 * PUT /api/admin/settings
 * 更新系统设置
 */
router.put('/settings', requireRole('admin'), async (req, res) => {
  try {
    const { settings } = req.body

    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      await SystemSetting.upsert({ key, value: stringValue })
    }

    await logAdminAction(req.admin!.id, 'update_settings', 'settings', 0, '更新系统设置', req.ip)

    res.json({ message: '保存成功' })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: '保存设置失败' })
  }
})

// ============ 操作日志 ============

/**
 * GET /api/admin/logs
 * 获取操作日志
 */
router.get('/logs', requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query

    const { count, rows: logs } = await AdminLog.findAndCountAll({
      include: [{ model: Admin, as: 'admin', attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    })

    res.json({
      logs,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ error: '获取操作日志失败' })
  }
})

// ============ 地图位置管理 ============

/**
 * GET /api/admin/map-positions
 * 获取地图位置配置
 */
router.get('/map-positions', async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: 'map_positions' } })
    const positions = setting ? JSON.parse(setting.value) : {}
    res.json({ positions })
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
    await SystemSetting.upsert({
      key: 'map_positions',
      value: JSON.stringify(positions),
      description: '地图事件按钮位置配置'
    })
    res.json({ message: '保存成功' })
  } catch (error) {
    console.error('Save map positions error:', error)
    res.status(500).json({ error: '保存地图位置失败' })
  }
})

// ============ 辅助函数 ============

async function logAdminAction(
  adminId: number,
  action: AdminAction,
  targetType: string,
  targetId: number,
  details: string,
  ipAddress?: string
) {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress
    })
  } catch (error) {
    console.error('Log admin action error:', error)
  }
}

export default router
