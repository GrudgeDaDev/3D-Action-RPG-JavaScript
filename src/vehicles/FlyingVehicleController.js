/**
 * FlyingVehicleController.js
 * Controls flying vehicles (dragons, airships, etc.)
 */

export class FlyingVehicleController {
    constructor(scene, player, camera) {
        this.scene = scene;
        this.player = player;
        this.camera = camera;
        
        // Vehicle state
        this.vehicle = null;
        this.isMounted = false;
        
        // Movement
        this.velocity = BABYLON.Vector3.Zero();
        this.maxSpeed = 30;
        this.acceleration = 12;
        this.deceleration = 8;
        this.turnSpeed = 1.8;
        this.verticalSpeed = 10;
        
        // Flight limits
        this.minAltitude = 5;
        this.maxAltitude = 200;
        
        // Skills
        this.isBarrelRolling = false;
        this.isDiving = false;
        
        console.log('🦅 Flying Vehicle Controller initialized');
    }

    /**
     * Mount the flying vehicle
     */
    mount(vehicleMesh, data = {}) {
        this.vehicle = vehicleMesh;
        this.isMounted = true;
        
        // Position player on vehicle
        this.player.position = this.vehicle.position.clone();
        this.player.position.y += 2;
        
        // Lock camera to vehicle
        this.camera.lockedTarget = this.vehicle;
        
        // Start at safe altitude
        if (this.vehicle.position.y < this.minAltitude) {
            this.vehicle.position.y = this.minAltitude;
        }
        
        console.log('🦅 Mounted flying vehicle');
    }

    /**
     * Dismount the flying vehicle
     */
    dismount() {
        if (!this.isMounted) return;
        
        // Land before dismounting
        if (this.vehicle.position.y > this.minAltitude + 2) {
            console.warn('Too high to dismount! Land first.');
            return;
        }
        
        // Place player next to vehicle
        const dismountOffset = this.vehicle.forward.scale(-3);
        this.player.position = this.vehicle.position.add(dismountOffset);
        
        // Unlock camera
        this.camera.lockedTarget = null;
        
        this.isMounted = false;
        this.vehicle = null;
        this.velocity = BABYLON.Vector3.Zero();
        
        console.log('🦅 Dismounted flying vehicle');
    }

    /**
     * Use flying vehicle skill
     */
    useSkill(skillId, skillData) {
        switch (skillId) {
            case 'ascend':
                this.ascend();
                break;
            case 'descend':
                this.descend();
                break;
            case 'barrel_roll':
                this.performBarrelRoll();
                break;
            case 'dive_bomb':
                this.performDiveBomb();
                break;
        }
    }

    /**
     * Ascend (fly higher)
     */
    ascend() {
        if (this.vehicle.position.y < this.maxAltitude) {
            this.velocity.y = this.verticalSpeed;
        }
    }

    /**
     * Descend (fly lower)
     */
    descend() {
        if (this.vehicle.position.y > this.minAltitude) {
            this.velocity.y = -this.verticalSpeed;
        }
    }

    /**
     * Perform barrel roll (evasive maneuver)
     */
    performBarrelRoll() {
        if (this.isBarrelRolling) return;
        
        console.log('🌀 Barrel Roll!');
        this.isBarrelRolling = true;
        
        // Animate barrel roll
        const rollDuration = 1000; // 1 second
        const startRotation = this.vehicle.rotation.z;
        const startTime = Date.now();
        
        const rollInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / rollDuration;
            
            if (progress >= 1) {
                this.vehicle.rotation.z = startRotation;
                this.isBarrelRolling = false;
                clearInterval(rollInterval);
            } else {
                this.vehicle.rotation.z = startRotation + (Math.PI * 2 * progress);
            }
        }, 16);
        
        // Grant temporary invulnerability
        if (this.vehicle.metadata) {
            this.vehicle.metadata.invulnerable = true;
            setTimeout(() => {
                this.vehicle.metadata.invulnerable = false;
            }, rollDuration);
        }
    }

    /**
     * Perform dive bomb attack
     */
    performDiveBomb() {
        if (this.isDiving) return;

        console.log('💥 Dive Bomb!');
        this.isDiving = true;

        // Store current altitude
        const startAltitude = this.vehicle.position.y;
        const targetAltitude = Math.max(this.minAltitude, startAltitude - 20);

        // Dive down rapidly
        const diveSpeed = 50;
        const diveInterval = setInterval(() => {
            if (this.vehicle.position.y <= targetAltitude) {
                clearInterval(diveInterval);
                this.createExplosion();
                this.isDiving = false;
            } else {
                this.vehicle.position.y -= diveSpeed * 0.016; // ~60fps
                this.velocity.y = -diveSpeed;
            }
        }, 16);
    }

    /**
     * Create explosion effect on dive bomb impact
     */
    createExplosion() {
        const explosionRadius = 10;

        // Damage enemies in radius
        const enemies = this.scene.meshes.filter(mesh =>
            mesh.metadata?.isEnemy &&
            BABYLON.Vector3.Distance(this.vehicle.position, mesh.position) <= explosionRadius
        );

        enemies.forEach(enemy => {
            if (enemy.metadata?.health) {
                enemy.metadata.health -= 100;
                console.log(`Dive bomb hit enemy for 100 damage`);
            }

            // Knockback
            const direction = enemy.position.subtract(this.vehicle.position).normalize();
            const knockback = direction.scale(15);

            if (enemy.physicsImpostor) {
                enemy.physicsImpostor.applyImpulse(knockback, enemy.position);
            }
        });

        // Visual explosion effect
        const explosion = new BABYLON.ParticleSystem('explosion', 200, this.scene);
        explosion.particleTexture = new BABYLON.Texture('textures/flare.png', this.scene);

        explosion.emitter = this.vehicle.position.clone();
        explosion.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        explosion.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

        explosion.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        explosion.color2 = new BABYLON.Color4(1, 0, 0, 1);

        explosion.minSize = 0.5;
        explosion.maxSize = 2;

        explosion.minLifeTime = 0.3;
        explosion.maxLifeTime = 0.8;

        explosion.emitRate = 200;
        explosion.manualEmitCount = 200;

        explosion.start();
        setTimeout(() => explosion.dispose(), 1000);
    }

    /**
     * Update flying vehicle movement
     */
    update(deltaTime, inputMap) {
        if (!this.isMounted || !this.vehicle) return;

        // Forward/Backward movement
        let targetSpeed = 0;
        if (inputMap['w'] || inputMap['arrowup']) {
            targetSpeed = this.maxSpeed;
        } else if (inputMap['s'] || inputMap['arrowdown']) {
            targetSpeed = -this.maxSpeed * 0.5;
        }

        // Smooth acceleration
        const currentSpeed = this.velocity.length();
        if (targetSpeed > currentSpeed) {
            this.velocity = this.vehicle.forward.scale(
                Math.min(currentSpeed + this.acceleration * deltaTime, targetSpeed)
            );
        } else if (targetSpeed < currentSpeed) {
            this.velocity = this.vehicle.forward.scale(
                Math.max(currentSpeed - this.deceleration * deltaTime, targetSpeed)
            );
        }

        // Turning
        if (inputMap['a'] || inputMap['arrowleft']) {
            this.vehicle.rotation.y += this.turnSpeed * deltaTime;
        }
        if (inputMap['d'] || inputMap['arrowright']) {
            this.vehicle.rotation.y -= this.turnSpeed * deltaTime;
        }

        // Vertical movement (Space = up, Shift = down)
        if (inputMap[' '] || inputMap['space']) {
            this.ascend();
        } else if (inputMap['shift']) {
            this.descend();
        } else {
            // Gradually stop vertical movement
            this.velocity.y *= 0.9;
        }

        // Apply movement
        this.vehicle.position.addInPlace(this.velocity.scale(deltaTime));

        // Enforce altitude limits
        if (this.vehicle.position.y < this.minAltitude) {
            this.vehicle.position.y = this.minAltitude;
            this.velocity.y = 0;
        }
        if (this.vehicle.position.y > this.maxAltitude) {
            this.vehicle.position.y = this.maxAltitude;
            this.velocity.y = 0;
        }

        // Keep player synced with vehicle
        this.player.position.copyFrom(this.vehicle.position);
        this.player.position.y += 2;

        // Tilt vehicle based on movement
        if (!this.isBarrelRolling) {
            const tiltAmount = 0.2;
            if (inputMap['a'] || inputMap['arrowleft']) {
                this.vehicle.rotation.z = Math.min(this.vehicle.rotation.z + tiltAmount * deltaTime, 0.3);
            } else if (inputMap['d'] || inputMap['arrowright']) {
                this.vehicle.rotation.z = Math.max(this.vehicle.rotation.z - tiltAmount * deltaTime, -0.3);
            } else {
                // Return to level
                this.vehicle.rotation.z *= 0.9;
            }
        }
    }

    /**
     * Get current altitude
     */
    getAltitude() {
        return this.vehicle ? this.vehicle.position.y : 0;
    }

    /**
     * Check if can dismount
     */
    canDismount() {
        return this.vehicle && this.vehicle.position.y <= this.minAltitude + 2;
    }
}

