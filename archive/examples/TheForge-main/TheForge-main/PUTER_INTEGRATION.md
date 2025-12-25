# 🌐 Puter.com Integration Guide - GRUDGE NFT Island Catalog

Complete guide for integrating and communicating with the GRUDGE NFT Island Catalog on Puter.com platform.

## 🎯 Overview

This guide covers:
- Puter.com deployment specifics
- Inter-app communication
- Puter Workers integration
- Data sharing between applications
- Advanced Puter features

## 🚀 Puter.com Deployment

### Quick Deploy Steps
1. **Upload Files** - Upload entire `grudge-catalog-app` folder
2. **Set Main File** - Ensure `index.html` is the entry point
3. **Configure Permissions** - Set appropriate file access permissions
4. **Test Deployment** - Verify all features work correctly

### Puter-Specific Optimizations
```html
<!-- Already included in index.html -->
<meta name="puter:app-name" content="GRUDGE NFT Island Catalog">
<meta name="puter:app-description" content="Complete item catalog for GRUDGE NFT Island">
<meta name="puter:app-version" content="2.0.0">
<meta name="puter:app-author" content="GRUDGE NFT Island Team">
```

## 🔗 Puter Workers Integration

### Setting Up Puter Workers
```javascript
// Add to index.html for Puter Workers support
class PuterWorkerIntegration {
    constructor() {
        this.isInPuter = typeof puter !== 'undefined';
        this.workers = new Map();
        this.init();
    }

    async init() {
        if (!this.isInPuter) {
            console.log('Not running in Puter environment');
            return;
        }

        try {
            // Initialize Puter API
            await puter.auth.getUser();
            console.log('✅ Puter integration initialized');
            
            // Set up worker communication
            this.setupWorkerCommunication();
        } catch (error) {
            console.warn('Puter integration failed:', error);
        }
    }

    setupWorkerCommunication() {
        // Listen for messages from other Puter apps
        if (typeof puter.messaging !== 'undefined') {
            puter.messaging.on('catalog-request', this.handleCatalogRequest.bind(this));
            puter.messaging.on('item-lookup', this.handleItemLookup.bind(this));
            puter.messaging.on('crafting-query', this.handleCraftingQuery.bind(this));
        }
    }

    // Handle requests for catalog data
    async handleCatalogRequest(message) {
        const { requestId, filters } = message.data;
        
        try {
            let items = itemsData;
            
            // Apply filters if provided
            if (filters) {
                if (filters.category) {
                    items = items.filter(item => item.category === filters.category);
                }
                if (filters.rarity) {
                    items = items.filter(item => item.rarity === filters.rarity);
                }
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    items = items.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) ||
                        (item.description && item.description.toLowerCase().includes(searchTerm))
                    );
                }
            }

            // Send response back
            puter.messaging.send(message.sender, 'catalog-response', {
                requestId,
                items,
                totalCount: items.length
            });
        } catch (error) {
            puter.messaging.send(message.sender, 'catalog-error', {
                requestId,
                error: error.message
            });
        }
    }

    // Handle specific item lookups
    async handleItemLookup(message) {
        const { requestId, itemName } = message.data;
        
        try {
            const item = itemsData.find(i => 
                i.name.toLowerCase() === itemName.toLowerCase()
            );

            puter.messaging.send(message.sender, 'item-response', {
                requestId,
                item: item || null,
                found: !!item
            });
        } catch (error) {
            puter.messaging.send(message.sender, 'item-error', {
                requestId,
                error: error.message
            });
        }
    }

    // Handle crafting recipe queries
    async handleCraftingQuery(message) {
        const { requestId, workstation, itemName } = message.data;
        
        try {
            let recipes = craftingData.recipes || [];
            
            if (workstation) {
                recipes = recipes.filter(r => r.workstation === workstation);
            }
            
            if (itemName) {
                recipes = recipes.filter(r => 
                    r.result && r.result.name.toLowerCase().includes(itemName.toLowerCase())
                );
            }

            puter.messaging.send(message.sender, 'crafting-response', {
                requestId,
                recipes,
                totalCount: recipes.length
            });
        } catch (error) {
            puter.messaging.send(message.sender, 'crafting-error', {
                requestId,
                error: error.message
            });
        }
    }

    // Public API for other apps to use
    async queryItems(filters = {}) {
        return new Promise((resolve, reject) => {
            const requestId = Date.now().toString();
            
            // Set up response handler
            const responseHandler = (message) => {
                if (message.data.requestId === requestId) {
                    puter.messaging.off('catalog-response', responseHandler);
                    puter.messaging.off('catalog-error', errorHandler);
                    resolve(message.data);
                }
            };
            
            const errorHandler = (message) => {
                if (message.data.requestId === requestId) {
                    puter.messaging.off('catalog-response', responseHandler);
                    puter.messaging.off('catalog-error', errorHandler);
                    reject(new Error(message.data.error));
                }
            };
            
            puter.messaging.on('catalog-response', responseHandler);
            puter.messaging.on('catalog-error', errorHandler);
            
            // Send request to self (for consistency)
            this.handleCatalogRequest({
                data: { requestId, filters },
                sender: 'self'
            });
        });
    }
}

// Initialize Puter integration
let puterIntegration;
if (typeof puter !== 'undefined') {
    puterIntegration = new PuterWorkerIntegration();
}
```

## 📡 Inter-App Communication

### Sending Data to Other Apps
```javascript
// Example: Send item data to another Puter app
async function sendItemToApp(appId, itemName) {
    if (!puterIntegration || !puterIntegration.isInPuter) return;
    
    const item = itemsData.find(i => i.name === itemName);
    if (!item) return;
    
    try {
        await puter.messaging.send(appId, 'item-data', {
            item,
            timestamp: Date.now(),
            source: 'grudge-catalog'
        });
        console.log(`✅ Sent item "${itemName}" to app ${appId}`);
    } catch (error) {
        console.error('Failed to send item data:', error);
    }
}

// Example: Request data from another app
async function requestDataFromApp(appId, dataType) {
    if (!puterIntegration || !puterIntegration.isInPuter) return;
    
    return new Promise((resolve, reject) => {
        const requestId = Date.now().toString();
        
        const responseHandler = (message) => {
            if (message.data.requestId === requestId) {
                puter.messaging.off('data-response', responseHandler);
                resolve(message.data);
            }
        };
        
        puter.messaging.on('data-response', responseHandler);
        
        puter.messaging.send(appId, 'data-request', {
            requestId,
            dataType,
            requester: 'grudge-catalog'
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            puter.messaging.off('data-response', responseHandler);
            reject(new Error('Request timeout'));
        }, 10000);
    });
}
```

### Receiving Data from Other Apps
```javascript
// Listen for external app requests
if (typeof puter !== 'undefined' && puter.messaging) {
    // Handle inventory sync requests
    puter.messaging.on('inventory-sync', async (message) => {
        const { playerInventory } = message.data;
        
        // Highlight items that player owns
        highlightOwnedItems(playerInventory);
        
        // Send confirmation
        puter.messaging.send(message.sender, 'sync-complete', {
            status: 'success',
            itemsHighlighted: playerInventory.length
        });
    });
    
    // Handle wishlist requests
    puter.messaging.on('wishlist-request', async (message) => {
        const { itemNames } = message.data;
        
        const wishlistItems = itemsData.filter(item => 
            itemNames.includes(item.name)
        );
        
        puter.messaging.send(message.sender, 'wishlist-response', {
            items: wishlistItems,
            totalValue: calculateTotalValue(wishlistItems)
        });
    });
}
```

## 💾 Data Persistence

### Saving User Preferences
```javascript
// Save user preferences to Puter storage
async function saveUserPreferences(preferences) {
    if (typeof puter === 'undefined') {
        localStorage.setItem('catalog-preferences', JSON.stringify(preferences));
        return;
    }
    
    try {
        await puter.fs.write('catalog-preferences.json', JSON.stringify(preferences));
        console.log('✅ Preferences saved to Puter storage');
    } catch (error) {
        console.error('Failed to save preferences:', error);
        // Fallback to localStorage
        localStorage.setItem('catalog-preferences', JSON.stringify(preferences));
    }
}

// Load user preferences from Puter storage
async function loadUserPreferences() {
    if (typeof puter === 'undefined') {
        const stored = localStorage.getItem('catalog-preferences');
        return stored ? JSON.parse(stored) : {};
    }
    
    try {
        const data = await puter.fs.read('catalog-preferences.json');
        return JSON.parse(data);
    } catch (error) {
        console.log('No preferences found, using defaults');
        return {};
    }
}
```

### Sharing Collections
```javascript
// Share item collections with other users
async function shareCollection(collectionName, items) {
    if (typeof puter === 'undefined') return;
    
    try {
        const collection = {
            name: collectionName,
            items,
            createdAt: Date.now(),
            createdBy: await puter.auth.getUser()
        };
        
        const shareId = await puter.sharing.create(collection, {
            permissions: ['read'],
            expiry: '30d'
        });
        
        return shareId;
    } catch (error) {
        console.error('Failed to share collection:', error);
        return null;
    }
}
```

## 🔧 Advanced Puter Features

### File System Integration
```javascript
// Export catalog data to Puter file system
async function exportToPuterFS(data, filename) {
    if (typeof puter === 'undefined') return false;
    
    try {
        await puter.fs.write(filename, JSON.stringify(data, null, 2));
        
        // Show success notification
        if (puter.ui && puter.ui.showNotification) {
            puter.ui.showNotification({
                title: 'Export Complete',
                message: `Data exported to ${filename}`,
                type: 'success'
            });
        }
        
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        return false;
    }
}

// Import data from Puter file system
async function importFromPuterFS(filename) {
    if (typeof puter === 'undefined') return null;
    
    try {
        const data = await puter.fs.read(filename);
        return JSON.parse(data);
    } catch (error) {
        console.error('Import failed:', error);
        return null;
    }
}
```

### UI Integration
```javascript
// Integrate with Puter UI components
function setupPuterUI() {
    if (typeof puter === 'undefined' || !puter.ui) return;
    
    // Add to Puter menu
    puter.ui.addMenuItem({
        label: 'GRUDGE Catalog',
        icon: '🎮',
        action: () => window.focus()
    });
    
    // Register keyboard shortcuts
    puter.ui.registerShortcut('Ctrl+G', () => {
        document.getElementById('searchInput').focus();
    });
    
    // Add context menu items
    puter.ui.addContextMenuItem({
        label: 'Search in Catalog',
        condition: (selection) => selection.type === 'text',
        action: (selection) => {
            document.getElementById('searchInput').value = selection.text;
            catalog.filterAndRender();
        }
    });
}
```

## 📊 Analytics & Monitoring

### Puter Analytics Integration
```javascript
// Track usage with Puter analytics
function trackCatalogUsage(action, data = {}) {
    if (typeof puter === 'undefined' || !puter.analytics) return;
    
    puter.analytics.track('catalog_action', {
        action,
        timestamp: Date.now(),
        ...data
    });
}

// Usage examples
trackCatalogUsage('item_viewed', { itemName: 'Hellfire Blade', category: 'weapons' });
trackCatalogUsage('search_performed', { query: 'potion', results: 15 });
trackCatalogUsage('category_filtered', { category: 'equipment' });
```

## 🔐 Security & Permissions

### Secure Communication
```javascript
// Validate messages from other apps
function validateMessage(message) {
    // Check message structure
    if (!message.data || !message.sender) return false;
    
    // Verify sender permissions
    if (typeof puter !== 'undefined' && puter.auth) {
        return puter.auth.verifyAppPermission(message.sender, 'catalog-access');
    }
    
    return true;
}

// Secure data sharing
function shareSecureData(appId, data) {
    if (!validateAppAccess(appId)) {
        console.warn(`Access denied for app: ${appId}`);
        return;
    }
    
    // Encrypt sensitive data if needed
    const secureData = encryptIfNeeded(data);
    
    puter.messaging.send(appId, 'secure-data', secureData);
}
```

## 📞 API Reference

### Available Methods
```javascript
// Public API methods available to other Puter apps
const CatalogAPI = {
    // Query items with filters
    queryItems: async (filters) => { /* ... */ },
    
    // Get specific item by name
    getItem: async (itemName) => { /* ... */ },
    
    // Search items
    searchItems: async (query) => { /* ... */ },
    
    // Get crafting recipes
    getCraftingRecipes: async (workstation) => { /* ... */ },
    
    // Get categories
    getCategories: () => categories,
    
    // Export data
    exportData: async (format) => { /* ... */ }
};

// Make API available globally for other apps
if (typeof window !== 'undefined') {
    window.GrudgeCatalogAPI = CatalogAPI;
}
```

## 🚀 Future Enhancements

### Planned Puter Integrations
- **Real-time Multiplayer** - Share discoveries with other players
- **Cloud Sync** - Sync preferences across devices
- **Plugin System** - Allow third-party extensions
- **Voice Commands** - Puter voice integration
- **AR/VR Support** - 3D item viewing in Puter VR

---

## 📋 Integration Checklist

- [ ] Puter API initialized
- [ ] Worker communication set up
- [ ] Message handlers registered
- [ ] Data persistence configured
- [ ] Security validation implemented
- [ ] Error handling in place
- [ ] Analytics tracking active
- [ ] UI integration complete
- [ ] API documentation updated
- [ ] Testing completed

**🎉 Your GRUDGE NFT Island Catalog is now fully integrated with Puter.com! 🌐✨**
