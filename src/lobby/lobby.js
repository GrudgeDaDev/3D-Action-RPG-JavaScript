/**
 * Lobby Scene - Main entry point for the game
 * Provides scene selection, settings, and admin panel access
 */
import { ConfigManager } from '../config/ConfigManager.js';
import { createHTMLLobbyUI } from '../ui/htmlLobbyUI.js';

export async function createLobby(scene, canvas, sceneManager) {
  console.log('🎮 Creating Lobby Scene - MMO Style...');

  const config = ConfigManager.getInstance();
  const scenesConfig = config.get('scenes.scenes');

  // Set clear color for lobby
  scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

  // Create camera
  const camera = new BABYLON.ArcRotateCamera(
    "lobbyCamera",
    Math.PI / 2,
    Math.PI / 3,
    10,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 20;
  scene.activeCamera = camera;

  // Create lighting
  const light = new BABYLON.HemisphericLight(
    "lobbyLight",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  // Optional: Add a simple 3D background element
  const sphere = BABYLON.MeshBuilder.CreateSphere("lobbySphere", { diameter: 2 }, scene);
  sphere.position.y = 1;

  const material = new BABYLON.StandardMaterial("lobbyMat", scene);
  material.diffuseColor = new BABYLON.Color3(0.96, 0.79, 0.34);
  material.emissiveColor = new BABYLON.Color3(0.2, 0.16, 0.07);
  sphere.material = material;

  // Slow rotation animation
  scene.registerBeforeRender(() => {
    sphere.rotation.y += 0.005;
  });

  // Create HTML-based lobby UI (more reliable than Babylon GUI)
  const lobbyUI = createHTMLLobbyUI(sceneManager);

  // Store reference for cleanup
  scene.onDisposeObservable.add(() => {
    lobbyUI.destroy();
  });

  console.log('✅ Lobby Scene Created - MMO Style with HTML UI');
}

// Old helper functions removed - now using lobbyUI.js for MMO-style interface
