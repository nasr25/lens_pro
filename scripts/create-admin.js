#!/usr/bin/env node
/**
 * One-time script to create the admin user.
 * Usage: node scripts/create-admin.js
 *
 * Set environment variables before running:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *   ADMIN_USERNAME, ADMIN_PASSWORD
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('Error: ADMIN_PASSWORD environment variable is required.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lens_pro',
  });

  await conn.execute(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
    [username, hash, hash]
  );

  console.log(`Admin user "${username}" created/updated successfully.`);
  await conn.end();
}

main().catch(err => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
