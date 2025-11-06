-- ==========================================
-- TRABAJAPP - Datos de Prueba (SEED)
-- ==========================================
-- Usuarios, servicios y datos de ejemplo para testing
-- ==========================================

USE trabajapp_db;

-- ==========================================
-- Limpiar datos existentes (solo para testing)
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE availability_blocks;
TRUNCATE TABLE disputes;
TRUNCATE TABLE ratings;
TRUNCATE TABLE verification_codes;
TRUNCATE TABLE services;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- USUARIOS DE PRUEBA
-- ==========================================

-- Contraseña para todos: "test123"
-- Hash generado con bcrypt(10): $2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a

-- Admin
INSERT INTO users (id, full_name, email, password, role, is_active, createdAt, updatedAt) VALUES
(1, 'Admin Principal', 'admin@trabajapp.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'admin', TRUE, NOW(), NOW());

-- Clientes
INSERT INTO users (id, full_name, email, password, role, is_active, createdAt, updatedAt) VALUES
(2, 'Juan Pérez', 'juan@cliente.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'cliente', TRUE, NOW(), NOW()),
(3, 'María González', 'maria@cliente.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'cliente', TRUE, NOW(), NOW()),
(4, 'Carlos Rodríguez', 'carlos@cliente.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'cliente', TRUE, NOW(), NOW());

-- Trabajadores
INSERT INTO users (id, full_name, email, password, role, trade, work_area, work_latitude, work_longitude, work_radius, enrollment_number, is_active, weekly_schedule, createdAt, updatedAt) VALUES
(5, 'Roberto Martínez', 'roberto@trabajador.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'trabajador', 'Plomero', 'Buenos Aires, CABA', -34.6037, -58.3816, 10.00, 'MAT-12345', TRUE, 
'{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"14:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}', 
NOW(), NOW()),

(6, 'Ana López', 'ana@trabajador.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'trabajador', 'Electricista', 'Buenos Aires, Palermo', -34.5889, -58.4199, 15.00, 'MAT-67890', TRUE,
'{"monday":{"enabled":true,"start":"08:00","end":"17:00"},"tuesday":{"enabled":true,"start":"08:00","end":"17:00"},"wednesday":{"enabled":true,"start":"08:00","end":"17:00"},"thursday":{"enabled":true,"start":"08:00","end":"17:00"},"friday":{"enabled":true,"start":"08:00","end":"17:00"},"saturday":{"enabled":true,"start":"09:00","end":"13:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}',
NOW(), NOW()),

(7, 'Diego Fernández', 'diego@trabajador.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'trabajador', 'Carpintero', 'Buenos Aires, Belgrano', -34.5628, -58.4551, 12.00, 'MAT-11111', TRUE,
'{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"14:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}',
NOW(), NOW()),

(8, 'Laura Sánchez', 'laura@trabajador.com', '$2a$10$XkZ8w7AwP5HfQK3QqZJHsOYWl8VXj4FLJZxKYq5vE8EYfzYtgQG9a', 'trabajador', 'Pintor', 'Buenos Aires, Recoleta', -34.5871, -58.3956, 8.00, 'MAT-22222', TRUE,
'{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"14:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}',
NOW(), NOW());

-- ==========================================
-- SERVICIOS DE PRUEBA
-- ==========================================

-- Servicio completado (con código verificado)
INSERT INTO services (id, title, description, status, client_id, worker_id, scheduled_date, client_latitude, client_longitude, client_address, createdAt, updatedAt) VALUES
(1, 'Reparación de cañería en cocina', 'Pérdida de agua en la cañería debajo de la pileta de la cocina', 'completed', 2, 5, DATE_ADD(NOW(), INTERVAL -5 DAY), -34.6037, -58.3816, 'Av. Corrientes 1234, CABA', DATE_ADD(NOW(), INTERVAL -6 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY));

-- Servicio en progreso
INSERT INTO services (id, title, description, status, client_id, worker_id, scheduled_date, client_latitude, client_longitude, client_address, createdAt, updatedAt) VALUES
(2, 'Instalación de toma eléctrica', 'Necesito instalar una toma eléctrica nueva en el living', 'in_progress', 3, 6, NOW(), -34.5889, -58.4199, 'Av. Santa Fe 2500, Palermo', DATE_ADD(NOW(), INTERVAL -2 DAY), NOW());

-- Servicio aceptado (programado para futuro)
INSERT INTO services (id, title, description, status, client_id, worker_id, scheduled_date, client_latitude, client_longitude, client_address, createdAt, updatedAt) VALUES
(3, 'Reparación de mueble de madera', 'Tengo un mueble antiguo que necesita reparación', 'accepted', 4, 7, DATE_ADD(NOW(), INTERVAL 2 DAY), -34.5628, -58.4551, 'Calle Juramento 1800, Belgrano', DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY));

-- Servicio pendiente
INSERT INTO services (id, title, description, status, client_id, worker_id, scheduled_date, client_latitude, client_longitude, client_address, createdAt, updatedAt) VALUES
(4, 'Pintura de habitación', 'Necesito pintar una habitación de 4x3 metros', 'pending', 2, 8, DATE_ADD(NOW(), INTERVAL 5 DAY), -34.5871, -58.3956, 'Av. Las Heras 3000, Recoleta', NOW(), NOW());

-- Servicio rechazado
INSERT INTO services (id, title, description, status, client_id, worker_id, scheduled_date, client_latitude, client_longitude, client_address, createdAt, updatedAt) VALUES
(5, 'Cambio de luminaria', 'Cambiar luminaria del techo', 'rejected', 3, 6, DATE_ADD(NOW(), INTERVAL 3 DAY), -34.6037, -58.3816, 'Av. Rivadavia 5000, CABA', DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY));

-- ==========================================
-- CÓDIGOS DE VERIFICACIÓN
-- ==========================================

-- Código para servicio completado (ya usado)
INSERT INTO verification_codes (id, service_id, code, is_used, expires_at, createdAt, updatedAt) VALUES
(1, 1, '123456', TRUE, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY));

-- Código para servicio en progreso (disponible)
INSERT INTO verification_codes (id, service_id, code, is_used, expires_at, createdAt, updatedAt) VALUES
(2, 2, '789012', FALSE, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW());

-- ==========================================
-- CALIFICACIONES
-- ==========================================

-- Cliente califica a trabajador (servicio 1)
INSERT INTO ratings (id, service_id, rater_id, rated_user_id, rating, comment, createdAt, updatedAt) VALUES
(1, 1, 2, 5, 5, 'Excelente trabajo, muy profesional y puntual. Lo recomiendo 100%.', DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY));

-- Trabajador califica a cliente (servicio 1)
INSERT INTO ratings (id, service_id, rater_id, rated_user_id, rating, comment, createdAt, updatedAt) VALUES
(2, 1, 5, 2, 5, 'Cliente muy amable y respetuoso. Pago en tiempo y forma.', DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY));

-- Más calificaciones para Roberto (trabajador id=5)
INSERT INTO ratings (id, service_id, rater_id, rated_user_id, rating, comment, createdAt, updatedAt) VALUES
(3, 1, 3, 5, 4, 'Buen trabajo, aunque tardó un poco más de lo esperado.', DATE_ADD(NOW(), INTERVAL -10 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY)),
(4, 1, 4, 5, 5, 'Impecable. Muy recomendable.', DATE_ADD(NOW(), INTERVAL -15 DAY), DATE_ADD(NOW(), INTERVAL -15 DAY));

-- Calificaciones para Ana (trabajador id=6)
INSERT INTO ratings (id, service_id, rater_id, rated_user_id, rating, comment, createdAt, updatedAt) VALUES
(5, 2, 2, 6, 5, 'Excelente electricista, muy profesional.', DATE_ADD(NOW(), INTERVAL -8 DAY), DATE_ADD(NOW(), INTERVAL -8 DAY)),
(6, 2, 4, 6, 4, 'Muy buen servicio.', DATE_ADD(NOW(), INTERVAL -12 DAY), DATE_ADD(NOW(), INTERVAL -12 DAY));

-- ==========================================
-- DISPUTAS
-- ==========================================

-- Disputa abierta (sin respuesta del trabajador)
INSERT INTO disputes (id, service_id, reported_by, reported_by_user_id, reported_against_user_id, reason, status, worker_response, admin_notes, resolved_by, createdAt, updatedAt) VALUES
(1, 2, 'client', 3, 6, 'El trabajo no se completó según lo acordado. Falta instalar el interruptor.', 'abierta', NULL, NULL, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY));

-- Disputa en revisión (con respuesta del trabajador)
INSERT INTO disputes (id, service_id, reported_by, reported_by_user_id, reported_against_user_id, reason, status, worker_response, admin_notes, resolved_by, createdAt, updatedAt) VALUES
(2, 1, 'client', 2, 5, 'La reparación volvió a presentar pérdidas después de 2 días.', 'en_revision', 'El cliente no mencionó que había otro problema adicional en la cañería. Estoy dispuesto a volver a revisar sin cargo.', NULL, NULL, DATE_ADD(NOW(), INTERVAL -3 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY));

-- Disputa resuelta a favor del cliente
INSERT INTO disputes (id, service_id, reported_by, reported_by_user_id, reported_against_user_id, reason, status, worker_response, admin_notes, resolved_by, createdAt, updatedAt) VALUES
(3, 5, 'client', 3, 6, 'El trabajador rechazó el trabajo sin justificación válida.', 'resuelta_cliente', 'Tuve un imprevisto familiar ese día.', 'Se resuelve a favor del cliente ya que debió avisar con anticipación.', 1, DATE_ADD(NOW(), INTERVAL -10 DAY), DATE_ADD(NOW(), INTERVAL -7 DAY));

-- ==========================================
-- BLOQUEOS DE DISPONIBILIDAD
-- ==========================================

-- Roberto tiene bloqueado el próximo domingo
INSERT INTO availability_blocks (id, worker_id, date, reason, createdAt, updatedAt) VALUES
(1, 5, DATE_ADD(CURDATE(), INTERVAL 7 - WEEKDAY(CURDATE()) DAY), 'Día familiar', NOW(), NOW());

-- Ana tiene bloqueado un día futuro
INSERT INTO availability_blocks (id, worker_id, date, reason, createdAt, updatedAt) VALUES
(2, 6, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Curso de capacitación', NOW(), NOW());

-- ==========================================
-- NOTIFICACIONES
-- ==========================================

-- Notificaciones para cliente Juan (id=2)
INSERT INTO notifications (user_id, type, title, message, link, is_read, related_id, createdAt, updatedAt) VALUES
(2, 'service_accepted', '✅ Solicitud aceptada', 'Roberto Martínez ha aceptado tu solicitud de Reparación de cañería en cocina', 'client-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY)),
(2, 'service_completed', '✅ Trabajo completado', 'El trabajador ha marcado el trabajo como completado. Por favor, verifica y confirma.', 'client-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY)),
(2, 'code_generated', '🔑 Código de verificación disponible', 'Tu código de verificación está listo. Entrégalo al trabajador para completar el servicio.', 'client-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY)),
(2, 'new_rating', '⭐ Nueva calificación recibida', 'Roberto Martínez te ha calificado con 5 estrellas', 'client-profile.html', FALSE, NULL, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY));

-- Notificaciones para trabajador Roberto (id=5)
INSERT INTO notifications (user_id, type, title, message, link, is_read, related_id, createdAt, updatedAt) VALUES
(5, 'new_service', '📋 Nueva solicitud de servicio', 'Juan Pérez te ha enviado una nueva solicitud de trabajo', 'available-worker-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -6 DAY), DATE_ADD(NOW(), INTERVAL -6 DAY)),
(5, 'new_rating', '⭐ Nueva calificación recibida', 'Juan Pérez te ha calificado con 5 estrellas', 'worker-profile.html', FALSE, NULL, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(5, 'new_dispute', '⚠️ Nueva disputa reportada', 'Juan Pérez ha reportado un problema con el trabajo', 'worker-disputes.html', FALSE, 2, DATE_ADD(NOW(), INTERVAL -3 DAY), DATE_ADD(NOW(), INTERVAL -3 DAY));

-- Notificaciones para trabajador Ana (id=6)
INSERT INTO notifications (user_id, type, title, message, link, is_read, related_id, createdAt, updatedAt) VALUES
(6, 'new_service', '📋 Nueva solicitud de servicio', 'María González te ha enviado una nueva solicitud de trabajo', 'available-worker-requests.html', FALSE, 2, DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY)),
(6, 'new_dispute', '⚠️ Nueva disputa reportada', 'María González ha reportado un problema con el trabajo', 'worker-disputes.html', FALSE, 1, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY));

-- Notificaciones para admin (id=1)
INSERT INTO notifications (user_id, type, title, message, link, is_read, related_id, createdAt, updatedAt) VALUES
(1, 'dispute_response', '💬 Respuesta en disputa', 'Roberto Martínez ha respondido a una disputa', 'admin-disputes.html', FALSE, 2, DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY));

-- ==========================================
-- RESETEAR AUTO_INCREMENT
-- ==========================================
ALTER TABLE users AUTO_INCREMENT = 9;
ALTER TABLE services AUTO_INCREMENT = 6;
ALTER TABLE verification_codes AUTO_INCREMENT = 3;
ALTER TABLE ratings AUTO_INCREMENT = 7;
ALTER TABLE disputes AUTO_INCREMENT = 4;
ALTER TABLE availability_blocks AUTO_INCREMENT = 3;
ALTER TABLE notifications AUTO_INCREMENT = 100;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
SELECT '✅ Datos de prueba cargados correctamente' AS status;
SELECT '👥 Usuarios creados:', COUNT(*) FROM users;
SELECT '📋 Servicios creados:', COUNT(*) FROM services;
SELECT '⭐ Calificaciones creadas:', COUNT(*) FROM ratings;
SELECT '⚠️ Disputas creadas:', COUNT(*) FROM disputes;
SELECT '🔔 Notificaciones creadas:', COUNT(*) FROM notifications;