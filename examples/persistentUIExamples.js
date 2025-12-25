/**
 * Persistent UI Examples
 * Copy these examples into your game code to add persistent UI elements
 */

import { addToPersistentUI, removeFromPersistentUI, getPersistentUI } from '../src/utils/persistentUI.js';

// ============================================
// Example 1: Simple Score Display
// ============================================
export function createScoreDisplay() {
  const scoreText = new BABYLON.GUI.TextBlock("scoreDisplay");
  scoreText.text = "Score: 0";
  scoreText.color = "white";
  scoreText.fontSize = 24;
  scoreText.fontWeight = "bold";
  scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  scoreText.top = "20px";
  scoreText.outlineWidth = 2;
  scoreText.outlineColor = "black";
  
  addToPersistentUI(scoreText);
  
  return {
    element: scoreText,
    updateScore(score) {
      scoreText.text = `Score: ${score}`;
    }
  };
}

// ============================================
// Example 2: Player Health Bar
// ============================================
export function createHealthBar() {
  // Container
  const container = new BABYLON.GUI.Rectangle("healthBarContainer");
  container.width = "300px";
  container.height = "60px";
  container.cornerRadius = 8;
  container.color = "white";
  container.thickness = 2;
  container.background = "rgba(0, 0, 0, 0.6)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  container.left = "20px";
  container.bottom = "20px";
  
  // Background bar
  const bgBar = new BABYLON.GUI.Rectangle("healthBarBg");
  bgBar.width = "280px";
  bgBar.height = "30px";
  bgBar.cornerRadius = 5;
  bgBar.background = "rgba(100, 0, 0, 0.5)";
  bgBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  container.addControl(bgBar);
  
  // Health bar (foreground)
  const healthBar = new BABYLON.GUI.Rectangle("healthBar");
  healthBar.width = "280px";
  healthBar.height = "30px";
  healthBar.cornerRadius = 5;
  healthBar.background = "green";
  healthBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  healthBar.left = "10px";
  container.addControl(healthBar);
  
  // Health text
  const healthText = new BABYLON.GUI.TextBlock("healthText");
  healthText.text = "100 / 100";
  healthText.color = "white";
  healthText.fontSize = 18;
  healthText.fontWeight = "bold";
  healthText.outlineWidth = 2;
  healthText.outlineColor = "black";
  container.addControl(healthText);
  
  addToPersistentUI(container);
  
  return {
    element: container,
    update(current, max) {
      const percentage = Math.max(0, Math.min(1, current / max));
      healthBar.width = `${280 * percentage}px`;
      healthText.text = `${Math.floor(current)} / ${max}`;
      
      // Color based on health percentage
      if (percentage > 0.6) {
        healthBar.background = "green";
      } else if (percentage > 0.3) {
        healthBar.background = "orange";
      } else {
        healthBar.background = "red";
      }
    }
  };
}

// ============================================
// Example 3: Mana Bar
// ============================================
export function createManaBar() {
  const container = new BABYLON.GUI.Rectangle("manaBarContainer");
  container.width = "300px";
  container.height = "60px";
  container.cornerRadius = 8;
  container.color = "white";
  container.thickness = 2;
  container.background = "rgba(0, 0, 0, 0.6)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  container.left = "20px";
  container.bottom = "90px"; // Above health bar
  
  const manaBar = new BABYLON.GUI.Rectangle("manaBar");
  manaBar.width = "280px";
  manaBar.height = "30px";
  manaBar.cornerRadius = 5;
  manaBar.background = "blue";
  manaBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  manaBar.left = "10px";
  container.addControl(manaBar);
  
  const manaText = new BABYLON.GUI.TextBlock("manaText");
  manaText.text = "100 / 100";
  manaText.color = "white";
  manaText.fontSize = 18;
  manaText.fontWeight = "bold";
  manaText.outlineWidth = 2;
  manaText.outlineColor = "black";
  container.addControl(manaText);
  
  addToPersistentUI(container);
  
  return {
    element: container,
    update(current, max) {
      const percentage = Math.max(0, Math.min(1, current / max));
      manaBar.width = `${280 * percentage}px`;
      manaText.text = `${Math.floor(current)} / ${max}`;
    }
  };
}

// ============================================
// Example 4: Quest Tracker
// ============================================
export function createQuestTracker() {
  const container = new BABYLON.GUI.Rectangle("questTracker");
  container.width = "350px";
  container.height = "200px";
  container.cornerRadius = 8;
  container.color = "white";
  container.thickness = 2;
  container.background = "rgba(0, 0, 0, 0.7)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  container.top = "20px";
  container.left = "-20px";
  
  const stack = new BABYLON.GUI.StackPanel("questStack");
  stack.width = "100%";
  stack.height = "100%";
  container.addControl(stack);
  
  // Title
  const title = new BABYLON.GUI.TextBlock("questTitle");
  title.text = "Active Quests";
  title.color = "gold";
  title.fontSize = 20;
  title.fontWeight = "bold";
  title.height = "40px";
  title.paddingTop = "10px";
  stack.addControl(title);
  
  addToPersistentUI(container);
  
  return {
    element: container,
    stack: stack,
    addQuest(questName, description) {
      const questText = new BABYLON.GUI.TextBlock();
      questText.text = `• ${questName}\n  ${description}`;
      questText.color = "white";
      questText.fontSize = 14;
      questText.height = "50px";
      questText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      questText.paddingLeft = "15px";
      questText.textWrapping = true;
      stack.addControl(questText);
      return questText;
    },
    removeQuest(questElement) {
      stack.removeControl(questElement);
    },
    clear() {
      // Keep title, remove everything else
      while (stack.children.length > 1) {
        stack.removeControl(stack.children[1]);
      }
    }
  };
}

// ============================================
// Example 5: Mini-Map
// ============================================
export function createMiniMap() {
  const miniMap = new BABYLON.GUI.Rectangle("miniMap");
  miniMap.width = "200px";
  miniMap.height = "200px";
  miniMap.cornerRadius = 10;
  miniMap.color = "white";
  miniMap.thickness = 2;
  miniMap.background = "rgba(0, 0, 0, 0.7)";
  miniMap.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  miniMap.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  miniMap.top = "-20px";
  miniMap.left = "-20px";
  
  // Player dot (center)
  const playerDot = new BABYLON.GUI.Ellipse("playerDot");
  playerDot.width = "12px";
  playerDot.height = "12px";
  playerDot.color = "blue";
  playerDot.background = "blue";
  playerDot.thickness = 2;
  miniMap.addControl(playerDot);
  
  // North indicator
  const northText = new BABYLON.GUI.TextBlock("northIndicator");
  northText.text = "N";
  northText.color = "white";
  northText.fontSize = 16;
  northText.fontWeight = "bold";
  northText.top = "-80px";
  miniMap.addControl(northText);
  
  addToPersistentUI(miniMap);
  
  const markers = [];
  
  return {
    element: miniMap,
    addMarker(x, z, color = "red", size = "8px") {
      const marker = new BABYLON.GUI.Ellipse(`marker_${markers.length}`);
      marker.width = size;
      marker.height = size;
      marker.color = color;
      marker.background = color;
      marker.left = `${x}px`;
      marker.top = `${z}px`;
      miniMap.addControl(marker);
      markers.push(marker);
      return marker;
    },
    removeMarker(marker) {
      miniMap.removeControl(marker);
      const index = markers.indexOf(marker);
      if (index > -1) markers.splice(index, 1);
    },
    clearMarkers() {
      markers.forEach(marker => miniMap.removeControl(marker));
      markers.length = 0;
    }
  };
}

// ============================================
// Example 6: Combo Counter
// ============================================
export function createComboCounter() {
  const container = new BABYLON.GUI.Rectangle("comboCounter");
  container.width = "200px";
  container.height = "80px";
  container.cornerRadius = 10;
  container.color = "orange";
  container.thickness = 3;
  container.background = "rgba(255, 100, 0, 0.8)";
  container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  container.top = "100px";
  container.isVisible = false; // Hidden by default
  
  const comboText = new BABYLON.GUI.TextBlock("comboText");
  comboText.text = "0 COMBO";
  comboText.color = "white";
  comboText.fontSize = 32;
  comboText.fontWeight = "bold";
  comboText.outlineWidth = 3;
  comboText.outlineColor = "black";
  container.addControl(comboText);
  
  addToPersistentUI(container);
  
  let hideTimeout = null;
  
  return {
    element: container,
    show(combo) {
      container.isVisible = true;
      comboText.text = `${combo} COMBO`;
      
      // Auto-hide after 2 seconds
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        container.isVisible = false;
      }, 2000);
    },
    hide() {
      container.isVisible = false;
      if (hideTimeout) clearTimeout(hideTimeout);
    }
  };
}

// ============================================
// Usage Example
// ============================================
/*
// In your game initialization (game.js):

import { 
  createScoreDisplay, 
  createHealthBar, 
  createManaBar,
  createQuestTracker,
  createMiniMap,
  createComboCounter
} from './examples/persistentUIExamples.js';

// After SCENE_MANAGER.start()
const score = createScoreDisplay();
const health = createHealthBar();
const mana = createManaBar();
const quests = createQuestTracker();
const miniMap = createMiniMap();
const combo = createComboCounter();

// Update from anywhere in your code
score.updateScore(1000);
health.update(75, 100);
mana.update(50, 100);

quests.addQuest("Defeat the Dragon", "Find and defeat the dragon in the cave");
quests.addQuest("Collect 10 Herbs", "Gather healing herbs from the forest");

miniMap.addMarker(50, 30, "red"); // Enemy
miniMap.addMarker(-20, 40, "green"); // Quest objective

combo.show(5); // Show 5 combo

// Store globally for easy access
window.GAME_UI = { score, health, mana, quests, miniMap, combo };
*/

