/**
 * GGE Warlords - Babylon.js Admin Engine
 * 
 * Integrates Babylon.js with Socket.io for real-time scene updates
 * from the AI-powered admin lobby
 */

import * as BABYLON from '@babylonjs/core';
import { io } from 'socket.io-client';

export class BabylonAdminEngine {
    constructor(canvas, serverUrl = 'http://localhost:3000') {
        this.canvas = canvas;
        this.serverUrl = serverUrl;
        this.engine = null;
        this.scene = null;
        this.socket = null;
        this.meshRegistry = new Map();
        this.onLogCallback = null;
    }

    /**
     * Initialize Babylon.js engine and scene
     */
    async initialize() {
        // Create engine
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.02, 1);

        // Setup camera
        const camera = new BABYLON.ArcRotateCamera(
            'camera',
            -Math.PI / 2,
            Math.PI / 3,
            10,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        camera.attachControl(this.canvas, true);
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 20;

        // Setup lighting
        const light = new BABYLON.HemisphericLight(
            'light',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        light.intensity = 0.7;

        // Create initial meshes
        this.createInitialScene();

        // Start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        // Connect to Socket.io server
        this.connectToServer();

        this.log('Babylon.js engine initialized');
    }

    /**
     * Create initial scene with placeholder meshes
     */
    createInitialScene() {
        // Generic Box 01
        const box = BABYLON.MeshBuilder.CreateBox(
            'Generic_Box_01',
            { size: 2 },
            this.scene
        );
        box.position.y = 1;
        
        const boxMat = new BABYLON.StandardMaterial('boxMat', this.scene);
        boxMat.diffuseColor = new BABYLON.Color3(0.92, 0.7, 0.03); // Yellow
        box.material = boxMat;
        
        this.meshRegistry.set('Generic_Box_01', box);

        // Player Capsule
        const capsule = BABYLON.MeshBuilder.CreateCapsule(
            'Player_Capsule',
            { radius: 0.5, height: 2 },
            this.scene
        );
        capsule.position.set(-3, 1, 0);
        
        const capsuleMat = new BABYLON.StandardMaterial('capsuleMat', this.scene);
        capsuleMat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.9); // Blue
        capsule.material = capsuleMat;
        
        this.meshRegistry.set('Player_Capsule', capsule);

        // Terrain Chunk (Ground)
        const ground = BABYLON.MeshBuilder.CreateGround(
            'Terrain_Chunk',
            { width: 10, height: 10 },
            this.scene
        );
        
        const groundMat = new BABYLON.StandardMaterial('groundMat', this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        ground.material = groundMat;
        
        this.meshRegistry.set('Terrain_Chunk', ground);

        this.log('Initial scene created with 3 meshes');
    }

    /**
     * Connect to Socket.io server
     */
    connectToServer() {
        this.socket = io(this.serverUrl);

        this.socket.on('connect', () => {
            this.log(`Connected to server: ${this.serverUrl}`);
        });

        this.socket.on('disconnect', () => {
            this.log('Disconnected from server');
        });

        this.socket.on('scene-update', (data) => {
            this.handleSceneUpdate(data);
        });

        this.socket.on('log', (data) => {
            this.log(data.message, data.type);
        });
    }

    /**
     * Handle scene updates from server
     */
    handleSceneUpdate(data) {
        console.log('[Scene Update]', data);

        switch (data.action) {
            case 'UPDATE_MESH':
                this.updateMesh(data.target, data.properties);
                break;
            
            case 'UPDATE_MATERIAL':
                this.updateMaterial(data.target, data.properties);
                break;
            
            case 'LOG':
                this.log(data.message);
                break;
            
            default:
                console.warn('Unknown action:', data.action);
        }
    }

    /**
     * Update mesh properties
     */
    updateMesh(meshName, properties) {
        const mesh = this.meshRegistry.get(meshName) || this.scene.getMeshByName(meshName);
        
        if (!mesh) {
            this.log(`Mesh not found: ${meshName}`, 'error');
            return;
        }

        if (properties.scaling) {
            mesh.scaling = new BABYLON.Vector3(...properties.scaling);
            this.log(`Updated ${meshName} scaling`);
        }

        if (properties.position) {
            mesh.position = new BABYLON.Vector3(...properties.position);
            this.log(`Updated ${meshName} position`);
        }

        if (properties.rotation) {
            mesh.rotation = new BABYLON.Vector3(...properties.rotation);
            this.log(`Updated ${meshName} rotation`);
        }
    }

    /**
     * Update material properties
     */
    updateMaterial(meshName, properties) {
        const mesh = this.meshRegistry.get(meshName) || this.scene.getMeshByName(meshName);
        
        if (!mesh || !mesh.material) {
            this.log(`Mesh or material not found: ${meshName}`, 'error');
            return;
        }

        if (properties.materialColor) {
            mesh.material.diffuseColor = BABYLON.Color3.FromHexString(properties.materialColor);
            this.log(`Updated ${meshName} color to ${properties.materialColor}`);
        }
    }

    /**
     * Send AI command to server
     */
    sendAICommand(prompt) {
        if (!this.socket || !this.socket.connected) {
            this.log('Not connected to server', 'error');
            return;
        }

        this.socket.emit('ai-command', { prompt });
    }

    /**
     * Log message (can be overridden with callback)
     */
    log(message, type = 'info') {
        console.log(`[Babylon] ${message}`);
        if (this.onLogCallback) {
            this.onLogCallback({ message, type, timestamp: new Date() });
        }
    }

    /**
     * Set log callback for UI updates
     */
    setLogCallback(callback) {
        this.onLogCallback = callback;
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.socket) {
            this.socket.disconnect();
        }
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

