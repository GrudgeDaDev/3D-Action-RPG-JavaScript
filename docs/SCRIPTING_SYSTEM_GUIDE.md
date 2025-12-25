# Scripting System Guide

## Overview

This game uses a **JavaScript-based scripting system** with support for multiple script types. The game is built with Babylon.js (JavaScript), not Unity (C#), so native C# scripting is not supported.

## ❌ C# Scripting - NOT Supported

### Why C# Doesn't Work:
- This is a **JavaScript/Babylon.js** game, not Unity
- Runs in web browsers (JavaScript environment)
- No .NET runtime available

### Alternatives to C#:

#### 1. ✅ **JavaScript Modules** (Recommended)
**Best for**: Core game logic, performance-critical code

```javascript
// Example: assets/util/scripts/abilities/warrior/slash.js
export class SlashAbility {
    constructor(character) {
        this.character = character;
        this.damage = 50;
    }
    
    execute() {
        // Ability logic
    }
}
```

**Pros**:
- Native to the game engine
- Best performance
- Full IDE support
- Type checking with JSDoc or TypeScript

**Cons**:
- Requires code knowledge
- No hot-reload without tools

#### 2. ✅ **Lua Scripting** (Available from Grudge-PlayGround)
**Best for**: Modding, data-driven behaviors, hot-reloading

```lua
-- Example: assets/util/scripts/weapons/sword.lua
local Sword = {
    damage = 25,
    attackSpeed = 1.5
}

function Sword:attack(target)
    dealDamage(target, self.damage)
end

return Sword
```

**Pros**:
- Hot-reload support
- Easier for modders
- Sandboxed execution
- Lightweight

**Cons**:
- Requires Lua engine (Fengari)
- Slightly slower than native JS
- Limited IDE support

#### 3. ✅ **JSON Behavior Trees** (Recommended for AI)
**Best for**: AI behaviors, quest logic, dialogue trees

```json
{
    "type": "sequence",
    "children": [
        { "type": "condition", "check": "playerInRange" },
        { "type": "action", "do": "attack" }
    ]
}
```

**Pros**:
- Easy to edit
- Visual tools possible
- No code required
- Safe (data-only)

**Cons**:
- Limited to predefined actions
- Not suitable for complex logic

#### 4. ⚠️ **WebAssembly (WASM)** (Advanced)
**Best for**: Performance-critical algorithms

You *could* compile C# to WebAssembly using Blazor, but this is:
- Very complex to set up
- Overkill for most use cases
- Not recommended for game scripts

## ✅ Recommended Scripting Approach

### For Your Game:

1. **Core Systems** → JavaScript modules
2. **AI Behaviors** → JSON behavior trees
3. **Abilities/Skills** → JavaScript classes
4. **Quests** → JSON data
5. **Modding** → Lua scripts (if needed)

## 📁 Script Organization

```
assets/util/scripts/
├── core/                     # Core utilities
│   ├── utils.js             # Helper functions
│   └── constants.js         # Game constants
├── behaviors/                # AI behaviors
│   ├── enemy/               # Enemy AI (JSON)
│   └── npc/                 # NPC behaviors (JSON)
├── abilities/                # Character abilities
│   ├── warrior/             # Warrior skills (JS)
│   ├── mage/                # Mage spells (JS)
│   └── rogue/               # Rogue abilities (JS)
├── weapons/                  # Weapon behaviors
│   └── melee/               # Melee weapons (JS)
├── quests/                   # Quest definitions
│   └── main/                # Main quests (JSON)
└── events/                   # World events
    └── triggers/            # Trigger scripts (JS)
```

## 🔧 Using the ScriptManager

### Initialize
```javascript
import { scriptManager } from './src/scripting/ScriptManager.js';

await scriptManager.init({ hotReload: true });
```

### Load Scripts
```javascript
// Load JavaScript module
const abilityScript = await scriptManager.loadAbility('warrior/slash.js');
const SlashAbility = abilityScript.data.SlashAbility;

// Load JSON behavior
const behaviorScript = await scriptManager.loadBehavior('enemy/goblin.json');
const goblinBehavior = behaviorScript.data;

// Use the script
const slash = new SlashAbility(player);
await slash.execute(target);
```

### Hot Reload (Development)
```javascript
// Reload a script
await scriptManager.reloadScript('abilities/warrior/slash.js');
```

## 🐛 "Hinglish Phrase Detected" Warning

### What It Is:
This is a **FALSE POSITIVE** from your IDE (likely a language detection plugin).

### Why It Happens:
- IDE misidentifies JavaScript code as "Hinglish" (Hindi + English)
- Common with certain variable names or patterns
- Examples that trigger it:
  - `new Map()` - "Map" might be detected as Hindi word
  - `this.scene` - Pattern matching issue
  - Certain method names

### How to Fix:

#### Option 1: Disable the Warning
```json
// In VS Code settings.json
{
    "files.associations": {
        "*.js": "javascript"
    },
    "editor.quickSuggestions": {
        "other": true,
        "comments": false,
        "strings": false
    }
}
```

#### Option 2: Ignore Specific Files
Add to `.vscode/settings.json`:
```json
{
    "files.exclude": {
        "**/.history": true
    }
}
```

#### Option 3: Disable Language Detection
If you have a language detection extension:
1. Open VS Code Extensions
2. Find the language detection extension
3. Disable it or configure to ignore `.js` files

### Files Affected:
The warnings appear in `.history` folder files, which are:
- Backup/history files from Local History extension
- Safe to ignore
- Not part of your actual codebase

## 📦 Missing Packages for Scripting

### Current Dependencies:
Check `package.json` for:
```json
{
    "dependencies": {
        "@babylonjs/core": "^6.0.0",
        "@babylonjs/loaders": "^6.0.0"
    }
}
```

### Recommended Additions:

#### For Lua Scripting:
```bash
npm install fengari fengari-web
```

#### For TypeScript (Better IDE Support):
```bash
npm install --save-dev typescript @types/node
```

#### For Script Bundling:
```bash
npm install --save-dev esbuild
```

#### For Hot Module Replacement:
```bash
npm install --save-dev vite
```

### Install All Recommended:
```bash
npm install fengari fengari-web
npm install --save-dev typescript @types/node esbuild vite
```

## 🎯 Example: Complete Ability Script

```javascript
// assets/util/scripts/abilities/mage/fireball.js
import { COMBAT, COOLDOWNS } from '../../core/constants.js';
import { distance3D } from '../../core/utils.js';

export class FireballAbility {
    constructor(character) {
        this.character = character;
        this.damage = 80;
        this.range = 20.0;
        this.cooldown = 5000;
        this.manaCost = 30;
        this.lastUsed = 0;
    }

    canUse() {
        const now = Date.now();
        if (now - this.lastUsed < this.cooldown) {
            return false;
        }
        return this.character.mana >= this.manaCost;
    }

    async execute(target) {
        if (!this.canUse()) return false;

        // Consume mana
        this.character.mana -= this.manaCost;
        this.lastUsed = Date.now();

        // Create fireball projectile
        const fireball = this.createFireball();
        await this.launchFireball(fireball, target);

        return true;
    }

    createFireball() {
        const scene = this.character.scene;
        const fireball = BABYLON.MeshBuilder.CreateSphere('fireball', 
            { diameter: 1 }, scene);
        
        const material = new BABYLON.StandardMaterial('fireballMat', scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        fireball.material = material;
        
        fireball.position = this.character.position.clone();
        fireball.position.y += 2;
        
        return fireball;
    }

    async launchFireball(fireball, target) {
        const direction = target.position.subtract(fireball.position).normalize();
        const speed = 20;
        
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                fireball.position.addInPlace(direction.scale(speed * 0.016));
                
                // Check collision
                if (distance3D(fireball.position, target.position) < 1) {
                    target.takeDamage(this.damage);
                    fireball.dispose();
                    clearInterval(interval);
                    resolve();
                }
            }, 16);
        });
    }
}
```

## 📚 Next Steps

1. **Review Example Scripts** in `assets/util/scripts/`
2. **Read ScriptManager docs** in `src/scripting/ScriptManager.js`
3. **Share your C# scripts** - I can help convert them to JavaScript
4. **Install recommended packages** if needed
5. **Disable "Hinglish" warnings** in IDE settings

## 🤝 Need Help?

Share your C# scripts and I can:
- Convert them to JavaScript
- Create equivalent Lua scripts
- Design JSON behavior trees
- Set up proper script loading

