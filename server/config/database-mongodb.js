const { MongoClient } = require('mongodb');

// MongoDB database configuration
const url = process.env.DB_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'csca_prep';

let db;
let client;

// Initialize database and collections
const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    client = new MongoClient(url);
    await client.connect();
    
    // Get database
    db = client.db(dbName);
    console.log('MongoDB connected successfully');
    
    // Create collections and indexes
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    await db.createCollection('tracks');
    await db.collection('tracks').createIndex({ code: 1 }, { unique: true });
    
    await db.createCollection('subjects');
    await db.createCollection('modules');
    
    // Insert default data
    await db.collection('tracks').insertMany([
      {
        id: 1,
        name: 'CSCA Core Sciences',
        description: 'Comprehensive CSCA sciences preparation',
        code: 'CSCA',
        created_at: new Date()
      },
      {
        id: 2,
        name: 'Chinese Scholarship Assessment',
        description: 'Preparation for CSC and Chinese university entrance exams',
        code: 'CHINESE_SCHOLARSHIP',
        created_at: new Date()
      }
    ], { ordered: true }).catch(() => {}); // Ignore duplicate errors
    
    await db.collection('subjects').insertMany([
      {
        id: 1,
        track_id: 1,
        name: 'Mathematics',
        description: 'Advanced mathematics for CSCA preparation',
        order_index: 1,
        is_active: true,
        created_at: new Date()
      },
      {
        id: 2,
        track_id: 1,
        name: 'Physics',
        description: 'Physics concepts and problem solving',
        order_index: 2,
        is_active: true,
        created_at: new Date()
      },
      {
        id: 3,
        track_id: 1,
        name: 'Chemistry',
        description: 'Chemistry fundamentals and applications',
        order_index: 3,
        is_active: true,
        created_at: new Date()
      }
    ], { ordered: true }).catch(() => {}); // Ignore duplicate errors
    
    await db.collection('modules').insertMany([
      {
        id: 1,
        subject_id: 1,
        title: 'Algebra and Functions',
        description: 'Linear equations, quadratic functions, and polynomials',
        order_index: 1,
        is_active: true,
        created_at: new Date()
      },
      {
        id: 2,
        subject_id: 1,
        title: 'Calculus',
        description: 'Limits, derivatives, and integration',
        order_index: 2,
        is_active: true,
        created_at: new Date()
      },
      {
        id: 3,
        subject_id: 1,
        title: 'Statistics and Probability',
        description: 'Data analysis, probability theory, and statistical inference',
        order_index: 3,
        is_active: true,
        created_at: new Date()
      }
    ], { ordered: true }).catch(() => {}); // Ignore duplicate errors
    
    console.log('MongoDB database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Query helper function
const query = async (collection, conditions = {}) => {
  try {
    const result = await db.collection(collection).find(conditions).toArray();
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Insert helper function
const insert = async (collection, data) => {
  try {
    const result = await db.collection(collection).insertOne(data);
    return { insertId: result.insertedId, affectedRows: 1 };
  } catch (error) {
    console.error('Insert error:', error);
    throw error;
  }
};

// Update helper function
const update = async (collection, id, data) => {
  try {
    const result = await db.collection(collection).updateOne(
      { id: id },
      { $set: { ...data, updated_at: new Date() } }
    );
    return { affectedRows: result.modifiedCount };
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  query,
  insert,
  update,
  getDb: () => db
};
