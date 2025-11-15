-- IT Support Ticket System - Database Initialization Script
-- สคริปต์นี้จะถูกรันอัตโนมัติเมื่อ start Docker container ครั้งแรก

-- สร้าง Database (ถ้ายังไม่มี)
CREATE DATABASE IF NOT EXISTS it_support 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE it_support;

-- ====================
-- สร้างตาราง Roles
-- ====================
CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT IGNORE INTO roles (role_id, role_name) VALUES
(1, 'User'),
(2, 'Staff'),
(3, 'Admin');

-- ====================
-- สร้างตาราง Users
-- ====================
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL DEFAULT 1,
  status ENUM('Active', 'Suspended') NOT NULL DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default users
-- Password สำหรับทุก user: 12345678
INSERT IGNORE INTO users (user_id, name, email, password_hash, role_id, status) VALUES
(1, 'Administrator', 'admin@gmail.com', '$2b$10$Oh43MJIc9eQlSAouZuxxpeGuedQNSGXwzHzWYRO2shvMj8Lv2ccJS', 3, 'Active'),
(2, 'IT Staff', 'staff@gmail.com', '$2b$10$BwlVqHJi8SWned1gixN3I.U/tKDT5h2yaJGkMJ9iRTWw3I2m6Clp6', 2, 'Active'),
(3, 'Test User', 'user@gmail.com', '$2b$10$2S/70sCDJrw5F9ENOUN8ceicHhP5mdDRCJFuzEozm6G9g8914/sWG', 1, 'Active');

-- ====================
-- สร้างตาราง Tickets
-- ====================
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
  assigned_to INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_priority (priority),
  INDEX idx_tickets_assigned_to (assigned_to),
  INDEX idx_tickets_user_id (user_id),
  INDEX idx_tickets_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================
-- สร้างตาราง Comments
-- ====================
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_comments_ticket_id (ticket_id),
  INDEX idx_comments_user_id (user_id),
  INDEX idx_comments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================
-- สร้างตาราง Notifications
-- ====================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read),
  INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================
-- สร้างตาราง SLAs (สำหรับใช้ในอนาคต)
-- ====================
CREATE TABLE IF NOT EXISTS slas (
  sla_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  response_time INT NULL COMMENT 'เวลาตอบกลับ (นาที)',
  resolution_time INT NULL COMMENT 'เวลาแก้ไข (นาที)',
  due_by DATETIME NULL,
  breached BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================
-- สร้างตาราง Attachments (สำหรับ file uploads - optional)
-- ====================
CREATE TABLE IF NOT EXISTS attachments (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL COMMENT 'ขนาดไฟล์ (bytes)',
  file_type VARCHAR(100) NOT NULL,
  uploaded_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_attachments_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================
-- Insert Sample Data (สำหรับ testing)
-- ====================

-- Sample Tickets
INSERT IGNORE INTO tickets (ticket_id, user_id, title, description, priority, status, category, assigned_to) VALUES
(1, 3, 'Printer on 3rd floor not working', 'The printer shows error: Paper jam. I already checked but no paper stuck.', 'High', 'In Progress', 'Hardware', 2),
(2, 3, 'Cannot access email', 'I forgot my email password and cannot reset it', 'Medium', 'Open', 'Account', NULL),
(3, 3, 'Laptop running very slow', 'My laptop has been very slow for the past week. Takes 5 minutes to boot.', 'Medium', 'Resolved', 'Software', 2);

-- Sample Comments
INSERT IGNORE INTO comments (comment_id, ticket_id, user_id, content) VALUES
(1, 1, 2, 'I will check the printer this afternoon. Can you tell me the printer model number?'),
(2, 1, 3, 'It is HP LaserJet Pro M404dn'),
(3, 1, 2, 'Thank you. I found the issue and fixed it. The paper tray was jammed in the back.'),
(4, 3, 2, 'I checked your laptop. It had too many startup programs. I disabled them and cleaned up disk space. Should be faster now.');

-- Sample Notifications
INSERT IGNORE INTO notifications (notification_id, user_id, message, is_read) VALUES
(1, 3, 'Your ticket #1 "Printer on 3rd floor not working" has been assigned to IT Staff', TRUE),
(2, 3, 'Status of ticket #1 has been changed to "In Progress"', TRUE),
(3, 3, 'IT Staff added a comment to your ticket #1', FALSE);

-- ====================
-- Create Views (สำหรับ reporting)
-- ====================

-- View: Ticket Summary by Status
CREATE OR REPLACE VIEW v_ticket_summary_by_status AS
SELECT 
  status,
  COUNT(*) as count,
  AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_resolution_hours
FROM tickets
GROUP BY status;

-- View: Ticket Summary by Priority
CREATE OR REPLACE VIEW v_ticket_summary_by_priority AS
SELECT 
  priority,
  COUNT(*) as count
FROM tickets
GROUP BY priority;

-- View: Staff Workload
CREATE OR REPLACE VIEW v_staff_workload AS
SELECT 
  u.user_id,
  u.name,
  COUNT(t.ticket_id) as assigned_tickets,
  SUM(CASE WHEN t.status = 'Open' THEN 1 ELSE 0 END) as open_tickets,
  SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tickets
FROM users u
LEFT JOIN tickets t ON u.user_id = t.assigned_to
WHERE u.role_id = 2
GROUP BY u.user_id, u.name;

-- ====================
-- Create Stored Procedures (optional)
-- ====================

DELIMITER $$

-- Procedure: Get Ticket Statistics
CREATE PROCEDURE IF NOT EXISTS sp_get_ticket_stats()
BEGIN
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open,
    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed
  FROM tickets;
END$$

DELIMITER ;

-- ====================
-- Setup Complete
-- ====================

-- แสดง summary
SELECT 'Database Initialization Complete!' as Status;
SELECT CONCAT('Total Roles: ', COUNT(*)) as Summary FROM roles;
SELECT CONCAT('Total Users: ', COUNT(*)) as Summary FROM users;
SELECT CONCAT('Sample Tickets: ', COUNT(*)) as Summary FROM tickets;
SELECT CONCAT('Sample Comments: ', COUNT(*)) as Summary FROM comments;

-- แสดง default users
SELECT 
  user_id,
  name,
  email,
  role_name,
  status
FROM users u
JOIN roles r ON u.role_id = r.role_id
ORDER BY u.role_id;