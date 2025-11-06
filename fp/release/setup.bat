@echo off
setlocal enabledelayedexpansion

REM ==========================================
REM TRABAJAPP
REM ==========================================

echo ==========================================
echo    TRABAJAPP
echo ==========================================
echo.

REM ==========================================
REM CONFIGURACION PREDETERMINADA
REM ==========================================
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=trabajapp_db
set PORT=3000
set GOOGLE_MAPS_API_KEY=AIzaSyCiOOPI_cGsEPBcaWFVfdkD2vBriraeDdQ

echo Configuracion:
echo   - Base de datos: %DB_NAME%
echo   - Puerto: %PORT%
echo   - Datos de prueba: SI
echo.

REM ==========================================
REM PASO 1: Validar entorno
REM ==========================================
echo [1/7] Validando entorno...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL no esta instalado
    echo Instala MySQL desde: https://dev.mysql.com/downloads/
    pause
    exit /b 1
)

where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Instalando PM2...
    call npm install -g pm2 >nul 2>nul
)

echo [OK] Entorno validado
echo.

REM ==========================================
REM PASO 2: Instalar dependencias
REM ==========================================
echo [2/7] Instalando dependencias del backend...

cd backend
call npm ci --production --silent
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)
cd ..

echo [OK] Dependencias instaladas
echo.

REM ==========================================
REM PASO 3: Configurar variables de entorno
REM ==========================================
echo [3/7] Configurando variables de entorno...

set jwt_secret=%RANDOM%%RANDOM%%RANDOM%%RANDOM%

(
    echo # Variables de Entorno - Configuracion Automatica
    echo NODE_ENV=production
    echo.
    echo # Base de Datos
    echo DB_HOST=%DB_HOST%
    echo DB_USER=%DB_USER%
    echo DB_PASSWORD=%DB_PASSWORD%
    echo DB_NAME=%DB_NAME%
    echo DB_PORT=3306
    echo.
    echo # JWT
    echo JWT_SECRET=%jwt_secret%
    echo.
    echo # Puerto
    echo PORT=%PORT%
    echo.
    echo # Google Maps
    echo GOOGLE_MAPS_API_KEY=%GOOGLE_MAPS_API_KEY%
) > backend\.env

echo [OK] Variables de entorno configuradas
echo.

REM ==========================================
REM PASO 4: Configurar base de datos
REM ==========================================
echo [4/7] Configurando base de datos...

REM Intentar conexion sin password
mysql -u%DB_USER% -e "SELECT 1" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Conexion a MySQL exitosa
) else (
    REM Intentar con password "root"
    mysql -u%DB_USER% -proot -e "SELECT 1" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set DB_PASSWORD=root
        echo [OK] Conexion a MySQL exitosa ^(password: root^)
    ) else (
        echo [ERROR] No se puede conectar a MySQL
        echo Intenta con: mysql -u root -p
        pause
        exit /b 1
    )
)

echo Creando estructura de base de datos...
if "%DB_PASSWORD%"=="" (
    mysql -u%DB_USER% < release\database-setup.sql
) else (
    mysql -u%DB_USER% -p%DB_PASSWORD% < release\database-setup.sql
)

if %ERRORLEVEL% EQU 0 (
    echo [OK] Base de datos configurada
) else (
    echo [ERROR] Error al configurar base de datos
    pause
    exit /b 1
)

echo Cargando datos de prueba...
if "%DB_PASSWORD%"=="" (
    mysql -u%DB_USER% < release\database-seed.sql
) else (
    mysql -u%DB_USER% -p%DB_PASSWORD% < release\database-seed.sql
)

if %ERRORLEVEL% EQU 0 (
    echo [OK] Datos de prueba cargados
) else (
    echo [AVISO] Datos de prueba no cargados
)
echo.

REM ==========================================
REM PASO 5: Preparar archivos
REM ==========================================
echo [5/7] Preparando archivos para produccion...

if not exist production mkdir production
if not exist production\backend mkdir production\backend
if not exist production\frontend mkdir production\frontend
if not exist production\logs mkdir production\logs

xcopy /E /I /Y /Q backend\src production\backend\src >nul
copy /Y backend\package*.json production\backend\ >nul
copy /Y backend\.env production\backend\ >nul

xcopy /E /I /Y /Q frontend\src production\frontend\ >nul

echo [OK] Archivos preparados
echo.

REM ==========================================
REM PASO 6: Configurar PM2
REM ==========================================
echo [6/7] Configurando PM2...

(
    echo module.exports = {
    echo   apps: [{
    echo     name: 'trabajapp-backend',
    echo     script: './backend/src/index.js',
    echo     instances: 1,
    echo     env: {
    echo       NODE_ENV: 'production'
    echo     },
    echo     error_file: './logs/error.log',
    echo     out_file: './logs/out.log',
    echo     merge_logs: true,
    echo     autorestart: true
    echo   }]
    echo };
) > production\ecosystem.config.js

pm2 delete trabajapp-backend >nul 2>nul

cd production
pm2 start ecosystem.config.js >nul
pm2 save >nul
cd ..

echo [OK] PM2 configurado
echo.

REM ==========================================
REM PASO 7: Crear script de backup
REM ==========================================
echo [7/7] Creando script de backup...

(
    echo @echo off
    echo set BACKUP_DIR=backups
    echo set DATE=%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%%_%%time:~0,2%%%%time:~3,2%%%%time:~6,2%%
    echo if not exist %%BACKUP_DIR%% mkdir %%BACKUP_DIR%%
    echo for /f "tokens=2 delims==" %%%%a in ('findstr "DB_USER=" backend\.env'^) do set DB_USER=%%%%a
    echo for /f "tokens=2 delims==" %%%%a in ('findstr "DB_PASSWORD=" backend\.env'^) do set DB_PASSWORD=%%%%a
    echo for /f "tokens=2 delims==" %%%%a in ('findstr "DB_NAME=" backend\.env'^) do set DB_NAME=%%%%a
    echo if "%%DB_PASSWORD%%"=="" ^(
    echo     mysqldump -u%%DB_USER%% %%DB_NAME%% ^> %%BACKUP_DIR%%\db_%%DATE%%.sql
    echo ^) else ^(
    echo     mysqldump -u%%DB_USER%% -p%%DB_PASSWORD%% %%DB_NAME%% ^> %%BACKUP_DIR%%\db_%%DATE%%.sql
    echo ^)
    echo echo [OK] Backup completado: %%DATE%%
) > production\backup.bat

echo [OK] Script de backup creado
echo.

REM ==========================================
REM Finalizacion
REM ==========================================
echo ==========================================
echo    SETUP COMPLETADO
echo ==========================================
echo.
echo El servidor esta corriendo!
echo.
echo Accesos:
echo   - Backend API: http://localhost:%PORT%/api
echo   - Frontend: Abrir production\frontend\pages\login.html
echo.
echo Credenciales de prueba:
echo   - Admin: admin@trabajapp.com / test123
echo   - Cliente: juan@cliente.com / test123
echo   - Trabajador: roberto@trabajador.com / test123
echo.
echo Guia de pruebas: release\TESTING-GUIDE.md
echo.
echo Comandos utiles:
echo   - Ver logs: pm2 logs trabajapp-backend
echo   - Ver estado: pm2 status
echo   - Detener: pm2 stop trabajapp-backend
echo.
echo Todo listo para evaluar!
echo.
pause