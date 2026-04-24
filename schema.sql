CREATE DATABASE IF NOT EXISTS pfm_ledger
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pfm_ledger;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  jwt_token VARCHAR(512) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(60) NOT NULL,
  budget_month CHAR(7) NOT NULL,
  limit_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_budgets_user_category_month
    UNIQUE (user_id, category, budget_month)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(60) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  note VARCHAR(255) NULL,
  occurred_at DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS financial_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(80) NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  product_type ENUM('deposit', 'savings', 'investment') NOT NULL,
  rate_display VARCHAR(40) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_products_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_saved_products_product
    FOREIGN KEY (product_id) REFERENCES financial_products(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_saved_products_user_product
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_budgets_user_month ON budgets (user_id, budget_month);
CREATE INDEX idx_transactions_user_date ON transactions (user_id, occurred_at DESC);
CREATE INDEX idx_transactions_user_category ON transactions (user_id, category);
CREATE INDEX idx_products_type ON financial_products (product_type);

INSERT INTO financial_products (bank_name, product_name, product_type, rate_display, description)
SELECT * FROM (
  SELECT '하이은행', '챌린지 자유적금', 'savings', '연 3.6%', '짧은 기간 집중 저축용'
  UNION ALL
  SELECT '도약저축', '생활비 세이프 통장', 'deposit', '연 2.9%', '비상금 보관용'
  UNION ALL
  SELECT '미래증권', '모의투자 스타터', 'investment', '위험도 중간', '포트폴리오 실습용'
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM financial_products
);
