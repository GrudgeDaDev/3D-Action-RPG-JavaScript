# ⚔️ Character Progression System

A complete character progression system migrated from the Grudge Warlords Ultimate Character Builder HTML into an in-game Babylon.js implementation.

## 🎮 Quick Start

### 1. Try the Demo
Open `examples/character-progression-demo.html` in your browser:
- Press **C** to open character sheet
- Press **L** to gain XP and level up
- Press **R** to reset
- Press **S** to save

### 2. Integrate into Your Game

```javascript
import { CharacterProgression } from './src/character/CharacterProgression.js';
import { CharacterProgressionUI } from './src/ui/CharacterProgressionUI.js';

// Initialize
const progression = new CharacterProgression();
const progressionUI = new CharacterProgressionUI(scene, progression);
progressionUI.initialize();

// Bind keyboard (C key)
scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === 'c') {
        progressionUI.toggle();
    }
});

// Add XP
const levelsGained = progression.addExperience(150);
if (levelsGained.length > 0) {
    console.log('Level up!', levelsGained);
}

// Get stats
const stats = progression.getStats();
character.maxHealth = stats.health;
character.damage = stats.damage;
```

## 📁 File Structure

```
src/
├── character/
│   ├── AttributeSystem.js          # 8 attributes, 35+ stats, formulas
│   └── CharacterProgression.js     # Levels 0-20, XP, classes
└── ui/
    ├── CharacterProgressionUI.js   # Main character sheet
    └── ClassSelectionUI.js         # Class selection modal

examples/
├── character-progression-demo.html              # Standalone demo
└── character-progression-integration.js         # Integration examples

docs/
├── CHARACTER_PROGRESSION_SYSTEM.md              # Full documentation
└── CHARACTER_PROGRESSION_MIGRATION.md           # Migration details
```

## ✨ Features

### 8 Primary Attributes
- 💪 **Strength** - Physical power, health, defense
- 🧠 **Intellect** - Magic damage, mana, cooldowns
- ❤️ **Vitality** - Health pool, regeneration
- 🎯 **Dexterity** - Crits, attack speed, accuracy
- 🛡️ **Endurance** - Stamina, armor, blocking
- 📖 **Wisdom** - Magic resistance, mana
- ⚡ **Agility** - Movement, evasion, dodge
- 🎖️ **Tactics** - Abilities, penetration, versatility

### 35+ Derived Stats
Health, Mana, Stamina, Damage, Defense, Critical Chance, Attack Speed, Movement Speed, Evasion, Block, Armor Penetration, Cooldown Reduction, and more!

### 6 Classes (Selected at Level 1)
- ⚔️ **Warrior** - Melee combat specialist
- 🔮 **Mage** - Arcane spellcaster
- 🗡️ **Rogue** - Stealth assassin
- 🏹 **Ranger** - Precision marksman
- 🛡️ **Paladin** - Holy warrior
- 💀 **Necromancer** - Dark magic wielder

### Level Progression (0-20)
- 8 attribute points per level
- 160 total points at max level
- Exponential XP curve
- Class selection at level 1

### Power Ranking System
- **Combat Power** calculation (EHP + DPS + Utility)
- **Build Score** (0-100+) with synergy bonuses
- **Rank** (1-300, lower is better)
- **Class Tiers**: Legendary, Warlord, Epic, Hero, Normal

## 🔧 API Reference

### CharacterProgression

```javascript
// Create
const progression = new CharacterProgression();

// Level up
progression.addExperience(150);  // Returns array of levels gained

// Select class (level 1 only)
progression.selectClass('WARRIOR');

// Allocate attributes
progression.allocateAttribute('Strength', 10);

// Get stats
const stats = progression.getStats();
const buildInfo = progression.getBuildInfo();

// Save/Load
const saveData = progression.toJSON();
progression.fromJSON(saveData);
```

### CharacterProgressionUI

```javascript
// Create and initialize
const ui = new CharacterProgressionUI(scene, progression);
ui.initialize();

// Show/Hide
ui.show();
ui.hide();
ui.toggle();

// Update
ui.updateUI();
```

### ClassSelectionUI

```javascript
// Show class selection
const classUI = new ClassSelectionUI(scene, progression, (classKey, classData) => {
    console.log(`Selected: ${classData.name}`);
});
classUI.show();
```

## 📊 Formulas

### Combat Power
```
EHP = Health × (1 + Defense/100) × (1 + Resistance/100)
DPS = (Damage + 10) × (1 + CritChance/100 × CritDmg/100) × (1 + AttackSpeed/100)
Utility = CDR × 2 + ManaRegen × 10 + MoveSpeed × 2
CombatPower = EHP × 0.4 + DPS × 2.5 + Utility × 5
```

### Build Score
```
BaseScore = (CombatPower / 6000) × 100
SynergyBonus = Max(Tank, Mage, Rogue, Support) × 20
BuildScore = Min(100, BaseScore + SynergyBonus)
Rank = 300 - (BuildScore / 100) × 299
```

## 📚 Documentation

- **Full System Docs**: `docs/CHARACTER_PROGRESSION_SYSTEM.md`
- **Migration Guide**: `docs/CHARACTER_PROGRESSION_MIGRATION.md`
- **Integration Examples**: `examples/character-progression-integration.js`
- **Original HTML**: `examples/Grudge_Warlords_-_Ultimate_Character_Builder_v2.html`

## 🎯 Next Steps

1. **Test the demo** - Open `examples/character-progression-demo.html`
2. **Read the docs** - See `docs/CHARACTER_PROGRESSION_SYSTEM.md`
3. **Integrate** - Follow examples in `examples/character-progression-integration.js`
4. **Customize** - Modify attributes, classes, or formulas as needed

## 🐛 Troubleshooting

**UI not showing?**
- Import `@babylonjs/gui`
- Call `ui.initialize()` before showing
- Check console for errors

**Stats not updating?**
- Call `ui.updateUI()` after changes
- Verify attribute allocation succeeded

**Class selection not working?**
- Ensure player is level 1
- Check class hasn't been selected already

## 🚀 Features Migrated from HTML

✅ 8 Primary Attributes with full stat gains  
✅ 35+ Derived Stats with real-time calculation  
✅ Power Ranking System (300 tiers)  
✅ Combat Power Formula  
✅ Build Scoring with synergy bonuses  
✅ Meta Class Detection  
✅ Tooltips and descriptions  

## 🆕 New Features Added

✅ Level Progression (0-20)  
✅ Class Selection System (6 classes)  
✅ In-Game Babylon.js GUI  
✅ Save/Load System  
✅ XP and leveling mechanics  
✅ Interactive attribute allocation  

---

**Ready to use!** Start with the demo, then integrate into your game. 🎮

