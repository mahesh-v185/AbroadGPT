const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// MySQL database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'csca_user',
  password: process.env.DB_PASSWORD || 'csca123',
  database: process.env.DB_NAME || 'csca_prep',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('MySQL Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password ? '***' : 'empty',
  database: dbConfig.database
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        track_id INT DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create tracks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create subjects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        track_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create modules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default data
    await connection.query(`
      INSERT IGNORE INTO tracks (id, name, description, code) VALUES 
      (1, 'CSCA Core Sciences', 'Comprehensive CSCA sciences preparation', 'CSCA'),
      (2, 'Chinese Scholarship Assessment', 'Preparation for CSC and Chinese university entrance exams', 'CHINESE_SCHOLARSHIP')
    `);
    
    await connection.query(`
      INSERT IGNORE INTO subjects (id, track_id, name, description, order_index) VALUES 
      (1, 1, 'Mathematics', 'Advanced mathematics for CSCA preparation', 1),
      (2, 1, 'Physics', 'Physics concepts and problem solving', 2),
      (3, 1, 'Chemistry', 'Chemistry fundamentals and applications', 3)
    `);
    
    await connection.query(`
      INSERT IGNORE INTO modules (id, subject_id, title, description, order_index) VALUES 
      (1, 1, 'Algebra and Functions', 'Linear equations, quadratic functions, and polynomials', 1),
      (2, 1, 'Calculus', 'Limits, derivatives, and integration', 2),
      (3, 1, 'Statistics and Probability', 'Data analysis, probability theory, and statistical inference', 3),
      (4, 2, 'Mechanics', 'Force, motion, energy, and momentum', 1),
      (5, 2, 'Thermodynamics', 'Heat, temperature, and energy transfer', 2),
      (6, 2, 'Electromagnetism', 'Electric and magnetic fields, circuits, and waves', 3),
      (7, 3, 'Atomic Structure', 'Atoms, molecules, and chemical bonding', 1),
      (8, 3, 'Chemical Reactions', 'Reaction types, kinetics, and equilibrium', 2),
      (9, 3, 'Organic Chemistry', 'Carbon compounds and organic reactions', 3)
    `);
    
    connection.release();
    console.log('MySQL database initialized successfully');
    return pool;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Query helper function
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Execute helper function
const execute = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  query,
  execute,
  pool
};
