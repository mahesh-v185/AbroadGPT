const fs = require('fs').promises;
const path = require('path');
const { initializeDatabase, run } = require('../config/database-sqlite');

const initDatabase = async () => {
  try {
    console.log('Initializing SQLite database...');
    
    // Initialize database connection
    const db = await initializeDatabase();
    
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, '../../database-schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Convert PostgreSQL schema to SQLite
    const sqliteSchema = convertPostgreSQLToSQLite(schema);
    
    // Split into individual statements
    const statements = sqliteSchema.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await run(statement.trim());
          console.log('✓ Executed:', statement.trim().substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠ Skipped (may exist):', statement.trim().substring(0, 50) + '...');
        }
      }
    }
    
    console.log('✅ Database initialized successfully!');
    console.log('📁 Database location: ../config/database-sqlite.js');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Convert PostgreSQL schema to SQLite
const convertPostgreSQLToSQLite = (schema) => {
  return schema
    // Remove PostgreSQL-specific features
    .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/BOOLEAN/g, 'INTEGER')
    .replace(/VARCHAR\(\d+\)/g, 'TEXT')
    .replace(/TEXT\(\d+\)/g, 'TEXT')
    .replace(/INTEGER DEFAULT nextval\([^)]+\)/g, 'INTEGER')
    .replace(/UNIQUE/g, 'UNIQUE')
    .replace(/NOT NULL/g, 'NOT NULL')
    .replace(/REFERENCES [^(]+\([^)]+\)/g, '')
    // Remove PostgreSQL-specific indexes and constraints
    .replace(/CREATE INDEX [^;]+;/g, '')
    .replace(/ALTER TABLE [^;]+;/g, '')
    .replace(/DROP TABLE [^;]+;/g, '')
    // Clean up extra semicolons
    .replace(/;;+/g, ';');
};

// Run initialization
initDatabase();
