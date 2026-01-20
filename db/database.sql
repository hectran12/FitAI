-- ============================================
-- FitAI Complete Database Schema
-- MySQL 8.x compatible
-- All tables consolidated for easy deployment
-- ============================================

SET FOREIGN_KEY_CHECKS=0;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    is_banned TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- CSRF tokens table
CREATE TABLE IF NOT EXISTS csrf_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WORKOUT & PLANNING TABLES
-- ============================================

-- Exercises table (workout library)
CREATE TABLE IF NOT EXISTS exercises (
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
CREATE TABLE IF NOT EXISTS plans (
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
CREATE TABLE IF NOT EXISTS plan_days (
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
CREATE TABLE IF NOT EXISTS plan_items (
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
CREATE TABLE IF NOT EXISTS workout_logs (
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

-- ============================================
-- COMMUNITY TABLES
-- ============================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_type ENUM('question', 'achievement', 'general') DEFAULT 'general',
    content TEXT NOT NULL,
    image_path VARCHAR(500),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_posts_user (user_id),
    INDEX idx_posts_created (created_at DESC),
    INDEX idx_posts_type (post_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, user_id),
    INDEX idx_likes_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_post (post_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CHAT & FRIENDS TABLES
-- ============================================

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_friend_status (friend_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'voice', 'sticker') DEFAULT 'text',
    content TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INT,
    sticker_id INT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (sender_id, receiver_id, created_at),
    INDEX idx_receiver_unread (receiver_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sticker packs
CREATE TABLE IF NOT EXISTS sticker_packs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    thumbnail VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stickers
CREATE TABLE IF NOT EXISTS stickers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pack_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    emoji VARCHAR(10),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (pack_id) REFERENCES sticker_packs(id) ON DELETE CASCADE,
    INDEX idx_pack (pack_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MARKET TABLES
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS market_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    image VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categories_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS market_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    price DECIMAL(12,0) NOT NULL,
    sale_price DECIMAL(12,0),
    stock INT DEFAULT 0,
    tags VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    view_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    rating_avg DECIMAL(2,1) DEFAULT 0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES market_categories(id),
    INDEX idx_products_category (category_id, is_active),
    INDEX idx_products_price (price),
    INDEX idx_products_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product images table
CREATE TABLE IF NOT EXISTS market_product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES market_products(id) ON DELETE CASCADE,
    INDEX idx_images_product (product_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS market_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12,0) NOT NULL,
    status ENUM('pending','confirmed','shipping','delivered','cancelled') DEFAULT 'pending',
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_orders_user (user_id, created_at DESC),
    INDEX idx_orders_status (status),
    INDEX idx_orders_code (order_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS market_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    price DECIMAL(12,0) NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES market_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES market_products(id),
    INDEX idx_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS market_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES market_products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES market_orders(id),
    UNIQUE KEY unique_review (order_id, product_id),
    INDEX idx_reviews_product (product_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart table (for persistent cart)
CREATE TABLE IF NOT EXISTS market_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES market_products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MUSIC LIBRARY TABLES
-- ============================================

-- Music categories (Cardio, Gym, Yoga, etc.)
CREATE TABLE IF NOT EXISTS music_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'fa-music',
    description VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Music tracks
CREATE TABLE IF NOT EXISTS music_tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    file_url VARCHAR(500) NOT NULL,
    cover_image VARCHAR(500),
    duration INT DEFAULT 0 COMMENT 'Duration in seconds',
    bpm INT COMMENT 'Beats per minute for workout intensity',
    play_count INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES music_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id, is_active),
    INDEX idx_popular (play_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User favorites
CREATE TABLE IF NOT EXISTS music_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    track_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, track_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    position ENUM('sidebar_top', 'sidebar_bottom') DEFAULT 'sidebar_top',
    is_active TINYINT(1) DEFAULT 1,
    click_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ads_active (is_active, position, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PASSWORD RESET TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SETTINGS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default sticker pack
INSERT INTO sticker_packs (name, thumbnail) VALUES 
('Emoji Reactions', '/uploads/stickers/emoji_pack.png')
ON DUPLICATE KEY UPDATE name = name;

-- Insert default stickers
INSERT INTO stickers (pack_id, image_url, emoji, sort_order) VALUES 
(1, 'https://em-content.zobj.net/source/apple/391/grinning-face_1f600.png', '😀', 1),
(1, 'https://em-content.zobj.net/source/apple/391/face-with-tears-of-joy_1f602.png', '😂', 2),
(1, 'https://em-content.zobj.net/source/apple/391/smiling-face-with-heart-eyes_1f60d.png', '😍', 3),
(1, 'https://em-content.zobj.net/source/apple/391/thinking-face_1f914.png', '🤔', 4),
(1, 'https://em-content.zobj.net/source/apple/391/thumbs-up_1f44d.png', '👍', 5),
(1, 'https://em-content.zobj.net/source/apple/391/fire_1f525.png', '🔥', 6),
(1, 'https://em-content.zobj.net/source/apple/391/red-heart_2764-fe0f.png', '❤️', 7),
(1, 'https://em-content.zobj.net/source/apple/391/flexed-biceps_1f4aa.png', '💪', 8)
ON DUPLICATE KEY UPDATE emoji = emoji;

-- Insert default music categories
INSERT INTO music_categories (name, icon, description, sort_order) VALUES 
('Cardio', 'fa-running', 'Nhạc năng động cho bài tập cardio', 1),
('Gym', 'fa-dumbbell', 'Nhạc mạnh mẽ cho tập gym', 2),
('Yoga', 'fa-spa', 'Nhạc thư giãn cho yoga', 3),
('HIIT', 'fa-bolt', 'Nhạc cường độ cao cho HIIT', 4),
('Stretching', 'fa-child', 'Nhạc nhẹ nhàng cho giãn cơ', 5)
ON DUPLICATE KEY UPDATE name = name;

-- Insert default SMTP settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_username', '', 'Gmail email address'),
('smtp_password', '', 'Gmail app password'),
('smtp_from_email', 'noreply@fitai.com', 'From email address'),
('smtp_from_name', 'FitAI', 'From name')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
-- Add author settings to settings table
INSERT INTO settings (setting_key, setting_value, description) VALUES
('author_name', 'FitAI Team', 'Website author name'),
('author_bio', 'Chúng tôi là đội ngũ phát triển FitAI - ứng dụng thể hình thông minh sử dụng AI để tạo kế hoạch tập luyện cá nhân hóa. Sứ mệnh của chúng tôi là giúp mọi người đạt được mục tiêu sức khỏe một cách hiệu quả và bền vững.', 'Author biography'),
('author_avatar', '/images/logo.png', 'Author avatar URL'),
('author_email', '', 'Author email'),
('author_website', '', 'Author website URL'),
('author_location', '', 'Author location'),
('author_facebook', '', 'Facebook profile URL'),
('author_instagram', '', 'Instagram profile URL'),
('author_twitter', '', 'Twitter profile URL'),
('author_linkedin', '', 'LinkedIn profile URL'),
('author_github', '', 'GitHub profile URL')
ON DUPLICATE KEY UPDATE setting_key = setting_key;


-- ============================================
-- COMPLETE!
-- Database schema created successfully
-- ============================================
