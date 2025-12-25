/**
 * Swimming Controller - Handles player swimming state and movement in water
 */

export class SwimmingController {
    constructor(scene, character, dummyAggregate, hero, anim, waterLevel) {
        this.scene = scene;
        this.character = character;
        this.dummyAggregate = dummyAggregate;
        this.hero = hero;
        this.anim = anim;
        this.waterLevel = waterLevel;
        
        this.isSwimming = false;
        this.swimSpeed = 40;
        this.swimDepth = 5; // How deep below water surface player swims
        this.transitionSpeed = 0.1;
        
        // Swimming animation (will use running as fallback)
        this.swimAnim = null;
        this.setupSwimmingAnimation();
        
        // Register update loop
        this.scene.registerBeforeRender(() => this.update());
        
        console.log('🏊 Swimming Controller initialized');
    }
    
    setupSwimmingAnimation() {
        // Try to find a swimming animation, fallback to running
        this.swimAnim = this.scene.getAnimationGroupByName("Swimming") || 
                        this.scene.getAnimationGroupByName("Swim") ||
                        this.anim.Running; // Fallback
    }
    
    update() {
        const playerY = this.character.position.y;
        const wasSwimming = this.isSwimming;
        
        // Check if player is in water (below water level)
        this.isSwimming = playerY < this.waterLevel + 10;
        
        if (this.isSwimming) {
            this.handleSwimming();
            
            // Transition to swimming
            if (!wasSwimming) {
                this.enterWater();
            }
        } else if (wasSwimming) {
            this.exitWater();
        }
    }
    
    enterWater() {
        console.log('🏊 Entered water - Swimming mode active');
        
        // Reduce gravity effect while swimming
        if (this.dummyAggregate && this.dummyAggregate.body) {
            // Store original gravity
            this.originalGravity = this.scene.gravity ? this.scene.gravity.clone() : null;
        }
        
        // Play swimming animation
        if (this.swimAnim && this.swimAnim !== this.anim.Running) {
            this.stopOtherAnimations();
            this.swimAnim.start(true, 0.8);
        }
        
        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('playerSwimStart'));
    }
    
    exitWater() {
        console.log('🏃 Exited water - Normal mode');
        
        // Restore normal physics
        if (this.swimAnim && this.swimAnim !== this.anim.Running) {
            this.swimAnim.stop();
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('playerSwimEnd'));
    }
    
    handleSwimming() {
        if (!this.dummyAggregate || !this.dummyAggregate.body) return;
        
        const currentVelocity = this.dummyAggregate.body.getLinearVelocity();
        
        // Keep player at swim depth below water surface
        const targetY = this.waterLevel - this.swimDepth;
        const yDiff = targetY - this.character.position.y;
        
        // Buoyancy - push player toward swim depth
        let buoyancyForce = 0;
        if (this.character.position.y < targetY - 5) {
            // Too deep, push up
            buoyancyForce = 30;
        } else if (this.character.position.y > targetY + 5) {
            // Too high, let sink slightly
            buoyancyForce = -5;
        } else {
            // At good depth, neutralize vertical velocity
            buoyancyForce = yDiff * 2;
        }
        
        // Apply modified velocity with buoyancy
        const newVelocity = new BABYLON.Vector3(
            currentVelocity.x * 0.8, // Slow horizontal movement in water
            buoyancyForce,
            currentVelocity.z * 0.8
        );
        
        this.dummyAggregate.body.setLinearVelocity(newVelocity);
        
        // Tilt hero slightly forward when swimming
        if (this.hero && this.hero.rotationQuaternion) {
            // Could add slight forward tilt here for swimming pose
        }
    }
    
    stopOtherAnimations() {
        for (let key in this.anim) {
            if (this.anim.hasOwnProperty(key) && this.anim[key] && this.anim[key].isPlaying) {
                this.anim[key].stop();
            }
        }
    }
    
    // Get swim speed for movement system
    getSwimSpeedMultiplier() {
        return this.isSwimming ? 0.5 : 1.0;
    }
    
    // Check if player can perform action (some actions disabled while swimming)
    canPerformAction(action) {
        const disabledInWater = ['roll', 'attack', 'combo'];
        if (this.isSwimming && disabledInWater.includes(action)) {
            return false;
        }
        return true;
    }
}

