/**
 * Asset Browser UI
 * Visual interface for browsing and selecting assets
 * Works in builder mode and admin panel
 */

import { getAssetLibrary } from '../assets/AssetLibrary.js';
import { getEnemyManager } from '../assets/EnemyManager.js';
import { getCharacterManager } from '../assets/CharacterManager.js';

export class AssetBrowser {
    constructor(options = {}) {
        this.assetLibrary = getAssetLibrary();
        this.container = null;
        this.isOpen = false;
        this.selectedCategory = 'models';
        this.selectedAsset = null;
        this.onSelect = options.onSelect || (() => {});
        this.onImport = options.onImport || (() => {});
        
        this.categories = [
            { id: 'models', name: '📦 Models', icon: '📦' },
            { id: 'enemies', name: '👹 Enemies', icon: '👹' },
            { id: 'characters', name: '⚔️ Characters', icon: '⚔️' },
            { id: 'animations', name: '🎬 Animations', icon: '🎬' },
            { id: 'environments', name: '🌲 Environments', icon: '🌲' },
            { id: 'props', name: '🪑 Props', icon: '🪑' }
        ];
        
        this.createUI();
    }

    /**
     * Create the browser UI
     */
    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'assetBrowser';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 600px;
            background: rgba(20, 20, 30, 0.95);
            border: 2px solid rgba(245, 202, 86, 0.5);
            border-radius: 10px;
            z-index: 2000;
            display: none;
            flex-direction: column;
            font-family: Arial, sans-serif;
            color: white;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid rgba(245, 202, 86, 0.3);
            background: rgba(0, 0, 0, 0.3);
        `;
        
        const title = document.createElement('h2');
        title.textContent = '📚 Asset Browser';
        title.style.cssText = 'margin: 0; color: rgb(245, 202, 86);';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => this.close();
        header.appendChild(closeBtn);
        
        this.container.appendChild(header);

        // Main content area
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex: 1;
            overflow: hidden;
        `;

        // Sidebar (categories)
        const sidebar = this.createSidebar();
        content.appendChild(sidebar);

        // Asset grid
        this.assetGrid = document.createElement('div');
        this.assetGrid.style.cssText = `
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
            align-content: start;
        `;
        content.appendChild(this.assetGrid);

        this.container.appendChild(content);

        // Footer with import button
        const footer = this.createFooter();
        this.container.appendChild(footer);

        document.body.appendChild(this.container);
        
        // Initial load
        this.loadAssets(this.selectedCategory);
    }

    /**
     * Create sidebar with categories
     */
    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.style.cssText = `
            width: 180px;
            background: rgba(0, 0, 0, 0.2);
            border-right: 1px solid rgba(245, 202, 86, 0.2);
            padding: 10px;
        `;

        for (const cat of this.categories) {
            const btn = document.createElement('button');
            btn.textContent = cat.name;
            btn.dataset.category = cat.id;
            btn.style.cssText = `
                display: block;
                width: 100%;
                padding: 12px;
                margin-bottom: 5px;
                background: ${cat.id === this.selectedCategory ? 'rgba(245, 202, 86, 0.2)' : 'transparent'};
                border: 1px solid ${cat.id === this.selectedCategory ? 'rgba(245, 202, 86, 0.5)' : 'transparent'};
                border-radius: 5px;
                color: white;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            `;
            
            btn.onmouseover = () => {
                if (cat.id !== this.selectedCategory) {
                    btn.style.background = 'rgba(245, 202, 86, 0.1)';
                }
            };
            btn.onmouseout = () => {
                if (cat.id !== this.selectedCategory) {
                    btn.style.background = 'transparent';
                }
            };
            btn.onclick = () => this.selectCategory(cat.id);
            
            sidebar.appendChild(btn);
        }

        return sidebar;
    }

    /**
     * Create footer with actions
     */
    createFooter() {
        const footer = document.createElement('div');
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-top: 1px solid rgba(245, 202, 86, 0.3);
            background: rgba(0, 0, 0, 0.3);
        `;

        // Import button
        const importBtn = document.createElement('button');
        importBtn.textContent = '📥 Import GLB';
        importBtn.style.cssText = `
            padding: 10px 20px;
            background: rgba(245, 202, 86, 0.2);
            border: 1px solid rgba(245, 202, 86, 0.5);
            border-radius: 5px;
            color: rgb(245, 202, 86);
            cursor: pointer;
            font-size: 14px;
        `;
        importBtn.onclick = () => this.showImportDialog();
        footer.appendChild(importBtn);

        // Select button
        const selectBtn = document.createElement('button');
        selectBtn.textContent = '✓ Select';
        selectBtn.style.cssText = `
            padding: 10px 30px;
            background: rgb(245, 202, 86);
            border: none;
            border-radius: 5px;
            color: black;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        selectBtn.onclick = () => this.confirmSelection();
        footer.appendChild(selectBtn);

        return footer;
    }

    /**
     * Select a category
     */
    selectCategory(categoryId) {
        this.selectedCategory = categoryId;

        // Update sidebar buttons
        const buttons = this.container.querySelectorAll('[data-category]');
        buttons.forEach(btn => {
            const isSelected = btn.dataset.category === categoryId;
            btn.style.background = isSelected ? 'rgba(245, 202, 86, 0.2)' : 'transparent';
            btn.style.border = isSelected ? '1px solid rgba(245, 202, 86, 0.5)' : '1px solid transparent';
        });

        this.loadAssets(categoryId);
    }

    /**
     * Load assets for a category
     */
    loadAssets(category) {
        this.assetGrid.innerHTML = '';

        const assets = this.assetLibrary.getAll(category);

        if (assets.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
                color: rgba(255, 255, 255, 0.5);
            `;
            empty.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                <div>No assets in this category</div>
                <div style="font-size: 12px; margin-top: 5px;">Click "Import GLB" to add assets</div>
            `;
            this.assetGrid.appendChild(empty);
            return;
        }

        for (const asset of assets) {
            const card = this.createAssetCard(asset, category);
            this.assetGrid.appendChild(card);
        }
    }

    /**
     * Create an asset card
     */
    createAssetCard(asset, category) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid ${this.selectedAsset?.id === asset.id ? 'rgb(245, 202, 86)' : 'rgba(255, 255, 255, 0.1)'};
            border-radius: 8px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        `;

        card.onmouseover = () => {
            if (this.selectedAsset?.id !== asset.id) {
                card.style.borderColor = 'rgba(245, 202, 86, 0.5)';
            }
        };
        card.onmouseout = () => {
            if (this.selectedAsset?.id !== asset.id) {
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        };
        card.onclick = () => {
            this.selectedAsset = { ...asset, category };
            this.loadAssets(category); // Refresh to update selection
        };
        card.ondblclick = () => {
            this.selectedAsset = { ...asset, category };
            this.confirmSelection();
        };

        // Icon/Preview
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        `;

        // Category-based icon
        const icons = { models: '📦', enemies: '👹', characters: '⚔️', animations: '🎬', environments: '🌲', props: '🪑' };
        icon.textContent = icons[category] || '📄';
        card.appendChild(icon);

        // Name
        const name = document.createElement('div');
        name.textContent = asset.name || asset.id;
        name.style.cssText = `
            font-size: 12px;
            color: white;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        card.appendChild(name);

        return card;
    }

    /**
     * Show import dialog
     */
    showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.glb,.gltf';
        input.multiple = true;
        input.onchange = async (e) => {
            for (const file of e.target.files) {
                await this.importFile(file);
            }
            this.loadAssets(this.selectedCategory);
        };
        input.click();
    }

    /**
     * Import a file
     */
    async importFile(file) {
        this.onImport(file, this.selectedCategory);
    }

    /**
     * Confirm selection
     */
    confirmSelection() {
        if (this.selectedAsset) {
            this.onSelect(this.selectedAsset);
            this.close();
        }
    }

    /**
     * Open browser
     */
    open() {
        this.container.style.display = 'flex';
        this.isOpen = true;
        this.loadAssets(this.selectedCategory);
    }

    /**
     * Close browser
     */
    close() {
        this.container.style.display = 'none';
        this.isOpen = false;
    }

    /**
     * Toggle browser
     */
    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    /**
     * Destroy browser
     */
    destroy() {
        this.container.remove();
    }
}

// Global instance
let assetBrowserInstance = null;

export function getAssetBrowser(options) {
    if (!assetBrowserInstance) {
        assetBrowserInstance = new AssetBrowser(options);
    }
    return assetBrowserInstance;
}

export default AssetBrowser;

