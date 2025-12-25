# 🚀 Zero-Downtime Deployment Strategies

## Overview

This document covers production-ready deployment strategies for your 3D Action RPG that allow live server updates without interrupting active players.

---

## 🎯 Key Requirements

✅ **No player disconnections** during updates  
✅ **Config changes persist** across deployments  
✅ **Graceful shutdown** of old server instances  
✅ **Health checks** for load balancer integration  
✅ **Rollback capability** if issues occur  

---

## 🏗️ Strategy 1: PM2 Process Manager (Recommended for VPS)

### Why PM2?
- Built-in zero-downtime reload
- Process monitoring and auto-restart
- Log management
- Cluster mode for multi-core utilization
- Production battle-tested

### Setup

```bash
# Install PM2 globally
npm install -g pm2

# Start your app
pm2 start server.js --name "rpg-game" -i max

# Save process list
pm2 save

# Setup auto-start on server reboot
pm2 startup
```

### Deploy Updates

```bash
# Pull latest code
git pull

# Install dependencies if needed
npm install

# Reload with zero downtime
pm2 reload rpg-game

# Or restart all processes
pm2 restart all
```

### Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs rpg-game

# Real-time monitoring
pm2 monit

# Web dashboard
pm2 plus
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'rpg-game',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

Deploy with:
```bash
pm2 start ecosystem.config.js
pm2 reload ecosystem.config.js
```

---

## 🏗️ Strategy 2: Docker with Health Checks

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create config volume mount point
VOLUME ["/app/config"]

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
```

### Docker Compose with Rolling Updates

```yaml
version: '3.8'

services:
  rpg-game:
    build: .
    image: rpg-game:latest
    ports:
      - "3000:3000"
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 5s
```

### Deploy

```bash
# Build new image
docker build -t rpg-game:latest .

# Rolling update (Docker Swarm)
docker stack deploy -c docker-compose.yml rpg-game

# Or with docker-compose
docker-compose up -d --no-deps --build rpg-game
```

---

## 🏗️ Strategy 3: Nginx Reverse Proxy (Blue-Green Deployment)

### Architecture

```
Internet → Nginx (Port 80) → Blue Instance (Port 3001)
                           → Green Instance (Port 3002)
```

### Nginx Configuration

```nginx
upstream rpg_backend {
    # Blue instance (active)
    server localhost:3001 max_fails=3 fail_timeout=30s;
    
    # Green instance (standby)
    server localhost:3002 backup;
}

server {
    listen 80;
    server_name yourgame.com;

    location / {
        proxy_pass http://rpg_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://rpg_backend;
        access_log off;
    }
}
```

### Deployment Process

```bash
# 1. Start both instances
PORT=3001 node server.js &  # Blue (active)
PORT=3002 node server.js &  # Green (standby)

# 2. Update code on Green instance
# (stop green, pull code, restart)
kill $(lsof -t -i:3002)
git pull
PORT=3002 node server.js &

# 3. Test Green instance
curl http://localhost:3002/api/health

# 4. Switch Nginx to Green (edit config, set 3002 as primary)
sudo nano /etc/nginx/sites-available/rpg-game
sudo nginx -t
sudo nginx -s reload

# 5. Update Blue instance
kill $(lsof -t -i:3001)
git pull
PORT=3001 node server.js &
```

---

## 🌐 Cloud Platform Strategies

### Render.com (Easiest)

```yaml
# render.yaml
services:
  - type: web
    name: rpg-game
    env: node
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
```

**Zero-downtime**: Automatic with health checks

### Railway.app

```bash
railway up
```

**Zero-downtime**: Built-in with health checks

### Vercel (Static + Serverless)

Not ideal for this use case (stateful server), but possible with:
- Static files on Vercel
- API on separate service (Railway/Render)

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint

Already implemented in `server.js`:

```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### Advanced Health Check

```javascript
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    configsLoaded: Object.keys(configs).length
  };
  
  res.json(health);
});
```

---

## 🔄 Rollback Procedures

### PM2
```bash
# If issues occur, restart previous version
pm2 restart rpg-game
```

### Docker
```bash
# Rollback to previous image
docker tag rpg-game:latest rpg-game:backup
docker pull rpg-game:previous
docker-compose up -d
```

### Git-based
```bash
git revert HEAD
pm2 reload rpg-game
```

---

## ✅ Deployment Checklist

- [ ] Install dependencies: `npm install express cors`
- [ ] Test server locally: `npm run dev`
- [ ] Test API endpoints
- [ ] Choose deployment strategy
- [ ] Set up monitoring
- [ ] Configure health checks
- [ ] Test zero-downtime reload
- [ ] Document rollback procedure
- [ ] Set up automated backups
- [ ] Configure SSL/HTTPS

---

## 🎯 Recommended Setup by Scale

**Small (< 100 concurrent users)**
- PM2 on single VPS
- Nginx for SSL termination

**Medium (100-1000 users)**
- PM2 cluster mode
- Nginx load balancer
- Multiple VPS instances

**Large (1000+ users)**
- Docker Swarm or Kubernetes
- Cloud load balancer
- Auto-scaling groups
- CDN for static assets

