const { Pool } = require('pg');

// PostgreSQL database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'csca_prep',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('PostgreSQL database connected successfully');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        track_id INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tracks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create subjects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        track_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create modules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default data
    await client.query(`
      INSERT INTO tracks (id, name, description, code) VALUES 
      (1, 'CSCA Core Sciences', 'Comprehensive CSCA sciences preparation', 'CSCA'),
      (2, 'Chinese Scholarship Assessment', 'Preparation for CSC and Chinese university entrance exams', 'CHINESE_SCHOLARSHIP')
      ON CONFLICT (id) DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO subjects (id, track_id, name, description, order_index) VALUES 
      (1, 1, 'Mathematics', 'Advanced mathematics for CSCA preparation', 1),
      (2, 1, 'Physics', 'Physics concepts and problem solving', 2),
      (3, 1, 'Chemistry', 'Chemistry fundamentals and applications', 3)
      ON CONFLICT (id) DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO modules (id, subject_id, title, description, order_index) VALUES 
      (1, 1, 'Algebra and Functions', 'Linear equations, quadratic functions, and polynomials', 1),
      (2, 1, 'Calculus', 'Limits, derivatives, and integration', 2),
      (3, 1, 'Statistics and Probability', 'Data analysis, probability theory, and statistical inference', 3),
      (4, 2, 'Mechanics', 'Force, motion, energy, and momentum', 1),
      (5, 2, 'Thermodynamics', 'Heat, temperature, and energy transfer', 2),
      (6, 2, 'Electromagnetism', 'Electric and magnetic fields, circuits, and waves', 3),
      (7, 3, 'Atomic Structure', 'Atoms, molecules, and chemical bonding', 1),
      (8, 3, 'Chemical Reactions', 'Reaction types, kinetics, and equilibrium', 2),
      (9, 3, 'Organic Chemistry', 'Carbon compounds and organic reactions', 3)
      ON CONFLICT (id) DO NOTHING
    `);
    
    client.release();
    console.log('PostgreSQL database initialized successfully');
    return pool;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Query helper function
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Execute helper function
const execute = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows[0];
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
