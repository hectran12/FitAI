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
