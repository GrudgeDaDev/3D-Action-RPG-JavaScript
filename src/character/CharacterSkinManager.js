/**
 * Character Skin Manager
 * Manages character skin swapping for testing and customization
 */

export class CharacterSkinManager {
    constructor(scene) {
        this.scene = scene;
        this.skins = new Map();
        this.currentSkinId = null;
        this.modelCache = new Map();
        this.character = null;
        this.currentHero = null;
        this.currentSkeleton = null;
        this.onSkinChangedCallbacks = [];
    }

    /**
     * Load skin configuration from JSON
     */
    async loadSkinConfig() {
        try {
            const response = await fetch('./config/character-skins.json');
            const data = await response.json();
            
            // Store all skins
            Object.values(data.skins).forEach(skin => {
                this.skins.set(skin.id, skin);
            });
            
            // Set default skin
            const defaultSkin = Object.values(data.skins).find(s => s.isDefault);
            if (defaultSkin) {
                this.currentSkinId = defaultSkin.id;
            }
            
            console.log(`✅ Loaded ${this.skins.size} character skins`);
            return true;
        } catch (error) {
            console.error('❌ Failed to load character skins:', error);
            return false;
        }
    }

    /**
     * Get all available skins
     */
    getAllSkins() {
        return Array.from(this.skins.values());
    }

    /**
     * Get skins by category
     */
    getSkinsByCategory(category) {
        return this.getAllSkins().filter(skin => skin.category === category);
    }

    /**
     * Get current skin
     */
    getCurrentSkin() {
        return this.skins.get(this.currentSkinId);
    }

    /**
     * Set character reference
     */
    setCharacter(character) {
        this.character = character;
    }

    /**
     * Load a character skin model
     */
    async loadSkinModel(skinId) {
        const skin = this.skins.get(skinId);
        if (!skin) {
            console.error(`❌ Skin not found: ${skinId}`);
            return null;
        }

        // Check cache first
        if (this.modelCache.has(skinId)) {
            console.log(`📦 Using cached model for ${skin.name}`);
            return this.modelCache.get(skinId);
        }

        console.log(`📥 Loading skin model: ${skin.name}`);

        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                null,
                skin.modelPath,
                skin.fileName,
                this.scene
            );

            const hero = result.meshes[0];
            const skeleton = result.skeletons[0];

            // Store in cache
            this.modelCache.set(skinId, {
                meshes: result.meshes,
                skeleton: skeleton,
                animationGroups: result.animationGroups,
                skin: skin
            });

            console.log(`✅ Loaded ${skin.name} model`);
            return this.modelCache.get(skinId);

        } catch (error) {
            console.error(`❌ Failed to load skin ${skin.name}:`, error);
            return null;
        }
    }

    /**
     * Apply a skin to the character
     */
    async applySkin(skinId, character = null) {
        const targetCharacter = character || this.character;
        if (!targetCharacter) {
            console.error('❌ No character reference set');
            return null;
        }

        const skin = this.skins.get(skinId);
        if (!skin) {
            console.error(`❌ Skin not found: ${skinId}`);
            return null;
        }

        console.log(`🎨 Applying skin: ${skin.name}`);

        // Remove old hero model
        if (this.currentHero) {
            this.currentHero.dispose();
            this.currentHero = null;
        }

        // Load new model
        const modelData = await this.loadSkinModel(skinId);
        if (!modelData) {
            return null;
        }

        // Clone the model
        const hero = modelData.meshes[0].clone(`hero_${skinId}_${Date.now()}`);
        targetCharacter.addChild(hero);

        // Apply scale and position
        hero.scaling.scaleInPlace(skin.scale);
        hero.position.y = skin.positionY;

        // Setup skeleton
        const skeleton = modelData.skeleton;
        if (skeleton) {
            const rootBone = skeleton.bones[0];
            rootBone.animations = [];

            // Negate root motion
            this.scene.onBeforeRenderObservable.add(() => {
                rootBone.position = BABYLON.Vector3.Zero();
                rootBone.rotationQuaternion = BABYLON.Quaternion.Identity();
            });
        }

        // Setup materials
        hero.getChildren()[0]?.getChildren().forEach(mesh => {
            mesh.cameraCollide = false;
            if (mesh.material) {
                mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
            }
        });

        // Update current references
        this.currentHero = hero;
        this.currentSkeleton = skeleton;
        this.currentSkinId = skinId;

        // Save to localStorage
        this.save();

        // Trigger callbacks
        this.onSkinChangedCallbacks.forEach(callback => {
            callback(skinId, skin, hero, skeleton);
        });

        console.log(`✅ Applied skin: ${skin.name}`);

        return {
            hero: hero,
            skeleton: skeleton,
            skinId: skinId,
            animationGroups: modelData.animationGroups
        };
    }

    /**
     * Register callback for skin changes
     */
    onSkinChanged(callback) {
        this.onSkinChangedCallbacks.push(callback);
    }

    /**
     * Save current skin to localStorage
     */
    save() {
        try {
            localStorage.setItem('character_skin', this.currentSkinId);
            console.log(`💾 Saved skin: ${this.currentSkinId}`);
        } catch (error) {
            console.error('❌ Failed to save skin:', error);
        }
    }

    /**
     * Load saved skin from localStorage
     */
    load() {
        try {
            const savedSkin = localStorage.getItem('character_skin');
            if (savedSkin && this.skins.has(savedSkin)) {
                this.currentSkinId = savedSkin;
                console.log(`📥 Loaded saved skin: ${savedSkin}`);
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to load saved skin:', error);
        }
        return false;
    }

    /**
     * Get skin info for UI display
     */
    getSkinInfo(skinId) {
        const skin = this.skins.get(skinId);
        if (!skin) return null;

        return {
            id: skin.id,
            name: skin.name,
            icon: skin.icon,
            category: skin.category,
            isDefault: skin.isDefault || false,
            isCurrent: skinId === this.currentSkinId
        };
    }

    /**
     * Clear model cache
     */
    clearCache() {
        this.modelCache.clear();
        console.log('🗑️ Cleared skin model cache');
    }
}

/**
 * Factory function to create CharacterSkinManager
 */
export function createCharacterSkinManager(scene) {
    return new CharacterSkinManager(scene);
}

