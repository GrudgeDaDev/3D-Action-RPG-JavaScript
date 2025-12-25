import SceneManager from './src/scene/SceneManager.js';
import { setSceneManager } from './src/character/damagePopup.js';
import { ConfigManager } from './src/config/ConfigManager.js';
import { createPersistentFPSCounter, createPersistentNotifications } from './src/utils/persistentUI.js';
import { createEnhancedPerformanceMonitor, enablePerformanceMonitorShortcut } from './src/utils/performanceMonitor.js';
import { createSceneNavigator, enableSceneNavigatorShortcuts } from './src/utils/sceneNavigator.js';
import { GameMenu } from './src/ui/gameMenu.js';
import { MainPanel } from './src/ui/MainPanel.js';
import { SettingsUI } from './src/ui/SettingsUI.js';
import { LoginScreen } from './src/auth/LoginScreen.js';
import { getAuthManager } from './src/auth/AuthManager.js';

window.addEventListener('DOMContentLoaded', async function () {
    console.log('🎮 Starting GRUDGE WARLORDS...');

    // Initialize Configuration Manager
    console.log('📋 Loading configurations...');
    const config = ConfigManager.getInstance();
    await config.loadAll();

    // Initialize Auth Manager
    const authManager = getAuthManager();
    window.AUTH_MANAGER = authManager;

    // Show Login Screen
    console.log('🔐 Showing login screen...');
    const loginScreen = new LoginScreen(async (userRole) => {
        console.log(`✅ Login complete as: ${userRole}`);
        await initializeGame(config, userRole);
    });
    loginScreen.show();
});

/**
 * Initialize game after login
 */
async function initializeGame(config, userRole) {
    console.log(`🎮 Initializing game for ${userRole}...`);

    // Enable hot-reload in debug mode
    if (config.get('global.debug') || config.get('global.developer.hotReload')) {
        config.enableHotReload();
        console.log('🔥 Hot-reload enabled');
    }

    // Initialize Settings UI
    console.log('⚙️ Initializing Settings UI...');
    const settingsUI = new SettingsUI();
    await settingsUI.initialize();
    window.SETTINGS_UI = settingsUI;

    // Initialize Scene Manager
    console.log('🎬 Initializing Scene Manager...');
    window.SCENE_MANAGER = new SceneManager('renderCanvas');

    // Determine initial scene based on user role
    let initialScene;
    if (userRole === 'admin') {
        // Admin goes to lobby with all scenes
        initialScene = 'lobby';
        console.log('🔧 Admin mode: Starting in Lobby with full access');
    } else {
        // Client goes directly to Archipelago
        initialScene = 'archipelago';
        console.log('🎮 Client mode: Starting in Archipelago');
    }

    // Override with URL parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('scene')) {
        const requestedScene = urlParams.get('scene');
        // Check if user has permission
        if (window.AUTH_MANAGER.canAccessScene(requestedScene)) {
            initialScene = requestedScene;
            console.log(`🎯 URL override: Starting in ${requestedScene}`);
        } else {
            console.warn(`⚠️ Access denied to scene: ${requestedScene}`);
        }
    }

    // Start scene manager with initial scene
    await window.SCENE_MANAGER.start(initialScene);

    setSceneManager(window.SCENE_MANAGER);

    // Initialize Persistent UI (optional - uncomment to enable)
    // This UI will stay visible across all scene switches
    if (config.get('global.debug') || userRole === 'admin') {
        console.log('🎨 Initializing Persistent UI & Tools...');

        // Add FPS counter
        createPersistentFPSCounter();

        // Add notification system
        const notifications = createPersistentNotifications();
        const welcomeMsg = userRole === 'admin'
            ? '🔧 Admin mode activated! Full access granted.'
            : '🎮 Welcome to GRUDGE WARLORDS!';
        notifications.show(welcomeMsg, 'success', 3000);

        // Add enhanced performance monitor (always for admin)
        const perfMonitor = createEnhancedPerformanceMonitor();
        enablePerformanceMonitorShortcut(perfMonitor);
        if (userRole === 'admin') {
            perfMonitor.show(); // Show by default for admin
        }

        // Add scene navigator for quick scene switching (DEV TOOL)
        const sceneNavigator = createSceneNavigator(
            window.SCENE_MANAGER,
            window.SCENE_MANAGER.sceneCreators
        );
        enableSceneNavigatorShortcuts(sceneNavigator, window.SCENE_MANAGER.sceneCreators);

        // Set the initial active scene
        sceneNavigator.setActiveScene(initialScene);

        // Store globally for easy access
        window.NOTIFICATIONS = notifications;
        window.PERF_MONITOR = perfMonitor;
        window.SCENE_NAVIGATOR = sceneNavigator;

        console.log('✅ Performance Monitor enabled - Press "P" to toggle');
        console.log('✅ Scene Navigator enabled - Click buttons or use Ctrl+1-9');

        if (userRole === 'admin') {
            console.log('🔧 Admin Panel: /admin/index.html');
            console.log('🎨 Editor Scene: Available in lobby');
        }
    }

    // Initialize MMO-style game menu (ESC to open, Return to Lobby button)
    const gameMenu = new GameMenu(window.SCENE_MANAGER);
    window.GAME_MENU = gameMenu;
    console.log('✅ Game Menu enabled - Press "ESC" to open menu');

    // Initialize Main Panel (Grudge-style character panel - Tab to open)
    const mainPanel = new MainPanel({
        hotkey: 'Tab',
        onOpen: () => console.log('📋 Main Panel opened'),
        onClose: () => console.log('📋 Main Panel closed'),
        onTabChange: (tabId) => console.log(`📋 Switched to tab: ${tabId}`)
    });
    window.MAIN_PANEL = mainPanel;
    console.log('✅ Main Panel enabled - Press "Tab" to open character panel');

    // Show role-specific welcome message
    if (userRole === 'admin') {
        console.log('═══════════════════════════════════════');
        console.log('🔧 ADMIN MODE ACTIVE');
        console.log('═══════════════════════════════════════');
        console.log('📋 Full scene access granted');
        console.log('🎨 Editor scene available');
        console.log('⚙️ Admin panel: /admin/index.html');
        console.log('🔍 Debug tools enabled');
        console.log('═══════════════════════════════════════');
    } else {
        console.log('═══════════════════════════════════════');
        console.log('🎮 WELCOME TO GRUDGE WARLORDS');
        console.log('═══════════════════════════════════════');
        console.log('⚔️ Your adventure begins...');
        console.log('📖 Press ESC for menu, Tab for character');
        console.log('═══════════════════════════════════════');
    }

    console.log('✅ Game initialized successfully!');
}