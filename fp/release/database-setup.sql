-- ============================================
-- BASE DE DATOS: TRABAJAPP
-- ============================================

DROP DATABASE IF EXISTS trabajapp_db;
CREATE DATABASE trabajapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trabajapp_db;

-- ============================================
-- TABLA: USUARIOS
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('cliente', 'trabajador', 'admin') NOT NULL,
    trade VARCHAR(100),
    registration_number VARCHAR(50),
    work_area VARCHAR(100),
    lat FLOAT,
    lng FLOAT,
    work_radius INT DEFAULT 10,
    work_location_lat DECIMAL(10, 8) NULL,
    work_location_lng DECIMAL(11, 8) NULL,
    work_schedule JSON NULL,
    immediate_availability BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_trade (trade),
    INDEX idx_work_location (work_location_lat, work_location_lng),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: SERVICIOS
-- ============================================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    worker_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    service_location_lat FLOAT NOT NULL,
    service_location_lng FLOAT NOT NULL,
    service_address VARCHAR(255),
    status ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    scheduled_date DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_client (client_id),
    INDEX idx_worker (worker_id),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: CÓDIGOS DE VERIFICACIÓN
-- ============================================
CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    is_used BOOLEAN DEFAULT false,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_service (service_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: CALIFICACIONES
-- ============================================
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    rater_id INT NOT NULL COMMENT 'ID del usuario que califica',
    rated_id INT NOT NULL COMMENT 'ID del usuario calificado',
    rater_type ENUM('client', 'worker') NOT NULL COMMENT 'Tipo del que califica',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_service (service_id),
    INDEX idx_rater (rater_id),
    INDEX idx_rated (rated_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: DISPUTAS
-- ============================================
CREATE TABLE disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    reported_by ENUM('client', 'worker') NOT NULL COMMENT 'Quién reporta el problema',
    reported_by_user_id INT NOT NULL COMMENT 'ID del usuario que reporta',
    reported_against_user_id INT NOT NULL COMMENT 'ID del usuario reportado',
    reason TEXT NOT NULL COMMENT 'Motivo de la disputa',
    evidence_url TEXT NULL COMMENT 'URLs de fotos/evidencias (JSON array)',
    worker_response TEXT NULL COMMENT 'Descargo del trabajador',
    worker_evidence_url TEXT NULL COMMENT 'Evidencias del trabajador (JSON array)',
    status ENUM('abierta', 'en_revision', 'resuelta_cliente', 'resuelta_trabajador', 'rechazada') DEFAULT 'abierta',
    admin_notes TEXT NULL COMMENT 'Notas del administrador',
    resolved_by INT NULL COMMENT 'ID del admin que resolvió',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_against_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_service (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: DISPONIBILIDAD
-- ============================================
CREATE TABLE availability_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    date DATE NOT NULL COMMENT 'Fecha específica bloqueada',
    reason VARCHAR(255) NULL COMMENT 'Motivo del bloqueo',
    is_available BOOLEAN DEFAULT false COMMENT 'true = disponible especial, false = no disponible',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_date (worker_id, date),
    INDEX idx_date (date),
    INDEX idx_worker (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: NOTIFICACIONES
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Usuario que recibe la notificación',
    type VARCHAR(50) NOT NULL COMMENT 'Tipo de notificación',
    title VARCHAR(255) NOT NULL COMMENT 'Título de la notificación',
    message TEXT NOT NULL COMMENT 'Mensaje detallado',
    link VARCHAR(255) NULL COMMENT 'URL a la que redirige',
    is_read BOOLEAN DEFAULT false COMMENT 'Si fue leída',
    related_id INT NULL COMMENT 'ID relacionado (servicio, disputa, etc)',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
SELECT '✅ Estructura de base de datos creada correctamente' AS status;