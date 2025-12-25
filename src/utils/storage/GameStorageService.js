/**
 * GameStorageService - Hybrid local/cloud storage for game data
 * Adapted from Grudge-PlayGround's CharacterStorageService
 * 
 * Features:
 * - Automatic local caching (localStorage)
 * - Cloud sync when user is signed in
 * - Conflict resolution (newest wins)
 * - Offline-first design
 * 
 * Usage:
 *   import { gameStorage } from './storage/GameStorageService.js';
 *   
 *   // Save character data
 *   await gameStorage.saveCharacter('hero1', characterData);
 *   
 *   // Load character data
 *   const { data, source } = await gameStorage.loadCharacter('hero1');
 *   console.log(`Loaded from ${source}`); // 'local' or 'cloud'
 */

import puterService from '../cloud/PuterService.js';

export class GameStorageService {
    constructor() {
        this.cachePrefix = 'rpg_';
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.syncInterval = 30000; // 30 seconds
    }

    /**
     * Check if cloud storage is available
     * @returns {boolean} True if cloud is available
     */
    get isCloudAvailable() {
        return puterService.isConnected && puterService.isAvailable;
    }

    /**
     * Get current user ID
     * @returns {string} User ID or 'local'
     */
    getUserId() {
        return puterService.getUserId();
    }

    /**
     * Generate storage key
     * @param {string} type - Data type (e.g., 'character', 'progress')
     * @param {string} id - Item ID
     * @returns {string} Storage key
     */
    getStorageKey(type, id = 'default') {
        return `game:${this.getUserId()}:${type}:${id}`;
    }

    /**
     * Save character data
     * @param {string} characterId - Character ID
     * @param {Object} data - Character data
     * @returns {Promise<Object>} Save result
     */
    async saveCharacter(characterId, data) {
        const key = this.getStorageKey('character', characterId);
        const saveData = {
            ...data,
            lastModified: Date.now(),
            version: 1
        };

        // Always save to localStorage first
        localStorage.setItem(`${this.cachePrefix}char_${characterId}`, JSON.stringify(saveData));

        // Try to sync to cloud if available
        if (this.isCloudAvailable) {
            try {
                await puterService.kvSet(key, saveData);
                console.log('[GameStorage] Character synced to cloud:', characterId);
                return { synced: true, local: true };
            } catch (error) {
                console.warn('[GameStorage] Cloud sync failed, saved locally:', error);
                return { synced: false, local: true };
            }
        }

        return { synced: false, local: true };
    }

    /**
     * Load character data
     * @param {string} characterId - Character ID
     * @returns {Promise<Object>} Load result with data and source
     */
    async loadCharacter(characterId) {
        const localKey = `${this.cachePrefix}char_${characterId}`;
        const localData = localStorage.getItem(localKey);
        let local = localData ? JSON.parse(localData) : null;

        // Try to load from cloud if available
        if (this.isCloudAvailable) {
            try {
                const key = this.getStorageKey('character', characterId);
                const cloudData = await puterService.kvGet(key);

                if (cloudData) {
                    // Use newest data (conflict resolution)
                    if (!local || cloudData.lastModified > local.lastModified) {
                        localStorage.setItem(localKey, JSON.stringify(cloudData));
                        console.log('[GameStorage] Loaded character from cloud:', characterId);
                        return { data: cloudData, source: 'cloud' };
                    }
                }
            } catch (error) {
                console.warn('[GameStorage] Cloud load failed:', error);
            }
        }

        return { data: local, source: 'local' };
    }

    /**
     * Save game progress
     * @param {Object} progress - Progress data
     * @returns {Promise<Object>} Save result
     */
    async saveProgress(progress) {
        const key = this.getStorageKey('progress', 'main');
        const saveData = {
            ...progress,
            lastModified: Date.now(),
            version: 1
        };

        localStorage.setItem(`${this.cachePrefix}progress`, JSON.stringify(saveData));

        if (this.isCloudAvailable) {
            try {
                await puterService.kvSet(key, saveData);
                return { synced: true, local: true };
            } catch (error) {
                console.warn('[GameStorage] Progress cloud sync failed:', error);
                return { synced: false, local: true };
            }
        }

        return { synced: false, local: true };
    }

    /**
     * Load game progress
     * @returns {Promise<Object>} Load result with data and source
     */
    async loadProgress() {
        const localKey = `${this.cachePrefix}progress`;
        const localData = localStorage.getItem(localKey);
        let local = localData ? JSON.parse(localData) : null;

        if (this.isCloudAvailable) {
            try {
                const key = this.getStorageKey('progress', 'main');
                const cloudData = await puterService.kvGet(key);

                if (cloudData) {
                    if (!local || cloudData.lastModified > local.lastModified) {
                        localStorage.setItem(localKey, JSON.stringify(cloudData));
                        return { data: cloudData, source: 'cloud' };
                    }
                }
            } catch (error) {
                console.warn('[GameStorage] Progress cloud load failed:', error);
            }
        }

        return { data: local, source: 'local' };
    }

    /**
     * List all saved characters
     * @returns {Promise<Array>} Array of character summaries
     */
    async listCharacters() {
        const characters = [];

        // Get from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${this.cachePrefix}char_`)) {
                const charId = key.replace(`${this.cachePrefix}char_`, '');
                const data = JSON.parse(localStorage.getItem(key));
                characters.push({
                    id: charId,
                    name: data.name || charId,
                    level: data.level || 1,
                    lastModified: data.lastModified || 0
                });
            }
        }

        // Merge with cloud data if available
        if (this.isCloudAvailable) {
            try {
                const keys = await puterService.kvList(`game:${this.getUserId()}:character:`);

                for (const key of keys) {
                    const charId = key.split(':')[3];
                    if (!characters.find(c => c.id === charId)) {
                        const data = await puterService.kvGet(key);
                        if (data) {
                            characters.push({
                                id: charId,
                                name: data.name || charId,
                                level: data.level || 1,
                                lastModified: data.lastModified || 0
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn('[GameStorage] Failed to list cloud characters:', error);
            }
        }

        return characters.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    }

    /**
     * Delete a character
     * @param {string} characterId - Character ID
     */
    async deleteCharacter(characterId) {
        localStorage.removeItem(`${this.cachePrefix}char_${characterId}`);

        if (this.isCloudAvailable) {
            try {
                await puterService.kvDel(this.getStorageKey('character', characterId));
                console.log('[GameStorage] Character deleted from cloud:', characterId);
            } catch (error) {
                console.warn('[GameStorage] Cloud delete failed:', error);
            }
        }
    }

    /**
     * Export character data as JSON
     * @param {string} characterId - Character ID
     * @returns {Promise<Object>} Exported data
     */
    async exportCharacter(characterId) {
        const { data } = await this.loadCharacter(characterId);
        return {
            characterId,
            exportedAt: Date.now(),
            data
        };
    }

    /**
     * Import character data from JSON
     * @param {Object} exportData - Exported character data
     * @param {string} [newCharacterId] - Optional new ID
     * @returns {Promise<string>} Imported character ID
     */
    async importCharacter(exportData, newCharacterId = null) {
        const characterId = newCharacterId || exportData.characterId || 'imported_' + Date.now();
        await this.saveCharacter(characterId, exportData.data);
        return characterId;
    }
}

// Singleton instance
export const gameStorage = new GameStorageService();
export default gameStorage;

