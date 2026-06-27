import { Request, Response, NextFunction } from 'express';
import { createBooking } from '../../services/booking.service';

export async function submitBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await createBooking({
      slot_id:       Number(req.body.slot_id),
      full_name:     req.body.full_name,
      phone_number:  req.body.phone_number,
      email:         req.body.email || null,
      event_type:    req.body.event_type,
      location:      req.body.location,
      notes:         req.body.notes || null,
      terms_accepted: req.body.terms_accepted === true || req.body.terms_accepted === 'true',
    });

    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.status(201).json({ id: result.id, message: 'تم استلام طلب الحجز بنجاح' });
  } catch (err) {
    next(err);
  }
}
