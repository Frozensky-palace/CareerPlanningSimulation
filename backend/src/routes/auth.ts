import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

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
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'career-planning-secret',
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

export default router
