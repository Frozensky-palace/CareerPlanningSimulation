import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Admin } from '../models/index.js'
import type { AdminRole } from '../models/Admin.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number
        username: string
        role: AdminRole
      }
    }
  }
}

/**
 * 管理员认证中间件
 */
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录或登录已过期' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number; type: string }

    // 确保是管理员 token
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: '无效的管理员凭证' })
    }

    const admin = await Admin.findByPk(decoded.adminId)
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: '管理员账号不存在或已禁用' })
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      role: admin.role
    }

    next()
  } catch (error) {
    console.error('Admin auth error:', error)
    return res.status(401).json({ error: '认证失败' })
  }
}

/**
 * 角色权限检查中间件
 */
export const requireRole = (requiredRole: AdminRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: '未认证' })
    }

    const roleLevel: Record<AdminRole, number> = {
      'super_admin': 3,
      'admin': 2,
      'editor': 1
    }

    if (roleLevel[req.admin.role] < roleLevel[requiredRole]) {
      return res.status(403).json({ error: '权限不足' })
    }

    next()
  }
}
