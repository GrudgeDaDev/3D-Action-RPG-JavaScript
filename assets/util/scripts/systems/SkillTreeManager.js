/**
 * Unified Skill Tree Manager
 * Manages both Class and Weapon skill trees
 * 
 * Features:
 * - Tab switching between Class/Weapon trees
 * - Save/Load progression
 * - Integration with action bar
 * - Skill point management
 */

import { ClassSkillTree } from './ClassSkillTree.js';
import { WeaponSkillTree } from './WeaponSkillTree.js';

export class SkillTreeManager {
    constructor(player, options = {}) {
        this.player = player;
        
        // Initialize both skill tree systems
        this.classTree = new ClassSkillTree(player, {
            defaultClass: options.defaultClass || 'Warrior'
        });
        
        this.weaponTree = new WeaponSkillTree(player, {
            defaultWeapon: options.defaultWeapon || 'Sword'
        });
        
        // Current view
        this.currentView = 'class'; // 'class' or 'weapon'
        
        // Skill points
        this.availablePoints = {
            class: 0,
            weapon: 0
        };
        
        console.log('🌳 SkillTreeManager initialized');
    }

    /**
     * Switch between class and weapon trees
     */
    switchView(view) {
        if (view !== 'class' && view !== 'weapon') {
            console.log('❌ Invalid view. Use "class" or "weapon"');
            return false;
        }

        this.currentView = view;
        console.log(`🔄 Switched to ${view} skill tree`);
        return true;
    }

    /**
     * Get current tree
     */
    getCurrentTree() {
        return this.currentView === 'class' ? this.classTree : this.weaponTree;
    }

    /**
     * Get class tree
     */
    getClassTree() {
        return this.classTree;
    }

    /**
     * Get weapon tree
     */
    getWeaponTree() {
        return this.weaponTree;
    }

    /**
     * Calculate available skill points based on player level
     */
    updateSkillPoints() {
        if (!this.player) return;

        const level = this.player.level || 1;
        
        // Class points: 1 point every 5 levels
        this.availablePoints.class = Math.floor(level / 5);
        
        // Weapon points: 1 point every 2 levels
        this.availablePoints.weapon = Math.floor(level / 2);
        
        console.log(`📊 Skill Points - Class: ${this.availablePoints.class}, Weapon: ${this.availablePoints.weapon}`);
    }

    /**
     * Get available points for current view
     */
    getAvailablePoints() {
        return this.availablePoints[this.currentView];
    }

    /**
     * Spend skill point
     */
    spendPoint(type) {
        if (this.availablePoints[type] > 0) {
            this.availablePoints[type]--;
            return true;
        }
        return false;
    }

    /**
     * Get all unlocked abilities from both trees
     */
    getAllUnlockedAbilities() {
        const classSkills = this.classTree.getUnlockedSkills();
        const weaponSkills = this.weaponTree.getInfo(); // TODO: Get unlocked weapon skills
        
        return {
            class: classSkills,
            weapon: weaponSkills,
            total: classSkills.length
        };
    }

    /**
     * Get complete info for UI
     */
    getInfo() {
        const classInfo = this.classTree.getInfo();
        const weaponInfo = this.weaponTree.getInfo();
        
        return {
            currentView: this.currentView,
            availablePoints: this.availablePoints,
            playerLevel: this.player ? this.player.level : 0,
            class: classInfo,
            weapon: weaponInfo
        };
    }

    /**
     * Save all progression
     */
    save() {
        const saveData = {
            currentView: this.currentView,
            availablePoints: { ...this.availablePoints },
            classTree: this.classTree.save(),
            weaponTree: this.weaponTree.save()
        };

        // Save to localStorage
        localStorage.setItem('skillTreeProgress', JSON.stringify(saveData));
        console.log('💾 Saved skill tree progression');
        
        return saveData;
    }

    /**
     * Load all progression
     */
    load(data = null) {
        // Load from localStorage if no data provided
        if (!data) {
            const saved = localStorage.getItem('skillTreeProgress');
            if (saved) {
                data = JSON.parse(saved);
            }
        }

        if (!data) {
            console.log('⚠️ No saved progression found');
            return false;
        }

        // Load data
        if (data.currentView) {
            this.currentView = data.currentView;
        }
        if (data.availablePoints) {
            this.availablePoints = { ...data.availablePoints };
        }
        if (data.classTree) {
            this.classTree.load(data.classTree);
        }
        if (data.weaponTree) {
            this.weaponTree.load(data.weaponTree);
        }

        console.log('📥 Loaded skill tree progression');
        return true;
    }

    /**
     * Reset all progression
     */
    reset() {
        // Reset class tree
        this.classTree.changeClass(this.classTree.currentClass);
        
        // Reset weapon tree
        this.weaponTree.weaponProgress = {
            Sword: { tier: 0, skills: [] },
            Bow: { tier: 0, skills: [] },
            Staff: { tier: 0, skills: [], school: 'Fire' },
            Dagger: { tier: 0, skills: [] },
            Axe: { tier: 0, skills: [] },
            Hammer: { tier: 0, skills: [] }
        };
        
        // Reset points
        this.updateSkillPoints();
        
        console.log('🔄 Reset all skill trees');
    }

    /**
     * Export progression as JSON
     */
    export() {
        const data = this.save();
        const json = JSON.stringify(data, null, 2);
        console.log('📤 Exported skill tree data:');
        console.log(json);
        return json;
    }

    /**
     * Import progression from JSON
     */
    import(json) {
        try {
            const data = JSON.parse(json);
            this.load(data);
            console.log('📥 Imported skill tree data');
            return true;
        } catch (error) {
            console.error('❌ Failed to import skill tree data:', error);
            return false;
        }
    }
}

// Export singleton instance creator
export function createSkillTreeManager(player, options = {}) {
    return new SkillTreeManager(player, options);
}

