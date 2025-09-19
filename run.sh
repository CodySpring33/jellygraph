#!/bin/bash

# 🚀 Jellyfin Analytics Dashboard - One Command Deployment
# This script deploys a single container that just works!

echo "🚀 Starting Jellyfin Analytics Dashboard..."
echo "📊 Dashboard will be available at: http://localhost:3000"
echo "⚙️ Configure Jellyfin at: http://localhost:3000/settings"
echo ""

# Create data directory if it doesn't exist with proper permissions
mkdir -p data logs
# Ensure directories are owned by user 1000:1000 (matches container user)
sudo chown -R 1000:1000 data logs 2>/dev/null || chown -R 1000:1000 data logs 2>/dev/null || true

# Run the container with host networking and as user 1000:1000
docker run -d \
  --name jellyfin-analytics \
  --restart unless-stopped \
  --network host \
  --user 1000:1000 \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/logs:/app/logs" \
  -e NODE_ENV=production \
  -e DATABASE_URL="file:/app/data/analytics.db" \
  -e ENCRYPTION_KEY="${ENCRYPTION_KEY:-JellyfinAnalytics2024SecureDefaultKey!ChangeInProduction}" \
  jellyfin-analytics

echo "✅ Container started successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Open: http://localhost:3000"
echo "2. Go to Settings tab"
echo "3. Enter your Jellyfin URL (usually http://localhost:8096)"
echo "4. Add your Jellyfin API key"
echo "5. Start monitoring!"
echo ""
echo "📱 Management commands:"
echo "  View logs: docker logs -f jellyfin-analytics"
echo "  Stop:      docker stop jellyfin-analytics"
echo "  Remove:    docker rm jellyfin-analytics"
