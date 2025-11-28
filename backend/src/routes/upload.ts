import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = express.Router()

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads')
const scriptsDir = path.join(uploadDir, 'scripts')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true })
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, scriptsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `script-bg-${uniqueSuffix}${ext}`)
  }
})

// 文件过滤器 - 只允许图片
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件（JPEG、PNG、GIF、WEBP）'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 限制
  }
})

/**
 * POST /api/upload/script-background
 * 上传剧本背景图片
 */
router.post('/script-background', adminAuthMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }

    // 返回图片URL
    const imageUrl = `/uploads/scripts/${req.file.filename}`

    res.json({
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: '上传失败' })
  }
})

/**
 * DELETE /api/upload/script-background/:filename
 * 删除剧本背景图片
 */
router.delete('/script-background/:filename', adminAuthMiddleware, async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(scriptsDir, filename)

    // 安全检查：确保文件在 scriptsDir 目录内
    if (!filePath.startsWith(scriptsDir)) {
      return res.status(400).json({ error: '无效的文件路径' })
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ message: '删除成功' })
    } else {
      res.status(404).json({ error: '文件不存在' })
    }
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({ error: '删除失败' })
  }
})

export default router
