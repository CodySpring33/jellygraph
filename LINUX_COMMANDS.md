# 🐧 Linux Deployment Commands - Quick Reference

## 🎯 **Main Commands:**

### **Fresh Install (Deletes existing data)**
```bash
chmod +x run-all
./run-all
```
*Does everything: cleanup, build, deploy with all fixes*

### **Quick Install (Keeps existing data)**
```bash
docker build -t jellyfin-analytics .
chmod +x run.sh
./run.sh
```
*Builds and runs, preserves your analytics data*

### **Quick Restart (Fastest)**
```bash
chmod +x run-quick
./run-quick
```
*Just restarts the container, keeps everything*

---

## 🎯 **What `./run-all` Does:**

1. ✅ **Stops** any existing containers
2. ✅ **Removes** old Docker images 
3. ✅ **Deletes** old data and logs (fresh start)
4. ✅ **Creates** data directories with correct permissions (1000:1000)
5. ✅ **Builds** fresh Docker image with all fixes
6. ✅ **Deploys** with host networking and user 1000:1000
7. ✅ **Tests** that everything works
8. ✅ **Shows** you what to do next

## 🎯 **After Running:**

1. **Open:** http://localhost:3000 or http://YOUR-SERVER-IP:3000
2. **Go to:** Settings tab  
3. **Enter:** 
   - Jellyfin URL: `http://localhost:8096`
   - API Key: (from Jellyfin Admin Panel)
4. **Test** connection and start monitoring!

## 🛠️ **Management:**

```bash
# View logs
docker logs -f jellyfin-analytics

# Stop container
docker stop jellyfin-analytics

# Check status
docker ps | grep jellyfin-analytics

# Fresh install again
./run-all
```

## 🐛 **Troubleshooting:**

- **500 errors?** → `docker logs jellyfin-analytics`
- **Port 3000 busy?** → Stop other services on port 3000
- **Permission errors?** → Make sure you ran `./run-all` (handles all permissions)
- **Can't connect to Jellyfin?** → Try `http://127.0.0.1:8096` or your server IP

---

**🎊 That's it! One command deployment that just works!**
