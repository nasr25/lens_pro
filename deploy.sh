#!/bin/bash
# deploy.sh — Lens Pro full deployment on Ubuntu VPS
# Run as root on the server

set -e
REPO="https://github.com/nasr25/lens_pro.git"
BRANCH="claude/photographer-booking-site-ng6cxn"
APP_DIR="/var/www/lens_pro"
DB_NAME="lens_pro"
DB_USER="lens_pro_user"
DB_PASS="LensPro$(openssl rand -hex 8)"
DOMAIN=""   # set to your domain or leave empty for IP access
PORT_BACKEND=3000
PORT_FRONTEND=4000

echo "========================================"
echo "  Lens Pro — VPS Deployment Script"
echo "========================================"

# ─── 1. System packages ───────────────────────────────────────────────────────
echo "[1/8] Installing system packages..."
apt-get update -qq
apt-get install -y curl git mysql-server nginx ufw 2>/dev/null

# Node.js 20 LTS
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node $(node -v) / npm $(npm -v)"

# PM2 for process management
npm install -g pm2 2>/dev/null

# ─── 2. Clone / pull repo ─────────────────────────────────────────────────────
echo "[2/8] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull origin "$BRANCH"
else
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ─── 3. MySQL setup ───────────────────────────────────────────────────────────
echo "[3/8] Setting up MySQL..."
systemctl start mysql 2>/dev/null || true
systemctl enable mysql 2>/dev/null || true

mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "Running schema migrations..."
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/schema.sql
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/seed.sql
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/migrations/002_gallery_packages.sql 2>/dev/null || true
echo "DB ready: $DB_NAME"

# ─── 4. Backend setup ─────────────────────────────────────────────────────────
echo "[4/8] Setting up backend..."
cd "$APP_DIR/backend"
npm install --omit=dev

# Generate .env if missing
if [ ! -f .env ]; then
  JWT_SECRET=$(openssl rand -base64 48)
  REFRESH_SECRET=$(openssl rand -base64 48)
  cat > .env <<ENV
NODE_ENV=production
PORT=$PORT_BACKEND
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
REFRESH_SECRET=$REFRESH_SECRET
REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:$PORT_FRONTEND
ENV
  echo "Generated backend/.env"
fi
npm run build

# ─── 5. Create admin user ─────────────────────────────────────────────────────
echo "[5/8] Creating admin user (if not exists)..."
ADMIN_USER="admin"
ADMIN_PASS="Admin@LensPro2024"
node -e "
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST, port: +process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const hash = await bcrypt.hash('$ADMIN_PASS', 12);
  await pool.execute(
    'INSERT IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)',
    ['$ADMIN_USER', hash]
  );
  await pool.end();
  console.log('Admin ready: $ADMIN_USER / $ADMIN_PASS');
})().catch(e => console.error(e));
" 2>/dev/null || echo "  (bcrypt not available, run scripts/create-admin.js manually)"

# ─── 6. Frontend build ────────────────────────────────────────────────────────
echo "[6/8] Building frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# ─── 7. PM2 process manager ───────────────────────────────────────────────────
echo "[7/8] Starting services with PM2..."
cd "$APP_DIR"

pm2 delete lens-pro-backend 2>/dev/null || true
pm2 start "$APP_DIR/backend/dist/server.js" \
  --name lens-pro-backend \
  --cwd "$APP_DIR/backend" \
  --env production \
  --max-memory-restart 300M

npm install -g serve 2>/dev/null
pm2 delete lens-pro-frontend 2>/dev/null || true
pm2 start "serve $APP_DIR/frontend/dist -p $PORT_FRONTEND -s" \
  --name lens-pro-frontend

pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true

# ─── 8. Nginx reverse proxy ───────────────────────────────────────────────────
echo "[8/8] Configuring Nginx..."
npm install -g serve 2>/dev/null

cat > /etc/nginx/sites-available/lens_pro <<NGINX
server {
    listen 80;
    server_name ${DOMAIN:-_};

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:$PORT_FRONTEND;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$PORT_BACKEND;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/lens_pro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

# Firewall
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true

# ─── Done ─────────────────────────────────────────────────────────────────────
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo "========================================"
echo "  ✅  Lens Pro is LIVE!"
echo "========================================"
echo "  URL:      http://$SERVER_IP"
echo "  Admin:    http://$SERVER_IP/admin/login"
echo "  Username: $ADMIN_USER"
echo "  Password: $ADMIN_PASS"
echo ""
echo "  DB name:  $DB_NAME"
echo "  DB user:  $DB_USER"
echo "  DB pass:  $DB_PASS"
echo ""
echo "  PM2 status:  pm2 status"
echo "  Backend log: pm2 logs lens-pro-backend"
echo "========================================"
