/**
 * Action Bar Integration Example
 * Shows how to set up the action bar with all abilities and icons
 */

import { scriptManager } from '../src/scripting/ScriptManager.js';
import { actionBar } from '../src/ui/ActionBar.js';
import { iconGenerator } from '../assets/util/ui/ability-icons/icon-generator.js';

/**
 * Setup complete action bar with all abilities
 */
async function setupActionBar(player) {
    console.log('🎮 Setting up action bar...');
    
    // Initialize script manager
    await scriptManager.init({ hotReload: true });
    
    // Generate icons
    const icons = iconGenerator.generateAllIcons();
    
    // Load all abilities
    const abilities = await loadAllAbilities(player);
    
    // Add abilities to action bar with icons and hotkeys
    actionBar.setPlayer(player);
    
    // Slot 1: Slash (basic attack)
    actionBar.addAbility(abilities.slash, icons.slash, '1', 0);
    
    // Slot 2: Charge Attack
    actionBar.addAbility(abilities.charge, icons.charge, '2', 1);
    
    // Slot 3: Fireball
    actionBar.addAbility(abilities.fireball, icons.fireball, '3', 2);
    
    // Slot 4: Attack 2
    actionBar.addAbility(abilities.attack2, icons.attack2, '4', 3);
    
    // Slot 5: Combo
    actionBar.addAbility(abilities.combo, icons.combo, '5', 4);
    
    // Slot E: Dash
    actionBar.addAbility(abilities.dash, icons.dash, 'E', 5);
    
    console.log('✅ Action bar setup complete!');
    console.log('\n📋 Hotkeys:');
    console.log('  1 - Slash Attack ⚔️');
    console.log('  2 - Charge Attack 🏃⚔️');
    console.log('  3 - Fireball 🔥');
    console.log('  4 - Attack 2 ⚡');
    console.log('  5 - Combo 🌀');
    console.log('  E - Dash ⚡\n');
    
    return actionBar;
}

/**
 * Load all ability scripts
 */
async function loadAllAbilities(player) {
    console.log('📜 Loading abilities...');
    
    // Load slash ability
    const slashScript = await scriptManager.loadAbility('warrior/slash.js');
    const { SlashAbility } = slashScript.data;
    const slash = new SlashAbility(player);
    
    // Load charge attack
    const chargeScript = await scriptManager.loadAbility('player/ChargeAttack.js');
    const { ChargeAttack } = chargeScript.data;
    const charge = new ChargeAttack(player);
    
    // Load dash
    const dashScript = await scriptManager.loadAbility('player/DashAbility.js');
    const { DashAbility } = dashScript.data;
    const dash = new DashAbility(player);
    
    // Create placeholder abilities for fireball, attack2, combo
    const fireball = createFireballAbility(player);
    const attack2 = createAttack2Ability(player);
    const combo = createComboAbility(player);
    
    // Add all to player
    player.abilities = [slash, charge, fireball, attack2, combo, dash];
    
    console.log(`✅ Loaded ${player.abilities.length} abilities`);
    
    return { slash, charge, fireball, attack2, combo, dash };
}

/**
 * Create Fireball ability (placeholder)
 */
function createFireballAbility(player) {
    return {
        name: 'Fireball',
        description: 'Launch a fireball at your target',
        icon: '🔥',
        damage: 120,
        range: 25.0,
        cooldown: 6000,
        manaCost: 40,
        lastUsed: 0,
        
        canUse() {
            const now = Date.now();
            const cooldownRemaining = this.lastUsed + this.cooldown - now;
            
            if (cooldownRemaining > 0) {
                return { canUse: false, reason: `On cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` };
            }
            
            if (player.mana < this.manaCost) {
                return { canUse: false, reason: 'Not enough mana' };
            }
            
            return { canUse: true };
        },
        
        async execute(target) {
            if (!this.canUse().canUse) return false;
            
            player.mana -= this.manaCost;
            this.lastUsed = Date.now();
            
            console.log('🔥 Fireball launched!');
            // TODO: Implement fireball projectile
            
            return true;
        },
        
        getInfo() {
            const now = Date.now();
            const remaining = Math.max(0, this.lastUsed + this.cooldown - now);
            return {
                name: this.name,
                description: this.description,
                icon: this.icon,
                damage: this.damage,
                range: this.range,
                cooldown: this.cooldown / 1000,
                manaCost: this.manaCost,
                cooldownRemaining: remaining / 1000
            };
        }
    };
}

/**
 * Create Attack2 ability (placeholder)
 */
function createAttack2Ability(player) {
    return {
        name: 'Power Strike',
        description: 'A powerful secondary attack',
        icon: '⚡',
        damage: 80,
        range: 4.0,
        cooldown: 4000,
        staminaCost: 25,
        lastUsed: 0,
        
        canUse() {
            const now = Date.now();
            const cooldownRemaining = this.lastUsed + this.cooldown - now;
            
            if (cooldownRemaining > 0) {
                return { canUse: false, reason: `On cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` };
            }
            
            if (player.stamina < this.staminaCost) {
                return { canUse: false, reason: 'Not enough stamina' };
            }
            
            return { canUse: true };
        },
        
        async execute(target) {
            if (!this.canUse().canUse) return false;
            
            player.stamina -= this.staminaCost;
            this.lastUsed = Date.now();
            
            console.log('⚡ Power Strike!');
            // TODO: Implement power strike
            
            return true;
        },
        
        getInfo() {
            const now = Date.now();
            const remaining = Math.max(0, this.lastUsed + this.cooldown - now);
            return {
                name: this.name,
                description: this.description,
                icon: this.icon,
                damage: this.damage,
                range: this.range,
                cooldown: this.cooldown / 1000,
                staminaCost: this.staminaCost,
                cooldownRemaining: remaining / 1000
            };
        }
    };
}

/**
 * Create Combo ability (placeholder)
 */
function createComboAbility(player) {
    return {
        name: 'Whirlwind Combo',
        description: 'Execute a devastating combo attack',
        icon: '🌀',
        damage: 150,
        range: 5.0,
        cooldown: 10000,
        staminaCost: 50,
        lastUsed: 0,
        
        canUse() {
            const now = Date.now();
            const cooldownRemaining = this.lastUsed + this.cooldown - now;
            
            if (cooldownRemaining > 0) {
                return { canUse: false, reason: `On cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` };
            }
            
            if (player.stamina < this.staminaCost) {
                return { canUse: false, reason: 'Not enough stamina' };
            }
            
            return { canUse: true };
        },
        
        async execute(target) {
            if (!this.canUse().canUse) return false;
            
            player.stamina -= this.staminaCost;
            this.lastUsed = Date.now();
            
            console.log('🌀 Whirlwind Combo!');
            // TODO: Implement combo sequence
            
            return true;
        },
        
        getInfo() {
            const now = Date.now();
            const remaining = Math.max(0, this.lastUsed + this.cooldown - now);
            return {
                name: this.name,
                description: this.description,
                icon: this.icon,
                damage: this.damage,
                range: this.range,
                cooldown: this.cooldown / 1000,
                staminaCost: this.staminaCost,
                cooldownRemaining: remaining / 1000
            };
        }
    };
}

/**
 * Setup target selection system
 */
function setupTargetSelection(scene, player) {
    // Initialize global game state
    if (!window.GAME_STATE) {
        window.GAME_STATE = {};
    }
    
    // Click to select target
    scene.onPointerDown = (evt, pickResult) => {
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            // Check if clicked on enemy
            if (mesh.metadata && mesh.metadata.isEnemy) {
                selectTarget(mesh);
            }
        }
    };
    
    // Tab key to cycle targets
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            cycleTarget(scene, player);
        }
    });
}

/**
 * Select a target
 */
function selectTarget(target) {
    // Deselect previous target
    if (window.GAME_STATE.selectedTarget) {
        clearTargetHighlight(window.GAME_STATE.selectedTarget);
    }
    
    // Select new target
    window.GAME_STATE.selectedTarget = target;
    highlightTarget(target);
    
    console.log(`🎯 Target selected: ${target.name || 'Enemy'}`);
    
    // Update enemy frame UI
    updateEnemyFrame(target);
}

/**
 * Cycle to next target
 */
function cycleTarget(scene, player) {
    const enemies = scene.meshes.filter(m => 
        m.metadata && m.metadata.isEnemy && m.metadata.health > 0
    );
    
    if (enemies.length === 0) return;
    
    let currentIndex = -1;
    if (window.GAME_STATE.selectedTarget) {
        currentIndex = enemies.indexOf(window.GAME_STATE.selectedTarget);
    }
    
    const nextIndex = (currentIndex + 1) % enemies.length;
    selectTarget(enemies[nextIndex]);
}

/**
 * Highlight selected target
 */
function highlightTarget(target) {
    // Add highlight effect
    if (target.material) {
        target.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
    }
}

/**
 * Clear target highlight
 */
function clearTargetHighlight(target) {
    if (target.material) {
        target.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
    }
}

/**
 * Update enemy frame UI
 */
function updateEnemyFrame(target) {
    // TODO: Update enemy frame UI with target info
    console.log(`Enemy: ${target.name || 'Unknown'}`);
    console.log(`Health: ${target.metadata.health || 0}`);
}

/**
 * Complete integration
 */
async function integrateActionBarSystem(scene, player) {
    try {
        // Setup action bar
        await setupActionBar(player);
        
        // Setup target selection
        setupTargetSelection(scene, player);
        
        console.log('\n✅ Action bar system fully integrated!');
        console.log('\n🎮 Controls:');
        console.log('  1-5 - Use abilities');
        console.log('  E - Dash');
        console.log('  Tab - Cycle targets');
        console.log('  Click - Select target\n');
        
    } catch (error) {
        console.error('❌ Error integrating action bar:', error);
    }
}

// Export functions
export {
    setupActionBar,
    loadAllAbilities,
    setupTargetSelection,
    selectTarget,
    cycleTarget,
    integrateActionBarSystem
};

