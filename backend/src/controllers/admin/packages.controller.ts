import { Request, Response, NextFunction } from 'express';
import { getPackages, createPackage, updatePackage, deletePackage } from '../../services/package.service';

export async function listPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json(await getPackages()); } catch (e) { next(e); }
}

export async function addPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = await createPackage(req.body);
    res.status(201).json({ id });
  } catch (e) { next(e); }
}

export async function editPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ok = await updatePackage(parseInt(req.params.id), req.body);
    if (!ok) { res.status(404).json({ error: 'Package not found' }); return; }
    res.json({ message: 'Updated' });
  } catch (e) { next(e); }
}

export async function removePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ok = await deletePackage(parseInt(req.params.id));
    if (!ok) { res.status(404).json({ error: 'Package not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
}
