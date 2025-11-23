import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'
import argon2 from 'argon2'

export type AdminRole = 'super_admin' | 'admin' | 'editor'

interface AdminAttributes {
  id: number
  username: string
  password: string
  role: AdminRole
  email?: string
  lastLoginAt?: Date
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'id' | 'email' | 'lastLoginAt' | 'isActive'> {}

class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  declare id: number
  declare username: string
  declare password: string
  declare role: AdminRole
  declare email: string
  declare lastLoginAt: Date
  declare isActive: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // 验证密码
  async validatePassword(password: string): Promise<boolean> {
    return argon2.verify(this.password, password)
  }

  // 返回安全的管理员信息（不含密码）
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      email: this.email,
      lastLoginAt: this.lastLoginAt,
      isActive: this.isActive,
      createdAt: this.createdAt
    }
  }

  // 检查权限
  hasPermission(requiredRole: AdminRole): boolean {
    const roleLevel: Record<AdminRole, number> = {
      'super_admin': 3,
      'admin': 2,
      'editor': 1
    }
    return roleLevel[this.role] >= roleLevel[requiredRole]
  }
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'editor'),
      allowNull: false,
      defaultValue: 'editor'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'admins',
    timestamps: true,
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.password) {
          admin.password = await argon2.hash(admin.password)
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          admin.password = await argon2.hash(admin.password)
        }
      }
    }
  }
)

export default Admin
