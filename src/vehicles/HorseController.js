/**
 * HorseController.js
 * Controls horse mounting and riding mechanics
 */

export class HorseController {
    constructor(scene, player, camera) {
        this.scene = scene;
        this.player = player;
        this.camera = camera;
        
        // Horse state
        this.horse = null;
        this.isMounted = false;
        
        // Movement
        this.speed = 0;
        this.maxSpeed = 20; // Normal speed
        this.gallopSpeed = 35; // Sprint speed
        this.acceleration = 15;
        this.deceleration = 10;
        this.turnSpeed = 2.0;
        
        // Skills
        this.isGalloping = false;
        this.gallopEndTime = 0;
        
        console.log('🐴 Horse Controller initialized');
    }

    /**
     * Mount the horse
     */
    mount(horseMesh, data = {}) {
        this.horse = horseMesh;
        this.isMounted = true;
        
        // Position player on horse
        this.player.position = this.horse.position.clone();
        this.player.position.y += 2; // Sit on horse
        
        // Lock camera to horse
        this.camera.lockedTarget = this.horse;
        
        console.log('🐴 Mounted horse');
    }

    /**
     * Dismount the horse
     */
    dismount() {
        if (!this.isMounted) return;
        
        // Place player next to horse
        const dismountOffset = this.horse.forward.scale(-3);
        this.player.position = this.horse.position.add(dismountOffset);
        this.player.position.y = this.horse.position.y;
        
        // Unlock camera
        this.camera.lockedTarget = null;
        
        this.isMounted = false;
        this.horse = null;
        this.speed = 0;
        
        console.log('🐴 Dismounted horse');
    }

    /**
     * Use horse skill
     */
    useSkill(skillId, skillData) {
        switch (skillId) {
            case 'gallop':
                this.activateGallop();
                break;
            case 'rear':
                this.performRear();
                break;
            case 'trample':
                this.performTrample();
                break;
        }
    }

    /**
     * Activate gallop (sprint)
     */
    activateGallop() {
        this.isGalloping = true;
        this.gallopEndTime = Date.now() + 5000; // 5 seconds
        console.log('🏃 Galloping!');
        
        // Visual effect
        this.createSpeedLines();
    }

    /**
     * Perform rear attack
     */
    performRear() {
        console.log('🐴 Rearing!');
        
        // Knockback nearby enemies
        const knockbackRadius = 5;
        const enemies = this.scene.meshes.filter(mesh => 
            mesh.metadata?.isEnemy && 
            BABYLON.Vector3.Distance(this.horse.position, mesh.position) <= knockbackRadius
        );
        
        enemies.forEach(enemy => {
            const direction = enemy.position.subtract(this.horse.position).normalize();
            const knockbackForce = direction.scale(10);
            
            if (enemy.physicsImpostor) {
                enemy.physicsImpostor.applyImpulse(knockbackForce, enemy.position);
            }
        });
        
        // Animation (if available)
        if (this.horse.skeleton) {
            // Play rear animation
        }
    }

    /**
     * Perform trample charge
     */
    performTrample() {
        console.log('💥 Trampling!');
        
        // Boost speed and damage enemies in path
        this.speed = this.gallopSpeed * 1.5;
        
        // Create damage zone in front
        const damageZone = BABYLON.MeshBuilder.CreateBox('trampleZone', {
            width: 3,
            height: 2,
            depth: 5
        }, this.scene);
        
        damageZone.position = this.horse.position.add(this.horse.forward.scale(3));
        damageZone.isVisible = false;
        
        // Check for enemies in zone
        setTimeout(() => {
            const enemies = this.scene.meshes.filter(mesh =>
                mesh.metadata?.isEnemy &&
                damageZone.intersectsMesh(mesh, true)
            );
            
            enemies.forEach(enemy => {
                // Deal damage
                if (enemy.metadata?.health) {
                    enemy.metadata.health -= 50;
                    console.log(`Trampled enemy for 50 damage`);
                }
            });
            
            damageZone.dispose();
        }, 1000);
    }

    /**
     * Create speed lines effect
     */
    createSpeedLines() {
        // Particle system for speed effect
        const speedParticles = new BABYLON.ParticleSystem('speedLines', 100, this.scene);
        speedParticles.particleTexture = new BABYLON.Texture('textures/flare.png', this.scene);

        speedParticles.emitter = this.horse;
        speedParticles.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        speedParticles.maxEmitBox = new BABYLON.Vector3(1, 2, 1);

        speedParticles.color1 = new BABYLON.Color4(1, 1, 1, 0.5);
        speedParticles.color2 = new BABYLON.Color4(0.8, 0.8, 1, 0.3);

        speedParticles.minSize = 0.1;
        speedParticles.maxSize = 0.3;

        speedParticles.minLifeTime = 0.2;
        speedParticles.maxLifeTime = 0.5;

        speedParticles.emitRate = 50;
        speedParticles.direction1 = new BABYLON.Vector3(-1, 0, -1);
        speedParticles.direction2 = new BABYLON.Vector3(1, 0, 1);

        speedParticles.start();

        setTimeout(() => speedParticles.dispose(), 5000);
    }

    /**
     * Update horse movement
     */
    update(deltaTime, inputMap) {
        if (!this.isMounted || !this.horse) return;

        // Check gallop duration
        if (this.isGalloping && Date.now() > this.gallopEndTime) {
            this.isGalloping = false;
        }

        const currentMaxSpeed = this.isGalloping ? this.gallopSpeed : this.maxSpeed;

        // Forward/Backward movement
        if (inputMap['w'] || inputMap['arrowup']) {
            this.speed = Math.min(this.speed + this.acceleration * deltaTime, currentMaxSpeed);
        } else if (inputMap['s'] || inputMap['arrowdown']) {
            this.speed = Math.max(this.speed - this.acceleration * deltaTime, -currentMaxSpeed * 0.5);
        } else {
            // Decelerate
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration * deltaTime);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration * deltaTime);
            }
        }

        // Turning
        if (this.speed !== 0) {
            const turnMultiplier = Math.abs(this.speed) / currentMaxSpeed;

            if (inputMap['a'] || inputMap['arrowleft']) {
                this.horse.rotation.y += this.turnSpeed * deltaTime * turnMultiplier;
            }
            if (inputMap['d'] || inputMap['arrowright']) {
                this.horse.rotation.y -= this.turnSpeed * deltaTime * turnMultiplier;
            }
        }

        // Apply movement
        const forward = this.horse.forward;
        const movement = forward.scale(this.speed * deltaTime);
        this.horse.position.addInPlace(movement);

        // Keep player synced with horse
        this.player.position.x = this.horse.position.x;
        this.player.position.z = this.horse.position.z;
        this.player.position.y = this.horse.position.y + 2;

        // Ground detection
        const ray = new BABYLON.Ray(this.horse.position, new BABYLON.Vector3(0, -1, 0), 10);
        const hit = this.scene.pickWithRay(ray, (mesh) => mesh.metadata?.isGround);

        if (hit.hit) {
            this.horse.position.y = hit.pickedPoint.y + 1;
        }
    }

    /**
     * Get current speed
     */
    getSpeed() {
        return this.speed;
    }

    /**
     * Check if galloping
     */
    isGallopActive() {
        return this.isGalloping;
    }
}

