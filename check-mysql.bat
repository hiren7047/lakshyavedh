@echo off
echo Checking MySQL Service Status...
echo.

echo Checking if MySQL service is running...
sc query mysql >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MySQL service is installed
    sc query mysql | find "RUNNING" >nul
    if %errorlevel% == 0 (
        echo ✅ MySQL service is running
    ) else (
        echo ❌ MySQL service is not running
        echo.
        echo Starting MySQL service...
        net start mysql
        if %errorlevel% == 0 (
            echo ✅ MySQL service started successfully
        ) else (
            echo ❌ Failed to start MySQL service
            echo Please start MySQL manually or install MySQL
        )
    )
) else (
    echo ❌ MySQL service is not installed
    echo.
    echo Please install MySQL or use the JSON fallback storage
)

echo.
echo Checking MySQL connection...
cd server
node -e "
const mysql = require('mysql2/promise');
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'u533366727_lakshyavedh'
};

mysql.createConnection(config)
  .then(conn => {
    console.log('✅ MySQL connection successful');
    conn.end();
  })
  .catch(err => {
    console.log('❌ MySQL connection failed:', err.message);
    console.log('📝 Using JSON fallback storage instead');
  });
"

echo.
pause
