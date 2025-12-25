# 🚀 Deployment Guide - Zero-Downtime Updates

## Overview

This guide covers deploying your 3D Action RPG with live server updates and persistent admin configuration saves.

---

## 🏗️ Architecture

### Current Setup
- **Frontend**: Babylon.js game (static files)
- **Backend**: Express.js server (Node.js)
- **Config Storage**: JSON files in `/config` directory
- **Admin Panel**: Web-based config editor with server persistence

### Key Features
✅ **Zero-downtime deployments** with graceful shutdown  
✅ **Persistent config saves** via REST API  
✅ **Automatic backups** before config changes  
✅ **Health checks** for load balancers  
✅ **Hot-reload** in development mode  

---

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
npm install express cors
```

### 2. Update package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "dev:old": "npx live-server --port=8080 --watch=src,config,admin,shaders"
  }
}
```

### 3. Start the Server

**Development (with auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

---

## 🔧 API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "healthy", "timestamp": "2024-12-24T..." }
```

### Get All Configs
```
GET /api/configs
Response: { "global": {...}, "scenes": {...}, ... }
```

### Get Single Config
```
GET /api/configs/global
Response: { "debug": false, "fastReload": false, ... }
```

### Save Single Config
```
POST /api/configs/global
Body: { "debug": true, "fastReload": false, ... }
Response: { "success": true, "message": "Configuration global saved successfully" }
```

### Save All Configs
```
POST /api/configs
Body: { "global": {...}, "scenes": {...}, ... }
Response: { "results": [{ "name": "global", "success": true }, ...] }
```

---

## 🔄 Zero-Downtime Deployment Strategies

### Option 1: PM2 Process Manager (Recommended)

**Install PM2:**
```bash
npm install -g pm2
```

**Start with PM2:**
```bash
pm2 start server.js --name "rpg-game"
pm2 save
pm2 startup  # Enable auto-start on reboot
```

**Deploy Updates:**
```bash
git pull
pm2 reload rpg-game  # Zero-downtime reload
```

**Monitor:**
```bash
pm2 status
pm2 logs rpg-game
pm2 monit
```

### Option 2: Docker with Rolling Updates

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t rpg-game .
docker run -d -p 3000:3000 -v $(pwd)/config:/app/config rpg-game
```

**Update:**
```bash
docker build -t rpg-game:new .
docker stop old-container
docker run -d -p 3000:3000 -v $(pwd)/config:/app/config rpg-game:new
```

### Option 3: Nginx Reverse Proxy with Blue-Green Deployment

**Run two instances:**
```bash
PORT=3001 node server.js &  # Blue
PORT=3002 node server.js &  # Green
```

**Nginx config:**
```nginx
upstream rpg_backend {
    server localhost:3001;
    server localhost:3002 backup;
}

server {
    listen 80;
    location / {
        proxy_pass http://rpg_backend;
    }
}
```

**Deploy:**
1. Update code on Green (3002)
2. Test Green instance
3. Switch Nginx to Green
4. Update Blue (3001)

---

## 🌐 Production Deployment Platforms

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
```

### Railway.app
```bash
railway login
railway init
railway up
```

### DigitalOcean App Platform
- Connect GitHub repo
- Set build command: `npm install`
- Set run command: `npm start`
- Enable auto-deploy on push

### AWS / Azure / GCP
Use PM2 or Docker strategies above with:
- Load balancer for traffic distribution
- Auto-scaling groups
- Health check monitoring

---

## 🔐 Security Best Practices

### 1. Environment Variables
```bash
# .env
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=your_secure_password
```

### 2. Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Authentication for Admin Saves
```javascript
app.post('/api/configs/:name', authenticateAdmin, async (req, res) => {
  // Save logic
});
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### Custom Logging
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🎯 Next Steps

1. ✅ Update admin panel to use API endpoints
2. ✅ Test config save/load functionality
3. ✅ Choose deployment platform
4. ✅ Set up CI/CD pipeline
5. ✅ Configure monitoring

See `ADMIN_API_INTEGRATION.md` for updating the admin panel.

