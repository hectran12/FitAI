-- Music Library Migration
-- Run: SOURCE db/music_migration.sql;

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

-- Insert default categories
INSERT INTO music_categories (name, icon, description, sort_order) VALUES 
('Cardio', 'fa-running', 'Nhạc năng động cho bài tập cardio', 1),
('Gym', 'fa-dumbbell', 'Nhạc mạnh mẽ cho tập gym', 2),
('Yoga', 'fa-spa', 'Nhạc thư giãn cho yoga', 3),
('HIIT', 'fa-bolt', 'Nhạc cường độ cao cho HIIT', 4),
('Stretching', 'fa-child', 'Nhạc nhẹ nhàng cho giãn cơ', 5);
