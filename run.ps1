# 🚀 Jellyfin Analytics Dashboard - One Command Deployment (Windows)
# This script deploys a single container that just works!

Write-Host "🚀 Starting Jellyfin Analytics Dashboard..." -ForegroundColor Green
Write-Host "📊 Dashboard will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚙️ Configure Jellyfin at: http://localhost:3000/settings" -ForegroundColor Cyan
Write-Host ""

# Create data directory if it doesn't exist
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }
# Note: Windows Docker Desktop handles permissions automatically

# Get the current directory path for Windows
$currentPath = (Get-Location).Path

# Run the container with host networking (no network issues!)
docker run -d `
  --name jellyfin-analytics `
  --restart unless-stopped `
  --network host `
  -v "${currentPath}/data:/app/data" `
  -v "${currentPath}/logs:/app/logs" `
  -e NODE_ENV=production `
  -e DATABASE_URL="file:/app/data/analytics.db" `
  -e ENCRYPTION_KEY="$($env:ENCRYPTION_KEY ?? 'JellyfinAnalytics2024SecureDefaultKey!ChangeInProduction')" `
  jellyfin-analytics

Write-Host "✅ Container started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open: http://localhost:3000"
Write-Host "2. Go to Settings tab"
Write-Host "3. Enter your Jellyfin URL (usually http://localhost:8096)"
Write-Host "4. Add your Jellyfin API key"
Write-Host "5. Start monitoring!"
Write-Host ""
Write-Host "📱 Management commands:" -ForegroundColor Yellow
Write-Host "  View logs: docker logs -f jellyfin-analytics"
Write-Host "  Stop:      docker stop jellyfin-analytics"
Write-Host "  Remove:    docker rm jellyfin-analytics"
