# GRUDA Equipment System - Complete Reference

## Overview

The GRUDA Equipment System is an **Albion Online-inspired** progression system with three dimensions of equipment advancement:

1. **Tiers** (T1-T8): Base power level
2. **Quality** (Novice-Legendary): Crafting quality/enchantment level  
3. **Class Specialization** (Berserker, Guardian, Mystic, Warrior): Class-specific bonuses

---

## Equipment Structure

### Location
```
Assets/uMMORPG/Resources/Items/GRUDA Equipment/
├── Weapons/
│   ├── Sword/
│   ├── Axe/
│   ├── Bow/
│   ├── Crossbow/
│   ├── Dagger/
│   ├── Greataxe/
│   ├── Greatsword/
│   ├── Hammer/
│   ├── Mace/
│   ├── Quarterstaff/
│   ├── Fire Staff/
│   ├── Frost Staff/
│   ├── Holy Staff/
│   ├── Nature Staff/
│   ├── Arcane Staff/
│   └── Cursed Staff/
└── Armor/
    ├── Cloth/ (Helmet, Chest, Gloves, Boots)
    ├── Leather/ (Helmet, Chest, Gloves, Boots)
    └── Plate/ (Helmet, Chest, Gloves, Boots)
```

### Weapon Types (16 Total)

**Melee Weapons:**
- Sword (One-handed, balanced)
- Axe (One-handed, high damage)
- Mace (One-handed, armor penetration)
- Dagger (One-handed, fast attacks)
- Hammer (Two-handed, crowd control)
- Greataxe (Two-handed, high damage)
- Greatsword (Two-handed, area attacks)
- Quarterstaff (Two-handed, defensive)

**Ranged Weapons:**
- Bow (Physical ranged, high mobility)
- Crossbow (Physical ranged, high damage)

**Magic Weapons (Staves):**
- Fire Staff (Fire damage, burst)
- Frost Staff (Ice damage, crowd control)
- Holy Staff (Healing, support)
- Nature Staff (Healing, damage over time)
- Arcane Staff (Arcane damage, utility)
- Cursed Staff (Dark damage, debuffs)

### Armor Types (3 Total)

**Cloth Armor:**
- Best for: Mages, Healers
- Bonuses: Mana, Magic Damage, Cooldown Reduction
- Slots: Helmet, Chest, Gloves, Boots

**Leather Armor:**
- Best for: Rangers, Rogues
- Bonuses: Energy, Attack Speed, Critical Chance
- Slots: Helmet, Chest, Gloves, Boots

**Plate Armor:**
- Best for: Warriors, Tanks
- Bonuses: Health, Defense, Block Chance
- Slots: Helmet, Chest, Gloves, Boots

---

## Tier System (T1-T8)

### Tier Progression

| Tier | Level Req | Power Level | Description |
|------|-----------|-------------|-------------|
| **T1** | 1 | Beginner | Starting equipment |
| **T2** | 10 | Basic | Early game progression |
| **T3** | 20 | Improved | Mid-early game |
| **T4** | 30 | Advanced | Mid game |
| **T5** | 40 | Expert | Mid-late game |
| **T6** | 50 | Master | Late game |
| **T7** | 60 | Grandmaster | End game |
| **T8** | 70 | Legendary | Max tier |

### Tier Stat Scaling

**Base Formula:**
- **Damage/Defense** = Base × (1 + (Tier - 1) × 0.25)
- **Health/Mana Bonus** = Base × (1 + (Tier - 1) × 0.30)
- **Durability** = 1000 + (Tier × 100)

**Example (T1 Sword):**
- Damage Bonus: 10
- Durability: 1100
- Buy Price: 150 gold
- Sell Price: 75 gold

**Example (T8 Sword):**
- Damage Bonus: 27 (10 × (1 + 7 × 0.25))
- Durability: 1800
- Buy Price: 1200 gold
- Sell Price: 600 gold

---

## Quality System (Novice-Legendary)

### Quality Levels (8 Total)

| Quality | Bonus Multiplier | Description |
|---------|------------------|-------------|
| **Novice** | 1.0× | Base quality |
| **Apprentice** | 1.1× | +10% stats |
| **Journeyman** | 1.2× | +20% stats |
| **Adept** | 1.3× | +30% stats |
| **Expert** | 1.4× | +40% stats |
| **Master** | 1.5× | +50% stats |
| **Grandmaster** | 1.6× | +60% stats |
| **Legendary** | 1.8× | +80% stats |

### Quality Folder Structure

Each weapon/armor type has quality subfolders:
```
Sword/
├── T1 Sword.asset (Base tier item)
├── T2 Sword.asset
├── ...
├── Novice/
│   ├── Berserker/
│   ├── Guardian/
│   ├── Mystic/
│   └── Warrior/
├── Apprentice/
│   ├── Berserker/
│   ├── Guardian/
│   ├── Mystic/
│   └── Warrior/
└── ... (continues for all quality levels)
```

---

## Class Specialization System

### Classes (4 Total)

**Berserker:**
- Focus: High damage, offense
- Bonuses: +Damage, +Critical Chance, +Attack Speed
- Best Weapons: Greataxe, Greatsword, Axe
- Best Armor: Leather

**Guardian:**
- Focus: Defense, tanking
- Bonuses: +Health, +Defense, +Block Chance
- Best Weapons: Hammer, Mace, Sword
- Best Armor: Plate

**Mystic:**
- Focus: Magic damage, mana
- Bonuses: +Mana, +Magic Damage, +Cooldown Reduction
- Best Weapons: Fire/Frost/Arcane/Cursed Staff
- Best Armor: Cloth

**Warrior:**
- Focus: Balanced, versatile
- Bonuses: +Health, +Damage, +Defense (balanced)
- Best Weapons: Sword, Quarterstaff, Bow
- Best Armor: Leather or Plate

---

## Equipment Sets

### Set Bonus System

Equipment sets provide additional bonuses when multiple pieces are equipped.

**Set Types:**
1. **Class Sets** - 4 pieces (Helmet, Chest, Gloves, Boots) of same class
2. **Tier Sets** - All equipment of same tier
3. **Quality Sets** - All equipment of same quality

**Set Bonus Examples:**

**Berserker Set (4 pieces):**
- 2 pieces: +5% Critical Chance
- 4 pieces: +10% Damage, +10% Attack Speed

**Guardian Set (4 pieces):**
- 2 pieces: +100 Health
- 4 pieces: +10% Defense, +5% Block Chance

**Mystic Set (4 pieces):**
- 2 pieces: +50 Mana
- 4 pieces: +10% Magic Damage, -10% Cooldown

**Warrior Set (4 pieces):**
- 2 pieces: +50 Health, +5% Damage
- 4 pieces: +5% Defense, +5% Critical Chance

---

## Weapon Skills System

### How Weapon Skills Work

1. **Each weapon has a ScriptableWeaponSkillList**
2. **Weapon skill lists contain 3-5 skills**
3. **Skills auto-populate skillbar slots 0-4 when weapon is equipped**
4. **Different tiers can have different skill lists**

### Weapon Skill List Structure

```
Sword Skills (T1-T3):
- Slot 0: Basic Slash (Auto-attack)
- Slot 1: Power Strike (Damage skill)
- Slot 2: Defensive Stance (Defensive skill)

Sword Skills (T4-T6):
- Slot 0: Enhanced Slash (Better auto-attack)
- Slot 1: Crushing Blow (Higher damage)
- Slot 2: Shield Wall (Better defense)
- Slot 3: Whirlwind (AoE attack)

Sword Skills (T7-T8):
- Slot 0: Master Slash (Best auto-attack)
- Slot 1: Devastating Strike (Highest damage)
- Slot 2: Fortress (Best defense)
- Slot 3: Blade Storm (Large AoE)
- Slot 4: Execute (Finisher skill)
```

---

## Next Steps

See these additional guides:
- **EQUIPMENT_STAT_FORMULAS.md** - Detailed stat calculations
- **WEAPON_SKILL_LISTS_GUIDE.md** - Creating weapon skill lists
- **EQUIPMENT_SETS_GUIDE.md** - Creating equipment sets
- **EQUIPMENT_CHECKLIST.md** - Validation checklist

