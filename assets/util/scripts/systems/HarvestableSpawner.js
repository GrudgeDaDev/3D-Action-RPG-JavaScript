/**
 * Harvestable Spawner System
 * Converted from Unity C# HarvestableSpawner.cs
 * 
 * Spawns harvestable resources (trees, rocks, plants) in the game world
 */

import * as BABYLON from '@babylonjs/core';
import { distance3D, randomPositionInRadius } from '../core/utils.js';

export class HarvestablePrefab {
    constructor(prefab, maxCount) {
        this.prefab = prefab;          // Mesh or model to spawn
        this.maxCount = maxCount;      // Maximum instances allowed
        this.currentCount = 0;         // Current spawned count
    }
}

export class HarvestableSpawner {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.harvestablePrefabs = [];  // Array of HarvestablePrefab
        this.spawnedHarvestables = [];  // Array of arrays tracking spawned instances
        
        // Configuration
        this.spawnAreaRadius = options.spawnAreaRadius || 50.0;
        this.spawnRate = options.spawnRate || 2.0; // seconds between spawns
        this.spawnPosition = options.spawnPosition || new BABYLON.Vector3(0, 0, 0);
        
        // Layer/tag filtering
        this.spawnLayer = options.spawnLayer || 'ground';
        this.doNotSpawnAtLayer = options.doNotSpawnAtLayer || ['water', 'road'];
        
        // State
        this.isActive = false;
        this.spawnInterval = null;
        
        console.log('🌳 HarvestableSpawner initialized');
    }

    /**
     * Add a harvestable prefab configuration
     */
    addHarvestablePrefab(prefab, maxCount) {
        const harvestablePrefab = new HarvestablePrefab(prefab, maxCount);
        this.harvestablePrefabs.push(harvestablePrefab);
        this.spawnedHarvestables.push([]);
        
        console.log(`Added harvestable: ${prefab.name || 'Unknown'} (max: ${maxCount})`);
    }

    /**
     * Start spawning harvestables
     */
    start() {
        if (this.isActive) {
            console.warn('Spawner already active');
            return;
        }

        this.isActive = true;
        console.log('🌳 Starting harvestable spawner...');
        
        // Start spawn loop
        this.spawnInterval = setInterval(() => {
            this.spawnTick();
        }, this.spawnRate * 1000);
        
        // Do initial spawn
        this.spawnTick();
    }

    /**
     * Stop spawning
     */
    stop() {
        this.isActive = false;
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        console.log('🛑 Harvestable spawner stopped');
    }

    /**
     * Spawn tick - called at spawn rate interval
     */
    spawnTick() {
        // Clean up destroyed harvestables
        this.cleanupDestroyed();
        
        // Choose random prefab to spawn
        const prefabToSpawn = this.chooseRandomPrefab();
        
        if (prefabToSpawn) {
            this.spawnHarvestable(prefabToSpawn);
        }
    }

    /**
     * Spawn a harvestable instance
     */
    spawnHarvestable(prefabConfig) {
        const spawnPosition = this.getValidGroundPosition();
        
        if (!spawnPosition) {
            console.warn('No valid spawn position found');
            return null;
        }

        // Clone the prefab mesh
        const newHarvestable = prefabConfig.prefab.clone(`${prefabConfig.prefab.name}_${Date.now()}`);
        newHarvestable.position = spawnPosition;
        newHarvestable.setEnabled(true);
        
        // Add metadata
        if (!newHarvestable.metadata) {
            newHarvestable.metadata = {};
        }
        newHarvestable.metadata.isHarvestable = true;
        newHarvestable.metadata.prefabType = prefabConfig.prefab.name;
        newHarvestable.metadata.spawnTime = Date.now();
        
        // Find the index and add to tracking
        const index = this.harvestablePrefabs.indexOf(prefabConfig);
        if (index !== -1) {
            this.spawnedHarvestables[index].push(newHarvestable);
            prefabConfig.currentCount++;
        }

        console.log(`🌱 Spawned ${prefabConfig.prefab.name} at ${spawnPosition}`);
        
        return newHarvestable;
    }

    /**
     * Get valid ground position for spawning
     */
    getValidGroundPosition() {
        const maxAttempts = 10;
        
        for (let i = 0; i < maxAttempts; i++) {
            // Random position within spawn radius
            const randomPos = randomPositionInRadius(this.spawnPosition, this.spawnAreaRadius);
            randomPos.y = 100; // Start high for raycast
            
            // Raycast down to find ground
            const ray = new BABYLON.Ray(randomPos, new BABYLON.Vector3(0, -1, 0), 200);
            const hit = this.scene.pickWithRay(ray, (mesh) => {
                // Check if mesh is valid spawn surface
                return this.isValidSpawnSurface(mesh);
            });

            if (hit && hit.pickedPoint) {
                // Check if position is not in "do not spawn" area
                if (!this.isInDoNotSpawnArea(hit.pickedPoint)) {
                    return hit.pickedPoint;
                }
            }
        }

        return null;
    }

    /**
     * Check if mesh is valid spawn surface
     */
    isValidSpawnSurface(mesh) {
        if (!mesh.metadata) return false;
        
        // Check if mesh has spawn layer tag
        if (mesh.metadata.layer === this.spawnLayer) {
            return true;
        }
        
        // Check if mesh is tagged as ground
        if (mesh.metadata.isGround || mesh.name.toLowerCase().includes('ground')) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if position is in do-not-spawn area
     */
    isInDoNotSpawnArea(position) {
        // Check against meshes with do-not-spawn layers
        const meshes = this.scene.meshes;
        
        for (const mesh of meshes) {
            if (!mesh.metadata) continue;
            
            if (this.doNotSpawnAtLayer.includes(mesh.metadata.layer)) {
                // Check if position is near this mesh
                const dist = distance3D(position, mesh.position);
                if (dist < 5.0) { // 5 meter buffer
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Choose random prefab that hasn't reached max count
     */
    chooseRandomPrefab() {
        const availablePrefabs = [];
        
        for (let i = 0; i < this.harvestablePrefabs.length; i++) {
            const prefab = this.harvestablePrefabs[i];
            if (prefab.currentCount < prefab.maxCount) {
                availablePrefabs.push(prefab);
            }
        }

        if (availablePrefabs.length === 0) {
            return null;
        }

        // Return random available prefab
        const randomIndex = Math.floor(Math.random() * availablePrefabs.length);
        return availablePrefabs[randomIndex];
    }

    /**
     * Clean up destroyed harvestables
     */
    cleanupDestroyed() {
        for (let i = 0; i < this.spawnedHarvestables.length; i++) {
            const instances = this.spawnedHarvestables[i];
            const prefab = this.harvestablePrefabs[i];
            
            // Remove null/disposed instances
            for (let j = instances.length - 1; j >= 0; j--) {
                const instance = instances[j];
                
                if (!instance || instance.isDisposed() || !instance.isEnabled()) {
                    instances.splice(j, 1);
                    prefab.currentCount--;
                }
            }
        }
    }

    /**
     * Get all spawned harvestables
     */
    getAllSpawned() {
        const all = [];
        this.spawnedHarvestables.forEach(instances => {
            all.push(...instances);
        });
        return all;
    }

    /**
     * Get spawned count for specific prefab
     */
    getSpawnedCount(prefabName) {
        const index = this.harvestablePrefabs.findIndex(p => p.prefab.name === prefabName);
        if (index === -1) return 0;
        return this.spawnedHarvestables[index].length;
    }

    /**
     * Clear all spawned harvestables
     */
    clearAll() {
        this.spawnedHarvestables.forEach(instances => {
            instances.forEach(instance => {
                if (instance && !instance.isDisposed()) {
                    instance.dispose();
                }
            });
        });
        
        this.spawnedHarvestables = this.harvestablePrefabs.map(() => []);
        this.harvestablePrefabs.forEach(p => p.currentCount = 0);
        
        console.log('🗑️ Cleared all harvestables');
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        this.stop();
        this.clearAll();
        console.log('✅ HarvestableSpawner disposed');
    }
}

