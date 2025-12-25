# 🎨 Persistent UI Canvas Guide

## Overview

Your game now has a **persistent UI canvas** that stays visible across all scene switches. This is perfect for:
- HUD elements (health, mana, score)
- FPS counter
- Notifications
- Debug panels
- Mini-maps
- Chat systems
- Any UI that should persist across scenes

---

## 🏗️ How It Works

### Architecture

```
┌─────────────────────────────────────┐
│   Persistent UI Scene (Always On)  │  ← Renders on top
│   - FPS Counter                     │
│   - Notifications                   │
│   - HUD Elements                    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│   Game Scene (Changes)              │  ← Renders first
│   - 3D World                        │
│   - Characters                      │
│   - Environment                     │
└─────────────────────────────────────┘
```

### Technical Details

1. **Separate Scene**: Persistent UI uses its own Babylon.js scene
2. **Auto-Clear Disabled**: UI scene doesn't clear the canvas
3. **Render Order**: Game scene renders first, then UI scene on top
4. **Scene Independent**: UI persists when switching between game scenes

---

## 🚀 Quick Start

### 1. Access the Persistent UI

```javascript
// Get the persistent UI texture
const persistentGUI = SCENE_MANAGER.getPersistentGUI();

// Add any Babylon.GUI control
const myButton = BABYLON.GUI.Button.CreateSimpleButton("myBtn", "Click Me");
persistentGUI.addControl(myButton);
```

### 2. Using Helper Functions

```javascript
import { 
  addToPersistentUI, 
  createPersistentFPSCounter,
  createPersistentNotifications 
} from './src/utils/persistentUI.js';

// Add FPS counter
const fpsCounter = createPersistentFPSCounter();

// Create notification system
const notifications = createPersistentNotifications();
notifications.show('Welcome to the game!', 'success');
```

---

## 📚 Examples

### Example 1: Simple Text Label

```javascript
// In any scene file or game.js
const persistentGUI = SCENE_MANAGER.getPersistentGUI();

const label = new BABYLON.GUI.TextBlock("myLabel");
label.text = "Score: 0";
label.color = "white";
label.fontSize = 24;
label.top = "20px";
label.left = "20px";
label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
label.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

persistentGUI.addControl(label);

// Update from anywhere
label.text = "Score: 100";
```

### Example 2: Health Bar HUD

```javascript
import { addToPersistentUI } from './src/utils/persistentUI.js';

function createHealthBar() {
  // Container
  const container = new BABYLON.GUI.Rectangle("healthBarContainer");
  container.width = "300px";
  container.height = "50px";
  container.cornerRadius = 5;
  container.color = "white";
  container.thickness = 2;
  container.background = "rgba(0, 0, 0, 0.5)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  container.left = "20px";
  container.bottom = "20px";
  
  // Health bar
  const healthBar = new BABYLON.GUI.Rectangle("healthBar");
  healthBar.width = "280px";
  healthBar.height = "30px";
  healthBar.cornerRadius = 3;
  healthBar.background = "red";
  healthBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  healthBar.left = "10px";
  container.addControl(healthBar);
  
  // Health text
  const healthText = new BABYLON.GUI.TextBlock();
  healthText.text = "100 / 100";
  healthText.color = "white";
  healthText.fontSize = 16;
  healthText.fontWeight = "bold";
  container.addControl(healthText);
  
  addToPersistentUI(container);
  
  return {
    container,
    update(current, max) {
      const percentage = current / max;
      healthBar.width = `${280 * percentage}px`;
      healthText.text = `${current} / ${max}`;
      
      // Color based on health
      if (percentage > 0.5) {
        healthBar.background = "green";
      } else if (percentage > 0.25) {
        healthBar.background = "orange";
      } else {
        healthBar.background = "red";
      }
    }
  };
}

// Usage
const playerHealth = createHealthBar();
playerHealth.update(75, 100); // 75/100 HP
```

### Example 3: Notification System

```javascript
import { createPersistentNotifications } from './src/utils/persistentUI.js';

const notifications = createPersistentNotifications();

// Show different types
notifications.show('Game saved!', 'success', 3000);
notifications.show('Low health!', 'warning', 5000);
notifications.show('Connection lost!', 'error', 0); // Permanent
notifications.show('New quest available', 'info', 4000);

// Clear all
notifications.clear();
```

### Example 4: Mini-Map

```javascript
function createMiniMap() {
  const miniMap = new BABYLON.GUI.Rectangle("miniMap");
  miniMap.width = "200px";
  miniMap.height = "200px";
  miniMap.cornerRadius = 10;
  miniMap.color = "white";
  miniMap.thickness = 2;
  miniMap.background = "rgba(0, 0, 0, 0.7)";
  miniMap.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  miniMap.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  miniMap.top = "20px";
  miniMap.right = "20px";
  
  // Player dot
  const playerDot = new BABYLON.GUI.Ellipse("playerDot");
  playerDot.width = "10px";
  playerDot.height = "10px";
  playerDot.color = "blue";
  playerDot.background = "blue";
  miniMap.addControl(playerDot);
  
  addToPersistentUI(miniMap);
  
  return {
    miniMap,
    updatePlayerPosition(x, z) {
      // Convert world position to mini-map position
      playerDot.left = `${x * 0.1}px`;
      playerDot.top = `${z * 0.1}px`;
    }
  };
}
```

### Example 5: FPS Counter (Built-in)

```javascript
import { createPersistentFPSCounter } from './src/utils/persistentUI.js';

// Simple one-liner
const fpsCounter = createPersistentFPSCounter();

// Remove it later if needed
import { removeFromPersistentUI } from './src/utils/persistentUI.js';
removeFromPersistentUI(fpsCounter);
```

---

## 🎯 Best Practices

### 1. Initialize Early
Add persistent UI elements in `game.js` after SceneManager starts:

```javascript
// In game.js
sceneManager.start().then(() => {
  // Add persistent UI here
  const fpsCounter = createPersistentFPSCounter();
  const notifications = createPersistentNotifications();
});
```

### 2. Use Helper Functions
Import from `persistentUI.js` for common patterns:

```javascript
import { 
  addToPersistentUI, 
  removeFromPersistentUI,
  getPersistentUI 
} from './src/utils/persistentUI.js';
```

### 3. Name Your Controls
Always give controls unique names for easy debugging:

```javascript
const myControl = new BABYLON.GUI.TextBlock("uniqueName");
```

### 4. Clean Up When Needed
Remove controls that are no longer needed:

```javascript
removeFromPersistentUI(myControl);
```

---

## 🔧 API Reference

### SceneManager Methods

```javascript
// Get persistent UI texture
SCENE_MANAGER.getPersistentGUI()
// Returns: BABYLON.GUI.AdvancedDynamicTexture

// Initialize persistent UI (called automatically)
SCENE_MANAGER.initPersistentUI()
```

### Helper Functions

```javascript
// Get persistent UI
getPersistentUI()

// Add control to persistent UI
addToPersistentUI(control)

// Remove control from persistent UI
removeFromPersistentUI(control)

// Create FPS counter
createPersistentFPSCounter()

// Create notification system
createPersistentNotifications()

// Create debug panel
createPersistentDebugPanel()
```

---

## 🎨 Styling Tips

### Positioning
```javascript
// Corners
control.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
control.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

// Offsets
control.top = "20px";
control.left = "20px";
control.right = "-20px"; // Negative for right side
control.bottom = "-20px"; // Negative for bottom
```

### Colors with Transparency
```javascript
control.background = "rgba(0, 0, 0, 0.7)"; // Black with 70% opacity
control.color = "#00aaff"; // Hex color
```

### Text Styling
```javascript
text.fontSize = 16;
text.fontWeight = "bold";
text.outlineWidth = 2;
text.outlineColor = "black";
text.textWrapping = true;
```

---

## 🐛 Troubleshooting

### UI Not Showing
1. Check if SceneManager is initialized: `console.log(SCENE_MANAGER)`
2. Verify persistent UI exists: `console.log(SCENE_MANAGER.persistentGUI)`
3. Check control is added: `persistentGUI.getDescendants()`

### UI Disappears on Scene Switch
- Make sure you're using `addToPersistentUI()` not `scene.activeGUI.addControl()`

### Performance Issues
- Limit number of persistent UI elements
- Use `isVisible = false` instead of removing/re-adding
- Avoid updating UI every frame unless necessary

---

## 🎉 You're Ready!

Your game now has a powerful persistent UI system that works across all scenes!

```javascript
// Quick example to get started
import { createPersistentFPSCounter } from './src/utils/persistentUI.js';

// Add FPS counter
createPersistentFPSCounter();
```

See the examples above for more advanced use cases! 🚀

