-- ============================================
-- 易班·大学生涯数字孪生平台 - 数据库初始化脚本
-- ============================================
--
-- 注意：此脚本只创建数据库
-- 表结构由后端 Sequelize 自动创建和同步
-- 种子数据（剧本、勋章、管理员账户等）由后端启动时自动插入
--
-- 使用方法：
--   mysql -u root -p < database/init.sql
--
-- 或者直接执行：
--   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS career_planning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
--
-- ============================================

CREATE DATABASE IF NOT EXISTS career_planning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
