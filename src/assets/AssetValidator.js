/**
 * Asset Validation System
 * Ensures all game assets have required components:
 * - UUID (unique identifier)
 * - 3D Model (.glb file)
 * - 2D Icon (.png file)
 * - Scripts (behavior/logic)
 * - Proper metadata (scale, rotation, etc.)
 */

import { v4 as uuidv4 } from 'uuid';

export class AssetValidator {
    constructor() {
        this.validationErrors = [];
        this.validationWarnings = [];
        this.validatedAssets = new Map();
    }

    /**
     * Validate a single asset
     * @param {Object} asset - Asset object to validate
     * @returns {Object} Validation result
     */
    validateAsset(asset) {
        const errors = [];
        const warnings = [];
        const assetId = asset.uuid || asset.id || 'unknown';

        console.log(`🔍 Validating asset: ${assetId}`);

        // 1. UUID Validation
        if (!asset.uuid) {
            errors.push(`Missing UUID for asset: ${asset.name || assetId}`);
        } else if (!this.isValidUUID(asset.uuid)) {
            errors.push(`Invalid UUID format: ${asset.uuid}`);
        } else if (this.validatedAssets.has(asset.uuid)) {
            errors.push(`Duplicate UUID detected: ${asset.uuid}`);
        }

        // 2. Name Validation
        if (!asset.name || asset.name.trim() === '') {
            errors.push(`Missing name for asset: ${assetId}`);
        }

        // 3. Category Validation
        const validCategories = ['weapon', 'armor', 'item', 'prop', 'npc', 'enemy', 'vehicle'];
        if (!asset.category || !validCategories.includes(asset.category)) {
            errors.push(`Invalid or missing category: ${asset.category}`);
        }

        // 4. 3D Model Validation
        if (!asset.model || !asset.model.path) {
            errors.push(`Missing 3D model path for asset: ${assetId}`);
        } else if (!asset.model.path.endsWith('.glb') && !asset.model.path.endsWith('.gltf')) {
            warnings.push(`Model should be .glb or .gltf format: ${asset.model.path}`);
        }

        // 5. 2D Icon Validation
        if (!asset.icon) {
            errors.push(`Missing 2D icon for asset: ${assetId}`);
        } else if (!asset.icon.endsWith('.png') && !asset.icon.endsWith('.jpg')) {
            warnings.push(`Icon should be .png or .jpg format: ${asset.icon}`);
        }

        // 6. Scripts Validation
        if (asset.scripts && Array.isArray(asset.scripts)) {
            asset.scripts.forEach(script => {
                if (!script.endsWith('.js')) {
                    warnings.push(`Script should be .js file: ${script}`);
                }
            });
        } else if (!asset.scripts) {
            warnings.push(`No scripts defined for asset: ${assetId}`);
        }

        // 7. Category-Specific Validation
        if (asset.category === 'weapon') {
            this.validateWeapon(asset, errors, warnings);
        } else if (asset.category === 'armor') {
            this.validateArmor(asset, errors, warnings);
        } else if (asset.category === 'item') {
            this.validateItem(asset, errors, warnings);
        }

        // Store validation result
        const result = {
            uuid: asset.uuid,
            name: asset.name,
            valid: errors.length === 0,
            errors,
            warnings
        };

        if (errors.length === 0) {
            this.validatedAssets.set(asset.uuid, asset);
        }

        this.validationErrors.push(...errors);
        this.validationWarnings.push(...warnings);

        return result;
    }

    /**
     * Validate weapon-specific requirements
     */
    validateWeapon(asset, errors, warnings) {
        if (!asset.weapon) {
            errors.push(`Missing weapon data for weapon asset: ${asset.uuid}`);
            return;
        }

        const w = asset.weapon;

        if (w.damage === undefined || w.damage === null) {
            errors.push(`Missing damage value for weapon: ${asset.uuid}`);
        }
        if (w.range === undefined || w.range === null) {
            warnings.push(`Missing range value for weapon: ${asset.uuid}`);
        }
        if (!w.holdBone) {
            errors.push(`Missing holdBone (attachment point) for weapon: ${asset.uuid}`);
        }
        if (!w.holdOffset) {
            warnings.push(`Missing holdOffset for weapon: ${asset.uuid}`);
        }
        if (!w.holdRotation) {
            warnings.push(`Missing holdRotation for weapon: ${asset.uuid}`);
        }
        if (!w.animations || !w.animations.attack) {
            warnings.push(`Missing attack animation for weapon: ${asset.uuid}`);
        }
    }

    /**
     * Validate armor-specific requirements
     */
    validateArmor(asset, errors, warnings) {
        if (!asset.armor) {
            errors.push(`Missing armor data for armor asset: ${asset.uuid}`);
            return;
        }

        const a = asset.armor;
        const validSlots = ['helmet', 'chest', 'gloves', 'legs', 'boots', 'shield'];

        if (!a.slot || !validSlots.includes(a.slot)) {
            errors.push(`Invalid armor slot: ${a.slot}`);
        }
        if (a.defense === undefined || a.defense === null) {
            errors.push(`Missing defense value for armor: ${asset.uuid}`);
        }
        if (!a.attachPoints || a.attachPoints.length === 0) {
            errors.push(`Missing attachPoints for armor: ${asset.uuid}`);
        }
    }

    /**
     * Validate item-specific requirements
     */
    validateItem(asset, errors, warnings) {
        if (!asset.item) {
            warnings.push(`Missing item data for item asset: ${asset.uuid}`);
            return;
        }

        const i = asset.item;

        if (i.stackable && (!i.maxStack || i.maxStack <= 0)) {
            warnings.push(`Stackable item missing maxStack: ${asset.uuid}`);
        }
    }

    /**
     * Check if UUID is valid v4 format
     */
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Generate a new UUID v4
     */
    generateUUID() {
        return uuidv4();
    }

    /**
     * Validate multiple assets
     * @param {Array} assets - Array of asset objects
     * @returns {Object} Validation summary
     */
    validateAssets(assets) {
        console.log(`🔍 Validating ${assets.length} assets...`);

        this.validationErrors = [];
        this.validationWarnings = [];
        this.validatedAssets.clear();

        const results = assets.map(asset => this.validateAsset(asset));

        const summary = {
            total: assets.length,
            valid: results.filter(r => r.valid).length,
            invalid: results.filter(r => !r.valid).length,
            totalErrors: this.validationErrors.length,
            totalWarnings: this.validationWarnings.length,
            results
        };

        console.log(`✅ Validation complete: ${summary.valid}/${summary.total} valid`);
        console.log(`⚠️ Errors: ${summary.totalErrors}, Warnings: ${summary.totalWarnings}`);

        return summary;
    }

    /**
     * Auto-fix common asset issues
     * @param {Object} asset - Asset to fix
     * @returns {Object} Fixed asset
     */
    autoFixAsset(asset) {
        const fixed = { ...asset };

        // Generate UUID if missing
        if (!fixed.uuid) {
            fixed.uuid = this.generateUUID();
            console.log(`🔧 Generated UUID for ${fixed.name}: ${fixed.uuid}`);
        }

        // Set default model scale if missing
        if (fixed.model && !fixed.model.scale) {
            fixed.model.scale = 1.0;
        }

        // Set default model rotation if missing
        if (fixed.model && !fixed.model.rotation) {
            fixed.model.rotation = [0, 0, 0];
        }

        // Initialize scripts array if missing
        if (!fixed.scripts) {
            fixed.scripts = [];
        }

        // Category-specific fixes
        if (fixed.category === 'weapon' && fixed.weapon) {
            if (!fixed.weapon.holdBone) {
                fixed.weapon.holdBone = 'RightHand';
                console.log(`🔧 Set default holdBone for ${fixed.name}`);
            }
            if (!fixed.weapon.holdOffset) {
                fixed.weapon.holdOffset = [0, 0, 0];
            }
            if (!fixed.weapon.holdRotation) {
                fixed.weapon.holdRotation = [0, 0, 0];
            }
        }

        if (fixed.category === 'armor' && fixed.armor) {
            if (!fixed.armor.attachPoints) {
                fixed.armor.attachPoints = [];
                console.log(`⚠️ Warning: No attachPoints for armor ${fixed.name}`);
            }
        }

        return fixed;
    }

    /**
     * Generate validation report
     * @returns {String} Formatted report
     */
    generateReport() {
        const report = [];
        report.push('='.repeat(60));
        report.push('ASSET VALIDATION REPORT');
        report.push('='.repeat(60));
        report.push('');
        report.push(`Total Assets Validated: ${this.validatedAssets.size}`);
        report.push(`Total Errors: ${this.validationErrors.length}`);
        report.push(`Total Warnings: ${this.validationWarnings.length}`);
        report.push('');

        if (this.validationErrors.length > 0) {
            report.push('ERRORS:');
            report.push('-'.repeat(60));
            this.validationErrors.forEach((error, i) => {
                report.push(`${i + 1}. ${error}`);
            });
            report.push('');
        }

        if (this.validationWarnings.length > 0) {
            report.push('WARNINGS:');
            report.push('-'.repeat(60));
            this.validationWarnings.forEach((warning, i) => {
                report.push(`${i + 1}. ${warning}`);
            });
            report.push('');
        }

        report.push('='.repeat(60));
        return report.join('\n');
    }

    /**
     * Export validation results to JSON
     * @returns {Object} Validation data
     */
    exportResults() {
        return {
            timestamp: new Date().toISOString(),
            summary: {
                totalAssets: this.validatedAssets.size,
                totalErrors: this.validationErrors.length,
                totalWarnings: this.validationWarnings.length
            },
            errors: this.validationErrors,
            warnings: this.validationWarnings,
            validatedAssets: Array.from(this.validatedAssets.values())
        };
    }
}

// Singleton instance
export const assetValidator = new AssetValidator();
