/**
 * Character Progression UI
 * In-game interface for character attributes and progression
 */

import * as GUI from '@babylonjs/gui';
import { ATTRIBUTE_DEFINITIONS } from '../character/AttributeSystem.js';

export class CharacterProgressionUI {
    constructor(scene, characterProgression) {
        this.scene = scene;
        this.progression = characterProgression;
        this.advancedTexture = null;
        this.mainPanel = null;
        this.isVisible = false;
        this.attributeControls = {};
    }

    /**
     * Initialize the UI
     */
    initialize() {
        // Create fullscreen UI
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('CharacterProgressionUI', true, this.scene);
        
        // Create main container
        this.mainPanel = new GUI.Rectangle('mainPanel');
        this.mainPanel.width = '90%';
        this.mainPanel.height = '90%';
        this.mainPanel.thickness = 2;
        this.mainPanel.background = '#0b1020';
        this.mainPanel.color = '#2a3150';
        this.mainPanel.cornerRadius = 10;
        this.mainPanel.isVisible = false;
        this.advancedTexture.addControl(this.mainPanel);

        // Create scroll viewer for content
        const scrollViewer = new GUI.ScrollViewer('scrollViewer');
        scrollViewer.width = '100%';
        scrollViewer.height = '100%';
        scrollViewer.thickness = 0;
        scrollViewer.barColor = '#6ee7b7';
        scrollViewer.barBackground = '#2a3150';
        this.mainPanel.addControl(scrollViewer);

        // Create content container
        const contentStack = new GUI.StackPanel('contentStack');
        contentStack.width = '95%';
        contentStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        scrollViewer.addControl(contentStack);

        // Add header
        this.createHeader(contentStack);

        // Add character info section
        this.createCharacterInfo(contentStack);

        // Add attributes section
        this.createAttributesSection(contentStack);

        // Add derived stats section
        this.createDerivedStatsSection(contentStack);

        // Add close button
        this.createCloseButton();

        return this;
    }

    /**
     * Create header
     */
    createHeader(parent) {
        const header = new GUI.TextBlock('header');
        header.text = '⚔️ CHARACTER PROGRESSION ⚔️';
        header.height = '60px';
        header.fontSize = 32;
        header.color = '#6ee7b7';
        header.fontWeight = 'bold';
        header.paddingTop = '20px';
        header.paddingBottom = '10px';
        parent.addControl(header);
    }

    /**
     * Create character info section
     */
    createCharacterInfo(parent) {
        const infoPanel = new GUI.Rectangle('infoPanel');
        infoPanel.height = '120px';
        infoPanel.thickness = 1;
        infoPanel.color = '#2a3150';
        infoPanel.background = '#141a2b';
        infoPanel.cornerRadius = 5;
        infoPanel.paddingTop = '10px';
        infoPanel.paddingBottom = '10px';
        parent.addControl(infoPanel);

        const infoStack = new GUI.StackPanel('infoStack');
        infoStack.width = '95%';
        infoStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        infoPanel.addControl(infoStack);

        // Level
        this.levelText = this.createInfoText(`Level: ${this.progression.level} / ${20}`);
        infoStack.addControl(this.levelText);

        // Class
        const className = this.progression.selectedClass || 'None (Select at Level 1)';
        this.classText = this.createInfoText(`Class: ${className}`);
        infoStack.addControl(this.classText);

        // Unspent points
        this.unspentText = this.createInfoText(`Unspent Points: ${this.progression.unspentPoints}`);
        this.unspentText.color = '#f59e0b';
        infoStack.addControl(this.unspentText);

        // Combat Power
        const buildInfo = this.progression.getBuildInfo();
        this.powerText = this.createInfoText(`Combat Power: ${buildInfo.combatPower} | Rank: ${buildInfo.rank} (${buildInfo.tier.name})`);
        this.powerText.color = buildInfo.tier.color;
        infoStack.addControl(this.powerText);
    }

    /**
     * Create info text helper
     */
    createInfoText(text) {
        const textBlock = new GUI.TextBlock();
        textBlock.text = text;
        textBlock.height = '25px';
        textBlock.fontSize = 16;
        textBlock.color = '#e8eaf6';
        textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = '20px';
        return textBlock;
    }

    /**
     * Create section header
     */
    createSectionHeader(parent, text) {
        const header = new GUI.TextBlock();
        header.text = text;
        header.height = '40px';
        header.fontSize = 24;
        header.color = '#6ee7b7';
        header.fontWeight = 'bold';
        header.paddingTop = '20px';
        header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.paddingLeft = '20px';
        parent.addControl(header);
    }

    /**
     * Create attributes section
     */
    createAttributesSection(parent) {
        this.createSectionHeader(parent, 'ATTRIBUTES');

        // Create attribute controls for each attribute
        for (const [attrName, attrDef] of Object.entries(ATTRIBUTE_DEFINITIONS)) {
            this.createAttributeControl(parent, attrName, attrDef);
        }
    }

    /**
     * Create attribute control (name, value, +/- buttons)
     */
    createAttributeControl(parent, attrName, attrDef) {
        const container = new GUI.Rectangle(`attr_${attrName}`);
        container.height = '60px';
        container.thickness = 1;
        container.color = '#2a3150';
        container.background = '#141a2b';
        container.cornerRadius = 5;
        container.paddingTop = '5px';
        container.paddingBottom = '5px';
        parent.addControl(container);

        // Create horizontal layout
        const grid = new GUI.Grid(`grid_${attrName}`);
        grid.width = '95%';
        grid.addColumnDefinition(0.4);  // Name
        grid.addColumnDefinition(0.2);  // Value
        grid.addColumnDefinition(0.2);  // - button
        grid.addColumnDefinition(0.2);  // + button
        grid.addRowDefinition(1);
        container.addControl(grid);

        // Attribute name and description
        const nameStack = new GUI.StackPanel();
        nameStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        grid.addControl(nameStack, 0, 0);

        const nameText = new GUI.TextBlock();
        nameText.text = attrName;
        nameText.height = '25px';
        nameText.fontSize = 18;
        nameText.color = '#6ee7b7';
        nameText.fontWeight = 'bold';
        nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        nameText.paddingLeft = '10px';
        nameStack.addControl(nameText);

        const descText = new GUI.TextBlock();
        descText.text = attrDef.description;
        descText.height = '20px';
        descText.fontSize = 12;
        descText.color = '#a5b4d0';
        descText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        descText.paddingLeft = '10px';
        nameStack.addControl(descText);

        // Value display
        const valueText = new GUI.TextBlock();
        valueText.text = this.progression.attributePoints[attrName].toString();
        valueText.fontSize = 24;
        valueText.color = '#e8eaf6';
        valueText.fontWeight = 'bold';
        grid.addControl(valueText, 0, 1);

        // Minus button
        const minusBtn = GUI.Button.CreateSimpleButton(`minus_${attrName}`, '-');
        minusBtn.width = '50px';
        minusBtn.height = '40px';
        minusBtn.color = '#e8eaf6';
        minusBtn.background = '#ef4444';
        minusBtn.cornerRadius = 5;
        minusBtn.onPointerClickObservable.add(() => {
            if (this.progression.attributePoints[attrName] > 0) {
                this.progression.resetAttribute(attrName);
                this.progression.unspentPoints += 1;
                this.progression.attributePoints[attrName] = Math.max(0, this.progression.attributePoints[attrName] - 1);
                this.updateUI();
            }
        });
        grid.addControl(minusBtn, 0, 2);

        // Plus button
        const plusBtn = GUI.Button.CreateSimpleButton(`plus_${attrName}`, '+');
        plusBtn.width = '50px';
        plusBtn.height = '40px';
        plusBtn.color = '#e8eaf6';
        plusBtn.background = '#10b981';
        plusBtn.cornerRadius = 5;
        plusBtn.onPointerClickObservable.add(() => {
            if (this.progression.unspentPoints > 0) {
                try {
                    this.progression.allocateAttribute(attrName, 1);
                    this.updateUI();
                } catch (error) {
                    console.error('Failed to allocate attribute:', error);
                }
            }
        });
        grid.addControl(plusBtn, 0, 3);

        // Store references
        this.attributeControls[attrName] = {
            container,
            valueText,
            minusBtn,
            plusBtn
        };
    }

    /**
     * Create derived stats section
     */
    createDerivedStatsSection(parent) {
        this.createSectionHeader(parent, 'DERIVED STATS');

        const statsPanel = new GUI.Rectangle('statsPanel');
        statsPanel.height = '400px';
        statsPanel.thickness = 1;
        statsPanel.color = '#2a3150';
        statsPanel.background = '#141a2b';
        statsPanel.cornerRadius = 5;
        statsPanel.paddingTop = '10px';
        statsPanel.paddingBottom = '10px';
        parent.addControl(statsPanel);

        const statsScroll = new GUI.ScrollViewer('statsScroll');
        statsScroll.width = '100%';
        statsScroll.height = '100%';
        statsScroll.thickness = 0;
        statsPanel.addControl(statsScroll);

        this.statsStack = new GUI.StackPanel('statsStack');
        this.statsStack.width = '95%';
        this.statsStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        statsScroll.addControl(this.statsStack);

        this.updateDerivedStats();
    }

    /**
     * Update derived stats display
     */
    updateDerivedStats() {
        if (!this.statsStack) return;

        // Clear existing stats
        this.statsStack.clearControls();

        const stats = this.progression.getStats();
        const importantStats = [
            { key: 'health', label: 'Health', icon: '❤️' },
            { key: 'mana', label: 'Mana', icon: '💙' },
            { key: 'stamina', label: 'Stamina', icon: '⚡' },
            { key: 'damage', label: 'Damage', icon: '⚔️' },
            { key: 'defense', label: 'Defense', icon: '🛡️' },
            { key: 'criticalChance', label: 'Crit Chance', icon: '💥', suffix: '%' },
            { key: 'attackSpeed', label: 'Attack Speed', icon: '⚡', suffix: '%' },
            { key: 'movementSpeed', label: 'Move Speed', icon: '👟', suffix: '%' }
        ];

        for (const stat of importantStats) {
            const value = stats[stat.key] || 0;
            const displayValue = stat.suffix ? `${value.toFixed(1)}${stat.suffix}` : Math.floor(value);

            const statText = this.createInfoText(`${stat.icon} ${stat.label}: ${displayValue}`);
            this.statsStack.addControl(statText);
        }
    }

    /**
     * Create close button
     */
    createCloseButton() {
        const closeBtn = GUI.Button.CreateSimpleButton('closeBtn', 'X');
        closeBtn.width = '50px';
        closeBtn.height = '50px';
        closeBtn.color = '#e8eaf6';
        closeBtn.background = '#ef4444';
        closeBtn.cornerRadius = 25;
        closeBtn.thickness = 2;
        closeBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        closeBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        closeBtn.top = '20px';
        closeBtn.left = '-20px';
        closeBtn.fontSize = 24;
        closeBtn.fontWeight = 'bold';

        closeBtn.onPointerClickObservable.add(() => {
            this.hide();
        });

        this.mainPanel.addControl(closeBtn);
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        // Update character info
        this.levelText.text = `Level: ${this.progression.level} / 20`;

        const className = this.progression.selectedClass || 'None (Select at Level 1)';
        this.classText.text = `Class: ${className}`;

        this.unspentText.text = `Unspent Points: ${this.progression.unspentPoints}`;

        const buildInfo = this.progression.getBuildInfo();
        this.powerText.text = `Combat Power: ${buildInfo.combatPower} | Rank: ${buildInfo.rank} (${buildInfo.tier.name})`;
        this.powerText.color = buildInfo.tier.color;

        // Update attribute values
        for (const [attrName, controls] of Object.entries(this.attributeControls)) {
            controls.valueText.text = this.progression.attributePoints[attrName].toString();
        }

        // Update derived stats
        this.updateDerivedStats();
    }

    /**
     * Show the UI
     */
    show() {
        if (this.mainPanel) {
            this.mainPanel.isVisible = true;
            this.isVisible = true;
            this.updateUI();
        }
    }

    /**
     * Hide the UI
     */
    hide() {
        if (this.mainPanel) {
            this.mainPanel.isVisible = false;
            this.isVisible = false;
        }
    }

    /**
     * Toggle visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Dispose of the UI
     */
    dispose() {
        if (this.advancedTexture) {
            this.advancedTexture.dispose();
            this.advancedTexture = null;
        }
    }
}

