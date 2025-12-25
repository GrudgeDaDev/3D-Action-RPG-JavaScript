/**
 * PlacementTools - Handles placement of markers in the editor
 * Integrates with MarkerDefinitions and editor state
 */

import { MarkerTypes, MarkerConfig, createMarkerMesh } from './MarkerDefinitions.js';

export class PlacementTools {
    constructor(scene, editorState) {
        this.scene = scene;
        this.editorState = editorState;
        this.placementMode = null;
        this.previewMarker = null;
        this.placedMarkers = [];
        this.groundMeshes = [];
        
        this.setupPlacementSystem();
    }

    /**
     * Setup the placement system
     */
    setupPlacementSystem() {
        // Collect ground meshes for raycasting
        this.updateGroundMeshes();
        
        // Setup mouse move for preview
        this.scene.onPointerMove = (evt, pickResult) => {
            if (this.placementMode && pickResult.hit) {
                this.updatePreview(pickResult.pickedPoint);
            }
        };
        
        // Setup click for placement
        this.scene.onPointerDown = (evt, pickResult) => {
            if (evt.button === 0 && this.placementMode && pickResult.hit) {
                this.placeMarker(pickResult.pickedPoint);
            }
        };
        
        console.log('✅ Placement tools initialized');
    }

    /**
     * Update list of ground meshes for raycasting
     */
    updateGroundMeshes() {
        this.groundMeshes = this.scene.meshes.filter(mesh => {
            // Include islands, terrain, and sea floor
            return mesh.name.includes('Island') || 
                   mesh.name === 'seaFloor' || 
                   mesh.name.includes('ground') ||
                   mesh.name.includes('terrain');
        });
    }

    /**
     * Enable placement mode for a specific marker type
     */
    enablePlacementMode(markerType) {
        if (!MarkerConfig[markerType]) {
            console.error(`Unknown marker type: ${markerType}`);
            return;
        }

        this.placementMode = markerType;
        this.createPreviewMarker();
        
        console.log(`🎯 Placement mode enabled: ${MarkerConfig[markerType].name}`);
    }

    /**
     * Disable placement mode
     */
    disablePlacementMode() {
        this.placementMode = null;
        
        if (this.previewMarker) {
            this.previewMarker.dispose();
            this.previewMarker = null;
        }
        
        console.log('🎯 Placement mode disabled');
    }

    /**
     * Create preview marker
     */
    createPreviewMarker() {
        if (this.previewMarker) {
            this.previewMarker.dispose();
        }

        this.previewMarker = createMarkerMesh(
            this.scene,
            this.placementMode,
            new BABYLON.Vector3(0, 0, 0)
        );
        
        // Make preview semi-transparent
        this.previewMarker.getChildMeshes().forEach(mesh => {
            if (mesh.material) {
                mesh.material.alpha = 0.5;
            }
        });
        
        this.previewMarker.setEnabled(false);
    }

    /**
     * Update preview marker position
     */
    updatePreview(position) {
        if (!this.previewMarker) return;

        this.previewMarker.position = position;
        this.previewMarker.setEnabled(true);
    }

    /**
     * Place a marker at the specified position
     */
    placeMarker(position) {
        if (!this.placementMode) return;

        const marker = createMarkerMesh(
            this.scene,
            this.placementMode,
            position
        );

        if (marker) {
            this.placedMarkers.push(marker);
            
            // Update hierarchy panel
            if (window.updateHierarchyPanel) {
                window.updateHierarchyPanel(this.scene);
            }
            
            console.log(`✅ Placed ${MarkerConfig[this.placementMode].name} at`, position);
            
            // Show marker properties panel
            this.showMarkerProperties(marker);
        }
    }

    /**
     * Show marker properties panel for editing
     */
    showMarkerProperties(marker) {
        const markerType = marker.metadata.markerType;
        const config = MarkerConfig[markerType];

        // Remove existing panel if any
        const existing = document.getElementById('marker-properties-panel');
        if (existing) existing.remove();

        // Create properties panel
        const panel = document.createElement('div');
        panel.id = 'marker-properties-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 20, 30, 0.98);
            border: 2px solid rgba(245, 202, 86, 0.5);
            border-radius: 8px;
            padding: 20px;
            z-index: 10000;
            min-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            font-family: Arial, sans-serif;
        `;

        panel.innerHTML = `
            <h3 style="color: rgb(245, 202, 86); margin-top: 0;">
                ${config.icon} ${config.name} Properties
            </h3>
            <div id="marker-properties-form"></div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="save-marker-btn" style="flex: 1; padding: 10px; background: rgba(245, 202, 86, 0.6); border: none; border-radius: 4px; color: white; cursor: pointer;">
                    💾 Save
                </button>
                <button id="cancel-marker-btn" style="flex: 1; padding: 10px; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 4px; color: white; cursor: pointer;">
                    ❌ Cancel
                </button>
            </div>
        `;

        // Generate form fields
        const form = panel.querySelector('#marker-properties-form');
        const markerData = marker.metadata.markerData;

        Object.keys(markerData).forEach(key => {
            const value = markerData[key];
            const fieldDiv = document.createElement('div');
            fieldDiv.style.cssText = 'margin: 10px 0;';

            const label = document.createElement('label');
            label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            label.style.cssText = 'display: block; margin-bottom: 5px; color: rgba(245, 202, 86, 0.8);';

            let input;
            if (typeof value === 'boolean') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = value;
            } else if (typeof value === 'number') {
                input = document.createElement('input');
                input.type = 'number';
                input.value = value;
                input.style.cssText = 'width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(245, 202, 86, 0.3); border-radius: 4px; color: white;';
            } else if (Array.isArray(value)) {
                input = document.createElement('textarea');
                input.value = JSON.stringify(value, null, 2);
                input.rows = 3;
                input.style.cssText = 'width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(245, 202, 86, 0.3); border-radius: 4px; color: white; font-family: monospace;';
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.style.cssText = 'width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(245, 202, 86, 0.3); border-radius: 4px; color: white;';
            }

            input.dataset.key = key;

            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            form.appendChild(fieldDiv);
        });

        // Add event listeners
        panel.querySelector('#save-marker-btn').onclick = () => {
            this.saveMarkerProperties(marker, panel);
        };

        panel.querySelector('#cancel-marker-btn').onclick = () => {
            panel.remove();
        };

        document.body.appendChild(panel);
    }

    /**
     * Save marker properties from the panel
     */
    saveMarkerProperties(marker, panel) {
        const inputs = panel.querySelectorAll('input, textarea');
        const newData = {};

        inputs.forEach(input => {
            const key = input.dataset.key;
            let value;

            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number') {
                value = parseFloat(input.value);
            } else if (input.tagName === 'TEXTAREA') {
                try {
                    value = JSON.parse(input.value);
                } catch (e) {
                    value = [];
                }
            } else {
                value = input.value;
            }

            newData[key] = value;
        });

        marker.metadata.markerData = newData;
        marker.metadata.lastModified = new Date().toISOString();

        console.log('💾 Marker properties saved:', newData);
        panel.remove();
    }

    /**
     * Get all placed markers
     */
    getAllMarkers() {
        return this.placedMarkers;
    }

    /**
     * Get markers by type
     */
    getMarkersByType(markerType) {
        return this.placedMarkers.filter(marker =>
            marker.metadata.markerType === markerType
        );
    }

    /**
     * Remove a marker
     */
    removeMarker(marker) {
        const index = this.placedMarkers.indexOf(marker);
        if (index > -1) {
            this.placedMarkers.splice(index, 1);
            marker.dispose();
            console.log('🗑️ Marker removed');
        }
    }

    /**
     * Export all markers to JSON
     */
    exportMarkers() {
        const data = this.placedMarkers.map(marker => ({
            type: marker.metadata.markerType,
            position: {
                x: marker.position.x,
                y: marker.position.y,
                z: marker.position.z
            },
            rotation: {
                x: marker.rotation.x,
                y: marker.rotation.y,
                z: marker.rotation.z
            },
            data: marker.metadata.markerData,
            createdAt: marker.metadata.createdAt,
            lastModified: marker.metadata.lastModified
        }));

        return data;
    }

    /**
     * Import markers from JSON
     */
    importMarkers(markersData) {
        markersData.forEach(markerData => {
            const position = new BABYLON.Vector3(
                markerData.position.x,
                markerData.position.y,
                markerData.position.z
            );

            const marker = createMarkerMesh(
                this.scene,
                markerData.type,
                position
            );

            if (marker) {
                marker.rotation = new BABYLON.Vector3(
                    markerData.rotation.x,
                    markerData.rotation.y,
                    markerData.rotation.z
                );

                marker.metadata.markerData = markerData.data;
                marker.metadata.createdAt = markerData.createdAt;
                marker.metadata.lastModified = markerData.lastModified;

                this.placedMarkers.push(marker);
            }
        });

        console.log(`📥 Imported ${markersData.length} markers`);
    }

    /**
     * Clear all markers
     */
    clearAllMarkers() {
        this.placedMarkers.forEach(marker => marker.dispose());
        this.placedMarkers = [];
        console.log('🗑️ All markers cleared');
    }
}

