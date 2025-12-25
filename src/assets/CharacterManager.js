/**
 * Character Manager
 * Manages player character classes, models, and customization
 * Integrates with Asset Library and Admin Panel
 */

import { getAssetLibrary } from './AssetLibrary.js';

export class CharacterManager {
    constructor(scene) {
        this.scene = scene;
        this.assetLibrary = getAssetLibrary();
        this.characterClasses = new Map();
        this.loadedCharacters = new Map();
        
        this.loadDefaultClasses();
    }

    /**
     * Load default character classes
     */
    loadDefaultClasses() {
        // Default Warrior class
        this.registerClass('warrior', {
            name: 'Warrior',
            description: 'A strong melee fighter with high health and defense',
            modelPath: 'characters/human_basemesh/HumanBaseMesh_WithEquips.glb',
            stats: {
                health: 150,
                maxHealth: 150,
                mana: 50,
                maxMana: 50,
                stamina: 120,
                maxStamina: 120,
                strength: 20,
                agility: 10,
                intellect: 5,
                defense: 15
            },
            abilities: [
                { name: 'Heroic Strike', damage: 50, manaCost: 15, cooldown: 5, type: 'melee' },
                { name: 'Shield Bash', damage: 30, manaCost: 10, cooldown: 8, type: 'melee', stun: 2 },
                { name: 'Charge', damage: 40, manaCost: 20, cooldown: 12, type: 'dash' },
                { name: 'Battle Cry', damage: 0, manaCost: 25, cooldown: 30, type: 'buff', effect: 'attackUp' }
            ],
            animations: {
                idle: 'Idle',
                walk: 'Walk',
                run: 'Run',
                attack1: 'Attack1',
                attack2: 'Attack2',
                death: 'Death',
                jump: 'Jump'
            },
            scale: 3.7,
            icon: './assets/ui/class-icons/warrior.png'
        });

        // Default Mage class
        this.registerClass('mage', {
            name: 'Mage',
            description: 'A powerful spellcaster with devastating ranged attacks',
            modelPath: 'characters/human_basemesh/HumanBaseMesh_WithEquips.glb',
            stats: {
                health: 80,
                maxHealth: 80,
                mana: 150,
                maxMana: 150,
                stamina: 60,
                maxStamina: 60,
                strength: 5,
                agility: 8,
                intellect: 25,
                defense: 5
            },
            abilities: [
                { name: 'Fireball', damage: 60, manaCost: 20, cooldown: 3, type: 'ranged', castTime: 1.5 },
                { name: 'Ice Lance', damage: 40, manaCost: 15, cooldown: 2, type: 'ranged', slow: 0.5 },
                { name: 'Blink', damage: 0, manaCost: 30, cooldown: 15, type: 'teleport' },
                { name: 'Arcane Explosion', damage: 80, manaCost: 50, cooldown: 20, type: 'aoe', radius: 8 }
            ],
            animations: {
                idle: 'Idle',
                walk: 'Walk',
                run: 'Run',
                cast: 'Cast',
                death: 'Death'
            },
            scale: 3.7,
            icon: './assets/ui/class-icons/mage.png'
        });

        // Default Rogue class
        this.registerClass('rogue', {
            name: 'Rogue',
            description: 'A swift assassin with high damage and mobility',
            modelPath: 'characters/human_basemesh/HumanBaseMesh_WithEquips.glb',
            stats: {
                health: 100,
                maxHealth: 100,
                mana: 80,
                maxMana: 80,
                stamina: 100,
                maxStamina: 100,
                strength: 12,
                agility: 25,
                intellect: 8,
                defense: 8
            },
            abilities: [
                { name: 'Backstab', damage: 80, manaCost: 20, cooldown: 6, type: 'melee', requiresBehind: true },
                { name: 'Stealth', damage: 0, manaCost: 30, cooldown: 20, type: 'buff', effect: 'invisible' },
                { name: 'Fan of Knives', damage: 35, manaCost: 25, cooldown: 8, type: 'aoe', radius: 5 },
                { name: 'Shadow Step', damage: 0, manaCost: 15, cooldown: 10, type: 'teleport' }
            ],
            animations: {
                idle: 'Idle',
                walk: 'Walk',
                run: 'Run',
                attack1: 'Attack1',
                death: 'Death',
                stealth: 'Stealth'
            },
            scale: 3.7,
            icon: './assets/ui/class-icons/rogue.png'
        });
    }

    /**
     * Register a new character class
     */
    registerClass(id, config) {
        const charClass = {
            id,
            ...config,
            dateAdded: new Date().toISOString()
        };
        
        this.characterClasses.set(id, charClass);
        
        // Register in asset library
        this.assetLibrary.register('characters', id, {
            name: config.name,
            path: config.modelPath,
            type: 'character',
            config: charClass
        });
        
        console.log(`⚔️ Registered character class: ${config.name}`);
        return charClass;
    }

    /**
     * Import character from GLB file
     */
    async importCharacter(scene, file, config = {}) {
        const result = await this.assetLibrary.importFromFile(scene, file, 'characters');

        if (result) {
            const charConfig = {
                name: config.name || result.id,
                description: config.description || `Imported character: ${result.id}`,
                modelPath: `imported/${file.name}`,
                stats: config.stats || {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100,
                    stamina: 100,
                    maxStamina: 100,
                    strength: 10,
                    agility: 10,
                    intellect: 10,
                    defense: 10
                },
                abilities: config.abilities || [],
                animations: this.detectAnimations(result.animationGroups),
                scale: config.scale || 1.0,
                icon: config.icon || null,
                importedMesh: result.mesh
            };

            this.registerClass(result.id, charConfig);

            return {
                id: result.id,
                config: charConfig,
                mesh: result.mesh,
                skeleton: result.skeleton,
                animationGroups: result.animationGroups
            };
        }

        return null;
    }

    /**
     * Auto-detect animations from animation groups
     */
    detectAnimations(animationGroups) {
        const animations = {};

        for (const group of animationGroups) {
            const name = group.name.toLowerCase();
            if (name.includes('idle')) animations.idle = group.name;
            else if (name.includes('walk')) animations.walk = group.name;
            else if (name.includes('run')) animations.run = group.name;
            else if (name.includes('attack')) animations.attack1 = group.name;
            else if (name.includes('death') || name.includes('die')) animations.death = group.name;
            else if (name.includes('jump')) animations.jump = group.name;
            else if (name.includes('cast')) animations.cast = group.name;
        }

        return animations;
    }

    /**
     * Get all character classes
     */
    getClasses() {
        return Array.from(this.characterClasses.values());
    }

    /**
     * Get character class by ID
     */
    getClass(id) {
        return this.characterClasses.get(id);
    }

    /**
     * Update character class
     */
    updateClass(id, updates) {
        const charClass = this.characterClasses.get(id);
        if (charClass) {
            Object.assign(charClass, updates);
            this.assetLibrary.update('characters', id, { config: charClass });
            return true;
        }
        return false;
    }

    /**
     * Remove character class
     */
    removeClass(id) {
        this.characterClasses.delete(id);
        this.assetLibrary.remove('characters', id);
    }

    /**
     * Create character instance
     */
    async createCharacter(classId, options = {}) {
        const charClass = this.characterClasses.get(classId);
        if (!charClass) {
            console.error(`Character class not found: ${classId}`);
            return null;
        }

        let mesh;

        if (charClass.importedMesh) {
            mesh = charClass.importedMesh.clone(`${classId}_${Date.now()}`);
            mesh.setEnabled(true);
        } else {
            const loaded = await this.assetLibrary.loadModel(this.scene, 'characters', classId);
            if (!loaded) return null;
            mesh = loaded.mesh;
        }

        mesh.scaling = new BABYLON.Vector3(charClass.scale, charClass.scale, charClass.scale);

        const character = {
            id: `${classId}_${Date.now()}`,
            classId,
            mesh,
            stats: { ...charClass.stats },
            abilities: [...charClass.abilities],
            animations: charClass.animations,
            level: options.level || 1,
            experience: options.experience || 0
        };

        mesh.metadata = {
            isPlayer: true,
            character
        };

        return character;
    }

    /**
     * Export all class configs
     */
    exportConfigs() {
        const configs = {};
        for (const [id, charClass] of this.characterClasses) {
            configs[id] = charClass;
        }
        return JSON.stringify(configs, null, 2);
    }

    /**
     * Import class configs from JSON
     */
    importConfigs(json) {
        try {
            const configs = JSON.parse(json);
            for (const [id, config] of Object.entries(configs)) {
                this.registerClass(id, config);
            }
            return true;
        } catch (e) {
            console.error('Failed to import character configs:', e);
            return false;
        }
    }
}

// Singleton
let characterManagerInstance = null;

export function getCharacterManager(scene) {
    if (!characterManagerInstance && scene) {
        characterManagerInstance = new CharacterManager(scene);
    }
    return characterManagerInstance;
}

export default CharacterManager;

