# Quick Reference - Grudge Integration

## 🚀 One-Minute Setup

```javascript
// 1. Import utilities
import { EventEmitter } from './src/utils/core/EventEmitter.js';
import { ObjectPool } from './src/utils/core/ObjectPool.js';
import puterService from './src/utils/cloud/PuterService.js';
import gameStorage from './src/utils/storage/GameStorageService.js';

// 2. Initialize cloud (optional)
await puterService.initialize();

// 3. Start using!
```

---

## 📡 EventEmitter Cheat Sheet

### Basic Usage
```javascript
class GameManager extends EventEmitter {
    constructor() {
        super();
    }
    
    // Emit event
    onPlayerDamage(amount) {
        this.emit('playerDamaged', { amount });
    }
}

const game = new GameManager();

// Listen to event
game.on('playerDamaged', (data) => {
    console.log(`Damage: ${data.amount}`);
});

// One-time listener
game.once('gameOver', () => {
    console.log('Game ended!');
});

// Remove listener
const handler = (data) => console.log(data);
game.on('event', handler);
game.off('event', handler);

// Remove all listeners
game.off('event');
```

### Common Events
```javascript
// Player events
this.emit('playerDamaged', { amount, source });
this.emit('playerHealed', { amount });
this.emit('playerDied', {});
this.emit('playerLevelUp', { level });

// Combat events
this.emit('enemySpawned', { enemy });
this.emit('enemyKilled', { enemy, xp });
this.emit('projectileFired', { projectile });

// Game events
this.emit('gameStarted', {});
this.emit('gamePaused', {});
this.emit('gameOver', { score });
```

---

## 🔄 ObjectPool Cheat Sheet

### Basic Usage
```javascript
// Create pool
const bulletPool = new ObjectPool(
    () => createBullet(),  // Factory function
    50,                     // Initial size
    200                     // Max size (optional)
);

// Get object from pool
const bullet = bulletPool.acquire();
if (bullet) {
    bullet.fire(position, direction);
}

// Return to pool
bulletPool.release(bullet);

// Get stats
console.log(bulletPool.stats);
// { total: 50, available: 45, inUse: 5 }
```

### With Lifecycle Hooks
```javascript
const particlePool = new ObjectPool(() => {
    const particle = createParticle();
    
    return {
        mesh: particle,
        velocity: new BABYLON.Vector3(),
        
        // Called when acquired
        onAcquire() {
            this.mesh.setEnabled(true);
        },
        
        // Called when released
        onRelease() {
            this.mesh.setEnabled(false);
        },
        
        // Called when released
        reset() {
            this.velocity.set(0, 0, 0);
            this.mesh.position.set(0, 0, 0);
        }
    };
}, 100);
```

### Common Pools
```javascript
// Projectiles
this.bulletPool = new ObjectPool(() => createBullet(), 50);
this.arrowPool = new ObjectPool(() => createArrow(), 30);

// Particles
this.bloodPool = new ObjectPool(() => createBloodParticle(), 100);
this.sparkPool = new ObjectPool(() => createSpark(), 200);

// Enemies
this.zombiePool = new ObjectPool(() => createZombie(), 20);
this.skeletonPool = new ObjectPool(() => createSkeleton(), 15);
```

---

## ☁️ Cloud Services Cheat Sheet

### PuterService
```javascript
import puterService from './src/utils/cloud/PuterService.js';

// Initialize
await puterService.initialize();

// Check status
if (puterService.isConnected) {
    console.log('User:', puterService.currentUser.username);
}

// Sign in
await puterService.signIn();

// Sign out
await puterService.signOut();

// Key-value storage
await puterService.kvSet('myKey', { data: 'value' });
const data = await puterService.kvGet('myKey');
await puterService.kvDel('myKey');
const keys = await puterService.kvList('prefix');

// File storage
await puterService.saveFile('path/to/file.txt', 'content');
const content = await puterService.loadFile('path/to/file.txt');

// Events
puterService.on('status', ({ status, user }) => {
    console.log('Status:', status); // 'connected', 'ready', 'error'
});

puterService.on('userChanged', (user) => {
    console.log('User:', user?.username || 'signed out');
});
```

### GameStorageService
```javascript
import gameStorage from './src/utils/storage/GameStorageService.js';

// Save character (auto-syncs to cloud if signed in)
await gameStorage.saveCharacter('hero1', {
    name: 'Aragorn',
    level: 10,
    health: 100,
    position: { x: 0, y: 0, z: 0 }
});

// Load character (gets newest from cloud or local)
const { data, source } = await gameStorage.loadCharacter('hero1');
console.log(`Loaded from ${source}`); // 'cloud' or 'local'

// Save progress
await gameStorage.saveProgress({
    currentLevel: 5,
    completedQuests: ['quest1', 'quest2'],
    unlockedAreas: ['forest', 'cave']
});

// Load progress
const { data } = await gameStorage.loadProgress();

// List characters
const characters = await gameStorage.listCharacters();
// [{ id: 'hero1', name: 'Aragorn', level: 10, lastModified: 123456 }]

// Delete character
await gameStorage.deleteCharacter('hero1');

// Export/Import
const exportData = await gameStorage.exportCharacter('hero1');
await gameStorage.importCharacter(exportData, 'hero2');
```

---

## 🎮 Common Patterns

### Pattern 1: Event-Driven Combat
```javascript
class CombatSystem extends EventEmitter {
    attack(attacker, target, damage) {
        target.health -= damage;
        
        this.emit('attacked', { attacker, target, damage });
        
        if (target.health <= 0) {
            this.emit('killed', { attacker, target });
        }
    }
}

const combat = new CombatSystem();
combat.on('attacked', ({ damage }) => showDamageNumber(damage));
combat.on('killed', ({ target }) => spawnLoot(target));
```

### Pattern 2: Pooled Projectiles
```javascript
class ProjectileManager {
    constructor() {
        this.pool = new ObjectPool(() => this.createProjectile(), 50);
        this.active = [];
    }
    
    fire(position, direction) {
        const projectile = this.pool.acquire();
        if (!projectile) return;
        
        projectile.mesh.position.copyFrom(position);
        projectile.velocity.copyFrom(direction).scaleInPlace(20);
        this.active.push(projectile);
    }
    
    update(deltaTime) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const p = this.active[i];
            p.mesh.position.addInPlace(p.velocity.scale(deltaTime));
            
            if (this.shouldRemove(p)) {
                this.pool.release(p);
                this.active.splice(i, 1);
            }
        }
    }
}
```

### Pattern 3: Auto-Save with Cloud Sync
```javascript
class GameManager extends EventEmitter {
    constructor() {
        super();
        this.autoSaveInterval = 30000; // 30 seconds
        this.startAutoSave();
    }
    
    startAutoSave() {
        setInterval(async () => {
            const progress = this.getProgress();
            const result = await gameStorage.saveProgress(progress);
            
            this.emit('autoSaved', { 
                synced: result.synced,
                timestamp: Date.now()
            });
        }, this.autoSaveInterval);
    }
}
```

---

## 📦 Deployment Commands

```bash
# Install Puter CLI
npm install -g @puter/cli

# Login
puter login

# Deploy
puter deploy

# Your app is live at:
# https://your-app-name.puter.site
```

---

## 🔗 Quick Links

- **Full Docs**: `docs/` folder
- **Examples**: `docs/INTEGRATION_EXAMPLES.md`
- **Deployment**: `docs/PUTER_DEPLOYMENT_GUIDE.md`
- **What's New**: `docs/WHATS_NEW.md`
- **Summary**: `INTEGRATION_SUMMARY.md`

