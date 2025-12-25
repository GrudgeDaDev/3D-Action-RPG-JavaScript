# Deployment Guide

## Tech Stack

### Frontend (Client)
| Technology | Purpose | Files |
|------------|---------|-------|
| **Babylon.js** | 3D rendering engine | `lib/babylon.js`, `lib/babylon.gui.min.js` |
| **Havok Physics** | Physics engine (WASM) | `lib/HavokPhysics.wasm`, `lib/HavokPhysics_umd.js` |
| **Pure JavaScript (ES Modules)** | Game logic | `src/**/*.js`, `game.js` |
| **HTML/CSS** | UI and styling | `index.html`, `src/ui/*.css` |

### Backend (Server)
| Technology | Purpose | Files |
|------------|---------|-------|
| **Node.js 18+** | Runtime | - |
| **Express.js** | HTTP server & API | `server.js` |
| **CORS** | Cross-origin support | - |

### Configuration
| Type | Location |
|------|----------|
| Game configs | `config/*.json` |
| Asset catalog | `assets/assets.json` |

---

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# OR use live-server for static files only
npm run dev:static
```

### Production
```bash
# Start production server
npm start
```

Access the game at: `http://localhost:3000`

---

## Required Files for Deployment

### Core Files (Required)
```
├── index.html           # Entry point
├── game.js             # Main game initialization
├── server.js           # Express server (if using Node)
├── package.json        # Dependencies
├── config/             # All JSON configs (required)
│   ├── global.json
│   ├── scenes.json
│   ├── assets.json
│   └── ...
├── lib/                # Babylon.js & Havok (required)
│   ├── babylon.js
│   ├── babylon.gui.min.js
│   ├── babylonjs.loaders.min.js
│   ├── HavokPhysics.wasm
│   ├── HavokPhysics_umd.js
│   └── ...
├── src/                # Game source code (required)
├── assets/             # 3D models, textures (required)
└── shaders/            # GLSL shaders (required)
```

### Optional Files
```
├── admin/              # Admin panel (optional)
├── examples/           # Example code (dev only)
├── docs/               # Documentation (dev only)
└── reference/          # Reference files (dev only)
```

---

## Static Hosting (No Node.js)

You can deploy just the frontend to any static host:

1. **Vercel/Netlify**: Upload entire folder
2. **GitHub Pages**: Push to gh-pages branch
3. **AWS S3 + CloudFront**: Upload as static site

**Note**: Without Node.js backend, config saving via API won't work.

---

## Full Stack Deployment

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway up
```

### Render
1. Create Web Service
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set Node version: `18`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |

---

## Troubleshooting

### Common Issues

1. **Scene not loading**: Check browser console for import errors
2. **Physics not working**: Ensure HavokPhysics.wasm is accessible
3. **Models not loading**: Verify asset paths in config/assets.json

### Browser Extension Conflicts
Some browser extensions (crypto wallets, ad blockers) may cause console errors like:
- `walletChannelId missing` - Crypto wallet extension
- `MutationObserver error` - Various extensions

**Solution**: Test in incognito mode or disable extensions.

