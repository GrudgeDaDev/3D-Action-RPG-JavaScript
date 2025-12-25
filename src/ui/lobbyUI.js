/**
 * Lobby UI - MMO Style Main Menu
 * Beautiful zone selection interface
 * Dynamically loads ALL scenes from config
 */

import { ConfigManager } from '../config/ConfigManager.js';

export function createLobbyUI(scene, sceneManager) {
    const config = ConfigManager.getInstance();
    const scenesConfig = config.get('scenes.scenes');
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("LobbyUI", true, scene);

    // Main container
    const mainContainer = new BABYLON.GUI.Rectangle("mainContainer");
    mainContainer.width = "100%";
    mainContainer.height = "100%";
    mainContainer.thickness = 0;
    mainContainer.background = "rgba(0, 0, 0, 0.3)";
    advancedTexture.addControl(mainContainer);

    // Title
    const title = new BABYLON.GUI.TextBlock("title");
    title.text = "⚔️ GRUDGE STRAT ⚔️";
    title.color = "rgb(245, 202, 86)";
    title.fontSize = 72;
    title.fontWeight = "bold";
    title.top = "-250px";
    title.shadowColor = "rgba(0, 0, 0, 0.8)";
    title.shadowBlur = 20;
    title.shadowOffsetX = 0;
    title.shadowOffsetY = 4;
    mainContainer.addControl(title);

    // Subtitle
    const subtitle = new BABYLON.GUI.TextBlock("subtitle");
    subtitle.text = "Select Your Destination";
    subtitle.color = "rgba(245, 202, 86, 0.8)";
    subtitle.fontSize = 24;
    subtitle.top = "-180px";
    mainContainer.addControl(subtitle);

    // Zone selection panel
    const zonePanel = new BABYLON.GUI.StackPanel("zonePanel");
    zonePanel.width = "600px";
    zonePanel.height = "500px";
    zonePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    zonePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    mainContainer.addControl(zonePanel);

    // Scene emoji mapping
    const sceneEmojis = {
        'inn': '🏨',
        'outdoor': '🌲',
        'night': '🌙',
        'day': '☀️',
        'room': '🏠',
        'underground': '⛏️',
        'town': '🏘️',
        'builder': '🔨'
    };

    // Load ALL zones dynamically from config
    const zones = [];
    Object.entries(scenesConfig).forEach(([sceneKey, sceneData]) => {
        if (sceneData.enabled && sceneData.showInLobby) {
            zones.push({
                name: `${sceneEmojis[sceneKey] || '🎮'} ${sceneData.name}`,
                scene: sceneKey,
                description: sceneData.description,
                difficulty: sceneData.difficulty
            });
        }
    });

    console.log(`📋 Loaded ${zones.length} zones from config:`, zones.map(z => z.scene));

    // Create zone buttons
    zones.forEach((zone, index) => {
        const button = createZoneButton(zone.name, zone.description, () => {
            console.log(`🎮 Traveling to ${zone.scene}...`);
            sceneManager.switchScene(zone.scene);
        });
        zonePanel.addControl(button);
    });

    // Footer text
    const footer = new BABYLON.GUI.TextBlock("footer");
    footer.text = "Press ESC anytime to return to this menu";
    footer.color = "rgba(255, 255, 255, 0.5)";
    footer.fontSize = 16;
    footer.top = "400px";
    mainContainer.addControl(footer);

    return advancedTexture;
}

function createZoneButton(name, description, onClick) {
    // Button container
    const container = new BABYLON.GUI.Rectangle("buttonContainer");
    container.width = "550px";
    container.height = "90px";
    container.thickness = 3;
    container.cornerRadius = 12;
    container.color = "rgba(245, 202, 86, 0.4)";
    container.background = "rgba(20, 20, 30, 0.8)";
    container.paddingTop = "10px";
    container.paddingBottom = "10px";

    // Hover effects
    container.onPointerEnterObservable.add(() => {
        container.color = "rgb(245, 202, 86)";
        container.background = "rgba(245, 202, 86, 0.15)";
        container.thickness = 4;
    });

    container.onPointerOutObservable.add(() => {
        container.color = "rgba(245, 202, 86, 0.4)";
        container.background = "rgba(20, 20, 30, 0.8)";
        container.thickness = 3;
    });

    container.onPointerClickObservable.add(onClick);

    // Button text (zone name)
    const buttonText = new BABYLON.GUI.TextBlock("buttonText");
    buttonText.text = name;
    buttonText.color = "rgb(245, 202, 86)";
    buttonText.fontSize = 28;
    buttonText.fontWeight = "bold";
    buttonText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonText.paddingLeft = "30px";
    buttonText.top = "-15px";
    container.addControl(buttonText);

    // Description text
    const descText = new BABYLON.GUI.TextBlock("descText");
    descText.text = description;
    descText.color = "rgba(255, 255, 255, 0.6)";
    descText.fontSize = 16;
    descText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.paddingLeft = "30px";
    descText.top = "15px";
    container.addControl(descText);

    return container;
}

/**
 * Create a simple lobby scene with camera
 */
export async function createLobbyScene(engine) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "lobbyCamera",
        Math.PI / 2,
        Math.PI / 3,
        10,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(document.getElementById('renderCanvas'), true);
    scene.activeCamera = camera;

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
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

    return scene;
}

