/**
 * Scripting System Integration Example
 * Shows how to integrate the ScriptManager into your game
 */

import { scriptManager } from '../src/scripting/ScriptManager.js';

/**
 * Example 1: Initialize the scripting system
 */
async function initializeScriptingSystem() {
    console.log('🎮 Initializing scripting system...');
    
    // Initialize with hot-reload enabled for development
    await scriptManager.init({ 
        hotReload: true  // Set to false in production
    });
    
    console.log('✅ Scripting system ready!');
}

/**
 * Example 2: Load and use utility functions
 */
async function useUtilityFunctions() {
    // Load core utils
    const utilsScript = await scriptManager.loadScript('core', 'utils.js');
    const utils = utilsScript.data;
    
    // Use utility functions
    const distance = utils.distance3D(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 10 }
    );
    console.log('Distance:', distance);
    
    const randomNum = utils.randomInt(1, 100);
    console.log('Random number:', randomNum);
    
    const interpolated = utils.lerp(0, 100, 0.5);
    console.log('Lerp result:', interpolated);
}

/**
 * Example 3: Load and use game constants
 */
async function useGameConstants() {
    const constantsScript = await scriptManager.loadScript('core', 'constants.js');
    const constants = constantsScript.data;
    
    console.log('Base health:', constants.STATS.BASE_HEALTH);
    console.log('Attack range:', constants.COMBAT.ATTACK_RANGE);
    console.log('Animations:', constants.ANIMATIONS);
}

/**
 * Example 4: Create a character with abilities
 */
async function createCharacterWithAbilities(character) {
    // Load the slash ability
    const abilityScript = await scriptManager.loadAbility('warrior/slash.js');
    const { SlashAbility } = abilityScript.data;
    
    // Create ability instance
    const slashAbility = new SlashAbility(character);
    
    // Add to character's abilities
    if (!character.abilities) {
        character.abilities = [];
    }
    character.abilities.push(slashAbility);
    
    console.log(`✅ Added ${slashAbility.name} ability to ${character.name}`);
    
    return slashAbility;
}

/**
 * Example 5: Load AI behavior for enemy
 */
async function setupEnemyAI(enemy) {
    // Load goblin behavior
    const behaviorScript = await scriptManager.loadBehavior('enemy/goblin.json');
    const behavior = behaviorScript.data;
    
    // Apply behavior to enemy
    enemy.behavior = behavior.behaviorTree;
    enemy.stats = behavior.stats;
    enemy.loot = behavior.loot;
    
    console.log(`✅ Applied ${behavior.name} to enemy`);
    console.log('Enemy stats:', enemy.stats);
    
    return behavior;
}

/**
 * Example 6: Use ability in combat
 */
async function performAbilityAttack(character, target) {
    // Get character's first ability
    const ability = character.abilities[0];
    
    if (!ability) {
        console.log('❌ No abilities available');
        return;
    }
    
    // Check if can use
    const canUse = ability.canUse();
    if (!canUse.canUse) {
        console.log(`❌ Cannot use ability: ${canUse.reason}`);
        return;
    }
    
    // Execute ability
    console.log(`⚔️ ${character.name} uses ${ability.name}!`);
    const success = await ability.execute(target);
    
    if (success) {
        console.log('✅ Ability executed successfully!');
    } else {
        console.log('❌ Ability failed');
    }
}

/**
 * Example 7: Hot-reload a script during development
 */
async function hotReloadScript() {
    console.log('🔄 Hot-reloading slash ability...');
    
    // Reload the script
    await scriptManager.reloadScript('abilities/warrior/slash.js');
    
    console.log('✅ Script reloaded!');
}

/**
 * Example 8: Complete game initialization with scripting
 */
async function initializeGame() {
    try {
        // 1. Initialize scripting system
        await initializeScriptingSystem();
        
        // 2. Load core scripts
        await useUtilityFunctions();
        await useGameConstants();
        
        // 3. Create player character
        const player = {
            name: 'Hero',
            position: { x: 0, y: 0, z: 0 },
            health: 100,
            mana: 50,
            stamina: 100,
            stats: { strength: 10 }
        };
        
        // 4. Add abilities to player
        await createCharacterWithAbilities(player);
        
        // 5. Create enemy
        const enemy = {
            name: 'Goblin',
            position: { x: 5, y: 0, z: 5 },
            health: 80,
            takeDamage: function(damage) {
                this.health -= damage;
                console.log(`${this.name} took ${damage} damage! HP: ${this.health}`);
            }
        };
        
        // 6. Setup enemy AI
        await setupEnemyAI(enemy);
        
        // 7. Simulate combat
        console.log('\n⚔️ Starting combat simulation...\n');
        await performAbilityAttack(player, enemy);
        
        console.log('\n✅ Game initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing game:', error);
    }
}

/**
 * Example 9: Get all loaded scripts
 */
function listLoadedScripts() {
    const scripts = scriptManager.getAllScripts();
    
    console.log('\n📜 Loaded Scripts:');
    scripts.forEach(script => {
        console.log(`  - ${script.key} (${script.category})`);
    });
}

/**
 * Example 10: Cleanup on game exit
 */
function cleanupScripting() {
    console.log('🧹 Cleaning up scripting system...');
    scriptManager.dispose();
    console.log('✅ Cleanup complete');
}

// Export examples
export {
    initializeScriptingSystem,
    useUtilityFunctions,
    useGameConstants,
    createCharacterWithAbilities,
    setupEnemyAI,
    performAbilityAttack,
    hotReloadScript,
    initializeGame,
    listLoadedScripts,
    cleanupScripting
};

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeGame().then(() => {
        listLoadedScripts();
    });
}

