/**
 * Character Progression Integration Example
 * Shows how to integrate the character progression system into your game
 */

import { CharacterProgression, CLASSES } from '../src/character/CharacterProgression.js';
import { CharacterProgressionUI } from '../src/ui/CharacterProgressionUI.js';
import { ClassSelectionUI } from '../src/ui/ClassSelectionUI.js';

/**
 * Example 1: Basic Setup
 */
export function setupCharacterProgression(scene) {
    console.log('🎮 === CHARACTER PROGRESSION SETUP ===\n');

    // Create progression system
    const progression = new CharacterProgression();
    
    // Create UI
    const progressionUI = new CharacterProgressionUI(scene, progression);
    progressionUI.initialize();

    console.log('✅ Character progression system initialized');
    console.log(`Level: ${progression.level}`);
    console.log(`Unspent Points: ${progression.unspentPoints}`);
    
    return { progression, progressionUI };
}

/**
 * Example 2: Level Up Flow
 */
export function handleLevelUp(progression, scene) {
    console.log('\n📈 === LEVEL UP FLOW ===\n');

    // Add experience
    const xpGained = 150;
    console.log(`Gained ${xpGained} XP`);
    
    const levelsGained = progression.addExperience(xpGained);
    
    if (levelsGained.length > 0) {
        console.log(`🎉 LEVEL UP! New level(s): ${levelsGained.join(', ')}`);
        console.log(`Unspent points: ${progression.unspentPoints}`);
        
        // Check if player reached level 1 (class selection)
        if (levelsGained.includes(1)) {
            console.log('🎖️ Time to choose a class!');
            showClassSelection(progression, scene);
        }
    } else {
        console.log(`Progress: ${progression.experience}/${progression.getExperienceForNextLevel()} XP`);
    }
}

/**
 * Example 3: Class Selection
 */
export function showClassSelection(progression, scene) {
    console.log('\n🎖️ === CLASS SELECTION ===\n');

    const classSelectionUI = new ClassSelectionUI(
        scene,
        progression,
        (classKey, classData) => {
            console.log(`✅ Selected class: ${classData.name}`);
            console.log(`Starting ability: ${classData.startingAbility}`);
            console.log(`Recommended attributes: ${classData.recommendedAttributes.join(', ')}`);
            
            // You can trigger additional effects here
            // e.g., unlock abilities, show tutorial, etc.
        }
    );

    classSelectionUI.show();
}

/**
 * Example 4: Allocate Attributes
 */
export function allocateAttributesExample(progression) {
    console.log('\n⚡ === ATTRIBUTE ALLOCATION ===\n');

    // Allocate some points
    try {
        progression.allocateAttribute('Strength', 10);
        progression.allocateAttribute('Vitality', 5);
        progression.allocateAttribute('Dexterity', 8);
        
        console.log('✅ Attributes allocated:');
        console.log(`  Strength: ${progression.attributePoints.Strength}`);
        console.log(`  Vitality: ${progression.attributePoints.Vitality}`);
        console.log(`  Dexterity: ${progression.attributePoints.Dexterity}`);
        console.log(`  Unspent: ${progression.unspentPoints}`);
        
        // Get derived stats
        const stats = progression.getStats();
        console.log('\n📊 Derived Stats:');
        console.log(`  Health: ${Math.floor(stats.health)}`);
        console.log(`  Damage: ${Math.floor(stats.damage)}`);
        console.log(`  Defense: ${Math.floor(stats.defense)}`);
        console.log(`  Crit Chance: ${stats.criticalChance.toFixed(1)}%`);
        
        // Get build info
        const buildInfo = progression.getBuildInfo();
        console.log('\n🏆 Build Info:');
        console.log(`  Combat Power: ${buildInfo.combatPower}`);
        console.log(`  Rank: ${buildInfo.rank}`);
        console.log(`  Tier: ${buildInfo.tier.name}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

/**
 * Example 5: Save/Load Progression
 */
export function saveLoadExample(progression) {
    console.log('\n💾 === SAVE/LOAD PROGRESSION ===\n');

    // Save to localStorage
    const saveData = progression.toJSON();
    localStorage.setItem('character_progression', JSON.stringify(saveData));
    console.log('✅ Progression saved to localStorage');

    // Load from localStorage
    const loadedData = JSON.parse(localStorage.getItem('character_progression'));
    const newProgression = new CharacterProgression();
    newProgression.fromJSON(loadedData);
    
    console.log('✅ Progression loaded:');
    console.log(`  Level: ${newProgression.level}`);
    console.log(`  Class: ${newProgression.selectedClass || 'None'}`);
    console.log(`  Unspent Points: ${newProgression.unspentPoints}`);
    
    return newProgression;
}

/**
 * Example 6: Complete Integration in Game Scene
 */
export async function integrateInGameScene(scene) {
    console.log('\n🎮 === COMPLETE GAME INTEGRATION ===\n');

    // Setup progression
    const { progression, progressionUI } = setupCharacterProgression(scene);

    // Bind keyboard shortcut (C key to open character sheet)
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            if (kbInfo.event.key === 'c' || kbInfo.event.key === 'C') {
                progressionUI.toggle();
            }
        }
    });

    console.log('✅ Integration complete!');
    console.log('💡 Press C to open character progression UI');
    
    return { progression, progressionUI };
}

