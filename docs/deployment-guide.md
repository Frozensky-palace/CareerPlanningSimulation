# 部署指南与服务器架构

本文档详细介绍易启主理平台的生产环境部署流程、服务器架构设计及运维建议。

---

## 一、服务器架构设计

### 1.1 整体架构图

```
                                    ┌─────────────────┐
                                    │   用户浏览器     │
                                    └────────┬────────┘
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │      Cloudflare CDN      │
                              │  - 全球加速              │
                              │  - DDoS 防护             │
                              │  - SSL/TLS 终端          │
                              │  - 缓存静态资源          │
                              │  - WAF 防火墙            │
                              └──────────────┬───────────┘
                                             │
                                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                         云服务器 / VPS                              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      Nginx (反向代理)                         │ │
│  │  - 静态文件服务 (前端 dist)                                    │ │
│  │  - API 请求转发                                               │ │
│  │  - 上传文件服务                                               │ │
│  │  - Gzip 压缩                                                  │ │
│  └─────────────────────────┬────────────────────────────────────┘ │
│                            │                                       │
│            ┌───────────────┴───────────────┐                      │
│            ▼                               ▼                       │
│  ┌──────────────────┐           ┌──────────────────┐              │
│  │  前端静态文件     │           │  后端 API 服务    │              │
│  │  /var/www/dist   │           │  Node.js + PM2   │              │
│  │                  │           │  Port: 5000      │              │
│  └──────────────────┘           └────────┬─────────┘              │
│                                          │                         │
│                                          ▼                         │
│                              ┌──────────────────┐                  │
│                              │     MySQL 8.0    │                  │
│                              └──────────────────┘                  │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 组件说明

| 组件 | 作用 | 技术选型 |
|------|------|----------|
| **Cloudflare** | CDN加速、DDoS防护、SSL证书、WAF防火墙、缓存 | Cloudflare Free/Pro |
| **Nginx** | 反向代理、静态文件服务 | Nginx 1.24+ |
| **前端** | Vue 3 SPA 应用，构建后的静态文件 | Vite 构建产物 |
| **后端** | RESTful API 服务 | Node.js 18+ / Express |
| **进程管理** | 后端进程守护、集群管理、自动重启 | PM2 |
| **数据库** | 关系型数据存储 | MySQL 8.0 |
| **对象存储** (可选) | 用户上传文件存储 | 阿里云OSS/腾讯云COS |

### 1.3 推荐服务器配置

#### 最低配置（开发/测试环境）
- CPU: 1核
- 内存: 2GB
- 硬盘: 40GB SSD
- 带宽: 1Mbps

#### 推荐配置（生产环境 - 100并发用户）
- CPU: 2核
- 内存: 4GB
- 硬盘: 100GB SSD
- 带宽: 5Mbps

#### 高配置（生产环境 - 500+并发用户）
- CPU: 4核
- 内存: 8GB
- 硬盘: 200GB SSD
- 带宽: 10Mbps
- 建议配合负载均衡和数据库读写分离

---

## 二、部署前准备

### 2.1 域名与 Cloudflare 配置

#### 2.1.1 域名准备
- 注册域名（国内服务器需要备案）
- 将域名 DNS 托管到 Cloudflare

#### 2.1.2 Cloudflare 配置步骤

1. **注册 Cloudflare 账号**
   - 访问 https://dash.cloudflare.com/sign-up
   - 注册并登录

2. **添加站点**
   - 点击「Add a Site」
   - 输入你的域名
   - 选择 Free 计划（或根据需求选择付费计划）

3. **修改 DNS 服务器**
   - Cloudflare 会提供两个 NS 记录
   - 到域名注册商处修改 DNS 服务器为 Cloudflare 提供的地址
   - 等待 DNS 生效（通常 24 小时内）

4. **配置 DNS 记录**
   ```
   类型    名称              内容                代理状态
   A       @                 你的服务器IP        已代理 (橙色云朵)
   A       www               你的服务器IP        已代理 (橙色云朵)
   ```

5. **SSL/TLS 配置**
   - 进入「SSL/TLS」→「概述」
   - 加密模式选择「完全（严格）」或「完全」
   - 启用「始终使用 HTTPS」
   - 启用「自动 HTTPS 重写」

6. **缓存配置**
   - 进入「缓存」→「配置」
   - 缓存级别：标准
   - 浏览器缓存 TTL：推荐 4 小时

7. **页面规则配置（可选）**
   ```
   规则1: *yourdomain.com/api/*
   - 缓存级别: 绕过
   - 安全级别: 高

   规则2: *yourdomain.com/*.js
   - 缓存级别: 缓存所有内容
   - 边缘缓存 TTL: 1个月

   规则3: *yourdomain.com/*.css
   - 缓存级别: 缓存所有内容
   - 边缘缓存 TTL: 1个月
   ```

8. **安全配置**
   - 进入「安全性」→「设置」
   - 安全级别：中
   - 启用「浏览器完整性检查」
   - 启用「Bot Fight Mode」（免费版可用）

### 2.2 服务器环境准备

```bash
# 以 Ubuntu 22.04 为例

# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 pnpm
npm install -g pnpm

# 4. 安装 PM2
npm install -g pm2

# 5. 安装 Nginx
sudo apt install -y nginx

# 6. 安装 MySQL 8.0
sudo apt install -y mysql-server

# 7. 安装 Git
sudo apt install -y git
```

### 2.3 MySQL 数据库配置

```bash
# 1. 安全初始化
sudo mysql_secure_installation

# 2. 登录 MySQL
sudo mysql -u root -p

# 3. 创建数据库和用户
CREATE DATABASE career_planning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'career_user'@'localhost' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON career_planning.* TO 'career_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 三、部署流程

### 3.1 代码部署

```bash
# 1. 创建部署目录
sudo mkdir -p /var/www/career-planning
sudo chown $USER:$USER /var/www/career-planning

# 2. 克隆代码
cd /var/www/career-planning
git clone https://github.com/your-repo/CareerPlanningSimulation.git .

# 3. 安装依赖
pnpm install
```

### 3.2 后端配置与构建

```bash
# 1. 进入后端目录
cd /var/www/career-planning/backend

# 2. 创建生产环境配置
cp .env.example .env

# 3. 编辑环境变量
nano .env
```

**生产环境 `.env` 配置示例：**

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=career_user
DB_PASSWORD=你的强密码
DB_NAME=career_planning

# JWT密钥 (使用以下命令生成)
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=生成的64位随机字符串

# 服务器配置
PORT=5000
NODE_ENV=production

# CORS配置 (填写你的域名)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

```bash
# 4. 构建后端
pnpm run build

# 5. 创建日志目录
mkdir -p logs
```

### 3.3 前端配置与构建

```bash
# 1. 进入前端目录
cd /var/www/career-planning/frontend

# 2. 创建生产环境配置
nano .env.production
```

**生产环境 `.env.production` 配置：**

```env
VITE_API_URL=https://yourdomain.com/api
VITE_UPLOAD_URL=https://yourdomain.com
```

```bash
# 3. 构建前端
pnpm run build

# 4. 构建产物在 dist 目录
ls dist/
```

### 3.4 PM2 进程管理配置

```bash
# 1. 回到项目根目录
cd /var/www/career-planning

# 2. 使用已创建的 ecosystem.config.js 启动
pm2 start ecosystem.config.js --env production

# 3. 保存进程列表（重启后自动恢复）
pm2 save

# 4. 设置开机自启
pm2 startup
# 按照提示执行生成的命令
```

**PM2 常用命令：**

```bash
pm2 list                    # 查看进程列表
pm2 logs career-planning-api # 查看日志
pm2 restart career-planning-api # 重启服务
pm2 stop career-planning-api    # 停止服务
pm2 monit                   # 监控面板
```

### 3.5 Nginx 配置（配合 Cloudflare）

#### 3.5.1 生成 Cloudflare Origin 证书

1. 登录 Cloudflare 控制台
2. 进入「SSL/TLS」→「源服务器」
3. 点击「创建证书」
4. 选择「让 Cloudflare 生成私钥和 CSR」
5. 主机名填写 `*.yourdomain.com, yourdomain.com`
6. 有效期选择 15 年
7. 点击创建，保存证书和私钥

```bash
# 在服务器上创建证书目录
sudo mkdir -p /etc/ssl/cloudflare

# 将证书内容保存到文件
sudo nano /etc/ssl/cloudflare/cert.pem
# 粘贴 Origin 证书内容

sudo nano /etc/ssl/cloudflare/key.pem
# 粘贴私钥内容

# 设置权限
sudo chmod 600 /etc/ssl/cloudflare/key.pem
```

#### 3.5.2 创建 Nginx 配置

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/conf.d/career-planning.conf
```

**Nginx 配置内容（配合 Cloudflare）：**

```nginx
# 仅监听 Cloudflare 代理请求
# 设置真实 IP（从 Cloudflare 获取）
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;

# HTTP 服务器 (Cloudflare 会处理 HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 前端静态文件
    root /var/www/career-planning/frontend/dist;
    index index.html;

    # 前端路由 (Vue Router history 模式)
    location / {
        try_files $uri $uri/ /index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 文件上传大小限制
        client_max_body_size 10M;
    }

    # 上传文件访问
    location /uploads {
        alias /var/www/career-planning/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}

# HTTPS 服务器 (使用 Cloudflare Origin 证书)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # Cloudflare Origin 证书
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 前端静态文件
    root /var/www/career-planning/frontend/dist;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # 上传文件访问
    location /uploads {
        alias /var/www/career-planning/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

```bash
# 2. 测试配置
sudo nginx -t

# 3. 重载 Nginx
sudo systemctl reload nginx
```

### 3.6 Cloudflare 最终配置检查

完成服务器配置后，确认 Cloudflare 设置：

1. **SSL/TLS 模式**
   - 进入「SSL/TLS」→「概述」
   - 确保加密模式为「完全（严格）」

2. **验证部署**
   - 访问 `https://yourdomain.com`
   - 检查浏览器地址栏显示安全锁图标
   - 使用 [SSL Labs](https://www.ssllabs.com/ssltest/) 测试 SSL 配置

3. **开启额外安全功能**
   - 「安全性」→「WAF」→ 启用托管规则
   - 「速度」→「优化」→ 启用 Auto Minify（JS/CSS/HTML）
   - 「速度」→「优化」→ 启用 Brotli 压缩

---

## 四、数据库初始化

```bash
# 1. 启动后端服务后，Sequelize 会自动同步表结构
pm2 start ecosystem.config.js --env production

# 2. 查看日志确认数据库初始化成功
pm2 logs career-planning-api

# 应该看到类似输出：
# ✓ Database connected successfully
# ✓ Database tables synchronized
# ✓ Server is running on http://localhost:5000
```

---

## 五、部署验证

### 5.1 服务检查清单

```bash
# 1. 检查 PM2 进程状态
pm2 list

# 2. 检查 Nginx 状态
sudo systemctl status nginx

# 3. 检查 MySQL 状态
sudo systemctl status mysql

# 4. 检查端口监听
sudo netstat -tlnp | grep -E '80|443|5000|3306'

# 5. 测试 API 健康检查
curl http://localhost:5000/api/health

# 6. 测试 HTTPS 访问
curl -I https://yourdomain.com
```

### 5.2 功能测试

1. 访问 `https://yourdomain.com` 确认首页正常加载
2. 测试用户注册/登录功能
3. 测试管理员后台 `https://yourdomain.com/admin`
4. 测试剧本浏览和互动功能
5. 测试文件上传功能

---

## 六、运维与监控

### 6.1 日志管理

```bash
# 后端日志位置
/var/www/career-planning/backend/logs/

# PM2 日志
pm2 logs career-planning-api

# Nginx 日志
/var/log/nginx/access.log
/var/log/nginx/error.log
```

### 6.2 备份策略

**数据库备份脚本（建议每日执行）：**

```bash
#!/bin/bash
# /var/www/career-planning/scripts/backup.sh

BACKUP_DIR="/var/backups/career-planning"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="career_planning"
DB_USER="career_user"
DB_PASS="你的密码"

mkdir -p $BACKUP_DIR

# 数据库备份
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 上传文件备份
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/career-planning/backend/uploads

# 保留最近30天的备份
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# 设置定时任务
crontab -e
# 添加以下行（每天凌晨3点执行备份）
0 3 * * * /var/www/career-planning/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### 6.3 监控建议

1. **PM2 监控**
   - `pm2 monit` 实时监控
   - 集成 PM2.io 云监控平台（可选）

2. **服务器监控**
   - 使用云服务商提供的监控服务
   - 或部署 Prometheus + Grafana

3. **告警设置**
   - 配置 CPU/内存/磁盘使用率告警
   - 配置服务宕机告警

### 6.4 常见问题排查

| 问题 | 排查命令 | 可能原因 |
|------|----------|----------|
| 502 Bad Gateway | `pm2 list`, `pm2 logs` | 后端服务未启动或崩溃 |
| 数据库连接失败 | `systemctl status mysql` | MySQL 未运行或配置错误 |
| 静态资源404 | `ls /var/www/.../dist` | 前端未构建或路径错误 |
| HTTPS 证书错误 | `certbot certificates` | 证书过期或配置错误 |

---

## 七、更新部署流程

```bash
# 1. 拉取最新代码
cd /var/www/career-planning
git pull origin main

# 2. 安装新依赖
pnpm install

# 3. 重新构建后端
cd backend
pnpm run build

# 4. 重新构建前端
cd ../frontend
pnpm run build

# 5. 重启后端服务
pm2 restart career-planning-api

# 6. 清除 Nginx 缓存（如有配置）
# sudo rm -rf /var/cache/nginx/*
```

---

## 八、安全加固建议

### 8.1 系统安全

```bash
# 1. 配置防火墙
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3306   # 禁止外部访问 MySQL
sudo ufw deny 5000   # 禁止外部直接访问后端

# 2. 禁用 root SSH 登录
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no

# 3. 配置 fail2ban 防止暴力破解
sudo apt install fail2ban
```

### 8.2 应用安全

- [x] JWT 密钥使用强随机字符串
- [x] 数据库使用专用用户（非 root）
- [x] 启用 HTTPS 强制跳转
- [x] 配置 CORS 白名单
- [x] 启用请求速率限制
- [x] 启用 helmet 安全头

### 8.3 数据安全

- 定期备份数据库和上传文件
- 敏感配置不提交到代码仓库
- 生产环境日志脱敏处理

---

## 九、扩展架构（高可用方案）

当用户量增长时，可考虑以下扩展方案：

```
                         ┌─────────────────┐
                         │   负载均衡器     │
                         │  (SLB/ALB)      │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │  Web服务器1   │    │  Web服务器2   │    │  Web服务器3   │
      │  Nginx+Node  │    │  Nginx+Node  │    │  Nginx+Node  │
      └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌──────────────┐          ┌──────────────┐
            │  MySQL 主库   │ ◄──────► │  MySQL 从库   │
            │   (写)       │  复制     │   (读)       │
            └──────────────┘          └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │    Redis     │
            │  (会话/缓存)  │
            └──────────────┘
```

---

## 十、附录

### 附录 A：环境变量完整说明

| 变量名 | 必填 | 说明 | 示例值 |
|--------|------|------|--------|
| `DB_HOST` | 是 | 数据库主机 | `localhost` |
| `DB_PORT` | 是 | 数据库端口 | `3306` |
| `DB_USER` | 是 | 数据库用户 | `career_user` |
| `DB_PASSWORD` | 是 | 数据库密码 | `强密码` |
| `DB_NAME` | 是 | 数据库名 | `career_planning` |
| `JWT_SECRET` | 是 | JWT 签名密钥 | `64位随机字符串` |
| `PORT` | 否 | 后端端口 | `5000` |
| `NODE_ENV` | 是 | 运行环境 | `production` |
| `CORS_ORIGIN` | 是 | 允许的前端域名 | `https://yourdomain.com` |

### 附录 B：项目目录结构

```
/var/www/career-planning/
├── backend/
│   ├── dist/           # 编译输出
│   ├── uploads/        # 用户上传文件
│   ├── logs/           # 应用日志
│   ├── src/            # 源代码
│   └── .env            # 环境配置
├── frontend/
│   ├── dist/           # 构建产物 (Nginx 服务)
│   └── src/            # 源代码
├── database/
│   └── init.sql        # 数据库初始化脚本
├── docs/               # 项目文档
├── ecosystem.config.js # PM2 配置
├── nginx.conf.template # Nginx 配置模板
└── package.json        # 根项目配置
```

### 附录 C：常用运维命令速查

```bash
# 服务管理
pm2 start/stop/restart career-planning-api
sudo systemctl start/stop/restart nginx
sudo systemctl start/stop/restart mysql

# 日志查看
pm2 logs career-planning-api
tail -f /var/log/nginx/error.log

# 资源监控
htop
df -h
free -m

# 数据库
mysql -u career_user -p career_planning

# SSL 证书
sudo certbot certificates
sudo certbot renew
```

---

## 十一、Docker 容器化部署（推荐）

对于快速部署或资源受限的服务器（如 2核2G），推荐使用 Docker 容器化部署。

### 11.1 Docker 部署架构

```
┌──────────────────────────────────────────────────────────────┐
│                     Docker Compose 编排                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    career-network                        │ │
│  │                                                          │ │
│  │  ┌──────────────┐    ┌──────────────┐   ┌────────────┐  │ │
│  │  │   frontend   │    │   backend    │   │   mysql    │  │ │
│  │  │ (Nginx+Vue)  │◄──►│  (Node.js)   │◄─►│  (MySQL8)  │  │ │
│  │  │    :80       │    │    :5000     │   │   :3306    │  │ │
│  │  └──────────────┘    └──────────────┘   └────────────┘  │ │
│  │         │                   │                  │         │ │
│  │         ▼                   ▼                  ▼         │ │
│  │     [静态文件]        [uploads卷]         [mysql卷]      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                                │
│                              ▼                                │
│                         Port: 80                              │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 一键部署（Rocky Linux 9.x）

```bash
# 1. 上传项目到服务器
scp -r CareerPlanningSimulation root@your-server:/opt/

# 2. SSH 登录服务器
ssh root@your-server

# 3. 进入项目目录
cd /opt/CareerPlanningSimulation

# 4. 运行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 11.3 手动 Docker 部署步骤

#### 11.3.1 安装 Docker（Rocky Linux 9.x）

```bash
# 移除旧版本
dnf remove -y docker docker-client docker-client-latest \
    docker-common docker-latest docker-latest-logrotate \
    docker-logrotate docker-engine

# 安装依赖
dnf install -y dnf-plugins-core

# 添加 Docker 仓库
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
docker compose version
```

#### 11.3.2 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
nano .env
```

**.env 配置示例：**

```env
# MySQL 配置
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=career_planning
MYSQL_USER=career_user
MYSQL_PASSWORD=your_secure_user_password

# JWT 配置
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# CORS 配置（部署后修改为实际域名）
CORS_ORIGIN=http://localhost,http://your-server-ip

# 时区
TZ=Asia/Shanghai
```

#### 11.3.3 构建并启动

```bash
# 构建镜像
docker compose build

# 启动所有服务（后台运行）
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 11.4 Docker 常用命令

```bash
# 服务管理
docker compose up -d          # 启动服务
docker compose down           # 停止服务
docker compose restart        # 重启所有服务
docker compose restart backend  # 重启单个服务

# 日志查看
docker compose logs -f        # 查看所有日志
docker compose logs -f backend  # 查看后端日志
docker compose logs -f mysql    # 查看数据库日志

# 进入容器
docker compose exec backend sh   # 进入后端容器
docker compose exec mysql mysql -u root -p  # 进入 MySQL

# 更新部署
docker compose down
git pull origin main
docker compose up -d --build

# 清理
docker compose down -v        # 停止并删除数据卷（慎用！会删除数据）
docker system prune -a        # 清理未使用的镜像和缓存
```

### 11.5 数据持久化

Docker 数据卷位置：

```bash
# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect careerplanningsimulation_mysql_data
docker volume inspect careerplanningsimulation_backend_uploads

# 备份数据库
docker compose exec mysql mysqldump -u root -p career_planning > backup.sql

# 恢复数据库
docker compose exec -T mysql mysql -u root -p career_planning < backup.sql
```

### 11.6 资源限制（2G 内存优化）

`docker-compose.yml` 已针对 2核2G 服务器优化：

| 服务 | 内存限制 | 内存预留 |
|------|---------|---------|
| MySQL | 512MB | 256MB |
| Backend | 512MB | 256MB |
| Frontend (Nginx) | 128MB | 64MB |

如需调整，编辑 `docker-compose.yml` 中的 `deploy.resources` 配置。

### 11.7 健康检查

所有服务都配置了健康检查：

```bash
# 查看服务健康状态
docker compose ps

# 检查后端 API
curl http://localhost:5000/api/health

# 检查前端
curl http://localhost/
```

### 11.8 故障排查

| 问题 | 排查命令 | 可能原因 |
|------|----------|----------|
| 服务启动失败 | `docker compose logs <service>` | 配置错误或端口冲突 |
| 数据库连接失败 | `docker compose logs backend` | MySQL 未就绪或密码错误 |
| 前端无法访问 API | `docker compose exec frontend cat /etc/nginx/conf.d/default.conf` | Nginx 代理配置问题 |
| 内存不足 | `docker stats` | 调整资源限制或增加 swap |

---

## 十二、两种部署方式对比

| 特性 | 传统部署 (PM2 + Nginx) | Docker 部署 |
|------|----------------------|-------------|
| 部署复杂度 | 较高（需手动配置各组件） | 低（一键脚本） |
| 环境一致性 | 依赖服务器环境 | 完全隔离，环境一致 |
| 资源开销 | 较低 | 略高（容器开销） |
| 迁移便捷性 | 需重新配置 | 打包即可迁移 |
| 适用场景 | 有运维经验的团队 | 快速部署、CI/CD |
| 推荐配置 | 4G+ 内存 | 2G+ 内存 |

**推荐**：对于 2核2G 的 Rocky Linux 服务器，推荐使用 **Docker 部署**，可实现快速部署和简化运维。

---

**文档版本**: 1.1
**最后更新**: 2025年12月
**适用版本**: CareerPlanningSimulation v1.x
