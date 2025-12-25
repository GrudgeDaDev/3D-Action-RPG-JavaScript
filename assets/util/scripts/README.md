# Game Scripts Directory

## Overview

This directory contains all game scripts organized by category. Scripts can be JavaScript modules, Lua scripts, or JSON behavior definitions.

## Directory Structure

```
assets/util/scripts/
├── README.md                 # This file
├── behaviors/                # AI behaviors and state machines
│   ├── enemy/               # Enemy AI scripts
│   ├── npc/                 # NPC behavior scripts
│   └── player/              # Player ability scripts
├── abilities/                # Character abilities and skills
│   ├── warrior/             # Warrior class abilities
│   ├── mage/                # Mage class abilities
│   └── rogue/               # Rogue class abilities
├── weapons/                  # Weapon behavior scripts
│   ├── melee/               # Melee weapon scripts
│   ├── ranged/              # Ranged weapon scripts
│   └── magic/               # Magic weapon scripts
├── quests/                   # Quest logic and dialogue
│   ├── main/                # Main story quests
│   ├── side/                # Side quests
│   └── daily/               # Daily/repeatable quests
├── events/                   # World events and triggers
│   ├── cutscenes/           # Cutscene scripts
│   ├── triggers/            # Trigger zone scripts
│   └── spawners/            # Enemy spawner scripts
├── ui/                       # UI behavior scripts
│   ├── menus/               # Menu logic
│   ├── hud/                 # HUD updates
│   └── dialogs/             # Dialog systems
└── core/                     # Core game systems
    ├── utils.js             # Utility functions
    ├── constants.js         # Game constants
    └── helpers.js           # Helper functions
```

## Script Types

### 1. JavaScript Modules (.js)
**Best for**: Core game logic, performance-critical code
```javascript
// Example: assets/util/scripts/abilities/warrior/slash.js
export class SlashAbility {
    constructor(character) {
        this.character = character;
        this.damage = 50;
        this.cooldown = 2000;
    }
    
    execute() {
        // Ability logic
    }
}
```

### 2. Lua Scripts (.lua)
**Best for**: Modding, data-driven behaviors, hot-reloading
```lua
-- Example: assets/util/scripts/weapons/melee/sword.lua
local Sword = {
    damage = 25,
    attackSpeed = 1.5,
    range = 2.0
}

function Sword:attack(target)
    dealDamage(target, self.damage)
    playAnimation("sword_slash")
end

return Sword
```

### 3. JSON Behavior Trees (.json)
**Best for**: AI behaviors, quest logic, dialogue trees
```json
{
    "type": "sequence",
    "children": [
        { "type": "condition", "check": "playerInRange" },
        { "type": "action", "do": "moveToPlayer" },
        { "type": "action", "do": "attack" }
    ]
}
```

## Usage

### Loading JavaScript Scripts
```javascript
import { SlashAbility } from './assets/util/scripts/abilities/warrior/slash.js';

const ability = new SlashAbility(player);
ability.execute();
```

### Loading Lua Scripts (requires ScriptManager)
```javascript
import { ScriptManager } from './src/scripting/ScriptManager.js';

const scriptManager = new ScriptManager();
await scriptManager.init();
await scriptManager.loadScript('weapons', 'sword.lua');
scriptManager.runScript('weapons/sword.lua');
```

### Loading JSON Behaviors
```javascript
const behavior = await fetch('./assets/util/scripts/behaviors/enemy/goblin.json')
    .then(r => r.json());
```

## Scripting Guidelines

### DO:
- ✅ Use descriptive file names
- ✅ Add comments explaining complex logic
- ✅ Export classes/functions properly
- ✅ Keep scripts focused on single responsibility
- ✅ Use constants for magic numbers
- ✅ Handle errors gracefully

### DON'T:
- ❌ Hardcode values (use config files)
- ❌ Create circular dependencies
- ❌ Mix multiple concerns in one script
- ❌ Forget to dispose resources
- ❌ Use global variables

## Performance Tips

1. **Cache References** - Don't look up objects every frame
2. **Use Object Pooling** - Reuse objects instead of creating new ones
3. **Avoid Heavy Computations** - Move to worker threads if needed
4. **Lazy Load** - Only load scripts when needed
5. **Minify Production** - Use build tools to optimize

## Debugging

### Enable Script Logging
```javascript
window.DEBUG_SCRIPTS = true;
```

### Hot Reload Scripts (Development)
```javascript
scriptManager.reloadScript('weapons/sword.lua');
```

### Script Errors
Check browser console for:
- Syntax errors
- Runtime errors
- Missing dependencies

## Integration with Game Systems

### Enemy AI
```javascript
// In EnemyManager
const behavior = await scriptManager.loadScript('behaviors', 'goblin.lua');
enemy.setBehavior(behavior);
```

### Player Abilities
```javascript
// In AbilityManager
import { FireballAbility } from './assets/util/scripts/abilities/mage/fireball.js';
player.addAbility(new FireballAbility(player));
```

### Quest System
```javascript
// In QuestManager
const quest = await fetch('./assets/util/scripts/quests/main/tutorial.json')
    .then(r => r.json());
questManager.addQuest(quest);
```

## File Naming Conventions

- **JavaScript**: `camelCase.js` (e.g., `slashAbility.js`)
- **Lua**: `snake_case.lua` (e.g., `sword_attack.lua`)
- **JSON**: `kebab-case.json` (e.g., `goblin-behavior.json`)

## Version Control

- ✅ Commit all scripts to version control
- ✅ Use meaningful commit messages
- ✅ Review script changes carefully
- ❌ Don't commit sensitive data (API keys, passwords)

## Related Documentation

- `docs/SCRIPTING_GUIDE.md` - Detailed scripting guide
- `src/scripting/README.md` - ScriptManager documentation
- `docs/API_REFERENCE.md` - Game API reference

