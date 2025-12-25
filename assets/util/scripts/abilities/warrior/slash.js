/**
 * Slash Ability - Warrior basic attack
 */

import { COMBAT, COOLDOWNS, ANIMATIONS } from '../../core/constants.js';
import { distance3D, isInRange } from '../../core/utils.js';

export class SlashAbility {
    constructor(character) {
        this.character = character;
        this.name = 'Slash';
        this.description = 'A powerful melee slash attack';
        this.icon = '⚔️';
        
        // Ability stats
        this.damage = 50;
        this.range = 3.0;
        this.cooldown = COOLDOWNS.BASIC_ATTACK;
        this.manaCost = 0;
        this.staminaCost = 10;
        
        // State
        this.lastUsed = 0;
        this.isOnCooldown = false;
    }

    /**
     * Check if ability can be used
     */
    canUse() {
        const now = Date.now();
        const cooldownRemaining = this.lastUsed + this.cooldown - now;
        
        if (cooldownRemaining > 0) {
            return { canUse: false, reason: `On cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` };
        }
        
        if (this.character.stamina < this.staminaCost) {
            return { canUse: false, reason: 'Not enough stamina' };
        }
        
        return { canUse: true };
    }

    /**
     * Execute the ability
     */
    async execute(target = null) {
        const canUseCheck = this.canUse();
        if (!canUseCheck.canUse) {
            console.log(`Cannot use ${this.name}: ${canUseCheck.reason}`);
            return false;
        }

        // Find target if not provided
        if (!target) {
            target = this.findNearestEnemy();
        }

        if (!target) {
            console.log('No target in range');
            return false;
        }

        // Check range
        if (!isInRange(this.character.position, target.position, this.range)) {
            console.log('Target out of range');
            return false;
        }

        // Consume resources
        this.character.stamina -= this.staminaCost;
        this.lastUsed = Date.now();
        this.isOnCooldown = true;

        // Play animation
        if (this.character.playAnimation) {
            this.character.playAnimation(ANIMATIONS.ATTACK_1);
        }

        // Deal damage after animation delay
        setTimeout(() => {
            this.dealDamage(target);
        }, 300);

        // Reset cooldown
        setTimeout(() => {
            this.isOnCooldown = false;
        }, this.cooldown);

        return true;
    }

    /**
     * Deal damage to target
     */
    dealDamage(target) {
        if (!target || !target.takeDamage) {
            console.error('Invalid target');
            return;
        }

        // Calculate damage
        let finalDamage = this.damage;
        
        // Add character strength bonus
        if (this.character.stats && this.character.stats.strength) {
            finalDamage += this.character.stats.strength * 0.5;
        }

        // Critical hit chance
        if (Math.random() < COMBAT.CRITICAL_CHANCE) {
            finalDamage *= COMBAT.CRITICAL_MULTIPLIER;
            console.log('💥 CRITICAL HIT!');
        }

        // Apply damage
        target.takeDamage(finalDamage, this.character);
        
        console.log(`${this.character.name} slashed ${target.name} for ${finalDamage.toFixed(0)} damage!`);
    }

    /**
     * Find nearest enemy in range
     */
    findNearestEnemy() {
        if (!window.SCENE_MANAGER || !window.SCENE_MANAGER.currentScene) {
            return null;
        }

        const scene = window.SCENE_MANAGER.currentScene;
        let nearestEnemy = null;
        let nearestDistance = this.range;

        // Search for enemies in scene
        scene.meshes.forEach(mesh => {
            if (mesh.metadata && mesh.metadata.isEnemy && mesh.metadata.health > 0) {
                const dist = distance3D(this.character.position, mesh.position);
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestEnemy = mesh;
                }
            }
        });

        return nearestEnemy;
    }

    /**
     * Get cooldown remaining in seconds
     */
    getCooldownRemaining() {
        const now = Date.now();
        const remaining = Math.max(0, this.lastUsed + this.cooldown - now);
        return remaining / 1000;
    }

    /**
     * Get ability info for UI
     */
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            icon: this.icon,
            damage: this.damage,
            range: this.range,
            cooldown: this.cooldown / 1000,
            manaCost: this.manaCost,
            staminaCost: this.staminaCost,
            isOnCooldown: this.isOnCooldown,
            cooldownRemaining: this.getCooldownRemaining()
        };
    }
}

