/**
 * Scene Editor - Move/Resize tools for any scene
 * Press E to toggle edit mode, click meshes to select, use gizmos to transform
 */

export class SceneEditor {
    constructor(scene) {
        this.scene = scene;
        this.isEditMode = false;
        this.gizmoManager = null;
        this.selectedMesh = null;
        this.toolbar = null;
        this.currentTool = 'move'; // 'move', 'rotate', 'scale'
        
        this.setupGizmoManager();
        this.createToolbar();
        this.setupKeyboardShortcuts();
        
        console.log('🔧 Scene Editor initialized (Press E to toggle edit mode)');
    }

    setupGizmoManager() {
        this.gizmoManager = new BABYLON.GizmoManager(this.scene);
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.usePointerToAttachGizmos = false;
        
        // When a mesh is picked, select it
        this.gizmoManager.onAttachedToMeshObservable.add((mesh) => {
            this.selectedMesh = mesh;
            this.updateToolbarSelection();
        });
    }

    createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.id = 'sceneEditorToolbar';
        this.toolbar.innerHTML = `
            <div class="editor-title">🔧 Scene Editor</div>
            <div class="editor-tools">
                <button data-tool="move" class="active" title="Move (G)">📍 Move</button>
                <button data-tool="rotate" title="Rotate (R)">🔄 Rotate</button>
                <button data-tool="scale" title="Scale (S)">📐 Scale</button>
            </div>
            <div class="editor-info">
                <span id="selectedMeshName">No selection</span>
            </div>
            <div class="editor-actions">
                <button id="logTransform">📋 Log Transform</button>
                <button id="closeEditor">❌ Close</button>
            </div>
        `;
        this.toolbar.style.cssText = `
            position: fixed; top: 100px; right: 20px; z-index: 1000;
            background: rgba(20, 20, 30, 0.95); border: 2px solid rgba(100, 180, 255, 0.5);
            border-radius: 8px; padding: 10px; color: white; font-family: Arial, sans-serif;
            display: none; min-width: 180px;
        `;
        document.body.appendChild(this.toolbar);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #sceneEditorToolbar .editor-title { font-weight: bold; margin-bottom: 10px; color: #6ab4ff; }
            #sceneEditorToolbar .editor-tools { display: flex; gap: 5px; margin-bottom: 10px; }
            #sceneEditorToolbar button { 
                background: rgba(50, 50, 70, 0.8); border: 1px solid rgba(100, 180, 255, 0.3);
                color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;
            }
            #sceneEditorToolbar button:hover { background: rgba(70, 70, 100, 0.9); }
            #sceneEditorToolbar button.active { background: rgba(100, 180, 255, 0.4); border-color: #6ab4ff; }
            #sceneEditorToolbar .editor-info { font-size: 11px; color: #aaa; margin-bottom: 10px; }
            #sceneEditorToolbar .editor-actions { display: flex; gap: 5px; }
        `;
        document.head.appendChild(style);
        
        // Tool button handlers
        this.toolbar.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
        });
        
        // Action handlers
        this.toolbar.querySelector('#logTransform').addEventListener('click', () => this.logTransform());
        this.toolbar.querySelector('#closeEditor').addEventListener('click', () => this.toggleEditMode());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // E to toggle edit mode
            if (e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.altKey) {
                const activeEl = document.activeElement;
                if (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') {
                    this.toggleEditMode();
                }
            }
            
            if (!this.isEditMode) return;
            
            // Tool shortcuts when in edit mode
            switch(e.key.toLowerCase()) {
                case 'g': this.setTool('move'); break;
                case 'r': this.setTool('rotate'); break;
                case 's': 
                    if (!e.ctrlKey) this.setTool('scale'); 
                    break;
                case 'escape': this.deselectMesh(); break;
            }
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.toolbar.style.display = this.isEditMode ? 'block' : 'none';
        
        if (this.isEditMode) {
            this.gizmoManager.usePointerToAttachGizmos = true;
            this.setTool(this.currentTool);
            console.log('🔧 Edit mode ENABLED - Click meshes to select');
        } else {
            this.gizmoManager.usePointerToAttachGizmos = false;
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = false;
            this.deselectMesh();
            console.log('🔧 Edit mode DISABLED');
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        this.gizmoManager.positionGizmoEnabled = tool === 'move';
        this.gizmoManager.rotationGizmoEnabled = tool === 'rotate';
        this.gizmoManager.scaleGizmoEnabled = tool === 'scale';
        
        // Update toolbar buttons
        this.toolbar.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    }

    deselectMesh() {
        this.gizmoManager.attachToMesh(null);
        this.selectedMesh = null;
        this.updateToolbarSelection();
    }

    updateToolbarSelection() {
        const nameEl = this.toolbar.querySelector('#selectedMeshName');
        nameEl.textContent = this.selectedMesh ? `Selected: ${this.selectedMesh.name}` : 'No selection';
    }

    logTransform() {
        if (!this.selectedMesh) {
            console.log('No mesh selected');
            return;
        }
        const m = this.selectedMesh;
        console.log(`📋 Transform for "${m.name}":`);
        console.log(`  Position: new BABYLON.Vector3(${m.position.x.toFixed(3)}, ${m.position.y.toFixed(3)}, ${m.position.z.toFixed(3)})`);
        console.log(`  Rotation: new BABYLON.Vector3(${m.rotation.x.toFixed(3)}, ${m.rotation.y.toFixed(3)}, ${m.rotation.z.toFixed(3)})`);
        console.log(`  Scale: new BABYLON.Vector3(${m.scaling.x.toFixed(3)}, ${m.scaling.y.toFixed(3)}, ${m.scaling.z.toFixed(3)})`);
    }

    destroy() {
        if (this.gizmoManager) this.gizmoManager.dispose();
        if (this.toolbar) this.toolbar.remove();
    }
}

