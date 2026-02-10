# CSCA PREP WEB - User Flow Diagrams

## 1. Onboarding Flow

```
START
  │
  ▼
[ Landing Page ]
  │
  ▼
[ Track Selection ]
  │
  ├─ CSCA Track ──────────────────────┐
  │                                  │
  └─ Chinese Scholarship Track ───────┤
                                     │
  ▼                                  ▼
[ Registration Form ]           [ Registration Form ]
  │                                  │
  ▼                                  ▼
[ Email Verification ]           [ Email Verification ]
  │                                  │
  ▼                                  ▼
[ Mandatory Diagnostic Test ] ←─────┘
  │
  ▼
[ Diagnostic Results ]
  │
  ▼
[ Personalized Study Plan Generated ]
  │
  ▼
[ Dashboard Access ]
```

### Onboarding Rules:
- **Track Selection**: User must choose exactly ONE track (cannot change later)
- **Diagnostic Test**: 50 questions, 90 minutes, mandatory before accessing content
- **Weakness Mapping**: System identifies weak areas and prioritizes them in study plan
- **First Daily Plan**: Generated based on diagnostic results

## 2. Daily Study Flow

```
START (Daily Login)
  │
  ▼
[ Dashboard - Today's Plan ]
  │
  ▼
[ Study Block Selection ]
  │
  ├─ LEARN (30 min)
  │   │
  │   ▼
  │   [ Module Content ]
  │   │
  │   ▼
  │   [ Visual Diagrams ]
  │   │
  │   ▼
  │   [ Quick Check (3 questions) ]
  │
  ├─ PRACTICE (45 min)
  │   │
  │   ▼
  │   [ MCQ Practice (10 questions) ]
  │   │
  │   ▼
  │   [ Coding Problems (2-3) ]
  │   │
  │   ▼
  │   [ Immediate Feedback ]
  │
  ├─ RECALL (15 min)
  │   │
  │   ▼
  │   [ Spaced Repetition Questions ]
  │   │
  │   ▼
  │   [ Previous Topics Review ]
  │
  └─ TEST (30 min)
      │
      ▼
      [ Timed Module Quiz ]
      │
      ▼
      [ Score ≥ 70%? ] ── No ──→ [ Retake Required ]
      │                           │
      Yes                         │
      │                           │
      ▼                           │
      [ Module Unlocked ] ←────────┘
```

### Daily Study Rules:
- **Time Blocks**: Fixed 60-120 minutes total per day
- **Sequence**: Must follow LEARN → PRACTICE → RECALL → TEST order
- **Module Locking**: Next module only unlocks after scoring ≥70% on current module test
- **Inactivity Penalty**: Missing 3+ consecutive days reduces progress score by 10%

## 3. Module Progression Flow

```
[ Module Start ]
  │
  ▼
[ Content Learning ]
  │
  ▼
[ Practice Questions ]
  │
  ▼
[ Module Assessment ]
  │
  ▼
[ Score Calculation ]
  │
  ├─ Score < 70% ──→ [ Review Required ]
  │   │                │
  │   └─ Retake After 24h
  │
  └─ Score ≥ 70% ──→ [ Module Completed ]
                        │
                        ▼
                    [ Next Module Unlocked ]
                        │
                        ▼
                    [ Progress Updated ]
```

### Progression Rules:
- **Minimum Score**: 70% required to unlock next module
- **Retake Limit**: Maximum 3 attempts per module
- **Cooldown**: 24-hour wait between retakes
- **Time Tracking**: All study time logged for progress metrics

## 4. Weekly Assessment Flow

```
[ Sunday - Weekly Test Available ]
  │
  ▼
[ Start Weekly Test ]
  │
  ▼
[ Mixed Questions from Week's Modules ]
  │
  ▼
[ 60-Minute Timer ]
  │
  ▼
[ Submit Answers ]
  │
  ▼
[ Score & Rank Calculation ]
  │
  ▼
[ Weekly Report Generated ]
  │
  ├─ Score < 60% ──→ [ Extra Practice Assigned ]
  │
  └─ Score ≥ 60% ──→ [ Next Week's Plan Adjusted ]
```

### Weekly Assessment Rules:
- **Mandatory**: All users must complete weekly test
- **Timing**: Available Sunday, due Sunday 11:59 PM
- **Content**: Covers all modules studied during the week
- **Adaptive Planning**: Next week's plan adjusts based on performance

## 5. Progress Tracking Flow

```
[ Real-time Progress Dashboard ]
  │
  ▼
[ Skill Heatmap ]
  │  ├─ Subject Mastery Levels
  │  ├─ Module Completion Status
  │  └─ Weakness Areas Highlighted
  │
  ▼
[ Study Consistency Tracker ]
  │  ├─ Current Streak
  │  ├─ Longest Streak
  │  └─ Missed Days Penalty
  │
  ▼
[ Performance Metrics ]
  │  ├─ Average Scores
  │  ├─ Time Spent per Subject
  │  └─ Improvement Trends
  │
  ▼
[ Export Reports ]
  │  ├─ PDF Progress Summary
  │  ├─ CSV Detailed Data
  │  └─ Printable Study Log
```

## 6. Diagnostic Test Flow

```
[ Pre-Test Instructions ]
  │
  ▼
[ 50 Questions - Mixed Topics ]
  │
  ├─ Mathematics (15 questions)
  ├─ Logical Reasoning (10 questions)
  ├─ English (10 questions)
  └─ Subject-Specific (15 questions)
  │
  ▼
[ 90-Minute Timer ]
  │
  ▼
[ Auto-Submit on Timeout ]
  │
  ▼
[ Immediate Score Calculation ]
  │
  ▼
[ Weakness Analysis ]
  │
  ├─ Identify Weak Subjects
  ├─ Map to Specific Topics
  └─ Generate Priority List
  │
  ▼
[ Personalized Study Path ]
  │
  └─ First 2 Weeks: Weak Areas Focus
      └─ Subsequent Weeks: Balanced Approach
```

### Diagnostic Rules:
- **One-Time Only**: Cannot retake diagnostic test
- **Comprehensive**: Covers all track subjects
- **Adaptive Planning**: Study plan prioritizes weak areas
- **Baseline**: Sets initial progress metrics

## 7. Inactivity Penalty Flow

```
[ 3 Days No Activity Detected ]
  │
  ▼
[ Warning Notification Sent ]
  │
  ▼
[ 24 Hours to Respond ]
  │
  ├─ User Logs In ──→ [ Penalty Cancelled ]
  │
  └─ No Response ──→ [ Penalty Applied ]
      │
      ▼
  [ Progress Score -10% ]
      │
      ▼
  [ Streak Reset to 0 ]
      │
      ▼
  [ Additional Practice Assigned ]
```

### Inactivity Rules:
- **Grace Period**: 3 days of inactivity allowed
- **Warning**: Email/notification sent on day 3
- **Penalty**: 10% progress reduction, streak reset
- **Recovery**: Extra practice required to regain lost progress

## 8. Module Unlock Logic Flow

```
[ User Attempts Module Test ]
  │
  ▼
[ Score Calculation ]
  │
  ├─ Score < 70% ──→ [ Module Remains Locked ]
  │   │                │
  │   └─ Show: "Score X% (Need 70% to unlock)"
  │
  └─ Score ≥ 70% ──→ [ Check Prerequisites ]
      │
      ├─ All Previous Modules Complete ──→ [ Unlock Next Module ]
      │
      └─ Missing Prerequisites ──→ [ Unlock First Missing Module ]
```

### Unlock Rules:
- **Sequential**: Must complete modules in order
- **Threshold**: 70% minimum score required
- **Prerequisites**: All previous modules must be completed
- **Immediate**: Next module unlocks immediately upon meeting criteria

## 9. Study Session Flow

```
[ Start Session ]
  │
  ▼
[ Select Module & Activity Type ]
  │
  ▼
[ Timer Starts ]
  │
  ▼
[ Activity in Progress ]
  │
  ├─ Real-time Saving
  ├─ Progress Updates
  └─ Time Tracking
  │
  ▼
[ Session End ]
  │
  ▼
[ Data Processing ]
  │  ├─ Calculate Score
  │  ├─ Update Progress
  │  ├─ Log Activity
  │  └─ Check Unlocks
  │
  ▼
[ Session Summary ]
  │
  └─ Next Recommendations
```

## 10. Export & Reporting Flow

```
[ User Requests Export ]
  │
  ▼
[ Select Date Range ]
  │
  ▼
[ Choose Format ]
  │
  ├─ PDF Summary Report
  ├─ CSV Detailed Data
  └─ JSON Raw Data
  │
  ▼
[ Generate Report ]
  │
  ▼
[ Include Metrics ]
  │  ├─ Overall Progress
  │  ├─ Subject Mastery
  │  ├─ Study Consistency
  │  ├─ Time Distribution
  │  └─ Performance Trends
  │
  ▼
[ Download/Email Report ]
```

### Export Features:
- **Date Range**: Customizable time periods
- **Multiple Formats**: PDF, CSV, JSON
- **Comprehensive**: All progress metrics included
- **Printable**: Optimized for physical study logs
