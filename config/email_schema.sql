-- -- =============================================
-- -- EMAIL MODULE - Schema
-- -- =============================================

-- USE lead_management;

-- -- -------------------------
-- -- EMAIL CAMPAIGNS TABLE
-- -- -------------------------
-- CREATE TABLE IF NOT EXISTS email_campaigns (
--   id             INT PRIMARY KEY AUTO_INCREMENT,
--   name           VARCHAR(100) NOT NULL,
--   subject        VARCHAR(255) NOT NULL,
--   body           TEXT         NOT NULL,
--   status         ENUM('draft','running','completed','failed') DEFAULT 'draft',
--   total_contacts INT  DEFAULT 0,
--   sent_count     INT  DEFAULT 0,
--   failed_count   INT  DEFAULT 0,
--   scheduled_at   TIMESTAMP NULL,
--   created_by     INT,
--   created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
-- );

-- -- -------------------------
-- -- EMAIL CAMPAIGN CONTACTS
-- -- -------------------------
-- CREATE TABLE IF NOT EXISTS email_campaign_contacts (
--   id           INT PRIMARY KEY AUTO_INCREMENT,
--   campaign_id  INT NOT NULL,
--   email        VARCHAR(100) NOT NULL,
--   name         VARCHAR(100),
--   status       ENUM('pending','sent','failed') DEFAULT 'pending',
--   error        TEXT,
--   sent_at      TIMESTAMP NULL,
--   created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
-- );

-- -- -------------------------
-- -- EMAIL LOGS (individual emails)
-- -- -------------------------
-- CREATE TABLE IF NOT EXISTS email_logs (
--   id         INT PRIMARY KEY AUTO_INCREMENT,
--   lead_id    INT,
--   to_email   VARCHAR(100) NOT NULL,
--   subject    VARCHAR(255) NOT NULL,
--   body       TEXT,
--   status     ENUM('sent','failed') DEFAULT 'sent',
--   sent_by    INT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
--   FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
-- );



USE lead_management;

CREATE TABLE IF NOT EXISTS email_campaigns (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  subject        VARCHAR(255) NOT NULL,
  body           TEXT NOT NULL,
  status         ENUM('draft','running','completed','failed') DEFAULT 'draft',
  total_contacts INT DEFAULT 0,
  sent_count     INT DEFAULT 0,
  failed_count   INT DEFAULT 0,
  scheduled_at   TIMESTAMP NULL,
  created_by     INT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS email_campaign_contacts (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  email       VARCHAR(100) NOT NULL,
  name        VARCHAR(100),
  status      ENUM('pending','sent','failed') DEFAULT 'pending',
  error       TEXT,
  sent_at     TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_logs (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  lead_id    INT,
  to_email   VARCHAR(100) NOT NULL,
  subject    VARCHAR(255) NOT NULL,
  body       TEXT,
  status     ENUM('sent','failed') DEFAULT 'sent',
  sent_by    INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
);