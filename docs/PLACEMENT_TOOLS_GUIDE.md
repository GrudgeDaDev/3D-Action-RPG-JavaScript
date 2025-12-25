# Placement Tools Guide

## Overview

The Placement Tools system allows you to visually place and configure game entities in the Archipelago Editor. This includes NPCs, enemies, vendors, spawn points, warp points, and more.

## Features

- **Visual Marker Placement** - Click to place markers in the 3D scene
- **Property Editing** - Edit marker properties through an intuitive UI
- **Import/Export** - Save and load marker configurations as JSON
- **Multiple Marker Types** - Support for 9 different entity types
- **Real-time Preview** - See marker placement before confirming

## Marker Types

### 👤 NPC (Non-Player Character)
- **Purpose**: Place friendly NPCs in the world
- **Properties**:
  - `npcId`: Unique identifier
  - `name`: Display name
  - `dialogue`: Array of dialogue lines
  - `questIds`: Associated quest IDs
  - `shopItems`: Items for sale (if vendor)
  - `behavior`: AI behavior pattern (idle, patrol, etc.)

### 👹 Enemy Spawn
- **Purpose**: Define enemy spawn locations
- **Properties**:
  - `enemyId`: Enemy template ID
  - `level`: Enemy level
  - `health`: HP amount
  - `damage`: Attack damage
  - `respawnTime`: Seconds until respawn
  - `patrolRadius`: Patrol area size
  - `aggressive`: Auto-attack on sight

### 🏪 Vendor
- **Purpose**: Place merchant NPCs
- **Properties**:
  - `vendorId`: Unique identifier
  - `name`: Vendor name
  - `shopType`: general, weapons, armor, potions, etc.
  - `inventory`: Items for sale
  - `buyMultiplier`: Price multiplier for buying
  - `sellMultiplier`: Price multiplier for selling

### 🎯 Player Spawn
- **Purpose**: Define player spawn locations
- **Properties**:
  - `spawnId`: Unique identifier
  - `team`: Team assignment
  - `priority`: Spawn priority (0 = highest)
  - `respawnPoint`: Use as respawn location

### 🌀 Warp Point
- **Purpose**: Create teleportation points
- **Properties**:
  - `warpId`: Unique identifier
  - `targetScene`: Destination scene name
  - `targetPosition`: Destination coordinates
  - `requiresItem`: Required item to use
  - `requiresQuest`: Required quest completion

### ⚡ Respawn Point
- **Purpose**: Player death respawn locations
- **Properties**:
  - `respawnId`: Unique identifier
  - `team`: Team assignment
  - `checkpoint`: Acts as checkpoint

### 📜 Quest Giver
- **Purpose**: NPCs that give quests
- **Properties**:
  - `questGiverId`: Unique identifier
  - `name`: NPC name
  - `quests`: Available quest IDs
  - `dialogue`: Quest-related dialogue

### 💎 Treasure
- **Purpose**: Loot containers and treasure chests
- **Properties**:
  - `treasureId`: Unique identifier
  - `loot`: Items contained
  - `respawnTime`: Seconds until respawn
  - `requiresKey`: Required key item

### ⚙️ Trigger Zone
- **Purpose**: Event triggers and scripted zones
- **Properties**:
  - `triggerId`: Unique identifier
  - `triggerType`: enter, exit, interact
  - `action`: Script or event to trigger
  - `radius`: Trigger zone size
  - `oneTime`: Trigger only once

## How to Use

### Accessing the Editor

1. Launch the game
2. From the lobby, select **"🎨 Game Editor"**
3. The Archipelago Editor will load with all islands

### Placing Markers

1. Click **"🎯 Toggle Placement Tools"** in the Tools Panel
2. Select a marker type from the Placement Tools panel
3. Move your mouse over the terrain - a preview marker will appear
4. Click to place the marker
5. A properties panel will open automatically
6. Edit the marker properties
7. Click **"💾 Save"** to confirm

### Editing Existing Markers

1. Click on a placed marker in the scene
2. The properties panel will open
3. Modify the properties as needed
4. Click **"💾 Save"** to apply changes

### Saving Your Work

1. Click **"💾 Save Scene"** in the Tools Panel
2. A JSON file will download with:
   - Island transformations
   - All placed markers and their properties
   - Metadata (timestamp, version)

### Loading Saved Scenes

1. Click **"📂 Load Scene"** in the Tools Panel
2. Select a previously saved JSON file
3. The scene will restore:
   - Island positions/rotations/scales
   - All markers with their properties

## File Structure

```
src/editor/
├── MarkerDefinitions.js    # Marker type definitions and configs
├── PlacementTools.js        # Core placement logic
└── PlacementToolsUI.js      # UI panel for placement tools

src/scene/scenes/
└── archipelagoEditor.js     # Editor scene integration
```

## Integration with Game Systems

### Enemy Manager Integration

Enemies placed with the placement tools can be spawned using the EnemyManager:

```javascript
import { getAssetLibrary } from './src/assets/index.js';

const { enemyManager } = getAssetLibrary(scene);

// Spawn enemy from marker data
const marker = placementTools.getMarkersByType('enemy')[0];
const enemy = await enemyManager.spawn(
    marker.metadata.markerData.enemyId,
    marker.position,
    {
        level: marker.metadata.markerData.level,
        health: marker.metadata.markerData.health
    }
);
```

### Loading Markers at Runtime

```javascript
// In your scene creation function
async function createArchipelago(engine) {
    const scene = new BABYLON.Scene(engine);
    
    // Load scene data
    const sceneData = await fetch('./config/archipelago_scene.json').then(r => r.json());
    
    // Spawn enemies from markers
    sceneData.markers
        .filter(m => m.type === 'enemy')
        .forEach(async marker => {
            await enemyManager.spawn(
                marker.data.enemyId,
                new BABYLON.Vector3(marker.position.x, marker.position.y, marker.position.z),
                marker.data
            );
        });
    
    // Setup player spawn
    const playerSpawn = sceneData.markers.find(m => m.type === 'player_spawn');
    if (playerSpawn) {
        camera.position = new BABYLON.Vector3(
            playerSpawn.position.x,
            playerSpawn.position.y,
            playerSpawn.position.z
        );
    }
}
```

## Best Practices

1. **Use Descriptive IDs** - Give markers meaningful IDs for easy reference
2. **Test Spawn Points** - Verify player spawns don't clip into geometry
3. **Balance Enemy Placement** - Consider difficulty and player progression
4. **Save Frequently** - Export your scene regularly to avoid data loss
5. **Version Control** - Keep scene JSON files in version control
6. **Document Custom Properties** - Add comments in JSON for complex setups

## Keyboard Shortcuts

- **W** - Position gizmo (move markers)
- **E** - Rotation gizmo (rotate markers)
- **R** - Scale gizmo (scale markers)
- **Delete** - Remove selected marker
- **Escape** - Deselect marker / Exit placement mode

## Troubleshooting

**Markers not appearing?**
- Check that the Placement Tools panel is visible
- Ensure you've selected a marker type
- Verify you're clicking on valid terrain

**Properties not saving?**
- Make sure to click "💾 Save" in the properties panel
- Check browser console for errors

**Scene not loading?**
- Verify JSON file format is correct
- Check that marker types match defined types
- Ensure position/rotation arrays have 3 values

## Future Enhancements

- [ ] Snap to grid option
- [ ] Marker grouping and layers
- [ ] Copy/paste markers
- [ ] Marker search and filter
- [ ] Undo/redo support
- [ ] Multi-select and bulk edit
- [ ] Marker templates and presets

