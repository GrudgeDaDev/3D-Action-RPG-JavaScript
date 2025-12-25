/**
 * MountSystem.js
 * Unified mount system for boats, flying vehicles, horses, and turrets
 * Supports mount-specific skills and abilities
 */

export const MountType = {
    NONE: 'none',
    HORSE: 'horse',
    BOAT: 'boat',
    FLYING: 'flying',
    TURRET: 'turret'
};

export const MountState = {
    UNMOUNTED: 'unmounted',
    MOUNTING: 'mounting',
    MOUNTED: 'mounted',
    DISMOUNTING: 'dismounting'
};

export class MountSystem {
    constructor(scene, player, hero, camera) {
        this.scene = scene;
        this.player = player;
        this.hero = hero;
        this.camera = camera;
        
        // Mount state
        this.currentMount = null;
        this.mountType = MountType.NONE;
        this.mountState = MountState.UNMOUNTED;
        this.mountSkills = [];
        
        // Mount controllers
        this.controllers = new Map();
        
        // Input
        this.inputMap = {};
        this.setupInput();
        
        // Events
        this.onMountChange = null;
        this.onSkillUse = null;
        
        console.log('🐴 Mount System initialized');
    }

    /**
     * Setup input handlers
     */
    setupInput() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                this.inputMap[key] = true;
                
                // Mount/Dismount with 'F' key
                if (key === 'f') {
                    this.toggleMount();
                }
                
                // Mount skills (1-6 keys)
                if (key >= '1' && key <= '6') {
                    const skillIndex = parseInt(key) - 1;
                    this.useSkill(skillIndex);
                }
            } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
                this.inputMap[key] = false;
            }
        });
    }

    /**
     * Register a mount controller
     */
    registerController(mountType, controller) {
        this.controllers.set(mountType, controller);
        console.log(`✅ Registered ${mountType} controller`);
    }

    /**
     * Mount a vehicle/animal
     */
    mount(mountType, mountMesh, mountData = {}) {
        if (this.mountState !== MountState.UNMOUNTED) {
            console.warn('Already mounted or mounting');
            return false;
        }

        console.log(`🐴 Mounting ${mountType}...`);
        this.mountState = MountState.MOUNTING;
        
        const controller = this.controllers.get(mountType);
        if (!controller) {
            console.error(`No controller registered for ${mountType}`);
            this.mountState = MountState.UNMOUNTED;
            return false;
        }

        // Initialize controller
        controller.mount(mountMesh, mountData);
        
        this.currentMount = mountMesh;
        this.mountType = mountType;
        this.mountState = MountState.MOUNTED;
        
        // Load mount-specific skills
        this.loadMountSkills(mountType);
        
        // Hide player hero
        this.hero.setEnabled(false);
        
        // Notify listeners
        if (this.onMountChange) {
            this.onMountChange(mountType, true);
        }
        
        console.log(`✅ Mounted ${mountType}`);
        return true;
    }

    /**
     * Dismount current mount
     */
    dismount() {
        if (this.mountState !== MountState.MOUNTED) {
            return false;
        }

        console.log(`🐴 Dismounting ${this.mountType}...`);
        this.mountState = MountState.DISMOUNTING;
        
        const controller = this.controllers.get(this.mountType);
        if (controller) {
            controller.dismount();
        }
        
        // Show player hero
        this.hero.setEnabled(true);
        
        // Clear mount data
        const previousType = this.mountType;
        this.currentMount = null;
        this.mountType = MountType.NONE;
        this.mountState = MountState.UNMOUNTED;
        this.mountSkills = [];
        
        // Notify listeners
        if (this.onMountChange) {
            this.onMountChange(previousType, false);
        }
        
        console.log(`✅ Dismounted`);
        return true;
    }

    /**
     * Toggle mount/dismount
     */
    toggleMount() {
        if (this.mountState === MountState.MOUNTED) {
            this.dismount();
        } else if (this.mountState === MountState.UNMOUNTED) {
            // Try to find nearby mount
            this.findAndMountNearby();
        }
    }

    /**
     * Find and mount nearby vehicle/animal
     */
    findAndMountNearby() {
        const interactionDistance = 5;
        const playerPos = this.player.position;

        // Check for nearby mounts (tagged meshes)
        const nearbyMounts = this.scene.meshes.filter(mesh => {
            if (!mesh.metadata || !mesh.metadata.mountType) return false;
            const distance = BABYLON.Vector3.Distance(playerPos, mesh.position);
            return distance <= interactionDistance;
        });

        if (nearbyMounts.length > 0) {
            const mount = nearbyMounts[0];
            this.mount(mount.metadata.mountType, mount, mount.metadata.mountData || {});
        } else {
            console.log('No mounts nearby');
        }
    }

    /**
     * Load mount-specific skills
     */
    loadMountSkills(mountType) {
        this.mountSkills = this.getMountSkillsForType(mountType);
        console.log(`📜 Loaded ${this.mountSkills.length} skills for ${mountType}`);
    }

    /**
     * Get skills for mount type
     */
    getMountSkillsForType(mountType) {
        const skillSets = {
            [MountType.HORSE]: [
                { id: 'gallop', name: 'Gallop', icon: '🏃', cooldown: 10, description: 'Sprint forward at high speed' },
                { id: 'rear', name: 'Rear', icon: '🐴', cooldown: 15, description: 'Rear up and knock back enemies' },
                { id: 'trample', name: 'Trample', icon: '💥', cooldown: 20, description: 'Charge through enemies' }
            ],
            [MountType.BOAT]: [
                { id: 'sail_boost', name: 'Full Sail', icon: '⛵', cooldown: 15, description: 'Boost sailing speed' },
                { id: 'cannon_left', name: 'Port Cannon', icon: '💣', cooldown: 5, description: 'Fire left cannons' },
                { id: 'cannon_right', name: 'Starboard Cannon', icon: '💣', cooldown: 5, description: 'Fire right cannons' },
                { id: 'anchor', name: 'Drop Anchor', icon: '⚓', cooldown: 0, description: 'Stop the boat' }
            ],
            [MountType.FLYING]: [
                { id: 'ascend', name: 'Ascend', icon: '⬆️', cooldown: 0, description: 'Fly higher' },
                { id: 'descend', name: 'Descend', icon: '⬇️', cooldown: 0, description: 'Fly lower' },
                { id: 'barrel_roll', name: 'Barrel Roll', icon: '🌀', cooldown: 10, description: 'Evasive maneuver' },
                { id: 'dive_bomb', name: 'Dive Bomb', icon: '💥', cooldown: 20, description: 'Dive attack' }
            ],
            [MountType.TURRET]: [
                { id: 'fire_cannon', name: 'Fire Cannon', icon: '💥', cooldown: 2, description: 'Fire cannonball' },
                { id: 'explosive_shot', name: 'Explosive Shot', icon: '💣', cooldown: 10, description: 'AoE explosion' },
                { id: 'rapid_fire', name: 'Rapid Fire', icon: '🔥', cooldown: 15, description: 'Fire multiple shots' },
                { id: 'rotate_left', name: 'Rotate Left', icon: '↶', cooldown: 0, description: 'Turn turret left' },
                { id: 'rotate_right', name: 'Rotate Right', icon: '↷', cooldown: 0, description: 'Turn turret right' }
            ]
        };

        return skillSets[mountType] || [];
    }

    /**
     * Use a mount skill
     */
    useSkill(skillIndex) {
        if (this.mountState !== MountState.MOUNTED) {
            return false;
        }

        if (skillIndex < 0 || skillIndex >= this.mountSkills.length) {
            return false;
        }

        const skill = this.mountSkills[skillIndex];

        // Check cooldown
        if (skill.lastUsed && Date.now() - skill.lastUsed < skill.cooldown * 1000) {
            console.log(`Skill ${skill.name} on cooldown`);
            return false;
        }

        console.log(`⚡ Using skill: ${skill.name}`);

        // Execute skill through controller
        const controller = this.controllers.get(this.mountType);
        if (controller && controller.useSkill) {
            controller.useSkill(skill.id, skill);
        }

        // Update cooldown
        skill.lastUsed = Date.now();

        // Notify listeners
        if (this.onSkillUse) {
            this.onSkillUse(skill, skillIndex);
        }

        return true;
    }

    /**
     * Update mount system
     */
    update(deltaTime) {
        if (this.mountState === MountState.MOUNTED) {
            const controller = this.controllers.get(this.mountType);
            if (controller && controller.update) {
                controller.update(deltaTime, this.inputMap);
            }
        }
    }

    /**
     * Check if currently mounted
     */
    isMounted() {
        return this.mountState === MountState.MOUNTED;
    }

    /**
     * Get current mount type
     */
    getCurrentMountType() {
        return this.mountType;
    }

    /**
     * Get current mount skills
     */
    getMountSkills() {
        return this.mountSkills;
    }

    /**
     * Dispose mount system
     */
    dispose() {
        if (this.isMounted()) {
            this.dismount();
        }
        this.controllers.clear();
        console.log('🗑️ Mount System disposed');
    }
}

