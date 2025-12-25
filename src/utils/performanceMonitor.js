/**
 * Enhanced Performance Monitor for Babylon.js
 * Provides detailed performance metrics beyond just FPS
 */

import { addToPersistentUI } from './persistentUI.js';

/**
 * Create an enhanced performance monitor with detailed metrics
 * @returns {Object} Performance monitor controller
 */
export function createEnhancedPerformanceMonitor() {
  const container = new BABYLON.GUI.Rectangle("perfMonitor");
  container.width = "300px";
  container.height = "200px";
  container.cornerRadius = 8;
  container.color = "white";
  container.thickness = 2;
  container.background = "rgba(0, 0, 0, 0.8)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  container.top = "10px";
  container.left = "10px";
  container.isVisible = false; // Hidden by default

  const stack = new BABYLON.GUI.StackPanel("perfStack");
  stack.width = "100%";
  stack.height = "100%";
  stack.paddingTop = "10px";
  stack.paddingLeft = "10px";
  container.addControl(stack);

  // Title
  const title = new BABYLON.GUI.TextBlock("perfTitle");
  title.text = "⚡ Performance Monitor";
  title.color = "#00ff00";
  title.fontSize = 18;
  title.fontWeight = "bold";
  title.height = "30px";
  title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(title);

  // FPS
  const fpsText = new BABYLON.GUI.TextBlock("perfFPS");
  fpsText.text = "FPS: 60";
  fpsText.color = "white";
  fpsText.fontSize = 14;
  fpsText.height = "25px";
  fpsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(fpsText);

  // Frame Time
  const frameTimeText = new BABYLON.GUI.TextBlock("perfFrameTime");
  frameTimeText.text = "Frame: 16.67ms";
  frameTimeText.color = "white";
  frameTimeText.fontSize = 14;
  frameTimeText.height = "25px";
  frameTimeText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(frameTimeText);

  // Draw Calls
  const drawCallsText = new BABYLON.GUI.TextBlock("perfDrawCalls");
  drawCallsText.text = "Draw Calls: 0";
  drawCallsText.color = "white";
  drawCallsText.fontSize = 14;
  drawCallsText.height = "25px";
  drawCallsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(drawCallsText);

  // Active Meshes
  const meshesText = new BABYLON.GUI.TextBlock("perfMeshes");
  meshesText.text = "Meshes: 0";
  meshesText.color = "white";
  meshesText.fontSize = 14;
  meshesText.height = "25px";
  meshesText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(meshesText);

  // Vertices
  const verticesText = new BABYLON.GUI.TextBlock("perfVertices");
  verticesText.text = "Vertices: 0";
  verticesText.color = "white";
  verticesText.fontSize = 14;
  verticesText.height = "25px";
  verticesText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(verticesText);

  // Memory (if available)
  const memoryText = new BABYLON.GUI.TextBlock("perfMemory");
  memoryText.text = "Memory: N/A";
  memoryText.color = "white";
  memoryText.fontSize = 14;
  memoryText.height = "25px";
  memoryText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  stack.addControl(memoryText);

  addToPersistentUI(container);

  // Update function
  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 60;

  const update = () => {
    if (!container.isVisible) return;

    const scene = SCENE_MANAGER?.activeScene;
    const engine = SCENE_MANAGER?.engine;

    if (!scene || !engine) return;

    // Calculate FPS
    frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= 1000) {
      fps = Math.round((frameCount * 1000) / deltaTime);
      frameCount = 0;
      lastTime = currentTime;
    }

    // Update FPS with color coding
    const fpsColor = fps >= 55 ? "#00ff00" : fps >= 30 ? "#ffaa00" : "#ff0000";
    fpsText.text = `FPS: ${fps}`;
    fpsText.color = fpsColor;

    // Frame time
    const frameTime = (1000 / fps).toFixed(2);
    frameTimeText.text = `Frame: ${frameTime}ms`;

    // Draw calls
    const drawCalls = engine.drawCalls || 0;
    drawCallsText.text = `Draw Calls: ${drawCalls}`;

    // Active meshes
    const activeMeshes = scene.getActiveMeshes().length;
    meshesText.text = `Meshes: ${activeMeshes}`;

    // Total vertices
    const totalVertices = scene.getTotalVertices();
    const verticesFormatted = totalVertices > 1000 
      ? `${(totalVertices / 1000).toFixed(1)}k` 
      : totalVertices;
    verticesText.text = `Vertices: ${verticesFormatted}`;

    // Memory (if available)
    if (performance.memory) {
      const usedMemory = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      const totalMemory = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
      memoryText.text = `Memory: ${usedMemory}/${totalMemory} MB`;
    }
  };

  // Run update every frame
  if (SCENE_MANAGER?.engine) {
    SCENE_MANAGER.engine.runRenderLoop(update);
  }

  return {
    element: container,
    show() {
      container.isVisible = true;
    },
    hide() {
      container.isVisible = false;
    },
    toggle() {
      container.isVisible = !container.isVisible;
    }
  };
}

/**
 * Create a simple FPS graph
 * @returns {Object} FPS graph controller
 */
export function createFPSGraph() {
  const container = new BABYLON.GUI.Rectangle("fpsGraph");
  container.width = "200px";
  container.height = "100px";
  container.cornerRadius = 5;
  container.color = "white";
  container.thickness = 2;
  container.background = "rgba(0, 0, 0, 0.8)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  container.top = "10px";
  container.left = "-10px";
  container.isVisible = false;

  // TODO: Implement actual graph rendering
  // This would require canvas drawing or multiple rectangles
  const text = new BABYLON.GUI.TextBlock();
  text.text = "FPS Graph\n(Coming Soon)";
  text.color = "white";
  text.fontSize = 14;
  container.addControl(text);

  addToPersistentUI(container);

  return {
    element: container,
    show() {
      container.isVisible = true;
    },
    hide() {
      container.isVisible = false;
    }
  };
}

/**
 * Add keyboard shortcut to toggle performance monitor
 * Press 'P' to toggle
 */
export function enablePerformanceMonitorShortcut(monitor) {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
      if (!event.ctrlKey && !event.altKey && !event.metaKey) {
        monitor.toggle();
        console.log('Performance Monitor:', monitor.element.isVisible ? 'ON' : 'OFF');
      }
    }
  });
}

