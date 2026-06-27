import jwt from 'jsonwebtoken';
import { env } from './env';

export interface JwtPayload {
  adminId: number;
  username: string;
  jti: string;
}

const revokedJtis = new Set<string>();

export function signAccessToken(payload: Omit<JwtPayload, 'jti'>, jti: string): string {
  return jwt.sign({ ...payload, jti }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number,
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, 'jti'>, jti: string): string {
  return jwt.sign({ ...payload, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as number,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function revokeToken(jti: string): void {
  revokedJtis.add(jti);
}

export function isRevoked(jti: string): boolean {
  return revokedJtis.has(jti);
}
