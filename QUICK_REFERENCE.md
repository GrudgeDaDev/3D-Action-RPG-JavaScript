# 🎮 Quick Reference Card

## 🌳 Skill Tree System

### Import
```javascript
import { createSkillTreeManager } from './assets/util/scripts/systems/SkillTreeManager.js';
```

### Setup
```javascript
const skillTreeManager = createSkillTreeManager(player);
skillTreeManager.updateSkillPoints();
```

### Class Skills
```javascript
const classTree = skillTreeManager.getClassTree();
classTree.changeClass('Warrior');
classTree.selectSkill(0, 0);  // Level 0, choice 0
```

### Weapon Skills
```javascript
const weaponTree = skillTreeManager.getWeaponTree();
weaponTree.changeWeapon('Sword');
weaponTree.allocatePoint(1, 0, 3);  // Tier 1, skill 0, 3 points
```

### Save/Load
```javascript
skillTreeManager.save();
skillTreeManager.load();
```

---

## 🎭 Race System

### Import
```javascript
import { createRaceManager } from './src/character/RaceManager.js';
import { createRaceSelectionUI } from './src/ui/RaceSelectionUI.js';
import { loadHeroModel } from './src/character/hero.js';
```

### Setup
```javascript
const raceManager = createRaceManager(scene);
await raceManager.loadRaceConfig();
```

### Show Selection UI
```javascript
const raceUI = createRaceSelectionUI(raceManager, async (selectedRace) => {
    // Load model
    const heroModel = await loadHeroModel(scene, character, {
        raceId: selectedRace.id,
        raceManager: raceManager
    });
    
    // Apply bonuses
    raceManager.applyRaceBonuses(characterData, selectedRace.id);
});

await raceUI.show();
```

### Load Saved Race
```javascript
if (raceManager.load()) {
    const currentRace = raceManager.getCurrentRace();
    const heroModel = await loadHeroModel(scene, character, {
        raceId: currentRace.id,
        raceManager: raceManager
    });
}
```

### Worges Transformation
```javascript
await raceManager.transformToWorges(character, raceId);
await raceManager.transformToNormal(character, raceId);
```

---

## 📊 Quick Stats

### Classes
- ⚔️ Warrior (Tank/DPS/Support)
- 🏹 Ranger (DPS/Utility)
- 🔮 Mage (Healer/DPS)
- 🐺 Worg (Shapeshifter)

### Weapons
- ⚔️ Sword (Balanced)
- 🏹 Bow (Ranged)
- 🪄 Staff (Magic: Fire/Ice/Lightning)
- 🗡️ Dagger (Stealth/Crit)
- 🪓 Axe (Heavy)
- 🔨 Hammer (Control)

### Races
- 👤 Human (Balanced)
- 🧝 Elf (Magic/Agility)
- 🧔 Dwarf (Tank/Strength)
- 👹 Orc (Power/DPS)
- ⚔️ Barbarian (Stamina/Wild)
- 💀 Undead (Magic/Undead)

---

## 📁 Key Files

### Skill Trees
- `assets/util/scripts/systems/ClassSkillTree.js`
- `assets/util/scripts/systems/WeaponSkillTree.js`
- `assets/util/scripts/systems/SkillTreeManager.js`

### Race System
- `config/races.json`
- `src/character/RaceManager.js`
- `src/character/hero.js`
- `src/ui/RaceSelectionUI.js`

### Examples
- `examples/skill-tree-integration-example.js`
- `examples/race-system-integration-example.js`

### Documentation
- `SKILL_TREE_CONSOLIDATION_SUMMARY.md`
- `RACE_SYSTEM_SUMMARY.md`
- `COMPLETE_SYSTEMS_SUMMARY.md`

---

## 🚀 Complete Integration

```javascript
// 1. Create character
const character = new BABYLON.TransformNode('player', scene);

// 2. Initialize race system
const raceManager = createRaceManager(scene);
await raceManager.loadRaceConfig();

// 3. Show race selection
const raceUI = createRaceSelectionUI(raceManager, async (selectedRace) => {
    // Load race model
    const heroModel = await loadHeroModel(scene, character, {
        raceId: selectedRace.id,
        raceManager: raceManager
    });
    
    // Create character data
    const characterData = {
        health: 100, maxHealth: 100,
        mana: 100, maxMana: 100,
        stamina: 100, maxStamina: 100,
        strength: 10, agility: 10, intelligence: 10
    };
    
    // Apply race bonuses
    raceManager.applyRaceBonuses(characterData, selectedRace.id);
    
    // Initialize skill trees
    const skillTreeManager = createSkillTreeManager(characterData);
    skillTreeManager.updateSkillPoints();
    
    // Select starting class
    const classTree = skillTreeManager.getClassTree();
    classTree.changeClass('Warrior');
    classTree.selectSkill(0, 0);  // Starting skill
    
    console.log('✅ Character ready!');
});

await raceUI.show();
```

---

## 💡 Tips

1. **Race Selection**: Always show race selection before class selection
2. **Skill Points**: Update skill points when player levels up
3. **Save Often**: Both systems auto-save to localStorage
4. **Model Caching**: RaceManager caches models for performance
5. **Worges Forms**: Only available for Worg class

---

## 🎯 Common Patterns

### Character Creation Flow
1. Show race selection UI
2. Load selected race model
3. Apply race bonuses
4. Initialize skill trees
5. Select starting class
6. Allocate starting skills

### Level Up Flow
1. Update skill points
2. Show skill tree UI
3. Allow player to allocate points
4. Apply new abilities

### Race Change (Respec)
1. Remove old model
2. Load new race model
3. Recalculate stats
4. Save changes

---

## ✨ Features at a Glance

- ✅ 4 Classes × 6 Levels = 60+ class skills
- ✅ 6 Weapons × 3 Tiers = 50+ weapon skills
- ✅ 6 Races × unique bonuses
- ✅ 12 Worges variants
- ✅ Beautiful UIs
- ✅ Save/Load systems
- ✅ Model caching
- ✅ Complete integration

**Total**: 110+ skills, 6 races, 4 classes, 6 weapons! 🎮

