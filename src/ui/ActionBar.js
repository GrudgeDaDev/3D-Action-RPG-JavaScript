/**
 * Action Bar UI System
 * Displays ability icons with hotkeys, cooldowns, and resource costs
 */

import { iconGenerator } from '../assets/util/ui/ability-icons/icon-generator.js';

export class ActionBar {
    constructor(options = {}) {
        this.slots = [];
        this.maxSlots = options.maxSlots || 10;
        this.container = null;
        this.player = null;
        this.updateInterval = null;
        
        // Hotkey mappings
        this.hotkeyMap = {
            '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
            '6': 5, '7': 6, '8': 7, '9': 8, '0': 9,
            'e': 'E', 'r': 'R', 'q': 'Q', 'f': 'F'
        };
        
        this.init();
    }

    /**
     * Initialize the action bar
     */
    init() {
        this.createContainer();
        this.createSlots();
        this.setupKeyboardListeners();
        this.startUpdateLoop();
    }

    /**
     * Create the action bar container
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'action-bar';
        this.container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 4px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #444;
            border-radius: 8px;
            z-index: 1000;
        `;
        document.body.appendChild(this.container);
    }

    /**
     * Create ability slots
     */
    createSlots() {
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = this.createSlot(i);
            this.slots.push(slot);
            this.container.appendChild(slot.element);
        }
    }

    /**
     * Create a single ability slot
     */
    createSlot(index) {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'ability-slot';
        slotDiv.dataset.index = index;
        slotDiv.style.cssText = `
            width: 50px;
            height: 50px;
            background: rgba(40, 40, 40, 0.9);
            border: 2px solid #666;
            border-radius: 6px;
            position: relative;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Icon container
        const iconDiv = document.createElement('div');
        iconDiv.className = 'ability-icon';
        iconDiv.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
        `;
        slotDiv.appendChild(iconDiv);

        // Hotkey label
        const hotkeyLabel = document.createElement('div');
        hotkeyLabel.className = 'hotkey-label';
        hotkeyLabel.style.cssText = `
            position: absolute;
            top: 2px;
            right: 4px;
            font-size: 10px;
            color: #fff;
            font-weight: bold;
            text-shadow: 1px 1px 2px #000;
        `;
        slotDiv.appendChild(hotkeyLabel);

        // Cooldown overlay
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay';
        cooldownOverlay.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0%;
            background: rgba(0, 0, 0, 0.7);
            transition: height 0.1s linear;
            border-radius: 4px;
        `;
        slotDiv.appendChild(cooldownOverlay);

        // Cooldown text
        const cooldownText = document.createElement('div');
        cooldownText.className = 'cooldown-text';
        cooldownText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            text-shadow: 2px 2px 4px #000;
            display: none;
        `;
        slotDiv.appendChild(cooldownText);

        // Resource cost indicator
        const costIndicator = document.createElement('div');
        costIndicator.className = 'cost-indicator';
        costIndicator.style.cssText = `
            position: absolute;
            bottom: 2px;
            left: 4px;
            font-size: 9px;
            color: #4af;
            font-weight: bold;
            text-shadow: 1px 1px 2px #000;
        `;
        slotDiv.appendChild(costIndicator);

        // Hover effect
        slotDiv.addEventListener('mouseenter', () => {
            if (slotDiv.dataset.ability) {
                slotDiv.style.borderColor = '#fff';
                slotDiv.style.transform = 'scale(1.1)';
                this.showTooltip(slotDiv);
            }
        });

        slotDiv.addEventListener('mouseleave', () => {
            slotDiv.style.borderColor = '#666';
            slotDiv.style.transform = 'scale(1)';
            this.hideTooltip();
        });

        // Click handler
        slotDiv.addEventListener('click', () => {
            if (slotDiv.dataset.ability) {
                this.useAbility(index);
            }
        });

        return {
            element: slotDiv,
            ability: null,
            iconPath: null,
            hotkey: null
        };
    }

    /**
     * Add ability to action bar
     */
    addAbility(ability, iconPath, hotkey, slotIndex = null) {
        // Find empty slot or use specified index
        const index = slotIndex !== null ? slotIndex : this.findEmptySlot();
        
        if (index === -1) {
            console.error('No empty slots available');
            return false;
        }

        const slot = this.slots[index];
        slot.ability = ability;
        slot.iconPath = iconPath;
        slot.hotkey = hotkey;

        const slotElement = slot.element;
        slotElement.dataset.ability = ability.name;
        slotElement.dataset.hotkey = hotkey;

        // Set icon
        const iconDiv = slotElement.querySelector('.ability-icon');
        if (iconPath && iconPath.startsWith('data:')) {
            // Data URL (generated icon)
            iconDiv.innerHTML = `<img src="${iconPath}" style="width: 100%; height: 100%; object-fit: contain;">`;
        } else if (iconPath) {
            // File path
            iconDiv.innerHTML = `<img src="${iconPath}" style="width: 100%; height: 100%; object-fit: contain;">`;
        } else {
            // Use emoji icon
            iconDiv.textContent = ability.icon || '?';
        }

        // Set hotkey label
        const hotkeyLabel = slotElement.querySelector('.hotkey-label');
        hotkeyLabel.textContent = hotkey;

        // Set cost indicator
        const costIndicator = slotElement.querySelector('.cost-indicator');
        const info = ability.getInfo();
        if (info.manaCost > 0) {
            costIndicator.textContent = info.manaCost;
        } else if (info.staminaCost > 0) {
            costIndicator.textContent = info.staminaCost;
            costIndicator.style.color = '#4f4';
        }

        console.log(`✅ Added ${ability.name} to slot ${index} (${hotkey})`);
        return true;
    }

    /**
     * Find first empty slot
     */
    findEmptySlot() {
        for (let i = 0; i < this.slots.length; i++) {
            if (!this.slots[i].ability) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Use ability from slot
     */
    async useAbility(index) {
        const slot = this.slots[index];
        if (!slot || !slot.ability) return;

        const ability = slot.ability;
        
        // Check if can use
        const canUse = ability.canUse ? ability.canUse() : { canUse: true };
        if (!canUse.canUse) {
            console.log(`Cannot use ${ability.name}: ${canUse.reason}`);
            this.showError(slot.element, canUse.reason);
            return;
        }

        // Execute ability
        try {
            if (ability.execute) {
                await ability.execute();
            } else if (ability.apply) {
                await ability.apply();
            }
        } catch (error) {
            console.error(`Error using ${ability.name}:`, error);
        }
    }

    /**
     * Setup keyboard listeners for hotkeys
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // Check number keys (1-0)
            if (this.hotkeyMap[key] !== undefined) {
                const slotIndex = this.hotkeyMap[key];
                if (typeof slotIndex === 'number') {
                    this.useAbility(slotIndex);
                    e.preventDefault();
                }
            }
            
            // Check letter keys
            this.slots.forEach((slot, index) => {
                if (slot.hotkey && slot.hotkey.toLowerCase() === key) {
                    this.useAbility(index);
                    e.preventDefault();
                }
            });
        });
    }

    /**
     * Update cooldown displays
     */
    updateCooldowns() {
        this.slots.forEach(slot => {
            if (!slot.ability) return;

            const info = slot.ability.getInfo();
            const slotElement = slot.element;
            const cooldownOverlay = slotElement.querySelector('.cooldown-overlay');
            const cooldownText = slotElement.querySelector('.cooldown-text');

            if (info.cooldownRemaining > 0) {
                // Show cooldown
                const percent = (info.cooldownRemaining / info.cooldown) * 100;
                cooldownOverlay.style.height = `${percent}%`;
                
                if (info.cooldownRemaining > 1) {
                    cooldownText.style.display = 'block';
                    cooldownText.textContent = Math.ceil(info.cooldownRemaining);
                } else {
                    cooldownText.style.display = 'none';
                }
                
                slotElement.style.opacity = '0.6';
            } else {
                // Ready to use
                cooldownOverlay.style.height = '0%';
                cooldownText.style.display = 'none';
                slotElement.style.opacity = '1';
            }
        });
    }

    /**
     * Start update loop
     */
    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateCooldowns();
        }, 100);
    }

    /**
     * Show tooltip
     */
    showTooltip(slotElement) {
        const index = parseInt(slotElement.dataset.index);
        const slot = this.slots[index];
        if (!slot || !slot.ability) return;

        const info = slot.ability.getInfo();
        
        // Create tooltip if doesn't exist
        let tooltip = document.getElementById('ability-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'ability-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.95);
                color: #fff;
                padding: 10px;
                border: 2px solid #666;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
                max-width: 200px;
            `;
            document.body.appendChild(tooltip);
        }

        // Build tooltip content
        let content = `<div style="font-weight: bold; color: #ffd700; margin-bottom: 5px;">${info.name}</div>`;
        content += `<div style="margin-bottom: 5px;">${info.description}</div>`;
        content += `<div style="color: #aaa; font-size: 10px;">`;
        if (info.damage) content += `Damage: ${info.damage}<br>`;
        if (info.range) content += `Range: ${info.range}m<br>`;
        if (info.cooldown) content += `Cooldown: ${info.cooldown}s<br>`;
        if (info.manaCost) content += `<span style="color: #4af;">Mana: ${info.manaCost}</span><br>`;
        if (info.staminaCost) content += `<span style="color: #4f4;">Stamina: ${info.staminaCost}</span><br>`;
        content += `</div>`;

        tooltip.innerHTML = content;

        // Position tooltip
        const rect = slotElement.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        tooltip.style.display = 'block';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('ability-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(slotElement, message) {
        // Flash red border
        slotElement.style.borderColor = '#f00';
        setTimeout(() => {
            slotElement.style.borderColor = '#666';
        }, 500);
    }

    /**
     * Set player reference
     */
    setPlayer(player) {
        this.player = player;
    }

    /**
     * Clear all slots
     */
    clear() {
        this.slots.forEach(slot => {
            slot.ability = null;
            slot.iconPath = null;
            slot.hotkey = null;
            slot.element.dataset.ability = '';
            slot.element.querySelector('.ability-icon').textContent = '';
            slot.element.querySelector('.hotkey-label').textContent = '';
            slot.element.querySelector('.cost-indicator').textContent = '';
        });
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.container) {
            this.container.remove();
        }
        this.hideTooltip();
    }
}

// Export singleton instance
export const actionBar = new ActionBar();

