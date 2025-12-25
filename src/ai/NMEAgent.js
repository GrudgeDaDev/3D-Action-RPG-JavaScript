/**
 * NME AI Agent - Text-to-Material Generator for Babylon.js Node Material Editor
 * 
 * This agent interprets natural language descriptions and generates
 * NodeMaterial configurations programmatically.
 * 
 * Usage:
 *   const agent = new NMEAgent(scene);
 *   const material = await agent.generateMaterial("shiny gold metal with scratches");
 *   mesh.material = material;
 */

// ==================== NME BLOCK DEFINITIONS ====================
export const NME_BLOCKS = {
    // INPUT BLOCKS
    inputs: {
        Float: { type: 'value', output: 'Float', desc: 'Single floating point number' },
        Vector2: { type: 'value', output: 'Vector2', desc: '2D vector (x,y)' },
        Vector3: { type: 'value', output: 'Vector3', desc: '3D vector (x,y,z)' },
        Vector4: { type: 'value', output: 'Vector4', desc: '4D vector (x,y,z,w)' },
        Color3: { type: 'value', output: 'Color3', desc: 'RGB color' },
        Color4: { type: 'value', output: 'Color4', desc: 'RGBA color with alpha' },
        Time: { type: 'system', output: 'Float', desc: 'Elapsed time since scene load' },
        DeltaTime: { type: 'system', output: 'Float', desc: 'Time since last frame' },
        Texture: { type: 'texture', inputs: ['uv'], outputs: ['rgba', 'rgb', 'r', 'g', 'b', 'a'], desc: 'Texture sampler' },
        ImageSource: { type: 'texture', output: 'Source', desc: 'Shared texture source' }
    },
    // MESH DATA BLOCKS
    mesh: {
        Position: { output: 'Vector3', desc: 'Vertex position in local space' },
        Normal: { output: 'Vector3', desc: 'Vertex normal vector' },
        Tangent: { output: 'Vector3', desc: 'Vertex tangent vector' },
        UV: { output: 'Vector2', desc: 'Texture coordinates' },
        Color: { output: 'Color4', desc: 'Vertex color' },
        WorldPosition: { inputs: ['vector', 'transform'], output: 'Vector4', desc: 'Position in world space' },
        WorldNormal: { inputs: ['vector', 'transform'], output: 'Vector4', desc: 'Normal in world space' }
    },
    // MATH BLOCKS
    math: {
        Add: { inputs: ['left', 'right'], output: 'same', desc: 'Add two values' },
        Subtract: { inputs: ['left', 'right'], output: 'same', desc: 'Subtract right from left' },
        Multiply: { inputs: ['left', 'right'], output: 'same', desc: 'Multiply two values' },
        Divide: { inputs: ['left', 'right'], output: 'same', desc: 'Divide left by right' },
        Sin: { inputs: ['input'], output: 'Float', desc: 'Sine function' },
        Cos: { inputs: ['input'], output: 'Float', desc: 'Cosine function' },
        Pow: { inputs: ['value', 'power'], output: 'Float', desc: 'Power function' },
        Sqrt: { inputs: ['input'], output: 'Float', desc: 'Square root' },
        Lerp: { inputs: ['left', 'right', 'gradient'], output: 'same', desc: 'Linear interpolation' },
        Clamp: { inputs: ['input', 'min', 'max'], output: 'same', desc: 'Clamp value between min and max' },
        Normalize: { inputs: ['input'], output: 'same', desc: 'Normalize vector to length 1' },
        Dot: { inputs: ['left', 'right'], output: 'Float', desc: 'Dot product of vectors' },
        Cross: { inputs: ['left', 'right'], output: 'Vector3', desc: 'Cross product' },
        Fresnel: { inputs: ['worldNormal', 'viewDirection', 'bias', 'power'], output: 'Float', desc: 'Fresnel effect' }
    },
    // NOISE BLOCKS
    noise: {
        SimplexPerlin3D: { inputs: ['seed'], output: 'Float', desc: 'Smooth gradient noise' },
        VoronoiNoise: { inputs: ['seed', 'offset', 'density'], outputs: ['output', 'cells'], desc: 'Cell-like pattern' },
        WorleyNoise3D: { inputs: ['seed', 'jitter'], outputs: ['F1', 'F2'], desc: 'Cellular noise' },
        RandomNumber: { inputs: ['seed'], output: 'Float', desc: 'Random value from seed' }
    },
    // COLOR BLOCKS
    color: {
        Desaturate: { inputs: ['color', 'level'], output: 'Color3', desc: 'Convert to grayscale' },
        Gradient: { inputs: ['value'], output: 'Color3', desc: 'Color gradient lookup' },
        Posterize: { inputs: ['value', 'steps'], output: 'same', desc: 'Reduce color levels' },
        ReplaceColor: { inputs: ['value', 'reference', 'distance', 'replacement'], output: 'same', desc: 'Replace color within distance' }
    },
    // OUTPUT BLOCKS
    output: {
        VertexOutput: { inputs: ['vector'], desc: 'Final vertex position (gl_Position)' },
        FragmentOutput: { inputs: ['rgba', 'rgb', 'a'], desc: 'Final pixel color output' }
    },
    // PBR BLOCKS
    pbr: {
        PBRMetallicRoughness: {
            inputs: ['worldPosition', 'worldNormal', 'baseColor', 'metallic', 'roughness', 'ambientOcc', 'reflection'],
            outputs: ['lighting', 'diffuseDir', 'specularDir', 'shadow', 'alpha'],
            desc: 'Full PBR metallic-roughness material'
        },
        Reflection: { inputs: ['position', 'world', 'color'], output: 'reflection', desc: 'Environment reflection' },
        ClearCoat: { inputs: ['intensity', 'roughness', 'indexOfRefraction'], output: 'clearcoat', desc: 'Clear coat layer' },
        Sheen: { inputs: ['intensity', 'color', 'roughness'], output: 'sheen', desc: 'Fabric-like sheen' }
    },
    // TRANSFORM BLOCKS
    transform: {
        Transform: { inputs: ['vector', 'transform'], output: 'Vector4', desc: 'Transform by matrix' },
        Rotate2D: { inputs: ['input', 'angle'], output: 'Vector2', desc: 'Rotate UV coordinates' },
        Scale: { inputs: ['input', 'factor'], output: 'same', desc: 'Scale by factor' }
    },
    // MATRIX BLOCKS
    matrices: {
        WorldMatrix: { output: 'Matrix', desc: 'World transformation matrix' },
        ViewMatrix: { output: 'Matrix', desc: 'Camera view matrix' },
        ProjectionMatrix: { output: 'Matrix', desc: 'Projection matrix' },
        ViewProjectionMatrix: { output: 'Matrix', desc: 'Combined view-projection' },
        WorldViewProjectionMatrix: { output: 'Matrix', desc: 'Full MVP matrix' }
    }
};

// ==================== MATERIAL TEMPLATES ====================
export const MATERIAL_TEMPLATES = {
    // Basic Materials
    basic: { desc: 'Simple colored material', complexity: 1 },
    textured: { desc: 'Material with diffuse texture', complexity: 2 },

    // PBR Materials
    pbr_metal: { desc: 'PBR metallic material (gold, silver, chrome)', complexity: 3 },
    pbr_rough: { desc: 'PBR rough material (stone, concrete, wood)', complexity: 3 },

    // Special Effects
    emissive: { desc: 'Self-illuminating/glowing material', complexity: 2 },
    transparent: { desc: 'Glass-like transparent material', complexity: 3 },
    animated: { desc: 'Time-based animated material', complexity: 4 },
    procedural: { desc: 'Noise-based procedural patterns', complexity: 4 },

    // Stylized
    toon: { desc: 'Cel-shaded cartoon style', complexity: 3 },
    hologram: { desc: 'Sci-fi holographic effect', complexity: 4 },

    // Natural Elements
    water: { desc: 'Animated water surface', complexity: 5 },
    lava: { desc: 'Animated lava/magma', complexity: 5 },
    ice: { desc: 'Frozen ice with subsurface scattering', complexity: 4 },
    fire: { desc: 'Animated fire/flame effect', complexity: 5 },

    // Special Effects
    force_field: { desc: 'Energy shield effect', complexity: 4 },
    dissolve: { desc: 'Dissolving/disintegrating effect', complexity: 4 },
    portal: { desc: 'Swirling portal/vortex effect', complexity: 5 },
    electricity: { desc: 'Electric/lightning effect', complexity: 5 },

    // Natural Surfaces
    marble: { desc: 'Veined marble stone', complexity: 4 },
    wood_grain: { desc: 'Natural wood grain pattern', complexity: 4 },
    fabric: { desc: 'Cloth/fabric with sheen', complexity: 3 },
    sand: { desc: 'Sandy/desert surface', complexity: 3 },
    grass: { desc: 'Grassy surface with variation', complexity: 4 },

    // Fantasy/Magic
    magic_aura: { desc: 'Magical glowing aura', complexity: 4 },
    crystal: { desc: 'Crystalline/gem material', complexity: 4 },
    void: { desc: 'Dark matter/void effect', complexity: 5 }
};

export class NMEAgent {
    constructor(scene) {
        this.scene = scene;
        this.snippetCache = new Map();
    }

    // Parse natural language into material parameters
    parseDescription(description) {
        const lowerDesc = description.toLowerCase();
        const params = {
            type: 'basic',
            baseColor: new BABYLON.Color3(0.5, 0.5, 0.5),
            metallic: 0,
            roughness: 0.5,
            emissive: null,
            animated: false,
            transparent: false,
            effects: []
        };

        // Detect material type - ordered by specificity
        // Metals
        if (lowerDesc.includes('metal') || lowerDesc.includes('gold') || lowerDesc.includes('silver') || lowerDesc.includes('chrome') || lowerDesc.includes('steel') || lowerDesc.includes('iron') || lowerDesc.includes('bronze') || lowerDesc.includes('copper')) {
            params.type = 'pbr_metal';
            params.metallic = 1.0;
            params.roughness = 0.2;
        }
        // Natural stones
        else if (lowerDesc.includes('marble')) {
            params.type = 'marble';
            params.roughness = 0.3;
        }
        else if (lowerDesc.includes('stone') || lowerDesc.includes('concrete') || lowerDesc.includes('rock')) {
            params.type = 'pbr_rough';
            params.roughness = 0.9;
        }
        // Wood
        else if (lowerDesc.includes('wood') || lowerDesc.includes('timber') || lowerDesc.includes('oak') || lowerDesc.includes('pine')) {
            params.type = 'wood_grain';
            params.roughness = 0.7;
        }
        // Natural surfaces
        else if (lowerDesc.includes('grass') || lowerDesc.includes('lawn') || lowerDesc.includes('meadow')) {
            params.type = 'grass';
            params.roughness = 0.8;
        }
        else if (lowerDesc.includes('sand') || lowerDesc.includes('desert') || lowerDesc.includes('beach')) {
            params.type = 'sand';
            params.roughness = 0.95;
        }
        else if (lowerDesc.includes('fabric') || lowerDesc.includes('cloth') || lowerDesc.includes('silk') || lowerDesc.includes('velvet')) {
            params.type = 'fabric';
            params.roughness = 0.6;
        }
        // Transparent/Crystals
        else if (lowerDesc.includes('crystal') || lowerDesc.includes('gem') || lowerDesc.includes('diamond') || lowerDesc.includes('ruby') || lowerDesc.includes('emerald')) {
            params.type = 'crystal';
            params.transparent = true;
        }
        else if (lowerDesc.includes('glass') || lowerDesc.includes('transparent') || lowerDesc.includes('clear')) {
            params.type = 'transparent';
            params.transparent = true;
        }
        else if (lowerDesc.includes('ice') || lowerDesc.includes('frozen') || lowerDesc.includes('frost')) {
            params.type = 'ice';
            params.transparent = true;
        }
        // Emissive/Glowing
        else if (lowerDesc.includes('glow') || lowerDesc.includes('emissive') || lowerDesc.includes('neon')) {
            params.type = 'emissive';
        }
        else if (lowerDesc.includes('magic') || lowerDesc.includes('aura') || lowerDesc.includes('enchant')) {
            params.type = 'magic_aura';
            params.animated = true;
        }
        // Elements
        else if (lowerDesc.includes('fire') || lowerDesc.includes('flame') || lowerDesc.includes('burn')) {
            params.type = 'fire';
            params.animated = true;
        }
        else if (lowerDesc.includes('water') || lowerDesc.includes('ocean') || lowerDesc.includes('liquid') || lowerDesc.includes('sea')) {
            params.type = 'water';
            params.animated = true;
        }
        else if (lowerDesc.includes('lava') || lowerDesc.includes('magma') || lowerDesc.includes('molten')) {
            params.type = 'lava';
            params.animated = true;
        }
        else if (lowerDesc.includes('electric') || lowerDesc.includes('lightning') || lowerDesc.includes('spark')) {
            params.type = 'electricity';
            params.animated = true;
        }
        // Sci-fi/Fantasy
        else if (lowerDesc.includes('hologram') || lowerDesc.includes('holographic') || lowerDesc.includes('sci-fi')) {
            params.type = 'hologram';
            params.animated = true;
        }
        else if (lowerDesc.includes('portal') || lowerDesc.includes('vortex') || lowerDesc.includes('warp')) {
            params.type = 'portal';
            params.animated = true;
        }
        else if (lowerDesc.includes('void') || lowerDesc.includes('dark matter') || lowerDesc.includes('shadow')) {
            params.type = 'void';
            params.animated = true;
        }
        // Stylized
        else if (lowerDesc.includes('toon') || lowerDesc.includes('cartoon') || lowerDesc.includes('cel')) {
            params.type = 'toon';
        }
        // Effects
        else if (lowerDesc.includes('force field') || lowerDesc.includes('shield') || lowerDesc.includes('barrier')) {
            params.type = 'force_field';
            params.animated = true;
        }
        else if (lowerDesc.includes('energy') || lowerDesc.includes('plasma')) {
            params.type = 'force_field';
            params.animated = true;
        }
        else if (lowerDesc.includes('dissolve') || lowerDesc.includes('disintegrat')) {
            params.type = 'dissolve';
        }

        // Detect colors
        const colorMap = {
            'red': new BABYLON.Color3(1, 0.1, 0.1),
            'green': new BABYLON.Color3(0.1, 1, 0.1),
            'blue': new BABYLON.Color3(0.1, 0.3, 1),
            'yellow': new BABYLON.Color3(1, 1, 0.1),
            'orange': new BABYLON.Color3(1, 0.5, 0.1),
            'purple': new BABYLON.Color3(0.6, 0.1, 1),
            'pink': new BABYLON.Color3(1, 0.4, 0.7),
            'cyan': new BABYLON.Color3(0.1, 1, 1),
            'white': new BABYLON.Color3(1, 1, 1),
            'black': new BABYLON.Color3(0.05, 0.05, 0.05),
            'gold': new BABYLON.Color3(1, 0.84, 0),
            'silver': new BABYLON.Color3(0.75, 0.75, 0.75),
            'bronze': new BABYLON.Color3(0.8, 0.5, 0.2),
            'copper': new BABYLON.Color3(0.72, 0.45, 0.2)
        };

        for (const [colorName, colorValue] of Object.entries(colorMap)) {
            if (lowerDesc.includes(colorName)) {
                params.baseColor = colorValue;
                break;
            }
        }

        // Detect surface properties
        if (lowerDesc.includes('shiny') || lowerDesc.includes('polished') || lowerDesc.includes('glossy')) {
            params.roughness = Math.max(0.05, params.roughness - 0.4);
        }
        if (lowerDesc.includes('rough') || lowerDesc.includes('matte') || lowerDesc.includes('worn')) {
            params.roughness = Math.min(1.0, params.roughness + 0.3);
        }
        if (lowerDesc.includes('scratched') || lowerDesc.includes('damaged')) {
            params.effects.push('scratches');
        }
        if (lowerDesc.includes('animated') || lowerDesc.includes('moving') || lowerDesc.includes('flowing')) {
            params.animated = true;
        }

        return params;
    }

    // Generate a NodeMaterial from parsed parameters
    async generateMaterial(description, name = 'GeneratedMaterial') {
        const params = this.parseDescription(description);
        const nodeMaterial = new BABYLON.NodeMaterial(name, this.scene);

        switch (params.type) {
            case 'pbr_metal':
            case 'pbr_rough':
                this._buildPBRMaterial(nodeMaterial, params);
                break;
            case 'emissive':
                this._buildEmissiveMaterial(nodeMaterial, params);
                break;
            case 'transparent':
                this._buildTransparentMaterial(nodeMaterial, params);
                break;
            case 'hologram':
                this._buildHologramMaterial(nodeMaterial, params);
                break;
            case 'toon':
                this._buildToonMaterial(nodeMaterial, params);
                break;
            case 'water':
                this._buildWaterMaterial(nodeMaterial, params);
                break;
            case 'lava':
                this._buildLavaMaterial(nodeMaterial, params);
                break;
            case 'force_field':
                this._buildForceFieldMaterial(nodeMaterial, params);
                break;
            case 'dissolve':
                this._buildDissolveMaterial(nodeMaterial, params);
                break;
            // New material types
            case 'ice':
                this._buildIceMaterial(nodeMaterial, params);
                break;
            case 'fire':
                this._buildFireMaterial(nodeMaterial, params);
                break;
            case 'marble':
                this._buildMarbleMaterial(nodeMaterial, params);
                break;
            case 'wood_grain':
                this._buildWoodMaterial(nodeMaterial, params);
                break;
            case 'fabric':
                this._buildFabricMaterial(nodeMaterial, params);
                break;
            case 'sand':
                this._buildSandMaterial(nodeMaterial, params);
                break;
            case 'grass':
                this._buildGrassMaterial(nodeMaterial, params);
                break;
            case 'crystal':
                this._buildCrystalMaterial(nodeMaterial, params);
                break;
            case 'magic_aura':
                this._buildMagicAuraMaterial(nodeMaterial, params);
                break;
            case 'portal':
                this._buildPortalMaterial(nodeMaterial, params);
                break;
            case 'electricity':
                this._buildElectricityMaterial(nodeMaterial, params);
                break;
            case 'void':
                this._buildVoidMaterial(nodeMaterial, params);
                break;
            default:
                this._buildBasicMaterial(nodeMaterial, params);
        }

        nodeMaterial.build(true);
        return nodeMaterial;
    }

    // Build basic colored material
    _buildBasicMaterial(nodeMaterial, params) {
        // Vertex shader
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const worldPos = new BABYLON.TransformBlock('worldPos');
        position.connectTo(worldPos);

        const worldMatrix = new BABYLON.InputBlock('world');
        worldMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);
        worldMatrix.connectTo(worldPos, { input: 'transform' });

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Fragment shader
        const color = new BABYLON.InputBlock('baseColor');
        color.value = params.baseColor;

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        color.connectTo(fragOutput, { output: 'output', input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build PBR metallic-roughness material
    _buildPBRMaterial(nodeMaterial, params) {
        // Position
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        // Normal
        const normal = new BABYLON.InputBlock('normal');
        normal.setAsAttribute('normal');

        // World transforms
        const worldMatrix = new BABYLON.InputBlock('world');
        worldMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        // World position
        const worldPos = new BABYLON.TransformBlock('worldPos');
        position.connectTo(worldPos);
        worldMatrix.connectTo(worldPos, { input: 'transform' });

        // World normal
        const worldNormal = new BABYLON.TransformBlock('worldNormal');
        normal.connectTo(worldNormal);
        worldMatrix.connectTo(worldNormal, { input: 'transform' });

        // Vertex output
        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // PBR Block
        const pbrBlock = new BABYLON.PBRMetallicRoughnessBlock('pbr');
        worldPos.connectTo(pbrBlock, { output: 'output', input: 'worldPosition' });
        worldNormal.connectTo(pbrBlock, { output: 'xyz', input: 'worldNormal' });

        // Base color
        const baseColor = new BABYLON.InputBlock('baseColor');
        baseColor.value = params.baseColor;
        baseColor.connectTo(pbrBlock, { input: 'baseColor' });

        // Metallic
        const metallic = new BABYLON.InputBlock('metallic');
        metallic.value = params.metallic;
        metallic.connectTo(pbrBlock, { input: 'metallic' });

        // Roughness
        const roughness = new BABYLON.InputBlock('roughness');
        roughness.value = params.roughness;
        roughness.connectTo(pbrBlock, { input: 'roughness' });

        // Fragment output
        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        pbrBlock.connectTo(fragOutput, { output: 'lighting', input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build emissive/glowing material
    _buildEmissiveMaterial(nodeMaterial, params) {
        this._buildBasicMaterial(nodeMaterial, params);
        // Emissive materials use the base color as emission
        // The basic material already outputs the color
    }

    // Build transparent/glass material
    _buildTransparentMaterial(nodeMaterial, params) {
        // Similar to PBR but with alpha
        this._buildPBRMaterial(nodeMaterial, params);
        nodeMaterial.alpha = 0.5;
        nodeMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
    }

    // Build holographic material with animated scanlines
    _buildHologramMaterial(nodeMaterial, params) {
        // Position
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Time for animation
        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);

        // UV for scanlines
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');

        // Create scanline effect using sin
        const multiply = new BABYLON.MultiplyBlock('multiply');
        uv.connectTo(multiply, { output: 'y' });

        const scanlineFreq = new BABYLON.InputBlock('scanlineFreq');
        scanlineFreq.value = 50;
        scanlineFreq.connectTo(multiply, { input: 'right' });

        const addTime = new BABYLON.AddBlock('addTime');
        multiply.connectTo(addTime);
        time.connectTo(addTime, { input: 'right' });

        const sin = new BABYLON.TrigonometryBlock('sin');
        sin.operation = BABYLON.TrigonometryBlockOperations.Sin;
        addTime.connectTo(sin);

        // Base hologram color (cyan by default)
        const baseColor = new BABYLON.InputBlock('baseColor');
        baseColor.value = params.baseColor.r === 0.5 ? new BABYLON.Color3(0.1, 0.8, 1) : params.baseColor;

        // Modulate color with scanlines
        const colorMod = new BABYLON.MultiplyBlock('colorMod');
        baseColor.connectTo(colorMod);
        sin.connectTo(colorMod, { input: 'right' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        colorMod.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alpha = 0.7;
    }

    // Build toon/cel-shaded material
    _buildToonMaterial(nodeMaterial, params) {
        // Position
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const normal = new BABYLON.InputBlock('normal');
        normal.setAsAttribute('normal');

        const worldMatrix = new BABYLON.InputBlock('world');
        worldMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // World normal for lighting
        const worldNormal = new BABYLON.TransformBlock('worldNormal');
        normal.connectTo(worldNormal);
        worldMatrix.connectTo(worldNormal, { input: 'transform' });

        // Simple directional light
        const lightDir = new BABYLON.InputBlock('lightDir');
        lightDir.value = new BABYLON.Vector3(0.5, 1, 0.5);

        // Dot product for basic lighting
        const dot = new BABYLON.DotBlock('dot');
        worldNormal.connectTo(dot, { output: 'xyz' });
        lightDir.connectTo(dot, { input: 'right' });

        // Posterize for toon effect (step lighting)
        const posterize = new BABYLON.PosterizeBlock('posterize');
        dot.connectTo(posterize);

        const steps = new BABYLON.InputBlock('steps');
        steps.value = 4;
        steps.connectTo(posterize, { input: 'steps' });

        // Apply to base color
        const baseColor = new BABYLON.InputBlock('baseColor');
        baseColor.value = params.baseColor;

        const finalColor = new BABYLON.MultiplyBlock('finalColor');
        baseColor.connectTo(finalColor);
        posterize.connectTo(finalColor, { input: 'right' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        finalColor.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build animated water material
    _buildWaterMaterial(nodeMaterial, params) {
        // Position with wave displacement
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        // Wave displacement
        const waveFreq = new BABYLON.InputBlock('waveFreq');
        waveFreq.value = 2.0;

        const waveAmp = new BABYLON.InputBlock('waveAmp');
        waveAmp.value = 0.1;

        // Get X position for wave
        const posX = new BABYLON.VectorSplitterBlock('posX');
        position.connectTo(posX);

        // Wave calculation: sin(x * freq + time) * amp
        const mulFreq = new BABYLON.MultiplyBlock('mulFreq');
        posX.connectTo(mulFreq, { output: 'x' });
        waveFreq.connectTo(mulFreq, { input: 'right' });

        const addTime = new BABYLON.AddBlock('addTime');
        mulFreq.connectTo(addTime);
        time.connectTo(addTime, { input: 'right' });

        const sin = new BABYLON.TrigonometryBlock('sin');
        sin.operation = BABYLON.TrigonometryBlockOperations.Sin;
        addTime.connectTo(sin);

        const mulAmp = new BABYLON.MultiplyBlock('mulAmp');
        sin.connectTo(mulAmp);
        waveAmp.connectTo(mulAmp, { input: 'right' });

        // Add wave to Y position
        const waveOffset = new BABYLON.VectorMergerBlock('waveOffset');
        const zero = new BABYLON.InputBlock('zero');
        zero.value = 0;
        zero.connectTo(waveOffset, { input: 'x' });
        mulAmp.connectTo(waveOffset, { input: 'y' });
        zero.connectTo(waveOffset, { input: 'z' });

        const displacedPos = new BABYLON.AddBlock('displacedPos');
        position.connectTo(displacedPos);
        waveOffset.connectTo(displacedPos, { input: 'right' });

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        displacedPos.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Water color
        const baseColor = new BABYLON.InputBlock('baseColor');
        baseColor.value = new BABYLON.Color3(0.1, 0.4, 0.8);

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        baseColor.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alpha = 0.8;
    }

    // Build animated lava material
    _buildLavaMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');

        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Animated UV for flowing effect
        const timeScale = new BABYLON.InputBlock('timeScale');
        timeScale.value = 0.1;

        const scaledTime = new BABYLON.MultiplyBlock('scaledTime');
        time.connectTo(scaledTime);
        timeScale.connectTo(scaledTime, { input: 'right' });

        // Noise for lava pattern
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');

        // Create 3D seed from UV + time
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        uv.connectTo(uvMerge, { output: 'x', input: 'x' });
        uv.connectTo(uvMerge, { output: 'y', input: 'y' });
        scaledTime.connectTo(uvMerge, { input: 'z' });

        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Lava colors: dark red to bright orange/yellow
        const darkColor = new BABYLON.InputBlock('darkColor');
        darkColor.value = new BABYLON.Color3(0.3, 0.05, 0);

        const brightColor = new BABYLON.InputBlock('brightColor');
        brightColor.value = new BABYLON.Color3(1, 0.5, 0);

        // Lerp between colors based on noise
        const lerp = new BABYLON.LerpBlock('lerp');
        darkColor.connectTo(lerp, { input: 'left' });
        brightColor.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build force field/energy shield material
    _buildForceFieldMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const normal = new BABYLON.InputBlock('normal');
        normal.setAsAttribute('normal');

        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');

        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);

        const worldMatrix = new BABYLON.InputBlock('world');
        worldMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const cameraPos = new BABYLON.InputBlock('cameraPos');
        cameraPos.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // World position and normal
        const worldPos = new BABYLON.TransformBlock('worldPos');
        position.connectTo(worldPos);
        worldMatrix.connectTo(worldPos, { input: 'transform' });

        const worldNormal = new BABYLON.TransformBlock('worldNormal');
        normal.connectTo(worldNormal);
        worldMatrix.connectTo(worldNormal, { input: 'transform' });

        // Fresnel effect for edge glow
        const fresnel = new BABYLON.FresnelBlock('fresnel');
        worldNormal.connectTo(fresnel, { output: 'xyz', input: 'worldNormal' });

        // View direction
        const viewDir = new BABYLON.SubtractBlock('viewDir');
        cameraPos.connectTo(viewDir);
        worldPos.connectTo(viewDir, { output: 'xyz', input: 'right' });

        const normalizeView = new BABYLON.NormalizeBlock('normalizeView');
        viewDir.connectTo(normalizeView);
        normalizeView.connectTo(fresnel, { input: 'viewDirection' });

        // Fresnel parameters
        const fresnelBias = new BABYLON.InputBlock('fresnelBias');
        fresnelBias.value = 0.1;
        fresnelBias.connectTo(fresnel, { input: 'bias' });

        const fresnelPower = new BABYLON.InputBlock('fresnelPower');
        fresnelPower.value = 2.0;
        fresnelPower.connectTo(fresnel, { input: 'power' });

        // Shield color
        const shieldColor = new BABYLON.InputBlock('shieldColor');
        shieldColor.value = params.baseColor.r === 0.5 ? new BABYLON.Color3(0.2, 0.5, 1) : params.baseColor;

        // Animated hex pattern
        const hexFreq = new BABYLON.InputBlock('hexFreq');
        hexFreq.value = 10;

        const mulHex = new BABYLON.MultiplyBlock('mulHex');
        uv.connectTo(mulHex);
        hexFreq.connectTo(mulHex, { input: 'right' });

        const addTimeHex = new BABYLON.AddBlock('addTimeHex');
        mulHex.connectTo(addTimeHex, { output: 'x' });
        time.connectTo(addTimeHex, { input: 'right' });

        const sinHex = new BABYLON.TrigonometryBlock('sinHex');
        sinHex.operation = BABYLON.TrigonometryBlockOperations.Sin;
        addTimeHex.connectTo(sinHex);

        // Combine fresnel with pattern
        const combine = new BABYLON.MultiplyBlock('combine');
        fresnel.connectTo(combine);
        sinHex.connectTo(combine, { input: 'right' });

        // Final color
        const finalColor = new BABYLON.MultiplyBlock('finalColor');
        shieldColor.connectTo(finalColor);
        combine.connectTo(finalColor, { input: 'right' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        finalColor.connectTo(fragOutput, { input: 'rgb' });
        fresnel.connectTo(fragOutput, { input: 'a' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alpha = 0.6;
        nodeMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    }

    // Build dissolve effect material
    _buildDissolveMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');

        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');

        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Noise for dissolve pattern
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');

        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        uv.connectTo(uvMerge, { output: 'x', input: 'x' });
        uv.connectTo(uvMerge, { output: 'y', input: 'y' });

        const zVal = new BABYLON.InputBlock('zVal');
        zVal.value = 0;
        zVal.connectTo(uvMerge, { input: 'z' });

        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Dissolve threshold (animate this externally)
        const threshold = new BABYLON.InputBlock('dissolveThreshold');
        threshold.value = 0.5;
        threshold.isConstant = false; // Allow external control

        // Compare noise to threshold
        const step = new BABYLON.StepBlock('step');
        threshold.connectTo(step, { input: 'edge' });
        noiseBlock.connectTo(step, { input: 'value' });

        // Base color
        const baseColor = new BABYLON.InputBlock('baseColor');
        baseColor.value = params.baseColor;

        // Edge glow color
        const edgeColor = new BABYLON.InputBlock('edgeColor');
        edgeColor.value = new BABYLON.Color3(1, 0.5, 0);

        // Edge detection
        const edgeWidth = new BABYLON.InputBlock('edgeWidth');
        edgeWidth.value = 0.05;

        const thresholdPlusEdge = new BABYLON.AddBlock('thresholdPlusEdge');
        threshold.connectTo(thresholdPlusEdge);
        edgeWidth.connectTo(thresholdPlusEdge, { input: 'right' });

        const stepEdge = new BABYLON.StepBlock('stepEdge');
        thresholdPlusEdge.connectTo(stepEdge, { input: 'edge' });
        noiseBlock.connectTo(stepEdge, { input: 'value' });

        const edgeMask = new BABYLON.SubtractBlock('edgeMask');
        stepEdge.connectTo(edgeMask);
        step.connectTo(edgeMask, { input: 'right' });

        // Lerp between base and edge color
        const finalColor = new BABYLON.LerpBlock('finalColor');
        baseColor.connectTo(finalColor, { input: 'left' });
        edgeColor.connectTo(finalColor, { input: 'right' });
        edgeMask.connectTo(finalColor, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        finalColor.connectTo(fragOutput, { input: 'rgb' });
        step.connectTo(fragOutput, { input: 'a' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
    }

    // ==================== NEW MATERIAL BUILDERS ====================

    // Build ice material with subsurface-like effect
    _buildIceMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const normal = new BABYLON.InputBlock('normal');
        normal.setAsAttribute('normal');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');

        const worldMatrix = new BABYLON.InputBlock('world');
        worldMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);
        const cameraPos = new BABYLON.InputBlock('cameraPos');
        cameraPos.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // World normal for fresnel
        const worldNormal = new BABYLON.TransformBlock('worldNormal');
        normal.connectTo(worldNormal);
        worldMatrix.connectTo(worldNormal, { input: 'transform' });

        const worldPos = new BABYLON.TransformBlock('worldPos');
        position.connectTo(worldPos);
        worldMatrix.connectTo(worldPos, { input: 'transform' });

        // Fresnel for icy rim
        const fresnel = new BABYLON.FresnelBlock('fresnel');
        worldNormal.connectTo(fresnel, { output: 'xyz', input: 'worldNormal' });

        const viewDir = new BABYLON.SubtractBlock('viewDir');
        cameraPos.connectTo(viewDir);
        worldPos.connectTo(viewDir, { output: 'xyz', input: 'right' });
        const normalizeView = new BABYLON.NormalizeBlock('normalizeView');
        viewDir.connectTo(normalizeView);
        normalizeView.connectTo(fresnel, { input: 'viewDirection' });

        // Ice colors
        const iceCore = new BABYLON.InputBlock('iceCore');
        iceCore.value = new BABYLON.Color3(0.7, 0.9, 1.0);
        const iceEdge = new BABYLON.InputBlock('iceEdge');
        iceEdge.value = new BABYLON.Color3(0.4, 0.7, 0.95);

        const lerp = new BABYLON.LerpBlock('lerp');
        iceCore.connectTo(lerp, { input: 'left' });
        iceEdge.connectTo(lerp, { input: 'right' });
        fresnel.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alpha = 0.85;
    }

    // Build animated fire material
    _buildFireMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Animated noise for fire
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        uv.connectTo(uvMerge, { output: 'x', input: 'x' });
        uv.connectTo(uvMerge, { output: 'y', input: 'y' });

        const timeScale = new BABYLON.MultiplyBlock('timeScale');
        time.connectTo(timeScale);
        const speed = new BABYLON.InputBlock('speed');
        speed.value = 2.0;
        speed.connectTo(timeScale, { input: 'right' });
        timeScale.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Fire gradient: dark red -> orange -> yellow -> white
        const fireColor1 = new BABYLON.InputBlock('fireColor1');
        fireColor1.value = new BABYLON.Color3(0.8, 0.2, 0);
        const fireColor2 = new BABYLON.InputBlock('fireColor2');
        fireColor2.value = new BABYLON.Color3(1, 0.6, 0);

        const lerp = new BABYLON.LerpBlock('lerp');
        fireColor1.connectTo(lerp, { input: 'left' });
        fireColor2.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build marble material with veins
    _buildMarbleMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Noise for veins
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        const uvScale = new BABYLON.MultiplyBlock('uvScale');
        uv.connectTo(uvScale);
        const scale = new BABYLON.InputBlock('scale');
        scale.value = 4.0;
        scale.connectTo(uvScale, { input: 'right' });
        uvScale.connectTo(uvMerge, { output: 'x', input: 'x' });
        uvScale.connectTo(uvMerge, { output: 'y', input: 'y' });
        const zVal = new BABYLON.InputBlock('zVal');
        zVal.value = 0;
        zVal.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Marble colors
        const marbleBase = new BABYLON.InputBlock('marbleBase');
        marbleBase.value = params.baseColor.r === 0.5 ? new BABYLON.Color3(0.95, 0.95, 0.92) : params.baseColor;
        const veinColor = new BABYLON.InputBlock('veinColor');
        veinColor.value = new BABYLON.Color3(0.3, 0.3, 0.35);

        const lerp = new BABYLON.LerpBlock('lerp');
        marbleBase.connectTo(lerp, { input: 'left' });
        veinColor.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build wood grain material
    _buildWoodMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Wood ring pattern using sin of distance
        const uvMul = new BABYLON.MultiplyBlock('uvMul');
        uv.connectTo(uvMul);
        const ringFreq = new BABYLON.InputBlock('ringFreq');
        ringFreq.value = 20.0;
        ringFreq.connectTo(uvMul, { input: 'right' });

        const sinBlock = new BABYLON.TrigonometryBlock('sin');
        sinBlock.operation = BABYLON.TrigonometryBlockOperations.Sin;
        uvMul.connectTo(sinBlock, { output: 'x' });

        // Wood colors
        const woodLight = new BABYLON.InputBlock('woodLight');
        woodLight.value = new BABYLON.Color3(0.76, 0.6, 0.42);
        const woodDark = new BABYLON.InputBlock('woodDark');
        woodDark.value = new BABYLON.Color3(0.55, 0.35, 0.2);

        const lerp = new BABYLON.LerpBlock('lerp');
        woodLight.connectTo(lerp, { input: 'left' });
        woodDark.connectTo(lerp, { input: 'right' });
        sinBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build fabric material with sheen
    _buildFabricMaterial(nodeMaterial, params) {
        this._buildPBRMaterial(nodeMaterial, {
            ...params,
            metallic: 0,
            roughness: 0.6
        });
    }

    // Build sand material
    _buildSandMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Noise for sand variation
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        const uvScale = new BABYLON.MultiplyBlock('uvScale');
        uv.connectTo(uvScale);
        const scale = new BABYLON.InputBlock('scale');
        scale.value = 10.0;
        scale.connectTo(uvScale, { input: 'right' });
        uvScale.connectTo(uvMerge, { output: 'x', input: 'x' });
        uvScale.connectTo(uvMerge, { output: 'y', input: 'y' });
        const zVal = new BABYLON.InputBlock('zVal');
        zVal.value = 0;
        zVal.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Sand colors
        const sandLight = new BABYLON.InputBlock('sandLight');
        sandLight.value = new BABYLON.Color3(0.96, 0.87, 0.7);
        const sandDark = new BABYLON.InputBlock('sandDark');
        sandDark.value = new BABYLON.Color3(0.85, 0.75, 0.55);

        const lerp = new BABYLON.LerpBlock('lerp');
        sandLight.connectTo(lerp, { input: 'left' });
        sandDark.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build grass material
    _buildGrassMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Noise for grass variation
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        uv.connectTo(uvMerge, { output: 'x', input: 'x' });
        uv.connectTo(uvMerge, { output: 'y', input: 'y' });
        const zVal = new BABYLON.InputBlock('zVal');
        zVal.value = 0;
        zVal.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Grass colors
        const grassLight = new BABYLON.InputBlock('grassLight');
        grassLight.value = new BABYLON.Color3(0.4, 0.7, 0.2);
        const grassDark = new BABYLON.InputBlock('grassDark');
        grassDark.value = new BABYLON.Color3(0.2, 0.5, 0.1);

        const lerp = new BABYLON.LerpBlock('lerp');
        grassLight.connectTo(lerp, { input: 'left' });
        grassDark.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // Build crystal/gem material
    _buildCrystalMaterial(nodeMaterial, params) {
        this._buildIceMaterial(nodeMaterial, {
            ...params,
            baseColor: params.baseColor.r === 0.5 ? new BABYLON.Color3(0.6, 0.2, 0.8) : params.baseColor
        });
        nodeMaterial.alpha = 0.7;
    }

    // Build magical aura material
    _buildMagicAuraMaterial(nodeMaterial, params) {
        this._buildForceFieldMaterial(nodeMaterial, {
            ...params,
            baseColor: params.baseColor.r === 0.5 ? new BABYLON.Color3(0.8, 0.4, 1.0) : params.baseColor
        });
    }

    // Build portal/vortex material
    _buildPortalMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Rotating UV for spiral effect
        const rotate = new BABYLON.Rotate2dBlock('rotate');
        uv.connectTo(rotate);
        time.connectTo(rotate, { input: 'angle' });

        // Noise with rotating UVs
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        rotate.connectTo(uvMerge, { output: 'x', input: 'x' });
        rotate.connectTo(uvMerge, { output: 'y', input: 'y' });
        time.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Portal colors
        const portalColor1 = new BABYLON.InputBlock('portalColor1');
        portalColor1.value = new BABYLON.Color3(0.1, 0.1, 0.3);
        const portalColor2 = new BABYLON.InputBlock('portalColor2');
        portalColor2.value = new BABYLON.Color3(0.5, 0.2, 0.8);

        const lerp = new BABYLON.LerpBlock('lerp');
        portalColor1.connectTo(lerp, { input: 'left' });
        portalColor2.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alpha = 0.9;
    }

    // Build electricity/lightning material
    _buildElectricityMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Fast-changing noise for electricity
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        uv.connectTo(uvMerge, { output: 'x', input: 'x' });
        uv.connectTo(uvMerge, { output: 'y', input: 'y' });

        const fastTime = new BABYLON.MultiplyBlock('fastTime');
        time.connectTo(fastTime);
        const speed = new BABYLON.InputBlock('speed');
        speed.value = 10.0;
        speed.connectTo(fastTime, { input: 'right' });
        fastTime.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Step for sharp lightning
        const stepBlock = new BABYLON.StepBlock('step');
        const threshold = new BABYLON.InputBlock('threshold');
        threshold.value = 0.7;
        threshold.connectTo(stepBlock, { input: 'edge' });
        noiseBlock.connectTo(stepBlock, { input: 'value' });

        // Electric blue color
        const electricColor = new BABYLON.InputBlock('electricColor');
        electricColor.value = new BABYLON.Color3(0.3, 0.7, 1.0);

        const colorMul = new BABYLON.MultiplyBlock('colorMul');
        electricColor.connectTo(colorMul);
        stepBlock.connectTo(colorMul, { input: 'right' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        colorMul.connectTo(fragOutput, { input: 'rgb' });
        stepBlock.connectTo(fragOutput, { input: 'a' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
        nodeMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    }

    // Build void/dark matter material
    _buildVoidMaterial(nodeMaterial, params) {
        const position = new BABYLON.InputBlock('position');
        position.setAsAttribute('position');
        const uv = new BABYLON.InputBlock('uv');
        uv.setAsAttribute('uv');
        const time = new BABYLON.InputBlock('time');
        time.setAsSystemValue(BABYLON.NodeMaterialSystemValues.Time);
        const wvpMatrix = new BABYLON.InputBlock('wvp');
        wvpMatrix.setAsSystemValue(BABYLON.NodeMaterialSystemValues.WorldViewProjection);

        const vertexOutput = new BABYLON.VertexOutputBlock('vertexOutput');
        const transform = new BABYLON.TransformBlock('transform');
        position.connectTo(transform);
        wvpMatrix.connectTo(transform, { input: 'transform' });
        transform.connectTo(vertexOutput);

        // Slow moving noise
        const noiseBlock = new BABYLON.SimplexPerlin3DBlock('noise');
        const uvMerge = new BABYLON.VectorMergerBlock('uvMerge');
        uv.connectTo(uvMerge, { output: 'x', input: 'x' });
        uv.connectTo(uvMerge, { output: 'y', input: 'y' });

        const slowTime = new BABYLON.MultiplyBlock('slowTime');
        time.connectTo(slowTime);
        const speed = new BABYLON.InputBlock('speed');
        speed.value = 0.2;
        speed.connectTo(slowTime, { input: 'right' });
        slowTime.connectTo(uvMerge, { input: 'z' });
        uvMerge.connectTo(noiseBlock, { input: 'seed' });

        // Very dark with subtle purple highlights
        const voidDark = new BABYLON.InputBlock('voidDark');
        voidDark.value = new BABYLON.Color3(0.02, 0.01, 0.05);
        const voidLight = new BABYLON.InputBlock('voidLight');
        voidLight.value = new BABYLON.Color3(0.15, 0.05, 0.2);

        const lerp = new BABYLON.LerpBlock('lerp');
        voidDark.connectTo(lerp, { input: 'left' });
        voidLight.connectTo(lerp, { input: 'right' });
        noiseBlock.connectTo(lerp, { input: 'gradient' });

        const fragOutput = new BABYLON.FragmentOutputBlock('fragOutput');
        lerp.connectTo(fragOutput, { input: 'rgb' });

        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragOutput);
    }

    // ==================== UTILITY METHODS ====================

    // Load a material from NME snippet server
    async loadFromSnippet(snippetId) {
        if (this.snippetCache.has(snippetId)) {
            return this.snippetCache.get(snippetId).clone();
        }

        const material = await BABYLON.NodeMaterial.ParseFromSnippetAsync(snippetId, this.scene);
        this.snippetCache.set(snippetId, material);
        return material;
    }

    // Export material to JSON for saving
    exportToJSON(nodeMaterial) {
        return nodeMaterial.serialize();
    }

    // Import material from JSON
    importFromJSON(json, name = 'ImportedMaterial') {
        const nodeMaterial = new BABYLON.NodeMaterial(name, this.scene);
        nodeMaterial.loadFromSerialization(json);
        nodeMaterial.build(true);
        return nodeMaterial;
    }

    // Get list of available material templates
    getTemplates() {
        return MATERIAL_TEMPLATES;
    }

    // Get list of available NME blocks
    getBlocks() {
        return NME_BLOCKS;
    }
}

