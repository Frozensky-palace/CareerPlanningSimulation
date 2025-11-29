import { sequelize } from '../config/database.js'

async function addContentsColumn() {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    // 检查列是否存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'career_planning'
      AND TABLE_NAME = 'scripts'
      AND COLUMN_NAME = 'contents'
    `) as any[]

    if (results.length === 0) {
      // 添加 contents 列（允许为 NULL）
      await sequelize.query(`
        ALTER TABLE scripts
        ADD COLUMN contents JSON NULL
      `)
      console.log('✓ Added contents column to scripts table')

      // 将现有的 content 字段同步到 contents 数组
      await sequelize.query(`
        UPDATE scripts
        SET contents = JSON_ARRAY(content)
        WHERE content IS NOT NULL AND content != ''
      `)
      console.log('✓ Migrated existing content to contents array')
    } else {
      console.log('✓ contents column already exists')
    }

    await sequelize.close()
    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addContentsColumn()
