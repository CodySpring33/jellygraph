# 🚀 Super Simple Deployment - One Command!

## 📦 The Simplest Way (Copy & Paste)

### 🪟 Windows:

```powershell
# Build and run in one command - WORKS ON WINDOWS!
docker compose up -d

# That's it! Open http://localhost:3000
```

### 🐧 Linux (Recommended for Linux servers):

```bash
# Build the image first
docker build -t jellyfin-analytics .

# Use our optimized Linux script (host networking = no network issues!)
chmod +x run.sh
./run.sh
```

### 🍎 Mac:

```bash
# Build and run in one command
docker compose up -d

# That's it! Open http://localhost:3000
```

## ✅ What This Does:

1. **Uses host networking** - No network configuration needed!
2. **Accesses Jellyfin directly** - No container-to-container networking
3. **Auto-creates data folders** - Persistent storage just works
4. **Runs as user 1000:1000** - Compatible with most Linux systems
5. **Zero configuration** - Just build and run

## 🎯 After Deployment:

1. Open: **http://localhost:3000**
2. Click **Settings**
3. Enter Jellyfin URL: **http://localhost:8096** (or your Jellyfin URL)
4. Add your Jellyfin API key
5. Done!

## 🛠 Management:

```bash
# View logs
docker logs -f jellyfin-analytics

# Stop
docker compose down
# or: docker stop jellyfin-analytics

# Update (if you make changes)
docker compose down
docker compose build
docker compose up -d
```

## 🔧 Troubleshooting:

**Can't connect to Jellyfin?**

- Make sure Jellyfin is running: `docker ps | grep jellyfin`
- Try these URLs in settings:
  - `http://localhost:8096`
  - `http://127.0.0.1:8096`
  - `http://YOUR-SERVER-IP:8096`

**Container won't start?**

- Check if port 3000 is free: `netstat -tulpn | grep 3000`
- View container logs: `docker logs jellyfin-analytics`

---

## 🎊 That's It!

No docker-compose.yml editing, no network configuration, no complex setup.

**One command deployment that just works!** 🚀
