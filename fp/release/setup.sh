#!/bin/bash

# ==========================================
# TRABAJAPP - Script de Puesta en Producción
# ==========================================

set -e  # Detener si hay errores

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "   TRABAJAPP - Setup Automático"
echo "==========================================${NC}"
echo ""

# ==========================================
# CONFIGURACIÓN PREDETERMINADA
# ==========================================
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""  # Vacío por defecto (común en instalaciones locales)
DB_NAME="trabajapp_db"
PORT="3000"
GOOGLE_MAPS_API_KEY="AIzaSyCiOOPI_cGsEPBcaWFVfdkD2vBriraeDdQ"  # TU API KEY

echo -e "${BLUE}📋 Configuración:${NC}"
echo -e "  • Base de datos: ${DB_NAME}"
echo -e "  • Puerto: ${PORT}"
echo -e "  • Datos de prueba: SÍ"
echo ""

# ==========================================
# PASO 1: Validar entorno
# ==========================================
echo -e "${YELLOW}[1/7] Validando entorno...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Instalá Node.js desde: https://nodejs.org/"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL no está instalado${NC}"
    echo "Instalá MySQL desde: https://dev.mysql.com/downloads/"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Instalando PM2...${NC}"
    npm install -g pm2 2>/dev/null || sudo npm install -g pm2
fi

echo -e "${GREEN}✅ Entorno validado${NC}"
echo ""

# ==========================================
# PASO 2: Instalar dependencias
# ==========================================
echo -e "${YELLOW}[2/7] Instalando dependencias del backend...${NC}"

cd backend
npm ci --production --silent
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi
cd ..
echo ""

# ==========================================
# PASO 3: Configurar variables de entorno
# ==========================================
echo -e "${YELLOW}[3/7] Configurando variables de entorno...${NC}"

# Generar JWT secret seguro
jwt_secret=$(openssl rand -base64 32)

# Crear archivo .env automáticamente
cat > backend/.env << EOF
# Variables de Entorno - Configuración Automática
NODE_ENV=production

# Base de Datos
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=3306

# JWT
JWT_SECRET=${jwt_secret}

# Puerto
PORT=${PORT}

# Google Maps
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

# CORS
FRONTEND_URL=http://localhost:${PORT}
EOF

echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"
echo ""

# ==========================================
# PASO 4: Configurar base de datos
# ==========================================
echo -e "${YELLOW}[4/7] Configurando base de datos...${NC}"

# Intentar conexión a MySQL (sin contraseña primero, común en desarrollo)
if mysql -h${DB_HOST} -u${DB_USER} -e "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✅ Conexión a MySQL exitosa${NC}"
elif mysql -h${DB_HOST} -u${DB_USER} -proot -e "SELECT 1" &> /dev/null; then
    # Si falla, probar con password "root"
    DB_PASSWORD="root"
    sed -i "s/DB_PASSWORD=/DB_PASSWORD=root/" backend/.env 2>/dev/null || sed -i '' "s/DB_PASSWORD=/DB_PASSWORD=root/" backend/.env
    echo -e "${GREEN}✅ Conexión a MySQL exitosa (password: root)${NC}"
else
    echo -e "${RED}❌ No se puede conectar a MySQL${NC}"
    echo -e "${YELLOW}Intentá con: mysql -u root -p${NC}"
    exit 1
fi

# Crear estructura de BD
echo -e "${YELLOW}📊 Creando estructura...${NC}"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h${DB_HOST} -u${DB_USER} < release/database-setup.sql
else
    mysql -h${DB_HOST} -u${DB_USER} -p${DB_PASSWORD} < release/database-setup.sql
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos configurada${NC}"
else
    echo -e "${RED}❌ Error al configurar base de datos${NC}"
    exit 1
fi

# Cargar datos de prueba AUTOMÁTICAMENTE
echo -e "${YELLOW}📊 Cargando datos de prueba...${NC}"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h${DB_HOST} -u${DB_USER} < release/database-seed.sql
else
    mysql -h${DB_HOST} -u${DB_USER} -p${DB_PASSWORD} < release/database-seed.sql
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Datos de prueba cargados${NC}"
else
    echo -e "${YELLOW}⚠️  Datos de prueba no cargados${NC}"
fi
echo ""

# ==========================================
# PASO 5: Preparar archivos
# ==========================================
echo -e "${YELLOW}[5/7] Preparando archivos para producción...${NC}"

mkdir -p production/backend production/frontend production/logs

cp -r backend/src production/backend/
cp backend/package*.json production/backend/
cp backend/.env production/backend/

cp -r frontend/src production/frontend/

echo -e "${GREEN}✅ Archivos preparados${NC}"
echo ""

# ==========================================
# PASO 6: Configurar PM2
# ==========================================
echo -e "${YELLOW}[6/7] Configurando PM2...${NC}"

cat > production/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'trabajapp-backend',
    script: './backend/src/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    autorestart: true
  }]
};
EOF

pm2 delete trabajapp-backend 2>/dev/null || true

cd production
pm2 start ecosystem.config.js
pm2 save
cd ..

echo -e "${GREEN}✅ PM2 configurado${NC}"
echo ""

# ==========================================
# PASO 7: Crear script de backup
# ==========================================
echo -e "${YELLOW}[7/7] Creando script de backup...${NC}"

cat > production/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p ${BACKUP_DIR}
source backend/.env
if [ -z "$DB_PASSWORD" ]; then
    mysqldump -h${DB_HOST} -u${DB_USER} ${DB_NAME} > ${BACKUP_DIR}/db_${DATE}.sql
else
    mysqldump -h${DB_HOST} -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > ${BACKUP_DIR}/db_${DATE}.sql
fi
tar -czf ${BACKUP_DIR}/files_${DATE}.tar.gz backend/src production/frontend
ls -t ${BACKUP_DIR}/db_*.sql | tail -n +8 | xargs -r rm
ls -t ${BACKUP_DIR}/files_*.tar.gz | tail -n +8 | xargs -r rm
echo "✅ Backup completado: ${DATE}"
EOF

chmod +x production/backup.sh

echo -e "${GREEN}✅ Script de backup creado${NC}"
echo ""

# ==========================================
# Finalización
# ==========================================
echo -e "${GREEN}=========================================="
echo "   ✅ SETUP COMPLETADO"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}🚀 El servidor está corriendo!${NC}"
echo ""
echo -e "${BLUE}📍 Accesos:${NC}"
echo -e "  • Backend API: ${YELLOW}http://localhost:${PORT}/api${NC}"
echo -e "  • Frontend: ${YELLOW}Abrir: production/frontend/pages/login.html${NC}"
echo ""
echo -e "${BLUE}🧪 Credenciales de prueba:${NC}"
echo -e "  • Admin: ${YELLOW}admin@trabajapp.com${NC} / ${YELLOW}test123${NC}"
echo -e "  • Cliente: ${YELLOW}juan@cliente.com${NC} / ${YELLOW}test123${NC}"
echo -e "  • Trabajador: ${YELLOW}roberto@trabajador.com${NC} / ${YELLOW}test123${NC}"
echo ""
echo -e "${BLUE}📖 Guía de pruebas:${NC}"
echo -e "  Ver archivo: ${YELLOW}release/TESTING-GUIDE.md${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo -e "  • Ver logs: ${YELLOW}pm2 logs trabajapp-backend${NC}"
echo -e "  • Ver estado: ${YELLOW}pm2 status${NC}"
echo -e "  • Detener: ${YELLOW}pm2 stop trabajapp-backend${NC}"
echo ""
echo -e "${GREEN}✅ ¡Todo listo para evaluar!${NC}"