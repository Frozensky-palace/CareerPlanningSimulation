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
interface WorkshopScriptOption {
  id: number
  text: string
  attributeChanges: AttributeChange
  nextScriptId?: number | null
}

// 位置
interface Position {
  x: number
  y: number
}

interface WorkshopScriptAttributes {
  id: number
  chainId: number
  userId: number
  title: string
  content: string
  contents: string[]
  backgroundImage: string | null
  location: string
  options: WorkshopScriptOption[]
  position: Position
  isEntryPoint: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface WorkshopScriptCreationAttributes extends Optional<WorkshopScriptAttributes, 'id' | 'content' | 'contents' | 'backgroundImage' | 'options' | 'position' | 'isEntryPoint'> {}

class WorkshopScript extends Model<WorkshopScriptAttributes, WorkshopScriptCreationAttributes> implements WorkshopScriptAttributes {
  declare id: number
  declare chainId: number
  declare userId: number
  declare title: string
  declare content: string
  declare contents: string[]
  declare backgroundImage: string | null
  declare location: string
  declare options: WorkshopScriptOption[]
  declare position: Position
  declare isEntryPoint: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

WorkshopScript.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    chainId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'chain_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    contents: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    backgroundImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: 'background_image'
    },
    location: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'library'
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    position: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { x: 0, y: 0 }
    },
    isEntryPoint: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_entry_point'
    }
  },
  {
    sequelize,
    tableName: 'workshop_scripts',
    timestamps: true,
    underscored: true
  }
)

export default WorkshopScript
