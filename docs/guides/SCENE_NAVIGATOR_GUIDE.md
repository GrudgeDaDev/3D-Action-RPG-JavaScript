# 🎬 Scene Navigator - Development Tool

## ✨ What Is It?

A **modern, in-game scene switcher** for development that lets you quickly navigate between different scenes without reloading the page or manually changing URLs.

## 🎯 Features

### ✅ What You Get

1. **Top Navigation Bar** - Beautiful buttons for each scene
2. **One-Click Switching** - Instantly switch between scenes
3. **Keyboard Shortcuts** - Use Ctrl/Cmd + 1-9 to switch scenes
4. **Loading States** - Visual feedback when switching
5. **Active Scene Highlight** - See which scene you're in
6. **Error Handling** - Clear feedback if scene fails to load
7. **Hover Effects** - Smooth animations and visual feedback

### 🎨 Visual Design

- **Modern UI** - Matches your existing game aesthetic
- **Golden Theme** - Uses your signature `rgb(245, 202, 86)` color
- **Glassmorphism** - Backdrop blur and transparency
- **Smooth Animations** - All transitions are smooth and polished
- **Responsive** - Works on different screen sizes

## 🚀 How to Use

### 1. **Start Your Game in Debug Mode**

```
http://127.0.0.1:5500/?debug=true
```

The scene navigator **only appears in debug mode** to keep production clean.

### 2. **Click Scene Buttons**

At the top of the screen, you'll see buttons for each scene:
- **Lobby** - Main lobby scene
- **Inn** - Inn interior scene
- **Outdoor** - Outdoor environment
- **Builder** - Level builder scene
- etc.

Click any button to switch to that scene instantly!

### 3. **Use Keyboard Shortcuts**

- **Ctrl + 1** (or Cmd + 1 on Mac) - Switch to first scene
- **Ctrl + 2** - Switch to second scene
- **Ctrl + 3** - Switch to third scene
- ... and so on up to **Ctrl + 9**

### 4. **Visual Feedback**

When switching scenes, you'll see:
- **⏳ Loading...** - Scene is loading
- **✓ Scene Name** - Scene loaded successfully
- **✗ Scene Name** - Scene failed to load (red text)

## 🛠️ Technical Details

### How It Works

1. **Reads Available Scenes** - Gets all scenes from `SceneManager.sceneCreators`
2. **Creates Navigation UI** - Dynamically generates buttons
3. **Handles Switching** - Calls `SceneManager.switchToSceneByName()`
4. **Updates State** - Highlights active scene, shows loading states

### Integration

The scene navigator is integrated in `game.js`:

```javascript
// Add scene navigator for quick scene switching
const sceneNavigator = createSceneNavigator(
    window.SCENE_MANAGER,
    window.SCENE_MANAGER.sceneCreators
);
enableSceneNavigatorShortcuts(sceneNavigator, window.SCENE_MANAGER.sceneCreators);
```

### Global Access

You can control it from the console:

```javascript
// Show/hide navigator
window.SCENE_NAVIGATOR.show();
window.SCENE_NAVIGATOR.hide();

// Switch to a scene programmatically
window.SCENE_NAVIGATOR.switchToScene('inn');

// Set active scene (updates UI only)
window.SCENE_NAVIGATOR.setActiveScene('outdoor');

// Remove navigator
window.SCENE_NAVIGATOR.destroy();
```

## 🎮 Available Scenes

The navigator automatically detects all scenes registered in your `SceneManager`:

- **lobby** - Main lobby/menu
- **inn** - Inn interior
- **outdoor** - Outdoor environment
- **builder** - Level builder tool
- **startingZone** - Starting area
- ... any other scenes you add!

## 💡 Benefits Over URL-Based Navigation

### ❌ Old Way (URL Parameters)
```
/RPG/index.html?scene=outdoor
/RPG/index.html?scene=inn
/RPG/index.html?scene=builder
```

**Problems:**
- Page reload required
- Lose game state
- Slow switching
- Manual URL editing

### ✅ New Way (Scene Navigator)

**Benefits:**
- ⚡ **Instant switching** - No page reload
- 💾 **Keeps state** - Persistent UI remains
- ⌨️ **Keyboard shortcuts** - Fast workflow
- 🎨 **Visual feedback** - See what's happening
- 🔧 **Developer-friendly** - Built for rapid iteration

## 🎯 Use Cases

### During Development

1. **Testing Scenes** - Quickly jump between scenes to test
2. **Debugging** - Switch to problematic scene instantly
3. **Comparison** - Compare different scenes side-by-side
4. **Iteration** - Rapid testing of changes across scenes

### Example Workflow

```
1. Start game in debug mode
2. Test lobby scene
3. Press Ctrl+2 to jump to inn
4. Test inn interactions
5. Press Ctrl+3 to jump to outdoor
6. Test outdoor environment
7. Press Ctrl+4 to jump to builder
8. Build/edit level
9. Press Ctrl+1 to return to lobby
```

**All without a single page reload!** 🚀

## 🎨 Customization

### Change Colors

Edit `src/utils/sceneNavigator.js`:

```javascript
// Change button color
color: rgb(245, 202, 86);  // Your golden color

// Change hover glow
boxShadow: '0 0 8px rgb(245, 202, 86)';

// Change background
background: rgba(0, 0, 0, 0.6);
```

### Change Position

```javascript
// Move to bottom
top: auto;
bottom: 12px;

// Move to left
left: 12px;
transform: none;
```

### Add Scene Icons

```javascript
// In formatSceneName function
const icons = {
    lobby: '🏠',
    inn: '🏨',
    outdoor: '🌲',
    builder: '🔨'
};

return icons[name] + ' ' + formattedName;
```

## 🔧 Advanced Features

### Add Custom Scenes

Register new scenes in `SceneManager`:

```javascript
sceneManager.registerScene('myNewScene', createMyNewScene);
```

The navigator will automatically detect and add a button!

### Scene Metadata

You can add metadata to scenes for better navigation:

```javascript
// Future enhancement
sceneCreators.myScene.metadata = {
    displayName: 'My Awesome Scene',
    icon: '🎮',
    category: 'gameplay'
};
```

## 📊 Performance

- **Lightweight** - < 5KB of code
- **No Dependencies** - Pure JavaScript
- **Minimal DOM** - Only creates buttons once
- **Efficient** - Uses event delegation
- **No Memory Leaks** - Proper cleanup on destroy

## 🎊 Summary

The Scene Navigator is a **powerful development tool** that makes scene switching:
- ⚡ **Fast** - Instant switching
- 🎨 **Beautiful** - Modern, polished UI
- ⌨️ **Efficient** - Keyboard shortcuts
- 🔧 **Developer-friendly** - Built for rapid iteration

**Perfect for development, hidden in production!** 🚀

