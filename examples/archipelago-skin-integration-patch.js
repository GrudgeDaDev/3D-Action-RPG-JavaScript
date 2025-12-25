/**
 * Archipelago Scene - Character Skin Integration Patch
 * 
 * This file shows the changes needed to integrate character skin swapping
 * into the archipelago.js scene file.
 * 
 * INSTRUCTIONS:
 * 1. Add these imports at the top of archipelago.js
 * 2. Replace the loadHeroModel call with the skin manager integration
 * 3. Initialize the settings UI with skin swapper
 */

// ============================================
// STEP 1: Add these imports at the top
// ============================================

import { createCharacterSkinManager } from '../../character/CharacterSkinManager.js';
import { createCharacterSkinSwapperUI } from '../../ui/CharacterSkinSwapperUI.js';
import { SettingsUI } from '../../ui/SettingsUI.js';

// ============================================
// STEP 2: Replace the hero loading section
// ============================================

// OLD CODE (around line 64):
// const { hero, skeleton } = await loadHeroModel(scene, character);
// let anim = setupAnim(scene, skeleton);

// NEW CODE:
// Create skin manager
const skinManager = createCharacterSkinManager(scene);
await skinManager.loadSkinConfig();
skinManager.setCharacter(character);

// Load saved or default skin
const hasSavedSkin = skinManager.load();
let skinId = hasSavedSkin ? skinManager.currentSkinId : 'human';
const skinResult = await skinManager.applySkin(skinId, character);

let hero = skinResult.hero;
let skeleton = skinResult.skeleton;
let anim = setupAnim(scene, skeleton);

// ============================================
// STEP 3: Initialize Settings UI with Skin Swapper
// ============================================

// Add this AFTER the globalUI.initForScene call (around line 110):

// Initialize settings UI
let settingsUI = window.SETTINGS_UI;
if (!settingsUI) {
    settingsUI = new SettingsUI();
    await settingsUI.initialize();
    window.SETTINGS_UI = settingsUI;
}

// Create skin swapper UI
const skinSwapperUI = createCharacterSkinSwapperUI(skinManager, async (newSkinId) => {
    console.log(`🎨 Swapping to skin: ${newSkinId}`);
    
    // Apply new skin
    const result = await skinManager.applySkin(newSkinId, character);
    
    // Update references
    hero = result.hero;
    skeleton = result.skeleton;
    
    // Reinitialize animations
    if (anim) {
        anim.dispose?.();
    }
    anim = setupAnim(scene, skeleton);
    
    // Update character health references
    if (character.health) {
        character.health.rotationCheck = hero;
    }
    
    console.log(`✅ Skin swapped to: ${newSkinId}`);
});

// Connect to settings UI
settingsUI.setCharacterSkinSwapperUI(skinSwapperUI);

// Make globally accessible
window.SKIN_MANAGER = skinManager;
window.SKIN_SWAPPER_UI = skinSwapperUI;

console.log('✅ Character skin swapper integrated!');
console.log('💡 Press ESC to open settings, then click "🎨 Character Skins"');

// ============================================
// COMPLETE EXAMPLE - Full Integration
// ============================================

/**
 * Here's what the complete integration looks like in context:
 */

export async function createArchipelagoWithSkinSwapper(engine) {
    console.log('🏝️ Creating Archipelago Scene...');
    const scene = new BABYLON.Scene(engine);

    setupEnvironment(scene);
    createSkydome(scene, WORLD_SIZE);

    // Load islands
    console.log('🏝️ Loading islands...');
    const islands = await loadIslands(scene);

    // Spawn point
    const spawnPoint = new BABYLON.Vector3(BOAT_START_POS.x, BOAT_START_POS.y + 5, BOAT_START_POS.z);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);

    // Setup camera
    const camera = setupCamera(scene, character, engine);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 300;
    camera.radius = 40;
    camera.maxZ = WORLD_SIZE * 2;
    camera.wheelDeltaPercentage = 0.02;

    // ===== CHARACTER SKIN INTEGRATION START =====
    
    // Create skin manager
    const skinManager = createCharacterSkinManager(scene);
    await skinManager.loadSkinConfig();
    skinManager.setCharacter(character);

    // Load saved or default skin
    const hasSavedSkin = skinManager.load();
    let skinId = hasSavedSkin ? skinManager.currentSkinId : 'human';
    const skinResult = await skinManager.applySkin(skinId, character);

    let hero = skinResult.hero;
    let skeleton = skinResult.skeleton;
    let anim = setupAnim(scene, skeleton);

    // ===== CHARACTER SKIN INTEGRATION END =====

    // Setup player health
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    window.PLAYER = character;

    // ... rest of scene setup ...

    // Setup MMO-style UI
    console.log('🎮 Setting up MMO UI...');
    globalUI.initForScene(scene, character, { playerName: 'Explorer', playerLevel: 1 });

    // ===== SETTINGS UI WITH SKIN SWAPPER START =====
    
    // Initialize settings UI
    let settingsUI = window.SETTINGS_UI;
    if (!settingsUI) {
        settingsUI = new SettingsUI();
        await settingsUI.initialize();
        window.SETTINGS_UI = settingsUI;
    }

    // Create skin swapper UI
    const skinSwapperUI = createCharacterSkinSwapperUI(skinManager, async (newSkinId) => {
        console.log(`🎨 Swapping to skin: ${newSkinId}`);
        
        const result = await skinManager.applySkin(newSkinId, character);
        hero = result.hero;
        skeleton = result.skeleton;
        
        if (anim) anim.dispose?.();
        anim = setupAnim(scene, skeleton);
        
        if (character.health) {
            character.health.rotationCheck = hero;
        }
        
        console.log(`✅ Skin swapped to: ${newSkinId}`);
    });

    settingsUI.setCharacterSkinSwapperUI(skinSwapperUI);
    window.SKIN_MANAGER = skinManager;
    window.SKIN_SWAPPER_UI = skinSwapperUI;

    console.log('✅ Character skin swapper integrated!');
    console.log('💡 Press ESC to open settings, then click "🎨 Character Skins"');

    // ===== SETTINGS UI WITH SKIN SWAPPER END =====

    // ... rest of scene setup ...

    return scene;
}

