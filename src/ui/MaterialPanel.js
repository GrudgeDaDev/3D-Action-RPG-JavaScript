/**
 * Material Generation Panel - Grudge Style
 * AI-powered material creation with chat interface and template library
 * Opens with M key or from builder toolbar
 *
 * Usage:
 *   import { MaterialPanel } from './ui/MaterialPanel.js';
 *   const materialPanel = new MaterialPanel(scene);
 *   // Press M to open/close or materialPanel.open()
 */

import { NMEAgent, MATERIAL_TEMPLATES, NME_BLOCKS } from '../ai/NMEAgent.js';

export class MaterialPanel {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.isOpen = false;
        this.hotkey = options.hotkey || 'm';
        this.activeTab = 'chat';
        
        // NME Agent instance
        this.agent = new NMEAgent(scene);
        
        // Material library (saved materials)
        this.savedMaterials = this.loadSavedMaterials();
        
        // Chat history
        this.chatHistory = [];
        
        // Current selected mesh for preview
        this.previewMesh = null;
        this.targetMesh = options.targetMesh || null;
        
        // Callbacks
        this.onMaterialGenerated = options.onMaterialGenerated || (() => {});
        this.onMaterialApplied = options.onMaterialApplied || (() => {});
        
        // Panel configurations
        this.tabs = [
            { id: 'chat', name: 'AI Chat', icon: '🤖' },
            { id: 'templates', name: 'Templates', icon: '📦' },
            { id: 'library', name: 'Library', icon: '📚' },
            { id: 'editor', name: 'Node Editor', icon: '🔧' }
        ];

        this.createStyles();
        this.createPanel();
        this.createPreviewScene();
        this.setupHotkey();
        
        console.log('🎨 Material Panel initialized (Press M to open)');
    }

    loadSavedMaterials() {
        try {
            const saved = localStorage.getItem('grudge_materials');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveMaterialsToStorage() {
        try {
            localStorage.setItem('grudge_materials', JSON.stringify(this.savedMaterials));
        } catch (e) {
            console.warn('Could not save materials to localStorage');
        }
    }

    createStyles() {
        if (document.getElementById('materialPanelStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'materialPanelStyles';
        style.textContent = `
            /* Material Panel Overlay */
            .material-panel-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 6000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .material-panel-overlay.open {
                display: flex;
                opacity: 1;
            }

            /* Panel Container */
            .material-panel {
                width: 1100px;
                height: 750px;
                background: linear-gradient(180deg, 
                    rgba(20, 20, 35, 0.98) 0%, 
                    rgba(10, 10, 20, 0.98) 100%);
                border: 2px solid rgba(100, 180, 255, 0.5);
                border-radius: 16px;
                box-shadow: 
                    0 0 80px rgba(0, 0, 0, 0.9),
                    0 0 40px rgba(100, 180, 255, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.95) translateY(30px);
                transition: transform 0.3s ease;
            }
            .material-panel-overlay.open .material-panel {
                transform: scale(1) translateY(0);
            }

            /* Header */
            .material-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 18px 24px;
                background: linear-gradient(180deg, 
                    rgba(30, 30, 50, 0.95) 0%, 
                    rgba(20, 20, 40, 0.95) 100%);
                border-bottom: 2px solid rgba(100, 180, 255, 0.3);
            }
            .material-panel-title {
                font-family: 'Orbitron', 'Segoe UI', sans-serif;
                font-size: 24px;
                color: rgb(100, 180, 255);
                text-shadow: 0 0 20px rgba(100, 180, 255, 0.5);
                letter-spacing: 3px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .material-panel-title::before {
                content: '🎨';
                font-size: 28px;
            }
            .material-panel-close {
                width: 40px; height: 40px;
                background: rgba(255, 80, 80, 0.2);
                border: 1px solid rgba(255, 80, 80, 0.4);
                border-radius: 8px;
                color: rgb(255, 150, 150);
                font-size: 22px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .material-panel-close:hover {
                background: rgba(255, 80, 80, 0.4);
                color: white;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    createPanel() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'material-panel-overlay';
        this.overlay.onclick = (e) => { if (e.target === this.overlay) this.close(); };

        this.panel = document.createElement('div');
        this.panel.className = 'material-panel';

        // Header
        const header = document.createElement('div');
        header.className = 'material-panel-header';
        header.innerHTML = `
            <div class="material-panel-title">MATERIAL FORGE</div>
            <button class="material-panel-close">✕</button>
        `;
        header.querySelector('.material-panel-close').onclick = () => this.close();
        this.panel.appendChild(header);

        // Tab navigation
        this.createTabNav();

        // Main content area with sidebar
        const mainContent = document.createElement('div');
        mainContent.className = 'material-main-content';
        mainContent.style.cssText = `
            display: flex; flex: 1; overflow: hidden;
        `;

        // Left sidebar - Preview
        this.createPreviewSidebar(mainContent);

        // Right content area - Tab content
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'material-content-area';
        this.contentArea.style.cssText = `
            flex: 1; display: flex; flex-direction: column; overflow: hidden;
        `;

        // Create tab pages
        this.createTabPages();
        mainContent.appendChild(this.contentArea);

        this.panel.appendChild(mainContent);
        this.overlay.appendChild(this.panel);
        document.body.appendChild(this.overlay);

        this.addMoreStyles();
    }

    createTabNav() {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'material-panel-tabs';
        tabsContainer.style.cssText = `
            display: flex;
            background: rgba(0, 0, 0, 0.4);
            border-bottom: 1px solid rgba(100, 180, 255, 0.2);
            padding: 0 15px;
        `;

        this.tabs.forEach(tab => {
            const tabBtn = document.createElement('button');
            tabBtn.className = `material-tab ${tab.id === this.activeTab ? 'active' : ''}`;
            tabBtn.dataset.tab = tab.id;
            tabBtn.style.cssText = `
                padding: 14px 24px;
                background: ${tab.id === this.activeTab ? 'rgba(100, 180, 255, 0.15)' : 'transparent'};
                border: none;
                border-bottom: 3px solid ${tab.id === this.activeTab ? 'rgb(100, 180, 255)' : 'transparent'};
                color: ${tab.id === this.activeTab ? 'rgb(100, 180, 255)' : 'rgba(200, 200, 220, 0.6)'};
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            tabBtn.innerHTML = `<span style="font-size: 18px;">${tab.icon}</span><span>${tab.name}</span>`;
            tabBtn.onclick = () => this.switchTab(tab.id);
            tabsContainer.appendChild(tabBtn);
        });
        this.panel.appendChild(tabsContainer);
    }

    createPreviewSidebar(parent) {
        const sidebar = document.createElement('div');
        sidebar.className = 'material-preview-sidebar';
        sidebar.style.cssText = `
            width: 280px;
            background: rgba(0, 0, 0, 0.3);
            border-right: 1px solid rgba(100, 180, 255, 0.2);
            padding: 20px;
            display: flex;
            flex-direction: column;
        `;

        // Preview canvas container
        const previewContainer = document.createElement('div');
        previewContainer.style.cssText = `
            width: 240px; height: 240px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(100, 180, 255, 0.3);
            border-radius: 12px;
            margin-bottom: 15px;
            overflow: hidden;
            position: relative;
        `;

        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.id = 'materialPreviewCanvas';
        this.previewCanvas.style.cssText = 'width: 100%; height: 100%;';
        previewContainer.appendChild(this.previewCanvas);
        sidebar.appendChild(previewContainer);

        // Preview shape selector
        const shapeSelector = document.createElement('div');
        shapeSelector.style.cssText = `
            display: flex; gap: 8px; margin-bottom: 15px; justify-content: center;
        `;
        ['Sphere', 'Cube', 'Plane', 'Torus'].forEach(shape => {
            const btn = document.createElement('button');
            btn.textContent = shape;
            btn.style.cssText = `
                padding: 8px 12px;
                background: rgba(100, 180, 255, 0.1);
                border: 1px solid rgba(100, 180, 255, 0.3);
                border-radius: 6px;
                color: rgba(200, 200, 220, 0.8);
                font-size: 11px;
                cursor: pointer;
            `;
            btn.onclick = () => this.setPreviewShape(shape.toLowerCase());
            shapeSelector.appendChild(btn);
        });
        sidebar.appendChild(shapeSelector);

        // Material info
        this.materialInfo = document.createElement('div');
        this.materialInfo.style.cssText = `
            flex: 1;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            color: rgba(200, 200, 220, 0.8);
            font-size: 12px;
            overflow-y: auto;
        `;
        this.materialInfo.innerHTML = `
            <div style="color: rgb(100, 180, 255); margin-bottom: 10px; font-weight: bold;">Material Properties</div>
            <div>No material selected</div>
        `;
        sidebar.appendChild(this.materialInfo);

        // Action buttons
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex; gap: 10px; margin-top: 15px;
        `;

        const applyBtn = document.createElement('button');
        applyBtn.textContent = '✓ Apply';
        applyBtn.style.cssText = `
            flex: 1; padding: 12px;
            background: rgb(100, 180, 255);
            border: none; border-radius: 8px;
            color: black; font-weight: bold;
            cursor: pointer;
        `;
        applyBtn.onclick = () => this.applyMaterial();

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Save';
        saveBtn.style.cssText = `
            flex: 1; padding: 12px;
            background: rgba(100, 255, 150, 0.2);
            border: 1px solid rgba(100, 255, 150, 0.5);
            border-radius: 8px;
            color: rgb(100, 255, 150);
            cursor: pointer;
        `;
        saveBtn.onclick = () => this.saveMaterial();

        actions.appendChild(applyBtn);
        actions.appendChild(saveBtn);
        sidebar.appendChild(actions);

        parent.appendChild(sidebar);
    }

    createTabPages() {
        // Chat tab
        this.chatPage = this.createChatPage();
        this.contentArea.appendChild(this.chatPage);

        // Templates tab
        this.templatesPage = this.createTemplatesPage();
        this.contentArea.appendChild(this.templatesPage);

        // Library tab
        this.libraryPage = this.createLibraryPage();
        this.contentArea.appendChild(this.libraryPage);

        // Editor tab
        this.editorPage = this.createEditorPage();
        this.contentArea.appendChild(this.editorPage);
    }

    createChatPage() {
        const page = document.createElement('div');
        page.className = 'material-page active';
        page.dataset.tab = 'chat';
        page.style.cssText = `
            flex: 1; display: flex; flex-direction: column; padding: 20px;
        `;

        // Chat messages area
        this.chatMessages = document.createElement('div');
        this.chatMessages.className = 'chat-messages';
        this.chatMessages.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            margin-bottom: 15px;
        `;

        // Welcome message
        this.addChatMessage('assistant', `👋 Welcome to Material Forge! I can create materials from your descriptions.

**Try saying:**
• "Create a shiny gold metal"
• "Make glowing blue neon"
• "I need rough stone texture"
• "Generate animated water material"
• "Create a holographic sci-fi shield"

What kind of material would you like to create?`);

        page.appendChild(this.chatMessages);

        // Quick prompts
        const quickPrompts = document.createElement('div');
        quickPrompts.style.cssText = `
            display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;
        `;
        ['Gold Metal', 'Blue Neon', 'Rough Stone', 'Water', 'Lava', 'Hologram', 'Force Field'].forEach(prompt => {
            const btn = document.createElement('button');
            btn.textContent = prompt;
            btn.style.cssText = `
                padding: 8px 16px;
                background: rgba(100, 180, 255, 0.1);
                border: 1px solid rgba(100, 180, 255, 0.3);
                border-radius: 20px;
                color: rgba(200, 200, 220, 0.8);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            btn.onclick = () => this.sendChatMessage(`Create ${prompt.toLowerCase()} material`);
            quickPrompts.appendChild(btn);
        });
        page.appendChild(quickPrompts);

        // Chat input
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex; gap: 12px;
        `;

        this.chatInput = document.createElement('input');
        this.chatInput.type = 'text';
        this.chatInput.placeholder = 'Describe the material you want to create...';
        this.chatInput.style.cssText = `
            flex: 1;
            padding: 16px 20px;
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid rgba(100, 180, 255, 0.3);
            border-radius: 12px;
            color: white;
            font-size: 14px;
            outline: none;
        `;
        this.chatInput.onkeydown = (e) => {
            if (e.key === 'Enter') this.sendChatMessage(this.chatInput.value);
        };

        const sendBtn = document.createElement('button');
        sendBtn.textContent = '🚀 Generate';
        sendBtn.style.cssText = `
            padding: 16px 28px;
            background: linear-gradient(135deg, rgb(100, 180, 255), rgb(80, 140, 220));
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        sendBtn.onclick = () => this.sendChatMessage(this.chatInput.value);

        inputContainer.appendChild(this.chatInput);
        inputContainer.appendChild(sendBtn);
        page.appendChild(inputContainer);

        return page;
    }

    addChatMessage(role, content) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            margin-bottom: 15px;
            padding: 15px;
            background: ${role === 'user' ? 'rgba(100, 180, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
            border-radius: 12px;
            border-left: 3px solid ${role === 'user' ? 'rgb(100, 180, 255)' : 'rgb(100, 255, 150)'};
            color: rgba(220, 220, 240, 0.9);
            font-size: 14px;
            line-height: 1.6;
        `;
        msg.innerHTML = `
            <div style="font-size: 11px; color: ${role === 'user' ? 'rgb(100, 180, 255)' : 'rgb(100, 255, 150)'}; margin-bottom: 8px;">
                ${role === 'user' ? '👤 You' : '🤖 Material AI'}
            </div>
            <div>${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        `;
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendChatMessage(message) {
        if (!message.trim()) return;

        this.addChatMessage('user', message);
        this.chatInput.value = '';

        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-msg';
        loadingMsg.style.cssText = `
            padding: 15px; color: rgba(100, 180, 255, 0.8);
        `;
        loadingMsg.textContent = '⏳ Generating material...';
        this.chatMessages.appendChild(loadingMsg);

        try {
            const material = await this.agent.generateMaterial(message, `Generated_${Date.now()}`);
            this.currentMaterial = material;

            loadingMsg.remove();

            this.addChatMessage('assistant', `✨ **Material Created!**

I've generated a material based on your description. Here's what I created:

• **Type:** ${this.agent.parseDescription(message).type}
• **Color:** Based on your description
• **Metallic:** ${this.agent.parseDescription(message).metallic}
• **Roughness:** ${this.agent.parseDescription(message).roughness}

The preview is shown on the left. Click **Apply** to use it on your selected mesh, or **Save** to add it to your library.`);

            this.updatePreview(material);
            this.updateMaterialInfo(material, message);
            this.onMaterialGenerated(material);

        } catch (error) {
            loadingMsg.remove();
            this.addChatMessage('assistant', `❌ Error generating material: ${error.message}\n\nPlease try a different description.`);
        }
    }

    createTemplatesPage() {
        const page = document.createElement('div');
        page.className = 'material-page';
        page.dataset.tab = 'templates';
        page.style.cssText = `
            display: none; padding: 20px; overflow-y: auto;
        `;

        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        `;

        Object.entries(MATERIAL_TEMPLATES).forEach(([id, template]) => {
            const card = this.createTemplateCard(id, template);
            grid.appendChild(card);
        });

        page.appendChild(grid);
        return page;
    }

    createTemplateCard(id, template) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid rgba(100, 180, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
        `;

        const icons = {
            basic: '🎨', textured: '🖼️', pbr_metal: '🥇', pbr_rough: '🪨',
            emissive: '💡', transparent: '🔮', animated: '🌊', procedural: '🔢',
            toon: '🎭', hologram: '📡', water: '💧', lava: '🌋',
            force_field: '🛡️', dissolve: '✨'
        };

        card.innerHTML = `
            <div style="font-size: 40px; text-align: center; margin-bottom: 12px;">${icons[id] || '📦'}</div>
            <div style="color: rgb(100, 180, 255); font-weight: bold; text-align: center; margin-bottom: 8px;">
                ${id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            <div style="color: rgba(200, 200, 220, 0.6); font-size: 12px; text-align: center;">
                ${template.desc}
            </div>
            <div style="margin-top: 10px; text-align: center;">
                <span style="background: rgba(100, 180, 255, 0.2); padding: 4px 10px; border-radius: 10px; font-size: 11px; color: rgb(100, 180, 255);">
                    Complexity: ${'★'.repeat(template.complexity)}${'☆'.repeat(5 - template.complexity)}
                </span>
            </div>
        `;

        card.onclick = () => this.generateFromTemplate(id);
        card.onmouseover = () => card.style.borderColor = 'rgba(100, 180, 255, 0.6)';
        card.onmouseout = () => card.style.borderColor = 'rgba(100, 180, 255, 0.2)';

        return card;
    }

    async generateFromTemplate(templateId) {
        this.switchTab('chat');
        await this.sendChatMessage(`Create a ${templateId.replace(/_/g, ' ')} material`);
    }

    createLibraryPage() {
        const page = document.createElement('div');
        page.className = 'material-page';
        page.dataset.tab = 'library';
        page.style.cssText = `display: none; padding: 20px; overflow-y: auto;`;

        this.libraryGrid = document.createElement('div');
        this.libraryGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        `;

        this.refreshLibrary();
        page.appendChild(this.libraryGrid);
        return page;
    }

    refreshLibrary() {
        this.libraryGrid.innerHTML = '';

        if (this.savedMaterials.length === 0) {
            this.libraryGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: rgba(200, 200, 220, 0.5);">
                    <div style="font-size: 60px; margin-bottom: 20px;">📭</div>
                    <div>No saved materials yet</div>
                    <div style="font-size: 12px; margin-top: 10px;">Use the Chat tab to create materials and save them here</div>
                </div>
            `;
            return;
        }

        this.savedMaterials.forEach((mat, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(100, 180, 255, 0.2);
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                text-align: center;
            `;
            card.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 10px;">🎨</div>
                <div style="color: white; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${mat.name}
                </div>
                <div style="color: rgba(200, 200, 220, 0.5); font-size: 10px; margin-top: 5px;">
                    ${mat.type}
                </div>
            `;
            card.onclick = () => this.loadSavedMaterial(index);
            this.libraryGrid.appendChild(card);
        });
    }

    createEditorPage() {
        const page = document.createElement('div');
        page.className = 'material-page';
        page.dataset.tab = 'editor';
        page.style.cssText = `display: none; padding: 20px;`;
        page.innerHTML = `
            <div style="text-align: center; padding: 60px; color: rgba(200, 200, 220, 0.6);">
                <div style="font-size: 60px; margin-bottom: 20px;">🔧</div>
                <div style="font-size: 18px; color: rgb(100, 180, 255); margin-bottom: 15px;">Node Editor</div>
                <div>Advanced node-based material editor coming soon!</div>
                <div style="margin-top: 20px;">
                    <a href="https://nme.babylonjs.com/" target="_blank"
                       style="color: rgb(100, 180, 255); text-decoration: none;">
                        Open Babylon.js NME in new tab →
                    </a>
                </div>
            </div>
        `;
        return page;
    }

    switchTab(tabId) {
        this.activeTab = tabId;

        // Update tab buttons
        this.panel.querySelectorAll('.material-tab').forEach(tab => {
            const isActive = tab.dataset.tab === tabId;
            tab.style.background = isActive ? 'rgba(100, 180, 255, 0.15)' : 'transparent';
            tab.style.borderBottomColor = isActive ? 'rgb(100, 180, 255)' : 'transparent';
            tab.style.color = isActive ? 'rgb(100, 180, 255)' : 'rgba(200, 200, 220, 0.6)';
        });

        // Update pages
        this.contentArea.querySelectorAll('.material-page').forEach(page => {
            page.style.display = page.dataset.tab === tabId ? 'flex' : 'none';
        });

        if (tabId === 'library') this.refreshLibrary();
    }

    createPreviewScene() {
        // Initialize preview after a short delay to ensure canvas is ready
        setTimeout(() => {
            if (!this.previewCanvas) return;

            this.previewEngine = new BABYLON.Engine(this.previewCanvas, true);
            this.previewScene = new BABYLON.Scene(this.previewEngine);
            this.previewScene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

            // Camera
            const camera = new BABYLON.ArcRotateCamera('previewCam',
                Math.PI / 4, Math.PI / 3, 5, BABYLON.Vector3.Zero(), this.previewScene);
            camera.attachControl(this.previewCanvas, true);

            // Lights
            new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.previewScene);
            const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-1, -2, -1), this.previewScene);
            dir.intensity = 0.7;

            // Default preview mesh
            this.previewMesh = BABYLON.MeshBuilder.CreateSphere('preview', { diameter: 2, segments: 32 }, this.previewScene);

            // Render loop
            this.previewEngine.runRenderLoop(() => {
                this.previewScene.render();
                if (this.previewMesh) {
                    this.previewMesh.rotation.y += 0.005;
                }
            });
        }, 100);
    }

    setPreviewShape(shape) {
        if (!this.previewScene || !this.previewMesh) return;

        const material = this.previewMesh.material;
        this.previewMesh.dispose();

        switch (shape) {
            case 'cube':
                this.previewMesh = BABYLON.MeshBuilder.CreateBox('preview', { size: 2 }, this.previewScene);
                break;
            case 'plane':
                this.previewMesh = BABYLON.MeshBuilder.CreatePlane('preview', { size: 3 }, this.previewScene);
                break;
            case 'torus':
                this.previewMesh = BABYLON.MeshBuilder.CreateTorus('preview', { diameter: 2, thickness: 0.5 }, this.previewScene);
                break;
            default:
                this.previewMesh = BABYLON.MeshBuilder.CreateSphere('preview', { diameter: 2, segments: 32 }, this.previewScene);
        }

        if (material) this.previewMesh.material = material;
    }

    updatePreview(material) {
        if (this.previewMesh && material) {
            this.previewMesh.material = material;
        }
    }

    updateMaterialInfo(material, description) {
        const params = this.agent.parseDescription(description);
        this.materialInfo.innerHTML = `
            <div style="color: rgb(100, 180, 255); margin-bottom: 12px; font-weight: bold;">Material Properties</div>
            <div style="margin-bottom: 8px;"><strong>Type:</strong> ${params.type}</div>
            <div style="margin-bottom: 8px;"><strong>Metallic:</strong> ${params.metallic.toFixed(2)}</div>
            <div style="margin-bottom: 8px;"><strong>Roughness:</strong> ${params.roughness.toFixed(2)}</div>
            <div style="margin-bottom: 8px;"><strong>Animated:</strong> ${params.animated ? 'Yes' : 'No'}</div>
            <div style="margin-bottom: 8px;"><strong>Transparent:</strong> ${params.transparent ? 'Yes' : 'No'}</div>
            ${params.effects.length > 0 ? `<div><strong>Effects:</strong> ${params.effects.join(', ')}</div>` : ''}
        `;
    }

    applyMaterial() {
        if (!this.currentMaterial) {
            alert('No material to apply. Generate a material first.');
            return;
        }

        if (this.targetMesh) {
            this.targetMesh.material = this.currentMaterial;
            this.onMaterialApplied(this.currentMaterial, this.targetMesh);
            this.addChatMessage('assistant', `✅ Material applied to **${this.targetMesh.name}**`);
        } else {
            this.addChatMessage('assistant', `⚠️ No target mesh selected. Click on a mesh in the scene to select it, then click Apply.`);
        }
    }

    saveMaterial() {
        if (!this.currentMaterial) {
            alert('No material to save. Generate a material first.');
            return;
        }

        const name = prompt('Enter a name for this material:', this.currentMaterial.name);
        if (!name) return;

        const materialData = {
            name: name,
            type: this.currentMaterial.name,
            json: this.agent.exportToJSON(this.currentMaterial),
            timestamp: Date.now()
        };

        this.savedMaterials.push(materialData);
        this.saveMaterialsToStorage();
        this.addChatMessage('assistant', `💾 Material saved as **${name}**`);
    }

    loadSavedMaterial(index) {
        const matData = this.savedMaterials[index];
        if (!matData) return;

        try {
            this.currentMaterial = this.agent.importFromJSON(matData.json, matData.name);
            this.updatePreview(this.currentMaterial);
            this.switchTab('chat');
            this.addChatMessage('assistant', `📂 Loaded material **${matData.name}**`);
        } catch (error) {
            alert('Error loading material: ' + error.message);
        }
    }

    setTargetMesh(mesh) {
        this.targetMesh = mesh;
        if (mesh) {
            this.addChatMessage('assistant', `🎯 Target mesh set: **${mesh.name}**`);
        }
    }

    addMoreStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .material-page { color: rgba(220, 220, 240, 0.9); }
            .material-page.active { display: flex !important; }
            .material-page::-webkit-scrollbar { width: 8px; }
            .material-page::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
            .material-page::-webkit-scrollbar-thumb { background: rgba(100, 180, 255, 0.3); border-radius: 4px; }
            .chat-messages::-webkit-scrollbar { width: 8px; }
            .chat-messages::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
            .chat-messages::-webkit-scrollbar-thumb { background: rgba(100, 180, 255, 0.3); border-radius: 4px; }
        `;
        document.head.appendChild(style);
    }

    setupHotkey() {
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key.toLowerCase() === this.hotkey) {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    open() {
        this.isOpen = true;
        this.overlay?.classList.add('open');
        setTimeout(() => this.chatInput?.focus(), 300);
    }

    close() {
        this.isOpen = false;
        this.overlay?.classList.remove('open');
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    destroy() {
        this.previewEngine?.dispose();
        this.overlay?.remove();
        document.getElementById('materialPanelStyles')?.remove();
    }
}

// Singleton
let materialPanelInstance = null;

export function getMaterialPanel(scene, options) {
    if (!materialPanelInstance && scene) {
        materialPanelInstance = new MaterialPanel(scene, options);
    }
    return materialPanelInstance;
}

export default MaterialPanel;

