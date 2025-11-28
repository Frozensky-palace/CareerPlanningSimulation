import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

// 属性变化
interface AttributeChange {
  de?: number
  zhi?: number
  ti?: number
  mei?: number
  lao?: number
}

// 选项
interface ScriptOption {
  id: number
  text: string
  attributeChanges: AttributeChange
  nextScriptId?: number | null  // 后续剧本ID
}

// 触发条件
interface TriggerCondition {
  semester?: number[]       // 可触发的学期
  week?: number[]          // 可触发的周
  minAttributes?: AttributeChange  // 最低属性要求
  requiredScripts?: number[]       // 需要完成的前置剧本
}

type ScriptType = 'main' | 'branch' | 'special'

interface ScriptAttributes {
  id: number
  title: string
  content: string
  type: ScriptType
  location: string          // 触发地点
  backgroundImage: string | null  // 剧本背景图片URL
  options: ScriptOption[]
  triggerCondition: TriggerCondition
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface ScriptCreationAttributes extends Optional<ScriptAttributes, 'id' | 'isActive' | 'backgroundImage'> {}

class Script extends Model<ScriptAttributes, ScriptCreationAttributes> implements ScriptAttributes {
  declare id: number
  declare title: string
  declare content: string
  declare type: ScriptType
  declare location: string
  declare backgroundImage: string | null
  declare options: ScriptOption[]
  declare triggerCondition: TriggerCondition
  declare isActive: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Script.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('main', 'branch', 'special'),
      allowNull: false,
      defaultValue: 'branch'
    },
    location: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'campus'
    },
    backgroundImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    triggerCondition: {
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
    tableName: 'scripts',
    timestamps: true
  }
)

export default Script
