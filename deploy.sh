#!/bin/bash

# 🚀 Quick Vercel Deployment Script
# This script helps you deploy the Student-Teacher Booking System to Vercel

echo "🚀 Student-Teacher Booking System - Vercel Deployment"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    
    if [ $? -eq 0 ]; then
        echo "✅ Vercel CLI installed successfully!"
    else
        echo "❌ Failed to install Vercel CLI. Please install manually:"
        echo "   npm install -g vercel"
        exit 1
    fi
fi

echo "🔐 Logging into Vercel..."
vercel login

echo "🔍 Checking project structure..."
if [ ! -f "index.html" ]; then
    echo "❌ index.html not found! Make sure you're in the project directory."
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found! Configuration file missing."
    exit 1
fi

echo "✅ Project structure looks good!"

echo "🚀 Starting deployment..."
echo "📝 This will deploy to a preview URL first."
echo "   Use 'vercel --prod' later for production deployment."

vercel

echo ""
echo "🎉 Deployment initiated!"
echo "📱 Your app will be available at the URL shown above."
echo ""
echo "🔄 To deploy to production later, run:"
echo "   vercel --prod"
echo ""
echo "📊 To check deployment status:"
echo "   vercel ls"
echo ""
echo "✅ Happy coding! 🎯"
