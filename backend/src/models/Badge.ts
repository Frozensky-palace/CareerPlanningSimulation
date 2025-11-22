import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

// 解锁条件类型
interface UnlockCondition {
  type: 'attribute' | 'scripts' | 'phase'
  attribute?: 'de' | 'zhi' | 'ti' | 'mei' | 'lao'
  minValue?: number
  scripts?: number[]  // 需要完成的剧本ID
  completedCount?: number  // 需要完成的剧本数量
}

interface BadgeAttributes {
  id: number
  name: string
  description: string
  icon: string           // 图标名称或URL
  unlockCondition: UnlockCondition
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id' | 'isActive'> {}

class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
  declare id: number
  declare name: string
  declare description: string
  declare icon: string
  declare unlockCondition: UnlockCondition
  declare isActive: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Badge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Medal'
    },
    unlockCondition: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'badges',
    timestamps: true
  }
)

export default Badge
