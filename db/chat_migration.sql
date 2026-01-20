-- Chat & Friends Migration
-- Run: SOURCE db/chat_migration.sql;

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

-- Insert default sticker pack (emoji reactions)
INSERT INTO sticker_packs (name, thumbnail) VALUES 
('Emoji Reactions', '/uploads/stickers/emoji_pack.png');

-- Insert some default stickers (emoji URLs)
INSERT INTO stickers (pack_id, image_url, emoji, sort_order) VALUES 
(1, 'https://em-content.zobj.net/source/apple/391/grinning-face_1f600.png', '😀', 1),
(1, 'https://em-content.zobj.net/source/apple/391/face-with-tears-of-joy_1f602.png', '😂', 2),
(1, 'https://em-content.zobj.net/source/apple/391/smiling-face-with-heart-eyes_1f60d.png', '😍', 3),
(1, 'https://em-content.zobj.net/source/apple/391/thinking-face_1f914.png', '🤔', 4),
(1, 'https://em-content.zobj.net/source/apple/391/thumbs-up_1f44d.png', '👍', 5),
(1, 'https://em-content.zobj.net/source/apple/391/fire_1f525.png', '🔥', 6),
(1, 'https://em-content.zobj.net/source/apple/391/red-heart_2764-fe0f.png', '❤️', 7),
(1, 'https://em-content.zobj.net/source/apple/391/flexed-biceps_1f4aa.png', '💪', 8);
