import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'
import argon2 from 'argon2'

interface UserAttributes {
  id: number
  username: string
  email: string
  password: string
  avatar?: string
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number
  declare username: string
  declare email: string
  declare password: string
  declare avatar: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // 验证密码
  async validatePassword(password: string): Promise<boolean> {
    return argon2.verify(this.password, password)
  }

  // 返回安全的用户信息（不含密码）
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      createdAt: this.createdAt
    }
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await argon2.hash(user.password)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await argon2.hash(user.password)
        }
      }
    }
  }
)

export default User
