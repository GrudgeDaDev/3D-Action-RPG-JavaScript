# 🔌 Admin Panel API Integration Guide

## Overview

This guide shows how to update the admin panel to save configurations to the server instead of just in-memory.

---

## 🔄 Changes Required

### 1. Update Admin App to Use API

The admin panel needs to call the Express API endpoints instead of just storing configs in memory.

### Key Changes:
- `saveCurrentConfig()` → POST to `/api/configs/:name`
- `exportAllConfigs()` → Keep as download option
- `loadAllConfigs()` → GET from `/api/configs`
- Add server save confirmation
- Add error handling for network failures

---

## 📝 Implementation

### Option A: Minimal Changes (Recommended)

Add a new "Save to Server" button alongside the existing "Save" button:

```javascript
// In adminApp.js

async saveToServer() {
  try {
    const configName = this.currentConfig;
    const configData = this.configs[configName];
    
    const response = await fetch(`/api/configs/${configName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(configData)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    this.showStatus(`✅ ${result.message}`, 'success');
  } catch (error) {
    this.showStatus(`❌ Failed to save to server: ${error.message}`, 'error');
  }
}

async saveAllToServer() {
  try {
    const response = await fetch('/api/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.configs)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    const successCount = result.results.filter(r => r.success).length;
    this.showStatus(`✅ Saved ${successCount}/${result.results.length} configs to server`, 'success');
  } catch (error) {
    this.showStatus(`❌ Failed to save to server: ${error.message}`, 'error');
  }
}
```

### Option B: Auto-Save to Server

Replace the existing save method to automatically save to server:

```javascript
async saveCurrentConfig() {
  const editorPanel = document.getElementById('editorPanel');
  const configData = {};

  // Collect form data (existing code)
  editorPanel.querySelectorAll('[data-path]').forEach(input => {
    const path = input.dataset.path;
    let value;

    if (input.type === 'checkbox') {
      value = input.checked;
    } else if (input.type === 'number') {
      value = parseFloat(input.value);
    } else if (input.tagName === 'TEXTAREA' && input.value.trim().startsWith('[')) {
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

  // Update in-memory configs
  this.configs[this.currentConfig] = configData;

  // Save to server
  try {
    const response = await fetch(`/api/configs/${this.currentConfig}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(configData)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();
    this.showStatus(`✅ ${result.message}`, 'success');
  } catch (error) {
    this.showStatus(`⚠️ Saved locally but failed to save to server: ${error.message}`, 'warning');
  }

  // Update preview
  this.updatePreview();
}
```

---

## 🎨 UI Updates

### Add Server Save Buttons to Admin Panel

Update `admin/index.html`:

```html
<!-- In the toolbar section -->
<div class="toolbar">
  <button id="saveBtn" class="btn btn-primary">
    💾 Save (Memory)
  </button>
  <button id="saveServerBtn" class="btn btn-success">
    🌐 Save to Server
  </button>
  <button id="saveAllServerBtn" class="btn btn-success">
    🌐 Save All to Server
  </button>
  <button id="resetBtn" class="btn btn-secondary">
    🔄 Reset
  </button>
  <button id="exportBtn" class="btn btn-info">
    📥 Export
  </button>
  <button id="importBtn" class="btn btn-info">
    📤 Import
  </button>
</div>
```

### Add Event Listeners

```javascript
// In setupEventListeners()
document.getElementById('saveServerBtn').addEventListener('click', () => {
  this.saveToServer();
});

document.getElementById('saveAllServerBtn').addEventListener('click', () => {
  this.saveAllToServer();
});
```

---

## 🧪 Testing

### 1. Test Single Config Save
```javascript
// In browser console
fetch('/api/configs/global', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ debug: true, fastReload: true })
}).then(r => r.json()).then(console.log);
```

### 2. Test Load Configs
```javascript
fetch('/api/configs').then(r => r.json()).then(console.log);
```

### 3. Test Health Check
```javascript
fetch('/api/health').then(r => r.json()).then(console.log);
```

---

## 🔒 Security Considerations

### Add Authentication (Optional but Recommended)

```javascript
// Simple password protection
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';

app.post('/api/configs/:name', (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
});
```

Update admin panel:
```javascript
async saveToServer() {
  const password = localStorage.getItem('adminPassword') || 
                   prompt('Enter admin password:');
  
  const response = await fetch(`/api/configs/${this.currentConfig}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${password}`
    },
    body: JSON.stringify(this.configs[this.currentConfig])
  });
  
  if (response.status === 401) {
    localStorage.removeItem('adminPassword');
    this.showStatus('❌ Invalid password', 'error');
    return;
  }
  
  localStorage.setItem('adminPassword', password);
  // ... rest of save logic
}
```

---

## 📋 Migration Checklist

- [ ] Install Express dependencies: `npm install express cors`
- [ ] Start server: `npm run dev`
- [ ] Test API endpoints in browser console
- [ ] Update admin panel with new save methods
- [ ] Add UI buttons for server save
- [ ] Test save functionality
- [ ] Add authentication (optional)
- [ ] Deploy to production
- [ ] Update documentation

---

## 🎯 Benefits

✅ **Persistent saves** - Changes survive page reloads  
✅ **Multi-user support** - Multiple admins can edit configs  
✅ **Automatic backups** - Server creates backups before saves  
✅ **Version control** - Can track config changes over time  
✅ **Production ready** - Works across all scenes and deployments  

