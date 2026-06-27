import { Request, Response, NextFunction } from 'express';

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const tokenFromHeader = req.headers['x-csrf-token'] as string | undefined;
  const tokenFromCookie = req.cookies?.['csrf-token'] as string | undefined;

  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    res.status(403).json({ error: 'CSRF token validation failed' });
    return;
  }

  next();
}
