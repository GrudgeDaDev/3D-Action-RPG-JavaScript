/**
 * SettingsManager - Syncs settings between game and admin panel
 * Handles: Audio, Video Quality, Hotkeys, Controls, Gameplay preferences
 */

export class SettingsManager {
    static instance = null;

    constructor() {
        if (SettingsManager.instance) {
            return SettingsManager.instance;
        }

        this.settings = {};
        this.listeners = new Map();
        this.syncInterval = null;
        this.storageKey = 'game_settings';
        
        SettingsManager.instance = this;
    }

    static getInstance() {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    /**
     * Initialize settings from config file and localStorage
     */
    async initialize() {
        try {
            // Load default settings from config
            const response = await fetch('../config/settings.json');
            const defaultSettings = await response.json();
            
            // Load saved settings from localStorage
            const savedSettings = this.loadFromLocalStorage();
            
            // Merge: saved settings override defaults
            this.settings = this.deepMerge(defaultSettings, savedSettings);
            
            console.log('✅ Settings initialized:', this.settings);
            
            // Start sync with admin panel
            this.startSync();
            
            // Apply settings immediately
            this.applyAllSettings();
            
            return this.settings;
        } catch (error) {
            console.error('❌ Failed to initialize settings:', error);
            this.settings = this.getDefaultSettings();
            return this.settings;
        }
    }

    /**
     * Get a setting value by path (e.g., 'audio.masterVolume')
     */
    get(path) {
        const keys = path.split('.');
        let value = this.settings;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    /**
     * Set a setting value by path
     */
    set(path, value) {
        const keys = path.split('.');
        let obj = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = obj[lastKey];
        obj[lastKey] = value;
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Notify listeners
        this.notifyListeners(path, value, oldValue);
        
        // Apply the setting
        this.applySetting(path, value);
        
        console.log(`⚙️ Setting changed: ${path} = ${value}`);
    }

    /**
     * Listen for setting changes
     */
    on(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
    }

    /**
     * Notify listeners of changes
     */
    notifyListeners(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
        
        // Also notify wildcard listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                callback(path, newValue, oldValue);
            });
        }
    }

    /**
     * Save settings to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('❌ Failed to save settings to localStorage:', error);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('❌ Failed to load settings from localStorage:', error);
            return {};
        }
    }

    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Apply a specific setting
     */
    applySetting(path, value) {
        // Audio settings
        if (path.startsWith('audio.')) {
            this.applyAudioSetting(path, value);
        }
        // Video settings
        else if (path.startsWith('video.')) {
            this.applyVideoSetting(path, value);
        }
        // Hotkey settings
        else if (path.startsWith('hotkeys.')) {
            this.applyHotkeySetting(path, value);
        }
        // Control settings
        else if (path.startsWith('controls.')) {
            this.applyControlSetting(path, value);
        }
    }

    /**
     * Apply all settings
     */
    applyAllSettings() {
        // Apply audio
        if (this.settings.audio) {
            Object.keys(this.settings.audio).forEach(key => {
                this.applyAudioSetting(`audio.${key}`, this.settings.audio[key]);
            });
        }

        // Apply video
        if (this.settings.video) {
            Object.keys(this.settings.video).forEach(key => {
                this.applyVideoSetting(`video.${key}`, this.settings.video[key]);
            });
        }
    }

    /**
     * Apply audio setting
     */
    applyAudioSetting(path, value) {
        if (window.AUDIO_MANAGER) {
            const key = path.split('.')[1];

            if (key === 'masterVolume') {
                window.AUDIO_MANAGER.masterVolume = value;
            } else if (key === 'musicVolume') {
                window.AUDIO_MANAGER.musicVolume = value;
            } else if (key === 'sfxVolume') {
                window.AUDIO_MANAGER.sfxVolume = value;
            } else if (key === 'muted') {
                window.AUDIO_MANAGER.isMuted = value;
            }
        }
    }

    /**
     * Apply video setting
     */
    applyVideoSetting(path, value) {
        const scene = window.CURRENT_SCENE;
        if (!scene) return;

        const key = path.split('.')[1];

        if (key === 'msaa') {
            scene.getEngine().setHardwareScalingLevel(1 / value);
        } else if (key === 'shadows') {
            // Toggle shadows
            scene.lights.forEach(light => {
                if (light.getShadowGenerator) {
                    const shadowGen = light.getShadowGenerator();
                    if (shadowGen) {
                        shadowGen.enabled = value;
                    }
                }
            });
        } else if (key === 'renderScale') {
            scene.getEngine().setHardwareScalingLevel(1 / value);
        }
    }

    /**
     * Apply hotkey setting
     */
    applyHotkeySetting(path, value) {
        // Hotkeys are applied by the input system
        // Just notify that hotkeys changed
        console.log(`🎮 Hotkey updated: ${path} = ${value}`);
    }

    /**
     * Apply control setting
     */
    applyControlSetting(path, value) {
        const camera = window.CURRENT_SCENE?.activeCamera;
        if (!camera) return;

        const key = path.split('.')[1];

        if (key === 'mouseSensitivity') {
            camera.angularSensibility = 1000 / value;
        } else if (key === 'invertY') {
            camera.invertY = value;
        }
    }

    /**
     * Start syncing with admin panel via localStorage
     */
    startSync() {
        // Listen for storage events (changes from admin panel)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                const newSettings = JSON.parse(e.newValue);
                this.settings = newSettings;
                this.applyAllSettings();
                console.log('🔄 Settings synced from admin panel');
            }
        });

        // Periodic sync check
        this.syncInterval = setInterval(() => {
            const saved = this.loadFromLocalStorage();
            if (JSON.stringify(saved) !== JSON.stringify(this.settings)) {
                this.settings = saved;
                this.applyAllSettings();
                console.log('🔄 Settings synced');
            }
        }, 1000);
    }

    /**
     * Stop syncing
     */
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.5,
                sfxVolume: 0.7,
                muted: false
            },
            video: {
                quality: 'high',
                msaa: 4,
                shadows: true,
                bloom: true
            },
            controls: {
                mouseSensitivity: 1.0,
                invertY: false
            },
            hotkeys: {}
        };
    }

    /**
     * Reset to defaults
     */
    resetToDefaults() {
        this.settings = this.getDefaultSettings();
        this.saveToLocalStorage();
        this.applyAllSettings();
        console.log('🔄 Settings reset to defaults');
    }

    /**
     * Export settings as JSON
     */
    export() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Import settings from JSON
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = imported;
            this.saveToLocalStorage();
            this.applyAllSettings();
            console.log('✅ Settings imported successfully');
        } catch (error) {
            console.error('❌ Failed to import settings:', error);
        }
    }
}

