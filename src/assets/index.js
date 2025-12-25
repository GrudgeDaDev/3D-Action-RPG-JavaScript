/**
 * Asset Management System - Main Entry Point
 * Exports all asset management functionality
 */

// Core Asset Library
export { AssetLibrary, getAssetLibrary } from './AssetLibrary.js';

// Specialized Managers
export { EnemyManager, getEnemyManager } from './EnemyManager.js';
export { CharacterManager, getCharacterManager } from './CharacterManager.js';
export { AnimationManager, getAnimationManager } from './AnimationManager.js';

// UI Components
export { AssetBrowser, getAssetBrowser } from '../ui/AssetBrowser.js';
export { default as DragDropImport } from '../ui/DragDropImport.js';

/**
 * Initialize the complete asset management system
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {Object} options - Configuration options
 * @returns {Object} All initialized managers and UI components
 */
export function initAssetSystem(scene, options = {}) {
    const {
        enableDragDrop = true,
        enableBrowser = true,
        onAssetImport = () => {},
        onAssetSelect = () => {}
    } = options;

    // Initialize core library
    const assetLibrary = getAssetLibrary();
    
    // Initialize specialized managers
    const enemyManager = getEnemyManager(scene);
    const characterManager = getCharacterManager(scene);
    const animationManager = getAnimationManager(scene);
    
    // Initialize UI components
    let dragDropImport = null;
    let assetBrowser = null;
    
    if (enableDragDrop) {
        const { default: DragDropImport } = require('../ui/DragDropImport.js');
        dragDropImport = new DragDropImport(scene, {
            onImport: onAssetImport
        });
    }
    
    if (enableBrowser) {
        const { getAssetBrowser } = require('../ui/AssetBrowser.js');
        assetBrowser = getAssetBrowser({
            onSelect: onAssetSelect,
            onImport: async (file, category) => {
                await assetLibrary.importFromFile(scene, file, category);
            }
        });
    }

    // Setup keyboard shortcut for asset browser (B key)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'b' && e.ctrlKey && assetBrowser) {
            e.preventDefault();
            assetBrowser.toggle();
        }
    });

    console.log('🎮 Asset Management System initialized');
    console.log('   - Asset Library: ✅');
    console.log('   - Enemy Manager: ✅');
    console.log('   - Character Manager: ✅');
    console.log('   - Animation Manager: ✅');
    console.log('   - Drag & Drop: ' + (dragDropImport ? '✅' : '❌'));
    console.log('   - Asset Browser: ' + (assetBrowser ? '✅ (Ctrl+B to open)' : '❌'));

    return {
        assetLibrary,
        enemyManager,
        characterManager,
        animationManager,
        dragDropImport,
        assetBrowser,
        
        // Convenience methods
        loadModel: (category, id) => assetLibrary.loadModel(scene, category, id),
        spawnEnemy: (id, position) => enemyManager.spawn(id, position),
        spawnCharacter: (id, position) => characterManager.spawn(id, position),
        
        // Open browser
        openBrowser: () => assetBrowser?.open(),
        
        // Export/Import all data
        exportAll: () => ({
            assets: assetLibrary.exportAll(),
            enemies: enemyManager.exportConfigs(),
            characters: characterManager.exportConfigs(),
            animations: animationManager.exportConfigs()
        }),
        
        importAll: (data) => {
            if (data.assets) assetLibrary.importAll(data.assets);
            if (data.enemies) enemyManager.importConfigs(data.enemies);
            if (data.characters) characterManager.importConfigs(data.characters);
            if (data.animations) animationManager.importConfigs(data.animations);
        }
    };
}

/**
 * Quick setup for builder mode
 */
export function setupBuilderAssets(scene, tools) {
    const system = initAssetSystem(scene, {
        enableDragDrop: true,
        enableBrowser: true,
        onAssetSelect: (asset) => {
            // When asset selected in browser, activate model placement tool
            if (tools?.tools?.models) {
                tools.tools.models.selectModel(asset.category, asset.id);
                tools.setSelectedTool('models');
            }
        }
    });
    
    return system;
}

// Re-import for default export
import { getAssetLibrary as _getAssetLibrary } from './AssetLibrary.js';
import { getEnemyManager as _getEnemyManager } from './EnemyManager.js';
import { getCharacterManager as _getCharacterManager } from './CharacterManager.js';
import { getAnimationManager as _getAnimationManager } from './AnimationManager.js';

export default {
    initAssetSystem,
    setupBuilderAssets,
    getAssetLibrary: _getAssetLibrary,
    getEnemyManager: _getEnemyManager,
    getCharacterManager: _getCharacterManager,
    getAnimationManager: _getAnimationManager
};
