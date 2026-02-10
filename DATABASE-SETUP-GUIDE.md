# CSCA Prep Web - External Database Setup Guide

This guide provides multiple options for setting up an external database for your CSCA Prep platform.

## 🚀 Quick Setup Options

### Option 1: MySQL (Recommended for Production)
1. **Install MySQL**
   ```bash
   # Windows (using Chocolatey)
   choco install mysql
   
   # Or download from: https://dev.mysql.com/downloads/mysql/
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE csca_prep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'csca_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON csca_prep.* TO 'csca_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update .env File**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=csca_prep
   DB_USER=csca_user
   DB_PASSWORD=your_password
   ```

### Option 2: PostgreSQL (Alternative)
1. **Install PostgreSQL**
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql
   
   # Or download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE csca_prep;
   CREATE USER csca_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE csca_prep TO csca_user;
   ```

3. **Update .env File**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=csca_prep
   DB_USER=csca_user
   DB_PASSWORD=your_password
   ```

### Option 3: MongoDB (NoSQL Option)
1. **Install MongoDB**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb
   
   # Or download from: https://www.mongodb.com/try/download/community
   ```

2. **Create Database**
   ```javascript
   // MongoDB creates database automatically on first use
   use csca_prep
   ```

3. **Update .env File**
   ```env
   DB_HOST=localhost
   DB_PORT=27017
   DB_NAME=csca_prep
   DB_USER=csca_user
   DB_PASSWORD=your_password
   ```

## 🔧 Configuration Steps

### Step 1: Choose Your Database
- **MySQL**: Best for traditional web applications
- **PostgreSQL**: Great for complex queries
- **MongoDB**: Flexible for rapid development

### Step 2: Update Server Configuration
1. Open `server/index.js`
2. Change the database import:
   ```javascript
   // For MySQL
   const { initializeDatabase } = require('./config/database-mysql');
   
   // For PostgreSQL
   const { initializeDatabase } = require('./config/database-postgresql');
   
   // For MongoDB
   const { initializeDatabase } = require('./config/database-mongodb');
   ```

### Step 3: Install Dependencies
```bash
# For MySQL
npm install mysql2

# For PostgreSQL
npm install pg

# For MongoDB
npm install mongodb
```

### Step 4: Run Database Setup
```bash
cd server
npm run init-db
```

## 📁 Database Files Created

I've created the following database configuration files for you:

1. **`server/config/database-mysql.js`** - MySQL configuration
2. **`server/config/database-postgresql.js`** - PostgreSQL configuration  
3. **`server/config/database-mongodb.js`** - MongoDB configuration
4. **`server/config/database-file.js`** - File-based (current working solution)

## 🚀 Quick Start Commands

### For MySQL (Recommended)
```bash
# 1. Install MySQL and create database
# 2. Update .env with MySQL credentials
# 3. Update server to use MySQL
# 4. Install dependencies
cd server
npm install mysql2

# 5. Start server
node index.js
```

### For PostgreSQL
```bash
# 1. Install PostgreSQL and create database
# 2. Update .env with PostgreSQL credentials  
# 3. Update server to use PostgreSQL
# 4. Install dependencies
cd server
npm install pg

# 5. Start server
node index.js
```

### For MongoDB
```bash
# 1. Install MongoDB
# 2. Update .env with MongoDB credentials
# 3. Update server to use MongoDB
# 4. Install dependencies
cd server
npm install mongodb

# 5. Start server
node index.js
```

## 🔍 Testing Your Setup

1. **Start the server**: `node index.js`
2. **Test registration**: Go to `http://localhost:3000` and try registering
3. **Check logs**: Ensure database connection is successful

## 🛠️ Troubleshooting

### Connection Issues
- **Check database service is running**
- **Verify credentials in .env file**
- **Check firewall settings**
- **Ensure database port is accessible**

### Registration Issues
- **Check database tables are created**
- **Verify email uniqueness constraint**
- **Check server logs for errors**

## 📞 Support

If you need help with database setup:
1. **Choose MySQL** (easiest for Windows)
2. **Follow the step-by-step guide above**
3. **Test with the provided configuration files**

The file-based database (`database-file.js`) is already working and can handle multiple users reliably!
