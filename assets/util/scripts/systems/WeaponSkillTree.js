/**
 * Weapon Skill Tree System
 * NEW SYSTEM - Weapon-based progression separate from class skills
 * 
 * Manages weapon mastery for all 6 weapon types:
 * - Sword (Balanced melee)
 * - Bow (Ranged DPS)
 * - Staff (Magic schools: Fire/Ice/Lightning)
 * - Dagger (Stealth/Crit)
 * - Axe (Heavy damage)
 * - Hammer (Stun/Control)
 */

export class WeaponSkillTree {
    constructor(player, options = {}) {
        this.player = player;
        this.currentWeapon = options.defaultWeapon || 'Sword';
        
        // Weapon progression state (tier-based)
        this.weaponProgress = {
            Sword: { tier: 0, skills: [] },
            Bow: { tier: 0, skills: [] },
            Staff: { tier: 0, skills: [], school: 'Fire' }, // Fire/Ice/Lightning
            Dagger: { tier: 0, skills: [] },
            Axe: { tier: 0, skills: [] },
            Hammer: { tier: 0, skills: [] }
        };
        
        // Weapon skill data
        this.weaponSkills = this.initializeWeaponSkills();
        
        console.log('⚔️ WeaponSkillTree initialized');
    }

    /**
     * Initialize weapon skill data
     */
    initializeWeaponSkills() {
        return {
            Sword: {
                name: '⚔️ Sword Mastery',
                description: 'Balanced weapon for offense and defense',
                color: '#ef4444',
                icon: '⚔️',
                tiers: {
                    1: [
                        { name: 'Sharp Slash', description: '+8% Sword Damage', icon: '⚔️', maxPoints: 3, bonus: { damage: 8 } },
                        { name: 'Swift Blade', description: '+5% Attack Speed', icon: '💨', maxPoints: 3, bonus: { speed: 5 } },
                        { name: 'Parry', description: 'Block and counter attacks', icon: '🛡️', maxPoints: 2, ability: true }
                    ],
                    2: [
                        { name: 'Blade Dance', description: 'Spin attack hits all nearby', icon: '🌀', maxPoints: 1, ability: true },
                        { name: 'Precision Strike', description: '+10% Crit Chance', icon: '🎯', maxPoints: 3, bonus: { crit: 10 } }
                    ],
                    3: [
                        { name: 'Whirlwind', description: 'AOE spin attack', icon: '🌪️', maxPoints: 1, ability: true },
                        { name: 'Sword Master', description: '+15% All Sword Stats', icon: '👑', maxPoints: 1, bonus: { all: 15 } }
                    ]
                }
            },
            
            Bow: {
                name: '🏹 Bow Mastery',
                description: 'Ranged weapon for precision and multi-target',
                color: '#10b981',
                icon: '🏹',
                tiers: {
                    1: [
                        { name: 'Steady Aim', description: '+10% Accuracy', icon: '🎯', maxPoints: 3, bonus: { accuracy: 10 } },
                        { name: 'Quick Draw', description: '+8% Draw Speed', icon: '⚡', maxPoints: 3, bonus: { speed: 8 } },
                        { name: 'Piercing Shot', description: 'Arrows pierce enemies', icon: '➡️', maxPoints: 2, ability: true }
                    ],
                    2: [
                        { name: 'Multi Shot', description: 'Fire 3 arrows at once', icon: '🏹🏹🏹', maxPoints: 1, ability: true },
                        { name: 'Critical Eye', description: '+15% Crit Damage', icon: '👁️', maxPoints: 3, bonus: { critDmg: 15 } }
                    ],
                    3: [
                        { name: 'Explosive Arrow', description: 'Arrows explode on impact', icon: '💥', maxPoints: 1, ability: true },
                        { name: 'Sniper', description: '+50% damage at long range', icon: '🔭', maxPoints: 1, bonus: { rangeDmg: 50 } }
                    ]
                }
            },
            
            Staff: {
                name: '🪄 Staff Mastery',
                description: 'Magic weapon with elemental schools',
                color: '#8b5cf6',
                icon: '🪄',
                hasSchools: true,
                schools: {
                    Fire: {
                        name: '🔥 Fire Magic',
                        color: '#ef4444',
                        tiers: {
                            1: [
                                { name: 'Fire Affinity', description: '+15% Fire Damage', icon: '🔥', maxPoints: 3, bonus: { fireDmg: 15 } },
                                { name: 'Ignite', description: 'Attacks apply burning', icon: '🔸', maxPoints: 2, ability: true }
                            ],
                            2: [
                                { name: 'Fireball', description: 'Launch explosive fireball', icon: '🔥', maxPoints: 1, ability: true },
                                { name: 'Flame Aura', description: 'Burn nearby enemies', icon: '🌡️', maxPoints: 1, ability: true }
                            ],
                            3: [
                                { name: 'Meteor', description: 'Call down meteor', icon: '☄️', maxPoints: 1, ability: true },
                                { name: 'Pyromancer', description: 'Master of fire', icon: '🔥👑', maxPoints: 1, bonus: { fireAll: 25 } }
                            ]
                        }
                    },
                    Ice: {
                        name: '❄️ Ice Magic',
                        color: '#3b82f6',
                        tiers: {
                            1: [
                                { name: 'Frost Affinity', description: '+15% Ice Damage', icon: '❄️', maxPoints: 3, bonus: { iceDmg: 15 } },
                                { name: 'Chill', description: 'Slow enemies', icon: '🧊', maxPoints: 2, ability: true }
                            ],
                            2: [
                                { name: 'Ice Shard', description: 'Launch ice projectile', icon: '❄️', maxPoints: 1, ability: true },
                                { name: 'Frozen Ground', description: 'Create ice field', icon: '🧊', maxPoints: 1, ability: true }
                            ],
                            3: [
                                { name: 'Blizzard', description: 'Freeze everything', icon: '🌨️', maxPoints: 1, ability: true },
                                { name: 'Cryomancer', description: 'Master of ice', icon: '❄️👑', maxPoints: 1, bonus: { iceAll: 25 } }
                            ]
                        }
                    },
                    Lightning: {
                        name: '⚡ Lightning Magic',
                        color: '#eab308',
                        tiers: {
                            1: [
                                { name: 'Storm Affinity', description: '+15% Lightning Damage', icon: '⚡', maxPoints: 3, bonus: { lightningDmg: 15 } },
                                { name: 'Static Shock', description: 'Chain to nearby enemies', icon: '⚡', maxPoints: 2, ability: true }
                            ],
                            2: [
                                { name: 'Lightning Bolt', description: 'Instant lightning strike', icon: '⚡', maxPoints: 1, ability: true },
                                { name: 'Storm Shield', description: 'Electrify attackers', icon: '🛡️⚡', maxPoints: 1, ability: true }
                            ],
                            3: [
                                { name: 'Thunderstorm', description: 'Call down lightning storm', icon: '⛈️', maxPoints: 1, ability: true },
                                { name: 'Stormlord', description: 'Master of lightning', icon: '⚡👑', maxPoints: 1, bonus: { lightningAll: 25 } }
                            ]
                        }
                    }
                }
            },
            
            Dagger: {
                name: '🗡️ Dagger Mastery',
                description: 'Stealth weapon for critical strikes',
                color: '#6366f1',
                icon: '🗡️',
                tiers: {
                    1: [
                        { name: 'Backstab', description: '+20% damage from behind', icon: '🗡️', maxPoints: 3, bonus: { backstabDmg: 20 } },
                        { name: 'Quick Hands', description: '+10% Attack Speed', icon: '⚡', maxPoints: 3, bonus: { speed: 10 } },
                        { name: 'Poison Blade', description: 'Apply poison on hit', icon: '☠️', maxPoints: 2, ability: true }
                    ],
                    2: [
                        { name: 'Shadow Strike', description: 'Teleport and strike', icon: '🌑', maxPoints: 1, ability: true },
                        { name: 'Deadly Precision', description: '+25% Crit Chance', icon: '🎯', maxPoints: 3, bonus: { crit: 25 } }
                    ],
                    3: [
                        { name: 'Assassinate', description: 'Instant kill low HP enemies', icon: '💀', maxPoints: 1, ability: true },
                        { name: 'Shadow Master', description: 'Ultimate assassin', icon: '🌑👑', maxPoints: 1, bonus: { all: 20 } }
                    ]
                }
            },
            
            Axe: {
                name: '🪓 Axe Mastery',
                description: 'Heavy weapon for massive damage',
                color: '#dc2626',
                icon: '🪓',
                tiers: {
                    1: [
                        { name: 'Heavy Blow', description: '+12% Axe Damage', icon: '🪓', maxPoints: 3, bonus: { damage: 12 } },
                        { name: 'Cleave', description: 'Hit multiple enemies', icon: '⚔️', maxPoints: 2, ability: true },
                        { name: 'Armor Break', description: 'Reduce enemy armor', icon: '🛡️💥', maxPoints: 2, ability: true }
                    ],
                    2: [
                        { name: 'Whirlwind Axe', description: 'Spin attack', icon: '🌀', maxPoints: 1, ability: true },
                        { name: 'Brutal Force', description: '+20% Crit Damage', icon: '💥', maxPoints: 3, bonus: { critDmg: 20 } }
                    ],
                    3: [
                        { name: 'Earthquake', description: 'Slam ground, stun all', icon: '🌍', maxPoints: 1, ability: true },
                        { name: 'Berserker', description: 'Rage mode activated', icon: '😡', maxPoints: 1, bonus: { all: 30 } }
                    ]
                }
            },
            
            Hammer: {
                name: '🔨 Hammer Mastery',
                description: 'Control weapon for stuns and knockback',
                color: '#78716c',
                icon: '🔨',
                tiers: {
                    1: [
                        { name: 'Crushing Blow', description: '+10% Hammer Damage', icon: '🔨', maxPoints: 3, bonus: { damage: 10 } },
                        { name: 'Stun Strike', description: 'Chance to stun', icon: '💫', maxPoints: 3, bonus: { stunChance: 15 } },
                        { name: 'Knockback', description: 'Push enemies away', icon: '💨', maxPoints: 2, ability: true }
                    ],
                    2: [
                        { name: 'Ground Slam', description: 'AOE stun attack', icon: '🌍', maxPoints: 1, ability: true },
                        { name: 'Titan Grip', description: '+15% Damage & Stun', icon: '💪', maxPoints: 3, bonus: { damage: 15, stunChance: 10 } }
                    ],
                    3: [
                        { name: 'Shockwave', description: 'Massive AOE knockback', icon: '💥', maxPoints: 1, ability: true },
                        { name: 'Warlord', description: 'Master of hammers', icon: '🔨👑', maxPoints: 1, bonus: { all: 25 } }
                    ]
                }
            }
        };
    }

    /**
     * Get current weapon skills
     */
    getCurrentWeaponSkills() {
        const weaponData = this.weaponSkills[this.currentWeapon];
        
        // Handle staff with schools
        if (weaponData.hasSchools) {
            const school = this.weaponProgress[this.currentWeapon].school || 'Fire';
            return {
                ...weaponData,
                currentSchool: school,
                tiers: weaponData.schools[school].tiers
            };
        }
        
        return weaponData;
    }

    /**
     * Allocate skill point
     */
    allocatePoint(tier, skillIndex, points = 1) {
        const progress = this.weaponProgress[this.currentWeapon];
        const weaponData = this.getCurrentWeaponSkills();
        const tierSkills = weaponData.tiers[tier];
        
        if (!tierSkills || skillIndex >= tierSkills.length) {
            console.log('❌ Invalid skill');
            return false;
        }

        const skill = tierSkills[skillIndex];
        const currentPoints = this.getSkillPoints(tier, skillIndex);
        
        if (currentPoints >= skill.maxPoints) {
            console.log(`❌ ${skill.name} is already maxed`);
            return false;
        }

        // Add skill point
        const skillKey = `${tier}_${skillIndex}`;
        if (!progress.skills[skillKey]) {
            progress.skills[skillKey] = 0;
        }
        progress.skills[skillKey] += points;

        console.log(`✅ Allocated point to ${skill.name} (${progress.skills[skillKey]}/${skill.maxPoints})`);
        
        // Apply bonus
        this.applySkillBonus(skill, progress.skills[skillKey]);
        
        return true;
    }

    /**
     * Get current points in skill
     */
    getSkillPoints(tier, skillIndex) {
        const progress = this.weaponProgress[this.currentWeapon];
        const skillKey = `${tier}_${skillIndex}`;
        return progress.skills[skillKey] || 0;
    }

    /**
     * Apply skill bonus to player
     */
    applySkillBonus(skill, points) {
        if (!this.player || !skill.bonus) return;

        // Apply bonuses based on skill type
        Object.keys(skill.bonus).forEach(bonusType => {
            const bonusValue = skill.bonus[bonusType] * points;
            console.log(`🎯 Applied ${bonusType}: +${bonusValue}%`);
            // TODO: Apply to player stats
        });
    }

    /**
     * Change weapon
     */
    changeWeapon(newWeapon) {
        if (!this.weaponSkills[newWeapon]) {
            console.log(`❌ Invalid weapon: ${newWeapon}`);
            return false;
        }

        this.currentWeapon = newWeapon;
        console.log(`🔄 Changed weapon to ${newWeapon}`);
        return true;
    }

    /**
     * Change staff school (Fire/Ice/Lightning)
     */
    changeStaffSchool(school) {
        if (this.currentWeapon !== 'Staff') {
            console.log('❌ Not using staff');
            return false;
        }

        const staffData = this.weaponSkills.Staff;
        if (!staffData.schools[school]) {
            console.log(`❌ Invalid school: ${school}`);
            return false;
        }

        this.weaponProgress.Staff.school = school;
        console.log(`🔄 Changed to ${school} magic`);
        return true;
    }

    /**
     * Get weapon info for UI
     */
    getInfo() {
        const weaponData = this.getCurrentWeaponSkills();
        const progress = this.weaponProgress[this.currentWeapon];
        
        return {
            weaponName: weaponData.name,
            description: weaponData.description,
            color: weaponData.color,
            icon: weaponData.icon,
            currentWeapon: this.currentWeapon,
            currentTier: progress.tier,
            hasSchools: weaponData.hasSchools,
            currentSchool: weaponData.currentSchool,
            availableWeapons: Object.keys(this.weaponSkills)
        };
    }

    /**
     * Save progression
     */
    save() {
        return {
            currentWeapon: this.currentWeapon,
            weaponProgress: JSON.parse(JSON.stringify(this.weaponProgress))
        };
    }

    /**
     * Load progression
     */
    load(data) {
        if (data.currentWeapon) {
            this.currentWeapon = data.currentWeapon;
        }
        if (data.weaponProgress) {
            this.weaponProgress = data.weaponProgress;
        }
        console.log('📥 Loaded weapon skill tree progression');
    }
}

