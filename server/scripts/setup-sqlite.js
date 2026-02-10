const fs = require('fs').promises;
const path = require('path');
const { initializeDatabase, run } = require('../config/database-sqlite');

const setupDatabase = async () => {
  try {
    console.log('Setting up SQLite database with schema...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Read the SQLite schema file
    const schemaPath = path.join(__dirname, '../config/schema-sqlite.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await run(statement.trim());
          console.log('✓ Executed:', statement.trim().substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠ Skipped:', statement.trim().substring(0, 50) + '...');
        }
      }
    }
    
    console.log('✅ SQLite database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

// Run setup
setupDatabase();
