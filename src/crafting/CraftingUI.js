/**
 * CraftingUI.js
 * Babylon.GUI-based crafting interface for GRUDGE WARLORDS
 * Provides profession selection, recipe browsing, and crafting interface
 */

import * as GUI from '@babylonjs/gui';
import { getCraftingManager } from './CraftingManager.js';

export class CraftingUI {
    constructor(scene) {
        this.scene = scene;
        this.craftingManager = getCraftingManager();
        this.advancedTexture = null;
        this.mainPanel = null;
        this.isVisible = false;
        this.currentProfession = null;
        this.selectedRecipe = null;
        this.inventory = null; // Will be set externally
    }

    /**
     * Initialize the crafting UI
     */
    initialize() {
        // Create full-screen GUI
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('CraftingUI', true, this.scene);
        
        // Create main panel
        this.createMainPanel();
        
        // Hide by default
        this.hide();
        
        console.log('✅ Crafting UI initialized');
    }

    /**
     * Create the main crafting panel
     */
    createMainPanel() {
        // Main container
        this.mainPanel = new GUI.Rectangle('craftingMainPanel');
        this.mainPanel.width = '90%';
        this.mainPanel.height = '85%';
        this.mainPanel.thickness = 3;
        this.mainPanel.background = 'rgba(20, 20, 30, 0.95)';
        this.mainPanel.color = '#8B7355';
        this.mainPanel.cornerRadius = 10;
        this.advancedTexture.addControl(this.mainPanel);

        // Title
        const title = new GUI.TextBlock('craftingTitle', '⚒️ CRAFTING FORGE ⚒️');
        title.height = '60px';
        title.top = '-40%';
        title.fontSize = 32;
        title.color = '#FFD700';
        title.fontFamily = 'Arial';
        title.fontWeight = 'bold';
        title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.mainPanel.addControl(title);

        // Close button
        const closeBtn = GUI.Button.CreateSimpleButton('closeBtn', '✖');
        closeBtn.width = '50px';
        closeBtn.height = '50px';
        closeBtn.top = '-40%';
        closeBtn.left = '45%';
        closeBtn.color = '#FF6B6B';
        closeBtn.fontSize = 24;
        closeBtn.thickness = 2;
        closeBtn.background = 'rgba(40, 40, 50, 0.8)';
        closeBtn.onPointerClickObservable.add(() => this.hide());
        this.mainPanel.addControl(closeBtn);

        // Create layout grid
        this.createLayoutGrid();
    }

    /**
     * Create the layout grid (professions | recipes | details)
     */
    createLayoutGrid() {
        // Container for the three-column layout
        const contentContainer = new GUI.Rectangle('contentContainer');
        contentContainer.width = '95%';
        contentContainer.height = '75%';
        contentContainer.top = '5%';
        contentContainer.thickness = 0;
        this.mainPanel.addControl(contentContainer);

        // Professions panel (left)
        this.professionsPanel = this.createProfessionsPanel();
        this.professionsPanel.left = '-63%';
        contentContainer.addControl(this.professionsPanel);

        // Recipes panel (center)
        this.recipesPanel = this.createRecipesPanel();
        this.recipesPanel.left = '0%';
        contentContainer.addControl(this.recipesPanel);

        // Details panel (right)
        this.detailsPanel = this.createDetailsPanel();
        this.detailsPanel.left = '63%';
        contentContainer.addControl(this.detailsPanel);
    }

    /**
     * Create professions selection panel
     */
    createProfessionsPanel() {
        const panel = new GUI.Rectangle('professionsPanel');
        panel.width = '28%';
        panel.height = '100%';
        panel.thickness = 2;
        panel.color = '#6B5D4F';
        panel.background = 'rgba(30, 25, 20, 0.8)';
        panel.cornerRadius = 5;

        // Title
        const title = new GUI.TextBlock('profTitle', '🎯 PROFESSIONS');
        title.height = '40px';
        title.top = '-45%';
        title.fontSize = 18;
        title.color = '#FFD700';
        title.fontWeight = 'bold';
        panel.addControl(title);

        // Scroll viewer for professions
        const scrollViewer = new GUI.ScrollViewer('profScroll');
        scrollViewer.width = '95%';
        scrollViewer.height = '85%';
        scrollViewer.top = '5%';
        scrollViewer.thickness = 0;
        scrollViewer.barColor = '#8B7355';
        scrollViewer.barBackground = 'rgba(40, 35, 30, 0.5)';
        panel.addControl(scrollViewer);

        // Stack panel for profession buttons
        const stackPanel = new GUI.StackPanel('profStack');
        stackPanel.width = '100%';
        scrollViewer.addControl(stackPanel);

        // Add profession buttons
        this.populateProfessions(stackPanel);

        return panel;
    }

    /**
     * Populate professions list
     */
    populateProfessions(stackPanel) {
        const professions = Array.from(this.craftingManager.professions.values());
        
        professions.forEach(profession => {
            const playerProf = this.craftingManager.getPlayerProfession(profession.name);
            
            const btn = GUI.Button.CreateSimpleButton(
                `prof_${profession.name}`,
                `${profession.icon} ${profession.displayName}\nLv.${playerProf.level}`
            );
            btn.height = '70px';
            btn.thickness = 2;
            btn.color = '#8B7355';
            btn.background = 'rgba(50, 45, 40, 0.7)';
            btn.fontSize = 14;
            btn.paddingTop = '5px';
            btn.paddingBottom = '5px';
            
            btn.onPointerEnterObservable.add(() => {
                btn.background = 'rgba(70, 60, 50, 0.9)';
            });
            
            btn.onPointerOutObservable.add(() => {
                btn.background = 'rgba(50, 45, 40, 0.7)';
            });
            
            btn.onPointerClickObservable.add(() => {
                this.selectProfession(profession.name);
            });
            
            stackPanel.addControl(btn);
        });
    }

    /**
     * Create recipes panel
     */
    createRecipesPanel() {
        const panel = new GUI.Rectangle('recipesPanel');
        panel.width = '38%';
        panel.height = '100%';
        panel.thickness = 2;
        panel.color = '#6B5D4F';
        panel.background = 'rgba(30, 25, 20, 0.8)';
        panel.cornerRadius = 5;

        // Title
        this.recipesTitle = new GUI.TextBlock('recipesTitle', '📜 RECIPES');
        this.recipesTitle.height = '40px';
        this.recipesTitle.top = '-45%';
        this.recipesTitle.fontSize = 18;
        this.recipesTitle.color = '#FFD700';
        this.recipesTitle.fontWeight = 'bold';
        panel.addControl(this.recipesTitle);

        // Scroll viewer for recipes
        this.recipesScrollViewer = new GUI.ScrollViewer('recipesScroll');
        this.recipesScrollViewer.width = '95%';
        this.recipesScrollViewer.height = '85%';
        this.recipesScrollViewer.top = '5%';
        this.recipesScrollViewer.thickness = 0;
        this.recipesScrollViewer.barColor = '#8B7355';
        this.recipesScrollViewer.barBackground = 'rgba(40, 35, 30, 0.5)';
        panel.addControl(this.recipesScrollViewer);

        // Stack panel for recipes
        this.recipesStackPanel = new GUI.StackPanel('recipesStack');
        this.recipesStackPanel.width = '100%';
        this.recipesScrollViewer.addControl(this.recipesStackPanel);

        return panel;
    }

    /**
     * Create details panel
     */
    createDetailsPanel() {
        const panel = new GUI.Rectangle('detailsPanel');
        panel.width = '28%';
        panel.height = '100%';
        panel.thickness = 2;
        panel.color = '#6B5D4F';
        panel.background = 'rgba(30, 25, 20, 0.8)';
        panel.cornerRadius = 5;

        // Title
        const title = new GUI.TextBlock('detailsTitle', '🔍 DETAILS');
        title.height = '40px';
        title.top = '-45%';
        title.fontSize = 18;
        title.color = '#FFD700';
        title.fontWeight = 'bold';
        panel.addControl(title);

        // Details content container
        this.detailsContent = new GUI.Rectangle('detailsContent');
        this.detailsContent.width = '95%';
        this.detailsContent.height = '85%';
        this.detailsContent.top = '5%';
        this.detailsContent.thickness = 0;
        panel.addControl(this.detailsContent);

        return panel;
    }

    /**
     * Select a profession
     */
    selectProfession(professionName) {
        this.currentProfession = professionName;
        const profession = this.craftingManager.getProfession(professionName);
        const playerProf = this.craftingManager.getPlayerProfession(professionName);
        
        // Update recipes title
        this.recipesTitle.text = `📜 ${profession.displayName.toUpperCase()} RECIPES`;
        
        // Clear and populate recipes
        this.recipesStackPanel.clearControls();
        const recipes = this.craftingManager.getRecipesForProfession(professionName, playerProf.level);
        
        recipes.forEach(recipe => {
            this.addRecipeButton(recipe, playerProf.level);
        });
    }

    /**
     * Add a recipe button
     */
    addRecipeButton(recipe, playerLevel) {
        const isUnlocked = recipe.unlockLevel <= playerLevel;
        const canCraft = this.craftingManager.canCraft(recipe.id, this.inventory);
        
        const btn = GUI.Button.CreateSimpleButton(
            `recipe_${recipe.id}`,
            `${isUnlocked ? '✓' : '🔒'} ${recipe.name}\nLv.${recipe.unlockLevel}`
        );
        btn.height = '60px';
        btn.thickness = 2;
        btn.color = isUnlocked ? '#8B7355' : '#555';
        btn.background = isUnlocked ? 'rgba(50, 45, 40, 0.7)' : 'rgba(30, 30, 30, 0.7)';
        btn.fontSize = 13;
        btn.paddingTop = '5px';
        btn.paddingBottom = '5px';
        
        if (isUnlocked) {
            btn.onPointerEnterObservable.add(() => {
                btn.background = 'rgba(70, 60, 50, 0.9)';
            });
            
            btn.onPointerOutObservable.add(() => {
                btn.background = 'rgba(50, 45, 40, 0.7)';
            });
            
            btn.onPointerClickObservable.add(() => {
                this.selectRecipe(recipe);
            });
        }
        
        this.recipesStackPanel.addControl(btn);
    }

    /**
     * Select a recipe and show details
     */
    selectRecipe(recipe) {
        this.selectedRecipe = recipe;
        this.showRecipeDetails(recipe);
    }

    /**
     * Show recipe details
     */
    showRecipeDetails(recipe) {
        // Clear previous details
        this.detailsContent.clearControls();
        
        // Create details text
        let detailsText = `${recipe.name}\n\n`;
        detailsText += `Level Required: ${recipe.unlockLevel}\n`;
        detailsText += `Workstation: ${recipe.workstation}\n\n`;
        detailsText += `Materials:\n`;
        recipe.materials.forEach(mat => {
            detailsText += `  • ${mat.name} x${mat.quantity}\n`;
        });
        detailsText += `\nResult:\n`;
        detailsText += `  ✨ ${recipe.result.name} x${recipe.result.quantity || 1}\n`;
        detailsText += `\nExperience: +${recipe.experience} XP`;
        
        const detailsTextBlock = new GUI.TextBlock('recipeDetails', detailsText);
        detailsTextBlock.height = '70%';
        detailsTextBlock.top = '-10%';
        detailsTextBlock.fontSize = 13;
        detailsTextBlock.color = '#DDD';
        detailsTextBlock.textWrapping = true;
        detailsTextBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.detailsContent.addControl(detailsTextBlock);
        
        // Craft button
        const craftBtn = GUI.Button.CreateSimpleButton('craftBtn', '⚒️ CRAFT');
        craftBtn.width = '90%';
        craftBtn.height = '50px';
        craftBtn.top = '40%';
        craftBtn.thickness = 2;
        craftBtn.color = '#FFD700';
        craftBtn.background = 'rgba(60, 120, 60, 0.8)';
        craftBtn.fontSize = 16;
        craftBtn.fontWeight = 'bold';
        
        craftBtn.onPointerClickObservable.add(() => {
            this.craftItem(recipe);
        });
        
        this.detailsContent.addControl(craftBtn);
    }

    /**
     * Craft an item
     */
    async craftItem(recipe) {
        const result = await this.craftingManager.craft(recipe.id, this.inventory);
        
        if (result.success) {
            console.log(`✅ Successfully crafted: ${recipe.name}`);
            // Refresh the UI
            if (this.currentProfession) {
                this.selectProfession(this.currentProfession);
            }
        } else {
            console.warn(`❌ Failed to craft: ${result.reason}`);
        }
    }

    /**
     * Show the crafting UI
     */
    show() {
        if (this.mainPanel) {
            this.mainPanel.isVisible = true;
            this.isVisible = true;
        }
    }

    /**
     * Hide the crafting UI
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
     * Set inventory reference
     */
    setInventory(inventory) {
        this.inventory = inventory;
    }
}

