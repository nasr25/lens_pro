import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export type CalendarStatus = 'available' | 'pending' | 'confirmed' | 'blocked';

export interface SlotCalendarEntry {
  id: number;
  slot_date: string;
  slot_time: string | null;
  calendar_status: CalendarStatus;
  label: string | null;
}

export interface SlotAdminEntry extends SlotCalendarEntry {
  status: 'available' | 'blocked';
  booking_count: number;
}

export async function getCalendarSlots(month: string): Promise<SlotCalendarEntry[]> {
  const [year, mon] = month.split('-');
  const startDate = `${year}-${mon}-01`;
  const endDate = `${year}-${mon}-31`;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       s.id,
       DATE_FORMAT(s.slot_date, '%Y-%m-%d') AS slot_date,
       s.slot_time,
       s.label,
       COALESCE(
         MAX(CASE WHEN b.status = 'confirmed' THEN 'confirmed' END),
         MAX(CASE WHEN b.status = 'pending'   THEN 'pending'   END),
         CASE WHEN s.status = 'blocked' THEN 'blocked' ELSE 'available' END
       ) AS calendar_status
     FROM available_slots s
     LEFT JOIN bookings b
       ON b.slot_id = s.id AND b.status IN ('pending', 'confirmed')
     WHERE s.slot_date BETWEEN ? AND ?
     GROUP BY s.id
     ORDER BY s.slot_date, s.slot_time`,
    [startDate, endDate]
  );

  return rows as SlotCalendarEntry[];
}

export async function getAdminSlots(month?: string): Promise<SlotAdminEntry[]> {
  let whereClause = '';
  const params: string[] = [];

  if (month) {
    const [year, mon] = month.split('-');
    whereClause = 'WHERE s.slot_date BETWEEN ? AND ?';
    params.push(`${year}-${mon}-01`, `${year}-${mon}-31`);
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       s.id,
       DATE_FORMAT(s.slot_date, '%Y-%m-%d') AS slot_date,
       s.slot_time,
       s.status,
       s.label,
       COUNT(b.id) AS booking_count,
       COALESCE(
         MAX(CASE WHEN b.status = 'confirmed' THEN 'confirmed' END),
         MAX(CASE WHEN b.status = 'pending'   THEN 'pending'   END),
         CASE WHEN s.status = 'blocked' THEN 'blocked' ELSE 'available' END
       ) AS calendar_status
     FROM available_slots s
     LEFT JOIN bookings b ON b.slot_id = s.id AND b.status IN ('pending', 'confirmed')
     ${whereClause}
     GROUP BY s.id
     ORDER BY s.slot_date, s.slot_time`,
    params
  );

  return rows as SlotAdminEntry[];
}

export async function createSlots(
  dates: string[],
  times: string[] | undefined,
  status: 'available' | 'blocked',
  label: string | null
): Promise<number> {
  if (!times || times.length === 0) {
    times = [null as unknown as string];
  }

  let insertCount = 0;
  for (const date of dates) {
    for (const time of times) {
      const [result] = await pool.execute(
        `INSERT INTO available_slots (slot_date, slot_time, status, label)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), label = VALUES(label)`,
        [date, time ?? null, status, label ?? null]
      );
      insertCount++;
    }
  }

  return insertCount;
}

export async function updateSlotStatus(
  id: number,
  status: 'available' | 'blocked'
): Promise<boolean> {
  const [result] = await pool.execute<any>(
    'UPDATE available_slots SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
}

export async function deleteSlot(id: number): Promise<{ success: boolean; error?: string }> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM bookings
     WHERE slot_id = ? AND status IN ('pending', 'confirmed')`,
    [id]
  );

  if ((rows[0] as any).cnt > 0) {
    return { success: false, error: 'Cannot delete slot with active bookings' };
  }

  await pool.execute('DELETE FROM available_slots WHERE id = ?', [id]);
  return { success: true };
}
