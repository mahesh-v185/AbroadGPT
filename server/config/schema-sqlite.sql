-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    track_id INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    status TEXT DEFAULT 'not_started',
    score INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    session_type TEXT DEFAULT 'practice',
    duration_minutes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT OR IGNORE INTO tracks (id, name, description, code) VALUES 
(1, 'CSCA Core Sciences', 'Comprehensive CSCA sciences preparation', 'CSCA'),
(2, 'Chinese Scholarship Assessment', 'Preparation for CSC and Chinese university entrance exams', 'CHINESE_SCHOLARSHIP');

INSERT OR IGNORE INTO subjects (id, track_id, name, description, order_index) VALUES 
(1, 1, 'Mathematics', 'Advanced mathematics for CSCA preparation', 1),
(2, 1, 'Physics', 'Physics concepts and problem solving', 2),
(3, 1, 'Chemistry', 'Chemistry fundamentals and applications', 3);

INSERT OR IGNORE INTO modules (id, subject_id, title, description, order_index) VALUES 
(1, 1, 'Algebra and Functions', 'Linear equations, quadratic functions, and polynomials', 1),
(2, 1, 'Calculus', 'Limits, derivatives, and integration', 2),
(3, 1, 'Statistics and Probability', 'Data analysis, probability theory, and statistical inference', 3),
(4, 2, 'Mechanics', 'Force, motion, energy, and momentum', 1),
(5, 2, 'Thermodynamics', 'Heat, temperature, and energy transfer', 2),
(6, 2, 'Electromagnetism', 'Electric and magnetic fields, circuits, and waves', 3),
(7, 3, 'Atomic Structure', 'Atoms, molecules, and chemical bonding', 1),
(8, 3, 'Chemical Reactions', 'Reaction types, kinetics, and equilibrium', 2),
(9, 3, 'Organic Chemistry', 'Carbon compounds and organic reactions', 3);

INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description) VALUES 
('daily_study_minutes_min', '60', 'Minimum daily study time'),
('daily_study_minutes_max', '120', 'Maximum daily study time'),
('inactivity_penalty_days', '3', 'Days of inactivity before penalty'),
('module_unlock_threshold', '75', 'Default score needed to unlock next module'),
('streak_bonus_percentage', '5', 'Bonus percentage for maintaining streak');
