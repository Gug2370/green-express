
CREATE DATABASE green_express;
USE green_express;

-- 1. USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(20)
);

-- 2. SERVICES
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);

-- 3. SHIPMENTS
CREATE TABLE shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_id INT,
    sender VARCHAR(100),
    receiver VARCHAR(100),
    from_city VARCHAR(100),
    to_city VARCHAR(100),
    weight DECIMAL(6,2),
    price DECIMAL(10,2),
    status VARCHAR(30),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ADMINS
INSERT INTO users VALUES
(1, 'Gurung Dipen', 'gurungdipen@gmail.com', 'admin123', 'admin'),
(2, 'Kushal Subedhi', 'kushalsubedhi@gmail.com', 'admin123', 'admin'),
(3, 'Safal Dong Tamang', 'safaldongtamang@gmail.com', 'admin123', 'admin'),
(4, 'Arslonbek', 'arslonbek@gmail.com', 'admin123', 'admin');

-- CUSTOMERS
INSERT INTO users VALUES
(5, 'John Smith', 'john@gmail.com', 'customer123', 'customer'),
(6, 'Emma Johnson', 'emma@gmail.com', 'customer123', 'customer'),
(7, 'Alex Morgan', 'alex@gmail.com', 'customer123', 'customer');

-- SERVICES
INSERT INTO services VALUES
(1, 'Domestic Delivery', 150),
(2, 'International Delivery', 2500);
