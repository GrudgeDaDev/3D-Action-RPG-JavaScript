# 📐 Sizing, Builder Mode, and Asset Import Guide

## 🗺️ Terrain Sizing by Scene

Your game uses Babylon.js units. **1 unit ≈ 1 meter** in real-world scale.

| Scene | Terrain Width × Height | Max Height | Subdivisions | Notes |
|-------|----------------------|------------|--------------|-------|
| **Outdoor** | 1000 × 1000 | 100 | 100 | Standard heightmap terrain |
| **Night** | 10000 × 10000 | 10000 | 100 | Diamond heightmap, massive |
| **Day** | 10000 × 10000 | 10000 | 100 | Same as night |
| **Builder** | 10000 × 10000 | 50 | 100 | Large flat-ish terrain |
| **Town** | 2000 × 2000 | 30 | 100 | Medium, low hills |
| **Room** | 1000 × 1000 | 100 | 100 | Small indoor |

### Size in Real Terms
- **Outdoor (1000×1000):** ~1 km² (like a village area)
- **Night/Day/Builder (10000×10000):** ~100 km² (like a small region)
- **Town (2000×2000):** ~4 km² (town-sized)

### Camera Limits per Scene

| Scene | Min Zoom (lowerRadiusLimit) | Max Zoom (upperRadiusLimit) |
|-------|----------------------------|----------------------------|
| Outdoor | 4 | 656 |
| Night | 4 | 3391 |
| Builder | - | 1800 |

---

## 🔨 Builder Mode

### What Is It?
A creative mode for building structures, sculpting terrain, and placing objects.

**Access:** From lobby, click "🔨 Builder Mode"

### Current Tools

| Tool | Icon | What It Does | Sub-Tools |
|------|------|-------------|-----------|
| **Place** | path.png | Place floor tiles on grid | None |
| **Raise** | tree.png | Sculpt terrain | Raise, Lower, Flatten, Path |
| **Settings** | gear.png | Save/Load worlds | Save |

### Builder Grid System

From `config/builder.json`:
```json
{
  "gridSize": 19,        // 19×19 grid cells
  "cellSize": 60,        // Each cell is 60×60 units
  "maxHeight": 100,      // Max terrain height
  "minHeight": -50,      // Min terrain depth
  "brushSizes": [10, 25, 50, 75, 100]
}
```

**Total Build Area:** 19 × 60 = **1140 × 1140 units** (grid area)

### How to Use Builder Tools

1. **Place Tool (Left Icon)**
   - Click to place floor tiles
   - Grid snapping enabled by default

2. **Raise Tool (Middle Icon)**
   - Click terrain to raise/lower
   - Hover over icon for sub-tools:
     - **Raise:** Lift terrain up
     - **Lower:** Push terrain down
     - **Flatten:** Make terrain flat
     - **Path:** Create paths

3. **Settings Tool (Right Icon)**
   - **Save:** Export your creation
   - (Load/Load World - coming soon)

---

## 📦 Asset Import Guide

### Supported File Formats

| Format | Support | Usage |
|--------|---------|-------|
| **.GLB** | ✅ Full | Primary 3D model format (recommended) |
| **.GLTF** | ✅ Full | Same as GLB but separate files |
| **.OBJ** | ⚠️ Partial | Legacy support via loaders |
| **.FBX** | ❌ No | Convert to GLB first |
| **.BLEND** | ❌ No | Export from Blender as GLB |

### GLB/GLTF Features Supported

| Feature | Supported |
|---------|-----------|
| Meshes | ✅ Yes |
| Materials (PBR) | ✅ Yes |
| Textures (embedded) | ✅ Yes |
| Animations | ✅ Yes |
| Skeletons/Bones | ✅ Yes |
| Morph Targets | ✅ Yes |
| Multiple Objects | ✅ Yes |
| Lights | ⚠️ Partial |
| Cameras | ⚠️ Partial |

### How to Import Assets

#### Method 1: Add to Assets Folder

1. Place your `.glb` file in the appropriate folder:
```
assets/
├── characters/
│   ├── enemy/[your-enemy]/YourEnemy.glb
│   └── player/[your-class]/YourClass.glb
├── env/
│   ├── builder/parts.glb
│   ├── exterior/[your-props]/
│   └── [your-scene]/YourTerrain.glb
└── util/
    └── [your-utilities]/
```

2. Load in code:
```javascript
import { loadModels } from '../../utils/load.js';

const models = await loadModels(scene, [
    "env/yourscene/YourModel.glb"
]);
const yourModel = models["YourModel"];
```

#### Method 2: Direct Loading

```javascript
// Load single mesh
const result = await BABYLON.SceneLoader.ImportMeshAsync(
    null,                           // Load all meshes
    "./assets/env/yourfolder/",     // Path
    "YourModel.glb",                // Filename
    scene
);

const model = result.meshes[0];
model.position = new BABYLON.Vector3(0, 0, 0);
model.scaling = new BABYLON.Vector3(1, 1, 1);
```

#### Method 3: Add to Scene Config

Edit `config/scenes.json`:
```json
{
  "yourScene": {
    "models": [
      "env/yourscene/terrain.glb",
      "env/yourscene/buildings.glb",
      "characters/enemy/dragon/Dragon.glb"
    ]
  }
}
```

---

## 🎨 Exporting from Blender

### Recommended Export Settings

1. **File → Export → glTF 2.0 (.glb/.gltf)**

2. **Format:** GLB (Binary) - single file, easier

3. **Include:**
   - ✅ Selected Objects (or all)
   - ✅ Custom Properties
   - ✅ Cameras (optional)
   - ✅ Punctual Lights (optional)

4. **Transform:**
   - ✅ +Y Up (Babylon.js uses Y-up)

5. **Geometry:**
   - ✅ Apply Modifiers
   - ✅ UVs
   - ✅ Normals
   - ✅ Tangents (for normal maps)
   - ✅ Vertex Colors (if used)

6. **Animation:**
   - ✅ Animations (if needed)
   - ✅ Shape Keys (for morph targets)
   - ✅ Skinning (for skeletal animation)

### Blender Export Script

There's already a script: `assets/export_assets.py`

```python
# Example usage in Blender
# This exports tagged objects as GLB files
```

---

## 📊 Scale Reference

### Character Sizes
- **Hero:** Scale 3.7 (about 3.7m tall after scaling)
- **Slime:** Varies
- **HP Bar:** Scaled to fit above heads

### Common Object Scales

| Object Type | Typical Size (units) |
|-------------|---------------------|
| Character | 2-4 height |
| Sword | 1-2 length |
| Door | 2.5 height, 1.5 width |
| Tree | 5-15 height |
| Rock | 0.5-3 diameter |
| Building | 10-50 |
| Mountain | 100-1000 |

### Terrain Scale Comparison

```
Outdoor (1000×1000):
┌──────────────────┐
│                  │
│    1 km²         │
│    Village       │
│                  │
└──────────────────┘

Night/Builder (10000×10000):
┌────────────────────────────────────────┐
│                                        │
│              100 km²                   │
│              Region                    │
│                                        │
│                                        │
│                                        │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

---

## ✅ Quick Answers

**Q: How large is outdoor terrain?**
A: 1000×1000 units (~1 km²), max height 100 units

**Q: What are builder mode tools?**
A: Place (floor tiles), Raise (terrain sculpting with 4 sub-tools), Settings (save/load)

**Q: Can we import assets?**
A: YES! GLB/GLTF files work perfectly

**Q: What files can we import?**
A: GLB (recommended), GLTF, OBJ (partial). NOT FBX or BLEND directly.

**Q: How to add custom models?**
A: Place in assets folder, load with `loadModels()` or `ImportMeshAsync()`

