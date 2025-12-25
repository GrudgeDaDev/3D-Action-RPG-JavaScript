# 📁 Project Structure Guide

## Overview

This document defines the official structure of the **3D-Action-RPG-JavaScript** project. All development should follow this organization.

## 🎯 Core Principle

**This is the main project**: `3D-Action-RPG-JavaScript`

- ✅ All new features go here
- ✅ All documentation lives here
- ✅ All examples are organized here
- ❌ Do NOT mix with sub-projects or references

## 📂 Directory Structure

```
3D-Action-RPG-JavaScript/          # Main project root
│
├── 📄 index.html                  # Game entry point
├── 📄 game.js                     # Game initialization
├── 📄 server.js                   # Express server with API
├── 📄 package.json                # Dependencies
├── 📄 README.md                   # Project overview
│
├── 📁 src/                        # Source code (MAIN PROJECT)
│   ├── GLOBALS.js                 # Global variables
│   ├── movement.js                # Character movement
│   │
│   ├── admin/                     # Admin panel backend
│   ├── ai/                        # AI systems (NME Agent)
│   ├── assets/                    # Asset management
│   │   ├── AssetLibrary.js
│   │   └── TileTextureManager.js  # NEW: Tile system
│   │
│   ├── character/                 # Character systems
│   │   ├── hero.js
│   │   ├── enemy.js
│   │   ├── health.js
│   │   └── races/                 # Race system
│   │
│   ├── combat/                    # Combat mechanics
│   │   ├── spells/
│   │   ├── weapons/
│   │   ├── abilities/
│   │   └── actionBar/             # Action bar UI
│   │
│   ├── config/                    # Configuration system
│   │   └── ConfigManager.js
│   │
│   ├── editor/                    # Scene editor tools
│   │   ├── PlacementTools.js
│   │   └── sceneEditor.js
│   │
│   ├── lobby/                     # Lobby scene
│   │   └── LobbyScene.js
│   │
│   ├── scene/                     # Scene management
│   │   ├── SceneManager.js
│   │   ├── gen/                   # Procedural generation
│   │   │   ├── procedural/
│   │   │   │   ├── TileBasedGenerator.js  # NEW
│   │   │   │   └── grid/
│   │   │   └── place.js
│   │   │
│   │   └── scenes/                # Scene implementations
│   │       ├── archipelago.js
│   │       ├── builder.js
│   │       ├── outdoor.js
│   │       └── builder-tile-integration.js  # NEW
│   │
│   ├── scripting/                 # Scripting system
│   │   ├── ScriptManager.js
│   │   └── ScriptLoader.js
│   │
│   ├── ui/                        # UI components
│   │   ├── MaterialPanel.js
│   │   ├── TileBrowserPanel.js    # NEW
│   │   ├── ActionBarUI.js
│   │   └── SkillTreeUI.js
│   │
│   ├── utils/                     # Utilities
│   │   ├── core/                  # Core utilities
│   │   │   ├── EventEmitter.js
│   │   │   └── ObjectPool.js
│   │   ├── storage/               # Storage services
│   │   ├── cloud/                 # Cloud services (Puter.js)
│   │   ├── mobile/                # Mobile controls
│   │   ├── lighting/              # Lighting systems
│   │   ├── plants/                # Vegetation
│   │   └── settings/              # Settings management
│   │
│   └── vehicles/                  # Vehicle systems
│
├── 📁 config/                     # JSON configuration files
│   ├── assets.json                # Asset paths
│   ├── builder.json               # Builder settings
│   ├── camera.json                # Camera config
│   ├── character.json             # Character stats
│   ├── character-skins.json       # Character skins
│   ├── combat.json                # Combat settings
│   ├── global.json                # Global settings
│   ├── graphics.json              # Graphics settings
│   ├── movement.json              # Movement config
│   ├── physics.json               # Physics settings
│   ├── races.json                 # Race definitions
│   ├── scenes.json                # Scene definitions
│   ├── settings.json              # User settings
│   └── tiles-catalog.json         # NEW: Tile catalog
│
├── 📁 assets/                     # Game assets
│   ├── assets.json                # Asset catalog
│   ├── characters/                # Character models
│   ├── env/                       # Environment assets
│   │   ├── builder/               # Builder parts
│   │   │   └── parts.glb          # Building tiles
│   │   ├── buildings/
│   │   ├── exterior/
│   │   ├── interior/
│   │   └── props/
│   ├── textures/                  # Textures
│   │   ├── terrain/
│   │   ├── interior/
│   │   └── effects/
│   ├── util/                      # Utility assets
│   │   ├── scripts/               # Game scripts
│   │   └── ui/                    # UI assets
│   └── vehicles/
│
├── 📁 admin/                      # Admin panel (frontend)
│   ├── index.html
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── adminApp.js
│
├── 📁 docs/                       # Documentation
│   ├── DOCUMENTATION_INDEX.md     # Master index
│   ├── PROJECT_STRUCTURE.md       # This file
│   ├── DEPLOYMENT.md
│   ├── SCRIPTING_SYSTEM_GUIDE.md
│   ├── TILE_SYSTEM_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   ├── WHATS_NEW.md
│   │
│   ├── guides/                    # Detailed guides
│   │   ├── README_ADMIN_LOBBY.md
│   │   ├── CONFIG_GUIDE.md
│   │   ├── ADMIN_PANEL_DESIGN.md
│   │   └── ...
│   │
│   └── archive/                   # Historical docs
│       └── ...
│
├── 📁 examples/                   # Code examples
│   ├── tile-system-example.js
│   ├── race-system-integration-example.js
│   ├── skill-tree-integration-example.js
│   └── ...
│
├── 📁 lib/                        # Third-party libraries
│   ├── babylon.js
│   ├── babylon.gui.min.js
│   ├── HavokPhysics_umd.js
│   └── ...
│
├── 📁 shaders/                    # Custom shaders
│   ├── env/
│   ├── vfx/
│   └── hp/
│
└── 📁 reference/                  # Reference materials (READ-ONLY)
    └── unity-ui-examples/         # Unity reference
```

## 🚫 What NOT to Include

### ❌ Grudge-PlayGround
- Located at: `src/utils/Grudge-PlayGround/`
- **Purpose**: Reference project only
- **Status**: Do NOT modify or integrate directly
- **Usage**: Copy useful patterns to main project

### ❌ Node Modules
- Auto-generated by npm
- Never commit to version control
- Recreate with `npm install`

### ❌ History Folders
- `.history/` folders are local IDE artifacts
- Not part of project structure

## ✅ Where to Put New Code

### New Feature
```
src/[category]/[feature-name]/
```
Example: `src/combat/abilities/dash.js`

### New UI Component
```
src/ui/[ComponentName].js
```
Example: `src/ui/InventoryPanel.js`

### New Scene
```
src/scene/scenes/[scene-name].js
```
Example: `src/scene/scenes/dungeon.js`

### New Configuration
```
config/[system-name].json
```
Example: `config/inventory.json`

### New Documentation
```
docs/[TOPIC]_GUIDE.md
```
Example: `docs/INVENTORY_SYSTEM_GUIDE.md`

### New Example
```
examples/[feature]-example.js
```
Example: `examples/inventory-integration-example.js`

## 📝 Naming Conventions

### Files
- **JavaScript**: PascalCase for classes (`TileManager.js`), camelCase for utilities (`loadAssets.js`)
- **JSON**: kebab-case (`character-skins.json`)
- **Markdown**: SCREAMING_SNAKE_CASE (`TILE_SYSTEM_GUIDE.md`)

### Directories
- **lowercase**: For general categories (`src/combat/`)
- **PascalCase**: For specific components (`src/ui/ActionBar/`)

## 🔄 Migration from Reference Projects

When taking code from Grudge-PlayGround or other references:

1. **Copy** the useful code
2. **Adapt** to Babylon.js if needed
3. **Place** in appropriate main project location
4. **Document** in relevant guide
5. **Create** example if complex

### Example Migration
```
FROM: src/utils/Grudge-PlayGround/Grudge-PlayGround/src/core/EventEmitter.js
TO:   src/utils/core/EventEmitter.js
```

## 📚 Documentation Organization

### Root Level (Quick Access)
- `README.md` - Project overview
- `STARTUP_GUIDE.md` - Getting started
- `QUICK_START.md` - Fast setup

### docs/ (Main Docs)
- System guides
- Feature documentation
- API references

### docs/guides/ (Detailed)
- In-depth tutorials
- Design documents
- Implementation guides

### docs/archive/ (Historical)
- Old documentation
- Completed milestones
- Deprecated guides

## 🎯 Best Practices

1. **Keep main project clean** - No nested sub-projects
2. **Use reference folder** - For external examples
3. **Document everything** - Update docs with new features
4. **Follow structure** - Don't create random folders
5. **Consistent naming** - Follow conventions above

---

**Remember**: This is **3D-Action-RPG-JavaScript**, not a collection of projects. Keep it organized!

