# 快速启动指南（使用 pnpm）

## 安装 pnpm

如果还没有安装 pnpm：

```bash
npm install -g pnpm
```

## 一键安装所有依赖

```bash
# 在项目根目录执行
pnpm install -r
```

## 启动开发

### 方式1：同时启动前后端（推荐）

```bash
# 安装根目录依赖
pnpm install

# 同时启动
pnpm dev
```

### 方式2：分别启动

**终端1 - 启动后端：**
```bash
cd backend
pnpm dev
```

**终端2 - 启动前端：**
```bash
cd frontend
pnpm dev
```

## 访问地址

- 前端：http://localhost:3000
- 后端：http://localhost:5000
- 后端健康检查：http://localhost:5000/api/health

## pnpm workspace 优势

1. **磁盘空间节省**：所有依赖共享存储
2. **安装速度更快**：硬链接复用
3. **更严格的依赖管理**：避免幽灵依赖

## 常用命令

```bash
# 安装所有workspace的依赖
pnpm install -r

# 只安装backend的依赖
pnpm --filter backend install

# 只安装frontend的依赖
pnpm --filter frontend install

# 在backend中添加依赖
pnpm --filter backend add express

# 在frontend中添加依赖
pnpm --filter frontend add vue

# 添加开发依赖
pnpm --filter backend add -D typescript

# 构建所有项目
pnpm -r build

# 清理node_modules
pnpm -r clean
```

## 注意事项

1. **首次运行需要配置环境变量**：
   ```bash
   cp backend/.env.example backend/.env
   # 然后编辑 backend/.env 填写数据库密码
   ```

2. **数据库初始化**：
   ```bash
   mysql -u root -p < database/init.sql
   ```

3. **如果端口被占用**：
   - 修改 `backend/.env` 的 `PORT`
   - 修改 `frontend/vite.config.ts` 的 `server.port`

## 故障排查

### pnpm 命令找不到
```bash
npm install -g pnpm
```

### 端口冲突
```bash
# Windows查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# 杀死进程
taskkill /PID <进程号> /F
```

### 数据库连接失败
检查 `backend/.env` 配置是否正确：
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
