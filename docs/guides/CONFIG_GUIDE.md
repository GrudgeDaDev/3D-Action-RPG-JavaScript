# Configuration Guide

Complete guide to all configuration files and their options.

---

## Table of Contents

1. [Global Settings](#global-settings)
2. [Scenes](#scenes)
3. [Combat](#combat)
4. [Movement & Controls](#movement--controls)
5. [Character](#character)
6. [Camera](#camera)
7. [Physics](#physics)
8. [Graphics](#graphics)
9. [Builder](#builder)
10. [Assets](#assets)
11. [AI Material Generator](#ai-material-generator)

---

## Global Settings

**File**: `config/global.json`

### Basic Settings

```json
{
  "debug": false,              // Enable debug mode
  "useWebGPU": false,          // Use WebGPU instead of WebGL
  "isMobile": false            // Mobile device detection
}
```

### Developer Settings

```json
{
  "developer": {
    "hotReload": true,         // Enable hot-reload for configs
    "showFPS": true,           // Show FPS counter
    "showDebugInfo": true,     // Show debug information
    "logLevel": "info"         // Logging level: debug, info, warn, error
  }
}
```

**Usage**:

- Set `debug: true` for development
- Enable `hotReload` to see config changes instantly
- Use `showFPS` to monitor performance

---

## Scenes

**File**: `config/scenes.json`

### Scene Definition

```json
{
  "id": "outdoor",             // Unique scene identifier
  "name": "Outdoor Adventure", // Display name
  "description": "...",        // Scene description
  "difficulty": "Medium",      // Easy, Medium, Hard, Expert
  "enabled": true,             // Enable/disable scene
  "showInLobby": true,         // Show in lobby menu
  "spawnPoint": {              // Player spawn location
    "x": 0,
    "y": 2,
    "z": 0
  }
}
```

### Available Scenes

1. **Lobby** - Main menu
2. **Outdoor** - Open world
3. **Night** - Dark environment
4. **Day** - Bright terrain
5. **Town** - Urban area
6. **Inn** - Interior
7. **Room** - Small room with GI
8. **Underground** - Cave system
9. **Builder** - Level editor

**Usage**:

- Set `enabled: false` to disable a scene
- Set `showInLobby: false` to hide from menu
- Adjust `spawnPoint` for player start position

---

## Combat

**File**: `config/combat.json`

### Spells

```json
{
  "fireball": {
    "damage": 25,              // Base damage
    "manaCost": 15,            // Mana required
    "cooldown": 2.0,           // Cooldown in seconds
    "range": 30,               // Maximum range
    "speed": 20,               // Projectile speed
    "radius": 2                // Area of effect
  }
}
```

### Effects

```json
{
  "damage": {
    "enabled": true,
    "multiplier": 1.0,         // Damage multiplier
    "critChance": 0.1,         // 10% crit chance
    "critMultiplier": 2.0      // 2x damage on crit
  }
}
```

### Weapons

```json
{
  "sword": {
    "damage": 15,
    "attackSpeed": 1.0,
    "range": 2.5,
    "durability": 100
  }
}
```

**Usage**:

- Adjust `damage` values for balance
- Modify `cooldown` for spell frequency
- Change `critChance` for combat variety

---

## Movement & Controls

**File**: `config/movement.json`

### Keyboard Controls

```json
{
  "keyboard": {
    "forward": "w",
    "backward": "s",
    "left": "a",
    "right": "d",
    "jump": " ",               // Space key
    "sprint": "shift",
    "roll": "q",
    "interact": "e",
    "spell1": "1",
    "spell2": "2"
  }
}
```

### Movement Speeds

```json
{
  "speeds": {
    "normal": 5.0,             // Normal walk speed
    "sprint": 8.0,             // Sprint speed
    "roll": 12.0,              // Roll/dodge speed
    "jump": 8.0                // Jump force
  }
}
```

### Gamepad

```json
{
  "gamepad": {
    "enabled": true,
    "deadzone": 0.15,          // Stick deadzone
    "sensitivity": 1.0,        // Camera sensitivity
    "vibration": true          // Haptic feedback
  }
}
```

**Usage**:

- Customize key bindings
- Adjust movement speeds for gameplay feel
- Configure gamepad sensitivity

---

## Character

**File**: `config/character.json`

### Hero Configuration

```json
{
  "hero": {
    "model": "hero.glb",
    "health": 100,
    "maxHealth": 100,
    "mana": 100,
    "maxMana": 100,
    "stamina": 100,
    "maxStamina": 100,
    "level": 1,
    "experience": 0
  }
}
```

### Stats

```json
{
  "stats": {
    "strength": 10,            // Physical damage
    "intelligence": 10,        // Magic damage
    "dexterity": 10,           // Attack speed
    "vitality": 10,            // Health
    "wisdom": 10               // Mana
  }
}
```

### Enemies

```json
{
  "slime": {
    "health": 30,
    "damage": 5,
    "speed": 2.0,
    "attackRange": 1.5,
    "detectionRange": 10
  }
}
```

**Usage**:

- Balance character stats
- Adjust enemy difficulty
- Modify health/mana pools

---

## Camera

**File**: `config/camera.json`

### Camera Settings

```json
{
  "type": "ArcRotateCamera",   // Camera type
  "position": {
    "radius": 10,              // Distance from target
    "alpha": 0,                // Horizontal rotation
    "beta": 1.2                // Vertical angle
  },
  "limits": {
    "minRadius": 5,            // Min zoom
    "maxRadius": 20,           // Max zoom
    "minBeta": 0.1,            // Min vertical angle
    "maxBeta": 1.5             // Max vertical angle
  }
}
```

### Camera Behavior

```json
{
  "smoothing": 0.1,            // Camera smoothing
  "collisions": true,          // Enable collision
  "followPlayer": true,        // Follow player
  "rotationSpeed": 0.01        // Rotation sensitivity
}
```

**Usage**:

- Adjust `radius` for camera distance
- Modify `limits` for zoom range
- Change `smoothing` for camera feel

---

## Physics

**File**: `config/physics.json`

### World Physics

```json
{
  "gravity": {
    "x": 0,
    "y": -9.81,                // Earth gravity
    "z": 0
  },
  "timeStep": 0.016,           // 60 FPS
  "substeps": 1
}
```

### Character Physics

```json
{
  "character": {
    "mass": 70,                // kg
    "friction": 0.5,
    "restitution": 0.0,        // Bounciness
    "linearDamping": 0.1,
    "angularDamping": 0.9
  }
}
```

**Usage**:

- Adjust `gravity.y` for jump feel
- Modify `mass` for physics interactions
- Change `friction` for ground feel

---

## Graphics

**File**: `config/graphics.json`

### Post-Processing

```json
{
  "postProcessing": {
    "msaa": {
      "enabled": true,
      "samples": 4             // 2, 4, 8, 16
    },
    "fxaa": {
      "enabled": true
    },
    "bloom": {
      "enabled": true,
      "threshold": 0.8,
      "weight": 0.3,
      "kernel": 64
    }
  }
}
```

### Image Processing

```json
{
  "imageProcessing": {
    "contrast": 1.0,           // 0.0 - 2.0
    "exposure": 1.0,           // 0.0 - 2.0
    "toneMappingEnabled": true,
    "toneMappingType": "ACES"  // ACES, Reinhard, Hable
  }
}
```

### Quality Presets

```json
{
  "presets": {
    "low": {
      "msaa": 0,
      "shadows": false,
      "bloom": false
    },
    "ultra": {
      "msaa": 8,
      "shadows": true,
      "bloom": true
    }
  }
}
```

**Usage**:

- Use presets for quick quality changes
- Adjust individual effects for fine-tuning
- Disable effects for better performance

---

## Builder

**File**: `config/builder.json`

### Grid Settings

```json
{
  "grid": {
    "size": 100,               // Grid size
    "cellSize": 1,             // Cell size in units
    "showGrid": true,          // Show grid lines
    "snapToGrid": true         // Snap objects to grid
  }
}
```

### Tools

```json
{
  "tools": {
    "brush": {
      "size": 1,
      "strength": 1.0
    },
    "eraser": {
      "size": 1
    }
  }
}
```

**Usage**:

- Adjust `cellSize` for precision
- Enable `snapToGrid` for alignment
- Modify tool sizes for editing

---

## Assets

**File**: `config/assets.json`

### Asset Paths

```json
{
  "characters": {
    "hero": "assets/models/hero.glb",
    "slime": "assets/models/slime.glb"
  },
  "weapons": {
    "sword": "assets/models/sword.glb"
  },
  "environments": {
    "skybox": "assets/textures/skybox/"
  }
}
```

**Usage**:

- Update paths when moving assets
- Add new asset references
- Organize asset locations

---

## AI Material Generator

**Files**: `src/ai/NMEAgent.js`, `src/ui/MaterialPanel.js`

The Material Forge uses Babylon.js Node Material Editor (NME) to generate PBR materials from natural language descriptions.

### Opening the Material Panel

Press **M** key anywhere in the game to open/close the Material Panel.

### Using the AI Chat

```
"shiny gold metal"           → Metallic gold material
"glowing blue crystal"       → Emissive crystal effect
"weathered stone with moss"  → Textured stone
"animated lava flow"         → Animated emissive material
```

### Material Templates

Pre-built templates are available:

| Template | Description | Complexity |
|----------|-------------|------------|
| `basic` | Simple diffuse color | ★☆☆☆☆ |
| `metallic` | Metal with reflections | ★★☆☆☆ |
| `glass` | Transparent glass | ★★★☆☆ |
| `emissive` | Glowing material | ★★☆☆☆ |
| `hologram` | Sci-fi holographic | ★★★★☆ |
| `water` | Animated water | ★★★★★ |
| `lava` | Animated lava | ★★★★★ |
| `dissolve` | Disintegration effect | ★★★★☆ |

### Programmatic Usage

```javascript
import { NMEAgent, MATERIAL_TEMPLATES } from './src/ai/NMEAgent.js';

// Create agent
const agent = new NMEAgent(scene);

// Generate from description
const material = await agent.generateMaterial("shiny red plastic");
mesh.material = material;

// Use template
const metalMat = await agent.generateMaterial("gold metallic");

// Export/Import
const json = agent.exportToJSON(material);
const imported = agent.importFromJSON(json, "MySavedMaterial");
```

### Material Panel Integration

```javascript
import { getMaterialPanel } from './src/ui/MaterialPanel.js';

const panel = getMaterialPanel(scene, {
    hotkey: 'm',
    onMaterialGenerated: (material) => {
        console.log('Generated:', material.name);
    },
    onMaterialApplied: (material, mesh) => {
        console.log('Applied to:', mesh.name);
    }
});

// Open programmatically
panel.open();

// Set target mesh
panel.setTargetMesh(selectedMesh);
```

**Usage Tips**:

- Be descriptive: "rough weathered bronze with green patina"
- Mention effects: "glowing", "animated", "transparent"
- Specify colors: "deep blue", "burnt orange", "chrome silver"
- Save materials to library for reuse

---

## Tips & Best Practices

### Performance

- Start with "Low" or "Medium" graphics preset
- Disable bloom and shadows if needed
- Reduce MSAA samples

### Development

- Enable `debug` and `hotReload` in global.json
- Use `showFPS` to monitor performance
- Check browser console for errors

### Balance

- Test combat values in-game
- Adjust movement speeds gradually
- Balance enemy stats with player stats

### Organization

- Keep related settings together
- Use descriptive names
- Comment complex configurations

---

## Need Help?

- Check `QUICK_START.md` for basic usage
- See `PHASE1_COMPLETE.md` for implementation details
- Use Admin Panel for visual editing
