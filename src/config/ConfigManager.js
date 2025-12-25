/**
 * ConfigManager - Centralized configuration management system
 * Singleton pattern for global access to all game configurations
 */
export class ConfigManager {
  static instance = null;
  
  constructor(configPath = './config/') {
    if (ConfigManager.instance) {
      return ConfigManager.instance;
    }
    
    this.configPath = configPath;
    this.configs = {};
    this.schemas = {};
    this.listeners = {};
    this.hotReloadInterval = null;
    this.configHashes = {};
    
    ConfigManager.instance = this;
  }
  
  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  /**
   * Load all configuration files
   */
  async loadAll() {
    const configFiles = [
      'global',
      'combat',
      'movement',
      'character',
      'camera',
      'physics',
      'graphics',
      'builder',
      'scenes',
      'assets',
      'crafting',
      'items'
    ];

    const loadPromises = configFiles.map(name => this.load(name));
    await Promise.all(loadPromises);

    console.log('✅ All configurations loaded successfully');
    return this.configs;
  }
  
  /**
   * Load a specific configuration file
   */
  async load(configName) {
    try {
      const response = await fetch(`${this.configPath}${configName}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${configName}.json: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.configs[configName] = data;
      this.configHashes[configName] = this.hashConfig(data);
      
      console.log(`✅ Loaded config: ${configName}`);
      return data;
    } catch (error) {
      console.error(`❌ Error loading ${configName}.json:`, error);
      // Return empty object as fallback
      this.configs[configName] = {};
      return {};
    }
  }
  
  /**
   * Get configuration value by path (e.g., 'combat.spells.fireball.damage')
   */
  get(path, defaultValue = null) {
    const parts = path.split('.');
    let value = this.configs;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }
  
  /**
   * Set configuration value by path
   */
  set(path, value) {
    const parts = path.split('.');
    const configName = parts[0];
    
    if (!this.configs[configName]) {
      this.configs[configName] = {};
    }
    
    let current = this.configs[configName];
    
    for (let i = 1; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    this.notifyListeners(configName, this.configs[configName]);
  }
  
  /**
   * Save configuration to file (requires server-side support)
   * For now, this exports the config as JSON
   */
  async save(configName) {
    const config = this.configs[configName];
    if (!config) {
      console.error(`Config ${configName} not found`);
      return false;
    }
    
    // In a browser environment, we can't directly write files
    // This would need a server endpoint or download functionality
    console.log(`💾 Config ${configName} ready to save:`, config);
    return config;
  }
  
  /**
   * Export all configurations as a single object
   */
  exportAll() {
    return JSON.parse(JSON.stringify(this.configs));
  }
  
  /**
   * Import configurations from an object
   */
  importAll(configData) {
    for (const [configName, data] of Object.entries(configData)) {
      this.configs[configName] = data;
      this.notifyListeners(configName, data);
    }
    console.log('✅ Configurations imported successfully');
  }

  /**
   * Reset configuration to default (reload from file)
   */
  async reset(configName) {
    await this.load(configName);
    this.notifyListeners(configName, this.configs[configName]);
    console.log(`🔄 Reset config: ${configName}`);
  }

  /**
   * Enable hot-reload (development mode)
   */
  enableHotReload(intervalMs = 2000) {
    if (this.hotReloadInterval) {
      console.warn('Hot-reload already enabled');
      return;
    }

    console.log('🔥 Hot-reload enabled');

    this.hotReloadInterval = setInterval(async () => {
      for (const configName of Object.keys(this.configs)) {
        try {
          const response = await fetch(`${this.configPath}${configName}.json?t=${Date.now()}`);
          if (response.ok) {
            const newConfig = await response.json();
            const newHash = this.hashConfig(newConfig);

            if (newHash !== this.configHashes[configName]) {
              console.log(`🔄 Config changed: ${configName}`);
              this.configs[configName] = newConfig;
              this.configHashes[configName] = newHash;
              this.notifyListeners(configName, newConfig);
            }
          }
        } catch (error) {
          // Silently ignore errors during hot-reload
        }
      }
    }, intervalMs);
  }

  /**
   * Disable hot-reload
   */
  disableHotReload() {
    if (this.hotReloadInterval) {
      clearInterval(this.hotReloadInterval);
      this.hotReloadInterval = null;
      console.log('🔥 Hot-reload disabled');
    }
  }

  /**
   * Subscribe to configuration changes
   */
  onChange(configName, callback) {
    if (!this.listeners[configName]) {
      this.listeners[configName] = [];
    }
    this.listeners[configName].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[configName] = this.listeners[configName].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of a configuration change
   */
  notifyListeners(configName, newConfig) {
    if (this.listeners[configName]) {
      this.listeners[configName].forEach(callback => {
        try {
          callback(newConfig);
        } catch (error) {
          console.error(`Error in config listener for ${configName}:`, error);
        }
      });
    }
  }

  /**
   * Create a simple hash of config for change detection
   */
  hashConfig(config) {
    return JSON.stringify(config);
  }

  /**
   * Validate configuration against schema (basic validation)
   */
  validate(configName, data = null) {
    const configData = data || this.configs[configName];
    if (!configData) {
      return { valid: false, errors: [`Config ${configName} not found`] };
    }

    // Basic validation - can be extended with schemas
    const errors = [];

    // Add custom validation logic here
    // For now, just check if it's an object
    if (typeof configData !== 'object') {
      errors.push(`Config ${configName} must be an object`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get all configuration names
   */
  getConfigNames() {
    return Object.keys(this.configs);
  }

  /**
   * Check if a configuration exists
   */
  has(configName) {
    return configName in this.configs;
  }

  /**
   * Get entire configuration object for a category
   */
  getConfig(configName) {
    return this.configs[configName] || {};
  }
}

