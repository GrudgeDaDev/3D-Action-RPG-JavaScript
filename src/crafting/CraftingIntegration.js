/**
 * CraftingIntegration.js
 * Integration layer between crafting system and game systems
 * Connects crafting with inventory, player stats, and game world
 */

import { getCraftingManager } from './CraftingManager.js';
import { CraftingUI } from './CraftingUI.js';

export class CraftingIntegration {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;
        this.craftingManager = getCraftingManager();
        this.craftingUI = null;
        this.inventory = null;
        this.player = null;
        this.workstationProximity = new Map(); // workstation name -> distance
    }

    /**
     * Initialize crafting integration
     */
    async initialize(inventory, player) {
        console.log('🔧 Initializing Crafting Integration...');
        
        this.inventory = inventory;
        this.player = player;

        // Initialize crafting manager
        await this.craftingManager.initialize();

        // Initialize crafting UI
        this.craftingUI = new CraftingUI(this.scene);
        this.craftingUI.initialize();
        this.craftingUI.setInventory(this.inventory);

        // Setup input handlers
        this.setupInputHandlers();

        console.log('✅ Crafting Integration initialized');
    }

    /**
     * Setup input handlers for crafting
     */
    setupInputHandlers() {
        // Listen for 'C' key to open crafting menu
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                if (kbInfo.event.key === 'c' || kbInfo.event.key === 'C') {
                    this.toggleCraftingUI();
                }
            }
        });
    }

    /**
     * Toggle crafting UI
     */
    toggleCraftingUI() {
        if (this.craftingUI) {
            this.craftingUI.toggle();
        }
    }

    /**
     * Open crafting UI
     */
    openCraftingUI() {
        if (this.craftingUI) {
            this.craftingUI.show();
        }
    }

    /**
     * Close crafting UI
     */
    closeCraftingUI() {
        if (this.craftingUI) {
            this.craftingUI.hide();
        }
    }

    /**
     * Check proximity to workstations
     * Call this in game update loop
     */
    updateWorkstationProximity(playerPosition) {
        // This would check distance to nearby workstations in the game world
        // For now, we'll assume all workstations are accessible
        // In a real implementation, you'd check distance to actual workstation objects
        
        // Example:
        // const workstations = this.scene.getMeshesByTags('workstation');
        // for (const ws of workstations) {
        //     const distance = BABYLON.Vector3.Distance(playerPosition, ws.position);
        //     this.workstationProximity.set(ws.metadata.workstationType, distance);
        // }
    }

    /**
     * Check if player is near a workstation
     */
    isNearWorkstation(workstationType, maxDistance = 5) {
        const distance = this.workstationProximity.get(workstationType);
        return distance !== undefined && distance <= maxDistance;
    }

    /**
     * Craft an item (with additional game logic)
     */
    async craftItem(recipeId) {
        const recipe = this.craftingManager.recipes.get(recipeId);
        if (!recipe) {
            console.warn(`Recipe not found: ${recipeId}`);
            return { success: false, reason: 'Recipe not found' };
        }

        // Check workstation proximity (if needed)
        // if (!this.isNearWorkstation(recipe.workstation)) {
        //     return { success: false, reason: `Must be near ${recipe.workstation}` };
        // }

        // Craft the item
        const result = await this.craftingManager.craft(recipeId, this.inventory);

        if (result.success) {
            // Play crafting sound/animation
            this.playCraftingEffect(recipe);
            
            // Update UI
            if (this.craftingUI && this.craftingUI.isVisible) {
                this.craftingUI.selectProfession(this.craftingUI.currentProfession);
            }
        }

        return result;
    }

    /**
     * Play crafting effect (sound, particles, etc.)
     */
    playCraftingEffect(recipe) {
        // Play crafting sound
        // this.gameManager.audioManager.playSound('craft');
        
        // Show crafting particles
        // this.showCraftingParticles(recipe);
        
        console.log(`✨ Crafting effect for: ${recipe.name}`);
    }

    /**
     * Add crafting experience (called from game events)
     */
    addCraftingExperience(professionName, amount) {
        this.craftingManager.grantExperience(professionName, amount);
    }

    /**
     * Get player profession level
     */
    getProfessionLevel(professionName) {
        const playerProf = this.craftingManager.getPlayerProfession(professionName);
        return playerProf ? playerProf.level : 0;
    }

    /**
     * Save crafting progress
     */
    saveProgress() {
        const saveData = {
            professions: {}
        };

        for (const [profName, profData] of this.craftingManager.playerProfessions) {
            saveData.professions[profName] = {
                level: profData.level,
                experience: profData.experience,
                unlockedRecipes: profData.unlockedRecipes,
                unlockedPerks: profData.unlockedPerks,
                chosenUltimate: profData.chosenUltimate
            };
        }

        return saveData;
    }

    /**
     * Load crafting progress
     */
    loadProgress(saveData) {
        if (!saveData || !saveData.professions) return;

        for (const [profName, profData] of Object.entries(saveData.professions)) {
            const playerProf = this.craftingManager.playerProfessions.get(profName);
            if (playerProf) {
                playerProf.level = profData.level || 1;
                playerProf.experience = profData.experience || 0;
                playerProf.unlockedRecipes = profData.unlockedRecipes || [];
                playerProf.unlockedPerks = profData.unlockedPerks || [];
                playerProf.chosenUltimate = profData.chosenUltimate || null;
            }
        }

        console.log('✅ Crafting progress loaded');
    }

    /**
     * Dispose crafting integration
     */
    dispose() {
        if (this.craftingUI) {
            this.craftingUI.hide();
        }
        console.log('🗑️ Crafting Integration disposed');
    }
}

