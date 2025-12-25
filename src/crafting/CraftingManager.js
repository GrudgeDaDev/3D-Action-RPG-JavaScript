/**
 * CraftingManager.js
 * Core crafting system manager for GRUDGE WARLORDS
 * Handles professions, recipes, workstations, and crafting progression
 */

import { ConfigManager } from '../config/ConfigManager.js';

export class CraftingManager {
    constructor() {
        this.config = ConfigManager.getInstance();
        this.professions = new Map();
        this.recipes = new Map();
        this.workstations = new Map();
        this.playerProfessions = new Map(); // profession name -> { level, experience, unlockedRecipes, unlockedPerks }
        this.iconMapping = new Map(); // item name -> icon path
        this.initialized = false;
    }

    /**
     * Initialize crafting system
     */
    async initialize() {
        if (this.initialized) return;

        console.log('🔨 Initializing Crafting System...');

        // Load crafting configuration
        const craftingConfig = this.config.get('crafting', {});
        
        // Load professions
        this.loadProfessions(craftingConfig.professions || {});
        
        // Load recipes
        this.loadRecipes(craftingConfig.recipes || {});
        
        // Load workstations
        this.loadWorkstations(craftingConfig.workstations || {});
        
        // Load icon mappings
        this.loadIconMappings(craftingConfig.iconMappings || {});
        
        // Initialize player professions (default level 1)
        this.initializePlayerProfessions();

        this.initialized = true;
        console.log('✅ Crafting System initialized');
        console.log(`   Professions: ${this.professions.size}`);
        console.log(`   Recipes: ${this.recipes.size}`);
        console.log(`   Workstations: ${this.workstations.size}`);
    }

    /**
     * Load professions from config
     */
    loadProfessions(professionsData) {
        for (const [profName, profData] of Object.entries(professionsData)) {
            this.professions.set(profName, {
                name: profName,
                displayName: profData.displayName || profName,
                description: profData.description || '',
                icon: profData.icon || '🔨',
                maxLevel: profData.maxLevel || 100,
                perks: profData.perks || [],
                workstations: profData.workstations || []
            });
        }
    }

    /**
     * Load recipes from config
     */
    loadRecipes(recipesData) {
        for (const [recipeId, recipeData] of Object.entries(recipesData)) {
            this.recipes.set(recipeId, {
                id: recipeId,
                name: recipeData.name,
                profession: recipeData.profession,
                workstation: recipeData.workstation,
                unlockLevel: recipeData.unlockLevel || 1,
                materials: recipeData.materials || [],
                result: recipeData.result,
                craftTime: recipeData.craftTime || 1000,
                experience: recipeData.experience || 10,
                icon: recipeData.icon || null
            });
        }
    }

    /**
     * Load workstations from config
     */
    loadWorkstations(workstationsData) {
        for (const [stationName, stationData] of Object.entries(workstationsData)) {
            this.workstations.set(stationName, {
                name: stationName,
                displayName: stationData.displayName || stationName,
                type: stationData.type || 'general',
                emoji: stationData.emoji || '🔨',
                description: stationData.description || ''
            });
        }
    }

    /**
     * Load icon mappings
     */
    loadIconMappings(iconMappingsData) {
        for (const [itemName, iconPath] of Object.entries(iconMappingsData)) {
            this.iconMapping.set(itemName, iconPath);
        }
    }

    /**
     * Initialize player professions
     */
    initializePlayerProfessions() {
        for (const [profName] of this.professions) {
            this.playerProfessions.set(profName, {
                level: 1,
                experience: 0,
                unlockedRecipes: [],
                unlockedPerks: [],
                chosenUltimate: null
            });
        }
    }

    /**
     * Get profession data
     */
    getProfession(professionName) {
        return this.professions.get(professionName);
    }

    /**
     * Get player profession progress
     */
    getPlayerProfession(professionName) {
        return this.playerProfessions.get(professionName);
    }

    /**
     * Get all available recipes for a profession
     */
    getRecipesForProfession(professionName, playerLevel = null) {
        const recipes = [];
        for (const [recipeId, recipe] of this.recipes) {
            if (recipe.profession === professionName) {
                if (playerLevel === null || recipe.unlockLevel <= playerLevel) {
                    recipes.push(recipe);
                }
            }
        }
        return recipes.sort((a, b) => a.unlockLevel - b.unlockLevel);
    }

    /**
     * Check if player can craft a recipe
     */
    canCraft(recipeId, inventory) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return { canCraft: false, reason: 'Recipe not found' };

        const playerProf = this.playerProfessions.get(recipe.profession);
        if (!playerProf) return { canCraft: false, reason: 'Profession not learned' };

        if (playerProf.level < recipe.unlockLevel) {
            return { canCraft: false, reason: `Requires level ${recipe.unlockLevel}` };
        }

        // Check materials (if inventory system is provided)
        if (inventory) {
            for (const material of recipe.materials) {
                if (!inventory.hasItem(material.name, material.quantity)) {
                    return { canCraft: false, reason: `Missing ${material.name} x${material.quantity}` };
                }
            }
        }

        return { canCraft: true };
    }

    /**
     * Craft an item
     */
    async craft(recipeId, inventory) {
        const canCraftResult = this.canCraft(recipeId, inventory);
        if (!canCraftResult.canCraft) {
            console.warn(`Cannot craft: ${canCraftResult.reason}`);
            return { success: false, reason: canCraftResult.reason };
        }

        const recipe = this.recipes.get(recipeId);
        
        // Remove materials from inventory
        if (inventory) {
            for (const material of recipe.materials) {
                inventory.removeItem(material.name, material.quantity);
            }
        }

        // Add result to inventory
        if (inventory && recipe.result) {
            inventory.addItem(recipe.result.name, recipe.result.quantity || 1);
        }

        // Grant experience
        this.grantExperience(recipe.profession, recipe.experience);

        console.log(`✅ Crafted: ${recipe.name}`);
        return { success: true, result: recipe.result };
    }

    /**
     * Grant experience to a profession
     */
    grantExperience(professionName, amount) {
        const playerProf = this.playerProfessions.get(professionName);
        if (!playerProf) return;

        playerProf.experience += amount;

        // Check for level up
        const expNeeded = this.getExperienceForLevel(playerProf.level + 1);
        if (playerProf.experience >= expNeeded) {
            playerProf.level++;
            playerProf.experience -= expNeeded;
            console.log(`🎉 ${professionName} leveled up to ${playerProf.level}!`);
            
            // Unlock new recipes
            this.unlockRecipesForLevel(professionName, playerProf.level);
        }
    }

    /**
     * Calculate experience needed for a level
     */
    getExperienceForLevel(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    /**
     * Unlock recipes for a level
     */
    unlockRecipesForLevel(professionName, level) {
        const playerProf = this.playerProfessions.get(professionName);
        if (!playerProf) return;

        for (const [recipeId, recipe] of this.recipes) {
            if (recipe.profession === professionName && recipe.unlockLevel === level) {
                if (!playerProf.unlockedRecipes.includes(recipeId)) {
                    playerProf.unlockedRecipes.push(recipeId);
                    console.log(`🔓 Unlocked recipe: ${recipe.name}`);
                }
            }
        }
    }

    /**
     * Get icon path for an item
     */
    getIconPath(itemName) {
        return this.iconMapping.get(itemName) || 'examples/TheForge-main/TheForge-main/icons/default.png';
    }
}

// Singleton instance
let craftingManagerInstance = null;

export function getCraftingManager() {
    if (!craftingManagerInstance) {
        craftingManagerInstance = new CraftingManager();
    }
    return craftingManagerInstance;
}

