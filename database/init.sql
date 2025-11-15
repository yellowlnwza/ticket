-- INIT SQL FOR IT SUPPORT TICKET SYSTEM

-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS it_support CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_support;

-- TABLE: roles
CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- TABLE: tickets
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
  attachments VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- TABLE: comments
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ticket_id INT NULL, 
  message VARCHAR(255) NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- SEED DATA

-- เพิ่ม Role เริ่มต้น
INSERT INTO roles (role_name)
VALUES ('User'), ('Staff'), ('Admin');

-- เพิ่มผู้ใช้เริ่มต้น (Admin)
-- หมายเหตุ: ต้องแทนค่า <bcrypt-password> ด้วย hash จริง (จะอัปเดตต่อด้านล่าง)
INSERT INTO users (name, email, password_hash, role_id)
VALUES ('Administrator', 'admin@gmail.com', '$2b$10$YS97IuSLaXrriW6cycWmr.uxfiTEzLxyrZda6BA3MaY4Kq6PQpwlC', 3);
-- password ของ admin คือ: admin123

-- ตัวอย่างข้อมูลเริ่มต้น (optional)
INSERT INTO users (name, email, password_hash, role_id)
VALUES 
('IT Staff', 'staff@gmail.com', '$2b$10$YS97IuSLaXrriW6cycWmr.uxfiTEzLxyrZda6BA3MaY4Kq6PQpwlC', 2),
('Test User', 'user@gmail.com', '$2b$10$YS97IuSLaXrriW6cycWmr.uxfiTEzLxyrZda6BA3MaY4Kq6PQpwlC', 1);

