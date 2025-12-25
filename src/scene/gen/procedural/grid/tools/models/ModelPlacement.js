/**
 * Model Placement Tool
 * Place any model from the asset library into the scene
 */

import Tool from "../Tool.js";
import { getAssetLibrary } from "../../../../../../assets/AssetLibrary.js";

export default class ModelPlacement extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        super(name, scene, meshes, grid, tools, imageSrc, subTools);
        
        this.assetLibrary = getAssetLibrary();
        this.selectedModel = null;
        this.previewMesh = null;
        this.placedModels = [];
        this.rotationAngle = 0;
        this.scaleFactor = 1.0;
        
        this.setupPreview();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup preview mesh for placement
     */
    setupPreview() {
        // Create a simple preview indicator
        this.previewIndicator = BABYLON.MeshBuilder.CreateBox("previewIndicator", { size: 1 }, this.scene);
        this.previewIndicator.visibility = 0.5;
        this.previewIndicator.isPickable = false;
        
        const mat = new BABYLON.StandardMaterial("previewMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
        mat.alpha = 0.5;
        this.previewIndicator.material = mat;
        this.previewIndicator.setEnabled(false);
    }

    /**
     * Setup keyboard shortcuts for rotation and scaling
     */
    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (this.tools.selectedTool !== this) return;
            
            switch (e.key) {
                case 'r':
                case 'R':
                    this.rotationAngle += Math.PI / 4; // Rotate 45 degrees
                    this.updatePreview();
                    break;
                case '[':
                    this.scaleFactor = Math.max(0.1, this.scaleFactor - 0.1);
                    this.updatePreview();
                    break;
                case ']':
                    this.scaleFactor = Math.min(10, this.scaleFactor + 0.1);
                    this.updatePreview();
                    break;
            }
        });
    }

    /**
     * Select a model to place
     */
    async selectModel(category, modelId) {
        const asset = this.assetLibrary.get(category, modelId);
        if (!asset) {
            console.error(`Model not found: ${category}/${modelId}`);
            return;
        }

        this.selectedModel = { category, modelId, asset };
        
        // Load preview mesh
        const loaded = await this.assetLibrary.loadModel(this.scene, category, modelId);
        if (loaded) {
            if (this.previewMesh) {
                this.previewMesh.dispose();
            }
            this.previewMesh = loaded.mesh;
            this.previewMesh.visibility = 0.6;
            this.previewMesh.isPickable = false;
            
            // Apply preview material overlay
            this.previewMesh.getChildMeshes().forEach(child => {
                child.visibility = 0.6;
            });
        }
        
        console.log(`📦 Selected model: ${asset.name}`);
    }

    /**
     * Update preview position and rotation
     */
    updatePreview(position) {
        if (!this.previewMesh) return;
        
        if (position) {
            this.previewMesh.position = position.clone();
        }
        
        this.previewMesh.rotation.y = this.rotationAngle;
        this.previewMesh.scaling = new BABYLON.Vector3(
            this.scaleFactor,
            this.scaleFactor,
            this.scaleFactor
        );
    }

    /**
     * Handle pointer move for preview
     */
    pointerMove(pickResult) {
        if (this.selectedModel && this.previewMesh && pickResult.hit) {
            this.previewMesh.setEnabled(true);
            this.updatePreview(pickResult.pickedPoint);
        }
    }

    /**
     * Place the model at clicked position
     */
    async click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        if (!this.selectedModel || !pickedPoint) return;

        // Clone the model
        const loaded = await this.assetLibrary.loadModel(
            this.scene,
            this.selectedModel.category,
            this.selectedModel.modelId
        );
        
        if (!loaded) return;
        
        const mesh = loaded.mesh;
        mesh.setEnabled(true);
        mesh.position = pickedPoint.clone();
        mesh.rotation.y = this.rotationAngle;
        mesh.scaling = new BABYLON.Vector3(this.scaleFactor, this.scaleFactor, this.scaleFactor);
        
        // Store placement data
        const placement = {
            id: `placed_${Date.now()}`,
            category: this.selectedModel.category,
            modelId: this.selectedModel.modelId,
            position: { x: pickedPoint.x, y: pickedPoint.y, z: pickedPoint.z },
            rotation: this.rotationAngle,
            scale: this.scaleFactor,
            mesh
        };
        
        mesh.metadata = {
            isPlacedModel: true,
            placement
        };
        
        this.placedModels.push(placement);
        this.meshes.push(mesh);
        
        console.log(`✅ Placed ${this.selectedModel.asset.name} at`, pickedPoint);
    }

    drag(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        // Optional: continuous placement while dragging
    }

    /**
     * Get all placed models
     */
    getPlacedModels() {
        return this.placedModels;
    }

    /**
     * Remove a placed model
     */
    removeModel(placementId) {
        const index = this.placedModels.findIndex(p => p.id === placementId);
        if (index !== -1) {
            const placement = this.placedModels[index];
            placement.mesh.dispose();
            this.placedModels.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Clear all placed models
     */
    clearAll() {
        for (const placement of this.placedModels) {
            placement.mesh.dispose();
        }
        this.placedModels = [];
    }

    /**
     * Export placements as JSON
     */
    exportPlacements() {
        return this.placedModels.map(p => ({
            category: p.category,
            modelId: p.modelId,
            position: p.position,
            rotation: p.rotation,
            scale: p.scale
        }));
    }

    /**
     * Import placements from JSON
     */
    async importPlacements(placements) {
        for (const p of placements) {
            await this.selectModel(p.category, p.modelId);
            this.rotationAngle = p.rotation;
            this.scaleFactor = p.scale;

            const point = new BABYLON.Vector3(p.position.x, p.position.y, p.position.z);
            await this.click(0, 0, 0, null, point);
        }
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.previewIndicator) this.previewIndicator.dispose();
        if (this.previewMesh) this.previewMesh.dispose();
        this.clearAll();
    }
}

