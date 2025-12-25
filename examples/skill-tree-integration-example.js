/**
 * Skill Tree Integration Example
 * Shows how to use the consolidated skill tree systems
 */

import { createSkillTreeManager } from '../assets/util/scripts/systems/SkillTreeManager.js';

/**
 * Setup complete skill tree system for player
 */
function setupSkillTrees(player) {
    console.log('🌳 Setting up skill tree system...');
    
    // Create skill tree manager
    const skillTreeManager = createSkillTreeManager(player, {
        defaultClass: 'Warrior',
        defaultWeapon: 'Sword'
    });
    
    // Update skill points based on player level
    skillTreeManager.updateSkillPoints();
    
    // Attach to player
    player.skillTreeManager = skillTreeManager;
    
    console.log('✅ Skill tree system ready!');
    return skillTreeManager;
}

/**
 * Example: Select class skills
 */
function exampleClassSkills(player) {
    const manager = player.skillTreeManager;
    const classTree = manager.getClassTree();
    
    // Switch to Warrior class
    classTree.changeClass('Warrior');
    
    // Select level 0 skill (Invincibility)
    classTree.selectSkill(0, 0);
    
    // At level 1, select Taunt
    if (player.level >= 1) {
        classTree.selectSkill(1, 0); // Taunt
    }
    
    // At level 5, select Damage Surge
    if (player.level >= 5) {
        classTree.selectSkill(5, 0); // Damage Surge
    }
    
    // At level 10, select Dual Wield
    if (player.level >= 10) {
        classTree.selectSkill(10, 0); // Dual Wield
    }
    
    // Get all unlocked skills
    const unlockedSkills = classTree.getUnlockedSkills();
    console.log('🎯 Unlocked Class Skills:', unlockedSkills);
}

/**
 * Example: Allocate weapon skill points
 */
function exampleWeaponSkills(player) {
    const manager = player.skillTreeManager;
    const weaponTree = manager.getWeaponTree();
    
    // Switch to Sword
    weaponTree.changeWeapon('Sword');
    
    // Allocate points in Tier 1
    weaponTree.allocatePoint(1, 0, 3); // Sharp Slash (max 3 points)
    weaponTree.allocatePoint(1, 1, 2); // Swift Blade (2 points)
    
    // Allocate points in Tier 2
    weaponTree.allocatePoint(2, 0, 1); // Blade Dance (1 point)
    
    console.log('⚔️ Sword skills allocated!');
}

/**
 * Example: Use staff with magic schools
 */
function exampleStaffMagic(player) {
    const manager = player.skillTreeManager;
    const weaponTree = manager.getWeaponTree();
    
    // Switch to Staff
    weaponTree.changeWeapon('Staff');
    
    // Choose Fire school
    weaponTree.changeStaffSchool('Fire');
    
    // Allocate fire magic points
    weaponTree.allocatePoint(1, 0, 3); // Fire Affinity (max 3)
    weaponTree.allocatePoint(1, 1, 2); // Ignite (2 points)
    weaponTree.allocatePoint(2, 0, 1); // Fireball (1 point)
    
    console.log('🔥 Fire magic skills allocated!');
    
    // Switch to Ice school
    weaponTree.changeStaffSchool('Ice');
    weaponTree.allocatePoint(1, 0, 3); // Frost Affinity
    
    console.log('❄️ Ice magic skills allocated!');
}

/**
 * Example: Save and load progression
 */
function exampleSaveLoad(player) {
    const manager = player.skillTreeManager;
    
    // Save progression
    manager.save();
    console.log('💾 Progression saved to localStorage');
    
    // Export as JSON
    const json = manager.export();
    console.log('📤 Exported JSON:', json);
    
    // Load progression
    manager.load();
    console.log('📥 Progression loaded');
    
    // Import from JSON
    manager.import(json);
    console.log('📥 Imported from JSON');
}

/**
 * Example: Get skill tree info for UI
 */
function exampleGetInfo(player) {
    const manager = player.skillTreeManager;
    
    // Get complete info
    const info = manager.getInfo();
    
    console.log('📊 Skill Tree Info:');
    console.log('  Current View:', info.currentView);
    console.log('  Player Level:', info.playerLevel);
    console.log('  Available Points:', info.availablePoints);
    console.log('  Class:', info.class.className);
    console.log('  Weapon:', info.weapon.weaponName);
    
    return info;
}

/**
 * Example: Switch between class and weapon trees
 */
function exampleSwitchViews(player) {
    const manager = player.skillTreeManager;
    
    // View class tree
    manager.switchView('class');
    console.log('📖 Viewing class skill tree');
    
    // View weapon tree
    manager.switchView('weapon');
    console.log('⚔️ Viewing weapon skill tree');
}

/**
 * Example: Complete integration
 */
async function completeIntegration(player) {
    console.log('\n🎮 === SKILL TREE INTEGRATION EXAMPLE ===\n');
    
    // 1. Setup
    const manager = setupSkillTrees(player);
    
    // 2. Select class skills
    console.log('\n📚 Selecting class skills...');
    exampleClassSkills(player);
    
    // 3. Allocate weapon skills
    console.log('\n⚔️ Allocating weapon skills...');
    exampleWeaponSkills(player);
    
    // 4. Try staff magic
    console.log('\n🪄 Trying staff magic...');
    exampleStaffMagic(player);
    
    // 5. Switch views
    console.log('\n🔄 Switching views...');
    exampleSwitchViews(player);
    
    // 6. Get info
    console.log('\n📊 Getting info...');
    const info = exampleGetInfo(player);
    
    // 7. Save/Load
    console.log('\n💾 Save/Load example...');
    exampleSaveLoad(player);
    
    console.log('\n✅ === INTEGRATION COMPLETE ===\n');
    
    return manager;
}

/**
 * Example: Create UI for skill trees
 */
function createSkillTreeUI(manager) {
    // Create container
    const container = document.createElement('div');
    container.id = 'skill-tree-panel';
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 800px;
        height: 600px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #666;
        border-radius: 10px;
        padding: 20px;
        display: none;
        z-index: 2000;
    `;
    
    // Create tabs
    const tabsDiv = document.createElement('div');
    tabsDiv.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    `;
    
    const classTab = createTab('Class Skills', () => {
        manager.switchView('class');
        updateSkillTreeDisplay(manager);
    });
    
    const weaponTab = createTab('Weapon Skills', () => {
        manager.switchView('weapon');
        updateSkillTreeDisplay(manager);
    });
    
    tabsDiv.appendChild(classTab);
    tabsDiv.appendChild(weaponTab);
    container.appendChild(tabsDiv);
    
    // Create content area
    const contentDiv = document.createElement('div');
    contentDiv.id = 'skill-tree-content';
    contentDiv.style.cssText = `
        width: 100%;
        height: calc(100% - 60px);
        overflow-y: auto;
        color: #fff;
    `;
    container.appendChild(contentDiv);
    
    document.body.appendChild(container);
    
    return container;
}

/**
 * Create tab button
 */
function createTab(label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = `
        padding: 10px 20px;
        background: #444;
        color: #fff;
        border: 2px solid #666;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
    `;
    
    button.addEventListener('click', onClick);
    
    button.addEventListener('mouseenter', () => {
        button.style.background = '#666';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#444';
    });
    
    return button;
}

/**
 * Update skill tree display
 */
function updateSkillTreeDisplay(manager) {
    const contentDiv = document.getElementById('skill-tree-content');
    if (!contentDiv) return;
    
    const info = manager.getInfo();
    
    let html = `<h2>${info.currentView === 'class' ? info.class.className : info.weapon.weaponName}</h2>`;
    html += `<p>${info.currentView === 'class' ? info.class.description : info.weapon.description}</p>`;
    html += `<p>Available Points: ${info.availablePoints[info.currentView]}</p>`;
    html += `<hr>`;
    
    // TODO: Add skill buttons and progression display
    
    contentDiv.innerHTML = html;
}

// Export functions
export {
    setupSkillTrees,
    exampleClassSkills,
    exampleWeaponSkills,
    exampleStaffMagic,
    exampleSaveLoad,
    exampleGetInfo,
    exampleSwitchViews,
    completeIntegration,
    createSkillTreeUI
};

