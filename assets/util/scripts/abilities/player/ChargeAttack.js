/**
 * Charge Attack Ability
 * Converted from Unity C# chargeattackfromscratch.cs
 * 
 * A buff-based charge attack skill that dashes to target and deals damage
 */

import { COOLDOWNS, DAMAGE_TYPES } from '../../core/constants.js';
import { distance3D } from '../../core/utils.js';
import * as BABYLON from '@babylonjs/core';

export class ChargeAttack {
    constructor(character) {
        this.character = character;
        this.name = 'Charge Attack';
        this.description = 'Charge towards enemy and unleash a powerful attack';
        this.icon = '🏃⚔️';
        
        // Skill configuration
        this.castRange = 20.0;
        this.damage = 100;
        this.cooldown = 8000;
        this.manaCost = 35;
        this.buffDuration = 5000;
        this.damageType = DAMAGE_TYPES.PHYSICAL;
        
        // Optional stun effect
        this.stunChance = 0.3;
        this.stunDuration = 2000;
        
        // State
        this.lastUsed = 0;
        this.isActive = false;
        this.currentBuff = null;
        
        // Effect settings
        this.effectPrefab = null; // Can be set to a particle effect
    }

    /**
     * Check if target is valid
     */
    checkTarget(target) {
        if (!target) return false;
        
        // Target must exist and be alive
        if (!target.metadata || target.metadata.health <= 0) return false;
        
        // Must be an enemy
        if (!target.metadata.isEnemy) return false;
        
        // Check if can attack (not same team)
        if (target.metadata.team === this.character.team) return false;
        
        return true;
    }

    /**
     * Check if target is in range
     */
    checkDistance(target) {
        if (!target) return { inRange: false, destination: this.character.position };
        
        const destination = this.getClosestPoint(target, this.character.position);
        const distance = distance3D(this.character.position, destination);
        
        return {
            inRange: distance <= this.castRange,
            destination: destination,
            distance: distance
        };
    }

    /**
     * Get closest point on target
     */
    getClosestPoint(target, fromPosition) {
        // Simple implementation - can be enhanced with bounding box
        return target.position.clone();
    }

    /**
     * Check if ability can be used
     */
    canUse(target = null) {
        const now = Date.now();
        const cooldownRemaining = this.lastUsed + this.cooldown - now;
        
        if (cooldownRemaining > 0) {
            return { canUse: false, reason: `On cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` };
        }
        
        if (this.character.mana < this.manaCost) {
            return { canUse: false, reason: 'Not enough mana' };
        }
        
        if (this.isActive) {
            return { canUse: false, reason: 'Already active' };
        }
        
        if (target && !this.checkTarget(target)) {
            return { canUse: false, reason: 'Invalid target' };
        }
        
        if (target) {
            const distCheck = this.checkDistance(target);
            if (!distCheck.inRange) {
                return { canUse: false, reason: `Target out of range (${distCheck.distance.toFixed(1)}m)` };
            }
        }
        
        return { canUse: true };
    }

    /**
     * Apply the charge attack skill
     */
    async apply(target = null) {
        // Use selected target from enemy frame, or auto-target if none selected
        if (!target) {
            target = this.getSelectedTarget() || this.findNearestEnemy();
        }

        if (!target) {
            console.log('❌ No target available for charge attack');
            return false;
        }

        const canUseCheck = this.canUse(target);
        if (!canUseCheck.canUse) {
            console.log(`Cannot use ${this.name}: ${canUseCheck.reason}`);
            return false;
        }

        // Consume mana
        this.character.mana -= this.manaCost;
        this.lastUsed = Date.now();
        this.isActive = true;

        // Set charging state on player
        if (this.character.playerDashController) {
            this.character.playerDashController.buffName = this.name;
        }
        this.character.charging = true;

        // Add buff to character
        this.addBuff();

        // Spawn visual effect
        this.spawnEffect();

        // Execute the charge
        await this.executeCharge(target);

        return true;
    }

    /**
     * Get currently selected target from enemy frame
     */
    getSelectedTarget() {
        // Check if there's a selected target in the UI
        if (window.GAME_STATE && window.GAME_STATE.selectedTarget) {
            const target = window.GAME_STATE.selectedTarget;
            // Validate target is still valid
            if (this.checkTarget(target)) {
                return target;
            }
        }

        // Check character's target property
        if (this.character.target && this.checkTarget(this.character.target)) {
            return this.character.target;
        }

        return null;
    }

    /**
     * Find nearest enemy for auto-targeting
     */
    findNearestEnemy() {
        if (!this.character.scene) return null;

        let nearestEnemy = null;
        let nearestDistance = this.castRange;

        this.character.scene.meshes.forEach(mesh => {
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
     * Execute the charge movement and attack
     */
    async executeCharge(target) {
        const startTime = Date.now();
        const maxDuration = this.buffDuration;

        return new Promise((resolve) => {
            const chargeInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;

                // Check timeout
                if (elapsed >= maxDuration || !this.isActive) {
                    clearInterval(chargeInterval);
                    this.endCharge();
                    resolve();
                    return;
                }

                // Check if target still valid
                if (!this.checkTarget(target)) {
                    clearInterval(chargeInterval);
                    this.endCharge();
                    resolve();
                    return;
                }

                // Check if reached target
                const dist = distance3D(this.character.position, target.position);
                if (dist <= 2.0) {
                    clearInterval(chargeInterval);
                    this.onHitTarget(target);
                    this.endCharge();
                    resolve();
                    return;
                }

            }, 16);
        });
    }

    /**
     * Called when charge hits target
     */
    onHitTarget(target) {
        if (!target || !target.takeDamage) return;

        // Deal damage
        target.takeDamage(this.damage, this.character, this.damageType);
        console.log(`💥 Charge Attack hit ${target.name || 'target'} for ${this.damage} damage!`);

        // Apply stun effect
        if (Math.random() < this.stunChance) {
            this.applyStun(target);
        }
    }

    /**
     * Apply stun effect to target
     */
    applyStun(target) {
        if (!target.metadata) return;

        target.metadata.stunned = true;
        console.log(`😵 ${target.name || 'Target'} is stunned!`);

        setTimeout(() => {
            if (target.metadata) {
                target.metadata.stunned = false;
            }
        }, this.stunDuration);
    }

    /**
     * Add buff to character
     */
    addBuff() {
        if (!this.character.buffs) {
            this.character.buffs = [];
        }

        this.currentBuff = {
            name: this.name,
            type: 'charge_attack',
            duration: this.buffDuration,
            startTime: Date.now(),
            damageBonus: 0,
            speedBonus: 1.5
        };

        // Remove existing buff if present
        this.removeBuff();

        // Add new buff
        this.character.buffs.push(this.currentBuff);
    }

    /**
     * Remove buff from character
     */
    removeBuff() {
        if (!this.character.buffs) return;

        const index = this.character.buffs.findIndex(b => b.name === this.name);
        if (index !== -1) {
            this.character.buffs.splice(index, 1);
        }
        this.currentBuff = null;
    }

    /**
     * Spawn visual effect
     */
    spawnEffect() {
        if (!this.effectPrefab || !this.character.scene) return;

        // Create particle effect at character position
        const effectPosition = this.character.position.clone();
        effectPosition.y += 1.5; // Offset above character

        // This would spawn a particle system or mesh effect
        // Implementation depends on your effect system
        console.log(`✨ Spawning charge attack effect at ${effectPosition}`);
    }

    /**
     * End the charge
     */
    endCharge() {
        this.isActive = false;
        this.character.charging = false;
        this.removeBuff();
    }

    /**
     * Get cooldown remaining
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
            castRange: this.castRange,
            cooldown: this.cooldown / 1000,
            manaCost: this.manaCost,
            stunChance: this.stunChance * 100,
            stunDuration: this.stunDuration / 1000,
            isActive: this.isActive,
            cooldownRemaining: this.getCooldownRemaining()
        };
    }

    /**
     * Cancel the charge
     */
    cancel() {
        if (this.isActive) {
            this.endCharge();
        }
    }
}

