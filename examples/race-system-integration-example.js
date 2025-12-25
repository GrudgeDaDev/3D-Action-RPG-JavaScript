/**
 * Race System Integration Example
 * Shows how to integrate the race selection system into your game
 */

import { createRaceManager } from '../src/character/RaceManager.js';
import { createRaceSelectionUI } from '../src/ui/RaceSelectionUI.js';
import { loadHeroModel } from '../src/character/hero.js';

/**
 * Example 1: Basic race selection flow
 */
export async function exampleBasicRaceSelection(scene, character) {
    console.log('\n🎮 === BASIC RACE SELECTION EXAMPLE ===\n');

    // 1. Create race manager
    const raceManager = createRaceManager(scene);
    
    // 2. Load race configuration
    await raceManager.loadRaceConfig();
    
    // 3. Show race selection UI
    const raceUI = createRaceSelectionUI(raceManager, async (selectedRace) => {
        console.log(`✅ Player selected: ${selectedRace.name}`);
        
        // 4. Load the selected race model
        const heroModel = await loadHeroModel(scene, character, {
            raceId: selectedRace.id,
            raceManager: raceManager
        });
        
        console.log(`✅ Loaded ${selectedRace.name} model`);
        
        // 5. Apply race bonuses to character
        const characterData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            stamina: 100,
            maxStamina: 100,
            strength: 10,
            agility: 10,
            intelligence: 10
        };
        
        raceManager.applyRaceBonuses(characterData, selectedRace.id);
        
        console.log('📊 Character stats after race bonuses:', characterData);
    });
    
    await raceUI.show();
}

/**
 * Example 2: Load saved race
 */
export async function exampleLoadSavedRace(scene, character) {
    console.log('\n💾 === LOAD SAVED RACE EXAMPLE ===\n');

    const raceManager = createRaceManager(scene);
    await raceManager.loadRaceConfig();
    
    // Try to load saved race
    const loaded = raceManager.load();
    
    if (loaded) {
        const currentRace = raceManager.getCurrentRace();
        console.log(`📥 Loaded saved race: ${currentRace.name}`);
        
        // Load the saved race model
        const heroModel = await loadHeroModel(scene, character, {
            raceId: currentRace.id,
            raceManager: raceManager
        });
        
        console.log(`✅ Loaded ${currentRace.name} model`);
    } else {
        console.log('⚠️ No saved race found, showing selection UI');
        await exampleBasicRaceSelection(scene, character);
    }
}

/**
 * Example 3: Worges transformation (for Worg class)
 */
export async function exampleWorgesTransformation(scene, character, raceManager) {
    console.log('\n🐺 === WORGES TRANSFORMATION EXAMPLE ===\n');

    const currentRace = raceManager.getCurrentRace();
    
    // Transform to Worges form
    console.log(`🐺 Transforming to Worges form...`);
    await raceManager.transformToWorges(character, currentRace.id);
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Transform back to normal
    console.log(`👤 Transforming back to normal form...`);
    await raceManager.transformToNormal(character, currentRace.id);
}

/**
 * Example 4: Get race info for UI display
 */
export function exampleGetRaceInfo(raceManager) {
    console.log('\n📊 === RACE INFO EXAMPLE ===\n');

    const races = raceManager.getAllRaces();
    
    races.forEach(race => {
        const info = raceManager.getRaceInfo(race.id);
        console.log(`\n${info.icon} ${info.name}`);
        console.log(`  Description: ${info.description}`);
        console.log(`  Bonuses:`, info.bonuses);
        console.log(`  Has Worges Form: ${info.hasWorgesForm}`);
        if (info.specialAbilities.length > 0) {
            console.log(`  Special Abilities:`, info.specialAbilities);
        }
    });
}

/**
 * Example 5: Complete integration with character creation
 */
export async function exampleCompleteIntegration(scene) {
    console.log('\n🎮 === COMPLETE INTEGRATION EXAMPLE ===\n');

    // Create character transform node
    const character = new BABYLON.TransformNode('player', scene);
    
    // 1. Initialize race manager
    const raceManager = createRaceManager(scene);
    await raceManager.loadRaceConfig();
    
    // 2. Check for saved race
    const hasSavedRace = raceManager.load();
    
    if (hasSavedRace) {
        // Load saved race
        const currentRace = raceManager.getCurrentRace();
        console.log(`📥 Loading saved race: ${currentRace.name}`);
        
        const heroModel = await loadHeroModel(scene, character, {
            raceId: currentRace.id,
            raceManager: raceManager
        });
        
        // Apply bonuses
        const characterData = createDefaultCharacterData();
        raceManager.applyRaceBonuses(characterData, currentRace.id);
        
        console.log('✅ Character loaded with saved race');
        return { character, heroModel, characterData, raceManager };
        
    } else {
        // Show race selection
        console.log('🎭 No saved race, showing selection UI');
        
        return new Promise((resolve) => {
            const raceUI = createRaceSelectionUI(raceManager, async (selectedRace) => {
                console.log(`✅ Player selected: ${selectedRace.name}`);
                
                const heroModel = await loadHeroModel(scene, character, {
                    raceId: selectedRace.id,
                    raceManager: raceManager
                });
                
                const characterData = createDefaultCharacterData();
                raceManager.applyRaceBonuses(characterData, selectedRace.id);
                
                console.log('✅ Character created with selected race');
                resolve({ character, heroModel, characterData, raceManager });
            });
            
            raceUI.show();
        });
    }
}

/**
 * Helper: Create default character data
 */
function createDefaultCharacterData() {
    return {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        stamina: 100,
        maxStamina: 100,
        strength: 10,
        agility: 10,
        intelligence: 10,
        level: 1,
        experience: 0,
        specialAbilities: []
    };
}

/**
 * Example 6: Change race (for testing or respec)
 */
export async function exampleChangeRace(scene, character, raceManager, newRaceId) {
    console.log(`\n🔄 === CHANGE RACE EXAMPLE ===\n`);

    const oldRace = raceManager.getCurrentRace();
    console.log(`Current race: ${oldRace.name}`);
    
    // Set new race
    raceManager.setRace(newRaceId);
    const newRace = raceManager.getCurrentRace();
    console.log(`New race: ${newRace.name}`);
    
    // Reload character model
    // First, remove old model
    character.getChildren().forEach(child => child.dispose());
    
    // Load new model
    const heroModel = await loadHeroModel(scene, character, {
        raceId: newRaceId,
        raceManager: raceManager
    });
    
    // Recalculate stats
    const characterData = createDefaultCharacterData();
    raceManager.applyRaceBonuses(characterData, newRaceId);
    
    // Save
    raceManager.save();
    
    console.log(`✅ Changed race to ${newRace.name}`);
    return { heroModel, characterData };
}

/**
 * Example 7: Race comparison UI
 */
export function exampleRaceComparison(raceManager) {
    console.log('\n📊 === RACE COMPARISON ===\n');

    const races = raceManager.getAllRaces();
    
    console.log('Race Stat Comparison:');
    console.log('─'.repeat(80));
    console.log('Race'.padEnd(15), 'HP'.padEnd(8), 'MP'.padEnd(8), 'Stam'.padEnd(8), 'Str'.padEnd(8), 'Agi'.padEnd(8), 'Int'.padEnd(8));
    console.log('─'.repeat(80));
    
    races.forEach(race => {
        const b = race.bonuses;
        const hp = (b.health >= 0 ? '+' : '') + b.health;
        const mp = (b.mana >= 0 ? '+' : '') + b.mana;
        const stam = (b.stamina >= 0 ? '+' : '') + b.stamina;
        const str = (b.strength >= 0 ? '+' : '') + b.strength;
        const agi = (b.agility >= 0 ? '+' : '') + b.agility;
        const int = (b.intelligence >= 0 ? '+' : '') + b.intelligence;
        
        console.log(
            race.name.padEnd(15),
            hp.padEnd(8),
            mp.padEnd(8),
            stam.padEnd(8),
            str.padEnd(8),
            agi.padEnd(8),
            int.padEnd(8)
        );
    });
    
    console.log('─'.repeat(80));
}

