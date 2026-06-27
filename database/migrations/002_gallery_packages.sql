-- ============================================================
-- Migration 002: Gallery Photos + Packages
-- ============================================================

USE lens_pro;

CREATE TABLE IF NOT EXISTS gallery_photos (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  url         VARCHAR(500)  NOT NULL,
  caption_ar  VARCHAR(200)  NULL,
  caption_en  VARCHAR(200)  NULL,
  sort_order  INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS packages (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  name_ar         VARCHAR(100)   NOT NULL,
  name_en         VARCHAR(100)   NOT NULL,
  price           DECIMAL(10,2)  NOT NULL,
  currency        VARCHAR(10)    NOT NULL DEFAULT 'ريال',
  description_ar  TEXT           NULL,
  description_en  TEXT           NULL,
  features_ar     JSON           NULL,
  features_en     JSON           NULL,
  is_featured     TINYINT(1)     NOT NULL DEFAULT 0,
  sort_order      INT UNSIGNED   NOT NULL DEFAULT 0,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- New settings keys
INSERT INTO settings (setting_key, value) VALUES
  ('logo_url',          ''),
  ('about_ar',          'نحن فريق من المصورين المحترفين المتخصصين في تصوير المناسبات والجلسات الخاصة. نؤمن بأن كل لحظة تستحق أن تُخلَّد بأجمل صورة.'),
  ('about_en',          'We are a team of professional photographers specializing in event and portrait photography. We believe every moment deserves to be captured beautifully.'),
  ('social_instagram',  ''),
  ('social_twitter',    ''),
  ('social_snapchat',   ''),
  ('social_tiktok',     ''),
  ('footer_text_ar',    'جميع الحقوق محفوظة © Lens Pro للتصوير'),
  ('footer_text_en',    'All rights reserved © Lens Pro Photography')
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Dummy gallery photos (Unsplash photography)
INSERT INTO gallery_photos (url, caption_ar, caption_en, sort_order) VALUES
  ('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'حفل زفاف', 'Wedding', 1),
  ('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', 'جلسة عائلية', 'Family Session', 2),
  ('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'حفل تخرج', 'Graduation', 3),
  ('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800', 'مناسبة تجارية', 'Corporate Event', 4),
  ('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800', 'تصوير خارجي', 'Outdoor Shoot', 5),
  ('https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800', 'جلسة بورتريه', 'Portrait Session', 6);

-- Dummy packages
INSERT INTO packages (name_ar, name_en, price, currency, description_ar, description_en, features_ar, features_en, is_featured, sort_order) VALUES
  ('الأساسية', 'Basic', 800.00, 'ريال',
   'مثالية للجلسات الفردية والمناسبات الصغيرة',
   'Perfect for individual sessions and small events',
   '["جلسة مدتها ٢ ساعة", "٥٠ صورة معدّلة", "تسليم خلال ٧ أيام", "ألبوم رقمي"]',
   '["2-hour session", "50 edited photos", "Delivery within 7 days", "Digital album"]',
   0, 1),
  ('الاحترافية', 'Professional', 1500.00, 'ريال',
   'الأنسب للأعراس والمناسبات العائلية',
   'Best for weddings and family events',
   '["جلسة مدتها ٤ ساعات", "١٥٠ صورة معدّلة", "تسليم خلال ٣ أيام", "ألبوم رقمي + طباعة", "مصور إضافي"]',
   '["4-hour session", "150 edited photos", "Delivery within 3 days", "Digital album + prints", "Second photographer"]',
   1, 2),
  ('المميزة', 'Premium', 2500.00, 'ريال',
   'تغطية كاملة لأهم لحظاتك',
   'Full coverage for your most important moments',
   '["تغطية يوم كامل", "صور غير محدودة", "تسليم فوري", "ألبوم فاخر مطبوع", "فيديو هايلايت", "مصوران"]',
   '["Full day coverage", "Unlimited photos", "Express delivery", "Luxury print album", "Highlight video", "2 photographers"]',
   0, 3);
