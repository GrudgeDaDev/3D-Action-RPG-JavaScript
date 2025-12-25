/**
 * PuterService - Cloud integration for Puter.js platform
 * Adapted from Grudge-PlayGround's GrudgeNetworkService
 * 
 * Provides:
 * - User authentication
 * - Cloud key-value storage
 * - File storage
 * - Leaderboards (future)
 * 
 * Setup:
 * 1. Add to index.html: <script src="https://js.puter.com/v2/"></script>
 * 2. Initialize: await puterService.initialize()
 * 3. Sign in: await puterService.signIn()
 * 4. Save data: await puterService.kvSet('myKey', myData)
 */

import { EventEmitter } from '../core/EventEmitter.js';

export class PuterService extends EventEmitter {
    constructor() {
        super();
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
        this.currentUser = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 2000;
        
        this.config = {
            appName: '3D Action RPG',
            appVersion: '1.0.0',
            networkName: 'RPG Network'
        };
    }

    /**
     * Get Puter SDK instance
     * @returns {Object|null} Puter SDK or null if not available
     */
    get puter() {
        if (typeof window !== 'undefined' && typeof window.puter !== 'undefined') {
            return window.puter;
        }
        return null;
    }

    /**
     * Check if Puter SDK is available
     * @returns {boolean} True if Puter is available
     */
    get isAvailable() {
        return this.puter !== null;
    }

    /**
     * Initialize Puter service
     * @returns {Promise<boolean>} True if initialized successfully
     */
    async initialize() {
        if (!this.isAvailable) {
            console.warn('[PuterService] Puter SDK not available. Add <script src="https://js.puter.com/v2/"></script> to your HTML');
            this.connectionStatus = 'unavailable';
            this.emit('status', { status: 'unavailable' });
            return false;
        }

        try {
            this.connectionStatus = 'connecting';
            this.emit('status', { status: 'connecting' });

            // Check if user is already signed in
            if (this.puter.auth.isSignedIn()) {
                this.currentUser = await this.puter.auth.getUser();
                this.isConnected = true;
                this.connectionStatus = 'connected';
                console.log('[PuterService] Connected as:', this.currentUser.username);
                this.emit('status', { status: 'connected', user: this.currentUser });
                this.emit('userChanged', this.currentUser);
            } else {
                this.connectionStatus = 'ready';
                this.emit('status', { status: 'ready' });
            }

            return true;
        } catch (error) {
            console.error('[PuterService] Initialization error:', error);
            this.connectionStatus = 'error';
            this.emit('status', { status: 'error', error });
            return false;
        }
    }

    /**
     * Sign in user
     * @returns {Promise<Object|null>} User object or null
     */
    async signIn() {
        if (!this.isAvailable) return null;

        try {
            this.connectionStatus = 'authenticating';
            this.emit('status', { status: 'authenticating' });

            await this.puter.auth.signIn();
            this.currentUser = await this.puter.auth.getUser();
            this.isConnected = true;
            this.connectionStatus = 'connected';

            console.log('[PuterService] Signed in as:', this.currentUser.username);
            this.emit('status', { status: 'connected', user: this.currentUser });
            this.emit('userChanged', this.currentUser);

            return this.currentUser;
        } catch (error) {
            console.error('[PuterService] Sign in error:', error);
            this.connectionStatus = 'error';
            this.emit('status', { status: 'error', error });
            return null;
        }
    }

    /**
     * Sign out user
     */
    async signOut() {
        if (!this.isAvailable) return;

        try {
            this.puter.auth.signOut();
            this.currentUser = null;
            this.isConnected = false;
            this.connectionStatus = 'ready';
            this.emit('status', { status: 'ready' });
            this.emit('userChanged', null);
            console.log('[PuterService] Signed out');
        } catch (error) {
            console.error('[PuterService] Sign out error:', error);
        }
    }

    /**
     * Get user ID (or 'local' if not signed in)
     * @returns {string} User ID
     */
    getUserId() {
        return this.currentUser?.uuid || 'local';
    }

    /**
     * Set a key-value pair in cloud storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     * @returns {Promise<boolean>} True if successful
     */
    async kvSet(key, value) {
        if (!this.isConnected) {
            throw new Error('Not connected to Puter. Call signIn() first.');
        }

        try {
            await this.puter.kv.set(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('[PuterService] KV set error:', error);
            throw error;
        }
    }

    /**
     * Get a value from cloud storage
     * @param {string} key - Storage key
     * @returns {Promise<any>} Stored value or null
     */
    async kvGet(key) {
        if (!this.isConnected) {
            throw new Error('Not connected to Puter. Call signIn() first.');
        }

        try {
            const value = await this.puter.kv.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('[PuterService] KV get error:', error);
            return null;
        }
    }

    /**
     * Delete a key from cloud storage
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} True if successful
     */
    async kvDel(key) {
        if (!this.isConnected) {
            throw new Error('Not connected to Puter. Call signIn() first.');
        }

        try {
            await this.puter.kv.del(key);
            return true;
        } catch (error) {
            console.error('[PuterService] KV delete error:', error);
            throw error;
        }
    }

    /**
     * List keys matching a prefix
     * @param {string} prefix - Key prefix to match
     * @returns {Promise<string[]>} Array of matching keys
     */
    async kvList(prefix = '') {
        if (!this.isConnected) {
            throw new Error('Not connected to Puter. Call signIn() first.');
        }

        try {
            const keys = await this.puter.kv.list(prefix);
            return keys || [];
        } catch (error) {
            console.error('[PuterService] KV list error:', error);
            return [];
        }
    }

    /**
     * Save a file to cloud storage
     * @param {string} path - File path
     * @param {Blob|string} content - File content
     * @returns {Promise<boolean>} True if successful
     */
    async saveFile(path, content) {
        if (!this.isConnected) {
            throw new Error('Not connected to Puter. Call signIn() first.');
        }

        try {
            await this.puter.fs.write(path, content);
            return true;
        } catch (error) {
            console.error('[PuterService] File save error:', error);
            throw error;
        }
    }

    /**
     * Load a file from cloud storage
     * @param {string} path - File path
     * @returns {Promise<string|null>} File content or null
     */
    async loadFile(path) {
        if (!this.isConnected) {
            throw new Error('Not connected to Puter. Call signIn() first.');
        }

        try {
            const content = await this.puter.fs.read(path);
            return content;
        } catch (error) {
            console.error('[PuterService] File load error:', error);
            return null;
        }
    }
}

// Singleton instance
export const puterService = new PuterService();
export default puterService;

