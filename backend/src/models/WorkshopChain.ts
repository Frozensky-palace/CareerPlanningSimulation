import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

interface WorkshopChainAttributes {
  id: number
  userId: number
  title: string
  description: string
  coverImage: string | null
  rootScriptId: number | null
  isImported: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface WorkshopChainCreationAttributes extends Optional<WorkshopChainAttributes, 'id' | 'description' | 'coverImage' | 'rootScriptId' | 'isImported'> {}

class WorkshopChain extends Model<WorkshopChainAttributes, WorkshopChainCreationAttributes> implements WorkshopChainAttributes {
  declare id: number
  declare userId: number
  declare title: string
  declare description: string
  declare coverImage: string | null
  declare rootScriptId: number | null
  declare isImported: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

WorkshopChain.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: 'cover_image'
    },
    rootScriptId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      field: 'root_script_id'
    },
    isImported: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_imported'
    }
  },
  {
    sequelize,
    tableName: 'workshop_chains',
    timestamps: true,
    underscored: true
  }
)

export default WorkshopChain
