-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: complaint_tracking_system
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(20) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ticket_id` (`ticket_id`),
  CONSTRAINT `fk_ticket_id` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
INSERT INTO `attachments` VALUES (7,'TCKT-0001','attachment','https://res.cloudinary.com/dhenxgofs/image/upload/v1740997030/ticket-attachments/yopnaeofxqeufhxjujuh.jpg','2025-03-03 10:17:11');
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `closure_logs`
--

DROP TABLE IF EXISTS `closure_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `closure_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `log` text NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `closure_logs`
--

LOCK TABLES `closure_logs` WRITE;
/*!40000 ALTER TABLE `closure_logs` DISABLE KEYS */;
INSERT INTO `closure_logs` VALUES (4,'Wires damaged so unstable power supply to monitor and fixed the wire','2025-03-06 13:38:28');
/*!40000 ALTER TABLE `closure_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `description` text,
  `quantity` int NOT NULL,
  `added_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (3,'Mouse','Dell mouse for cpu',10,1,'2025-03-03 10:23:29'),(4,'KeyBoard','mechanical keyboard for pc',15,1,'2025-03-03 10:24:20'),(5,'Monitor','Lenovo Display screens for pc',9,1,'2025-03-03 10:28:21'),(6,'wires','copper wires for connections each 10 meter',3,1,'2025-03-03 10:32:19'),(7,'Ethernet cable','for lan connection',5,1,'2025-04-18 15:45:39');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `text` text NOT NULL,
  `timestamp` datetime NOT NULL,
  `ticket_id` varchar(255) DEFAULT NULL,
  `is_deleted_for_sender` int NOT NULL DEFAULT '0',
  `is_deleted_for_receiver` int NOT NULL DEFAULT '0',
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,2,5,'hello what is the issue?','2025-03-07 14:57:28',NULL,1,1,1),(2,5,2,'in keyboard some keys are not working.','2025-03-07 15:00:05',NULL,1,1,0),(3,2,5,'okay','2025-03-07 15:00:25',NULL,1,1,1),(4,5,2,'do you have the count of it?','2025-03-07 15:11:58',NULL,1,1,0),(5,2,5,'gimme a minute','2025-03-07 15:15:34',NULL,1,1,1),(6,5,2,'okay','2025-03-07 15:16:00',NULL,1,1,0),(7,5,2,'??','2025-03-07 15:19:06',NULL,1,1,0),(8,2,5,'5','2025-03-07 15:53:09',NULL,1,1,1),(9,5,2,'okay','2025-03-07 15:55:33',NULL,1,1,0),(10,5,2,'.','2025-03-07 16:01:48',NULL,1,1,0),(11,2,5,'ok','2025-03-07 16:07:44',NULL,1,1,1),(12,5,2,'okay','2025-03-07 16:11:15',NULL,1,1,0),(13,5,2,'okay','2025-03-07 16:14:04',NULL,1,1,0),(14,2,5,'ok','2025-03-07 16:14:45',NULL,1,1,1),(15,2,5,'mmm','2025-03-07 16:22:02',NULL,1,1,1),(16,5,2,'mm','2025-03-07 16:22:13',NULL,1,1,0),(17,2,5,'hmm','2025-03-07 16:23:20',NULL,1,1,1),(18,5,2,'okay','2025-03-07 16:23:43',NULL,1,1,0),(19,2,5,'kkk','2025-03-07 19:03:17',NULL,1,1,1),(20,5,2,'okay','2025-03-07 19:05:40',NULL,1,1,0),(21,5,2,'HARISHH','2025-03-07 19:06:35',NULL,1,1,0),(22,2,5,'ss','2025-03-07 19:07:05',NULL,1,1,1),(23,5,2,'ok','2025-03-07 19:10:41',NULL,1,1,0),(24,2,5,'qwert','2025-03-07 19:12:08',NULL,1,1,1),(25,5,2,'adsd','2025-03-07 19:12:58',NULL,1,1,0),(26,2,5,'qweer','2025-03-07 20:05:33',NULL,1,1,1),(27,5,2,'qsdfrsh','2025-03-07 20:05:45',NULL,1,1,0),(28,5,2,'qwer','2025-03-07 20:08:20',NULL,1,1,0),(29,2,5,'ccvbn','2025-03-07 20:11:33',NULL,1,1,1),(30,2,5,'hello','2025-03-07 20:16:33',NULL,1,1,1),(31,2,5,'1234','2025-03-07 20:29:00',NULL,1,1,1),(32,5,2,'yes','2025-03-07 20:32:30',NULL,1,1,0),(33,2,5,'okay','2025-03-07 20:36:43',NULL,1,1,1),(34,5,2,'check it','2025-03-07 20:37:00',NULL,1,1,0),(35,2,5,'as','2025-03-07 20:37:12',NULL,1,1,1),(36,5,2,'isse reolved','2025-03-07 21:27:12',NULL,1,1,0),(37,5,2,'fhh','2025-03-08 13:59:46',NULL,1,1,0),(38,5,2,'xfg','2025-03-08 14:01:12',NULL,1,1,0),(39,5,2,'qwer','2025-03-08 14:23:36',NULL,1,1,1),(40,2,5,'ok','2025-03-08 14:23:52',NULL,1,1,1),(41,2,5,'dnf ','2025-03-08 15:05:02',NULL,1,1,1),(42,2,5,'nkjhg','2025-03-08 15:05:54',NULL,1,1,1),(43,5,2,'thnks','2025-03-08 15:12:11',NULL,1,1,1),(44,5,2,'welcome','2025-03-08 15:12:55',NULL,1,1,1),(45,2,5,'kn','2025-03-08 15:15:27',NULL,1,1,1),(46,2,5,'s','2025-03-08 15:15:28',NULL,1,1,1),(47,2,5,'s','2025-03-08 15:15:29',NULL,1,1,1),(48,2,5,'s','2025-03-08 15:15:30',NULL,1,1,1),(49,2,5,'sd','2025-03-08 15:48:29',NULL,1,1,1),(50,2,5,'okay','2025-03-08 15:49:06',NULL,1,1,1),(51,2,5,'nml;','2025-03-08 15:54:15',NULL,1,1,1),(52,2,5,'mm','2025-03-08 15:54:30',NULL,1,1,1),(53,2,5,'dasd','2025-03-08 16:06:20',NULL,1,1,1),(54,2,5,'sdf','2025-03-08 16:06:28',NULL,1,1,1),(55,2,5,'asd','2025-03-08 16:06:38',NULL,1,1,1),(56,2,5,'adsd','2025-03-08 16:08:20',NULL,1,1,1),(57,2,5,'asdd','2025-03-08 16:08:45',NULL,1,1,1),(58,2,5,'a','2025-03-08 16:09:49',NULL,1,1,1),(59,2,5,'asd','2025-03-08 16:11:03',NULL,1,1,1),(60,2,5,'23','2025-03-08 16:13:01',NULL,1,1,1),(61,2,5,'12','2025-03-08 16:13:08',NULL,1,1,1),(62,2,5,'jh','2025-03-09 13:37:41',NULL,1,1,1),(63,5,2,'sdsf','2025-03-09 18:13:52',NULL,1,1,1),(64,2,5,'serd','2025-03-09 18:14:08',NULL,1,1,1),(65,5,2,'sd','2025-03-09 18:14:14',NULL,1,1,1),(66,5,2,'sds','2025-03-09 18:14:19',NULL,1,1,1),(67,5,2,'do you have the count of it?','2025-03-18 21:32:34',NULL,1,1,1),(68,5,2,'yes','2025-03-18 21:37:17',NULL,1,1,1),(69,2,5,'okkk','2025-03-18 21:37:26',NULL,1,1,1),(70,5,2,'oombu','2025-03-19 18:15:37',NULL,1,1,1),(71,5,2,'by dhiraj','2025-03-19 18:15:58',NULL,1,1,1),(72,2,5,'sdfg','2025-03-19 18:36:58',NULL,1,1,1),(73,2,5,'pkp','2025-03-19 18:37:00',NULL,1,1,1),(74,2,5,'ip','2025-03-19 18:37:03',NULL,1,1,1),(75,2,5,'hio\\','2025-03-19 18:37:06',NULL,1,1,1),(76,2,5,'asd','2025-03-19 18:59:35',NULL,1,1,1),(77,2,5,'asd','2025-03-19 18:59:55',NULL,1,1,1),(78,2,5,'okkk','2025-03-19 19:02:41',NULL,1,1,1),(79,5,2,'adf','2025-03-19 19:02:48',NULL,1,1,1),(80,2,5,'asip','2025-03-19 19:02:54',NULL,1,1,1),(81,2,5,'asd','2025-03-19 19:03:54',NULL,1,1,1),(82,2,5,'afd','2025-03-19 19:03:57',NULL,1,1,1),(83,2,5,'asdkl','2025-03-19 19:04:52',NULL,1,1,1),(84,5,2,'HARISHH','2025-03-19 19:05:30',NULL,1,1,1),(85,2,5,'okay','2025-03-19 20:42:32',NULL,1,1,1),(86,5,2,'yes','2025-03-19 20:42:54',NULL,1,1,1),(87,2,5,'judy','2025-03-19 20:45:16',NULL,1,1,1),(88,5,2,'dsfd','2025-03-19 20:45:24',NULL,1,1,1),(89,5,3,'hi','2025-04-11 23:38:44',NULL,0,0,0),(90,5,2,'hello','2025-04-18 21:04:27',NULL,0,0,1);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  `type` varchar(50) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=324 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (187,1,3,'Admin','Your account has been approved by the administrator.','2025-03-03 14:51:53',1,'technician_status',NULL),(190,6,3,'System','You have been assigned a new ticket (ID: TCKT-0002) with priority: High.','2025-03-03 15:49:21',0,'Technician Assignment',NULL),(191,6,6,'System','Your ticket (ID: TCKT-0002) has been assigned to technician dinesh.','2025-03-03 15:49:21',0,'Ticket Assignment',NULL),(290,1,5,'Admin','The priority of ticket TCKT-0003 has been changed to Low by the administrator.','2025-03-07 09:16:33',0,'priority_update','/ticket/TCKT-0003'),(291,1,2,'Admin','The priority of ticket TCKT-0003 has been changed to Low by the administrator.','2025-03-07 09:16:34',0,'priority_update','/ticket/TCKT-0003'),(292,1,5,'Admin','The priority of ticket TCKT-0003 has been changed to Medium by the administrator.','2025-03-07 09:16:47',0,'priority_update','/ticket/TCKT-0003'),(293,1,2,'Admin','The priority of ticket TCKT-0003 has been changed to Medium by the administrator.','2025-03-07 09:16:48',1,'priority_update','/ticket/TCKT-0003'),(294,2,5,'Admin','Your ticket #TCKT-0003 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-07 09:59:19',1,'technician_status','/ticket/TCKT-0003'),(295,2,5,'Admin','Your ticket #TCKT-0003 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-07 10:06:40',1,'technician_status','/ticket/TCKT-0003'),(296,2,5,'Admin','Your ticket #TCKT-0003 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-07 10:52:04',1,'technician_status','/ticket/TCKT-0003'),(297,2,5,'Admin','Your ticket #TCKT-0003 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-07 10:52:50',0,'technician_status','/ticket/TCKT-0003'),(298,2,5,'Admin','Your ticket #TCKT-0003 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-07 12:00:27',0,'technician_status','/ticket/TCKT-0003'),(299,2,5,'Admin','Your ticket #TCKT-0003 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-07 12:04:03',0,'technician_status','/ticket/TCKT-0003'),(300,7,2,'System','You have been assigned a new ticket (ID: TCKT-0004) with priority: Medium.','2025-03-24 09:52:03',1,'Technician Assignment','/technician/assigned-tickets'),(301,7,7,'System','Your ticket (ID: TCKT-0004) has been assigned to technician Gokul.','2025-03-24 09:52:03',1,'Ticket Assignment','/ticket/TCKT-0004'),(302,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 14:15:49',0,'technician_status','/ticket/TCKT-0004'),(303,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 14:16:24',1,'technician_status','/ticket/TCKT-0004'),(304,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 14:36:09',0,'technician_status','/ticket/TCKT-0004'),(305,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 14:47:40',0,'technician_status','/ticket/TCKT-0004'),(306,7,2,'System','Ticket (ID: TCKT-0004) assigned to you has been disputed by the user.','2025-03-24 14:47:45',1,'Ticket Disputed','/technician/assigned-tickets'),(307,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 14:48:23',1,'technician_status','/ticket/TCKT-0004'),(308,7,2,'System','Ticket (ID: TCKT-0004) assigned to you has been disputed by the user.','2025-03-24 14:48:28',0,'Ticket Disputed','/technician/assigned-tickets'),(309,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 14:56:13',1,'technician_status','/ticket/TCKT-0004'),(310,7,2,'System','Ticket (ID: TCKT-0004) assigned to you has been disputed by the user.','2025-03-24 14:56:19',0,'Ticket Disputed','/technician/assigned-tickets'),(311,2,7,'Admin','Your ticket #TCKT-0004 is now in progress. Our technician is working on it.If technician is not in Location please dispute the process','2025-03-24 15:12:16',0,'technician_status','/ticket/TCKT-0004'),(312,7,2,'System','Ticket (ID: TCKT-0004) assigned to you has been disputed by the user.','2025-03-24 15:12:37',0,'Ticket Disputed','/technician/assigned-tickets'),(313,5,3,'System','You have been assigned a new ticket (ID: TCKT-0005) with priority: High.','2025-03-25 11:30:23',0,'Technician Assignment','/technician/assigned-tickets'),(314,5,5,'System','Your ticket (ID: TCKT-0005) has been assigned to technician dinesh.','2025-03-25 11:30:23',0,'Ticket Assignment','/ticket/TCKT-0005'),(315,1,5,'Admin','The priority of ticket TCKT-0001 has been changed to Medium by the administrator.','2025-04-11 23:41:21',0,'priority_update','/ticket/TCKT-0001'),(316,1,2,'Admin','The priority of ticket TCKT-0001 has been changed to Medium by the administrator.','2025-04-11 23:41:23',0,'priority_update','/ticket/TCKT-0001'),(317,5,5,'System','Your ticket (ID: TCKT-0006) has been created but no technician has been assigned yet.','2025-04-18 21:00:48',1,'Ticket Created','/ticket/TCKT-0006'),(318,2,1,'Technician','Spares request for Ticket #TCKT-0003.','2025-04-18 21:07:18',0,'spares_request','/admin/inventory'),(319,1,2,'Admin','Your spare request (Ticket ID: TCKT-0003) has been Rejected.','2025-04-18 21:07:50',1,'spares_request','/ticket/TCKT-0003'),(320,2,1,'Technician','Spares request for Ticket #TCKT-0003.','2025-04-19 09:51:17',1,'spares_request','/admin/inventory'),(321,1,5,'Admin','The priority of ticket TCKT-0001 has been changed to Low by the administrator.','2025-04-19 09:52:35',0,'priority_update','/ticket/TCKT-0001'),(322,1,2,'Admin','The priority of ticket TCKT-0001 has been changed to Low by the administrator.','2025-04-19 09:52:35',0,'priority_update','/ticket/TCKT-0001'),(323,1,2,'Admin','Your spare request (Ticket ID: TCKT-0003) has been Approved.','2025-04-19 09:53:28',0,'spares_request','/ticket/TCKT-0003');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_subscriptions`
--

DROP TABLE IF EXISTS `push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_subscriptions` (
  `user_id` int NOT NULL,
  `subscription` text NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `push_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_subscriptions`
--

LOCK TABLES `push_subscriptions` WRITE;
/*!40000 ALTER TABLE `push_subscriptions` DISABLE KEYS */;
INSERT INTO `push_subscriptions` VALUES (1,'{\"endpoint\": \"https://fcm.googleapis.com/fcm/send/dJNp0IFdOTo:APA91bGRlfbYGzCZO0p6-I4lUa6xP_cz_SI6FYwEXFIEZdTOSn0MXnSvYtKmA9akVy-pG0pHE41zevg3ZwlxK0YM3gdfjhVrbwKK76GzXXkTuWGBYYWPHIVocbvulaS0UJjH3pboIiD-\", \"expirationTime\": null, \"keys\": {\"p256dh\": \"BDAriLRxFVAYD4qxEV5OJ3qyL3QRBdRKlZV4eeduG9thmMbRIOGbXZCaNpm-N9hCWVQIspccwDAgvVjYxvlADLs\", \"auth\": \"XNcxM4HB65XWGg5jTteOUA\"}}'),(2,'{\"endpoint\": \"https://fcm.googleapis.com/fcm/send/eM3cIadRhmA:APA91bEEU5y4LUjx8YmCSSVwJBTDgjWiE6GkI-SRLvC0yW-KF_mHtaHkD7LrJDfiroUfkzvyyIIe0d_Z9gacOp9uY2Ehd5cy-2gnC4ZgI1fUnJ-cA88nXjTbvWxz7N84GvlhbR1PevWq\", \"expirationTime\": null, \"keys\": {\"p256dh\": \"BB4yb8MBaLU6n56ZllC9yMEAhqTFVucz8GmF09onv4oP2xmEr0RpWrS29BHUOQwaZnD1Uejp4Ioe3D1dXSTUkmU\", \"auth\": \"3tAGH6BpLQagpG_yCP43CQ\"}}'),(5,'{\"endpoint\": \"https://fcm.googleapis.com/fcm/send/fQ47_TsouXo:APA91bHfHo9tN7vo5aaURhIiGEJYFGeVMCPZWkry5WZAtK9TMzquEnuyhRYz9VUKIcXZJfqOHkcalmO9hDuWQPwWj71RvG33wQmtT5OgpcImN8BTyAxVqLgdxgpyfjFIdBx00gsgSD9J\", \"expirationTime\": null, \"keys\": {\"p256dh\": \"BPfyy93HcpJLTpterO5i4yFT0rGw_oPbU76C2UEujwG-uKH7UiAYiBZu8Yt8ZZb5-cUrG0mP_WG9bRAyEkC_AJo\", \"auth\": \"iLEaUd-NYa2vJoHxnWi9lw\"}}'),(7,'{\"endpoint\": \"https://wns2-pn1p.notify.windows.com/w/?token=BQYAAACQDlbn0NJEa%2fbL4ZsYFDj7b2fPNtOkMXVwz4WLngxmw0b%2bVLGSpyhUNwhWdOiBmaRB%2bo9y5s7IlNPr2%2bkSr%2f86BBN0vZ4qsqEzJlI4aeYOZbYgn2ruPquVttxTUEy3NPdX3hq%2fnBI6P2hTMnWGpSHAqTm9AmzUAk7hK3QZy8cP4SXCOlgZkJqTFWinNSPjElbmX5LM%2b7Sivy7fGaAV3UB4mdu6gmDoN1y3Etyodo9GqpPa3BhsMwkAzuOmuzZtYXjtBy0s8fv5qHeh74cX8E6Vr4FjxkQgYx38AtrcYtPULatPltx7cATzOy6YoLcGTckCwgb1Pe3PqUrfnvw6EYtJ\", \"expirationTime\": null, \"keys\": {\"p256dh\": \"BA_lYBK1G3l3UT5Hfz5OxRGwq6-3JLKBURUp5hbqvNrsX3trDXWjKup_otkQf8DWqsvtFB7tteZ2Ycti1CYV-A4\", \"auth\": \"pBa0KDXiu_NrdHAYgkRXhA\"}}');
/*!40000 ALTER TABLE `push_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spare_requests`
--

DROP TABLE IF EXISTS `spare_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(255) NOT NULL,
  `technician_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `part_id` int NOT NULL,
  PRIMARY KEY (`request_id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `technician_id` (`technician_id`),
  KEY `approved_by` (`approved_by`),
  KEY `fk_part_id` (`part_id`),
  CONSTRAINT `fk_part_id` FOREIGN KEY (`part_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `spare_requests_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE,
  CONSTRAINT `spare_requests_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `spare_requests_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spare_requests`
--

LOCK TABLES `spare_requests` WRITE;
/*!40000 ALTER TABLE `spare_requests` DISABLE KEYS */;
INSERT INTO `spare_requests` VALUES (7,'TCKT-0001',2,1,'Approved','2025-03-03 13:28:41',1,'2025-03-03 14:58:37',6),(8,'TCKT-0003',2,1,'Rejected','2025-04-18 15:37:17',1,'2025-04-18 15:37:49',3),(9,'TCKT-0003',2,1,'Approved','2025-04-19 04:21:16',1,'2025-04-19 04:23:27',5);
/*!40000 ALTER TABLE `spare_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technician_metrics`
--

DROP TABLE IF EXISTS `technician_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technician_metrics` (
  `technician_id` int NOT NULL,
  `total_assigned_tickets` int DEFAULT '0',
  `total_resolved_tickets` int DEFAULT '0',
  `today_assigned_tickets` int DEFAULT '0',
  `current_assigned_tickets` int DEFAULT '0',
  `today_resolved_tickets` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sla_breached_slot` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`technician_id`),
  CONSTRAINT `technician_metrics_ibfk_1` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technician_metrics`
--

LOCK TABLES `technician_metrics` WRITE;
/*!40000 ALTER TABLE `technician_metrics` DISABLE KEYS */;
INSERT INTO `technician_metrics` VALUES (2,3,1,0,2,0,'2025-04-16 20:35:09',0),(3,2,0,0,2,0,'2025-04-16 20:35:09',0);
/*!40000 ALTER TABLE `technician_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_feedback`
--

DROP TABLE IF EXISTS `ticket_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(20) NOT NULL,
  `user_id` int NOT NULL,
  `technician_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comments` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  KEY `technician_id` (`technician_id`),
  CONSTRAINT `ticket_feedback_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`),
  CONSTRAINT `ticket_feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ticket_feedback_ibfk_3` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ticket_feedback_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_feedback`
--

LOCK TABLES `ticket_feedback` WRITE;
/*!40000 ALTER TABLE `ticket_feedback` DISABLE KEYS */;
INSERT INTO `ticket_feedback` VALUES (1,'TCKT-0001',2,5,4,'Issue solved','2025-03-06 13:39:53');
/*!40000 ALTER TABLE `ticket_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_mapping`
--

DROP TABLE IF EXISTS `ticket_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(20) DEFAULT NULL,
  `user_id` int NOT NULL,
  `technician_id` int DEFAULT NULL,
  `log_id` int DEFAULT NULL,
  `started_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `closure_time` timestamp NULL DEFAULT NULL,
  `assigned_by_admin` tinyint(1) DEFAULT '0',
  `sla_deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `technician_id` (`technician_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ticket_mapping_ibfk_1` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_mapping_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_mapping`
--

LOCK TABLES `ticket_mapping` WRITE;
/*!40000 ALTER TABLE `ticket_mapping` DISABLE KEYS */;
INSERT INTO `ticket_mapping` VALUES (14,'TCKT-0001',5,2,4,'2025-03-03 10:17:12','2025-03-06 13:38:28',0,'2025-03-05 03:47:12'),(15,'TCKT-0002',6,3,NULL,'2025-03-03 10:19:20',NULL,0,'2025-03-05 03:49:20'),(16,'TCKT-0003',5,2,NULL,'2025-03-05 03:42:31',NULL,0,'2025-03-06 21:12:31'),(17,'TCKT-0004',7,2,NULL,'2025-03-24 04:22:02',NULL,0,'2025-03-25 21:52:02'),(18,'TCKT-0005',5,3,NULL,'2025-03-25 06:00:23',NULL,0,'2025-03-26 23:30:23'),(19,'TCKT-0006',5,NULL,NULL,'2025-04-18 15:30:48',NULL,0,'2025-04-20 09:00:48');
/*!40000 ALTER TABLE `ticket_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `ticket_id` varchar(20) NOT NULL,
  `system_number` varchar(50) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `block` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `status` enum('Open','Assigned','In Progress','Closed') NOT NULL DEFAULT 'Open',
  `priority` enum('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_emergency` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES ('TCKT-0001','12','AIDS lab','A Block','Hardware','Monitor is flickering continuously','Closed','Low','2025-03-03 10:17:07','2025-04-19 04:22:34',0),('TCKT-0002','1','cse lab 4','C Block','Network','Wi-Fi is very slow and I am having a meeting in an hour','Assigned','High','2025-03-03 10:19:20','2025-03-03 10:19:20',0),('TCKT-0003','1','aiml lab 2','C Block','Hardware','Keyboard is not working properly ','In Progress','Medium','2025-03-05 03:42:30','2025-03-07 06:34:03',0),('TCKT-0004','01','csbs lab 1','A Block','Hardware','Mouse is not working properly and lagging','Assigned','Medium','2025-03-24 04:22:02','2025-03-24 09:42:36',0),('TCKT-0005','12','ise lab','A Block','Hardware','monitor is not working','Assigned','High','2025-03-25 06:00:22','2025-03-25 06:00:23',0),('TCKT-0006','35','cse lab 3','A Block','Network','My wifi too slow  and i am having assesment now.','Open','Low','2025-04-18 15:30:48','2025-04-18 15:30:48',0);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_insert_tickets` BEFORE INSERT ON `tickets` FOR EACH ROW BEGIN
    SET NEW.ticket_id = CONCAT('TCKT-', LPAD(CAST((SELECT IFNULL(MAX(CAST(SUBSTRING(ticket_id, 6) AS UNSIGNED)), 0) + 1 FROM tickets) AS CHAR), 4, '0'));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_last_updated_on_status_change` BEFORE UPDATE ON `tickets` FOR EACH ROW BEGIN
    
    IF NEW.status != OLD.status THEN
        SET NEW.last_updated = CURRENT_TIMESTAMP;
    END IF;
    
    
    SET NEW.created_at = OLD.created_at;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','technician') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_approved` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'HARISHH A','harishh1711@gmail.com','9790541002','$2b$12$kvD8.ptll2qq1YOzfz5SRe1L4/hVMRhDyIxdcbqDQBWHlb.6Nc76W','admin','2025-03-03 08:33:06',1),(2,'Gokul','gokul.ad21@bitsathy.ac.in','95852 07666','$2b$12$UBzv0PY2sYXprKOeV1WKm.mm1JNZiWmpptsiYWLV81ktULm.q7QX2','technician','2025-03-03 08:42:10',1),(3,'dinesh','dinesh.ad21@bitsathy.ac.in','8778093006','$2b$12$m9jcmqtUk.Eg1mjTCbDTQOm4YCPHB.PLt7bARWr9HKM8P916Wz4MW','technician','2025-03-03 08:43:43',1),(4,'Sumugan','sumugan.ad21@bitsathy.ac.in','93609 89859','$2b$12$t1GFmVScsTlZSXAkvw2.8u.93xsgEn4.Bjg8V5govgX95rfhIPjMW','technician','2025-03-03 08:45:02',0),(5,'Swetha','swetha.ad21@bitsathy.ac.in','6382476742','$2b$12$EkwsxhpSjkIGi8H6VJ2dXuwHF5dDbXYhk8YhyWx2c/Nnoury.loeS','user','2025-03-03 08:46:23',1),(6,'Sridevi','sridevi.ad21@bitsathy.ac.in','93441 70047','$2b$12$vXA4Oe2wMsf9KmSyMkKCaOJ9/kAK33FfZ6eFimISesauUDq8loro.','user','2025-03-03 08:47:14',1),(7,'Darshna','darshna.ad21@bitsathy.ac.in','8270322123','$2b$12$2g3bVJa7cDrKI9yRXCn30ePVO.sH5WF327JE75i..lOVN1J4eKlzW','user','2025-03-24 04:20:10',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-19 10:08:13
