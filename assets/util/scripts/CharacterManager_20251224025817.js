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

