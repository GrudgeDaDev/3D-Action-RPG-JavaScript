/**
 * Archipelago Scene - Multiple Islands with Water Travel
 * Features: 6 islands, water swimming, drivable boat
 */

import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';
import { Health } from '../../character/health.js';
import { setupArchipelagoWater } from '../../utils/archipelagoWater.js';
import { BoatController } from '../../vehicles/BoatController.js';
import { SwimmingController } from '../../character/SwimmingController.js';
import { ArchipelagoMap } from '../../ui/ArchipelagoMap.js';
import { globalUI } from '../../ui/GlobalUI.js';
import { MarkerLoader } from '../../utils/markerLoader.js';
import { getAssetLibrary } from '../../assets/index.js';

// Island configuration - uniform sizing with proper water spacing
const ISLAND_SCALE = 30; // Scale factor for islands - uniform for all
const ISLAND_SPACING = 800; // Space between islands (about 1 island width apart)

// Hexagonal layout - islands arranged in a ring around center water
// First island at center-front, others spread around
const ISLAND_CONFIG = [
    { name: 'Pirate Island', file: 'env/islands/pirate_island.glb', position: new BABYLON.Vector3(0, 0, ISLAND_SPACING), scale: ISLAND_SCALE },
    { name: 'Fantasy Island', file: 'env/islands/fantasy_island.glb', position: new BABYLON.Vector3(ISLAND_SPACING * 0.87, 0, ISLAND_SPACING * 0.5), scale: ISLAND_SCALE },
    { name: 'Castle Island', file: 'env/islands/castle_island.glb', position: new BABYLON.Vector3(ISLAND_SPACING * 0.87, 0, -ISLAND_SPACING * 0.5), scale: ISLAND_SCALE },
    { name: 'Mythical Island', file: 'env/islands/mythical_fantasy_island.glb', position: new BABYLON.Vector3(0, 0, -ISLAND_SPACING), scale: ISLAND_SCALE },
    { name: 'Azure Island', file: 'env/islands/sky_cloud_of_azure_lane_island.glb', position: new BABYLON.Vector3(-ISLAND_SPACING * 0.87, 0, -ISLAND_SPACING * 0.5), scale: ISLAND_SCALE },
    { name: 'Angel Island', file: 'env/islands/angel_island.glb', position: new BABYLON.Vector3(-ISLAND_SPACING * 0.87, 0, ISLAND_SPACING * 0.5), scale: ISLAND_SCALE }
];

const WATER_LEVEL = 0; // Water at Y=0
const WORLD_SIZE = 4000; // World size
const BOAT_START_POS = new BABYLON.Vector3(0, WATER_LEVEL + 2, 0); // Boat in center of all islands

export async function createArchipelago(engine) {
    console.log('🏝️ Creating Archipelago Scene...');
    const scene = new BABYLON.Scene(engine);

    setupEnvironment(scene);
    createSkydome(scene, WORLD_SIZE);

    // Load islands
    console.log('🏝️ Loading islands...');
    const islands = await loadIslands(scene);

    // Spawn point ON THE BOAT in center water (player starts on boat)
    const spawnPoint = new BABYLON.Vector3(BOAT_START_POS.x, BOAT_START_POS.y + 5, BOAT_START_POS.z);

    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);

    // Setup camera with extended range for large world
    const camera = setupCamera(scene, character, engine);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 300;
    camera.radius = 40;
    camera.maxZ = WORLD_SIZE * 2;
    camera.wheelDeltaPercentage = 0.02;

    // Load hero
    const { hero, skeleton } = await loadHeroModel(scene, character);
    let anim = setupAnim(scene, skeleton);

    // Setup player health
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    window.PLAYER = character;

    // Setup water system
    console.log('🌊 Setting up water...');
    const water = setupArchipelagoWater(scene, islands, engine, hero, WATER_LEVEL, WORLD_SIZE);

    // Add invisible sea floor for physics (prevents falling forever)
    const seaFloor = BABYLON.MeshBuilder.CreateGround("seaFloor", { width: WORLD_SIZE, height: WORLD_SIZE }, scene);
    seaFloor.position.y = WATER_LEVEL - 10; // Below water surface
    seaFloor.visibility = 0;
    seaFloor.checkCollisions = true;
    // Physics for sea floor
    new BABYLON.PhysicsAggregate(seaFloor, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

    // Initialize swimming controller
    console.log('🏊 Setting up swimming...');
    const swimmingController = new SwimmingController(scene, character, dummyAggregate, hero, anim, WATER_LEVEL);
    window.SWIMMING = swimmingController;

    // Load and setup boat
    console.log('⛵ Loading boat...');
    const boat = await loadBoat(scene);
    const boatController = new BoatController(scene, boat, character, hero, camera, WATER_LEVEL);
    window.BOAT = boatController;

    // Auto-enter boat at start since player spawns on it
    setTimeout(() => {
        boatController.enterBoat();
        console.log('🚢 Player auto-entered boat');
    }, 500);

    // Modified input handling with swimming/boat states
    setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);

    // Setup lighting
    const light = setupLighting(scene);

    // Setup MMO-style UI (player frame, target frame, action bars)
    console.log('🎮 Setting up MMO UI...');
    globalUI.initForScene(scene, character, { playerName: 'Explorer', playerLevel: 1 });

    // Setup minimap and large map (M hotkey)
    console.log('🗺️ Setting up map...');
    const islandMapData = islands.map((island, i) => ({
        name: ISLAND_CONFIG[i].name,
        position: island.root.position,
        meshes: island.meshes
    }));
    const archipelagoMap = new ArchipelagoMap(scene, character, islandMapData, boat, WORLD_SIZE);
    window.MAP = archipelagoMap;

    // Load markers from saved scene (if available)
    console.log('📍 Loading markers...');
    try {
        const assetSystems = getAssetLibrary(scene);
        const markerLoader = new MarkerLoader(scene, assetSystems);

        // Try to load from saved scene file
        const sceneData = await markerLoader.loadFromFile('./config/archipelago_scene.json');

        if (sceneData && sceneData.markers) {
            // Use player spawn if defined
            const playerSpawn = markerLoader.getPlayerSpawn();
            if (playerSpawn) {
                character.position = playerSpawn.position.clone();
                character.position.y += 2; // Offset above ground
                console.log('🎯 Using saved player spawn point');
            }
        }

        window.MARKER_LOADER = markerLoader;
    } catch (error) {
        console.log('ℹ️ No saved scene markers found (this is normal for first run)');
    }

    console.log('✅ Archipelago Scene Created!');
    console.log('🎮 Controls: WASD move | Right-click boat | M map | Tab target | 1-0 actions');

    return scene;
}



async function loadIslands(scene) {
    const islands = [];

    for (const config of ISLAND_CONFIG) {
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", config.file, scene);
            const root = result.meshes[0];
            root.name = config.name;
            root.position = config.position.clone();
            root.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);

            // Enable collisions and physics on meshes
            result.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isPickable = true;

                // Add physics to solid meshes (not root transform nodes)
                if (mesh.getTotalVertices() > 0) {
                    try {
                        new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.8 }, scene);
                    } catch (e) {
                        // Some meshes may fail physics, that's ok
                    }
                }
            });

            islands.push({ root, meshes: result.meshes, config });
            console.log(`  ✓ Loaded ${config.name}`);
        } catch (e) {
            console.warn(`  ✗ Failed to load ${config.name}:`, e.message);
        }
    }

    return islands;
}

async function loadBoat(scene) {
    const BOAT_SCALE = 8; // Boat scale relative to player
    try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/vehicles/", "Boat.glb", scene);
        const boat = result.meshes[0];
        boat.name = "boat";
        // Position boat in center of islands - where player spawns
        boat.position = BOAT_START_POS.clone();
        boat.scaling = new BABYLON.Vector3(BOAT_SCALE, BOAT_SCALE, BOAT_SCALE);
        // Face toward first island (Pirate Island at +Z)
        boat.rotation.y = 0;

        result.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isPickable = true;
            mesh.metadata = { isBoat: true };
        });

        console.log('  ✓ Boat loaded at center');
        return boat;
    } catch (e) {
        console.warn('  ✗ Failed to load boat:', e.message);
        // Create placeholder boat
        const boat = BABYLON.MeshBuilder.CreateBox("boat", { width: 8, height: 3, depth: 16 }, scene);
        boat.position = BOAT_START_POS.clone();
        const boatMat = new BABYLON.StandardMaterial("boatMat", scene);
        boatMat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
        boat.material = boatMat;
        boat.metadata = { isBoat: true };
        return boat;
    }
}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color4(0.4, 0.65, 0.95, 1);
    scene.ambientColor = new BABYLON.Color3(0.4, 0.4, 0.5);

    // Fog for world
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 1500;
    scene.fogEnd = 5000;
    scene.fogColor = new BABYLON.Color3(0.6, 0.75, 0.9);
}

function setupLighting(scene) {
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.5, 1, 0.3), scene);
    light.intensity = 1.0;
    light.groundColor = new BABYLON.Color3(0.2, 0.3, 0.4);
    
    const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.5, -1, -0.3), scene);
    sun.intensity = 0.8;
    
    return light;
}

function createSkydome(scene, size) {
    const skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: size * 2, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.emissiveColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    skyMat.disableLighting = true;
    skybox.material = skyMat;
}

