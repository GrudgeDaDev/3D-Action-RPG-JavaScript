/**
 * Tile Browser Panel
 * UI for browsing and selecting tiles/textures
 */

export class TileBrowserPanel {
    constructor(tileManager) {
        this.tileManager = tileManager;
        this.panel = null;
        this.selectedPart = null;
        this.onPartSelected = null; // Callback when part is selected
        this.currentCategory = 'all';
    }

    /**
     * Create the panel UI
     */
    createPanel() {
        // Create main panel
        this.panel = document.createElement('div');
        this.panel.id = 'tile-browser-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 320px;
            max-height: 600px;
            background: rgba(20, 20, 30, 0.95);
            border: 2px solid rgba(100, 150, 255, 0.5);
            border-radius: 8px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        // Create header
        const header = document.createElement('div');
        header.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #6495ff; font-size: 18px;">
                🏗️ Tile Browser
            </h3>
        `;
        this.panel.appendChild(header);

        // Create search box
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search tiles...';
        searchBox.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            background: rgba(40, 40, 50, 0.8);
            border: 1px solid rgba(100, 150, 255, 0.3);
            border-radius: 4px;
            color: white;
            font-size: 14px;
        `;
        searchBox.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.panel.appendChild(searchBox);

        // Create category filter
        const categoryFilter = this.createCategoryFilter();
        this.panel.appendChild(categoryFilter);

        // Create tile grid
        this.tileGrid = document.createElement('div');
        this.tileGrid.id = 'tile-grid';
        this.tileGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 15px;
        `;
        this.panel.appendChild(this.tileGrid);

        // Add to document
        document.body.appendChild(this.panel);

        // Populate with tiles
        this.refreshTileGrid();

        console.log('✅ Tile Browser Panel created');
    }

    /**
     * Create category filter buttons
     */
    createCategoryFilter() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 10px;
        `;

        const categories = [
            { id: 'all', name: 'All', icon: '📦' },
            ...this.tileManager.getCategories()
        ];

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.textContent = `${cat.icon} ${cat.name}`;
            btn.style.cssText = `
                padding: 6px 12px;
                background: ${this.currentCategory === cat.id ? 'rgba(100, 150, 255, 0.5)' : 'rgba(60, 60, 80, 0.8)'};
                border: 1px solid rgba(100, 150, 255, 0.3);
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            `;
            btn.addEventListener('click', () => this.filterByCategory(cat.id));
            btn.addEventListener('mouseenter', () => {
                if (this.currentCategory !== cat.id) {
                    btn.style.background = 'rgba(80, 80, 100, 0.8)';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (this.currentCategory !== cat.id) {
                    btn.style.background = 'rgba(60, 60, 80, 0.8)';
                }
            });
            container.appendChild(btn);
        });

        return container;
    }

    /**
     * Refresh the tile grid
     */
    refreshTileGrid(parts = null) {
        this.tileGrid.innerHTML = '';

        const partsToShow = parts || this.getFilteredParts();

        partsToShow.forEach(part => {
            const tile = this.createTileCard(part);
            this.tileGrid.appendChild(tile);
        });
    }

    /**
     * Get filtered parts based on current category
     */
    getFilteredParts() {
        if (this.currentCategory === 'all') {
            return this.tileManager.getAllParts();
        }
        return this.tileManager.getPartsByCategory(this.currentCategory);
    }

    /**
     * Create a tile card
     */
    createTileCard(part) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(40, 40, 60, 0.8);
            border: 2px solid ${this.selectedPart === part.config.id ? 'rgba(100, 255, 100, 0.8)' : 'rgba(80, 80, 100, 0.5)'};
            border-radius: 6px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        `;

        // Icon/Preview (using emoji for now)
        const icon = document.createElement('div');
        icon.textContent = this.getCategoryIcon(part.category);
        icon.style.cssText = `
            font-size: 32px;
            margin-bottom: 8px;
        `;
        card.appendChild(icon);

        // Name
        const name = document.createElement('div');
        name.textContent = part.config.name;
        name.style.cssText = `
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #e0e0e0;
        `;
        card.appendChild(name);

        // Tags
        if (part.config.tags && part.config.tags.length > 0) {
            const tags = document.createElement('div');
            tags.textContent = part.config.tags.slice(0, 2).join(', ');
            tags.style.cssText = `
                font-size: 10px;
                color: #888;
            `;
            card.appendChild(tags);
        }

        // Click handler
        card.addEventListener('click', () => this.selectPart(part.config.id));

        // Hover effects
        card.addEventListener('mouseenter', () => {
            if (this.selectedPart !== part.config.id) {
                card.style.borderColor = 'rgba(100, 150, 255, 0.8)';
                card.style.background = 'rgba(50, 50, 70, 0.9)';
            }
        });
        card.addEventListener('mouseleave', () => {
            if (this.selectedPart !== part.config.id) {
                card.style.borderColor = 'rgba(80, 80, 100, 0.5)';
                card.style.background = 'rgba(40, 40, 60, 0.8)';
            }
        });

        return card;
    }

    /**
     * Get icon for category
     */
    getCategoryIcon(category) {
        const icons = {
            'floors': '🟫',
            'walls': '🧱',
            'roofs': '🏠',
            'doors': '🚪',
            'foundations': '⬛',
            'props': '📦'
        };
        return icons[category] || '📦';
    }

    /**
     * Select a part
     */
    selectPart(partId) {
        this.selectedPart = partId;
        this.refreshTileGrid();

        if (this.onPartSelected) {
            this.onPartSelected(partId);
        }

        console.log(`✅ Selected part: ${partId}`);
    }

    /**
     * Filter by category
     */
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.refreshTileGrid();
        
        // Update category buttons
        this.createPanel(); // Recreate to update button states
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        if (!query || query.trim() === '') {
            this.refreshTileGrid();
            return;
        }

        const results = this.tileManager.searchParts(query);
        this.refreshTileGrid(results);
    }

    /**
     * Show/hide panel
     */
    toggle() {
        if (this.panel) {
            this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Get selected part ID
     */
    getSelectedPart() {
        return this.selectedPart;
    }

    /**
     * Destroy panel
     */
    destroy() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
        this.panel = null;
    }
}

/**
 * Factory function
 */
export function createTileBrowserPanel(tileManager) {
    return new TileBrowserPanel(tileManager);
}

