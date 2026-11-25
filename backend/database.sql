-- Green Express database. Import this file for a fresh setup.

DROP DATABASE IF EXISTS green_express;
CREATE DATABASE green_express;
USE green_express;

-- People who can log in (role is 'customer' or 'admin')
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(20),
  password   VARCHAR(255) NOT NULL,           -- bcrypt hash, not the real password
  role       VARCHAR(20)  NOT NULL DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_role CHECK (role IN ('customer', 'admin'))
);

-- Delivery services and their prices (NPR)
CREATE TABLE services (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  type          VARCHAR(20)  NOT NULL,         -- 'Domestic' or 'International'
  description   VARCHAR(255),
  price         DECIMAL(10,2) NOT NULL,
  delivery_days VARCHAR(30)  NOT NULL,
  CONSTRAINT chk_services_type CHECK (type IN ('Domestic', 'International')),
  CONSTRAINT chk_services_price CHECK (price >= 0)
);

-- One row for every parcel that is booked
CREATE TABLE shipments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  tracking_number  VARCHAR(20)  NOT NULL UNIQUE,
  user_id          INT NOT NULL,
  service_id       INT NOT NULL,
  sender_name      VARCHAR(100) NOT NULL,
  sender_phone     VARCHAR(20)  NOT NULL,
  from_city        VARCHAR(100) NOT NULL,
  pickup_address   VARCHAR(255) NOT NULL,
  receiver_name    VARCHAR(100) NOT NULL,
  receiver_phone   VARCHAR(20)  NOT NULL,
  to_city          VARCHAR(100) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  description      VARCHAR(255) NOT NULL,
  weight           DECIMAL(6,2) NOT NULL,
  price            DECIMAL(10,2) NOT NULL,
  status           VARCHAR(30)  NOT NULL DEFAULT 'Booked',
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_shipments_weight CHECK (weight > 0 AND weight <= 70),
  CONSTRAINT chk_shipments_price CHECK (price >= 0),
  CONSTRAINT chk_shipments_status CHECK (status IN ('Booked', 'Picked up', 'In transit', 'Out for delivery', 'Delivered', 'Cancelled')),
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  INDEX idx_shipments_customer_created (user_id, created_at),
  INDEX idx_shipments_service (service_id)
);

-- The tracking history of each shipment
CREATE TABLE tracking_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id INT NOT NULL,
  status      VARCHAR(30)  NOT NULL,
  location    VARCHAR(100) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_tracking_status CHECK (status IN ('Booked', 'Picked up', 'In transit', 'Out for delivery', 'Delivered', 'Cancelled')),
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  INDEX idx_tracking_shipment_created (shipment_id, created_at)
);

-- Messages from the contact form
CREATE TABLE messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  message    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_created (created_at)
);

-- Fixed service prices (NPR) used for pricing and shipment booking.
INSERT INTO services (name, type, description, price, delivery_days) VALUES
('Domestic',      'Domestic',      'Door-to-door delivery within the country.',       150,  '2-4 working days'),
('International', 'International', 'Door-to-door delivery between countries.',      2500,  '7-12 working days');

-- One admin account is supplied so the admin page can be used immediately.
-- Login: gurungdipen@gmail.com / admin123
INSERT INTO users (name, email, password, role) VALUES
('Gurung Dipen', 'gurungdipen@gmail.com', '$2b$10$t2h0M8QnPBObJU81/s8xRu4dF7GsICCAZKZToAyipi63J8oYrkdmS', 'admin');
