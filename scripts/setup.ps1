# Jellyfin Analytics Dashboard Setup Script for Windows

Write-Host "🚀 Setting up Jellyfin Analytics Dashboard..." -ForegroundColor Green

# Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Blue
if (!(Test-Path "data")) { New-Item -ItemType Directory -Name "data" }
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Name "logs" }

# Copy environment template
Write-Host "🔧 Setting up environment configuration..." -ForegroundColor Blue
if (!(Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your Jellyfin server details" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Cyan
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Blue
npm install

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Blue
Set-Location client
npm install
Set-Location ..

# Generate Prisma client
Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

# Push database schema
Write-Host "🗄️  Setting up database..." -ForegroundColor Blue
npx prisma db push

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your Jellyfin server URL and API key"
Write-Host "2. Run 'npm run dev' to start in development mode"
Write-Host "3. Or run 'docker-compose up --build' to start with Docker"
Write-Host ""
Write-Host "Dashboard will be available at: http://localhost:3000" -ForegroundColor Yellow
