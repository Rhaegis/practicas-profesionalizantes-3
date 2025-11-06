-- ==========================================
-- TRABAJAPP - Script de Creación de Base de Datos
-- ==========================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS trabajapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE trabajapp_db;

-- ==========================================
-- TABLA: users
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('cliente', 'trabajador', 'admin') NOT NULL,
    trade VARCHAR(100) DEFAULT NULL COMMENT 'Oficio del trabajador',
    work_area VARCHAR(255) DEFAULT NULL COMMENT 'Zona de trabajo',
    work_latitude DECIMAL(10, 8) DEFAULT NULL,
    work_longitude DECIMAL(11, 8) DEFAULT NULL,
    work_radius DECIMAL(5, 2) DEFAULT NULL COMMENT 'Radio en km',
    enrollment_number VARCHAR(100) DEFAULT NULL COMMENT 'Matrícula profesional',
    is_active BOOLEAN DEFAULT TRUE,
    weekly_schedule JSON DEFAULT NULL COMMENT 'Horarios semanales',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_trade (trade),
    INDEX idx_location (work_latitude, work_longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLA: services
-- ==========================================
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    client_id INT NOT NULL,
    worker_id INT NOT NULL,
    scheduled_date TIMESTAMP NULL,
    client_latitude DECIMAL(10, 8) NOT NULL,
    client_longitude DECIMAL(11, 8) NOT NULL,
    client_address VARCHAR(500) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_client (client_id),
    INDEX idx_worker (worker_id),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLA: verification_codes
-- ==========================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_service (service_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLA: ratings
-- ==========================================
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    rater_id INT NOT NULL COMMENT 'Quien califica',
    rated_user_id INT NOT NULL COMMENT 'Quien es calificado',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (service_id, rater_id, rated_user_id),
    INDEX idx_rated_user (rated_user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLA: disputes
-- ==========================================
CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    reported_by ENUM('client', 'worker') NOT NULL,
    reported_by_user_id INT NOT NULL,
    reported_against_user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('abierta', 'en_revision', 'resuelta_cliente', 'resuelta_trabajador', 'rechazada') NOT NULL DEFAULT 'abierta',
    worker_response TEXT DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    resolved_by INT DEFAULT NULL COMMENT 'ID del admin que resolvió',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_against_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_service (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLA: availability_blocks
-- ==========================================
CREATE TABLE IF NOT EXISTS availability_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    date DATE NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (worker_id, date),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLA: notifications
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Usuario que recibe la notificación',
    type VARCHAR(50) NOT NULL COMMENT 'Tipo de notificación',
    title VARCHAR(255) NOT NULL COMMENT 'Título de la notificación',
    message TEXT NOT NULL COMMENT 'Mensaje detallado',
    link VARCHAR(255) DEFAULT NULL COMMENT 'URL a la que redirige',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Si fue leída',
    related_id INT DEFAULT NULL COMMENT 'ID relacionado (servicio, disputa, etc)',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
SHOW TABLES;

SELECT '✅ Estructura de base de datos creada correctamente' AS status;
```

---

## ✅ **ESTRUCTURA FINAL DE `release/`:**
```
fp/release/
├── README.md                    ✅ Guía de pruebas
├── setup.sh                     ✅ Script Linux/Mac
├── setup.bat                    ✅ Script Windows
├── database-setup.sql           ✅ CREAR ESTE (estructura BD)
└── database-seed.sql            ✅ Datos de prueba