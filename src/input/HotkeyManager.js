/**
 * Centralized Hotkey Manager
 * Handles all keyboard input with configurable bindings (WoW-style defaults)
 */

export class HotkeyManager {
    constructor() {
        this.bindings = this.getDefaultBindings();
        this.listeners = new Map();
        this.pressedKeys = new Set();
        this.modifiers = {
            shift: false,
            ctrl: false,
            alt: false
        };
        
        this.loadBindingsFromStorage();
        this.setupEventListeners();
        
        console.log('⌨️ HotkeyManager initialized with WoW-style bindings');
    }

    /**
     * Default WoW-style keybindings
     */
    getDefaultBindings() {
        return {
            // Movement
            moveForward: { key: 'KeyW', display: 'W', category: 'movement', description: 'Move Forward' },
            moveBackward: { key: 'KeyS', display: 'S', category: 'movement', description: 'Move Backward' },
            strafeLeft: { key: 'KeyA', display: 'A', category: 'movement', description: 'Strafe Left' },
            strafeRight: { key: 'KeyD', display: 'D', category: 'movement', description: 'Strafe Right' },
            jump: { key: 'Space', display: 'Space', category: 'movement', description: 'Jump' },
            sprint: { key: 'ShiftLeft', display: 'Shift', category: 'movement', description: 'Sprint' },
            roll: { key: 'ControlLeft', display: 'Ctrl', category: 'movement', description: 'Roll/Dodge' },
            autoRun: { key: 'NumpadDivide', display: 'Num /', category: 'movement', description: 'Auto Run' },
            
            // Targeting
            targetEnemy: { key: 'Tab', display: 'Tab', category: 'targeting', description: 'Target Enemy' },
            targetAlly: { key: 'Tab', display: 'Shift+Tab', category: 'targeting', description: 'Target Ally/Self', requiresShift: true },
            targetNearest: { key: 'KeyT', display: 'T', category: 'targeting', description: 'Target Nearest Enemy' },
            clearTarget: { key: 'Escape', display: 'Esc', category: 'targeting', description: 'Clear Target' },
            
            // Action Bars
            actionBar1: { key: 'Digit1', display: '1', category: 'combat', description: 'Action Bar Slot 1' },
            actionBar2: { key: 'Digit2', display: '2', category: 'combat', description: 'Action Bar Slot 2' },
            actionBar3: { key: 'Digit3', display: '3', category: 'combat', description: 'Action Bar Slot 3' },
            actionBar4: { key: 'Digit4', display: '4', category: 'combat', description: 'Action Bar Slot 4' },
            actionBar5: { key: 'Digit5', display: '5', category: 'combat', description: 'Action Bar Slot 5' },
            actionBar6: { key: 'Digit6', display: '6', category: 'combat', description: 'Action Bar Slot 6' },
            actionBar7: { key: 'Digit7', display: '7', category: 'combat', description: 'Action Bar Slot 7' },
            actionBar8: { key: 'Digit8', display: '8', category: 'combat', description: 'Action Bar Slot 8' },
            actionBar9: { key: 'Digit9', display: '9', category: 'combat', description: 'Action Bar Slot 9' },
            actionBar10: { key: 'Digit0', display: '0', category: 'combat', description: 'Action Bar Slot 10' },
            actionBar11: { key: 'Minus', display: '-', category: 'combat', description: 'Action Bar Slot 11' },
            actionBar12: { key: 'Equal', display: '=', category: 'combat', description: 'Action Bar Slot 12' },
            
            // UI Windows
            characterSheet: { key: 'KeyC', display: 'C', category: 'ui', description: 'Character Sheet' },
            inventory: { key: 'KeyB', display: 'B', category: 'ui', description: 'Inventory/Bags' },
            spellbook: { key: 'KeyP', display: 'P', category: 'ui', description: 'Spellbook/Abilities' },
            talents: { key: 'KeyN', display: 'N', category: 'ui', description: 'Talents' },
            questLog: { key: 'KeyL', display: 'L', category: 'ui', description: 'Quest Log' },
            map: { key: 'KeyM', display: 'M', category: 'ui', description: 'Map' },
            social: { key: 'KeyO', display: 'O', category: 'ui', description: 'Social/Guild' },
            
            // Interaction
            interact: { key: 'KeyE', display: 'E', category: 'interaction', description: 'Interact' },
            loot: { key: 'KeyF', display: 'F', category: 'interaction', description: 'Loot/Gather' },
            mount: { key: 'KeyX', display: 'X', category: 'interaction', description: 'Mount/Dismount' },
            
            // Camera
            zoomIn: { key: 'PageUp', display: 'PgUp', category: 'camera', description: 'Zoom In' },
            zoomOut: { key: 'PageDown', display: 'PgDn', category: 'camera', description: 'Zoom Out' },
            
            // System
            settings: { key: 'Escape', display: 'Esc', category: 'system', description: 'Settings Menu' },
            screenshot: { key: 'F12', display: 'F12', category: 'system', description: 'Screenshot' }
        };
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        // Update modifiers
        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey;
        this.modifiers.alt = event.altKey;
        
        // Prevent default for game keys
        if (this.isGameKey(event.code)) {
            event.preventDefault();
        }
        
        // Track pressed keys
        this.pressedKeys.add(event.code);
        
        // Find matching action
        const action = this.getActionForKey(event.code, this.modifiers.shift);
        if (action) {
            this.triggerAction(action, event);
        }
    }

    handleKeyUp(event) {
        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey;
        this.modifiers.alt = event.altKey;
        
        this.pressedKeys.delete(event.code);
    }

    getActionForKey(keyCode, requiresShift = false) {
        for (const [actionId, binding] of Object.entries(this.bindings)) {
            if (binding.key === keyCode) {
                // Check if shift requirement matches
                if (binding.requiresShift && !requiresShift) continue;
                if (!binding.requiresShift && requiresShift) continue;
                
                return actionId;
            }
        }
        return null;
    }

    triggerAction(actionId, event) {
        const handlers = this.listeners.get(actionId);
        if (handlers) {
            handlers.forEach(callback => callback(event));
        }
    }

    /**
     * Register a callback for a specific action
     */
    on(actionId, callback) {
        if (!this.listeners.has(actionId)) {
            this.listeners.set(actionId, []);
        }
        this.listeners.get(actionId).push(callback);
        
        // Return unsubscribe function
        return () => this.off(actionId, callback);
    }

    off(actionId, callback) {
        const handlers = this.listeners.get(actionId);
        if (handlers) {
            const index = handlers.indexOf(callback);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

