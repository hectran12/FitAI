-- FitAI Database Schema
-- MySQL 8.x compatible

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS plan_items;
DROP TABLE IF EXISTS plan_days;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS csrf_tokens;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles table
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    display_name VARCHAR(100),
    avatar VARCHAR(255),
    bio TEXT,
    social_links JSON,
    goal ENUM('fat_loss', 'muscle_gain', 'maintenance') DEFAULT 'maintenance',
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    days_per_week TINYINT DEFAULT 3 CHECK (days_per_week >= 3 AND days_per_week <= 6),
    session_minutes TINYINT DEFAULT 45 CHECK (session_minutes >= 20 AND session_minutes <= 90),
    equipment ENUM('none', 'home', 'gym') DEFAULT 'none',
    constraints_text TEXT,
    availability JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exercises table (workout library)
CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group ENUM('chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body', 'cardio') NOT NULL,
    equipment ENUM('none', 'home', 'gym') NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    description TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_muscle_group (muscle_group),
    INDEX idx_equipment (equipment),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plans table (weekly workout plans)
CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    week_start DATE NOT NULL,
    principles JSON,
    notes JSON,
    is_adjusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_week (user_id, week_start),
    INDEX idx_user_week (user_id, week_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plan days table (individual days in a plan)
CREATE TABLE plan_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(100) NOT NULL,
    estimated_minutes INT DEFAULT 45,
    day_order TINYINT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_plan_date (plan_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plan items table (exercises within a day)
CREATE TABLE plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_day_id INT NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    sets TINYINT NOT NULL DEFAULT 3,
    reps VARCHAR(20) NOT NULL DEFAULT '10-12',
    rest_sec INT DEFAULT 60,
    notes TEXT,
    order_index TINYINT NOT NULL,
    FOREIGN KEY (plan_day_id) REFERENCES plan_days(id) ON DELETE CASCADE,
    INDEX idx_plan_day (plan_day_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workout logs table (user progress tracking)
CREATE TABLE workout_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_day_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('done', 'skipped', 'partial') NOT NULL,
    fatigue_rating TINYINT CHECK (fatigue_rating >= 1 AND fatigue_rating <= 5),
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_day_id) REFERENCES plan_days(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_day (user_id, plan_day_id),
    INDEX idx_user_logs (user_id, logged_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CSRF tokens table
CREATE TABLE csrf_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
