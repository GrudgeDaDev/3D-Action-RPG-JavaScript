/**
 * Asset Audit and Organization Tool
 * Scans all assets, identifies issues, and generates organization plan
 */

const fs = require('fs');
const path = require('path');

// Optimal file formats for each asset type
const OPTIMAL_FORMATS = {
    models: ['.glb', '.gltf'],
    textures: ['.png', '.jpg', '.webp'],
    audio: ['.mp3', '.ogg'],
    scripts: ['.js'],
    data: ['.json'],
    documents: ['.md']
};

// Suboptimal formats that should be converted
const CONVERT_MAP = {
    // 3D Models
    '.fbx': '.glb',
    '.obj': '.glb',
    '.dae': '.glb',
    '.blend': '.glb',
    '.3ds': '.glb',

    // Textures
    '.bmp': '.png',
    '.tga': '.png',
    '.tiff': '.png',

    // Audio
    '.wav': '.mp3',
    '.flac': '.ogg'
};

class AssetAuditor {
    constructor() {
        this.assets = [];
        this.issues = [];
        this.stats = {
            total: 0,
            byType: {},
            needsConversion: 0,
            misplaced: 0
        };
    }

    /**
     * Scan directory recursively
     */
    scanDirectory(dir, baseDir = dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                // Skip node_modules, .git, etc.
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    this.scanDirectory(fullPath, baseDir);
                }
            } else {
                this.processFile(fullPath, relativePath);
            }
        }
    }

    /**
     * Process individual file
     */
    processFile(fullPath, relativePath) {
        const ext = path.extname(fullPath).toLowerCase();
        const fileName = path.basename(fullPath);
        const fileSize = fs.statSync(fullPath).size;

        this.stats.total++;
        this.stats.byType[ext] = (this.stats.byType[ext] || 0) + 1;

        const asset = {
            path: relativePath,
            fullPath: fullPath,
            name: fileName,
            extension: ext,
            size: fileSize,
            sizeKB: Math.round(fileSize / 1024),
            category: this.categorizeFile(ext, relativePath),
            issues: []
        };

        // Check for conversion needs
        if (CONVERT_MAP[ext]) {
            asset.issues.push({
                type: 'needs_conversion',
                message: `Should be converted from ${ext} to ${CONVERT_MAP[ext]}`,
                targetFormat: CONVERT_MAP[ext]
            });
            this.stats.needsConversion++;
        }

        // Check for misplaced files
        const expectedLocation = this.getExpectedLocation(asset);
        if (expectedLocation && !relativePath.startsWith(expectedLocation)) {
            asset.issues.push({
                type: 'misplaced',
                message: `Should be in ${expectedLocation}`,
                targetLocation: expectedLocation
            });
            this.stats.misplaced++;
        }

        // Check for large files
        if (fileSize > 10 * 1024 * 1024) { // > 10MB
            asset.issues.push({
                type: 'large_file',
                message: `Large file (${Math.round(fileSize / 1024 / 1024)}MB) - consider optimization`
            });
        }

        this.assets.push(asset);

        if (asset.issues.length > 0) {
            this.issues.push(asset);
        }
    }

    /**
     * Categorize file by extension and path
     */
    categorizeFile(ext, relativePath) {
        if (['.glb', '.gltf', '.fbx', '.obj', '.dae', '.blend'].includes(ext)) return 'model';
        if (['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tga'].includes(ext)) return 'texture';
        if (['.mp3', '.ogg', '.wav', '.flac'].includes(ext)) return 'audio';
        if (ext === '.js') return 'script';
        if (ext === '.json') return 'data';
        if (['.md', '.txt', '.html'].includes(ext)) return 'document';
        if (ext === '.zip') return 'archive';
        return 'other';
    }

    /**
     * Get expected location for asset
     */
    getExpectedLocation(asset) {
        const category = asset.category;
        const name = asset.name.toLowerCase();

        if (category === 'model') {
            if (name.includes('character') || name.includes('human')) return 'assets/characters';
            if (name.includes('weapon')) return 'assets/characters/weapons';
            if (name.includes('armor')) return 'assets/characters/armor';
            if (name.includes('enemy') || name.includes('monster')) return 'assets/characters/enemy';
            if (name.includes('building') || name.includes('house')) return 'assets/env/buildings';
            if (name.includes('prop')) return 'assets/env/props';
            if (name.includes('boat') || name.includes('ship')) return 'assets/vehicles';
        }

        if (category === 'texture') {
            return 'assets/textures';
        }

        if (category === 'script') {
            return 'assets/util/scripts';
        }

        return null;
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const report = [];

        report.push('='.repeat(80));
        report.push('ASSET AUDIT REPORT');
        report.push('='.repeat(80));
        report.push('');

        // Summary
        report.push('SUMMARY:');
        report.push(`  Total Assets: ${this.stats.total}`);
        report.push(`  Issues Found: ${this.issues.length}`);
        report.push(`  Needs Conversion: ${this.stats.needsConversion}`);
        report.push(`  Misplaced Files: ${this.stats.misplaced}`);
        report.push('');

        // File types
        report.push('FILE TYPES:');
        const sortedTypes = Object.entries(this.stats.byType)
            .sort((a, b) => b[1] - a[1]);
        for (const [ext, count] of sortedTypes) {
            const needsConvert = CONVERT_MAP[ext] ? ' ⚠️ NEEDS CONVERSION' : '';
            report.push(`  ${ext.padEnd(10)} : ${count}${needsConvert}`);
        }
        report.push('');

        // Issues by category
        const issuesByType = {};
        for (const asset of this.issues) {
            for (const issue of asset.issues) {
                issuesByType[issue.type] = issuesByType[issue.type] || [];
                issuesByType[issue.type].push({ asset, issue });
            }
        }

        report.push('ISSUES BY TYPE:');
        for (const [type, items] of Object.entries(issuesByType)) {
            report.push(`\n  ${type.toUpperCase()} (${items.length}):`);
            for (const { asset, issue } of items.slice(0, 10)) {
                report.push(`    - ${asset.path}`);
                report.push(`      ${issue.message}`);
            }
            if (items.length > 10) {
                report.push(`    ... and ${items.length - 10} more`);
            }
        }

        report.push('');
        report.push('='.repeat(80));

        return report.join('\n');
    }

    /**
     * Generate organization plan
     */
    generateOrganizationPlan() {
        const plan = {
            createFolders: [],
            moveFiles: [],
            convertFiles: [],
            archiveFiles: []
        };

        for (const asset of this.issues) {
            for (const issue of asset.issues) {
                if (issue.type === 'needs_conversion') {
                    plan.convertFiles.push({
                        source: asset.fullPath,
                        target: asset.fullPath.replace(asset.extension, issue.targetFormat),
                        format: issue.targetFormat
                    });
                    plan.archiveFiles.push(asset.fullPath);
                }

                if (issue.type === 'misplaced') {
                    const targetPath = path.join(
                        path.dirname(asset.fullPath).split(path.sep)[0],
                        issue.targetLocation,
                        asset.name
                    );
                    plan.moveFiles.push({
                        source: asset.fullPath,
                        target: targetPath
                    });
                }
            }
        }

        return plan;
    }

    /**
     * Save report to file
     */
    saveReport(outputPath) {
        const report = this.generateReport();
        fs.writeFileSync(outputPath, report);
        console.log(`📄 Report saved to: ${outputPath}`);
    }

    /**
     * Save organization plan as JSON
     */
    savePlan(outputPath) {
        const plan = this.generateOrganizationPlan();
        fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));
        console.log(`📋 Organization plan saved to: ${outputPath}`);
    }
}

// Main execution
if (require.main === module) {
    console.log('🔍 Starting asset audit...\n');

    const auditor = new AssetAuditor();

    // Scan assets directory
    console.log('Scanning assets/...');
    auditor.scanDirectory('./assets');

    // Scan examples directory
    console.log('Scanning examples/...');
    auditor.scanDirectory('./examples');

    console.log('\n✅ Scan complete!\n');

    // Generate and display report
    console.log(auditor.generateReport());

    // Save outputs
    auditor.saveReport('./tools/asset-audit-report.txt');
    auditor.savePlan('./tools/asset-organization-plan.json');

    console.log('\n📊 Audit complete!');
    console.log('Next steps:');
    console.log('  1. Review asset-audit-report.txt');
    console.log('  2. Review asset-organization-plan.json');
    console.log('  3. Run asset-organizer.js to execute the plan');
}

module.exports = { AssetAuditor, OPTIMAL_FORMATS, CONVERT_MAP };
