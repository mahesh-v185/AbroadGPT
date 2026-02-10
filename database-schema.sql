-- CSCA PREP WEB - Database Schema
-- PostgreSQL Schema for Disciplined Learning Platform

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    track_id INTEGER REFERENCES tracks(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    diagnostic_completed BOOLEAN DEFAULT FALSE,
    diagnostic_score INTEGER,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00
);

-- Learning tracks
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL -- 'CSCA' or 'CHINESE_SCHOLARSHIP'
);

-- Insert official tracks
INSERT INTO tracks (id, name, description, code) VALUES 
(1, 'CSCA Core Sciences', 'China Scholarship Council Core Science Subjects', 'CSCA'),
(2, 'Chinese Scholarship Assessment', 'Comprehensive Chinese Government Scholarship Assessment', 'CHINESE_SCHOLARSHIP');

-- Subjects within tracks
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules within subjects
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT, -- HTML content for explanations
    diagram_url VARCHAR(500), -- Path to visual diagram
    order_index INTEGER NOT NULL,
    unlock_threshold INTEGER DEFAULT 70, -- Score percentage needed to unlock
    estimated_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert official CSCA subjects
INSERT INTO subjects (track_id, name, description, order_index) VALUES 
-- CSCA Track (Track ID 1)
(1, 'Mathematics', 'Sets and Inequalities, Functions, Geometry and Algebra, Probability and Statistics', 1),
(1, 'Physics', 'Mechanics, Electromagnetism, Thermodynamics, Optics, Modern Physics', 2),
(1, 'Chemistry', 'Basic Chemical Concepts, Properties and Reactions, Chemical Theories, Chemical Experiments', 3);

-- Insert official CSCA modules
INSERT INTO modules (subject_id, title, description, order_index, estimated_minutes) VALUES 
-- Mathematics Modules (Subject ID 1)
(1, 'Sets and Inequalities', 'Definition, operations, representation of sets; Basic properties and solution methods of inequalities', 1, 60),
(1, 'Functions', 'Concepts and properties; Basic elementary functions; Sequences; Basics of derivatives and calculus', 2, 90),
(1, 'Geometry and Algebra', 'Plane analytic geometry; Vectors and complex numbers; Solid geometry', 3, 90),
(1, 'Probability and Statistics', 'Classical probability model; Numerical characteristics; Normal distribution', 4, 60),

-- Physics Modules (Subject ID 2)
(2, 'Mechanics', 'Kinematics; Newton''s laws; Momentum and impulse; Work and energy; Circular motion; Simple harmonic motion', 1, 120),
(2, 'Electromagnetism', 'Electrostatics; Direct current circuits; Magnetic field; Electromagnetic induction', 2, 120),
(2, 'Thermodynamics', 'Kinetic theory of gases; Ideal gas equation; First law of thermodynamics', 3, 60),
(2, 'Optics', 'Geometrical optics; Physical optics', 4, 60),
(2, 'Modern Physics', 'Photoelectric effect; Atomic structure; Nuclear physics', 5, 60),

-- Chemistry Modules (Subject ID 3)
(3, 'Basic Chemical Concepts and Calculations', 'Classification and state changes; Chemical notation; Solution concentration; Amount of substance calculations; Ideal gas law', 1, 90),
(3, 'Properties and Reactions of Substances', 'Common inorganic substances; Basic organic compounds; Redox reactions; Ionic reactions', 2, 120),
(3, 'Chemical Theories and Laws', 'Atomic structure and periodic law; Chemical bonds; Reaction rate and equilibrium; Electrolyte solutions', 3, 120),
(3, 'Chemical Experiments and Applications', 'Laboratory safety; Gas preparation; Separation methods; Industrial processes', 4, 90);

-- Questions bank
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    question_type VARCHAR(20) NOT NULL, -- 'MCQ', 'CODING', 'CASE', 'ESSAY'
    question_text TEXT NOT NULL,
    options JSONB, -- For MCQs
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty INTEGER DEFAULT 1, -- 1-5 scale
    points INTEGER DEFAULT 10,
    time_limit_seconds INTEGER DEFAULT 120
);

-- User progress tracking
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'LOCKED', -- 'LOCKED', 'IN_PROGRESS', 'COMPLETED'
    score_percentage INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Daily study plans
CREATE TABLE daily_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    modules JSONB, -- Array of module IDs and allocated time
    total_minutes INTEGER DEFAULT 90,
    completed_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, plan_date)
);

-- Study sessions
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    session_type VARCHAR(20) NOT NULL, -- 'LEARN', 'PRACTICE', 'RECALL', 'TEST'
    score INTEGER,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0
);

-- Question attempts
CREATE TABLE question_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES study_sessions(id) ON DELETE SET NULL,
    user_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken_seconds INTEGER,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnostic tests
CREATE TABLE diagnostic_tests (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_questions INTEGER NOT NULL,
    time_limit_minutes INTEGER NOT NULL,
    passing_threshold INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE
);

-- User diagnostic results
CREATE TABLE user_diagnostics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    diagnostic_test_id INTEGER REFERENCES diagnostic_tests(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    weakness_areas JSONB, -- Array of subject IDs needing focus
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly tests
CREATE TABLE weekly_tests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    modules_covered JSONB, -- Array of module IDs
    score INTEGER,
    percentage DECIMAL(5,2),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log for consistency tracking
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'LOGIN', 'MODULE_START', 'MODULE_COMPLETE', 'DAILY_COMPLETE'
    activity_data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tracks
INSERT INTO tracks (name, description, code) VALUES 
('Computer Science Core Areas', 'Comprehensive CS fundamentals preparation', 'CSCA'),
('Chinese Government Scholarship', 'Preparation for CSC and Chinese university entrance exams', 'CHINESE_SCHOLARSHIP');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('daily_study_minutes_min', '60', 'Minimum daily study time'),
('daily_study_minutes_max', '120', 'Maximum daily study time'),
('inactivity_penalty_days', '3', 'Days of inactivity before penalty'),
('module_unlock_threshold', '75', 'Default score needed to unlock next module'),
('streak_bonus_percentage', '5', 'Bonus percentage for maintaining streak');

-- Indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_module_id ON study_sessions(module_id);
CREATE INDEX idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX idx_daily_plans_plan_date ON daily_plans(plan_date);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
