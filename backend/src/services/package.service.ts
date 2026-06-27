import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';

export interface Package {
  id: number;
  name_ar: string;
  name_en: string;
  price: number;
  currency: string;
  description_ar: string | null;
  description_en: string | null;
  features_ar: string[];
  features_en: string[];
  is_featured: boolean;
  sort_order: number;
}

function parseFeatures(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(raw)) return raw;
  return [];
}

function mapRow(row: RowDataPacket): Package {
  return {
    ...row,
    price:       Number(row.price),
    is_featured: Boolean(row.is_featured),
    features_ar: parseFeatures(row.features_ar),
    features_en: parseFeatures(row.features_en),
  } as Package;
}

export async function getPackages(): Promise<Package[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM packages ORDER BY sort_order ASC, id ASC'
  );
  return rows.map(mapRow);
}

export async function createPackage(data: Omit<Package, 'id'>): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO packages
       (name_ar, name_en, price, currency, description_ar, description_en,
        features_ar, features_en, is_featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name_ar, data.name_en, data.price, data.currency,
      data.description_ar ?? null, data.description_en ?? null,
      JSON.stringify(data.features_ar ?? []),
      JSON.stringify(data.features_en ?? []),
      data.is_featured ? 1 : 0,
      data.sort_order ?? 0,
    ]
  );
  return result.insertId;
}

export async function updatePackage(id: number, data: Partial<Omit<Package, 'id'>>): Promise<boolean> {
  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  if (data.name_ar     !== undefined) { fields.push('name_ar = ?');     values.push(data.name_ar); }
  if (data.name_en     !== undefined) { fields.push('name_en = ?');     values.push(data.name_en); }
  if (data.price       !== undefined) { fields.push('price = ?');       values.push(data.price); }
  if (data.currency    !== undefined) { fields.push('currency = ?');    values.push(data.currency); }
  if (data.description_ar !== undefined) { fields.push('description_ar = ?'); values.push(data.description_ar); }
  if (data.description_en !== undefined) { fields.push('description_en = ?'); values.push(data.description_en); }
  if (data.features_ar !== undefined) { fields.push('features_ar = ?'); values.push(JSON.stringify(data.features_ar)); }
  if (data.features_en !== undefined) { fields.push('features_en = ?'); values.push(JSON.stringify(data.features_en)); }
  if (data.is_featured !== undefined) { fields.push('is_featured = ?'); values.push(data.is_featured ? 1 : 0); }
  if (data.sort_order  !== undefined) { fields.push('sort_order = ?');  values.push(data.sort_order); }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE packages SET ${fields.join(', ')} WHERE id = ?`, values
  );
  return result.affectedRows > 0;
}

export async function deletePackage(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM packages WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
