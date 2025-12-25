/**
 * Scene Navigator - Development tool for quick scene switching
 * Creates a navigation bar at the top of the screen with buttons for each scene
 */

/**
 * Create a scene navigation UI for development
 * @param {SceneManager} sceneManager - The scene manager instance
 * @param {Object} scenes - Object with scene names as keys
 * @returns {Object} Navigator API
 */
export function createSceneNavigator(sceneManager, scenes) {
    const container = document.createElement('div');
    container.id = 'sceneNavigator';
    container.style.cssText = `
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 1000;
        pointer-events: auto;
        font-family: "Open Sans", "Helvetica Neue", sans-serif;
    `;

    const buttons = {};
    let currentScene = null;

    // Create button for each scene
    Object.keys(scenes).forEach(sceneName => {
        const button = document.createElement('button');
        button.className = 'sceneNavButton';
        button.textContent = formatSceneName(sceneName);
        button.dataset.scene = sceneName;
        
        button.style.cssText = `
            padding: 8px 14px;
            background: rgba(0, 0, 0, 0.6);
            color: rgb(245, 202, 86);
            border: 2px solid rgba(245, 202, 86, 0);
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.18s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(10px);
        `;

        // Hover effect
        button.addEventListener('mouseenter', () => {
            if (button.dataset.scene !== currentScene) {
                button.style.borderColor = 'rgb(245, 202, 86)';
                button.style.boxShadow = '0 0 8px rgb(245, 202, 86), inset 0 0 8px rgba(245, 202, 86, 0.12)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (button.dataset.scene !== currentScene) {
                button.style.borderColor = 'rgba(245, 202, 86, 0)';
                button.style.boxShadow = 'none';
            }
        });

        // Click handler
        button.addEventListener('click', async () => {
            await switchToScene(sceneName);
        });

        buttons[sceneName] = button;
        container.appendChild(button);
    });

    // Add to DOM
    document.body.appendChild(container);

    // Switch scene function
    async function switchToScene(sceneName) {
        if (currentScene === sceneName) return;

        console.log(`🎬 Switching to scene: ${sceneName}`);

        const targetButton = buttons[sceneName];
        const originalText = targetButton.textContent;

        // Show loading state
        targetButton.textContent = '⏳ Loading...';
        targetButton.disabled = true;
        targetButton.style.opacity = '0.7';

        // Update button states
        Object.keys(buttons).forEach(name => {
            const btn = buttons[name];
            if (name === sceneName) {
                btn.style.borderColor = 'rgb(245, 202, 86)';
                btn.style.boxShadow = '0 0 10px rgb(245, 202, 86)';
                btn.style.background = 'rgba(36, 36, 36, 0.8)';
            } else {
                btn.style.borderColor = 'rgba(245, 202, 86, 0)';
                btn.style.boxShadow = 'none';
                btn.style.background = 'rgba(0, 0, 0, 0.6)';
            }
        });

        // Switch scene in SceneManager
        try {
            await sceneManager.switchScene(sceneName);
            currentScene = sceneName;
            targetButton.textContent = '✓ ' + originalText;
            console.log(`✅ Switched to ${sceneName}`);

            // Reset button text after a moment
            setTimeout(() => {
                targetButton.textContent = originalText;
            }, 1000);
        } catch (error) {
            console.error(`❌ Failed to switch to ${sceneName}:`, error);
            targetButton.textContent = '✗ ' + originalText;
            targetButton.style.color = 'rgb(255, 100, 100)';

            // Reset after error
            setTimeout(() => {
                targetButton.textContent = originalText;
                targetButton.style.color = 'rgb(245, 202, 86)';
            }, 2000);
        } finally {
            targetButton.disabled = false;
            targetButton.style.opacity = '1';
        }
    }

    // Set initial scene
    function setActiveScene(sceneName) {
        currentScene = sceneName;
        if (buttons[sceneName]) {
            buttons[sceneName].style.borderColor = 'rgb(245, 202, 86)';
            buttons[sceneName].style.boxShadow = '0 0 10px rgb(245, 202, 86)';
            buttons[sceneName].style.background = 'rgba(36, 36, 36, 0.8)';
        }
    }

    return {
        show: () => container.style.display = 'flex',
        hide: () => container.style.display = 'none',
        setActiveScene,
        switchToScene,
        destroy: () => container.remove()
    };
}

/**
 * Format scene name for display
 * @param {string} name - Scene name
 * @returns {string} Formatted name
 */
function formatSceneName(name) {
    return name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Enable keyboard shortcuts for scene switching
 * @param {Object} navigator - Navigator instance
 * @param {Object} scenes - Scene names object
 */
export function enableSceneNavigatorShortcuts(navigator, scenes) {
    const sceneNames = Object.keys(scenes);
    
    window.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + Number keys (1-9) to switch scenes
        if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
            const index = parseInt(event.key) - 1;
            if (index < sceneNames.length) {
                event.preventDefault();
                navigator.switchToScene(sceneNames[index]);
                console.log(`⌨️ Keyboard shortcut: Switched to ${sceneNames[index]}`);
            }
        }
    });

    console.log('⌨️ Scene navigator shortcuts enabled (Ctrl/Cmd + 1-9)');
}

