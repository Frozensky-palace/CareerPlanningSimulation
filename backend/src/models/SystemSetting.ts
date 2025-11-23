import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

interface SystemSettingAttributes {
  id: number
  key: string
  value: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'id' | 'description'> {}

class SystemSetting extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
  declare id: number
  declare key: string
  declare value: string
  declare description: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // 获取设置值（支持类型转换）
  getValue<T = string>(): T {
    try {
      return JSON.parse(this.value) as T
    } catch {
      return this.value as unknown as T
    }
  }
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'system_settings',
    timestamps: true
  }
)

export default SystemSetting
