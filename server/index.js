const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Helper function to check if file exists
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Use MySQL database
const { initializeDatabase } = require('./config/database-mysql');

const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const diagnosticRoutes = require('./routes/diagnostic');
const dailyPlanRoutes = require('./routes/dailyPlans');
const progressRoutes = require('./routes/progress');
const sessionRoutes = require('./routes/sessions');
const questionRoutes = require('./routes/questions');
const weeklyTestRoutes = require('./routes/weeklyTests');
const settingsRoutes = require('./routes/settings');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tracks', contentRoutes);
app.use('/api/v1/subjects', contentRoutes);
app.use('/api/v1/modules', contentRoutes);
app.use('/api/v1/diagnostic', diagnosticRoutes);
app.use('/api/v1/daily-plan', dailyPlanRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/weekly-tests', weeklyTestRoutes);
app.use('/api/v1/settings', settingsRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for real-time updates
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify token and get user ID
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.join(`user_${decoded.userId}`);
      
      console.log(`User ${decoded.userId} connected to their personal room`);
    } catch (error) {
      console.log('Invalid token for WebSocket connection');
      socket.disconnect();
    }
  }

  // Handle study session progress
  socket.on('session_progress', (data) => {
    socket.to(`user_${socket.userId}`).emit('session_update', data);
  });

  // Handle module completion
  socket.on('module_completed', (data) => {
    socket.to(`user_${socket.userId}`).emit('progress_update', data);
  });

  // Handle daily plan updates
  socket.on('daily_plan_update', (data) => {
    socket.to(`user_${socket.userId}`).emit('daily_plan_changed', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.details
      }
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing authentication token'
      }
    });
  }
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

const PORT = process.env.PORT || 5002;

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize SQLite database
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
