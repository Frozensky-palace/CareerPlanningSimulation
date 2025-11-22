# 易班·大学生涯数字孪生平台

基于 AI 与 UGC 的沉浸式大学生活模拟系统

## 项目结构

```
CareerPlanningSimulation/
├── frontend/          # Vue3前端项目
├── backend/           # Node.js后端项目
├── database/          # 数据库脚本
└── docs/              # 项目文档
```

## 技术栈

**前端**
- Vue 3 + TypeScript
- Pinia（状态管理）
- Vue Router
- Element Plus（UI组件库）
- Axios（HTTP请求）
- Fabric.js（2D图形渲染）

**后端**
- Node.js + Express
- TypeScript
- Sequelize（ORM）
- MySQL 8.0
- JWT（认证）

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js >= 18
- MySQL >= 8.0
- pnpm (推荐) 或 npm

### 2. 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source database/init.sql
```

### 3. 后端配置

```bash
cd backend

# 安装依赖（使用pnpm）
pnpm install

# 或使用npm
# npm install

# 复制环境变量配置文件
cp .env.example .env

# 编辑.env文件，配置数据库连接信息
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=career_planning
# JWT_SECRET=your_jwt_secret

# 启动开发服务器
pnpm dev
```

后端服务将运行在 http://localhost:5000

### 4. 前端配置

```bash
cd frontend

# 安装依赖（使用pnpm）
pnpm install

# 或使用npm
# npm install

# 启动开发服务器
pnpm dev
```

前端服务将运行在 http://localhost:3000

## 开发计划

项目分为6个阶段：

- **Phase 0**: 项目准备 ✅
- **Phase 1**: 核心闭环（第1周）
- **Phase 2**: 游戏机制完善（第2周）
- **Phase 3**: 视觉系统（第3周）
- **Phase 4**: 内容扩充（第4周）
- **Phase 5**: UGC功能（第5周）
- **Phase 6**: 测试与优化（第6周）

详细开发流程请查看 `docs/development-plan.md`

## API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 存档接口
- `GET /api/saves` - 获取用户所有存档
- `POST /api/saves` - 创建新存档
- `GET /api/saves/:id` - 获取存档详情
- `PUT /api/saves/:id` - 更新存档
- `DELETE /api/saves/:id` - 删除存档

### 剧本接口
- `GET /api/scripts` - 获取剧本列表
- `GET /api/scripts/:id` - 获取剧本详情
- `POST /api/scripts` - 创建UGC剧本

### 勋章接口
- `GET /api/badges` - 获取所有勋章
- `GET /api/badges/unlocked/:saveId` - 获取已解锁勋章

## 目录说明

### 前端目录结构
```
frontend/src/
├── views/              # 页面组件
├── components/         # 公共组件
│   ├── Avatar/        # 形象相关
│   ├── Map/           # 地图相关
│   ├── Script/        # 剧本相关
│   ├── Menu/          # 菜单相关
│   └── Workshop/      # UGC编辑器
├── stores/            # Pinia状态管理
├── services/          # API服务
├── router/            # 路由配置
├── types/             # TypeScript类型定义
└── utils/             # 工具函数
```

### 后端目录结构
```
backend/src/
├── config/            # 配置文件
├── models/            # 数据模型
├── controllers/       # 控制器
├── routes/            # 路由
├── middleware/        # 中间件
├── utils/             # 工具函数
└── types/             # TypeScript类型定义
```

## License

MIT
