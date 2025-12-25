/**
 * MarkerLoader - Utility to load and spawn entities from editor markers
 * Integrates with EnemyManager, CharacterManager, and other game systems
 */

import { MarkerTypes } from '../editor/MarkerDefinitions.js';

export class MarkerLoader {
    constructor(scene, assetSystems) {
        this.scene = scene;
        this.enemyManager = assetSystems.enemyManager;
        this.characterManager = assetSystems.characterManager;
        this.spawnedEntities = new Map();
    }

    /**
     * Load markers from a scene JSON file
     */
    async loadFromFile(filePath) {
        try {
            const response = await fetch(filePath);
            const sceneData = await response.json();
            
            if (sceneData.markers) {
                await this.loadMarkers(sceneData.markers);
                console.log(`✅ Loaded ${sceneData.markers.length} markers from ${filePath}`);
            }
            
            return sceneData;
        } catch (error) {
            console.error(`❌ Error loading markers from ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Load markers from data array
     */
    async loadMarkers(markersData) {
        for (const markerData of markersData) {
            await this.spawnFromMarker(markerData);
        }
    }

    /**
     * Spawn entity from marker data
     */
    async spawnFromMarker(markerData) {
        const position = new BABYLON.Vector3(
            markerData.position.x,
            markerData.position.y,
            markerData.position.z
        );

        switch (markerData.type) {
            case MarkerTypes.ENEMY:
                return await this.spawnEnemy(markerData, position);
            
            case MarkerTypes.NPC:
                return await this.spawnNPC(markerData, position);
            
            case MarkerTypes.VENDOR:
                return await this.spawnVendor(markerData, position);
            
            case MarkerTypes.PLAYER_SPAWN:
                return this.registerPlayerSpawn(markerData, position);
            
            case MarkerTypes.WARP_POINT:
                return this.createWarpPoint(markerData, position);
            
            case MarkerTypes.RESPAWN_POINT:
                return this.registerRespawnPoint(markerData, position);
            
            case MarkerTypes.QUEST_GIVER:
                return await this.spawnQuestGiver(markerData, position);
            
            case MarkerTypes.TREASURE:
                return this.createTreasure(markerData, position);
            
            case MarkerTypes.TRIGGER:
                return this.createTrigger(markerData, position);
            
            default:
                console.warn(`Unknown marker type: ${markerData.type}`);
                return null;
        }
    }

    /**
     * Spawn enemy from marker
     */
    async spawnEnemy(markerData, position) {
        if (!this.enemyManager) {
            console.warn('EnemyManager not available');
            return null;
        }

        const enemy = await this.enemyManager.spawn(
            markerData.data.enemyId,
            position,
            {
                level: markerData.data.level,
                health: markerData.data.health,
                damage: markerData.data.damage,
                respawnTime: markerData.data.respawnTime,
                patrolRadius: markerData.data.patrolRadius,
                aggressive: markerData.data.aggressive
            }
        );

        if (enemy) {
            this.spawnedEntities.set(markerData.data.enemyId, enemy);
            console.log(`👹 Spawned enemy: ${markerData.data.enemyId}`);
        }

        return enemy;
    }

    /**
     * Spawn NPC from marker
     */
    async spawnNPC(markerData, position) {
        if (!this.characterManager) {
            console.warn('CharacterManager not available');
            return null;
        }

        const npc = await this.characterManager.spawn(
            markerData.data.npcId,
            position,
            {
                name: markerData.data.name,
                dialogue: markerData.data.dialogue,
                questIds: markerData.data.questIds,
                behavior: markerData.data.behavior
            }
        );

        if (npc) {
            this.spawnedEntities.set(markerData.data.npcId, npc);
            console.log(`👤 Spawned NPC: ${markerData.data.name}`);
        }

        return npc;
    }

    /**
     * Spawn vendor from marker
     */
    async spawnVendor(markerData, position) {
        // Vendors are NPCs with shop functionality
        const vendor = await this.spawnNPC(markerData, position);
        
        if (vendor) {
            vendor.metadata = vendor.metadata || {};
            vendor.metadata.isVendor = true;
            vendor.metadata.shopType = markerData.data.shopType;
            vendor.metadata.inventory = markerData.data.inventory;
            vendor.metadata.buyMultiplier = markerData.data.buyMultiplier;
            vendor.metadata.sellMultiplier = markerData.data.sellMultiplier;
            
            console.log(`🏪 Spawned vendor: ${markerData.data.name}`);
        }

        return vendor;
    }

    /**
     * Register player spawn point
     */
    registerPlayerSpawn(markerData, position) {
        if (!window.PLAYER_SPAWNS) {
            window.PLAYER_SPAWNS = [];
        }

        const spawn = {
            id: markerData.data.spawnId,
            position: position,
            team: markerData.data.team,
            priority: markerData.data.priority,
            respawnPoint: markerData.data.respawnPoint
        };

        window.PLAYER_SPAWNS.push(spawn);
        console.log(`🎯 Registered player spawn: ${spawn.id}`);
        
        return spawn;
    }

    /**
     * Create warp point
     */
    createWarpPoint(markerData, position) {
        // Create visual indicator
        const warpMesh = BABYLON.MeshBuilder.CreateTorus(
            `warp_${markerData.data.warpId}`,
            { diameter: 3, thickness: 0.3, tessellation: 32 },
            this.scene
        );
        warpMesh.position = position;
        warpMesh.position.y += 1;

        // Create material with glow
        const material = new BABYLON.StandardMaterial('warpMat', this.scene);
        material.emissiveColor = new BABYLON.Color3(0.8, 0.2, 1.0);
        material.alpha = 0.7;
        warpMesh.material = material;

        // Rotate animation
        this.scene.registerBeforeRender(() => {
            warpMesh.rotation.y += 0.01;
        });

        // Store warp data
        warpMesh.metadata = {
            isWarpPoint: true,
            warpId: markerData.data.warpId,
            targetScene: markerData.data.targetScene,
            targetPosition: markerData.data.targetPosition,
            requiresItem: markerData.data.requiresItem,
            requiresQuest: markerData.data.requiresQuest
        };

        console.log(`🌀 Created warp point: ${markerData.data.warpId}`);
        return warpMesh;
    }

    /**
     * Register respawn point
     */
    registerRespawnPoint(markerData, position) {
        if (!window.RESPAWN_POINTS) {
            window.RESPAWN_POINTS = [];
        }

        const respawn = {
            id: markerData.data.respawnId,
            position: position,
            team: markerData.data.team,
            checkpoint: markerData.data.checkpoint
        };

        window.RESPAWN_POINTS.push(respawn);
        console.log(`⚡ Registered respawn point: ${respawn.id}`);
        
        return respawn;
    }

    /**
     * Spawn quest giver from marker
     */
    async spawnQuestGiver(markerData, position) {
        const questGiver = await this.spawnNPC(markerData, position);
        
        if (questGiver) {
            questGiver.metadata = questGiver.metadata || {};
            questGiver.metadata.isQuestGiver = true;
            questGiver.metadata.quests = markerData.data.quests;
            
            console.log(`📜 Spawned quest giver: ${markerData.data.name}`);
        }

        return questGiver;
    }

    /**
     * Create treasure chest
     */
    createTreasure(markerData, position) {
        // Create simple treasure chest mesh
        const chest = BABYLON.MeshBuilder.CreateBox(
            `treasure_${markerData.data.treasureId}`,
            { width: 1, height: 0.8, depth: 0.6 },
            this.scene
        );
        chest.position = position;

        const material = new BABYLON.StandardMaterial('treasureMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
        material.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.05);
        chest.material = material;

        chest.metadata = {
            isTreasure: true,
            treasureId: markerData.data.treasureId,
            loot: markerData.data.loot,
            respawnTime: markerData.data.respawnTime,
            requiresKey: markerData.data.requiresKey,
            opened: false
        };

        console.log(`💎 Created treasure: ${markerData.data.treasureId}`);
        return chest;
    }

    /**
     * Create trigger zone
     */
    createTrigger(markerData, position) {
        // Create invisible trigger sphere
        const trigger = BABYLON.MeshBuilder.CreateSphere(
            `trigger_${markerData.data.triggerId}`,
            { diameter: markerData.data.radius * 2 },
            this.scene
        );
        trigger.position = position;
        trigger.visibility = 0; // Invisible in game
        trigger.isPickable = false;

        trigger.metadata = {
            isTrigger: true,
            triggerId: markerData.data.triggerId,
            triggerType: markerData.data.triggerType,
            action: markerData.data.action,
            radius: markerData.data.radius,
            oneTime: markerData.data.oneTime,
            triggered: false
        };

        console.log(`⚙️ Created trigger: ${markerData.data.triggerId}`);
        return trigger;
    }

    /**
     * Get player spawn by priority
     */
    getPlayerSpawn(priority = 0) {
        if (!window.PLAYER_SPAWNS || window.PLAYER_SPAWNS.length === 0) {
            return null;
        }

        return window.PLAYER_SPAWNS.find(s => s.priority === priority) || window.PLAYER_SPAWNS[0];
    }

    /**
     * Get all spawned entities
     */
    getAllEntities() {
        return Array.from(this.spawnedEntities.values());
    }

    /**
     * Clear all spawned entities
     */
    clearAll() {
        this.spawnedEntities.forEach(entity => {
            if (entity.dispose) {
                entity.dispose();
            }
        });
        this.spawnedEntities.clear();
        console.log('🗑️ Cleared all spawned entities');
    }
}

