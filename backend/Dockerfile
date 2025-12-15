# 后端 Dockerfile
# 多阶段构建，减少最终镜像大小

# ============================================
# 构建阶段
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# ============================================
# 生产阶段
# ============================================
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 复制依赖文件
COPY package.json ./

# 只安装生产依赖
RUN npm install --omit=dev

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 创建上传目录
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# 启动命令
CMD ["node", "dist/index.js"]
