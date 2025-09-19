#!/usr/bin/env node

/**
 * Jellyfin Analytics Dashboard - Auto Setup Script
 * This script handles initial setup and database initialization
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 Jellyfin Analytics Dashboard - Starting Setup...');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('📁 Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('📁 Creating logs directory...');
  fs.mkdirSync(logsDir, { recursive: true });
}

// Check if .env exists, if not copy from .env.example
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('⚙️ Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
}

// Initialize database if needed
const { execSync } = require('child_process');

try {
  console.log('🗄️ Initializing database...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Database initialized successfully!');
} catch (error) {
  console.log('ℹ️ Database already initialized or migration not needed');
}

console.log('✅ Setup completed successfully!');
console.log('🎯 Starting Jellyfin Analytics Dashboard...');
console.log('');
console.log('📊 Once started, configure your Jellyfin server at:');
console.log('   http://localhost:3000/settings');
console.log('');
