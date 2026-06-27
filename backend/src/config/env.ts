import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT:                    z.string().default('3000'),
  NODE_ENV:                z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST:                 z.string().min(1),
  DB_PORT:                 z.string().default('3306'),
  DB_USER:                 z.string().min(1),
  DB_PASSWORD:             z.string(),
  DB_NAME:                 z.string().min(1),
  JWT_SECRET:              z.string().min(32),
  JWT_EXPIRES_IN:          z.string().default('15m'),
  JWT_REFRESH_SECRET:      z.string().min(32),
  JWT_REFRESH_EXPIRES_IN:  z.string().default('7d'),
  FRONTEND_URL:            z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
