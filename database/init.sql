-- ============================================
-- 易班·大学生涯数字孪生平台 - 数据库初始化脚本
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS career_planning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE career_planning;

-- ============================================
-- 1. 用户相关表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
    email VARCHAR(100) COMMENT '邮箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 用户存档表（支持多存档）
CREATE TABLE IF NOT EXISTS user_saves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    save_name VARCHAR(100) DEFAULT '存档1' COMMENT '存档名称',
    current_semester TINYINT DEFAULT 1 COMMENT '当前学期（1-8）',
    current_phase ENUM('开学', '期中', '期末') DEFAULT '开学' COMMENT '当前阶段',
    remaining_events INT DEFAULT 10 COMMENT '当前阶段剩余可完成事件数',
    德 INT DEFAULT 50 COMMENT '德育数值',
    智 INT DEFAULT 50 COMMENT '智育数值',
    体 INT DEFAULT 50 COMMENT '体育数值',
    美 INT DEFAULT 50 COMMENT '美育数值',
    劳 INT DEFAULT 50 COMMENT '劳育数值',
    avatar_config JSON COMMENT '形象配置 {"hair": "style1", "clothes": "outfit2", "accessory": "item3"}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户存档表';

-- 勋章表
CREATE TABLE IF NOT EXISTS badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '勋章名称',
    description TEXT COMMENT '勋章描述',
    icon_url VARCHAR(255) COMMENT '图标URL',
    unlock_condition JSON COMMENT '解锁条件 {"type": "value", "target": "智", "threshold": 80}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='勋章表';

-- 用户勋章关联表
CREATE TABLE IF NOT EXISTS user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    save_id INT NOT NULL COMMENT '存档ID',
    badge_id INT NOT NULL COMMENT '勋章ID',
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
    FOREIGN KEY (save_id) REFERENCES user_saves(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY uk_save_badge (save_id, badge_id),
    INDEX idx_save_id (save_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户勋章关联表';

-- 历史记录表（学期结算数据）
CREATE TABLE IF NOT EXISTS semester_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    save_id INT NOT NULL COMMENT '存档ID',
    semester TINYINT NOT NULL COMMENT '学期',
    phase ENUM('期中', '期末') NOT NULL COMMENT '结算阶段',
    德_change INT DEFAULT 0 COMMENT '德育变化',
    智_change INT DEFAULT 0 COMMENT '智育变化',
    体_change INT DEFAULT 0 COMMENT '体育变化',
    美_change INT DEFAULT 0 COMMENT '美育变化',
    劳_change INT DEFAULT 0 COMMENT '劳育变化',
    evaluation TEXT COMMENT '自动生成的评价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (save_id) REFERENCES user_saves(id) ON DELETE CASCADE,
    INDEX idx_save_id (save_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学期结算记录表';

-- ============================================
-- 2. 事件剧本相关表
-- ============================================

-- 官方/UGC剧本主表
CREATE TABLE IF NOT EXISTS scripts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '剧本标题',
    type ENUM('main', 'branch', 'special') NOT NULL COMMENT '类型：主线/支线/特殊',
    source ENUM('official', 'user') DEFAULT 'official' COMMENT '来源：官方/用户',
    author_id INT COMMENT '创作者ID（UGC剧本）',
    scene VARCHAR(100) COMMENT '场景名称（教学楼、操场等）',
    trigger_phase VARCHAR(50) COMMENT '触发阶段（开学/期中/期末）',
    unlock_condition JSON COMMENT '前置条件 {"type": "event", "event_id": 5}',
    description TEXT COMMENT '剧本描述',
    cover_image VARCHAR(255) COMMENT '封面图片',
    status ENUM('draft', 'published', 'reviewed') DEFAULT 'published' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_scene (scene),
    INDEX idx_trigger_phase (trigger_phase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本主表';

-- 剧本节点表（支持分支树）
CREATE TABLE IF NOT EXISTS script_nodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    script_id INT NOT NULL COMMENT '剧本ID',
    parent_node_id INT COMMENT '父节点ID（NULL表示根节点）',
    content TEXT NOT NULL COMMENT '剧本文本内容',
    background_image VARCHAR(255) COMMENT '背景图片',
    node_order INT DEFAULT 0 COMMENT '节点顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_node_id) REFERENCES script_nodes(id) ON DELETE CASCADE,
    INDEX idx_script_id (script_id),
    INDEX idx_parent_node_id (parent_node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本节点表';

-- 剧本选项表
CREATE TABLE IF NOT EXISTS script_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    node_id INT NOT NULL COMMENT '节点ID',
    option_text VARCHAR(500) NOT NULL COMMENT '选项文本',
    德_change INT DEFAULT 0 COMMENT '德育变化',
    智_change INT DEFAULT 0 COMMENT '智育变化',
    体_change INT DEFAULT 0 COMMENT '体育变化',
    美_change INT DEFAULT 0 COMMENT '美育变化',
    劳_change INT DEFAULT 0 COMMENT '劳育变化',
    feedback_text VARCHAR(500) COMMENT '选择后的反馈文本',
    next_node_id INT COMMENT '指向下一个节点（NULL表示事件结束）',
    unlock_script_id INT COMMENT '解锁的后续剧本ID',
    option_order INT DEFAULT 0 COMMENT '选项顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (node_id) REFERENCES script_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (next_node_id) REFERENCES script_nodes(id) ON DELETE SET NULL,
    FOREIGN KEY (unlock_script_id) REFERENCES scripts(id) ON DELETE SET NULL,
    INDEX idx_node_id (node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本选项表';

-- 用户剧本进度表
CREATE TABLE IF NOT EXISTS user_script_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    save_id INT NOT NULL COMMENT '存档ID',
    script_id INT NOT NULL COMMENT '剧本ID',
    current_node_id INT COMMENT '当前节点ID',
    completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    choices_made JSON COMMENT '记录用户选择路径',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (save_id) REFERENCES user_saves(id) ON DELETE CASCADE,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    INDEX idx_save_script (save_id, script_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户剧本进度表';

-- ============================================
-- 3. 形象素材配置表
-- ============================================

-- 形象部件库（发型、服装、配饰）
CREATE TABLE IF NOT EXISTS avatar_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('hair', 'clothes', 'accessory') NOT NULL COMMENT '类别',
    name VARCHAR(100) NOT NULL COMMENT '部件名称',
    image_url VARCHAR(255) NOT NULL COMMENT '图层图片路径',
    unlock_condition JSON COMMENT '解锁条件 {"type": "value", "target": "美", "min": 70}',
    z_index INT DEFAULT 0 COMMENT '图层层级',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='形象部件库';

-- 形象变化节点配置
CREATE TABLE IF NOT EXISTS avatar_thresholds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    德_min INT COMMENT '德育最小值',
    智_min INT COMMENT '智育最小值',
    体_min INT COMMENT '体育最小值',
    美_min INT COMMENT '美育最小值',
    劳_min INT COMMENT '劳育最小值',
    hair_part_id INT COMMENT '发型部件ID',
    clothes_part_id INT COMMENT '服装部件ID',
    accessory_part_id INT COMMENT '配饰部件ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (hair_part_id) REFERENCES avatar_parts(id) ON DELETE SET NULL,
    FOREIGN KEY (clothes_part_id) REFERENCES avatar_parts(id) ON DELETE SET NULL,
    FOREIGN KEY (accessory_part_id) REFERENCES avatar_parts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='形象变化节点配置';

-- ============================================
-- 4. 初始化测试数据
-- ============================================

-- 插入勋章数据
INSERT INTO badges (name, description, icon_url, unlock_condition) VALUES
('学霸之路', '智育数值达到80', '/badges/xueba.png', '{"type": "value", "target": "智", "threshold": 80}'),
('运动达人', '体育数值达到80', '/badges/sports.png', '{"type": "value", "target": "体", "threshold": 80}'),
('艺术之星', '美育数值达到80', '/badges/art.png', '{"type": "value", "target": "美", "threshold": 80}'),
('劳动模范', '劳育数值达到80', '/badges/labor.png', '{"type": "value", "target": "劳", "threshold": 80}'),
('德才兼备', '德育数值达到80', '/badges/moral.png', '{"type": "value", "target": "德", "threshold": 80}');

-- 插入形象部件数据
INSERT INTO avatar_parts (category, name, image_url, unlock_condition, z_index) VALUES
('hair', '短发', '/avatar/hair/short.png', NULL, 3),
('hair', '长发', '/avatar/hair/long.png', '{"type": "value", "target": "美", "min": 60}', 3),
('hair', '运动发型', '/avatar/hair/sport.png', '{"type": "value", "target": "体", "min": 60}', 3),
('clothes', '校服', '/avatar/clothes/school.png', NULL, 2),
('clothes', '运动服', '/avatar/clothes/sport.png', '{"type": "value", "target": "体", "min": 50}', 2),
('clothes', '正装', '/avatar/clothes/formal.png', '{"type": "value", "target": "智", "min": 70}', 2),
('accessory', '眼镜', '/avatar/accessory/glasses.png', '{"type": "value", "target": "智", "min": 60}', 4),
('accessory', '耳机', '/avatar/accessory/headphone.png', NULL, 4),
('accessory', '徽章', '/avatar/accessory/badge.png', '{"type": "value", "target": "德", "min": 70}', 4);

-- 插入形象阈值配置
INSERT INTO avatar_thresholds (德_min, 智_min, 体_min, 美_min, 劳_min, hair_part_id, clothes_part_id, accessory_part_id) VALUES
(0, 0, 0, 0, 0, 1, 4, 8),
(50, 60, 40, 50, 40, 1, 4, 7),
(60, 70, 50, 60, 50, 2, 6, 7),
(70, 80, 60, 70, 60, 2, 6, 9);

-- 插入测试剧本（军训）
INSERT INTO scripts (title, type, source, scene, trigger_phase, description, status) VALUES
('新生军训', 'main', 'official', '操场', '开学', '大学的第一课，让我们来体验军训的酸甜苦辣', 'published');

SET @script_id = LAST_INSERT_ID();

-- 军训剧本节点1（根节点）
INSERT INTO script_nodes (script_id, parent_node_id, content, node_order) VALUES
(@script_id, NULL, '九月的阳光下，你站在操场上，教官正在进行队列训练。汗水不断从额头滑落，你感到有些疲惫...', 1);

SET @node1_id = LAST_INSERT_ID();

-- 军训剧本选项
INSERT INTO script_options (node_id, option_text, 德_change, 智_change, 体_change, 美_change, 劳_change, feedback_text, option_order) VALUES
(@node1_id, '咬牙坚持，认真完成每一个动作', 5, 0, 8, 0, 3, '体+8！你的坚持得到了教官的表扬，身体素质也有所提升', 1),
(@node1_id, '偷偷休息，保存体力', 0, 5, 2, 0, 0, '智+5，体+2。你学会了合理分配体力，但错过了锻炼的机会', 2),
(@node1_id, '主动帮助身边的同学', 8, 0, 5, 0, 5, '德+8，体+5，劳+5！你的热心帮助赢得了同学们的好感', 3);

-- 插入测试剧本（选课）
INSERT INTO scripts (title, type, source, scene, trigger_phase, description, status) VALUES
('第一次选课', 'main', 'official', '教学楼', '开学', '选课系统开放了，该如何规划自己的课程呢？', 'published');

SET @script2_id = LAST_INSERT_ID();

INSERT INTO script_nodes (script_id, parent_node_id, content, node_order) VALUES
(@script2_id, NULL, '选课系统刚刚开放，你打开电脑查看可选课程列表。有专业必修课、通识课、体育课等多种选择...', 1);

SET @node2_id = LAST_INSERT_ID();

INSERT INTO script_options (node_id, option_text, 德_change, 智_change, 体_change, 美_change, 劳_change, feedback_text, option_order) VALUES
(@node2_id, '优先选择高学分的专业课', 0, 10, 0, 0, 0, '智+10！你选择了充实的课程表，为学业打下基础', 1),
(@node2_id, '平衡选择，兼顾兴趣和学分', 3, 5, 3, 5, 0, '德+3，智+5，体+3，美+5。你获得了全面发展的机会', 2),
(@node2_id, '选择轻松的课程，给自己留出时间', 0, 3, 5, 5, 0, '智+3，体+5，美+5。你有更多时间发展其他兴趣', 3);

-- 插入支线剧本（图书馆自习）
INSERT INTO scripts (title, type, source, scene, trigger_phase, description, status) VALUES
('图书馆自习', 'branch', 'official', '图书馆', '开学', '周末的图书馆里，是学习的好地方', 'published');

SET @script3_id = LAST_INSERT_ID();

INSERT INTO script_nodes (script_id, parent_node_id, content, node_order) VALUES
(@script3_id, NULL, '周末的图书馆人不多，阳光透过窗户洒在书桌上。你带着作业来到自习室...', 1);

SET @node3_id = LAST_INSERT_ID();

INSERT INTO script_options (node_id, option_text, 德_change, 智_change, 体_change, 美_change, 劳_change, feedback_text, option_order) VALUES
(@node3_id, '专心学习3小时，完成所有作业', 0, 12, -2, 0, 0, '智+12，体-2。你高效完成了作业，但感到有些疲惫', 1),
(@node3_id, '学习1小时后去借阅感兴趣的书', 0, 5, 0, 8, 0, '智+5，美+8。你在阅读中获得了知识和乐趣', 2);

-- ============================================
-- 完成！
-- ============================================
