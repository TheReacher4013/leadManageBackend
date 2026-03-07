USE lead_management;

-- ========================
-- PRODUCTS
-- ========================
CREATE TABLE IF NOT EXISTS products (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  type       ENUM('Product','Service') DEFAULT 'Product',
  price      DECIMAL(10,2) NOT NULL,
  tax_label  VARCHAR(50),
  tax_rate   DECIMAL(5,2) DEFAULT 0,
  logo       TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================
-- EXPENSE CATEGORIES
-- ========================
CREATE TABLE IF NOT EXISTS expense_categories (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================
-- EXPENSES
-- ========================
CREATE TABLE IF NOT EXISTS expenses (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  user_id     INT,
  amount      DECIMAL(10,2) NOT NULL,
  date        DATE NOT NULL,
  notes       TEXT,
  bill        TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL
);

-- ========================
-- SALESMAN
-- ========================
CREATE TABLE IF NOT EXISTS salesmans (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100),
  phone      VARCHAR(20),
  address    TEXT,
  status     ENUM('Enabled','Disabled') DEFAULT 'Enabled',
  profile_image TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================
-- SALESMAN BOOKINGS
-- ========================
CREATE TABLE IF NOT EXISTS salesman_bookings (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  salesman_id INT NOT NULL,
  lead_id     INT,
  title       VARCHAR(150),
  notes       TEXT,
  booking_date DATE,
  status      ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salesman_id) REFERENCES salesmans(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id)     REFERENCES leads(id)     ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

-- ========================
-- CALL LOGS
-- ========================
CREATE TABLE IF NOT EXISTS call_logs (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  lead_id      INT,
  campaign_id  INT,
  called_by    INT,
  phone        VARCHAR(20),
  status       ENUM('answered','not_answered','busy','failed') DEFAULT 'answered',
  duration_sec INT DEFAULT 0,
  notes        TEXT,
  called_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id)    REFERENCES leads(id)              ON DELETE SET NULL,
  FOREIGN KEY (called_by)  REFERENCES users(id)              ON DELETE SET NULL
);