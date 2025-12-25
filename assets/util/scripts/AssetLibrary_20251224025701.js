/**
 * Asset Library System
 * Central management for all game assets: models, enemies, characters, animations
 * Synchronized with admin panel
 */

export class AssetLibrary {
    constructor() {
        this.assets = {
            models: new Map(),
            enemies: new Map(),
            characters: new Map(),
            animations: new Map(),
            environments: new Map(),
            props: new Map()
        };
        
        this.loadedMeshes = new Map();
        this.categories = ['models', 'enemies', 'characters', 'animations', 'environments', 'props'];
        this.listeners = [];
        
        this.loadFromStorage();
    }

    /**
     * Register a new asset
     */
    register(category, id, assetData) {
        if (!this.categories.includes(category)) {
            console.error(`Unknown category: ${category}`);
            return false;
        }

        const asset = {
            id,
            ...assetData,
            dateAdded: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        this.assets[category].set(id, asset);
        this.saveToStorage();
        this.notifyListeners('register', category, id, asset);
        
        console.log(`📦 Registered ${category}/${id}`);
        return true;
    }

    /**
     * Get an asset by category and id
     */
    get(category, id) {
        return this.assets[category]?.get(id);
    }

    /**
     * Get all assets in a category
     */
    getAll(category) {
        return Array.from(this.assets[category]?.values() || []);
    }

    /**
     * Remove an asset
     */
    remove(category, id) {
        const removed = this.assets[category]?.delete(id);
        if (removed) {
            this.saveToStorage();
            this.notifyListeners('remove', category, id);
        }
        return removed;
    }

    /**
     * Update an asset
     */
    update(category, id, updates) {
        const asset = this.assets[category]?.get(id);
        if (asset) {
            Object.assign(asset, updates, { lastModified: new Date().toISOString() });
            this.saveToStorage();
            this.notifyListeners('update', category, id, asset);
            return true;
        }
        return false;
    }

    /**
     * Load a GLB model into the scene
     */
    async loadModel(scene, category, id) {
        const asset = this.get(category, id);
        if (!asset) {
            console.error(`Asset not found: ${category}/${id}`);
            return null;
        }

        const cacheKey = `${category}/${id}`;
        
        // Check if already loaded
        if (this.loadedMeshes.has(cacheKey)) {
            const cached = this.loadedMeshes.get(cacheKey);
            return cached.clone(`${id}_clone_${Date.now()}`);
        }

        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                null,
                asset.path.substring(0, asset.path.lastIndexOf('/') + 1),
                asset.path.substring(asset.path.lastIndexOf('/') + 1),
                scene
            );

            const rootMesh = result.meshes[0];
            rootMesh.name = id;
            rootMesh.setEnabled(false); // Disable template mesh
            
            this.loadedMeshes.set(cacheKey, rootMesh);
            
            return {
                mesh: rootMesh.clone(`${id}_instance`),
                skeleton: result.skeletons[0] || null,
                animationGroups: result.animationGroups || []
            };
        } catch (error) {
            console.error(`Failed to load ${category}/${id}:`, error);
            return null;
        }
    }

    /**
     * Import a GLB file from File object
     */
    async importFromFile(scene, file, category = 'models') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
                    const url = URL.createObjectURL(blob);
                    
                    const result = await BABYLON.SceneLoader.ImportMeshAsync(
                        null, "", url, scene, null, ".glb"
                    );
                    
                    URL.revokeObjectURL(url);
                    
                    const id = file.name.replace('.glb', '').replace('.gltf', '');
                    const rootMesh = result.meshes[0];
                    rootMesh.name = id;

