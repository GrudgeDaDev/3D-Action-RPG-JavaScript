# 🧪 Test Your New WoW-Style UI

## Quick Test Checklist

### 1. Test Lobby UI (HTML-based)

**Steps:**
1. Open browser: `http://localhost:5500`
2. You should see:
   - ✅ Big gold title: "⚔️ GRUDGE STRAT ⚔️"
   - ✅ Subtitle: "Select Your Destination"
   - ✅ Multiple clickable scene buttons
   - ✅ Each button has emoji + name + description

**Test Interactions:**
- ✅ Hover over buttons → Gold glow effect
- ✅ Click a button → Scene loads
- ✅ Press ESC → Menu toggles

**If buttons don't show:**
- Open browser console (F12)
- Look for errors
- Check if `config/scenes.json` exists
- Make sure scenes have `showInLobby: true`

---

### 2. Test WoW UI (Night Scene)

**Steps:**
1. From lobby, click **"🌙 Night Scene"**
2. Wait for scene to load
3. You should see:

**Player Frame (Top-Left):**
- ✅ Black frame with gold border
- ✅ "Hero" name in white
- ✅ "Lv 1" in gold
- ✅ Green health bar (100/100)
- ✅ Blue mana bar (100/100)
- ✅ Yellow stamina bar (thin, below mana)

**Action Bars (Bottom):**
- ✅ 2 rows of 12 slots each
- ✅ Each slot has a number (1-9, 0, -, =)
- ✅ Second row has "Shift+1", "Shift+2", etc.
- ✅ Black background with gold borders

**Target Frame (Next to Player):**
- ✅ Should be HIDDEN (no target yet)

**Cast Bar (Bottom Center):**
- ✅ Should be HIDDEN (not casting)

---

### 3. Test UI Functionality

**In Browser Console (F12):**

```javascript
// Test player health update
window.WOW_UI.updatePlayer({ health: 50 });
// → Health bar should turn orange and show 50/100

window.WOW_UI.updatePlayer({ health: 15 });
// → Health bar should turn red and show 15/100

window.WOW_UI.updatePlayer({ health: 100 });
// → Health bar should turn green and show 100/100

// Test mana update
window.WOW_UI.updatePlayer({ mana: 30 });
// → Mana bar should shrink to 30%

// Test stamina update
window.WOW_UI.updatePlayer({ stamina: 50 });
// → Stamina bar should shrink to 50%

// Test target frame
window.WOW_UI.setTarget({
    name: "Slime",
    level: 3,
    health: 80,
    maxHealth: 100
});
// → Target frame should appear next to player frame
// → Should show "Slime", "Lv 3", and 80% health

// Clear target
window.WOW_UI.setTarget(null);
// → Target frame should disappear

// Test cast bar
window.WOW_UI.startCast("Fireball", 2000);
// → Cast bar should appear
// → Should show "Fireball" and fill over 2 seconds
// → Should auto-hide when done
```

---

### 4. Test Hotkeys

**In Browser Console:**

```javascript
// Check hotkey configuration
console.log(window.WOW_UI.hotkeys);
// → Should show all hotkey mappings

// Test saving hotkeys
window.WOW_UI.hotkeys['bar0_slot0'] = 'Q';
window.WOW_UI.saveHotkeys();
// → Refresh page, hotkey should persist
```

---

### 5. Test Damage Integration

**In Night Scene:**

1. Find an enemy (slime)
2. Attack it
3. Watch your health bar update when you take damage
4. Health should decrease and color should change

**If health doesn't update:**
- Check browser console for errors
- Make sure `character.health.takeDamage` is being called
- The integration is in `src/scene/scenes/night.js` lines 220-225

---

## 🐛 Common Issues & Fixes

### Issue: Lobby buttons not showing

**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Check if `createHTMLLobbyUI` is being called
4. Make sure `config/scenes.json` exists

### Issue: WoW UI not showing in Night scene

**Fix:**
1. Check browser console for errors
2. Make sure `import { WoWUI } from '../../ui/wowUI.js';` is at top of file
3. Check if `window.WOW_UI` is defined in console
4. Try: `window.WOW_UI.show()`

### Issue: UI is behind 3D scene

**Fix:**
- WoW UI uses Babylon GUI (renders on top)
- Lobby UI uses HTML (z-index: 1000)
- Both should be visible

### Issue: Hotkeys not working

**Fix:**
- Click on the canvas first
- Check if other scripts are capturing keyboard
- Try in browser console: `window.WOW_UI.getHotkey(0, 0)`

---

## 📊 Expected Results

### Lobby
- Clean, professional MMO-style menu
- Clickable buttons with hover effects
- ESC key toggles menu

### Night Scene
- Full WoW-style UI visible
- Player frame with 3 bars (health, mana, stamina)
- 24 action slots with hotkeys
- Target frame (hidden until target selected)
- Cast bar (hidden until casting)

### Performance
- UI should render at 60 FPS
- No lag when updating bars
- Smooth animations

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Lobby shows clickable buttons (not just yellow ball)
2. ✅ Night scene shows WoW UI frames
3. ✅ Health bar updates when you take damage
4. ✅ All bars (health, mana, stamina) are visible
5. ✅ Action bars show hotkey numbers
6. ✅ Target frame appears when you set a target
7. ✅ Cast bar animates when you cast

---

## 🎮 Next: Add Your Own Content

Once UI is working, see:
- `WOW_UI_AND_CONTENT_PIPELINE.md` - How to add enemies, classes, scenes
- `WHATS_FIXED_AND_HOW_TO_USE.md` - How to use the UI in your code

**Happy testing!** 🎊

