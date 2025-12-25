/**
 * World of Warcraft Style UI System
 * Complete MMO UI with action bars, unit frames, target frames, and editable hotkeys
 * Frames are moveable via right-click menu
 */

export class WoWUI {
    constructor(scene) {
        this.scene = scene;
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("WoWUI", true, scene);

        // UI State
        this.player = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            stamina: 100,
            maxStamina: 100,
            level: 1,
            name: "Player"
        };

        this.target = null;
        this.hotkeys = this.loadHotkeys();
        this.actionBars = [];

        // Frame positioning state
        this.framePositions = this.loadFramePositions();
        this.movingFrame = null;
        this.contextMenu = null;

        this.createUI();
        this.setupFrameInteraction();
    }

    createUI() {
        this.createPlayerFrame();
        this.createTargetFrame();
        this.createActionBars();
        this.createCastBar();
        this.createBuffsDebuffs();
        this.createContextMenu();
    }

    /**
     * Load saved frame positions from localStorage
     */
    loadFramePositions() {
        const saved = localStorage.getItem('wowui_frame_positions');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            playerFrame: { left: "20px", top: "20px" },
            targetFrame: { left: "290px", top: "20px" }
        };
    }

    /**
     * Save frame positions to localStorage
     */
    saveFramePositions() {
        localStorage.setItem('wowui_frame_positions', JSON.stringify(this.framePositions));
    }

    /**
     * Create right-click context menu for frames
     */
    createContextMenu() {
        const menu = new BABYLON.GUI.Rectangle("contextMenu");
        menu.width = "120px";
        menu.height = "80px";
        menu.background = "rgba(20, 20, 30, 0.95)";
        menu.color = "rgba(100, 180, 255, 0.8)";
        menu.thickness = 2;
        menu.cornerRadius = 5;
        menu.isVisible = false;
        menu.zIndex = 1000;
        this.advancedTexture.addControl(menu);

        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = true;
        menu.addControl(stack);

        // Move option
        const moveBtn = BABYLON.GUI.Button.CreateSimpleButton("moveBtn", "🔓 Move");
        moveBtn.width = "110px";
        moveBtn.height = "35px";
        moveBtn.color = "white";
        moveBtn.background = "transparent";
        moveBtn.fontSize = 13;
        moveBtn.onPointerClickObservable.add(() => {
            this.enableFrameMove(this.contextMenuTarget);
            this.hideContextMenu();
        });
        stack.addControl(moveBtn);

        // Lock option
        const lockBtn = BABYLON.GUI.Button.CreateSimpleButton("lockBtn", "🔒 Lock");
        lockBtn.width = "110px";
        lockBtn.height = "35px";
        lockBtn.color = "white";
        lockBtn.background = "transparent";
        lockBtn.fontSize = 13;
        lockBtn.onPointerClickObservable.add(() => {
            this.disableFrameMove();
            this.hideContextMenu();
        });
        stack.addControl(lockBtn);

        this.contextMenu = menu;
        this.contextMenuTarget = null;
    }

    /**
     * Show context menu at position
     */
    showContextMenu(x, y, targetFrame) {
        this.contextMenu.left = `${x}px`;
        this.contextMenu.top = `${y}px`;
        this.contextMenu.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.contextMenu.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.contextMenu.isVisible = true;
        this.contextMenuTarget = targetFrame;
    }

    /**
     * Hide context menu
     */
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.isVisible = false;
            this.contextMenuTarget = null;
        }
    }

    /**
     * Enable move mode for a frame
     */
    enableFrameMove(frameName) {
        this.movingFrame = frameName;
        const frame = frameName === 'playerFrame' ? this.playerFrame.frame : this.targetFrame.frame;
        frame.color = "rgba(100, 255, 100, 0.8)"; // Green border when moveable
        frame.thickness = 3;
        console.log(`🔓 ${frameName} unlocked for moving. Left-click and drag to reposition.`);
    }

    /**
     * Disable move mode
     */
    disableFrameMove() {
        if (this.movingFrame) {
            const frame = this.movingFrame === 'playerFrame' ? this.playerFrame.frame : this.targetFrame.frame;
            frame.color = this.movingFrame === 'playerFrame' ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 0, 0, 0.5)";
            frame.thickness = 2;
            console.log(`🔒 ${this.movingFrame} locked in place.`);
            this.movingFrame = null;
            this.saveFramePositions();
        }
    }

    /**
     * Setup frame interaction (right-click menu, dragging)
     */
    setupFrameInteraction() {
        // Global right-click to hide menu
        document.addEventListener('contextmenu', (e) => {
            // Check if clicking on a frame
            const clickedOnFrame = this.isClickOnFrame(e.clientX, e.clientY);
            if (clickedOnFrame) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, clickedOnFrame);
            } else {
                this.hideContextMenu();
            }
        });

        // Left click to close menu or drag frame
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                if (this.contextMenu?.isVisible) {
                    // Check if clicking outside menu
                    const menuRect = this.getMenuBounds();
                    if (!this.isPointInRect(e.clientX, e.clientY, menuRect)) {
                        this.hideContextMenu();
                    }
                }
            }
        });

        // Mouse move for dragging
        document.addEventListener('mousemove', (e) => {
            if (this.movingFrame && e.buttons === 1) { // Left button held
                const frame = this.movingFrame === 'playerFrame' ? this.playerFrame.frame : this.targetFrame.frame;
                frame.left = `${e.clientX - 125}px`; // Center the frame on cursor
                frame.top = `${e.clientY - 40}px`;
                frame.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                frame.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

                // Update saved position
                this.framePositions[this.movingFrame] = {
                    left: frame.left,
                    top: frame.top
                };
            }
        });

        // Right click to lock when moving
        document.addEventListener('mouseup', (e) => {
            if (e.button === 2 && this.movingFrame) { // Right click while moving
                this.disableFrameMove();
            }
        });
    }

    /**
     * Check if click is on player or target frame
     */
    isClickOnFrame(x, y) {
        const playerBounds = this.getFrameBounds(this.playerFrame.frame);
        const targetBounds = this.getFrameBounds(this.targetFrame.frame);

        if (this.isPointInRect(x, y, playerBounds)) {
            return 'playerFrame';
        }
        if (this.targetFrame.frame.isVisible && this.isPointInRect(x, y, targetBounds)) {
            return 'targetFrame';
        }
        return null;
    }

    /**
     * Get frame bounds in screen coordinates
     */
    getFrameBounds(frame) {
        const canvas = this.scene.getEngine().getRenderingCanvas();
        const left = parseInt(frame.left) || 0;
        const top = parseInt(frame.top) || 0;
        const width = parseInt(frame.width) || 250;
        const height = parseInt(frame.height) || 80;

        return { x: left, y: top, width, height };
    }

    /**
     * Get context menu bounds
     */
    getMenuBounds() {
        if (!this.contextMenu) return { x: 0, y: 0, width: 0, height: 0 };
        const left = parseInt(this.contextMenu.left) || 0;
        const top = parseInt(this.contextMenu.top) || 0;
        return { x: left, y: top, width: 120, height: 80 };
    }

    /**
     * Check if point is in rectangle
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    /**
     * Create WoW-style player unit frame (top-left, moveable)
     */
    createPlayerFrame() {
        // Main container - position from saved settings
        const savedPos = this.framePositions.playerFrame;
        const frame = new BABYLON.GUI.Rectangle("playerFrame");
        frame.width = "250px";
        frame.height = "80px";
        frame.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        frame.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        frame.left = savedPos.left;
        frame.top = savedPos.top;
        frame.thickness = 2;
        frame.cornerRadius = 5;
        frame.background = "rgba(0, 0, 0, 0.7)";
        frame.color = "rgba(255, 255, 255, 0.3)";
        this.advancedTexture.addControl(frame);

        // Player name
        const nameText = new BABYLON.GUI.TextBlock("playerName");
        nameText.text = this.player.name;
        nameText.color = "white";
        nameText.fontSize = 14;
        nameText.fontWeight = "bold";
        nameText.top = "-25px";
        nameText.left = "10px";
        nameText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        frame.addControl(nameText);

        // Level
        const levelText = new BABYLON.GUI.TextBlock("playerLevel");
        levelText.text = `Lv ${this.player.level}`;
        levelText.color = "rgb(255, 209, 0)";
        levelText.fontSize = 12;
        levelText.top = "-25px";
        levelText.left = "-10px";
        levelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        frame.addControl(levelText);

        // Health bar
        const healthBg = new BABYLON.GUI.Rectangle("healthBg");
        healthBg.width = "230px";
        healthBg.height = "20px";
        healthBg.top = "0px";
        healthBg.thickness = 1;
        healthBg.background = "rgba(0, 0, 0, 0.5)";
        healthBg.color = "rgba(255, 255, 255, 0.2)";
        frame.addControl(healthBg);

        const healthBar = new BABYLON.GUI.Rectangle("healthBar");
        healthBar.width = "230px";
        healthBar.height = "20px";
        healthBar.top = "0px";
        healthBar.thickness = 0;
        healthBar.background = "rgb(0, 200, 0)";
        healthBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthBg.addControl(healthBar);

        const healthText = new BABYLON.GUI.TextBlock("healthText");
        healthText.text = `${this.player.health} / ${this.player.maxHealth}`;
        healthText.color = "white";
        healthText.fontSize = 12;
        healthText.fontWeight = "bold";
        healthText.outlineWidth = 2;
        healthText.outlineColor = "black";
        healthBg.addControl(healthText);

        // Mana bar
        const manaBg = new BABYLON.GUI.Rectangle("manaBg");
        manaBg.width = "230px";
        manaBg.height = "15px";
        manaBg.top = "22px";
        manaBg.thickness = 1;
        manaBg.background = "rgba(0, 0, 0, 0.5)";
        manaBg.color = "rgba(255, 255, 255, 0.2)";
        frame.addControl(manaBg);

        const manaBar = new BABYLON.GUI.Rectangle("manaBar");
        manaBar.width = "230px";
        manaBar.height = "15px";
        manaBar.thickness = 0;
        manaBar.background = "rgb(0, 100, 255)";
        manaBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        manaBg.addControl(manaBar);

        const manaText = new BABYLON.GUI.TextBlock("manaText");
        manaText.text = `${this.player.mana} / ${this.player.maxMana}`;
        manaText.color = "white";
        manaText.fontSize = 11;
        manaText.outlineWidth = 2;
        manaText.outlineColor = "black";
        manaBg.addControl(manaText);

        // Stamina bar (below mana)
        const staminaBg = new BABYLON.GUI.Rectangle("staminaBg");
        staminaBg.width = "230px";
        staminaBg.height = "10px";
        staminaBg.top = "39px";
        staminaBg.thickness = 1;
        staminaBg.background = "rgba(0, 0, 0, 0.5)";
        staminaBg.color = "rgba(255, 255, 255, 0.2)";
        frame.addControl(staminaBg);

        const staminaBar = new BABYLON.GUI.Rectangle("staminaBar");
        staminaBar.width = "230px";
        staminaBar.height = "10px";
        staminaBar.thickness = 0;
        staminaBar.background = "rgb(255, 200, 0)";
        staminaBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        staminaBg.addControl(staminaBar);

        // Store references
        this.playerFrame = {
            frame,
            nameText,
            levelText,
            healthBar,
            healthText,
            manaBar,
            manaText,
            staminaBar
        };
    }

    /**
     * Create WoW-style target unit frame (moveable)
     */
    createTargetFrame() {
        // Position from saved settings
        const savedPos = this.framePositions.targetFrame;
        const frame = new BABYLON.GUI.Rectangle("targetFrame");
        frame.width = "250px";
        frame.height = "80px";
        frame.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        frame.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        frame.left = savedPos.left;
        frame.top = savedPos.top;
        frame.thickness = 2;
        frame.cornerRadius = 5;
        frame.background = "rgba(0, 0, 0, 0.7)";
        frame.color = "rgba(255, 0, 0, 0.5)";
        frame.isVisible = false; // Hidden until target selected
        this.advancedTexture.addControl(frame);

        // Target name
        const nameText = new BABYLON.GUI.TextBlock("targetName");
        nameText.text = "No Target";
        nameText.color = "red";
        nameText.fontSize = 14;
        nameText.fontWeight = "bold";
        nameText.top = "-25px";
        nameText.left = "10px";
        nameText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        frame.addControl(nameText);

        // Level
        const levelText = new BABYLON.GUI.TextBlock("targetLevel");
        levelText.text = "Lv ??";
        levelText.color = "rgb(255, 209, 0)";
        levelText.fontSize = 12;
        levelText.top = "-25px";
        levelText.left = "-10px";
        levelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        frame.addControl(levelText);

        // Health bar
        const healthBg = new BABYLON.GUI.Rectangle("targetHealthBg");
        healthBg.width = "230px";
        healthBg.height = "25px";
        healthBg.top = "5px";
        healthBg.thickness = 1;
        healthBg.background = "rgba(0, 0, 0, 0.5)";
        healthBg.color = "rgba(255, 255, 255, 0.2)";
        frame.addControl(healthBg);

        const healthBar = new BABYLON.GUI.Rectangle("targetHealthBar");
        healthBar.width = "230px";
        healthBar.height = "25px";
        healthBar.thickness = 0;
        healthBar.background = "rgb(200, 0, 0)";
        healthBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthBg.addControl(healthBar);

        const healthText = new BABYLON.GUI.TextBlock("targetHealthText");
        healthText.text = "100%";
        healthText.color = "white";
        healthText.fontSize = 12;
        healthText.fontWeight = "bold";
        healthText.outlineWidth = 2;
        healthText.outlineColor = "black";
        healthBg.addControl(healthText);

        this.targetFrame = {
            frame,
            nameText,
            levelText,
            healthBar,
            healthText
        };
    }

    /**
     * Create WoW-style action bars (bottom of screen)
     */
    createActionBars() {
        const numBars = 2; // Main bar + secondary bar
        const slotsPerBar = 12;

        for (let barIndex = 0; barIndex < numBars; barIndex++) {
            const barContainer = new BABYLON.GUI.StackPanel(`actionBar${barIndex}`);
            barContainer.isVertical = false;
            barContainer.width = `${slotsPerBar * 50 + (slotsPerBar - 1) * 5}px`;
            barContainer.height = "50px";
            barContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            barContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            barContainer.top = `${-20 - (barIndex * 60)}px`;
            this.advancedTexture.addControl(barContainer);

            const slots = [];
            for (let i = 0; i < slotsPerBar; i++) {
                const slot = this.createActionSlot(barIndex, i);
                barContainer.addControl(slot.container);
                slots.push(slot);
            }

            this.actionBars.push({ container: barContainer, slots });
        }
    }

    /**
     * Create a single action bar slot
     */
    createActionSlot(barIndex, slotIndex) {
        const container = new BABYLON.GUI.Rectangle(`slot_${barIndex}_${slotIndex}`);
        container.width = "45px";
        container.height = "45px";
        container.thickness = 2;
        container.cornerRadius = 5;
        container.background = "rgba(0, 0, 0, 0.8)";
        container.color = "rgba(255, 255, 255, 0.3)";

        // Hotkey text
        const hotkeyText = new BABYLON.GUI.TextBlock();
        const hotkey = this.getHotkey(barIndex, slotIndex);
        hotkeyText.text = hotkey;
        hotkeyText.color = "white";
        hotkeyText.fontSize = 12;
        hotkeyText.top = "-15px";
        hotkeyText.left = "3px";
        hotkeyText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        hotkeyText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        container.addControl(hotkeyText);

        // Cooldown overlay
        const cooldown = new BABYLON.GUI.Rectangle("cooldown");
        cooldown.width = "45px";
        cooldown.height = "45px";
        cooldown.thickness = 0;
        cooldown.background = "rgba(0, 0, 0, 0.7)";
        cooldown.isVisible = false;
        container.addControl(cooldown);

        const cooldownText = new BABYLON.GUI.TextBlock();
        cooldownText.color = "white";
        cooldownText.fontSize = 18;
        cooldownText.fontWeight = "bold";
        cooldownText.outlineWidth = 2;
        cooldownText.outlineColor = "black";
        cooldown.addControl(cooldownText);

        return {
            container,
            hotkeyText,
            cooldown,
            cooldownText,
            ability: null
        };
    }

    /**
     * Create cast bar (bottom center, above action bars)
     */
    createCastBar() {
        const container = new BABYLON.GUI.Rectangle("castBar");
        container.width = "300px";
        container.height = "30px";
        container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        container.top = "-140px";
        container.thickness = 2;
        container.cornerRadius = 3;
        container.background = "rgba(0, 0, 0, 0.8)";
        container.color = "rgba(255, 255, 255, 0.5)";
        container.isVisible = false;
        this.advancedTexture.addControl(container);

        const castBarFill = new BABYLON.GUI.Rectangle("castBarFill");
        castBarFill.width = "0px";
        castBarFill.height = "30px";
        castBarFill.thickness = 0;
        castBarFill.background = "rgb(255, 200, 0)";
        castBarFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(castBarFill);

        const castText = new BABYLON.GUI.TextBlock();
        castText.text = "Casting...";
        castText.color = "white";
        castText.fontSize = 14;
        castText.fontWeight = "bold";
        castText.outlineWidth = 2;
        castText.outlineColor = "black";
        container.addControl(castText);

        this.castBar = {
            container,
            fill: castBarFill,
            text: castText
        };
    }

    /**
     * Create buffs/debuffs display (top-right of player frame)
     */
    createBuffsDebuffs() {
        const buffsContainer = new BABYLON.GUI.StackPanel("buffsContainer");
        buffsContainer.isVertical = false;
        buffsContainer.width = "400px";
        buffsContainer.height = "40px";
        buffsContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        buffsContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        buffsContainer.left = "20px";
        buffsContainer.top = "110px";
        this.advancedTexture.addControl(buffsContainer);

        this.buffsContainer = buffsContainer;
    }

    /**
     * Get hotkey for action slot
     */
    getHotkey(barIndex, slotIndex) {
        const key = `bar${barIndex}_slot${slotIndex}`;
        return this.hotkeys[key] || (slotIndex + 1).toString();
    }

    /**
     * Load hotkeys from localStorage
     */
    loadHotkeys() {
        const saved = localStorage.getItem('wowui_hotkeys');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default hotkeys
        const defaults = {};
        // Main bar: 1-9, 0, -, =
        for (let i = 0; i < 12; i++) {
            const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
            defaults[`bar0_slot${i}`] = keys[i];
        }
        // Secondary bar: Shift+1-9, Shift+0, Shift+-, Shift+=
        for (let i = 0; i < 12; i++) {
            const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
            defaults[`bar1_slot${i}`] = `Shift+${keys[i]}`;
        }
        return defaults;
    }

    /**
     * Save hotkeys to localStorage
     */
    saveHotkeys() {
        localStorage.setItem('wowui_hotkeys', JSON.stringify(this.hotkeys));
    }

    /**
     * Update player stats
     */
    updatePlayer(stats) {
        if (stats.health !== undefined) {
            this.player.health = stats.health;
            const percentage = this.player.health / this.player.maxHealth;
            this.playerFrame.healthBar.width = `${230 * percentage}px`;
            this.playerFrame.healthText.text = `${Math.floor(this.player.health)} / ${this.player.maxHealth}`;

            // Color based on health
            if (percentage > 0.5) {
                this.playerFrame.healthBar.background = "rgb(0, 200, 0)";
            } else if (percentage > 0.2) {
                this.playerFrame.healthBar.background = "rgb(255, 150, 0)";
            } else {
                this.playerFrame.healthBar.background = "rgb(200, 0, 0)";
            }
        }

        if (stats.mana !== undefined) {
            this.player.mana = stats.mana;
            const percentage = this.player.mana / this.player.maxMana;
            this.playerFrame.manaBar.width = `${230 * percentage}px`;
            this.playerFrame.manaText.text = `${Math.floor(this.player.mana)} / ${this.player.maxMana}`;
        }

        if (stats.stamina !== undefined) {
            this.player.stamina = stats.stamina;
            const percentage = this.player.stamina / this.player.maxStamina;
            this.playerFrame.staminaBar.width = `${230 * percentage}px`;
        }

        if (stats.maxHealth !== undefined) this.player.maxHealth = stats.maxHealth;
        if (stats.maxMana !== undefined) this.player.maxMana = stats.maxMana;
        if (stats.maxStamina !== undefined) this.player.maxStamina = stats.maxStamina;
        if (stats.level !== undefined) {
            this.player.level = stats.level;
            this.playerFrame.levelText.text = `Lv ${this.player.level}`;
        }
        if (stats.name !== undefined) {
            this.player.name = stats.name;
            this.playerFrame.nameText.text = this.player.name;
        }
    }

    /**
     * Set target
     */
    setTarget(target) {
        if (!target) {
            this.targetFrame.frame.isVisible = false;
            this.target = null;
            return;
        }

        this.target = target;
        this.targetFrame.frame.isVisible = true;
        this.targetFrame.nameText.text = target.name || "Unknown";
        this.targetFrame.levelText.text = `Lv ${target.level || '??'}`;

        if (target.health !== undefined && target.maxHealth !== undefined) {
            const percentage = target.health / target.maxHealth;
            this.targetFrame.healthBar.width = `${230 * percentage}px`;
            this.targetFrame.healthText.text = `${Math.floor(percentage * 100)}%`;
        }
    }

    /**
     * Start casting
     */
    startCast(spellName, duration) {
        this.castBar.container.isVisible = true;
        this.castBar.text.text = spellName;
        this.castBar.fill.width = "0px";

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.castBar.fill.width = `${300 * progress}px`;

            if (progress >= 1) {
                clearInterval(interval);
                this.castBar.container.isVisible = false;
            }
        }, 16);
    }

    /**
     * Show/hide UI
     */
    show() {
        this.advancedTexture.rootContainer.isVisible = true;
    }

    hide() {
        this.advancedTexture.rootContainer.isVisible = false;
    }

    /**
     * Destroy UI
     */
    destroy() {
        this.advancedTexture.dispose();
    }
}


