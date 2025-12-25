# 🔧 Troubleshooting Guide - Persistent UI

## Common Errors and Solutions

### ❌ Error: "No camera defined"

**Error Message:**

```
Uncaught Error: No camera defined
    at t.render (babylon.js:1:614309)
    at SceneManager.js:112:30
```

**Cause:**
Babylon.js requires every scene to have at least one camera, even if it's just rendering 2D UI.

**Solution:**
✅ **FIXED!** The persistent UI scene now includes a dummy camera. This error should no longer occur.

**Technical Details:**
The `initPersistentUI()` method now creates a `FreeCamera` for the persistent scene:

```javascript
const dummyCamera = new BABYLON.FreeCamera(
  "persistentUICamera",
  new BABYLON.Vector3(0, 0, 0),
  this.persistentScene
);
```

---

### ⚠️ Warning: "walletChannelId missing from script tag"

**Error Message:**

```
Uncaught Error: read: walletChannelId missing from script tag
    at n (in-page.js:9:282785)
```

**Cause:**
This is caused by a browser extension (likely a crypto wallet extension like MetaMask, Phantom, etc.).

**Solution:**
✅ **This is NOT a bug in your code!** You can safely ignore this error.

**To Remove the Error (Optional):**

1. Disable crypto wallet browser extensions while developing
2. Or just ignore it - it won't affect your game

---

### ❌ Error: "Failed to load resource: 404 (Not Found)" for MaterialPanel.js or NMEAgent.js

**Error Message:**

```
:5500/src/scene/ui/MaterialPanel.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)
:5500/src/scene/ai/NMEAgent.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)
```

**Cause:**
Incorrect relative import paths in `MaterialTool.js`. The file is located at `src/scene/gen/procedural/grid/tools/material/MaterialTool.js` and was using 5 `../` levels to navigate up, but needs 6 levels to reach `src/`.

**Wrong paths:**

```javascript
import MaterialPanel from "../../../../../ui/MaterialPanel.js";   // Goes to src/scene/ui/
import { NMEAgent } from "../../../../../ai/NMEAgent.js";         // Goes to src/scene/ai/
```

**Correct paths:**

```javascript
import MaterialPanel from "../../../../../../ui/MaterialPanel.js"; // Goes to src/ui/
import { NMEAgent } from "../../../../../../ai/NMEAgent.js";       // Goes to src/ai/
```

**Solution:**
✅ **FIXED!** The import paths in `MaterialTool.js` have been corrected to use 6 levels of `../`.

**Path Resolution:**
From `src/scene/gen/procedural/grid/tools/material/`:

1. `..` → `tools/`
2. `..` → `grid/`
3. `..` → `procedural/`
4. `..` → `gen/`
5. `..` → `scene/`
6. `..` → `src/`
7. `ui/MaterialPanel.js` → `src/ui/MaterialPanel.js` ✅

---

### ❌ Error: "persistentGUI is undefined"

**Error Message:**

```
Cannot read property 'addControl' of undefined
```

**Cause:**
Trying to access persistent UI before SceneManager is initialized.

**Solution:**
Make sure you're adding UI elements **after** `SCENE_MANAGER.start()`:

```javascript
// ❌ Wrong - Too early
import { createHealthBar } from './examples/persistentUIExamples.js';
const health = createHealthBar(); // Error!

window.addEventListener('DOMContentLoaded', async function () {
  window.SCENE_MANAGER = new SceneManager('renderCanvas');
  await window.SCENE_MANAGER.start();
  
  // ✅ Correct - After start()
  const health = createHealthBar(); // Works!
});
```

---

### ❌ Error: "UI disappears when switching scenes"

**Symptom:**
UI elements vanish when you switch between game scenes.

**Cause:**
You're adding UI to the game scene's GUI instead of the persistent UI.

**Solution:**
Use `addToPersistentUI()` instead of `scene.activeGUI.addControl()`:

```javascript
// ❌ Wrong - Adds to game scene
const gui = SCENE_MANAGER.activeGUI;
gui.addControl(myControl); // Will disappear on scene switch!

// ✅ Correct - Adds to persistent UI
import { addToPersistentUI } from './src/utils/persistentUI.js';
addToPersistentUI(myControl); // Stays visible!
```

---

### ❌ Error: "SCENE_MANAGER is not defined"

**Error Message:**

```
ReferenceError: SCENE_MANAGER is not defined
```

**Cause:**
Trying to access `SCENE_MANAGER` before it's created or from a module without access.

**Solution:**

**Option 1:** Make sure you're accessing after initialization

```javascript
window.addEventListener('DOMContentLoaded', async function () {
  window.SCENE_MANAGER = new SceneManager('renderCanvas');
  await window.SCENE_MANAGER.start();
  
  // Now SCENE_MANAGER is available
  console.log(SCENE_MANAGER); // Works!
});
```

**Option 2:** Import and use helper functions

```javascript
import { getPersistentUI } from './src/utils/persistentUI.js';
const gui = getPersistentUI(); // Handles the check for you
```

---

### ❌ Error: "Cannot find module './src/utils/persistentUI.js'"

**Error Message:**

```
Failed to resolve module specifier "./src/utils/persistentUI.js"
```

**Cause:**
Incorrect import path or file doesn't exist.

**Solution:**
Check your import path is correct relative to your file:

```javascript
// From game.js (root level)
import { createPersistentFPSCounter } from './src/utils/persistentUI.js';

// From a file in src/scenes/
import { createPersistentFPSCounter } from '../utils/persistentUI.js';

// From a file in examples/
import { createPersistentFPSCounter } from '../src/utils/persistentUI.js';
```

---

### ⚠️ Performance: "Game is running slowly"

**Symptom:**
FPS drops, game feels laggy.

**Possible Causes:**

1. Too many persistent UI elements
2. Updating UI every frame unnecessarily
3. Complex UI with many controls

**Solutions:**

**1. Limit UI Updates:**

```javascript
// ❌ Bad - Updates every frame
engine.runRenderLoop(() => {
  health.update(player.health, player.maxHealth); // Too frequent!
});

// ✅ Good - Update only when value changes
let lastHealth = player.health;
engine.runRenderLoop(() => {
  if (player.health !== lastHealth) {
    health.update(player.health, player.maxHealth);
    lastHealth = player.health;
  }
});
```

**2. Hide Instead of Remove:**

```javascript
// ❌ Slower - Removes and recreates
removeFromPersistentUI(myControl);
// Later...
addToPersistentUI(myControl);

// ✅ Faster - Just toggle visibility
myControl.isVisible = false;
// Later...
myControl.isVisible = true;
```

**3. Use Simple UI Elements:**

```javascript
// ❌ Complex - Many nested controls
const container = new BABYLON.GUI.Rectangle();
const stack = new BABYLON.GUI.StackPanel();
// ... many more controls

// ✅ Simple - Minimal controls
const text = new BABYLON.GUI.TextBlock();
text.text = "Score: 100";
```

---

### ❌ Error: "UI is not visible"

**Symptom:**
UI elements are added but don't appear on screen.

**Possible Causes & Solutions:**

**1. Check if element is visible:**

```javascript
myControl.isVisible = true; // Make sure it's visible
```

**2. Check positioning:**

```javascript
// Make sure it's on screen
myControl.top = "20px";
myControl.left = "20px";
myControl.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
myControl.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
```

**3. Check size:**

```javascript
// Make sure it has a size
myControl.width = "200px";
myControl.height = "50px";
```

**4. Check color/transparency:**

```javascript
// Make sure it's not transparent or same color as background
myControl.color = "white";
myControl.background = "rgba(0, 0, 0, 0.7)";
```

**5. Check z-index (for overlapping controls):**

```javascript
myControl.zIndex = 100; // Higher = on top
```

---

### 🐛 Debug Mode Not Working

**Symptom:**
FPS counter and notifications don't appear even with `?debug=true`.

**Solution:**

**1. Check URL parameter:**

```
http://127.0.0.1:5500/?debug=true
```

**2. Check config file:**

```javascript
// In your config file
{
  "global": {
    "debug": true
  }
}
```

**3. Force enable in game.js:**

```javascript
// Temporarily force debug mode
const config = ConfigManager.getInstance();
await config.loadAll();

// Force debug on
window.DEBUG = true;

// Then initialize persistent UI
createPersistentFPSCounter();
```

---

## 🔍 General Debugging Tips

### 1. Check Console

Always check the browser console (F12) for errors and warnings.

### 2. Verify SceneManager

```javascript
console.log('SceneManager:', SCENE_MANAGER);
console.log('Persistent GUI:', SCENE_MANAGER.persistentGUI);
console.log('Persistent Scene:', SCENE_MANAGER.persistentScene);
```

### 3. List All UI Controls

```javascript
const gui = SCENE_MANAGER.getPersistentGUI();
console.log('UI Controls:', gui.getDescendants());
```

### 4. Check Scene Rendering

```javascript
console.log('Active Scene:', SCENE_MANAGER.activeScene);
console.log('Persistent Scene:', SCENE_MANAGER.persistentScene);
```

---

## 📞 Still Having Issues?

1. Check the full documentation: `PERSISTENT_UI_GUIDE.md`
2. Review the examples: `examples/persistentUIExamples.js`
3. Check the implementation: `src/scene/SceneManager.js`
4. Verify your imports and paths are correct

---

## ✅ Quick Checklist

Before asking for help, verify:

- [ ] SceneManager is initialized (`window.SCENE_MANAGER` exists)
- [ ] You're adding UI after `SCENE_MANAGER.start()`
- [ ] You're using `addToPersistentUI()` not scene GUI
- [ ] Import paths are correct
- [ ] Browser console shows no errors (except wallet extension)
- [ ] UI elements have proper size, position, and visibility
- [ ] You're testing with the correct URL (e.g., `http://127.0.0.1:5500/?debug=true`)

---

**Most issues are solved by ensuring you're adding UI elements AFTER SceneManager initialization!** ✨
