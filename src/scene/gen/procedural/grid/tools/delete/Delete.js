/**
 * Delete Tool
 * Remove placed models and terrain elements
 */

import Tool from "../Tool.js";

export default class Delete extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        super(name, scene, meshes, grid, tools, imageSrc, subTools);
        
        this.highlightedMesh = null;
        this.highlightLayer = null;
        this.deletedHistory = []; // For undo
        
        this.setupHighlight();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup highlight layer for delete preview
     */
    setupHighlight() {
        this.highlightLayer = new BABYLON.HighlightLayer("deleteHighlight", this.scene);
        this.highlightLayer.innerGlow = false;
        this.highlightLayer.outerGlow = true;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (this.tools.selectedTool !== this) return;
            
            // Ctrl+Z to undo
            if (e.ctrlKey && e.key === 'z') {
                this.undo();
            }
            // Delete key to delete highlighted
            if (e.key === 'Delete' && this.highlightedMesh) {
                this.deleteHighlighted();
            }
        });
    }

    /**
     * Handle pointer move for highlight preview
     */
    pointerMove(pickResult) {
        // Clear previous highlight
        if (this.highlightedMesh) {
            this.highlightLayer.removeMesh(this.highlightedMesh);
            this.highlightedMesh = null;
        }

        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            // Check if mesh is deletable
            if (this.isDeletable(mesh)) {
                this.highlightedMesh = mesh;
                this.highlightLayer.addMesh(mesh, BABYLON.Color3.Red());
            }
        }
    }

    /**
     * Check if a mesh can be deleted
     */
    isDeletable(mesh) {
        // Don't delete terrain, cameras, lights, etc.
        if (!mesh) return false;
        if (mesh.name.includes('ground') || mesh.name.includes('terrain')) return false;
        if (mesh.name.includes('camera') || mesh.name.includes('light')) return false;
        if (mesh.metadata?.isPlayer) return false;
        
        // Can delete placed models, enemies, props
        return mesh.metadata?.isPlacedModel || 
               mesh.metadata?.isEnemy || 
               mesh.metadata?.isProp ||
               mesh.metadata?.isDeletable;
    }

    /**
     * Delete on click
     */
    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint, pickResult) {
        if (pickResult && pickResult.pickedMesh && this.isDeletable(pickResult.pickedMesh)) {
            this.deleteMesh(pickResult.pickedMesh);
        }
    }

    /**
     * Delete highlighted mesh
     */
    deleteHighlighted() {
        if (this.highlightedMesh) {
            this.deleteMesh(this.highlightedMesh);
            this.highlightedMesh = null;
        }
    }

    /**
     * Delete a mesh
     */
    deleteMesh(mesh) {
        // Store for undo
        this.deletedHistory.push({
            mesh: mesh.clone(),
            position: mesh.position.clone(),
            rotation: mesh.rotation.clone(),
            scaling: mesh.scaling.clone(),
            metadata: { ...mesh.metadata },
            name: mesh.name
        });

        // Remove from highlight
        this.highlightLayer.removeMesh(mesh);

        // Remove from meshes array
        const index = this.meshes.indexOf(mesh);
        if (index !== -1) {
            this.meshes.splice(index, 1);
        }

        // Dispose mesh
        console.log(`🗑️ Deleted: ${mesh.name}`);
        mesh.dispose();
    }

    /**
     * Undo last delete
     */
    undo() {
        if (this.deletedHistory.length === 0) {
            console.log('Nothing to undo');
            return;
        }

        const last = this.deletedHistory.pop();
        const restored = last.mesh;
        restored.position = last.position;
        restored.rotation = last.rotation;
        restored.scaling = last.scaling;
        restored.metadata = last.metadata;
        restored.setEnabled(true);
        
        this.meshes.push(restored);
        
        console.log(`↩️ Restored: ${last.name}`);
    }

    /**
     * Delete all placed models
     */
    deleteAllPlaced() {
        const toDelete = this.meshes.filter(m => m.metadata?.isPlacedModel);
        for (const mesh of toDelete) {
            this.deleteMesh(mesh);
        }
    }

    drag(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        // Optional: delete while dragging
    }

    dispose() {
        if (this.highlightLayer) this.highlightLayer.dispose();
    }
}
