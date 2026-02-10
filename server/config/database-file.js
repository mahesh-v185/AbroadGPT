const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// File-based database configuration
const DB_FILE = path.join(__dirname, '../data/database.json');

// Initialize database file
const initializeDatabase = async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Check if database file exists
    try {
      await fs.access(DB_FILE);
      console.log('File-based database initialized successfully');
      return;
    } catch {
      // Create initial database structure
      const initialData = {
        users: [],
        tracks: [
          {
            id: 1,
            name: 'CSCA Core Sciences',
            description: 'Comprehensive CSCA sciences preparation',
            code: 'CSCA',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Chinese Scholarship Assessment',
            description: 'Preparation for CSC and Chinese university entrance exams',
            code: 'CHINESE_SCHOLARSHIP',
            created_at: new Date().toISOString()
          }
        ],
        subjects: [
          {
            id: 1,
            track_id: 1,
            name: 'Mathematics',
            description: 'Advanced mathematics for CSCA preparation',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            track_id: 1,
            name: 'Physics',
            description: 'Physics concepts and problem solving',
            order_index: 2,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            track_id: 1,
            name: 'Chemistry',
            description: 'Chemistry fundamentals and applications',
            order_index: 3,
            is_active: true,
            created_at: new Date().toISOString()
          }
        ],
        modules: [
          {
            id: 1,
            subject_id: 1,
            title: 'Algebra and Functions',
            description: 'Linear equations, quadratic functions, and polynomials',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            subject_id: 1,
            title: 'Calculus',
            description: 'Limits, derivatives, and integration',
            order_index: 2,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            subject_id: 1,
            title: 'Statistics and Probability',
            description: 'Data analysis, probability theory, and statistical inference',
            order_index: 3,
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]
      };
      
      await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
      console.log('File-based database created successfully');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Read database file
const readDatabase = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw error;
  }
};

// Write to database file
const writeDatabase = async (data) => {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

// Query helper functions
const query = async (table, conditions = {}) => {
  try {
    const db = await readDatabase();
    let results = db[table] || [];
    
    // Apply conditions
    if (Object.keys(conditions).length > 0) {
      results = results.filter(item => {
        return Object.keys(conditions).every(key => {
          if (key.includes('email')) {
            return item[key.toLowerCase()] === conditions[key].toLowerCase();
          }
          return item[key] === conditions[key];
        });
      });
    }
    
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Insert helper function
const insert = async (table, data) => {
  try {
    const db = await readDatabase();
    const newItem = {
      id: db[table].length > 0 ? Math.max(...db[table].map(item => item.id)) + 1 : 1,
      ...data,
      created_at: new Date().toISOString()
    };
    
    db[table].push(newItem);
    await writeDatabase(db);
    
    return { insertId: newItem.id, affectedRows: 1 };
  } catch (error) {
    console.error('Insert error:', error);
    throw error;
  }
};

// Update helper function
const update = async (table, id, data) => {
  try {
    const db = await readDatabase();
    const index = db[table].findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Record not found');
    }
    
    db[table][index] = { ...db[table][index], ...data, updated_at: new Date().toISOString() };
    await writeDatabase(db);
    
    return { affectedRows: 1 };
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  query,
  insert,
  update
};
