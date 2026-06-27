import './config/env'; // validate env vars first
import { testConnection } from './config/database';
import { env } from './config/env';
import app from './app';

const PORT = parseInt(env.PORT);

async function start(): Promise<void> {
  try {
    await testConnection();
    console.log(JSON.stringify({ level: 'info', message: 'Database connected', timestamp: new Date().toISOString() }));
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', message: 'Database connection failed', error: String(err), timestamp: new Date().toISOString() }));
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(JSON.stringify({ level: 'info', message: `Server running on port ${PORT}`, env: env.NODE_ENV, timestamp: new Date().toISOString() }));
  });
}

start();
