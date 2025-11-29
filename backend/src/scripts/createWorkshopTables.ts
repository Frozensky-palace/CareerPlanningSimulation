import { sequelize } from '../config/database.js'

async function createWorkshopTables() {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    // 创建 workshop_chains 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS workshop_chains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        cover_image VARCHAR(500) DEFAULT NULL,
        root_script_id INT DEFAULT NULL,
        is_imported BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Created workshop_chains table')

    // 创建 workshop_scripts 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS workshop_scripts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chain_id INT NOT NULL,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT,
        contents JSON,
        background_image VARCHAR(500) DEFAULT NULL,
        location VARCHAR(50) DEFAULT 'campus',
        options JSON,
        position JSON,
        is_entry_point BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_chain_id (chain_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Created workshop_scripts table')

    await sequelize.close()
    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createWorkshopTables()
