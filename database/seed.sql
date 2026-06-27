-- ============================================================
-- Lens Pro — Seed Data
-- Run AFTER schema.sql
-- Admin password is set via: node scripts/create-admin.js
-- ============================================================

USE lens_pro;

-- Default site settings
INSERT INTO settings (setting_key, value) VALUES
  ('site_name',           'Lens Pro للتصوير'),
  ('contact_phone',       '+966500000000'),
  ('contact_email',       'info@lenspro.sa'),
  ('terms_and_conditions',
   'شروط وأحكام الحجز\n\n١. يُرجى الحضور قبل موعد الجلسة بـ ١٥ دقيقة على الأقل.\n٢. في حال الإلغاء، يجب الإشعار قبل ٤٨ ساعة من الموعد المحدد.\n٣. يحق لفريق التصوير إلغاء أو تأجيل الجلسة في ظروف قاهرة مع إشعار مسبق.\n٤. تُسلَّم الصور النهائية خلال ٧ أيام عمل من تاريخ الجلسة.\n٥. جميع الصور تخضع لحقوق الملكية الفكرية لـ Lens Pro.')
ON DUPLICATE KEY UPDATE value = VALUES(value);
