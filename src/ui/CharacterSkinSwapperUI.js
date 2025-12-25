/**
 * Character Skin Swapper UI
 * Settings panel for swapping character skins for testing
 */

export class CharacterSkinSwapperUI {
    constructor(skinManager, onSkinApplied) {
        this.skinManager = skinManager;
        this.onSkinApplied = onSkinApplied;
        this.container = null;
        this.isVisible = false;
    }

    /**
     * Create the UI
     */
    create() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'character-skin-swapper';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #8b5cf6;
            border-radius: 12px;
            padding: 20px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
            display: none;
            font-family: 'Arial', sans-serif;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #8b5cf6;
        `;

        const title = document.createElement('h2');
        title.textContent = '🎨 Character Skin Swapper';
        title.style.cssText = `
            margin: 0;
            color: #fff;
            font-size: 24px;
            text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: #ef4444;
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#dc2626';
        closeBtn.onmouseout = () => closeBtn.style.background = '#ef4444';
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);
        this.container.appendChild(header);

        // Create description
        const description = document.createElement('p');
        description.textContent = 'Select a character skin to test. Changes are instant and saved automatically.';
        description.style.cssText = `
            color: #a0a0a0;
            margin-bottom: 20px;
            font-size: 14px;
        `;
        this.container.appendChild(description);

        // Create categories
        this.createCategorySection('Playable Races', 'Playable Races');
        this.createCategorySection('Worges Forms', 'Worges Forms');
        this.createCategorySection('Legacy', 'Legacy');

        document.body.appendChild(this.container);
    }

    /**
     * Create a category section
     */
    createCategorySection(title, category) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 25px;
        `;

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = title;
        categoryTitle.style.cssText = `
            color: #8b5cf6;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 1px solid #8b5cf6;
            padding-bottom: 8px;
        `;
        section.appendChild(categoryTitle);

        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
        `;

        const skins = this.skinManager.getSkinsByCategory(category);
        skins.forEach(skin => {
            const card = this.createSkinCard(skin);
            grid.appendChild(card);
        });

        section.appendChild(grid);
        this.container.appendChild(section);
    }

    /**
     * Create a skin card
     */
    createSkinCard(skin) {
        const currentSkin = this.skinManager.getCurrentSkin();
        const isCurrent = currentSkin && currentSkin.id === skin.id;

        const card = document.createElement('div');
        card.style.cssText = `
            background: ${isCurrent ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : '#2a2a3e'};
            border: 2px solid ${isCurrent ? '#a78bfa' : '#444'};
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        `;

        card.onmouseover = () => {
            if (!isCurrent) {
                card.style.background = '#3a3a4e';
                card.style.borderColor = '#8b5cf6';
            }
        };

        card.onmouseout = () => {
            if (!isCurrent) {
                card.style.background = '#2a2a3e';
                card.style.borderColor = '#444';
            }
        };

        card.onclick = async () => {
            await this.selectSkin(skin.id);
        };

        const icon = document.createElement('div');
        icon.textContent = skin.icon;
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 10px;
        `;

        const name = document.createElement('div');
        name.textContent = skin.name;
        name.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        `;

        const status = document.createElement('div');
        status.textContent = isCurrent ? '✓ Active' : 'Click to apply';
        status.style.cssText = `
            color: ${isCurrent ? '#10b981' : '#a0a0a0'};
            font-size: 12px;
        `;

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(status);

        return card;
    }

    /**
     * Select and apply a skin
     */
    async selectSkin(skinId) {
        console.log(`🎨 Selecting skin: ${skinId}`);

        // Show loading indicator
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        `;
        loadingOverlay.innerHTML = `
            <div style="color: white; font-size: 24px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
                <div>Loading skin...</div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);

        try {
            // Apply skin through callback
            if (this.onSkinApplied) {
                await this.onSkinApplied(skinId);
            }

            // Refresh UI
            this.refresh();

            console.log(`✅ Skin applied: ${skinId}`);
        } catch (error) {
            console.error('❌ Failed to apply skin:', error);
            alert('Failed to apply skin. Check console for details.');
        } finally {
            // Remove loading overlay
            document.body.removeChild(loadingOverlay);
        }
    }

    /**
     * Refresh the UI
     */
    refresh() {
        // Remove old container
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Recreate UI
        this.create();

        // Restore visibility
        if (this.isVisible) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Show the UI
     */
    show() {
        if (!this.container) {
            this.create();
        }
        this.container.style.display = 'block';
        this.isVisible = true;
    }

    /**
     * Hide the UI
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.isVisible = false;
    }

    /**
     * Toggle visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Destroy the UI
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.isVisible = false;
    }
}

/**
 * Factory function to create CharacterSkinSwapperUI
 */
export function createCharacterSkinSwapperUI(skinManager, onSkinApplied) {
    return new CharacterSkinSwapperUI(skinManager, onSkinApplied);
}

