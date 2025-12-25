/**
 * Admin Panel Application
 * Manages configuration editing and export/import
 * Supports both local file loading and server API synchronization
 */

class AdminApp {
  constructor() {
    this.configs = {};
    this.currentConfig = "global";
    this.configPath = "../config/";
    this.serverConnected = false;
    this.useServerAPI = true; // Prefer server API when available

    this.init();
  }

  async init() {
    console.log("🚀 Initializing Admin Panel...");

    // Check server connection first
    this.serverConnected = await this.checkServerConnection();
    this.updateServerStatusUI();

    // Load all configurations (from server if available, otherwise local files)
    await this.loadAllConfigs();

    // Setup event listeners
    this.setupEventListeners();

    // Load initial config
    this.loadConfigEditor(this.currentConfig);

    // Start periodic server health checks
    this.startHealthCheck();

    console.log("✅ Admin Panel Ready");
  }

  /**
   * Update the server status indicator in the UI
   */
  updateServerStatusUI() {
    const statusEl = document.getElementById("serverStatus");
    const statusTextEl = document.getElementById("serverStatusText");

    if (statusEl && statusTextEl) {
      if (this.serverConnected) {
        statusEl.classList.remove("disconnected");
        statusEl.classList.add("connected");
        statusTextEl.textContent = "Server Connected";
      } else {
        statusEl.classList.remove("connected");
        statusEl.classList.add("disconnected");
        statusTextEl.textContent = "Server Offline";
      }
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck() {
    setInterval(async () => {
      const wasConnected = this.serverConnected;
      this.serverConnected = await this.checkServerConnection();

      if (wasConnected !== this.serverConnected) {
        this.updateServerStatusUI();
        if (this.serverConnected) {
          this.showStatus("🌐 Server connection restored", "success");
        } else {
          this.showStatus("⚠️ Server connection lost", "warning");
        }
      }
    }, 30000); // Check every 30 seconds
  }

  async loadAllConfigs() {
    const configFiles = [
      "global",
      "scenes",
      "combat",
      "movement",
      "character",
      "camera",
      "physics",
      "graphics",
      "builder",
      "assets",
      "settings",
    ];

    // Try to load from server API first if connected
    if (this.serverConnected && this.useServerAPI) {
      try {
        const response = await fetch("/api/configs");
        if (response.ok) {
          this.configs = await response.json();
          console.log("✅ Loaded all configs from server API");
          return;
        }
      } catch (error) {
        console.warn("⚠️ Failed to load from server, falling back to files:", error);
      }
    }

    // Fallback: Load from local config files
    for (const configName of configFiles) {
      try {
        const response = await fetch(`${this.configPath}${configName}.json`);
        if (response.ok) {
          this.configs[configName] = await response.json();
          console.log(`✅ Loaded: ${configName}.json (from file)`);
        }
      } catch (error) {
        console.error(`❌ Failed to load ${configName}.json:`, error);
        this.configs[configName] = {};
      }
    }
  }

  setupEventListeners() {
    // Navigation items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const configName = item.dataset.config;
        this.switchConfig(configName);
      });
    });

    // Save button (in-memory only)
    document.getElementById("saveBtn").addEventListener("click", () => {
      this.saveCurrentConfig();
    });

    // Save to server button (if exists)
    const saveServerBtn = document.getElementById("saveServerBtn");
    if (saveServerBtn) {
      saveServerBtn.addEventListener("click", () => {
        this.saveToServer();
      });
    }

    // Save all to server button (if exists)
    const saveAllServerBtn = document.getElementById("saveAllServerBtn");
    if (saveAllServerBtn) {
      saveAllServerBtn.addEventListener("click", () => {
        this.saveAllToServer();
      });
    }

    // Reset button
    document.getElementById("resetBtn").addEventListener("click", () => {
      this.resetCurrentConfig();
    });

    // Export button
    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportAllConfigs();
    });

    // Import button
    document.getElementById("importBtn").addEventListener("click", () => {
      this.showImportModal();
    });

    // Back to game button
    document.getElementById("backToGameBtn").addEventListener("click", () => {
      window.close();
      if (!window.closed) {
        window.location.href = "../index.html";
      }
    });

    // Copy JSON button
    document.getElementById("copyJsonBtn").addEventListener("click", () => {
      this.copyJsonToClipboard();
    });

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.hideImportModal();
      });
    });

    // Confirm import button
    document
      .getElementById("confirmImportBtn")
      .addEventListener("click", () => {
        this.importConfig();
      });
  }

  switchConfig(configName) {
    this.currentConfig = configName;

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.config === configName) {
        item.classList.add("active");
      }
    });

    // Load config editor
    this.loadConfigEditor(configName);
  }

  loadConfigEditor(configName) {
    const config = this.configs[configName];
    const editorPanel = document.getElementById("editorPanel");
    const editorTitle = document.getElementById("editorTitle");
    const jsonPreview = document.getElementById("jsonPreview");

    // Update title
    const titles = {
      global: "Global Settings",
      scenes: "Scene Configuration",
      combat: "Combat System",
      movement: "Movement & Controls",
      character: "Character Configuration",
      camera: "Camera Settings",
      physics: "Physics Configuration",
      graphics: "Graphics & Post-Processing",
      builder: "Builder System",
      assets: "Asset Paths",
    };
    editorTitle.textContent = titles[configName] || configName;

    // Generate form
    editorPanel.innerHTML = this.generateForm(config, configName);

    // Update JSON preview
    jsonPreview.textContent = JSON.stringify(config, null, 2);

    // Add input listeners for live preview
    editorPanel.querySelectorAll("input, select, textarea").forEach((input) => {
      input.addEventListener("input", () => {
        this.updatePreview();
      });
    });
  }

  generateForm(obj, path = "") {
    let html = "";

    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      const inputId = fullPath.replace(/\./g, "_");

      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        // Nested object - create collapsible section
        html += `
          <div class="form-section">
            <h4 class="section-title">${this.formatLabel(key)}</h4>
            <div class="section-content">
              ${this.generateForm(value, fullPath)}
            </div>
          </div>
        `;
      } else if (Array.isArray(value)) {
        // Array - show as JSON textarea
        html += `
          <div class="form-group">
            <label for="${inputId}">${this.formatLabel(key)}</label>
            <textarea
              id="${inputId}"
              data-path="${fullPath}"
              rows="4"
            >${JSON.stringify(value, null, 2)}</textarea>
          </div>
        `;
      } else if (typeof value === "boolean") {
        // Boolean - checkbox
        html += `
          <div class="form-group">
            <label>
              <input
                type="checkbox"
                id="${inputId}"
                data-path="${fullPath}"
                ${value ? "checked" : ""}
              >
              ${this.formatLabel(key)}
            </label>
          </div>
        `;
      } else if (typeof value === "number") {
        // Number - number input
        html += `
          <div class="form-group">
            <label for="${inputId}">${this.formatLabel(key)}</label>
            <input
              type="number"
              id="${inputId}"
              data-path="${fullPath}"
              value="${value}"
              step="any"
            >
          </div>
        `;
      } else {
        // String - text input
        html += `
          <div class="form-group">
            <label for="${inputId}">${this.formatLabel(key)}</label>
            <input
              type="text"
              id="${inputId}"
              data-path="${fullPath}"
              value="${value}"
            >
          </div>
        `;
      }
    }

    return html;
  }

  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  updatePreview() {
    const editorPanel = document.getElementById("editorPanel");
    const jsonPreview = document.getElementById("jsonPreview");

    // Collect form data
    const formData = {};
    editorPanel.querySelectorAll("[data-path]").forEach((input) => {
      const path = input.dataset.path;
      let value;

      if (input.type === "checkbox") {
        value = input.checked;
      } else if (input.type === "number") {
        value = parseFloat(input.value);
      } else if (
        input.tagName === "TEXTAREA" &&
        input.value.trim().startsWith("[")
      ) {
        try {
          value = JSON.parse(input.value);
        } catch {
          value = input.value;
        }
      } else {
        value = input.value;
      }

      this.setNestedValue(formData, path, value);
    });

    // Update preview
    jsonPreview.textContent = JSON.stringify(formData, null, 2);
  }

  setNestedValue(obj, path, value) {
    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }

  saveCurrentConfig() {
    const editorPanel = document.getElementById("editorPanel");
    const configData = {};

    // Collect form data
    editorPanel.querySelectorAll("[data-path]").forEach((input) => {
      const path = input.dataset.path;
      let value;

      if (input.type === "checkbox") {
        value = input.checked;
      } else if (input.type === "number") {
        value = parseFloat(input.value);
      } else if (
        input.tagName === "TEXTAREA" &&
        input.value.trim().startsWith("[")
      ) {
        try {
          value = JSON.parse(input.value);
        } catch {
          value = input.value;
        }
      } else {
        value = input.value;
      }

      this.setNestedValue(configData, path, value);
    });

    // Update configs
    this.configs[this.currentConfig] = configData;

    // Show success message
    this.showStatus(
      "Configuration saved! Note: Changes are in memory only. Use Export to download.",
      "success"
    );

    // Update preview
    this.updatePreview();
  }

  resetCurrentConfig() {
    if (
      confirm(
        "Are you sure you want to reset this configuration to the last saved version?"
      )
    ) {
      this.loadConfigEditor(this.currentConfig);
      this.showStatus("Configuration reset", "success");
    }
  }

  exportAllConfigs() {
    const dataStr = JSON.stringify(this.configs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `game-config-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.showStatus("All configurations exported successfully!", "success");
  }

  showImportModal() {
    document.getElementById("importModal").classList.add("active");
  }

  hideImportModal() {
    document.getElementById("importModal").classList.remove("active");
  }

  async importConfig() {
    const fileInput = document.getElementById("importFile");
    const textInput = document.getElementById("importText");
    const mode = document.querySelector(
      'input[name="importMode"]:checked'
    ).value;

    let configData;

    try {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const text = await file.text();
        configData = JSON.parse(text);
      } else if (textInput.value.trim()) {
        configData = JSON.parse(textInput.value);
      } else {
        this.showStatus("Please select a file or paste JSON", "error");
        return;
      }

      if (mode === "replace") {
        this.configs = configData;
      } else {
        // Merge
        for (const [key, value] of Object.entries(configData)) {
          this.configs[key] = value;
        }
      }

      this.loadConfigEditor(this.currentConfig);
      this.hideImportModal();
      this.showStatus("Configuration imported successfully!", "success");
    } catch (error) {
      this.showStatus(`Import failed: ${error.message}`, "error");
    }
  }

  copyJsonToClipboard() {
    const jsonPreview = document.getElementById("jsonPreview");
    navigator.clipboard.writeText(jsonPreview.textContent).then(() => {
      this.showStatus("JSON copied to clipboard!", "success");
    });
  }

  showStatus(message, type = "success") {
    const statusEl = document.getElementById("statusMessage");
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;

    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "status-message";
    }, 5000);
  }

  /**
   * Save current config to server via API
   */
  async saveToServer() {
    try {
      const configName = this.currentConfig;
      const configData = this.configs[configName];

      this.showStatus(`💾 Saving ${configName} to server...`, "info");

      const response = await fetch(`/api/configs/${configName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server returned ${response.status}`);
      }

      const result = await response.json();
      this.showStatus(`✅ ${result.message}`, "success");
      console.log(`✅ Saved ${configName} to server`);
    } catch (error) {
      console.error("Error saving to server:", error);
      this.showStatus(`❌ Failed to save to server: ${error.message}`, "error");
    }
  }

  /**
   * Save all configs to server via API
   */
  async saveAllToServer() {
    try {
      this.showStatus("💾 Saving all configs to server...", "info");

      const response = await fetch("/api/configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.configs),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server returned ${response.status}`);
      }

      const result = await response.json();
      const successCount = result.results.filter((r) => r.success).length;
      const totalCount = result.results.length;

      if (successCount === totalCount) {
        this.showStatus(
          `✅ Saved all ${successCount} configs to server`,
          "success"
        );
      } else {
        this.showStatus(
          `⚠️ Saved ${successCount}/${totalCount} configs to server`,
          "warning"
        );
      }

      console.log("Save results:", result.results);
    } catch (error) {
      console.error("Error saving all to server:", error);
      this.showStatus(`❌ Failed to save to server: ${error.message}`, "error");
    }
  }

  /**
   * Check if server API is available
   */
  async checkServerConnection() {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Server connected:", data);
        return true;
      }
      return false;
    } catch (error) {
      console.warn("⚠️ Server not available:", error.message);
      return false;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.adminApp = new AdminApp();

  // Check server connection
  window.adminApp.checkServerConnection().then((connected) => {
    if (connected) {
      console.log("🌐 Server API available - configs can be saved to disk");
    } else {
      console.log("📁 Server API not available - using local storage only");
    }
  });
});
