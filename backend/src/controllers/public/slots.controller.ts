import { Request, Response, NextFunction } from 'express';
import { getCalendarSlots } from '../../services/slot.service';

export async function listCalendarSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.query.month as string;
    const slots = await getCalendarSlots(month);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}
