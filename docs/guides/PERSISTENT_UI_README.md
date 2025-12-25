# 🎨 Persistent UI Canvas System

## 🎯 Overview

Your 3D Action RPG now has a **persistent UI canvas** that stays visible across all scene switches! This is perfect for HUD elements like health bars, score displays, notifications, and any UI that should remain visible when switching between game scenes.

---

## ✨ Features

- ✅ **Scene-Independent UI** - UI elements persist when switching scenes
- ✅ **Separate Rendering Layer** - UI renders on top of game scenes
- ✅ **Easy-to-Use API** - Simple helper functions for common tasks
- ✅ **Pre-Built Components** - Ready-to-use health bars, notifications, etc.
- ✅ **High Performance** - Minimal overhead, efficient rendering
- ✅ **Fully Customizable** - Create any UI you need

---

## 🚀 Quick Start

### 1. Test It Now (30 seconds)

Run your game with debug mode:
```
http://localhost:your-port/?debug=true
```

You should see:
- **FPS counter** in the top-right corner
- **Success notification** when the game loads
- **UI stays visible** when switching scenes!

### 2. Add Your First UI Element (2 minutes)

```javascript
// In game.js, after SCENE_MANAGER.start()

import { createHealthBar } from './examples/persistentUIExamples.js';

const health = createHealthBar();
health.update(75, 100); // Set to 75/100 HP

window.PLAYER_HEALTH = health; // Store globally
```

### 3. Create a Complete HUD (5 minutes)

```javascript
import { 
  createHealthBar, 
  createManaBar, 
  createScoreDisplay 
} from './examples/persistentUIExamples.js';

const health = createHealthBar();
const mana = createManaBar();
const score = createScoreDisplay();

window.GAME_UI = { health, mana, score };

// Update from anywhere
window.GAME_UI.health.update(75, 100);
window.GAME_UI.mana.update(50, 100);
window.GAME_UI.score.updateScore(1000);
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[PERSISTENT_UI_QUICKSTART.md](PERSISTENT_UI_QUICKSTART.md)** | 🚀 Get started in minutes |
| **[PERSISTENT_UI_GUIDE.md](PERSISTENT_UI_GUIDE.md)** | 📖 Complete guide with examples |
| **[PERSISTENT_UI_SUMMARY.md](PERSISTENT_UI_SUMMARY.md)** | 📋 Implementation details |
| **[examples/persistentUIExamples.js](examples/persistentUIExamples.js)** | 💡 Ready-to-use components |
| **[src/utils/persistentUI.js](src/utils/persistentUI.js)** | 🔧 Helper utilities |

---

## 🎨 Available Components

### Pre-Built Components (in `examples/persistentUIExamples.js`)

```javascript
import { 
  createScoreDisplay,      // Score counter
  createHealthBar,         // Health bar with auto-coloring
  createManaBar,          // Mana/energy bar
  createQuestTracker,     // Quest list
  createMiniMap,          // Mini-map with markers
  createComboCounter      // Combo counter with auto-hide
} from './examples/persistentUIExamples.js';
```

### Built-In Utilities (in `src/utils/persistentUI.js`)

```javascript
import { 
  getPersistentUI,              // Get the persistent UI texture
  addToPersistentUI,            // Add UI elements
  removeFromPersistentUI,       // Remove UI elements
  createPersistentFPSCounter,   // FPS counter
  createPersistentNotifications, // Notification system
  createPersistentDebugPanel    // Debug info panel
} from './src/utils/persistentUI.js';
```

---

## 💡 Common Use Cases

### Health Bar
```javascript
const health = createHealthBar();
health.update(75, 100); // 75/100 HP
```

### Notifications
```javascript
window.NOTIFICATIONS.show('Level Up!', 'success', 3000);
window.NOTIFICATIONS.show('Low Health!', 'warning', 5000);
```

### Score Display
```javascript
const score = createScoreDisplay();
score.updateScore(1000);
```

### Quest Tracker
```javascript
const quests = createQuestTracker();
quests.addQuest("Defeat Boss", "Find and defeat the boss");
```

### Mini-Map
```javascript
const miniMap = createMiniMap();
miniMap.addMarker(50, 30, "red"); // Enemy location
```

### Custom UI Element
```javascript
import { addToPersistentUI } from './src/utils/persistentUI.js';

const myLabel = new BABYLON.GUI.TextBlock("myLabel");
myLabel.text = "Custom UI!";
myLabel.color = "white";
myLabel.fontSize = 24;

addToPersistentUI(myLabel);
```

---

## 🏗️ Architecture

### How It Works

```
┌─────────────────────────────────────┐
│   Persistent UI Scene (Always On)  │  ← Renders on top
│   - Health Bar                      │
│   - FPS Counter                     │
│   - Notifications                   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│   Game Scene (Changes)              │  ← Renders first
│   - 3D World                        │
│   - Characters                      │
│   - Environment                     │
└─────────────────────────────────────┘
```

### Rendering Pipeline

1. **Game Scene** renders (3D world, characters, etc.)
2. **Persistent UI Scene** renders on top (UI elements)
3. Both visible simultaneously
4. When switching scenes, only the game scene changes
5. Persistent UI stays intact!

---

## 🔧 API Reference

### SceneManager Methods

```javascript
// Get persistent UI texture
const gui = SCENE_MANAGER.getPersistentGUI();

// Add control directly
gui.addControl(myControl);
```

### Helper Functions

```javascript
// Get persistent UI
const gui = getPersistentUI();

// Add/remove controls
addToPersistentUI(control);
removeFromPersistentUI(control);

// Create built-in components
const fps = createPersistentFPSCounter();
const notifications = createPersistentNotifications();
const debug = createPersistentDebugPanel();
```

---

## 🎯 Best Practices

1. **Initialize Early** - Add persistent UI after `SCENE_MANAGER.start()`
2. **Use Helper Functions** - Import from `persistentUI.js`
3. **Name Your Controls** - Use unique names for debugging
4. **Store Globally** - Keep references for easy access
5. **Update Wisely** - Only update when values change

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| UI not showing | Check `SCENE_MANAGER.persistentGUI` exists |
| UI disappears on scene switch | Use `addToPersistentUI()` not scene GUI |
| Can't access SCENE_MANAGER | Call after `SCENE_MANAGER.start()` |
| Performance issues | Limit UI elements, avoid per-frame updates |

---

## 📁 File Structure

```
3D-Action-RPG-JavaScript/
├── src/
│   ├── scene/
│   │   └── SceneManager.js          # ✅ Modified - Persistent UI support
│   └── utils/
│       └── persistentUI.js          # ✅ New - Helper utilities
├── examples/
│   └── persistentUIExamples.js      # ✅ New - Pre-built components
├── game.js                          # ✅ Modified - FPS counter enabled
├── PERSISTENT_UI_README.md          # 📖 This file
├── PERSISTENT_UI_QUICKSTART.md      # 🚀 Quick start guide
├── PERSISTENT_UI_GUIDE.md           # 📚 Complete guide
└── PERSISTENT_UI_SUMMARY.md         # 📋 Implementation summary
```

---

## 🎉 You're Ready!

Your game now has a powerful persistent UI system! Start with the quick start guide and build your HUD.

**Next Steps:**
1. ✅ Test the FPS counter (`?debug=true`)
2. ✅ Add a health bar
3. ✅ Create your complete HUD
4. ✅ Build custom UI components

---

## 📞 Need Help?

- **Quick Start**: See `PERSISTENT_UI_QUICKSTART.md`
- **Full Guide**: See `PERSISTENT_UI_GUIDE.md`
- **Examples**: See `examples/persistentUIExamples.js`
- **API Docs**: See `PERSISTENT_UI_SUMMARY.md`

---

**Happy Coding! 🚀**

