# 🛠️ Babylon.js Learning Tools & AI Packages

## 🎯 Overview

This guide covers the best tools and AI packages you can add to your 3D Action RPG for learning, debugging, and adding intelligent behaviors.

---

## 🔍 Built-In Babylon.js Tools (Already Available!)

### 1. **Babylon.js Inspector** ✅ Already Enabled

The Inspector is Babylon.js's most powerful debugging tool - and it's already enabled in your game!

**How to Use:**

1. Run your game with `?debug=true`
2. The Inspector automatically opens
3. Explore scenes, meshes, materials, cameras, and more!

**Features:**

- 🔍 Scene Explorer - View all objects in your scene
- 🎨 Material Editor - Modify materials in real-time
- 📊 Statistics - Performance metrics
- 🎥 Camera Controls - Adjust camera settings
- 💡 Lighting - Modify lights
- 🎭 Animations - Control animations
- 🐛 Debug Tools - Wireframes, bounding boxes, normals

**Keyboard Shortcuts:**

- Press `Ctrl + Shift + I` (or `Cmd + Shift + I` on Mac) to toggle Inspector

**Current Implementation:**
<augment_code_snippet path="src/scene/SceneManager.js" mode="EXCERPT">

```javascript
if (DEBUG) this.activeScene.debugLayer.show();
```

</augment_code_snippet>

---

### 2. **Performance Monitor** (Easy to Add)

Add real-time performance monitoring beyond just FPS.

**Installation:** No package needed - built into Babylon.js!

**Implementation:**

```javascript
// Add to your scene initialization
scene.debugLayer.show({
  embedMode: true,
  overlay: true,
  globalRoot: document.body
});

// Enable performance monitor
const perfMonitor = new BABYLON.PerformanceMonitor();
scene.onBeforeRenderObservable.add(() => {
  perfMonitor.sampleFrame();
});
```

---

### 3. **Scene Optimizer** (Built-in)

Automatically optimize your scene for better performance.

```javascript
// Add to SceneManager.js
const options = new BABYLON.SceneOptimizerOptions(60, 2000);
options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
options.addOptimization(new BABYLON.ShadowsOptimization(1));
options.addOptimization(new BABYLON.PostProcessesOptimization(2));
options.addOptimization(new BABYLON.LensFlaresOptimization(3));
options.addOptimization(new BABYLON.ParticlesOptimization(4));
options.addOptimization(new BABYLON.RenderTargetsOptimization(5));

const optimizer = new BABYLON.SceneOptimizer(scene, options);
optimizer.start();
```

---

## 🤖 AI Packages for Game Intelligence

### 1. **Brain.js** - Neural Networks (Recommended for Learning AI)

Perfect for creating intelligent enemy behaviors, pattern recognition, and adaptive difficulty.

**Installation:**

```bash
npm install brain.js
```

**Use Cases:**

- Enemy behavior learning
- Player pattern recognition
- Adaptive difficulty
- Predictive movement

**Example - Smart Enemy AI:**

```javascript
import brain from 'brain.js';

// Train enemy to predict player movement
const net = new brain.NeuralNetwork();

net.train([
  { input: [0, 0], output: [0] },  // Player at origin, enemy stays
  { input: [1, 0], output: [1] },  // Player moving right, enemy follows
  { input: [0, 1], output: [1] },  // Player moving forward, enemy follows
]);

// Use in game
const playerPos = [player.x, player.z];
const shouldChase = net.run(playerPos);
```

---

### 2. **Behavior Trees** - Simple AI Logic (Recommended for Game AI)

Better for game AI than neural networks - more predictable and easier to debug.

**Installation:**

```bash
npm install behaviortree
```

**Use Cases:**

- Enemy AI decision making
- NPC behaviors
- Boss fight patterns
- Quest logic

**Example - Enemy Behavior:**

```javascript
import { BehaviorTree, Sequence, Selector, Task } from 'behaviortree';

// Define enemy behaviors
const enemyBehavior = new Sequence({
  nodes: [
    new Task({
      run: function(blackboard) {
        // Check if player is in range
        const distance = calculateDistance(enemy, player);
        if (distance < 10) {
          blackboard.playerInRange = true;
          return 'success';
        }
        return 'failure';
      }
    }),
    new Selector({
      nodes: [
        new Task({
          run: function(blackboard) {
            // Attack if close enough
            if (blackboard.playerInRange && distance < 3) {
              enemy.attack();
              return 'success';
            }
            return 'failure';
          }
        }),
        new Task({
          run: function(blackboard) {
            // Chase player
            enemy.moveTowards(player);
            return 'success';
          }
        })
      ]
    })
  ]
});

// Run every frame
scene.onBeforeRenderObservable.add(() => {
  enemyBehavior.step();
});
```

---

### 3. **TensorFlow.js** - Advanced ML (For Advanced Users)

For complex AI like gesture recognition, voice commands, or advanced pattern matching.

**Installation:**

```bash
npm install @tensorflow/tfjs
```

**Use Cases:**

- Player gesture recognition
- Voice commands
- Advanced pattern matching
- Procedural content generation

**Example - Player Action Prediction:**

```javascript
import * as tf from '@tensorflow/tfjs';

// Create a simple model
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [4], units: 10, activation: 'relu' }),
    tf.layers.dense({ units: 3, activation: 'softmax' })
  ]
});

model.compile({
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Predict player action
const prediction = model.predict(tf.tensor2d([[x, y, vx, vy]]));
```

---

## 📊 Performance & Analytics Tools

### 1. **Stats.js** - Performance Monitor

Beautiful performance monitoring overlay.

**Installation:**

```bash
npm install stats.js
```

**Implementation:**

```javascript
import Stats from 'stats.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  // Your render code
  scene.render();
  stats.end();
  requestAnimationFrame(animate);
}
```

---

### 2. **Babylon.js Performance Profiler**

Built-in profiling tools.

```javascript
// Enable profiling
scene.performancePriority = BABYLON.ScenePerformancePriority.BackwardCompatible;

// Get performance data
const instrumentation = new BABYLON.SceneInstrumentation(scene);
instrumentation.captureFrameTime = true;
instrumentation.capturePhysicsTime = true;
instrumentation.captureRenderTime = true;

// Log performance
setInterval(() => {
  console.log('Frame time:', instrumentation.frameTimeCounter.lastSecAverage);
  console.log('Render time:', instrumentation.renderTimeCounter.lastSecAverage);
}, 1000);
```

---

## 🎓 Learning Resources & Tools

### 1. **Babylon.js Playground**

Test code snippets without modifying your project.

**URL:** <https://playground.babylonjs.com/>

**How to Use:**

1. Write Babylon.js code
2. See results instantly
3. Share with others
4. Import into your project

---

### 2. **Babylon.js Documentation**

**URL:** <https://doc.babylonjs.com/>

**Best Sections:**

- Getting Started
- Features (Cameras, Lights, Materials, etc.)
- How To (Specific tasks)
- API Reference

---

### 3. **Babylon.js GUI Editor** (Online Tool)

Visual editor for creating GUI layouts.

**URL:** <https://gui.babylonjs.com/>

**How to Use:**

1. Design your UI visually
2. Export as JSON
3. Load in your game

---

## 🚀 Recommended Setup for Your Game

Based on your 3D Action RPG, here's what I recommend:

### Essential (Add These First)

1. ✅ **Babylon.js Inspector** - Already enabled!
2. 🔧 **Enhanced Performance Monitor** - See implementation below
3. 🤖 **Behavior Trees** - For enemy AI

### Nice to Have

1. 📊 **Stats.js** - Better FPS monitoring
2. 🧠 **Brain.js** - For learning AI behaviors
3. ⚡ **Scene Optimizer** - Auto-optimize performance

### Advanced (Later)

1. 🎯 **TensorFlow.js** - Advanced ML features
2. 🎨 **GUI Editor** - Visual UI design

---

## 📦 Quick Installation Guide

```bash
# Essential packages
npm install behaviortree stats.js

# Optional AI packages
npm install brain.js

# Advanced ML (if needed)
npm install @tensorflow/tfjs
```

---

## 💡 Next Steps

1. **Try the Inspector** - Run with `?debug=true` and explore
2. **Add Performance Monitor** - See the implementation in the next section
3. **Implement Enemy AI** - Use behavior trees for smarter enemies
4. **Optimize Performance** - Use Scene Optimizer

---

## 🎮 Ready-to-Use Implementations

I've created ready-to-use implementations for you:

### 1. Enhanced Performance Monitor

**File:** `src/utils/performanceMonitor.js`

**Usage:**

```javascript
import {
  createEnhancedPerformanceMonitor,
  enablePerformanceMonitorShortcut
} from './src/utils/performanceMonitor.js';

// In game.js after SCENE_MANAGER.start()
const perfMonitor = createEnhancedPerformanceMonitor();
enablePerformanceMonitorShortcut(perfMonitor);

// Press 'P' to toggle the monitor
```

**Features:**

- FPS with color coding (green/yellow/red)
- Frame time
- Draw calls
- Active meshes count
- Total vertices
- Memory usage
- Press 'P' to toggle

---

### 2. Simple Behavior Tree (No Dependencies!)

**File:** `src/ai/simpleBehaviorTree.js`

**Usage:**

```javascript
import { BehaviorTree, Sequence, Selector, Action, Condition } from './src/ai/simpleBehaviorTree.js';

// Create enemy AI
const enemyAI = new BehaviorTree(
  new Selector('Root', [
    new Sequence('Attack', [
      new Condition('Player Close', (ctx) => distance < 3),
      new Action('Attack', (ctx) => enemy.attack())
    ]),
    new Action('Patrol', (ctx) => enemy.patrol())
  ])
);

// Run every frame
scene.onBeforeRenderObservable.add(() => {
  enemyAI.tick();
});
```

---

### 3. AI Examples

**File:** `examples/aiExamples.js`

Ready-to-use AI behaviors:

- Simple Enemy AI (patrol, chase, attack)
- Boss AI with multiple phases
- NPC Shopkeeper AI
- Guard AI with patrol routes

**Usage:**

```javascript
import { createSimpleEnemyAI, setupEnemyAI } from './examples/aiExamples.js';

// Setup enemy AI
const enemyAI = setupEnemyAI(scene, enemy, player);
```

---

## 🚀 Quick Setup Guide

### Enable Performance Monitor (2 minutes)

Add to `game.js`:

```javascript
import {
  createEnhancedPerformanceMonitor,
  enablePerformanceMonitorShortcut
} from './src/utils/performanceMonitor.js';

window.addEventListener('DOMContentLoaded', async function () {
  // ... existing code ...
  await window.SCENE_MANAGER.start();

  // Add performance monitor
  if (config.get('global.debug')) {
    const perfMonitor = createEnhancedPerformanceMonitor();
    enablePerformanceMonitorShortcut(perfMonitor);
    perfMonitor.show(); // Show by default in debug mode

    window.PERF_MONITOR = perfMonitor;
  }
});
```

### Add Enemy AI (5 minutes)

```javascript
import { createSimpleEnemyAI } from './examples/aiExamples.js';

// In your scene creation
const enemy = scene.getMeshByName('enemy');
const player = scene.getMeshByName('player');

const enemyAI = createSimpleEnemyAI(enemy, player);

scene.onBeforeRenderObservable.add(() => {
  enemyAI.tick();
});
```

---

## 📋 Summary

✅ **Created Files:**

- `src/utils/performanceMonitor.js` - Enhanced performance monitoring
- `src/ai/simpleBehaviorTree.js` - Behavior tree system (no dependencies!)
- `examples/aiExamples.js` - Ready-to-use AI behaviors

✅ **Already Available:**

- Babylon.js Inspector (press Ctrl+Shift+I or enabled with `?debug=true`)
- FPS Counter (in persistent UI when debug mode is on)

✅ **Optional Packages:**

- `npm install behaviortree` - Full-featured behavior trees
- `npm install brain.js` - Neural networks for learning AI
- `npm install stats.js` - Beautiful performance graphs
- `npm install @tensorflow/tfjs` - Advanced machine learning

---

## 🎯 Recommended Next Steps

1. **Try the Performance Monitor** - Add it to game.js and press 'P'
2. **Test the Inspector** - Run with `?debug=true` and press Ctrl+Shift+I
3. **Add Enemy AI** - Use the behavior tree examples
4. **Install Optional Packages** - If you need advanced features

Would you like me to add any of these to your game.js file automatically?
