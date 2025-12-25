# 🎮 GGE Warlords - 3D Action RPG

![Example Image](https://i.ibb.co/D7tywtK/2024-06-2910-15-38-ezgif-com-speed.gif)

**GGE Warlords** is a complete 3D Action RPG framework built with BabylonJS, featuring multiplayer support, GRUDA GEAR equipment system, character progression, combat, AI-powered NPCs, and cloud deployment on Puter.

> **📚 New to the project?** Start with the **[Documentation Index](DOCUMENTATION_INDEX.md)** for organized access to all guides, tutorials, and resources!

> **🚀 Ready to deploy?** Check out the **[Deployment Master Plan](DEPLOYMENT_MASTER_PLAN.md)** for complete deployment instructions!

---

## ✨ Features

### Core Systems

- **🎭 Multiple Scenes** - Lobby, outdoor worlds, interiors, caves, and more
- **⚔️ Combat System** - Spells, weapons, damage, and effects
- **🏃 Character Movement** - Walk, sprint, roll, jump with physics
- **🛡️ GRUDA GEAR** - Complete equipment system with T1-T8 tiers and rarity levels
- **🎯 Character Progression** - Classes, races, skill trees, and leveling
- **🐎 Mount System** - Rideable mounts with unique abilities
- **🔨 Crafting System** - Gather resources and craft items

### Advanced Features

- **🎨 AI Material Generator** - Create PBR materials from text descriptions (Press M)
- **🤖 AI NPCs** - Dynamic dialogue and quest generation with Gemini/Puter AI
- **🔧 Level Builder** - Visual terrain editing and object placement
- **⚙️ Admin Panel** - Live configuration editing with server sync
- **📊 Persistent UI** - FPS counter and debug info across scenes
- **🎮 Gamepad Support** - Full controller input mapping
- **📱 Mobile Ready** - Touch controls and responsive design

### Multiplayer & Cloud

- **🌐 Multiplayer** - Colyseus-powered real-time multiplayer (coming soon)
- **☁️ Cloud Deployment** - Deploy to Puter Cloud for free
- **🔐 Authentication** - GrudaChain blockchain authentication

---

## 🚀 Demo

[**Play in your browser**](https://www.rpgskilltreegenerator.com/RPG/index.html?scene=outdoor) instantly.

### Scene URLs

| Scene | URL |
|-------|-----|
| Outdoor | [`?scene=outdoor`](https://rpgskilltreegenerator.com/RPG/index.html?scene=outdoor) |
| Lobby | [`?scene=lobby`](https://rpgskilltreegenerator.com/RPG/index.html?scene=lobby) |
| Inn | [`?scene=inn`](https://rpgskilltreegenerator.com/RPG/index.html?scene=inn) |
| Builder | [`?scene=builder`](https://rpgskilltreegenerator.com/RPG/index.html?scene=builder) |
| Debug Mode | [`&debug=true`](https://rpgskilltreegenerator.com/RPG/index.html?scene=outdoor&debug=true) |

See all scenes in [`SceneManager.js`](/src/scene/SceneManager.js).

---

## 🛠️ Run Locally

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/3D-Action-RPG-JavaScript.git
cd 3D-Action-RPG-JavaScript

# Start the server (includes admin API)
node server.js

# Open in browser
# http://localhost:5500
```

### Development Server

The included Express server provides:

- Static file serving
- **Admin API** for config management (`/api/configs`)
- Hot-reload support for configuration changes

### Alternative: Any Static Server

```bash
# Python
python -m http.server 5500

# Node (npx)
npx serve .

# VS Code Live Server extension
```

---

## ⚙️ Admin Panel

Access the admin panel at `/admin` or click the ⚙️ button in the lobby.

### Features

- **Visual Config Editor** - Edit all game settings with forms
- **Live Preview** - See JSON output in real-time
- **Server Sync** - Save changes directly to server
- **Import/Export** - Backup and restore configurations
- **Connection Status** - Real-time server health indicator

### Configuration Files

| File | Purpose |
|------|---------|
| `config/global.json` | Debug, WebGPU, developer settings |
| `config/scenes.json` | Scene definitions and spawn points |
| `config/combat.json` | Spells, weapons, damage values |
| `config/movement.json` | Controls and movement speeds |
| `config/character.json` | Hero stats and enemy configs |
| `config/camera.json` | Camera settings and limits |
| `config/physics.json` | Gravity and physics properties |
| `config/graphics.json` | Post-processing and quality |
| `config/builder.json` | Builder tool settings |
| `config/assets.json` | Asset paths and references |

See [`docs/guides/CONFIG_GUIDE.md`](docs/guides/CONFIG_GUIDE.md) for details.

---

## 🎨 AI Material Generator

Press **M** to open the Material Forge panel. Generate PBR materials from natural language:

```
"shiny gold metal with scratches"
"glowing blue crystal"
"weathered stone with moss"
"animated lava flow"
```

### Features

- **AI Chat Interface** - Describe materials in plain English
- **Template Library** - Pre-built material starting points
- **Material Library** - Save and reuse your creations
- **Live Preview** - See materials on a 3D sphere
- **Apply to Meshes** - One-click application to selected objects

See [`src/ai/NMEAgent.js`](src/ai/NMEAgent.js) and [`src/ui/MaterialPanel.js`](src/ui/MaterialPanel.js).

---

## 📁 Project Structure

```
├── admin/                  # Admin panel (HTML/CSS/JS)
│   ├── index.html
│   ├── css/admin.css
│   └── js/adminApp.js
├── config/                 # JSON configuration files
├── docs/                   # Documentation
│   ├── guides/            # Feature guides
│   └── archive/           # Historical docs
├── src/
│   ├── ai/                # AI agents (NMEAgent)
│   ├── assets/            # Asset management
│   ├── character/         # Hero, enemies, health
│   ├── combat/            # Spells, weapons, damage
│   ├── config/            # ConfigManager
│   ├── lobby/             # Lobby scene
│   ├── scene/             # SceneManager, scenes
│   │   ├── gen/           # Procedural generation
│   │   └── scenes/        # Scene implementations
│   ├── ui/                # UI panels and components
│   └── utils/             # Utilities
├── lib/                   # Babylon.js libraries
├── assets/                # 3D models, textures
├── shaders/               # Custom shaders
├── server.js              # Express server with API
└── index.html             # Main entry point
```

---

## 🔧 Builder Mode

Access with `?scene=builder`. Tools include:

| Tool | Function |
|------|----------|
| **Place** | Place terrain cells |
| **Raise** | Raise/Lower/Flatten terrain |
| **Models** | Place 3D objects |
| **Delete** | Remove placed objects |
| **Copy** | Copy/paste sections |
| **Material** | AI material generation |
| **Settings** | Save/Load/Export |

---

## 📚 Documentation

**📖 [Complete Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Master index of all documentation

### Quick Links

#### Getting Started

- **[Startup Guide](STARTUP_GUIDE.md)** - Detailed setup and configuration
- **[Quick Start](QUICK_START.md)** - Fast track to running the game
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Folder organization guide

#### Core Systems

- **[Admin Panel Guide](docs/guides/README_ADMIN_LOBBY.md)** - Using the admin panel
- **[Config Guide](docs/guides/CONFIG_GUIDE.md)** - All configuration files explained
- **[Combat System](docs/guides/CONFIG_GUIDE.md#combat)** - Spells, weapons, damage
- **[Character System](docs/guides/CONFIG_GUIDE.md#character)** - Stats and movement

#### Building & Editing

- **[Tile System Guide](docs/TILE_SYSTEM_GUIDE.md)** - Tile-based building system
- **[Builder Mode](docs/guides/SIZING_AND_BUILDER_GUIDE.md)** - Terrain editing
- **[Placement Tools](docs/PLACEMENT_TOOLS_GUIDE.md)** - Object placement
- **[Scripting System](docs/SCRIPTING_SYSTEM_GUIDE.md)** - Custom scripts

#### Advanced Features

- **[Race System](RACE_SYSTEM_SUMMARY.md)** - Character races
- **[Skill Trees](SKILL_TREE_CONSOLIDATION_SUMMARY.md)** - Class and weapon skills
- **[Action Bar](COMPLETE_SYSTEMS_SUMMARY.md#action-bar)** - Ability hotkeys
- **[Persistent UI](docs/guides/PERSISTENT_UI_GUIDE.md)** - Cross-scene UI

#### Deployment & Troubleshooting

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and fixes
- **[What's New](docs/WHATS_NEW.md)** - Recent updates

---

## 🎮 Controls

### Keyboard

| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Space | Jump |
| Shift | Sprint |
| Q | Roll/Dodge |
| E | Interact |
| 1-4 | Spells |
| M | Material Panel |
| Esc | Menu |

### Mouse

- **Left Click** - Attack/Select
- **Right Click** - Secondary action
- **Scroll** - Zoom camera
- **Drag** - Rotate camera

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

### Support the Project

- [Patreon](https://www.patreon.com/OpenRPGTools)
- [Discord](https://discord.gg/NcJYR65HHZ)

---

## 📄 License

MIT License - See LICENSE file for details.
