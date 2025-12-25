/**
 * MarkerDefinitions - Defines all marker types for the editor
 * Used for placing NPCs, enemies, vendors, spawn points, warp points, etc.
 */

export const MarkerTypes = {
    NPC: 'npc',
    ENEMY: 'enemy',
    VENDOR: 'vendor',
    PLAYER_SPAWN: 'player_spawn',
    WARP_POINT: 'warp',
    RESPAWN_POINT: 'respawn',
    QUEST_GIVER: 'quest_giver',
    TREASURE: 'treasure',
    TRIGGER: 'trigger'
};

export const MarkerConfig = {
    [MarkerTypes.NPC]: {
        name: 'NPC',
        icon: '👤',
        color: new BABYLON.Color3(0.3, 0.7, 1.0), // Blue
        size: 1.5,
        defaultData: {
            npcId: '',
            name: 'Unnamed NPC',
            dialogue: [],
            questIds: [],
            shopItems: [],
            behavior: 'idle'
        }
    },
    [MarkerTypes.ENEMY]: {
        name: 'Enemy Spawn',
        icon: '👹',
        color: new BABYLON.Color3(1.0, 0.2, 0.2), // Red
        size: 1.5,
        defaultData: {
            enemyId: '',
            level: 1,
            health: 100,
            damage: 10,
            respawnTime: 60,
            patrolRadius: 10,
            aggressive: true
        }
    },
    [MarkerTypes.VENDOR]: {
        name: 'Vendor',
        icon: '🏪',
        color: new BABYLON.Color3(1.0, 0.8, 0.2), // Gold
        size: 1.5,
        defaultData: {
            vendorId: '',
            name: 'Merchant',
            shopType: 'general',
            inventory: [],
            buyMultiplier: 1.0,
            sellMultiplier: 0.5
        }
    },
    [MarkerTypes.PLAYER_SPAWN]: {
        name: 'Player Spawn',
        icon: '🎯',
        color: new BABYLON.Color3(0.2, 1.0, 0.2), // Green
        size: 2.0,
        defaultData: {
            spawnId: '',
            team: 'player',
            priority: 0,
            respawnPoint: true
        }
    },
    [MarkerTypes.WARP_POINT]: {
        name: 'Warp Point',
        icon: '🌀',
        color: new BABYLON.Color3(0.8, 0.2, 1.0), // Purple
        size: 2.0,
        defaultData: {
            warpId: '',
            targetScene: '',
            targetPosition: { x: 0, y: 0, z: 0 },
            requiresItem: null,
            requiresQuest: null
        }
    },
    [MarkerTypes.RESPAWN_POINT]: {
        name: 'Respawn Point',
        icon: '⚡',
        color: new BABYLON.Color3(1.0, 1.0, 0.2), // Yellow
        size: 1.8,
        defaultData: {
            respawnId: '',
            team: 'player',
            checkpoint: false
        }
    },
    [MarkerTypes.QUEST_GIVER]: {
        name: 'Quest Giver',
        icon: '📜',
        color: new BABYLON.Color3(1.0, 0.6, 0.2), // Orange
        size: 1.5,
        defaultData: {
            questGiverId: '',
            name: 'Quest Giver',
            quests: [],
            dialogue: []
        }
    },
    [MarkerTypes.TREASURE]: {
        name: 'Treasure',
        icon: '💎',
        color: new BABYLON.Color3(0.2, 0.8, 0.8), // Cyan
        size: 1.2,
        defaultData: {
            treasureId: '',
            loot: [],
            respawnTime: 300,
            requiresKey: null
        }
    },
    [MarkerTypes.TRIGGER]: {
        name: 'Trigger Zone',
        icon: '⚙️',
        color: new BABYLON.Color3(0.5, 0.5, 0.5), // Gray
        size: 2.5,
        defaultData: {
            triggerId: '',
            triggerType: 'enter',
            action: '',
            radius: 5,
            oneTime: false
        }
    }
};

/**
 * Create a visual marker mesh for the editor
 */
export function createMarkerMesh(scene, markerType, position) {
    const config = MarkerConfig[markerType];
    if (!config) {
        console.error(`Unknown marker type: ${markerType}`);
        return null;
    }

    // Create marker group
    const markerGroup = new BABYLON.TransformNode(`marker_${markerType}_${Date.now()}`, scene);
    markerGroup.position = position;

    // Create base cylinder
    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
        'markerBase',
        { height: config.size, diameter: config.size * 0.5 },
        scene
    );
    cylinder.parent = markerGroup;
    cylinder.position.y = config.size / 2;

    // Create material
    const material = new BABYLON.StandardMaterial('markerMat', scene);
    material.diffuseColor = config.color;
    material.emissiveColor = config.color.scale(0.3);
    material.alpha = 0.7;
    cylinder.material = material;

    // Create icon plane above
    const iconPlane = BABYLON.MeshBuilder.CreatePlane(
        'markerIcon',
        { size: config.size * 0.8 },
        scene
    );
    iconPlane.parent = markerGroup;
    iconPlane.position.y = config.size * 1.2;
    iconPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    // Create dynamic texture for icon
    const iconTexture = new BABYLON.DynamicTexture('iconTexture', 128, scene);
    const iconMaterial = new BABYLON.StandardMaterial('iconMat', scene);
    iconMaterial.diffuseTexture = iconTexture;
    iconMaterial.emissiveTexture = iconTexture;
    iconMaterial.opacityTexture = iconTexture;
    iconPlane.material = iconMaterial;

    // Draw icon
    const ctx = iconTexture.getContext();
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.icon, 64, 64);
    iconTexture.update();

    // Store metadata
    markerGroup.metadata = {
        markerType: markerType,
        markerData: { ...config.defaultData },
        createdAt: new Date().toISOString()
    };

    return markerGroup;
}

