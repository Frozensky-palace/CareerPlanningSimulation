# 易班·大学生涯数字孪生平台

基于 AI 与 UGC 的沉浸式大学生活模拟系统

一个结合游戏化设计、AI 交互和用户自创内容的大学生活模拟平台，帮助学生提前体验大学生活，做出更好的职业规划决策。

## 核心特性

- **沉浸式校园体验**：基于真实校园地图的互动式探索
- **多线剧本系统**：官方剧本 + UGC 自创剧本，体验多样化的大学生活
- **动态数值系统**：学业、社交、健康、技能等多维度成长追踪
- **成就勋章系统**：记录玩家的重要里程碑和成就
- **结算评价系统**：多维度评估大学生涯表现
- **管理后台系统**：完整的后台管理功能，支持内容审核和系统配置
- **用户创作工坊**：可视化剧本编辑器，支持用户创作和分享自己的剧本

## 项目结构

```
CareerPlanningSimulation/
├── frontend/          # Vue3 前端项目
├── backend/           # Node.js 后端项目
├── database/          # 数据库初始化脚本
├── docs/              # 项目文档
└── package.json       # 根项目配置（支持一键启动）
```

## 技术栈

**前端**
- Vue 3 + TypeScript
- Pinia（状态管理）
- Vue Router 4（路由管理）
- Element Plus（UI 组件库）
- Tailwind CSS（样式框架）
- Axios（HTTP 请求）
- Fabric.js（2D 图形渲染/地图交互）
- ECharts（数据可视化）
- GSAP（动画效果）
- VueDraggable（拖拽功能）

**后端**
- Node.js + Express
- TypeScript
- Sequelize（ORM）
- MySQL 8.0
- JWT（用户认证）
- Argon2（密码加密）

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js >= 18
- MySQL >= 8.0
- pnpm（推荐）或 npm

### 2. 数据库初始化

```bash
# 方式一：执行初始化脚本
mysql -u root -p < database/init.sql

# 方式二：直接创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS career_planning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

> **注意**：只需创建数据库即可，表结构和种子数据会在后端启动时自动创建。

### 3. 后端配置

```bash
cd backend

# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接信息
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password  # 必须修改
# DB_NAME=career_planning
# JWT_SECRET=your_jwt_secret  # 必须修改
```

### 4. 一键启动（推荐）

```bash
# 在项目根目录
pnpm install       # 安装 concurrently
pnpm install:all   # 安装前后端依赖
pnpm dev           # 同时启动前后端服务
```

后端启动时会自动：
- 创建所有数据表（Sequelize sync）
- 插入默认剧本和勋章数据
- 创建管理员账户：`admin` / `admin123`

服务地址：
- 前端：http://localhost:3000
- 后端：http://localhost:5000

### 5. 分别启动（可选）

```bash
# 启动后端
cd backend && pnpm install && pnpm dev

# 新终端启动前端
cd frontend && pnpm install && pnpm dev
```

## 页面功能

| 页面 | 路由 | 描述 |
|------|------|------|
| 首页 | `/` | 平台介绍和功能入口 |
| 登录 | `/login` | 用户登录/注册 |
| 初始设置 | `/initial-setup` | 创建角色和初始化存档 |
| 校园地图 | `/campus-map` | 互动式校园探索 |
| 剧本详情 | `/script/:id` | 剧本阅读和选择 |
| 结算页面 | `/settlement` | 学期/学年结算评价 |
| 创作工坊 | `/workshop` | UGC 剧本编辑器 |
| 个人中心 | `/profile` | 用户信息和成就展示 |
| 管理后台 | `/admin` | 管理员登录 |
| 后台面板 | `/admin/dashboard` | 后台管理功能 |

## 管理后台功能

- **剧本管理**：审核、编辑、发布剧本内容
- **勋章管理**：配置成就勋章和解锁条件
- **用户管理**：查看和管理用户账号
- **地图管理**：配置校园地图和交互点位
- **公告管理**：发布系统公告
- **积分管理**：管理用户积分和奖励
- **系统设置**：配置系统参数

## API 文档

### 认证接口 `/api/auth`
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `GET /profile` - 获取用户信息

### 存档接口 `/api/saves`
- `GET /` - 获取用户所有存档
- `POST /` - 创建新存档
- `GET /:id` - 获取存档详情
- `PUT /:id` - 更新存档
- `DELETE /:id` - 删除存档

### 剧本接口 `/api/scripts`
- `GET /` - 获取剧本列表
- `GET /:id` - 获取剧本详情
- `POST /` - 创建 UGC 剧本

### 勋章接口 `/api/badges`
- `GET /` - 获取所有勋章
- `GET /unlocked/:saveId` - 获取已解锁勋章

### 结算接口 `/api/settlement`
- `POST /calculate` - 计算结算数据
- `GET /history` - 获取历史结算记录

### 公共接口 `/api/public`
- `GET /announcements` - 获取公告列表
- `GET /map-config` - 获取地图配置

### 管理接口 `/api/admin`
- `POST /login` - 管理员登录
- `GET /users` - 获取用户列表
- `GET /scripts` - 管理剧本
- `GET /badges` - 管理勋章
- `GET /settings` - 系统设置
- `POST /map-positions` - 配置地图位置

## 目录说明

### 前端目录结构
```
frontend/src/
├── views/                 # 页面组件
│   ├── HomePage.vue       # 首页
│   ├── LoginPage.vue      # 登录页
│   ├── InitialSetup.vue   # 初始设置
│   ├── CampusMap.vue      # 校园地图
│   ├── ScriptDetail.vue   # 剧本详情
│   ├── SettlementPage.vue # 结算页面
│   ├── WorkshopEditor.vue # 创作工坊
│   ├── ProfilePage.vue    # 个人中心
│   └── admin/             # 管理后台页面
│       ├── AdminLogin.vue
│       └── Dashboard.vue
├── components/            # 公共组件
│   ├── admin/             # 后台管理组件
│   │   ├── ScriptManagement.vue
│   │   ├── BadgeManagement.vue
│   │   ├── UserManagement.vue
│   │   ├── MapManagement.vue
│   │   ├── AnnouncementManagement.vue
│   │   ├── CreditsManagement.vue
│   │   └── SystemSettings.vue
│   ├── badge/             # 勋章组件
│   ├── campus/            # 校园地图组件
│   ├── home/              # 首页组件
│   ├── layout/            # 布局组件
│   └── user/              # 用户相关组件
├── stores/                # Pinia 状态管理
│   ├── userStore.ts       # 用户状态
│   ├── gameStore.ts       # 游戏状态
│   └── scriptStore.ts     # 剧本状态
├── services/              # API 服务
│   └── api.ts
├── router/                # 路由配置
├── types/                 # TypeScript 类型定义
└── utils/                 # 工具函数
```

### 后端目录结构
```
backend/src/
├── config/                # 配置文件
│   └── database.ts        # 数据库配置
├── models/                # 数据模型
│   ├── User.ts            # 用户模型
│   ├── Save.ts            # 存档模型
│   ├── Script.ts          # 剧本模型
│   ├── Badge.ts           # 勋章模型
│   ├── Admin.ts           # 管理员模型
│   ├── AdminLog.ts        # 管理日志模型
│   ├── SystemSetting.ts   # 系统设置模型
│   └── index.ts           # 模型导出
├── routes/                # 路由
│   ├── auth.ts            # 认证路由
│   ├── saves.ts           # 存档路由
│   ├── scripts.ts         # 剧本路由
│   ├── badges.ts          # 勋章路由
│   ├── settlement.ts      # 结算路由
│   ├── admin.ts           # 管理路由
│   └── public.ts          # 公共路由
├── middleware/            # 中间件
│   ├── auth.ts            # 用户认证
│   └── adminAuth.ts       # 管理员认证
├── seeds/                 # 种子数据
│   └── scripts.ts         # 初始剧本数据
├── utils/                 # 工具函数
└── index.ts               # 入口文件
```

## 开发计划

项目分为6个阶段：

- **Phase 0**: 项目准备 ✅
- **Phase 1**: 核心闭环 ✅
- **Phase 2**: 游戏机制完善（进行中）
- **Phase 3**: 视觉系统
- **Phase 4**: 内容扩充
- **Phase 5**: UGC 功能
- **Phase 6**: 测试与优化

详细开发流程请查看 `docs/development-guide.md`

## License

MIT
