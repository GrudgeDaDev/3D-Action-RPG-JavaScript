import { createLobby } from '../lobby/lobby.js';
import { createNight } from './scenes/night.js';
import { createDayDynamicTerrain } from './scenes/day.js';
import { createOutdoor } from './scenes/outdoor.js';
import { createRoom } from './scenes/room.js';
import { createUnderground } from './scenes/underground.js';
import { createTown } from './scenes/town.js';
import { createRoomGI } from './scenes/roomGI.js';
import { createInn } from './scenes/inn.js';
import { createBuilder } from './scenes/builder.js';
import { createArchipelago } from './scenes/archipelago.js';
import { createArchipelagoEditor } from './scenes/archipelagoEditor.js';
import { ConfigManager } from '../config/ConfigManager.js';

class SceneManager {
  constructor(canvasId, engine) {
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.guiTextures = new Map();
    this.scenes = [];
    this.sceneMap = new Map(); // Map scene names to scene objects
    this.activeScene = null;

    // Persistent UI canvas that stays across all scenes
    this.persistentGUI = null;
    this.persistentScene = null;

    this.sceneCreators = {
      lobby: createLobby,
      night: createNight,
      day: createDayDynamicTerrain,
      outdoor: createOutdoor,
      room: createRoom,
      underground: createUnderground,
      town: createTown,
      roomGI: createRoomGI,
      inn: createInn,
      builder: createBuilder,
      archipelago: createArchipelago,
      archipelagoEditor: createArchipelagoEditor
    };
  }

  /**
   * Initialize persistent UI layer that stays across all scenes
   * Creates a fullscreen UI texture that uses the active scene's camera
   */
  initPersistentUI() {
    // Don't create a separate scene - just create the GUI texture
    // It will be attached to the active scene and use its camera
    // This is created on-demand when first accessed
    console.log('✅ Persistent UI will be initialized with active scene camera');
  }

  /**
   * Get the persistent UI texture for adding global UI elements
   * Creates a fullscreen UI on the active scene's camera
   * @returns {BABYLON.GUI.AdvancedDynamicTexture}
   */
  getPersistentGUI() {
    if (!this.persistentGUI && this.activeScene) {
      // Create fullscreen UI texture attached to the active scene
      // This uses the active scene's camera automatically
      this.persistentGUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
        "PersistentUI",
        true,
        this.activeScene
      );
      console.log('✅ Persistent UI created on active scene');
    }
    return this.persistentGUI;
  }


  async loadScene(sceneCreationFunction, sceneName = null) {
    let scene;

    // Check if this is the lobby scene (new pattern) or existing scene (old pattern)
    if (sceneName === 'lobby') {
      // New pattern: create scene first, then pass it to the function
      scene = new BABYLON.Scene(this.engine);
      await sceneCreationFunction(scene, this.canvas, this);
    } else {
      // Old pattern: scene creation function creates and returns the scene
      scene = await sceneCreationFunction(this.engine);
    }

    scene.damagePopupAnimationGroup = new BABYLON.AnimationGroup("popupAnimation", scene);
    this.scenes.push(scene);

    if (sceneName) {
      this.sceneMap.set(sceneName, scene);
    }

    this.guiTextures.set(scene, new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene));
    this.activeGUI = this.guiTextures.get(this.activeScene);
    return scene;
  }

  async switchToScene(index) {
    if (this.activeScene) {
      this.engine.stopRenderLoop();
      if (DEBUG) this.activeScene.debugLayer.hide();
      //   this.activeScene.dispose(); // Optional: dispose only if not planning to return to this scene
    }
    this.activeScene = this.scenes[index];
    this.activeGUI = this.guiTextures.get(this.activeScene);

    // Setup render loop - persistent UI is part of the active scene
    this.engine.runRenderLoop(() => {
      this.activeScene.render();
    });

    if (DEBUG) this.activeScene.debugLayer.show();
  }

  /**
   * Switch to a scene by name
   */
  async switchScene(sceneName) {
    console.log(`🎬 Switching to scene: ${sceneName} - SceneManager.js:131`);

    // Check if scene is already loaded
    if (this.sceneMap.has(sceneName)) {
      console.log(`✅ Scene "${sceneName}" already loaded, switching... - SceneManager.js:135`);
      const sceneIndex = this.scenes.indexOf(this.sceneMap.get(sceneName));
      await this.switchToScene(sceneIndex);
      return;
    }

    // Load new scene
    const sceneCreator = this.sceneCreators[sceneName];
    if (!sceneCreator) {
      console.error(`❌ Scene "${sceneName}" not found in sceneCreators - SceneManager.js:144`);
      console.log('Available scenes: - SceneManager.js:145', Object.keys(this.sceneCreators));
      return;
    }

    console.log(`📦 Loading new scene: ${sceneName}... - SceneManager.js:149`);
    try {
      await this.loadScene(sceneCreator, sceneName);
      console.log(`✅ Scene "${sceneName}" loaded successfully - SceneManager.js:152`);
      await this.switchToScene(this.scenes.length - 1);
      console.log(`✅ Switched to scene "${sceneName}" - SceneManager.js:154`);
    } catch (error) {
      console.error(`❌ Error loading scene "${sceneName}": - SceneManager.js:156`, error);
    }
  }

  // todo map of scenes near the current scene
  // in this case, just load starting zone
  async start(initialSceneName = null) {
    const config = ConfigManager.getInstance();

    let timeout = 100;
    if (!FAST_RELOAD) timeout = 1000;
    setTimeout(() => {
      this.canvas.classList.add('visible');
    }, timeout);

    const urlParams = new URLSearchParams(window.location.search);

    const debugParam = urlParams.get('debug');
    if (debugParam === 'true') { DEBUG = true; }

    // Use provided initial scene, or fall back to URL param, or config default
    const sceneParam = urlParams.get('scene');
    const defaultSceneName = initialSceneName || sceneParam || config.get('scenes.defaultScene', 'lobby');
    const defaultScene = this.sceneCreators[defaultSceneName] || this.sceneCreators.lobby;

    console.log(`🎬 Starting with scene: ${defaultSceneName}`);

    await this.loadScene(defaultScene, defaultSceneName);
    await this.switchToScene(0);
    this.canvas.focus();

    // Uncomment this for key based scene switching. 
    // await this.loadScene(this.sceneCreators['inn']);
    // await this.loadScene(this.sceneCreators['builder']);
    // Setup scene switching logic, e.g., based on user input or game events
    // window.addEventListener('keydown', (e) => {
    //   if (e.key === 'i') {
    //     this.switchToScene(0);
    //   } else if (e.key === 'o') {
    //     this.switchToScene(1);
    //   } else if (e.key === 'p') {
    //     this.switchToScene(2);
    //   }
    // });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    const endTime = performance.now();
    const domLoadTime = endTime - startTime;
    console.log(`Scene loaded in ${domLoadTime.toFixed(2)} milliseconds - SceneManager.js:207`);

  }
}

export default SceneManager;
