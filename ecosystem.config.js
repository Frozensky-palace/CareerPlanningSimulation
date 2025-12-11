/**
 * PM2 生态系统配置文件
 *
 * 使用方法:
 * - 启动: pm2 start ecosystem.config.js --env production
 * - 重启: pm2 restart career-planning-api
 * - 停止: pm2 stop career-planning-api
 * - 查看日志: pm2 logs career-planning-api
 * - 监控: pm2 monit
 */
module.exports = {
  apps: [
    {
      name: 'career-planning-api',
      script: './dist/index.js',
      cwd: './backend',

      // 实例数量 (max = CPU核心数)
      instances: 'max',
      exec_mode: 'cluster',

      // 自动重启配置
      watch: false,
      max_memory_restart: '500M',

      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,

      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
}
