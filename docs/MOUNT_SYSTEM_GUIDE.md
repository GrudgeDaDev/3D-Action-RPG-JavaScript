# 🐴 GRUDGE WARLORDS - Mount System Guide

## 📋 Overview

The Mount System allows players to mount and control various vehicles and animals including:
- **🐴 Horses** - Fast ground mounts with combat abilities
- **⛵ Boats** - Water vehicles with cannon attacks
- **🦅 Flying Vehicles** - Aerial mounts (dragons, airships)
- **💣 Turrets** - Stationary cannons for defense

Each mount type has unique skills and controls displayed in a dedicated skill bar UI.

---

## 🚀 Quick Start

### 1. Initialize the Mount System

```javascript
import { MountSystem, MountType } from './src/vehicles/MountSystem.js';
import { HorseController } from './src/vehicles/HorseController.js';
import { BoatController } from './src/vehicles/BoatController.js';
import { FlyingVehicleController } from './src/vehicles/FlyingVehicleController.js';
import { TurretController } from './src/vehicles/TurretController.js';
import { MountSkillBarUI } from './src/ui/MountSkillBarUI.js';

// Create mount system
const mountSystem = new MountSystem(scene, player, hero, camera);

// Register controllers
mountSystem.registerController(MountType.HORSE, new HorseController(scene, player, camera));
mountSystem.registerController(MountType.BOAT, new BoatController(scene, null, player, hero, camera, waterLevel));
mountSystem.registerController(MountType.FLYING, new FlyingVehicleController(scene, player, camera));
mountSystem.registerController(MountType.TURRET, new TurretController(scene, player, camera));

// Create UI
const mountUI = new MountSkillBarUI(scene, mountSystem);

// Update in game loop
scene.registerBeforeRender(() => {
    const deltaTime = engine.getDeltaTime() / 1000;
    mountSystem.update(deltaTime);
});
```

### 2. Tag Mounts in Your Scene

```javascript
// Horse
horseMesh.metadata = {
    mountType: MountType.HORSE,
    mountData: {
        speed: 20,
        name: 'War Horse'
    }
};

// Boat
boatMesh.metadata = {
    mountType: MountType.BOAT,
    mountData: {
        cannons: true
    }
};

// Flying mount
dragonMesh.metadata = {
    mountType: MountType.FLYING,
    mountData: {
        maxAltitude: 200
    }
};

// Turret
turretMesh.metadata = {
    mountType: MountType.TURRET,
    mountData: {
        rotationRange: 180
    }
};
```

### 3. Mount/Dismount

```javascript
// Press 'F' near a mount to mount/dismount
// Or programmatically:
mountSystem.mount(MountType.HORSE, horseMesh, { speed: 25 });
mountSystem.dismount();
```

---

## 🎮 Controls

### Universal Controls
- **F** - Mount/Dismount nearby vehicle
- **1-6** - Use mount skills
- **W/↑** - Forward
- **S/↓** - Backward
- **A/←** - Turn/Strafe Left
- **D/→** - Turn/Strafe Right

### Flying Vehicle Additional Controls
- **Space** - Ascend
- **Shift** - Descend

---

## 🐴 Horse Mount

### Skills
1. **🏃 Gallop** (Cooldown: 10s)
   - Sprint forward at high speed for 5 seconds
   - Speed boost: 1.75x normal speed

2. **🐴 Rear** (Cooldown: 15s)
   - Rear up and knock back nearby enemies
   - Knockback radius: 5 units
   - Knockback force: 10 units

3. **💥 Trample** (Cooldown: 20s)
   - Charge through enemies dealing damage
   - Damage: 50 HP
   - Duration: 1 second

### Stats
- Max Speed: 20 units/s
- Gallop Speed: 35 units/s
- Turn Speed: 2.0 rad/s
- Acceleration: 15 units/s²

---

## ⛵ Boat Mount

### Skills
1. **⛵ Full Sail** (Cooldown: 15s)
   - Boost sailing speed by 50%
   - Duration: 5 seconds

2. **💣 Port Cannon** (Cooldown: 5s)
   - Fire left-side cannons
   - Fires perpendicular to boat direction

3. **💣 Starboard Cannon** (Cooldown: 5s)
   - Fire right-side cannons
   - Fires perpendicular to boat direction

4. **⚓ Drop Anchor** (No cooldown)
   - Immediately stop the boat

### Stats
- Max Speed: 100 units/s
- Turn Speed: 1.5 rad/s
- Cannonball Speed: 40 units/s
- Cannon Cooldown: 5 seconds

### Cannon Mechanics
- Cannonballs have physics (gravity, bounce)
- Automatic cleanup after 10 seconds
- Muzzle flash effects
- Damage on impact

---

## 🦅 Flying Vehicle Mount

### Skills
1. **⬆️ Ascend** (No cooldown)
   - Fly higher
   - Max altitude: 200 units

2. **⬇️ Descend** (No cooldown)
   - Fly lower
   - Min altitude: 5 units

3. **🌀 Barrel Roll** (Cooldown: 10s)
   - Evasive maneuver with temporary invulnerability
   - Duration: 1 second
   - Grants invulnerability during roll

4. **💥 Dive Bomb** (Cooldown: 20s)
   - Rapid dive attack with explosion on impact
   - Damage: 100 HP
   - Explosion radius: 10 units
   - Knockback: 15 units

### Stats
- Max Speed: 30 units/s
- Vertical Speed: 10 units/s
- Turn Speed: 1.8 rad/s
- Altitude Range: 5-200 units

### Flight Mechanics
- Cannot dismount above safe altitude (7 units)
- Vehicle tilts during turns
- Smooth acceleration/deceleration
- Altitude limits enforced

---

## 💣 Turret Mount

### Skills
1. **💥 Fire Cannon** (Cooldown: 2s)
   - Fire standard cannonball
   - Damage: 75 HP

2. **💣 Explosive Shot** (Cooldown: 10s)
   - Fire explosive cannonball with AoE damage
   - Damage: 150 HP (with falloff)
   - Explosion radius: 8 units

3. **🔥 Rapid Fire** (Cooldown: 15s)
   - Fire 5 shots in quick succession
   - Shot interval: 0.3 seconds

4. **↶ Rotate Left** (No cooldown)
   - Rotate turret left

5. **↷ Rotate Right** (No cooldown)
   - Rotate turret right

### Stats
- Rotation Speed: 1.5 rad/s
- Rotation Range: ±180°
- Cannonball Speed: 50 units/s
- Fire Rate: 2 seconds

### Turret Mechanics
- Fixed position (cannot move)
- Limited rotation range
- Physics-based projectiles
- Explosion effects on explosive shots

---

## 🎨 Mount Skill Bar UI

### Features
- **6 Skill Slots** - Display up to 6 mount abilities
- **Cooldown Timers** - Visual cooldown overlays with countdown
- **Keybind Display** - Shows 1-6 number keys
- **Tooltips** - Hover to see skill name and description
- **Mount Name** - Displays current mount type
- **Auto Show/Hide** - Appears when mounted, hides when dismounted
- **Click to Use** - Click skills or use number keys

### Customization
```javascript
// Access skill bar
const skillBar = mountUI;

// Manually show/hide
skillBar.show('horse');
skillBar.hide();

// Update skills
skillBar.updateSkills();
```

---

## 🔧 Advanced Usage

### Custom Mount Types

```javascript
// Create custom controller
class CustomMountController {
    constructor(scene, player, camera) {
        this.scene = scene;
        this.player = player;
        this.camera = camera;
    }
    
    mount(mountMesh, data) {
        // Mount logic
    }
    
    dismount() {
        // Dismount logic
    }
    
    useSkill(skillId, skillData) {
        // Skill logic
    }
    
    update(deltaTime, inputMap) {
        // Update logic
    }
}

// Register custom controller
mountSystem.registerController('custom', new CustomMountController(scene, player, camera));
```

### Custom Skills

```javascript
// Modify skills in MountSystem.js getMountSkillsForType()
[MountType.CUSTOM]: [
    { 
        id: 'custom_skill', 
        name: 'Custom Skill', 
        icon: '⚡', 
        cooldown: 10, 
        description: 'Does something cool' 
    }
]
```

---

## 📁 File Structure

```
src/
├── vehicles/
│   ├── MountSystem.js              # Core mount system
│   ├── HorseController.js          # Horse mount logic
│   ├── BoatController.js           # Boat mount logic (updated)
│   ├── FlyingVehicleController.js  # Flying mount logic
│   └── TurretController.js         # Turret mount logic
└── ui/
    └── MountSkillBarUI.js          # Mount skill bar UI
```

---

## ✅ Features

- ✅ 4 mount types (Horse, Boat, Flying, Turret)
- ✅ 20+ unique mount skills
- ✅ Physics-based projectiles
- ✅ Particle effects (explosions, muzzle flash, speed lines)
- ✅ Cooldown system
- ✅ Skill bar UI with tooltips
- ✅ Keyboard and mouse controls
- ✅ Auto mount detection
- ✅ Smooth camera transitions
- ✅ Damage and knockback mechanics

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Complete and Ready for Integration

