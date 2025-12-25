/**
 * ObjectPool - Reusable object pool for performance optimization
 * Ported from Grudge-PlayGround - Engine-agnostic utility
 * 
 * Reduces garbage collection by reusing objects instead of creating/destroying them.
 * Perfect for projectiles, particles, enemies, damage numbers, etc.
 * 
 * Usage:
 *   const bulletPool = new ObjectPool(() => createBullet(), 100);
 *   
 *   // Get from pool instead of creating new
 *   const bullet = bulletPool.acquire();
 *   bullet.fire(position, direction);
 *   
 *   // Return to pool when done
 *   bulletPool.release(bullet);
 */

export class ObjectPool {
    /**
     * Create an object pool
     * @param {Function} factory - Function that creates new objects
     * @param {number} initialSize - Initial pool size
     * @param {number} maxSize - Maximum pool size
     */
    constructor(factory, initialSize = 10, maxSize = 100) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.pool = [];
        this.active = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createObject());
        }
    }

    /**
     * Create a new object using the factory
     * @returns {Object} New object with unique pool ID
     */
    createObject() {
        const obj = this.factory();
        obj._poolId = Math.random().toString(36).substr(2, 9);
        return obj;
    }

    /**
     * Get an object from the pool
     * @returns {Object|null} Object from pool, or null if max size reached
     */
    acquire() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else if (this.active.size < this.maxSize) {
            obj = this.createObject();
        } else {
            console.warn('ObjectPool: Max size reached');
            return null;
        }

        this.active.add(obj);
        
        // Call lifecycle hook if exists
        if (obj.onAcquire) {
            obj.onAcquire();
        }
        
        return obj;
    }

    /**
     * Return an object to the pool
     * @param {Object} obj - Object to release
     * @returns {boolean} True if successfully released
     */
    release(obj) {
        if (!this.active.has(obj)) {
            return false;
        }

        this.active.delete(obj);
        
        // Call lifecycle hooks if they exist
        if (obj.onRelease) {
            obj.onRelease();
        }

        if (obj.reset) {
            obj.reset();
        }

        this.pool.push(obj);
        return true;
    }

    /**
     * Release all active objects back to the pool
     */
    releaseAll() {
        this.active.forEach(obj => {
            if (obj.onRelease) obj.onRelease();
            if (obj.reset) obj.reset();
            this.pool.push(obj);
        });
        this.active.clear();
    }

    /**
     * Get the number of active objects
     * @returns {number} Active object count
     */
    getActiveCount() {
        return this.active.size;
    }

    /**
     * Get the number of available objects in pool
     * @returns {number} Available object count
     */
    getAvailableCount() {
        return this.pool.length;
    }

    /**
     * Get total number of objects (active + available)
     * @returns {number} Total object count
     */
    getTotalCount() {
        return this.pool.length + this.active.size;
    }

    /**
     * Dispose of all objects and clear the pool
     */
    dispose() {
        this.pool.forEach(obj => {
            if (obj.dispose) obj.dispose();
        });
        this.active.forEach(obj => {
            if (obj.dispose) obj.dispose();
        });
        this.pool = [];
        this.active.clear();
    }
}

