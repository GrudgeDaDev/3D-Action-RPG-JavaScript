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

                    // Register the asset
                    this.register(category, id, {
                        name: id,
                        path: `imported/${file.name}`,
                        type: 'glb',
                        fileSize: file.size,
                        imported: true,
                        hasAnimations: result.animationGroups.length > 0,
                        hasSkeleton: result.skeletons.length > 0,
                        meshCount: result.meshes.length
                    });

                    resolve({
                        id,
                        mesh: rootMesh,
                        skeleton: result.skeletons[0] || null,
                        animationGroups: result.animationGroups || [],
                        meshes: result.meshes
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Save asset library to localStorage
     */
    saveToStorage() {
        const data = {};
        for (const category of this.categories) {
            data[category] = Array.from(this.assets[category].entries());
        }
        localStorage.setItem('assetLibrary', JSON.stringify(data));
    }

    /**
     * Load asset library from localStorage
     */
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('assetLibrary') || '{}');
            for (const category of this.categories) {
                if (data[category]) {
                    this.assets[category] = new Map(data[category]);
                }
            }
        } catch (e) {
            console.warn('Failed to load asset library from storage');
        }
    }

    /**
     * Add change listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove change listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Notify listeners of changes
     */
    notifyListeners(action, category, id, data) {
        for (const listener of this.listeners) {
            listener({ action, category, id, data });
        }
    }

    /**
     * Export library as JSON
     */
    exportJSON() {
        const data = {};
        for (const category of this.categories) {
            data[category] = Array.from(this.assets[category].entries());
        }
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import library from JSON
     */
    importJSON(json) {
        try {
            const data = JSON.parse(json);
            for (const category of this.categories) {
                if (data[category]) {
                    this.assets[category] = new Map(data[category]);
                }
            }
            this.saveToStorage();
            this.notifyListeners('import', null, null, data);
            return true;
        } catch (e) {
            console.error('Failed to import asset library:', e);
            return false;
        }
    }

    /**
     * Get statistics
     */
    getStats() {
        const stats = {};
        for (const category of this.categories) {
            stats[category] = this.assets[category].size;
        }
        stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
        return stats;
    }
}

// Singleton instance
let assetLibraryInstance = null;

export function getAssetLibrary() {
    if (!assetLibraryInstance) {
        assetLibraryInstance = new AssetLibrary();
    }
    return assetLibraryInstance;
}

export default AssetLibrary;

