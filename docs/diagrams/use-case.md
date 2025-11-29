# 用例图 - 沉浸式大学模拟规划平台

## 1. 系统总体用例图

```mermaid
graph TB
    subgraph 系统边界
        UC1((登录注册))
        UC2((游戏体验))
        UC3((创意工坊))
        UC4((个人中心))
        UC5((系统管理))
    end

    User[普通用户] --> UC1
    User --> UC2
    User --> UC3
    User --> UC4

    Admin[管理员] --> UC5
    Admin --> UC1
```

## 2. 用户认证用例

```mermaid
graph LR
    subgraph 用户认证
        UC1((学号登录))
        UC2((用户注册))
        UC3((密码重置))
        UC4((退出登录))
    end

    User[普通用户] --> UC1
    User --> UC2
    User --> UC3
    User --> UC4

    UC1 -.->|include| UC5((验证学号格式))
    UC2 -.->|include| UC5
    UC2 -.->|include| UC6((创建用户档案))
```

## 3. 游戏体验用例

```mermaid
graph TB
    subgraph 游戏体验
        UC1((查看校园地图))
        UC2((选择场景))
        UC3((体验剧本))
        UC4((做出选择))
        UC5((查看属性变化))
        UC6((解锁徽章))
        UC7((毕业结算))
        UC8((管理存档))
    end

    User[普通用户] --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8

    UC2 -.->|include| UC1
    UC3 -.->|include| UC2
    UC4 -.->|include| UC3
    UC5 -.->|extend| UC4
    UC6 -.->|extend| UC4

    subgraph 存档管理
        UC8_1((创建存档))
        UC8_2((切换存档))
        UC8_3((删除存档))
    end

    UC8 --> UC8_1
    UC8 --> UC8_2
    UC8 --> UC8_3
```

## 4. 创意工坊用例

```mermaid
graph TB
    subgraph 创意工坊
        UC1((浏览剧本链))
        UC2((创建剧本链))
        UC3((编辑剧本链))
        UC4((删除剧本链))
        UC5((导入游戏))
        UC6((取消导入))
    end

    User[普通用户] --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    subgraph 剧本编辑
        UC3_1((添加剧本节点))
        UC3_2((编辑节点内容))
        UC3_3((配置选项))
        UC3_4((设置属性变化))
        UC3_5((连接节点))
        UC3_6((设置入口点))
        UC3_7((删除节点))
    end

    UC3 --> UC3_1
    UC3 --> UC3_2
    UC3 --> UC3_3
    UC3 --> UC3_4
    UC3 --> UC3_5
    UC3 --> UC3_6
    UC3 --> UC3_7

    UC5 -.->|include| UC7((验证剧本完整性))
```

## 5. 个人中心用例

```mermaid
graph TB
    subgraph 个人中心
        UC1((查看个人资料))
        UC2((修改密码))
        UC3((查看成就徽章))
        UC4((查看游戏记录))
        UC5((管理积分))
    end

    User[普通用户] --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
```

## 6. 管理后台用例

```mermaid
graph TB
    subgraph 管理后台
        UC1((管理员登录))
        UC2((用户管理))
        UC3((剧本管理))
        UC4((公告管理))
        UC5((系统设置))
        UC6((查看日志))
    end

    Admin[管理员] --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6

    subgraph 用户管理详情
        UC2_1((查看用户列表))
        UC2_2((封禁用户))
        UC2_3((解封用户))
        UC2_4((分配积分))
        UC2_5((查看用户详情))
    end

    UC2 --> UC2_1
    UC2 --> UC2_2
    UC2 --> UC2_3
    UC2 --> UC2_4
    UC2 --> UC2_5

    subgraph 剧本管理详情
        UC3_1((查看剧本列表))
        UC3_2((创建系统剧本))
        UC3_3((编辑剧本))
        UC3_4((删除剧本))
        UC3_5((审核UGC剧本))
    end

    UC3 --> UC3_1
    UC3 --> UC3_2
    UC3 --> UC3_3
    UC3 --> UC3_4
    UC3 --> UC3_5

    subgraph 公告管理详情
        UC4_1((发布公告))
        UC4_2((编辑公告))
        UC4_3((删除公告))
    end

    UC4 --> UC4_1
    UC4 --> UC4_2
    UC4 --> UC4_3

    SuperAdmin[超级管理员] --> UC7((管理员账号管理))
    UC7 --> UC7_1((创建管理员))
    UC7 --> UC7_2((修改权限))
    UC7 --> UC7_3((删除管理员))
```

## 7. 用例说明表

| 用例编号 | 用例名称 | 参与者 | 前置条件 | 后置条件 |
|---------|---------|--------|---------|---------|
| UC-001 | 学号登录 | 普通用户 | 用户已注册 | 用户进入系统首页 |
| UC-002 | 用户注册 | 普通用户 | 无 | 创建用户账号 |
| UC-003 | 查看校园地图 | 普通用户 | 用户已登录 | 显示9个场景入口 |
| UC-004 | 体验剧本 | 普通用户 | 选择了场景 | 完成剧本流程 |
| UC-005 | 做出选择 | 普通用户 | 正在体验剧本 | 属性值变化 |
| UC-006 | 解锁徽章 | 普通用户 | 满足解锁条件 | 获得新徽章 |
| UC-007 | 毕业结算 | 普通用户 | 达到结算条件 | 生成毕业报告 |
| UC-008 | 创建剧本链 | 普通用户 | 用户已登录 | 创建新剧本链 |
| UC-009 | 编辑剧本链 | 普通用户 | 拥有剧本链 | 更新剧本内容 |
| UC-010 | 导入游戏 | 普通用户 | 剧本链完整 | 剧本可在游戏中体验 |
| UC-011 | 管理员登录 | 管理员 | 拥有管理员账号 | 进入管理后台 |
| UC-012 | 用户管理 | 管理员 | 管理员已登录 | 管理用户账号 |
| UC-013 | 剧本管理 | 管理员 | 管理员已登录 | 管理系统剧本 |
| UC-014 | 公告管理 | 管理员 | 管理员已登录 | 发布/管理公告 |
