const readline = require('readline');
const fs = require('fs').promises;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🗄️ CSCA Prep Web - Database Selection\n');
console.log('=====================================\n');
console.log('1. File-based database (Simple, no installation required)');
console.log('2. MySQL (Recommended for production)');
console.log('3. PostgreSQL (Advanced SQL database)');
console.log('4. MongoDB (NoSQL database)\n');

rl.question('Choose your database option (1-4): ', async (choice) => {
  try {
    let databaseConfig;
    
    switch (choice.trim()) {
      case '1':
        databaseConfig = "// Use File-based database\nconst { initializeDatabase } = require('../config/database-file');";
        console.log('✅ Selected: File-based database');
        break;
        
      case '2':
        databaseConfig = "// Use MySQL database\nconst { initializeDatabase } = require('../config/database-mysql');";
        console.log('✅ Selected: MySQL database');
        console.log('📋 Make sure to: npm install mysql2');
        console.log('📋 Update .env with MySQL credentials');
        break;
        
      case '3':
        databaseConfig = "// Use PostgreSQL database\nconst { initializeDatabase } = require('../config/database-postgresql');";
        console.log('✅ Selected: PostgreSQL database');
        console.log('📋 Make sure to: npm install pg');
        console.log('📋 Update .env with PostgreSQL credentials');
        break;
        
      case '4':
        databaseConfig = "// Use MongoDB database\nconst { initializeDatabase } = require('../config/database-mongodb');";
        console.log('✅ Selected: MongoDB database');
        console.log('📋 Make sure to: npm install mongodb');
        console.log('📋 Update .env with MongoDB URL');
        break;
        
      default:
        console.log('❌ Invalid choice. Please select 1-4.');
        process.exit(1);
    }
    
    // Update index.js with the selected database
    const indexPath = '../index.js';
    const indexContent = await fs.readFile(indexPath, 'utf8');
    
    // Find and replace the database import line
    const lines = indexContent.split('\n');
    const dbLineIndex = lines.findIndex(line => 
      line.includes('// Use') && line.includes('database')
    );
    
    if (dbLineIndex !== -1) {
      lines[dbLineIndex] = databaseConfig;
      const updatedContent = lines.join('\n');
      await fs.writeFile(indexPath, updatedContent);
      console.log('\n✅ Database configuration updated successfully!');
      console.log('🚀 Run: node index.js to start the server');
    } else {
      console.log('❌ Could not find database configuration line in index.js');
    }
    
    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
});
