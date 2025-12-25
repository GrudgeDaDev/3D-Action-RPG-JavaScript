# AI Player Q&A Testing Protocol

## Comprehensive Game Systems Validation

**Version:** 1.0
**Scene:** Warlords Scene (Main Game World)
**Purpose:** Validate all game systems are operational and properly configured

---

## 🎯 Testing Objectives

1. **Navigation & Movement** - Verify terrain, water, and vehicle navigation
2. **Asset Integrity** - Ensure all assets have required components
3. **Combat Systems** - Test weapons, armor, enemies, and hero mechanics
4. **UI/UX** - Validate all interface elements
5. **Physics & Collisions** - Test physical interactions
6. **Performance** - Monitor FPS, LOD, and culling

---

## 📋 Section 1: Navigation & Movement Testing

### Q1.1: Terrain Navigation

**Test:** Can the AI player navigate the main terrain island?

- [ ] Walk to spawn point (134.683, 80, -271.427)
- [ ] Navigate to 5 random points on terrain
- [ ] Climb slopes (test max slope angle)
- [ ] Detect and avoid cliffs/edges
- [ ] Report any stuck positions or navigation failures

**Expected:** Smooth navigation, no clipping, proper collision detection

### Q1.2: Water Navigation

**Test:** Can the AI player interact with water systems?

- [ ] Enter water at shoreline
- [ ] Swim to depth > 10 units
- [ ] Test swimming speed vs walking speed
- [ ] Exit water onto land
- [ ] Verify water level at Y=12.16

**Expected:** Swimming animation triggers, movement speed changes, no drowning

### Q1.3: Boat Navigation

**Test:** Can the AI player use the boat?

- [ ] Locate boat at position (450, 14, -200)
- [ ] Board boat (right-click interaction)
- [ ] Navigate boat to 3 different islands
- [ ] Disembark from boat
- [ ] Verify boat bobbing animation

**Expected:** Smooth boarding, boat controls work, can reach islands

### Q1.4: Ghost Ship Discovery

**Test:** Can the AI player find and explore the ghost ship?

- [ ] Navigate to ghost ship position (-2000, 5, 1800)
- [ ] Approach and board ghost ship
- [ ] Explore ship deck
- [ ] Report ghost ship animations (bobbing, rocking, drift)

**Expected:** Ghost ship visible from distance, explorable, eerie animations active

---

## 📦 Section 2: Asset Integrity Validation

### Q2.1: Asset Component Checklist

**For EACH asset in game, verify:**

```javascript
{
  "uuid": "string (required)",           // Unique identifier
  "name": "string (required)",           // Display name
  "model": "path/to/model.glb (required)", // 3D model file
  "icon": "path/to/icon.png (required)",   // 2D inventory icon
  "thumbnail": "path/to/thumb.jpg",        // Optional preview
  "scripts": ["script1.js", "script2.js"], // Behavior scripts
  "category": "weapon|armor|item|prop",    // Asset type
  "metadata": {
    "scale": 1.0,
    "rotation": [0, 0, 0],
    "collisions": true
  }
}
```

### Q2.2: Weapon Assets

**Test each weapon:**

- [ ] Has 3D model (.glb)
- [ ] Has 2D icon (.png)
- [ ] Has UUID
- [ ] Has weapon script (damage, range, speed)
- [ ] Properly held in hand (bone attachment)
- [ ] Attack animations work
- [ ] Trail/VFX render correctly

**Weapons to test:**

1. Sword2 (./assets/characters/weapons/Sword2.glb)
2. [Add more weapons from inventory]

### Q2.3: Armor Assets

**Test each armor piece:**

- [ ] Has 3D model (.glb)
- [ ] Has 2D icon (.png)
- [ ] Has UUID
- [ ] Has armor script (defense, weight)
- [ ] Renders on character body
- [ ] Doesn't clip with character mesh
- [ ] Proper material/texture

**Armor slots to test:**

1. Helmet
2. Chest
3. Gloves
4. Legs
5. Boots
6. Shield

### Q2.4: Item Assets

**Test consumables and items:**

- [ ] Has 3D model (for world drops)
- [ ] Has 2D icon (for inventory)
- [ ] Has UUID
- [ ] Has item script (effects, stackable, etc.)
- [ ] Can be picked up
- [ ] Appears in inventory
- [ ] Can be used/consumed

---

## ⚔️ Section 3: Combat Systems Testing

### Q3.1: Hero Combat

**Test player combat mechanics:**

- [ ] Equip weapon (Sword2)
- [ ] Perform basic attack
- [ ] Verify damage calculation
- [ ] Test attack range
- [ ] Test attack speed
- [ ] Verify hit detection
- [ ] Check health bar updates

### Q3.2: Enemy Combat

**Test enemy AI and combat:**

- [ ] Locate slime enemy
- [ ] Verify enemy detection range
- [ ] Test enemy pathfinding to player
- [ ] Verify enemy attacks
- [ ] Test enemy health/damage
- [ ] Verify enemy death/loot
- [ ] Check enemy respawn

---

## 🌊 Section 5: Water & Physics Testing

### Q5.1: Water Physics

**Test water interactions:**

- [ ] Verify water level at Y=12.16
- [ ] Test water surface rendering
- [ ] Verify water reflections
- [ ] Test underwater view (if applicable)
- [ ] Verify buoyancy on objects
- [ ] Test water entry/exit splash effects

### Q5.2: Collision Detection

**Test physics collisions:**

- [ ] Walk into walls/obstacles
- [ ] Jump and land on platforms
- [ ] Test character-to-terrain collision
- [ ] Test character-to-object collision
- [ ] Test character-to-enemy collision
- [ ] Verify no clipping through meshes

### Q5.3: Vehicle Physics

**Test boat physics:**

- [ ] Boat floats at correct water level
- [ ] Boat responds to player input
- [ ] Boat has momentum/inertia
- [ ] Boat collides with islands
- [ ] Boat doesn't sink or fly
- [ ] Verify boat wake/particle effects

---

## 🏝️ Section 6: Island & Environment Testing

### Q6.1: Island Accessibility

**Test each island:**

1. **Pirate Island** (1200, -5, 800)
   - [ ] Visible from main island
   - [ ] Reachable by boat
   - [ ] Has collision/physics
   - [ ] LOD system works
   - [ ] Can walk on island

2. **Fantasy Island** (1400, -5, -600)
   - [ ] Visible from main island
   - [ ] Reachable by boat
   - [ ] Has collision/physics
   - [ ] LOD system works
   - [ ] Can walk on island

3. **Castle Island** (-1200, -5, 900)
   - [ ] Visible from main island
   - [ ] Reachable by boat
   - [ ] Has collision/physics
   - [ ] LOD system works
   - [ ] Can walk on island

4. **Mythical Island** (-1400, -5, -700)
   - [ ] Visible from main island
   - [ ] Reachable by boat
   - [ ] Has collision/physics
   - [ ] LOD system works
   - [ ] Can walk on island

5. **Azure Island** (0, -5, -1500)
   - [ ] Visible from main island
   - [ ] Reachable by boat
   - [ ] Has collision/physics
   - [ ] LOD system works
   - [ ] Can walk on island

### Q6.2: LOD & Culling

**Test performance optimizations:**

- [ ] Islands fade in/out based on distance
- [ ] LOD distance set to 2000 units
- [ ] Distant islands use lower poly models
- [ ] Culling removes off-screen objects
- [ ] FPS remains stable (>30 FPS)

---

## 🤖 Section 7: NPC & Enemy AI Testing

### Q7.1: Enemy AI Behavior

**Test enemy intelligence:**

- [ ] Enemy detects player in range
- [ ] Enemy pursues player
- [ ] Enemy attacks when in range
- [ ] Enemy returns to spawn point
- [ ] Enemy avoids obstacles
- [ ] Enemy uses abilities/skills

### Q7.2: Enemy Spawning

**Test spawn system:**

- [ ] 7 slimes spawn on terrain
- [ ] Enemies spawn at designated points
- [ ] Enemies respawn after death
- [ ] Spawn rate is balanced
- [ ] No spawn camping issues

### Q7.3: NPC Interactions (Future)

**Test NPC systems (if implemented):**

- [ ] NPC dialogue triggers
- [ ] NPC quests available
- [ ] NPC shops functional
- [ ] NPC pathfinding works
- [ ] NPC schedules/routines

---

## 🎮 Section 8: Controls & Input Testing

### Q8.1: Keyboard Controls

**Test keyboard inputs:**

- [ ] W - Move forward
- [ ] A - Move left
- [ ] S - Move backward
- [ ] D - Move right
- [ ] Space - Jump
- [ ] Shift - Sprint/dash
- [ ] I - Inventory
- [ ] C - Character sheet
- [ ] M - Map
- [ ] Esc - Menu

### Q8.2: Mouse Controls

**Test mouse inputs:**

- [ ] Left click - Attack
- [ ] Right click - Interact/board boat
- [ ] Mouse wheel - Zoom camera
- [ ] Mouse move - Rotate camera
- [ ] Middle click - (if assigned)

### Q8.3: Camera Controls

**Test camera system:**

- [ ] Camera follows character
- [ ] Camera rotates smoothly
- [ ] Camera zoom in/out (4 to 800 units)
- [ ] Camera doesn't clip terrain
- [ ] Camera beta limit (horizon lock)
- [ ] Camera collision detection

---

## 📊 Section 9: Performance Metrics

### Q9.1: FPS Monitoring

**Monitor frame rate:**

- [ ] FPS on main island: _____ FPS
- [ ] FPS in water: _____ FPS
- [ ] FPS on boat: _____ FPS
- [ ] FPS near ghost ship: _____ FPS
- [ ] FPS during combat: _____ FPS
- [ ] FPS with all islands visible: _____ FPS

**Target:** Maintain >30 FPS, ideally >60 FPS

### Q9.2: Memory Usage

**Monitor resource usage:**

- [ ] Initial memory: _____ MB
- [ ] After 5 minutes: _____ MB
- [ ] After 15 minutes: _____ MB
- [ ] Memory leaks detected: Yes/No
- [ ] Texture memory: _____ MB
- [ ] Mesh memory: _____ MB

### Q9.3: Load Times

**Measure loading performance:**

- [ ] Scene load time: _____ seconds
- [ ] Asset load time: _____ seconds
- [ ] Island load time: _____ seconds
- [ ] Character load time: _____ seconds

---

## 🔧 Section 10: Asset Validation System

### Q10.1: Required Asset Components

**Every asset MUST have:**

```javascript
// Asset Schema
{
  // REQUIRED FIELDS
  "uuid": "generated-uuid-v4",              // Unique ID
  "name": "Asset Display Name",             // Human-readable name
  "category": "weapon|armor|item|prop|npc", // Asset type
  "model": {
    "path": "./assets/path/to/model.glb",   // 3D model
    "scale": 1.0,                            // Default scale
    "rotation": [0, 0, 0]                    // Default rotation
  },
  "icon": "./assets/icons/asset_icon.png",  // 2D inventory icon

  // OPTIONAL BUT RECOMMENDED
  "thumbnail": "./assets/thumbs/preview.jpg", // Preview image
  "scripts": [                                 // Behavior scripts
    "./assets/scripts/asset_behavior.js"
  ],

  // CATEGORY-SPECIFIC FIELDS
  "weapon": {
    "damage": 10,
    "range": 2.5,
    "attackSpeed": 1.0,
    "holdBone": "RightHand",                 // Bone attachment
    "holdOffset": [0, 0, 0],                 // Position offset
    "holdRotation": [0, 0, 0],               // Rotation offset
    "trail": true,                           // Enable trail VFX
    "animations": {
      "idle": "weapon_idle",
      "attack": "weapon_attack"
    }
  },
  "armor": {
    "defense": 5,
    "weight": 10,
    "slot": "helmet|chest|gloves|legs|boots|shield",
    "renderLayer": "armor_layer",            // Render priority
    "attachPoints": [                        // Body attachment
      { "bone": "Head", "mesh": "helmet_mesh" }
    ]
  },
  "item": {
    "stackable": true,
    "maxStack": 99,
    "consumable": true,
    "effects": [
      { "type": "heal", "value": 50 }
    ]
  }
}
```

### Q10.2: Asset Validation Checklist

**For each asset, verify:**

1. **UUID Generation**
   - [ ] UUID exists
   - [ ] UUID is unique
   - [ ] UUID follows v4 format

2. **3D Model**
   - [ ] Model file exists
   - [ ] Model loads without errors
   - [ ] Model has proper scale
   - [ ] Model has collisions (if needed)
   - [ ] Model has LOD levels (if large)

3. **2D Icon**
   - [ ] Icon file exists
   - [ ] Icon is 64x64 or 128x128 pixels
   - [ ] Icon has transparent background
   - [ ] Icon represents the asset clearly

4. **Scripts**
   - [ ] All script files exist
   - [ ] Scripts have no syntax errors
   - [ ] Scripts export required functions
   - [ ] Scripts are properly linked

5. **Weapon-Specific**
   - [ ] Weapon held in correct hand
   - [ ] Weapon positioned correctly
   - [ ] Weapon rotated correctly
   - [ ] Attack animations play
   - [ ] Damage values are set
   - [ ] Trail VFX works (if enabled)

6. **Armor-Specific**
   - [ ] Armor renders on character
   - [ ] Armor doesn't clip with body
   - [ ] Armor fits the slot
   - [ ] Defense values are set
   - [ ] Materials/textures load

---

## 🚨 Section 11: Error Reporting

### Q11.1: Critical Errors

**Report immediately:**

- Game crashes
- Infinite loops
- Memory leaks
- Physics explosions
- Missing critical assets

### Q11.2: Major Issues

**Report with priority:**

- Navigation failures
- Combat not working
- UI not responding
- Assets not loading
- Performance <15 FPS

### Q11.3: Minor Issues

**Report for improvement:**

- Visual glitches
- Animation stutters
- UI alignment issues
- Tooltip errors
- Sound missing

---

## 📝 Section 12: Test Results Template

```markdown
## AI Player Test Results
**Date:** YYYY-MM-DD
**Tester:** AI Player v1.0
**Scene:** Warlords Scene
**Duration:** XX minutes

### Summary
- Tests Passed: XX/XX
- Tests Failed: XX/XX
- Critical Issues: XX
- Major Issues: XX
- Minor Issues: XX

### Navigation: ✅/❌
- Terrain: ✅
- Water: ✅
- Boat: ❌ (Issue: Cannot board boat)
- Ghost Ship: ✅

### Assets: ✅/❌
- Weapons: ✅ (2/2 validated)
- Armor: ❌ (0/6 missing icons)
- Items: ✅ (5/5 validated)

### Combat: ✅/❌
- Hero Combat: ✅
- Enemy AI: ✅
- Armor Rendering: ❌ (Not implemented)

### Performance: ✅/❌
- FPS: 45 FPS (Target: >30) ✅
- Memory: 512 MB (Stable) ✅
- Load Time: 8s (Acceptable) ✅

### Critical Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

## 🎯 Section 13: Automated Testing Commands

### Q13.1: AI Player Commands

```javascript
// Navigation Test
aiPlayer.navigateTo(x, y, z);
aiPlayer.swim();
aiPlayer.boardBoat();
aiPlayer.disembarkBoat();

// Combat Test
aiPlayer.equipWeapon("sword2");
aiPlayer.attack();
aiPlayer.equipArmor("helmet", "iron_helmet");

// Asset Validation
aiPlayer.validateAsset(assetUUID);
aiPlayer.validateAllAssets();

// Performance Test
aiPlayer.measureFPS(duration);
aiPlayer.measureMemory();
aiPlayer.measureLoadTime();

// Report Generation
aiPlayer.generateReport();
aiPlayer.exportResults("test_results.json");
```

---

## ✅ Final Checklist

**Before marking testing complete:**

- [ ] All navigation systems tested
- [ ] All assets validated (UUID, model, icon, scripts)
- [ ] All weapons properly held
- [ ] All armor properly rendered
- [ ] All enemies functional
- [ ] All UI elements working
- [ ] Performance targets met
- [ ] No critical errors
- [ ] Test report generated
- [ ] Issues documented

**Testing Status:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

**End of AI Player Q&A Testing Protocol**

**Enemies to test:**

1. Slime1 (7 spawned on terrain)

### Q3.3: Armor System

**Test armor rendering and stats:**

- [ ] Equip helmet - verify renders on head
- [ ] Equip chest - verify renders on torso
- [ ] Equip gloves - verify renders on hands
- [ ] Equip legs - verify renders on legs
- [ ] Equip boots - verify renders on feet
- [ ] Verify defense stat increases
- [ ] Test armor durability (if implemented)

---

## 🎨 Section 4: UI/UX Testing

### Q4.1: HUD Elements

**Test heads-up display:**

- [ ] Health bar visible and updates
- [ ] Mana/stamina bar (if applicable)
- [ ] Minimap (if implemented)
- [ ] Quest tracker (if implemented)
- [ ] FPS counter
- [ ] Crosshair/targeting reticle

### Q4.2: Inventory System

**Test inventory UI:**

- [ ] Open inventory (I key or button)
- [ ] View all items
- [ ] Drag and drop items
- [ ] Stack items
- [ ] Use/equip items
- [ ] Drop items
- [ ] Sort/filter items

### Q4.3: Equipment Panel

**Test equipment UI:**

- [ ] Open equipment panel
- [ ] View all equipment slots
- [ ] Equip items to slots
- [ ] Unequip items
- [ ] View stat changes
- [ ] Verify visual updates on character
