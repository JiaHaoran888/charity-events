DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db;
USE charityevents_db;

CREATE TABLE organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  contact_email VARCHAR(120),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  short_description VARCHAR(255),
  description TEXT,
  event_date DATETIME NOT NULL,
  location VARCHAR(150),
  address VARCHAR(255),
  price DECIMAL(8,2) DEFAULT 0.00,
  capacity INT DEFAULT 0,
  image_url VARCHAR(500),
  goal_amount DECIMAL(12,2) DEFAULT 0.00,
  raised_amount DECIMAL(12,2) DEFAULT 0.00,
  status ENUM('active','paused') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE event_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  url VARCHAR(500),
  caption VARCHAR(255),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  type VARCHAR(80),
  price DECIMAL(8,2),
  quantity INT,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

INSERT INTO organizations (name, description, contact_email, phone) VALUES
('CityCare Foundation','Local nonprofit supporting community welfare','info@citycare.org','(02) 1234 5678'),
('GreenWave Charity','Environment and community gardens initiative','hello@greenwave.org','(02) 8765 4321');

INSERT INTO categories (name) VALUES
('Charity Run'),
('Gala Dinner'),
('Silent Auction'),
('Benefit Concert'),
('Workshop');

INSERT INTO events (org_id, category_id, name, short_description, description, event_date, location, address, price, capacity, image_url, goal_amount, raised_amount, status) VALUES
(1,1,'Hope 5K Community Run','Run to raise funds for child education','A family-friendly 5K event to raise funds for local school scholarships.', '2025-08-15 08:00:00','Riverside Park','100 River Rd, YourCity',20.00,200,'https://picsum.photos/seed/1/800/450',5000.00,4200.00,'active'),
(1,2,'CityCare Annual Gala','Formal dinner supporting community programs','An elegant evening featuring dinner, speakers, and fundraising auctions.', '2025-09-25 18:30:00','Grand Hall','1 Civic Center Pl, YourCity',150.00,250,'https://picsum.photos/seed/2/800/450',20000.00,6500.00,'active'),
(2,4,'GreenWave Benefit Concert','Live music night to support urban greening','Local bands and performers will play to raise awareness and funds.', '2025-10-10 19:00:00','Sunset Amphitheatre','400 Park Ln, YourCity',35.00,500,'https://picsum.photos/seed/3/800/450',8000.00,1200.00,'active'),
(1,3,'Silent Auction for Books','Auction evening for used and donated books','A silent auction where guests bid on curated book collections.', '2025-09-05 17:00:00','Community Library','22 Book St, YourCity',0.00,150,'https://picsum.photos/seed/4/800/450',2000.00,850.00,'paused'),
(2,5,'Gardening Workshop Series','Hands-on workshops to start community gardens','Practical workshops teaching soil, planting, and maintenance.', '2025-11-12 09:00:00','GreenWave Hub','55 Greenway Blvd, YourCity',10.00,40,'https://picsum.photos/seed/5/800/450',1500.00,300.00,'active'),
(1,1,'Charity Fun Run - Spring','Short fun run for families','A relaxed 3 km run with fun activities for kids.', '2025-09-19 09:00:00','Harborfront','8 Bay Ave, YourCity',5.00,300,'https://picsum.photos/seed/6/800/450',1000.00,1000.00,'active'),
(2,2,'Harvest Gala','Fundraising dinner for food programs','A dinner event featuring guest speakers and a live auction.', '2025-12-01 18:00:00','Riverside Ballroom','200 Waterfront Dr, YourCity',120.00,200,'https://picsum.photos/seed/7/800/450',15000.00,4000.00,'active'),
(1,4,'Acoustic Night for Charity','Small music night supporting after-school clubs','An intimate evening of acoustic performances.', '2025-07-01 20:00:00','Cafe Echo','10 Music Ln, YourCity',15.00,80,'https://picsum.photos/seed/8/800/450',1200.00,1200.00,'active');

INSERT INTO event_images (event_id, url, caption) VALUES
(1,'https://picsum.photos/seed/1a/800/450','Runners at start line'),
(2,'https://picsum.photos/seed/2a/800/450','Gala setup'),
(3,'https://picsum.photos/seed/3a/800/450','Stage lights');

INSERT INTO tickets (event_id, type, price, quantity) VALUES
(1,'General',20.00,200),
(2,'Standard',120.00,150),
(2,'VIP',250.00,50),
(3,'General',35.00,500),
(5,'Participant',10.00,40);
