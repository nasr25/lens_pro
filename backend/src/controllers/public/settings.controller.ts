import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';

const PUBLIC_KEYS = [
  'logo_url', 'about_ar', 'about_en',
  'social_instagram', 'social_twitter', 'social_snapchat', 'social_tiktok', 'social_youtube',
  'footer_text_ar', 'footer_text_en',
];

export async function getTerms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT value FROM settings WHERE setting_key = 'terms_and_conditions'"
    );
    const value = rows.length ? rows[0].value : '';
    res.json({ terms: value });
  } catch (err) {
    next(err);
  }
}

export async function getPublicSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const placeholders = PUBLIC_KEYS.map(() => '?').join(', ');
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT setting_key, value FROM settings WHERE setting_key IN (${placeholders})`,
      PUBLIC_KEYS
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
