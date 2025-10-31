-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: trabajapp_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `disputes`
--

DROP TABLE IF EXISTS `disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disputes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `reported_by` enum('client','worker') NOT NULL COMMENT 'Quién reporta el problema',
  `reported_by_user_id` int NOT NULL COMMENT 'ID del usuario que reporta',
  `reported_against_user_id` int NOT NULL COMMENT 'ID del usuario reportado',
  `reason` text NOT NULL COMMENT 'Motivo de la disputa',
  `evidence_url` text COMMENT 'URLs de fotos/evidencias (JSON array)',
  `worker_response` text COMMENT 'Descargo del trabajador',
  `worker_evidence_url` text COMMENT 'Evidencias del trabajador (JSON array)',
  `status` enum('abierta','en_revision','resuelta_cliente','resuelta_trabajador','rechazada') DEFAULT 'abierta',
  `admin_notes` text COMMENT 'Notas del administrador',
  `resolved_by` int DEFAULT NULL COMMENT 'ID del admin que resolvió',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reported_against_user_id` (`reported_against_user_id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_service` (`service_id`),
  KEY `idx_status` (`status`),
  KEY `idx_reported_by_user` (`reported_by_user_id`),
  CONSTRAINT `disputes_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disputes_ibfk_2` FOREIGN KEY (`reported_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disputes_ibfk_3` FOREIGN KEY (`reported_against_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disputes_ibfk_4` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disputes`
--

LOCK TABLES `disputes` WRITE;
/*!40000 ALTER TABLE `disputes` DISABLE KEYS */;
INSERT INTO `disputes` VALUES (1,9,'client',5,6,'[Causó daños] Prueba de disputa esto es oslo una prueba para ver si aparece en la base de datos',NULL,'Esto es un descargo una prueba de descargo de parte del trabajador hacia el cleinte',NULL,'en_revision',NULL,NULL,'2025-10-31 23:11:48','2025-10-31 23:25:10');
/*!40000 ALTER TABLE `disputes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `rater_id` int NOT NULL COMMENT 'ID del usuario que califica',
  `rated_id` int NOT NULL COMMENT 'ID del usuario calificado',
  `rater_type` enum('client','worker') NOT NULL COMMENT 'Tipo del que califica',
  `rating` int NOT NULL,
  `comment` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rating` (`service_id`,`rater_id`) COMMENT 'Solo una calificación por servicio por usuario',
  KEY `idx_rated_user` (`rated_id`),
  KEY `idx_rater_user` (`rater_id`),
  KEY `idx_service` (`service_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`rater_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`rated_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `worker_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `service_location_lat` float NOT NULL,
  `service_location_lng` float NOT NULL,
  `service_address` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','in_progress','completed','cancelled') DEFAULT 'pending',
  `scheduled_date` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `worker_id` (`worker_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `services_ibfk_2` FOREIGN KEY (`worker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (2,5,6,'instalacion de tomas corrientes','Necesito instalar 3 tomas corrientes en la cocina',-37.9997,-57.5541,'catamarca 2044','completed',NULL,'2025-10-30 18:25:50','2025-10-30 19:09:50'),(3,5,6,'Reparacion de enchufes','Necesito que repares tres enchufes en la cocina',-37.9997,-57.5541,'Catamarca 2044','completed',NULL,'2025-10-30 21:33:35','2025-10-30 21:34:52'),(4,5,6,'adwadfwaf','awwfassfawfawwfsa',-37.9997,-57.554,'afwwwfawfw','completed',NULL,'2025-10-30 21:35:45','2025-10-31 00:22:19'),(5,5,6,'asdawdawwd','asdsad wwwdwd',-37.9997,-57.5541,'awdawddwadwad','completed',NULL,'2025-10-31 00:26:01','2025-10-31 00:38:36'),(6,5,6,'Prueba 1','prueba1',-37.9997,-57.5541,'prueba 1','completed',NULL,'2025-10-31 00:39:30','2025-10-31 00:41:19'),(7,5,6,'Prueba de calificacion','Prueba de estrellas',-37.9997,-57.5541,'poner estrellas en la calificacion','completed',NULL,'2025-10-31 16:57:58','2025-10-31 17:00:49'),(8,5,6,'wdadwawddasdwd','asdwdawdsadw',-37.9997,-57.5541,'dwaddawd','completed',NULL,'2025-10-31 16:59:24','2025-10-31 17:32:32'),(9,5,6,'Prueba disputa','prueba disputa',-37.9997,-57.554,'prueba disputa','in_progress',NULL,'2025-10-31 23:06:15','2025-10-31 23:06:53');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('cliente','trabajador') NOT NULL,
  `trade` varchar(100) DEFAULT NULL,
  `registration_number` varchar(50) DEFAULT NULL,
  `work_area` varchar(100) DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Juan Pérez','juan@example.com','$2b$10$hashdeprueba123456789012345678901234567890123','trabajador','Electricista','MAT-12345','Mar del Plata',-38.005,-57.542,'2025-10-29 23:46:00','2025-10-29 23:46:00'),(2,'María García','maria@example.com','$2b$10$hashdeprueba123456789012345678901234567890123','trabajador','Plomera','MAT-67890','Mar del Plata',-38.01,-57.55,'2025-10-29 23:46:00','2025-10-29 23:46:00'),(3,'Carlos López','carlos@example.com','$2b$10$hashdeprueba123456789012345678901234567890123','trabajador','Carpintero','MAT-11111','Mar del Plata',-38.015,-57.545,'2025-10-29 23:46:00','2025-10-29 23:46:00'),(4,'Ana Torres','ana@example.com','$2b$10$hashdeprueba123456789012345678901234567890123','trabajador','Pintora','MAT-22222','Buenos Aires',-34.603,-58.381,'2025-10-29 23:46:00','2025-10-29 23:46:00'),(5,'Cliente 123','cliente123@gmail.com','$2b$10$Q0tSSaq1jUK4GL5UxJYNH.oaWyrtog6zFZi4/ze86VC1XReq8BOKm','cliente',NULL,NULL,NULL,NULL,NULL,'2025-10-30 00:35:07','2025-10-30 00:35:07'),(6,'trabajador 123','trabajador123@gmail.com','$2b$10$HrtuTKj6J.nS6gqc/7fsc.7VN8aiwixbMwkXs/l9RhWvzIVJllLjG','trabajador','electricista','023123456','Mar del Plata',-38.008,-57.548,'2025-10-30 16:46:13','2025-10-30 18:24:37'),(7,'Lourdecita','lour@oficios.com','$2b$10$zgTKVjrTB6HQG6duZcQq5erngyQrgayB9tLRqq8btNT0ts62o3O9W','cliente',NULL,NULL,NULL,NULL,NULL,'2025-10-31 17:36:37','2025-10-31 17:36:37'),(8,'Trabajador Prueba','trabajadorprueba@gmail.com','$2b$10$F/HhnRtsg2vmqvOh73fZPOEUrmReRADRatYUvzAeCgx2FiNwcZu4i','trabajador','Carpintero','','Mar del palta',NULL,NULL,'2025-10-31 22:40:57','2025-10-31 22:40:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_codes`
--

DROP TABLE IF EXISTS `verification_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `code` varchar(6) NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_service_code` (`service_id`,`code`),
  CONSTRAINT `verification_codes_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_codes`
--

LOCK TABLES `verification_codes` WRITE;
/*!40000 ALTER TABLE `verification_codes` DISABLE KEYS */;
INSERT INTO `verification_codes` VALUES (1,9,'508393','2025-10-31 23:07:02',NULL,0);
/*!40000 ALTER TABLE `verification_codes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-31 20:32:34
