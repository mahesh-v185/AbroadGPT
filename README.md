# CSCA PREP WEB - Disciplined Learning Platform

A comprehensive web platform for serious students preparing for CSCA (Computer Science Core Areas) and Chinese Government Scholarship Assessment Exams.

## 🎯 Platform Features

### Core Discipline Features
- **Mandatory Track Selection**: Users must choose exactly ONE track (CSCA or Chinese Scholarship)
- **Locked Progression**: Cannot skip modules - must master each topic before advancing
- **Daily Study Plans**: Auto-generated 60-120 minute study sessions
- **Inactivity Penalties**: 3+ days without activity triggers progress reduction
- **Diagnostic Testing**: Mandatory assessment before accessing content

### Learning Tracks

#### Track 1: CSCA Core Sciences
- Mathematics (Sets & Inequalities, Functions, Geometry & Algebra, Probability & Statistics)
- Physics (Mechanics, Electromagnetism, Thermodynamics, Optics, Modern Physics)
- Chemistry (Basic Concepts, Properties & Reactions, Chemical Theories, Experiments)

#### Track 2: Chinese Government Scholarship
- Mathematics (Algebra, Functions, Trigonometry, Calculus)
- English (Reading, Grammar, Vocabulary, Essay Writing)
- Logical & Quantitative Reasoning
- Chinese Language (HSK 1-3, Optional)

### Progress & Evaluation
- Real-time skill heatmaps
- Streak tracking with bonuses
- Weekly cumulative tests
- Exportable progress reports (PDF/CSV)
- Performance analytics and percentile rankings

## 🏗️ Technical Architecture

### Frontend (React)
- **Framework**: React 18 with React Router
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **UI Components**: Custom components with Lucide icons
- **Real-time**: WebSocket integration for live updates

### Backend (Node.js)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO for WebSocket connections
- **Validation**: Express-validator for input validation

### Database Schema
- **Users**: Authentication, progress tracking, streaks
- **Content**: Tracks, subjects, modules, questions
- **Progress**: User progress, study sessions, attempts
- **Analytics**: Activity logs, performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd csca-prep-web
```

2. **Install dependencies**
```bash
npm run install-deps
```

3. **Set up environment variables**
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit server/.env with your configuration
```

4. **Set up database**
```bash
# Create PostgreSQL database
createdb csca_prep

# Run database schema
psql csca_prep < database-schema.sql
```

5. **Start the application**
```bash
# Development mode (both frontend and backend)
npm run dev

# Production mode
npm run build
npm start
```

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=csca_prep
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=7d
```

## 📁 Project Structure

```
csca-prep-web/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/       # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS/Tailwind styles
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Server entry point
├── database-schema.sql    # PostgreSQL schema
├── api-structure.md     # API documentation
├── user-flows.md       # User flow diagrams
├── progress-locking-logic.js
├── evaluation-scoring-rules.js
├── sample-questions-csca.json
├── sample-questions-chinese.json
└── package.json         # Root package.json
```

## 🔧 Development

### Running Tests
```bash
# Frontend tests
cd client && npm test

# Backend tests (when implemented)
cd server && npm test
```

### Code Style
- ESLint for JavaScript/React
- Prettier for code formatting
- Consistent naming conventions
- Component-based architecture

### API Development
- RESTful API design
- Comprehensive error handling
- Input validation
- Rate limiting
- JWT authentication

## 📊 Key Features Implementation

### Progress Locking System
- **Module Unlock Logic**: Sequential progression with score thresholds
- **Prerequisites**: Previous modules must be completed (70%+ score)
- **Attempt Limits**: Maximum 3 attempts per module with 24-hour cooldown
- **Time Tracking**: All study time logged for progress metrics

### Evaluation Engine
- **Dynamic Scoring**: Question type and difficulty-based weighting
- **Time Bonuses**: Efficiency rewards for quick completion
- **Attempt Penalties**: Score reduction for multiple attempts
- **Performance Levels**: Categorized mastery assessment

### Daily Study System
- **Adaptive Planning**: AI-powered schedule generation
- **Weakness Focus**: Prioritizes areas needing improvement
- **Time Allocation**: Balanced LEARN → PRACTICE → RECALL → TEST blocks
- **Consistency Tracking**: Streak bonuses and inactivity penalties

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API endpoint protection
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin setup
- **Helmet.js**: Security headers

## 📈 Performance Considerations

- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching Strategy**: React Query for frontend caching
- **Lazy Loading**: Component and route-based code splitting
- **WebSocket Optimization**: Efficient real-time updates

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Setup
- **Node.js**: Production environment variables
- **PostgreSQL**: Production database configuration
- **Reverse Proxy**: Nginx/Apache configuration
- **SSL**: HTTPS setup for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API structure documentation

## 🎯 Next Steps

### Phase 1: Core Platform
- [x] Database schema design
- [x] API structure and endpoints
- [x] User flow diagrams
- [x] Progress locking system
- [x] Evaluation scoring rules
- [x] Frontend React application
- [x] Backend Node.js server
- [ ] Database setup and seeding

### Phase 2: Enhanced Features
- [ ] Advanced analytics dashboard
- [ ] Social learning features
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Comprehensive testing suite

### Phase 3: Scale & Deploy
- [ ] Production deployment
- [ ] Monitoring and logging
- [ ] Load testing
- [ ] Security audit
- [ ] User feedback system

---

**Built with discipline for serious learners** 🎓
