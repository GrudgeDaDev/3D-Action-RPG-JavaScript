/**
 * SettingsUI - In-game settings menu
 * Syncs with SettingsManager and admin panel
 */

import { SettingsManager } from '../config/SettingsManager.js';

export class SettingsUI {
    constructor() {
        this.settingsManager = SettingsManager.getInstance();
        this.isOpen = false;
        this.container = null;
        this.characterSkinSwapperUI = null;
    }

    /**
     * Initialize the settings UI
     */
    async initialize() {
        await this.settingsManager.initialize();
        this.createUI();
        this.setupHotkeys();
        console.log('✅ Settings UI initialized');
    }

    /**
     * Create the settings UI HTML
     */
    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'settings-ui';
        this.container.style.display = 'none';
        this.container.innerHTML = `
            <style>
                #settings-ui {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .settings-panel {
                    background: linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(30, 30, 50, 0.98));
                    border: 2px solid rgba(245, 202, 86, 0.5);
                    border-radius: 12px;
                    padding: 30px;
                    width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                
                .settings-header {
                    font-size: 28px;
                    font-weight: bold;
                    color: rgb(245, 202, 86);
                    margin-bottom: 20px;
                    text-align: center;
                    border-bottom: 2px solid rgba(245, 202, 86, 0.3);
                    padding-bottom: 10px;
                }
                
                .settings-section {
                    margin: 20px 0;
                }
                
                .settings-section-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: rgb(245, 202, 86);
                    margin-bottom: 10px;
                }
                
                .settings-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin: 8px 0;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                }
                
                .settings-label {
                    color: white;
                    font-size: 14px;
                }
                
                .settings-control {
                    min-width: 200px;
                }
                
                .settings-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.2);
                    outline: none;
                }
                
                .settings-slider::-webkit-slider-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: rgb(245, 202, 86);
                    cursor: pointer;
                }
                
                .settings-select {
                    width: 100%;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(245, 202, 86, 0.3);
                    border-radius: 4px;
                    color: white;
                    font-size: 14px;
                }
                
                .settings-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }
                
                .settings-buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    gap: 10px;
                }
                
                .settings-btn {
                    flex: 1;
                    padding: 12px 20px;
                    background: rgba(245, 202, 86, 0.2);
                    border: 1px solid rgba(245, 202, 86, 0.5);
                    border-radius: 6px;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .settings-btn:hover {
                    background: rgba(245, 202, 86, 0.4);
                }
                
                .settings-btn.primary {
                    background: rgba(245, 202, 86, 0.6);
                }
            </style>

            <div class="settings-panel">
                <div class="settings-header">⚙️ Settings</div>

                <!-- Audio Settings -->
                <div class="settings-section">
                    <div class="settings-section-title">🔊 Audio</div>
                    <div class="settings-item">
                        <span class="settings-label">Master Volume</span>
                        <div class="settings-control">
                            <input type="range" class="settings-slider" id="masterVolume" min="0" max="1" step="0.01" value="${this.settingsManager.get('audio.masterVolume') || 1}">
                        </div>
                    </div>
                    <div class="settings-item">
                        <span class="settings-label">Music Volume</span>
                        <div class="settings-control">
                            <input type="range" class="settings-slider" id="musicVolume" min="0" max="1" step="0.01" value="${this.settingsManager.get('audio.musicVolume') || 0.5}">
                        </div>
                    </div>
                    <div class="settings-item">
                        <span class="settings-label">SFX Volume</span>
                        <div class="settings-control">
                            <input type="range" class="settings-slider" id="sfxVolume" min="0" max="1" step="0.01" value="${this.settingsManager.get('audio.sfxVolume') || 0.7}">
                        </div>
                    </div>
                    <div class="settings-item">
                        <span class="settings-label">Mute All</span>
                        <div class="settings-control">
                            <input type="checkbox" class="settings-checkbox" id="muted" ${this.settingsManager.get('audio.muted') ? 'checked' : ''}>
                        </div>
                    </div>
                </div>

                <!-- Video Settings -->
                <div class="settings-section">
                    <div class="settings-section-title">🎨 Video</div>
                    <div class="settings-item">
                        <span class="settings-label">Quality Preset</span>
                        <div class="settings-control">
                            <select class="settings-select" id="quality">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high" selected>High</option>
                                <option value="ultra">Ultra</option>
                            </select>
                        </div>
                    </div>
                    <div class="settings-item">
                        <span class="settings-label">Shadows</span>
                        <div class="settings-control">
                            <input type="checkbox" class="settings-checkbox" id="shadows" ${this.settingsManager.get('video.shadows') ? 'checked' : ''}>
                        </div>
                    </div>
                    <div class="settings-item">
                        <span class="settings-label">Bloom</span>
                        <div class="settings-control">
                            <input type="checkbox" class="settings-checkbox" id="bloom" ${this.settingsManager.get('video.bloom') ? 'checked' : ''}>
                        </div>
                    </div>
                </div>

                <!-- Controls Settings -->
                <div class="settings-section">
                    <div class="settings-section-title">🎮 Controls</div>
                    <div class="settings-item">
                        <span class="settings-label">Mouse Sensitivity</span>
                        <div class="settings-control">
                            <input type="range" class="settings-slider" id="mouseSensitivity" min="0.1" max="2" step="0.1" value="${this.settingsManager.get('controls.mouseSensitivity') || 1}">
                        </div>
                    </div>
                    <div class="settings-item">
                        <span class="settings-label">Invert Y Axis</span>
                        <div class="settings-control">
                            <input type="checkbox" class="settings-checkbox" id="invertY" ${this.settingsManager.get('controls.invertY') ? 'checked' : ''}>
                        </div>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="settings-buttons">
                    <button class="settings-btn" onclick="window.SETTINGS_UI.openCharacterSkinSwapper()">🎨 Character Skins</button>
                    <button class="settings-btn" onclick="window.SETTINGS_UI.resetToDefaults()">🔄 Reset</button>
                    <button class="settings-btn" onclick="window.SETTINGS_UI.openAdminPanel()">⚙️ Admin Panel</button>
                    <button class="settings-btn primary" onclick="window.SETTINGS_UI.close()">✅ Apply & Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);
        this.attachEventListeners();
    }

    /**
     * Attach event listeners to controls
     */
    attachEventListeners() {
        // Audio
        document.getElementById('masterVolume')?.addEventListener('input', (e) => {
            this.settingsManager.set('audio.masterVolume', parseFloat(e.target.value));
        });
        document.getElementById('musicVolume')?.addEventListener('input', (e) => {
            this.settingsManager.set('audio.musicVolume', parseFloat(e.target.value));
        });
        document.getElementById('sfxVolume')?.addEventListener('input', (e) => {
            this.settingsManager.set('audio.sfxVolume', parseFloat(e.target.value));
        });
        document.getElementById('muted')?.addEventListener('change', (e) => {
            this.settingsManager.set('audio.muted', e.target.checked);
        });

        // Video
        document.getElementById('quality')?.addEventListener('change', (e) => {
            this.settingsManager.set('video.quality', e.target.value);
        });
        document.getElementById('shadows')?.addEventListener('change', (e) => {
            this.settingsManager.set('video.shadows', e.target.checked);
        });
        document.getElementById('bloom')?.addEventListener('change', (e) => {
            this.settingsManager.set('video.bloom', e.target.checked);
        });

        // Controls
        document.getElementById('mouseSensitivity')?.addEventListener('input', (e) => {
            this.settingsManager.set('controls.mouseSensitivity', parseFloat(e.target.value));
        });
        document.getElementById('invertY')?.addEventListener('change', (e) => {
            this.settingsManager.set('controls.invertY', e.target.checked);
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupHotkeys() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            } else if (e.key === 'Escape' && !this.isOpen) {
                this.open();
            }
        });
    }

    /**
     * Open settings menu
     */
    open() {
        this.isOpen = true;
        this.container.style.display = 'flex';
        console.log('⚙️ Settings menu opened');
    }

    /**
     * Close settings menu
     */
    close() {
        this.isOpen = false;
        this.container.style.display = 'none';
        console.log('⚙️ Settings menu closed');
    }

    /**
     * Toggle settings menu
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Reset to default settings
     */
    resetToDefaults() {
        if (confirm('Reset all settings to defaults?')) {
            this.settingsManager.resetToDefaults();
            location.reload();
        }
    }

    /**
     * Open admin panel
     */
    openAdminPanel() {
        window.open('/admin/index.html', '_blank');
    }

    /**
     * Set character skin swapper UI reference
     */
    setCharacterSkinSwapperUI(skinSwapperUI) {
        this.characterSkinSwapperUI = skinSwapperUI;
    }

    /**
     * Open character skin swapper
     */
    openCharacterSkinSwapper() {
        if (this.characterSkinSwapperUI) {
            this.characterSkinSwapperUI.show();
        } else {
            console.warn('⚠️ Character skin swapper not initialized');
            alert('Character skin swapper is not available. Please ensure it is initialized in your scene.');
        }
    }
}

