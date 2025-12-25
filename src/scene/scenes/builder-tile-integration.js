/**
 * Builder Tile Integration Example
 * Shows how to integrate the new tile system with the builder scene
 */

import { createTileBasedGenerator } from '../gen/procedural/TileBasedGenerator.js';
import { createTileBrowserPanel } from '../../ui/TileBrowserPanel.js';

/**
 * Setup tile-based building in the builder scene
 */
export async function setupTileBuilder(scene, camera) {
    console.log('🏗️ Setting up Tile Builder...');

    // Create tile generator
    const tileGenerator = createTileBasedGenerator(scene);
    await tileGenerator.initialize();

    // Create tile browser UI
    const tileBrowser = createTileBrowserPanel(tileGenerator.getTileManager());
    tileBrowser.createPanel();

    // Setup placement mode
    let placementMode = false;
    let previewMesh = null;

    // Handle part selection from browser
    tileBrowser.onPartSelected = (partId) => {
        console.log(`🎯 Part selected for placement: ${partId}`);
        placementMode = true;
        
        // Clear old preview
        if (previewMesh) {
            previewMesh.dispose();
            previewMesh = null;
        }

        // Create preview mesh
        const tempPos = new BABYLON.Vector3(0, 0, 0);
        previewMesh = tileGenerator.getTileManager().createPartInstance(
            partId,
            tempPos,
            { physics: false }
        );

        if (previewMesh) {
            // Make preview semi-transparent
            if (previewMesh.material) {
                previewMesh.material = previewMesh.material.clone();
                previewMesh.material.alpha = 0.5;
            }
        }
    };

    // Setup mouse picking for placement
    scene.onPointerDown = (evt, pickResult) => {
        if (!placementMode || !previewMesh) return;

        if (evt.button === 0) { // Left click
            if (pickResult.hit) {
                const partId = tileBrowser.getSelectedPart();
                if (partId) {
                    // Place the part
                    const placedPart = tileGenerator.getTileManager().createPartInstance(
                        partId,
                        pickResult.pickedPoint,
                        { physics: true, receiveShadows: true }
                    );

                    console.log(`✅ Placed ${partId} at ${pickResult.pickedPoint.toString()}`);
                }
            }
        } else if (evt.button === 2) { // Right click - cancel
            placementMode = false;
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = null;
            }
        }
    };

    // Update preview position on mouse move
    scene.onPointerMove = (evt, pickResult) => {
        if (!placementMode || !previewMesh) return;

        if (pickResult.hit) {
            previewMesh.position = pickResult.pickedPoint.clone();
        }
    };

    // Keyboard shortcuts
    window.addEventListener('keydown', (evt) => {
        // T - Toggle tile browser
        if (evt.key === 't' || evt.key === 'T') {
            tileBrowser.toggle();
        }

        // Escape - Cancel placement
        if (evt.key === 'Escape') {
            placementMode = false;
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = null;
            }
        }

        // G - Generate test room
        if (evt.key === 'g' || evt.key === 'G') {
            const testPos = new BABYLON.Vector3(0, 0, 0);
            const room = tileGenerator.generateRoom(testPos, 4, 4);
            tileGenerator.addPropsToStructure(room, 0.4);
            console.log('✅ Generated test room');
        }

        // B - Generate test building
        if (evt.key === 'b' || evt.key === 'B') {
            const testPos = new BABYLON.Vector3(50, 0, 0);
            const building = tileGenerator.generateBuilding(testPos, 3);
            console.log('✅ Generated test building');
        }

        // C - Clear all generated structures
        if (evt.key === 'c' || evt.key === 'C') {
            tileGenerator.clearStructures();
        }
    });

    // Create help panel
    createHelpPanel();

    console.log('✅ Tile Builder ready!');
    console.log('📋 Controls:');
    console.log('  T - Toggle Tile Browser');
    console.log('  G - Generate test room');
    console.log('  B - Generate test building');
    console.log('  C - Clear structures');
    console.log('  Left Click - Place tile');
    console.log('  Right Click - Cancel placement');

    return {
        tileGenerator,
        tileBrowser
    };
}

/**
 * Create help panel
 */
function createHelpPanel() {
    const helpPanel = document.createElement('div');
    helpPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(20, 20, 30, 0.9);
        border: 2px solid rgba(100, 150, 255, 0.5);
        border-radius: 8px;
        padding: 15px;
        color: white;
        font-family: monospace;
        font-size: 12px;
        z-index: 1000;
    `;

    helpPanel.innerHTML = `
        <div style="color: #6495ff; font-weight: bold; margin-bottom: 8px;">
            🎮 Tile Builder Controls
        </div>
        <div style="line-height: 1.6;">
            <div><kbd>T</kbd> - Toggle Tile Browser</div>
            <div><kbd>G</kbd> - Generate Test Room</div>
            <div><kbd>B</kbd> - Generate Test Building</div>
            <div><kbd>C</kbd> - Clear Structures</div>
            <div><kbd>Left Click</kbd> - Place Tile</div>
            <div><kbd>Right Click</kbd> - Cancel</div>
            <div><kbd>ESC</kbd> - Cancel Placement</div>
        </div>
    `;

    document.body.appendChild(helpPanel);
}

/**
 * Example: Generate a village
 */
export async function generateVillage(tileGenerator, centerPosition, buildingCount = 5) {
    console.log(`🏘️ Generating village with ${buildingCount} buildings...`);

    const buildings = [];
    const spacing = 30;

    for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        const radius = 40;
        
        const buildingPos = new BABYLON.Vector3(
            centerPosition.x + Math.cos(angle) * radius,
            centerPosition.y,
            centerPosition.z + Math.sin(angle) * radius
        );

        const roomCount = Math.floor(Math.random() * 3) + 1; // 1-3 rooms
        const building = tileGenerator.generateBuilding(buildingPos, roomCount);
        
        // Add props to each room
        building.rooms.forEach(room => {
            tileGenerator.addPropsToStructure(room, 0.3);
        });

        buildings.push(building);
    }

    console.log(`✅ Village generated with ${buildings.length} buildings`);
    return buildings;
}

