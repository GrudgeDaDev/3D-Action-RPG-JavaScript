/**
 * Copy/Paste Tool
 * Copy and paste placed models
 */

import Tool from "../Tool.js";

export default class CopyPaste extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        super(name, scene, meshes, grid, tools, imageSrc, subTools);
        
        this.clipboard = null;
        this.previewMesh = null;
        this.highlightLayer = null;
        this.selectedMesh = null;
        
        this.setupHighlight();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup highlight layer
     */
    setupHighlight() {
        this.highlightLayer = new BABYLON.HighlightLayer("copyHighlight", this.scene);
        this.highlightLayer.innerGlow = true;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ctrl+C to copy (works even when not selected tool)
            if (e.ctrlKey && e.key === 'c' && this.selectedMesh) {
                this.copy(this.selectedMesh);
            }
            // Ctrl+V to paste
            if (e.ctrlKey && e.key === 'v' && this.clipboard) {
                this.tools.setSelectedTool('copypaste');
            }
        });
    }

    /**
     * Handle pointer move
     */
    pointerMove(pickResult) {
        // Clear previous selection highlight
        if (this.selectedMesh) {
            this.highlightLayer.removeMesh(this.selectedMesh);
        }

        // If we have something in clipboard, show preview
        if (this.clipboard && pickResult.hit) {
            this.updatePreview(pickResult.pickedPoint);
        }

        // Highlight copyable meshes
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            if (this.isCopyable(mesh)) {
                this.selectedMesh = mesh;
                this.highlightLayer.addMesh(mesh, BABYLON.Color3.Blue());
            }
        }
    }

    /**
     * Check if mesh can be copied
     */
    isCopyable(mesh) {
        if (!mesh) return false;
        return mesh.metadata?.isPlacedModel || 
               mesh.metadata?.isCopyable ||
               mesh.metadata?.isEnemy;
    }

    /**
     * Copy a mesh
     */
    copy(mesh) {
        if (!this.isCopyable(mesh)) return;

        this.clipboard = {
            mesh: mesh.clone(`clipboard_${Date.now()}`),
            metadata: { ...mesh.metadata },
            scaling: mesh.scaling.clone(),
            rotation: mesh.rotation.clone()
        };
        
        this.clipboard.mesh.setEnabled(false);
        
        // Create preview
        this.createPreview();
        
        console.log(`📋 Copied: ${mesh.name}`);
    }

    /**
     * Create preview mesh from clipboard
     */
    createPreview() {
        if (this.previewMesh) {
            this.previewMesh.dispose();
        }

        if (this.clipboard) {
            this.previewMesh = this.clipboard.mesh.clone(`preview_${Date.now()}`);
            this.previewMesh.setEnabled(true);
            this.previewMesh.visibility = 0.5;
            this.previewMesh.isPickable = false;
            
            // Make children also preview
            this.previewMesh.getChildMeshes().forEach(child => {
                child.visibility = 0.5;
                child.isPickable = false;
            });
        }
    }

    /**
     * Update preview position
     */
    updatePreview(position) {
        if (this.previewMesh && position) {
            this.previewMesh.position = position.clone();
        }
    }

    /**
     * Paste at clicked position
     */
    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint, pickResult) {
        // If no clipboard, try to copy clicked mesh
        if (!this.clipboard && pickResult?.pickedMesh && this.isCopyable(pickResult.pickedMesh)) {
            this.copy(pickResult.pickedMesh);
            return;
        }

        // Paste if we have clipboard
        if (this.clipboard && pickedPoint) {
            this.paste(pickedPoint);
        }
    }

    /**
     * Paste clipboard at position
     */
    paste(position) {
        if (!this.clipboard) return;

        const pasted = this.clipboard.mesh.clone(`pasted_${Date.now()}`);
        pasted.setEnabled(true);
        pasted.visibility = 1;
        pasted.isPickable = true;
        pasted.position = position.clone();
        pasted.rotation = this.clipboard.rotation.clone();
        pasted.scaling = this.clipboard.scaling.clone();
        
        pasted.metadata = {
            ...this.clipboard.metadata,
            isPlacedModel: true,
            isPasted: true
        };

        // Make children visible
        pasted.getChildMeshes().forEach(child => {
            child.visibility = 1;
            child.isPickable = true;
        });

        this.meshes.push(pasted);
        
        console.log(`📌 Pasted at`, position);
        return pasted;
    }

    /**
     * Clear clipboard
     */
    clearClipboard() {
        if (this.clipboard) {
            this.clipboard.mesh.dispose();
            this.clipboard = null;
        }
        if (this.previewMesh) {
            this.previewMesh.dispose();
            this.previewMesh = null;
        }
    }

    drag(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        // Optional: paste while dragging
    }

    dispose() {
        this.clearClipboard();
        if (this.highlightLayer) this.highlightLayer.dispose();
    }
}
