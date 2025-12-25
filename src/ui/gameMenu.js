/**
 * In-Game Menu System - MMO Style
 * Press ESC to open menu with options like "Return to Lobby"
 */

export class GameMenu {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.isOpen = false;
        this.overlay = null;
        this.menuPanel = null;
        
        this.createMenuUI();
        this.setupKeyboardControls();
    }

    createMenuUI() {
        // Dark overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Menu panel
        this.menuPanel = document.createElement('div');
        this.menuPanel.style.cssText = `
            background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 30, 45, 0.95));
            border: 3px solid rgba(245, 202, 86, 0.6);
            border-radius: 16px;
            padding: 40px 60px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 202, 86, 0.2);
            min-width: 400px;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        // Title
        const title = document.createElement('h2');
        title.textContent = 'GAME MENU';
        title.style.cssText = `
            color: rgb(245, 202, 86);
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            margin: 0 0 30px 0;
            text-shadow: 0 0 20px rgba(245, 202, 86, 0.5);
            letter-spacing: 3px;
            font-family: "Open Sans", "Helvetica Neue", sans-serif;
        `;

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
        `;

        // Create menu buttons
        const buttons = [
            { text: '🏠 Return to Lobby', action: () => this.returnToLobby() },
            { text: '⚙️ Settings', action: () => this.openSettings() },
            { text: '❓ Help', action: () => this.openHelp() },
            { text: '✖️ Resume Game', action: () => this.close() }
        ];

        buttons.forEach(btn => {
            const button = this.createMenuButton(btn.text, btn.action);
            buttonContainer.appendChild(button);
        });

        this.menuPanel.appendChild(title);
        this.menuPanel.appendChild(buttonContainer);
        this.overlay.appendChild(this.menuPanel);
        document.body.appendChild(this.overlay);
    }

    createMenuButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 16px 24px;
            background: rgba(245, 202, 86, 0.1);
            color: rgb(245, 202, 86);
            border: 2px solid rgba(245, 202, 86, 0.4);
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: "Open Sans", "Helvetica Neue", sans-serif;
            text-align: left;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(245, 202, 86, 0.2)';
            button.style.borderColor = 'rgb(245, 202, 86)';
            button.style.boxShadow = '0 0 20px rgba(245, 202, 86, 0.4)';
            button.style.transform = 'translateX(10px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(245, 202, 86, 0.1)';
            button.style.borderColor = 'rgba(245, 202, 86, 0.4)';
            button.style.boxShadow = 'none';
            button.style.transform = 'translateX(0)';
        });

        button.addEventListener('click', onClick);
        return button;
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        setTimeout(() => {
            this.overlay.style.opacity = '1';
            this.menuPanel.style.transform = 'scale(1)';
        }, 10);
        
        // Pause game if needed
        if (this.sceneManager.activeScene) {
            this.sceneManager.engine.stopRenderLoop();
        }
    }

    close() {
        this.isOpen = false;
        this.overlay.style.opacity = '0';
        this.menuPanel.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
        
        // Resume game
        if (this.sceneManager.activeScene) {
            this.sceneManager.engine.runRenderLoop(() => {
                this.sceneManager.activeScene.render();
            });
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    async returnToLobby() {
        this.close();
        console.log('🏠 Returning to lobby...');
        await this.sceneManager.switchScene('lobby');
    }

    openSettings() {
        console.log('⚙️ Settings (coming soon)');
        // TODO: Implement settings menu
    }

    openHelp() {
        console.log('❓ Help (coming soon)');
        // TODO: Implement help menu
    }

    destroy() {
        if (this.overlay) {
            this.overlay.remove();
        }
    }
}

