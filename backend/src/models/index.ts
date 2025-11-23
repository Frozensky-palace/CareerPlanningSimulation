import User from './User.js'
import Save from './Save.js'
import Script from './Script.js'
import Badge from './Badge.js'
import Admin from './Admin.js'
import AdminLog from './AdminLog.js'
import SystemSetting from './SystemSetting.js'

// 设置关联关系
Admin.hasMany(AdminLog, { foreignKey: 'adminId', as: 'logs' })
AdminLog.belongsTo(Admin, { foreignKey: 'adminId', as: 'admin' })

export { User, Save, Script, Badge, Admin, AdminLog, SystemSetting }

export default {
  User,
  Save,
  Script,
  Badge,
  Admin,
  AdminLog,
  SystemSetting
}
