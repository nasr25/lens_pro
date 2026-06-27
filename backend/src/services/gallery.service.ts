import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';

export interface GalleryPhoto {
  id: number;
  url: string;
  caption_ar: string | null;
  caption_en: string | null;
  sort_order: number;
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, url, caption_ar, caption_en, sort_order FROM gallery_photos ORDER BY sort_order ASC, id ASC'
  );
  return rows as GalleryPhoto[];
}

export async function addGalleryPhoto(data: Omit<GalleryPhoto, 'id'>): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO gallery_photos (url, caption_ar, caption_en, sort_order) VALUES (?, ?, ?, ?)',
    [data.url, data.caption_ar ?? null, data.caption_en ?? null, data.sort_order ?? 0]
  );
  return result.insertId;
}

export async function deleteGalleryPhoto(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM gallery_photos WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}

export async function reorderPhotos(orderedIds: number[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await pool.execute('UPDATE gallery_photos SET sort_order = ? WHERE id = ?', [i, orderedIds[i]]);
  }
}
