# 3D Action RPG - Admin Panel & Lobby System Design

## Project Summary

**Technology Stack:**
- **Engine:** Babylon.js 5.5
- **Physics:** Havok Physics
- **Language:** Pure JavaScript (ES6 Modules)
- **Build:** No build process - direct file serving
- **Architecture:** Scene-based with centralized Scene Manager

**Current Features:**
- 8 different scenes (night, day, outdoor, room, underground, town, inn, builder)
- Character system with hero and enemies
- Combat system with spells and effects
- Physics-based movement
- Multi-platform input (keyboard, gamepad, mobile touch)
- Procedural builder with grid-based construction
- Custom shaders and VFX
- Animation system

---

## System Architecture Overview

### Core Systems Map

```
┌─────────────────────────────────────────────────────────────┐
│                     SCENE MANAGER                            │
│  - Manages all scenes                                        │
│  - Handles scene switching                                   │
│  - Maintains GUI textures per scene                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   CHARACTER    │  │   COMBAT    │  │    BUILDER      │
│   SYSTEM       │  │   SYSTEM    │  │    SYSTEM       │
│                │  │             │  │                 │
│ - Hero         │  │ - Spells    │  │ - Grid          │
│ - Enemies      │  │ - Effects   │  │ - Tools         │
│ - Health       │  │ - Projectiles│ │ - Procedural   │
│ - Animations   │  │ - VFX       │  │ - Placement     │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│    INPUT       │  │   PHYSICS   │  │    ASSETS       │
│    SYSTEM      │  │   SYSTEM    │  │    SYSTEM       │
│                │  │             │  │                 │
│ - Keyboard     │  │ - Havok     │  │ - Models (.glb) │
│ - Gamepad      │  │ - Collision │  │ - Textures      │
│ - Mobile Touch │  │ - Gravity   │  │ - Shaders       │
└────────────────┘  └─────────────┘  └─────────────────┘
```

---

## File Structure Analysis

### Critical Files & Dependencies

**Entry Point:**
- `index.html` → Loads Babylon.js libraries and `game.js`
- `game.js` → Creates SceneManager and starts the game

**Global State:**
- `src/GLOBALS.js` → All global variables and settings

**Scene Management:**
- `src/scene/SceneManager.js` → Scene lifecycle management
- `src/scene/scenes/*.js` → Individual scene definitions

**Character System:**
- `src/character/hero.js` → Hero model loading
- `src/character/enemy.js` → Enemy creation and AI
- `src/character/health.js` → Health system
- `src/character/damagePopup.js` → Damage number display

**Combat System:**
- `src/combat/SPELLS.js` → Spell definitions
- `src/combat/EFFECTS.js` → Effect definitions (placeholder)
- `src/combat/spell.js` → Spell class
- `src/combat/effect.js` → Effect class
- `src/combat/visual/projectile.js` → Projectile system

**Movement & Input:**
- `src/movement.js` → All input handling and character movement
- `src/utils/mobile/joystick.js` → Mobile touch controls

**Builder System:**
- `src/scene/gen/procedural/grid/grid.js` → Grid creation
- `src/scene/gen/procedural/grid/gridTracker.js` → Grid state tracking
- `src/scene/gen/procedural/grid/tools/*.js` → Builder tools
- `src/scene/gen/procedural/grid/constants.js` → Grid configuration

**Utilities:**
- `src/utils/camera.js` → Camera setup and controls
- `src/utils/physics.js` → Physics initialization
- `src/utils/anim.js` → Animation setup
- `src/utils/load.js` → Asset loading
- `src/utils/vfx.js` → Visual effects
- `src/utils/water.js` → Water rendering
- `src/utils/plants/plants.js` → Vegetation system

**Shaders:**
- `shaders/vfx/*.fx` → VFX shaders (orb, trail, sword trail)
- `shaders/env/*.fx` → Environment shaders (grass, terrain)
- `shaders/hp/*.fx` → Health bar shader

---

## Configurable Parameters

### 1. Global Settings (GLOBALS.js)
```javascript
{
  "debug": false,
  "fastReload": false,
  "webGPU": false,
  "onMobile": true,
  "dynamicCamera": false,
  "targetBaseOnCameraView": true
}
```

### 2. Combat Configuration
```javascript
{
  "spells": {
    "fireball": {
      "name": "Fireball",
      "damage": 8,
      "range": 200,
      "animation": "fireballAnimation",
      "vfx": "fireballVFX"
    },
    "quickSwing": {
      "name": "Quick Swing",
      "damage": 2,
      "range": 35,
      "animation": "fireballAnimation",
      "vfx": "SlashEffect"
    },
    "heavySwing": {
      "name": "Heavy Swing",
      "damage": 10,
      "range": 45,
      "animation": "fireballAnimation",
      "vfx": "SlashEffect"
    }
  },
  "effects": {
    "damage": { "type": "damage", "randomVariance": 3 },
    "heal": { "type": "heal", "randomVariance": 0 }
  }
}
```

### 3. Movement & Controls Configuration
```javascript
{
  "keyboard": {
    "forward": "w",
    "backward": "s",
    "strafeLeft": "q",
    "strafeRight": "e",
    "sprint": "f",
    "roll": "Space",
    "jump": "v",
    "attack": "4",
    "heavyAttack": "5",
    "spell": "c"
  },
  "gamepad": {
    "jump": "A",
    "attack": "X",
    "heavyAttack": "Y"
  },
  "movement": {
    "normalSpeed": 80.0,
    "sprintSpeed": 1.5,
    "rollSpeed": 1.6,
    "attackDistance": 17.0
  },
  "combo": {
    "firstAttackDelay": 100,
    "secondAttackDelay": 100,
    "thirdAttackDelay": 400,
    "comboWindow": 500
  }
}
```

### 4. Character Configuration
```javascript
{
  "hero": {
    "modelPath": "./assets/characters/human_basemesh/HumanBaseMesh_WithEquips.glb",
    "scale": 3.7,
    "positionOffset": { "x": 0, "y": -11, "z": 0 },
    "health": 100,
    "animations": {
      "idle": "BreathingIdle",
      "running": "RunningSprint",
      "jump": "Jump",
      "roll": "SprintingForwardRollInPlace",
      "selfCast": "Standing 2H Magic Area Attack 02"
    }
  },
  "enemies": {
    "slime": {
      "modelPath": "./assets/characters/enemy/slime/Slime1.glb",
      "scale": 5.7,
      "health": 50,
      "moveSpeed": 0.003,
      "randomMoveInterval": 6000
    }
  }
}
```

### 5. Camera Configuration
```javascript
{
  "camera": {
    "type": "ArcRotateCamera",
    "initialAlpha": 4.954,
    "initialBeta": 1.3437,
    "initialRadius": 70,
    "lowerRadiusLimit": 4,
    "upperRadiusLimit": 656.8044,
    "upperBetaLimit": 1.5708,
    "lowerBetaLimit": 0.0157,
    "wheelDeltaPercentage": 0.02,
    "panningSensibility": 0,
    "allowUpsideDown": false,
    "collisionRadius": { "x": 0.5, "y": 0.5, "z": 0.5 }
  }
}
```

### 6. Physics Configuration
```javascript
{
  "physics": {
    "engine": "Havok",
    "gravity": { "x": 0, "y": -9.8, "z": 0 },
    "character": {
      "mass": 500,
      "restitution": 0.0,
      "friction": 1.0,
      "shapeType": "CAPSULE"
    },
    "terrain": {
      "mass": 0,
      "restitution": 0.0,
      "friction": 1000000000.8,
      "shapeType": "MESH"
    }
  }
}
```

### 7. Graphics/Post-Processing Configuration
```javascript
{
  "postProcessing": {
    "enabled": true,
    "hdr": true,
    "msaa": {
      "enabled": true,
      "samples": 4
    },
    "fxaa": {
      "enabled": true
    },
    "bloom": {
      "enabled": true,
      "threshold": 1.85
    },
    "imageProcessing": {
      "contrast": 2.6,
      "exposure": 2.6,
      "toneMappingEnabled": true,
      "toneMappingType": "ACES",
      "vignetteEnabled": true,
      "vignetteWeight": 2.1,
      "vignetteColor": { "r": 0, "g": 0, "b": 0, "a": 1 },
      "vignetteBlendMode": "MULTIPLY"
    }
  },
  "fog": {
    "enabled": true,
    "color": { "r": 0.45, "g": 0.635, "b": 0.82 }
  }
}
```

### 8. Builder/Grid Configuration
```javascript
{
  "builder": {
    "gridSize": 19,
    "cellSize": 60,
    "tools": {
      "place": {
        "name": "Place",
        "icon": "./assets/util/ui/icons/path.png",
        "subTools": []
      },
      "raise": {
        "name": "Raise",
        "icon": "./assets/util/ui/icons/tree.png",
        "subTools": ["Raise", "Lower", "Flatten", "Path"],
        "brushSize": 50,
        "raiseAmount": 10.1,
        "lowerAmount": 10.1
      },
      "settings": {
        "name": "Settings",
        "icon": "./assets/util/ui/icons/gear.png",
        "subTools": ["Save", "Load", "Load World"]
      }
    }
  }
}
```

### 9. Scene Configuration
```javascript
{
  "scenes": {
    "night": {
      "name": "Night Scene",
      "creator": "createNight",
      "spawnPoint": { "x": 0, "y": 40, "z": -20 },
      "levelSize": 20000,
      "models": [
        "characters/enemy/slime/Slime1.glb",
        "characters/weapons/Sword2.glb",
        "util/HPBar.glb"
      ]
    },
    "builder": {
      "name": "Builder Scene",
      "creator": "createBuilder",
      "spawnPoint": { "x": 0, "y": 40, "z": -20 },
      "levelSize": 20000,
      "models": [
        "env/builder/parts.glb",
        "env/exterior/grass/grass.glb"
      ]
    }
  }
}
```

### 10. Asset Paths Configuration
```javascript
{
  "assets": {
    "characters": {
      "hero": "./assets/characters/human_basemesh/HumanBaseMesh_WithEquips.glb",
      "slime": "./assets/characters/enemy/slime/Slime1.glb"
    },
    "weapons": {
      "sword2": "./assets/characters/weapons/Sword2.glb"
    },
    "environment": {
      "environmentMap": "./assets/textures/lighting/environment.env"
    },
    "terrain": {
      "heightMap": "./assets/textures/terrain/hieghtMap.png",
      "mixMap": "./assets/textures/terrain/mixMap.png",
      "floor": "./assets/textures/terrain/floor.png",
      "rock": "./assets/textures/terrain/rock.png",
      "grass": "./assets/textures/terrain/grass.png"
    },
    "shaders": {
      "orb": {
        "vertex": "../../../shaders/vfx/orb",
        "fragment": "../../../shaders/vfx/orb"
      },
      "trail": {
        "vertex": "../../../shaders/vfx/trail_sword",
        "fragment": "../../../shaders/vfx/trail_sword"
      },
      "grass": {
        "vertex": "../../../shaders/env/grass",
        "fragment": "../../../shaders/env/grass"
      }
    }
  }
}
```

---

## Admin Panel Design

### Architecture

The admin panel will be a separate web interface that allows editing all configuration files with:
- Real-time validation
- Live preview (when possible)
- Export/Import functionality
- Version control integration
- Category-based navigation

### UI Structure

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN PANEL - 3D Action RPG Configuration              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────────────────────────┐│
│  │ NAVIGATION   │  │  EDITOR PANEL                    ││
│  │              │  │                                  ││
│  │ • Global     │  │  [Selected Category Content]     ││
│  │ • Combat     │  │                                  ││
│  │ • Movement   │  │  Field Name:  [Input]            ││
│  │ • Character  │  │  Value:       [Input]            ││
│  │ • Camera     │  │  Description: Info text          ││
│  │ • Physics    │  │                                  ││
│  │ • Graphics   │  │  [Add New] [Remove] [Reset]      ││
│  │ • Builder    │  │                                  ││
│  │ • Scenes     │  │                                  ││
│  │ • Assets     │  │                                  ││
│  │              │  │                                  ││
│  │ [Export All] │  │                                  ││
│  │ [Import]     │  │                                  ││
│  └──────────────┘  └──────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ PREVIEW PANEL (Optional)                            ││
│  │ Shows live preview of changes when applicable       ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Features

1. **Category-Based Editing**
   - Each configuration category has its own panel
   - Nested object editing with collapsible sections
   - Array management (add/remove items)

2. **Validation**
   - Type checking (number, string, boolean, object)
   - Range validation (min/max values)
   - Required field validation
   - Custom validation rules

3. **Real-Time Preview**
   - For graphics settings: live preview window
   - For movement: visual representation of speeds
   - For combat: damage calculator

4. **Export/Import**
   - Export all configs as ZIP
   - Export individual config files
   - Import from file or paste JSON
   - Merge imported configs with existing

5. **Version Control**
   - Save configuration snapshots
   - Compare versions
   - Rollback to previous version
   - Export version history

---

## Lobby System Design

### Architecture

The lobby is an in-game interface built with Babylon.GUI that appears before starting a game session.

### UI Structure

```
┌─────────────────────────────────────────────────────────┐
│                    GAME LOBBY                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │         CHARACTER PREVIEW (3D)                      ││
│  │                                                      ││
│  │         [Rotating Hero Model]                       ││
│  │                                                      ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ SCENE SELECT │  │   SETTINGS   │  │   CONTROLS   │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │ • Night      │  │ Graphics:    │  │ Keyboard     │  │
│  │ • Day        │  │ [Low/Med/Hi] │  │ Gamepad      │  │
│  │ • Outdoor    │  │              │  │ Touch        │  │
│  │ • Town       │  │ Difficulty:  │  │              │  │
│  │ • Inn        │  │ [Easy/Normal]│  │ [Configure]  │  │
│  │ • Builder    │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│                    [START GAME]                          │
│                    [ADMIN PANEL]                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Features

1. **Scene Selection**
   - Visual preview of each scene
   - Scene description
   - Recommended difficulty
   - Quick start button

2. **Graphics Presets**
   - Low: Minimal post-processing, lower resolution
   - Medium: Balanced settings
   - High: Full effects, maximum quality
   - Custom: Opens detailed settings

3. **Control Scheme**
   - Auto-detect input device
   - Switch between keyboard/gamepad/touch
   - Quick hotkey reference
   - Sensitivity adjustments

4. **Character Preview**
   - 3D rotating model
   - Equipment display
   - Stats overview
   - Customization options (future)

---

## Implementation Plan

### Phase 1: Configuration System (Week 1-2)

**Files to Create:**
```
src/config/
  ├── ConfigManager.js          # Central config management
  ├── schemas/
  │   ├── globalSchema.js       # Global settings schema
  │   ├── combatSchema.js       # Combat config schema
  │   ├── movementSchema.js     # Movement config schema
  │   ├── characterSchema.js    # Character config schema
  │   ├── cameraSchema.js       # Camera config schema
  │   ├── physicsSchema.js      # Physics config schema
  │   ├── graphicsSchema.js     # Graphics config schema
  │   ├── builderSchema.js      # Builder config schema
  │   ├── sceneSchema.js        # Scene config schema
  │   └── assetSchema.js        # Asset paths schema
  └── validators/
      ├── typeValidator.js      # Type checking
      ├── rangeValidator.js     # Range validation
      └── customValidator.js    # Custom rules

config/
  ├── global.json
  ├── combat.json
  ├── movement.json
  ├── character.json
  ├── camera.json
  ├── physics.json
  ├── graphics.json
  ├── builder.json
  ├── scenes.json
  └── assets.json
```

**Tasks:**
1. Create ConfigManager class with:
   - Load config from JSON
   - Validate config against schema
   - Get/Set config values
   - Save config to JSON
   - Hot-reload support

2. Define JSON schemas for all systems

3. Create validation system

4. Implement hot-reload for development mode

**Dependencies:**
- None (foundational system)

---

### Phase 2: Admin Panel (Week 3-4)

**Files to Create:**
```
admin/
  ├── index.html                # Admin panel HTML
  ├── css/
  │   └── admin.css            # Styling
  ├── js/
  │   ├── adminApp.js          # Main admin app
  │   ├── components/
  │   │   ├── Navigation.js    # Category navigation
  │   │   ├── Editor.js        # Config editor
  │   │   ├── Preview.js       # Live preview
  │   │   └── ExportImport.js  # Export/Import UI
  │   └── utils/
  │       ├── fileHandler.js   # File operations
  │       └── validator.js     # UI validation
  └── lib/
      └── jsoneditor.min.js    # JSON editor library
```

**Tasks:**
1. Create admin panel HTML structure
2. Build category navigation system
3. Implement config editor with validation
4. Add export/import functionality
5. Create preview system for graphics settings
6. Add version control features

**Dependencies:**
- Phase 1 (ConfigManager)
- JSON Editor library (optional, for advanced editing)

---

### Phase 3: Lobby System (Week 5-6)

**Files to Create:**
```
src/lobby/
  ├── LobbyScene.js            # Main lobby scene
  ├── ui/
  │   ├── SceneSelector.js     # Scene selection UI
  │   ├── SettingsPanel.js     # Settings UI
  │   ├── ControlsPanel.js     # Controls configuration UI
  │   └── CharacterPreview.js  # 3D character preview
  └── presets/
      ├── graphicsPresets.js   # Graphics quality presets
      └── controlPresets.js    # Control scheme presets
```

**Tasks:**
1. Create lobby scene with Babylon.GUI
2. Build scene selection interface
3. Implement graphics presets
4. Create control scheme selector
5. Add 3D character preview
6. Implement start game functionality

**Dependencies:**
- Phase 1 (ConfigManager)
- Babylon.GUI library (already included)

---

### Phase 4: System Integration (Week 7-8)

**Files to Modify:**
```
src/GLOBALS.js                 # Load from ConfigManager
src/movement.js                # Use config for controls
src/combat/SPELLS.js           # Load from config
src/combat/spell.js            # Use config values
src/character/hero.js          # Load from config
src/character/enemy.js         # Load from config
src/utils/camera.js            # Use config for camera
src/utils/physics.js           # Use config for physics
src/scene/scenes/*.js          # Use config for scenes
src/scene/gen/procedural/grid/constants.js  # Load from config
game.js                        # Initialize ConfigManager
```

**Tasks:**
1. Refactor GLOBALS.js to load from ConfigManager
2. Update combat system to use config
3. Update movement system to use config
4. Update character system to use config
5. Update camera system to use config
6. Update physics system to use config
7. Update all scenes to use config
8. Update builder system to use config
9. Add lobby scene to SceneManager
10. Create lobby entry point

**Dependencies:**
- Phase 1, 2, 3

---

### Phase 5: Testing & Documentation (Week 9-10)

**Files to Create:**
```
docs/
  ├── ADMIN_PANEL_GUIDE.md     # Admin panel user guide
  ├── CONFIG_SCHEMA.md         # Configuration schema docs
  ├── LOBBY_GUIDE.md           # Lobby system guide
  └── API_REFERENCE.md         # ConfigManager API docs

tests/
  ├── config/
  │   ├── configManager.test.js
  │   └── validators.test.js
  └── integration/
      └── systemIntegration.test.js
```

**Tasks:**
1. Test all configuration options
2. Test admin panel functionality
3. Test lobby system
4. Test integration with game systems
5. Write admin panel documentation
6. Write configuration schema documentation
7. Write API reference
8. Create video tutorials (optional)

**Dependencies:**
- All previous phases

---

## Configuration Manager API

### Core Methods

```javascript
class ConfigManager {
  // Initialize with config directory path
  constructor(configPath = './config/');

  // Load all configuration files
  async loadAll();

  // Load specific config file
  async load(configName);

  // Get config value by path (e.g., 'combat.spells.fireball.damage')
  get(path);

  // Set config value by path
  set(path, value);

  // Validate config against schema
  validate(configName, configData);

  // Save config to file
  async save(configName);

  // Save all configs
  async saveAll();

  // Export all configs as JSON object
  exportAll();

  // Import configs from JSON object
  importAll(configData);

  // Reset config to default
  reset(configName);

  // Enable hot-reload (development mode)
  enableHotReload();

  // Disable hot-reload
  disableHotReload();

  // Subscribe to config changes
  onChange(configName, callback);
}
```

### Usage Examples

```javascript
// Initialize
const config = new ConfigManager('./config/');
await config.loadAll();

// Get values
const fireballDamage = config.get('combat.spells.fireball.damage');
const heroHealth = config.get('character.hero.health');

// Set values
config.set('combat.spells.fireball.damage', 10);
config.set('movement.normalSpeed', 100);

// Save changes
await config.save('combat');
await config.save('movement');

// Listen for changes (hot-reload)
config.onChange('combat', (newConfig) => {
  console.log('Combat config updated:', newConfig);
  // Update game systems
});

// Export all
const allConfigs = config.exportAll();
console.log(JSON.stringify(allConfigs, null, 2));
```

---

## Integration Points

### 1. GLOBALS.js Integration

**Current:**
```javascript
export const DEBUG = false;
export const FAST_RELOAD = false;
export const WEBGPU = false;
```

**After Integration:**
```javascript
import { ConfigManager } from './config/ConfigManager.js';

const config = await ConfigManager.getInstance();

export const DEBUG = config.get('global.debug');
export const FAST_RELOAD = config.get('global.fastReload');
export const WEBGPU = config.get('global.webGPU');
```

### 2. Combat System Integration

**Current (SPELLS.js):**
```javascript
export const SPELLS = {
  fireball: {
    name: "Fireball",
    effects: [{ type: "damage", value: 8 }],
    // ...
  }
};
```

**After Integration:**
```javascript
import { ConfigManager } from '../config/ConfigManager.js';

const config = await ConfigManager.getInstance();
export const SPELLS = config.get('combat.spells');
```

### 3. Movement System Integration

**Current (movement.js):**
```javascript
const normalSpeed = 80.0;
const sprintSpeed = 1.5;
const rollSpeed = 1.6;
```

**After Integration:**
```javascript
import { ConfigManager } from './config/ConfigManager.js';

const config = await ConfigManager.getInstance();
const normalSpeed = config.get('movement.normalSpeed');
const sprintSpeed = config.get('movement.sprintSpeed');
const rollSpeed = config.get('movement.rollSpeed');
```

### 4. Scene Manager Integration

**Current (SceneManager.js):**
```javascript
this.scenes = {
  night: createNight,
  day: createDay,
  // ...
};
```

**After Integration:**
```javascript
import { ConfigManager } from '../config/ConfigManager.js';

const config = await ConfigManager.getInstance();
const sceneConfigs = config.get('scenes');

this.scenes = {};
for (const [key, sceneConfig] of Object.entries(sceneConfigs)) {
  this.scenes[key] = sceneConfig;
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                             │
│  (Web Interface - Separate HTML Page)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Edit & Save
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONFIG FILES (JSON)                        │
│  /config/global.json, combat.json, movement.json, etc.      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Load on Init / Hot-Reload
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONFIG MANAGER                             │
│  - Loads all configs                                         │
│  - Validates against schemas                                 │
│  - Provides get/set API                                      │
│  - Handles hot-reload                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Provide Config Values
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GAME SYSTEMS                              │
│  GLOBALS.js, movement.js, combat/, character/, etc.          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Use Config Values
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   GAME RUNTIME                               │
│  Babylon.js scenes, physics, rendering, etc.                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      LOBBY SYSTEM                            │
│  (In-Game UI - Babylon.GUI)                                  │
│  - Scene selection                                           │
│  - Graphics presets                                          │
│  - Control scheme                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Apply Runtime Settings
                         ▼
                   [Start Game]
```

---

## Technical Considerations

### 1. File Loading Strategy

Since this is a pure JavaScript project without a build process:

**Option A: Fetch API (Recommended)**
```javascript
async loadConfig(configName) {
  const response = await fetch(`./config/${configName}.json`);
  const data = await response.json();
  return data;
}
```

**Option B: Dynamic Import (ES Modules)**
```javascript
// Convert JSON to .js module
export default {
  "debug": false,
  "fastReload": false
};

// Import
import globalConfig from './config/global.js';
```

**Recommendation:** Use Option A (Fetch API) for true JSON files, easier editing.

### 2. Hot-Reload Implementation

```javascript
class ConfigManager {
  enableHotReload() {
    // Poll for file changes every 2 seconds
    this.hotReloadInterval = setInterval(async () => {
      for (const configName of this.configNames) {
        const newConfig = await this.loadConfig(configName);
        const currentConfig = this.configs[configName];

        if (JSON.stringify(newConfig) !== JSON.stringify(currentConfig)) {
          console.log(`Config changed: ${configName}`);
          this.configs[configName] = newConfig;
          this.notifyListeners(configName, newConfig);
        }
      }
    }, 2000);
  }
}
```

### 3. Validation Strategy

```javascript
class Validator {
  validate(schema, data, path = '') {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];
      const currentPath = path ? `${path}.${key}` : key;

      // Required check
      if (rules.required && value === undefined) {
        errors.push(`${currentPath} is required`);
        continue;
      }

      // Type check
      if (value !== undefined && typeof value !== rules.type) {
        errors.push(`${currentPath} must be ${rules.type}`);
      }

      // Range check (for numbers)
      if (rules.type === 'number' && value !== undefined) {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${currentPath} must be >= ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${currentPath} must be <= ${rules.max}`);
        }
      }

      // Nested object validation
      if (rules.type === 'object' && rules.schema) {
        const nestedErrors = this.validate(rules.schema, value, currentPath);
        errors.push(...nestedErrors);
      }
    }

    return errors;
  }
}
```

### 4. Admin Panel Technology Stack

**Recommended:**
- **Framework:** Vanilla JavaScript (keep it simple, no build process)
- **UI Library:** None (pure HTML/CSS) or lightweight (Alpine.js, Petite Vue)
- **JSON Editor:** JSONEditor (optional, for advanced editing)
- **Styling:** CSS Grid + Flexbox
- **Icons:** Font Awesome or SVG icons

**Alternative (if build process is acceptable):**
- **Framework:** React or Vue.js
- **UI Library:** Material-UI or Vuetify
- **Build Tool:** Vite

### 5. Lobby System Technology

**Required:**
- **Babylon.GUI:** Already included in project
- **GUI Components:** StackPanel, Button, TextBlock, Image, ScrollViewer
- **3D Preview:** Separate camera and scene for character preview

---

## Security Considerations

### 1. Admin Panel Access

**Development Mode:**
- Admin panel accessible at `/admin/index.html`
- No authentication required (local development)

**Production Mode:**
- Admin panel should be removed or password-protected
- Use environment variable to enable/disable admin features
- Consider server-side authentication

### 2. Config File Validation

- Always validate config files before loading
- Reject invalid configs with clear error messages
- Provide default fallback values
- Log validation errors for debugging

### 3. User Input Sanitization

- Sanitize all user input in admin panel
- Prevent XSS attacks in text fields
- Validate file uploads (JSON only)
- Limit file sizes

---

## Performance Considerations

### 1. Config Loading

- Load configs asynchronously on game start
- Cache configs in memory (don't reload every frame)
- Use lazy loading for large configs
- Minimize config file sizes

### 2. Hot-Reload

- Only enable in development mode
- Use efficient change detection (hash comparison)
- Debounce file change events
- Limit polling frequency

### 3. Lobby System

- Preload lobby assets
- Use low-poly character model for preview
- Optimize GUI textures
- Minimize draw calls

---

## Future Enhancements

### Phase 6: Advanced Features (Optional)

1. **Multiplayer Configuration**
   - Server settings
   - Network configuration
   - Player limits

2. **Mod Support**
   - Custom config loading
   - Mod manager
   - Config merging

3. **Analytics Dashboard**
   - Track config changes
   - Performance metrics
   - Usage statistics

4. **Visual Scripting**
   - Node-based spell editor
   - Visual effect composer
   - Animation state machine editor

5. **Asset Manager**
   - Upload new models
   - Texture management
   - Shader editor

6. **Localization**
   - Multi-language support
   - Translation management
   - Language-specific configs

---

## Conclusion

This design document provides a comprehensive plan for implementing an admin panel and lobby system for the 3D Action RPG JavaScript project. The system is designed to be:

- **Modular:** Each component is independent and reusable
- **Extensible:** Easy to add new configuration categories
- **Developer-Friendly:** Hot-reload and validation for rapid iteration
- **User-Friendly:** Intuitive UI for both admin panel and lobby
- **Maintainable:** Clear separation of concerns and well-documented

The implementation can be done in phases, allowing for incremental development and testing. The configuration system provides a solid foundation for future enhancements and scalability.

---

## Quick Start Guide

### For Developers

1. **Start with Phase 1:** Implement ConfigManager
2. **Create sample configs:** Start with global.json and combat.json
3. **Test integration:** Update GLOBALS.js to use ConfigManager
4. **Build admin panel:** Create basic HTML interface
5. **Iterate:** Add more configs and features incrementally

### For Content Creators

1. **Open admin panel:** Navigate to `/admin/index.html`
2. **Select category:** Choose what you want to edit
3. **Make changes:** Edit values in the UI
4. **Save:** Click save button
5. **Test in game:** Reload game to see changes (or use hot-reload)

---

## Support & Resources

- **Documentation:** See `/docs` folder for detailed guides
- **Examples:** Check `/config` folder for sample configurations
- **API Reference:** See `API_REFERENCE.md` for ConfigManager API
- **Issues:** Report bugs and feature requests on GitHub


