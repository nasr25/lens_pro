import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';

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
