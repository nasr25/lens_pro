import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken, revokeToken, isRevoked } from '../../config/jwt';
import { env } from '../../config/env';

const REFRESH_COOKIE = 'refresh-token';
const CSRF_COOKIE    = 'csrf-token';

function setCookies(res: Response, accessJti: string, refreshToken: string, csrfToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     '/api/admin/auth',
  });

  res.cookie(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure:   env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, username, password_hash FROM admin_users WHERE username = ?',
      [username]
    );

    const genericError = { error: 'Invalid credentials' };

    if (rows.length === 0) {
      // Constant-time comparison to prevent timing attacks
      await bcrypt.compare(password, '$2b$12$invalidhashtopreventtimingattacks00000000000000000000000');
      console.log(JSON.stringify({ level: 'warn', event: 'login_failed', username, ip: req.ip, timestamp: new Date().toISOString() }));
      res.status(401).json(genericError);
      return;
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      console.log(JSON.stringify({ level: 'warn', event: 'login_failed', username, ip: req.ip, timestamp: new Date().toISOString() }));
      res.status(401).json(genericError);
      return;
    }

    const accessJti  = uuidv4();
    const refreshJti = uuidv4();
    const csrfToken  = uuidv4();

    const payload = { adminId: admin.id, username: admin.username };
    const accessToken  = signAccessToken(payload, accessJti);
    const refreshToken = signRefreshToken(payload, refreshJti);

    setCookies(res, accessJti, refreshToken, csrfToken);

    console.log(JSON.stringify({ level: 'info', event: 'login_success', username, ip: req.ip, timestamp: new Date().toISOString() }));

    res.json({ accessToken, csrfToken, username: admin.username });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.admin) {
      revokeToken(req.admin.jti);
    }

    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        revokeToken(payload.jti);
      } catch { /* already expired */ }
    }

    res.clearCookie(REFRESH_COOKIE, { path: '/api/admin/auth' });
    res.clearCookie(CSRF_COOKIE);

    console.log(JSON.stringify({ level: 'info', event: 'logout', admin_id: req.admin?.adminId, timestamp: new Date().toISOString() }));

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    if (isRevoked(payload.jti)) {
      res.status(401).json({ error: 'Refresh token has been revoked' });
      return;
    }

    const accessJti = uuidv4();
    const csrfToken = uuidv4();
    const newAccessToken = signAccessToken(
      { adminId: payload.adminId, username: payload.username },
      accessJti
    );

    res.cookie(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      secure:   env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken, csrfToken });
  } catch (err) {
    next(err);
  }
}
