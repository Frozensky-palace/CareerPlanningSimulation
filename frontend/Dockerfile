# 前端 Dockerfile
# 多阶段构建：构建 Vue 应用 + Nginx 提供静态服务

# ============================================
# 构建阶段
# ============================================
FROM node:18-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建参数（可在构建时传入）
ARG VITE_API_URL=/api
ARG VITE_UPLOAD_URL=

# 设置环境变量用于构建
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_UPLOAD_URL=${VITE_UPLOAD_URL}

# 构建生产版本
RUN pnpm build

# ============================================
# 生产阶段 - Nginx
# ============================================
FROM nginx:alpine AS production

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制静态文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建非 root 用户运行 nginx（可选，需要额外配置）
# RUN chown -R nginx:nginx /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
