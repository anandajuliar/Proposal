CREATE DATABASE proposal_db;
USE proposal_db;

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    
    CONSTRAINT chk_user_first_name CHECK (firstname REGEXP '^[a-zA-Z ]{3,}$'),
    CONSTRAINT chk_user_last_name CHECK (lastname REGEXP '^[a-zA-Z ]{3,}$'),
    CONSTRAINT chk_email CHECK (email LIKE '%_@_%' AND CHAR_LENGTH(email) >= 5)
);

CREATE TABLE proceedings_proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizer_name VARCHAR(150) NOT NULL, 
    event_name VARCHAR(255) NOT NULL,
    acronym VARCHAR(100),
    delivery_date DATE,
    status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
    form_details JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_user INT, 
    
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);
