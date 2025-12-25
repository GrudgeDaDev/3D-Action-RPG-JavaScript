/**
 * Warlords Scene - Main Game Scene
 * Features: Central terrain island, 5 islands at sea, boat, swimming, haunted ghost ship, LOD culling
 */

import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';
import { setupWater } from '../../utils/water.js';
import { loadModels } from '../../utils/load.js';
import { setupEnemies } from '../../character/enemy.js';
import { Health } from '../../character/health.js';
import addSword from '../../character/equips/held.js';
import { globalUI } from '../../ui/GlobalUI.js';
import { SwimmingController } from '../../character/SwimmingController.js';

// ==================== WORLD CONFIGURATION ====================
const WORLD_CONFIG = {
    // Main terrain (player starts here)
    terrain: {
        width: 1000,
        height: 1000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 100,
        yOffset: -10.05
    },
    // Water level and world size
    waterLevel: 12.16,
    worldSize: 8000,
    // Islands positioned around the main terrain (at sea)
    islands: [
        { name: 'Pirate Island', file: 'env/islands/pirate_island.glb', position: { x: 1200, y: -5, z: 800 }, scale: 25, lodDistance: 2000 },
        { name: 'Fantasy Island', file: 'env/islands/fantasy_island.glb', position: { x: 1400, y: -5, z: -600 }, scale: 25, lodDistance: 2000 },
        { name: 'Castle Island', file: 'env/islands/castle_island.glb', position: { x: -1200, y: -5, z: 900 }, scale: 25, lodDistance: 2000 },
        { name: 'Mythical Island', file: 'env/islands/mythical_fantasy_island.glb', position: { x: -1400, y: -5, z: -700 }, scale: 25, lodDistance: 2000 },
        { name: 'Azure Island', file: 'env/islands/sky_cloud_of_azure_lane_island.glb', position: { x: 0, y: -5, z: -1500 }, scale: 25, lodDistance: 2000 }
    ],
    // Boat configuration
    boat: {
        position: { x: 450, y: 14, z: -200 }, // Edge of main island near shore
        scale: 8
    },
    // Ghost Ship configuration - positioned in ocean away from starting zone
    ghostShip: {
        position: { x: -2000, y: 5, z: 1800 }, // Far ocean, away from starting zone
        scale: 15,
        rotation: { x: 0, y: Math.PI / 3, z: 0 } // Angled for dramatic effect
    },
    // Player Home - Forest House (starting base and respawn point)
    playerHome: {
        position: { x: 400, y: 70, z: -180 }, // Near boat, on land
        scale: 8,
        rotation: { x: 0, y: Math.PI / 4, z: 0 }, // Face toward water
        entranceCircle: {
            radius: 3,
            offset: { x: 0, y: 0, z: 5 } // In front of house
        }
    }
};

export async function createOutdoor(engine) {
    console.log('⚔️ Creating Warlords Scene - Main Game World...');
    const scene = new BABYLON.Scene(engine);

    // Player spawn on main terrain
    const spawnPoint = new BABYLON.Vector3(134.683, 80, -271.427);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);

    // Setup terrain with physics
    const terrain = setupTerrain(scene);

    // Setup camera with extended range for large world
    const camera = setupCamera(scene, character, engine);
    camera.wheelDeltaPercentage = 0.0200;
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 800; // Extended for large world view
    camera.upperBetaLimit = Math.PI / 2;
    camera.maxZ = WORLD_CONFIG.worldSize * 1.5; // Extended view distance
    camera.alpha = 4.954;
    camera.beta = 1.3437;

    // Load models in parallel for speed
    const modelUrls = ["characters/enemy/slime/Slime1.glb", "characters/weapons/Sword2.glb", "util/HPBar.glb"];
    const heroModelPromise = loadHeroModel(scene, character);
    const [heroModel, models] = await Promise.all([
        heroModelPromise,
        loadModels(scene, modelUrls)
    ]);
    const { hero, skeleton } = heroModel;

    let anim = setupAnim(scene, skeleton);
    setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    PLAYER = character;

    // Environment setup
    setupEnvironment(scene);
    createSkydome(scene);

    // Water system covering the ocean
    setupWater(scene, terrain, engine, hero, WORLD_CONFIG.waterLevel, WORLD_CONFIG.worldSize);

    // Initialize swimming controller for water interactions
    console.log('🏊 Setting up swimming...');
    const swimmingController = new SwimmingController(scene, character, dummyAggregate, hero, anim, WORLD_CONFIG.waterLevel);
    window.SWIMMING = swimmingController;

    // Lighting and post-processing
    const light = setupLighting(scene);
    setupShadows(light, hero);
    setupPostProcessing(scene, camera);

    // Load distant islands with LOD
    console.log('🏝️ Loading distant islands...');
    const islands = await loadDistantIslands(scene);

    // Load boat at shore
    console.log('⛵ Loading boat...');
    const boat = await loadBoat(scene);

    // Setup boat controller if boat loaded
    if (boat) {
        setupBoatInteraction(scene, boat, character, hero, camera, WORLD_CONFIG.waterLevel);
    }

    // Load haunted ghost ship in the ocean
    console.log('👻 Loading haunted ghost ship...');
    const ghostShip = await loadGhostShip(scene);
    if (ghostShip) {
        console.log('  ✓ Ghost ship loaded at ocean position');
    }

    // Load player home (forest house)
    console.log('🏠 Loading player home...');
    const playerHome = await loadPlayerHome(scene, engine);
    if (playerHome) {
        console.log('  ✓ Player home loaded - your starting base!');
        // Setup entrance portal
        setupHomeEntrance(scene, playerHome, character, engine);
    }

    // HP bar models
    loadHPModels(scene, engine, models["HPBar"]);

    // Sword with trail
    let sword = addSword(scene, models["Sword2"]);
    createTrail(scene, engine, sword, 0.2, 40, new BABYLON.Vector3(0, 0, 0.32));

    // Enemies on main terrain
    const slime1 = models["Slime1"];
    setupEnemies(scene, character, terrain, 7, slime1);

    // VFX
    VFX['fireBall'] = addFireball(scene, engine);

    // Setup LOD culling for performance
    setupLODCulling(scene, camera, islands);

    scene.executeWhenReady(() => {
        scene.render();
    });

    // Initialize MMO-style UI
    globalUI.initForScene(scene, character, { playerName: 'Explorer', playerLevel: 1 });

    console.log('✅ Warlords Scene Created - Main Game World Ready!');
    console.log('🎮 Controls: WASD move | Right-click boat to board | Scroll to zoom');
    console.log('👻 Explore the haunted ghost ship in the distant ocean!');

    return scene;
}

// ==================== ISLAND LOADING WITH LOD ====================
async function loadDistantIslands(scene) {
    const islands = [];

    for (const config of WORLD_CONFIG.islands) {
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", config.file, scene);
            const root = result.meshes[0];
            root.name = config.name;
            root.position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
            root.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);

            // Enable collisions and physics on meshes
            result.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isPickable = true;
                // Add physics for solid meshes
                if (mesh.getTotalVertices() > 0) {
                    try {
                        new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.8 }, scene);
                    } catch (e) {
                        // Some meshes may fail physics
                    }
                }
            });

            // Store LOD distance for culling
            root.metadata = { lodDistance: config.lodDistance, isIsland: true };
            islands.push({ root, meshes: result.meshes, config });
            console.log(`  ✓ Loaded ${config.name}`);
        } catch (e) {
            console.warn(`  ✗ Failed to load ${config.name}:`, e.message);
        }
    }

    return islands;
}

// ==================== BOAT LOADING ====================
async function loadBoat(scene) {
    const config = WORLD_CONFIG.boat;
    try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/vehicles/", "Boat.glb", scene);
        const boat = result.meshes[0];
        boat.name = "boat";
        boat.position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
        boat.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);
        boat.rotation.y = Math.PI / 4; // Face toward water

        result.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isPickable = true;
            mesh.metadata = { isBoat: true };
        });

        // Boat bobbing animation
        setupBoatBobbing(scene, boat, WORLD_CONFIG.waterLevel);

        console.log('  ✓ Boat loaded at shore');
        return boat;
    } catch (e) {
        console.warn('  ✗ Failed to load boat:', e.message);
        // Create placeholder boat
        const boat = BABYLON.MeshBuilder.CreateBox("boat", { width: 8, height: 3, depth: 16 }, scene);
        boat.position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
        const boatMat = new BABYLON.StandardMaterial("boatMat", scene);
        boatMat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
        boat.material = boatMat;
        boat.metadata = { isBoat: true };
        setupBoatBobbing(scene, boat, WORLD_CONFIG.waterLevel);
        return boat;
    }
}

function setupBoatBobbing(scene, boat, waterLevel) {
    const bobAmplitude = 0.5;
    const bobSpeed = 2;
    const baseY = waterLevel + 2;

    scene.registerBeforeRender(() => {
        const time = performance.now() / 1000;
        boat.position.y = baseY + Math.sin(time * bobSpeed) * bobAmplitude;
        boat.rotation.x = Math.cos(time * bobSpeed * 0.5) * 0.02;
        boat.rotation.z = Math.sin(time * bobSpeed * 0.7) * 0.02;
    });
}

// ==================== GHOST SHIP LOADING ====================
async function loadGhostShip(scene) {
    const config = WORLD_CONFIG.ghostShip;
    try {
        // Load from examples folder (GLTF format)
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./examples/haunted_ghost_ship__pirate_vessel_3d_model/", "scene.gltf", scene);
        const ghostShip = result.meshes[0];
        ghostShip.name = "ghostShip";
        ghostShip.position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
        ghostShip.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);
        ghostShip.rotation = new BABYLON.Vector3(config.rotation.x, config.rotation.y, config.rotation.z);

        // Enable collisions and make it explorable
        result.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isPickable = true;
            mesh.metadata = { isGhostShip: true };
        });

        // Add eerie floating/bobbing animation
        setupGhostShipAnimation(scene, ghostShip, WORLD_CONFIG.waterLevel);

        console.log('  ✓ Ghost ship loaded in the ocean');
        return ghostShip;
    } catch (e) {
        console.warn('  ✗ Failed to load ghost ship:', e.message);
        return null;
    }
}

function setupGhostShipAnimation(scene, ship, waterLevel) {
    const bobAmplitude = 1.2; // Larger bob for eerie effect
    const bobSpeed = 1.5; // Slower, more ominous
    const baseY = waterLevel + 3;
    const driftSpeed = 0.05; // Slow drift

    scene.registerBeforeRender(() => {
        const time = performance.now() / 1000;
        // Vertical bobbing
        ship.position.y = baseY + Math.sin(time * bobSpeed) * bobAmplitude;
        // Gentle rocking
        ship.rotation.x = Math.cos(time * bobSpeed * 0.3) * 0.03;
        ship.rotation.z = Math.sin(time * bobSpeed * 0.4) * 0.04;
        // Slow circular drift
        ship.position.x += Math.cos(time * driftSpeed) * 0.01;
        ship.position.z += Math.sin(time * driftSpeed) * 0.01;
    });
}


// ==================== PLAYER HOME LOADING ====================
async function loadPlayerHome(scene, engine) {
    const config = WORLD_CONFIG.playerHome;
    try {
        // Load forest house model
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/env/buildings/forest_house/", "scene.gltf", scene);
        const house = result.meshes[0];
        house.name = "playerHome";
        house.position = new BABYLON.Vector3(config.position.x, config.position.y, config.position.z);
        house.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);
        house.rotation = new BABYLON.Vector3(config.rotation.x, config.rotation.y, config.rotation.z);

        // Enable collisions
        result.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isPickable = true;
            mesh.metadata = { isPlayerHome: true };
        });

        // Create entrance circle marker
        const entrancePos = house.position.clone();
        entrancePos.x += config.entranceCircle.offset.x;
        entrancePos.z += config.entranceCircle.offset.z;

        const entranceCircle = createEntranceCircle(scene, entrancePos, config.entranceCircle.radius, engine);
        house.metadata.entranceCircle = entranceCircle;
        house.metadata.entrancePosition = entrancePos;

        console.log('  ✓ Player home loaded at starting island');
        return house;
    } catch (e) {
        console.warn('  ✗ Failed to load player home:', e.message);
        return null;
    }
}

function createEntranceCircle(scene, position, radius, engine) {
    // Create a glowing circle on the ground
    const circle = BABYLON.MeshBuilder.CreateDisc("homeEntrance", {
        radius: radius,
        tessellation: 64
    }, scene);

    circle.position = position.clone();
    circle.position.y = 0.1; // Slightly above ground
    circle.rotation.x = Math.PI / 2; // Lay flat

    // Create glowing material
    const mat = new BABYLON.StandardMaterial("entranceMat", scene);
    mat.emissiveColor = new BABYLON.Color3(0.3, 0.6, 1.0); // Blue glow
    mat.alpha = 0.6;
    mat.disableLighting = true;
    circle.material = mat;

    // Add pulsing animation
    let pulseTime = 0;
    scene.registerBeforeRender(() => {
        pulseTime += engine.getDeltaTime() / 1000;
        const pulse = 0.4 + Math.sin(pulseTime * 2) * 0.2;
        mat.alpha = pulse;
        mat.emissiveColor = new BABYLON.Color3(0.3 * pulse, 0.6 * pulse, 1.0 * pulse);
    });

    circle.metadata = {
        isEntrance: true,
        targetScene: 'playerHomeInterior',
        radius: radius
    };

    return circle;
}

function setupHomeEntrance(scene, house, character, engine) {
    const entranceCircle = house.metadata.entranceCircle;
    const entrancePos = house.metadata.entrancePosition;

    // Check if player is in entrance circle
    scene.registerBeforeRender(() => {
        if (!character || !character.position) return;

        const distance = BABYLON.Vector3.Distance(character.position, entrancePos);

        if (distance < WORLD_CONFIG.playerHome.entranceCircle.radius) {
            // Player is in entrance zone
            if (!entranceCircle.metadata.playerInZone) {
                entranceCircle.metadata.playerInZone = true;
                console.log('💡 Right-click to enter your home');
                // TODO: Show UI prompt
            }
        } else {
            if (entranceCircle.metadata.playerInZone) {
                entranceCircle.metadata.playerInZone = false;
                // TODO: Hide UI prompt
            }
        }
    });

    // Handle right-click to enter
    scene.onPointerDown = (evt, pickResult) => {
        if (evt.button === 2) { // Right click
            if (!character || !character.position) return;

            const distance = BABYLON.Vector3.Distance(character.position, entrancePos);

            if (distance < WORLD_CONFIG.playerHome.entranceCircle.radius) {
                console.log('🚪 Entering player home...');
                loadPlayerHomeInterior(scene, engine, character);
            }
        }
    };
}

// ==================== BOAT INTERACTION ====================
function setupBoatInteraction(scene, boat, player, hero, camera, waterLevel) {
    let isInBoat = false;
    let boatSpeed = 0;
    const maxSpeed = 100;
    const acceleration = 40;
    const deceleration = 20;
    const turnSpeed = 1.5;
    const interactionDistance = 40;
    const inputMap = {};

    // Create UI prompt
    const promptDiv = document.createElement('div');
    promptDiv.id = 'boatPrompt';
    promptDiv.innerHTML = '⛵ Right-click to board boat';
    promptDiv.style.cssText = `
        position: fixed; bottom: 150px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: #fff; padding: 10px 20px;
        border-radius: 8px; font-family: Arial; font-size: 16px;
        display: none; z-index: 1000; border: 2px solid #4a90d9;
    `;
    document.body.appendChild(promptDiv);

    // Input handling
    window.addEventListener('keydown', (evt) => { inputMap[evt.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (evt) => { inputMap[evt.key.toLowerCase()] = false; });

    // Right-click to enter/exit boat
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && pointerInfo.event.button === 2) {
            if (isInBoat) {
                exitBoat();
            } else {
                const distance = BABYLON.Vector3.Distance(player.position, boat.position);
                if (distance <= interactionDistance) {
                    enterBoat();
                }
            }
        }
    });

    function enterBoat() {
        isInBoat = true;
        hero.setEnabled(false);
        camera.lockedTarget = boat;
        player.position = boat.position.clone();
        promptDiv.innerHTML = '⛵ Right-click to exit | WASD to drive';
        promptDiv.style.display = 'block';
        window.dispatchEvent(new CustomEvent('boatEnter'));
    }

    function exitBoat() {
        isInBoat = false;
        hero.setEnabled(true);
        const exitOffset = new BABYLON.Vector3(15, 5, 0);
        player.position = boat.position.add(exitOffset);
        camera.lockedTarget = player;
        boatSpeed = 0;
        promptDiv.style.display = 'none';
        window.dispatchEvent(new CustomEvent('boatExit'));
    }

    // Update loop
    scene.registerBeforeRender(() => {
        const deltaTime = scene.getEngine().getDeltaTime() / 1000;

        // Proximity prompt
        if (!isInBoat) {
            const distance = BABYLON.Vector3.Distance(player.position, boat.position);
            promptDiv.style.display = distance <= interactionDistance ? 'block' : 'none';
            if (distance <= interactionDistance) {
                promptDiv.innerHTML = '⛵ Right-click to board boat';
            }
        }

        // Boat movement when player is in boat
        if (isInBoat) {
            const forward = new BABYLON.Vector3(Math.sin(boat.rotation.y), 0, Math.cos(boat.rotation.y));

            let targetSpeed = 0;
            if (inputMap['w'] || inputMap['arrowup']) targetSpeed = maxSpeed;
            else if (inputMap['s'] || inputMap['arrowdown']) targetSpeed = -maxSpeed * 0.5;

            // Smooth acceleration
            if (targetSpeed > boatSpeed) boatSpeed = Math.min(boatSpeed + acceleration * deltaTime, targetSpeed);
            else if (targetSpeed < boatSpeed) boatSpeed = Math.max(boatSpeed - deceleration * deltaTime, targetSpeed);
            else if (boatSpeed > 0) boatSpeed = Math.max(0, boatSpeed - deceleration * deltaTime);
            else if (boatSpeed < 0) boatSpeed = Math.min(0, boatSpeed + deceleration * deltaTime);

            // Turning
            const turnMultiplier = Math.abs(boatSpeed) / maxSpeed;
            if (inputMap['a'] || inputMap['arrowleft']) boat.rotation.y += turnSpeed * deltaTime * turnMultiplier;
            if (inputMap['d'] || inputMap['arrowright']) boat.rotation.y -= turnSpeed * deltaTime * turnMultiplier;

            // Apply movement
            const movement = forward.scale(boatSpeed * deltaTime);
            boat.position.addInPlace(movement);
            player.position.x = boat.position.x;
            player.position.z = boat.position.z;
        }
    });

    // Expose state
    window.BOAT_STATE = { isInBoat: () => isInBoat, boat };
}

// ==================== LOD CULLING SYSTEM ====================
function setupLODCulling(scene, camera, islands) {
    const LOD_CHECK_INTERVAL = 500; // Check every 500ms
    let lastCheck = 0;

    scene.registerBeforeRender(() => {
        const now = performance.now();
        if (now - lastCheck < LOD_CHECK_INTERVAL) return;
        lastCheck = now;

        const cameraPos = camera.position;
        islands.forEach(island => {
            const distance = BABYLON.Vector3.Distance(cameraPos, island.root.position);
            const lodDistance = island.config.lodDistance || 2000;

            // Simple LOD: hide meshes beyond 3x lodDistance
            const visible = distance < lodDistance * 3;
            island.meshes.forEach(mesh => {
                if (mesh.isEnabled() !== visible) {
                    mesh.setEnabled(visible);
                }
            });
        });
    });
}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.White();
    const environmentURL = "./assets/textures/lighting/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 1.0;
}

function createSkydome(scene) {
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 8000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./assets/textures/lighting/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    return skybox;
}



function setupTerrain(scene) {
    const terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
    terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    terrainMaterial.specularPower = 64;
    terrainMaterial.mixTexture = new BABYLON.Texture("assets/textures/terrain/mixMap.png", scene);
    terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/textures/terrain/floor.png", scene);
    terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/textures/terrain/rock.png", scene);
    terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/textures/terrain/grass.png", scene);

    terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 15;
    terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 8;
    terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 23;

    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "assets/textures/terrain/hieghtMap.png", {
        width: 1000,
        height: 1000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 100,
        onReady: function (ground) {
            ground.position.y = -10.05;
            ground.material = terrainMaterial;
            ground.receiveShadows = true;
            // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.0, friction: 100.8 }, scene);
            // setTimeout(() => scene.physicsEnabled = true, 1000); // Enable physics after the ground is ready
            var groundAggregate;
            groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
            setTimeout(() => {
                scene.physicsEnabled = true;
            }, 10);
        }
    }, scene);

    return ground;
}



function setupLighting(scene) {
    const light = new BABYLON.DirectionalLight("light0", new BABYLON.Vector3(-800, -1400, -1000), scene);
    light.intensity = 1.7;
    // light.shadowMinZ = 1800;
    // light.shadowMinZ = 2100;
    light.shadowMinZ = 1500;
    light.shadowMaxZ = 2300;
    light.diffuse = new BABYLON.Color3(1, 1, 1);

    // var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 1.7;

    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(0, 1, 0);
    // light.groundColor = new BABYLON.Color3(0, 0.5, 1);

    return light;
}

function setupShadows(light, shadowCaster) {

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    // shadowGenerator.useExponentialShadowMap = false;
    shadowGenerator.darkness = 0.6;
    // shadowGenerator.darkness = 1;
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.nearPlane = 1;
    shadowGenerator.farPlane = 10000;
    shadowGenerator.minZ = -100;
    shadowGenerator.addShadowCaster(shadowCaster);
}

function loadHPModels(scene, engine, HPBar) {
    HPBAR = HPBar;
    var blackMaterial = new BABYLON.StandardMaterial("blackMat", scene);
    blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black color
    blackMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlight
    HPBAR.getChildMeshes()[1].material = blackMaterial;

    const shaderMaterial = new BABYLON.ShaderMaterial(
        "hpbar",
        scene,
        {
            vertex: "../../../../../shaders/hp/hp",
            fragment: "../../../shaders/hp/hp",
        },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["worldViewProjection", "iTime", "iResolution", "iChannel0", "iChannel1"]
        },
    );

    var iChannel0 = new BABYLON.Texture("assets/textures/effects/ripple.png", scene);
    var iChannel1 = new BABYLON.Texture("assets/textures/effects/bar.png", scene);

    shaderMaterial.setTexture("iChannel0", iChannel0);
    shaderMaterial.setTexture("iChannel1", iChannel1);
    shaderMaterial.setFloat("iTime", 0);
    shaderMaterial.setVector2("iResolution", new BABYLON.Vector2(engine.getRenderWidth(), engine.getRenderHeight()));

    var iTime = 0;
    scene.onBeforeRenderObservable.add(() => {
        iTime += engine.getDeltaTime() / 1000.0;
        shaderMaterial.setFloat("iTime", iTime);
    });
    HPBAR.getChildMeshes()[0].material = shaderMaterial;


}

function setupPostProcessing(scene, camera) {
    // scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    const pipeline = new BABYLON.DefaultRenderingPipeline(
        "default", // The name of the pipeline
        true,     // Do you want HDR textures?
        scene,    // The scene linked to
        [camera]  // The list of cameras to be attached to
    );

    // Configure effects
    pipeline.samples = 4;  // MSAA anti-aliasing
    pipeline.fxaaEnabled = true;   // Enable FXAA

    pipeline.bloomEnabled = true;  // Enable bloom
    pipeline.bloomThreshold = 1.8500;//only affect sun not clouds

    const imgProc = pipeline.imageProcessing;

    // Apply contrast and exposure adjustments
    imgProc.contrast = 1.6;
    imgProc.exposure = 1.8;

    // Enable tone mapping
    // imgProc.toneMappingEnabled = true;
    // imgProc.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

    // Apply vignette effect
    imgProc.vignetteEnabled = true;
    imgProc.vignetteWeight = 2.6;
    imgProc.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
    imgProc.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;
    //     var sharpen = new BABYLON.SharpenPostProcess("sharpen", 1.0, camera);
    // sharpen.edgeAmount = 0.15;  // Increase or decrease for more or less sharpening
    // sharpen.colorAmount = 1.0;

}

function addFireball(scene, engine) {
    let orbMaterial = addShaders(scene, engine);

    const sphere = BABYLON.MeshBuilder.CreateSphere("Fireball Orb", { diameter: 2, segments: 32 }, scene);
    sphere.material = orbMaterial;
    sphere.material.backFaceCulling = true;
    sphere.material.alphaMode = BABYLON.Constants.ALPHA_COMBINE;
    sphere.material.needAlphaBlending = function () { return true; };

    createTrailFire(scene, engine, sphere);
    return sphere;
}

function addShaders(scene, engine) {
    var orbMaterial = new BABYLON.ShaderMaterial("orb", scene, {
        vertex: "../../../shaders/vfx/orb",
        fragment: "../../../shaders/vfx/orb"
    }, {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "iTime", "iResolution", "iMouse", "Radius", "Background", "NoiseSteps", "NoiseAmplitude", "NoiseFrequency", "Animation", "Color1", "Color2", "Color3", "Color4"]
    });

    orbMaterial.setFloat("Radius", 2.0);
    orbMaterial.setVector4("Background", new BABYLON.Vector4(0.1, 0.0, 0.0, 0.0));
    orbMaterial.setInt("NoiseSteps", 8);
    orbMaterial.setFloat("NoiseAmplitude", 0.09);
    orbMaterial.setFloat("NoiseFrequency", 1.2);
    orbMaterial.setVector3("Animation", new BABYLON.Vector3(0.0, -2.0, 0.5));
    orbMaterial.setVector4("Color1", new BABYLON.Vector4(1.0, 1.0, 1.0, 1.0));
    orbMaterial.setVector4("Color2", new BABYLON.Vector4(1.0, 0.3, 0.0, 1.0));
    orbMaterial.setVector4("Color3", new BABYLON.Vector4(1.0, 0.03, 0.0, 1.0));
    orbMaterial.setVector4("Color4", new BABYLON.Vector4(0.05, 0.02, 0.02, 1.0));


    engine.runRenderLoop(() => {
        orbMaterial.setFloat("iTime", performance.now() * 0.001);
        orbMaterial.setVector2("iResolution", new BABYLON.Vector2(engine.getRenderWidth(), engine.getRenderHeight()));
        orbMaterial.setFloat("uAlpha", 0.5);
    });

    function creatDebug() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "220px";
        panel.top = "-20px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(panel);

        const createSlider = (label, min, max, value, step, callback) => {
            const header = new BABYLON.GUI.TextBlock();
            header.text = label;
            header.height = "30px";
            header.color = "white";
            panel.addControl(header);

            const slider = new BABYLON.GUI.Slider();
            slider.minimum = min;
            slider.maximum = max;
            slider.value = value;
            slider.step = step;
            slider.height = "20px";
            slider.width = "200px";
            slider.onValueChangedObservable.add(callback);
            panel.addControl(slider);
        };

        const createColorPicker = (label, defaultColor, callback) => {
            const header = new BABYLON.GUI.TextBlock();
            header.text = label;
            header.height = "30px";
            header.color = "white";
            panel.addControl(header);

            const picker = new BABYLON.GUI.ColorPicker();
            picker.value = defaultColor;
            picker.height = "150px";
            picker.width = "150px";
            picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            picker.onValueChangedObservable.add(callback);
            panel.addControl(picker);
        };


        createSlider("Radius", 0.0, 5.0, 2.0, 0.1, value => orbMaterial.setFloat("Radius", value));
        createSlider("Noise Amplitude", 0.0, 1.0, 0.09, 0.01, value => orbMaterial.setFloat("NoiseAmplitude", value));
        createSlider("Noise Frequency", 0.0, 5.0, 1.2, 0.1, value => orbMaterial.setFloat("NoiseFrequency", value));

        createColorPicker("Color1", BABYLON.Color3.FromHexString("#640000"), color => {
            orbMaterial.setVector4("Color1", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });

        createColorPicker("Color2", BABYLON.Color3.FromHexString("#ff4d00"), color => {
            orbMaterial.setVector4("Color2", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });

        createColorPicker("Color3", BABYLON.Color3.FromHexString("#ff0a00"), color => {
            orbMaterial.setVector4("Color3", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });

        createColorPicker("Color4", BABYLON.Color3.FromHexString("#0d0505"), color => {
            orbMaterial.setVector4("Color4", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });
    }

    // if (DEBUG) creatDebug();




    return orbMaterial;
}

function createTrailFire(scene, engine, sphere) {
    let spawnPoint = new BABYLON.Vector3(154.683, 70, -281.427);
    sphere.position.y = spawnPoint.y;
    sphere.position.x = spawnPoint.x;
    sphere.position.z = spawnPoint.z;
    // sphere.position = spawnPoint;

    // uncomment for fireball demo
    // sphere.scaling.scaleInPlace(3, 3, 3);
    // // Animate the sphere
    // var AlphaTime = 0;
    // var alpha = 0;
    // var alphaChange = 0.5;
    // scene.registerBeforeRender(function () {
    //     sphere.position.x = 19.1 * Math.cos(alpha) + spawnPoint.x;
    //     sphere.position.y = 2 * Math.sin(alpha) + spawnPoint.y;
    //     // sphere.position.y = 4 * Math.sin(alpha) + spawnPoint.y;
    //     // sphere.position.y = 20 * Math.sin(alpha);
    //     sphere.position.z = 5.1 * Math.sin(alpha) + spawnPoint.z;

    //     alphaChange = 0.05 * Math.sin(AlphaTime);
    //     alpha += alphaChange;
    //     AlphaTime += 0.01;

    //     // alpha += 0.01;
    //     // alpha += 0.05;
    // });



    SHADERS['fireTrailShader'] = new BABYLON.ShaderMaterial("fireTrail", scene, {
        vertex: "../../../shaders/vfx/trail",
        fragment: "../../../shaders/vfx/trail",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldViewProjection", "view", "projection", "time"],
        needAlphaBlending: true
    });
    SHADERS['fireTrailShader'].transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    // fireTrailShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    const trail = new BABYLON.TrailMesh("trail", sphere, scene, 0.5, 120, true);
    trail.diameter = 0.5;
    trail.material = SHADERS['fireTrailShader'];
    trail.alphaIndex = 0; // Set beside fire shader
    // trail.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // trail.scaling.scaleInPlace(1, 1, 1);

    let time = 0;
    scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;
        SHADERS['fireTrailShader'].setFloat("time", time);
        // trail.update();
    });

    // trail.parent = sphere;



    // const gizmoManager = new BABYLON.GizmoManager(scene);

    // // Enable position, rotation, and scale gizmos
    // gizmoManager.positionGizmoEnabled = true;
    // gizmoManager.rotationGizmoEnabled = true;
    // gizmoManager.scaleGizmoEnabled = true;

    // // Attach the gizmo to the trail
    // gizmoManager.attachToMesh(trail);





    // Create the trail material
    // var trailMaterial = new BABYLON.StandardMaterial("trailMaterial", scene);
    // trailMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);

    // // Create the trail mesh
    // var trail = new BABYLON.TrailMesh("trail", sphere, scene, 0.2, 30, true);
    // trail.material = trailMaterial;

}


function createTrail(scene, engine, objectToAttach, diameter, segments, offset, rotation, scale) {
    const fireTrailShader = new BABYLON.ShaderMaterial("fireTrail", scene, {
        vertex: "../../../shaders/vfx/trail_sword",
        fragment: "../../../shaders/vfx/trail_sword",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldViewProjection", "view", "projection", "time"],
        needAlphaBlending: true
    });
    // fireTrailShader.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    fireTrailShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    fireTrailShader.backFaceCulling = false;

    var trailNode = new BABYLON.TransformNode("trailNode");
    trailNode.parent = objectToAttach;
    trailNode.position = offset;
    trailNode.scaling.scale
    // Set rotation in degrees
    var rotationXInDegrees = 196.2000;
    var rotationYInDegrees = 269.8000;
    var rotationZInDegrees = 0;

    // Convert rotation from degrees to radians
    trailNode.rotation.x = BABYLON.Tools.ToRadians(rotationXInDegrees);
    trailNode.rotation.y = BABYLON.Tools.ToRadians(rotationYInDegrees);
    trailNode.rotation.z = BABYLON.Tools.ToRadians(rotationZInDegrees);

    // Set scale
    trailNode.scaling = new BABYLON.Vector3(1, 0.2, 1);

    // Can also rotate trailNode for cool effects!
    // can use rotate z for hand casting animation!

    const trail = new BABYLON.TrailMesh("SwordTrail", trailNode, scene, diameter, segments, true);
    trail.diameter = diameter;
    trail.material = fireTrailShader;
    trail.alphaIndex = 0; // Set beside fire shader
    // trail.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // trail.scaling.scaleInPlace(1, 1, 1);

    var offset = new BABYLON.Vector3(0, 2, 0);

    const parentMesh = objectToAttach;
    // Function to apply local transformation
    function applyLocalTransformation(mesh, offset) {
        // Transform the offset into the parent mesh's local space
        var worldMatrix = mesh.getWorldMatrix();
        var localOffset = BABYLON.Vector3.TransformCoordinates(offset, worldMatrix);
        return localOffset;
    }
    // Update the trail mesh position with the offset
    let time = 0;
    scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;
        fireTrailShader.setFloat("time", time);

        // var localOffset = applyLocalTransformation(parentMesh, offset);
        // trail.position = parentMesh.position.add(localOffset);
        // trail.rotationQuaternion = parentMesh.rotationQuaternion ? parentMesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
        // trail.update();
    });

    // trail.rotation.y = Math.PI / 4; // 45 degrees

}


function saveDepthMap(scene, engine) {
    var depthRenderer = scene.enableDepthRenderer();
    if (!depthRenderer) {
        console.error('Failed to enable depth renderer.');
        return;
    }

    var depthTexture = depthRenderer.getDepthMap();
    if (!depthTexture) {
        console.error('Failed to get depth map.');
        return;
    }

    console.log(depthTexture);
    saveDepthTextureToFile(depthTexture, "depth.jpg", scene);

    if (!engine) {
        console.error('Failed to get engine from scene.');
        return;
    }

    var width = depthTexture.getSize().width;
    var height = depthTexture.getSize().height;

    var internalTexture = depthTexture.getInternalTexture();
    if (!internalTexture) {
        console.error('Failed to get internal texture from depth map.');
        return;
    }

    var pixels = new Uint8Array(width * height * 4);

    try {
        engine.bindFramebuffer(internalTexture);
    } catch (error) {
        console.error('Failed to bind framebuffer:', error);
        return;
    }

    // Check if framebuffer binding is successful
    if (!engine._currentFramebuffer) {
        console.error('Failed to bind framebuffer.');
        engine.unBindFramebuffer(internalTexture);
        return;
    }

    try {
        engine.readPixels(0, 0, width, height, pixels);
    } catch (error) {
        console.error('Error reading pixels:', error);
        engine.unBindFramebuffer(internalTexture);
        return;
    }

    engine.unBindFramebuffer(internalTexture);

    // Create a canvas to convert the pixels to an image
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    var imageData = context.createImageData(width, height);

    // Copy pixel data to the ImageData object
    for (var i = 0; i < pixels.length; i++) {
        imageData.data[i] = pixels[i];
    }

    context.putImageData(imageData, 0, 0);

    // Convert the canvas to a data URL
    var dataURL = canvas.toDataURL();

    // Trigger a download of the data URL
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'depthMap.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveDepthTextureToFile(depthTexture, fileName, scene) {
    // Create a dynamic texture for the output
    var dynamicTexture = new BABYLON.DynamicTexture("dynamicTexture", depthTexture.getSize(), scene, false);
    var context = dynamicTexture.getContext();

    // Get the width and height of the texture
    var width = depthTexture.getSize().width;
    var height = depthTexture.getSize().height;

    // Create a framebuffer to read the depth data
    var gl = scene.getEngine()._gl;
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture._texture, 0);

    // Create an array to hold the depth data
    var depthData = new Float32Array(width * height);
    gl.readPixels(0, 0, width, height, gl.DEPTH_COMPONENT, gl.FLOAT, depthData);

    // Unbind the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Convert the depth data to grayscale image data
    var imageData = context.createImageData(width, height);
    for (var i = 0; i < depthData.length; i++) {
        var value = Math.floor(depthData[i] * 255); // Convert depth value to 0-255 range
        imageData.data[i * 4] = value;     // Red
        imageData.data[i * 4 + 1] = value; // Green
        imageData.data[i * 4 + 2] = value; // Blue
        imageData.data[i * 4 + 3] = 255;   // Alpha
    }

    // Put the image data onto the dynamic texture
    context.putImageData(imageData, 0, 0);

    // Convert the dynamic texture to a base64 string
    var base64String = context.canvas.toDataURL();

    // Create a link element
    var link = document.createElement('a');
    link.href = base64String;
    link.download = fileName;

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
