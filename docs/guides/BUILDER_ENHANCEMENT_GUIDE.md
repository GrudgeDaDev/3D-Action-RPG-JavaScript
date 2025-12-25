# Builder Enhancement Guide

## 🎯 Current State Analysis

### Existing Tools

1. **Place Tool** - Floor tile placement
2. **Raise Tool** - Terrain sculpting (Raise/Lower/Flatten/Path)
3. **Settings Tool** - Save/Load worlds

### Existing Assets

- `env/builder/parts.glb` - Building parts (Floor, Walls, Doors, Roofs, etc.)
- `env/exterior/grass/grass.glb` - Vegetation
- Multiple scene-specific GLB models

---

## 🛠️ Tools You Can Add

### 1. **Model Placement Tool**

**Purpose:** Place any GLB model from your assets library

**Implementation:**

```javascript
// In tools.js, add:
const modelSubTools = [
    { name: 'Tree', model: 'env/exterior/trees/tree.glb' },
    { name: 'Rock', model: 'env/exterior/rocks/rock.glb' },
    { name: 'Building', model: 'env/builder/parts.glb' }
];

tools.tools.models = new ModelPlacement("Models", scene, meshes, grid, tools, 
    "./assets/util/ui/icons/model.png", modelSubTools);
```

### 2. **Vegetation/Foliage Tool**

**Purpose:** Paint grass, trees, bushes

**Features:**

- Brush-based placement
- Density control
- Random rotation/scale
- Auto-snap to terrain height

### 3. **Water Tool**

**Purpose:** Create water bodies

**Features:**

- Paint water areas
- Set water level
- Adjust water properties (color, reflectivity)

### 4. **Lighting Tool**

**Purpose:** Place and configure lights

**Sub-tools:**

- Point lights
- Directional lights
- Spotlights
- Ambient settings

### 5. **Props/Decoration Tool**

**Purpose:** Place decorative objects

**Categories:**

- Furniture (from inn.glb)
- Barrels, crates (from parts.glb)
- NPCs/Characters
- Interactive objects

### 6. **Texture/Material Tool**

**Purpose:** Paint terrain textures

**Features:**

- Multiple texture layers
- Blend between textures
- Custom materials

### 7. **Copy/Paste Tool**

**Purpose:** Duplicate sections

**Features:**

- Select area
- Copy selection
- Paste with rotation
- Mirror/flip

### 8. **Delete/Eraser Tool**

**Purpose:** Remove placed objects

**Features:**

- Single object deletion
- Area deletion
- Selective deletion by type

---

## 📦 Adding Models to Builder

### Method 1: Add to Existing Parts.glb

1. Open `assets/env/builder/parts.glb` in Blender
2. Add new models
3. Export as GLB
4. Models automatically available in builder

### Method 2: Load Additional GLB Files

Update `config/scenes.json`:

```json
"builder": {
    "models": [
        "env/builder/parts.glb",
        "env/exterior/grass/grass.glb",
        "env/exterior/trees/trees.glb",  // NEW
        "env/props/furniture.glb"         // NEW
    ]
}
```

### Method 3: Dynamic Model Loading

Create a model library system:

```javascript
// src/utils/modelLibrary.js
export class ModelLibrary {
    async loadModel(path) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", path, scene);
        return result.meshes[0];
    }
    
    async loadFromConfig() {
        const config = await fetch('config/builder-models.json');
        // Load all models defined in config
    }
}
```

---

## 🌍 Creating New Scenes with GLB Models

### Option 1: Create New Scene File

```javascript
// src/scene/scenes/customScene.js
export async function createCustomScene(engine) {
    const scene = new BABYLON.Scene(engine);
    
    const spawnPoint = new BABYLON.Vector3(0, 5, 0);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);
    const camera = setupCamera(scene, character, engine);
    
    // Load your custom GLB models
    const modelUrls = [
        "env/custom/terrain.glb",
        "env/custom/buildings.glb",
        "env/custom/props.glb"
    ];
    
    const heroModelPromise = loadHeroModel(scene, character);
    const [heroModel, models] = await Promise.all([
        heroModelPromise,
        loadModels(scene, modelUrls)
    ]);
    
    // Setup your scene with loaded models
    setupCustomEnvironment(scene, models);
    
    return scene;
}
```

### Option 2: Add to scenes.json

```json
"customScene": {
    "name": "Custom Scene",
    "description": "My custom GLB scene",
    "creator": "createCustomScene",
    "spawnPoint": { "x": 0, "y": 5, "z": 0 },
    "levelSize": 10000,
    "difficulty": "medium",
    "enabled": true,
    "showInLobby": true,
    "thumbnail": "./assets/thumbnails/custom.jpg",
    "models": [
        "env/custom/terrain.glb",
        "env/custom/buildings.glb"
    ]
}
```

---

## 🏔️ Adding Terrain Elements

### Current Terrain System

- Grid-based terrain (19x19 cells)
- Vertex manipulation for sculpting
- Height-based grass placement
- Physics collision updates

### Adding Terrain Features

#### 1. **Heightmap-Based Terrain**

```javascript
// Already implemented in builder.js
const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "ground", 
    "assets/textures/terrain/heightMap.png", 
    {
        width: 10000,
        height: 10000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 50
    }
);
```

#### 2. **GLB Terrain Meshes**

```javascript
// Load terrain from GLB
const terrainResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null, 
    "./assets/env/terrain/", 
    "custom_terrain.glb", 
    scene
);

const terrain = terrainResult.meshes[0];
terrain.position.y = 0;

// Add physics
new BABYLON.PhysicsAggregate(
    terrain, 
    BABYLON.PhysicsShapeType.MESH, 
    { mass: 0, friction: 1000 }, 
    scene
);
```

#### 3. **Procedural Terrain Elements**

- Cliffs (already in `setOuterRingCliffs`)
- Mountains
- Valleys
- Caves
- Rivers

---

## 🐛 Issues Found & Fixes

### Issue 1: Missing Input Handler

**File:** `src/scene/gen/procedural/grid/input.js` - NOT FOUND
**Impact:** Grid interaction may not work
**Fix:** Check `src/scene/gen/procedural/grid/` for actual input handling

### Issue 2: Settings Tool Not Fully Implemented

**File:** `src/scene/gen/procedural/grid/tools/settings/settings.js`
**Current:** Empty click handler
**Needed:** Implement Save/Load/Clear functionality

### Issue 3: Model Library Not Centralized

**Impact:** Models loaded per-scene, not reusable
**Fix:** Create centralized model library system

---

## 📋 Next Steps

1. **Implement Missing Tools** (Priority Order):
   - Model Placement Tool
   - Delete/Eraser Tool
   - Vegetation Brush Tool
   - Copy/Paste Tool

2. **Enhance Save/Load System**:
   - Save placed models
   - Save terrain modifications
   - Save lighting setup
   - Export to GLB

3. **Create Model Library UI**:
   - Browse available models
   - Preview before placement
   - Search/filter models

4. **Add Terrain Presets**:
   - Flat
   - Hills
   - Mountains
   - Island
   - Canyon

---

## 💻 Implementation Examples

### Example 1: Model Placement Tool

Create `src/scene/gen/procedural/grid/tools/models/modelPlacement.js`:

```javascript
import Tool from "../Tool.js";

export default class ModelPlacement extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        super(name, scene, meshes, grid, tools, imageSrc, subTools);
        this.selectedModel = null;
        this.previewMesh = null;
    }

    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        if (!this.selectedModel) return;

        // Clone the selected model
        const instance = this.selectedModel.clone(`model_${xIndex}_${zIndex}`);
        instance.position = new BABYLON.Vector3(
            (xIndex + 0.5) * cellSize,
            pickedPoint.y,
            (zIndex + 0.5) * cellSize
        );

        // Add to grid tracker
        gridTracker[gridTrackerIndex.x][gridTrackerIndex.z].model = instance;

        // Add physics
        new BABYLON.PhysicsAggregate(
            instance,
            BABYLON.PhysicsShapeType.MESH,
            { mass: 0, friction: 1.0 },
            this.scene
        );
    }

    setModel(modelName) {
        this.selectedModel = MESH_LIBRARY[modelName];
    }
}
```

### Example 2: Delete Tool

Create `src/scene/gen/procedural/grid/tools/delete/delete.js`:

```javascript
import Tool from "../Tool.js";

export default class Delete extends Tool {
    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        const cell = gridTracker[gridTrackerIndex.x][gridTrackerIndex.z];

        // Remove floor if exists
        if (cell.f) {
            const floor = this.scene.getMeshByName(`floor_${xIndex}_${zIndex}`);
            if (floor) {
                floor.dispose();
                cell.f = false;
            }
        }

        // Remove model if exists
        if (cell.model) {
            cell.model.dispose();
            cell.model = null;
        }

        // Update surrounding cells
        updateCellAndSurronding(gridTrackerIndex);
    }
}
```

### Example 3: Adding Tool to Builder

Edit `src/scene/gen/procedural/grid/tools/tools.js`:

```javascript
import ModelPlacement from './models/modelPlacement.js';
import Delete from './delete/delete.js';

export function createTools(scene, meshes, gridTracker, grid) {
    // ... existing code ...

    const modelSubTools = [
        { name: 'Tree' },
        { name: 'Rock' },
        { name: 'Building' }
    ];

    // Add new tools
    tools.tools.models = new ModelPlacement(
        "Models", scene, meshes, grid, tools,
        "./assets/util/ui/icons/model.png", modelSubTools
    );

    tools.tools.delete = new Delete(
        "Delete", scene, meshes, grid, tools,
        "./assets/util/ui/icons/delete.png", []
    );

    return tools;
}
```

---

Would you like me to implement any of these enhancements?
