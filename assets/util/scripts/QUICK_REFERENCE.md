# 🎮 Scripting Quick Reference

## 🚀 Quick Start

### Initialize
```javascript
import { scriptManager } from './src/scripting/ScriptManager.js';
await scriptManager.init({ hotReload: true });
```

### Load Script
```javascript
const script = await scriptManager.loadAbility('warrior/slash.js');
const { SlashAbility } = script.data;
```

## 📁 Script Locations

| Type | Path | Format |
|------|------|--------|
| **Abilities** | `assets/util/scripts/abilities/` | `.js` |
| **Behaviors** | `assets/util/scripts/behaviors/` | `.json` |
| **Weapons** | `assets/util/scripts/weapons/` | `.js` |
| **Quests** | `assets/util/scripts/quests/` | `.json` |
| **Events** | `assets/util/scripts/events/` | `.js` |
| **Core Utils** | `assets/util/scripts/core/` | `.js` |

## 🛠️ Core Utilities

### Import Utils
```javascript
const utils = await scriptManager.loadScript('core', 'utils.js');
const { distance3D, lerp, randomInt } = utils.data;
```

### Available Functions
```javascript
// Math
clamp(value, min, max)
lerp(start, end, t)
distance3D(pos1, pos2)
distance2D(pos1, pos2)

// Random
randomInt(min, max)
randomFloat(min, max)
randomElement(array)
shuffleArray(array)

// Timing
wait(ms)
debounce(func, wait)
throttle(func, limit)

// Angles
degToRad(degrees)
radToDeg(radians)
normalizeAngle(angle)

// Formatting
formatNumber(num)
formatTime(seconds)
```

## 📊 Constants

### Import Constants
```javascript
const constants = await scriptManager.loadScript('core', 'constants.js');
const { COMBAT, STATS, ANIMATIONS } = constants.data;
```

### Available Constants
```javascript
COMBAT.BASE_DAMAGE          // 10
COMBAT.CRITICAL_CHANCE      // 0.15
COMBAT.ATTACK_RANGE         // 3.0

STATS.BASE_HEALTH           // 100
STATS.BASE_MANA             // 50
STATS.BASE_SPEED            // 5.0

ANIMATIONS.IDLE             // 'idle'
ANIMATIONS.ATTACK_1         // 'attack1'
ANIMATIONS.DEATH            // 'death'

COOLDOWNS.BASIC_ATTACK      // 1000ms
COOLDOWNS.SPECIAL_ATTACK    // 3000ms

DAMAGE_TYPES.PHYSICAL       // 'physical'
DAMAGE_TYPES.FIRE           // 'fire'
```

## ⚔️ Creating Abilities

### Template
```javascript
import { COMBAT, COOLDOWNS } from '../../core/constants.js';
import { distance3D } from '../../core/utils.js';

export class MyAbility {
    constructor(character) {
        this.character = character;
        this.damage = 50;
        this.range = 3.0;
        this.cooldown = 2000;
        this.lastUsed = 0;
    }

    canUse() {
        const now = Date.now();
        if (now - this.lastUsed < this.cooldown) {
            return { canUse: false, reason: 'On cooldown' };
        }
        return { canUse: true };
    }

    async execute(target) {
        if (!this.canUse().canUse) return false;
        
        this.lastUsed = Date.now();
        target.takeDamage(this.damage);
        
        return true;
    }
}
```

## 🤖 Creating AI Behaviors

### JSON Behavior Tree
```json
{
    "name": "Enemy AI",
    "behaviorTree": {
        "type": "selector",
        "children": [
            {
                "type": "sequence",
                "children": [
                    { "type": "condition", "check": "playerInRange" },
                    { "type": "action", "do": "attack" }
                ]
            },
            {
                "type": "action",
                "do": "patrol"
            }
        ]
    },
    "stats": {
        "health": 100,
        "damage": 20
    }
}
```

## 📜 ScriptManager API

### Loading
```javascript
// By category
await scriptManager.loadAbility('warrior/slash.js')
await scriptManager.loadBehavior('enemy/goblin.json')
await scriptManager.loadWeapon('melee/sword.js')
await scriptManager.loadQuest('main/tutorial.json')

// Generic
await scriptManager.loadScript('category', 'filename.js')
```

### Getting Scripts
```javascript
// Get specific script
const script = scriptManager.getScript('abilities/warrior/slash.js')

// Get all scripts
const all = scriptManager.getAllScripts()

// Get by category
const abilities = scriptManager.getScriptsByCategory('abilities')
```

### Management
```javascript
// Reload script
await scriptManager.reloadScript('abilities/warrior/slash.js')

// Unload script
scriptManager.unloadScript('abilities/warrior/slash.js')

// Clear all
scriptManager.clearAll()

// Cleanup
scriptManager.dispose()
```

## 🎯 Common Patterns

### Character with Abilities
```javascript
// Load ability
const script = await scriptManager.loadAbility('warrior/slash.js');
const { SlashAbility } = script.data;

// Create instance
const slash = new SlashAbility(player);

// Add to character
player.abilities = [slash];

// Use ability
await slash.execute(target);
```

### Enemy with AI
```javascript
// Load behavior
const script = await scriptManager.loadBehavior('enemy/goblin.json');
const behavior = script.data;

// Apply to enemy
enemy.behavior = behavior.behaviorTree;
enemy.stats = behavior.stats;
enemy.loot = behavior.loot;
```

### Using Utils
```javascript
// Load utils
const utils = await scriptManager.loadScript('core', 'utils.js');
const { distance3D, randomInt } = utils.data;

// Use in game logic
if (distance3D(player.pos, enemy.pos) < 5) {
    const damage = randomInt(10, 20);
    enemy.takeDamage(damage);
}
```

## 🔥 Hot Reload (Development)

```javascript
// Enable hot reload
await scriptManager.init({ hotReload: true });

// After editing a script file
await scriptManager.reloadScript('abilities/warrior/slash.js');

// Re-create instances with new code
const script = scriptManager.getScript('abilities/warrior/slash.js');
const { SlashAbility } = script.data;
player.abilities[0] = new SlashAbility(player);
```

## ⚠️ Common Issues

### Script Not Loading
```javascript
// Check path is correct
await scriptManager.loadScript('abilities', 'warrior/slash.js')  // ❌ Wrong
await scriptManager.loadAbility('warrior/slash.js')              // ✅ Correct
```

### Module Not Found
```javascript
// Make sure path starts from assets/util/scripts/
import { utils } from '../../core/utils.js'  // ✅ Relative to script
```

### Circular Dependencies
```javascript
// Don't import scripts that import each other
// Use dependency injection instead
class MyAbility {
    constructor(character, utils) {  // ✅ Pass utils as parameter
        this.utils = utils;
    }
}
```

## 📚 Full Documentation

- **Complete Guide**: `docs/SCRIPTING_SYSTEM_GUIDE.md`
- **Setup Summary**: `SCRIPTING_SETUP_SUMMARY.md`
- **Examples**: `examples/scripting-integration-example.js`
- **Directory Guide**: `assets/util/scripts/README.md`

## 🤝 Need Help?

1. Check the examples in `examples/scripting-integration-example.js`
2. Read the full guide in `docs/SCRIPTING_SYSTEM_GUIDE.md`
3. Look at example scripts in `assets/util/scripts/`
4. Ask for help converting C# or other scripts!

