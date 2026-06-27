import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isRevoked } from '../config/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    if (isRevoked(payload.jti)) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
