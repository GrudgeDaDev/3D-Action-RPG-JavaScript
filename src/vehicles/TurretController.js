/**
 * TurretController.js
 * Controls turret mounting and cannon firing
 */

export class TurretController {
    constructor(scene, player, camera) {
        this.scene = scene;
        this.player = player;
        this.camera = camera;
        
        // Turret state
        this.turret = null;
        this.isMounted = false;
        
        // Rotation
        this.rotationSpeed = 1.5;
        this.currentRotation = 0;
        this.minRotation = -Math.PI; // 180 degrees left
        this.maxRotation = Math.PI;  // 180 degrees right
        
        // Firing
        this.cannonballSpeed = 50;
        this.cannonballGravity = -9.8;
        this.lastFireTime = 0;
        this.fireRate = 2000; // 2 seconds between shots
        
        // Projectile pool
        this.cannonballs = [];
        this.maxCannonballs = 20;
        
        console.log('💣 Turret Controller initialized');
    }

    /**
     * Mount the turret
     */
    mount(turretMesh, data = {}) {
        this.turret = turretMesh;
        this.isMounted = true;
        
        // Position player at turret
        this.player.position = this.turret.position.clone();
        this.player.position.y += 2;
        
        // Lock camera to turret
        this.camera.lockedTarget = this.turret;
        this.camera.radius = 10; // Pull back for better view
        
        // Initialize rotation
        this.currentRotation = this.turret.rotation.y;
        
        console.log('💣 Mounted turret');
    }

    /**
     * Dismount the turret
     */
    dismount() {
        if (!this.isMounted) return;
        
        // Place player behind turret
        const dismountOffset = new BABYLON.Vector3(0, 0, -3);
        this.player.position = this.turret.position.add(dismountOffset);
        
        // Unlock camera
        this.camera.lockedTarget = null;
        
        this.isMounted = false;
        this.turret = null;
        
        console.log('💣 Dismounted turret');
    }

    /**
     * Use turret skill
     */
    useSkill(skillId, skillData) {
        switch (skillId) {
            case 'fire_cannon':
                this.fireCannon();
                break;
            case 'explosive_shot':
                this.fireExplosiveShot();
                break;
            case 'rapid_fire':
                this.activateRapidFire();
                break;
            case 'rotate_left':
                this.rotateLeft();
                break;
            case 'rotate_right':
                this.rotateRight();
                break;
        }
    }

    /**
     * Fire standard cannonball
     */
    fireCannon() {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireRate) {
            console.log('Cannon on cooldown');
            return;
        }
        
        console.log('💥 FIRE!');
        this.lastFireTime = now;
        
        // Create cannonball
        const cannonball = this.createCannonball();
        
        // Position at turret barrel
        const barrelOffset = this.turret.forward.scale(2);
        cannonball.position = this.turret.position.add(barrelOffset);
        cannonball.position.y += 1.5;
        
        // Launch cannonball
        const direction = this.turret.forward;
        const velocity = direction.scale(this.cannonballSpeed);
        
        if (cannonball.physicsImpostor) {
            cannonball.physicsImpostor.setLinearVelocity(velocity);
        }
        
        // Muzzle flash effect
        this.createMuzzleFlash();
        
        // Cleanup after 10 seconds
        setTimeout(() => {
            cannonball.dispose();
        }, 10000);
    }

    /**
     * Fire explosive cannonball (AoE)
     */
    fireExplosiveShot() {
        console.log('💣 Explosive Shot!');
        
        // Create explosive cannonball
        const cannonball = this.createCannonball(true);
        
        const barrelOffset = this.turret.forward.scale(2);
        cannonball.position = this.turret.position.add(barrelOffset);
        cannonball.position.y += 1.5;
        
        const direction = this.turret.forward;
        const velocity = direction.scale(this.cannonballSpeed);
        
        if (cannonball.physicsImpostor) {
            cannonball.physicsImpostor.setLinearVelocity(velocity);
        }
        
        // Explode on impact
        cannonball.metadata = { explosive: true };
        
        this.createMuzzleFlash();
    }

    /**
     * Activate rapid fire mode
     */
    activateRapidFire() {
        console.log('🔥 Rapid Fire!');

        const shotsCount = 5;
        const shotDelay = 300; // 0.3 seconds between shots

        for (let i = 0; i < shotsCount; i++) {
            setTimeout(() => {
                this.fireCannon();
            }, i * shotDelay);
        }
    }

    /**
     * Rotate turret left
     */
    rotateLeft() {
        if (this.currentRotation < this.maxRotation) {
            this.currentRotation += this.rotationSpeed * 0.1;
            this.turret.rotation.y = this.currentRotation;
        }
    }

    /**
     * Rotate turret right
     */
    rotateRight() {
        if (this.currentRotation > this.minRotation) {
            this.currentRotation -= this.rotationSpeed * 0.1;
            this.turret.rotation.y = this.currentRotation;
        }
    }

    /**
     * Create cannonball projectile
     */
    createCannonball(explosive = false) {
        const cannonball = BABYLON.MeshBuilder.CreateSphere('cannonball', {
            diameter: explosive ? 1.5 : 1
        }, this.scene);

        // Material
        const material = new BABYLON.StandardMaterial('cannonballMat', this.scene);
        material.diffuseColor = explosive ? new BABYLON.Color3(1, 0.5, 0) : new BABYLON.Color3(0.2, 0.2, 0.2);
        material.emissiveColor = explosive ? new BABYLON.Color3(0.5, 0.2, 0) : BABYLON.Color3.Black();
        cannonball.material = material;

        // Physics
        cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(
            cannonball,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 10, restitution: 0.3 },
            this.scene
        );

        // Collision detection
        cannonball.actionManager = new BABYLON.ActionManager(this.scene);
        cannonball.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnIntersectionEnterTrigger,
                (evt) => {
                    this.onCannonballHit(cannonball, evt.meshUnderPointer, explosive);
                }
            )
        );

        return cannonball;
    }

    /**
     * Handle cannonball impact
     */
    onCannonballHit(cannonball, target, explosive) {
        if (!target || target === this.turret) return;

        console.log('💥 Cannonball hit!');

        if (explosive) {
            // Create explosion
            this.createExplosion(cannonball.position);

            // Damage in radius
            const explosionRadius = 8;
            const enemies = this.scene.meshes.filter(mesh =>
                mesh.metadata?.isEnemy &&
                BABYLON.Vector3.Distance(cannonball.position, mesh.position) <= explosionRadius
            );

            enemies.forEach(enemy => {
                if (enemy.metadata?.health) {
                    const distance = BABYLON.Vector3.Distance(cannonball.position, enemy.position);
                    const damage = 150 * (1 - distance / explosionRadius); // Falloff damage
                    enemy.metadata.health -= damage;
                    console.log(`Explosion dealt ${damage.toFixed(0)} damage`);
                }
            });
        } else {
            // Single target damage
            if (target.metadata?.health) {
                target.metadata.health -= 75;
                console.log('Cannonball dealt 75 damage');
            }
        }

        // Remove cannonball
        cannonball.dispose();
    }

    /**
     * Create explosion effect
     */
    createExplosion(position) {
        const explosion = new BABYLON.ParticleSystem('explosion', 300, this.scene);
        explosion.particleTexture = new BABYLON.Texture('textures/flare.png', this.scene);

        explosion.emitter = position;
        explosion.minEmitBox = new BABYLON.Vector3(-1, -1, -1);
        explosion.maxEmitBox = new BABYLON.Vector3(1, 1, 1);

        explosion.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        explosion.color2 = new BABYLON.Color4(1, 0, 0, 1);
        explosion.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0);

        explosion.minSize = 0.5;
        explosion.maxSize = 3;

        explosion.minLifeTime = 0.2;
        explosion.maxLifeTime = 0.6;

        explosion.emitRate = 300;
        explosion.manualEmitCount = 300;

        explosion.gravity = new BABYLON.Vector3(0, -9.8, 0);

        explosion.start();
        setTimeout(() => explosion.dispose(), 1000);
    }

    /**
     * Create muzzle flash effect
     */
    createMuzzleFlash() {
        const flash = BABYLON.MeshBuilder.CreateSphere('flash', { diameter: 2 }, this.scene);

        const barrelOffset = this.turret.forward.scale(2);
        flash.position = this.turret.position.add(barrelOffset);
        flash.position.y += 1.5;

        const material = new BABYLON.StandardMaterial('flashMat', this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        flash.material = material;

        setTimeout(() => flash.dispose(), 100);
    }

    /**
     * Update turret
     */
    update(deltaTime, inputMap) {
        if (!this.isMounted || !this.turret) return;

        // Mouse aiming (if available)
        // Keyboard rotation
        if (inputMap['a'] || inputMap['arrowleft']) {
            this.rotateLeft();
        }
        if (inputMap['d'] || inputMap['arrowright']) {
            this.rotateRight();
        }

        // Keep player synced
        this.player.position.copyFrom(this.turret.position);
        this.player.position.y += 2;
    }

    /**
     * Get turret rotation angle
     */
    getRotation() {
        return this.currentRotation;
    }
}

