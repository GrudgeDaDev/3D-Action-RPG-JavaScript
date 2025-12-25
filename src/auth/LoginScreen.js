/**
 * LoginScreen.js
 * Pre-lobby login screen with Client/Admin selection
 */

import { getAuthManager } from './AuthManager.js';

export class LoginScreen {
    constructor(onLoginComplete) {
        this.authManager = getAuthManager();
        this.onLoginComplete = onLoginComplete;
        this.container = null;
    }

    /**
     * Create and show login screen
     */
    show() {
        // Check if session exists
        if (this.authManager.restoreSession()) {
            console.log('✅ Session restored, skipping login');
            this.onLoginComplete(this.authManager.getUserRole());
            return;
        }

        this.createUI();
        document.body.appendChild(this.container);
    }

    /**
     * Create login UI
     */
    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'loginScreen';
        this.container.innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <!-- Logo/Title -->
                    <div class="login-header">
                        <h1 class="game-title">⚔️ GRUDGE WARLORDS</h1>
                        <p class="game-subtitle">3D Action MMORPG</p>
                    </div>

                    <!-- Login Options -->
                    <div class="login-options">
                        <button id="loginAsClient" class="login-btn client-btn">
                            <div class="btn-icon">🎮</div>
                            <div class="btn-content">
                                <div class="btn-title">Login as Player</div>
                                <div class="btn-description">Start your adventure</div>
                            </div>
                        </button>

                        <button id="loginAsAdmin" class="login-btn admin-btn">
                            <div class="btn-icon">🔧</div>
                            <div class="btn-content">
                                <div class="btn-title">Login as Admin</div>
                                <div class="btn-description">Access all features & editor</div>
                            </div>
                        </button>
                    </div>

                    <!-- Future: Puter.js Auth -->
                    <div class="login-footer">
                        <p class="login-note">🔐 Puter.js authentication coming soon</p>
                    </div>
                </div>

                <!-- Background Animation -->
                <div class="login-background">
                    <div class="bg-gradient"></div>
                    <div class="bg-particles"></div>
                </div>
            </div>
        `;

        this.applyStyles();
        this.attachEventListeners();
    }

    /**
     * Apply CSS styles
     */
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #loginScreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .login-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .login-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
            }

            .bg-gradient {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                animation: gradientShift 10s ease infinite;
            }

            @keyframes gradientShift {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }

            .bg-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                background-image: 
                    radial-gradient(2px 2px at 20% 30%, white, transparent),
                    radial-gradient(2px 2px at 60% 70%, white, transparent),
                    radial-gradient(1px 1px at 50% 50%, white, transparent),
                    radial-gradient(1px 1px at 80% 10%, white, transparent);
                background-size: 200% 200%;
                animation: particleFloat 20s linear infinite;
                opacity: 0.3;
            }

            @keyframes particleFloat {
                0% { background-position: 0% 0%; }
                100% { background-position: 100% 100%; }
            }

            .login-box {
                background: rgba(0, 0, 0, 0.85);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 60px 50px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                max-width: 500px;
                width: 90%;
                animation: fadeInUp 0.6s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .login-header {
                text-align: center;
                margin-bottom: 40px;
            }

            .game-title {
                font-size: 42px;
                font-weight: bold;
                color: #fff;
                margin: 0 0 10px 0;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
                letter-spacing: 2px;
            }

            .game-subtitle {
                font-size: 16px;
                color: #aaa;
                margin: 0;
                letter-spacing: 3px;
                text-transform: uppercase;
            }

            .login-options {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 30px;
            }

            .login-btn {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 25px 30px;
                border: 2px solid transparent;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                color: white;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }

            .login-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .client-btn {
                border-color: #4CAF50;
            }

            .client-btn:hover {
                background: rgba(76, 175, 80, 0.2);
                border-color: #66BB6A;
                box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
            }

            .admin-btn {
                border-color: #FF9800;
            }

            .admin-btn:hover {
                background: rgba(255, 152, 0, 0.2);
                border-color: #FFB74D;
                box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
            }

            .btn-icon {
                font-size: 48px;
                line-height: 1;
            }

            .btn-content {
                flex: 1;
            }

            .btn-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .btn-description {
                font-size: 14px;
                color: #aaa;
            }

            .login-footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .login-note {
                font-size: 12px;
                color: #888;
                margin: 0;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const clientBtn = this.container.querySelector('#loginAsClient');
        const adminBtn = this.container.querySelector('#loginAsAdmin');

        clientBtn.addEventListener('click', () => this.handleClientLogin());
        adminBtn.addEventListener('click', () => this.handleAdminLogin());
    }

    /**
     * Handle client login
     */
    async handleClientLogin() {
        console.log('🎮 Client login selected');
        await this.authManager.loginAsClient();
        this.hide();
        this.onLoginComplete('client');
    }

    /**
     * Handle admin login
     */
    async handleAdminLogin() {
        console.log('🔧 Admin login selected');
        await this.authManager.loginAsAdmin();
        this.hide();
        this.onLoginComplete('admin');
    }

    /**
     * Hide login screen
     */
    hide() {
        if (this.container && this.container.parentNode) {
            this.container.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                this.container.remove();
            }, 300);
        }
    }
}

