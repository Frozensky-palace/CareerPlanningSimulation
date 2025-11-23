import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export type AdminAction =
  | 'login'
  | 'logout'
  | 'create_script'
  | 'update_script'
  | 'delete_script'
  | 'create_badge'
  | 'update_badge'
  | 'delete_badge'
  | 'update_user'
  | 'delete_user'
  | 'update_settings'
  | 'create_admin'
  | 'update_admin'
  | 'delete_admin'

interface AdminLogAttributes {
  id: number
  adminId: number
  action: AdminAction
  targetType?: string
  targetId?: number
  details?: string
  ipAddress?: string
  createdAt?: Date
}

interface AdminLogCreationAttributes extends Optional<AdminLogAttributes, 'id' | 'targetType' | 'targetId' | 'details' | 'ipAddress'> {}

class AdminLog extends Model<AdminLogAttributes, AdminLogCreationAttributes> implements AdminLogAttributes {
  declare id: number
  declare adminId: number
  declare action: AdminAction
  declare targetType: string
  declare targetId: number
  declare details: string
  declare ipAddress: string
  declare readonly createdAt: Date
}

AdminLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    targetType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'admin_logs',
    timestamps: true,
    updatedAt: false
  }
)

export default AdminLog
