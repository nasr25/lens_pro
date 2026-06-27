import { Request, Response, NextFunction } from 'express';
import { getPackages } from '../../services/package.service';

export async function listPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const packages = await getPackages();
    res.json(packages);
  } catch (err) { next(err); }
}
