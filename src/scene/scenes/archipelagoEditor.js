/**
 * Archipelago Editor - Visual Scene Editor for Archipelago
 * Features:
 * - Free flight camera
 * - Gizmo controls (Position/Rotation/Scale)
 * - Hierarchy panel
 * - Object placement tools (NPCs, enemies, vendors, spawn points)
 * - Changes save to archipelago scene
 */

import { setupArchipelagoWater } from '../../utils/archipelagoWater.js';
import { PlacementTools } from '../../editor/PlacementTools.js';
import { PlacementToolsUI } from '../../editor/PlacementToolsUI.js';

// Island configuration - same as archipelago.js
const ISLAND_SCALE = 30;
const ISLAND_SPACING = 800;
const ISLAND_CONFIG = [
    { name: 'Pirate Island', file: 'env/islands/pirate_island.glb', position: new BABYLON.Vector3(0, 0, ISLAND_SPACING), scale: ISLAND_SCALE },
    { name: 'Fantasy Island', file: 'env/islands/fantasy_island.glb', position: new BABYLON.Vector3(ISLAND_SPACING * 0.87, 0, ISLAND_SPACING * 0.5), scale: ISLAND_SCALE },
    { name: 'Castle Island', file: 'env/islands/castle_island.glb', position: new BABYLON.Vector3(ISLAND_SPACING * 0.87, 0, -ISLAND_SPACING * 0.5), scale: ISLAND_SCALE },
    { name: 'Mythical Island', file: 'env/islands/mythical_fantasy_island.glb', position: new BABYLON.Vector3(0, 0, -ISLAND_SPACING), scale: ISLAND_SCALE },
    { name: 'Azure Island', file: 'env/islands/sky_cloud_of_azure_lane_island.glb', position: new BABYLON.Vector3(-ISLAND_SPACING * 0.87, 0, -ISLAND_SPACING * 0.5), scale: ISLAND_SCALE },
    { name: 'Angel Island', file: 'env/islands/angel_island.glb', position: new BABYLON.Vector3(-ISLAND_SPACING * 0.87, 0, ISLAND_SPACING * 0.5), scale: ISLAND_SCALE }
];

const WATER_LEVEL = 0;
const WORLD_SIZE = 4000;

export async function createArchipelagoEditor(engine) {
    console.log('🎨 Creating Archipelago Editor...');
    const scene = new BABYLON.Scene(engine);

    // Setup environment
    setupEnvironment(scene);
    createSkydome(scene, WORLD_SIZE);

    // FREE FLIGHT CAMERA (no character needed)
    const camera = new BABYLON.UniversalCamera("editorCamera", new BABYLON.Vector3(0, 100, -200), scene);
    camera.attachControl(engine.getRenderingCanvas(), true);
    camera.speed = 5;
    camera.maxZ = WORLD_SIZE * 2;
    
    // WASD movement + mouse look
    camera.keysUp = [87]; // W
    camera.keysDown = [83]; // S
    camera.keysLeft = [65]; // A
    camera.keysRight = [68]; // D
    camera.keysUpward = [69]; // E (up)
    camera.keysDownward = [81]; // Q (down)
    
    scene.activeCamera = camera;

    // Load islands
    console.log('🏝️ Loading islands...');
    const islands = await loadIslands(scene);

    // Setup water
    console.log('🌊 Setting up water...');
    const water = setupArchipelagoWater(scene, islands, engine, null, WATER_LEVEL, WORLD_SIZE);

    // Sea floor
    const seaFloor = BABYLON.MeshBuilder.CreateGround("seaFloor", { width: WORLD_SIZE, height: WORLD_SIZE }, scene);
    seaFloor.position.y = WATER_LEVEL - 10;
    seaFloor.visibility = 0.1; // Slightly visible in editor

    // Initialize editor systems
    const editorState = {
        selectedMesh: null,
        gizmoManager: null,
        placementMode: null, // 'npc', 'enemy', 'vendor', 'spawn', 'warp'
        placementMarkers: [],
        placementTools: null,
        placementToolsUI: null
    };

    // Setup gizmo manager
    setupGizmos(scene, editorState);

    // Setup object selection
    setupObjectSelection(scene, editorState, camera);

    // Initialize placement tools
    console.log('🎯 Initializing placement tools...');
    editorState.placementTools = new PlacementTools(scene, editorState);
    editorState.placementToolsUI = new PlacementToolsUI(editorState.placementTools);

    // Create editor UI
    createEditorUI(scene, editorState, islands);

    // Setup keyboard shortcuts
    setupEditorHotkeys(scene, editorState);

    // Store editor state globally for access
    window.EDITOR_STATE = editorState;
    window.EDITOR_SCENE = scene;

    console.log('✅ Archipelago Editor Ready!');
    console.log('📝 Controls:');
    console.log('  WASD - Move camera');
    console.log('  E/Q - Up/Down');
    console.log('  Mouse - Look around');
    console.log('  Click - Select object');
    console.log('  W - Position gizmo');
    console.log('  E - Rotation gizmo');
    console.log('  R - Scale gizmo');
    console.log('  Delete - Delete selected');

    return scene;
}

// Load islands (same as archipelago.js)
async function loadIslands(scene) {
    const islands = [];
    
    for (const config of ISLAND_CONFIG) {
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/models/", config.file, scene);
            const rootMesh = result.meshes[0];
            
            rootMesh.name = config.name;
            rootMesh.position = config.position;
            rootMesh.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);
            
            // Enable physics for islands
            result.meshes.forEach(mesh => {
                if (mesh !== rootMesh && mesh.getTotalVertices() > 0) {
                    mesh.checkCollisions = true;
                    new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0 }, scene);
                }
            });
            
            islands.push(rootMesh);
            console.log(`✅ Loaded: ${config.name}`);
        } catch (error) {
            console.error(`❌ Failed to load ${config.name}:`, error);
        }
    }
    
    return islands;
}

// Setup environment (same as archipelago.js)
function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1);
    scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;
}

// Create skydome
function createSkydome(scene, size) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: size }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.53, 0.81, 0.92);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
}

// Setup gizmo controls
function setupGizmos(scene, editorState) {
    const gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = false;
    gizmoManager.rotationGizmoEnabled = false;
    gizmoManager.scaleGizmoEnabled = false;
    gizmoManager.boundingBoxGizmoEnabled = false;

    // Gizmo settings
    gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false;
    gizmoManager.gizmos.positionGizmo.scaleRatio = 2;

    editorState.gizmoManager = gizmoManager;
}

// Setup object selection with mouse click
function setupObjectSelection(scene, editorState, camera) {
    scene.onPointerDown = (evt, pickResult) => {
        if (evt.button !== 0) return; // Only left click

        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;

            // Don't select gizmos, water, or skybox
            if (mesh.name.includes('Gizmo') || mesh.name === 'seaFloor' || mesh.name === 'skyBox' || mesh.name === 'waterMesh') {
                return;
            }

            selectMesh(mesh, editorState);
        } else {
            // Clicked empty space - deselect
            deselectMesh(editorState);
        }
    };
}

function selectMesh(mesh, editorState) {
    // Deselect previous
    if (editorState.selectedMesh) {
        if (editorState.selectedMesh._editorHighlight) {
            editorState.selectedMesh._editorHighlight.dispose();
            delete editorState.selectedMesh._editorHighlight;
        }
    }

    editorState.selectedMesh = mesh;

    // Add highlight
    const hl = new BABYLON.HighlightLayer("editorHighlight", mesh.getScene());
    hl.addMesh(mesh, BABYLON.Color3.Yellow());
    mesh._editorHighlight = hl;

    // Attach gizmo
    editorState.gizmoManager.attachToMesh(mesh);

    // Update hierarchy UI
    updateHierarchySelection(mesh);

    console.log('Selected:', mesh.name);
}

function deselectMesh(editorState) {
    if (editorState.selectedMesh) {
        if (editorState.selectedMesh._editorHighlight) {
            editorState.selectedMesh._editorHighlight.dispose();
            delete editorState.selectedMesh._editorHighlight;
        }
        editorState.selectedMesh = null;
    }

    editorState.gizmoManager.attachToMesh(null);
    updateHierarchySelection(null);
}

// Setup keyboard shortcuts
function setupEditorHotkeys(scene, editorState) {
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            const key = kbInfo.event.key.toLowerCase();

            // Gizmo mode switching
            if (key === 'w') {
                // Position gizmo
                editorState.gizmoManager.positionGizmoEnabled = true;
                editorState.gizmoManager.rotationGizmoEnabled = false;
                editorState.gizmoManager.scaleGizmoEnabled = false;
                console.log('📍 Position Gizmo');
            } else if (key === 'e' && !kbInfo.event.shiftKey) {
                // Rotation gizmo (only if not Shift+E for camera up)
                editorState.gizmoManager.positionGizmoEnabled = false;
                editorState.gizmoManager.rotationGizmoEnabled = true;
                editorState.gizmoManager.scaleGizmoEnabled = false;
                console.log('🔄 Rotation Gizmo');
            } else if (key === 'r') {
                // Scale gizmo
                editorState.gizmoManager.positionGizmoEnabled = false;
                editorState.gizmoManager.rotationGizmoEnabled = false;
                editorState.gizmoManager.scaleGizmoEnabled = true;
                console.log('📏 Scale Gizmo');
            } else if (key === 'delete' || key === 'backspace') {
                // Delete selected object
                if (editorState.selectedMesh) {
                    const meshName = editorState.selectedMesh.name;
                    editorState.selectedMesh.dispose();
                    deselectMesh(editorState);
                    console.log('🗑️ Deleted:', meshName);
                    updateHierarchyPanel(scene);
                }
            } else if (key === 'escape') {
                // Deselect
                deselectMesh(editorState);
            }
        }
    });
}

function updateHierarchySelection(mesh) {
    // Update UI to show selected mesh
    const hierarchyItems = document.querySelectorAll('.hierarchy-item');
    hierarchyItems.forEach(item => {
        item.classList.remove('selected');
        if (mesh && item.dataset.meshId === mesh.uniqueId.toString()) {
            item.classList.add('selected');
        }
    });
}

function updateHierarchyPanel(scene) {
    const container = document.getElementById('hierarchy-list');
    if (!container) return;

    container.innerHTML = '';

    scene.meshes.forEach(mesh => {
        if (mesh.name === 'seaFloor' || mesh.name === 'skyBox' || mesh.name === 'waterMesh') return;
        if (mesh.name.includes('Gizmo')) return;

        const item = document.createElement('div');
        item.className = 'hierarchy-item';
        item.dataset.meshId = mesh.uniqueId;
        item.textContent = mesh.name || 'Unnamed';
        item.onclick = () => selectMesh(mesh, window.EDITOR_STATE);
        container.appendChild(item);
    });
}

// Create editor UI
function createEditorUI(scene, editorState, islands) {
    const ui = document.createElement('div');
    ui.id = 'archipelago-editor-ui';
    ui.innerHTML = `
        <style>
            #archipelago-editor-ui {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                font-family: Arial, sans-serif;
                z-index: 1000;
            }

            .editor-panel {
                position: absolute;
                background: rgba(20, 20, 30, 0.95);
                border: 2px solid rgba(245, 202, 86, 0.5);
                border-radius: 8px;
                padding: 15px;
                pointer-events: all;
                color: white;
            }

            #hierarchy-panel {
                top: 60px;
                left: 10px;
                width: 250px;
                max-height: calc(100vh - 80px);
                overflow-y: auto;
            }

            #tools-panel {
                top: 60px;
                right: 10px;
                width: 200px;
            }

            #info-panel {
                bottom: 10px;
                left: 10px;
                padding: 10px 15px;
            }

            .panel-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: rgb(245, 202, 86);
                border-bottom: 1px solid rgba(245, 202, 86, 0.3);
                padding-bottom: 5px;
            }

            .hierarchy-item {
                padding: 8px;
                margin: 4px 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .hierarchy-item:hover {
                background: rgba(245, 202, 86, 0.2);
            }

            .hierarchy-item.selected {
                background: rgba(245, 202, 86, 0.4);
                border-left: 3px solid rgb(245, 202, 86);
            }

            .tool-button {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: rgba(245, 202, 86, 0.2);
                border: 1px solid rgba(245, 202, 86, 0.5);
                border-radius: 4px;
                color: white;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }

            .tool-button:hover {
                background: rgba(245, 202, 86, 0.4);
            }

            .tool-button.active {
                background: rgba(245, 202, 86, 0.6);
                border-color: rgb(245, 202, 86);
            }

            #info-panel {
                font-size: 12px;
                line-height: 1.6;
            }

            .info-line {
                margin: 2px 0;
            }
        </style>

        <!-- Hierarchy Panel -->
        <div class="editor-panel" id="hierarchy-panel">
            <div class="panel-title">📋 Scene Hierarchy</div>
            <div id="hierarchy-list"></div>
        </div>

        <!-- Tools Panel -->
        <div class="editor-panel" id="tools-panel">
            <div class="panel-title">🛠️ Scene Tools</div>
            <button class="tool-button" onclick="saveSceneData()">💾 Save Scene</button>
            <button class="tool-button" onclick="loadSceneData()">📂 Load Scene</button>
            <button class="tool-button" onclick="window.EDITOR_STATE.placementToolsUI.toggle()">🎯 Toggle Placement Tools</button>
        </div>

        <!-- Info Panel -->
        <div class="editor-panel" id="info-panel">
            <div class="info-line"><strong>🎨 Archipelago Editor</strong></div>
            <div class="info-line">WASD - Move | E/Q - Up/Down</div>
            <div class="info-line">W - Position | E - Rotate | R - Scale</div>
            <div class="info-line">Click - Select | Del - Delete | Esc - Deselect</div>
        </div>
    `;

    document.body.appendChild(ui);

    // Populate hierarchy
    updateHierarchyPanel(scene);
}

// Save scene data
window.saveSceneData = function() {
    const scene = window.EDITOR_SCENE;
    const editorState = window.EDITOR_STATE;

    const data = {
        islands: [],
        markers: [],
        metadata: {
            savedAt: new Date().toISOString(),
            version: '1.0'
        }
    };

    // Save island transformations
    scene.meshes.forEach(mesh => {
        if (mesh.name.includes('Island')) {
            data.islands.push({
                name: mesh.name,
                position: mesh.position.asArray(),
                rotation: mesh.rotation.asArray(),
                scaling: mesh.scaling.asArray()
            });
        }
    });

    // Save markers using PlacementTools
    if (editorState.placementTools) {
        data.markers = editorState.placementTools.exportMarkers();
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archipelago_scene_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('💾 Scene saved!', data);
    alert(`Scene saved with ${data.islands.length} islands and ${data.markers.length} markers!`);
};

// Load scene data
window.loadSceneData = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const scene = window.EDITOR_SCENE;
                const editorState = window.EDITOR_STATE;

                console.log('📂 Loading scene data...', data);

                // Apply island transformations
                if (data.islands) {
                    data.islands.forEach(islandData => {
                        const mesh = scene.getMeshByName(islandData.name);
                        if (mesh) {
                            mesh.position = BABYLON.Vector3.FromArray(islandData.position);
                            mesh.rotation = BABYLON.Vector3.FromArray(islandData.rotation);
                            mesh.scaling = BABYLON.Vector3.FromArray(islandData.scaling);
                        }
                    });
                }

                // Load markers using PlacementTools
                if (data.markers && editorState.placementTools) {
                    // Clear existing markers first
                    editorState.placementTools.clearAllMarkers();
                    // Import new markers
                    editorState.placementTools.importMarkers(data.markers);
                }

                // Update hierarchy panel
                updateHierarchyPanel(scene);

                console.log('✅ Scene loaded successfully!');
                alert(`Scene loaded with ${data.islands?.length || 0} islands and ${data.markers?.length || 0} markers!`);
            } catch (error) {
                console.error('❌ Error loading scene:', error);
                alert('Error loading scene: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

