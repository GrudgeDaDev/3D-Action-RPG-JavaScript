# Placement Tools - Quick Reference

## 🎯 Quick Start

### Open Editor
```
Lobby → 🎨 Game Editor
```

### Place Markers
```
1. Click "🎯 Toggle Placement Tools"
2. Select marker type
3. Click on terrain
4. Edit properties
5. Save
```

### Export Scene
```
Click "💾 Save Scene" → Downloads JSON
```

## 📋 Marker Types Cheat Sheet

| Icon | Type | Use For | Key Properties |
|------|------|---------|----------------|
| 👤 | NPC | Friendly characters | npcId, name, dialogue |
| 👹 | Enemy | Monster spawns | enemyId, level, health, damage |
| 🏪 | Vendor | Merchants | vendorId, shopType, inventory |
| 🎯 | Player Spawn | Start locations | spawnId, team, priority |
| 🌀 | Warp Point | Teleporters | targetScene, targetPosition |
| ⚡ | Respawn | Death respawn | respawnId, checkpoint |
| 📜 | Quest Giver | Quest NPCs | questGiverId, quests |
| 💎 | Treasure | Loot chests | treasureId, loot |
| ⚙️ | Trigger | Event zones | triggerId, action, radius |

## ⌨️ Keyboard Shortcuts

```
W       - Position gizmo
E       - Rotation gizmo
R       - Scale gizmo
Delete  - Remove marker
Escape  - Deselect / Exit mode
```

## 💻 Code Integration

### Load Markers at Runtime
```javascript
import { MarkerLoader } from './src/utils/markerLoader.js';
import { getAssetLibrary } from './src/assets/index.js';

const assetSystems = getAssetLibrary(scene);
const markerLoader = new MarkerLoader(scene, assetSystems);
await markerLoader.loadFromFile('./config/archipelago_scene.json');
```

### Spawn Enemy from Marker
```javascript
// Automatic via MarkerLoader
const enemy = await markerLoader.spawnFromMarker(markerData);

// Manual
const { enemyManager } = getAssetLibrary(scene);
const enemy = await enemyManager.spawn(
    markerData.data.enemyId,
    position,
    markerData.data
);
```

### Get Player Spawn
```javascript
const spawn = markerLoader.getPlayerSpawn(priority);
character.position = spawn.position.clone();
```

### Access Warp Points
```javascript
scene.meshes.forEach(mesh => {
    if (mesh.metadata?.isWarpPoint) {
        console.log('Warp to:', mesh.metadata.targetScene);
    }
});
```

## 📁 File Locations

```
src/editor/
├── MarkerDefinitions.js     # Marker configs
├── PlacementTools.js         # Core logic
└── PlacementToolsUI.js       # UI panel

src/utils/
└── markerLoader.js           # Runtime loader

src/scene/scenes/
├── archipelagoEditor.js      # Editor scene
└── archipelago.js            # Game scene (with loader)

docs/
├── PLACEMENT_TOOLS_GUIDE.md              # Full guide
├── PLACEMENT_TOOLS_IMPLEMENTATION.md     # Tech details
└── QUICK_REFERENCE_PLACEMENT_TOOLS.md    # This file
```

## 🔧 Common Tasks

### Add New Marker Type
```javascript
// 1. Add to MarkerTypes enum
export const MarkerTypes = {
    // ...
    MY_NEW_TYPE: 'my_new_type'
};

// 2. Add config
export const MarkerConfig = {
    [MarkerTypes.MY_NEW_TYPE]: {
        name: 'My New Type',
        icon: '🆕',
        color: new BABYLON.Color3(1, 0, 0),
        size: 1.5,
        defaultData: { /* properties */ }
    }
};

// 3. Add spawn handler in MarkerLoader
async spawnMyNewType(markerData, position) {
    // Implementation
}
```

### Export Markers Programmatically
```javascript
const markers = editorState.placementTools.exportMarkers();
console.log(JSON.stringify(markers, null, 2));
```

### Import Markers Programmatically
```javascript
const markers = [ /* marker data */ ];
editorState.placementTools.importMarkers(markers);
```

### Filter Markers by Type
```javascript
const enemies = placementTools.getMarkersByType('enemy');
const npcs = placementTools.getMarkersByType('npc');
```

## 🐛 Troubleshooting

**Markers not appearing?**
```javascript
// Check placement tools initialized
console.log(window.EDITOR_STATE.placementTools);

// Check markers array
console.log(placementTools.getAllMarkers());
```

**Properties not saving?**
```javascript
// Check marker metadata
console.log(marker.metadata);

// Verify save was called
marker.metadata.lastModified // Should update
```

**Runtime spawning fails?**
```javascript
// Check asset systems available
const { enemyManager, characterManager } = getAssetLibrary(scene);
console.log(enemyManager, characterManager);

// Check marker data format
console.log(markerData.type, markerData.data);
```

## 📊 JSON Structure

```json
{
    "type": "enemy",
    "position": { "x": 0, "y": 0, "z": 0 },
    "rotation": { "x": 0, "y": 0, "z": 0 },
    "data": {
        "enemyId": "slime",
        "level": 5,
        "health": 100
    },
    "createdAt": "2024-12-24T18:00:00.000Z",
    "lastModified": "2024-12-24T18:00:00.000Z"
}
```

## 🎨 Color Codes

```javascript
NPC:          Blue    (0.3, 0.7, 1.0)
Enemy:        Red     (1.0, 0.2, 0.2)
Vendor:       Gold    (1.0, 0.8, 0.2)
Player Spawn: Green   (0.2, 1.0, 0.2)
Warp:         Purple  (0.8, 0.2, 1.0)
Respawn:      Yellow  (1.0, 1.0, 0.2)
Quest:        Orange  (1.0, 0.6, 0.2)
Treasure:     Cyan    (0.2, 0.8, 0.8)
Trigger:      Gray    (0.5, 0.5, 0.5)
```

## 🚀 Performance Tips

1. **Limit Markers** - Keep under 100 per scene
2. **Use Triggers Wisely** - Large radius = more checks
3. **Batch Spawns** - Load all markers at scene start
4. **Dispose Unused** - Clear markers when changing scenes
5. **Optimize Meshes** - Use low-poly marker visuals

## 📝 Best Practices

✅ **DO:**
- Use descriptive IDs
- Test spawn points in-game
- Save frequently
- Version control JSON files
- Document custom properties

❌ **DON'T:**
- Place markers inside geometry
- Use duplicate IDs
- Edit JSON manually (use editor)
- Forget to export after changes
- Place too many enemies in one area

## 🔗 Related Systems

- **EnemyManager** - Spawns enemies from markers
- **CharacterManager** - Spawns NPCs/vendors
- **AssetLibrary** - Manages asset references
- **SceneManager** - Loads scenes with markers
- **SettingsManager** - Editor preferences

## 📞 Support

For detailed information, see:
- `docs/PLACEMENT_TOOLS_GUIDE.md` - User guide
- `docs/PLACEMENT_TOOLS_IMPLEMENTATION.md` - Technical details
- `src/editor/MarkerDefinitions.js` - Marker configs
- `src/utils/markerLoader.js` - Runtime loading

