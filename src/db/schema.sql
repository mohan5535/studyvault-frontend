-- StudyVault database schema
-- Run this once against a PostgreSQL database before starting the API.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.

-- Required for fast, fuzzy ILIKE-style title search (used in Resources search).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password_hash   TEXT          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =========================================================
-- CATEGORIES (owned by a user)
-- =========================================================
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(60)   NOT NULL,
  color       VARCHAR(20),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- =========================================================
-- RESOURCES
-- =========================================================
CREATE TABLE IF NOT EXISTS resources (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
  title         VARCHAR(200)  NOT NULL,
  url           TEXT          NOT NULL,
  type          VARCHAR(30)   NOT NULL CHECK (
                  type IN ('documentation', 'article', 'video', 'course', 'website', 'other')
                ),
  description   TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_resources_user_id     ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_type        ON resources(type);

-- Trigram index on title to support fast ILIKE '%term%' search.
CREATE INDEX IF NOT EXISTS idx_resources_title_trgm
  ON resources USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
