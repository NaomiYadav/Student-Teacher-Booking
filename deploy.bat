@echo off
REM 🚀 Quick Vercel Deployment Script for Windows
REM This script helps you deploy the Student-Teacher Booking System to Vercel

echo 🚀 Student-Teacher Booking System - Vercel Deployment
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo 📦 Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found!

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found!
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
    
    if %errorlevel% equ 0 (
        echo ✅ Vercel CLI installed successfully!
    ) else (
        echo ❌ Failed to install Vercel CLI. Please install manually:
        echo    npm install -g vercel
        pause
        exit /b 1
    )
)

echo 🔐 Logging into Vercel...
vercel login

echo 🔍 Checking project structure...
if not exist "index.html" (
    echo ❌ index.html not found! Make sure you're in the project directory.
    pause
    exit /b 1
)

if not exist "vercel.json" (
    echo ❌ vercel.json not found! Configuration file missing.
    pause
    exit /b 1
)

echo ✅ Project structure looks good!

echo 🚀 Starting deployment...
echo 📝 This will deploy to a preview URL first.
echo    Use 'vercel --prod' later for production deployment.

vercel

echo.
echo 🎉 Deployment initiated!
echo 📱 Your app will be available at the URL shown above.
echo.
echo 🔄 To deploy to production later, run:
echo    vercel --prod
echo.
echo 📊 To check deployment status:
echo    vercel ls
echo.
echo ✅ Happy coding! 🎯
pause
