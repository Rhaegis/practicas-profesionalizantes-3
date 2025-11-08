-- ==========================================
-- TRABAJAPP - Datos de Prueba
-- ==========================================
-- Contraseña para TODOS: test123
-- ==========================================

USE trabajapp_db;

-- Admin y Clientes
INSERT INTO users (id, full_name, email, password, role, is_active, createdAt, updatedAt) VALUES
(1, 'Admin Principal', 'admin@trabajapp.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'admin', TRUE, NOW(), NOW()),
(2, 'Juan Pérez', 'juan@cliente.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'cliente', TRUE, NOW(), NOW()),
(3, 'María González', 'maria@cliente.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'cliente', TRUE, NOW(), NOW()),
(4, 'Carlos Rodríguez', 'carlos@cliente.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'cliente', TRUE, NOW(), NOW());

-- Trabajadores en MAR DEL PLATA (CON AMBAS COORDENADAS)
INSERT INTO users (id, full_name, email, password, role, trade, registration_number, work_area, lat, lng, work_location_lat, work_location_lng, work_radius, work_schedule, immediate_availability, is_active, createdAt, updatedAt) VALUES
(5, 'Roberto Martínez', 'roberto@trabajador.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'trabajador', 'Plomero', 'MAT-12345', 'Mar del Plata, Centro', -38.0055, -57.5426, -38.0055, -57.5426, 10, 
'{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"14:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}', 
TRUE, TRUE, NOW(), NOW()),

(6, 'Ana López', 'ana@trabajador.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'trabajador', 'Electricista', 'MAT-67890', 'Mar del Plata, Güemes', -37.9958, -57.5589, -37.9958, -57.5589, 15,
'{"monday":{"enabled":true,"start":"08:00","end":"17:00"},"tuesday":{"enabled":true,"start":"08:00","end":"17:00"},"wednesday":{"enabled":true,"start":"08:00","end":"17:00"},"thursday":{"enabled":true,"start":"08:00","end":"17:00"},"friday":{"enabled":true,"start":"08:00","end":"17:00"},"saturday":{"enabled":true,"start":"09:00","end":"13:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}',
TRUE, TRUE, NOW(), NOW()),

(7, 'Diego Fernández', 'diego@trabajador.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'trabajador', 'Carpintero', 'MAT-11111', 'Mar del Plata, La Perla', -38.0028, -57.5481, -38.0028, -57.5481, 12,
'{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"14:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}',
TRUE, TRUE, NOW(), NOW()),

(8, 'Laura Sánchez', 'laura@trabajador.com', '$2b$10$NUbOuzaM4JO5TIF/bu0PC.hR7xsewwOs2Ohi5Aa3hwLz2Vcf1M8By', 'trabajador', 'Pintor', 'MAT-22222', 'Mar del Plata, Playa Grande', -38.0156, -57.5362, -38.0156, -57.5362, 8,
'{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"14:00"},"sunday":{"enabled":false,"start":"09:00","end":"14:00"}}',
TRUE, TRUE, NOW(), NOW());

-- Servicios en MAR DEL PLATA (NOMBRES CORRECTOS)
INSERT INTO services (id, title, description, status, client_id, worker_id, scheduled_date, service_location_lat, service_location_lng, service_address, createdAt, updatedAt) VALUES
(1, 'Reparación de cañería en cocina', 'Pérdida de agua en la cañería debajo de la pileta de la cocina', 'completed', 2, 5, DATE_ADD(NOW(), INTERVAL -5 DAY), -38.0065, -57.5436, 'San Martín 2500, Mar del Plata', DATE_ADD(NOW(), INTERVAL -6 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(2, 'Instalación de toma eléctrica', 'Necesito instalar una toma eléctrica nueva en el living', 'in_progress', 3, 6, NOW(), -37.9968, -57.5599, 'Rivadavia 3200, Mar del Plata', DATE_ADD(NOW(), INTERVAL -2 DAY), NOW()),
(3, 'Reparación de mueble de madera', 'Tengo un mueble antiguo que necesita reparación', 'accepted', 4, 7, DATE_ADD(NOW(), INTERVAL 2 DAY), -38.0038, -57.5491, 'Alem 4500, Mar del Plata', DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),
(4, 'Pintura de habitación', 'Necesito pintar una habitación de 4x3 metros', 'pending', 2, 8, DATE_ADD(NOW(), INTERVAL 5 DAY), -38.0166, -57.5372, 'Av. Colón 5800, Mar del Plata', NOW(), NOW()),
(5, 'Cambio de luminaria', 'Cambiar luminaria del techo', 'rejected', 3, 6, DATE_ADD(NOW(), INTERVAL 3 DAY), -38.0105, -57.5308, 'Constitución 6200, Mar del Plata', DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY));

-- Códigos de verificación (SIN timestamps, según modelo)
INSERT INTO verification_codes (id, service_id, code, generated_at, verified_at, is_used) VALUES
(1, 1, '123456', DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY), TRUE),
(2, 2, '789012', NOW(), NULL, FALSE);

-- Calificaciones (CON rater_type obligatorio)
INSERT INTO ratings (id, service_id, rater_id, rated_id, rater_type, rating, comment, createdAt, updatedAt) VALUES
(1, 1, 2, 5, 'client', 5, 'Excelente trabajo, muy profesional y puntual. Lo recomiendo 100%.', DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(2, 1, 5, 2, 'worker', 5, 'Cliente muy amable y respetuoso. Pago en tiempo y forma.', DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(3, 1, 3, 5, 'client', 4, 'Buen trabajo, aunque tardó un poco más de lo esperado.', DATE_ADD(NOW(), INTERVAL -10 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY)),
(4, 1, 4, 5, 'client', 5, 'Impecable. Muy recomendable.', DATE_ADD(NOW(), INTERVAL -15 DAY), DATE_ADD(NOW(), INTERVAL -15 DAY)),
(5, 2, 2, 6, 'client', 5, 'Excelente electricista, muy profesional.', DATE_ADD(NOW(), INTERVAL -8 DAY), DATE_ADD(NOW(), INTERVAL -8 DAY)),
(6, 2, 4, 6, 'client', 4, 'Muy buen servicio.', DATE_ADD(NOW(), INTERVAL -12 DAY), DATE_ADD(NOW(), INTERVAL -12 DAY));

-- Disputas
INSERT INTO disputes (id, service_id, reported_by, reported_by_user_id, reported_against_user_id, reason, status, worker_response, admin_notes, resolved_by, createdAt, updatedAt) VALUES
(1, 2, 'client', 3, 6, 'El trabajo no se completó según lo acordado. Falta instalar el interruptor.', 'abierta', NULL, NULL, NULL, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),
(2, 1, 'client', 2, 5, 'La reparación volvió a presentar pérdidas después de 2 días.', 'en_revision', 'El cliente no mencionó que había otro problema adicional en la cañería. Estoy dispuesto a volver a revisar sin cargo.', NULL, NULL, DATE_ADD(NOW(), INTERVAL -3 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY)),
(3, 5, 'client', 3, 6, 'El trabajador rechazó el trabajo sin justificación válida.', 'resuelta_cliente', 'Tuve un imprevisto familiar ese día.', 'Se resuelve a favor del cliente ya que debió avisar con anticipación.', 1, DATE_ADD(NOW(), INTERVAL -10 DAY), DATE_ADD(NOW(), INTERVAL -7 DAY));

-- Bloqueos
INSERT INTO availability_blocks (id, worker_id, date, reason, createdAt, updatedAt) VALUES
(1, 5, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Día familiar', NOW(), NOW()),
(2, 6, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Curso de capacitación', NOW(), NOW());

-- Notificaciones
INSERT INTO notifications (id, user_id, type, title, message, link, is_read, related_id, createdAt, updatedAt) VALUES
(1, 2, 'service_accepted', '✅ Solicitud aceptada', 'Roberto Martínez ha aceptado tu solicitud de Reparación de cañería en cocina', 'client-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY)),
(2, 2, 'service_completed', '✅ Trabajo completado', 'El trabajador ha marcado el trabajo como completado. Por favor, verifica y confirma.', 'client-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(3, 2, 'code_generated', '🔑 Código de verificación disponible', 'Tu código de verificación está listo. Entrégalo al trabajador para completar el servicio.', 'client-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -5 DAY)),
(4, 2, 'new_rating', '⭐ Nueva calificación recibida', 'Roberto Martínez te ha calificado con 5 estrellas', 'client-profile.html', FALSE, NULL, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(5, 5, 'new_service', '📋 Nueva solicitud de servicio', 'Juan Pérez te ha enviado una nueva solicitud de trabajo', 'available-worker-requests.html', TRUE, 1, DATE_ADD(NOW(), INTERVAL -6 DAY), DATE_ADD(NOW(), INTERVAL -6 DAY)),
(6, 5, 'new_rating', '⭐ Nueva calificación recibida', 'Juan Pérez te ha calificado con 5 estrellas', 'worker-profile.html', FALSE, NULL, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -4 DAY)),
(7, 5, 'new_dispute', '⚠️ Nueva disputa reportada', 'Juan Pérez ha reportado un problema con el trabajo', 'worker-disputes.html', FALSE, 2, DATE_ADD(NOW(), INTERVAL -3 DAY), DATE_ADD(NOW(), INTERVAL -3 DAY)),
(8, 6, 'new_service', '📋 Nueva solicitud de servicio', 'María González te ha enviado una nueva solicitud de trabajo', 'available-worker-requests.html', FALSE, 2, DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY)),
(9, 6, 'new_dispute', '⚠️ Nueva disputa reportada', 'María González ha reportado un problema con el trabajo', 'worker-disputes.html', FALSE, 1, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),
(10, 1, 'dispute_response', '💬 Respuesta en disputa', 'Roberto Martínez ha respondido a una disputa', 'admin-disputes.html', FALSE, 2, DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY));

-- Resetear auto_increment
ALTER TABLE users AUTO_INCREMENT = 9;
ALTER TABLE services AUTO_INCREMENT = 6;
ALTER TABLE verification_codes AUTO_INCREMENT = 3;
ALTER TABLE ratings AUTO_INCREMENT = 7;
ALTER TABLE disputes AUTO_INCREMENT = 4;
ALTER TABLE availability_blocks AUTO_INCREMENT = 3;
ALTER TABLE notifications AUTO_INCREMENT = 11;

-- Verificación
SELECT '✅ Datos cargados - Password: test123' AS status;
SELECT CONCAT('👥 Usuarios: ', COUNT(*)) FROM users;
SELECT CONCAT('🔧 Trabajadores: ', COUNT(*)) FROM users WHERE role='trabajador';
SELECT CONCAT('📋 Servicios: ', COUNT(*)) FROM services;
SELECT CONCAT('⭐ Calificaciones: ', COUNT(*)) FROM ratings;
SELECT CONCAT('⚠️ Disputas: ', COUNT(*)) FROM disputes;