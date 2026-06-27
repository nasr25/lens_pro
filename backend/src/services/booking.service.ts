import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';

export interface NewBookingData {
  slot_id: number;
  full_name: string;
  phone_number: string;
  email?: string | null;
  event_type: 'wedding' | 'graduation' | 'commercial' | 'portrait';
  location: string;
  notes?: string | null;
  terms_accepted: boolean;
}

export interface Booking {
  id: number;
  slot_id: number;
  full_name: string;
  phone_number: string;
  email: string | null;
  event_type: string;
  location: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  rejection_reason: string | null;
  slot_date: string;
  slot_time: string | null;
  created_at: string;
}

export async function createBooking(data: NewBookingData): Promise<{ id: number } | { error: string; status: number }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the slot row to prevent race conditions
    const [slotRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id, status FROM available_slots WHERE id = ? FOR UPDATE',
      [data.slot_id]
    );

    if (slotRows.length === 0) {
      await conn.rollback();
      return { error: 'Slot not found', status: 404 };
    }

    if (slotRows[0].status === 'blocked') {
      await conn.rollback();
      return { error: 'This slot is not available for booking', status: 409 };
    }

    // Check for existing active bookings on this slot
    const [existingRows] = await conn.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM bookings
       WHERE slot_id = ? AND status IN ('pending', 'confirmed')`,
      [data.slot_id]
    );

    if ((existingRows[0] as any).cnt > 0) {
      await conn.rollback();
      return { error: 'This slot is already booked or has a pending booking', status: 409 };
    }

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO bookings
         (slot_id, full_name, phone_number, email, event_type, location, notes, terms_accepted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.slot_id,
        data.full_name,
        data.phone_number,
        data.email ?? null,
        data.event_type,
        data.location,
        data.notes ?? null,
        data.terms_accepted ? 1 : 0,
      ]
    );

    await conn.commit();

    console.log(JSON.stringify({
      level: 'info',
      event: 'booking_created',
      booking_id: result.insertId,
      slot_id: data.slot_id,
      timestamp: new Date().toISOString(),
    }));

    return { id: result.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getBookings(
  status?: string,
  month?: string,
  page = 1,
  limit = 20
): Promise<{ bookings: Booking[]; total: number }> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status && status !== 'all') {
    conditions.push('b.status = ?');
    params.push(status);
  }

  if (month) {
    const [year, mon] = month.split('-');
    conditions.push('s.slot_date BETWEEN ? AND ?');
    params.push(`${year}-${mon}-01`, `${year}-${mon}-31`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM bookings b
     JOIN available_slots s ON s.id = b.slot_id
     ${where}`,
    params
  );

  const total = (countRows[0] as any).total;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       b.id, b.slot_id, b.full_name, b.phone_number, b.email,
       b.event_type, b.location, b.notes, b.status, b.rejection_reason,
       DATE_FORMAT(s.slot_date, '%Y-%m-%d') AS slot_date,
       s.slot_time,
       b.created_at
     FROM bookings b
     JOIN available_slots s ON s.id = b.slot_id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { bookings: rows as Booking[], total };
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       b.id, b.slot_id, b.full_name, b.phone_number, b.email,
       b.event_type, b.location, b.notes, b.status, b.rejection_reason,
       DATE_FORMAT(s.slot_date, '%Y-%m-%d') AS slot_date,
       s.slot_time,
       b.created_at
     FROM bookings b
     JOIN available_slots s ON s.id = b.slot_id
     WHERE b.id = ?`,
    [id]
  );

  return rows.length ? (rows[0] as Booking) : null;
}

export async function confirmBooking(id: number, adminId: number): Promise<boolean> {
  const [result] = await pool.execute<any>(
    `UPDATE bookings SET status = 'confirmed'
     WHERE id = ? AND status = 'pending'`,
    [id]
  );

  if (result.affectedRows > 0) {
    console.log(JSON.stringify({
      level: 'info',
      event: 'booking_confirmed',
      booking_id: id,
      admin_id: adminId,
      timestamp: new Date().toISOString(),
    }));
  }

  return result.affectedRows > 0;
}

export async function rejectBooking(
  id: number,
  reason: string,
  adminId: number
): Promise<boolean> {
  const [result] = await pool.execute<any>(
    `UPDATE bookings SET status = 'rejected', rejection_reason = ?
     WHERE id = ? AND status = 'pending'`,
    [reason, id]
  );

  if (result.affectedRows > 0) {
    console.log(JSON.stringify({
      level: 'info',
      event: 'booking_rejected',
      booking_id: id,
      admin_id: adminId,
      timestamp: new Date().toISOString(),
    }));
  }

  return result.affectedRows > 0;
}

export async function deleteBooking(id: number): Promise<boolean> {
  const [result] = await pool.execute<any>(
    'DELETE FROM bookings WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

export async function getDashboardStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
}> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'pending')   AS pending,
       SUM(status = 'confirmed') AS confirmed,
       SUM(status = 'rejected')  AS rejected
     FROM bookings`
  );

  const r = rows[0] as any;
  return {
    total:     Number(r.total)     || 0,
    pending:   Number(r.pending)   || 0,
    confirmed: Number(r.confirmed) || 0,
    rejected:  Number(r.rejected)  || 0,
  };
}
