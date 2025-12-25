/**
 * Character Attribute System
 * Based on Grudge Warlords Ultimate Character Builder
 * Handles attributes, derived stats, and meta class detection
 */

export const ATTRIBUTE_DEFINITIONS = {
    Strength: {
        description: "Physical might and raw power.",
        fullDescription: "Increases raw damage output, physical defense, and health. Warriors and melee builds scale heavily with Strength.",
        gains: {
            health: { label: "Health", value: 5 },
            damage: { label: "Physical Damage", value: 1.25 },
            defense: { label: "Physical Defense", value: 4 },
            block: { label: "Block Chance", value: 0.2 },
            drainHealth: { label: "Lifesteal", value: 0.075 },
            stagger: { label: "Stagger on Hit", value: 0.04 },
            mana: { label: "Mana Pool", value: 1 },
            stamina: { label: "Stamina", value: 0.8 },
            accuracy: { label: "Attack Accuracy", value: 0.08 },
            healthRegen: { label: "Health Regen/s", value: 0.02 },
            damageReduction: { label: "Damage Reduction", value: 0.02 }
        }
    },
    Intellect: {
        description: "Mental acuity and spellcasting power.",
        fullDescription: "Powers magical damage, mana regeneration, and ability cooldown reduction. Casters scale directly with Intellect.",
        gains: {
            mana: { label: "Mana Pool", value: 9 },
            damage: { label: "Magical Damage", value: 1.5 },
            defense: { label: "Magical Defense", value: 2 },
            manaRegen: { label: "Mana Regen/s", value: 0.04 },
            cooldownReduction: { label: "Cooldown Reduction", value: 0.075 },
            spellAccuracy: { label: "Spell Accuracy", value: 0.15 },
            health: { label: "Health", value: 3 },
            stamina: { label: "Stamina", value: 0.4 },
            accuracy: { label: "Attack Accuracy", value: 0.1 },
            abilityCost: { label: "Ability Cost Reduction", value: 0.05 }
        }
    },
    Vitality: {
        description: "Physical endurance and life force.",
        fullDescription: "Maximizes health pool and provides passive health regeneration. Vital for tanks and sustained damage builds.",
        gains: {
            health: { label: "Health", value: 25 },
            defense: { label: "Physical Defense", value: 1.5 },
            healthRegen: { label: "Health Regen/s", value: 0.06 },
            damageReduction: { label: "Damage Reduction", value: 0.04 },
            bleedResist: { label: "Bleed Resistance", value: 0.15 },
            mana: { label: "Mana Pool", value: 1.5 },
            stamina: { label: "Stamina", value: 1 },
            resistance: { label: "Magic Resistance", value: 0.08 },
            armor: { label: "Armor Rating", value: 0.2 }
        }
    },
    Dexterity: {
        description: "Hand-eye coordination and finesse.",
        fullDescription: "Dominates critical chance, attack speed, and accuracy. Rogues and archers scale with Dexterity.",
        gains: {
            damage: { label: "Damage", value: 0.9 },
            criticalChance: { label: "Critical Chance", value: 0.3 },
            accuracy: { label: "Attack Accuracy", value: 0.25 },
            attackSpeed: { label: "Attack Speed", value: 0.2 },
            evasion: { label: "Evasion Chance", value: 0.125 },
            criticalDamage: { label: "Critical Damage Multiplier", value: 0.2 },
            defense: { label: "Physical Defense", value: 1.2 },
            stamina: { label: "Stamina", value: 0.6 },
            movementSpeed: { label: "Movement Speed", value: 0.08 },
            reflexTime: { label: "Reaction Time Bonus", value: 0.03 },
            health: { label: "Health", value: 3 }
        }
    },
    Endurance: {
        description: "Stamina reserves and physical resistance.",
        fullDescription: "Builds stamina for abilities and provides armor scaling. High Endurance enables higher block effectiveness.",
        gains: {
            stamina: { label: "Stamina", value: 6 },
            defense: { label: "Physical Defense", value: 5 },
            blockEffect: { label: "Block Effectiveness", value: 0.175 },
            ccResistance: { label: "CC Duration Reduction", value: 0.1 },
            armor: { label: "Armor Rating", value: 0.6 },
            defenseBreakResist: { label: "Armor Break Resistance", value: 0.125 },
            health: { label: "Health", value: 8 },
            mana: { label: "Mana Pool", value: 1 },
            healthRegen: { label: "Health Regen/s", value: 0.02 },
            block: { label: "Block Chance", value: 0.12 }
        }
    },
    Wisdom: {
        description: "Mental fortitude and magical resilience.",
        fullDescription: "Primary counter to magical damage. Scales resistance and provides magic immunity scaling.",
        gains: {
            mana: { label: "Mana Pool", value: 6 },
            defense: { label: "Magical Defense", value: 5.5 },
            resistance: { label: "Magic Resistance", value: 0.25 },
            cdrResist: { label: "CDR Resistance", value: 0.2 },
            statusEffect: { label: "Status Effect Duration Reduction", value: 0.075 },
            spellblock: { label: "Spell Block Chance", value: 0.125 },
            health: { label: "Health", value: 4 },
            stamina: { label: "Stamina", value: 0.5 },
            damageReduction: { label: "Damage Reduction", value: 0.03 },
            spellAccuracy: { label: "Spell Accuracy", value: 0.1 }
        }
    },
    Agility: {
        description: "Speed, reflexes, and positioning.",
        fullDescription: "Increases movement speed, dodge chance, and evasion. Synergizes with high-risk playstyles.",
        gains: {
            movementSpeed: { label: "Movement Speed", value: 0.15 },
            evasion: { label: "Evasion Chance", value: 0.225 },
            dodge: { label: "Dodge Cooldown Reduction", value: 0.15 },
            reflexTime: { label: "Reaction Time Bonus", value: 0.04 },
            criticalEvasion: { label: "Crit Evasion", value: 0.25 },
            fallDamage: { label: "Fall Damage Reduction", value: 0.2 },
            stamina: { label: "Stamina", value: 1 },
            accuracy: { label: "Attack Accuracy", value: 0.1 },
            attackSpeed: { label: "Attack Speed", value: 0.05 },
            damage: { label: "Damage", value: 0.3 },
            health: { label: "Health", value: 3 }
        }
    },
    Tactics: {
        description: "Strategic thinking and ability control.",
        fullDescription: "Expertise in ability execution and resource management. Grants scaling bonus to all stats.",
        gains: {
            stamina: { label: "Stamina", value: 3 },
            abilityCost: { label: "Ability Cost Reduction", value: 0.075 },
            armorPenetration: { label: "Armor Penetration", value: 0.2 },
            blockPenetration: { label: "Block Penetration", value: 0.175 },
            defenseBreak: { label: "Defense Break Power", value: 0.1 },
            comboCooldownRed: { label: "Combo Cooldown Reduction", value: 0.125 },
            damage: { label: "Damage", value: 0.4 },
            defense: { label: "Physical Defense", value: 1 },
            mana: { label: "Mana Pool", value: 1.5 },
            cooldownReduction: { label: "Cooldown Reduction", value: 0.05 },
            health: { label: "Health", value: 3 }
        }
    }
};

export const BASE_STATS = {
    health: 250,
    mana: 100,
    stamina: 100,
    damage: 0,
    defense: 0,
    block: 0,
    blockEffect: 0,
    evasion: 0,
    accuracy: 0,
    criticalChance: 0,
    criticalDamage: 0,
    attackSpeed: 0,
    movementSpeed: 0,
    resistance: 0,
    cdrResist: 0,
    defenseBreakResist: 0,
    armorPenetration: 0,
    blockPenetration: 0,
    defenseBreak: 0,
    drainHealth: 0,
    manaRegen: 0,
    healthRegen: 0,
    cooldownReduction: 0,
    abilityCost: 0,
    spellAccuracy: 0,
    stagger: 0,
    ccResistance: 0,
    armor: 0,
    damageReduction: 0,
    bleedResist: 0,
    statusEffect: 0,
    spellblock: 0,
    dodge: 0,
    reflexTime: 0,
    criticalEvasion: 0,
    fallDamage: 0,
    comboCooldownRed: 0
};

/**
 * Calculate derived stats from attribute points
 */
export function calculateDerivedStats(attributePoints) {
    const stats = { ...BASE_STATS };

    // Apply each attribute's gains
    for (const [attrName, points] of Object.entries(attributePoints)) {
        const attrDef = ATTRIBUTE_DEFINITIONS[attrName];
        if (!attrDef) continue;

        for (const [statName, gain] of Object.entries(attrDef.gains)) {
            if (stats[statName] !== undefined) {
                stats[statName] += gain.value * points;
            }
        }
    }

    return stats;
}

/**
 * Calculate combat power rating
 */
export function calculateCombatPower(stats) {
    // Effective Health = Health * (1 + Defense/100) * (1 + Resistance/100)
    const ehp = stats.health * (1 + stats.defense / 100) * (1 + stats.resistance / 100);

    // DPS Factor = Damage * (1 + CritChance * CritDmg) * (1 + AttackSpeed)
    const dps = (stats.damage + 10) *
                (1 + (stats.criticalChance / 100) * (stats.criticalDamage / 100)) *
                (1 + stats.attackSpeed / 100);

    // Utility Factor = CDR + ManaRegen + MoveSpeed
    const utility = stats.cooldownReduction * 2 + stats.manaRegen * 10 + stats.movementSpeed * 2;

    return Math.floor(ehp * 0.4 + dps * 2.5 + utility * 5);
}

/**
 * Calculate build score (0-100+)
 */
export function calculateBuildScore(attributePoints, totalPointsAvailable = 160) {
    const totalSpent = Object.values(attributePoints).reduce((sum, val) => sum + val, 0);
    if (totalSpent < totalPointsAvailable) return 0;

    const stats = calculateDerivedStats(attributePoints);
    const combatPower = calculateCombatPower(stats);

    // Normalize CP to 0-100 scale (6000 is "Perfect")
    let score = (combatPower / 6000) * 100;

    // Synergy Bonus - reward focused builds
    const norm = Object.keys(attributePoints).reduce(
        (acc, k) => ({ ...acc, [k]: attributePoints[k] / totalPointsAvailable }),
        {}
    );

    const synergy = Math.max(
        norm.Strength + norm.Vitality + norm.Endurance,      // Tank
        norm.Intellect + norm.Wisdom + norm.Tactics,         // Mage
        norm.Dexterity + norm.Agility + norm.Strength,       // Rogue/Warrior
        norm.Tactics + norm.Endurance + norm.Wisdom          // Support
    ) * 20;

    return Math.min(100, score + synergy);
}

/**
 * Get rank from score (1-300, lower is better)
 */
export function getRankFromScore(score) {
    const maxRank = 300;
    if (score >= 100) return 1;
    if (score <= 0) return maxRank;
    return Math.floor(maxRank - (score / 100) * (maxRank - 1));
}

export const CLASS_TIERS = [
    { minRank: 1, maxRank: 10, name: "Legendary", color: "#ff00ff", desc: "Mythical power achieved through perfect synergy." },
    { minRank: 11, maxRank: 50, name: "Warlord", color: "#ff8800", desc: "A dominant force on the battlefield." },
    { minRank: 51, maxRank: 100, name: "Epic", color: "#a855f7", desc: "A hero of renown and great skill." },
    { minRank: 101, maxRank: 200, name: "Hero", color: "#3b82f6", desc: "A capable adventurer with potential." },
    { minRank: 201, maxRank: 300, name: "Normal", color: "#9ca3af", desc: "A standard combatant." }
];

/**
 * Get class tier from rank
 */
export function getClassTier(rank) {
    return CLASS_TIERS.find(tier => rank >= tier.minRank && rank <= tier.maxRank) || CLASS_TIERS[CLASS_TIERS.length - 1];
}

