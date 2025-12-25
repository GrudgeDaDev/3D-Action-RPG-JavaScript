/**
 * ProfessionSystem.js
 * Manages profession levels, experience, and skill progression
 * Based on TheForge profession system (Level 1-100)
 */

export class ProfessionSystem {
    constructor() {
        this.professions = new Map();
        this.playerProfessions = new Map();
        this.maxLevel = 100;
        this.baseExperiencePerLevel = 100;
        this.experienceScaling = 1.15; // Exponential scaling
    }

    /**
     * Initialize profession system
     */
    initialize() {
        this.setupProfessions();
        console.log('✅ ProfessionSystem initialized');
    }

    /**
     * Setup all available professions
     */
    setupProfessions() {
        const professionData = [
            // Harvesting Professions
            { id: 'mining', name: 'Mining', category: 'harvesting', icon: '⛏️', description: 'Extract ores and minerals' },
            { id: 'logging', name: 'Logging', category: 'harvesting', icon: '🪓', description: 'Chop trees for wood' },
            { id: 'fishing', name: 'Fishing', category: 'harvesting', icon: '🎣', description: 'Catch fish and aquatic resources' },
            
            // Crafting Professions
            { id: 'crafting', name: 'Crafting', category: 'crafting', icon: '🔨', description: 'Create general items at workbench' },
            { id: 'smelting', name: 'Smelting', category: 'crafting', icon: '🔥', description: 'Smelt ores into bars' },
            { id: 'tailoring', name: 'Tailoring', category: 'crafting', icon: '🧵', description: 'Craft cloth armor and items' },
            { id: 'woodworking', name: 'Woodworking', category: 'crafting', icon: '🪚', description: 'Craft wooden items and furniture' },
            { id: 'leatherworking', name: 'Leatherworking', category: 'crafting', icon: '🦌', description: 'Craft leather armor' },
            { id: 'cooking', name: 'Cooking', category: 'crafting', icon: '🍳', description: 'Prepare food and consumables' },
            { id: 'alchemy', name: 'Alchemy', category: 'crafting', icon: '⚗️', description: 'Brew potions and elixirs' },
            { id: 'weaponsmithing', name: 'Weaponsmithing', category: 'crafting', icon: '⚔️', description: 'Forge weapons and tools' },
            { id: 'pet_training', name: 'Pet Training', category: 'special', icon: '🐾', description: 'Train and enhance pets' }
        ];

        professionData.forEach(prof => {
            this.professions.set(prof.id, {
                id: prof.id,
                name: prof.name,
                category: prof.category,
                icon: prof.icon,
                description: prof.description,
                bonuses: this.calculateProfessionBonuses(prof.id)
            });

            // Initialize player profession data
            this.playerProfessions.set(prof.id, {
                level: 1,
                experience: 0,
                experienceToNext: this.calculateExperienceRequired(1)
            });
        });
    }

    /**
     * Calculate experience required for next level
     */
    calculateExperienceRequired(currentLevel) {
        if (currentLevel >= this.maxLevel) return 0;
        return Math.floor(this.baseExperiencePerLevel * Math.pow(this.experienceScaling, currentLevel - 1));
    }

    /**
     * Add experience to a profession
     */
    addExperience(professionId, amount) {
        const playerProf = this.playerProfessions.get(professionId);
        if (!playerProf) return null;

        if (playerProf.level >= this.maxLevel) {
            return { levelUp: false, level: this.maxLevel };
        }

        playerProf.experience += amount;
        
        const result = {
            levelUp: false,
            level: playerProf.level,
            experience: playerProf.experience,
            experienceGained: amount
        };

        // Check for level up
        while (playerProf.experience >= playerProf.experienceToNext && playerProf.level < this.maxLevel) {
            playerProf.experience -= playerProf.experienceToNext;
            playerProf.level++;
            playerProf.experienceToNext = this.calculateExperienceRequired(playerProf.level);
            result.levelUp = true;
            result.level = playerProf.level;
        }

        if (result.levelUp) {
            console.log(`🎉 ${professionId} leveled up to ${playerProf.level}!`);
            this.onLevelUp(professionId, playerProf.level);
        }

        return result;
    }

    /**
     * Get profession level
     */
    getLevel(professionId) {
        return this.playerProfessions.get(professionId)?.level || 1;
    }

    /**
     * Get profession data
     */
    getProfession(professionId) {
        return this.professions.get(professionId);
    }

    /**
     * Get player profession progress
     */
    getProgress(professionId) {
        return this.playerProfessions.get(professionId);
    }

    /**
     * Get all professions
     */
    getAllProfessions() {
        return Array.from(this.professions.values());
    }

    /**
     * Get professions by category
     */
    getProfessionsByCategory(category) {
        return Array.from(this.professions.values())
            .filter(prof => prof.category === category);
    }

    /**
     * Calculate profession bonuses based on level
     */
    calculateProfessionBonuses(professionId) {
        // Different bonuses for different professions
        const bonusTemplates = {
            mining: { gatherSpeed: 0.01, rareChance: 0.005, yield: 0.01 },
            logging: { gatherSpeed: 0.01, rareChance: 0.005, yield: 0.01 },
            fishing: { gatherSpeed: 0.01, rareChance: 0.005, yield: 0.01 },
            crafting: { successRate: 0.005, criticalCraft: 0.003, costReduction: 0.005 },
            smelting: { successRate: 0.005, criticalCraft: 0.003, costReduction: 0.005 },
            tailoring: { successRate: 0.005, criticalCraft: 0.003, costReduction: 0.005 },
            woodworking: { successRate: 0.005, criticalCraft: 0.003, costReduction: 0.005 },
            leatherworking: { successRate: 0.005, criticalCraft: 0.003, costReduction: 0.005 },
            cooking: { successRate: 0.005, criticalCraft: 0.003, duration: 0.01 },
            alchemy: { successRate: 0.005, criticalCraft: 0.003, potency: 0.01 },
            weaponsmithing: { successRate: 0.005, criticalCraft: 0.003, quality: 0.005 },
            pet_training: { successRate: 0.005, bondSpeed: 0.01, statBonus: 0.005 }
        };

        return bonusTemplates[professionId] || {};
    }

    /**
     * Get current bonuses for a profession
     */
    getCurrentBonuses(professionId) {
        const profession = this.professions.get(professionId);
        const playerProf = this.playerProfessions.get(professionId);
        
        if (!profession || !playerProf) return {};

        const bonuses = {};
        const level = playerProf.level;

        for (const [bonusType, bonusPerLevel] of Object.entries(profession.bonuses)) {
            bonuses[bonusType] = bonusPerLevel * level;
        }

        return bonuses;
    }

    /**
     * Handle level up event
     */
    onLevelUp(professionId, newLevel) {
        // Emit event or trigger UI notification
        // Can be extended with rewards, unlocks, etc.
    }

    /**
     * Save profession data
     */
    saveData() {
        const data = {};
        this.playerProfessions.forEach((value, key) => {
            data[key] = value;
        });
        localStorage.setItem('professionData', JSON.stringify(data));
    }

    /**
     * Load profession data
     */
    loadData() {
        const saved = localStorage.getItem('professionData');
        if (saved) {
            const data = JSON.parse(saved);
            for (const [profId, profData] of Object.entries(data)) {
                if (this.playerProfessions.has(profId)) {
                    this.playerProfessions.set(profId, profData);
                }
            }
        }
    }
}

