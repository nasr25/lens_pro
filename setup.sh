#!/usr/bin/env bash
# =============================================================
# Lens Pro — Setup & Run Script for Ubuntu
# =============================================================
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[✓]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[✗]${RESET}    $*"; exit 1; }
step()    { echo -e "\n${BOLD}══ $* ══${RESET}"; }

# ── Config ────────────────────────────────────────────────────
REPO_URL="https://github.com/nasr25/lens_pro"
BRANCH="claude/photographer-booking-site-ng6cxn"
PROJECT_DIR="$HOME/lens_pro"
NODE_MIN=20
MYSQL_DB="lens_pro"

# =============================================================
# 1. CHECK & INSTALL REQUIREMENTS
# =============================================================
step "فحص المتطلبات"

# ── Git ───────────────────────────────────────────────────────
if ! command -v git &>/dev/null; then
  info "تثبيت git..."
  sudo apt-get update -qq && sudo apt-get install -y git
fi
success "git $(git --version | awk '{print $3}')"

# ── Node.js ───────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  info "تثبيت Node.js $NODE_MIN عبر NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MIN}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

NODE_VER=$(node -e "process.stdout.write(process.versions.node)")
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt "$NODE_MIN" ]; then
  error "Node.js $NODE_VER قديم. المطلوب $NODE_MIN+. ثبّته من https://nodejs.org"
fi
success "Node.js v$NODE_VER"
success "npm v$(npm --version)"

# ── MySQL ─────────────────────────────────────────────────────
if ! command -v mysql &>/dev/null; then
  info "تثبيت MySQL Server..."
  sudo apt-get update -qq && sudo apt-get install -y mysql-server
  sudo systemctl start mysql
  sudo systemctl enable mysql
fi

if ! sudo systemctl is-active --quiet mysql 2>/dev/null; then
  info "تشغيل MySQL..."
  sudo systemctl start mysql
fi
success "MySQL $(mysql --version | awk '{print $3}' | tr -d ',')"

# =============================================================
# 2. CLONE OR UPDATE PROJECT
# =============================================================
step "جلب الكود"

if [ -d "$PROJECT_DIR/.git" ]; then
  info "المشروع موجود — تحديث..."
  git -C "$PROJECT_DIR" fetch origin
  git -C "$PROJECT_DIR" checkout "$BRANCH"
  git -C "$PROJECT_DIR" pull origin "$BRANCH"
  success "تم التحديث"
else
  info "استنساخ المشروع..."
  git clone --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
  success "تم الاستنساخ في $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# =============================================================
# 3. BACKEND — .env
# =============================================================
step "إعداد ملف .env للباكند"

ENV_FILE="$PROJECT_DIR/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  cp "$PROJECT_DIR/backend/.env.example" "$ENV_FILE"
  info "تم إنشاء $ENV_FILE"
fi

# Prompt for MySQL credentials if not already set
CURRENT_DB_PASS=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d= -f2-)

if [ -z "$CURRENT_DB_PASS" ] || [ "$CURRENT_DB_PASS" = "your_mysql_password" ]; then
  echo ""
  echo -e "${YELLOW}──────────────────────────────────────────${RESET}"
  echo -e "${BOLD}إعداد قاعدة البيانات${RESET}"
  echo -e "${YELLOW}──────────────────────────────────────────${RESET}"

  read -rp "  اسم مستخدم MySQL [root]: " DB_USER
  DB_USER="${DB_USER:-root}"

  read -rsp "  كلمة مرور MySQL: " DB_PASS
  echo ""

  # Generate random secrets
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)

  # Write .env
  cat > "$ENV_FILE" <<ENVEOF
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${MYSQL_DB}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=
ENVEOF
  success "تم كتابة $ENV_FILE"
else
  DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d= -f2-)
  DB_PASS=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d= -f2-)
  success ".env موجود — سيُستخدم كما هو"
fi

# =============================================================
# 4. DATABASE SETUP
# =============================================================
step "إعداد قاعدة البيانات"

# Test MySQL connection
if ! mysql -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" &>/dev/null 2>&1; then
  # Try with sudo for root without password (fresh MySQL install)
  if sudo mysql -e "SELECT 1;" &>/dev/null 2>&1; then
    info "تعيين كلمة مرور لـ root في MySQL..."
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}'; FLUSH PRIVILEGES;"
    success "تم تعيين كلمة مرور MySQL"
  else
    error "لا يمكن الاتصال بـ MySQL. تحقق من بيانات الاعتماد في $ENV_FILE"
  fi
fi

# Create database if not exists
mysql -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
  && success "قاعدة البيانات '${MYSQL_DB}' جاهزة"

# Check if tables already exist
TABLE_COUNT=$(mysql -u"$DB_USER" -p"$DB_PASS" "$MYSQL_DB" -sNe "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${MYSQL_DB}';" 2>/dev/null || echo 0)

if [ "$TABLE_COUNT" -lt "4" ]; then
  info "إنشاء الجداول..."
  # Remove the CREATE DATABASE line since DB already exists
  grep -v "^CREATE DATABASE\|^USE " "$PROJECT_DIR/database/schema.sql" \
    | mysql -u"$DB_USER" -p"$DB_PASS" "$MYSQL_DB"
  mysql -u"$DB_USER" -p"$DB_PASS" "$MYSQL_DB" < "$PROJECT_DIR/database/seed.sql" 2>/dev/null || true
  success "تم إنشاء الجداول وإدخال البيانات الأولية"
else
  success "الجداول موجودة مسبقاً ($TABLE_COUNT جدول)"
fi

# =============================================================
# 5. CREATE ADMIN USER
# =============================================================
ADMIN_EXISTS=$(mysql -u"$DB_USER" -p"$DB_PASS" "$MYSQL_DB" -sNe "SELECT COUNT(*) FROM admin_users;" 2>/dev/null || echo 0)

if [ "$ADMIN_EXISTS" -eq "0" ]; then
  step "إنشاء حساب المشرف"
  echo ""
  read -rsp "  أدخل كلمة مرور المشرف (admin): " ADMIN_PASS
  echo ""

  if [ -z "$ADMIN_PASS" ]; then
    error "كلمة المرور لا يمكن أن تكون فارغة"
  fi

  # Update .env with admin password temporarily for the script
  sed -i "s/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=${ADMIN_PASS}/" "$ENV_FILE"

  cd "$PROJECT_DIR/backend"
  npm install --silent
  ADMIN_PASSWORD="$ADMIN_PASS" node "$PROJECT_DIR/scripts/create-admin.js"
  # Clear password from .env after use
  sed -i "s/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=/" "$ENV_FILE"
  cd "$PROJECT_DIR"
  success "تم إنشاء حساب المشرف"
else
  success "حساب المشرف موجود مسبقاً"
fi

# =============================================================
# 6. INSTALL NPM DEPENDENCIES
# =============================================================
step "تثبيت المكتبات"

info "Backend..."
cd "$PROJECT_DIR/backend" && npm install --silent
success "مكتبات الباكند"

info "Frontend..."
cd "$PROJECT_DIR/frontend" && npm install --silent
success "مكتبات الفرونتند"

cd "$PROJECT_DIR"

# =============================================================
# 7. LAUNCH
# =============================================================
step "تشغيل المشروع"

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║       Lens Pro جاهز للتشغيل!            ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}الموقع العام:${RESET}    http://localhost:5173"
echo -e "  ${BOLD}لوحة الإدارة:${RESET}   http://localhost:5173/admin"
echo -e "  ${BOLD}API Backend:${RESET}     http://localhost:3000/api"
echo ""
echo -e "  ${YELLOW}للإيقاف: اضغط Ctrl+C${RESET}"
echo ""

# Kill any previous instances
pkill -f "ts-node-dev.*server" 2>/dev/null || true
pkill -f "vite"                2>/dev/null || true
sleep 1

# Start backend in background
cd "$PROJECT_DIR/backend"
npm run dev > "$PROJECT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
info "Backend PID: $BACKEND_PID (السجل: $PROJECT_DIR/backend.log)"

# Wait for backend to be ready
info "انتظار الباكند..."
for i in $(seq 1 15); do
  if curl -sf http://localhost:3000/api/settings/terms &>/dev/null; then
    success "الباكند يعمل على :3000"
    break
  fi
  sleep 1
  if [ "$i" -eq 15 ]; then
    warn "الباكند لم يستجب. تحقق من: tail -f $PROJECT_DIR/backend.log"
  fi
done

# Start frontend (foreground so Ctrl+C stops both)
cd "$PROJECT_DIR/frontend"
trap "kill $BACKEND_PID 2>/dev/null; echo ''; info 'تم إيقاف المشروع.'" EXIT INT TERM
npm run dev
