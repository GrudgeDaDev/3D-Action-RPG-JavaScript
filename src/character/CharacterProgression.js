/**
 * Character Progression System
 * Handles levels 0-20, class selection, and attribute point allocation
 */

import { calculateDerivedStats, calculateCombatPower, calculateBuildScore, getRankFromScore, getClassTier } from './AttributeSystem.js';

export const MAX_LEVEL = 20;
export const CLASS_SELECTION_LEVEL = 1;

// Points awarded per level
export const POINTS_PER_LEVEL = 8;

// Available classes (selected at level 1)
export const CLASSES = {
    WARRIOR: {
        name: 'Warrior',
        description: 'Masters of melee combat and physical prowess',
        icon: '⚔️',
        startingAbility: 'powerStrike',
        recommendedAttributes: ['Strength', 'Vitality', 'Endurance'],
        color: '#ef4444'
    },
    MAGE: {
        name: 'Mage',
        description: 'Wielders of arcane magic and elemental forces',
        icon: '🔮',
        startingAbility: 'fireball',
        recommendedAttributes: ['Intellect', 'Wisdom', 'Tactics'],
        color: '#8b5cf6'
    },
    ROGUE: {
        name: 'Rogue',
        description: 'Swift assassins who strike from the shadows',
        icon: '🗡️',
        startingAbility: 'backstab',
        recommendedAttributes: ['Dexterity', 'Agility', 'Tactics'],
        color: '#10b981'
    },
    RANGER: {
        name: 'Ranger',
        description: 'Expert marksmen and wilderness survivors',
        icon: '🏹',
        startingAbility: 'precisionShot',
        recommendedAttributes: ['Dexterity', 'Agility', 'Wisdom'],
        color: '#14b8a6'
    },
    PALADIN: {
        name: 'Paladin',
        description: 'Holy warriors who protect and heal allies',
        icon: '🛡️',
        startingAbility: 'divineShield',
        recommendedAttributes: ['Strength', 'Wisdom', 'Vitality'],
        color: '#f59e0b'
    },
    NECROMANCER: {
        name: 'Necromancer',
        description: 'Dark mages who command death itself',
        icon: '💀',
        startingAbility: 'drainLife',
        recommendedAttributes: ['Intellect', 'Vitality', 'Tactics'],
        color: '#6366f1'
    }
};

export class CharacterProgression {
    constructor() {
        this.level = 0;
        this.experience = 0;
        this.selectedClass = null;
        this.attributePoints = {
            Strength: 0,
            Intellect: 0,
            Vitality: 0,
            Dexterity: 0,
            Endurance: 0,
            Wisdom: 0,
            Agility: 0,
            Tactics: 0
        };
        this.unspentPoints = 0;
        this.abilities = [];
    }

    /**
     * Get total attribute points available based on level
     */
    getTotalPointsAvailable() {
        return this.level * POINTS_PER_LEVEL;
    }

    /**
     * Get total points spent
     */
    getTotalPointsSpent() {
        return Object.values(this.attributePoints).reduce((sum, val) => sum + val, 0);
    }

    /**
     * Check if player can level up
     */
    canLevelUp() {
        return this.level < MAX_LEVEL && this.experience >= this.getExperienceForNextLevel();
    }

    /**
     * Get experience required for next level
     */
    getExperienceForNextLevel() {
        if (this.level >= MAX_LEVEL) return Infinity;
        // Exponential curve: 100 * (level + 1)^1.5
        return Math.floor(100 * Math.pow(this.level + 1, 1.5));
    }

    /**
     * Add experience and handle level ups
     */
    addExperience(amount) {
        this.experience += amount;
        const levelsGained = [];
        
        while (this.canLevelUp()) {
            this.level++;
            this.unspentPoints += POINTS_PER_LEVEL;
            levelsGained.push(this.level);
            
            // Deduct experience for this level
            this.experience -= this.getExperienceForNextLevel();
        }
        
        return levelsGained;
    }

    /**
     * Select a class (only at level 1)
     */
    selectClass(className) {
        if (this.level !== CLASS_SELECTION_LEVEL) {
            throw new Error('Can only select class at level 1');
        }
        
        if (this.selectedClass) {
            throw new Error('Class already selected');
        }
        
        const classData = CLASSES[className];
        if (!classData) {
            throw new Error(`Invalid class: ${className}`);
        }
        
        this.selectedClass = className;
        this.abilities.push(classData.startingAbility);
        
        return classData;
    }

    /**
     * Allocate attribute points
     */
    allocateAttribute(attributeName, points) {
        if (points < 0) {
            throw new Error('Cannot allocate negative points');
        }

        if (points > this.unspentPoints) {
            throw new Error('Not enough unspent points');
        }

        if (!this.attributePoints.hasOwnProperty(attributeName)) {
            throw new Error(`Invalid attribute: ${attributeName}`);
        }

        this.attributePoints[attributeName] += points;
        this.unspentPoints -= points;
    }

    /**
     * Reset a specific attribute
     */
    resetAttribute(attributeName) {
        if (!this.attributePoints.hasOwnProperty(attributeName)) {
            throw new Error(`Invalid attribute: ${attributeName}`);
        }

        const points = this.attributePoints[attributeName];
        this.attributePoints[attributeName] = 0;
        this.unspentPoints += points;
    }

    /**
     * Reset all attributes
     */
    resetAllAttributes() {
        const totalSpent = this.getTotalPointsSpent();
        for (const attr in this.attributePoints) {
            this.attributePoints[attr] = 0;
        }
        this.unspentPoints = this.getTotalPointsAvailable();
    }

    /**
     * Get current derived stats
     */
    getStats() {
        return calculateDerivedStats(this.attributePoints);
    }

    /**
     * Get combat power rating
     */
    getCombatPower() {
        const stats = this.getStats();
        return calculateCombatPower(stats);
    }

    /**
     * Get build score and rank
     */
    getBuildInfo() {
        const score = calculateBuildScore(this.attributePoints, this.getTotalPointsAvailable());
        const rank = getRankFromScore(score);
        const tier = getClassTier(rank);

        return {
            score,
            rank,
            tier,
            combatPower: this.getCombatPower()
        };
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            level: this.level,
            experience: this.experience,
            selectedClass: this.selectedClass,
            attributePoints: { ...this.attributePoints },
            unspentPoints: this.unspentPoints,
            abilities: [...this.abilities]
        };
    }

    /**
     * Load from JSON
     */
    fromJSON(data) {
        this.level = data.level || 0;
        this.experience = data.experience || 0;
        this.selectedClass = data.selectedClass || null;
        this.attributePoints = { ...data.attributePoints };
        this.unspentPoints = data.unspentPoints || 0;
        this.abilities = data.abilities || [];
    }

    /**
     * Get progress to next level (0-1)
     */
    getLevelProgress() {
        if (this.level >= MAX_LEVEL) return 1;
        const required = this.getExperienceForNextLevel();
        return Math.min(1, this.experience / required);
    }
}

