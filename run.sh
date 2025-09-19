#!/bin/bash

# 🚀 Jellyfin Analytics Dashboard - One Command Deployment
# This script deploys a single container that just works!

echo "🚀 Starting Jellyfin Analytics Dashboard..."
echo "📊 Dashboard will be available at: http://localhost:3000"
echo "⚙️ Configure Jellyfin at: http://localhost:3000/settings"
echo ""

# Create data directory if it doesn't exist
mkdir -p data logs

# Run the container with host networking (eliminates ALL network issues on Linux!)
docker run -d \
  --name jellyfin-analytics \
  --restart unless-stopped \
  --network host \
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
