# Character Progression System

A comprehensive character progression system based on the Grudge Warlords Ultimate Character Builder, featuring 8 attributes, derived stats, meta classes, power rankings, and level progression from 0-20.

## Features

### ✨ Core Systems

- **8 Primary Attributes**: Strength, Intellect, Vitality, Dexterity, Endurance, Wisdom, Agility, Tactics
- **35+ Derived Stats**: Health, Mana, Damage, Defense, Critical Chance, Attack Speed, and more
- **Level Progression**: 0-20 with exponential XP curve
- **Class System**: 6 unique classes (Warrior, Mage, Rogue, Ranger, Paladin, Necromancer)
- **Power Ranking**: 300-tier ranking system with 5 class tiers (Legendary, Warlord, Epic, Hero, Normal)
- **Combat Power**: Calculated from Effective HP, DPS, and Utility factors
- **Build Scoring**: 0-100+ score based on combat power and attribute synergy

### 🎮 Gameplay Features

- **Class Selection at Level 1**: Permanent choice that grants starting ability
- **8 Attribute Points per Level**: Total of 160 points at max level
- **Flexible Builds**: Support for Tank, Mage, Rogue, and Support archetypes
- **Synergy Bonuses**: Rewards for focused attribute allocation
- **Real-time Stat Calculation**: All derived stats update instantly

## File Structure

```
src/
├── character/
│   ├── AttributeSystem.js       # Attribute definitions and calculations
│   └── CharacterProgression.js  # Level progression and class system
└── ui/
    ├── CharacterProgressionUI.js # In-game character sheet UI
    └── ClassSelectionUI.js       # Class selection interface

examples/
└── character-progression-integration.js  # Integration examples

docs/
└── CHARACTER_PROGRESSION_SYSTEM.md  # This file
```

## Quick Start

### 1. Basic Setup

```javascript
import { CharacterProgression } from './src/character/CharacterProgression.js';
import { CharacterProgressionUI } from './src/ui/CharacterProgressionUI.js';

// Create progression system
const progression = new CharacterProgression();

// Create UI
const progressionUI = new CharacterProgressionUI(scene, progression);
progressionUI.initialize();

// Show UI
progressionUI.show();
```

### 2. Level Up

```javascript
// Add experience
const levelsGained = progression.addExperience(150);

if (levelsGained.length > 0) {
    console.log(`Level up! New levels: ${levelsGained.join(', ')}`);
    console.log(`Unspent points: ${progression.unspentPoints}`);
}
```

### 3. Class Selection (Level 1)

```javascript
import { ClassSelectionUI } from './src/ui/ClassSelectionUI.js';

const classUI = new ClassSelectionUI(scene, progression, (classKey, classData) => {
    console.log(`Selected: ${classData.name}`);
    // Grant starting ability, show tutorial, etc.
});

classUI.show();
```

### 4. Allocate Attributes

```javascript
// Allocate points
progression.allocateAttribute('Strength', 10);
progression.allocateAttribute('Vitality', 5);

// Get derived stats
const stats = progression.getStats();
console.log(`Health: ${stats.health}`);
console.log(`Damage: ${stats.damage}`);

// Get build info
const buildInfo = progression.getBuildInfo();
console.log(`Combat Power: ${buildInfo.combatPower}`);
console.log(`Rank: ${buildInfo.rank} (${buildInfo.tier.name})`);
```

### 5. Save/Load

```javascript
// Save
const saveData = progression.toJSON();
localStorage.setItem('character_progression', JSON.stringify(saveData));

// Load
const loadedData = JSON.parse(localStorage.getItem('character_progression'));
progression.fromJSON(loadedData);
```

## Attributes

### Strength

- **Focus**: Physical damage, health, defense
- **Best For**: Warriors, Tanks
- **Key Stats**: +5 Health, +1.25 Damage, +4 Defense per point

### Intellect

- **Focus**: Magical damage, mana, cooldown reduction
- **Best For**: Mages, Casters
- **Key Stats**: +9 Mana, +1.5 Magical Damage, +0.075% CDR per point

### Vitality

- **Focus**: Health pool, regeneration, survivability
- **Best For**: Tanks, Bruisers
- **Key Stats**: +25 Health, +0.06 Health Regen/s per point

### Dexterity

- **Focus**: Critical hits, attack speed, accuracy
- **Best For**: Rogues, Archers
- **Key Stats**: +0.3% Crit Chance, +0.2% Attack Speed per point

### Endurance

- **Focus**: Stamina, armor, block effectiveness
- **Best For**: Tanks, Blockers
- **Key Stats**: +6 Stamina, +5 Defense, +0.175% Block Effect per point

### Wisdom

- **Focus**: Magic resistance, mana, spell defense
- **Best For**: Anti-Mage builds
- **Key Stats**: +6 Mana, +5.5 Magical Defense, +0.25% Resistance per point

### Agility

- **Focus**: Movement speed, evasion, dodge
- **Best For**: Mobile builds, Kiting
- **Key Stats**: +0.15% Move Speed, +0.225% Evasion per point

### Tactics

- **Focus**: Ability optimization, armor penetration
- **Best For**: Versatile builds, Hybrid classes
- **Key Stats**: +0.2% Armor Pen, +0.075% Ability Cost Reduction per point
- **Special**: Grants 0.5% bonus to all stats per point invested

## Classes

### ⚔️ Warrior

- **Playstyle**: Melee combat, high survivability
- **Recommended**: Strength, Vitality, Endurance
- **Starting Ability**: Power Strike

### 🔮 Mage

- **Playstyle**: Ranged magic, burst damage
- **Recommended**: Intellect, Wisdom, Tactics
- **Starting Ability**: Fireball

### 🗡️ Rogue

- **Playstyle**: Stealth, critical strikes
- **Recommended**: Dexterity, Agility, Tactics
- **Starting Ability**: Backstab

### 🏹 Ranger

- **Playstyle**: Ranged physical, precision
- **Recommended**: Dexterity, Agility, Wisdom
- **Starting Ability**: Precision Shot

### 🛡️ Paladin

- **Playstyle**: Holy warrior, support/tank hybrid
- **Recommended**: Strength, Wisdom, Vitality
- **Starting Ability**: Divine Shield

### 💀 Necromancer

- **Playstyle**: Dark magic, life drain
- **Recommended**: Intellect, Vitality, Tactics
- **Starting Ability**: Drain Life

## Power Ranking System

### Class Tiers

| Rank Range | Tier | Color | Description |
|------------|------|-------|-------------|
| 1-10 | Legendary | Purple | Mythical power through perfect synergy |
| 11-50 | Warlord | Orange | Dominant battlefield force |
| 51-100 | Epic | Purple | Hero of renown and skill |
| 101-200 | Hero | Blue | Capable adventurer with potential |
| 201-300 | Normal | Grey | Standard combatant |

### Combat Power Formula

```javascript
// Effective Health Pool
EHP = Health × (1 + Defense/100) × (1 + Resistance/100)

// Damage Per Second
DPS = (Damage + 10) × (1 + CritChance/100 × CritDmg/100) × (1 + AttackSpeed/100)

// Utility Factor
Utility = CDR × 2 + ManaRegen × 10 + MoveSpeed × 2

// Final Combat Power
CombatPower = EHP × 0.4 + DPS × 2.5 + Utility × 5
```

### Build Score Formula

```javascript
// Base Score (0-100)
BaseScore = (CombatPower / 6000) × 100

// Synergy Bonus (0-20)
// Rewards focused builds in one of four archetypes:
Tank = Strength + Vitality + Endurance
Mage = Intellect + Wisdom + Tactics
Rogue = Dexterity + Agility + Strength
Support = Tactics + Endurance + Wisdom

SynergyBonus = Max(Tank, Mage, Rogue, Support) × 20

// Final Score
BuildScore = Min(100, BaseScore + SynergyBonus)

// Rank (1-300, lower is better)
Rank = 300 - (BuildScore / 100) × 299
```

## Derived Stats Reference

### Core Resources

- **Health**: Base 250 + attribute bonuses
- **Mana**: Base 100 + attribute bonuses
- **Stamina**: Base 100 + attribute bonuses

### Offensive Stats

- **Damage**: Physical/Magical damage output
- **Critical Chance**: % chance for critical hits
- **Critical Damage**: Multiplier for critical hits
- **Attack Speed**: % increase to attack rate
- **Accuracy**: % chance to hit targets
- **Spell Accuracy**: % chance for spells to hit

### Defensive Stats

- **Defense**: Reduces physical damage
- **Resistance**: Reduces magical damage
- **Armor**: Flat physical damage reduction
- **Block**: % chance to block attacks
- **Block Effect**: % damage reduction when blocking
- **Evasion**: % chance to dodge attacks
- **Damage Reduction**: % reduction to all damage

### Penetration Stats

- **Armor Penetration**: Bypasses enemy defense
- **Block Penetration**: Ignores enemy block chance
- **Defense Break**: Reduces enemy defense

### Regeneration Stats

- **Health Regen**: HP restored per second
- **Mana Regen**: Mana restored per second
- **Lifesteal (Drain Health)**: % of damage healed

### Utility Stats

- **Cooldown Reduction**: % reduction to ability cooldowns
- **Ability Cost**: % reduction to ability costs
- **Movement Speed**: % increase to move speed
- **Reflex Time**: Reaction time bonus

### Resistance Stats

- **CC Resistance**: Reduces crowd control duration
- **Bleed Resist**: Resistance to bleeding effects
- **Status Effect**: Reduces debuff duration
- **CDR Resist**: Counters enemy cooldown reduction
- **Defense Break Resist**: Resists armor break
- **Critical Evasion**: % chance to avoid critical hits
- **Spell Block**: % chance to negate spells

### Special Stats

- **Stagger**: Chance to interrupt enemies
- **Dodge**: Reduces dodge ability cooldown
- **Fall Damage**: Reduces fall damage taken
- **Combo Cooldown**: Reduces combo ability cooldowns

## UI Controls

### Character Progression UI

- **Open/Close**: Press `C` key (customizable)
- **Allocate Points**: Click `+` button next to attribute
- **Remove Points**: Click `-` button next to attribute
- **View Stats**: Scroll to see all derived stats
- **Close**: Click `X` button in top-right

### Class Selection UI

- **Select Class**: Click on class card
- **Confirm**: Click `YES` in confirmation dialog
- **Cancel**: Click `NO` to go back

## Integration Guide

### Step 1: Import Required Modules

```javascript
import { CharacterProgression } from './src/character/CharacterProgression.js';
import { CharacterProgressionUI } from './src/ui/CharacterProgressionUI.js';
import { ClassSelectionUI } from './src/ui/ClassSelectionUI.js';
```

### Step 2: Initialize in Your Game

```javascript
// In your game initialization
const progression = new CharacterProgression();
const progressionUI = new CharacterProgressionUI(scene, progression);
progressionUI.initialize();

// Bind keyboard shortcut
scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === 'c' || kbInfo.event.key === 'C') {
            progressionUI.toggle();
        }
    }
});
```

### Step 3: Handle Experience Gain

```javascript
// When player gains XP (e.g., from killing enemies)
function onEnemyKilled(enemy) {
    const xp = enemy.xpReward;
    const levelsGained = progression.addExperience(xp);

    if (levelsGained.length > 0) {
        // Show level up notification
        showLevelUpNotification(levelsGained);

        // Check for class selection
        if (levelsGained.includes(1)) {
            const classUI = new ClassSelectionUI(scene, progression, onClassSelected);
            classUI.show();
        }
    }
}
```

### Step 4: Apply Stats to Character

```javascript
// Update character stats from progression
function updateCharacterStats(character, progression) {
    const stats = progression.getStats();

    character.maxHealth = stats.health;
    character.maxMana = stats.mana;
    character.maxStamina = stats.stamina;
    character.damage = stats.damage;
    character.defense = stats.defense;
    character.critChance = stats.criticalChance / 100;
    character.attackSpeed = 1 + (stats.attackSpeed / 100);
    character.moveSpeed = character.baseMoveSpeed * (1 + stats.movementSpeed / 100);
    // ... apply other stats
}
```

## Best Practices

1. **Save Frequently**: Save progression data after every level up and attribute allocation
2. **Validate Input**: Always use try-catch when allocating attributes
3. **Update UI**: Call `progressionUI.updateUI()` after any progression changes
4. **Class Selection**: Only allow at level 1, enforce this in your game logic
5. **Balance**: Test different builds to ensure no single attribute is overpowered

## Customization

### Modify Attribute Gains

Edit `src/character/AttributeSystem.js`:

```javascript
export const ATTRIBUTE_DEFINITIONS = {
    Strength: {
        gains: {
            health: { label: "Health", value: 5 },  // Change this value
            // ...
        }
    }
}
```

### Add New Classes

Edit `src/character/CharacterProgression.js`:

```javascript
export const CLASSES = {
    // ... existing classes
    BERSERKER: {
        name: 'Berserker',
        description: 'Rage-fueled warrior',
        icon: '🪓',
        startingAbility: 'rage',
        recommendedAttributes: ['Strength', 'Endurance', 'Vitality'],
        color: '#dc2626'
    }
}
```

### Adjust Level Curve

Edit `src/character/CharacterProgression.js`:

```javascript
getExperienceForNextLevel() {
    // Change the formula here
    return Math.floor(100 * Math.pow(this.level + 1, 1.5));
}
```

## Troubleshooting

### UI Not Showing

- Ensure Babylon.js GUI is imported: `import * as GUI from '@babylonjs/gui'`
- Check that `progressionUI.initialize()` was called
- Verify scene is properly initialized

### Stats Not Updating

- Call `progressionUI.updateUI()` after changes
- Check console for errors in attribute allocation

### Class Selection Not Working

- Ensure player is exactly level 1
- Check that class hasn't already been selected
- Verify callback function is provided

## Examples

See `examples/character-progression-integration.js` for complete working examples of:

- Basic setup
- Level up flow
- Class selection
- Attribute allocation
- Save/load system
- Complete game integration
