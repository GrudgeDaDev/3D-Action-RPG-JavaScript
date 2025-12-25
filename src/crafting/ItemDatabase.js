/**
 * ItemDatabase.js
 * Central database for all items in the game (TheForge integration)
 * Manages 590+ items from TheForge crafting system
 */

export class ItemDatabase {
    constructor() {
        this.items = new Map();
        this.categories = new Map();
        this.rarityColors = {
            0: '#9D9D9D', // Common (Gray)
            1: '#1EFF00', // Uncommon (Green)
            2: '#0070DD', // Rare (Blue)
            3: '#A335EE', // Epic (Purple)
            4: '#FF8000', // Legendary (Orange)
            5: '#E6CC80'  // Mythic (Gold)
        };
        this.rarityNames = {
            0: 'Common',
            1: 'Uncommon',
            2: 'Rare',
            3: 'Epic',
            4: 'Legendary',
            5: 'Mythic'
        };
    }

    /**
     * Initialize database from TheForge data
     */
    async initialize(craftingDataPath = '/examples/crafting_data.json') {
        try {
            const response = await fetch(craftingDataPath);
            const data = await response.json();
            
            this.loadFromTheForgeData(data);
            console.log(`✅ ItemDatabase initialized with ${this.items.size} items`);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize ItemDatabase:', error);
            return false;
        }
    }

    /**
     * Load items from TheForge crafting_data.json format
     */
    loadFromTheForgeData(data) {
        if (!data.workstations) return;

        for (const [workstationName, workstationData] of Object.entries(data.workstations)) {
            // Load ingredients
            if (workstationData.ingredients) {
                workstationData.ingredients.forEach(item => {
                    this.registerItem({
                        id: this.generateItemId(item.name),
                        name: item.name,
                        description: item.description || '',
                        rarity: item.rarity || 0,
                        maxStack: item.maxStack || 100,
                        category: 'ingredient',
                        workstation: workstationName,
                        icon: workstationData.emoji || '📦'
                    });
                });
            }

            // Load craftable items
            if (workstationData.craftables) {
                workstationData.craftables.forEach(item => {
                    this.registerItem({
                        id: this.generateItemId(item.name),
                        name: item.name,
                        description: item.description || '',
                        rarity: item.rarity || 0,
                        maxStack: item.maxStack || 1,
                        category: 'craftable',
                        workstation: workstationName,
                        icon: workstationData.emoji || '⚒️',
                        recipe: item.recipe || null
                    });
                });
            }
        }
    }

    /**
     * Register a new item
     */
    registerItem(itemData) {
        const item = {
            id: itemData.id,
            name: itemData.name,
            description: itemData.description || '',
            rarity: itemData.rarity || 0,
            maxStack: itemData.maxStack || 1,
            category: itemData.category || 'misc',
            workstation: itemData.workstation || null,
            icon: itemData.icon || '📦',
            stats: itemData.stats || {},
            recipe: itemData.recipe || null,
            sellValue: itemData.sellValue || 0,
            buyValue: itemData.buyValue || 0,
            weight: itemData.weight || 1,
            level: itemData.level || 1,
            dateAdded: new Date().toISOString()
        };

        this.items.set(item.id, item);

        // Add to category
        if (!this.categories.has(item.category)) {
            this.categories.set(item.category, []);
        }
        this.categories.get(item.category).push(item.id);

        return item;
    }

    /**
     * Get item by ID
     */
    getItem(itemId) {
        return this.items.get(itemId);
    }

    /**
     * Get item by name
     */
    getItemByName(name) {
        const id = this.generateItemId(name);
        return this.items.get(id);
    }

    /**
     * Get all items in a category
     */
    getItemsByCategory(category) {
        const itemIds = this.categories.get(category) || [];
        return itemIds.map(id => this.items.get(id));
    }

    /**
     * Get items by rarity
     */
    getItemsByRarity(rarity) {
        return Array.from(this.items.values()).filter(item => item.rarity === rarity);
    }

    /**
     * Search items by name
     */
    searchItems(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.items.values()).filter(item => 
            item.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Generate consistent item ID from name
     */
    generateItemId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    /**
     * Get rarity color
     */
    getRarityColor(rarity) {
        return this.rarityColors[rarity] || this.rarityColors[0];
    }

    /**
     * Get rarity name
     */
    getRarityName(rarity) {
        return this.rarityNames[rarity] || 'Common';
    }
}

// Singleton instance
let itemDatabaseInstance = null;

export function getItemDatabase() {
    if (!itemDatabaseInstance) {
        itemDatabaseInstance = new ItemDatabase();
    }
    return itemDatabaseInstance;
}

