import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: number
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: 'No token provided'
      })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET 环境变量未设置')
      return res.status(500).json({
        code: 500,
        message: 'Server configuration error'
      })
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number }
    req.userId = decoded.userId

    next()
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Invalid token'
    })
  }
}
