/**
 * Player Home Interior Scene
 * A cozy interior space that serves as the player's base and respawn point
 */

import * as BABYLON from '@babylonjs/core';

// Interior configuration
const INTERIOR_CONFIG = {
    lighting: {
        ambient: new BABYLON.Color3(0.8, 0.7, 0.6), // Warm indoor lighting
        intensity: 0.8
    },
    exitCircle: {
        position: { x: 0, y: 0, z: -8 }, // Near door
        radius: 2
    },
    respawnPoint: { x: 0, y: 1, z: 0 }
};

/**
 * Create the player home interior scene
 */
export async function createPlayerHomeInterior(engine, canvas) {
    console.log('🏠 Creating player home interior...');
    
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1.0);
    scene.gravity = new BABYLON.Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true;

    // Lighting
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = INTERIOR_CONFIG.lighting.intensity;
    ambientLight.diffuse = INTERIOR_CONFIG.lighting.ambient;
    ambientLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.4);

    // Add point lights for cozy atmosphere
    const fireLight = new BABYLON.PointLight("fireLight", new BABYLON.Vector3(3, 2, 2), scene);
    fireLight.diffuse = new BABYLON.Color3(1.0, 0.6, 0.2);
    fireLight.intensity = 0.5;
    fireLight.range = 10;

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 25;
    camera.wheelPrecision = 50;

    // Load interior model
    console.log('📦 Loading interior model...');
    const interior = await loadInteriorModel(scene);

    // Create player character
    const character = await createInteriorCharacter(scene);

    // Create exit portal
    const exitPortal = createExitPortal(scene, engine);

    // Setup exit interaction
    setupExitInteraction(scene, character, exitPortal);

    console.log('✅ Player home interior ready!');

    return {
        scene,
        camera,
        character,
        interior,
        exitPortal,
        respawnPoint: INTERIOR_CONFIG.respawnPoint
    };
}

async function loadInteriorModel(scene) {
    try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/env/interior/forest_house/", "scene.gltf", scene);
        const interior = result.meshes[0];
        interior.name = "homeInterior";
        interior.position = BABYLON.Vector3.Zero();
        interior.scaling = new BABYLON.Vector3(5, 5, 5);

        // Enable collisions
        result.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isPickable = true;
        });

        console.log('  ✓ Interior model loaded');
        return interior;
    } catch (e) {
        console.warn('  ✗ Failed to load interior model:', e.message);
        // Create fallback room
        return createFallbackRoom(scene);
    }
}

function createFallbackRoom(scene) {
    // Simple box room as fallback
    const room = BABYLON.MeshBuilder.CreateBox("room", { width: 20, height: 8, depth: 20 }, scene);
    room.position.y = 4;
    
    const mat = new BABYLON.StandardMaterial("roomMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.4);
    room.material = mat;
    room.checkCollisions = true;
    
    // Flip normals to see inside
    room.scaling.x = -1;
    
    return room;
}

async function createInteriorCharacter(scene) {
    // Create simple character capsule
    const character = BABYLON.MeshBuilder.CreateCapsule("player", {
        radius: 0.5,
        height: 2
    }, scene);
    
    character.position = new BABYLON.Vector3(
        INTERIOR_CONFIG.respawnPoint.x,
        INTERIOR_CONFIG.respawnPoint.y,
        INTERIOR_CONFIG.respawnPoint.z
    );
    
    character.checkCollisions = true;
    character.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    
    const mat = new BABYLON.StandardMaterial("playerMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1.0);
    character.material = mat;
    
    return character;
}

function createExitPortal(scene, engine) {
    const config = INTERIOR_CONFIG.exitCircle;
    
    // Create glowing exit circle
    const circle = BABYLON.MeshBuilder.CreateDisc("exitPortal", {
        radius: config.radius,
        tessellation: 64
    }, scene);

