import express from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { User } from '../models/index.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保头像上传目录存在
const avatarsDir = path.join(__dirname, '../../uploads/avatars')
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true })
}

// 配置头像上传的 multer
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir)
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthRequest).userId
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${userId}-${Date.now()}${ext}`)
  }
})

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'))
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB 限制
  }
})

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名、邮箱和密码不能为空'
      })
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username }
    })
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: '用户名已被使用'
      })
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email }
    })
    if (existingEmail) {
      return res.status(400).json({
        code: 400,
        message: '邮箱已被注册'
      })
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password
    })

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        user: user.toSafeObject()
      }
    })
  } catch (error: any) {
    console.error('Register error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '注册失败'
    })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }

    // 查找用户
    const user = await User.findOne({
      where: { username }
    })
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    const isValid = await user.validatePassword(password)
    if (!isValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 生成JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 环境变量未设置')
    }
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: user.toSafeObject()
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '登录失败'
    })
  }
})

// 获取用户信息
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByPk(req.userId)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    res.json({
      code: 200,
      data: {
        user: user.toSafeObject()
      }
    })
  } catch (error: any) {
    console.error('Profile error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取用户信息失败'
    })
  }
})

// 更新用户信息
router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByPk(req.userId)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    const { username, email, password } = req.body

    // 如果更新用户名，检查是否已被使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: '用户名已被使用'
        })
      }
      user.username = username
    }

    // 如果更新邮箱，检查是否已被使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } })
      if (existingEmail) {
        return res.status(400).json({
          code: 400,
          message: '邮箱已被注册'
        })
      }
      user.email = email
    }

    // 如果更新密码
    if (password) {
      user.password = password
    }

    await user.save()

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        user: user.toSafeObject()
      }
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新失败'
    })
  }
})

// 上传头像
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      })
    }

    const user = await User.findByPk(req.userId)
    if (!user) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path)
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    // 如果用户有旧头像，删除旧文件
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../..', user.avatar)
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath)
        } catch (e) {
          console.warn('Failed to delete old avatar:', e)
        }
      }
    }

    // 更新用户头像
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    user.avatar = avatarUrl
    await user.save()

    res.json({
      code: 200,
      message: '头像上传成功',
      data: {
        avatar: avatarUrl
      }
    })
  } catch (error: any) {
    console.error('Upload avatar error:', error)
    // 如果出错，尝试删除已上传的文件
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (e) {
        console.warn('Failed to delete uploaded file:', e)
      }
    }
    res.status(500).json({
      code: 500,
      message: error.message || '头像上传失败'
    })
  }
})

export default router
