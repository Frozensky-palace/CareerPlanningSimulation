# 类图 - 沉浸式大学模拟规划平台

## 1. 核心领域模型类图

```mermaid
classDiagram
    class User {
        +int id
        +string studentId
        +string password
        +string nickname
        +string avatar
        +string role
        +int credits
        +boolean isActive
        +Date createdAt
        +Date updatedAt
        +validatePassword(password) boolean
    }

    class Save {
        +int id
        +int userId
        +string name
        +int slotIndex
        +Attributes attributes
        +int currentScriptId
        +int[] unlockedBadges
        +boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Attributes {
        +int de
        +int zhi
        +int ti
        +int mei
        +int lao
    }

    class Script {
        +int id
        +string title
        +string content
        +string[] contents
        +string backgroundImage
        +string location
        +ScriptOption[] options
        +boolean isSystem
        +int authorId
        +Date createdAt
        +Date updatedAt
    }

    class ScriptOption {
        +int id
        +string text
        +AttributeChange attributeChanges
        +int nextScriptId
    }

    class AttributeChange {
        +int de
        +int zhi
        +int ti
        +int mei
        +int lao
    }

    class Badge {
        +int id
        +string name
        +string description
        +string icon
        +string category
        +BadgeCondition condition
        +Date createdAt
    }

    class BadgeCondition {
        +string type
        +string attribute
        +int threshold
    }

    User "1" --> "*" Save : owns
    Save "1" --> "1" Attributes : has
    Save "*" --> "*" Badge : unlocked
    Script "1" --> "*" ScriptOption : contains
    ScriptOption "1" --> "1" AttributeChange : has
    ScriptOption "*" --> "0..1" Script : nextScript
```

## 2. 创意工坊类图

```mermaid
classDiagram
    class WorkshopChain {
        +int id
        +int userId
        +string title
        +string description
        +string coverImage
        +int rootScriptId
        +boolean isImported
        +Date createdAt
        +Date updatedAt
    }

    class WorkshopScript {
        +int id
        +int chainId
        +int userId
        +string title
        +string content
        +string[] contents
        +string backgroundImage
        +string location
        +WorkshopOption[] options
        +Position position
        +boolean isEntryPoint
        +Date createdAt
        +Date updatedAt
    }

    class WorkshopOption {
        +int id
        +string text
        +AttributeChange attributeChanges
        +int nextScriptId
    }

    class Position {
        +int x
        +int y
    }

    class User {
        +int id
        +string studentId
        +string nickname
    }

    User "1" --> "*" WorkshopChain : creates
    WorkshopChain "1" --> "*" WorkshopScript : contains
    WorkshopChain "1" --> "0..1" WorkshopScript : rootScript
    WorkshopScript "1" --> "*" WorkshopOption : has
    WorkshopScript "1" --> "1" Position : position
    WorkshopOption "*" --> "0..1" WorkshopScript : nextScript
```

## 3. 管理后台类图

```mermaid
classDiagram
    class Admin {
        +int id
        +string username
        +string password
        +string role
        +string nickname
        +boolean isActive
        +Date lastLoginAt
        +Date createdAt
        +Date updatedAt
        +validatePassword(password) boolean
    }

    class AdminLog {
        +int id
        +int adminId
        +string action
        +string targetType
        +int targetId
        +object details
        +string ip
        +Date createdAt
    }

    class SystemSetting {
        +int id
        +string key
        +string value
        +string description
        +Date updatedAt
    }

    class Announcement {
        +int id
        +string title
        +string content
        +boolean isPublished
        +int adminId
        +Date publishedAt
        +Date createdAt
        +Date updatedAt
    }

    Admin "1" --> "*" AdminLog : generates
    Admin "1" --> "*" Announcement : publishes
```

## 4. 服务层类图

```mermaid
classDiagram
    class AuthService {
        +login(studentId, password) TokenResponse
        +register(studentId, password, nickname) User
        +validateToken(token) User
        +changePassword(userId, oldPwd, newPwd) boolean
    }

    class GameService {
        +getSaves(userId) Save[]
        +createSave(userId, name, attributes) Save
        +updateSave(saveId, data) Save
        +deleteSave(saveId) boolean
        +getScript(scriptId) Script
        +makeChoice(saveId, optionId) ChoiceResult
        +checkBadges(save) Badge[]
    }

    class WorkshopService {
        +getChains(userId) WorkshopChain[]
        +createChain(userId, data) WorkshopChain
        +updateChain(chainId, data) WorkshopChain
        +deleteChain(chainId) boolean
        +getScripts(chainId) WorkshopScript[]
        +createScript(chainId, data) WorkshopScript
        +updateScript(scriptId, data) WorkshopScript
        +deleteScript(scriptId) boolean
        +importChain(chainId) boolean
        +unimportChain(chainId) boolean
    }

    class AdminService {
        +login(username, password) TokenResponse
        +getUsers(filters) User[]
        +updateUser(userId, data) User
        +banUser(userId) boolean
        +unbanUser(userId) boolean
        +allocateCredits(userId, amount) User
        +getScripts(filters) Script[]
        +createScript(data) Script
        +updateScript(scriptId, data) Script
        +deleteScript(scriptId) boolean
    }

    class TokenResponse {
        +string token
        +User user
    }

    class ChoiceResult {
        +Save updatedSave
        +AttributeChange changes
        +Badge[] newBadges
        +Script nextScript
    }

    AuthService --> User
    GameService --> Save
    GameService --> Script
    GameService --> Badge
    WorkshopService --> WorkshopChain
    WorkshopService --> WorkshopScript
    AdminService --> User
    AdminService --> Script
```

## 5. 前端组件类图

```mermaid
classDiagram
    class App {
        +RouterView router
        +setup()
    }

    class HomePage {
        +User currentUser
        +Announcement[] announcements
        +goToGame()
        +goToWorkshop()
        +goToProfile()
    }

    class CampusMap {
        +Save currentSave
        +Scene[] scenes
        +selectScene(location)
        +showScriptDialog()
    }

    class ScriptDetail {
        +Script currentScript
        +int contentIndex
        +showContent()
        +makeChoice(option)
        +showResult()
    }

    class WorkshopList {
        +WorkshopChain[] chains
        +loadChains()
        +createChain()
        +editChain(id)
        +deleteChain(id)
        +importChain(chain)
        +unimportChain(chain)
    }

    class WorkshopEditor {
        +WorkshopChain chain
        +WorkshopScript[] scripts
        +WorkshopScript selectedScript
        +VueFlowInstance vueFlow
        +loadChain()
        +addScript()
        +saveScript()
        +deleteScript()
        +connectNodes()
        +handleImport()
    }

    class SettlementPage {
        +Save finalSave
        +Badge[] badges
        +Report report
        +calculateResult()
        +generateReport()
    }

    App --> HomePage
    App --> CampusMap
    App --> ScriptDetail
    App --> WorkshopList
    App --> WorkshopEditor
    App --> SettlementPage
```

## 6. 数据库表关系图

```mermaid
erDiagram
    users ||--o{ saves : "has"
    users ||--o{ workshop_chains : "creates"
    users ||--o{ scripts : "authors"

    saves }o--o{ badges : "unlocks"
    saves }o--|| scripts : "current_script"

    scripts ||--o{ script_options : "contains"
    script_options }o--|| scripts : "next_script"

    workshop_chains ||--o{ workshop_scripts : "contains"
    workshop_chains }o--|| workshop_scripts : "root_script"
    workshop_scripts ||--o{ workshop_options : "contains"
    workshop_options }o--|| workshop_scripts : "next_script"

    admins ||--o{ admin_logs : "generates"
    admins ||--o{ announcements : "publishes"

    users {
        int id PK
        string student_id UK
        string password
        string nickname
        string avatar
        string role
        int credits
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    saves {
        int id PK
        int user_id FK
        string name
        int slot_index
        json attributes
        int current_script_id FK
        json unlocked_badges
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    scripts {
        int id PK
        string title
        text content
        json contents
        string background_image
        string location
        json options
        boolean is_system
        int author_id FK
        datetime created_at
        datetime updated_at
    }

    badges {
        int id PK
        string name
        string description
        string icon
        string category
        json condition
        datetime created_at
    }

    workshop_chains {
        int id PK
        int user_id FK
        string title
        string description
        string cover_image
        int root_script_id FK
        boolean is_imported
        datetime created_at
        datetime updated_at
    }

    workshop_scripts {
        int id PK
        int chain_id FK
        int user_id FK
        string title
        text content
        json contents
        string background_image
        string location
        json options
        json position
        boolean is_entry_point
        datetime created_at
        datetime updated_at
    }

    admins {
        int id PK
        string username UK
        string password
        string role
        string nickname
        boolean is_active
        datetime last_login_at
        datetime created_at
        datetime updated_at
    }

    admin_logs {
        int id PK
        int admin_id FK
        string action
        string target_type
        int target_id
        json details
        string ip
        datetime created_at
    }

    system_settings {
        int id PK
        string key UK
        string value
        string description
        datetime updated_at
    }

    announcements {
        int id PK
        string title
        text content
        boolean is_published
        int admin_id FK
        datetime published_at
        datetime created_at
        datetime updated_at
    }
```

## 7. 类图说明

### 核心实体
| 类名 | 说明 | 主要职责 |
|-----|------|---------|
| User | 用户实体 | 存储用户账号信息和基本属性 |
| Save | 存档实体 | 存储用户游戏进度和属性 |
| Script | 剧本实体 | 存储剧本内容和选项 |
| Badge | 徽章实体 | 存储成就徽章信息 |
| WorkshopChain | 剧本链实体 | 存储用户创作的剧本链 |
| WorkshopScript | 工坊剧本实体 | 存储剧本链中的单个节点 |
| Admin | 管理员实体 | 存储管理员账号信息 |

### 值对象
| 类名 | 说明 |
|-----|------|
| Attributes | 五维属性（德智体美劳） |
| AttributeChange | 属性变化值 |
| Position | 节点在编辑器中的位置 |
| ScriptOption | 剧本选项 |
| BadgeCondition | 徽章解锁条件 |
