-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: clg_db
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `submitted` tinyint(1) DEFAULT '0',
  `submitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`submission_id`),
  UNIQUE KEY `unique_submission` (`assignment_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
INSERT INTO `assignment_submissions` VALUES (12,2,1,1,'2026-03-12 09:19:57'),(13,2,2,0,NULL),(14,2,3,0,NULL),(15,2,4,1,'2026-03-12 09:19:57'),(16,2,5,0,NULL),(17,2,6,0,NULL),(18,2,7,0,NULL),(19,2,8,0,NULL),(20,2,9,0,NULL),(21,2,10,0,NULL),(22,2,11,0,NULL),(23,3,1,1,'2026-03-12 09:19:06'),(24,3,2,0,NULL),(25,3,3,0,NULL),(26,3,4,0,NULL),(27,3,5,0,NULL),(28,3,6,0,NULL),(29,3,7,0,NULL),(30,3,8,0,NULL),(31,3,9,0,NULL),(32,3,10,0,NULL),(33,3,11,0,NULL);
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `deadline` date DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (2,17,'assignmet-2','2026-03-29',3,'2026-03-10 12:08:58'),(3,17,'assignment-1','2026-03-31',3,'2026-03-10 15:06:56');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `student_id` int NOT NULL,
  `status` enum('present','absent') NOT NULL,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `session_id` (`session_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (1,1,1,'present'),(2,1,2,'present'),(3,1,3,'present'),(4,1,4,'present'),(5,1,5,'present'),(6,1,6,'absent'),(7,1,7,'present'),(8,1,8,'present'),(9,1,9,'present'),(10,1,10,'present'),(11,1,11,'absent'),(12,2,1,'present'),(13,2,2,'present'),(14,2,3,'present'),(15,2,4,'present'),(16,2,5,'present'),(17,2,6,'absent'),(18,2,7,'absent'),(19,2,8,'absent'),(20,2,9,'absent'),(21,2,10,'absent'),(22,2,11,'present');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `session_date` date NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `academic_year` varchar(9) NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `attendance_sessions_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `attendance_sessions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` VALUES (1,17,'2026-03-11',3,'2026-03-11 09:47:15','2025-2026'),(2,17,'2026-03-11',3,'2026-03-11 10:00:10','2025-2026');
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(30) DEFAULT NULL,
  `course_name` varchar(256) NOT NULL,
  `department_id` int NOT NULL,
  `year` int NOT NULL,
  `semester` int NOT NULL,
  `teacher_id` int NOT NULL,
  `subject_type` enum('core','open','prof') DEFAULT 'core',
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`),
  UNIQUE KEY `course_code_2` (`course_code`),
  KEY `department_id` (`department_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'DCN','Data Communication & Networking',1,2,4,2,'core'),(2,'OS','Operating System',1,2,4,3,'core'),(3,'TOC','Theory of Computation',1,2,4,2,'core'),(4,'MDM2','Digital ICs and Applications',1,2,4,5,'core'),(5,'CSKILL2','Computing Skill II',1,2,4,6,'core'),(6,'OE2','Business Planning and Project Management',1,2,4,6,'core'),(7,'SSEE','Social Science and Engineering Economics',1,2,4,4,'core'),(9,'UHVE','Universal Human Values & Ethics',1,2,4,7,'core'),(11,'DAA','Design & Analysis of Algorithms',1,3,6,9,'core'),(12,'SE','Software Engineering',1,3,6,7,'core'),(13,'BDA','Big Data Analytics',1,3,6,13,'prof'),(14,'CRYPTO','Cryptography',1,3,6,4,'prof'),(15,'WC','Wireless Communication',1,3,7,10,'core'),(16,'SST','Soft Skill Training',1,3,6,11,'core'),(17,'OOAD','Object Oriented Analysis & Design',1,4,8,3,'core'),(18,'PEM','Professional Ethics & Management',1,4,8,14,'core'),(19,'MLAI','Machine Learning & AI',1,4,8,12,'prof'),(20,'SSS','System & Software Security',1,4,8,8,'core'),(21,'DLT','Distributed Ledger Technology',1,4,8,9,'core'),(22,'ML011','Modern Languages',1,3,6,2,'core');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(10) NOT NULL,
  `department_name` varchar(70) NOT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_code` (`department_code`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'CSE','Computer Science and Engineering'),(2,'IT','Information Technology'),(3,'EXTC','Electronics and Telecommunication Engineering'),(4,'MECH','Mechanical Engineering');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `unique_enrollment_per_year` (`student_id`,`course_id`,`academic_year`),
  KEY `fk_enroll_course` (`course_id`),
  CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (6,2,17,'2025-2026','2026-02-12 17:40:16'),(7,2,18,'2025-2026','2026-02-12 17:40:16'),(8,2,19,'2025-2026','2026-02-12 17:40:16'),(9,2,20,'2025-2026','2026-02-12 17:40:16'),(10,2,21,'2025-2026','2026-02-12 17:40:16'),(11,3,17,'2025-2026','2026-02-12 17:40:16'),(12,3,18,'2025-2026','2026-02-12 17:40:16'),(13,3,19,'2025-2026','2026-02-12 17:40:16'),(14,3,20,'2025-2026','2026-02-12 17:40:16'),(15,3,21,'2025-2026','2026-02-12 17:40:16'),(16,4,17,'2025-2026','2026-02-12 17:40:16'),(17,4,18,'2025-2026','2026-02-12 17:40:16'),(18,4,19,'2025-2026','2026-02-12 17:40:16'),(19,4,20,'2025-2026','2026-02-12 17:40:16'),(20,4,21,'2025-2026','2026-02-12 17:40:16'),(21,5,17,'2025-2026','2026-02-12 17:40:16'),(22,5,18,'2025-2026','2026-02-12 17:40:16'),(23,5,19,'2025-2026','2026-02-12 17:40:16'),(24,5,20,'2025-2026','2026-02-12 17:40:16'),(25,5,21,'2025-2026','2026-02-12 17:40:16'),(26,6,17,'2025-2026','2026-02-12 17:40:16'),(27,6,18,'2025-2026','2026-02-12 17:40:16'),(28,6,19,'2025-2026','2026-02-12 17:40:16'),(29,6,20,'2025-2026','2026-02-12 17:40:16'),(30,6,21,'2025-2026','2026-02-12 17:40:16'),(31,7,17,'2025-2026','2026-02-12 17:40:16'),(32,7,18,'2025-2026','2026-02-12 17:40:16'),(33,7,19,'2025-2026','2026-02-12 17:40:16'),(34,7,20,'2025-2026','2026-02-12 17:40:16'),(35,7,21,'2025-2026','2026-02-12 17:40:16'),(36,8,17,'2025-2026','2026-02-12 17:40:16'),(37,8,18,'2025-2026','2026-02-12 17:40:16'),(38,8,19,'2025-2026','2026-02-12 17:40:16'),(39,8,20,'2025-2026','2026-02-12 17:40:16'),(40,8,21,'2025-2026','2026-02-12 17:40:16'),(41,9,17,'2025-2026','2026-02-12 17:40:17'),(42,9,18,'2025-2026','2026-02-12 17:40:17'),(43,9,19,'2025-2026','2026-02-12 17:40:17'),(44,9,20,'2025-2026','2026-02-12 17:40:17'),(45,9,21,'2025-2026','2026-02-12 17:40:17'),(46,10,17,'2025-2026','2026-02-12 17:40:17'),(47,10,18,'2025-2026','2026-02-12 17:40:17'),(48,10,19,'2025-2026','2026-02-12 17:40:17'),(49,10,20,'2025-2026','2026-02-12 17:40:17'),(50,10,21,'2025-2026','2026-02-12 17:40:17'),(56,11,17,'2025-2026','2026-02-18 00:55:09'),(57,11,18,'2025-2026','2026-02-18 00:55:09'),(58,11,19,'2025-2026','2026-02-18 00:55:09'),(59,11,20,'2025-2026','2026-02-18 00:55:09'),(60,11,21,'2025-2026','2026-02-18 00:55:09'),(61,1,17,'2025-2026','2026-02-18 11:52:38'),(62,1,18,'2025-2026','2026-02-18 11:52:38'),(63,1,19,'2025-2026','2026-02-18 11:52:38'),(64,1,20,'2025-2026','2026-02-18 11:52:38'),(65,1,21,'2025-2026','2026-02-18 11:52:38'),(66,12,11,'2024-2025','2026-03-25 06:49:17'),(67,12,12,'2024-2025','2026-03-25 06:49:17'),(69,12,16,'2024-2025','2026-03-25 06:49:17'),(70,12,22,'2024-2025','2026-03-25 06:49:17'),(73,12,13,'2024-2025','2026-03-25 07:03:43');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `essential_links`
--

DROP TABLE IF EXISTS `essential_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `essential_links` (
  `link_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`link_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `essential_links`
--

LOCK TABLES `essential_links` WRITE;
/*!40000 ALTER TABLE `essential_links` DISABLE KEYS */;
INSERT INTO `essential_links` VALUES (1,'HVPM COET website','https://www.hvpmcoet.in/','2026-03-22 07:26:50'),(2,'SGBAU U CAN APPLY','https://sgbau.ucanapply.com/','2026-03-25 05:46:20');
/*!40000 ALTER TABLE `essential_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `notice_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `posted_by` enum('admin','faculty') NOT NULL,
  `posted_by_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `posted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `year` int DEFAULT NULL,
  `target_audience` enum('all','students','teachers') DEFAULT 'all',
  PRIMARY KEY (`notice_id`),
  KEY `idx_posted_at` (`posted_at`),
  KEY `idx_department` (`department_id`),
  KEY `posted_by_id` (`posted_by_id`),
  CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`posted_by_id`) REFERENCES `teachers` (`teacher_id`),
  CONSTRAINT `notices_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES (1,'holiday','As per the holi ,there will no class on monday','admin',1,NULL,'2026-03-11 03:04:40',NULL,'all'),(2,'holiday notice','there will be holiday on 18/03/2026 in account of gudipadva','admin',1,NULL,'2026-03-12 15:12:43',NULL,'all'),(3,'competition','there will be poster making competition','admin',1,NULL,'2026-03-12 15:13:31',NULL,'all'),(4,'class test','on unit 1','faculty',3,1,'2026-03-12 15:15:37',NULL,'all'),(5,'Eid','on account on eid tommorrow is holiday','faculty',3,1,'2026-03-22 12:31:35',NULL,'all'),(6,'Today is holiday on behalf of EID','Hi','faculty',3,1,'2026-03-22 14:10:51',4,'students'),(7,'Unit test','From 12/04/26 to 15/04/26','faculty',3,1,'2026-03-22 14:16:44',NULL,'all');
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_type` enum('student','faculty') NOT NULL,
  `role` enum('admin','student','faculty') DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (18,2,'student','student','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJUeXBlIjoic3R1ZGVudCIsImlhdCI6MTc3MTE1MDM2NCwiZXhwIjoxNzcxNzU1MTY0fQ.dkmOr9dkhCKMGo1-b8rWnaWquiMHKbtTkJe1d4uPt74','2026-02-22 15:42:44','2026-02-15 10:12:44'),(147,3,'faculty','faculty','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInVzZXJUeXBlIjoiZmFjdWx0eSIsImlhdCI6MTc3NDE3NDg3MiwiZXhwIjoxNzc0Nzc5NjcyfQ.CUjSbiLjKHmXHjhIH6A66ubABJhjkmgJsrxtE8WYpy4','2026-03-29 15:51:12','2026-03-22 10:21:12'),(166,12,'faculty','faculty','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJ1c2VyVHlwZSI6ImZhY3VsdHkiLCJpYXQiOjE3NzQ0MjMyNzIsImV4cCI6MTc3NTAyODA3Mn0.XRh2HwIMwo65adshUkABEh6RTDGQFkYwKfLEWG6UaVU','2026-04-01 12:51:12','2026-03-25 07:21:12');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_fees`
--

DROP TABLE IF EXISTS `student_fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_fees` (
  `fee_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `total_fee` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_id`),
  UNIQUE KEY `student_id` (`student_id`,`academic_year`),
  CONSTRAINT `fk_fee_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_fees`
--

LOCK TABLES `student_fees` WRITE;
/*!40000 ALTER TABLE `student_fees` DISABLE KEYS */;
INSERT INTO `student_fees` VALUES (1,1,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(2,2,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(3,3,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(4,4,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(5,5,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(6,6,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(7,7,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(8,8,'2025-2026',85000.00,0.00,'2026-02-12 17:40:16','2026-02-12 17:40:16'),(9,9,'2025-2026',85000.00,0.00,'2026-02-12 17:40:17','2026-02-12 17:40:17'),(10,10,'2025-2026',85000.00,0.00,'2026-02-12 17:40:17','2026-02-12 17:40:17'),(11,11,'2025-2026',85000.00,0.00,'2026-02-18 00:05:03','2026-02-18 00:05:03'),(12,12,'2024-2025',85000.00,0.00,'2026-03-25 06:49:17','2026-03-25 06:49:17');
/*!40000 ALTER TABLE `student_fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) NOT NULL,
  `middle_name` varchar(30) DEFAULT NULL,
  `last_name` varchar(30) NOT NULL,
  `DOB` date DEFAULT NULL,
  `year` int NOT NULL,
  `semester` int NOT NULL,
  `email` varchar(320) NOT NULL,
  `primary_phone` varchar(15) NOT NULL,
  `alternate_phone` varchar(15) DEFAULT NULL,
  `department_id` int NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `status` enum('active','graduated','dropped','dc') DEFAULT 'active',
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_students_department` (`department_id`),
  CONSTRAINT `fk_students_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'Abhijeet','rajesh','Pinjarkar','2003-05-13',4,8,'abhijeet.pinjarkar@college.edu','9090909090','',1,'$2b$10$lPySYpwDm/mlm5suZDarvuXnG2Bv.SxeT8kMcOk2YLJPsisninUNe','2025-2026','active'),(2,'Bhuvansh','Deepak','Hiwrekar','2003-03-21',4,8,'bhuvansh.hiwrekar@college.edu','111111111',NULL,1,'$2b$10$1J6fmKlAphRsMr3xybD0Fup/PCzoIoN/SMlI4HETbpn36x60zAd62','2025-2026','active'),(3,'Manthan','Narendra','Langote','2002-12-10',4,8,'manthan.langote@college.edu','9001000003',NULL,1,'$2b$10$ZC03IimM3X1U.dvpaKjWjOf/85NtpQq5sXD7eRQ80leRpW7KILHnK','2025-2026','active'),(4,'Prathamesh','Tulsidas','Sande','2003-01-18',4,8,'prathamesh.sande@college.edu','9001000004',NULL,1,'$2b$10$mxqY/nA/mE2i0I0U3K6Asu8.6cIXUEuswbTKdHKdYLUy8nw3epEy2','2025-2026','active'),(5,'Saksham','P','Gorade','2003-07-09',4,8,'saksham.gorade@college.edu','9001000005',NULL,1,'$2b$10$904wK9eA/11Wh4WRbLK9Z.EPRSZUU7ZQ7FZvABsvZT4dnOMz4V8Uy','2025-2026','active'),(6,'Samruddhi','Jaybharat','Kamble','2003-02-11',4,8,'samruddhi.kamble@college.edu','9001000006',NULL,1,'$2b$10$QcdPmOs0VSafxX1LAea59uk7VJLjnzidTPSdFtEOit.IFIP6gsYR2','2025-2026','active'),(7,'Sumedh','Vinay','Khobragade','2002-11-29',4,8,'sumedh.khobragade@college.edu','9001000007',NULL,1,'$2b$10$PVp0qvxXjKxpHhp2m2oe..OCvbD1ZyaD53248abqY0cGScqkOFC5.','2025-2026','active'),(8,'Tejas','Rajendra','Wath','2003-04-02',4,8,'tejas.wath@college.edu','9001000008',NULL,1,'$2b$10$YkDGjTrCpcIOCsCTDXmNkOQhhcjfhDfDA2Sesm0jwBmpBTj5Yer0y','2025-2026','active'),(9,'Shripad','Kailashrao','Bhakare','2002-09-15',4,8,'shripad.bhakare@college.edu','9001000009',NULL,1,'$2b$10$lCDL3s5OzMMzhYp9zSy9IeMpPuzYlaAmV6RggpIHKgBmOSScFln2m','2025-2026','active'),(10,'Aadesh','Gajanan','Dongardive','2003-06-25',4,8,'aadesh.dongardive@college.edu','9001000010',NULL,1,'$2b$10$977iyKVbylQE4KUMJvrx/.YQ1Azirz0Pumi4hL7zSEPuMAnWkLjBi','2025-2026','active'),(11,'Dikshant',NULL,'Athawale','2026-02-25',4,8,'danny@gmail.com','1234567890',NULL,1,'$2b$10$GXIUDXibxmMaqdgmhcy8Oujktiod/nB5Td6TwWkF7XvoZFHUnkc92','2025-2026','active'),(12,'Parth',NULL,'sevkar','2026-03-25',3,6,'parth@gmail.com','1212121212',NULL,1,'$2b$10$YroD64f8b3jNQ.1szKtkA.XAU7Xgvdf6vAIhypa4e4WEOOXq8.jpm','2024-2025','active');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `teacher_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('faculty','admin') NOT NULL,
  `primary_phone` varchar(15) NOT NULL,
  `alternate_phone` varchar(15) DEFAULT NULL,
  `department_id` int NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_teacher_department` (`department_id`),
  CONSTRAINT `fk_teacher_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'Raut','maam','raut.hod@college.edu','$2b$10$sNTkSbORoHQ4qhMdcAC8gewuowo3it9fESgLpG2vtmDJmeFvMatMC','admin','9000000001','',1,'HOD'),(2,'Kaware','Sir','kaware@college.edu','$2b$10$PkN9obrecBiv.HLZ3uYoBOstwZa1aiO2/a3kxHw93FAI7pm1UFM.2','faculty','9000000002',NULL,1,'Assistant Professor'),(3,'Rochlani','Sir','rochlani@college.edu','$2b$10$9r7RTptrP/T2CvLkyLe8WOKjIfREtKOTFzoft.5isTIp4NwZuqYJq','faculty','9000000003',NULL,1,'Assistant Professor'),(4,'Rathod','Sir','rathod@college.edu','$2b$10$lrsUaSiqJwFgzbfyMPu0X.04IxvnxouZuslnsqpNmBo/PSFx4la6C','faculty','9000000004',NULL,1,'Assistant Professor'),(5,'Khare','Sir','khare@college.edu','$2b$10$G/kZay6IcvoniS6nz69Ni.jnZlbHj4ZZ1QEhD/MiwXurCahWTNUNi','faculty','9000000005',NULL,1,'Assistant Professor'),(6,'Deshmukh','maam','deshmukh@college.edu','$2b$10$WENZXg4eavBkEdVbUZCng.0KI01p7blbRaJF05kCA3Vt3xgl/lfCG','faculty','9000000006','',1,'Assistant Professor'),(7,'Ramteke','Sir','ramteke@college.edu','$2b$10$87CddLGE1QLCkVGV5VXvNuSQGZ9QUaSHD6RQSjRSOrmu/jHDRZO1y','faculty','9000000007',NULL,1,'Assistant Professor'),(8,'Bagde','Sir','bagde@college.edu','$2b$10$r50ul/SGapvXGjcCmZ8OzO2p06/vspR/4E/XdPwLRP/Scq2MALqKG','faculty','9000000008',NULL,1,'Assistant Professor'),(9,'Chapke','Sir','chapke@college.edu','$2b$10$q9GPzR3M3kF.sXk.kwMB2OPyoqFZtnp8NAFnYKB2a5XOfLAGhnTSq','faculty','9000000009',NULL,1,'Assistant Professor'),(10,'Pattewar','Sir','pattewar@college.edu','$2b$10$rf1nyhfAj1.r2tLWdw5GX.DW.ggLZyL0qJ9IdDcop1NEaNlCNWqiu','faculty','9000000010',NULL,1,'Assistant Professor'),(11,'Borgaokar','Sir','borgaokar@college.edu','$2b$10$d7A1XN83XAW./FVymcC/5.mBYUuKOxSIh37o2a3lZkiiHhiPpDVXy','faculty','9000000011',NULL,1,'Training Instructor'),(12,'Sanap','Sir','sanap@college.edu','$2b$10$NpxqACL25l.fPG.8fbS4cuFwhzwyhnVA41ePuty7Kj0WFoq2WElti','faculty','9000000012',NULL,1,'Assistant Professor'),(13,'Shekle','Sir','shekle@college.edu','$2b$10$aNl3T37UHnPTbwbullw8KOg.Y8SEjkDhHTYH5T2XE/I1sFqucZfcO','faculty','9000000013',NULL,1,'Assistant Professor'),(14,'Jaiswal','Sir','jaiswal@college.edu','$2b$10$K0znCro9kOY8DRdeqNTWE.ccZLNtM7FctOmoyFyo.6QSZDLHOngPG','faculty','9000000014',NULL,1,'Assistant Professor');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_scores`
--

DROP TABLE IF EXISTS `test_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_scores` (
  `score_id` int NOT NULL AUTO_INCREMENT,
  `test_id` int NOT NULL,
  `student_id` int NOT NULL,
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `is_absent` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`score_id`),
  UNIQUE KEY `unique_test_student` (`test_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `test_scores_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `unit_tests` (`test_id`) ON DELETE CASCADE,
  CONSTRAINT `test_scores_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_scores`
--

LOCK TABLES `test_scores` WRITE;
/*!40000 ALTER TABLE `test_scores` DISABLE KEYS */;
INSERT INTO `test_scores` VALUES (1,1,10,7.00,0,'2026-03-10 13:04:23'),(2,1,1,10.00,0,'2026-03-10 15:05:50'),(3,1,2,NULL,0,'2026-03-10 13:42:02'),(4,1,11,NULL,1,'2026-03-10 13:04:23'),(5,1,3,NULL,1,'2026-03-10 13:04:23'),(6,1,4,NULL,1,'2026-03-10 13:04:23'),(7,1,5,NULL,1,'2026-03-10 13:04:23'),(8,1,6,NULL,1,'2026-03-10 13:04:23'),(9,1,9,NULL,1,'2026-03-10 13:04:23'),(10,1,7,NULL,1,'2026-03-10 13:04:23'),(11,1,8,NULL,1,'2026-03-10 13:04:23');
/*!40000 ALTER TABLE `test_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_slots`
--

DROP TABLE IF EXISTS `time_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_slots` (
  `slot_id` int NOT NULL AUTO_INCREMENT,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`slot_id`),
  UNIQUE KEY `start_time` (`start_time`,`end_time`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_slots`
--

LOCK TABLES `time_slots` WRITE;
/*!40000 ALTER TABLE `time_slots` DISABLE KEYS */;
INSERT INTO `time_slots` VALUES (1,'10:30:00','11:30:00'),(2,'11:30:00','12:30:00'),(3,'13:15:00','14:15:00'),(4,'14:15:00','15:15:00'),(5,'15:30:00','16:30:00'),(6,'16:30:00','17:30:00');
/*!40000 ALTER TABLE `time_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable` (
  `timetable_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `semester` int NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `slot_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`timetable_id`),
  KEY `slot_id` (`slot_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_dept_id` (`department_id`),
  CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `time_slots` (`slot_id`),
  CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable`
--

LOCK TABLES `timetable` WRITE;
/*!40000 ALTER TABLE `timetable` DISABLE KEYS */;
INSERT INTO `timetable` VALUES (1,1,8,'Monday',1,17),(6,1,8,'Tuesday',1,19),(7,1,8,'Tuesday',2,17),(8,1,8,'Tuesday',3,18),(9,1,8,'Tuesday',4,20),(10,1,8,'Tuesday',5,21),(11,1,8,'Wednesday',1,20),(12,1,8,'Wednesday',2,21),(13,1,8,'Wednesday',3,17),(14,1,8,'Wednesday',4,19),(15,1,8,'Wednesday',5,18),(16,1,8,'Thursday',1,21),(17,1,8,'Thursday',2,20),(18,1,8,'Thursday',3,19),(19,1,8,'Thursday',4,17),(20,1,8,'Thursday',5,18),(21,1,8,'Friday',1,18),(22,1,8,'Friday',2,17),(23,1,8,'Friday',3,19),(24,1,8,'Friday',4,20),(25,1,8,'Friday',5,21),(26,1,4,'Monday',2,2),(27,1,8,'Monday',2,21),(28,1,4,'Monday',2,2),(29,1,8,'Monday',1,21);
/*!40000 ALTER TABLE `timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_tests`
--

DROP TABLE IF EXISTS `unit_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_tests` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `test_date` date DEFAULT NULL,
  `max_marks` decimal(5,2) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `unit_tests_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `unit_tests_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_tests`
--

LOCK TABLES `unit_tests` WRITE;
/*!40000 ALTER TABLE `unit_tests` DISABLE KEYS */;
INSERT INTO `unit_tests` VALUES (1,17,'unit test 1','2026-03-05',20.00,3,'2026-03-10 13:03:19');
/*!40000 ALTER TABLE `unit_tests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 15:39:01
