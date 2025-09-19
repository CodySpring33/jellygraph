# 🚀 Deployment Guide: Jellyfin Analytics Dashboard

This guide walks you through deploying the Jellyfin Analytics Dashboard on a server that's already running Jellyfin in a Docker container.

## 📋 Prerequisites

- **Server running Jellyfin**: Your server should already have Jellyfin running in Docker
- **Docker & Docker Compose**: Installed on your server
- **Network Access**: Port 3000 available for the analytics dashboard
- **Jellyfin Admin Access**: You'll need admin credentials to generate an API key

## 🔍 Pre-Deployment Setup

### 1. Check Your Jellyfin Setup

First, verify your existing Jellyfin container is running:

```bash
# Check running containers
docker ps | grep jellyfin

# Note the container name and network
docker inspect <jellyfin-container-name> | grep NetworkMode
```

### 2. Get Jellyfin Connection Details

You'll need:

- **Jellyfin URL**: Usually `http://localhost:8096` or your server's IP
- **API Key**: Generate this from Jellyfin's admin panel

#### Generate Jellyfin API Key:

1. Open your Jellyfin web interface
2. Go to **Dashboard** → **Advanced** → **API Keys**
3. Click **"+ New API Key"**
4. Enter name: `"Analytics Dashboard"`
5. **Copy the generated API key** (you'll need this later)

## 🛠️ Deployment Options

### Option 1: Standalone Deployment (Recommended)

Deploy the analytics dashboard as a separate service alongside your existing Jellyfin container.

#### Step 1: Download the Project

```bash
# Clone the repository
git clone <repository-url>
cd jellyfin-analytics

# Or download and extract the project files
wget <archive-url>
unzip jellyfin-analytics.zip
cd jellyfin-analytics
```

#### Step 2: Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit environment file (optional - most config is done via UI)
nano .env
```

**Basic `.env` configuration:**

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="file:/app/data/analytics.db"

# Security (generate a secure key for production)
ENCRYPTION_KEY=your-super-secure-encryption-key-here-change-this
```

#### Step 3: Create Data Directories

```bash
# Create persistent data directories
mkdir -p ./data ./logs

# Set proper permissions
chmod 755 ./data ./logs
```

#### Step 4: Deploy with Docker Compose

```bash
# Build and start the container
docker-compose up -d --build

# Check if it's running
docker-compose ps
docker-compose logs -f
```

#### Step 5: Configure via Web Interface

1. **Access the dashboard**: Open `http://your-server-ip:3000`
2. **Go to Settings**: Click the "Settings" tab in the navigation
3. **Configure Jellyfin**:
   - **Server URL**: `http://your-jellyfin-container-ip:8096` or `http://host.docker.internal:8096`
   - **API Key**: Paste the API key you generated earlier
4. **Test Connection**: Click the "Test" button to verify connectivity
5. **Save Settings**: Click "Save" to store your configuration

### Option 2: Integrated Docker Network Deployment

Deploy the analytics dashboard on the same Docker network as your Jellyfin container for better integration.

#### Step 1: Identify Jellyfin Network

```bash
# Find your Jellyfin container's network
docker inspect <jellyfin-container-name> | grep NetworkMode

# Or check all networks
docker network ls
```

#### Step 2: Modify Docker Compose

Create a custom `docker-compose.yml` or modify the existing one:

```yaml
version: '3.8'

services:
  jellyfin-analytics:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jellyfin-analytics
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:/app/data/analytics.db
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-secure-key-change-in-production}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    networks:
      - jellyfin-network # Use your Jellyfin's network name
    depends_on:
      - jellyfin # Optional: if deploying together

volumes:
  jellyfin_analytics_data:
    driver: local

networks:
  jellyfin-network:
    external: true # Use existing network
```

#### Step 3: Deploy

```bash
# Deploy on the same network
docker-compose up -d --build

# Configure via web interface using container name
# Jellyfin URL: http://jellyfin:8096 (use container name)
```

## 🔧 Advanced Configuration

### Reverse Proxy Setup (Nginx)

If you want to access the dashboard via a subdomain:

```nginx
# /etc/nginx/sites-available/jellyfin-analytics
server {
    listen 80;
    server_name analytics.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/jellyfin-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL/HTTPS Setup

For production deployments, enable HTTPS:

```bash
# Using Certbot for Let's Encrypt
sudo certbot --nginx -d analytics.yourdomain.com
```

### Firewall Configuration

```bash
# Allow port 3000 (if not using reverse proxy)
sudo ufw allow 3000/tcp

# Or allow Nginx Full (if using reverse proxy)
sudo ufw allow 'Nginx Full'
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Can't Connect to Jellyfin

**Problem**: Dashboard shows "Connected" but displays mock data

**Solutions**:

```bash
# Check if containers can communicate
docker exec jellyfin-analytics ping jellyfin-container-name

# Verify Jellyfin URL in settings:
# - Use container name if on same network: http://jellyfin:8096
# - Use host.docker.internal if on different networks: http://host.docker.internal:8096
# - Use server IP if needed: http://192.168.1.100:8096
```

#### 2. Permission Denied on Data Directory

```bash
# Fix data directory permissions
sudo chown -R $USER:$USER ./data ./logs
chmod 755 ./data ./logs
```

#### 3. Port Already in Use

```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use different external port
```

#### 4. Database Migration Issues

```bash
# Reset database if needed
docker-compose down
sudo rm -rf ./data/analytics.db
docker-compose up -d

# Check logs
docker-compose logs -f jellyfin-analytics
```

### Health Checks

```bash
# Check if the application is responding
curl http://localhost:3000/health

# Check container status
docker-compose ps
docker-compose logs jellyfin-analytics

# Monitor resource usage
docker stats jellyfin-analytics
```

## 📊 Post-Deployment Configuration

### 1. Initial Setup

1. **Access Dashboard**: `http://your-server:3000`
2. **Configure Jellyfin Settings**:
   - Server URL
   - API Key
   - Sync Interval (default: 5 minutes)
3. **Test Connection**: Verify the dashboard can connect to Jellyfin
4. **Trigger Initial Sync**: Use the "Sync" button to populate initial data

### 2. Optimize Performance

```bash
# Monitor container performance
docker stats jellyfin-analytics

# Adjust resource limits in docker-compose.yml if needed
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

### 3. Set Up Monitoring

```bash
# Set up log rotation
sudo logrotate -d /etc/logrotate.d/docker

# Monitor disk usage
df -h ./data
```

## 🛡️ Security Considerations

### 1. API Key Security

- Store API keys securely
- Regenerate keys periodically
- Use environment variables for sensitive data

### 2. Network Security

```bash
# Restrict access to analytics port
sudo ufw allow from 192.168.1.0/24 to any port 3000

# Or use reverse proxy with authentication
```

### 3. Regular Updates

```bash
# Update the application
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## 🔄 Maintenance

### Backup Strategy

```bash
# Backup analytics database
cp ./data/analytics.db ./backups/analytics-$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
cp ./data/analytics.db $BACKUP_DIR/analytics-$(date +%Y%m%d-%H%M%S).db
find $BACKUP_DIR -name "analytics-*.db" -mtime +30 -delete
```

### Updates and Maintenance

```bash
# Update to latest version
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# View logs
docker-compose logs -f --tail=100

# Restart if needed
docker-compose restart jellyfin-analytics
```

## 📈 Scaling Considerations

For high-traffic deployments:

1. **Use External Database**: Consider PostgreSQL instead of SQLite
2. **Load Balancing**: Deploy multiple instances behind a load balancer
3. **Caching**: Implement Redis for better performance
4. **Resource Monitoring**: Use Prometheus/Grafana for monitoring

## 🎯 Success Verification

Your deployment is successful when:

- ✅ Dashboard loads at `http://your-server:3000`
- ✅ Settings page shows your Jellyfin configuration
- ✅ Connection test shows "Successfully connected to Jellyfin"
- ✅ Dashboard displays real data (not mock data)
- ✅ Data syncs automatically every 5 minutes

## 📞 Getting Help

If you encounter issues:

1. **Check Logs**: `docker-compose logs -f jellyfin-analytics`
2. **Verify Network**: Ensure containers can communicate
3. **Test API Key**: Verify it works in Jellyfin's API documentation
4. **Check Firewall**: Ensure ports are open
5. **Review Configuration**: Double-check all settings

---

**🎉 Congratulations!** Your Jellyfin Analytics Dashboard should now be running and collecting data from your Jellyfin server. Visit the dashboard to start exploring your media consumption analytics!
