/**
 * Admin Mode - Fly/Noclip mode for game administration
 * Toggle with 'L' key
 * Features: T-pose, fly through walls, set spawn points, NPC placement
 */

export class AdminMode {
    constructor(scene, character, dummyAggregate, hero, camera, anim) {
        this.scene = scene;
        this.character = character;
        this.dummyAggregate = dummyAggregate;
        this.hero = hero;
        this.camera = camera;
        this.anim = anim;
        
        // Admin state
        this.isAdminMode = false;
        this.flySpeed = 150;
        this.fastFlySpeed = 400;
        this.inputMap = {};
        
        // Store original physics state
        this.originalGravityFactor = 20;
        this.originalCollisions = true;
        
        // Saved locations
        this.savedSpawnPoint = null;
        this.savedNpcSpawns = [];
        
        this.setupInput();
        this.createAdminUI();
        this.scene.registerBeforeRender(() => this.update());
        
        // Expose globally
        window.ADMIN = this;
        console.log('🔧 Admin Mode initialized - Press L to toggle');
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.inputMap[key] = true;
            
            // Toggle admin mode with L
            if (key === 'l') {
                this.toggle();
            }
            
            // Admin hotkeys (only in admin mode)
            if (this.isAdminMode) {
                if (key === 'p') this.saveSpawnPoint();
                if (key === 'n') this.saveNpcSpawn();
                if (key === 'g') this.teleportToGround();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.inputMap[e.key.toLowerCase()] = false;
        });
    }
    
    createAdminUI() {
        this.adminPanel = document.createElement('div');
        this.adminPanel.id = 'adminPanel';
        this.adminPanel.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">🔧 ADMIN MODE</div>
            <div>WASD - Fly horizontal</div>
            <div>Space - Fly up | Ctrl - Fly down</div>
            <div>Shift - Fast fly</div>
            <div>P - Save spawn point</div>
            <div>N - Save NPC spawn</div>
            <div>G - Teleport to ground</div>
            <div>L - Exit admin mode</div>
            <hr style="margin: 10px 0; border-color: #666;">
            <div id="adminCoords">Pos: 0, 0, 0</div>
            <div id="adminSpawnInfo">Spawn: Not set</div>
        `;
        this.adminPanel.style.cssText = `
            position: fixed; top: 80px; right: 20px;
            background: rgba(0,0,0,0.9); color: #0f0; padding: 15px;
            border: 2px solid #0f0; border-radius: 8px;
            font-family: 'Courier New', monospace; font-size: 12px;
            z-index: 10000; display: none; min-width: 220px;
            box-shadow: 0 0 20px rgba(0,255,0,0.3);
        `;
        document.body.appendChild(this.adminPanel);
    }
    
    toggle() {
        this.isAdminMode = !this.isAdminMode;
        
        if (this.isAdminMode) {
            this.enterAdminMode();
        } else {
            this.exitAdminMode();
        }
    }
    
    enterAdminMode() {
        console.log('🔧 Entering Admin Mode');
        
        // Disable physics/gravity
        this.dummyAggregate.body.setGravityFactor(0);
        this.dummyAggregate.body.setLinearVelocity(BABYLON.Vector3.Zero());
        
        // Disable collisions on character
        this.character.checkCollisions = false;
        
        // Stop all animations and set T-pose (frame 0 of idle usually)
        this.stopAllAnimations();
        this.setTPose();
        
        // Show admin UI
        this.adminPanel.style.display = 'block';
        
        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('adminModeEnter'));
    }
    
    exitAdminMode() {
        console.log('🔧 Exiting Admin Mode');
        
        // Re-enable physics/gravity
        this.dummyAggregate.body.setGravityFactor(this.originalGravityFactor);
        
        // Re-enable collisions
        this.character.checkCollisions = true;
        
        // Resume idle animation
        if (this.anim && this.anim.BreathingIdle) {
            this.anim.BreathingIdle.play(true);
        }
        
        // Hide admin UI
        this.adminPanel.style.display = 'none';
        
        window.dispatchEvent(new CustomEvent('adminModeExit'));
    }
    
    stopAllAnimations() {
        if (!this.anim) return;
        for (let key in this.anim) {
            if (this.anim[key] && this.anim[key].stop) {
                this.anim[key].stop();
            }
        }
    }
    
    setTPose() {
        // T-pose: arms extended horizontally - achieved by stopping anims at frame 0
        // Most rigs have T-pose as the bind pose
        if (this.anim && this.anim.BreathingIdle) {
            this.anim.BreathingIdle.start(false, 0, 0, 0, false);
            this.anim.BreathingIdle.pause();
        }
    }

