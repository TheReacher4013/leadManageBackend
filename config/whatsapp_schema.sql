USE lead_management;

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  lead_id    INT,
  phone      VARCHAR(20) NOT NULL,
  message    TEXT NOT NULL,
  type       ENUM('sent','received') DEFAULT 'sent',
  status     ENUM('pending','sent','delivered','read','failed') DEFAULT 'pending',
  message_id VARCHAR(100),
  sent_by    INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  template_name  VARCHAR(100) NOT NULL,
  message        TEXT,
  status         ENUM('draft','running','completed','failed') DEFAULT 'draft',
  total_contacts INT DEFAULT 0,
  sent_count     INT DEFAULT 0,
  failed_count   INT DEFAULT 0,
  scheduled_at   TIMESTAMP NULL,
  created_by     INT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS whatsapp_campaign_contacts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  name        VARCHAR(100),
  status      ENUM('pending','sent','delivered','read','failed') DEFAULT 'pending',
  error       TEXT,
  sent_at     TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE
);