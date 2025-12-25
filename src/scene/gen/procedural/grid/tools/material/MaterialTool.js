/**
 * MaterialTool - Builder tool for AI-powered material generation
 * Integrates NMEAgent and MaterialPanel into the builder workflow
 */
import Tool from "../Tool.js";
import MaterialPanel, { getMaterialPanel } from "../../../../../../ui/MaterialPanel.js";
import { NMEAgent } from "../../../../../../ai/NMEAgent.js";

export default class MaterialTool extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        super(name, scene, meshes, grid, tools, imageSrc, subTools);
        
        this.agent = new NMEAgent(scene);
        this.materialPanel = null;
        this.selectedMesh = null;
        this.highlightLayer = null;
        
        this.initMaterialPanel();
        this.setupMeshSelection();
    }

    initMaterialPanel() {
        this.materialPanel = getMaterialPanel(this.scene, {
            hotkey: 'm',
            onMaterialGenerated: (material) => {
                console.log('🎨 Material generated:', material.name);
            },
            onMaterialApplied: (material, mesh) => {
                console.log('✅ Material applied to:', mesh.name);
            }
        });
    }

    setupMeshSelection() {
        // Create highlight layer for selected mesh
        this.highlightLayer = new BABYLON.HighlightLayer("materialToolHighlight", this.scene);
        this.highlightLayer.outerGlow = true;
        this.highlightLayer.innerGlow = false;
        
        // Listen for mesh clicks when this tool is active
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (this.tools.selectedTool !== this) return;
            
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
                const pickResult = pointerInfo.pickInfo;
                if (pickResult.hit && pickResult.pickedMesh) {
                    this.selectMesh(pickResult.pickedMesh);
                }
            }
        });
    }

    selectMesh(mesh) {
        // Clear previous selection
        if (this.selectedMesh) {
            this.highlightLayer.removeMesh(this.selectedMesh);
        }
        
        this.selectedMesh = mesh;
        this.highlightLayer.addMesh(mesh, BABYLON.Color3.FromHexString("#64B4FF"));
        
        // Update material panel target
        if (this.materialPanel) {
            this.materialPanel.setTargetMesh(mesh);
        }
        
        console.log('🎯 Selected mesh for material:', mesh.name);
    }

    click(positions, currentPoint) {
        // Open material panel on click
        if (this.materialPanel) {
            this.materialPanel.open();
        }
    }

    drag(positions, currentPoint) {
        // No drag behavior for material tool
    }

    // Quick material application methods
    async applyQuickMaterial(description) {
        if (!this.selectedMesh) {
            console.warn('No mesh selected for material application');
            return null;
        }
        
        const material = await this.agent.generateMaterial(description, `Quick_${Date.now()}`);
        this.selectedMesh.material = material;
        return material;
    }

    // Get current selected mesh
    getSelectedMesh() {
        return this.selectedMesh;
    }

    // Clear selection
    clearSelection() {
        if (this.selectedMesh) {
            this.highlightLayer.removeMesh(this.selectedMesh);
            this.selectedMesh = null;
        }
    }

    // Dispose
    dispose() {
        this.clearSelection();
        if (this.highlightLayer) {
            this.highlightLayer.dispose();
        }
        if (this.materialPanel) {
            this.materialPanel.destroy();
        }
    }
}

