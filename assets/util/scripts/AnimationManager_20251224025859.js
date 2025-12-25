/**
 * Animation Manager
 * Manages animations for characters and enemies
 * Supports importing, assigning, and playing animations
 */

import { getAssetLibrary } from './AssetLibrary.js';

export class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.assetLibrary = getAssetLibrary();
        this.animationSets = new Map();
        this.activeAnimations = new Map();
    }

    /**
     * Register an animation set
     */
    registerAnimationSet(id, config) {
        const animSet = {
            id,
            name: config.name,
            source: config.source, // GLB file path
            animations: config.animations || [],
            dateAdded: new Date().toISOString()
        };
        
        this.animationSets.set(id, animSet);
        
        this.assetLibrary.register('animations', id, {
            name: config.name,
            path: config.source,
            type: 'animation',
            config: animSet
        });
        
        console.log(`🎬 Registered animation set: ${config.name}`);
        return animSet;
    }

    /**
     * Import animations from a GLB file
     */
    async importAnimations(scene, file) {
        const result = await this.assetLibrary.importFromFile(scene, file, 'animations');
        
        if (result && result.animationGroups.length > 0) {
            const animations = result.animationGroups.map(group => ({
                name: group.name,
                frameStart: group.from,
                frameEnd: group.to,
                loop: group.loopAnimation,
                speed: group.speedRatio
            }));
            
            const animSet = this.registerAnimationSet(result.id, {
                name: result.id,
                source: `imported/${file.name}`,
                animations
            });
            
            // Store animation groups for later use
            animSet.animationGroups = result.animationGroups;
            
            return {
                id: result.id,
                animations,
                animationGroups: result.animationGroups
            };
        }
        
        return null;
    }

    /**
     * Apply animations from one model to another (retargeting)
     */
    async applyAnimationsToModel(animationSetId, targetMesh, targetSkeleton) {
        const animSet = this.animationSets.get(animationSetId);
        if (!animSet || !animSet.animationGroups) {
            console.error(`Animation set not found: ${animationSetId}`);
            return null;
        }

        const appliedAnimations = {};
        
        for (const group of animSet.animationGroups) {
            // Clone animation group for target
            const clonedGroup = group.clone(`${group.name}_${targetMesh.name}`);
            
            // Retarget to new skeleton if provided
            if (targetSkeleton) {
                clonedGroup.targetedAnimations.forEach(targetedAnim => {
                    const boneName = targetedAnim.target.name;
                    const targetBone = targetSkeleton.bones.find(b => b.name === boneName);
                    if (targetBone) {
                        targetedAnim.target = targetBone;
                    }
                });
            }
            
            appliedAnimations[group.name] = clonedGroup;
        }
        
        return appliedAnimations;
    }

    /**
     * Play animation on a mesh
     */
    playAnimation(mesh, animationName, options = {}) {
        const meshId = mesh.uniqueId;
        const current = this.activeAnimations.get(meshId);
        
        // Stop current animation if different
        if (current && current.name !== animationName) {
            current.group.stop();
        }
        
        // Find animation group on mesh
        const groups = mesh.metadata?.animationGroups || this.scene.animationGroups;
        const group = groups.find(g => g.name.toLowerCase().includes(animationName.toLowerCase()));
        
        if (group) {
            group.start(
                options.loop !== false,
                options.speed || 1.0,
                options.from || group.from,
                options.to || group.to,
                options.onEnd
            );
            
            this.activeAnimations.set(meshId, {
                name: animationName,
                group,
                startTime: Date.now()
            });
            
            return group;
        }
        
        console.warn(`Animation not found: ${animationName}`);
        return null;
    }

    /**
     * Stop animation on a mesh
     */
    stopAnimation(mesh) {
        const meshId = mesh.uniqueId;
        const current = this.activeAnimations.get(meshId);
        
        if (current) {
            current.group.stop();
            this.activeAnimations.delete(meshId);
        }
    }

    /**
     * Blend between two animations
     */
    blendAnimations(mesh, fromAnim, toAnim, blendTime = 0.3) {
        // Get animation groups
        const groups = mesh.metadata?.animationGroups || this.scene.animationGroups;
        const fromGroup = groups.find(g => g.name.toLowerCase().includes(fromAnim.toLowerCase()));
        const toGroup = groups.find(g => g.name.toLowerCase().includes(toAnim.toLowerCase()));

