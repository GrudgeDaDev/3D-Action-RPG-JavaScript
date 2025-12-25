/**
 * Tile-Based Procedural Generator
 * Uses the TileTextureManager to generate buildings and structures
 */

import { TileTextureManager } from '../../../assets/TileTextureManager.js';

export class TileBasedGenerator {
    constructor(scene) {
        this.scene = scene;
        this.tileManager = new TileTextureManager(scene);
        this.generatedStructures = [];
    }

    /**
     * Initialize the generator
     */
    async initialize() {
        console.log('🏗️ Initializing Tile-Based Generator...');
        
        await this.tileManager.loadCatalog();
        await this.tileManager.loadBuildingParts();
        
        console.log('✅ Tile-Based Generator ready');
        return true;
    }

    /**
     * Generate a simple room
     */
    generateRoom(position, width = 3, depth = 3, options = {}) {
        const structure = {
            type: 'room',
            position: position,
            parts: []
        };

        const cellSize = options.cellSize || 5;
        const wallHeight = options.wallHeight || 5;

        // Generate floor
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const floorPos = new BABYLON.Vector3(
                    position.x + (x * cellSize),
                    position.y,
                    position.z + (z * cellSize)
                );

                const floor = this.tileManager.createPartInstance(
                    'floor_basic',
                    floorPos,
                    { physics: true, receiveShadows: true }
                );

                if (floor) {
                    structure.parts.push(floor);
                }
            }
        }

        // Generate walls
        // Front and back walls
        for (let x = 0; x < width; x++) {
            // Front wall
            const frontWallPos = new BABYLON.Vector3(
                position.x + (x * cellSize),
                position.y + wallHeight,
                position.z
            );
            const frontWall = this.tileManager.createPartInstance(
                'wall_wood',
                frontWallPos,
                { physics: true }
            );
            if (frontWall) structure.parts.push(frontWall);

            // Back wall
            const backWallPos = new BABYLON.Vector3(
                position.x + (x * cellSize),
                position.y + wallHeight,
                position.z + (depth * cellSize)
            );
            const backWall = this.tileManager.createPartInstance(
                'wall_wood',
                backWallPos,
                { physics: true }
            );
            if (backWall) structure.parts.push(backWall);
        }

        // Side walls
        for (let z = 1; z < depth; z++) {
            // Left wall
            const leftWallPos = new BABYLON.Vector3(
                position.x,
                position.y + wallHeight,
                position.z + (z * cellSize)
            );
            const leftWall = this.tileManager.createPartInstance(
                'wall_wood',
                leftWallPos,
                { physics: true }
            );
            if (leftWall) structure.parts.push(leftWall);

            // Right wall
            const rightWallPos = new BABYLON.Vector3(
                position.x + (width * cellSize),
                position.y + wallHeight,
                position.z + (z * cellSize)
            );
            const rightWall = this.tileManager.createPartInstance(
                'wall_wood',
                rightWallPos,
                { physics: true }
            );
            if (rightWall) structure.parts.push(rightWall);
        }

        // Add roof
        const roofPos = new BABYLON.Vector3(
            position.x + (width * cellSize / 2),
            position.y + wallHeight * 2,
            position.z + (depth * cellSize / 2)
        );
        const roof = this.tileManager.createPartInstance(
            'roof_flat_flat',
            roofPos,
            { physics: true }
        );
        if (roof) {
            roof.scaling = new BABYLON.Vector3(width, 1, depth);
            structure.parts.push(roof);
        }

        this.generatedStructures.push(structure);
        console.log(`✅ Generated room at ${position.toString()}`);
        
        return structure;
    }

    /**
     * Generate a building with multiple rooms
     */
    generateBuilding(position, rooms = 2, options = {}) {
        const building = {
            type: 'building',
            position: position,
            rooms: []
        };

        const roomWidth = options.roomWidth || 3;
        const roomDepth = options.roomDepth || 3;
        const cellSize = options.cellSize || 5;

        for (let i = 0; i < rooms; i++) {
            const roomPos = new BABYLON.Vector3(
                position.x + (i * roomWidth * cellSize),
                position.y,
                position.z
            );

            const room = this.generateRoom(roomPos, roomWidth, roomDepth, options);
            building.rooms.push(room);
        }

        console.log(`✅ Generated building with ${rooms} rooms`);
        return building;
    }

    /**
     * Add props to a structure
     */
    addPropsToStructure(structure, propDensity = 0.3) {
        if (!structure || !structure.parts) return;

        const floors = structure.parts.filter(part => 
            part.name && part.name.includes('floor')
        );

        floors.forEach(floor => {
            if (Math.random() < propDensity) {
                const propTypes = ['barrel', 'chair_good', 'rug'];
                const randomProp = propTypes[Math.floor(Math.random() * propTypes.length)];

                const propPos = floor.position.clone();
                propPos.y += 1; // Slightly above floor

                const prop = this.tileManager.createPartInstance(
                    randomProp,
                    propPos,
                    { physics: true }
                );

                if (prop) {
                    structure.parts.push(prop);
                }
            }
        });

        console.log(`✅ Added props to structure`);
    }

    /**
     * Clear all generated structures
     */
    clearStructures() {
        this.generatedStructures.forEach(structure => {
            if (structure.parts) {
                structure.parts.forEach(part => {
                    if (part.dispose) {
                        part.dispose();
                    }
                });
            }
        });

        this.generatedStructures = [];
        console.log('🗑️ Cleared all generated structures');
    }

    /**
     * Get tile manager for direct access
     */
    getTileManager() {
        return this.tileManager;
    }
}

/**
 * Factory function
 */
export function createTileBasedGenerator(scene) {
    return new TileBasedGenerator(scene);
}

