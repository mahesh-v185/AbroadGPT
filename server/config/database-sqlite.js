const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs').promises;
const path = require('path');

// SQLite database setup
const DB_PATH = path.join(__dirname, '../data/csca_prep.db');

let db;

const initializeDatabase = async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Open database connection
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    console.log('SQLite database connected successfully');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

const query = async (sql, params = []) => {
  try {
    if (!db) {
      db = await initializeDatabase();
    }
    
    const result = await db.all(sql, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

const run = async (sql, params = []) => {
  try {
    if (!db) {
      db = await initializeDatabase();
    }
    
    const result = await db.run(sql, params);
    return result;
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  query,
  run,
  DB_PATH
};
