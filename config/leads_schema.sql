USE lead_management;

CREATE TABLE IF NOT EXISTS leads (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100),
  phone       VARCHAR(20),
  company     VARCHAR(100),
  requirement TEXT,
  source      ENUM('website','facebook','google','whatsapp','manual','referral','other') DEFAULT 'manual',
  status      ENUM('new','hot','warm','cold','converted','lost') DEFAULT 'new',
  deal_value  DECIMAL(10,2) DEFAULT 0,
  assigned_to INT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_tags (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  lead_id    INT NOT NULL,
  tag        VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_notes (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  lead_id    INT NOT NULL,
  user_id    INT NOT NULL,
  note       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_activity_logs (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  lead_id      INT NOT NULL,
  performed_by INT,
  action_type  VARCHAR(50) NOT NULL,
  description  TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id)      REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  lead_id        INT NOT NULL,
  assigned_to    INT,
  follow_up_date DATE NOT NULL,
  note           TEXT,
  is_done        BOOLEAN DEFAULT false,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id)     REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);