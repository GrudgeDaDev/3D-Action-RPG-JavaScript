# 🎮 Mount System - Quick Reference Card

## 🚀 One-Minute Setup

```javascript
import { MountSystemIntegration } from './examples/MountSystemIntegration.js';

const mountIntegration = new MountSystemIntegration(scene, player, hero, camera, engine);
await mountIntegration.initialize();
```

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| **F** | Mount/Dismount |
| **1-6** | Use Skills |
| **W/↑** | Forward |
| **S/↓** | Backward |
| **A/←** | Turn Left |
| **D/→** | Turn Right |
| **Space** | Ascend (Flying) |
| **Shift** | Descend (Flying) |

---

## 🐴 Horse Skills

| # | Skill | Icon | Cooldown | Effect |
|---|-------|------|----------|--------|
| 1 | Gallop | 🏃 | 10s | Sprint at 1.75x speed |
| 2 | Rear | 🐴 | 15s | Knockback enemies (5 units) |
| 3 | Trample | 💥 | 20s | Charge attack (50 damage) |

**Speed:** 20 units/s (35 when galloping)

---

## ⛵ Boat Skills

| # | Skill | Icon | Cooldown | Effect |
|---|-------|------|----------|--------|
| 1 | Full Sail | ⛵ | 15s | +50% speed for 5s |
| 2 | Port Cannon | 💣 | 5s | Fire left cannons |
| 3 | Starboard Cannon | 💣 | 5s | Fire right cannons |
| 4 | Drop Anchor | ⚓ | 0s | Stop immediately |

**Speed:** 100 units/s  
**Cannons:** Physics-based projectiles

---

## 🦅 Flying Vehicle Skills

| # | Skill | Icon | Cooldown | Effect |
|---|-------|------|----------|--------|
| 1 | Ascend | ⬆️ | 0s | Fly higher |
| 2 | Descend | ⬇️ | 0s | Fly lower |
| 3 | Barrel Roll | 🌀 | 10s | Evasive + invulnerable |
| 4 | Dive Bomb | 💥 | 20s | Explosive dive (100 dmg) |

**Speed:** 30 units/s  
**Altitude:** 5-200 units

---

## 💣 Turret Skills

| # | Skill | Icon | Cooldown | Effect |
|---|-------|------|----------|--------|
| 1 | Fire Cannon | 💥 | 2s | Standard shot (75 dmg) |
| 2 | Explosive Shot | 💣 | 10s | AoE explosion (150 dmg) |
| 3 | Rapid Fire | 🔥 | 15s | 5 shots in 1.5s |
| 4 | Rotate Left | ↶ | 0s | Turn turret left |
| 5 | Rotate Right | ↷ | 0s | Turn turret right |

**Rotation:** ±180°  
**Fire Rate:** 2 seconds

---

## 📁 File Structure

```
src/vehicles/
├── MountSystem.js              # Core system
├── HorseController.js          # Horse logic
├── BoatController.js           # Boat logic
├── FlyingVehicleController.js  # Flying logic
└── TurretController.js         # Turret logic

src/ui/
└── MountSkillBarUI.js          # Skill bar UI

examples/
└── MountSystemIntegration.js   # Setup guide
```

---

## 🔧 Tag a Mount

```javascript
mesh.metadata = {
    mountType: MountType.HORSE, // or BOAT, FLYING, TURRET
    mountData: {
        name: 'War Horse',
        speed: 20
    }
};
```

---

## 💻 API Quick Reference

```javascript
// Mount
mountSystem.mount(MountType.HORSE, horseMesh, { speed: 25 });

// Dismount
mountSystem.dismount();

// Use skill
mountSystem.useSkill(0); // First skill

// Check status
if (mountSystem.isMounted()) {
    console.log(mountSystem.getCurrentMountType());
}

// Get skills
const skills = mountSystem.getMountSkills();
```

---

## 🎨 Add Custom Mount

```javascript
// 1. Create controller
class CustomController {
    mount(mesh, data) { /* ... */ }
    dismount() { /* ... */ }
    useSkill(id, data) { /* ... */ }
    update(dt, input) { /* ... */ }
}

// 2. Register
mountSystem.registerController('custom', new CustomController(scene, player, camera));

// 3. Add skills (in MountSystem.js)
[MountType.CUSTOM]: [
    { id: 'skill1', name: 'Skill', icon: '⚡', cooldown: 10, description: 'Cool' }
]
```

---

## ✅ Testing Checklist

- [ ] Mount horse (Press F)
- [ ] Use gallop skill (Press 1)
- [ ] Mount boat
- [ ] Fire cannons (Press 2, 3)
- [ ] Mount flying vehicle
- [ ] Perform barrel roll (Press 3)
- [ ] Mount turret
- [ ] Fire explosive shot (Press 2)
- [ ] Check UI skill bar appears
- [ ] Check cooldown timers work
- [ ] Check tooltips on hover
- [ ] Dismount all mounts

---

## 🐛 Common Issues

**Mount not working?**
- Check mesh has `metadata.mountType` set
- Ensure controller is registered
- Verify player is within 5 units

**Skills not firing?**
- Check cooldown hasn't expired
- Ensure mounted state is active
- Verify skill index is valid (0-5)

**UI not showing?**
- Check MountSkillBarUI is initialized
- Verify onMountChange callback is set
- Ensure Babylon.GUI is loaded

---

## 📊 Performance Tips

1. **Limit active projectiles** - Auto-cleanup after 10s
2. **Pool particle systems** - Reuse explosion effects
3. **Optimize collision checks** - Use spatial partitioning
4. **Reduce update frequency** - Only update when mounted
5. **LOD for mounts** - Lower detail at distance

---

## 🎯 Best Practices

1. **Tag all mounts** with proper metadata
2. **Register controllers** before creating mounts
3. **Update in game loop** for smooth movement
4. **Handle edge cases** (dismount at height, etc.)
5. **Test all skills** before deployment
6. **Use events** for mount state changes
7. **Cleanup resources** on dispose

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** ✅ Production Ready

