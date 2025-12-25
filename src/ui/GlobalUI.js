/**
 * Global UI Manager - Initializes MMO-style UI across all scenes
 * Provides action bars, player frame, target frame, minimap integration
 */

import { WoWUI } from './wowUI.js';

export class GlobalUI {
    static instance = null;
    
    constructor() {
        this.wowUI = null;
        this.currentScene = null;
        this.playerCharacter = null;
    }
    
    static getInstance() {
        if (!GlobalUI.instance) {
            GlobalUI.instance = new GlobalUI();
        }
        return GlobalUI.instance;
    }
    
    /**
     * Initialize UI for a scene - call this after scene setup
     * @param {BABYLON.Scene} scene - The scene to attach UI to
     * @param {object} character - Player character with health property
     * @param {object} options - Optional settings
     */
    initForScene(scene, character, options = {}) {
        // Dispose previous UI if switching scenes
        if (this.wowUI && this.currentScene !== scene) {
            this.wowUI.destroy();
            this.wowUI = null;
        }
        
        this.currentScene = scene;
        this.playerCharacter = character;
        
        // Create WoW-style UI
        console.log('🎮 Creating Global MMO UI...');
        this.wowUI = new WoWUI(scene);
        window.WOW_UI = this.wowUI;
        
        // Set initial player stats
        const playerName = options.playerName || 'Hero';
        const playerLevel = options.playerLevel || 1;
        
        this.wowUI.updatePlayer({
            health: character.health?.health || 100,
            maxHealth: character.health?.maxHealth || 100,
            mana: options.mana || 100,
            maxMana: options.maxMana || 100,
            stamina: options.stamina || 100,
            maxStamina: options.maxStamina || 100,
            level: playerLevel,
            name: playerName
        });
        
        // Hook into health system for automatic updates
        this.hookHealthUpdates(character);
        
        // Setup target selection
        this.setupTargeting(scene);
        
        console.log('✅ Global MMO UI initialized');
        return this.wowUI;
    }
    
    /**
     * Hook into character health for automatic UI updates
     */
    hookHealthUpdates(character) {
        if (!character.health) return;
        
        const originalTakeDamage = character.health.takeDamage?.bind(character.health);
        if (originalTakeDamage) {
            character.health.takeDamage = (amount) => {
                originalTakeDamage(amount);
                this.wowUI?.updatePlayer({ health: character.health.health });
            };
        }
        
        const originalHeal = character.health.heal?.bind(character.health);
        if (originalHeal) {
            character.health.heal = (amount) => {
                originalHeal(amount);
                this.wowUI?.updatePlayer({ health: character.health.health });
            };
        }
    }
    
    /**
     * Setup Tab-targeting and click targeting
     */
    setupTargeting(scene) {
        // Tab targeting
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.cycleTarget(scene);
            }
            if (e.key === 'Escape') {
                this.clearTarget();
            }
        });
        
        // Click targeting
        scene.onPointerDown = (evt, pickResult) => {
            if (evt.button === 0 && pickResult.hit) {
                const mesh = pickResult.pickedMesh;
                // Check if clicked on an enemy
                if (mesh.health || mesh.parent?.health) {
                    const target = mesh.health || mesh.parent.health;
                    this.setTarget(target);
                }
            }
        };
    }
    
    /**
     * Cycle through available targets (Tab)
     */
    cycleTarget(scene) {
        const enemies = scene.meshes.filter(m => m.health && m !== this.playerCharacter);
        if (enemies.length === 0) return;
        
        const currentIndex = this.currentTargetIndex || -1;
        const nextIndex = (currentIndex + 1) % enemies.length;
        this.currentTargetIndex = nextIndex;
        
        const target = enemies[nextIndex];
        this.setTarget(target.health);
    }
    
    /**
     * Set current target
     */
    setTarget(healthComponent) {
        if (!healthComponent) {
            this.clearTarget();
            return;
        }
        
        this.currentTarget = healthComponent;
        this.wowUI?.setTarget({
            name: healthComponent.name || 'Enemy',
            level: healthComponent.level || 1,
            health: healthComponent.health,
            maxHealth: healthComponent.maxHealth
        });
        
        // Update target health periodically
        if (this.targetUpdateInterval) clearInterval(this.targetUpdateInterval);
        this.targetUpdateInterval = setInterval(() => {
            if (this.currentTarget) {
                this.wowUI?.setTarget({
                    name: this.currentTarget.name || 'Enemy',
                    level: this.currentTarget.level || 1,
                    health: this.currentTarget.health,
                    maxHealth: this.currentTarget.maxHealth
                });
            }
        }, 100);
    }

    clearTarget() {
        this.currentTarget = null;
        this.currentTargetIndex = -1;
        if (this.targetUpdateInterval) {
            clearInterval(this.targetUpdateInterval);
            this.targetUpdateInterval = null;
        }
        this.wowUI?.setTarget(null);
    }

    updatePlayer(stats) {
        this.wowUI?.updatePlayer(stats);
    }

    startCast(spellName, duration) {
        this.wowUI?.startCast(spellName, duration);
    }

    getUI() {
        return this.wowUI;
    }

    show() {
        this.wowUI?.show();
    }

    hide() {
        this.wowUI?.hide();
    }

    destroy() {
        if (this.targetUpdateInterval) {
            clearInterval(this.targetUpdateInterval);
        }
        this.wowUI?.destroy();
        this.wowUI = null;
    }
}

export const globalUI = GlobalUI.getInstance();
