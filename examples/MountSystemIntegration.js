/**
 * MountSystemIntegration.js
 * Complete example of integrating the mount system into GRUDGE WARLORDS
 */

import { MountSystem, MountType } from '../src/vehicles/MountSystem.js';
import { HorseController } from '../src/vehicles/HorseController.js';
import { BoatController } from '../src/vehicles/BoatController.js';
import { FlyingVehicleController } from '../src/vehicles/FlyingVehicleController.js';
import { TurretController } from '../src/vehicles/TurretController.js';
import { MountSkillBarUI } from '../src/ui/MountSkillBarUI.js';

export class MountSystemIntegration {
    constructor(scene, player, hero, camera, engine) {
        this.scene = scene;
        this.player = player;
        this.hero = hero;
        this.camera = camera;
        this.engine = engine;
        
        this.mountSystem = null;
        this.mountUI = null;
        
        console.log('🐴 Initializing Mount System Integration...');
    }

    /**
     * Initialize the complete mount system
     */
    async initialize() {
        // Create mount system
        this.mountSystem = new MountSystem(this.scene, this.player, this.hero, this.camera);
        
        // Register all mount controllers
        this.registerControllers();
        
        // Create UI
        this.mountUI = new MountSkillBarUI(this.scene, this.mountSystem);
        
        // Setup update loop
        this.setupUpdateLoop();
        
        // Create example mounts in the scene
        this.createExampleMounts();
        
        console.log('✅ Mount System Integration complete!');
    }

    /**
     * Register all mount controllers
     */
    registerControllers() {
        // Horse controller
        const horseController = new HorseController(this.scene, this.player, this.camera);
        this.mountSystem.registerController(MountType.HORSE, horseController);
        
        // Boat controller (with water level)
        const waterLevel = 0; // Adjust based on your scene
        const boatController = new BoatController(
            this.scene, 
            null, // Boat mesh will be set on mount
            this.player, 
            this.hero, 
            this.camera, 
            waterLevel
        );
        this.mountSystem.registerController(MountType.BOAT, boatController);
        
        // Flying vehicle controller
        const flyingController = new FlyingVehicleController(this.scene, this.player, this.camera);
        this.mountSystem.registerController(MountType.FLYING, flyingController);
        
        // Turret controller
        const turretController = new TurretController(this.scene, this.player, this.camera);
        this.mountSystem.registerController(MountType.TURRET, turretController);
        
        console.log('✅ All mount controllers registered');
    }

    /**
     * Setup update loop
     */
    setupUpdateLoop() {
        this.scene.registerBeforeRender(() => {
            const deltaTime = this.engine.getDeltaTime() / 1000;
            
            // Update mount system
            if (this.mountSystem) {
                this.mountSystem.update(deltaTime);
            }
            
            // Update UI
            if (this.mountUI) {
                this.mountUI.update();
            }
        });
    }

    /**
     * Create example mounts in the scene
     */
    createExampleMounts() {
        // Create a horse
        this.createHorse(new BABYLON.Vector3(10, 0, 10));
        
        // Create a boat
        this.createBoat(new BABYLON.Vector3(50, 0, 50));
        
        // Create a flying mount
        this.createFlyingMount(new BABYLON.Vector3(-10, 5, -10));
        
        // Create a turret
        this.createTurret(new BABYLON.Vector3(-50, 0, -50));
        
        console.log('✅ Example mounts created');
    }

    /**
     * Create a horse mount
     */
    createHorse(position) {
        // Create horse mesh (placeholder - replace with actual model)
        const horse = BABYLON.MeshBuilder.CreateBox('horse', {
            width: 2,
            height: 2,
            depth: 3
        }, this.scene);
        
        horse.position = position;
        
        // Material
        const material = new BABYLON.StandardMaterial('horseMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
        horse.material = material;
        
        // Tag as mount
        horse.metadata = {
            mountType: MountType.HORSE,
            mountData: {
                name: 'War Horse',
                speed: 20
            },
            isGround: false
        };
        
        // Add interaction prompt
        this.addMountPrompt(horse, '🐴 Press F to mount horse');
        
        return horse;
    }

    /**
     * Create a boat mount
     */
    createBoat(position) {
        // Create boat mesh (placeholder - replace with actual model)
        const boat = BABYLON.MeshBuilder.CreateBox('boat', {
            width: 4,
            height: 2,
            depth: 8
        }, this.scene);
        
        boat.position = position;
        boat.position.y = 0; // Water level
        
        // Material
        const material = new BABYLON.StandardMaterial('boatMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        horse.material = material;
        
        // Tag as mount
        boat.metadata = {
            mountType: MountType.BOAT,
            mountData: {
                name: 'Warship',
                cannons: true
            },
            isGround: false
        };
        
        // Add interaction prompt
        this.addMountPrompt(boat, '⛵ Press F to board boat');
        
        return boat;
    }

    /**
     * Create a flying mount
     */
    createFlyingMount(position) {
        // Create flying mount mesh (placeholder - replace with dragon/airship model)
        const flying = BABYLON.MeshBuilder.CreateBox('flyingMount', {
            width: 3,
            height: 2,
            depth: 5
        }, this.scene);

        flying.position = position;

        // Material
        const material = new BABYLON.StandardMaterial('flyingMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.8);
        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.4);
        flying.material = material;

        // Tag as mount
        flying.metadata = {
            mountType: MountType.FLYING,
            mountData: {
                name: 'Dragon',
                maxAltitude: 200
            },
            isGround: false
        };

        // Add interaction prompt
        this.addMountPrompt(flying, '🦅 Press F to mount dragon');

        return flying;
    }

    /**
     * Create a turret mount
     */
    createTurret(position) {
        // Create turret mesh (placeholder - replace with actual model)
        const turret = BABYLON.MeshBuilder.CreateCylinder('turret', {
            height: 3,
            diameter: 2
        }, this.scene);

        turret.position = position;

        // Material
        const material = new BABYLON.StandardMaterial('turretMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        material.metallic = 0.8;
        turret.material = material;

        // Tag as mount
        turret.metadata = {
            mountType: MountType.TURRET,
            mountData: {
                name: 'Cannon Turret',
                rotationRange: 180
            },
            isGround: false
        };

        // Add interaction prompt
        this.addMountPrompt(turret, '💣 Press F to man turret');

        return turret;
    }

    /**
     * Add interaction prompt to mount
     */
    addMountPrompt(mount, text) {
        // Create floating text above mount
        const plane = BABYLON.MeshBuilder.CreatePlane('prompt', { size: 2 }, this.scene);
        plane.position = mount.position.clone();
        plane.position.y += 3;
        plane.parent = mount;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        // Create dynamic texture for text
        const texture = new BABYLON.DynamicTexture('promptTexture', 512, this.scene);
        const material = new BABYLON.StandardMaterial('promptMat', this.scene);
        material.diffuseTexture = texture;
        material.emissiveTexture = texture;
        material.opacityTexture = texture;
        material.backFaceCulling = false;
        plane.material = material;

        // Draw text
        texture.drawText(text, null, null, 'bold 48px Arial', 'white', 'transparent', true);

        // Hide by default, show when player is near
        plane.isVisible = false;

        // Check distance to player
        this.scene.registerBeforeRender(() => {
            if (!mount || !this.player) return;

            const distance = BABYLON.Vector3.Distance(mount.position, this.player.position);
            plane.isVisible = distance <= 5 && !this.mountSystem.isMounted();
        });
    }

    /**
     * Get mount system instance
     */
    getMountSystem() {
        return this.mountSystem;
    }

    /**
     * Get mount UI instance
     */
    getMountUI() {
        return this.mountUI;
    }

    /**
     * Dispose mount system
     */
    dispose() {
        if (this.mountSystem) {
            this.mountSystem.dispose();
        }
        if (this.mountUI) {
            this.mountUI.dispose();
        }
        console.log('🗑️ Mount System Integration disposed');
    }
}

// Example usage:
/*
import { MountSystemIntegration } from './examples/MountSystemIntegration.js';

// In your game initialization:
const mountIntegration = new MountSystemIntegration(scene, player, hero, camera, engine);
await mountIntegration.initialize();

// Access mount system:
const mountSystem = mountIntegration.getMountSystem();

// Manually mount a specific vehicle:
mountSystem.mount(MountType.HORSE, horseMesh, { speed: 25 });

// Check if mounted:
if (mountSystem.isMounted()) {
    console.log('Currently mounted on:', mountSystem.getCurrentMountType());
}

// Use a skill:
mountSystem.useSkill(0); // Use first skill

// Dismount:
mountSystem.dismount();
*/

