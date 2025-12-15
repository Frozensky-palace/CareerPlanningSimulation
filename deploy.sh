#!/bin/bash
# ============================================
# 易班·大学生涯数字孪生平台 - 一键部署脚本
# 支持系统: Debian/Ubuntu, Rocky Linux/CentOS
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 系统类型检测
OS_TYPE=""
detect_os() {
    if [[ -f /etc/debian_version ]]; then
        OS_TYPE="debian"
    elif [[ -f /etc/redhat-release ]] || [[ -f /etc/rocky-release ]]; then
        OS_TYPE="rhel"
    else
        OS_TYPE="unknown"
    fi
}

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "此脚本需要 root 权限运行"
        print_info "请使用: sudo ./deploy.sh"
        exit 1
    fi
}

# 检查系统要求
check_system() {
    print_info "检查系统环境..."

    # 检测操作系统类型
    detect_os

    # 检查操作系统
    if [[ "$OS_TYPE" == "debian" ]]; then
        print_success "检测到 Debian/Ubuntu 系统"
    elif [[ "$OS_TYPE" == "rhel" ]]; then
        print_success "检测到 Rocky Linux/CentOS 系统"
    else
        print_warning "未知系统类型，脚本可能需要调整"
    fi

    # 检查内存
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [[ $TOTAL_MEM -lt 1800 ]]; then
        print_warning "内存小于 2G，可能影响性能"
    else
        print_success "内存检查通过: ${TOTAL_MEM}MB"
    fi

    # 检查磁盘空间
    DISK_AVAIL=$(df -m / | awk 'NR==2 {print $4}')
    if [[ $DISK_AVAIL -lt 5000 ]]; then
        print_warning "磁盘可用空间小于 5G，建议清理"
    else
        print_success "磁盘空间检查通过: ${DISK_AVAIL}MB 可用"
    fi
}

# 安装 Docker
install_docker() {
    print_info "检查 Docker 安装状态..."

    if command -v docker &> /dev/null; then
        print_success "Docker 已安装: $(docker --version)"
    else
        print_info "安装 Docker..."

        if [[ "$OS_TYPE" == "debian" ]]; then
            # Debian/Ubuntu 安装方式
            # 移除旧版本
            apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

            # 更新包索引并安装依赖
            apt-get update
            apt-get install -y ca-certificates curl gnupg

            # 添加 Docker 官方 GPG 密钥
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            chmod a+r /etc/apt/keyrings/docker.gpg

            # 设置仓库
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
              $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
              tee /etc/apt/sources.list.d/docker.list > /dev/null

            # 安装 Docker
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        elif [[ "$OS_TYPE" == "rhel" ]]; then
            # Rocky Linux/CentOS 安装方式
            # 移除旧版本
            dnf remove -y docker docker-client docker-client-latest \
                docker-common docker-latest docker-latest-logrotate \
                docker-logrotate docker-engine 2>/dev/null || true

            # 安装依赖
            dnf install -y dnf-plugins-core

            # 添加 Docker 仓库
            dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

            # 安装 Docker
            dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        else
            print_error "不支持的操作系统，请手动安装 Docker"
            exit 1
        fi

        # 启动 Docker
        systemctl start docker
        systemctl enable docker

        print_success "Docker 安装完成"
    fi
}

# 安装 Docker Compose
install_docker_compose() {
    print_info "检查 Docker Compose..."

    if docker compose version &> /dev/null; then
        print_success "Docker Compose 已安装: $(docker compose version)"
    else
        print_error "Docker Compose 未安装"
        exit 1
    fi
}

# 检查端口占用
check_ports() {
    print_info "检查端口占用情况..."

    PORTS_IN_USE=""

    for PORT in 80 3306 5000; do
        if ss -tlnp | grep -q ":$PORT "; then
            PORTS_IN_USE="$PORTS_IN_USE $PORT"
            print_warning "端口 $PORT 已被占用："
            ss -tlnp | grep ":$PORT "
        fi
    done

    if [[ -n "$PORTS_IN_USE" ]]; then
        echo ""
        print_warning "以下端口已被占用:$PORTS_IN_USE"
        echo ""
        echo "请选择操作："
        echo "  1) 停止占用这些端口的服务后继续"
        echo "  2) 修改 docker-compose.yml 使用其他端口"
        echo "  3) 继续部署（可能会失败）"
        echo "  4) 退出"
        read -p "请选择 (1-4): " -n 1 -r
        echo

        case $REPLY in
            1)
                print_info "请手动停止相关服务后重新运行脚本"
                echo "常用命令："
                echo "  systemctl stop nginx      # 停止 Nginx"
                echo "  systemctl stop mysql      # 停止 MySQL"
                echo "  docker compose down       # 停止其他 Docker 项目"
                exit 0
                ;;
            2)
                print_info "请编辑 docker-compose.yml 修改端口映射后重新运行脚本"
                exit 0
                ;;
            3)
                print_warning "继续部署，端口冲突可能导致服务启动失败"
                ;;
            *)
                print_info "退出部署"
                exit 0
                ;;
        esac
    else
        print_success "端口检查通过 (80, 3306, 5000 均可用)"
    fi
}

# 配置防火墙
configure_firewall() {
    print_info "配置防火墙..."

    if [[ "$OS_TYPE" == "debian" ]]; then
        # Debian/Ubuntu 使用 ufw
        if command -v ufw &> /dev/null; then
            ufw allow 80/tcp
            ufw allow 443/tcp
            print_success "UFW 防火墙配置完成"
        else
            print_warning "UFW 未安装，跳过防火墙配置"
        fi
    elif [[ "$OS_TYPE" == "rhel" ]]; then
        # Rocky Linux/CentOS 使用 firewalld
        if systemctl is-active --quiet firewalld; then
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --permanent --add-port=80/tcp
            firewall-cmd --permanent --add-port=443/tcp
            firewall-cmd --reload
            print_success "Firewalld 防火墙配置完成"
        else
            print_warning "firewalld 未运行，跳过防火墙配置"
        fi
    else
        print_warning "未知系统，跳过防火墙配置"
    fi
}

# 创建环境配置文件
create_env_file() {
    print_info "检查环境配置..."

    if [[ -f .env ]]; then
        print_warning ".env 文件已存在"
        read -p "是否覆盖？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "保留现有 .env 文件"
            return
        fi
    fi

    print_info "创建 .env 配置文件..."

    # 生成随机密码
    MYSQL_ROOT_PWD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
    MYSQL_USER_PWD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
    JWT_SECRET_KEY=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)

    cat > .env << EOF
# ============================================
# 易班·大学生涯数字孪生平台 - 生产环境配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# ============================================

# MySQL 配置
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PWD}
MYSQL_DATABASE=career_planning
MYSQL_USER=career_user
MYSQL_PASSWORD=${MYSQL_USER_PWD}

# JWT 密钥（请妥善保管）
JWT_SECRET=${JWT_SECRET_KEY}

# CORS 配置（多个域名用逗号分隔）
# 部署后请修改为实际域名
CORS_ORIGIN=http://localhost,http://127.0.0.1

# 时区
TZ=Asia/Shanghai
EOF

    chmod 600 .env
    print_success ".env 文件创建完成"
    print_warning "请妥善保管 .env 文件中的密码信息！"

    echo ""
    echo "================================================"
    echo "  数据库密码信息（请保存）"
    echo "================================================"
    echo "MySQL Root 密码: ${MYSQL_ROOT_PWD}"
    echo "MySQL 用户密码: ${MYSQL_USER_PWD}"
    echo "JWT 密钥: ${JWT_SECRET_KEY}"
    echo "================================================"
    echo ""
}

# 创建必要目录
create_directories() {
    print_info "创建必要目录..."

    mkdir -p docker/mysql/init
    mkdir -p logs

    print_success "目录创建完成"
}

# 构建并启动服务
deploy_services() {
    print_info "构建 Docker 镜像..."
    docker compose build --no-cache

    print_info "启动服务..."
    docker compose up -d

    print_info "等待服务启动..."
    sleep 10

    # 检查服务状态
    print_info "检查服务状态..."
    docker compose ps
}

# 初始化数据库
init_database() {
    print_info "等待数据库就绪..."

    MAX_RETRIES=30
    RETRY_COUNT=0

    while ! docker compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [[ $RETRY_COUNT -ge $MAX_RETRIES ]]; then
            print_error "数据库启动超时"
            exit 1
        fi
        print_info "等待数据库启动... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done

    print_success "数据库已就绪"

    # 检查是否需要初始化种子数据
    read -p "是否初始化种子数据？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "运行数据库种子..."
        docker compose exec backend npm run seed 2>/dev/null || \
            docker compose exec backend node dist/scripts/seed.js 2>/dev/null || \
            print_warning "种子脚本未找到或执行失败，请手动初始化数据"
    fi
}

# 配置系统优化（针对 2G 内存）
optimize_system() {
    print_info "优化系统配置（针对低内存服务器）..."

    # 检查现有 swap
    CURRENT_SWAP=$(swapon --show --noheadings 2>/dev/null | wc -l)
    if [[ $CURRENT_SWAP -gt 0 ]]; then
        print_info "检测到已有 Swap 配置："
        swapon --show
        print_success "跳过 Swap 创建"
    elif [[ -f /swapfile ]]; then
        print_info "发现 /swapfile 但未启用，尝试启用..."
        swapon /swapfile 2>/dev/null || print_warning "启用失败，可能需要手动检查"
    else
        read -p "是否创建 2G swap 文件？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "创建 2G swap 文件..."
            dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
            print_success "Swap 配置完成"
        fi
    fi

    # 调整 swappiness（仅当未设置时）
    CURRENT_SWAPPINESS=$(cat /proc/sys/vm/swappiness)
    if [[ $CURRENT_SWAPPINESS -gt 30 ]]; then
        sysctl vm.swappiness=10
        grep -q 'vm.swappiness' /etc/sysctl.d/99-swappiness.conf 2>/dev/null || \
            echo 'vm.swappiness=10' >> /etc/sysctl.d/99-swappiness.conf
        print_success "Swappiness 已调整为 10"
    else
        print_info "Swappiness 已为 $CURRENT_SWAPPINESS，无需调整"
    fi
}

# 显示部署信息
show_info() {
    echo ""
    echo "================================================"
    echo "  部署完成！"
    echo "================================================"
    echo ""
    echo "访问地址: http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "常用命令："
    echo "  查看服务状态:  docker compose ps"
    echo "  查看日志:      docker compose logs -f"
    echo "  停止服务:      docker compose down"
    echo "  重启服务:      docker compose restart"
    echo "  更新并重启:    docker compose up -d --build"
    echo ""
    echo "数据目录："
    echo "  MySQL 数据:    docker volume inspect career-planning_mysql_data"
    echo "  上传文件:      docker volume inspect career-planning_backend_uploads"
    echo ""
    print_warning "请确保修改 .env 中的 CORS_ORIGIN 为实际域名！"
    echo "================================================"
}

# 主函数
main() {
    echo ""
    echo "================================================"
    echo "  易班·大学生涯数字孪生平台 - 自动部署脚本"
    echo "  支持: Debian/Ubuntu, Rocky Linux/CentOS"
    echo "================================================"
    echo ""

    check_root
    check_system
    install_docker
    install_docker_compose
    check_ports
    configure_firewall
    create_directories
    create_env_file
    optimize_system
    deploy_services
    init_database
    show_info
}

# 运行主函数
main "$@"
