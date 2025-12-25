# 🎮 TheForge System Integration Plan

## Overview
Complete integration of TheForge crafting/profession system into the 3D Action RPG with Capoeira animations and Racalvin character.

---

## 📦 Phase 1: Asset Organization & Capoeira Integration

### 1.1 Directory Structure
```
assets/characters/
├── animations/
│   ├── capoeira/              # NEW: Unarmed combat animations
│   │   ├── manifest.json
│   │   ├── ginga_idle.glb
│   │   ├── ginga_forward.glb
│   │   ├── armada.glb         # Spinning kick
│   │   ├── au.glb             # Cartwheel
│   │   ├── bencao.glb         # Front kick
│   │   ├── martelo.glb        # Hammer kick
│   │   ├── meia_lua.glb       # Crescent kick
│   │   ├── rasteira.glb       # Sweep
│   │   └── ... (40 total)
│   └── ... (existing animations)
├── playable/
│   ├── racalvin.glb           # NEW: Racalvin character model
│   └── ... (existing characters)
```

### 1.2 FBX to GLB Conversion Required
**Action Items:**
- [ ] Convert all 40 Capoeira FBX files to GLB format
- [ ] Convert rac.fbx (Racalvin character) to GLB
- [ ] Tools: Blender, FBX2glTF, or online converters
- [ ] Ensure animations are compatible with Mixamo rig

### 1.3 Capoeira Animation Manifest
Create `assets/characters/animations/capoeira/manifest.json`

---

## 🎯 Phase 2: Racalvin Character Integration

### 2.1 Race Configuration
Add to `config/races.json`:
```json
{
  "racalvin": {
    "name": "Racalvin",
    "description": "Agile martial artist masters of Capoeira",
    "modelPath": "./assets/characters/playable/racalvin.glb",
    "worgesModelPath": "./assets/characters/playable/racalvin_worges.glb",
    "stats": {
      "baseHealth": 90,
      "baseMana": 110,
      "baseStamina": 120,
      "strength": 8,
      "agility": 15,
      "intellect": 10,
      "defense": 7
    },
    "racialAbilities": [
      "capoeira_mastery",
      "acrobatic_dodge",
      "rhythm_of_battle"
    ],
    "preferredWeapons": ["unarmed", "staff", "dual_daggers"],
    "icon": "./assets/characters/playable/raceicons/racalvin.png"
  }
}
```

### 2.2 Character Configuration
Add to `config/character.json`

---

## ⚔️ Phase 3: Unarmed Weapon System

### 3.1 Weapon Type Configuration
Create `config/weapons.json` (if doesn't exist) or update existing:
```json
{
  "unarmed": {
    "name": "Unarmed Combat",
    "type": "melee",
    "subtype": "martial_arts",
    "damage": {
      "base": 5,
      "scaling": "agility",
      "scalingFactor": 0.8
    },
    "attackSpeed": 1.2,
    "range": 2.5,
    "staminaCost": 8,
    "animations": {
      "idle": "ginga_idle",
      "attack1": "armada",
      "attack2": "martelo",
      "attack3": "meia_lua",
      "combo1": "armada_to_esquiva",
      "dodge": "esquiva_1",
      "special": "au_to_role"
    },
    "combos": [
      ["attack1", "attack2", "attack3"],
      ["attack1", "dodge", "attack2"]
    ]
  }
}
```

---

## 🏭 Phase 4: TheForge Crafting System Integration

### 4.1 Core Systems to Create
1. **ItemDatabase.js** - Manage 590+ items from TheForge
2. **CraftingSystem.js** - Handle recipes and workstations
3. **ProfessionSystem.js** - Manage profession progression
4. **InventoryManager.js** - Player inventory with TheForge items
5. **WorkstationController.js** - 3D workstation interactions

### 4.2 Data Conversion
Convert TheForge JSON data to game format:
- `examples/crafting_data.json` → `config/crafting.json`
- `examples/TheForge-main/items_data.json` → `config/items.json`

### 4.3 Profession System
Based on `Grudge_Warlords_Professions_Guide.html`:
- Harvesting (Mining, Logging, Fishing)
- Crafting (Workbench, Furnace, Loom, Sawmill, Tannery)
- Cooking (Campfire)
- Alchemy (Study, Potion brewing)
- Combat Crafting (Arsenal, Pet Station)

---

## 📊 Phase 5: Progression Systems

### 5.1 Profession Levels
- Level 1-100 per profession
- Experience from crafting/harvesting
- Unlock recipes at specific levels
- Skill bonuses and critical success rates

### 5.2 Item Rarity System
- Common (Gray) - rarity: 0
- Uncommon (Green) - rarity: 1
- Rare (Blue) - rarity: 2
- Epic (Purple) - rarity: 3
- Legendary (Orange) - rarity: 4
- Mythic (Gold) - rarity: 5

---

## 🎨 Phase 6: UI Integration

### 6.1 Inventory UI
- Grid-based inventory system
- Drag-and-drop functionality
- Item tooltips with stats
- Rarity color coding
- Stack management

### 6.2 Crafting UI
- Workstation selection
- Recipe browser
- Ingredient requirements
- Crafting queue
- Success probability display

---

## 📝 Implementation Checklist

### Immediate Actions
- [ ] Create Capoeira animation directory
- [ ] Move FBX files (note conversion needed)
- [ ] Create Racalvin race configuration
- [ ] Create unarmed weapon configuration
- [ ] Create animation manifest for Capoeira

### Core Systems (Next)
- [ ] ItemDatabase.js implementation
- [ ] CraftingSystem.js implementation
- [ ] ProfessionSystem.js implementation
- [ ] InventoryManager.js implementation
- [ ] WorkstationController.js implementation

### Integration (Final)
- [ ] Connect to existing AssetLibrary
- [ ] Integrate with CharacterManager
- [ ] Add UI components
- [ ] Test all systems
- [ ] Documentation

---

**Status:** Ready to begin implementation
**Priority:** Phase 1 (Asset Organization) → Phase 4 (Core Systems)

