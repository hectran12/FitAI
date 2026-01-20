-- Settings table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default SMTP settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_username', '', 'Gmail email address'),
('smtp_password', '', 'Gmail app password'),
('smtp_from_email', 'noreply@fitai.com', 'From email address'),
('smtp_from_name', 'FitAI', 'From name')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
