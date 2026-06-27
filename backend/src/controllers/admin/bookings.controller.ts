import { Request, Response, NextFunction } from 'express';
import {
  getBookings,
  getBookingById,
  confirmBooking,
  rejectBooking,
  deleteBooking,
  getDashboardStats,
} from '../../services/booking.service';

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const month  = req.query.month  as string | undefined;
    const page   = parseInt(req.query.page  as string || '1');
    const limit  = Math.min(parseInt(req.query.limit as string || '20'), 100);

    const result = await getBookings(status, month, page, limit);
    res.json({ ...result, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await getBookingById(parseInt(req.params.id));
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const updated = await confirmBooking(id, req.admin!.adminId);
    if (!updated) {
      res.status(404).json({ error: 'Booking not found or already processed' });
      return;
    }
    res.json({ message: 'تم تأكيد الحجز بنجاح' });
  } catch (err) {
    next(err);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id     = parseInt(req.params.id);
    const reason = (req.body.rejection_reason as string) || '';
    const updated = await rejectBooking(id, reason, req.admin!.adminId);
    if (!updated) {
      res.status(404).json({ error: 'Booking not found or already processed' });
      return;
    }
    res.json({ message: 'تم رفض الحجز' });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await deleteBooking(parseInt(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    next(err);
  }
}

export async function dashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
