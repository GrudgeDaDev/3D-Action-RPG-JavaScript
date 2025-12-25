/**
 * Ability Icon Generator
 * Generates simple 2D sprite icons for abilities using Canvas
 * Use this until custom icons are created
 */

export class AbilityIconGenerator {
    constructor(size = 64) {
        this.size = size;
        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Generate slash icon (sword)
     */
    generateSlashIcon() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Background circle
        this.drawCircleBackground('#4a4a4a');
        
        // Sword
        this.ctx.strokeStyle = '#c0c0c0';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(20, 44);
        this.ctx.lineTo(44, 20);
        this.ctx.stroke();
        
        // Blade shine
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(24, 40);
        this.ctx.lineTo(40, 24);
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    /**
     * Generate charge attack icon (running figure with sword)
     */
    generateChargeIcon() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Background circle
        this.drawCircleBackground('#8b4513');
        
        // Motion lines
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(10 + i * 8, 20 + i * 4);
            this.ctx.lineTo(20 + i * 8, 20 + i * 4);
            this.ctx.stroke();
        }
        
        // Figure
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(40, 28, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sword
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(35, 35);
        this.ctx.lineTo(50, 45);
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    /**
     * Generate fireball icon
     */
    generateFireballIcon() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Background circle
        this.drawCircleBackground('#1a1a1a');
        
        // Fireball gradient
        const gradient = this.ctx.createRadialGradient(32, 32, 5, 32, 32, 20);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ff6600');
        gradient.addColorStop(1, '#ff0000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(32, 32, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Flame details
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(28, 28, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        return this.canvas.toDataURL();
    }

    /**
     * Generate attack2 icon (double strike)
     */
    generateAttack2Icon() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Background circle
        this.drawCircleBackground('#2a4a6a');
        
        // Two crossing swords
        this.ctx.strokeStyle = '#c0c0c0';
        this.ctx.lineWidth = 3;
        
        // First sword
        this.ctx.beginPath();
        this.ctx.moveTo(18, 46);
        this.ctx.lineTo(46, 18);
        this.ctx.stroke();
        
        // Second sword
        this.ctx.beginPath();
        this.ctx.moveTo(46, 46);
        this.ctx.lineTo(18, 18);
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    /**
     * Generate combo icon (spiral/whirlwind)
     */
    generateComboIcon() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Background circle
        this.drawCircleBackground('#4a2a6a');
        
        // Spiral
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        const centerX = 32;
        const centerY = 32;
        const maxRadius = 20;
        const turns = 2;
        
        for (let angle = 0; angle < Math.PI * 2 * turns; angle += 0.1) {
            const radius = (angle / (Math.PI * 2 * turns)) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (angle === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    /**
     * Generate dash icon (lightning bolt)
     */
    generateDashIcon() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Background circle
        this.drawCircleBackground('#1a3a5a');
        
        // Lightning bolt
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.moveTo(32, 12);
        this.ctx.lineTo(28, 32);
        this.ctx.lineTo(36, 32);
        this.ctx.lineTo(32, 52);
        this.ctx.lineTo(36, 32);
        this.ctx.lineTo(28, 32);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Glow
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    /**
     * Draw circular background
     */
    drawCircleBackground(color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.size / 2, this.size / 2, this.size / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /**
     * Generate all icons and return as object
     */
    generateAllIcons() {
        return {
            slash: this.generateSlashIcon(),
            charge: this.generateChargeIcon(),
            fireball: this.generateFireballIcon(),
            attack2: this.generateAttack2Icon(),
            combo: this.generateComboIcon(),
            dash: this.generateDashIcon()
        };
    }
}

// Export singleton instance
export const iconGenerator = new AbilityIconGenerator();

