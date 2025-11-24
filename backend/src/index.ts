import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/database.js'

// 导入模型（确保模型被初始化）
import './models/index.js'

// 导入路由
import authRoutes from './routes/auth.js'
import saveRoutes from './routes/saves.js'
import scriptRoutes from './routes/scripts.js'
import badgeRoutes from './routes/badges.js'
import settlementRoutes from './routes/settlement.js'
import adminRoutes from './routes/admin.js'
import publicRoutes from './routes/public.js'

// 导入种子数据
import { seedDatabase } from './seeds/scripts.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000 // server port

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/saves', saveRoutes)
app.use('/api/scripts', scriptRoutes)
app.use('/api/badges', badgeRoutes)
app.use('/api/settlement', settlementRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/public', publicRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: err.message || 'Internal Server Error'
  })
})

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('✓ Database connected successfully')

    // 同步数据库（alter: true 会自动添加新表和新列，但不删除现有数据）
    await sequelize.sync({ alter: true })
    console.log('✓ Database tables synchronized')

    // 插入种子数据
    await seedDatabase()

    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('✗ Unable to start server:', error)
    process.exit(1)
  }
}

startServer()
