/**
 * Persistent UI Helper
 * Utilities for adding UI elements to the persistent canvas that stays across all scenes
 */

/**
 * Get the persistent UI texture from the scene manager
 * @returns {BABYLON.GUI.AdvancedDynamicTexture}
 */
export function getPersistentUI() {
  if (!SCENE_MANAGER || !SCENE_MANAGER.getPersistentGUI) {
    console.error('❌ SceneManager not initialized or persistent UI not available');
    return null;
  }
  return SCENE_MANAGER.getPersistentGUI();
}

/**
 * Add a UI element to the persistent canvas
 * @param {BABYLON.GUI.Control} control - The GUI control to add
 * @returns {boolean} Success status
 */
export function addToPersistentUI(control) {
  const persistentGUI = getPersistentUI();
  if (!persistentGUI) {
    console.error('❌ Cannot add to persistent UI - not initialized');
    return false;
  }
  
  persistentGUI.addControl(control);
  console.log('✅ Added control to persistent UI:', control.name);
  return true;
}

/**
 * Remove a UI element from the persistent canvas
 * @param {BABYLON.GUI.Control} control - The GUI control to remove
 * @returns {boolean} Success status
 */
export function removeFromPersistentUI(control) {
  const persistentGUI = getPersistentUI();
  if (!persistentGUI) {
    console.error('❌ Cannot remove from persistent UI - not initialized');
    return false;
  }
  
  persistentGUI.removeControl(control);
  console.log('✅ Removed control from persistent UI:', control.name);
  return true;
}

/**
 * Create a simple FPS counter that persists across scenes
 * @returns {BABYLON.GUI.TextBlock}
 */
export function createPersistentFPSCounter() {
  const fpsText = new BABYLON.GUI.TextBlock("fpsCounter");
  fpsText.text = "FPS: 60";
  fpsText.color = "white";
  fpsText.fontSize = 16;
  fpsText.fontWeight = "bold";
  fpsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  fpsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  fpsText.top = "10px";
  fpsText.left = "-10px";
  fpsText.outlineWidth = 2;
  fpsText.outlineColor = "black";
  
  // Update FPS every frame
  if (SCENE_MANAGER && SCENE_MANAGER.engine) {
    SCENE_MANAGER.engine.runRenderLoop(() => {
      const fps = SCENE_MANAGER.engine.getFps().toFixed(0);
      fpsText.text = `FPS: ${fps}`;
    });
  }
  
  addToPersistentUI(fpsText);
  return fpsText;
}

/**
 * Create a persistent notification system
 * @returns {Object} Notification controller
 */
export function createPersistentNotifications() {
  const container = new BABYLON.GUI.StackPanel("notificationContainer");
  container.width = "300px";
  container.height = "400px";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  container.top = "50px";
  container.left = "-20px";
  
  addToPersistentUI(container);
  
  return {
    container,
    
    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duration in ms (0 = permanent)
     */
    show(message, type = 'info', duration = 3000) {
      const notification = new BABYLON.GUI.Rectangle(`notification_${Date.now()}`);
      notification.width = "280px";
      notification.height = "60px";
      notification.cornerRadius = 5;
      notification.thickness = 2;
      notification.paddingTop = "5px";
      
      // Color based on type
      const colors = {
        info: { bg: "rgba(33, 150, 243, 0.9)", border: "#2196F3" },
        success: { bg: "rgba(76, 175, 80, 0.9)", border: "#4CAF50" },
        warning: { bg: "rgba(255, 152, 0, 0.9)", border: "#FF9800" },
        error: { bg: "rgba(244, 67, 54, 0.9)", border: "#F44336" }
      };
      
      const color = colors[type] || colors.info;
      notification.background = color.bg;
      notification.color = color.border;
      
      const text = new BABYLON.GUI.TextBlock();
      text.text = message;
      text.color = "white";
      text.fontSize = 14;
      text.textWrapping = true;
      notification.addControl(text);
      
      container.addControl(notification);
      
      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          container.removeControl(notification);
        }, duration);
      }
      
      return notification;
    },
    
    /**
     * Clear all notifications
     */
    clear() {
      container.children.forEach(child => {
        container.removeControl(child);
      });
    }
  };
}

/**
 * Create a persistent debug panel
 * @returns {BABYLON.GUI.Rectangle}
 */
export function createPersistentDebugPanel() {
  const panel = new BABYLON.GUI.Rectangle("debugPanel");
  panel.width = "250px";
  panel.height = "150px";
  panel.cornerRadius = 5;
  panel.color = "white";
  panel.thickness = 2;
  panel.background = "rgba(0, 0, 0, 0.7)";
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel.top = "10px";
  panel.left = "10px";
  
  const stack = new BABYLON.GUI.StackPanel();
  stack.width = "100%";
  stack.height = "100%";
  panel.addControl(stack);
  
  // Title
  const title = new BABYLON.GUI.TextBlock();
  title.text = "Debug Info";
  title.color = "white";
  title.fontSize = 16;
  title.fontWeight = "bold";
  title.height = "30px";
  stack.addControl(title);
  
  // Info text
  const infoText = new BABYLON.GUI.TextBlock("debugInfo");
  infoText.text = "Loading...";
  infoText.color = "white";
  infoText.fontSize = 12;
  infoText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  infoText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  infoText.paddingLeft = "10px";
  infoText.paddingTop = "5px";
  stack.addControl(infoText);
  
  addToPersistentUI(panel);
  
  return panel;
}

