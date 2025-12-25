/**
 * HTML-based Lobby UI
 * Uses DOM elements instead of Babylon GUI for better reliability
 */

import { ConfigManager } from '../config/ConfigManager.js';

export function createHTMLLobbyUI(sceneManager) {
    console.log('🎮 Creating HTML Lobby UI...');
    
    const config = ConfigManager.getInstance();
    const scenesConfig = config.get('scenes.scenes');
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'lobbyOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(30, 10, 50, 0.95));
        background-image:
            radial-gradient(circle at 20% 50%, rgba(245, 202, 86, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(120, 80, 200, 0.1) 0%, transparent 50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-family: 'Arial', sans-serif;
        backdrop-filter: blur(10px);
    `;
    
    // Title
    const title = document.createElement('h1');
    title.textContent = '⚔️ GRUDGE STRAT ⚔️';
    title.style.cssText = `
        color: rgb(245, 202, 86);
        font-size: 72px;
        font-weight: bold;
        margin: 0 0 20px 0;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    `;
    overlay.appendChild(title);
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Select Your Destination';
    subtitle.style.cssText = `
        color: rgba(245, 202, 86, 0.8);
        font-size: 24px;
        margin: 0 0 40px 0;
    `;
    overlay.appendChild(subtitle);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 600px;
        width: 90%;
    `;
    
    // Scene emoji mapping
    const sceneEmojis = {
        'inn': '🏨',
        'outdoor': '🌲',
        'night': '🌙',
        'day': '☀️',
        'room': '🏠',
        'underground': '⛏️',
        'town': '🏘️',
        'builder': '🔨',
        'archipelago': '🏝️',
        'archipelagoEditor': '🎨'
    };
    
    // Create buttons for each scene
    Object.entries(scenesConfig).forEach(([sceneKey, sceneData]) => {
        if (sceneData.enabled && sceneData.showInLobby) {
            const button = createSceneButton(
                `${sceneEmojis[sceneKey] || '🎮'} ${sceneData.name}`,
                sceneData.description,
                () => {
                    console.log(`🎮 Traveling to ${sceneKey}...`);
                    overlay.remove();
                    sceneManager.switchScene(sceneKey);
                }
            );
            buttonsContainer.appendChild(button);
        }
    });
    
    overlay.appendChild(buttonsContainer);

    // Bottom buttons (Settings & Admin)
    const bottomButtons = document.createElement('div');
    bottomButtons.style.cssText = `
        display: flex;
        gap: 15px;
        margin-top: 30px;
    `;

    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = '⚙️ Settings';
    settingsBtn.style.cssText = `
        padding: 12px 30px;
        background: rgba(245, 202, 86, 0.2);
        border: 2px solid rgba(245, 202, 86, 0.5);
        border-radius: 8px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
    `;
    settingsBtn.onmouseover = () => {
        settingsBtn.style.background = 'rgba(245, 202, 86, 0.4)';
        settingsBtn.style.transform = 'scale(1.05)';
    };
    settingsBtn.onmouseout = () => {
        settingsBtn.style.background = 'rgba(245, 202, 86, 0.2)';
        settingsBtn.style.transform = 'scale(1)';
    };
    settingsBtn.onclick = () => {
        if (window.SETTINGS_UI) {
            window.SETTINGS_UI.open();
        } else {
            alert('Settings UI not initialized yet');
        }
    };
    bottomButtons.appendChild(settingsBtn);

    // Admin Panel button
    const adminBtn = document.createElement('button');
    adminBtn.textContent = '🔧 Admin Panel';
    adminBtn.style.cssText = `
        padding: 12px 30px;
        background: rgba(120, 80, 200, 0.2);
        border: 2px solid rgba(120, 80, 200, 0.5);
        border-radius: 8px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
    `;
    adminBtn.onmouseover = () => {
        adminBtn.style.background = 'rgba(120, 80, 200, 0.4)';
        adminBtn.style.transform = 'scale(1.05)';
    };
    adminBtn.onmouseout = () => {
        adminBtn.style.background = 'rgba(120, 80, 200, 0.2)';
        adminBtn.style.transform = 'scale(1)';
    };
    adminBtn.onclick = () => {
        window.open('/admin/index.html', '_blank');
    };
    bottomButtons.appendChild(adminBtn);

    overlay.appendChild(bottomButtons);

    // Footer
    const footer = document.createElement('p');
    footer.textContent = 'Press ESC anytime to return to this menu';
    footer.style.cssText = `
        color: rgba(255, 255, 255, 0.5);
        font-size: 16px;
        margin: 20px 0 0 0;
    `;
    overlay.appendChild(footer);
    
    // Add to document
    document.body.appendChild(overlay);
    
    // ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape' && !overlay.parentElement) {
            document.body.appendChild(overlay);
        } else if (e.key === 'Escape' && overlay.parentElement) {
            overlay.remove();
        }
    };
    window.addEventListener('keydown', escHandler);
    
    console.log('✅ HTML Lobby UI Created');
    
    return {
        show: () => document.body.appendChild(overlay),
        hide: () => overlay.remove(),
        destroy: () => {
            overlay.remove();
            window.removeEventListener('keydown', escHandler);
        }
    };
}

function createSceneButton(name, description, onClick) {
    const button = document.createElement('div');
    button.style.cssText = `
        background: rgba(20, 20, 30, 0.8);
        border: 3px solid rgba(245, 202, 86, 0.4);
        border-radius: 12px;
        padding: 20px 30px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    const nameEl = document.createElement('div');
    nameEl.textContent = name;
    nameEl.style.cssText = `
        color: rgb(245, 202, 86);
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
    `;
    
    const descEl = document.createElement('div');
    descEl.textContent = description;
    descEl.style.cssText = `
        color: rgba(255, 255, 255, 0.6);
        font-size: 16px;
    `;
    
    button.appendChild(nameEl);
    button.appendChild(descEl);
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.borderColor = 'rgb(245, 202, 86)';
        button.style.background = 'rgba(245, 202, 86, 0.15)';
        button.style.borderWidth = '4px';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.borderColor = 'rgba(245, 202, 86, 0.4)';
        button.style.background = 'rgba(20, 20, 30, 0.8)';
        button.style.borderWidth = '3px';
    });
    
    button.addEventListener('click', onClick);
    
    return button;
}

