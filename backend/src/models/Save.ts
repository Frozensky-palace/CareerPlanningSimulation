import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'
import User from './User.js'

// 五维属性值
interface AttributeValues {
  de: number    // 德
  zhi: number   // 智
  ti: number    // 体
  mei: number   // 美
  lao: number   // 劳
}

interface SaveAttributes {
  id: number
  userId: number
  name: string
  semester: number           // 当前学期 1-8
  week: number              // 当前周 1-20
  currentPhase: 'opening' | 'midterm' | 'final'  // 当前阶段
  remainingEvents: number    // 剩余事件数
  attributes: AttributeValues
  completedScripts: number[] // 已完成的剧本ID
  unlockedBadges: number[]   // 已解锁的徽章ID
  createdAt?: Date
  updatedAt?: Date
}

interface SaveCreationAttributes extends Optional<SaveAttributes, 'id' | 'semester' | 'week' | 'currentPhase' | 'remainingEvents' | 'completedScripts' | 'unlockedBadges'> {}

class Save extends Model<SaveAttributes, SaveCreationAttributes> implements SaveAttributes {
  declare id: number
  declare userId: number
  declare name: string
  declare semester: number
  declare week: number
  declare currentPhase: 'opening' | 'midterm' | 'final'
  declare remainingEvents: number
  declare attributes: AttributeValues
  declare completedScripts: number[]
  declare unlockedBadges: number[]
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // 关联
  declare user?: User
}

Save.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '新存档'
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 8
      }
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 20
      }
    },
    currentPhase: {
      type: DataTypes.ENUM('opening', 'midterm', 'final'),
      allowNull: false,
      defaultValue: 'opening'
    },
    remainingEvents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        de: 50,
        zhi: 50,
        ti: 50,
        mei: 50,
        lao: 50
      }
    },
    completedScripts: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    unlockedBadges: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    }
  },
  {
    sequelize,
    tableName: 'saves',
    timestamps: true
  }
)

// 建立关联
User.hasMany(Save, { foreignKey: 'userId', as: 'saves' })
Save.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export default Save
