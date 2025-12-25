/**
 * NME Agent Demo - Shows how to use the AI material generator
 * 
 * This demo creates various materials from natural language descriptions
 * and applies them to test meshes.
 */

import { NMEAgent, MATERIAL_TEMPLATES, NME_BLOCKS } from './NMEAgent.js';

export class NMEAgentDemo {
    constructor(scene) {
        this.scene = scene;
        this.agent = new NMEAgent(scene);
        this.testMeshes = [];
    }

    async runDemo() {
        console.log('=== NME Agent Demo ===');
        console.log('Available material templates:', Object.keys(MATERIAL_TEMPLATES));
        console.log('Available block categories:', Object.keys(NME_BLOCKS));

        // Create test meshes in a grid
        const descriptions = [
            'shiny gold metal',
            'rough gray stone',
            'glowing blue neon',
            'transparent glass',
            'cyan hologram',
            'red toon cartoon',
            'blue water',
            'orange lava',
            'blue force field energy shield'
        ];

        const gridSize = 3;
        const spacing = 3;

        for (let i = 0; i < descriptions.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            const x = (col - 1) * spacing;
            const z = (row - 1) * spacing;

            // Create sphere for material preview
            const sphere = BABYLON.MeshBuilder.CreateSphere(
                `testSphere_${i}`,
                { diameter: 2, segments: 32 },
                this.scene
            );
            sphere.position = new BABYLON.Vector3(x, 1, z);

            // Generate material from description
            console.log(`Generating material: "${descriptions[i]}"`);
            try {
                const material = await this.agent.generateMaterial(
                    descriptions[i],
                    `material_${i}`
                );
                sphere.material = material;
                console.log(`  ✓ Applied to sphere at (${x}, 1, ${z})`);
            } catch (error) {
                console.error(`  ✗ Failed: ${error.message}`);
            }

            this.testMeshes.push(sphere);
        }

        // Create ground plane
        const ground = BABYLON.MeshBuilder.CreateGround(
            'demoGround',
            { width: 12, height: 12 },
            this.scene
        );
        ground.position.y = -0.5;

        console.log('=== Demo Complete ===');
        return this.testMeshes;
    }

    // Interactive material generation
    async generateFromPrompt(prompt, targetMesh) {
        console.log(`Generating material from: "${prompt}"`);
        const material = await this.agent.generateMaterial(prompt);
        if (targetMesh) {
            targetMesh.material = material;
        }
        return material;
    }

    // Clean up demo
    dispose() {
        for (const mesh of this.testMeshes) {
            if (mesh.material) {
                mesh.material.dispose();
            }
            mesh.dispose();
        }
        this.testMeshes = [];
    }
}

// Example usage in console or game code:
// const demo = new NMEAgentDemo(scene);
// await demo.runDemo();
// 
// Or generate a single material:
// const agent = new NMEAgent(scene);
// const material = await agent.generateMaterial("shiny chrome metal with scratches");
// myMesh.material = material;

