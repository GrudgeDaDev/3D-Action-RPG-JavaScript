/**
 * Race Manager System
 * Manages character race selection and model loading
 * 
 * Features:
 * - 6 playable races (Human, Elf, Dwarf, Orc, Barbarian, Undead)
 * - Race-specific stat bonuses
 * - Worges (shapeshifter) variants
 * - Save/Load race selection
 */

export class RaceManager {
    constructor(scene) {
        this.scene = scene;
        this.races = null;
        this.currentRace = null;
        this.isWorgesForm = false;
        this.loadedModels = new Map(); // Cache loaded models
        
        console.log('🎭 RaceManager initialized');
    }

    /**
     * Load race configuration
     */
    async loadRaceConfig() {
        try {
            const response = await fetch('./config/races.json');
            const config = await response.json();
            this.races = config.races;
            this.defaultRace = config.defaultRace || 'human';
            this.raceOrder = config.raceOrder || Object.keys(this.races);
            
            console.log(`✅ Loaded ${Object.keys(this.races).length} races`);
            return true;
        } catch (error) {
            console.error('❌ Failed to load race config:', error);
            return false;
        }
    }

    /**
     * Get race data
     */
    getRace(raceId) {
        return this.races ? this.races[raceId] : null;
    }

    /**
     * Get all races
     */
    getAllRaces() {
        if (!this.races) return [];
        return this.raceOrder.map(id => this.races[id]);
    }

    /**
     * Set current race
     */
    setRace(raceId) {
        const race = this.getRace(raceId);
        if (!race) {
            console.error(`❌ Race not found: ${raceId}`);
            return false;
        }

        this.currentRace = race;
        console.log(`🎭 Selected race: ${race.name}`);
        return true;
    }

    /**
     * Get current race
     */
    getCurrentRace() {
        return this.currentRace || this.getRace(this.defaultRace);
    }

    /**
     * Load race model
     */
    async loadRaceModel(raceId, isWorges = false) {
        const race = this.getRace(raceId);
        if (!race) {
            console.error(`❌ Race not found: ${raceId}`);
            return null;
        }

        const modelPath = isWorges ? race.worgesModelPath : race.modelPath;
        const cacheKey = `${raceId}_${isWorges ? 'worges' : 'normal'}`;

        // Check cache
        if (this.loadedModels.has(cacheKey)) {
            console.log(`📦 Using cached model: ${cacheKey}`);
            const cached = this.loadedModels.get(cacheKey);
            return this.cloneModel(cached);
        }

        console.log(`📥 Loading race model: ${race.name} (${isWorges ? 'Worges' : 'Normal'})`);

        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                null,
                modelPath.substring(0, modelPath.lastIndexOf('/') + 1),
                modelPath.substring(modelPath.lastIndexOf('/') + 1),
                this.scene
            );

            const model = {
                meshes: result.meshes,
                skeletons: result.skeletons,
                animationGroups: result.animationGroups,
                rootMesh: result.meshes[0]
            };

            // Cache the model
            this.loadedModels.set(cacheKey, model);

            console.log(`✅ Loaded race model: ${race.name}`);
            return model;

        } catch (error) {
            console.error(`❌ Failed to load race model: ${race.name}`, error);
            return null;
        }
    }

    /**
     * Clone a cached model
     */
    cloneModel(cachedModel) {
        const clonedMeshes = cachedModel.meshes.map(mesh => mesh.clone());
        const clonedSkeletons = cachedModel.skeletons.map(skeleton => skeleton.clone());
        
        return {
            meshes: clonedMeshes,
            skeletons: clonedSkeletons,
            animationGroups: cachedModel.animationGroups, // Animation groups can be shared
            rootMesh: clonedMeshes[0]
        };
    }

    /**
     * Apply race bonuses to character stats
     */
    applyRaceBonuses(character, raceId) {
        const race = this.getRace(raceId);
        if (!race || !race.bonuses) return character;

        console.log(`🎯 Applying ${race.name} bonuses...`);

        // Apply stat bonuses
        if (race.bonuses.health) {
            character.maxHealth = (character.maxHealth || 100) + race.bonuses.health;
            character.health = character.maxHealth;
        }
        if (race.bonuses.mana) {
            character.maxMana = (character.maxMana || 100) + race.bonuses.mana;
            character.mana = character.maxMana;
        }
        if (race.bonuses.stamina) {
            character.maxStamina = (character.maxStamina || 100) + race.bonuses.stamina;
            character.stamina = character.maxStamina;
        }

        // Apply attribute bonuses
        character.strength = (character.strength || 10) + (race.bonuses.strength || 0);
        character.agility = (character.agility || 10) + (race.bonuses.agility || 0);
        character.intelligence = (character.intelligence || 10) + (race.bonuses.intelligence || 0);

        // Apply special abilities
        if (race.specialAbilities) {
            character.specialAbilities = [...(character.specialAbilities || []), ...race.specialAbilities];
        }

        console.log(`✅ Applied ${race.name} bonuses`);
        return character;
    }

    /**
     * Transform to Worges form (for Worg class)
     */
    async transformToWorges(character, raceId) {
        if (this.isWorgesForm) {
            console.log('⚠️ Already in Worges form');
            return false;
        }

        const model = await this.loadRaceModel(raceId, true);
        if (!model) return false;

        // TODO: Replace character model with Worges variant
        this.isWorgesForm = true;
        console.log(`🐺 Transformed to Worges form`);
        return true;
    }

    /**
     * Transform back to normal form
     */
    async transformToNormal(character, raceId) {
        if (!this.isWorgesForm) {
            console.log('⚠️ Already in normal form');
            return false;
        }

        const model = await this.loadRaceModel(raceId, false);
        if (!model) return false;

        // TODO: Replace character model with normal variant
        this.isWorgesForm = false;
        console.log(`👤 Transformed to normal form`);
        return true;
    }

    /**
     * Get race info for UI
     */
    getRaceInfo(raceId) {
        const race = this.getRace(raceId);
        if (!race) return null;

        return {
            id: race.id,
            name: race.name,
            icon: race.icon,
            description: race.description,
            lore: race.lore,
            bonuses: race.bonuses,
            specialAbilities: race.specialAbilities || [],
            hasWorgesForm: !!race.worgesModelPath
        };
    }

    /**
     * Save race selection
     */
    save() {
        const data = {
            currentRace: this.currentRace ? this.currentRace.id : this.defaultRace,
            isWorgesForm: this.isWorgesForm
        };
        localStorage.setItem('selectedRace', JSON.stringify(data));
        console.log('💾 Saved race selection');
        return data;
    }

    /**
     * Load race selection
     */
    load() {
        const saved = localStorage.getItem('selectedRace');
        if (!saved) {
            console.log('⚠️ No saved race found, using default');
            this.setRace(this.defaultRace);
            return false;
        }

        try {
            const data = JSON.parse(saved);
            this.setRace(data.currentRace);
            this.isWorgesForm = data.isWorgesForm || false;
            console.log('📥 Loaded race selection');
            return true;
        } catch (error) {
            console.error('❌ Failed to load race selection:', error);
            this.setRace(this.defaultRace);
            return false;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.loadedModels.clear();
        console.log('🗑️ Cleared race model cache');
    }
}

// Export singleton creator
export function createRaceManager(scene) {
    return new RaceManager(scene);
}

