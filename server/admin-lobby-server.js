/**
 * GGE Warlords - AI-Powered Admin Lobby Server
 * 
 * This Node.js server handles:
 * - Socket.io connections from admin clients
 * - AI command processing (OpenAI/Anthropic/Gemini)
 * - Scene update broadcasting to all connected clients
 * - Asset registry management
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory asset registry (replace with database in production)
const assetRegistry = {
    meshes: [
        { id: 'mesh_001', name: 'Generic_Box_01', type: 'box', scene: 'env_1' },
        { id: 'mesh_002', name: 'Player_Capsule', type: 'capsule', scene: 'env_1' },
        { id: 'mesh_003', name: 'Terrain_Chunk', type: 'ground', scene: 'env_1' }
    ],
    scenes: [
        { id: 'env_1', name: 'Main Archipelago', status: 'Loaded' },
        { id: 'env_2', name: 'Underground Lab', status: 'Standby' },
        { id: 'env_3', name: 'Neon City', status: 'Standby' }
    ],
    materials: [],
    lights: []
};

// Connected clients tracking
const connectedClients = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`[Admin Connected] Socket ID: ${socket.id}`);
    connectedClients.set(socket.id, { connectedAt: new Date() });

    // Send initial asset registry to new client
    socket.emit('registry-update', assetRegistry);
    
    // Broadcast connection count
    io.emit('client-count', connectedClients.size);

    // Handle AI command from admin
    socket.on('ai-command', async (data) => {
        console.log(`[AI Command] From ${socket.id}: "${data.prompt}"`);
        
        try {
            // Log to client
            socket.emit('log', {
                type: 'info',
                message: `AI Processing: "${data.prompt}"`
            });

            // Process AI command (this is where you'd call OpenAI/Anthropic/Gemini)
            const babylonUpdate = await processAICommand(data.prompt);

            // Log success
            socket.emit('log', {
                type: 'success',
                message: `Success: ${babylonUpdate.description}`
            });

            // Broadcast scene update to all clients
            io.emit('scene-update', babylonUpdate);

        } catch (error) {
            console.error('[AI Command Error]', error);
            socket.emit('log', {
                type: 'error',
                message: `Error: ${error.message}`
            });
        }
    });

    // Handle manual scene updates
    socket.on('manual-update', (data) => {
        console.log(`[Manual Update] From ${socket.id}:`, data);
        io.emit('scene-update', data);
    });

    // Handle asset registry queries
    socket.on('get-registry', () => {
        socket.emit('registry-update', assetRegistry);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`[Admin Disconnected] Socket ID: ${socket.id}`);
        connectedClients.delete(socket.id);
        io.emit('client-count', connectedClients.size);
    });
});

/**
 * Process AI command and convert to Babylon.js update
 * This is a simplified version - integrate with your AI service
 */
async function processAICommand(prompt) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Parse simple commands (replace with actual AI integration)
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('scale') || lowerPrompt.includes('bigger') || lowerPrompt.includes('larger')) {
        return {
            action: 'UPDATE_MESH',
            target: 'Generic_Box_01',
            properties: {
                scaling: [2, 2, 2]
            },
            description: 'Scaled Generic_Box_01 to 2x size'
        };
    }

    if (lowerPrompt.includes('color') || lowerPrompt.includes('yellow') || lowerPrompt.includes('red')) {
        const color = lowerPrompt.includes('red') ? '#EF4444' : '#EAB308';
        return {
            action: 'UPDATE_MATERIAL',
            target: 'Generic_Box_01',
            properties: {
                materialColor: color
            },
            description: `Changed Generic_Box_01 color to ${color}`
        };
    }

    // Default response
    return {
        action: 'LOG',
        message: 'Command received but not recognized',
        description: 'No action taken'
    };
}

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        clients: connectedClients.size,
        uptime: process.uptime()
    });
});

app.get('/api/registry', (req, res) => {
    res.json(assetRegistry);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   GGE Warlords - Admin Lobby Server       ║
║   Port: ${PORT}                              ║
║   Status: Running                          ║
╚════════════════════════════════════════════╝
    `);
});

