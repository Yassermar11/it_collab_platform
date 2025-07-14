const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
});

const updateSessionsTable = async () => {
    try {
        // Drop existing table if exists
        await sequelize.query('DROP TABLE IF EXISTS sessions;');
        
        // Create new table with Unix timestamp
        await sequelize.query(`
            CREATE TABLE sessions (
                session_id VARCHAR(128) NOT NULL,
                expires BIGINT NOT NULL,
                data TEXT,
                PRIMARY KEY (session_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('Sessions table updated successfully');
    } catch (error) {
        console.error('Error updating sessions table:', error);
    } finally {
        await sequelize.close();
    }
};

updateSessionsTable();
