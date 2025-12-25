/**
 * Game Constants
 * Central location for all game constants and configuration values
 */

// Combat Constants
export const COMBAT = {
    BASE_DAMAGE: 10,
    CRITICAL_CHANCE: 0.15,
    CRITICAL_MULTIPLIER: 2.0,
    DODGE_CHANCE: 0.1,
    BLOCK_REDUCTION: 0.5,
    ATTACK_RANGE: 3.0,
    SPELL_RANGE: 20.0
};

// Character Stats
export const STATS = {
    BASE_HEALTH: 100,
    BASE_MANA: 50,
    BASE_STAMINA: 100,
    BASE_SPEED: 5.0,
    BASE_JUMP_POWER: 10.0,
    HEALTH_REGEN_RATE: 1.0, // per second
    MANA_REGEN_RATE: 2.0,
    STAMINA_REGEN_RATE: 10.0
};

// Enemy Types
export const ENEMY_TYPES = {
    SLIME: 'slime',
    GOBLIN: 'goblin',
    ORC: 'orc',
    SKELETON: 'skeleton',
    DRAGON: 'dragon',
    BOSS: 'boss'
};

// Enemy Difficulty
export const DIFFICULTY = {
    EASY: {
        healthMultiplier: 0.7,
        damageMultiplier: 0.7,
        xpMultiplier: 0.8
    },
    NORMAL: {
        healthMultiplier: 1.0,
        damageMultiplier: 1.0,
        xpMultiplier: 1.0
    },
    HARD: {
        healthMultiplier: 1.5,
        damageMultiplier: 1.3,
        xpMultiplier: 1.5
    },
    NIGHTMARE: {
        healthMultiplier: 2.0,
        damageMultiplier: 1.8,
        xpMultiplier: 2.0
    }
};

// Item Rarities
export const RARITY = {
    COMMON: { name: 'Common', color: '#FFFFFF', dropChance: 0.60 },
    UNCOMMON: { name: 'Uncommon', color: '#1EFF00', dropChance: 0.25 },
    RARE: { name: 'Rare', color: '#0070DD', dropChance: 0.10 },
    EPIC: { name: 'Epic', color: '#A335EE', dropChance: 0.04 },
    LEGENDARY: { name: 'Legendary', color: '#FF8000', dropChance: 0.01 }
};

// Ability Cooldowns (milliseconds)
export const COOLDOWNS = {
    BASIC_ATTACK: 1000,
    SPECIAL_ATTACK: 3000,
    ULTIMATE: 60000,
    DODGE: 2000,
    BLOCK: 5000,
    HEAL: 10000
};

// Animation Names
export const ANIMATIONS = {
    IDLE: 'idle',
    WALK: 'walk',
    RUN: 'run',
    JUMP: 'jump',
    FALL: 'fall',
    ATTACK_1: 'attack1',
    ATTACK_2: 'attack2',
    ATTACK_3: 'attack3',
    SPECIAL: 'special',
    HURT: 'hurt',
    DEATH: 'death',
    BLOCK: 'block',
    DODGE: 'dodge'
};

// UI Constants
export const UI = {
    DAMAGE_POPUP_DURATION: 2000,
    NOTIFICATION_DURATION: 3000,
    TOOLTIP_DELAY: 500,
    FADE_DURATION: 300
};

// Physics Constants
export const PHYSICS = {
    GRAVITY: -9.81,
    GROUND_FRICTION: 0.8,
    AIR_FRICTION: 0.95,
    TERMINAL_VELOCITY: -50,
    COLLISION_MARGIN: 0.1
};

// World Constants
export const WORLD = {
    DAY_LENGTH: 1200000, // 20 minutes in milliseconds
    NIGHT_LENGTH: 600000, // 10 minutes
    WEATHER_CHANGE_INTERVAL: 300000, // 5 minutes
    SPAWN_RADIUS: 50,
    DESPAWN_DISTANCE: 100
};

// Quest Types
export const QUEST_TYPES = {
    KILL: 'kill',
    COLLECT: 'collect',
    ESCORT: 'escort',
    DELIVER: 'deliver',
    EXPLORE: 'explore',
    TALK: 'talk'
};

// Quest Status
export const QUEST_STATUS = {
    AVAILABLE: 'available',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed',
    TURNED_IN: 'turned_in'
};

// Damage Types
export const DAMAGE_TYPES = {
    PHYSICAL: 'physical',
    FIRE: 'fire',
    ICE: 'ice',
    LIGHTNING: 'lightning',
    POISON: 'poison',
    HOLY: 'holy',
    SHADOW: 'shadow'
};

// Status Effects
export const STATUS_EFFECTS = {
    BURNING: { name: 'Burning', duration: 5000, tickRate: 1000 },
    FROZEN: { name: 'Frozen', duration: 3000, slowAmount: 0.5 },
    POISONED: { name: 'Poisoned', duration: 10000, tickRate: 1000 },
    STUNNED: { name: 'Stunned', duration: 2000 },
    BLEEDING: { name: 'Bleeding', duration: 8000, tickRate: 1000 },
    BLESSED: { name: 'Blessed', duration: 30000 },
    CURSED: { name: 'Cursed', duration: 30000 }
};

// Sound Categories
export const SOUND = {
    MASTER_VOLUME: 1.0,
    MUSIC_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    AMBIENT_VOLUME: 0.5,
    UI_VOLUME: 0.6
};

// Input Keys
export const KEYS = {
    FORWARD: 'W',
    BACKWARD: 'S',
    LEFT: 'A',
    RIGHT: 'D',
    JUMP: 'Space',
    ATTACK: 'Mouse0',
    SPECIAL: 'Mouse1',
    INTERACT: 'E',
    INVENTORY: 'I',
    CHARACTER: 'C',
    MAP: 'M',
    QUEST_LOG: 'L',
    SETTINGS: 'Escape'
};

// Team/Faction IDs
export const TEAMS = {
    PLAYER: 'player',
    ALLY: 'ally',
    ENEMY: 'enemy',
    NEUTRAL: 'neutral'
};

