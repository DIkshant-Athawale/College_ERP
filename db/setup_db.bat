@echo off
title College ERP - Database Setup
echo ============================================
echo    College ERP Database Setup
echo ============================================
echo.

:: Set the directory to where this batch file is located
cd /d "%~dp0"

echo [INFO] Current directory: %cd%
echo [INFO] Looking for db.sql file...
echo.

:: Check if db.sql exists
if not exist "db.sql" (
    echo [ERROR] db.sql not found in %cd%
    echo Please make sure db.sql is in the same folder as this batch file.
    pause
    exit /b 1
)

echo [OK] db.sql found!
echo.

:: Prompt for MySQL credentials
set /p MYSQL_USER=Enter MySQL username (default: root): 
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo [INFO] Step 1: Creating database 'clg_db' if it does not exist...
echo.

:: Create the database if it doesn't exist
mysql -u %MYSQL_USER% -p -e "CREATE DATABASE IF NOT EXISTS clg_db;"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to create database. Please check:
    echo   - MySQL is installed and running
    echo   - Username and password are correct
    echo   - MySQL bin directory is in your system PATH
    pause
    exit /b 1
)

echo.
echo [OK] Database 'clg_db' is ready!
echo.
echo [INFO] Step 2: Importing db.sql into clg_db...
echo.

:: Import the SQL file into the database
mysql -u %MYSQL_USER% -p clg_db < db.sql

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to import db.sql. Please check the error above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    Database setup completed successfully!
echo ============================================
echo.
echo Database 'clg_db' has been created and populated with data from db.sql
echo.
pause
