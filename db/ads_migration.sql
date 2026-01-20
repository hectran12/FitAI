-- Ads Management Migration
-- Run this to add ads functionality

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
