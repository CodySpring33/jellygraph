# 🚀 Quick Start: One-Command Deployment

Deploy Jellyfin Analytics Dashboard with just one command!

## ⚡ Instant Setup

```bash
docker compose up
```

That's it! 🎉

## 🎯 What Happens Automatically

When you run `docker compose up`, the container will:

1. ✅ **Build the application** from source
2. ✅ **Create data directories** (`./data` and `./logs`)
3. ✅ **Initialize the database** automatically
4. ✅ **Start the web server** on port 3000
5. ✅ **Set up default configuration** with secure defaults

## 📊 Access Your Dashboard

1. **Open your browser**: `http://localhost:3000`
2. **Configure Jellyfin**: Click "Settings" and enter:
   - **Server URL**: Your Jellyfin server URL (e.g., `http://jellyfin:8096`)
   - **API Key**: Generate from Jellyfin Dashboard → Advanced → API Keys
3. **Test Connection**: Click "Test" to verify connectivity
4. **Save Settings**: Your configuration is encrypted and stored securely

## 🔧 Optional Customization

### Change Port

Edit `docker-compose.yml`:

```yaml
ports:
  - '8080:3000' # Use port 8080 instead
```

### Custom Data Location

Edit `docker-compose.yml`:

```yaml
volumes:
  - '/your/custom/path:/app/data'
  - './logs:/app/logs'
```

### Environment Variables

Create a `.env` file (optional):

```env
# Custom encryption key for production
ENCRYPTION_KEY=your-super-secure-key-here

# Database location (if using custom path)
DATABASE_URL="file:/app/data/analytics.db"
```

## 🌐 Network Setup for Existing Jellyfin

### Same Docker Network

If Jellyfin is already running in Docker, use the container name:

- **Jellyfin URL**: `http://jellyfin:8096`

### Host Network Access

To access Jellyfin on the host system:

- **Jellyfin URL**: `http://host.docker.internal:8096`

### Different Server

To access Jellyfin on another server:

- **Jellyfin URL**: `http://192.168.1.100:8096`

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs -f

# Restart if needed
docker compose restart
```

### Can't Connect to Jellyfin

```bash
# Test network connectivity
docker compose exec jellyfin-analytics ping your-jellyfin-host

# Check Jellyfin API key in Jellyfin admin panel
```

### Permission Issues

```bash
# Fix permissions (Linux/Mac)
sudo chown -R $USER:$USER ./data ./logs

# Windows: Run Docker as administrator
```

### Reset Everything

```bash
# Stop and remove containers
docker compose down

# Remove data (CAUTION: This deletes your analytics data!)
rm -rf ./data

# Start fresh
docker compose up
```

## 🎯 Success Indicators

Your deployment is working when:

- ✅ `http://localhost:3000` loads the dashboard
- ✅ Settings page allows Jellyfin configuration
- ✅ Connection test shows "Successfully connected to Jellyfin"
- ✅ Dashboard displays real data from your Jellyfin server

## 🚀 Next Steps

1. **Configure Settings**: Set up your Jellyfin connection
2. **Trigger Sync**: Click "Sync" to populate initial data
3. **Explore Analytics**: View your media consumption insights
4. **Set Up Automation**: Data syncs automatically every 5 minutes

---

**Need Help?** Check the full `DEPLOYMENT.md` for advanced configurations and troubleshooting.
