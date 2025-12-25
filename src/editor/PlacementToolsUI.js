/**
 * PlacementToolsUI - UI panel for placement tools in the editor
 */

import { MarkerTypes, MarkerConfig } from './MarkerDefinitions.js';

export class PlacementToolsUI {
    constructor(placementTools) {
        this.placementTools = placementTools;
        this.panel = null;
        this.activeButton = null;
        
        this.createPanel();
    }

    /**
     * Create the placement tools panel
     */
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'placement-tools-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(20, 20, 30, 0.95);
            border: 2px solid rgba(245, 202, 86, 0.5);
            border-radius: 8px;
            padding: 15px;
            z-index: 1000;
            min-width: 200px;
            color: white;
            font-family: Arial, sans-serif;
            backdrop-filter: blur(10px);
        `;

        this.panel.innerHTML = `
            <h3 style="color: rgb(245, 202, 86); margin: 0 0 15px 0; font-size: 16px;">
                🎯 Placement Tools
            </h3>
            <div id="placement-buttons"></div>
            <hr style="border: 1px solid rgba(245, 202, 86, 0.3); margin: 15px 0;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="clear-placement-btn" style="padding: 8px; background: rgba(255, 100, 100, 0.6); border: none; border-radius: 4px; color: white; cursor: pointer;">
                    🗑️ Clear All Markers
                </button>
                <button id="export-markers-btn" style="padding: 8px; background: rgba(100, 200, 100, 0.6); border: none; border-radius: 4px; color: white; cursor: pointer;">
                    💾 Export Markers
                </button>
                <button id="import-markers-btn" style="padding: 8px; background: rgba(100, 150, 255, 0.6); border: none; border-radius: 4px; color: white; cursor: pointer;">
                    📥 Import Markers
                </button>
            </div>
        `;

        // Create buttons for each marker type
        const buttonsContainer = this.panel.querySelector('#placement-buttons');
        
        Object.entries(MarkerTypes).forEach(([key, markerType]) => {
            const config = MarkerConfig[markerType];
            const button = document.createElement('button');
            button.id = `place-${markerType}-btn`;
            button.style.cssText = `
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(245, 202, 86, 0.3);
                border-radius: 4px;
                color: white;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            `;
            button.innerHTML = `${config.icon} ${config.name}`;
            
            button.onmouseover = () => {
                button.style.background = 'rgba(245, 202, 86, 0.3)';
                button.style.borderColor = 'rgba(245, 202, 86, 0.8)';
            };
            
            button.onmouseout = () => {
                if (this.activeButton !== button) {
                    button.style.background = 'rgba(255, 255, 255, 0.1)';
                    button.style.borderColor = 'rgba(245, 202, 86, 0.3)';
                }
            };
            
            button.onclick = () => {
                this.togglePlacementMode(markerType, button);
            };
            
            buttonsContainer.appendChild(button);
        });

        // Setup action buttons
        this.panel.querySelector('#clear-placement-btn').onclick = () => {
            if (confirm('Are you sure you want to clear all markers?')) {
                this.placementTools.clearAllMarkers();
            }
        };

        this.panel.querySelector('#export-markers-btn').onclick = () => {
            this.exportMarkers();
        };

        this.panel.querySelector('#import-markers-btn').onclick = () => {
            this.importMarkers();
        };

        document.body.appendChild(this.panel);
        console.log('✅ Placement tools UI created');
    }

    /**
     * Toggle placement mode
     */
    togglePlacementMode(markerType, button) {
        // If clicking the same button, disable placement mode
        if (this.activeButton === button) {
            this.placementTools.disablePlacementMode();
            button.style.background = 'rgba(255, 255, 255, 0.1)';
            button.style.borderColor = 'rgba(245, 202, 86, 0.3)';
            this.activeButton = null;
        } else {
            // Disable previous mode
            if (this.activeButton) {
                this.activeButton.style.background = 'rgba(255, 255, 255, 0.1)';
                this.activeButton.style.borderColor = 'rgba(245, 202, 86, 0.3)';
            }
            
            // Enable new mode
            this.placementTools.enablePlacementMode(markerType);
            button.style.background = 'rgba(245, 202, 86, 0.6)';
            button.style.borderColor = 'rgba(245, 202, 86, 1.0)';
            this.activeButton = button;
        }
    }

    /**
     * Export markers to JSON file
     */
    exportMarkers() {
        const markers = this.placementTools.exportMarkers();
        const json = JSON.stringify(markers, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `markers_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Markers exported');
    }

    /**
     * Import markers from JSON file
     */
    importMarkers() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const markers = JSON.parse(event.target.result);
                    this.placementTools.importMarkers(markers);
                    alert(`Imported ${markers.length} markers successfully!`);
                } catch (error) {
                    alert('Error importing markers: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Show/hide the panel
     */
    toggle() {
        this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * Destroy the panel
     */
    destroy() {
        if (this.panel) {
            this.panel.remove();
        }
    }
}

