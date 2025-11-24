import express from 'express'
import { SystemSetting } from '../models/index.js'

const router = express.Router()

/**
 * GET /api/public/announcements
 * 获取公告列表（公开接口，无需认证）
 */
router.get('/announcements', async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: 'announcements' } })
    let announcements = []

    if (setting) {
      try {
        announcements = JSON.parse(setting.value)
      } catch {
        announcements = []
      }
    }

    // 只返回已发布的公告，按创建时间倒序
    const publishedAnnouncements = announcements
      .filter((a: any) => a.isPublished)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    res.json({ announcements: publishedAnnouncements })
  } catch (error) {
    console.error('Get announcements error:', error)
    res.status(500).json({ error: '获取公告失败' })
  }
})

/**
 * GET /api/public/credits
 * 获取制作者名单（公开接口，无需认证）
 */
router.get('/credits', async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: 'credits' } })
    let credits = []

    if (setting) {
      try {
        credits = JSON.parse(setting.value)
      } catch {
        credits = []
      }
    }

    res.json({ credits })
  } catch (error) {
    console.error('Get credits error:', error)
    res.status(500).json({ error: '获取制作者名单失败' })
  }
})

export default router
