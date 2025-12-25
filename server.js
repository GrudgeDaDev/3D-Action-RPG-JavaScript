/**
 * Express.js Server for 3D Action RPG
 * Provides API endpoints for config persistence and serves static files
 * Supports zero-downtime deployments with graceful shutdown
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const CONFIG_DIR = path.join(__dirname, 'config');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (for load balancers)
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all config files
app.get('/api/configs', async (req, res) => {
  try {
    const files = await fs.readdir(CONFIG_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const configs = {};
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(CONFIG_DIR, file), 'utf-8');
      const configName = file.replace('.json', '');
      configs[configName] = JSON.parse(content);
    }
    
    res.json(configs);
  } catch (error) {
    console.error('Error reading configs:', error);
    res.status(500).json({ error: 'Failed to read configurations' });
  }
});

// Get single config file
app.get('/api/configs/:name', async (req, res) => {
  try {
    const configPath = path.join(CONFIG_DIR, `${req.params.name}.json`);
    const content = await fs.readFile(configPath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    console.error(`Error reading config ${req.params.name}:`, error);
    res.status(404).json({ error: 'Configuration not found' });
  }
});

// Save single config file
app.post('/api/configs/:name', async (req, res) => {
  try {
    const configName = req.params.name;
    const configData = req.body;
    
    // Validate config name (prevent path traversal)
    if (!/^[a-zA-Z0-9_-]+$/.test(configName)) {
      return res.status(400).json({ error: 'Invalid config name' });
    }
    
    const configPath = path.join(CONFIG_DIR, `${configName}.json`);
    
    // Create backup before saving
    try {
      const existing = await fs.readFile(configPath, 'utf-8');
      const backupPath = path.join(CONFIG_DIR, '.backups', `${configName}_${Date.now()}.json`);
      await fs.mkdir(path.join(CONFIG_DIR, '.backups'), { recursive: true });
      await fs.writeFile(backupPath, existing);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError.message);
    }
    
    // Save new config
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
    
    console.log(`✅ Saved config: ${configName}`);
    res.json({ success: true, message: `Configuration ${configName} saved successfully` });
  } catch (error) {
    console.error(`Error saving config ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Save all configs at once
app.post('/api/configs', async (req, res) => {
  try {
    const configs = req.body;
    const results = [];
    
    for (const [configName, configData] of Object.entries(configs)) {
      if (!/^[a-zA-Z0-9_-]+$/.test(configName)) {
        results.push({ name: configName, success: false, error: 'Invalid name' });
        continue;
      }
      
      try {
        const configPath = path.join(CONFIG_DIR, `${configName}.json`);
        await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
        results.push({ name: configName, success: true });
      } catch (error) {
        results.push({ name: configName, success: false, error: error.message });
      }
    }
    
    console.log(`✅ Saved ${results.filter(r => r.success).length}/${results.length} configs`);
    res.json({ results });
  } catch (error) {
    console.error('Error saving configs:', error);
    res.status(500).json({ error: 'Failed to save configurations' });
  }
});

// Graceful shutdown handler
let server;
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`⚙️  Config directory: ${CONFIG_DIR}`);
  console.log(`🎮 Game: http://localhost:${PORT}`);
  console.log(`🛠️  Admin: http://localhost:${PORT}/admin`);
});

