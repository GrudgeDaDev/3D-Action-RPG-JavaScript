/**
 * Class Skill Tree System
 * Converted and consolidated from DynamicTraitSkillTree.cs, GrudgeSkillTreeManager.cs
 * 
 * Manages class-based skill progression for all 4 classes:
 * - Warrior (Tank/DPS/Support)
 * - Ranger (DPS/Utility)
 * - Mage (Healer/DPS)
 * - Worg (Shapeshifter)
 */

export class ClassSkillTree {
    constructor(player, options = {}) {
        this.player = player;
        this.currentClass = options.defaultClass || 'Warrior';
        
        // Skill progression state
        this.selectedSkills = {
            level0: false,
            level1: -1,
            level5: -1,
            level10: -1,
            level15: -1,
            level20: -1
        };
        
        // Skill layout: Level -> number of choices
        this.skillChoicesPerLevel = {
            0: 1,   // Starting skill
            1: 2,   // 2 choices
            5: 2,   // 2 choices
            10: 3,  // 3 choices
            15: 2,  // 2 choices
            20: 2   // 2 choices (ultimate)
        };
        
        // Complete skill data for all classes
        this.classSkills = this.initializeSkillData();
        
        console.log('🌳 ClassSkillTree initialized');
    }

    /**
     * Initialize complete skill data for all classes
     */
    initializeSkillData() {
        return {
            Warrior: {
                name: '⚔️ Versatile Warrior',
                description: 'Most flexible class! Tank, DPS, or support. Temporary invincibility abilities.',
                color: '#ef4444',
                skills: {
                    0: [{ name: 'Invincibility', description: 'Become invincible for 3 seconds', icon: '🛡️', cooldown: 60 }],
                    1: [
                        { name: 'Taunt', description: 'Force enemies to attack you', icon: '🎯', cooldown: 15 },
                        { name: 'Quick Strike', description: 'Fast attack with bonus damage', icon: '⚡', cooldown: 8 }
                    ],
                    5: [
                        { name: 'Damage Surge', description: '+30% damage for 10 seconds', icon: '💥', cooldown: 30 },
                        { name: "Guardian's Aura", description: 'Reduce damage taken by 40%', icon: '🛡️', cooldown: 45 }
                    ],
                    10: [
                        { name: 'Dual Wield', description: 'Wield two weapons', icon: '⚔️⚔️', passive: true },
                        { name: 'Shield Specialist', description: '+50% block chance', icon: '🛡️', passive: true },
                        { name: 'Life Drain', description: 'Steal 20% of damage as health', icon: '💉', passive: true }
                    ],
                    15: [
                        { name: 'Execute', description: 'Instant kill enemies below 20% HP', icon: '💀', cooldown: 20 },
                        { name: 'Double Strike', description: 'Attack twice instantly', icon: '⚔️⚔️', cooldown: 12 }
                    ],
                    20: [
                        { name: 'Avatar Form', description: 'Transform into ultimate warrior', icon: '👹', cooldown: 120 },
                        { name: 'Perfect Counter', description: 'Counter all attacks for 5s', icon: '🔄', cooldown: 90 }
                    ]
                }
            },
            
            Ranger: {
                name: '🏹 Ranger Scout',
                description: 'Primary DPS with utility! Ranged or melee paths, traps, stealth strikes.',
                color: '#10b981',
                skills: {
                    0: [{ name: "Hunter's Instinct", description: '+20% crit chance', icon: '🎯', passive: true }],
                    1: [
                        { name: 'Power Shot', description: 'Charged arrow for massive damage', icon: '🏹', cooldown: 10 },
                        { name: 'Stealth Strike', description: 'Invisible attack from shadows', icon: '🌑', cooldown: 15 }
                    ],
                    5: [
                        { name: 'Multi Shot', description: 'Fire 5 arrows at once', icon: '🏹🏹🏹', cooldown: 20 },
                        { name: 'Shadow Step', description: 'Teleport behind enemy', icon: '👤', cooldown: 12 }
                    ],
                    10: [
                        { name: 'Explosive Shot', description: 'Arrow explodes on impact', icon: '💥', cooldown: 15 },
                        { name: 'Poison Blade', description: 'Melee attacks poison enemies', icon: '🗡️', passive: true },
                        { name: 'Trap Mastery', description: 'Deploy deadly traps', icon: '🪤', cooldown: 30 }
                    ],
                    15: [
                        { name: 'Rain of Arrows', description: 'Barrage from the sky', icon: '☔', cooldown: 45 },
                        { name: 'Assassinate', description: 'Instant kill from stealth', icon: '💀', cooldown: 60 }
                    ],
                    20: [
                        { name: 'Storm of Arrows', description: 'Ultimate arrow barrage', icon: '⛈️', cooldown: 120 },
                        { name: 'Shadow Master', description: 'Become one with shadows', icon: '🌑', cooldown: 90 }
                    ]
                }
            },
            
            Mage: {
                name: '🔮 Mage Priest',
                description: 'Primary healer with magic DPS! Mana Shield, Blink teleport, Portal system.',
                color: '#8b5cf6',
                skills: {
                    0: [{ name: 'Mana Shield', description: 'Absorb damage with mana', icon: '🔵', passive: true }],
                    1: [
                        { name: 'Magic Missile', description: 'Homing magic projectiles', icon: '✨', cooldown: 5 },
                        { name: 'Heal', description: 'Restore 50% health', icon: '💚', cooldown: 15 }
                    ],
                    5: [
                        { name: 'Fireball', description: 'Explosive fire damage', icon: '🔥', cooldown: 10 },
                        { name: 'Greater Heal', description: 'Restore 100% health', icon: '💚💚', cooldown: 30 }
                    ],
                    10: [
                        { name: 'Lightning Chain', description: 'Chain lightning between enemies', icon: '⚡', cooldown: 20 },
                        { name: 'Blink', description: 'Teleport short distance', icon: '✨', cooldown: 8 },
                        { name: 'Group Heal', description: 'Heal all nearby allies', icon: '💚💚💚', cooldown: 45 }
                    ],
                    15: [
                        { name: 'Meteor', description: 'Call down meteor strike', icon: '☄️', cooldown: 60 },
                        { name: 'Portal', description: 'Create teleport portal', icon: '🌀', cooldown: 90 }
                    ],
                    20: [
                        { name: 'Archmage', description: 'Ultimate mage transformation', icon: '🧙', cooldown: 120 },
                        { name: 'Reality Tear', description: 'Tear reality itself', icon: '🌌', cooldown: 180 }
                    ]
                }
            },
            
            Worg: {
                name: '🐺 Worg Shapeshifter',
                description: 'Transform into animal forms! Tank as Bear, DPS as Raptor. Master of shapeshifting.',
                color: '#f59e0b',
                skills: {
                    0: [{ name: 'Bear Form', description: 'Transform into bear (+50% HP)', icon: '🐻', toggle: true }],
                    1: [
                        { name: 'Howl', description: 'Buff allies, debuff enemies', icon: '🐺', cooldown: 30 },
                        { name: 'Pack Hunt', description: '+20% damage near allies', icon: '🐾', passive: true }
                    ],
                    5: [
                        { name: 'Feral Rage', description: '+50% attack speed', icon: '😡', cooldown: 20 },
                        { name: 'Alpha Call', description: 'Summon wolf pack', icon: '🐺🐺🐺', cooldown: 60 }
                    ],
                    10: [
                        { name: 'Alpha Bear', description: 'Enhanced bear form', icon: '🐻', passive: true },
                        { name: 'Raptor Form', description: 'Transform into raptor (DPS)', icon: '🦖', toggle: true },
                        { name: 'Blood Frenzy', description: 'Gain power from kills', icon: '🩸', passive: true }
                    ],
                    15: [
                        { name: 'Apex Predator', description: 'Ultimate hunter mode', icon: '👹', cooldown: 45 },
                        { name: 'Primal Fury', description: 'Unleash primal power', icon: '💢', cooldown: 60 }
                    ],
                    20: [
                        { name: 'Worg Lord', description: 'Command all beasts', icon: '👑', cooldown: 120 },
                        { name: 'Primal Avatar', description: 'Become nature itself', icon: '🌿', cooldown: 180 }
                    ]
                }
            }
        };
    }

    /**
     * Get skills for current class
     */
    getClassSkills() {
        return this.classSkills[this.currentClass];
    }

    /**
     * Get skills for specific level
     */
    getSkillsForLevel(level) {
        const classData = this.getClassSkills();
        return classData ? classData.skills[level] : [];
    }

    /**
     * Check if player can select skill at level
     */
    canSelectSkill(level) {
        if (!this.player) return false;
        return this.player.level >= level;
    }

    /**
     * Select a skill
     */
    selectSkill(level, choiceIndex) {
        if (!this.canSelectSkill(level)) {
            console.log(`❌ Level ${level} required to select this skill`);
            return false;
        }

        const skills = this.getSkillsForLevel(level);
        if (choiceIndex >= skills.length) {
            console.log('❌ Invalid skill choice');
            return false;
        }

        // Update selection
        if (level === 0) {
            this.selectedSkills.level0 = true;
        } else {
            this.selectedSkills[`level${level}`] = choiceIndex;
        }

        const skill = skills[choiceIndex];
        console.log(`✅ Selected skill: ${skill.name} (Level ${level})`);
        
        // Apply skill effect
        this.applySkillEffect(skill, level);
        
        return true;
    }

    /**
     * Apply skill effect to player
     */
    applySkillEffect(skill, level) {
        if (!this.player) return;

        // Add skill to player's abilities
        if (!this.player.classSkills) {
            this.player.classSkills = [];
        }

        this.player.classSkills.push({
            ...skill,
            level: level,
            unlocked: true
        });

        console.log(`🎯 Applied skill effect: ${skill.name}`);
    }

    /**
     * Check if skill is selected
     */
    isSkillSelected(level, choiceIndex) {
        if (level === 0) {
            return this.selectedSkills.level0;
        }
        return this.selectedSkills[`level${level}`] === choiceIndex;
    }

    /**
     * Get all unlocked skills
     */
    getUnlockedSkills() {
        const unlocked = [];
        const classData = this.getClassSkills();
        
        Object.keys(this.selectedSkills).forEach(key => {
            const level = key === 'level0' ? 0 : parseInt(key.replace('level', ''));
            const selection = this.selectedSkills[key];
            
            if (selection !== false && selection !== -1) {
                const skills = classData.skills[level];
                const choiceIndex = selection === true ? 0 : selection;
                if (skills && skills[choiceIndex]) {
                    unlocked.push({
                        ...skills[choiceIndex],
                        level: level
                    });
                }
            }
        });
        
        return unlocked;
    }

    /**
     * Change class (resets skills)
     */
    changeClass(newClass) {
        if (!this.classSkills[newClass]) {
            console.log(`❌ Invalid class: ${newClass}`);
            return false;
        }

        this.currentClass = newClass;
        
        // Reset selections
        this.selectedSkills = {
            level0: false,
            level1: -1,
            level5: -1,
            level10: -1,
            level15: -1,
            level20: -1
        };

        console.log(`🔄 Changed class to ${newClass}`);
        return true;
    }

    /**
     * Get skill tree info for UI
     */
    getInfo() {
        const classData = this.getClassSkills();
        return {
            className: classData.name,
            description: classData.description,
            color: classData.color,
            currentClass: this.currentClass,
            playerLevel: this.player ? this.player.level : 0,
            unlockedSkills: this.getUnlockedSkills(),
            availableClasses: Object.keys(this.classSkills)
        };
    }

    /**
     * Save progression
     */
    save() {
        return {
            currentClass: this.currentClass,
            selectedSkills: { ...this.selectedSkills }
        };
    }

    /**
     * Load progression
     */
    load(data) {
        if (data.currentClass) {
            this.currentClass = data.currentClass;
        }
        if (data.selectedSkills) {
            this.selectedSkills = { ...data.selectedSkills };
        }
        console.log('📥 Loaded class skill tree progression');
    }
}

