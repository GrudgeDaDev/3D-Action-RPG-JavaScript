/**
 * EnhancedLobbyUI.js
 * Enhanced lobby UI with admin features
 */

import { getAuthManager } from '../auth/AuthManager.js';
import { ConfigManager } from '../config/ConfigManager.js';

export class EnhancedLobbyUI {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.authManager = getAuthManager();
        this.config = ConfigManager.getInstance();
        this.advancedTexture = null;
    }

    /**
     * Create lobby UI
     */
    create() {
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("LobbyUI", true, this.scene);
        
        const isAdmin = this.authManager.getUserRole() === 'admin';
        
        if (isAdmin) {
            this.createAdminLobby();
        } else {
            this.createClientLobby();
        }
    }

    /**
     * Create admin lobby with full features
     */
    createAdminLobby() {
        console.log('🔧 Creating Admin Lobby...');

        // Main container
        const container = new BABYLON.GUI.Rectangle();
        container.width = "100%";
        container.height = "100%";
        container.thickness = 0;
        this.advancedTexture.addControl(container);

        // Header
        const header = this.createHeader("🔧 ADMIN LOBBY - Full Access");
        container.addControl(header);

        // Admin quick actions
        const quickActions = this.createAdminQuickActions();
        container.addControl(quickActions);

        // Scene grid
        const sceneGrid = this.createSceneGrid(true);
        container.addControl(sceneGrid);

        // Footer with admin info
        const footer = this.createAdminFooter();
        container.addControl(footer);
    }

    /**
     * Create client lobby (simplified)
     */
    createClientLobby() {
        console.log('🎮 Creating Client Lobby...');

        const container = new BABYLON.GUI.Rectangle();
        container.width = "100%";
        container.height = "100%";
        container.thickness = 0;
        this.advancedTexture.addControl(container);

        // Simple header
        const header = this.createHeader("🎮 GRUDGE WARLORDS");
        container.addControl(header);

        // Limited scene selection
        const sceneGrid = this.createSceneGrid(false);
        container.addControl(sceneGrid);
    }

    /**
     * Create header
     */
    createHeader(title) {
        const header = new BABYLON.GUI.TextBlock();
        header.text = title;
        header.color = "white";
        header.fontSize = 48;
        header.fontWeight = "bold";
        header.height = "100px";
        header.top = "20px";
        header.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        return header;
    }

    /**
     * Create admin quick actions panel
     */
    createAdminQuickActions() {
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "300px";
        panel.height = "200px";
        panel.top = "120px";
        panel.left = "20px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.background = "rgba(0, 0, 0, 0.7)";
        panel.paddingTop = "10px";
        panel.paddingBottom = "10px";

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "⚡ Quick Actions";
        title.color = "#FFB74D";
        title.fontSize = 20;
        title.height = "30px";
        panel.addControl(title);

        // Admin Panel button
        const adminPanelBtn = this.createQuickActionButton("⚙️ Admin Panel", () => {
            window.open('/admin/index.html', '_blank');
        });
        panel.addControl(adminPanelBtn);

        // Editor Scene button
        const editorBtn = this.createQuickActionButton("🎨 Game Editor", () => {
            this.sceneManager.switchScene('archipelagoEditor');
        });
        panel.addControl(editorBtn);

        // Debug Tools button
        const debugBtn = this.createQuickActionButton("🔍 Debug Tools", () => {
            if (window.PERF_MONITOR) {
                window.PERF_MONITOR.toggle();
            }
        });
        panel.addControl(debugBtn);

        return panel;
    }

    /**
     * Create quick action button
     */
    createQuickActionButton(text, onClick) {
        const button = BABYLON.GUI.Button.CreateSimpleButton("btn", text);
        button.width = "280px";
        button.height = "40px";
        button.color = "white";
        button.background = "rgba(255, 152, 0, 0.3)";
        button.thickness = 2;
        button.cornerRadius = 5;
        button.paddingTop = "5px";
        button.paddingBottom = "5px";
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 152, 0, 0.5)";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 152, 0, 0.3)";
        });
        
        button.onPointerClickObservable.add(onClick);
        
        return button;
    }

    /**
     * Create scene grid
     */
    createSceneGrid(showAll) {
        // Implementation similar to existing lobby
        // Filter scenes based on user permissions
        const scenesConfig = this.config.get('scenes.scenes');
        const availableScenes = [];

        for (const [sceneKey, sceneData] of Object.entries(scenesConfig)) {
            if (!sceneData.enabled || !sceneData.showInLobby) continue;
            
            // Check permissions
            if (!showAll && !this.authManager.canAccessScene(sceneKey)) continue;
            
            availableScenes.push([sceneKey, sceneData]);
        }

        // Create grid (simplified for now)
        const grid = new BABYLON.GUI.StackPanel();
        grid.width = "80%";
        grid.top = showAll ? "340px" : "140px";
        grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        availableScenes.forEach(([sceneKey, sceneData]) => {
            const btn = this.createSceneButton(sceneKey, sceneData);
            grid.addControl(btn);
        });

        return grid;
    }

    /**
     * Create scene button
     */
    createSceneButton(sceneKey, sceneData) {
        const button = BABYLON.GUI.Button.CreateSimpleButton("btn", `${sceneData.name}`);
        button.width = "400px";
        button.height = "60px";
        button.color = "white";
        button.background = "rgba(76, 175, 80, 0.3)";
        button.thickness = 2;
        button.cornerRadius = 8;
        button.paddingTop = "10px";
        button.paddingBottom = "10px";
        
        button.onPointerClickObservable.add(() => {
            console.log(`🎮 Loading scene: ${sceneKey}`);
            this.sceneManager.switchScene(sceneKey);
        });
        
        return button;
    }

    /**
     * Create admin footer
     */
    createAdminFooter() {
        const footer = new BABYLON.GUI.TextBlock();
        footer.text = `Logged in as: ${this.authManager.getCurrentUser().username} (Admin)`;
        footer.color = "#FFB74D";
        footer.fontSize = 14;
        footer.height = "30px";
        footer.bottom = "10px";
        footer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        return footer;
    }

    /**
     * Dispose UI
     */
    dispose() {
        if (this.advancedTexture) {
            this.advancedTexture.dispose();
        }
    }
}

