# Integration Examples - Using Grudge Components

## Example 1: Using EventEmitter for Game Events

### Before (Tightly Coupled)
```javascript
// character.js
class Character {
    takeDamage(amount) {
        this.health -= amount;
        // Directly calling UI update - tight coupling!
        updateHealthBar(this.health);
        // Directly calling sound - tight coupling!
        playSound('hurt');
    }
}
```

### After (Event-Driven)
```javascript
// character.js
import { EventEmitter } from './utils/core/EventEmitter.js';

class Character extends EventEmitter {
    constructor() {
        super();
        this.health = 100;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        // Emit event - decoupled!
        this.emit('damaged', { amount, health: this.health });
    }
}

// ui.js
character.on('damaged', ({ amount, health }) => {
    updateHealthBar(health);
    showDamageNumber(amount);
});

// audio.js
character.on('damaged', () => {
    playSound('hurt');
});
```

**Benefits**: UI and audio can be added/removed without changing Character class!

---

## Example 2: Using ObjectPool for Projectiles

### Before (Memory Intensive)
```javascript
// Spawning projectiles
function fireArrow() {
    // Creates new mesh every time - garbage collection nightmare!
    const arrow = BABYLON.MeshBuilder.CreateCylinder("arrow", {
        height: 1,
        diameter: 0.1
    }, scene);
    
    arrows.push(arrow);
}

// Cleanup
function removeArrow(arrow) {
    arrow.dispose(); // Destroys mesh
    arrows.splice(arrows.indexOf(arrow), 1);
}
```

### After (Pooled)
```javascript
import { ObjectPool } from './utils/core/ObjectPool.js';

// Create pool once
const arrowPool = new ObjectPool(() => {
    const arrow = BABYLON.MeshBuilder.CreateCylinder("arrow", {
        height: 1,
        diameter: 0.1
    }, scene);
    
    arrow.setEnabled(false);
    
    return {
        mesh: arrow,
        velocity: new BABYLON.Vector3(),
        damage: 10,
        
        onAcquire() {
            this.mesh.setEnabled(true);
        },
        
        onRelease() {
            this.mesh.setEnabled(false);
        },
        
        reset() {
            this.velocity.set(0, 0, 0);
            this.mesh.position.set(0, 0, 0);
        }
    };
}, 20, 100); // Initial: 20, Max: 100

// Spawning projectiles
function fireArrow(position, direction) {
    const arrow = arrowPool.acquire();
    if (!arrow) return; // Pool exhausted
    
    arrow.mesh.position.copyFrom(position);
    arrow.velocity.copyFrom(direction).scaleInPlace(20);
    activeArrows.push(arrow);
}

// Cleanup
function removeArrow(arrow) {
    arrowPool.release(arrow); // Returns to pool - no disposal!
    activeArrows.splice(activeArrows.indexOf(arrow), 1);
}
```

**Benefits**: 
- No garbage collection spikes
- Faster spawning (reuse existing meshes)
- Better performance with many projectiles

---

## Example 3: Using GameStorageService for Character Saves

### Before (localStorage only)
```javascript
// Saving
function saveCharacter(character) {
    localStorage.setItem('character', JSON.stringify(character));
}

// Loading
function loadCharacter() {
    const data = localStorage.getItem('character');
    return data ? JSON.parse(data) : null;
}
```

### After (Hybrid Local/Cloud)
```javascript
import gameStorage from './utils/storage/GameStorageService.js';
import puterService from './utils/cloud/PuterService.js';

// Initialize cloud (optional - works offline too!)
async function initGame() {
    await puterService.initialize();
    
    // Show sign-in button if not connected
    if (!puterService.isConnected) {
        showSignInButton();
    }
}

// Saving (auto-syncs to cloud if signed in)
async function saveCharacter(character) {
    const result = await gameStorage.saveCharacter('hero1', {
        name: character.name,
        level: character.level,
        health: character.health,
        position: character.position,
        inventory: character.inventory
    });
    
    if (result.synced) {
        console.log('✅ Saved to cloud!');
    } else {
        console.log('💾 Saved locally (offline)');
    }
}

// Loading (gets newest from cloud or local)
async function loadCharacter() {
    const { data, source } = await gameStorage.loadCharacter('hero1');
    
    if (data) {
        console.log(`Loaded from ${source}`);
        return data;
    }
    
    return null; // No save found
}

// Sign-in button handler
async function onSignInClick() {
    await puterService.signIn();
    
    // Re-load character to get cloud version
    const character = await loadCharacter();
    if (character) {
        applyCharacterData(character);
    }
}
```

**Benefits**:
- Works offline (localStorage)
- Auto-syncs when online
- Cross-device saves
- No backend server needed!

---

## Example 4: Complete Integration in SceneManager

```javascript
// src/scene/SceneManager.js
import { EventEmitter } from '../utils/core/EventEmitter.js';
import { ObjectPool } from '../utils/core/ObjectPool.js';
import gameStorage from '../utils/storage/GameStorageService.js';
import puterService from '../utils/cloud/PuterService.js';

class SceneManager extends EventEmitter {
    constructor(canvasId) {
        super();
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        
        // Create object pools
        this.projectilePool = new ObjectPool(() => this.createProjectile(), 50);
        this.particlePool = new ObjectPool(() => this.createParticle(), 100);
        
        // Listen to own events
        this.on('playerDamaged', this.onPlayerDamaged.bind(this));
        this.on('enemyKilled', this.onEnemyKilled.bind(this));
    }
    
    async start() {
        // Initialize cloud services
        await puterService.initialize();
        
        // Load saved progress
        const { data } = await gameStorage.loadProgress();
        if (data) {
            this.applyProgress(data);
        }
        
        // Create scene
        this.scene = this.createScene();
        
        // Start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }
    
    async autoSave() {
        const progress = this.getProgress();
        await gameStorage.saveProgress(progress);
        this.emit('progressSaved', progress);
    }
    
    fireProjectile(position, direction) {
        const projectile = this.projectilePool.acquire();
        if (projectile) {
            projectile.mesh.position.copyFrom(position);
            projectile.velocity.copyFrom(direction).scaleInPlace(20);
            this.emit('projectileFired', projectile);
        }
    }
    
    onPlayerDamaged({ amount }) {
        // Spawn damage particles
        for (let i = 0; i < 10; i++) {
            const particle = this.particlePool.acquire();
            if (particle) {
                // Setup particle...
            }
        }
    }
    
    onEnemyKilled({ enemy }) {
        // Award XP, update stats, etc.
        this.emit('xpGained', { amount: enemy.xpValue });
    }
}
```

**Benefits**:
- Clean event-driven architecture
- Efficient object pooling
- Automatic cloud saves
- Easy to extend

---

## Next Steps

1. ✅ Copy the utility files (already done!)
2. ✅ Update your SceneManager to use EventEmitter
3. ✅ Replace projectile creation with ObjectPool
4. ✅ Add cloud save buttons to UI
5. ✅ Test locally, then deploy to Puter!

See `PUTER_DEPLOYMENT_GUIDE.md` for deployment instructions.

