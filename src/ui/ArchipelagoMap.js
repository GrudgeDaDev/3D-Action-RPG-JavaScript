/**
 * Archipelago Map System - Minimap and Large Map UI
 * Minimap shows in corner, press M for full map
 */

export class ArchipelagoMap {
    constructor(scene, player, islands, boat, worldSize) {
        this.scene = scene;
        this.player = player;
        this.islands = islands;
        this.boat = boat;
        this.worldSize = worldSize;
        
        // Map state
        this.isLargeMapOpen = false;
        this.minimapSize = 180;
        this.largeMapSize = 600;
        
        // Create UI elements
        this.createMinimap();
        this.createLargeMap();
        this.setupKeyboard();
        
        // Update loop
        this.scene.registerBeforeRender(() => this.update());
        
        console.log('🗺️ Archipelago Map System initialized');
    }
    
    createMinimap() {
        // Minimap container (bottom-right corner)
        this.minimapContainer = document.createElement('div');
        this.minimapContainer.id = 'minimap';
        this.minimapContainer.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            width: ${this.minimapSize}px; height: ${this.minimapSize}px;
            background: rgba(0, 20, 40, 0.85);
            border: 3px solid #4a90d9; border-radius: 50%;
            overflow: hidden; z-index: 100;
            box-shadow: 0 0 20px rgba(74, 144, 217, 0.5);
        `;
        document.body.appendChild(this.minimapContainer);
        
        // Canvas for drawing
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCanvas.width = this.minimapSize;
        this.minimapCanvas.height = this.minimapSize;
        this.minimapCanvas.style.cssText = 'width: 100%; height: 100%;';
        this.minimapContainer.appendChild(this.minimapCanvas);
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Hint text
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: absolute; bottom: -25px; right: 0;
            color: #aaa; font-size: 11px; font-family: Arial;
        `;
        hint.textContent = 'Press M for map';
        this.minimapContainer.appendChild(hint);
    }
    
    createLargeMap() {
        // Large map overlay
        this.largeMapOverlay = document.createElement('div');
        this.largeMapOverlay.id = 'largeMap';
        this.largeMapOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none; z-index: 1000;
            justify-content: center; align-items: center;
            flex-direction: column;
        `;
        document.body.appendChild(this.largeMapOverlay);
        
        // Map title
        const title = document.createElement('div');
        title.style.cssText = `
            color: #fff; font-size: 28px; font-family: Arial;
            margin-bottom: 20px; text-shadow: 0 0 10px #4a90d9;
        `;
        title.textContent = '🗺️ Archipelago Map';
        this.largeMapOverlay.appendChild(title);
        
        // Large map canvas container
        const mapWrapper = document.createElement('div');
        mapWrapper.style.cssText = `
            width: ${this.largeMapSize}px; height: ${this.largeMapSize}px;
            background: rgba(0, 30, 60, 0.9);
            border: 4px solid #4a90d9; border-radius: 10px;
            position: relative; overflow: hidden;
            box-shadow: 0 0 40px rgba(74, 144, 217, 0.5);
        `;
        this.largeMapOverlay.appendChild(mapWrapper);
        
        // Large map canvas
        this.largeMapCanvas = document.createElement('canvas');
        this.largeMapCanvas.width = this.largeMapSize;
        this.largeMapCanvas.height = this.largeMapSize;
        this.largeMapCanvas.style.cssText = 'width: 100%; height: 100%;';
        mapWrapper.appendChild(this.largeMapCanvas);
        this.largeMapCtx = this.largeMapCanvas.getContext('2d');
        
        // Island info panel
        this.infoPanel = document.createElement('div');
        this.infoPanel.style.cssText = `
            position: absolute; bottom: 10px; left: 10px; right: 10px;
            background: rgba(0, 0, 0, 0.7); padding: 10px;
            border-radius: 5px; color: #fff; font-family: Arial;
            font-size: 14px;
        `;
        this.infoPanel.innerHTML = 'Hover over islands for info';
        mapWrapper.appendChild(this.infoPanel);
        
        // Close hint
        const closeHint = document.createElement('div');
        closeHint.style.cssText = `
            color: #888; font-size: 14px; margin-top: 15px; font-family: Arial;
        `;
        closeHint.textContent = 'Press M or ESC to close';
        this.largeMapOverlay.appendChild(closeHint);
        
        // Legend
        this.createLegend();
    }
    
    createLegend() {
        const legend = document.createElement('div');
        legend.style.cssText = `
            position: absolute; top: 10px; right: 10px;
            background: rgba(0, 0, 0, 0.7); padding: 10px;
            border-radius: 5px; color: #fff; font-family: Arial;
            font-size: 12px;
        `;
        legend.innerHTML = `
            <div style="margin-bottom: 5px;"><span style="color: #00ff00;">●</span> You</div>
            <div style="margin-bottom: 5px;"><span style="color: #ffaa00;">▲</span> Boat</div>
            <div><span style="color: #8b4513;">●</span> Island</div>
        `;
        this.largeMapOverlay.querySelector('div:nth-child(2)').appendChild(legend);
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                this.toggleLargeMap();
            } else if (e.key === 'Escape' && this.isLargeMapOpen) {
                this.closeLargeMap();
            }
        });
    }

    toggleLargeMap() {
        this.isLargeMapOpen = !this.isLargeMapOpen;
        this.largeMapOverlay.style.display = this.isLargeMapOpen ? 'flex' : 'none';
        if (this.isLargeMapOpen) {
            this.drawLargeMap();
        }
    }

    closeLargeMap() {
        this.isLargeMapOpen = false;
        this.largeMapOverlay.style.display = 'none';
    }

    update() {
        this.drawMinimap();
        if (this.isLargeMapOpen) {
            this.drawLargeMap();
        }
    }

    drawMinimap() {
        const ctx = this.minimapCtx;
        const size = this.minimapSize;
        const scale = size / this.worldSize;
        const center = size / 2;

        // Clear with ocean color
        ctx.fillStyle = '#0a1628';
        ctx.beginPath();
        ctx.arc(center, center, center, 0, Math.PI * 2);
        ctx.fill();

        // Draw water rings
        ctx.strokeStyle = 'rgba(74, 144, 217, 0.2)';
        ctx.lineWidth = 1;
        for (let r = 30; r < center; r += 30) {
            ctx.beginPath();
            ctx.arc(center, center, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw islands
        this.islands.forEach(island => {
            const x = center + (island.position.x * scale);
            const z = center + (island.position.z * scale);

            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.arc(x, z, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.arc(x, z, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw boat
        if (this.boat) {
            const bx = center + (this.boat.position.x * scale);
            const bz = center + (this.boat.position.z * scale);

            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(bx, bz - 5);
            ctx.lineTo(bx - 4, bz + 4);
            ctx.lineTo(bx + 4, bz + 4);
            ctx.closePath();
            ctx.fill();
        }

        // Draw player
        const px = center + (this.player.position.x * scale);
        const pz = center + (this.player.position.z * scale);

        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(px, pz, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(px, pz, 4, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#4a90d9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(center, center, center - 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawLargeMap() {
        const ctx = this.largeMapCtx;
        const size = this.largeMapSize;
        const scale = size / this.worldSize;
        const center = size / 2;

        // Clear with ocean gradient
        const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
        gradient.addColorStop(0, '#1a3a5c');
        gradient.addColorStop(1, '#0a1628');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Draw grid
        ctx.strokeStyle = 'rgba(74, 144, 217, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < size; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }

        // Draw compass
        this.drawCompass(ctx, size - 50, 50);

        // Draw islands with labels
        this.islands.forEach(island => {
            const x = center + (island.position.x * scale);
            const z = center + (island.position.z * scale);

            // Island shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x + 3, z + 3, 25, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Island base
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.ellipse(x, z, 25, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Island green
            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.ellipse(x, z - 3, 18, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Island name
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(island.name, x, z + 35);
        });

        // Draw boat
        if (this.boat) {
            const bx = center + (this.boat.position.x * scale);
            const bz = center + (this.boat.position.z * scale);

            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(bx, bz - 10);
            ctx.lineTo(bx - 7, bz + 8);
            ctx.lineTo(bx + 7, bz + 8);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Boat', bx, bz + 22);
        }

        // Draw player
        const px = center + (this.player.position.x * scale);
        const pz = center + (this.player.position.z * scale);

        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(px, pz, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(px, pz, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('You', px, pz + 22);
    }

    drawCompass(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#4a90d9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.stroke();

        // N arrow
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fill();

        // S arrow
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', 0, -28);

        ctx.restore();
    }

    setIslands(islands) {
        this.islands = islands;
    }

    setBoat(boat) {
        this.boat = boat;
    }

    dispose() {
        if (this.minimapContainer) this.minimapContainer.remove();
        if (this.largeMapOverlay) this.largeMapOverlay.remove();
    }
}
