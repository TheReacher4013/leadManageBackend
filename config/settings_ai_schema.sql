USE lead_management;

CREATE TABLE IF NOT EXISTS system_settings (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  key_name   VARCHAR(100) UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  lead_id        INT,
  prompt         TEXT,
  recommendation TEXT NOT NULL,
  type           VARCHAR(50),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);