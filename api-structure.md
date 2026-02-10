# CSCA PREP WEB - API Structure

## Base URL
```
https://api.csca-prep.com/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register new user
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "trackId": 1
}
```

#### POST /auth/login
User login
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST /auth/refresh
Refresh JWT token
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
Logout user (invalidate token)

### User Management

#### GET /users/profile
Get current user profile

#### PUT /users/profile
Update user profile
```json
{
  "fullName": "John Doe Updated"
}
```

#### GET /users/progress
Get user's overall progress
```json
{
  "progressPercentage": 45.5,
  "currentStreak": 7,
  "longestStreak": 15,
  "totalStudyMinutes": 2340,
  "weeklyProgress": [
    {"date": "2024-01-01", "minutes": 90, "completed": true},
    {"date": "2024-01-02", "minutes": 45, "completed": false}
  ]
}
```

#### GET /users/heatmap
Get skill heatmap data
```json
{
  "subjects": [
    {
      "subjectId": 1,
      "subjectName": "Data Structures",
      "masteryLevel": 75,
      "modulesCompleted": 8,
      "totalModules": 12
    }
  ]
}
```

### Tracks and Content

#### GET /tracks
List available tracks
```json
[
  {
    "id": 1,
    "name": "Computer Science Core Areas",
    "description": "Comprehensive CS fundamentals",
    "code": "CSCA"
  }
]
```

#### GET /tracks/:id/subjects
Get subjects for a track
```json
[
  {
    "id": 1,
    "name": "Programming Foundations",
    "description": "Basic programming concepts",
    "orderIndex": 1,
    "modules": [
      {
        "id": 1,
        "title": "Variables and Data Types",
        "status": "COMPLETED",
        "score": 85
      }
    ]
  }
]
```

#### GET /subjects/:id/modules
Get modules for a subject
```json
[
  {
    "id": 1,
    "title": "Variables and Data Types",
    "description": "Understanding variables...",
    "orderIndex": 1,
    "unlockThreshold": 70,
    "estimatedMinutes": 60,
    "status": "UNLOCKED",
    "userScore": null
  }
]
```

#### GET /modules/:id
Get module details
```json
{
  "id": 1,
  "title": "Variables and Data Types",
  "description": "Understanding variables...",
  "content": "<html>...</html>",
  "diagramUrl": "/assets/diagrams/variables.png",
  "estimatedMinutes": 60,
  "unlockThreshold": 70
}
```

#### GET /modules/:id/questions
Get questions for a module
```json
{
  "mcqs": [
    {
      "id": 1,
      "questionText": "What is a variable?",
      "options": ["A", "B", "C", "D"],
      "timeLimitSeconds": 120,
      "points": 10
    }
  ],
  "coding": [
    {
      "id": 2,
      "questionText": "Write a function...",
      "timeLimitSeconds": 300,
      "points": 20
    }
  ]
}
```

### Diagnostic Tests

#### GET /diagnostic/available
Get available diagnostic tests
```json
[
  {
    "id": 1,
    "trackId": 1,
    "name": "CSCA Diagnostic Test",
    "totalQuestions": 50,
    "timeLimitMinutes": 90,
    "passingThreshold": 60
  }
]
```

#### POST /diagnostic/start
Start diagnostic test
```json
{
  "diagnosticTestId": 1
}
```

#### POST /diagnostic/submit
Submit diagnostic test answers
```json
{
  "sessionId": "session_123",
  "answers": [
    {
      "questionId": 1,
      "answer": "A",
      "timeTaken": 45
    }
  ]
}
```

#### GET /diagnostic/results/:userId
Get diagnostic results
```json
{
  "score": 75,
  "percentage": 75.0,
  "weaknessAreas": [2, 5, 8],
  "recommendations": [
    "Focus on Data Structures",
    "Review Algorithms basics"
  ]
}
```

### Daily Study Plans

#### GET /daily-plan/today
Get today's study plan
```json
{
  "id": 1,
  "planDate": "2024-01-01",
  "modules": [
    {
      "moduleId": 1,
      "title": "Variables and Data Types",
      "allocatedMinutes": 45,
      "completed": false
    }
  ],
  "totalMinutes": 90,
  "completedMinutes": 0,
  "status": "PENDING"
}
```

#### POST /daily-plan/generate
Generate new daily plan
```json
{
  "date": "2024-01-01",
  "preferredMinutes": 90
}
```

#### PUT /daily-plan/:id/complete
Mark daily plan as completed
```json
{
  "completedMinutes": 85
}
```

### Study Sessions

#### POST /sessions/start
Start study session
```json
{
  "moduleId": 1,
  "sessionType": "LEARN"
}
```

#### POST /sessions/:id/end
End study session
```json
{
  "durationMinutes": 45,
  "questionsAttempted": 10,
  "questionsCorrect": 8
}
```

#### GET /sessions/history
Get study session history
```json
[
  {
    "id": 1,
    "moduleId": 1,
    "moduleTitle": "Variables and Data Types",
    "sessionType": "PRACTICE",
    "durationMinutes": 45,
    "score": 80,
    "startTime": "2024-01-01T10:00:00Z"
  }
]
```

### Progress Tracking

#### GET /progress/modules
Get module progress
```json
[
  {
    "moduleId": 1,
    "moduleTitle": "Variables and Data Types",
    "status": "COMPLETED",
    "score": 85,
    "attempts": 2,
    "timeSpentMinutes": 120,
    "completedAt": "2024-01-01T15:30:00Z"
  }
]
```

#### POST /progress/update
Update module progress
```json
{
  "moduleId": 1,
  "score": 85,
  "timeSpentMinutes": 60,
  "sessionType": "TEST"
}
```

#### GET /progress/weekly
Get weekly progress report
```json
{
  "weekStartDate": "2024-01-01",
  "totalMinutes": 450,
  "modulesCompleted": 3,
  "averageScore": 82,
  "dailyBreakdown": [
    {"date": "2024-01-01", "minutes": 90, "modulesCompleted": 1},
    {"date": "2024-01-02", "minutes": 60, "modulesCompleted": 0}
  ]
}
```

### Questions and Attempts

#### POST /questions/:id/attempt
Submit question attempt
```json
{
  "answer": "A",
  "timeTakenSeconds": 45,
  "sessionId": "session_123"
}
```

#### GET /questions/attempts/:moduleId
Get question attempts for a module
```json
[
  {
    "questionId": 1,
    "questionText": "What is a variable?",
    "userAnswer": "A",
    "isCorrect": true,
    "timeTakenSeconds": 45,
    "attemptedAt": "2024-01-01T10:30:00Z"
  }
]
```

### Weekly Tests

#### GET /weekly-tests/current
Get current weekly test
```json
{
  "id": 1,
  "weekStartDate": "2024-01-01",
  "modulesCovered": [1, 2, 3],
  "status": "PENDING",
  "dueDate": "2024-01-07T23:59:59Z"
}
```

#### POST /weekly-tests/start
Start weekly test
```json
{
  "weeklyTestId": 1
}
```

#### POST /weekly-tests/submit
Submit weekly test
```json
{
  "sessionId": "session_456",
  "answers": [
    {
      "questionId": 1,
      "answer": "B",
      "timeTaken": 60
    }
  ]
}
```

### Export and Reports

#### GET /export/progress/pdf
Export progress report as PDF
Query parameters:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `format`: `pdf` or `json`

#### GET /export/progress/csv
Export progress data as CSV

### System Settings

#### GET /settings
Get system settings
```json
{
  "dailyStudyMinutesMin": 60,
  "dailyStudyMinutesMax": 120,
  "inactivityPenaltyDays": 3,
  "moduleUnlockThreshold": 70
}
```

## Error Responses

All endpoints return consistent error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Access denied to resource
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `MODULE_LOCKED` (423): Module is locked due to prerequisites
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- Content endpoints: 100 requests per minute
- Progress endpoints: 200 requests per minute

## WebSocket Events
Real-time updates for:
- Session progress
- Daily plan completion
- Streak updates
- Module unlocks

Connection: `wss://api.csca-prep.com/ws`

Events:
```json
{
  "type": "SESSION_PROGRESS",
  "data": {
    "sessionId": "session_123",
    "progress": 45,
    "timeRemaining": 900
  }
}
```
