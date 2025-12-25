/**
 * Drag & Drop Import System
 * Allows dragging GLB files directly into the game
 */

import { getAssetLibrary } from '../assets/AssetLibrary.js';
import { getEnemyManager } from '../assets/EnemyManager.js';
import { getCharacterManager } from '../assets/CharacterManager.js';
import { getAnimationManager } from '../assets/AnimationManager.js';

export class DragDropImport {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.assetLibrary = getAssetLibrary();
        this.enemyManager = null;
        this.characterManager = null;
        this.animationManager = null;
        
        this.dropZone = null;
        this.overlay = null;
        this.isEnabled = true;
        
        this.onImport = options.onImport || (() => {});
        this.onError = options.onError || ((err) => console.error(err));
        
        this.setupDropZone();
        this.initManagers();
    }

    /**
     * Initialize managers lazily
     */
    initManagers() {
        try {
            this.enemyManager = getEnemyManager(this.scene);
            this.characterManager = getCharacterManager(this.scene);
            this.animationManager = getAnimationManager(this.scene);
        } catch (e) {
            console.warn('Some managers not available:', e);
        }
    }

    /**
     * Setup drag & drop zone
     */
    setupDropZone() {
        // Create overlay for drag feedback
        this.overlay = document.createElement('div');
        this.overlay.id = 'dragDropOverlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(245, 202, 86, 0.1);
            border: 4px dashed rgb(245, 202, 86);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            pointer-events: none;
        `;

        const dropMessage = document.createElement('div');
        dropMessage.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            padding: 40px 60px;
            border-radius: 15px;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
        `;
        dropMessage.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
            <div style="font-size: 24px; color: rgb(245, 202, 86);">Drop GLB File Here</div>
            <div style="font-size: 14px; margin-top: 10px; color: rgba(255,255,255,0.6);">
                Supports: .glb, .gltf
            </div>
        `;
        this.overlay.appendChild(dropMessage);
        document.body.appendChild(this.overlay);

        // Setup event listeners on document
        document.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
    }

    /**
     * Handle drag enter
     */
    handleDragEnter(e) {
        if (!this.isEnabled) return;
        e.preventDefault();
        
        if (this.containsFiles(e)) {
            this.overlay.style.display = 'flex';
        }
    }

    /**
     * Handle drag over
     */
    handleDragOver(e) {
        if (!this.isEnabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(e) {
        if (!this.isEnabled) return;
        
        // Only hide if leaving the window
        if (e.relatedTarget === null || !document.body.contains(e.relatedTarget)) {
            this.overlay.style.display = 'none';
        }
    }

    /**
     * Handle file drop
     */
    async handleDrop(e) {
        if (!this.isEnabled) return;
        e.preventDefault();
        this.overlay.style.display = 'none';

        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(f => 
            f.name.endsWith('.glb') || f.name.endsWith('.gltf')
        );

        if (validFiles.length === 0) {
            this.showNotification('No valid GLB/GLTF files found', 'error');
            return;
        }

        for (const file of validFiles) {
            await this.importFile(file);
        }
    }

    /**
     * Check if drag event contains files
     */
    containsFiles(e) {
        if (e.dataTransfer.types) {
            for (const type of e.dataTransfer.types) {
                if (type === 'Files') return true;
            }
        }
        return false;
    }

    /**
     * Import a single file
     */
    async importFile(file) {
        this.showNotification(`Importing ${file.name}...`, 'info');

        try {
            // Detect type based on filename
            const category = this.detectCategory(file.name);
            
            let result;
            
            switch (category) {
                case 'enemies':
                    result = await this.enemyManager?.importEnemy(this.scene, file);
                    break;
                case 'characters':
                    result = await this.characterManager?.importCharacter(this.scene, file);
                    break;
                case 'animations':
                    result = await this.animationManager?.importAnimations(this.scene, file);
                    break;
                default:
                    result = await this.assetLibrary.importFromFile(this.scene, file, category);
            }

            if (result) {
                this.showNotification(`✅ Imported: ${file.name}`, 'success');
                this.onImport(result, category, file);

                // Show import dialog for configuration
                this.showImportConfigDialog(result, category, file);
            } else {
                throw new Error('Import returned null');
            }
        } catch (error) {
            this.showNotification(`❌ Failed to import: ${file.name}`, 'error');
            this.onError(error);
            console.error('Import error:', error);
        }
    }

    /**
     * Detect category based on filename
     */
    detectCategory(filename) {
        const lower = filename.toLowerCase();

        if (lower.includes('enemy') || lower.includes('monster') || lower.includes('mob')) {
            return 'enemies';
        }
        if (lower.includes('character') || lower.includes('player') || lower.includes('hero')) {
            return 'characters';
        }
        if (lower.includes('anim') || lower.includes('motion')) {
            return 'animations';
        }
        if (lower.includes('tree') || lower.includes('rock') || lower.includes('grass') || lower.includes('terrain')) {
            return 'environments';
        }
        if (lower.includes('prop') || lower.includes('furniture') || lower.includes('item')) {
            return 'props';
        }

        return 'models';
    }

    /**
     * Show import configuration dialog
     */
    showImportConfigDialog(result, category, file) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 20, 30, 0.95);
            border: 2px solid rgba(245, 202, 86, 0.5);
            border-radius: 10px;
            padding: 30px;
            z-index: 4000;
            min-width: 400px;
            font-family: Arial, sans-serif;
            color: white;
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: rgb(245, 202, 86);">✅ Import Successful</h3>
            <div style="margin-bottom: 15px;">
                <strong>File:</strong> ${file.name}<br>
                <strong>Category:</strong> ${category}<br>
                <strong>ID:</strong> ${result.id}
            </div>
            ${result.animationGroups?.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong>Animations Found:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${result.animationGroups.map(g => `<li>${g.name}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px;">Rename Asset:</label>
                <input type="text" id="assetName" value="${result.id}" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid rgba(245, 202, 86, 0.3);
                    background: rgba(0, 0, 0, 0.3);
                    color: white;
                    border-radius: 5px;
                ">
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="closeBtn" style="
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                ">Close</button>
                <button id="saveBtn" style="
                    padding: 10px 20px;
                    background: rgb(245, 202, 86);
                    border: none;
                    color: black;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Save</button>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#closeBtn').onclick = () => dialog.remove();
        dialog.querySelector('#saveBtn').onclick = () => {
            const newName = dialog.querySelector('#assetName').value;
            if (newName !== result.id) {
                this.assetLibrary.update(category, result.id, { name: newName });
            }
            dialog.remove();
        };
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            info: 'rgba(0, 150, 255, 0.9)',
            success: 'rgba(0, 200, 100, 0.9)',
            error: 'rgba(255, 50, 50, 0.9)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 5000;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Enable drag & drop
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Disable drag & drop
     */
    disable() {
        this.isEnabled = false;
        this.overlay.style.display = 'none';
    }

    /**
     * Destroy
     */
    destroy() {
        this.overlay.remove();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

export default DragDropImport;

