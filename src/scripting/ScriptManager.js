/**
 * ScriptManager - Manages game scripts (JavaScript modules, JSON behaviors)
 * Provides loading, caching, and hot-reload capabilities
 */

export class ScriptManager {
    constructor() {
        this.loadedScripts = new Map();
        this.scriptPaths = {
            behaviors: '/assets/util/scripts/behaviors/',
            abilities: '/assets/util/scripts/abilities/',
            weapons: '/assets/util/scripts/weapons/',
            quests: '/assets/util/scripts/quests/',
            events: '/assets/util/scripts/events/',
            ui: '/assets/util/scripts/ui/',
            core: '/assets/util/scripts/core/'
        };
        this.initialized = false;
        this.hotReloadEnabled = false;
    }

    /**
     * Initialize the script manager
     */
    async init(options = {}) {
        this.hotReloadEnabled = options.hotReload || false;
        
        // Load core scripts
        await this.loadCoreScripts();
        
        this.initialized = true;
        console.log('✅ ScriptManager initialized');
        
        if (this.hotReloadEnabled) {
            console.log('🔥 Hot-reload enabled for scripts');
        }
        
        return this;
    }

    /**
     * Load core utility scripts
     */
    async loadCoreScripts() {
        try {
            await this.loadScript('core', 'utils.js');
            await this.loadScript('core', 'constants.js');
            console.log('✅ Core scripts loaded');
        } catch (error) {
            console.warn('⚠️ Some core scripts not found:', error.message);
        }
    }

    /**
     * Load a script by category and filename
     */
    async loadScript(category, filename) {
        const path = this.scriptPaths[category] + filename;
        const key = `${category}/${filename}`;

        // Return cached if already loaded
        if (this.loadedScripts.has(key) && !this.hotReloadEnabled) {
            return this.loadedScripts.get(key);
        }

        try {
            let scriptData;
            
            // Determine file type and load accordingly
            if (filename.endsWith('.js')) {
                // JavaScript module
                scriptData = await this.loadJavaScriptModule(path, key);
            } else if (filename.endsWith('.json')) {
                // JSON data
                scriptData = await this.loadJSONData(path, key);
            } else {
                throw new Error(`Unsupported file type: ${filename}`);
            }

            const scriptInfo = {
                key,
                category,
                filename,
                path,
                data: scriptData,
                loaded: true,
                loadedAt: new Date().toISOString()
            };

            this.loadedScripts.set(key, scriptInfo);
            console.log(`📜 Loaded script: ${key}`);
            
            return scriptInfo;
        } catch (error) {
            console.error(`❌ Failed to load ${path}:`, error);
            return null;
        }
    }

    /**
     * Load JavaScript module
     */
    async loadJavaScriptModule(path, key) {
        // Add timestamp to bypass cache if hot-reload enabled
        const cacheBuster = this.hotReloadEnabled ? `?t=${Date.now()}` : '';
        const module = await import(path + cacheBuster);
        return module;
    }

    /**
     * Load JSON data
     */
    async loadJSONData(path, key) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Load behavior script
     */
    async loadBehavior(filename) {
        return this.loadScript('behaviors', filename);
    }

    /**
     * Load ability script
     */
    async loadAbility(filename) {
        return this.loadScript('abilities', filename);
    }

    /**
     * Load weapon script
     */
    async loadWeapon(filename) {
        return this.loadScript('weapons', filename);
    }

    /**
     * Load quest script
     */
    async loadQuest(filename) {
        return this.loadScript('quests', filename);
    }

    /**
     * Load event script
     */
    async loadEvent(filename) {
        return this.loadScript('events', filename);
    }

    /**
     * Get loaded script by key
     */
    getScript(key) {
        return this.loadedScripts.get(key);
    }

    /**
     * Get all loaded scripts
     */
    getAllScripts() {
        return Array.from(this.loadedScripts.values());
    }

    /**
     * Get scripts by category
     */
    getScriptsByCategory(category) {
        return this.getAllScripts().filter(script => script.category === category);
    }

    /**
     * Reload a script (useful for hot-reload)
     */
    async reloadScript(key) {
        const script = this.loadedScripts.get(key);
        if (!script) {
            console.error(`Script not found: ${key}`);
            return null;
        }

        console.log(`🔄 Reloading script: ${key}`);
        this.loadedScripts.delete(key);
        return await this.loadScript(script.category, script.filename);
    }

    /**
     * Unload a script
     */
    unloadScript(key) {
        if (this.loadedScripts.has(key)) {
            this.loadedScripts.delete(key);
            console.log(`🗑️ Unloaded script: ${key}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all loaded scripts
     */
    clearAll() {
        this.loadedScripts.clear();
        console.log('🗑️ All scripts cleared');
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        this.clearAll();
        this.initialized = false;
        console.log('✅ ScriptManager disposed');
    }
}

// Singleton instance
export const scriptManager = new ScriptManager();

