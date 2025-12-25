# Utilities - Grudge-PlayGround Integration

This directory contains utilities ported from the Grudge-PlayGround project to enhance the main 3D Action RPG.

## Directory Structure

```
utils/
├── core/                   # Engine-agnostic utilities
│   ├── EventEmitter.js    # Pub/sub event system
│   └── ObjectPool.js      # Object pooling for performance
├── cloud/                  # Cloud integration
│   └── PuterService.js    # Puter.js cloud platform integration
├── storage/                # Data persistence
│   └── GameStorageService.js  # Hybrid local/cloud storage
└── README.md              # This file
```

## Core Utilities

### EventEmitter.js
**Purpose**: Decoupled component communication via pub/sub pattern

**Usage**:
```javascript
import { EventEmitter } from './core/EventEmitter.js';

class GameManager extends EventEmitter {
    onPlayerDamage(amount) {
        this.emit('playerDamaged', { amount });
    }
}

const game = new GameManager();
game.on('playerDamaged', (data) => {
    console.log(`Player took ${data.amount} damage!`);
});
```

**Benefits**:
- Loose coupling between components
- Easy to add/remove listeners
- Error handling built-in
- One-time listeners with `once()`

---

### ObjectPool.js
**Purpose**: Reuse objects instead of creating/destroying them

**Usage**:
```javascript
import { ObjectPool } from './core/ObjectPool.js';

const bulletPool = new ObjectPool(() => createBullet(), 100);

// Get from pool
const bullet = bulletPool.acquire();
bullet.fire(position, direction);

// Return to pool when done
bulletPool.release(bullet);
```

**Benefits**:
- Reduces garbage collection
- Better performance
- Consistent frame rates
- Perfect for projectiles, particles, enemies

---

## Cloud Integration

### PuterService.js
**Purpose**: Cloud platform integration for user accounts and storage

**Setup**:
1. Add to HTML: `<script src="https://js.puter.com/v2/"></script>` ✅ (Already added!)
2. Initialize in game:

```javascript
import puterService from './cloud/PuterService.js';

// Initialize
await puterService.initialize();

// Sign in user (optional)
await puterService.signIn();

// Save to cloud
await puterService.kvSet('myKey', { data: 'value' });

// Load from cloud
const data = await puterService.kvGet('myKey');
```

**Features**:
- User authentication
- Key-value storage
- File storage
- Event-driven status updates

---

## Storage

### GameStorageService.js
**Purpose**: Hybrid local/cloud storage with automatic sync

**Usage**:
```javascript
import gameStorage from './storage/GameStorageService.js';

// Save character (auto-syncs to cloud if signed in)
await gameStorage.saveCharacter('hero1', {
    name: 'Aragorn',
    level: 10,
    health: 100
});

// Load character (gets newest from cloud or local)
const { data, source } = await gameStorage.loadCharacter('hero1');
console.log(`Loaded from ${source}`); // 'cloud' or 'local'

// List all characters
const characters = await gameStorage.listCharacters();

// Delete character
await gameStorage.deleteCharacter('hero1');

// Export/Import
const exportData = await gameStorage.exportCharacter('hero1');
await gameStorage.importCharacter(exportData, 'hero2');
```

**Features**:
- Works offline (localStorage)
- Auto-syncs when online
- Conflict resolution (newest wins)
- Cross-device saves
- Import/export functionality

---

## Integration Guide

### Step 1: Use EventEmitter in SceneManager

```javascript
// src/scene/SceneManager.js
import { EventEmitter } from '../utils/core/EventEmitter.js';

class SceneManager extends EventEmitter {
    constructor(canvasId) {
        super();
        // ... existing code
    }
    
    onPlayerDamage(amount) {
        this.emit('playerDamaged', { amount });
    }
}
```

### Step 2: Add Object Pooling for Projectiles

```javascript
import { ObjectPool } from '../utils/core/ObjectPool.js';

// In SceneManager constructor
this.projectilePool = new ObjectPool(() => this.createProjectile(), 50);

// When firing
const projectile = this.projectilePool.acquire();
if (projectile) {
    projectile.fire(position, direction);
}

// When removing
this.projectilePool.release(projectile);
```

### Step 3: Add Cloud Saves

```javascript
import puterService from '../utils/cloud/PuterService.js';
import gameStorage from '../utils/storage/GameStorageService.js';

// In game initialization
await puterService.initialize();

// Auto-save every 30 seconds
setInterval(async () => {
    await gameStorage.saveProgress(this.getProgress());
}, 30000);
```

---

## Examples

See `docs/INTEGRATION_EXAMPLES.md` for complete code examples.

---

## Deployment

See `docs/PUTER_DEPLOYMENT_GUIDE.md` for deploying to Puter.js cloud platform.

---

## Benefits Summary

| Utility | Benefit | Impact |
|---------|---------|--------|
| **EventEmitter** | Decoupled architecture | Easier to maintain |
| **ObjectPool** | Reduced GC | Better performance |
| **PuterService** | Cloud integration | User accounts |
| **GameStorageService** | Hybrid storage | Cross-device saves |

---

## Next Steps

1. ✅ Utilities copied (DONE!)
2. ⏳ Update SceneManager to use EventEmitter
3. ⏳ Add ObjectPool for projectiles
4. ⏳ Add cloud save UI
5. ⏳ Deploy to Puter.js

See task list for detailed implementation plan!

