/**
 * Tile & Texture Manager
 * Manages building tiles, parts, and textures for procedural generation
 */

export class TileTextureManager {
    constructor(scene) {
        this.scene = scene;
        this.catalog = null;
        this.loadedParts = new Map();
        this.loadedTextures = new Map();
        this.partsModel = null;
    }

    /**
     * Load tile/texture catalog from JSON
     */
    async loadCatalog() {
        try {
            const response = await fetch('./config/tiles-catalog.json');
            this.catalog = await response.json();
            console.log(`✅ Loaded tile/texture catalog v${this.catalog.version}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to load tile/texture catalog:', error);
            return false;
        }
    }

    /**
     * Load building parts model
     */
    async loadBuildingParts() {
        if (!this.catalog) {
            console.error('❌ Catalog not loaded');
            return false;
        }

        const config = this.catalog.buildingParts;
        
        try {
            console.log(`📥 Loading building parts from ${config.source}`);
            
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                null,
                config.source.substring(0, config.source.lastIndexOf('/') + 1),
                config.source.substring(config.source.lastIndexOf('/') + 1),
                this.scene
            );

            this.partsModel = result.meshes[0];
            this.partsModel.name = "building_parts";
            this.partsModel.scaling = new BABYLON.Vector3(config.scale, config.scale, config.scale);
            this.partsModel.position.y = -100; // Hide original
            this.partsModel.setEnabled(false);

            // Index all parts
            this.indexBuildingParts();

            console.log(`✅ Loaded ${this.loadedParts.size} building parts`);
            return true;

        } catch (error) {
            console.error('❌ Failed to load building parts:', error);
            return false;
        }
    }

    /**
     * Index all building parts from the loaded model
     */
    indexBuildingParts() {
        if (!this.partsModel || !this.catalog) return;

        const parts = this.catalog.buildingParts.parts;
        
        // Iterate through all categories
        Object.keys(parts).forEach(category => {
            parts[category].forEach(partConfig => {
                // Find mesh by name
                const mesh = this.partsModel.getChildMeshes().find(
                    m => m.name === partConfig.meshName
                );

                if (mesh) {
                    this.loadedParts.set(partConfig.id, {
                        config: partConfig,
                        mesh: mesh,
                        category: category
                    });
                } else {
                    console.warn(`⚠️ Part not found: ${partConfig.meshName}`);
                }
            });
        });
    }

    /**
     * Get a building part by ID
     */
    getPart(partId) {
        return this.loadedParts.get(partId);
    }

    /**
     * Get all parts in a category
     */
    getPartsByCategory(category) {
        return Array.from(this.loadedParts.values())
            .filter(part => part.category === category);
    }

    /**
     * Get parts by tag
     */
    getPartsByTag(tag) {
        return Array.from(this.loadedParts.values())
            .filter(part => part.config.tags && part.config.tags.includes(tag));
    }

    /**
     * Create an instance of a building part
     */
    createPartInstance(partId, position, options = {}) {
        const part = this.getPart(partId);
        if (!part) {
            console.error(`❌ Part not found: ${partId}`);
            return null;
        }

        // Clone the mesh
        const instance = part.mesh.clone(`${partId}_${Date.now()}`);
        instance.setEnabled(true);
        instance.position = position.clone();

        // Apply position offset if defined
        if (part.config.positionOffset) {
            instance.position.x += part.config.positionOffset.x || 0;
            instance.position.y += part.config.positionOffset.y || 0;
            instance.position.z += part.config.positionOffset.z || 0;
        }

        // Apply rotation if defined
        if (part.config.rotation) {
            instance.rotation = new BABYLON.Vector3(
                part.config.rotation.x || 0,
                part.config.rotation.y || 0,
                part.config.rotation.z || 0
            );
        }

        // Apply custom options
        if (options.rotation) {
            instance.rotation = options.rotation;
        }
        if (options.scaling) {
            instance.scaling = options.scaling;
        }

        // Setup physics if requested
        if (options.physics) {
            new BABYLON.PhysicsAggregate(
                instance,
                BABYLON.PhysicsShapeType.MESH,
                { mass: 0, restitution: 0.0, friction: 1.0 },
                this.scene
            );
        }

        // Setup shadows
        if (options.receiveShadows !== false) {
            instance.receiveShadows = true;
        }

        console.log(`✅ Created instance of ${part.config.name}`);
        return instance;
    }

    /**
     * Load a texture by ID
     */
    async loadTexture(textureId) {
        // Check cache
        if (this.loadedTextures.has(textureId)) {
            return this.loadedTextures.get(textureId);
        }

        if (!this.catalog) {
            console.error('❌ Catalog not loaded');
            return null;
        }

        // Find texture in catalog
        let textureConfig = null;
        let basePath = null;

        // Search in all texture categories
        Object.keys(this.catalog.textures).forEach(category => {
            const categoryData = this.catalog.textures[category];
            
            // Search in textures array
            if (categoryData.textures) {
                const found = categoryData.textures.find(t => t.id === textureId);
                if (found) {
                    textureConfig = found;
                    basePath = categoryData.path;
                }
            }

            // Search in heightmaps array
            if (categoryData.heightmaps) {
                const found = categoryData.heightmaps.find(t => t.id === textureId);
                if (found) {
                    textureConfig = found;
                    basePath = categoryData.path;
                }
            }

            // Search in masks array
            if (categoryData.masks) {
                const found = categoryData.masks.find(t => t.id === textureId);
                if (found) {
                    textureConfig = found;
                    basePath = categoryData.path;
                }
            }
        });

        if (!textureConfig) {
            console.error(`❌ Texture not found: ${textureId}`);
            return null;
        }

        try {
            const texturePath = basePath + textureConfig.file;
            const texture = new BABYLON.Texture(texturePath, this.scene);

            // Apply tiling if defined
            if (textureConfig.tiling) {
                texture.uScale = textureConfig.tiling.u;
                texture.vScale = textureConfig.tiling.v;
            }

            // Cache texture
            this.loadedTextures.set(textureId, {
                texture: texture,
                config: textureConfig
            });

            console.log(`✅ Loaded texture: ${textureConfig.name}`);
            return texture;

        } catch (error) {
            console.error(`❌ Failed to load texture ${textureId}:`, error);
            return null;
        }
    }

    /**
     * Get all available parts
     */
    getAllParts() {
        return Array.from(this.loadedParts.values());
    }

    /**
     * Get all categories
     */
    getCategories() {
        return this.catalog?.categories || [];
    }

    /**
     * Get all tags
     */
    getTags() {
        return this.catalog?.tags || [];
    }

    /**
     * Search parts by name or tag
     */
    searchParts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllParts().filter(part => {
            const nameMatch = part.config.name.toLowerCase().includes(lowerQuery);
            const tagMatch = part.config.tags?.some(tag => 
                tag.toLowerCase().includes(lowerQuery)
            );
            return nameMatch || tagMatch;
        });
    }

    /**
     * Get part info for UI display
     */
    getPartInfo(partId) {
        const part = this.getPart(partId);
        if (!part) return null;

        return {
            id: partId,
            name: part.config.name,
            category: part.category,
            tags: part.config.tags || [],
            meshName: part.config.meshName
        };
    }
}

/**
 * Factory function to create TileTextureManager
 */
export function createTileTextureManager(scene) {
    return new TileTextureManager(scene);
}

