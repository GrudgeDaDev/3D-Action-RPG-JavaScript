# Tile & Texture System Guide

## Overview

The Tile & Texture System provides a comprehensive framework for managing building tiles, parts, and textures for procedural generation and manual building in your 3D Action RPG.

## System Components

### 1. Tile/Texture Catalog (`config/tiles-catalog.json`)

Central configuration file that defines:
- **Building Parts**: Floors, walls, roofs, doors, foundations, props
- **Textures**: Terrain, interior, effects textures
- **Categories**: Organized grouping of assets
- **Tags**: Searchable metadata

### 2. TileTextureManager (`src/assets/TileTextureManager.js`)

Core manager class that handles:
- Loading and indexing building parts from GLB files
- Texture loading and caching
- Part instantiation with physics and shadows
- Search and filtering capabilities

### 3. TileBasedGenerator (`src/scene/gen/procedural/TileBasedGenerator.js`)

Procedural generation system that:
- Generates rooms and buildings from tiles
- Adds props and decorations
- Manages generated structures
- Provides cleanup utilities

### 4. TileBrowserPanel (`src/ui/TileBrowserPanel.js`)

Interactive UI for:
- Browsing available tiles
- Filtering by category
- Searching by name/tags
- Selecting tiles for placement

## Quick Start

### Basic Usage

```javascript
import { createTileBasedGenerator } from './src/scene/gen/procedural/TileBasedGenerator.js';
import { createTileBrowserPanel } from './src/ui/TileBrowserPanel.js';

// Initialize in your scene
const tileGenerator = createTileBasedGenerator(scene);
await tileGenerator.initialize();

// Create UI
const tileBrowser = createTileBrowserPanel(tileGenerator.getTileManager());
tileBrowser.createPanel();
```

### Generate a Room

```javascript
const position = new BABYLON.Vector3(0, 0, 0);
const room = tileGenerator.generateRoom(position, 4, 4, {
    cellSize: 5,
    wallHeight: 5
});

// Add props
tileGenerator.addPropsToStructure(room, 0.3);
```

### Generate a Building

```javascript
const position = new BABYLON.Vector3(50, 0, 0);
const building = tileGenerator.generateBuilding(position, 3, {
    roomWidth: 3,
    roomDepth: 3,
    cellSize: 5
});
```

### Place Individual Parts

```javascript
const tileManager = tileGenerator.getTileManager();

// Place a floor tile
const floorPos = new BABYLON.Vector3(10, 0, 10);
const floor = tileManager.createPartInstance('floor_basic', floorPos, {
    physics: true,
    receiveShadows: true
});

// Place a wall
const wallPos = new BABYLON.Vector3(15, 5, 10);
const wall = tileManager.createPartInstance('wall_wood', wallPos, {
    physics: true
});
```

## Available Building Parts

### Floors
- `floor_basic` - Basic floor tile

### Walls
- `wall_window` - Wall with window
- `wall_wood` - Wooden wall

### Roofs
- `roof_flat_flat` - Flat roof (both sides)
- `roof_flat_inset` - Flat-inset roof
- `roof_flat_outset` - Flat-outset roof

### Doors
- `door_basic` - Basic door

### Foundations
- `stone_base` - Stone foundation

### Props
- `barrel` - Storage barrel
- `chair_good` - Quality chair
- `rug` - Decorative rug

## Available Textures

### Terrain Textures
- `grass` - Grass texture
- `rock` - Rock texture
- `floor` - Floor texture
- `tile` - Tile texture
- `tile_dark` - Dark tile texture
- `grass_rock` - Grass-rock transition
- `floor_rock` - Floor-rock transition
- `rock_dark` - Dark rock texture

### Interior Textures
- `wood` - Wood texture

### Effect Textures
- `smoke` - Smoke particle
- `cloud` - Cloud particle
- `fog_swirl` - Fog swirl (3 variations)
- `flare` - Light flare
- `ripple` - Water ripple
- `bar` - UI bar

## Keyboard Controls (Builder Integration)

When using `builder-tile-integration.js`:

- **T** - Toggle Tile Browser
- **G** - Generate test room
- **B** - Generate test building
- **C** - Clear all structures
- **Left Click** - Place selected tile
- **Right Click** - Cancel placement
- **ESC** - Cancel placement mode

## Advanced Features

### Search and Filter

```javascript
// Search by name or tag
const results = tileManager.searchParts('wood');

// Get parts by category
const walls = tileManager.getPartsByCategory('walls');

// Get parts by tag
const furniture = tileManager.getPartsByTag('furniture');
```

### Custom Part Placement

```javascript
const part = tileManager.createPartInstance('chair_good', position, {
    physics: true,
    receiveShadows: true,
    rotation: new BABYLON.Vector3(0, Math.PI / 2, 0),
    scaling: new BABYLON.Vector3(1.5, 1.5, 1.5)
});
```

### Load Textures

```javascript
const texture = await tileManager.loadTexture('grass');
if (texture) {
    material.diffuseTexture = texture;
}
```

### Generate a Village

```javascript
import { generateVillage } from './src/scene/scenes/builder-tile-integration.js';

const centerPos = new BABYLON.Vector3(0, 0, 0);
const village = await generateVillage(tileGenerator, centerPos, 5);
```

## Adding New Tiles

### 1. Add to GLB Model
Add your new mesh to `assets/env/builder/parts.glb`

### 2. Update Catalog
Edit `config/tiles-catalog.json`:

```json
{
  "id": "my_new_tile",
  "name": "My New Tile",
  "meshName": "MyNewTileMeshName",
  "category": "floor",
  "tags": ["custom", "special"],
  "positionOffset": { "x": 0, "y": 0, "z": 0 }
}
```

### 3. Reload
The system will automatically index the new part on initialization.

## Adding New Textures

### 1. Add Texture File
Place your texture in the appropriate folder:
- Terrain: `assets/textures/terrain/`
- Interior: `assets/textures/interior/`
- Effects: `assets/textures/effects/`

### 2. Update Catalog
Edit `config/tiles-catalog.json`:

```json
{
  "id": "my_texture",
  "name": "My Texture",
  "file": "my_texture.png",
  "type": "diffuse",
  "tags": ["custom"],
  "tiling": { "u": 10, "v": 10 }
}
```

## Best Practices

1. **Use Categories**: Organize parts by category for easier browsing
2. **Tag Everything**: Add descriptive tags for better searchability
3. **Set Position Offsets**: Define proper offsets in the catalog to avoid manual adjustments
4. **Enable Physics**: Use `physics: true` for walkable/collidable objects
5. **Cache Textures**: The system automatically caches loaded textures
6. **Clean Up**: Use `clearStructures()` to remove generated content

## Troubleshooting

### Parts Not Loading
- Check that `parts.glb` exists at `assets/env/builder/parts.glb`
- Verify mesh names in the GLB match the catalog
- Check browser console for errors

### Textures Not Appearing
- Verify texture paths in catalog
- Check file extensions (png, jpg, jpeg)
- Ensure textures are in the correct folders

### Physics Issues
- Make sure physics is enabled in scene
- Check that aggregates are created with `physics: true`
- Verify mesh has proper geometry

## Future Enhancements

- [ ] Texture preview in browser
- [ ] 3D preview of parts
- [ ] Drag-and-drop placement
- [ ] Rotation controls
- [ ] Snap-to-grid options
- [ ] Save/load building templates
- [ ] Multi-select and bulk operations
- [ ] Material customization per instance

