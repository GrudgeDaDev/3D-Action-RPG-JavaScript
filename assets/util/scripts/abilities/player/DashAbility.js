/**
 * Dash Ability - Player dash/charge attack
 * Converted from Unity C# PlayerDashController.cs
 * 
 * Allows player to dash towards a target with a charge attack
 */

import { COOLDOWNS, ANIMATIONS } from '../../core/constants.js';
import { distance3D, lerp } from '../../core/utils.js';
import * as BABYLON from '@babylonjs/core';

export class DashAbility {
    constructor(character) {
        this.character = character;
        this.name = 'Dash Attack';
        this.description = 'Charge towards target with a powerful dash attack';
        this.icon = '⚡';
        
        // Ability stats
        this.damage = 75;
        this.range = 15.0;
        this.stopDistance = 2.0;
        this.dashSpeed = 20.0;
        this.cooldown = 5000;
        this.manaCost = 20;
        this.staminaCost = 30;
        
        // State
        this.lastUsed = 0;
        this.isCharging = false;
        this.target = null;
        this.buffName = 'dash_buff';
        
        // Animation state
        this.chargeAnimationPlaying = false;
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
        
        if (this.character.mana < this.manaCost) {
            return { canUse: false, reason: 'Not enough mana' };
        }
        
        if (this.isCharging) {
            return { canUse: false, reason: 'Already charging' };
        }
        
        return { canUse: true };
    }

    /**
     * Check if target is valid
     */
    checkTarget(target) {
        if (!target) return false;
        if (!target.metadata || !target.metadata.isEnemy) return false;
        if (target.metadata.health <= 0) return false;
        
        const dist = distance3D(this.character.position, target.position);
        if (dist > this.range) return false;
        
        return true;
    }

    /**
     * Execute the dash ability
     */
    async execute(target = null) {
        const canUseCheck = this.canUse();
        if (!canUseCheck.canUse) {
            console.log(`Cannot use ${this.name}: ${canUseCheck.reason}`);
            return false;
        }

        // Use selected target from enemy frame, or auto-target if none selected
        if (!target) {
            target = this.getSelectedTarget() || this.findNearestEnemy();
        }

        if (!this.checkTarget(target)) {
            console.log('Invalid target for dash attack');
            return false;
        }

        // Consume resources
        this.character.stamina -= this.staminaCost;
        this.character.mana -= this.manaCost;
        this.lastUsed = Date.now();

        // Start charging
        this.isCharging = true;
        this.target = target;
        
        // Add buff to character
        this.addBuff();
        
        // Play charge animation
        if (this.character.playAnimation) {
            this.character.playAnimation('chargeattack');
            this.chargeAnimationPlaying = true;
        }

        // Lock rotation during charge
        this.lockRotation();

        // Start dash movement
        await this.performDash();

        return true;
    }

    /**
     * Perform the dash movement
     */
    async performDash() {
        return new Promise((resolve) => {
            const dashInterval = setInterval(() => {
                if (!this.isCharging || !this.target) {
                    clearInterval(dashInterval);
                    this.endDash();
                    resolve();
                    return;
                }

                const goal = this.target.position;
                const currentPos = this.character.position;
                const dist = distance3D(currentPos, goal);

                // Check if reached target
                if (dist <= this.stopDistance) {
                    clearInterval(dashInterval);
                    this.onReachTarget();
                    resolve();
                    return;
                }

                // Move towards target
                const direction = goal.subtract(currentPos).normalize();
                const moveSpeed = this.dashSpeed * 0.016; // Assuming 60fps
                this.character.position.addInPlace(direction.scale(moveSpeed));

                // Look at target
                this.character.lookAt(goal);

            }, 16); // ~60fps
        });
    }

    /**
     * Called when dash reaches target
     */
    onReachTarget() {
        // Deal damage
        if (this.target && this.target.takeDamage) {
            this.target.takeDamage(this.damage, this.character);
            console.log(`💥 Dash attack hit ${this.target.name || 'target'} for ${this.damage} damage!`);
        }

        // Remove buff
        this.removeBuff();

        // End dash
        this.endDash();
    }

    /**
     * End the dash
     */
    endDash() {
        this.isCharging = false;
        this.target = null;

        // Stop charge animation
        if (this.chargeAnimationPlaying && this.character.playAnimation) {
            this.character.playAnimation(ANIMATIONS.IDLE);
            this.chargeAnimationPlaying = false;
        }

        // Unlock rotation
        this.unlockRotation();

        // Force upright position
        this.forceUpright();
    }

    /**
     * Lock character rotation during dash
     */
    lockRotation() {
        if (this.character.physicsImpostor) {
            this.character.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            this.character.rotationLocked = true;
        }
    }

    /**
     * Unlock character rotation
     */
    unlockRotation() {
        if (this.character.physicsImpostor) {
            this.character.rotationLocked = false;
        }
    }

    /**
     * Force character to upright position
     */
    forceUpright() {
        if (this.character.rotation) {
            const currentY = this.character.rotation.y;
            this.character.rotation = new BABYLON.Vector3(0, currentY, 0);
        }
    }

    /**
     * Add dash buff to character
     */
    addBuff() {
        if (!this.character.buffs) {
            this.character.buffs = [];
        }
        
        const buff = {
            name: this.buffName,
            duration: 10000,
            startTime: Date.now()
        };
        
        this.character.buffs.push(buff);
    }

    /**
     * Remove dash buff from character
     */
    removeBuff() {
        if (this.character.buffs) {
            const index = this.character.buffs.findIndex(b => b.name === this.buffName);
            if (index !== -1) {
                this.character.buffs.splice(index, 1);
            }
        }
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
     * Find nearest enemy in range (auto-targeting)
     */
    findNearestEnemy() {
        if (!this.character.scene && !window.SCENE_MANAGER) {
            return null;
        }

        const scene = this.character.scene || window.SCENE_MANAGER.currentScene;
        let nearestEnemy = null;
        let nearestDistance = this.range;

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
            dashSpeed: this.dashSpeed,
            cooldown: this.cooldown / 1000,
            manaCost: this.manaCost,
            staminaCost: this.staminaCost,
            isCharging: this.isCharging,
            cooldownRemaining: this.getCooldownRemaining()
        };
    }

    /**
     * Cancel the dash (if needed)
     */
    cancel() {
        if (this.isCharging) {
            this.endDash();
        }
    }
}

