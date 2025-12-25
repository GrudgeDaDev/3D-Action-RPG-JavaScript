# ⚔️ World of Warcraft UI System & Content Pipeline

## 🎮 WoW-Style UI System

### What You Got

A **complete World of Warcraft clone UI** with:

1. **Player Unit Frame** (top-left)
   - Health bar with color coding (green → orange → red)
   - Mana bar (blue)
   - Player name and level
   - Portrait area

2. **Target Unit Frame** (next to player frame)
   - Enemy/NPC health bar
   - Target name and level
   - Shows when you select a target
   - Hides when no target

3. **Action Bars** (bottom of screen)
   - 2 bars × 12 slots = 24 abilities
   - Hotkey labels on each slot
   - Cooldown overlays
   - Main bar: 1-9, 0, -, =
   - Secondary bar: Shift+1-9, Shift+0, Shift+-, Shift+=

4. **Cast Bar** (bottom center, above action bars)
   - Shows spell name
   - Progress bar animation
   - Auto-hides when done

5. **Buffs/Debuffs** (top-right of player frame)
   - Container for buff icons
   - Ready for expansion

6. **Editable Hotkeys**
   - Saved to localStorage
   - Customizable per slot
   - Persistent across sessions

---

## 🚀 How to Use the WoW UI

### In Any Game Scene

```javascript
import { WoWUI } from '../ui/wowUI.js';

// Create the UI
const wowUI = new WoWUI(scene);

// Store globally
window.WOW_UI = wowUI;

// Update player stats
wowUI.updatePlayer({
    health: 75,
    maxHealth: 100,
    mana: 50,
    maxMana: 100,
    level: 5,
    name: "YourName"
});

// Set a target
wowUI.setTarget({
    name: "Slime",
    level: 3,
    health: 80,
    maxHealth: 100
});

// Start casting a spell
wowUI.startCast("Fireball", 2000); // 2 second cast

// Show/hide UI
wowUI.show();
wowUI.hide();
```

### Example: Integrate into Night Scene

```javascript
// In src/scenes/night.js

import { WoWUI } from '../ui/wowUI.js';

export async function createNight(scene, canvas, sceneManager) {
    // ... existing scene setup ...
    
    // Create WoW UI
    const wowUI = new WoWUI(scene);
    window.WOW_UI = wowUI;
    
    // Set initial player stats
    wowUI.updatePlayer({
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        level: 1,
        name: "Hero"
    });
    
    // When player takes damage
    // wowUI.updatePlayer({ health: currentHealth });
    
    // When player selects enemy
    // wowUI.setTarget({ name: "Slime", level: 3, health: 100, maxHealth: 100 });
}
```

---

## 📦 Content Pipeline

### 1. Adding Enemy Units

#### Step 1: Add Enemy Model

```
1. Place .glb file in: assets/characters/enemy/[enemy-name]/
   Example: assets/characters/enemy/goblin/Goblin.glb

2. Add thumbnail: assets/thumbnails/enemies/goblin.jpg
```

#### Step 2: Create Enemy Config

```json
// In config/enemies.json (create if doesn't exist)
{
  "goblin": {
    "name": "Goblin Warrior",
    "model": "characters/enemy/goblin/Goblin.glb",
    "health": 150,
    "mana": 50,
    "level": 5,
    "damage": 15,
    "speed": 3.5,
    "aggro": {
      "range": 10,
      "duration": 30
    },
    "loot": {
      "gold": [5, 15],
      "items": ["goblin_dagger", "leather_scraps"]
    },
    "animations": {
      "idle": "Idle",
      "walk": "Walk",
      "attack": "Attack",
      "death": "Death"
    }
  }
}
```

#### Step 3: Create Enemy Class

```javascript
// In src/character/enemies/Goblin.js

import { Enemy } from '../Enemy.js';

export class Goblin extends Enemy {
    constructor(scene, position) {
        super(scene, {
            name: "Goblin Warrior",
            modelPath: "characters/enemy/goblin/Goblin.glb",
            health: 150,
            level: 5,
            damage: 15
        });
        
        this.spawn(position);
    }
    
    // Custom AI behavior
    update(deltaTime) {
        super.update(deltaTime);
        // Custom goblin behavior
    }
}
```

#### Step 4: Spawn in Scene

```javascript
// In your scene file (e.g., src/scenes/night.js)

import { Goblin } from '../character/enemies/Goblin.js';

// Spawn goblin
const goblin = new Goblin(scene, new BABYLON.Vector3(10, 0, 10));

// Add to enemy list
enemies.push(goblin);
```

---

### 2. Adding Player Characters/Classes

#### Step 1: Add Character Model

```
1. Place model: assets/characters/player/[class-name]/
   Example: assets/characters/player/warrior/Warrior.glb

2. Add icon: assets/ui/class-icons/warrior.png
```

#### Step 2: Create Character Class

```javascript
// In src/character/classes/Warrior.js

export class Warrior {
    constructor(scene) {
        this.scene = scene;
        this.stats = {
            health: 200,
            maxHealth: 200,
            mana: 50,
            maxMana: 50,
            stamina: 150,
            maxStamina: 150,
            strength: 25,
            agility: 10,
            intellect: 5
        };
        
        this.abilities = [
            { name: "Heroic Strike", damage: 50, manaCost: 10, cooldown: 5 },
            { name: "Shield Bash", damage: 30, manaCost: 15, cooldown: 8 },
            { name: "Charge", damage: 40, manaCost: 20, cooldown: 12 }
        ];
    }
    
    useAbility(abilityIndex) {
        const ability = this.abilities[abilityIndex];
        if (this.stats.mana >= ability.manaCost) {
            this.stats.mana -= ability.manaCost;
            // Cast ability
            window.WOW_UI.startCast(ability.name, 1500);
            return true;
        }
        return false;
    }
}
```

---

### 3. Adding New Scenes

#### Step 1: Add to Config

```json
// In config/scenes.json

{
  "dungeon": {
    "name": "Dark Dungeon",
    "description": "A dangerous underground dungeon",
    "creator": "createDungeon",
    "spawnPoint": { "x": 0, "y": 5, "z": 0 },
    "levelSize": 5000,
    "difficulty": "hard",
    "enabled": true,
    "showInLobby": true,
    "thumbnail": "./assets/thumbnails/dungeon.jpg",
    "models": [
      "env/dungeon/walls.glb",
      "characters/enemy/skeleton/Skeleton.glb"
    ]
  }
}
```

#### Step 2: Create Scene File

```javascript
// In src/scenes/dungeon.js

import { WoWUI } from '../ui/wowUI.js';

export async function createDungeon(scene, canvas, sceneManager) {
    console.log('🏰 Creating Dungeon Scene...');
    
    // Setup camera
    const camera = new BABYLON.ArcRotateCamera(
        "dungeonCamera",
        0, Math.PI / 3, 20,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    
    // Lighting
    const light = new BABYLON.HemisphericLight(
        "dungeonLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.3; // Dark dungeon
    
    // Create WoW UI
    const wowUI = new WoWUI(scene);
    window.WOW_UI = wowUI;
    
    // Load environment
    // ... load dungeon models ...
    
    // Spawn enemies
    // ... spawn skeletons, etc ...
    
    console.log('✅ Dungeon Scene Created');
}
```

#### Step 3: Register Scene

```javascript
// In src/scene/SceneManager.js

import { createDungeon } from '../scenes/dungeon.js';

// Add to sceneCreators
this.sceneCreators = {
    // ... existing scenes ...
    dungeon: createDungeon
};
```

---

## 🎯 Quick Reference

### File Structure

```
assets/
├── characters/
│   ├── player/
│   │   ├── warrior/Warrior.glb
│   │   ├── mage/Mage.glb
│   │   └── rogue/Rogue.glb
│   └── enemy/
│       ├── goblin/Goblin.glb
│       ├── skeleton/Skeleton.glb
│       └── dragon/Dragon.glb
├── env/
│   ├── dungeon/
│   ├── forest/
│   └── town/
└── thumbnails/
    ├── enemies/
    └── scenes/

src/
├── character/
│   ├── classes/
│   │   ├── Warrior.js
│   │   ├── Mage.js
│   │   └── Rogue.js
│   └── enemies/
│       ├── Goblin.js
│       ├── Skeleton.js
│       └── Dragon.js
├── scenes/
│   ├── lobby.js
│   ├── night.js
│   ├── dungeon.js
│   └── town.js
└── ui/
    ├── wowUI.js
    ├── lobbyUI.js
    └── gameMenu.js

config/
├── scenes.json
├── enemies.json (create this)
└── classes.json (create this)
```

---

## ✅ Next Steps

1. **Fix Lobby UI** - Debug why buttons aren't showing
2. **Integrate WoW UI** - Add to night scene first
3. **Test UI** - Make sure all frames work
4. **Add Enemies** - Follow pipeline above
5. **Add Classes** - Create warrior/mage/rogue
6. **Create Scenes** - Build dungeon, town, etc.

**The WoW UI is ready to use!** 🎮⚔️

