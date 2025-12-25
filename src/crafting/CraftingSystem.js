/**
 * CraftingSystem.js
 * Handles crafting recipes, workstations, and item creation
 * TheForge integration for 3D Action RPG
 */

import { getItemDatabase } from './ItemDatabase.js';

export class CraftingSystem {
    constructor(scene) {
        this.scene = scene;
        this.itemDatabase = getItemDatabase();
        this.recipes = new Map();
        this.workstations = new Map();
        this.activeWorkstation = null;
        this.craftingQueue = [];
    }

    /**
     * Initialize crafting system
     */
    async initialize() {
        await this.itemDatabase.initialize();
        await this.loadRecipes();
        this.setupWorkstations();
        console.log('✅ CraftingSystem initialized');
    }

    /**
     * Load recipes from data
     */
    async loadRecipes() {
        try {
            const response = await fetch('/examples/crafting_data.json');
            const data = await response.json();
            
            if (data.workstations) {
                for (const [workstationName, workstationData] of Object.entries(data.workstations)) {
                    if (workstationData.craftables) {
                        workstationData.craftables.forEach(craftable => {
                            if (craftable.recipe) {
                                this.registerRecipe({
                                    id: this.generateRecipeId(craftable.name),
                                    name: craftable.name,
                                    workstation: workstationName,
                                    result: {
                                        itemId: this.itemDatabase.generateItemId(craftable.name),
                                        quantity: 1
                                    },
                                    ingredients: craftable.recipe,
                                    level: craftable.level || 1,
                                    experience: craftable.experience || 10
                                });
                            }
                        });
                    }
                }
            }
            
            console.log(`✅ Loaded ${this.recipes.size} recipes`);
        } catch (error) {
            console.error('❌ Failed to load recipes:', error);
        }
    }

    /**
     * Register a crafting recipe
     */
    registerRecipe(recipeData) {
        const recipe = {
            id: recipeData.id,
            name: recipeData.name,
            workstation: recipeData.workstation,
            result: recipeData.result,
            ingredients: recipeData.ingredients || [],
            level: recipeData.level || 1,
            experience: recipeData.experience || 10,
            craftTime: recipeData.craftTime || 2000, // milliseconds
            successRate: recipeData.successRate || 1.0
        };

        this.recipes.set(recipe.id, recipe);
        return recipe;
    }

    /**
     * Setup workstation definitions
     */
    setupWorkstations() {
        const workstationTypes = [
            { id: 'workbench', name: 'Workbench', emoji: '🔨', profession: 'crafting' },
            { id: 'furnace', name: 'Furnace', emoji: '🔥', profession: 'smelting' },
            { id: 'loom', name: 'Loom', emoji: '🧵', profession: 'tailoring' },
            { id: 'sawmill', name: 'Sawmill', emoji: '🪚', profession: 'woodworking' },
            { id: 'tannery', name: 'Tannery', emoji: '🦌', profession: 'leatherworking' },
            { id: 'campfire', name: 'Campfire', emoji: '🔥', profession: 'cooking' },
            { id: 'study', name: 'Study', emoji: '📚', profession: 'alchemy' },
            { id: 'arsenal', name: 'Arsenal', emoji: '⚔️', profession: 'weaponsmithing' },
            { id: 'pet_station', name: 'Pet Station', emoji: '🐾', profession: 'pet_training' }
        ];

        workstationTypes.forEach(ws => {
            this.workstations.set(ws.id, {
                id: ws.id,
                name: ws.name,
                emoji: ws.emoji,
                profession: ws.profession,
                recipes: this.getRecipesByWorkstation(ws.name),
                isActive: false,
                position: null,
                mesh: null
            });
        });
    }

    /**
     * Get recipes for a specific workstation
     */
    getRecipesByWorkstation(workstationName) {
        return Array.from(this.recipes.values())
            .filter(recipe => recipe.workstation === workstationName)
            .map(recipe => recipe.id);
    }

    /**
     * Attempt to craft an item
     */
    async craftItem(recipeId, inventory, professionSystem) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) {
            return { success: false, error: 'Recipe not found' };
        }

        // Check workstation
        if (!this.activeWorkstation || this.activeWorkstation.id !== recipe.workstation.toLowerCase()) {
            return { success: false, error: 'Wrong workstation or no workstation active' };
        }

        // Check level requirement
        const profession = this.workstations.get(recipe.workstation.toLowerCase())?.profession;
        if (profession && professionSystem) {
            const playerLevel = professionSystem.getLevel(profession);
            if (playerLevel < recipe.level) {
                return { success: false, error: `Requires ${profession} level ${recipe.level}` };
            }
        }

        // Check ingredients
        const hasIngredients = this.checkIngredients(recipe, inventory);
        if (!hasIngredients.success) {
            return { success: false, error: 'Missing ingredients', missing: hasIngredients.missing };
        }

        // Consume ingredients
        this.consumeIngredients(recipe, inventory);

        // Calculate success (with profession bonuses)
        const successRate = this.calculateSuccessRate(recipe, professionSystem, profession);
        const success = Math.random() < successRate;

        if (success) {
            // Add result to inventory
            const resultItem = this.itemDatabase.getItem(recipe.result.itemId);
            inventory.addItem(resultItem, recipe.result.quantity);

            // Award experience
            if (professionSystem && profession) {
                professionSystem.addExperience(profession, recipe.experience);
            }

            return { 
                success: true, 
                item: resultItem, 
                quantity: recipe.result.quantity,
                experience: recipe.experience
            };
        } else {
            return { success: false, error: 'Crafting failed' };
        }
    }

    /**
     * Check if player has required ingredients
     */
    checkIngredients(recipe, inventory) {
        // Implementation depends on inventory system
        // Placeholder for now
        return { success: true, missing: [] };
    }

    /**
     * Consume ingredients from inventory
     */
    consumeIngredients(recipe, inventory) {
        // Implementation depends on inventory system
    }

    /**
     * Calculate success rate with bonuses
     */
    calculateSuccessRate(recipe, professionSystem, profession) {
        let rate = recipe.successRate;
        
        if (professionSystem && profession) {
            const level = professionSystem.getLevel(profession);
            const bonus = Math.min(level * 0.005, 0.25); // Max 25% bonus
            rate = Math.min(rate + bonus, 1.0);
        }
        
        return rate;
    }

    /**
     * Generate recipe ID
     */
    generateRecipeId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_recipe';
    }

    /**
     * Set active workstation
     */
    setActiveWorkstation(workstationId) {
        this.activeWorkstation = this.workstations.get(workstationId);
        return this.activeWorkstation;
    }
}

