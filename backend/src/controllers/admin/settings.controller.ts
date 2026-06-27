import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';

const ALLOWED_KEYS = [
  'terms_and_conditions', 'site_name', 'contact_phone', 'contact_email',
  'logo_url', 'about_ar', 'about_en',
  'social_instagram', 'social_twitter', 'social_snapchat', 'social_tiktok',
  'footer_text_ar', 'footer_text_en',
];

export async function getAllSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT setting_key, value, updated_at FROM settings'
    );
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.params.key;

    if (!ALLOWED_KEYS.includes(key)) {
      res.status(400).json({ error: 'Invalid setting key' });
      return;
    }

    const value = req.body.value;
    if (typeof value !== 'string') {
      res.status(422).json({ error: 'value must be a string' });
      return;
    }

    await pool.execute(
      'INSERT INTO settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
      [key, value]
    );

    res.json({ message: 'Setting updated successfully' });
  } catch (err) {
    next(err);
  }
}
