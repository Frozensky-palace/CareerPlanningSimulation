import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
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
import uploadRoutes from './routes/upload.js'

// 导入种子数据
import { seedDatabase } from './seeds/scripts.js'

dotenv.config()

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000 // server port

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务 - 提供上传文件的访问
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/saves', saveRoutes)
app.use('/api/scripts', scriptRoutes)
app.use('/api/badges', badgeRoutes)
app.use('/api/settlement', settlementRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/upload', uploadRoutes)

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

    // 同步数据库
    // 注意: alter: true 可能会导致MySQL索引过多问题，改用更安全的方式
    // 首次部署或需要更新表结构时可临时启用 alter: true
    await sequelize.sync()
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
