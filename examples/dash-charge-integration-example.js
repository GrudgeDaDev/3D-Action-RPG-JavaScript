/**
 * Dash & Charge Attack Integration Example
 * Shows how to use the converted C# abilities in your Babylon.js game
 */

import { scriptManager } from '../src/scripting/ScriptManager.js';
import * as BABYLON from '@babylonjs/core';

/**
 * Example 1: Load and setup player with dash and charge abilities
 */
async function setupPlayerAbilities(player, scene) {
    console.log('🎮 Setting up player abilities...');
    
    // Initialize script manager
    await scriptManager.init({ hotReload: true });
    
    // Load dash ability
    const dashScript = await scriptManager.loadAbility('player/DashAbility.js');
    const { DashAbility } = dashScript.data;
    
    // Load charge attack
    const chargeScript = await scriptManager.loadAbility('player/ChargeAttack.js');
    const { ChargeAttack } = chargeScript.data;
    
    // Create ability instances
    const dashAbility = new DashAbility(player);
    const chargeAttack = new ChargeAttack(player);
    
    // Add to player
    if (!player.abilities) {
        player.abilities = [];
    }
    player.abilities.push(dashAbility, chargeAttack);
    
    console.log('✅ Player abilities loaded:');
    console.log(`  - ${dashAbility.name} (${dashAbility.icon})`);
    console.log(`  - ${chargeAttack.name} (${chargeAttack.icon})`);
    
    return { dashAbility, chargeAttack };
}

/**
 * Example 2: Bind abilities to keyboard input
 */
function bindAbilitiesToInput(scene, player) {
    console.log('⌨️ Binding abilities to keyboard...');
    
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            
            // E key - Dash Attack
            if (kbInfo.event.key === 'e' || kbInfo.event.key === 'E') {
                const dashAbility = player.abilities.find(a => a.name === 'Dash Attack');
                if (dashAbility) {
                    useDashAbility(player, dashAbility);
                }
            }
            
            // R key - Charge Attack
            if (kbInfo.event.key === 'r' || kbInfo.event.key === 'R') {
                const chargeAttack = player.abilities.find(a => a.name === 'Charge Attack');
                if (chargeAttack) {
                    useChargeAttack(player, chargeAttack);
                }
            }
            
            // Q key - Cancel current ability
            if (kbInfo.event.key === 'q' || kbInfo.event.key === 'Q') {
                cancelAllAbilities(player);
            }
        }
    });
    
    console.log('✅ Abilities bound to keys:');
    console.log('  - E: Dash Attack');
    console.log('  - R: Charge Attack');
    console.log('  - Q: Cancel');
}

/**
 * Example 3: Use dash ability
 */
async function useDashAbility(player, dashAbility) {
    const canUse = dashAbility.canUse();
    
    if (!canUse.canUse) {
        console.log(`❌ Cannot dash: ${canUse.reason}`);
        showMessage(`Cannot dash: ${canUse.reason}`);
        return;
    }
    
    console.log('⚡ Using Dash Attack!');
    showMessage('⚡ Dash Attack!');
    
    // Find nearest enemy
    const target = findNearestEnemy(player);
    
    if (!target) {
        console.log('❌ No target found');
        showMessage('No target in range');
        return;
    }
    
    // Execute dash
    const success = await dashAbility.execute(target);
    
    if (success) {
        console.log('✅ Dash completed!');
    }
}

/**
 * Example 4: Use charge attack
 */
async function useChargeAttack(player, chargeAttack) {
    // Find nearest enemy
    const target = findNearestEnemy(player);
    
    if (!target) {
        console.log('❌ No target found');
        showMessage('No target in range');
        return;
    }
    
    const canUse = chargeAttack.canUse(target);
    
    if (!canUse.canUse) {
        console.log(`❌ Cannot charge: ${canUse.reason}`);
        showMessage(`Cannot charge: ${canUse.reason}`);
        return;
    }
    
    console.log('🏃⚔️ Using Charge Attack!');
    showMessage('🏃⚔️ Charge Attack!');
    
    // Execute charge
    const success = await chargeAttack.apply(target);
    
    if (success) {
        console.log('✅ Charge attack completed!');
    }
}

/**
 * Example 5: Cancel all active abilities
 */
function cancelAllAbilities(player) {
    if (!player.abilities) return;
    
    player.abilities.forEach(ability => {
        if (ability.cancel) {
            ability.cancel();
        }
    });
    
    console.log('🛑 All abilities cancelled');
    showMessage('Abilities cancelled');
}

/**
 * Example 6: Find nearest enemy
 */
function findNearestEnemy(player) {
    if (!player.scene) return null;
    
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    player.scene.meshes.forEach(mesh => {
        if (mesh.metadata && mesh.metadata.isEnemy && mesh.metadata.health > 0) {
            const distance = BABYLON.Vector3.Distance(player.position, mesh.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = mesh;
            }
        }
    });
    
    return nearestEnemy;
}

/**
 * Example 7: Create UI for ability cooldowns
 */
function createAbilityUI(player) {
    const container = document.createElement('div');
    container.id = 'ability-ui';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
    `;
    
    player.abilities.forEach((ability, index) => {
        const abilityDiv = document.createElement('div');
        abilityDiv.id = `ability-${index}`;
        abilityDiv.style.cssText = `
            width: 60px;
            height: 60px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #fff;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            position: relative;
        `;
        
        abilityDiv.innerHTML = `
            <div>${ability.icon}</div>
            <div style="font-size: 10px; margin-top: 2px;">${['E', 'R'][index]}</div>
            <div class="cooldown" style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 0%;
                background: rgba(0, 0, 0, 0.8);
                transition: height 0.1s;
            "></div>
        `;
        
        container.appendChild(abilityDiv);
    });
    
    document.body.appendChild(container);
    
    // Update cooldowns
    setInterval(() => updateAbilityUI(player), 100);
}

/**
 * Update ability UI cooldowns
 */
function updateAbilityUI(player) {
    if (!player.abilities) return;
    
    player.abilities.forEach((ability, index) => {
        const abilityDiv = document.getElementById(`ability-${index}`);
        if (!abilityDiv) return;
        
        const cooldownDiv = abilityDiv.querySelector('.cooldown');
        const info = ability.getInfo();
        
        if (info.cooldownRemaining > 0) {
            const percent = (info.cooldownRemaining / (info.cooldown)) * 100;
            cooldownDiv.style.height = `${percent}%`;
            abilityDiv.style.opacity = '0.5';
        } else {
            cooldownDiv.style.height = '0%';
            abilityDiv.style.opacity = '1';
        }
    });
}

/**
 * Show message to player
 */
function showMessage(text) {
    // Simple console message - replace with your UI system
    console.log(`📢 ${text}`);
}

/**
 * Complete integration example
 */
async function integrateAbilities(scene, player) {
    try {
        // 1. Setup abilities
        const abilities = await setupPlayerAbilities(player, scene);
        
        // 2. Bind to input
        bindAbilitiesToInput(scene, player);
        
        // 3. Create UI
        createAbilityUI(player);
        
        console.log('\n✅ Dash & Charge abilities fully integrated!');
        console.log('\nControls:');
        console.log('  E - Dash Attack (⚡)');
        console.log('  R - Charge Attack (🏃⚔️)');
        console.log('  Q - Cancel\n');
        
        return abilities;
        
    } catch (error) {
        console.error('❌ Error integrating abilities:', error);
    }
}

// Export functions
export {
    setupPlayerAbilities,
    bindAbilitiesToInput,
    useDashAbility,
    useChargeAttack,
    cancelAllAbilities,
    findNearestEnemy,
    createAbilityUI,
    updateAbilityUI,
    integrateAbilities
};

