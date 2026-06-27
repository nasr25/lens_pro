import { Request, Response, NextFunction } from 'express';
import {
  getAdminSlots,
  createSlots,
  updateSlotStatus,
  deleteSlot,
} from '../../services/slot.service';

export async function listSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.query.month as string | undefined;
    const slots = await getAdminSlots(month);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}

export async function createSlotsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dates, times, status = 'available', label } = req.body;
    const count = await createSlots(dates, times, status, label ?? null);
    res.status(201).json({ created: count, message: `تم إنشاء ${count} وقت بنجاح` });
  } catch (err) {
    next(err);
  }
}

export async function updateSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateSlotStatus(id, req.body.status);
    if (!updated) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }
    res.json({ message: 'Slot updated' });
  } catch (err) {
    next(err);
  }
}

export async function removeSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteSlot(id);
    if (!result.success) {
      res.status(409).json({ error: result.error });
      return;
    }
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    next(err);
  }
}
