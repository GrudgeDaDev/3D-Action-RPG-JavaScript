/**
 * MountSkillBarUI.js
 * UI for displaying mount-specific skills and abilities
 */

export class MountSkillBarUI {
    constructor(scene, mountSystem) {
        this.scene = scene;
        this.mountSystem = mountSystem;
        
        // UI elements
        this.advancedTexture = null;
        this.skillButtons = [];
        this.mountNameText = null;
        this.container = null;
        
        // State
        this.isVisible = false;
        
        this.initialize();
        
        // Listen to mount changes
        this.mountSystem.onMountChange = (mountType, isMounted) => {
            if (isMounted) {
                this.show(mountType);
            } else {
                this.hide();
            }
        };
        
        // Listen to skill usage for cooldown display
        this.mountSystem.onSkillUse = (skill, index) => {
            this.startCooldown(index, skill.cooldown);
        };
        
        console.log('🎮 Mount Skill Bar UI initialized');
    }

    /**
     * Initialize UI
     */
    initialize() {
        // Create advanced texture
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('MountSkillBarUI');
        
        // Create container
        this.container = new BABYLON.GUI.Rectangle('mountSkillContainer');
        this.container.width = '600px';
        this.container.height = '100px';
        this.container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.container.top = '-20px';
        this.container.thickness = 0;
        this.container.isVisible = false;
        this.advancedTexture.addControl(this.container);
        
        // Mount name display
        this.mountNameText = new BABYLON.GUI.TextBlock('mountName');
        this.mountNameText.text = '';
        this.mountNameText.color = 'white';
        this.mountNameText.fontSize = 20;
        this.mountNameText.fontWeight = 'bold';
        this.mountNameText.height = '30px';
        this.mountNameText.top = '-80px';
        this.mountNameText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.addControl(this.mountNameText);
        
        // Create skill slots
        this.createSkillSlots();
    }

    /**
     * Create skill button slots
     */
    createSkillSlots() {
        const slotCount = 6;
        const slotSize = 70;
        const spacing = 10;
        const totalWidth = (slotSize + spacing) * slotCount - spacing;
        const startX = -totalWidth / 2;
        
        for (let i = 0; i < slotCount; i++) {
            const slot = this.createSkillSlot(i, startX + (slotSize + spacing) * i, slotSize);
            this.skillButtons.push(slot);
            this.container.addControl(slot.background);
        }
    }

    /**
     * Create individual skill slot
     */
    createSkillSlot(index, x, size) {
        // Background
        const background = new BABYLON.GUI.Rectangle(`skillSlot${index}`);
        background.width = `${size}px`;
        background.height = `${size}px`;
        background.left = `${x}px`;
        background.cornerRadius = 10;
        background.thickness = 3;
        background.color = '#FFD700';
        background.background = '#00000099';
        
        // Icon text (emoji)
        const icon = new BABYLON.GUI.TextBlock(`skillIcon${index}`);
        icon.text = '';
        icon.fontSize = 32;
        icon.color = 'white';
        background.addControl(icon);
        
        // Keybind text
        const keybind = new BABYLON.GUI.TextBlock(`skillKey${index}`);
        keybind.text = `${index + 1}`;
        keybind.fontSize = 14;
        keybind.color = 'white';
        keybind.top = '-25px';
        keybind.left = '-25px';
        keybind.width = '20px';
        keybind.height = '20px';
        keybind.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        keybind.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        background.addControl(keybind);
        
        // Cooldown overlay
        const cooldown = new BABYLON.GUI.Rectangle(`skillCooldown${index}`);
        cooldown.width = 1;
        cooldown.height = 1;
        cooldown.background = '#00000099';
        cooldown.isVisible = false;
        background.addControl(cooldown);
        
        // Cooldown text
        const cooldownText = new BABYLON.GUI.TextBlock(`skillCooldownText${index}`);
        cooldownText.text = '';
        cooldownText.fontSize = 24;
        cooldownText.color = 'white';
        cooldownText.fontWeight = 'bold';
        cooldown.addControl(cooldownText);
        
        // Tooltip
        const tooltip = new BABYLON.GUI.TextBlock(`skillTooltip${index}`);
        tooltip.text = '';
        tooltip.fontSize = 14;
        tooltip.color = 'white';
        tooltip.top = `${size + 10}px`;
        tooltip.isVisible = false;
        background.addControl(tooltip);
        
        return {
            background,
            icon,
            keybind,
            cooldown,
            cooldownText,
            tooltip
        };
    }

    /**
     * Show mount skill bar
     */
    show(mountType) {
        this.isVisible = true;
        this.container.isVisible = true;

        // Update mount name
        const mountNames = {
            horse: '🐴 Horse',
            boat: '⛵ Boat',
            flying: '🦅 Flying Mount',
            turret: '💣 Turret'
        };
        this.mountNameText.text = mountNames[mountType] || 'Mount';

        // Load skills for this mount
        this.updateSkills();

        console.log(`📊 Showing ${mountType} skill bar`);
    }

    /**
     * Hide mount skill bar
     */
    hide() {
        this.isVisible = false;
        this.container.isVisible = false;
        console.log('📊 Hiding mount skill bar');
    }

    /**
     * Update skills display
     */
    updateSkills() {
        const skills = this.mountSystem.getMountSkills();

        for (let i = 0; i < this.skillButtons.length; i++) {
            const slot = this.skillButtons[i];

            if (i < skills.length) {
                const skill = skills[i];

                // Update icon
                slot.icon.text = skill.icon || '?';

                // Update tooltip
                slot.tooltip.text = `${skill.name}\n${skill.description}`;

                // Show slot
                slot.background.alpha = 1;

                // Add hover effect
                slot.background.onPointerEnterObservable.add(() => {
                    slot.tooltip.isVisible = true;
                    slot.background.background = '#FFFFFF33';
                });

                slot.background.onPointerOutObservable.add(() => {
                    slot.tooltip.isVisible = false;
                    slot.background.background = '#00000099';
                });

                // Add click handler
                slot.background.onPointerClickObservable.add(() => {
                    this.mountSystem.useSkill(i);
                });
            } else {
                // Hide empty slot
                slot.background.alpha = 0.3;
                slot.icon.text = '';
                slot.tooltip.text = '';
            }
        }
    }

    /**
     * Start cooldown animation
     */
    startCooldown(skillIndex, cooldownSeconds) {
        if (skillIndex < 0 || skillIndex >= this.skillButtons.length) return;

        const slot = this.skillButtons[skillIndex];
        const cooldownMs = cooldownSeconds * 1000;
        const startTime = Date.now();

        slot.cooldown.isVisible = true;

        const updateCooldown = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, cooldownMs - elapsed);
            const progress = remaining / cooldownMs;

            if (remaining > 0) {
                // Update cooldown overlay
                slot.cooldown.height = progress;
                slot.cooldownText.text = (remaining / 1000).toFixed(1);

                requestAnimationFrame(updateCooldown);
            } else {
                // Cooldown complete
                slot.cooldown.isVisible = false;
                slot.cooldownText.text = '';

                // Flash effect
                this.flashSkillReady(skillIndex);
            }
        };

        updateCooldown();
    }

    /**
     * Flash skill when ready
     */
    flashSkillReady(skillIndex) {
        const slot = this.skillButtons[skillIndex];
        const originalColor = slot.background.color;

        slot.background.color = '#00FF00';

        setTimeout(() => {
            slot.background.color = originalColor;
        }, 300);
    }

    /**
     * Update UI (called each frame)
     */
    update() {
        if (!this.isVisible) return;

        // Update any animations or dynamic elements
    }

    /**
     * Dispose UI
     */
    dispose() {
        if (this.advancedTexture) {
            this.advancedTexture.dispose();
        }
        console.log('🗑️ Mount Skill Bar UI disposed');
    }
}

