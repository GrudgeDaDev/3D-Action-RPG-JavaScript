/**
 * Enemy Manager
 * Manages enemy definitions, models, and spawning
 * Integrates with Asset Library and Admin Panel
 */

import { getAssetLibrary } from './AssetLibrary.js';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.assetLibrary = getAssetLibrary();
        this.enemyTemplates = new Map();
        this.activeEnemies = [];
        
        this.loadDefaultEnemies();
    }

    /**
     * Load default enemy definitions
     */
    loadDefaultEnemies() {
        // Register default slime enemy
        this.registerEnemy('slime', {
            name: 'Slime',
            modelPath: 'characters/enemy/slime/Slime1.glb',
            stats: {
                health: 50,
                maxHealth: 50,
                damage: 10,
                defense: 5,
                speed: 2,
                level: 1,
                xpReward: 25
            },
            ai: {
                aggroRange: 15,
                attackRange: 3,
                fleeHealthPercent: 0,
                behavior: 'aggressive'
            },
            animations: {
                idle: 'Idle',
                walk: 'Walk',
                attack: 'Attack',
                death: 'Death',
                hit: 'Hit'
            },
            loot: {
                gold: { min: 5, max: 15 },
                items: ['slime_goo', 'slime_core'],
                dropChance: 0.3
            },
            scale: 1.0,
            heightOffset: 0
        });
    }

    /**
     * Register a new enemy type
     */
    registerEnemy(id, config) {
        const enemy = {
            id,
            ...config,
            dateAdded: new Date().toISOString()
        };
        
        this.enemyTemplates.set(id, enemy);
        
        // Also register in asset library
        this.assetLibrary.register('enemies', id, {
            name: config.name,
            path: config.modelPath,
            type: 'enemy',
            config: enemy
        });
        
        console.log(`👹 Registered enemy: ${config.name}`);
        return enemy;
    }

    /**
     * Import enemy from GLB file
     */
    async importEnemy(scene, file, config = {}) {
        const result = await this.assetLibrary.importFromFile(scene, file, 'enemies');
        
        if (result) {
            const enemyConfig = {
                name: config.name || result.id,
                modelPath: `imported/${file.name}`,
                stats: config.stats || {
                    health: 100,
                    maxHealth: 100,
                    damage: 15,
                    defense: 10,
                    speed: 3,
                    level: 1,
                    xpReward: 50
                },
                ai: config.ai || {
                    aggroRange: 15,
                    attackRange: 3,
                    fleeHealthPercent: 0,
                    behavior: 'aggressive'
                },
                animations: this.detectAnimations(result.animationGroups),
                loot: config.loot || {
                    gold: { min: 10, max: 30 },
                    items: [],
                    dropChance: 0.5
                },
                scale: config.scale || 1.0,
                heightOffset: config.heightOffset || 0,
                importedMesh: result.mesh
            };
            
            this.registerEnemy(result.id, enemyConfig);
            
            return {
                id: result.id,
                config: enemyConfig,
                mesh: result.mesh,
                animationGroups: result.animationGroups
            };
        }
        
        return null;
    }

    /**
     * Auto-detect animations from animation groups
     */
    detectAnimations(animationGroups) {
        const animations = {
            idle: null,
            walk: null,
            attack: null,
            death: null,
            hit: null
        };
        
        for (const group of animationGroups) {
            const name = group.name.toLowerCase();
            if (name.includes('idle')) animations.idle = group.name;
            else if (name.includes('walk') || name.includes('run')) animations.walk = group.name;
            else if (name.includes('attack') || name.includes('hit')) animations.attack = group.name;
            else if (name.includes('death') || name.includes('die')) animations.death = group.name;
            else if (name.includes('hurt') || name.includes('damage')) animations.hit = group.name;
        }
        
        return animations;
    }

    /**
     * Spawn an enemy at a position
     */
    async spawn(enemyId, position, options = {}) {
        const template = this.enemyTemplates.get(enemyId);
        if (!template) {
            console.error(`Enemy template not found: ${enemyId}`);
            return null;
        }

        let mesh;

        if (template.importedMesh) {
            mesh = template.importedMesh.clone(`${enemyId}_${Date.now()}`);
            mesh.setEnabled(true);
        } else {
            const loaded = await this.assetLibrary.loadModel(this.scene, 'enemies', enemyId);
            if (!loaded) return null;
            mesh = loaded.mesh;
        }

        // Position and scale
        mesh.position = position.clone();
        mesh.scaling = new BABYLON.Vector3(template.scale, template.scale, template.scale);
        mesh.position.y += template.heightOffset;

        // Create enemy instance
        const enemy = {
            id: `${enemyId}_${Date.now()}`,
            templateId: enemyId,
            mesh,
            stats: { ...template.stats },
            ai: { ...template.ai },
            animations: template.animations,
            isAlive: true,
            target: null
        };

        // Store metadata on mesh
        mesh.metadata = {
            isEnemy: true,
            enemy: enemy,
            templateId: enemyId
        };

        this.activeEnemies.push(enemy);

        console.log(`👹 Spawned ${template.name} at`, position);
        return enemy;
    }

    /**
     * Get all enemy templates
     */
    getTemplates() {
        return Array.from(this.enemyTemplates.values());
    }

    /**
     * Get enemy template by ID
     */
    getTemplate(id) {
        return this.enemyTemplates.get(id);
    }

    /**
     * Update enemy template
     */
    updateTemplate(id, updates) {
        const template = this.enemyTemplates.get(id);
        if (template) {
            Object.assign(template, updates);
            this.assetLibrary.update('enemies', id, { config: template });
            return true;
        }
        return false;
    }

    /**
     * Remove enemy template
     */
    removeTemplate(id) {
        this.enemyTemplates.delete(id);
        this.assetLibrary.remove('enemies', id);
    }

    /**
     * Export all enemy configs
     */
    exportConfigs() {
        const configs = {};
        for (const [id, template] of this.enemyTemplates) {
            configs[id] = template;
        }
        return JSON.stringify(configs, null, 2);
    }

    /**
     * Import enemy configs from JSON
     */
    importConfigs(json) {
        try {
            const configs = JSON.parse(json);
            for (const [id, config] of Object.entries(configs)) {
                this.registerEnemy(id, config);
            }
            return true;
        } catch (e) {
            console.error('Failed to import enemy configs:', e);
            return false;
        }
    }
}

// Singleton
let enemyManagerInstance = null;

export function getEnemyManager(scene) {
    if (!enemyManagerInstance && scene) {
        enemyManagerInstance = new EnemyManager(scene);
    }
    return enemyManagerInstance;
}

export default EnemyManager;

