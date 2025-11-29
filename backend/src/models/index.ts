import User from './User.js'
import Save from './Save.js'
import Script from './Script.js'
import Badge from './Badge.js'
import Admin from './Admin.js'
import AdminLog from './AdminLog.js'
import SystemSetting from './SystemSetting.js'
import WorkshopChain from './WorkshopChain.js'
import WorkshopScript from './WorkshopScript.js'

// 设置关联关系
Admin.hasMany(AdminLog, { foreignKey: 'adminId', as: 'logs' })
AdminLog.belongsTo(Admin, { foreignKey: 'adminId', as: 'admin' })

// Workshop 关联关系
User.hasMany(WorkshopChain, { foreignKey: 'userId', as: 'workshopChains' })
WorkshopChain.belongsTo(User, { foreignKey: 'userId', as: 'user' })

WorkshopChain.hasMany(WorkshopScript, { foreignKey: 'chainId', as: 'scripts' })
WorkshopScript.belongsTo(WorkshopChain, { foreignKey: 'chainId', as: 'chain' })

export { User, Save, Script, Badge, Admin, AdminLog, SystemSetting, WorkshopChain, WorkshopScript }

export default {
  User,
  Save,
  Script,
  Badge,
  Admin,
  AdminLog,
  SystemSetting,
  WorkshopChain,
  WorkshopScript
}
