/**
 * Class Selection UI
 * Shown when player reaches level 1 to choose their class
 */

import * as GUI from '@babylonjs/gui';
import { CLASSES } from '../character/CharacterProgression.js';

export class ClassSelectionUI {
    constructor(scene, characterProgression, onClassSelected) {
        this.scene = scene;
        this.progression = characterProgression;
        this.onClassSelected = onClassSelected;
        this.advancedTexture = null;
        this.mainPanel = null;
    }

    /**
     * Initialize and show the class selection UI
     */
    show() {
        // Create fullscreen UI
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('ClassSelectionUI', true, this.scene);
        
        // Create semi-transparent background
        const background = new GUI.Rectangle('background');
        background.width = '100%';
        background.height = '100%';
        background.background = 'rgba(0, 0, 0, 0.8)';
        background.thickness = 0;
        this.advancedTexture.addControl(background);

        // Create main panel
        this.mainPanel = new GUI.Rectangle('mainPanel');
        this.mainPanel.width = '80%';
        this.mainPanel.height = '80%';
        this.mainPanel.thickness = 3;
        this.mainPanel.background = '#0b1020';
        this.mainPanel.color = '#6ee7b7';
        this.mainPanel.cornerRadius = 15;
        this.advancedTexture.addControl(this.mainPanel);

        // Create content container
        const contentStack = new GUI.StackPanel('contentStack');
        contentStack.width = '95%';
        contentStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.mainPanel.addControl(contentStack);

        // Header
        const header = new GUI.TextBlock('header');
        header.text = '🎖️ CHOOSE YOUR CLASS 🎖️';
        header.height = '80px';
        header.fontSize = 36;
        header.color = '#6ee7b7';
        header.fontWeight = 'bold';
        header.paddingTop = '30px';
        contentStack.addControl(header);

        // Subtitle
        const subtitle = new GUI.TextBlock('subtitle');
        subtitle.text = 'This choice is permanent and will define your playstyle';
        subtitle.height = '40px';
        subtitle.fontSize = 18;
        subtitle.color = '#a5b4d0';
        subtitle.paddingBottom = '20px';
        contentStack.addControl(subtitle);

        // Create class cards grid
        const classGrid = new GUI.Grid('classGrid');
        classGrid.height = '600px';
        classGrid.addColumnDefinition(0.33);
        classGrid.addColumnDefinition(0.33);
        classGrid.addColumnDefinition(0.33);
        classGrid.addRowDefinition(0.5);
        classGrid.addRowDefinition(0.5);
        contentStack.addControl(classGrid);

        // Create class cards
        const classArray = Object.entries(CLASSES);
        classArray.forEach(([key, classData], index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            this.createClassCard(classGrid, key, classData, row, col);
        });
    }

    /**
     * Create a class card
     */
    createClassCard(parent, classKey, classData, row, col) {
        const card = new GUI.Rectangle(`card_${classKey}`);
        card.width = '95%';
        card.height = '95%';
        card.thickness = 2;
        card.color = classData.color;
        card.background = '#141a2b';
        card.cornerRadius = 10;
        parent.addControl(card, row, col);

        // Make card interactive
        card.isPointerBlocker = true;
        card.hoverCursor = 'pointer';

        // Hover effect
        card.onPointerEnterObservable.add(() => {
            card.background = '#1f2937';
            card.thickness = 3;
        });

        card.onPointerOutObservable.add(() => {
            card.background = '#141a2b';
            card.thickness = 2;
        });

        // Click to select
        card.onPointerClickObservable.add(() => {
            this.selectClass(classKey, classData);
        });

        // Card content
        const cardStack = new GUI.StackPanel(`stack_${classKey}`);
        cardStack.width = '90%';
        cardStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        card.addControl(cardStack);

        // Icon
        const icon = new GUI.TextBlock();
        icon.text = classData.icon;
        icon.height = '80px';
        icon.fontSize = 64;
        icon.paddingTop = '20px';
        cardStack.addControl(icon);

        // Class name
        const name = new GUI.TextBlock();
        name.text = classData.name;
        name.height = '40px';
        name.fontSize = 28;
        name.color = classData.color;
        name.fontWeight = 'bold';
        cardStack.addControl(name);

        // Description
        const desc = new GUI.TextBlock();
        desc.text = classData.description;
        desc.height = '60px';
        desc.fontSize = 14;
        desc.color = '#a5b4d0';
        desc.textWrapping = true;
        desc.paddingTop = '10px';
        desc.paddingLeft = '10px';
        desc.paddingRight = '10px';
        cardStack.addControl(desc);

        // Recommended attributes
        const recText = new GUI.TextBlock();
        recText.text = `Recommended: ${classData.recommendedAttributes.join(', ')}`;
        recText.height = '40px';
        recText.fontSize = 12;
        recText.color = '#6ee7b7';
        recText.paddingTop = '10px';
        cardStack.addControl(recText);
    }

    /**
     * Handle class selection
     */
    selectClass(classKey, classData) {
        // Show confirmation dialog
        const confirmPanel = new GUI.Rectangle('confirmPanel');
        confirmPanel.width = '500px';
        confirmPanel.height = '300px';
        confirmPanel.thickness = 3;
        confirmPanel.background = '#0b1020';
        confirmPanel.color = classData.color;
        confirmPanel.cornerRadius = 15;
        this.advancedTexture.addControl(confirmPanel);

        const confirmStack = new GUI.StackPanel('confirmStack');
        confirmStack.width = '90%';
        confirmStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        confirmPanel.addControl(confirmStack);

        // Confirmation text
        const confirmText = new GUI.TextBlock();
        confirmText.text = `Become a ${classData.name}?`;
        confirmText.height = '60px';
        confirmText.fontSize = 28;
        confirmText.color = '#e8eaf6';
        confirmText.fontWeight = 'bold';
        confirmText.paddingTop = '30px';
        confirmStack.addControl(confirmText);

        const warningText = new GUI.TextBlock();
        warningText.text = 'This choice is permanent!';
        warningText.height = '40px';
        warningText.fontSize = 16;
        warningText.color = '#ef4444';
        warningText.paddingBottom = '20px';
        confirmStack.addControl(warningText);

        // Button container
        const buttonGrid = new GUI.Grid('buttonGrid');
        buttonGrid.height = '80px';
        buttonGrid.addColumnDefinition(0.5);
        buttonGrid.addColumnDefinition(0.5);
        buttonGrid.addRowDefinition(1);
        confirmStack.addControl(buttonGrid);

        // Confirm button
        const confirmBtn = GUI.Button.CreateSimpleButton('confirmBtn', 'YES');
        confirmBtn.width = '150px';
        confirmBtn.height = '60px';
        confirmBtn.color = '#e8eaf6';
        confirmBtn.background = '#10b981';
        confirmBtn.cornerRadius = 10;
        confirmBtn.fontSize = 24;
        confirmBtn.fontWeight = 'bold';
        confirmBtn.onPointerClickObservable.add(() => {
            try {
                this.progression.selectClass(classKey);

                // Call callback
                if (this.onClassSelected) {
                    this.onClassSelected(classKey, classData);
                }

                // Close UI
                this.dispose();
            } catch (error) {
                console.error('Failed to select class:', error);
                alert(error.message);
            }
        });
        buttonGrid.addControl(confirmBtn, 0, 0);

        // Cancel button
        const cancelBtn = GUI.Button.CreateSimpleButton('cancelBtn', 'NO');
        cancelBtn.width = '150px';
        cancelBtn.height = '60px';
        cancelBtn.color = '#e8eaf6';
        cancelBtn.background = '#ef4444';
        cancelBtn.cornerRadius = 10;
        cancelBtn.fontSize = 24;
        cancelBtn.fontWeight = 'bold';
        cancelBtn.onPointerClickObservable.add(() => {
            this.advancedTexture.removeControl(confirmPanel);
        });
        buttonGrid.addControl(cancelBtn, 0, 1);
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

