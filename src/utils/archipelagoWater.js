/**
 * Archipelago Water System - Large ocean water for island scene
 * Based on existing water.js but optimized for large open areas
 */

export function setupArchipelagoWater(scene, islands, engine, player, waterLevel, worldSize) {
    // Create main water plane
    const water = BABYLON.MeshBuilder.CreateGround("water", { 
        width: worldSize, 
        height: worldSize,
        subdivisions: 64 
    }, scene);
    water.position.y = waterLevel;
    
    // Underwater background
    const underwaterBg = BABYLON.MeshBuilder.CreateGround("underwaterBg", { 
        width: worldSize, 
        height: worldSize 
    }, scene);
    underwaterBg.position.y = waterLevel - 50;
    
    const underwaterMat = new BABYLON.StandardMaterial("underwaterMat", scene);
    underwaterMat.diffuseColor = new BABYLON.Color3(0.05, 0.1, 0.2);
    underwaterMat.specularColor = new BABYLON.Color3(0, 0, 0);
    underwaterBg.material = underwaterMat;
    
    // Setup fog for underwater feel
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 800;
    scene.fogEnd = 3000;
    scene.fogColor = new BABYLON.Color3(0.6, 0.75, 0.9);
    
    // Create water shader
    createWaterShader(scene, water, underwaterBg, engine, waterLevel, worldSize);
    
    // Add island meshes to depth render list
    if (islands) {
        const depthRenderer = scene.enableDepthRenderer(scene.activeCamera, false);
        islands.forEach(island => {
            island.meshes.forEach(mesh => {
                if (depthRenderer.getDepthMap().renderList) {
                    depthRenderer.getDepthMap().renderList.push(mesh);
                }
            });
        });
    }
    
    return water;
}

function createWaterShader(scene, water, underwater, engine, waterLevel, worldSize) {
    // Vertex shader with wave animation
    BABYLON.Effect.ShadersStore["oceanVertexShader"] = `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 worldViewProjection;
        uniform float time;
        varying vec3 vPosition;
        varying vec4 vClipSpace;
        varying vec2 vUV;
        
        void main(void) {
            float waveHeight = sin(position.x * 0.02 + time) * cos(position.z * 0.02 + time * 0.7) * 2.0;
            waveHeight += sin(position.x * 0.01 - time * 0.5) * 1.5;
            vec3 newPos = vec3(position.x, waveHeight, position.z);
            gl_Position = worldViewProjection * vec4(newPos, 1.0);
            vPosition = position;
            vClipSpace = gl_Position;
            vUV = uv;
        }
    `;
    
    // Fragment shader with ocean coloring
    BABYLON.Effect.ShadersStore["oceanFragmentShader"] = `
        precision highp float;
        varying vec3 vPosition;
        varying vec4 vClipSpace;
        varying vec2 vUV;
        uniform float time;
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        uniform vec3 foamColor;
        uniform vec3 fogColor;
        uniform float fogStart;
        uniform float fogEnd;
        
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main(void) {
            // Distance-based depth coloring
            float dist = length(vPosition.xz) / 2000.0;
            dist = clamp(dist, 0.0, 1.0);
            
            // Wave foam at peaks
            float waveIntensity = sin(vPosition.x * 0.02 + time) * cos(vPosition.z * 0.02 + time * 0.7);
            float foam = smoothstep(0.7, 1.0, waveIntensity) * 0.3;
            
            // Mix colors based on depth
            vec3 waterColor = mix(shallowColor, deepColor, dist);
            waterColor = mix(waterColor, foamColor, foam);
            
            // Add subtle noise for texture
            float n = noise(vUV * 100.0 + time * 0.1) * 0.05;
            waterColor += vec3(n);
            
            // Fog
            float fogDist = length(vClipSpace.xyz);
            float fogFactor = clamp((fogEnd - fogDist) / (fogEnd - fogStart), 0.0, 1.0);
            waterColor = mix(fogColor, waterColor, fogFactor);
            
            gl_FragColor = vec4(waterColor, 0.85);
        }
    `;
    
    // Create shader material
    const waterMat = new BABYLON.ShaderMaterial("oceanShader", scene, 
        { vertex: "ocean", fragment: "ocean" },
        {
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection", "time", "deepColor", "shallowColor", "foamColor", "fogColor", "fogStart", "fogEnd"]
        }
    );
    
    // Set uniforms
    waterMat.setFloat("time", 0);
    waterMat.setColor3("deepColor", new BABYLON.Color3(0.0, 0.1, 0.3));
    waterMat.setColor3("shallowColor", new BABYLON.Color3(0.1, 0.4, 0.5));
    waterMat.setColor3("foamColor", new BABYLON.Color3(0.9, 0.95, 1.0));
    waterMat.setColor3("fogColor", scene.fogColor);
    waterMat.setFloat("fogStart", scene.fogStart);
    waterMat.setFloat("fogEnd", scene.fogEnd);
    waterMat.backFaceCulling = false;
    waterMat.alpha = 0.85;
    
    // Animate water
    let time = 0;
    scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;
        waterMat.setFloat("time", time);
    });
    
    water.material = waterMat;
    
    return water;
}

