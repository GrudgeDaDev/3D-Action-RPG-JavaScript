/**
 * Main Panel UI - Grudge Style
 * Opens with B key, contains Equipment, Skills, Crafting, Quest, Guild panels
 * Styled to match Unity version
 *
 * Usage:
 *   import { MainPanel } from './ui/MainPanel.js';
 *   const mainPanel = new MainPanel();
 *   // Press B to open/close (Tab is reserved for target cycling)
 */

export class MainPanel {
  constructor(options = {}) {
    this.isOpen = false;
    this.activeTab = "equipment";
    this.hotkey = options.hotkey || "b";

    // Player data reference (can be updated externally)
    this.playerData = options.playerData || {
      name: "Hero",
      class: "Warrior",
      level: 1,
      gold: 0,
      stats: { strength: 10, agility: 10, intelligence: 10, stamina: 10 },
    };

    // Panel configurations
    this.tabs = [
      { id: "class", name: "Class", icon: "🎭", required: true }, // MUST select before level 1
      { id: "equipment", name: "Equipment", icon: "⚔️" },
      { id: "attributes", name: "Attributes", icon: "📊" },
      { id: "skills", name: "Skills", icon: "✨" },
      { id: "crafting", name: "Crafting", icon: "🔨" },
      { id: "quests", name: "Quests", icon: "📜" },
      { id: "guild", name: "Guild", icon: "🏰" },
      { id: "inventory", name: "Inventory", icon: "🎒" },
    ];

    // Class selection state
    this.selectedClass = null;
    this.classLocked = false;

    // Callbacks
    this.onOpen = options.onOpen || (() => {});
    this.onClose = options.onClose || (() => {});
    this.onTabChange = options.onTabChange || (() => {});

    this.loadExternalCSS();
    this.createStyles();
    this.createPanel();
    this.setupHotkey();
    this.setupClassSelectionHandlers();

    console.log(
      "📋 Main Panel initialized (Press B to open) - MainPanel.js:48"
    );
  }

  /**
   * Load external CSS file
   */
  loadExternalCSS() {
    if (document.getElementById("mainPanelExternalCSS")) return;

    const link = document.createElement("link");
    link.id = "mainPanelExternalCSS";
    link.rel = "stylesheet";
    link.href = "./src/ui/MainPanel.css";
    document.head.appendChild(link);
  }

  /**
   * Create CSS styles
   */
  createStyles() {
    if (document.getElementById("mainPanelStyles")) return;

    const style = document.createElement("style");
    style.id = "mainPanelStyles";
    style.textContent = `
            /* Main Panel Overlay */
            .main-panel-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 5000;
                opacity: 0;
                transition: opacity 0.25s ease;
            }
            .main-panel-overlay.open {
                display: flex;
                opacity: 1;
            }

            /* Panel Container */
            .main-panel {
                width: 900px;
                height: 650px;
                background: linear-gradient(180deg, 
                    rgba(25, 25, 35, 0.98) 0%, 
                    rgba(15, 15, 25, 0.98) 100%);
                border: 2px solid rgba(180, 140, 70, 0.6);
                border-radius: 12px;
                box-shadow: 
                    0 0 60px rgba(0, 0, 0, 0.8),
                    0 0 30px rgba(180, 140, 70, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.95) translateY(20px);
                transition: transform 0.25s ease;
            }
            .main-panel-overlay.open .main-panel {
                transform: scale(1) translateY(0);
            }

            /* Header */
            .main-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: linear-gradient(180deg, 
                    rgba(40, 35, 30, 0.9) 0%, 
                    rgba(30, 25, 20, 0.9) 100%);
                border-bottom: 2px solid rgba(180, 140, 70, 0.4);
            }
            .main-panel-title {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 22px;
                color: rgb(220, 180, 100);
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                letter-spacing: 2px;
            }
            .main-panel-close {
                width: 36px;
                height: 36px;
                background: rgba(180, 50, 50, 0.3);
                border: 1px solid rgba(180, 50, 50, 0.5);
                border-radius: 6px;
                color: rgb(200, 150, 150);
                font-size: 20px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .main-panel-close:hover {
                background: rgba(200, 50, 50, 0.5);
                color: white;
            }

            /* Tab Navigation */
            .main-panel-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(180, 140, 70, 0.2);
                padding: 0 10px;
            }
            .main-panel-tab {
                padding: 12px 18px;
                background: transparent;
                border: none;
                border-bottom: 3px solid transparent;
                color: rgba(200, 180, 150, 0.6);
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .main-panel-tab:hover {
                color: rgba(220, 200, 170, 0.9);
                background: rgba(180, 140, 70, 0.1);
            }
            .main-panel-tab.active {
                color: rgb(220, 180, 100);
                border-bottom-color: rgb(180, 140, 70);
                background: rgba(180, 140, 70, 0.15);
            }
            .main-panel-tab-icon {
                font-size: 16px;
            }

            /* Content Area */
            .main-panel-content {
                flex: 1;
                display: flex;
                overflow: hidden;
            }
            .main-panel-page {
                display: none;
                width: 100%;
                height: 100%;
                padding: 20px;
                overflow-y: auto;
                color: rgba(220, 210, 200, 0.9);
            }
            .main-panel-page.active {
                display: block;
            }
            .main-panel-page::-webkit-scrollbar {
                width: 8px;
            }
            .main-panel-page::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }
            .main-panel-page::-webkit-scrollbar-thumb {
                background: rgba(180, 140, 70, 0.4);
                border-radius: 4px;
            }

            /* Class Selection Panel */
            .class-selection-panel {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .class-selection-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(180, 140, 70, 0.3);
            }
            .class-selection-header h2 {
                margin: 0 0 10px 0;
                color: rgb(220, 180, 100);
                font-size: 28px;
                text-shadow: 0 2px 10px rgba(220, 180, 100, 0.5);
            }
            .class-selection-subtitle {
                margin: 0;
                font-size: 14px;
                color: rgba(220, 200, 170, 0.8);
            }
            .class-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                overflow-y: auto;
                padding: 10px;
            }
            .class-card {
                background: linear-gradient(135deg, rgba(20, 20, 30, 0.9), rgba(30, 30, 40, 0.9));
                border: 2px solid #444;
                border-radius: 12px;
                padding: 0;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .class-card:hover:not(.disabled) {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
                border-color: rgba(180, 140, 70, 0.6);
            }
            .class-card.selected {
                border-width: 3px;
                box-shadow: 0 0 30px rgba(180, 140, 70, 0.4);
            }
            .class-card.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                filter: grayscale(0.8);
            }
            .class-card-header {
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .class-icon {
                font-size: 48px;
                margin-bottom: 10px;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
            }
            .class-name {
                margin: 10px 0 5px 0;
                font-size: 24px;
                font-weight: bold;
            }
            .class-role {
                margin: 0;
                font-size: 12px;
                color: rgba(220, 200, 170, 0.7);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .class-card-body {
                padding: 20px;
                flex: 1;
            }
            .class-description {
                margin: 0 0 15px 0;
                font-size: 14px;
                line-height: 1.6;
                color: rgba(220, 210, 200, 0.8);
            }
            .class-stats, .class-ability {
                margin: 10px 0;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                border-left: 3px solid rgba(180, 140, 70, 0.5);
            }
            .class-stat-label, .class-ability-label {
                font-size: 11px;
                color: rgba(220, 200, 170, 0.6);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            .class-stat-value, .class-ability-value {
                font-size: 13px;
                color: rgba(220, 180, 100, 0.9);
                font-weight: 500;
            }
            .class-card-footer {
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .class-select-btn, .class-confirm-btn {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .class-select-btn {
                background: rgba(180, 140, 70, 0.3);
                color: rgb(220, 180, 100);
                border: 1px solid rgba(180, 140, 70, 0.5);
            }
            .class-select-btn:hover {
                background: rgba(180, 140, 70, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(180, 140, 70, 0.3);
            }
            .class-confirm-btn {
                color: white;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            .class-confirm-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            .class-locked-badge {
                text-align: center;
                font-weight: bold;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Create the panel DOM
   */
  createPanel() {
    // Overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "main-panel-overlay";
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.close();
    };

    // Panel container
    this.panel = document.createElement("div");
    this.panel.className = "main-panel";

    // Header
    const header = document.createElement("div");
    header.className = "main-panel-header";
    header.innerHTML = `
            <div class="main-panel-title">CHARACTER</div>
            <button class="main-panel-close">✕</button>
        `;
    header.querySelector(".main-panel-close").onclick = () => this.close();
    this.panel.appendChild(header);

    // Tabs
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "main-panel-tabs";

    this.tabs.forEach((tab) => {
      const tabBtn = document.createElement("button");
      tabBtn.className = `main-panel-tab ${tab.id === this.activeTab ? "active" : ""}`;
      tabBtn.dataset.tab = tab.id;
      tabBtn.innerHTML = `
                <span class="main-panel-tab-icon">${tab.icon}</span>
                <span>${tab.name}</span>
            `;
      tabBtn.onclick = () => this.switchTab(tab.id);
      tabsContainer.appendChild(tabBtn);
    });
    this.panel.appendChild(tabsContainer);

    // Content area
    this.contentArea = document.createElement("div");
    this.contentArea.className = "main-panel-content";

    this.tabs.forEach((tab) => {
      const page = document.createElement("div");
      page.className = `main-panel-page ${tab.id === this.activeTab ? "active" : ""}`;
      page.id = `panel-${tab.id}`;
      page.innerHTML = this.getTabContent(tab.id);
      this.contentArea.appendChild(page);
    });
    this.panel.appendChild(this.contentArea);

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);
  }

  /**
   * Get content for each tab
   */
  getTabContent(tabId) {
    const contents = {
      class: this.createClassSelectionContent(),
      equipment: this.createEquipmentContent(),
      attributes: this.createAttributesContent(),
      skills: this.createSkillsContent(),
      crafting: this.createCraftingContent(),
      quests: this.createQuestsContent(),
      guild: this.createGuildContent(),
      inventory: this.createInventoryContent(),
    };
    return contents[tabId] || "<p>Content coming soon...</p>";
  }

  createClassSelectionContent() {
    const classes = [
      {
        id: "warrior",
        name: "Warrior",
        icon: "⚔️",
        role: "Melee DPS / Tank",
        description:
          "Masters of close combat, wielding heavy weapons and armor. High strength and vitality.",
        primaryStats: "Strength, Vitality, Endurance",
        startingAbility: "Heroic Strike - Powerful melee attack",
        color: "#ef4444",
      },
      {
        id: "mage",
        name: "Mage",
        icon: "🔮",
        role: "Ranged Magic DPS",
        description:
          "Arcane spellcasters who command the elements. High intellect and wisdom.",
        primaryStats: "Intellect, Wisdom, Agility",
        startingAbility: "Fireball - Ranged fire damage",
        color: "#3b82f6",
      },
      {
        id: "rogue",
        name: "Rogue",
        icon: "🗡️",
        role: "Stealth DPS",
        description:
          "Masters of stealth and critical strikes. High dexterity and agility.",
        primaryStats: "Dexterity, Agility, Tactics",
        startingAbility: "Backstab - Critical strike from stealth",
        color: "#8b5cf6",
      },
      {
        id: "ranger",
        name: "Ranger",
        icon: "🏹",
        role: "Ranged Physical DPS",
        description:
          "Expert marksmen who strike from afar. High dexterity and agility.",
        primaryStats: "Dexterity, Agility, Endurance",
        startingAbility: "Aimed Shot - Precise ranged attack",
        color: "#10b981",
      },
      {
        id: "paladin",
        name: "Paladin",
        icon: "🛡️",
        role: "Tank / Healer",
        description:
          "Holy warriors who protect allies and smite evil. Balanced stats with high vitality.",
        primaryStats: "Strength, Vitality, Wisdom",
        startingAbility: "Holy Light - Heal self or ally",
        color: "#f59e0b",
      },
      {
        id: "necromancer",
        name: "Necromancer",
        icon: "💀",
        role: "Summoner / DoT DPS",
        description:
          "Dark mages who command the undead. High intellect and wisdom.",
        primaryStats: "Intellect, Wisdom, Tactics",
        startingAbility: "Raise Skeleton - Summon undead minion",
        color: "#6366f1",
      },
    ];

    const isLocked = this.classLocked;
    const selectedId = this.selectedClass;

    return `
      <div class="class-selection-panel">
        <div class="class-selection-header">
          <h2>🎭 Choose Your Class</h2>
          <p class="class-selection-subtitle">
            ${
              isLocked
                ? `<span style="color: #10b981;">✓ Class Locked: ${classes.find((c) => c.id === selectedId)?.name || "Unknown"}</span>`
                : '<span style="color: #f59e0b;">⚠️ You must select a class before reaching Level 1</span>'
            }
          </p>
        </div>

        <div class="class-grid">
          ${classes
            .map(
              (cls) => `
            <div class="class-card ${selectedId === cls.id ? "selected" : ""} ${isLocked && selectedId !== cls.id ? "disabled" : ""}"
                 data-class="${cls.id}"
                 style="border-color: ${selectedId === cls.id ? cls.color : "#444"};">
              <div class="class-card-header" style="background: linear-gradient(135deg, ${cls.color}22, ${cls.color}11);">
                <div class="class-icon" style="font-size: 48px;">${cls.icon}</div>
                <h3 class="class-name" style="color: ${cls.color};">${cls.name}</h3>
                <p class="class-role">${cls.role}</p>
              </div>

              <div class="class-card-body">
                <p class="class-description">${cls.description}</p>

                <div class="class-stats">
                  <div class="class-stat-label">Primary Stats:</div>
                  <div class="class-stat-value">${cls.primaryStats}</div>
                </div>

                <div class="class-ability">
                  <div class="class-ability-label">Starting Ability:</div>
                  <div class="class-ability-value">${cls.startingAbility}</div>
                </div>
              </div>

              <div class="class-card-footer">
                ${
                  selectedId === cls.id && !isLocked
                    ? `<button class="class-confirm-btn" data-class="${cls.id}" style="background: ${cls.color};">Confirm Selection</button>`
                    : selectedId === cls.id && isLocked
                      ? `<div class="class-locked-badge" style="color: ${cls.color};">✓ Selected</div>`
                      : !isLocked
                        ? `<button class="class-select-btn" data-class="${cls.id}">Select</button>`
                        : '<div class="class-locked-badge" style="opacity: 0.3;">Locked</div>'
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  createEquipmentContent() {
    return `
            <div class="equipment-panel">
                <div class="equipment-character">
                    <div class="character-model-preview">
                        <div class="character-silhouette">🧙</div>
                        <div class="character-name">Hero</div>
                        <div class="character-class">Level 1 Warrior</div>
                    </div>
                </div>
                <div class="equipment-slots">
                    <div class="equipment-grid">
                        ${[
                          "Helmet",
                          "Amulet",
                          "Shoulder",
                          "Chest",
                          "Cloak",
                          "Bracers",
                          "Gloves",
                          "Belt",
                          "Legs",
                          "Boots",
                          "Ring 1",
                          "Ring 2",
                          "Main Hand",
                          "Off Hand",
                        ]
                          .map(
                            (slot) => `
                                <div class="equipment-slot" data-slot="${slot.toLowerCase().replace(" ", "-")}">
                                    <div class="slot-icon">❓</div>
                                    <div class="slot-label">${slot}</div>
                                </div>
                            `
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `;
  }

  createAttributesContent() {
    return `
            <div class="attributes-panel">
                <div class="stat-group">
                    <h3>Primary Stats</h3>
                    <div class="stat-row"><span>Strength</span><span class="stat-value">10</span></div>
                    <div class="stat-row"><span>Agility</span><span class="stat-value">10</span></div>
                    <div class="stat-row"><span>Intelligence</span><span class="stat-value">10</span></div>
                    <div class="stat-row"><span>Stamina</span><span class="stat-value">10</span></div>
                </div>
                <div class="stat-group">
                    <h3>Combat Stats</h3>
                    <div class="stat-row"><span>Attack Power</span><span class="stat-value">25</span></div>
                    <div class="stat-row"><span>Spell Power</span><span class="stat-value">15</span></div>
                    <div class="stat-row"><span>Critical Chance</span><span class="stat-value">5%</span></div>
                    <div class="stat-row"><span>Armor</span><span class="stat-value">50</span></div>
                </div>
            </div>
        `;
  }

  createSkillsContent() {
    return `
            <div class="skills-panel">
                <h3>Skill Tree</h3>
                <div class="skill-categories">
                    <button class="skill-cat active">Combat</button>
                    <button class="skill-cat">Magic</button>
                    <button class="skill-cat">Passive</button>
                </div>
                <div class="skills-grid">
                    ${[
                      "Slash",
                      "Heavy Strike",
                      "Whirlwind",
                      "Shield Block",
                      "Charge",
                      "Battle Cry",
                    ]
                      .map(
                        (skill, i) => `
                            <div class="skill-slot ${i < 2 ? "unlocked" : "locked"}">
                                <div class="skill-icon">⚔️</div>
                                <div class="skill-name">${skill}</div>
                                <div class="skill-level">Lv. ${i < 2 ? "1" : "0"}</div>
                            </div>
                        `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  createCraftingContent() {
    return `
            <div class="crafting-panel">
                <div class="crafting-categories">
                    <button class="craft-cat active">Blacksmithing</button>
                    <button class="craft-cat">Alchemy</button>
                    <button class="craft-cat">Enchanting</button>
                </div>
                <div class="recipes-list">
                    <div class="recipe-item">
                        <div class="recipe-icon">🗡️</div>
                        <div class="recipe-info">
                            <div class="recipe-name">Iron Sword</div>
                            <div class="recipe-mats">Iron Ore x3, Wood x1</div>
                        </div>
                        <button class="craft-btn">Craft</button>
                    </div>
                    <div class="recipe-item">
                        <div class="recipe-icon">🛡️</div>
                        <div class="recipe-info">
                            <div class="recipe-name">Wooden Shield</div>
                            <div class="recipe-mats">Wood x5, Iron Ore x1</div>
                        </div>
                        <button class="craft-btn">Craft</button>
                    </div>
                </div>
            </div>
        `;
  }

  createQuestsContent() {
    return `
            <div class="quests-panel">
                <div class="quest-tabs">
                    <button class="quest-tab active">Active</button>
                    <button class="quest-tab">Completed</button>
                </div>
                <div class="quest-list">
                    <div class="quest-item active">
                        <div class="quest-icon">📜</div>
                        <div class="quest-info">
                            <div class="quest-name">The Beginning</div>
                            <div class="quest-desc">Speak to the village elder</div>
                            <div class="quest-progress">0/1</div>
                        </div>
                    </div>
                    <div class="quest-item">
                        <div class="quest-icon">⚔️</div>
                        <div class="quest-info">
                            <div class="quest-name">Wolf Slayer</div>
                            <div class="quest-desc">Defeat 5 wolves in the forest</div>
                            <div class="quest-progress">2/5</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  createGuildContent() {
    return `
            <div class="guild-panel">
                <div class="guild-header">
                    <div class="guild-emblem">🏰</div>
                    <div class="guild-info">
                        <div class="guild-name">No Guild</div>
                        <div class="guild-rank">Join a guild to see members</div>
                    </div>
                </div>
                <div class="guild-actions">
                    <button class="guild-btn">Create Guild</button>
                    <button class="guild-btn">Browse Guilds</button>
                </div>
            </div>
        `;
  }

  createInventoryContent() {
    return `
            <div class="inventory-panel">
                <div class="inventory-header">
                    <span>Backpack</span>
                    <span class="gold-display">💰 0 Gold</span>
                </div>
                <div class="inventory-grid">
                    ${Array(32)
                      .fill(0)
                      .map(
                        (_, i) => `
                        <div class="inventory-slot" data-slot="${i}">
                            <div class="slot-content"></div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  /**
   * Switch to a tab
   */
  switchTab(tabId) {
    if (this.activeTab === tabId) return;

    this.activeTab = tabId;

    // Update tab buttons
    this.panel.querySelectorAll(".main-panel-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    // Update pages
    this.contentArea.querySelectorAll(".main-panel-page").forEach((page) => {
      page.classList.toggle("active", page.id === `panel-${tabId}`);
    });

    this.onTabChange(tabId);
  }

  /**
   * Setup class selection event handlers
   */
  setupClassSelectionHandlers() {
    // Use event delegation on the panel
    this.panel.addEventListener("click", (e) => {
      // Handle class selection
      if (e.target.classList.contains("class-select-btn")) {
        const classId = e.target.dataset.class;
        this.selectClass(classId);
      }

      // Handle class confirmation
      if (e.target.classList.contains("class-confirm-btn")) {
        const classId = e.target.dataset.class;
        this.confirmClass(classId);
      }
    });
  }

  /**
   * Select a class (preview)
   */
  selectClass(classId) {
    if (this.classLocked) {
      console.warn("⚠️ Class already locked!");
      return;
    }

    this.selectedClass = classId;
    console.log(`🎭 Selected class: ${classId}`);

    // Refresh the class tab content
    this.refreshClassTab();
  }

  /**
   * Confirm class selection (locks it in)
   */
  confirmClass(classId) {
    if (this.classLocked) {
      console.warn("⚠️ Class already locked!");
      return;
    }

    this.selectedClass = classId;
    this.classLocked = true;

    console.log(`✅ Class confirmed and locked: ${classId}`);

    // Save to player data
    if (this.playerData) {
      this.playerData.class = classId;
    }

    // Dispatch event for other systems
    window.dispatchEvent(
      new CustomEvent("classSelected", {
        detail: { classId, playerData: this.playerData },
      })
    );

    // Refresh the class tab content
    this.refreshClassTab();

    // Show notification
    this.showNotification(
      `Class locked: ${classId.charAt(0).toUpperCase() + classId.slice(1)}`
    );
  }

  /**
   * Refresh the class tab content
   */
  refreshClassTab() {
    const classPage = this.panel.querySelector("#panel-class");
    if (classPage) {
      classPage.innerHTML = this.createClassSelectionContent();
    }
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: rgb(220, 180, 100);
      padding: 15px 25px;
      border-radius: 8px;
      border: 2px solid rgb(180, 140, 70);
      z-index: 10000;
      font-size: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Check if class is selected (for level progression)
   */
  isClassSelected() {
    return this.classLocked && this.selectedClass !== null;
  }

  /**
   * Get selected class
   */
  getSelectedClass() {
    return this.selectedClass;
  }

  /**
   * Setup hotkey listener
   */
  setupHotkey() {
    window.addEventListener("keydown", (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (e.key === this.hotkey) {
        e.preventDefault();
        this.toggle();
      }

      // ESC to close
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Open the panel
   */
  open() {
    this.isOpen = true;
    this.overlay.classList.add("open");
    this.onOpen();
  }

  /**
   * Close the panel
   */
  close() {
    this.isOpen = false;
    this.overlay.classList.remove("open");
    this.onClose();
  }

  /**
   * Toggle the panel
   */
  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  /**
   * Destroy the panel
   */
  destroy() {
    this.overlay.remove();
    document.getElementById("mainPanelStyles")?.remove();
  }
}

// Singleton
let mainPanelInstance = null;

export function getMainPanel(options) {
  if (!mainPanelInstance) {
    mainPanelInstance = new MainPanel(options);
  }
  return mainPanelInstance;
}

export default MainPanel;
