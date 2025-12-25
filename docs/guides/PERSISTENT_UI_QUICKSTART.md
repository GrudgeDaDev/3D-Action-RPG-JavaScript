# 🚀 Persistent UI - Quick Start Guide

## ✅ What You Have Now

Your game has a **persistent UI canvas** that stays visible when switching between scenes!

---

## 🎯 Test It Right Now (30 seconds)

1. **Run your game with debug mode:**
   ```
   http://localhost:your-port/?debug=true
   ```

2. **You should see:**
   - FPS counter in the top-right corner
   - A success notification when the game loads

3. **Switch between scenes:**
   - The FPS counter stays visible!
   - That's the persistent UI in action!

---

## 🎨 Add Your First Persistent UI Element (2 minutes)

### Option 1: Use a Pre-Built Component

```javascript
// In game.js, after SCENE_MANAGER.start()

import { createHealthBar } from './examples/persistentUIExamples.js';

const health = createHealthBar();
health.update(75, 100); // Set to 75/100 HP

// Store globally for easy access
window.PLAYER_HEALTH = health;
```

### Option 2: Create a Custom Element

```javascript
// In game.js, after SCENE_MANAGER.start()

import { addToPersistentUI } from './src/utils/persistentUI.js';

// Create a simple text label
const myLabel = new BABYLON.GUI.TextBlock("myLabel");
myLabel.text = "Hello Persistent UI!";
myLabel.color = "white";
myLabel.fontSize = 24;
myLabel.top = "50px";
myLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
myLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

// Add to persistent canvas
addToPersistentUI(myLabel);
```

---

## 📦 Available Pre-Built Components

All in `examples/persistentUIExamples.js`:

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

---

## 🎮 Complete HUD Example

Copy this into `game.js` after `SCENE_MANAGER.start()`:

```javascript
import { 
  createHealthBar, 
  createManaBar, 
  createScoreDisplay 
} from './examples/persistentUIExamples.js';

// Create HUD
const health = createHealthBar();
const mana = createManaBar();
const score = createScoreDisplay();

// Store globally
window.GAME_UI = { health, mana, score };

// Update from anywhere in your code
window.GAME_UI.health.update(75, 100);
window.GAME_UI.mana.update(50, 100);
window.GAME_UI.score.updateScore(1000);
```

---

## 🔧 Common Patterns

### Pattern 1: Show Notifications

```javascript
// Notifications are already available in debug mode
window.NOTIFICATIONS.show('Level Up!', 'success', 3000);
window.NOTIFICATIONS.show('Low Health!', 'warning', 5000);
window.NOTIFICATIONS.show('Connection Lost!', 'error', 0); // Permanent
```

### Pattern 2: Update UI from Game Logic

```javascript
// In your player damage handler
function takeDamage(amount) {
  player.health -= amount;
  
  // Update persistent UI
  if (window.GAME_UI) {
    window.GAME_UI.health.update(player.health, player.maxHealth);
  }
  
  // Show notification if health is low
  if (player.health < 30 && window.NOTIFICATIONS) {
    window.NOTIFICATIONS.show('Low Health!', 'warning', 3000);
  }
}
```

### Pattern 3: Toggle UI Visibility

```javascript
// Hide/show UI elements
myElement.element.isVisible = false; // Hide
myElement.element.isVisible = true;  // Show
```

---

## 📚 Full Documentation

- **Quick Start**: `PERSISTENT_UI_QUICKSTART.md` (this file)
- **Complete Guide**: `PERSISTENT_UI_GUIDE.md`
- **Implementation Summary**: `PERSISTENT_UI_SUMMARY.md`
- **Example Code**: `examples/persistentUIExamples.js`
- **Helper Utils**: `src/utils/persistentUI.js`

---

## 🎯 Next Steps

1. ✅ **Test the FPS counter** - Run with `?debug=true`
2. ✅ **Add a health bar** - Use `createHealthBar()`
3. ✅ **Create your HUD** - Combine multiple components
4. ✅ **Customize styling** - Change colors, positions, sizes
5. ✅ **Build custom UI** - Create your own components

---

## 💡 Pro Tips

1. **Store UI globally** for easy access:
   ```javascript
   window.GAME_UI = { health, mana, score };
   ```

2. **Use helper functions** instead of direct GUI access:
   ```javascript
   import { addToPersistentUI } from './src/utils/persistentUI.js';
   ```

3. **Name your controls** for easier debugging:
   ```javascript
   const myControl = new BABYLON.GUI.TextBlock("uniqueName");
   ```

4. **Update only when needed** to save performance:
   ```javascript
   // Good: Update when value changes
   if (newHealth !== oldHealth) {
     health.update(newHealth, maxHealth);
   }
   
   // Bad: Update every frame
   // Don't do this unless necessary!
   ```

---

## 🐛 Troubleshooting

### "UI not showing"
- Make sure SceneManager is initialized
- Check you're using `addToPersistentUI()` not `scene.activeGUI.addControl()`

### "UI disappears when switching scenes"
- You're adding to the wrong GUI texture
- Use the persistent UI helpers

### "Can't access SCENE_MANAGER"
- Make sure you're calling after `SCENE_MANAGER.start()`
- Check `window.SCENE_MANAGER` exists

---

## 🎊 You're Ready!

Start with the FPS counter test, then add a health bar, and build from there!

**Remember:** The persistent UI stays visible across ALL scene switches. Perfect for HUD elements! 🚀

---

## 📞 Need Help?

Check the full documentation in `PERSISTENT_UI_GUIDE.md` for:
- Detailed API reference
- Advanced examples
- Styling guide
- Best practices

