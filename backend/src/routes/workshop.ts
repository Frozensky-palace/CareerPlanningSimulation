import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { WorkshopChain, WorkshopScript } from '../models/index.js'

const router = express.Router()

// 所有路由都需要用户认证
router.use(authMiddleware)

// ============ 剧本链 CRUD ============

/**
 * POST /api/workshop/chains
 * 创建剧本链
 */
router.post('/chains', async (req: AuthRequest, res) => {
  try {
    const { title, description, coverImage } = req.body
    const userId = req.userId!

    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空' })
    }

    const chain = await WorkshopChain.create({
      userId,
      title,
      description: description || '',
      coverImage: coverImage || null
    })

    res.json({ code: 200, message: '创建成功', data: { chain } })
  } catch (error) {
    console.error('Create workshop chain error:', error)
    res.status(500).json({ code: 500, message: '创建失败' })
  }
})

/**
 * GET /api/workshop/chains
 * 获取我的剧本链列表
 */
router.get('/chains', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const chains = await WorkshopChain.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']]
    })

    res.json({ code: 200, data: { chains } })
  } catch (error) {
    console.error('Get workshop chains error:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

/**
 * GET /api/workshop/chains/:id
 * 获取剧本链详情（包含所有剧本节点）
 */
router.get('/chains/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    const chain = await WorkshopChain.findOne({
      where: { id, userId }
    })

    if (!chain) {
      return res.status(404).json({ code: 404, message: '剧本链不存在' })
    }

    const scripts = await WorkshopScript.findAll({
      where: { chainId: id },
      order: [['createdAt', 'ASC']]
    })

    res.json({ code: 200, data: { chain, scripts } })
  } catch (error) {
    console.error('Get workshop chain detail error:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

/**
 * PUT /api/workshop/chains/:id
 * 更新剧本链信息
 */
router.put('/chains/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!
    const { title, description, coverImage, rootScriptId } = req.body

    const chain = await WorkshopChain.findOne({
      where: { id, userId }
    })

    if (!chain) {
      return res.status(404).json({ code: 404, message: '剧本链不存在' })
    }

    await chain.update({
      title: title !== undefined ? title : chain.title,
      description: description !== undefined ? description : chain.description,
      coverImage: coverImage !== undefined ? coverImage : chain.coverImage,
      rootScriptId: rootScriptId !== undefined ? rootScriptId : chain.rootScriptId
    })

    res.json({ code: 200, message: '更新成功', data: { chain } })
  } catch (error) {
    console.error('Update workshop chain error:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

/**
 * DELETE /api/workshop/chains/:id
 * 删除剧本链
 */
router.delete('/chains/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    const chain = await WorkshopChain.findOne({
      where: { id, userId }
    })

    if (!chain) {
      return res.status(404).json({ code: 404, message: '剧本链不存在' })
    }

    // 删除所有关联的剧本节点
    await WorkshopScript.destroy({
      where: { chainId: id }
    })

    // 删除剧本链
    await chain.destroy()

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete workshop chain error:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

// ============ 剧本节点 CRUD ============

/**
 * POST /api/workshop/chains/:chainId/scripts
 * 创建剧本节点
 */
router.post('/chains/:chainId/scripts', async (req: AuthRequest, res) => {
  try {
    const { chainId } = req.params
    const userId = req.userId!
    const { title, content, contents, backgroundImage, location, options, position, isEntryPoint } = req.body

    // 验证剧本链归属
    const chain = await WorkshopChain.findOne({
      where: { id: chainId, userId }
    })

    if (!chain) {
      return res.status(404).json({ code: 404, message: '剧本链不存在' })
    }

    // 如果设为入口，清除其他入口
    if (isEntryPoint) {
      await WorkshopScript.update(
        { isEntryPoint: false },
        { where: { chainId } }
      )
    }

    const script = await WorkshopScript.create({
      chainId: parseInt(chainId),
      userId,
      title: title || '未命名剧本',
      content: content || '',
      contents: contents || [],
      backgroundImage: backgroundImage || null,
      location: location || 'campus',
      options: options || [],
      position: position || { x: 0, y: 0 },
      isEntryPoint: isEntryPoint || false
    })

    // 如果是入口剧本，更新剧本链的 rootScriptId
    if (isEntryPoint) {
      await chain.update({ rootScriptId: script.id })
    }

    res.json({ code: 200, message: '创建成功', data: { script } })
  } catch (error) {
    console.error('Create workshop script error:', error)
    res.status(500).json({ code: 500, message: '创建失败' })
  }
})

/**
 * PUT /api/workshop/scripts/:id
 * 更新剧本节点
 */
router.put('/scripts/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!
    const { title, content, contents, backgroundImage, location, options, isEntryPoint } = req.body

    const script = await WorkshopScript.findOne({
      where: { id, userId }
    })

    if (!script) {
      return res.status(404).json({ code: 404, message: '剧本不存在' })
    }

    // 如果设为入口，清除其他入口
    if (isEntryPoint && !script.isEntryPoint) {
      await WorkshopScript.update(
        { isEntryPoint: false },
        { where: { chainId: script.chainId } }
      )

      // 更新剧本链的 rootScriptId
      await WorkshopChain.update(
        { rootScriptId: script.id },
        { where: { id: script.chainId } }
      )
    }

    await script.update({
      title: title !== undefined ? title : script.title,
      content: content !== undefined ? content : script.content,
      contents: contents !== undefined ? contents : script.contents,
      backgroundImage: backgroundImage !== undefined ? backgroundImage : script.backgroundImage,
      location: location !== undefined ? location : script.location,
      options: options !== undefined ? options : script.options,
      isEntryPoint: isEntryPoint !== undefined ? isEntryPoint : script.isEntryPoint
    })

    res.json({ code: 200, message: '更新成功', data: { script } })
  } catch (error) {
    console.error('Update workshop script error:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

/**
 * DELETE /api/workshop/scripts/:id
 * 删除剧本节点
 */
router.delete('/scripts/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    const script = await WorkshopScript.findOne({
      where: { id, userId }
    })

    if (!script) {
      return res.status(404).json({ code: 404, message: '剧本不存在' })
    }

    const chainId = script.chainId
    const wasEntryPoint = script.isEntryPoint

    await script.destroy()

    // 如果删除的是入口剧本，清除剧本链的 rootScriptId
    if (wasEntryPoint) {
      await WorkshopChain.update(
        { rootScriptId: null },
        { where: { id: chainId } }
      )
    }

    // 清除其他剧本中指向此剧本的 nextScriptId
    const otherScripts = await WorkshopScript.findAll({
      where: { chainId }
    })

    for (const otherScript of otherScripts) {
      const options = otherScript.options || []
      let hasChanges = false

      const updatedOptions = options.map(opt => {
        if (opt.nextScriptId === parseInt(id)) {
          hasChanges = true
          return { ...opt, nextScriptId: null }
        }
        return opt
      })

      if (hasChanges) {
        await otherScript.update({ options: updatedOptions })
      }
    }

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete workshop script error:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

/**
 * PATCH /api/workshop/scripts/positions
 * 批量更新节点位置
 */
router.patch('/scripts/positions', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { positions } = req.body

    if (!Array.isArray(positions)) {
      return res.status(400).json({ code: 400, message: '无效的位置数据' })
    }

    for (const item of positions) {
      const { scriptId, position } = item
      await WorkshopScript.update(
        { position },
        { where: { id: scriptId, userId } }
      )
    }

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error('Update positions error:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

// ============ 导入游戏 ============

/**
 * POST /api/workshop/chains/:id/import
 * 导入剧本链到游戏
 */
router.post('/chains/:id/import', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    const chain = await WorkshopChain.findOne({
      where: { id, userId }
    })

    if (!chain) {
      return res.status(404).json({ code: 404, message: '剧本链不存在' })
    }

    if (!chain.rootScriptId) {
      return res.status(400).json({ code: 400, message: '请先设置入口剧本' })
    }

    // 检查剧本链是否有内容
    const scriptCount = await WorkshopScript.count({
      where: { chainId: id }
    })

    if (scriptCount === 0) {
      return res.status(400).json({ code: 400, message: '剧本链没有任何剧本节点' })
    }

    await chain.update({ isImported: true })

    res.json({ code: 200, message: '导入成功', data: { chain } })
  } catch (error) {
    console.error('Import workshop chain error:', error)
    res.status(500).json({ code: 500, message: '导入失败' })
  }
})

/**
 * DELETE /api/workshop/chains/:id/import
 * 取消导入
 */
router.delete('/chains/:id/import', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    const chain = await WorkshopChain.findOne({
      where: { id, userId }
    })

    if (!chain) {
      return res.status(404).json({ code: 404, message: '剧本链不存在' })
    }

    await chain.update({ isImported: false })

    res.json({ code: 200, message: '取消导入成功', data: { chain } })
  } catch (error) {
    console.error('Unimport workshop chain error:', error)
    res.status(500).json({ code: 500, message: '取消导入失败' })
  }
})

export default router
