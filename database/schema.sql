-- ============================================================
-- Lens Pro — Photographer Booking Site
-- Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS lens_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lens_pro;

-- ────────────────────────────────────────────
-- Admin users (single row, no self-registration)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)     NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────
-- Available slots (managed by admin only)
-- slot_time NULL means full-day availability
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS available_slots (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  slot_date  DATE          NOT NULL,
  slot_time  TIME          NULL,
  status     ENUM('available','blocked') NOT NULL DEFAULT 'available',
  label      VARCHAR(100)  NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slot (slot_date, slot_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────
-- Bookings
-- Status lifecycle: pending → confirmed | rejected
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  slot_id          INT UNSIGNED  NOT NULL,
  full_name        VARCHAR(150)  NOT NULL,
  phone_number     VARCHAR(30)   NOT NULL,
  email            VARCHAR(255)  NULL,
  event_type       ENUM('wedding','graduation','commercial','portrait') NOT NULL,
  location         VARCHAR(255)  NOT NULL,
  notes            TEXT          NULL,
  terms_accepted   TINYINT(1)   NOT NULL DEFAULT 0,
  status           ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason VARCHAR(500)  NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_slot
    FOREIGN KEY (slot_id) REFERENCES available_slots(id) ON DELETE RESTRICT,
  INDEX idx_status  (status),
  INDEX idx_slot_id (slot_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────
-- Site settings (key-value store)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  value       TEXT         NOT NULL,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
