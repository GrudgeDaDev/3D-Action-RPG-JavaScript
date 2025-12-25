/**
 * Character Skin Swapper Integration Example
 * Shows how to integrate the character skin swapper into your game scenes
 */

import { createCharacterSkinManager } from '../src/character/CharacterSkinManager.js';
import { createCharacterSkinSwapperUI } from '../src/ui/CharacterSkinSwapperUI.js';
import { SettingsUI } from '../src/ui/SettingsUI.js';
import { setupAnim } from '../src/utils/anim.js';

/**
 * Example 1: Basic Integration in a Scene
 */
export async function integrateCharacterSkinSwapper(scene, character, settingsUI) {
    console.log('\n🎨 === INTEGRATING CHARACTER SKIN SWAPPER ===\n');

    // 1. Create skin manager
    const skinManager = createCharacterSkinManager(scene);
    await skinManager.loadSkinConfig();
    skinManager.setCharacter(character);

    // 2. Try to load saved skin
    const hasSavedSkin = skinManager.load();
    
    let currentHero, currentSkeleton, currentAnim;

    if (hasSavedSkin) {
        // Load saved skin
        console.log('📥 Loading saved skin...');
        const result = await skinManager.applySkin(skinManager.currentSkinId, character);
        currentHero = result.hero;
        currentSkeleton = result.skeleton;
        currentAnim = setupAnim(scene, currentSkeleton);
    } else {
        // Load default skin
        console.log('🎨 Loading default skin...');
        const result = await skinManager.applySkin('human', character);
        currentHero = result.hero;
        currentSkeleton = result.skeleton;
        currentAnim = setupAnim(scene, currentSkeleton);
    }

    // 3. Create skin swapper UI
    const skinSwapperUI = createCharacterSkinSwapperUI(skinManager, async (skinId) => {
        console.log(`🎨 Swapping to skin: ${skinId}`);
        
        // Apply new skin
        const result = await skinManager.applySkin(skinId, character);
        
        // Update references
        currentHero = result.hero;
        currentSkeleton = result.skeleton;
        
        // Reinitialize animations
        if (currentAnim) {
            currentAnim.dispose?.();
        }
        currentAnim = setupAnim(scene, currentSkeleton);
        
        // Update character health references if they exist
        if (character.health) {
            character.health.rotationCheck = currentHero;
        }
        
        console.log(`✅ Skin swapped to: ${skinId}`);
    });

    // 4. Connect to settings UI
    if (settingsUI) {
        settingsUI.setCharacterSkinSwapperUI(skinSwapperUI);
        console.log('✅ Connected skin swapper to settings UI');
    }

    // 5. Make globally accessible
    window.SKIN_MANAGER = skinManager;
    window.SKIN_SWAPPER_UI = skinSwapperUI;

    console.log('✅ Character skin swapper integrated!');

    return {
        skinManager,
        skinSwapperUI,
        currentHero,
        currentSkeleton,
        currentAnim
    };
}

/**
 * Example 2: Integration in Archipelago Scene
 */
export async function integrateInArchipelago(scene, character) {
    console.log('\n🏝️ === ARCHIPELAGO SCENE INTEGRATION ===\n');

    // Initialize settings UI if not already done
    let settingsUI = window.SETTINGS_UI;
    if (!settingsUI) {
        settingsUI = new SettingsUI();
        await settingsUI.initialize();
        window.SETTINGS_UI = settingsUI;
    }

    // Integrate skin swapper
    const integration = await integrateCharacterSkinSwapper(scene, character, settingsUI);

    console.log('✅ Archipelago integration complete!');
    console.log('💡 Press ESC to open settings, then click "🎨 Character Skins"');

    return integration;
}

/**
 * Example 3: Integration in Builder Scene
 */
export async function integrateInBuilder(scene, character) {
    console.log('\n🏗️ === BUILDER SCENE INTEGRATION ===\n');

    // Initialize settings UI if not already done
    let settingsUI = window.SETTINGS_UI;
    if (!settingsUI) {
        settingsUI = new SettingsUI();
        await settingsUI.initialize();
        window.SETTINGS_UI = settingsUI;
    }

    // Integrate skin swapper
    const integration = await integrateCharacterSkinSwapper(scene, character, settingsUI);

    console.log('✅ Builder integration complete!');
    console.log('💡 Press ESC to open settings, then click "🎨 Character Skins"');

    return integration;
}

/**
 * Example 4: Programmatic Skin Change
 */
export async function changeSkinProgrammatically(skinId) {
    const skinManager = window.SKIN_MANAGER;
    if (!skinManager) {
        console.error('❌ Skin manager not initialized');
        return;
    }

    const character = skinManager.character;
    if (!character) {
        console.error('❌ Character not set');
        return;
    }

    console.log(`🎨 Changing skin to: ${skinId}`);
    const result = await skinManager.applySkin(skinId, character);
    
    if (result) {
        console.log(`✅ Skin changed to: ${skinId}`);
        return result;
    } else {
        console.error(`❌ Failed to change skin to: ${skinId}`);
        return null;
    }
}

/**
 * Example 5: Get All Available Skins
 */
export function listAvailableSkins() {
    const skinManager = window.SKIN_MANAGER;
    if (!skinManager) {
        console.error('❌ Skin manager not initialized');
        return [];
    }

    const skins = skinManager.getAllSkins();
    
    console.log('\n📋 === AVAILABLE SKINS ===\n');
    skins.forEach(skin => {
        const current = skin.id === skinManager.currentSkinId ? '✓' : ' ';
        console.log(`[${current}] ${skin.icon} ${skin.name} (${skin.category})`);
    });
    console.log('');

    return skins;
}

/**
 * Example 6: Quick Skin Test
 */
export async function quickSkinTest() {
    const skinManager = window.SKIN_MANAGER;
    if (!skinManager) {
        console.error('❌ Skin manager not initialized');
        return;
    }

    const skins = skinManager.getAllSkins();
    const playableRaces = skins.filter(s => s.category === 'Playable Races');

    console.log('\n🧪 === QUICK SKIN TEST ===\n');
    console.log('Testing all playable race skins...');

    for (const skin of playableRaces) {
        console.log(`\n🎨 Testing: ${skin.name}`);
        await changeSkinProgrammatically(skin.id);
        
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Skin test complete!');
}

/**
 * Example 7: Console Commands
 */
export function setupConsoleCommands() {
    window.changeSkin = changeSkinProgrammatically;
    window.listSkins = listAvailableSkins;
    window.testSkins = quickSkinTest;
    window.showSkinSwapper = () => window.SKIN_SWAPPER_UI?.show();

    console.log('\n🎮 === CONSOLE COMMANDS AVAILABLE ===\n');
    console.log('changeSkin(skinId)    - Change to a specific skin');
    console.log('listSkins()           - List all available skins');
    console.log('testSkins()           - Test all playable race skins');
    console.log('showSkinSwapper()     - Show skin swapper UI');
    console.log('');
}

