/**
 * Boat Controller - Drivable boat that floats on water
 * Right-click to enter when close, WASD to drive
 */

export class BoatController {
    constructor(scene, boatMesh, player, hero, camera, waterLevel) {
        this.scene = scene;
        this.boat = boatMesh;
        this.player = player;
        this.hero = hero;
        this.camera = camera;
        this.waterLevel = waterLevel;

        // Boat state
        this.isPlayerInBoat = false;
        this.isMounted = false; // For mount system compatibility
        this.boatSpeed = 0;
        this.maxSpeed = 100;
        this.acceleration = 40;
        this.deceleration = 20;
        this.turnSpeed = 1.5;
        this.bobAmplitude = 0.5;
        this.bobSpeed = 2;

        // Cannon system
        this.cannonCooldown = 5000; // 5 seconds
        this.lastCannonFireLeft = 0;
        this.lastCannonFireRight = 0;
        this.cannonballSpeed = 40;
        
        // Interaction
        this.interactionDistance = 30;
        this.inputMap = {};
        
        // Store original player position when entering boat
        this.originalPlayerParent = null;
        
        this.setupInteraction();
        this.setupInput();
        this.scene.registerBeforeRender(() => this.update());
        
        // UI prompt
        this.createInteractionPrompt();
        
        console.log('⛵ Boat Controller initialized');
    }
    
    setupInteraction() {
        // Right-click to enter/exit boat
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.event.button === 2) { // Right click
                    this.tryInteract();
                }
            }
        });
    }
    
    setupInput() {
        this.scene.actionManager = this.scene.actionManager || new BABYLON.ActionManager(this.scene);
        
        window.addEventListener('keydown', (evt) => {
            const key = evt.key.toLowerCase();
            this.inputMap[key] = true;
        });
        
        window.addEventListener('keyup', (evt) => {
            const key = evt.key.toLowerCase();
            this.inputMap[key] = false;
        });
    }
    
    createInteractionPrompt() {
        this.promptDiv = document.createElement('div');
        this.promptDiv.id = 'boatPrompt';
        this.promptDiv.innerHTML = '🚢 Right-click to board boat';
        this.promptDiv.style.cssText = `
            position: fixed; bottom: 150px; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.8); color: #fff; padding: 10px 20px;
            border-radius: 8px; font-family: Arial; font-size: 16px;
            display: none; z-index: 1000; border: 2px solid #4a90d9;
        `;
        document.body.appendChild(this.promptDiv);
    }
    
    tryInteract() {
        if (this.isPlayerInBoat) {
            this.exitBoat();
        } else {
            const distance = BABYLON.Vector3.Distance(this.player.position, this.boat.position);
            if (distance <= this.interactionDistance) {
                this.enterBoat();
            }
        }
    }
    
    // Mount system compatibility
    mount(boatMesh, data = {}) {
        this.boat = boatMesh;
        this.enterBoat();
    }

    dismount() {
        this.exitBoat();
    }

    enterBoat() {
        console.log('⛵ Entering boat');
        this.isPlayerInBoat = true;
        this.isMounted = true;

        // Hide player hero
        this.hero.setEnabled(false);

        // Disable player physics movement
        if (this.player.physicsImpostor) {
            this.player.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        }

        // Attach camera to boat
        this.camera.lockedTarget = this.boat;

        // Position player on boat (hidden)
        this.player.position = this.boat.position.clone();

        this.promptDiv.innerHTML = '🚢 Right-click to exit boat | WASD to drive | 1-4 for cannons';
        this.promptDiv.style.display = 'block';

        window.dispatchEvent(new CustomEvent('boatEnter'));
    }
    
    exitBoat() {
        console.log('⛵ Exiting boat');
        this.isPlayerInBoat = false;
        this.isMounted = false;
        
        // Show player hero
        this.hero.setEnabled(true);
        
        // Position player next to boat
        const exitOffset = new BABYLON.Vector3(15, 5, 0);
        this.player.position = this.boat.position.add(exitOffset);
        
        // Restore camera target
        this.camera.lockedTarget = this.player;
        
        this.boatSpeed = 0;
        this.promptDiv.style.display = 'none';
        
        window.dispatchEvent(new CustomEvent('boatExit'));
    }
    
    update() {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        
        // Always bob the boat on water
        this.updateBoatBob(deltaTime);
        
        // Check proximity for prompt
        this.updateProximityPrompt();
        
        if (this.isPlayerInBoat) {
            this.handleBoatMovement(deltaTime);
        }
    }
    
    updateBoatBob(deltaTime) {
        const time = performance.now() / 1000;
        const bobOffset = Math.sin(time * this.bobSpeed) * this.bobAmplitude;
        this.boat.position.y = this.waterLevel + 2 + bobOffset; // Slight offset above water
        
        // Gentle rotation bob
        const rollBob = Math.sin(time * this.bobSpeed * 0.7) * 0.02;
        const pitchBob = Math.cos(time * this.bobSpeed * 0.5) * 0.01;
        this.boat.rotation.x = pitchBob;
        this.boat.rotation.z = rollBob;
    }
    
    updateProximityPrompt() {
        if (this.isPlayerInBoat) return;

        const distance = BABYLON.Vector3.Distance(this.player.position, this.boat.position);
        this.promptDiv.style.display = distance <= this.interactionDistance ? 'block' : 'none';
    }

    handleBoatMovement(deltaTime) {
        // Get forward direction based on boat rotation
        const forward = new BABYLON.Vector3(
            Math.sin(this.boat.rotation.y),
            0,
            Math.cos(this.boat.rotation.y)
        );

        // Acceleration/Deceleration
        let targetSpeed = 0;

        if (this.inputMap['w'] || this.inputMap['arrowup']) {
            targetSpeed = this.maxSpeed;
        } else if (this.inputMap['s'] || this.inputMap['arrowdown']) {
            targetSpeed = -this.maxSpeed * 0.5; // Slower reverse
        }

        // Smoothly adjust speed
        if (targetSpeed > this.boatSpeed) {
            this.boatSpeed = Math.min(this.boatSpeed + this.acceleration * deltaTime, targetSpeed);
        } else if (targetSpeed < this.boatSpeed) {
            this.boatSpeed = Math.max(this.boatSpeed - this.deceleration * deltaTime, targetSpeed);
        } else {
            // Decelerate to stop
            if (this.boatSpeed > 0) {
                this.boatSpeed = Math.max(0, this.boatSpeed - this.deceleration * deltaTime);
            } else if (this.boatSpeed < 0) {
                this.boatSpeed = Math.min(0, this.boatSpeed + this.deceleration * deltaTime);
            }
        }

        // Turning (only effective when moving)
        const turnMultiplier = Math.abs(this.boatSpeed) / this.maxSpeed;

        if (this.inputMap['a'] || this.inputMap['arrowleft']) {
            this.boat.rotation.y += this.turnSpeed * deltaTime * turnMultiplier;
        }
        if (this.inputMap['d'] || this.inputMap['arrowright']) {
            this.boat.rotation.y -= this.turnSpeed * deltaTime * turnMultiplier;
        }

        // Apply movement
        const movement = forward.scale(this.boatSpeed * deltaTime);
        this.boat.position.addInPlace(movement);

        // Keep player position synced with boat
        this.player.position.x = this.boat.position.x;
        this.player.position.z = this.boat.position.z;
    }

    isInBoat() {
        return this.isPlayerInBoat;
    }

    getPosition() {
        return this.boat.position.clone();
    }

    teleportTo(position) {
        this.boat.position = position.clone();
        this.boat.position.y = this.waterLevel + 2;
        if (this.isPlayerInBoat) {
            this.player.position = this.boat.position.clone();
        }
    }

    /**
     * Use boat skill (mount system compatibility)
     */
    useSkill(skillId, skillData) {
        switch (skillId) {
            case 'sail_boost':
                this.activateSailBoost();
                break;
            case 'cannon_left':
                this.fireCannonLeft();
                break;
            case 'cannon_right':
                this.fireCannonRight();
                break;
            case 'anchor':
                this.dropAnchor();
                break;
        }
    }

    /**
     * Activate sail boost
     */
    activateSailBoost() {
        console.log('⛵ Full Sail!');
        const boostDuration = 5000; // 5 seconds
        const originalMaxSpeed = this.maxSpeed;

        this.maxSpeed = originalMaxSpeed * 1.5;

        setTimeout(() => {
            this.maxSpeed = originalMaxSpeed;
        }, boostDuration);
    }

    /**
     * Fire left cannons
     */
    fireCannonLeft() {
        const now = Date.now();
        if (now - this.lastCannonFireLeft < this.cannonCooldown) {
            console.log('Port cannons on cooldown');
            return;
        }

        console.log('💣 Port cannons FIRE!');
        this.lastCannonFireLeft = now;

        // Fire from left side
        const leftOffset = this.boat.right.scale(-3);
        this.fireCannonball(leftOffset, -Math.PI / 2);
    }

    /**
     * Fire right cannons
     */
    fireCannonRight() {
        const now = Date.now();
        if (now - this.lastCannonFireRight < this.cannonCooldown) {
            console.log('Starboard cannons on cooldown');
            return;
        }

        console.log('💣 Starboard cannons FIRE!');
        this.lastCannonFireRight = now;

        // Fire from right side
        const rightOffset = this.boat.right.scale(3);
        this.fireCannonball(rightOffset, Math.PI / 2);
    }

    /**
     * Fire a cannonball
     */
    fireCannonball(offset, angleOffset) {
        const cannonball = BABYLON.MeshBuilder.CreateSphere('cannonball', {
            diameter: 0.8
        }, this.scene);

        // Position at boat side
        cannonball.position = this.boat.position.add(offset);
        cannonball.position.y += 2;

        // Material
        const material = new BABYLON.StandardMaterial('cannonballMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        cannonball.material = material;

        // Physics
        cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(
            cannonball,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 8, restitution: 0.2 },
            this.scene
        );

        // Launch direction (perpendicular to boat)
        const launchAngle = this.boat.rotation.y + angleOffset;
        const direction = new BABYLON.Vector3(
            Math.sin(launchAngle),
            0.3, // Slight upward angle
            Math.cos(launchAngle)
        );

        const velocity = direction.scale(this.cannonballSpeed);
        cannonball.physicsImpostor.setLinearVelocity(velocity);

        // Cleanup after 10 seconds
        setTimeout(() => {
            cannonball.dispose();
        }, 10000);

        // Muzzle flash
        this.createCannonFlash(offset);
    }

    /**
     * Create cannon muzzle flash
     */
    createCannonFlash(offset) {
        const flash = BABYLON.MeshBuilder.CreateSphere('flash', { diameter: 1.5 }, this.scene);
        flash.position = this.boat.position.add(offset);
        flash.position.y += 2;

        const material = new BABYLON.StandardMaterial('flashMat', this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.7, 0);
        flash.material = material;

        setTimeout(() => flash.dispose(), 100);
    }

    /**
     * Drop anchor (stop boat)
     */
    dropAnchor() {
        console.log('⚓ Anchor dropped!');
        this.boatSpeed = 0;
    }

    /**
     * Update method for mount system compatibility
     */
    update(deltaTime, inputMap) {
        if (!this.isPlayerInBoat) return;

        // Use existing update logic
        // The boat already has its own update in the scene.registerBeforeRender
    }
}
