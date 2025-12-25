/**
 * Tile System Usage Examples
 * Demonstrates various ways to use the new tile system
 */

import { createTileBasedGenerator } from '../src/scene/gen/procedural/TileBasedGenerator.js';
import { createTileBrowserPanel } from '../src/ui/TileBrowserPanel.js';
import { setupTileBuilder, generateVillage } from '../src/scene/scenes/builder-tile-integration.js';

/**
 * Example 1: Basic Setup
 */
export async function example1_BasicSetup(scene) {
    console.log('📚 Example 1: Basic Setup');
    
    // Create and initialize tile generator
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    console.log('✅ Tile system ready!');
    return tileGenerator;
}

/**
 * Example 2: Generate a Simple Room
 */
export async function example2_SimpleRoom(scene) {
    console.log('📚 Example 2: Generate Simple Room');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    // Generate a 4x4 room at origin
    const position = new BABYLON.Vector3(0, 0, 0);
    const room = tileGenerator.generateRoom(position, 4, 4);
    
    console.log('✅ Room generated!');
    return room;
}

/**
 * Example 3: Generate Room with Props
 */
export async function example3_RoomWithProps(scene) {
    console.log('📚 Example 3: Room with Props');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    // Generate room
    const position = new BABYLON.Vector3(0, 0, 0);
    const room = tileGenerator.generateRoom(position, 5, 5);
    
    // Add props (40% density)
    tileGenerator.addPropsToStructure(room, 0.4);
    
    console.log('✅ Room with props generated!');
    return room;
}

/**
 * Example 4: Generate a Building
 */
export async function example4_Building(scene) {
    console.log('📚 Example 4: Generate Building');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    // Generate a building with 3 rooms
    const position = new BABYLON.Vector3(50, 0, 0);
    const building = tileGenerator.generateBuilding(position, 3, {
        roomWidth: 4,
        roomDepth: 3,
        cellSize: 5
    });
    
    console.log('✅ Building generated!');
    return building;
}

/**
 * Example 5: Manual Tile Placement
 */
export async function example5_ManualPlacement(scene) {
    console.log('📚 Example 5: Manual Tile Placement');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    const tileManager = tileGenerator.getTileManager();
    
    // Place individual tiles
    const tiles = [];
    
    // Floor grid
    for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
            const pos = new BABYLON.Vector3(x * 5, 0, z * 5);
            const floor = tileManager.createPartInstance('floor_basic', pos, {
                physics: true,
                receiveShadows: true
            });
            tiles.push(floor);
        }
    }
    
    // Add some walls
    for (let x = 0; x < 5; x++) {
        const wallPos = new BABYLON.Vector3(x * 5, 5, 0);
        const wall = tileManager.createPartInstance('wall_wood', wallPos, {
            physics: true
        });
        tiles.push(wall);
    }
    
    console.log(`✅ Placed ${tiles.length} tiles manually!`);
    return tiles;
}

/**
 * Example 6: Using the Tile Browser UI
 */
export async function example6_TileBrowser(scene) {
    console.log('📚 Example 6: Tile Browser UI');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    // Create tile browser
    const tileBrowser = createTileBrowserPanel(tileGenerator.getTileManager());
    tileBrowser.createPanel();
    
    // Handle part selection
    tileBrowser.onPartSelected = (partId) => {
        console.log(`Selected part: ${partId}`);
        // You can add placement logic here
    };
    
    console.log('✅ Tile browser created! Press T to toggle.');
    return { tileGenerator, tileBrowser };
}

/**
 * Example 7: Generate a Village
 */
export async function example7_Village(scene) {
    console.log('📚 Example 7: Generate Village');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    // Generate village with 5 buildings
    const centerPos = new BABYLON.Vector3(0, 0, 0);
    const village = await generateVillage(tileGenerator, centerPos, 5);
    
    console.log('✅ Village generated!');
    return village;
}

/**
 * Example 8: Search and Filter
 */
export async function example8_SearchFilter(scene) {
    console.log('📚 Example 8: Search and Filter');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    const tileManager = tileGenerator.getTileManager();
    
    // Search for wood-related parts
    const woodParts = tileManager.searchParts('wood');
    console.log('Wood parts:', woodParts.map(p => p.config.name));
    
    // Get all walls
    const walls = tileManager.getPartsByCategory('walls');
    console.log('Walls:', walls.map(p => p.config.name));
    
    // Get furniture
    const furniture = tileManager.getPartsByTag('furniture');
    console.log('Furniture:', furniture.map(p => p.config.name));
    
    console.log('✅ Search complete!');
}

/**
 * Example 9: Load and Use Textures
 */
export async function example9_Textures(scene) {
    console.log('📚 Example 9: Load Textures');
    
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();
    
    const tileManager = tileGenerator.getTileManager();
    
    // Load grass texture
    const grassTexture = await tileManager.loadTexture('grass');
    
    // Create a plane with the texture
    const ground = BABYLON.MeshBuilder.CreateGround('textured_ground', {
        width: 100,
        height: 100
    }, scene);
    
    const material = new BABYLON.StandardMaterial('ground_mat', scene);
    material.diffuseTexture = grassTexture;
    ground.material = material;
    
    console.log('✅ Textured ground created!');
    return ground;
}

/**
 * Example 10: Full Builder Integration
 */
export async function example10_FullIntegration(scene, camera) {
    console.log('📚 Example 10: Full Builder Integration');
    
    // Setup complete tile builder with UI and controls
    const { tileGenerator, tileBrowser } = await setupTileBuilder(scene, camera);
    
    console.log('✅ Full tile builder ready!');
    console.log('Controls:');
    console.log('  T - Toggle Tile Browser');
    console.log('  G - Generate test room');
    console.log('  B - Generate test building');
    console.log('  C - Clear structures');
    
    return { tileGenerator, tileBrowser };
}

/**
 * Run all examples (for testing)
 */
export async function runAllExamples(scene, camera) {
    console.log('🚀 Running all tile system examples...\n');
    
    // Run examples one by one
    await example1_BasicSetup(scene);
    console.log('---\n');
    
    await example8_SearchFilter(scene);
    console.log('---\n');
    
    // For visual examples, you'd run them individually
    console.log('✅ All examples completed!');
    console.log('\nTo run visual examples, call them individually:');
    console.log('  example2_SimpleRoom(scene)');
    console.log('  example3_RoomWithProps(scene)');
    console.log('  example4_Building(scene)');
    console.log('  example5_ManualPlacement(scene)');
    console.log('  example6_TileBrowser(scene)');
    console.log('  example7_Village(scene)');
    console.log('  example9_Textures(scene)');
    console.log('  example10_FullIntegration(scene, camera)');
}

