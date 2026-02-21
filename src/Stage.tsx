import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";
import { BaseScreen } from "./screens/BaseScreen";

/***
 * Perfect Home Game Stage
 * Tracks witch stats, heroes, servants, manor, inventory, and dungeon progress
 ***/

// Hero status enum
export type HeroStatus = 'free' | 'encountered' | 'captured' | 'converting' | 'servant';

// Location types
export type Location = 'Manor' | 'Town' | 'Woods' | 'Ruins' | 'Circus' | 'Dungeon' | 'Unknown';

// ──────────────────────────────────────────
// STAT SYSTEM — Letter Grades (F- to S++)
// ──────────────────────────────────────────

export type StatName = 'prowess' | 'expertise' | 'attunement' | 'presence' | 'discipline' | 'insight';

export interface StatDefinition {
    name: StatName;
    label: string;
    description: string;
    icon: string;
}

export const STAT_DEFINITIONS: StatDefinition[] = [
    {
        name: 'prowess',
        label: 'Prowess',
        description: 'Physical capability - combat, labor, athletics',
        icon: '⚔️',
    },
    {
        name: 'expertise',
        label: 'Expertise',
        description: 'Skill and craftsmanship - cooking, brewing, crafting',
        icon: '🔧',
    },
    {
        name: 'attunement',
        label: 'Attunement',
        description: 'Magical sensitivity - rituals, potions, mysticism',
        icon: '✨',
    },
    {
        name: 'presence',
        label: 'Presence',
        description: 'Social influence - charm, intimidation, leadership',
        icon: '👑',
    },
    {
        name: 'discipline',
        label: 'Discipline',
        description: 'Self-control and focus - obedience, reliability',
        icon: '🎯',
    },
    {
        name: 'insight',
        label: 'Insight',
        description: 'Perception and learning - teaching, investigation',
        icon: '🔍',
    },
];

// Letter grade tiers (28 grades: F- to S++)
export const GRADE_TIERS = [
    'F-', 'F', 'F+',
    'E-', 'E', 'E+',
    'D-', 'D', 'D+',
    'C-', 'C', 'C+',
    'B-', 'B', 'B+',
    'A-', 'A', 'A+',
    'S-', 'S', 'S+', 'S++',
] as const;

export type StatGrade = typeof GRADE_TIERS[number];

/** Convert 0-100 numeric value to letter grade */
export function numberToGrade(value: number): StatGrade {
    const clamped = Math.max(0, Math.min(100, value));
    
    // F tier: 0-11
    if (clamped <= 3) return 'F-';
    if (clamped <= 7) return 'F';
    if (clamped <= 11) return 'F+';
    
    // E tier: 12-23
    if (clamped <= 15) return 'E-';
    if (clamped <= 19) return 'E';
    if (clamped <= 23) return 'E+';
    
    // D tier: 24-35
    if (clamped <= 27) return 'D-';
    if (clamped <= 31) return 'D';
    if (clamped <= 35) return 'D+';
    
    // C tier: 36-47
    if (clamped <= 39) return 'C-';
    if (clamped <= 43) return 'C';
    if (clamped <= 47) return 'C+';
    
    // B tier: 48-59
    if (clamped <= 51) return 'B-';
    if (clamped <= 55) return 'B';
    if (clamped <= 59) return 'B+';
    
    // A tier: 60-71
    if (clamped <= 63) return 'A-';
    if (clamped <= 67) return 'A';
    if (clamped <= 71) return 'A+';
    
    // S tier: 72-100
    if (clamped <= 79) return 'S-';
    if (clamped <= 89) return 'S';
    if (clamped <= 96) return 'S+';
    return 'S++';
}

/** Convert letter grade to numeric midpoint (for reverse calculations) */
export function gradeToNumber(grade: StatGrade): number {
    const gradeMap: Record<StatGrade, number> = {
        'F-': 2, 'F': 6, 'F+': 10,
        'E-': 14, 'E': 18, 'E+': 22,
        'D-': 26, 'D': 30, 'D+': 34,
        'C-': 38, 'C': 42, 'C+': 46,
        'B-': 50, 'B': 54, 'B+': 58,
        'A-': 62, 'A': 66, 'A+': 70,
        'S-': 76, 'S': 85, 'S+': 93, 'S++': 99,
    };
    return gradeMap[grade] || 50;
}

/** Get color for stat grade tier */
export function getGradeColor(grade: StatGrade): string {
    const tier = grade.charAt(0);
    const colorMap: Record<string, string> = {
        'F': '#e63946',  // Bright Red
        'E': '#77669b',  // Purple
        'D': '#4e659e',  // Blue
        'C': '#298f7f',  // Cyan
        'B': '#228417',  // Lime Green
        'A': '#ff9100',  // Orange-Yellow
        'S': '#ffdd00',  // Gold
    };
    return colorMap[tier] || '#888';
}

export function getStatColor(statName: StatName): string {
    const colorMap: Record<StatName, string> = {
        'prowess': '#c74e4e',      // Red - Physical/Combat
        'expertise': '#d87833',    // Orange - Crafting/Skill
        'attunement': '#9971bf',   // Purple - Magic/Mysticism
        'presence': '#cebe7d',     // Yellow/Gold - Social/Leadership
        'discipline': '#4fba83',   // Blue - Self-control/Focus
        'insight': '#6ca0db',      // Green - Perception/Learning
    };
    return colorMap[statName] || '#888';
}

export type TraitScope = 'character' | 'role' | 'room' | 'situational';

export interface TraitDefinition {
    name: string;
    scope: TraitScope;
    summary: string;
    properties: string[];
    effects: string[];
}

export const TRAIT_REGISTRY: Record<string, TraitDefinition> = {
    enchantress: { name: 'Enchantress', scope: 'character', summary: 'Naturally manipulative magical presence.', properties: ['Arcane social pressure', 'High charisma aura'], effects: ['Improves persuasion outcomes in social scenes', 'Increases conversion momentum in narrative checks'] },
    cunning: { name: 'Cunning', scope: 'character', summary: 'Quick to exploit weaknesses and opportunities.', properties: ['Adaptive planning', 'Reads intent quickly'], effects: ['Better outcomes in deception and negotiation events', 'Boosts tactical options in scene generation'] },
    ambitious: { name: 'Ambitious', scope: 'character', summary: 'Driven to expand control and influence.', properties: ['Goal-focused behavior', 'High initiative'], effects: ['Prioritizes expansion and high-value actions', 'Increases pressure in long-term progression'] },
    charismatic: { name: 'Charismatic', scope: 'character', summary: 'Magnetic personality that draws others in.', properties: ['Social magnetism', 'Commanding tone'], effects: ['Raises success chance for rapport-building actions', 'Improves loyalty gains from interactions'] },
    possessive: { name: 'Possessive', scope: 'character', summary: 'Protective and controlling toward assets and allies.', properties: ['Territorial mindset', 'Protective dominance'], effects: ['Strengthens retention of converted characters', 'Can increase tension in contested scenes'] },
    devoted: { name: 'Devoted', scope: 'role', summary: 'Steadfast dedication to assigned duties.', properties: ['Reliable execution', 'Loyal temperament'], effects: ['Improves consistency of role output', 'Increases loyalty-oriented role efficiency'] },
    meticulous: { name: 'Meticulous', scope: 'role', summary: 'Careful and exacting in daily work.', properties: ['Detail-oriented', 'Low error rate'], effects: ['Improves storage/organization style role outcomes', 'Reduces inefficiency in upkeep routines'] },
    cheerful: { name: 'Cheerful', scope: 'character', summary: 'Maintains a bright and positive demeanor.', properties: ['Mood stabilizer', 'Friendly tone'], effects: ['Improves household morale flavor outcomes', 'Softens conflict-heavy dialogue beats'] },
    perceptive: { name: 'Perceptive', scope: 'character', summary: 'Notices subtle cues and hidden intent.', properties: ['Pattern recognition', 'Situational awareness'], effects: ['Improves discovery and insight-style checks', 'Better event interpretation in scenes'] },
    territorial: { name: 'Territorial', scope: 'character', summary: 'Protective over domain and hierarchy.', properties: ['Boundary enforcement', 'Status sensitivity'], effects: ['Increases defensive behavior in manor events', 'Strengthens reactions to intrusions'] },
    stoic: { name: 'Stoic', scope: 'character', summary: 'Emotionally controlled under pressure.', properties: ['Composed mindset', 'Stress resistance'], effects: ['Improves performance in high-pressure moments', 'Reduces volatility in adverse events'] },
    vigilant: { name: 'Vigilant', scope: 'role', summary: 'Constantly alert to risks and anomalies.', properties: ['Watchful discipline', 'Early warning focus'], effects: ['Improves security-oriented role contributions', 'Raises chance to catch negative events early'] },
    disciplined: { name: 'Disciplined', scope: 'character', summary: 'Strong self-control and routine adherence.', properties: ['Routine consistency', 'Controlled impulses'], effects: ['Improves reliability of assigned task completion', 'Synergizes with training and structured roles'] },
    resourceful: { name: 'Resourceful', scope: 'character', summary: 'Finds solutions with limited tools.', properties: ['Improvisation', 'Efficiency-minded'], effects: ['Improves fallback outcomes when resources are low', 'Increases utility in multi-role scenarios'] },
    loyal: { name: 'Loyal', scope: 'character', summary: 'Highly faithful to chosen leadership.', properties: ['Stable allegiance', 'Low betrayal risk'], effects: ['Improves loyalty retention over time', 'Reinforces team cohesion in events'] },
    elusive: { name: 'Elusive', scope: 'character', summary: 'Hard to predict or pin down.', properties: ['Evasive behavior', 'Low readability'], effects: ['Improves resistance to direct control attempts', 'Increases escape/avoidance flavor outcomes'] },
    witty: { name: 'Witty', scope: 'character', summary: 'Sharp verbal intelligence and timing.', properties: ['Quick retorts', 'Social dexterity'], effects: ['Improves conversational leverage in dialogue scenes', 'Enhances social event quality'] },
    distrustful: { name: 'Distrustful', scope: 'character', summary: 'Slow to accept motives at face value.', properties: ['High skepticism', 'Defensive interpretation'], effects: ['Raises resistance to persuasion effects', 'Increases caution in relationship progress'] },
    agile: { name: 'Agile', scope: 'character', summary: 'Fast and responsive in action.', properties: ['Quick movement', 'Rapid reaction'], effects: ['Improves speed-oriented checks and actions', 'Increases flexibility in dynamic scenarios'] },
    defiant: { name: 'Defiant', scope: 'character', summary: 'Resists authority and imposed structure.', properties: ['High willpower', 'Oppositional streak'], effects: ['Increases resistance against conversion pressure', 'Triggers stronger pushback flavor responses'] },
    compassionate: { name: 'Compassionate', scope: 'character', summary: 'Strong empathy toward others.', properties: ['Empathic insight', 'Protective kindness'], effects: ['Improves supportive interaction outcomes', 'Can reduce harsh-scene escalation'] },
    devout: { name: 'Devout', scope: 'character', summary: 'Guided by strong faith and conviction.', properties: ['Doctrinal adherence', 'Moral certainty'], effects: ['Improves resolve in value-conflict scenes', 'Adds resilience against corruption flavor checks'] },
    gentle: { name: 'Gentle', scope: 'character', summary: 'Soft approach that avoids unnecessary force.', properties: ['Calm tone', 'De-escalation tendency'], effects: ['Improves peaceful resolution paths', 'Lowers antagonistic tone in dialogue'] },
    stubborn: { name: 'Stubborn', scope: 'character', summary: 'Difficult to sway once decided.', properties: ['High persistence', 'Rigid preferences'], effects: ['Improves persistence in personal objectives', 'Reduces susceptibility to opposing influence'] },
    selfless: { name: 'Selfless', scope: 'character', summary: 'Prioritizes others over personal comfort.', properties: ['Sacrificial mindset', 'Support-first behavior'], effects: ['Improves team-benefit outcomes', 'Can trade personal gain for group stability'] },
    fierce: { name: 'Fierce', scope: 'character', summary: 'Intense and intimidating in confrontation.', properties: ['Aggressive confidence', 'High threat projection'], effects: ['Improves intimidation-forward interactions', 'Increases combat-adjacent narrative pressure'] },
    impulsive: { name: 'Impulsive', scope: 'character', summary: 'Acts quickly before full deliberation.', properties: ['Fast decision-making', 'Risk-prone choices'], effects: ['Can accelerate scene transitions', 'May cause unstable outcomes in careful tasks'] },
    fearless: { name: 'Fearless', scope: 'character', summary: 'Unafraid in dangerous or stressful conditions.', properties: ['Low fear response', 'High bravery'], effects: ['Improves outcomes in high-risk scenes', 'Reduces fear-based penalties in narrative checks'] },
    proud: { name: 'Proud', scope: 'character', summary: 'Strong sense of dignity and status.', properties: ['Honor sensitivity', 'Status-conscious behavior'], effects: ['Improves performance when respected', 'Can trigger friction when slighted'] },
    restless: { name: 'Restless', scope: 'character', summary: 'Needs movement and change to stay engaged.', properties: ['Low tolerance for idle time', 'High activity drive'], effects: ['Improves active-task throughput flavor', 'Reduces efficiency during passive assignments'] },
    nourishing: { name: 'Nourishing', scope: 'room', summary: 'Enhances wellbeing through food and care.', properties: ['Sustenance focus', 'Recovery support'], effects: ['Boosts comfort and morale-oriented room effects', 'Improves household upkeep quality in kitchen loops'] },
    hardworking: { name: 'Hardworking', scope: 'room', summary: 'Sustains output through demanding workloads.', properties: ['High stamina', 'Task persistence'], effects: ['Improves routine productivity for labor-heavy roles', 'Reduces downtime from repetitive tasks'] },
    alchemist: { name: 'Alchemist', scope: 'room', summary: 'Skilled at reagents, mixtures, and brews.', properties: ['Formula precision', 'Reagent optimization'], effects: ['Improves brewing and potion-oriented room outcomes', 'Increases reagent efficiency in crafting loops'] },
    educator: { name: 'Educator', scope: 'room', summary: 'Specialized in instruction and skill transfer.', properties: ['Teaching discipline', 'Structured lessons'], effects: ['Improves training progression and obedience growth', 'Raises value of classroom interactions'] },
    organized: { name: 'Organized', scope: 'room', summary: 'Maintains orderly systems and scheduling.', properties: ['Process clarity', 'Inventory structure'], effects: ['Improves assignment and storage efficiency', 'Reduces operational friction in manor routines'] },
    occultist: { name: 'Occultist', scope: 'room', summary: 'Practiced in arcane ritual procedures.', properties: ['Ritual expertise', 'Corruption tolerance'], effects: ['Improves ritual chamber performance', 'Amplifies ritual power-oriented effects'] },
    'beast friend': { name: 'Beast Friend', scope: 'room', summary: 'Naturally effective with animals and mounts.', properties: ['Animal handling', 'Calming presence'], effects: ['Improves stable-related outputs', 'Enhances creature care and travel support'] },
    intimidating: { name: 'Intimidating', scope: 'room', summary: 'Projects fear and authority.', properties: ['Threat presence', 'Dominance posture'], effects: ['Improves dungeon pressure/interrogation flavor outcomes', 'Increases fear-aligned role impact'] },
    relentless: { name: 'Relentless', scope: 'room', summary: 'Applies steady pressure without fatigue.', properties: ['Unyielding persistence', 'Low burnout'], effects: ['Improves containment and resistance-break style effects', 'Sustains long-duration control operations'] },
    charming: { name: 'Charming', scope: 'room', summary: 'Creates rapport quickly in social spaces.', properties: ['Social warmth', 'Persuasive style'], effects: ['Improves lounge/social influence style outcomes', 'Increases loyalty-leaning interaction effects'] },
};

function normalizeTraitKey(traitName: string): string {
    return traitName.trim().toLowerCase();
}

export function getTraitDefinition(traitName: string): TraitDefinition {
    const key = normalizeTraitKey(traitName);
    const found = TRAIT_REGISTRY[key];
    if (found) {
        return found;
    }
    return {
        name: traitName,
        scope: 'situational',
        summary: 'A unique trait with custom narrative behavior.',
        properties: ['Character-specific behavior'],
        effects: ['Applies context-dependent bonuses or penalties'],
    };
}

// Hero information
export interface Hero {
    name: string;
    status: HeroStatus;
    brainwashing: number; // 0-100 — golden spiral progress
    heroClass: string;
    avatar: string;
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
    stats: Record<StatName, number>; // 0-100 values
    location?: string;
}

// Role definition — permanent (reassignable) fixture for a servant
export interface Role {
    id: string;               // Unique role key, e.g. 'head_cook'
    name: string;             // Display name, e.g. 'Head Cook'
    description: string;      // Flavour text
    roomType: string | null;  // null = universal role, otherwise the room type it belongs to
    buffs: RoleBuff[];        // Stat bonuses granted
    traits: string[];         // Narrative traits granted, e.g. ['Disciplined']
    icon: string;             // Emoji icon
    unique: boolean;          // true = only one servant can hold this role at a time
    color: string;            // Role-specific display color
}

export interface RoleBuff {
    stat: string;             // e.g. 'comfort', 'obedience', 'loyalty'
    value: number;            // Amount
    label: string;            // Display text, e.g. '+5 Comfort'
}

// ──────────────────────────────────────────
// Universal Roles — always available
// ──────────────────────────────────────────
export const UNIVERSAL_ROLES: Role[] = [
    {
        id: 'personal_attendant',
        name: 'Personal Attendant',
        description: 'Serves the master directly, tending to personal needs and errands.',
        roomType: null,
        buffs: [
            { stat: 'loyalty', value: 5, label: '+5 Loyalty' },
            { stat: 'comfort', value: 2, label: '+2 Comfort' },
        ],
        traits: ['Devoted'],
        icon: '🫅',
        unique: true,
        color: '#d4a0e0',
    },
    {
        id: 'groundskeeper',
        name: 'Groundskeeper',
        description: 'Maintains the manor grounds, gardens, and perimeter security.',
        roomType: null,
        buffs: [
            { stat: 'comfort', value: 3, label: '+3 Comfort' },
            { stat: 'security', value: 2, label: '+2 Security' },
        ],
        traits: ['Vigilant'],
        icon: '🌿',
        unique: true,
        color: '#7ab87a',
    },
];

// ──────────────────────────────────────────
// Room Roles — keyed by room type
// A room type unlocks its roles; duplicates of the same room don't duplicate roles.
// ──────────────────────────────────────────
export const ROOM_ROLES: Record<string, Role[]> = {
    kitchen: [
        {
            id: 'head_cook',
            name: 'Head Cook',
            description: 'Oversees meal preparation and keeps the kitchen running smoothly.',
            roomType: 'kitchen',
            buffs: [
                { stat: 'morale', value: 4, label: '+4 Morale' },
                { stat: 'comfort', value: 2, label: '+2 Comfort' },
            ],
            traits: ['Nourishing'],
            icon: '👨‍🍳',
            unique: true,
            color: '#e8a85d',
        },
        {
            id: 'scullery_hand',
            name: 'Scullery Hand',
            description: 'Handles the dirty work in the kitchen — washing, scrubbing, peeling.',
            roomType: 'kitchen',
            buffs: [
                { stat: 'kitchen_efficiency', value: 3, label: '+3 Kitchen Efficiency' },
            ],
            traits: ['Hardworking'],
            icon: '🧹',
            unique: false,
            color: '#b8956a',
        },
    ],
    brewing: [
        {
            id: 'brewmaster',
            name: 'Brewmaster',
            description: 'An expert at preparing potions, tonics, and other mysterious concoctions.',
            roomType: 'brewing',
            buffs: [
                { stat: 'potion_potency', value: 5, label: '+5 Potion Potency' },
                { stat: 'reagents', value: 2, label: '+2 Reagent Yield' },
            ],
            traits: ['Alchemist'],
            icon: '⚗️',
            unique: true,
            color: '#7dd4a0',
        },
    ],
    classroom: [
        {
            id: 'instructor',
            name: 'Instructor',
            description: 'Conducts lessons and training sessions for the household.',
            roomType: 'classroom',
            buffs: [
                { stat: 'obedience', value: 3, label: '+3 Obedience (all)' },
                { stat: 'skills', value: 2, label: '+2 Skill Training' },
            ],
            traits: ['Educator'],
            icon: '📖',
            unique: true,
            color: '#7db8d4',
        },
    ],
    quarters: [
        {
            id: 'quartermaster',
            name: 'Quartermaster',
            description: 'Manages servant housing, assignments, and daily routines.',
            roomType: 'quarters',
            buffs: [
                { stat: 'servant_capacity', value: 5, label: '+5 Servant Capacity' },
                { stat: 'obedience', value: 2, label: '+2 Obedience' },
            ],
            traits: ['Organized'],
            icon: '🛏️',
            unique: true,
            color: '#a8b8d0',
        },
    ],
    ritual: [
        {
            id: 'ritual_keeper',
            name: 'Ritual Keeper',
            description: 'Maintains the ritual chamber and assists with dark ceremonies.',
            roomType: 'ritual',
            buffs: [
                { stat: 'ritual_power', value: 4, label: '+4 Ritual Power' },
                { stat: 'corruption', value: 3, label: '+3 Corruption' },
            ],
            traits: ['Occultist'],
            icon: '⛧',
            unique: true,
            color: '#c46ac4',
        },
    ],
    storage: [
        {
            id: 'stockkeeper',
            name: 'Stockkeeper',
            description: 'Keeps meticulous track of all stored goods and supplies.',
            roomType: 'storage',
            buffs: [
                { stat: 'item_capacity', value: 10, label: '+10 Item Capacity' },
                { stat: 'organization', value: 3, label: '+3 Organization' },
            ],
            traits: ['Meticulous'],
            icon: '📦',
            unique: true,
            color: '#c4a86a',
        },
    ],
    stable: [
        {
            id: 'stablehand',
            name: 'Stablehand',
            description: 'Tends to the creatures in the stable, ensuring they are fed and healthy.',
            roomType: 'stable',
            buffs: [
                { stat: 'creature_care', value: 4, label: '+4 Creature Care' },
                { stat: 'travel_speed', value: 2, label: '+2 Travel Speed' },
            ],
            traits: ['Beast Friend'],
            icon: '🐴',
            unique: false,
            color: '#8a6e4a',
        },
    ],
    dungeon: [
        {
            id: 'warden',
            name: 'Warden',
            description: 'Oversees the dungeon, ensuring prisoners are contained and interrogations run smoothly.',
            roomType: 'dungeon',
            buffs: [
                { stat: 'interrogation', value: 4, label: '+4 Interrogation' },
                { stat: 'fear', value: 3, label: '+3 Fear' },
            ],
            traits: ['Intimidating'],
            icon: '⛓️',
            unique: true,
            color: '#8a5a5a',
        },
    ],
    cell: [
        {
            id: 'jailer',
            name: 'Jailer',
            description: 'Watches over the cells, wearing down captive resistance day by day.',
            roomType: 'cell',
            buffs: [
                { stat: 'resistance_break', value: 3, label: '+3 Resistance Breakdown' },
                { stat: 'fear', value: 2, label: '+2 Fear' },
            ],
            traits: ['Relentless'],
            icon: '🔒',
            unique: false,
            color: '#7a6a8a',
        },
    ],
    lounge: [
        {
            id: 'host',
            name: 'Host',
            description: 'Welcomes visitors and ensures everyone in the lounge feels at ease.',
            roomType: 'lounge',
            buffs: [
                { stat: 'social', value: 4, label: '+4 Social' },
                { stat: 'loyalty', value: 3, label: '+3 Loyalty' },
            ],
            traits: ['Charming'],
            icon: '🛋️',
            unique: true,
            color: '#d4a07d',
        },
    ],
};

/** Flat list of all roles (universal + room) for lookup purposes */
export const ROLE_REGISTRY: Role[] = [
    ...UNIVERSAL_ROLES,
    ...Object.values(ROOM_ROLES).flat(),
];

/** Look up a role by id */
export function getRoleById(roleId: string): Role | undefined {
    return ROLE_REGISTRY.find(r => r.id === roleId);
}

/** Get all roles available for a given set of built room types (de-duplicated by role id) */
export function getAvailableRoles(builtRoomTypes: string[]): Role[] {
    const roles: Role[] = [...UNIVERSAL_ROLES];
    const seen = new Set(roles.map(r => r.id));
    for (const roomType of builtRoomTypes) {
        const roomRoles = ROOM_ROLES[roomType];
        if (roomRoles) {
            for (const role of roomRoles) {
                if (!seen.has(role.id)) {
                    seen.add(role.id);
                    roles.push(role);
                }
            }
        }
    }
    return roles;
}

/** Default room types that are built in a fresh manor (before any saves) */
const DEFAULT_BUILT_ROOM_TYPES = [
    'ritual', 'quarters', 'classroom', 'storage', 'kitchen',
    'lounge', 'brewing', 'stable', 'dungeon', 'cell',
];

// Servant information
export interface Servant {
    name: string;
    formerClass: string;
    avatar: string;
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
    stats: Record<StatName, number>; // 0-100 values
    love: number; // 0-100
    obedience: number; // 0-100
    assignedTask?: string;
    assignedRole?: string; // role id from ROLE_REGISTRY
}

// Player character info
export interface PlayerCharacter {
    name: string;
    avatar: string;
    title: string;
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
}

// Chub.ai configuration
export const CHUB_USER = 'Sauron275';

// Character IDs and slugs on chub.ai
export const CHUB_CHARACTER_IDS: Record<string, { id: string; slug: string }> = {
    citrine: { id: '9731bb4e10d9', slug: 'citrine' },
    felicity: { id: '79e6007def5a', slug: 'felicity' },
    locke: { id: 'ea98d94e3965', slug: 'locke' },
    sable: { id: '62ce8e0d06a3', slug: 'sable' },
    veridian: { id: 'ef8cef32f1ff', slug: 'the-cleric' },
    kova: { id: '24e3aa6fd485', slug: 'the-barbarian' },
    pervis: { id: '8e93f3bc4f21', slug: 'the-leader' },
};

// Dynamically construct chub.ai avatar URL
export function getChubAvatarUrl(characterKey: string): string {
    const char = CHUB_CHARACTER_IDS[characterKey.toLowerCase()];
    if (!char) return '';
    return `https://avatars.charhub.io/avatars/${CHUB_USER}/${char.slug}-${char.id}/chara_card_v2.png`;
}

// Avatar URLs (dynamically generated)
export const CHUB_AVATARS = {
    citrine: getChubAvatarUrl('citrine'),
    felicity: getChubAvatarUrl('felicity'),
    locke: getChubAvatarUrl('locke'),
    sable: getChubAvatarUrl('sable'),
    veridian: getChubAvatarUrl('veridian'),
    kova: getChubAvatarUrl('kova'),
    pervis: getChubAvatarUrl('pervis'),
};

// Character bio/profile data
export const CHARACTER_DATA: Record<string, { 
    color: string; 
    description: string; 
    traits: string[]; 
    details: Record<string, string>;
    stats: Record<StatName, number>;
}> = {
    Citrine: {
        color: '#8a7abf',
        description: 'A cunning and enigmatic gray cat witch who has claimed dominion over a crumbling manor on the edge of the wilds. Citrine bends the will of wandering heroes to serve his household, weaving subtle enchantments and honeyed words to convert them into loyal servants. His silvery fur and piercing violet eyes belie a mind that is always three steps ahead. Though his methods are questionable, he seeks to restore the manor to its former grandeur — one thrall at a time.',
        traits: ['Enchantress', 'Cunning', 'Ambitious', 'Charismatic', 'Possessive'],
        details: {
            'Species': 'Gray Cat',
            'Gender': '♂ Male',
            'Class': 'Witch',
            'Affinity': 'Mind Magic',
            'Alignment': 'Lawful Evil',
            'Goal': 'Restore the manor to glory',
        },
        stats: {
            prowess: 52,
            expertise: 45,
            attunement: 88,
            presence: 82,
            discipline: 78,
            insight: 75,
        },
    },
    Felicity: {
        color: '#e85d9a',
        description: 'A dainty pink-furred cat with an ever-present smile and an unsettling devotion to her master. Felicity was the first to fall under Citrine’s spell and now serves as the manor’s head handmaiden with frightening efficiency. Her bubbly demeanor hides a razor-sharp attention to detail — nothing escapes her notice, and no dust mote survives her wrath.',
        traits: ['Devoted', 'Meticulous', 'Cheerful', 'Perceptive', 'Territorial'],
        details: {
            'Species': 'Pink Cat',
            'Gender': '♀ Female',
            'Former Role': 'Handmaiden',
            'Specialty': 'Household Management',
            'Loyalty': 'Absolute',
            'Quirk': 'Hums while she cleans',
        },
        stats: {
            prowess: 38,
            expertise: 85,
            attunement: 28,
            presence: 58,
            discipline: 90,
            insight: 68,
        },
    },
    Locke: {
        color: '#6a8caf',
        description: 'A stoic gray fox with steely blue eyes and impeccable posture. Locke serves as the manor’s butler, managing affairs with a quiet efficiency that borders on unnerving. Before falling to Citrine’s enchantments, he was a renowned scout — skills he now applies to keeping the manor’s perimeter secure and its secrets well hidden. He speaks little, but when he does, every word carries weight.',
        traits: ['Stoic', 'Vigilant', 'Disciplined', 'Resourceful', 'Loyal'],
        details: {
            'Species': 'Gray Fox',
            'Gender': '♂ Male',
            'Former Role': 'Butler',
            'Specialty': 'Security & Logistics',
            'Loyalty': 'Unwavering',
            'Quirk': 'Polishes silverware when thinking',
        },
        stats: {
            prowess: 62,
            expertise: 72,
            attunement: 32,
            presence: 66,
            discipline: 94,
            insight: 76,
        },
    },
    Sable: {
        color: '#c4943a',
        description: 'A quick-witted tabby cat with amber-streaked fur and a cocky grin. Sable earned his reputation as one of the most elusive thieves in the region, slipping through traps and guards with feline grace. He trusts no one fully and keeps a dagger hidden in every pocket. Citrine sees his agility and cunning as perfect servant material — if he can ever be caught and broken.',
        traits: ['Elusive', 'Witty', 'Distrustful', 'Agile', 'Defiant'],
        details: {
            'Species': 'Tabby Cat',
            'Gender': '♂ Male',
            'Class': 'Thief',
            'Specialty': 'Stealth & Lockpicking',
            'Weakness': 'Overconfidence',
            'Quirk': 'Flicks his tail when lying',
        },
        stats: {
            prowess: 68,
            expertise: 74,
            attunement: 24,
            presence: 60,
            discipline: 22,
            insight: 72,
        },
    },
    Veridian: {
        color: '#4a9e6a',
        description: 'A gentle doe with soft brown fur dappled in pale spots, Veridian radiates a quiet warmth that can mend wounds and ease troubled minds. As a devout cleric of the Forest Shrine, she travels the wilds healing the sick and protecting the innocent. Her compassion may be her greatest strength \u2014 but also the very thing Citrine intends to exploit.',
        traits: ['Compassionate', 'Devout', 'Gentle', 'Stubborn', 'Selfless'],
        details: {
            'Species': 'Deer',            'Gender': '♀ Female',            'Class': 'Cleric',
            'Specialty': 'Healing & Warding',
            'Weakness': 'Trusts too easily',
            'Quirk': 'Ears twitch when sensing danger',
        },
        stats: {
            prowess: 42,
            expertise: 50,
            attunement: 80,
            presence: 70,
            discipline: 65,
            insight: 74,
        },
    },
    Kova: {
        color: '#b84a4a',
        description: 'A towering gray wolf with battle scars carved across her muzzle and arms. Kova lives for the thrill of combat and the roar of the crowd. As a barbarian mercenary, she fears nothing \u2014 except boredom. Her raw strength is unmatched, but her impulsive nature leaves her vulnerable to subtler forms of manipulation. Citrine will need more than words to tame this beast.',
        traits: ['Fierce', 'Impulsive', 'Fearless', 'Proud', 'Restless'],
        details: {
            'Species': 'Wolf',            'Gender': '♀ Female',            'Class': 'Barbarian',
            'Specialty': 'Raw Strength & Intimidation',
            'Weakness': 'Easily provoked',
            'Quirk': 'Howls at the moon involuntarily',
        },
        stats: {
            prowess: 92,
            expertise: 32,
            attunement: 18,
            presence: 76,
            discipline: 28,
            insight: 40,
        },
    },
    Pervis: {
        color: '#5a6abf',
        description: 'A composed and calculating rabbit with sleek white fur and piercing sapphire eyes. Pervis leads the hero party with a strategic mind and an iron will, always ten moves ahead of any adversary. Beneath the calm exterior lies a fierce determination to protect his companions at any cost. Citrine considers him the most dangerous \u2014 and the most valuable \u2014 prize.',
        traits: ['Strategic', 'Composed', 'Protective', 'Stubborn', 'Charismatic'],
        details: {
            'Species': 'Bunny',            'Gender': '♂ Male',            'Class': 'Leader',
            'Specialty': 'Tactics & Inspiration',
            'Weakness': 'Cannot abandon allies',
            'Quirk': 'Nose wiggles when plotting',
        },
        stats: {
            prowess: 58,
            expertise: 46,
            attunement: 38,
            presence: 84,
            discipline: 70,
            insight: 82,
        },
    },
};

// Manor upgrade
export interface ManorUpgrade {
    name: string;
    level: number;
    description?: string;
}

// Inventory system
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'equipment' | 'consumable' | 'material' | 'key' | 'currency';

export interface ItemDefinition {
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    icon: string;
    description: string;
    stackable: boolean;
    maxStack: number;
}

export interface InventoryItem {
    name: string;
    quantity: number;
    type?: string;
}

// Item registry — canonical definitions for all items
export const ITEM_REGISTRY: Record<string, ItemDefinition> = {
    'Hypnotic Pendant': {
        name: 'Hypnotic Pendant',
        type: 'equipment',
        rarity: 'epic',
        icon: '🔮',
        description: 'A golden pendant enchanted with a mesmerizing spiral pattern. Amplifies the wearer\'s hypnotic influence over weak-willed targets.',
        stackable: false,
        maxStack: 1,
    },
    'Arcane Visor': {
        name: 'Arcane Visor',
        type: 'equipment',
        rarity: 'legendary',
        icon: '👓',
        description: 'Citrine\'s signature headset. Projects a golden spiral directly into the target\'s vision, bypassing natural mental defenses.',
        stackable: false,
        maxStack: 1,
    },
    'Mana Crystal': {
        name: 'Mana Crystal',
        type: 'material',
        rarity: 'uncommon',
        icon: '💎',
        description: 'A shard of crystallized arcane energy. Used in enchanting and manor upgrades.',
        stackable: true,
        maxStack: 99,
    },
    'Obedience Elixir': {
        name: 'Obedience Elixir',
        type: 'consumable',
        rarity: 'rare',
        icon: '🧪',
        description: 'A shimmering golden potion that temporarily heightens suggestibility. Increases brainwashing progress when administered.',
        stackable: true,
        maxStack: 10,
    },
    'Servant Collar': {
        name: 'Servant Collar',
        type: 'equipment',
        rarity: 'rare',
        icon: '⭕',
        description: 'An ornate collar inscribed with binding runes. Worn by fully converted servants as a mark of devotion.',
        stackable: true,
        maxStack: 5,
    },
    'Spiral Incense': {
        name: 'Spiral Incense',
        type: 'consumable',
        rarity: 'uncommon',
        icon: '🌀',
        description: 'Burns with a hypnotic golden smoke that fills a room. Creates an atmosphere conducive to conditioning.',
        stackable: true,
        maxStack: 20,
    },
    'Enchanted Shackles': {
        name: 'Enchanted Shackles',
        type: 'key',
        rarity: 'rare',
        icon: '⛓️',
        description: 'Arcane restraints that dampen a captive\'s willpower. Required to hold particularly strong-willed heroes.',
        stackable: true,
        maxStack: 5,
    },
    'Gold Coin': {
        name: 'Gold Coin',
        type: 'currency',
        rarity: 'common',
        icon: '🪙',
        description: 'Standard currency. Used for manor improvements, hiring, and trade.',
        stackable: true,
        maxStack: 9999,
    },
    'Dreamcatcher Herb': {
        name: 'Dreamcatcher Herb',
        type: 'material',
        rarity: 'common',
        icon: '🌿',
        description: 'A fragrant herb found in the woods. Used to brew potions and burn as incense.',
        stackable: true,
        maxStack: 50,
    },
    'Memory Fragment': {
        name: 'Memory Fragment',
        type: 'key',
        rarity: 'epic',
        icon: '✨',
        description: 'A shard of a hero\'s memories, extracted during conditioning. Can be used to unlock deeper obedience or returned to restore free will.',
        stackable: true,
        maxStack: 10,
    },
};

export function getItemDefinition(itemName: string): ItemDefinition {
    return ITEM_REGISTRY[itemName] || {
        name: itemName,
        type: 'material' as ItemType,
        rarity: 'common' as ItemRarity,
        icon: '📦',
        description: 'An unknown item.',
        stackable: true,
        maxStack: 99,
    };
}

export function getRarityColor(rarity: ItemRarity): string {
    switch (rarity) {
        case 'common': return '#b0b0b0';
        case 'uncommon': return '#5aaa5a';
        case 'rare': return '#5a8aee';
        case 'epic': return '#b45aee';
        case 'legendary': return '#ee9a2a';
    }
}

// Dungeon progress
export interface DungeonProgress {
    currentFloor: number;
    maxFloor: number;
    lastBoss?: string;
}

// ==========================================
// Event System
// ==========================================

/** Effect applied when entering a step or choosing an option */
export interface EventEffect {
    type:
        | 'modify_brainwashing'   // target = hero name, value = delta
        | 'modify_love'           // target = servant name, value = delta
        | 'modify_obedience'      // target = servant name, value = delta
        | 'modify_gold'           // value = delta
        | 'add_item'              // target = item name, value = quantity
        | 'remove_item'           // target = item name, value = quantity
        | 'set_hero_status'       // target = hero name, value unused, status field
        | 'convert_to_servant'    // target = hero name
        | 'modify_skill'          // target = skill key (power/wisdom/charm/speed), value = delta
        | 'custom';               // handled by caller
    target?: string;
    value?: number;
    status?: string;
}

/** Skill check that gates a choice or determines branching */
export interface EventSkillCheck {
    skill: keyof SkillStats;      // power | wisdom | charm | speed
    difficulty: number;           // 1-100 DC
    successStep: string;          // step id on success
    failureStep: string;          // step id on failure
    /** bonus/penalty from items, traits, etc. (added to roll) */
    modifier?: number;
}

/** Chat phase config — opens AI roleplay within an event step */
export interface EventChatPhase {
    context: string;             // Instructions for LLM (supports {target}, {pc} placeholders)
    speaker: string;             // Character name the AI plays as (supports {target}, {pc})
    location?: string;           // Background location override for chat UI
    skippable: boolean;          // Whether the player can skip the chat
    minMessages?: number;        // Min exchanges before skip/end available (default 0)
    maxMessages?: number;        // Auto-end chat after this many exchanges
}

// ==========================================
// Conditioning System
// ==========================================

/** Category of conditioning action */
export type ConditioningCategory = 'hypnosis' | 'physical' | 'alchemy' | 'social' | 'reward';

/** An action the player can take during a conditioning chat session */
export interface ConditioningAction {
    id: string;
    label: string;
    icon: string;
    tooltip: string;
    category: ConditioningCategory;
    requiresItem?: string;        // Must have this item to see/use
    consumeItem?: string;         // Consume 1 of this item on use
    skillCheck?: {                // Optional skill check
        skill: keyof SkillStats;
        difficulty: number;
    };
    brainwashingDelta: number;    // Progress on success
    failDelta: number;            // Progress on failure (usually 0)
    minBrainwashing: number;      // Unlock threshold (0 = always available)
    maxBrainwashing?: number;     // Disappears above this value
    cooldownMessages: number;     // Messages before reuse (0 = no cooldown)
    llmDirective: string;         // Injected into LLM context on success (supports {target}/{pc})
    failDirective?: string;       // Injected into LLM context on failure
}

/** Result of executing a conditioning action */
export interface ActionResult {
    actionId: string;
    success: boolean;
    delta: number;
    message: string;              // Player-visible result text
    skillCheck?: {
        skill: string;
        roll: number;
        difficulty: number;
        success: boolean;
    };
    newBrainwashing: number;      // Updated value after delta
    thresholdCrossed?: string;    // e.g. 'wavering' if a new tier was reached
}

/** Strategy the player picks at the start of a conditioning session */
export interface ConditioningStrategy {
    id: string;
    label: string;
    icon: string;
    color: string;                // Accent color for UI
    tooltip: string;
    description: string;          // Short UI hint shown during selection
    llmContext: string;           // Long-form instructions for LLM about tone/approach
    bonusActions?: string[];      // Extra action IDs only available with this strategy
    skillBonus?: {
        skill: keyof SkillStats;
        bonus: number;
    };
}

/** Conditioning behavior threshold tier */
export type ConditioningTier = 'defiant' | 'wavering' | 'susceptible' | 'broken';

/** Get conditioning tier from brainwashing value */
export function getConditioningTier(brainwashing: number): ConditioningTier {
    if (brainwashing >= 75) return 'broken';
    if (brainwashing >= 50) return 'susceptible';
    if (brainwashing >= 25) return 'wavering';
    return 'defiant';
}

/** Get a description of behaviour for the LLM based on tier */
export function getTierBehaviorDescription(tier: ConditioningTier): string {
    switch (tier) {
        case 'defiant':
            return 'The captive is fully resistant. They are hostile, defiant, and actively fight against any attempts at control. They mock, threaten, and refuse to cooperate. Their willpower is intact.';
        case 'wavering':
            return 'The captive\'s resistance is cracking. They still fight, but hesitate at times. They may slip into moments of compliance before catching themselves. They are confused by their own reactions and frustrated by lapses in their defiance. They might find themselves obeying before they realize it.';
        case 'susceptible':
            return 'The captive has lost most of their resistance. They comply more often than they resist. They may still voice objections but their body obeys. They seek approval despite themselves, and feel anxiety when displeasing their captor. Moments of genuine submission emerge naturally.';
        case 'broken':
            return 'The captive\'s will is effectively broken. They are docile, obedient, and eager to please. They may still have flickers of their old personality, but these manifest as endearing quirks rather than genuine defiance. They actively seek praise and become distressed if they think they\'ve disappointed their master.';
    }
}

// ---- Conditioning Strategies Registry ----
export const CONDITIONING_STRATEGIES: Record<string, ConditioningStrategy> = {
    gentle: {
        id: 'gentle',
        label: 'Gentle Persuasion',
        icon: '🌀',
        color: '#a78bfa',
        tooltip: 'Soft words, soothing spirals, and patient coaxing.',
        description: 'Best against proud or stubborn captives. Charm bonus.',
        llmContext: 'The witch {pc} has chosen a gentle, seductive approach to conditioning {target}. The dungeon chamber has been softened — candles flicker in golden holders, their warm light dancing across the stone walls. The Hypnotic Pendant hangs from {pc}\'s fingers, spinning lazily, its golden spiral catching every flicker. The air carries a faint sweetness from incense already smoldering in the corners.\n\n{pc} sits close to {target}, not threatening but intimate, speaking in a low honeyed murmur. Every word is carefully chosen — soothing, rhythmic, almost melodic. There is no urgency here, only patience. The witch lets silence do half the work, allowing {target}\'s own exhaustion and loneliness to pull them toward the warmth on offer. Resistance is acknowledged gently and redirected, never punished.\n\nThis approach relies on building false comfort and trust, making compliance feel like the captive\'s own idea. The pendant is used as a focal point for trance induction, while soft touches and kind words erode defenses from within.',
        skillBonus: { skill: 'charm', bonus: 10 },
    },
    forceful: {
        id: 'forceful',
        label: 'Forceful Domination',
        icon: '⚡',
        color: '#f87171',
        tooltip: 'Overwhelming arcane power and psychic assault.',
        description: 'Best against weak-willed or fearful captives. Power bonus.',
        llmContext: 'The witch {pc} has chosen a forceful, dominating approach to conditioning {target}. The dungeon chamber crackles with arcane energy — the enchanted shackles flare brighter, and the air grows thick and heavy with magical pressure. The Arcane Visor blazes to life on {pc}\'s face, its golden spiral projecting directly into {target}\'s field of vision.\n\n{pc} stands over {target}, radiating authority and raw power. There is no gentleness here — commands are barked, resistance is met with psychic pressure that makes the captive\'s skull throb. The witch projects their will directly against {target}\'s mental barriers, hammering at them with focused arcane force. The captive feels their defenses cracking under the assault, each wave of power leaving them more dazed and disoriented.\n\nThis approach trades subtlety for speed and impact. It works fastest but provokes stronger resistance — the captive fights harder, but each failed attempt to push back drains them further. Obedience is extracted through overwhelming dominance.',
        skillBonus: { skill: 'power', bonus: 10 },
    },
    alchemical: {
        id: 'alchemical',
        label: 'Alchemical Approach',
        icon: '🧪',
        color: '#4ade80',
        tooltip: 'Elixirs, incense, and chemical manipulation.',
        description: 'Best when well-stocked with potions. Uses consumables. Wisdom bonus.',
        llmContext: 'The witch {pc} has chosen an alchemical approach to conditioning {target}. A portable workstation has been set up in the dungeon chamber — vials of shimmering liquid arranged in neat rows, a mortar and pestle with freshly ground herbs, and a bronze incense burner already trailing golden smoke in lazy spirals.\n\n{pc} works methodically, almost clinically. Spiral Incense fills the room with a haze that makes {target}\'s thoughts sluggish and unfocused. Obedience Elixirs are administered — by coaxing or by force — their warm, syrupy liquid spreading a tingling numbness through the captive\'s body. Each substance compounds the effect of the last: the incense makes them suggestible, the elixirs weaken their resolve, and specially prepared salves applied to the temples dull their ability to form coherent resistance.\n\nThe captive feels their body betraying them — warmth pooling in their limbs, thoughts scattering like smoke, a creeping docility that no amount of willpower can fully suppress. This approach is reliable but requires supplies — without consumables, the witch has fewer tools to work with.',
        bonusActions: ['double_dose'],
        skillBonus: { skill: 'wisdom', bonus: 10 },
    },
    conversational: {
        id: 'conversational',
        label: 'Conversational',
        icon: '💬',
        color: '#38bdf8',
        tooltip: 'Understanding, manipulation, and psychological tactics.',
        description: 'Best against intelligent or idealistic captives. Wisdom bonus.',
        llmContext: 'The witch {pc} has chosen a purely conversational, psychological approach to conditioning {target}. No tools, no potions, no overt magic — just two chairs facing each other in the dungeon, close enough that {target} can see the amber flecks in {pc}\'s eyes. The shackles have been loosened just enough to be comfortable, a deliberate gesture of trust.\n\n{pc} is a master manipulator. They ask probing questions about {target}\'s past, their motivations, the people they fought for — then carefully reframe each answer. Heroes who failed to protect them. Causes that never cared about their sacrifice. Freedom that only ever meant loneliness and pain. Every conviction is gently dismantled, not attacked directly but hollowed out from within.\n\n{pc} mirrors {target}\'s emotions, offering understanding where others offered orders. They create an intimacy that feels genuine — and perhaps, in its own twisted way, is. The captive may not even realize they\'re being conditioned; each session feels like a conversation with someone who finally understands them. By the time they notice the chains tightening, they no longer want to struggle.',
        bonusActions: ['gaslight', 'false_comfort'],
        skillBonus: { skill: 'wisdom', bonus: 10 },
    },
    sensory: {
        id: 'sensory',
        label: 'Sensory Overload',
        icon: '✨',
        color: '#fbbf24',
        tooltip: 'Flood the senses with overwhelming magical stimuli.',
        description: 'Best against disciplined or stoic captives. Charm bonus.',
        llmContext: 'The witch {pc} has chosen a sensory overload approach to conditioning {target}. The dungeon chamber has been transformed — enchanted crystals embedded in the walls pulse with shifting colors, casting kaleidoscopic light across every surface. A low harmonic hum resonates from sigils carved into the floor, vibrating through the stone and into the captive\'s bones. The air itself tastes sweet, almost intoxicating.\n\n{pc} orchestrates a deliberate assault on every sense simultaneously. The crystals shift through hypnotic patterns that the eyes cannot help but follow. The hum drops into frequencies that resonate with the heartbeat, forcing the captive\'s pulse to synchronize. Enchanted oils are traced along exposed skin — warm, tingling, each touch sending sparks of involuntary pleasure up the spine. The Hypnotic Pendant spins at the center of the visual storm, a fixed point that the overwhelmed mind clings to desperately.\n\nThe strategy does not break resistance so much as drown it. The captive\'s disciplined mind, accustomed to blocking one type of attack at a time, simply cannot process the flood. Their carefully built walls crumble not from force, but from being attacked from every direction at once. In the gaps between stimuli, {pc} weaves commands — and the overloaded mind accepts them without examination.',
        bonusActions: ['sensory_flood'],
        skillBonus: { skill: 'charm', bonus: 10 },
    },
    ritualistic: {
        id: 'ritualistic',
        label: 'Ritualistic',
        icon: '🕯️',
        color: '#e879f9',
        tooltip: 'Ancient binding circles and ceremonial enchantment.',
        description: 'Best against magically attuned captives. Power bonus.',
        llmContext: 'The witch {pc} has chosen a ritualistic approach to conditioning {target}. The dungeon floor has been cleared and painted with an intricate binding circle — concentric rings of golden sigils that pulse faintly in the torchlight. Black candles burn at the cardinal points, their flames unnaturally still. The captive has been placed at the center of the circle, the enchanted shackles humming in resonance with the sigils beneath.\n\n{pc} moves with deliberate ceremonial precision, chanting in an ancient tongue as they walk the outer ring. Each completed circuit draws the circle\'s power tighter, and {target} feels it — a constriction not of the body but of the self. The sigils respond to resistance, glowing brighter when the captive fights, using their own willpower as fuel. {pc} incorporates ritual objects: the pendant is placed at the circle\'s focal point, elixirs are poured along the sigil lines where the captive can breathe them in, and at key moments the Visor\'s spiral is projected into the binding geometry.\n\nThis approach is slow and methodical, but its effects are deeply rooted. The ritual does not merely weaken resistance — it restructures it, redirecting the captive\'s own magical attunement and mental energy back against them. The more powerful the captive, the more fuel the circle has to work with.',
        bonusActions: ['binding_chant'],
        skillBonus: { skill: 'power', bonus: 10 },
    },
};

// ---- Conditioning Actions Registry ----
export const CONDITIONING_ACTIONS: Record<string, ConditioningAction> = {
    // === TIER 0 (Always available) ===
    speak_softly: {
        id: 'speak_softly',
        label: 'Speak Softly',
        icon: '🗣️',
        tooltip: 'Whisper soothing words to ease their tension. No check required.',
        category: 'social',
        brainwashingDelta: 1,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 2,
        llmDirective: '{pc} whispers soothing, gentle words to {target}, slowly easing the tension from their muscles. The captive feels a wave of unexpected comfort.',
    },
    use_pendant: {
        id: 'use_pendant',
        label: 'Pendant Spiral',
        icon: '🔮',
        tooltip: 'Swing the Hypnotic Pendant before their eyes. (Charm check DC 40)',
        category: 'hypnosis',
        requiresItem: 'Hypnotic Pendant',
        skillCheck: { skill: 'charm', difficulty: 40 },
        brainwashingDelta: 5,
        failDelta: 1,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} swings the Hypnotic Pendant before {target}\'s eyes. The golden spiral catches the light and {target}\'s gaze locks onto it involuntarily. Their pupils dilate and their breathing slows as the pendant\'s magic takes hold.',
        failDirective: '{pc} tries to use the Hypnotic Pendant but {target} forces their eyes away, resisting the spiral\'s pull. They grit their teeth defiantly.',
    },
    burn_incense: {
        id: 'burn_incense',
        label: 'Burn Incense',
        icon: '🌀',
        tooltip: 'Burn Spiral Incense to fill the room with suggestive smoke. No check.',
        category: 'alchemy',
        consumeItem: 'Spiral Incense',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 5,
        llmDirective: '{pc} lights a stick of Spiral Incense. Golden smoke curls through the chamber, and {target} inhales involuntarily. A warm haze settles over their mind, making it harder to hold onto thoughts of resistance.',
    },
    administer_elixir: {
        id: 'administer_elixir',
        label: 'Obedience Elixir',
        icon: '🧪',
        tooltip: 'Force-feed an Obedience Elixir. Guaranteed strong progress.',
        category: 'alchemy',
        consumeItem: 'Obedience Elixir',
        brainwashingDelta: 8,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 0,
        llmDirective: '{pc} presses a vial of Obedience Elixir to {target}\'s lips. The shimmering golden liquid slides down their throat and almost instantly their eyes glaze, their body relaxes, and their mental barriers soften dramatically.',
    },

    // -- Tier 0 NEW --
    gentle_touch: {
        id: 'gentle_touch',
        label: 'Gentle Touch',
        icon: '🫳',
        tooltip: 'A calming hand on their shoulder. No check needed.',
        category: 'physical',
        brainwashingDelta: 1,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 2,
        llmDirective: '{pc} places a gentle hand on {target}\'s shoulder. The captive tenses, then slowly relaxes despite themselves — the warmth seeping through their resolve.',
    },
    offer_water: {
        id: 'offer_water',
        label: 'Offer Water',
        icon: '🥤',
        tooltip: 'A kind gesture — offer them a drink. No check.',
        category: 'reward',
        brainwashingDelta: 1,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} offers {target} a cup of cool water. The captive hesitates, then drinks — a small acceptance that cracks the wall of total defiance.',
    },
    intimidate: {
        id: 'intimidate',
        label: 'Intimidate',
        icon: '😠',
        tooltip: 'Assert dominance through sheer force of presence. (Power DC 40)',
        category: 'social',
        skillCheck: { skill: 'power', difficulty: 40 },
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} rises to full height and lets arcane power crackle at their fingertips, voice dropping to a dangerous whisper. {target} shrinks back, fear overriding bravado.',
        failDirective: '{pc} tries to intimidate {target} but the captive meets their gaze defiantly. "You don\'t scare me," they say — though their hands tremble slightly.',
    },
    play_music: {
        id: 'play_music',
        label: 'Play Music',
        icon: '🎵',
        tooltip: 'Enchanted melody to soften their mind. No check.',
        category: 'hypnosis',
        brainwashingDelta: 2,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 4,
        llmDirective: '{pc} activates an enchanted music box. A hauntingly beautiful melody fills the chamber, each note carrying a thread of golden light. {target}\'s eyelids grow heavy as the music washes over them.',
    },

    // === TIER 25 (Wavering) ===
    activate_visor: {
        id: 'activate_visor',
        label: 'Activate Visor',
        icon: '👓',
        tooltip: 'Project the golden spiral directly into their vision. (Wisdom DC 50)',
        category: 'hypnosis',
        requiresItem: 'Arcane Visor',
        skillCheck: { skill: 'wisdom', difficulty: 50 },
        brainwashingDelta: 7,
        failDelta: 1,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} activates the Arcane Visor, projecting a blazing golden spiral directly into {target}\'s eyes. The captive gasps as the spiral fills their entire field of vision, their mind flooding with golden light. Their resistance buckles under the visual assault.',
        failDirective: '{pc} activates the Arcane Visor but {target} squeezes their eyes shut and turns away, enduring the psychic pressure. The spiral cannot take hold without eye contact.',
    },
    whisper_command: {
        id: 'whisper_command',
        label: 'Whisper Command',
        icon: '👄',
        tooltip: 'Plant a simple command in their weakened mind. (Charm DC 45)',
        category: 'hypnosis',
        skillCheck: { skill: 'charm', difficulty: 45 },
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 3,
        llmDirective: '{pc} leans close and whispers a simple command directly into {target}\'s ear. The captive\'s body obeys before their conscious mind can object — a small but significant crack in their control.',
        failDirective: '{pc} whispers a command but {target} catches themselves and pulls back. "I\'m not your puppet," they snarl, though their voice wavers.',
    },
    caress: {
        id: 'caress',
        label: 'Caress',
        icon: '🤚',
        tooltip: 'A gentle touch to reinforce their submission. No check.',
        category: 'physical',
        brainwashingDelta: 2,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 2,
        llmDirective: '{pc} reaches out and gently caresses {target}\'s cheek. The captive flinches — but doesn\'t pull away. A flicker of confused longing crosses their face.',
    },
    // -- Tier 25 NEW --
    show_mirror: {
        id: 'show_mirror',
        label: 'Show Mirror',
        icon: '🪞',
        tooltip: 'Show them a reflection with subtle enchantment. (Wisdom DC 45)',
        category: 'hypnosis',
        skillCheck: { skill: 'wisdom', difficulty: 45 },
        brainwashingDelta: 5,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} holds up an enchanted mirror before {target}. The reflection shows not their current self but a version that serves willingly, smiling, content. {target} stares, transfixed by the image of what they could become.',
        failDirective: '{pc} presents the enchanted mirror but {target} looks away quickly. "That\'s not me," they insist — but the image lingers in their mind.',
    },
    apply_salve: {
        id: 'apply_salve',
        label: 'Apply Salve',
        icon: '🧴',
        tooltip: 'Rub a numbing salve into their skin. No check.',
        category: 'alchemy',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} applies a tingling salve to {target}\'s temples. The captive\'s muscles go slack as a warm numbness spreads through them, dulling the sharp edges of resistance.',
    },
    isolate: {
        id: 'isolate',
        label: 'Isolate',
        icon: '🚪',
        tooltip: 'Remind them they are alone here. (Charm DC 40)',
        category: 'social',
        skillCheck: { skill: 'charm', difficulty: 40 },
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 5,
        llmDirective: '{pc} reminds {target} that no rescue is coming, that no one even knows where they are. The loneliness of it settles over the captive like a weight.',
        failDirective: '{pc} tries to play on {target}\'s isolation, but the captive clings to an inner strength. "They\'ll find me," they whisper.',
    },
    restrain: {
        id: 'restrain',
        label: 'Restrain',
        icon: '⛓️',
        tooltip: 'Tighten their bonds to reinforce helplessness. No check.',
        category: 'physical',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} adjusts {target}\'s restraints, pulling them just tight enough to make escape feel impossibly far away. The captive tests their bonds and feels only unyielding metal.',
    },

    // === TIER 50 (Susceptible) ===
    deep_trance: {
        id: 'deep_trance',
        label: 'Deep Trance',
        icon: '🌊',
        tooltip: 'Guide them into a deep hypnotic trance. (Charm DC 55)',
        category: 'hypnosis',
        skillCheck: { skill: 'charm', difficulty: 55 },
        brainwashingDelta: 10,
        failDelta: 1,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} guides {target} into a deep hypnotic trance. Their eyes glaze completely, their breathing becomes slow and rhythmic, and their body goes limp. In this state, they are profoundly open to suggestion. Their defenses are all but gone.',
        failDirective: '{pc} tries to deepen the trance but {target} fights through the haze, clinging to a shred of awareness. They tremble with the effort, but hold on.',
    },
    eye_contact: {
        id: 'eye_contact',
        label: 'Eye Hypnosis',
        icon: '👁️',
        tooltip: 'Lock eyes and project your will directly. (Power DC 50)',
        category: 'hypnosis',
        skillCheck: { skill: 'power', difficulty: 50 },
        brainwashingDelta: 8,
        failDelta: 1,
        minBrainwashing: 50,
        cooldownMessages: 4,
        llmDirective: '{pc} locks eyes with {target}, and the captive finds they cannot look away. {pc}\'s violet eyes seem to glow as arcane power flows through the gaze. {target} feels their will draining, their thoughts scattering like leaves in the wind.',
        failDirective: '{pc} tries to lock eyes with {target} but the captive breaks the gaze with a desperate effort, looking away. Their heart pounds with the near miss.',
    },
    reward_affection: {
        id: 'reward_affection',
        label: 'Reward',
        icon: '💝',
        tooltip: 'Praise and reward their compliance. No check needed.',
        category: 'reward',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 3,
        llmDirective: '{pc} praises {target} warmly, running fingers through their hair and telling them how well they\'re doing. The captive feels an unwanted surge of warmth and pleasure at the approval.',
    },
    // -- Tier 50 NEW --
    massage: {
        id: 'massage',
        label: 'Massage',
        icon: '💆',
        tooltip: 'Work tension from their body, loosening their mind with it. No check.',
        category: 'physical',
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 4,
        llmDirective: '{pc} works the tension out of {target}\'s shoulders with expert hands. Each knot released carries away another thread of resistance. The captive lets out a sigh they\'d been holding for days.',
    },
    trigger_word: {
        id: 'trigger_word',
        label: 'Trigger Word',
        icon: '🔔',
        tooltip: 'Plant a trigger word that deepens their trance. (Wisdom DC 55)',
        category: 'hypnosis',
        skillCheck: { skill: 'wisdom', difficulty: 55 },
        brainwashingDelta: 7,
        failDelta: 1,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} whispers a carefully chosen word — a trigger — and watches {target}\'s eyes glaze over. The word has been planted; each repetition will pull them deeper.',
        failDirective: '{pc} attempts to implant a trigger word but {target}\'s mind instinctively rejects the intrusion. The captive shudders, disturbed but intact.',
    },
    promise_freedom: {
        id: 'promise_freedom',
        label: 'Promise Freedom',
        icon: '🕊️',
        tooltip: 'Offer them a way out — one that requires surrender. (Charm DC 50)',
        category: 'social',
        skillCheck: { skill: 'charm', difficulty: 50 },
        brainwashingDelta: 6,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} paints a picture of a comfortable life — all {target} has to do is stop fighting. The offer hangs in the air, tempting. The captive\'s resolve wavers visibly.',
        failDirective: '{pc} offers {target} a future of comfort in exchange for submission. "I\'d rather rot," the captive spits — but the seed has been planted.',
    },
    spiked_tea: {
        id: 'spiked_tea',
        label: 'Spiked Tea',
        icon: '🍵',
        tooltip: 'Serve a warm drink laced with compliance herbs. No check.',
        category: 'alchemy',
        brainwashingDelta: 5,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} presents {target} with a cup of warm tea. The captive drinks gratefully, not noticing the faint shimmer of dissolved herbs. Within minutes a pleasant fog settles over their thoughts.',
    },
    offer_comfort: {
        id: 'offer_comfort',
        label: 'Offer Comfort',
        icon: '🛏️',
        tooltip: 'Give them a blanket, better food — bind them with kindness. No check.',
        category: 'reward',
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 4,
        llmDirective: '{pc} brings {target} a soft blanket and warm meal. The captive accepts grudgingly, but the comfort weakens their fury. It\'s harder to hate someone who shows kindness.',
    },

    // === TIER 75 (Broken) ===
    total_submission: {
        id: 'total_submission',
        label: 'Submit Command',
        icon: '👑',
        tooltip: 'Command total submission. (Power DC 65)',
        category: 'hypnosis',
        skillCheck: { skill: 'power', difficulty: 65 },
        brainwashingDelta: 12,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 6,
        llmDirective: '{pc} issues a commanding order for {target} to submit completely. The captive feels the last walls of their resistance crumble. They find themselves kneeling, head bowed, a strange sense of peace washing over them.',
        failDirective: '{pc} commands submission but {target} finds one last spark of defiance, resisting the final push. They tremble, eyes locked on a distant memory of who they used to be.',
    },
    collar_fitting: {
        id: 'collar_fitting',
        label: 'Fit Collar',
        icon: '⭕',
        tooltip: 'Place a Servant Collar around their neck. A mark of ownership.',
        category: 'reward',
        requiresItem: 'Servant Collar',
        consumeItem: 'Servant Collar',
        brainwashingDelta: 15,
        failDelta: 0,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} produces a Servant Collar inscribed with binding runes and fastens it around {target}\'s neck. The runes glow briefly as the enchantment takes hold. {target} feels the collar\'s warmth and a profound sense of belonging.',
    },
    memory_extraction: {
        id: 'memory_extraction',
        label: 'Extract Memory',
        icon: '✨',
        tooltip: 'Extract a shard of their memories. (Wisdom DC 60)',
        category: 'hypnosis',
        skillCheck: { skill: 'wisdom', difficulty: 60 },
        brainwashingDelta: 10,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} reaches into {target}\'s mind and carefully extracts a shard of memory — a glowing fragment that crystallizes in their palm. {target} gasps, a piece of who they were now held in another\'s hand.',
        failDirective: '{pc} reaches for {target}\'s memories but the captive\'s mind instinctively recoils, protecting its core. The attempt causes a sharp pain in both parties.',
    },
    // -- Tier 75 NEW --
    identity_rewrite: {
        id: 'identity_rewrite',
        label: 'Rewrite Identity',
        icon: '📝',
        tooltip: 'Begin overwriting who they think they are. (Wisdom DC 65)',
        category: 'hypnosis',
        skillCheck: { skill: 'wisdom', difficulty: 65 },
        brainwashingDelta: 12,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 6,
        llmDirective: '{pc} begins whispering a new identity into {target}\'s ear — a name, a purpose, a life of devotion. The captive\'s old self flickers like a candle in the wind as the new narrative takes root.',
        failDirective: '{pc} attempts to overwrite {target}\'s identity but the captive screams, clinging to their name, their memories. The old self holds — barely.',
    },
    brand_mark: {
        id: 'brand_mark',
        label: 'Brand Mark',
        icon: '🔥',
        tooltip: 'Inscribe a magical mark of ownership on their skin. No check.',
        category: 'physical',
        brainwashingDelta: 8,
        failDelta: 0,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} traces a glowing sigil on {target}\'s skin. The mark burns golden for a moment, then fades to a permanent tattoo. {target} feels the mark\'s enchantment — a constant, warm reminder of who they belong to.',
    },
    pleasure_conditioning: {
        id: 'pleasure_conditioning',
        label: 'Pleasure Bond',
        icon: '💫',
        tooltip: 'Link obedience with pleasure through enchantment. (Charm DC 60)',
        category: 'reward',
        skillCheck: { skill: 'charm', difficulty: 60 },
        brainwashingDelta: 10,
        failDelta: 1,
        minBrainwashing: 75,
        cooldownMessages: 5,
        llmDirective: '{pc} weaves an enchantment that links feelings of pleasure to thoughts of obedience. {target} gasps as warmth floods through them every time their mind drifts toward compliance. Resistance begins to feel cold and empty by comparison.',
        failDirective: '{pc} tries to forge the pleasure bond but {target}\'s mental walls hold. The enchantment dissipates, leaving only a fading tingle.',
    },

    // === Strategy-specific bonus actions ===
    double_dose: {
        id: 'double_dose',
        label: 'Double Dose',
        icon: '🧪🧪',
        tooltip: 'Administer a double dose of elixir. Powerful but risky. (Alchemical only)',
        category: 'alchemy',
        consumeItem: 'Obedience Elixir',
        brainwashingDelta: 15,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 0,
        llmDirective: '{pc} administers a double dose of Obedience Elixir. {target}\'s eyes roll back as the potent mixture surges through them. Their entire body goes slack, mind utterly overwhelmed by the chemical onslaught.',
    },
    gaslight: {
        id: 'gaslight',
        label: 'Reframe Reality',
        icon: '🪞',
        tooltip: 'Make them question their own memories and motives. (Wisdom DC 50, Conversational only)',
        category: 'social',
        skillCheck: { skill: 'wisdom', difficulty: 50 },
        brainwashingDelta: 6,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} subtly reframes {target}\'s memories, making them question their own motives. "Did you really fight for justice, or were you just afraid of being alone?" The captive\'s certainty wavers.',
        failDirective: '{pc} tries to twist {target}\'s perspective but the captive sees through the manipulation. "Nice try," they say coldly.',
    },
    false_comfort: {
        id: 'false_comfort',
        label: 'False Comfort',
        icon: '🤗',
        tooltip: 'Offer comfort and understanding — all calculated. (Charm DC 45, Conversational only)',
        category: 'social',
        skillCheck: { skill: 'charm', difficulty: 45 },
        brainwashingDelta: 5,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} offers {target} warmth and understanding, listening to their fears and validating their feelings. It\'s all calculated, but the comfort is real enough that {target} lets their guard down.',
        failDirective: '{pc} tries to offer comfort but {target} sees through the manipulation. "Don\'t pretend you care," they snap.',
    },
    sensory_flood: {
        id: 'sensory_flood',
        label: 'Sensory Flood',
        icon: '🌈',
        tooltip: 'Blast every sense at once — lights, sound, touch, scent. (Charm DC 50, Sensory only)',
        category: 'hypnosis',
        skillCheck: { skill: 'charm', difficulty: 50 },
        brainwashingDelta: 8,
        failDelta: 1,
        minBrainwashing: 15,
        cooldownMessages: 4,
        llmDirective: '{pc} activates every enchanted crystal in the chamber simultaneously. Light, sound, warmth, and scent crash over {target} in a dizzying wave. Their disciplined mind cannot process it all and goes blank — a perfect window for suggestion.',
        failDirective: '{pc} attempts to overwhelm {target}\'s senses but the captive manages to center themselves, breathing through the barrage. The flood washes past without taking hold.',
    },
    binding_chant: {
        id: 'binding_chant',
        label: 'Binding Chant',
        icon: '📿',
        tooltip: 'Complete a circuit of the binding circle while chanting. (Power DC 50, Ritualistic only)',
        category: 'hypnosis',
        skillCheck: { skill: 'power', difficulty: 50 },
        brainwashingDelta: 9,
        failDelta: 1,
        minBrainwashing: 15,
        cooldownMessages: 4,
        llmDirective: '{pc} completes another circuit of the binding circle, chanting in an ancient tongue. The sigils blaze gold and the captive feels the circle\'s pressure tighten around their mind — their own magical resistance is being redirected against them.',
        failDirective: '{pc} attempts the binding chant but stumbles on a syllable. The circle flickers and the power dissipates harmlessly. {target} feels a moment of relief as the pressure eases.',
    },
};

/** A player choice within a step */
export interface EventChoice {
    id: string;
    label: string;
    tooltip?: string;             // hover hint
    nextStep: string;             // step to go to (ignored if skillCheck is present — it overrides)
    skillCheck?: EventSkillCheck; // optional check when picking this choice
    requiresItem?: string;        // must have this item to see the choice
    consumeItem?: string;         // consume 1 of this item when chosen
    effects?: EventEffect[];      // applied immediately on choice
    condition?: (ctx: EventContext) => boolean; // dynamic visibility
}

/** A single step/node in the event graph */
export interface EventStep {
    id: string;
    text: string;                 // narrative text (supports {target}, {pc} placeholders)
    speaker?: string;             // character portrait to show (name)
    image?: string;               // optional background/illustration
    choices?: EventChoice[];
    effects?: EventEffect[];      // applied on entering this step
    nextStep?: string;            // auto-continue (for narration-only steps)
    isEnding?: boolean;           // terminal node — shows "Finish" button
    chatPhase?: EventChatPhase;   // optional AI chat phase after this step's narrative
    onEnter?: (ctx: EventContext) => void; // custom logic hook
}

/** Full event definition (a template — reusable) */
export interface EventDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'brainwashing' | 'social' | 'exploration' | 'combat' | 'manor' | 'misc';
    steps: Record<string, EventStep>;
    startStep: string;
}

/** Runtime context passed to callbacks and used by the engine */
export interface EventContext {
    stage: Stage;
    target?: string;              // e.g. hero being brainwashed
    eventId: string;
    vars: Record<string, any>;    // arbitrary per-run variables
}

/** Runtime state of an active event */
export interface ActiveEvent {
    definitionId: string;
    currentStepId: string;
    target?: string;
    log: string[];                // visited step IDs
    vars: Record<string, any>;   // runtime variables
    appliedEffects: EventEffect[];
    lastSkillCheck?: {
        skill: string;
        roll: number;
        difficulty: number;
        success: boolean;
    };
    chatPhaseActive: boolean;
    chatMessageCount: number;
    // Conditioning session state
    conditioningStrategy?: string;             // chosen strategy ID
    actionCooldowns: Record<string, number>;   // action ID → message index when last used
    actionResults: ActionResult[];             // log of actions taken this session
    lastActionResult?: ActionResult;           // most recent action result (for UI)
}

// ---- Skill check roll helper ----
export function rollSkillCheck(
    playerSkill: number,
    difficulty: number,
    modifier: number = 0
): { roll: number; total: number; success: boolean } {
    // Roll 1-100, add skill value / 2, add modifier, compare to difficulty
    const roll = Math.floor(Math.random() * 100) + 1;
    const total = roll + Math.floor(playerSkill / 2) + modifier;
    return { roll, total, success: total >= difficulty };
}

// ==========================================
// Event Registry
// ==========================================

/**
 * Brainwashing Session event — the core conditioning event for captives.
 * Simplified to: intro → strategy selection → conditioning chat session.
 * All conditioning progress happens via in-chat actions during the chat phase.
 */
export const EVENT_BRAINWASHING: EventDefinition = {
    id: 'brainwashing_session',
    name: 'Conditioning Session',
    description: 'Attempt to break a captive\'s will through hypnotic conditioning.',
    icon: '🌀',
    category: 'brainwashing',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: '*You enter the dungeon chamber where {target} is held. The enchanted shackles glow faintly as you approach, keeping the captive\'s resistance suppressed.*\n\n*You light a spiral incense and let the golden smoke fill the room, preparing the atmosphere for the session.*',
            speaker: 'Citrine',
            nextStep: 'strategy_select',
            effects: [],
        },
        strategy_select: {
            id: 'strategy_select',
            text: '*{target} watches you warily, muscles tense against the restraints. You can see the defiance in their eyes — but also the faintest flicker of uncertainty.*\n\nHow will you approach today\'s session?',
            choices: [
                {
                    id: 'gentle',
                    label: 'Gentle Persuasion',
                    tooltip: 'Soft words, soothing spirals, and patient coaxing. Charm bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'forceful',
                    label: 'Forceful Domination',
                    tooltip: 'Overwhelming arcane power and psychic assault. Power bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'alchemical',
                    label: 'Alchemical Approach',
                    tooltip: 'Elixirs, incense, and chemical manipulation. Wisdom bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'conversational',
                    label: 'Conversational',
                    tooltip: 'Understanding, manipulation, and psychological tactics. Wisdom bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'sensory',
                    label: 'Sensory Overload',
                    tooltip: 'Overwhelm their senses with magical stimuli. Charm bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'ritualistic',
                    label: 'Ritualistic',
                    tooltip: 'Ancient binding circles and ceremonial enchantment. Power bonus.',
                    nextStep: 'session',
                },
            ],
        },
        session: {
            id: 'session',
            text: '*The session begins. {target} is before you — restrained, but their will is their own... for now.*',
            chatPhase: {
                context: 'Live conditioning session. Use the action panel to apply conditioning techniques during conversation.',
                speaker: '{target}',
                location: 'Dungeon',
                skippable: true,
                minMessages: 0,
            },
            isEnding: true,
        },
    },
};

// Scene conversation message
export interface SceneMessage {
    sender: string;
    text: string;
}

// Scene descriptor — passed to React as a prop snapshot, NOT stored in messageState
export interface SceneData {
    id: number;                 // Unique scene ID
    participants: string[];     // NPC names in scene
    location: Location;
}

// Personal skill stats (used for skill checks)
export interface SkillStats {
    power: number;
    wisdom: number;
    charm: number;
    speed: number;
}

// Household stats
export interface HouseholdStats {
    comfort: number;    // How nice the living conditions are
    obedience: number;  // How much respect servants have
}

// Full witch stats
export interface WitchStats {
    skills: SkillStats;
    household: HouseholdStats;
    gold: number;           // Main resource, starts at 100
    servants: number;       // Current servant count
    maxServants: number;    // Default 10
    day: number;            // Current day
}

/***
 Message-level state: Current game state at this message
 ***/
type MessageStateType = {
    stats: WitchStats;
    location: Location;
    playerCharacter: PlayerCharacter;
    heroes: { [heroName: string]: Hero };
    servants: { [servantName: string]: Servant };
    inventory: { [itemName: string]: InventoryItem };
    manorUpgrades: { [upgradeName: string]: ManorUpgrade };
    dungeonProgress?: DungeonProgress;
    currentQuest?: string;
    // NOTE: scene state is NOT stored here — it's ephemeral, owned by React
};

/***
 Configuration type for user preferences
 ***/
type ConfigType = {
    theme?: 'dark' | 'light' | 'purple';
    showStats?: boolean;
    showHeroes?: boolean;
    showServants?: boolean;
    showManor?: boolean;
    showInventory?: boolean;
    showDungeon?: boolean;
    compactMode?: boolean;
};

/***
 Initialization state: One-time setup data
 ***/
type InitStateType = {
    startDate: string;
    gameVersion?: string;
};

/***
 Chat-level state: Persistent across all branches
 ***/
type ChatStateType = {
    discoveredLocations: Location[];
    totalHeroesCaptured: number;
    totalServantsConverted: number;
    achievements: string[];
    // Manor save data - stores which room is built in which slot
    manorSlots?: SavedSlotData[];
    // Generated images per character: { charName: { slotType: url } }
    generatedImages?: Record<string, Record<string, string>>;
};

// Serializable manor slot data for saving/loading
export interface SavedSlotData {
    slotId: string;
    roomType: string | null; // null = empty slot
    level: number;
    occupant?: string;
}

// A save file slot with metadata
export interface SaveFileSlot {
    name: string;
    timestamp: number; // ms since epoch
    data: SavedSlotData[];
    stats?: WitchStats; // saved stats snapshot
    generatedImages?: Record<string, Record<string, string>>; // gallery images
}

export const MAX_SAVE_SLOTS = 3;

/***
 Perfect Home Stage Implementation
 ***/
export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {

    // Internal state for current game data
    public currentState: MessageStateType;
    public config: ConfigType;
    public chatState: ChatStateType;
    private storageKey: string;

    // Active scene state — ephemeral, NOT in messageState, immune to setState()
    private _activeScene: SceneData | null = null;
    private _sceneMessages: SceneMessage[] = [];
    private _sceneIdCounter: number = 0;

    constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
        super(data);
        const { config, messageState, chatState, users } = data;

        // Build a unique localStorage key from user IDs
        const userIds = Object.keys(users || {}).sort().join('_');
        this.storageKey = `perfecthome_manor_${userIds || 'default'}`;

        // Initialize config with defaults
        this.config = {
            theme: config?.theme || 'dark',
            showStats: config?.showStats !== false,
            showHeroes: config?.showHeroes !== false,
            showServants: config?.showServants !== false,
            showManor: config?.showManor !== false,
            showInventory: config?.showInventory !== false,
            showDungeon: config?.showDungeon !== false,
            compactMode: config?.compactMode || false,
        };

        // Initialize or restore message state
        this.currentState = messageState || this.getDefaultMessageState();

        // Initialize or restore chat state
        this.chatState = chatState || {
            discoveredLocations: ['Manor'],
            totalHeroesCaptured: 0,
            totalServantsConverted: 0,
            achievements: [],
            manorSlots: undefined, // Will use defaults on first load
        };
    }

    private getDefaultMessageState(): MessageStateType {
        return {
            stats: {
                skills: {
                    power: 1,
                    wisdom: 1,
                    charm: 1,
                    speed: 1,
                },
                household: {
                    comfort: 5,
                    obedience: 5,
                },
                gold: 100,
                servants: 0,
                maxServants: 10,
                day: 1,
            },
            location: 'Manor',
            playerCharacter: {
                name: 'Citrine',
                avatar: CHUB_AVATARS.citrine,
                title: 'The Witch of the Manor',
                color: CHARACTER_DATA.Citrine.color,
                description: CHARACTER_DATA.Citrine.description,
                traits: CHARACTER_DATA.Citrine.traits,
                details: CHARACTER_DATA.Citrine.details,
            },
            heroes: {
                'Sable': {
                    name: 'Sable',
                    status: 'free',
                    brainwashing: 0,
                    heroClass: 'Thief',
                    avatar: CHUB_AVATARS.sable,
                    color: CHARACTER_DATA.Sable.color,
                    description: CHARACTER_DATA.Sable.description,
                    traits: CHARACTER_DATA.Sable.traits,
                    details: CHARACTER_DATA.Sable.details,
                    stats: CHARACTER_DATA.Sable.stats,
                    location: 'Unknown',
                },
                'Veridian': {
                    name: 'Veridian',
                    status: 'free',
                    brainwashing: 0,
                    heroClass: 'Cleric',
                    avatar: CHUB_AVATARS.veridian,
                    color: CHARACTER_DATA.Veridian.color,
                    description: CHARACTER_DATA.Veridian.description,
                    traits: CHARACTER_DATA.Veridian.traits,
                    details: CHARACTER_DATA.Veridian.details,
                    stats: CHARACTER_DATA.Veridian.stats,
                    location: 'Unknown',
                },
                'Kova': {
                    name: 'Kova',
                    status: 'free',
                    brainwashing: 0,
                    heroClass: 'Barbarian',
                    avatar: CHUB_AVATARS.kova,
                    color: CHARACTER_DATA.Kova.color,
                    description: CHARACTER_DATA.Kova.description,
                    traits: CHARACTER_DATA.Kova.traits,
                    details: CHARACTER_DATA.Kova.details,
                    stats: CHARACTER_DATA.Kova.stats,
                    location: 'Unknown',
                },
                'Pervis': {
                    name: 'Pervis',
                    status: 'free',
                    brainwashing: 0,
                    heroClass: 'Leader',
                    avatar: CHUB_AVATARS.pervis,
                    color: CHARACTER_DATA.Pervis.color,
                    description: CHARACTER_DATA.Pervis.description,
                    traits: CHARACTER_DATA.Pervis.traits,
                    details: CHARACTER_DATA.Pervis.details,
                    stats: CHARACTER_DATA.Pervis.stats,
                    location: 'Unknown',
                },
            },
            servants: {
                'Felicity': {
                    name: 'Felicity',
                    formerClass: 'Handmaiden',
                    avatar: CHUB_AVATARS.felicity,
                    color: CHARACTER_DATA.Felicity.color,
                    description: CHARACTER_DATA.Felicity.description,
                    traits: CHARACTER_DATA.Felicity.traits,
                    details: CHARACTER_DATA.Felicity.details,
                    stats: CHARACTER_DATA.Felicity.stats,
                    love: 80,
                    obedience: 75,
                    assignedTask: undefined,
                },
                'Locke': {
                    name: 'Locke',
                    formerClass: 'Butler',
                    avatar: CHUB_AVATARS.locke,
                    color: CHARACTER_DATA.Locke.color,
                    description: CHARACTER_DATA.Locke.description,
                    traits: CHARACTER_DATA.Locke.traits,
                    details: CHARACTER_DATA.Locke.details,
                    stats: CHARACTER_DATA.Locke.stats,
                    love: 60,
                    obedience: 85,
                    assignedTask: undefined,
                },
            },
            inventory: {
                'Arcane Visor': { name: 'Arcane Visor', quantity: 1, type: 'equipment' },
                'Hypnotic Pendant': { name: 'Hypnotic Pendant', quantity: 1, type: 'equipment' },
                'Gold Coin': { name: 'Gold Coin', quantity: 250, type: 'currency' },
                'Mana Crystal': { name: 'Mana Crystal', quantity: 8, type: 'material' },
                'Spiral Incense': { name: 'Spiral Incense', quantity: 5, type: 'consumable' },
                'Obedience Elixir': { name: 'Obedience Elixir', quantity: 2, type: 'consumable' },
                'Servant Collar': { name: 'Servant Collar', quantity: 2, type: 'equipment' },
                'Enchanted Shackles': { name: 'Enchanted Shackles', quantity: 3, type: 'key' },
                'Dreamcatcher Herb': { name: 'Dreamcatcher Herb', quantity: 12, type: 'material' },
            },
            manorUpgrades: {},
        };
    }

    async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
        return {
            success: true,
            error: null,
            initState: {
                startDate: new Date().toISOString(),
                gameVersion: '1.0.0',
            },
            chatState: this.chatState,
        };
    }

    async setState(state: MessageStateType): Promise<void> {
        if (state != null) {
            this.currentState = state;
            // Backward compat: patch playerCharacter with new fields
            const pc = this.currentState.playerCharacter;
            if (pc && !pc.description) {
                const cd = CHARACTER_DATA[pc.name] || CHARACTER_DATA.Citrine;
                pc.description = cd.description;
                pc.traits = cd.traits;
                pc.details = cd.details;
                pc.color = cd.color;
            }
            // Patch heroes missing bio fields
            for (const hero of Object.values(this.currentState.heroes)) {
                if (!hero.description) {
                    const cd = CHARACTER_DATA[hero.name];
                    if (cd) {
                        hero.color = cd.color;
                        hero.description = cd.description;
                        hero.traits = cd.traits;
                        hero.details = cd.details;
                    }
                }
            }
            // Patch servants missing bio fields
            for (const servant of Object.values(this.currentState.servants)) {
                if (!servant.description) {
                    const cd = CHARACTER_DATA[servant.name];
                    if (cd) {
                        servant.color = cd.color;
                        servant.description = cd.description;
                        servant.traits = cd.traits;
                        servant.details = cd.details;
                    }
                }
            }
        }
    }

    async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        const content = userMessage.content;
        const scene = this._activeScene;

        // If an event chat phase is active, handle it
        if (this._activeEvent?.chatPhaseActive) {
            const pcName = this.currentState.playerCharacter.name;
            const lastMsg = this._eventMessages[this._eventMessages.length - 1];
            if (!lastMsg || lastMsg.sender !== pcName || lastMsg.text !== content) {
                this._eventMessages.push({ sender: pcName, text: content });
            }
            return {
                stageDirections: this.generateEventChatDirections(content),
                messageState: this.currentState,
                modifiedMessage: null,
                systemMessage: null,
                error: null,
                chatState: this.chatState,
            };
        }

        // If a scene is active, handle scene conversation
        if (scene) {
            // Only add to history if not already added by sendSceneMessage
            const lastMsg = this._sceneMessages[this._sceneMessages.length - 1];
            const pcName = this.currentState.playerCharacter.name;
            if (!lastMsg || lastMsg.sender !== pcName || lastMsg.text !== content) {
                this._sceneMessages.push({
                    sender: pcName,
                    text: content,
                });
            }

            return {
                stageDirections: this.generateSceneDirections(scene, content),
                messageState: this.currentState,
                modifiedMessage: null,
                systemMessage: null,
                error: null,
                chatState: this.chatState,
            };
        }

        // Normal game mode
        const lower = content.toLowerCase();
        this.parseLocation(lower);
        this.parseStats(lower);

        return {
            stageDirections: this.generateStageDirections(),
            messageState: this.currentState,
            modifiedMessage: null,
            systemMessage: null,
            error: null,
            chatState: this.chatState,
        };
    }

    async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        const content = botMessage.content;
        const scene = this._activeScene;

        // If an event chat phase is active, capture the NPC reply
        if (this._activeEvent?.chatPhaseActive) {
            const def = this._eventRegistry[this._activeEvent.definitionId];
            const step = def?.steps[this._activeEvent.currentStepId];
            const speaker = step?.chatPhase?.speaker
                ?.replace(/\{target\}/g, this._activeEvent.target || '')
                ?.replace(/\{pc\}/g, this.currentState.playerCharacter.name) || 'NPC';
            this._eventMessages.push({ sender: speaker, text: content });
            return {
                stageDirections: null,
                messageState: this.currentState,
                modifiedMessage: null,
                systemMessage: null,
                error: null,
                chatState: this.chatState,
            };
        }

        // If a scene is active, capture the bot response as the character's reply
        if (scene) {
            // Infer speaker: use first participant (for multi-NPC, the LLM names itself)
            const speaker = scene.participants[0] || 'NPC';
            this._sceneMessages.push({
                sender: speaker,
                text: content,
            });

            return {
                stageDirections: null,
                messageState: this.currentState,
                modifiedMessage: null,
                systemMessage: null,
                error: null,
                chatState: this.chatState,
            };
        }

        // Normal game mode
        this.parseGameState(content);
        const systemMsg = this.generateSystemMessage();

        return {
            stageDirections: null,
            messageState: this.currentState,
            modifiedMessage: null,
            systemMessage: systemMsg,
            error: null,
            chatState: this.chatState,
        };
    }

    private parseLocation(text: string): void {
        const locations: Location[] = ['Manor', 'Town', 'Woods', 'Ruins', 'Circus', 'Dungeon'];
        for (const loc of locations) {
            if (text.includes(loc.toLowerCase())) {
                this.currentState.location = loc;
                if (!this.chatState.discoveredLocations.includes(loc)) {
                    this.chatState.discoveredLocations.push(loc);
                }
                break;
            }
        }
    }

    private parseStats(text: string): void {
        // Parse numeric values for stats (simple regex matching)
        const goldMatch = text.match(/(?:gold|coins?)[:\s]+(\d+)/i);
        const powerMatch = text.match(/power[:\s]+(\d+)/i);
        const wisdomMatch = text.match(/wisdom[:\s]+(\d+)/i);
        const charmMatch = text.match(/charm[:\s]+(\d+)/i);
        const speedMatch = text.match(/speed[:\s]+(\d+)/i);
        const comfortMatch = text.match(/comfort[:\s]+(\d+)/i);
        const obedienceMatch = text.match(/obedience[:\s]+(\d+)/i);
        const dayMatch = text.match(/day[:\s]+(\d+)/i);

        if (goldMatch) this.currentState.stats.gold = parseInt(goldMatch[1]);
        if (powerMatch) this.currentState.stats.skills.power = parseInt(powerMatch[1]);
        if (wisdomMatch) this.currentState.stats.skills.wisdom = parseInt(wisdomMatch[1]);
        if (charmMatch) this.currentState.stats.skills.charm = parseInt(charmMatch[1]);
        if (speedMatch) this.currentState.stats.skills.speed = parseInt(speedMatch[1]);
        if (comfortMatch) this.currentState.stats.household.comfort = parseInt(comfortMatch[1]);
        if (obedienceMatch) this.currentState.stats.household.obedience = parseInt(obedienceMatch[1]);
        if (dayMatch) this.currentState.stats.day = parseInt(dayMatch[1]);
    }

    private parseGameState(text: string): void {
        // Parse hero statuses from bot response
        const heroNames = ['Sable', 'Veridian', 'Kova', 'Pervis'];
        
        for (const heroName of heroNames) {
            if (text.includes(heroName)) {
                if (!this.currentState.heroes[heroName]) {
                    const charData = CHARACTER_DATA[heroName] || { color: '#888', description: '', traits: [], details: {}, stats: { prowess: 50, expertise: 50, attunement: 50, presence: 50, discipline: 50, insight: 50 } };
                    this.currentState.heroes[heroName] = {
                        name: heroName,
                        status: 'encountered',
                        brainwashing: 0,
                        heroClass: this.getHeroClass(heroName),
                        avatar: this.getHeroAvatar(heroName),
                        color: charData.color,
                        description: charData.description,
                        traits: charData.traits,
                        details: charData.details,
                        stats: charData.stats,
                    };
                }
                
                // Check for status changes
                if (text.match(new RegExp(`${heroName}.*(?:captured|caught|trapped)`, 'i'))) {
                    this.currentState.heroes[heroName].status = 'captured';
                    this.chatState.totalHeroesCaptured++;
                } else if (text.match(new RegExp(`${heroName}.*(?:converting|hypnotizing|entrancing)`, 'i'))) {
                    this.currentState.heroes[heroName].status = 'converting';
                } else if (text.match(new RegExp(`${heroName}.*(?:servant|slave|obedient|converted)`, 'i'))) {
                    this.currentState.heroes[heroName].status = 'servant';
                    const charData = CHARACTER_DATA[heroName] || { color: '#888', description: '', traits: [], details: {}, stats: { prowess: 50, expertise: 50, attunement: 50, presence: 50, discipline: 50, insight: 50 } };
                    this.currentState.servants[heroName] = {
                        name: heroName,
                        formerClass: this.getHeroClass(heroName),
                        avatar: this.getHeroAvatar(heroName),
                        color: charData.color,
                        description: charData.description,
                        traits: charData.traits,
                        details: charData.details,
                        stats: charData.stats,
                        love: 100,
                        obedience: 100,
                    };
                    delete this.currentState.heroes[heroName];
                    this.chatState.totalServantsConverted++;
                }
            }
        }

        // Parse stats from bot response
        this.parseStats(text);
    }

    private getHeroAvatar(heroName: string): string {
        const avatars: {[key: string]: string} = {
            'Sable': CHUB_AVATARS.sable,
            'Veridian': CHUB_AVATARS.veridian,
            'Kova': CHUB_AVATARS.kova,
            'Pervis': CHUB_AVATARS.pervis,
        };
        return avatars[heroName] || '';
    }

    private getHeroClass(heroName: string): string {
        const classes: {[key: string]: string} = {
            'Sable': 'Thief',
            'Veridian': 'Cleric',
            'Kova': 'Barbarian',
            'Pervis': 'Leader',
        };
        return classes[heroName] || 'Unknown';
    }

    private generateStageDirections(): string {
        // Add context about current game state to help the LLM
        const directions: string[] = [];
        
        const s = this.currentState.stats;
        directions.push(`[Day: ${s.day} | Location: ${this.currentState.location}]`);
        directions.push(`[Skills - Power: ${s.skills.power}, Wisdom: ${s.skills.wisdom}, Charm: ${s.skills.charm}, Speed: ${s.skills.speed}]`);
        directions.push(`[Household - Comfort: ${s.household.comfort}, Obedience: ${s.household.obedience}]`);
        directions.push(`[Gold: ${s.gold} | Servants: ${s.servants}/${s.maxServants}]`);
        
        const heroCount = Object.keys(this.currentState.heroes).length;
        const servantCount = Object.keys(this.currentState.servants).length;
        
        if (heroCount > 0) {
            directions.push(`[Heroes encountered: ${Object.values(this.currentState.heroes).map(h => `${h.name} (${h.status})`).join(', ')}]`);
        }
        
        if (servantCount > 0) {
            directions.push(`[Current servants: ${Object.keys(this.currentState.servants).join(', ')}]`);
        }

        return directions.join('\n');
    }

    private generateSystemMessage(): string | null {
        // Generate visible stat block (limit to avoid clutter)
        if (!this.config.showStats) return null;

        const s = this.currentState.stats;
        return `━━━━━━━━━━━━━━━━━━
📊 Day ${s.day} — ${this.currentState.location}
⚔️ Power: ${s.skills.power} | 📖 Wisdom: ${s.skills.wisdom} | 💎 Charm: ${s.skills.charm} | 💨 Speed: ${s.skills.speed}
🏠 Comfort: ${s.household.comfort} | 🫡 Obedience: ${s.household.obedience}
💰 Gold: ${s.gold} | 👥 Servants: ${s.servants}/${s.maxServants}
━━━━━━━━━━━━━━━━━━`;
    }


    render(): ReactElement {
        return <BaseScreen stage={() => this} />;
    }

    // ============================
    // Role Methods
    // ============================

    /** Get list of room types currently built in the manor */
    getBuiltRoomTypes(): string[] {
        const slots = this.chatState.manorSlots;
        if (!slots || slots.length === 0) {
            // No save yet — use default starter rooms
            return DEFAULT_BUILT_ROOM_TYPES;
        }
        const types = new Set<string>();
        for (const s of slots) {
            if (s.roomType) types.add(s.roomType);
        }
        return Array.from(types);
    }

    /** Get all roles available based on current built rooms */
    getAvailableRolesForManor(): Role[] {
        return getAvailableRoles(this.getBuiltRoomTypes());
    }

    /** Assign a role to a servant. Returns true on success. */
    assignRole(servantName: string, roleId: string): boolean {
        const servant = this.currentState.servants[servantName];
        if (!servant) return false;
        const role = getRoleById(roleId);
        if (!role) return false;

        // If the role is unique, unassign the current holder first
        if (role.unique) {
            for (const s of Object.values(this.currentState.servants)) {
                if (s.assignedRole === roleId) {
                    s.assignedRole = undefined;
                }
            }
        }

        servant.assignedRole = roleId;
        return true;
    }

    /** Remove a servant's role */
    unassignRole(servantName: string): void {
        const servant = this.currentState.servants[servantName];
        if (servant) {
            servant.assignedRole = undefined;
        }
    }

    /** Unassign all servants whose role belongs to a room type that no longer exists */
    unassignRolesForRoomType(roomType: string): void {
        const roleIds = (ROOM_ROLES[roomType] || []).map(r => r.id);
        if (roleIds.length === 0) return;
        for (const servant of Object.values(this.currentState.servants)) {
            if (servant.assignedRole && roleIds.includes(servant.assignedRole)) {
                servant.assignedRole = undefined;
            }
        }
    }

    /** Get the servant currently assigned to a role, if any */
    getRoleHolder(roleId: string): Servant | undefined {
        return Object.values(this.currentState.servants).find(s => s.assignedRole === roleId);
    }

    /** Get all servants assigned to a role (for non-unique roles) */
    getRoleHolders(roleId: string): Servant[] {
        return Object.values(this.currentState.servants).filter(s => s.assignedRole === roleId);
    }

    // ============================
    // Scene Methods
    // ============================

    /**
     * Create a new scene with the given participants and location.
     * Returns a SceneData snapshot that React components can own.
     * Scene state is ephemeral — NOT stored in messageState, immune to setState().
     */
    createScene(participants: string[], location: Location): SceneData {
        // Wipe any previous scene
        this._sceneMessages = [];
        this._sceneIdCounter++;
        const scene: SceneData = {
            id: this._sceneIdCounter,
            participants: [...participants],
            location,
        };
        this._activeScene = scene;
        console.log(`[Scene] Created scene #${scene.id} with [${participants.join(', ')}] at ${location}`);
        return { ...scene }; // Return a copy — React owns this
    }

    /** End the active scene, returns void */
    endScene(): void {
        const prev = this._activeScene?.participants.join(', ') || 'none';
        this._sceneMessages = [];
        this._activeScene = null;
        console.log(`[Scene] Ended scene with [${prev}]`);
    }

    /** Check if a scene is currently active */
    isSceneActive(): boolean {
        return this._activeScene !== null;
    }

    /**
     * Send a player message in the active scene.
     * Returns the NPC reply message, or null on failure.
     * The caller (React component) owns message state — we just provide the API.
     */
    async sendSceneMessage(text: string): Promise<SceneMessage | null> {
        const scene = this._activeScene;
        if (!scene || !text.trim()) return null;

        const pcName = this.currentState.playerCharacter.name;

        // Add player message to internal history (for stage_directions context)
        this._sceneMessages.push({
            sender: pcName,
            text: text.trim(),
        });

        try {
            await this.messenger.nudge({
                stage_directions: this.generateSceneDirections(scene, text.trim()),
            });

            // After nudge, afterResponse() will have pushed the NPC reply.
            // Return the latest NPC message.
            const latest = this._sceneMessages[this._sceneMessages.length - 1];
            if (latest && latest.sender !== pcName) {
                return { ...latest }; // Return a copy — React owns this
            }
            return null;
        } catch (e) {
            console.error('[Scene] Send failed:', e);
            return null;
        }
    }

    /** Get character bio data by name */
    getCharacterData(name: string): { color: string; description: string; traits: string[]; details: Record<string, string> } | null {
        return CHARACTER_DATA[name] || null;
    }

    /** Get character avatar URL by name */
    getCharacterAvatar(name: string): string {
        const key = name.toLowerCase() as keyof typeof CHUB_AVATARS;
        return CHUB_AVATARS[key] || '';
    }

    /** Generate stage directions for an active scene */
    private generateSceneDirections(scene: SceneData, _userText: string): string {
        const pcName = this.currentState.playerCharacter.name;
        const primaryChar = scene.participants[0];
        const lines: string[] = [];

        if (scene.participants.length === 1) {
            lines.push(`[SCENE MODE — Private Conversation at the ${scene.location}]`);
            lines.push(`You are now roleplaying as ${primaryChar}. Do NOT speak as ${pcName} or narrate ${pcName}'s actions.`);
        } else {
            lines.push(`[SCENE MODE — Group Conversation at the ${scene.location}]`);
            lines.push(`Characters present: ${scene.participants.join(', ')}`);
            lines.push(`Respond primarily as ${primaryChar}, but other present characters may also speak or react.`);
            lines.push(`Do NOT speak as ${pcName} or narrate ${pcName}'s actions.`);
        }

        // Add character personalities
        for (const name of scene.participants) {
            const charData = CHARACTER_DATA[name];
            const servant = this.currentState.servants[name];
            const hero = this.currentState.heroes[name];

            if (charData) {
                lines.push(`\n${name}'s personality: ${charData.description}`);
                lines.push(`Traits: ${charData.traits.join(', ')}`);
            }
            if (servant) {
                lines.push(`Love: ${servant.love}/100. Obedience: ${servant.obedience}/100. ${name} is a servant (former ${servant.formerClass}).`);
            } else if (hero) {
                lines.push(`Status: ${hero.status}. ${name} is a ${hero.heroClass}.${hero.status === 'captured' || hero.status === 'converting' ? ` Brainwashing: ${hero.brainwashing}/100.` : ''}`);
            }
        }

        // Include recent conversation history for context
        if (this._sceneMessages.length > 0) {
            const recent = this._sceneMessages.slice(-10);
            lines.push('\nRecent conversation:');
            for (const msg of recent) {
                lines.push(`${msg.sender}: ${msg.text}`);
            }
        }

        lines.push(`\nRespond in character as ${primaryChar}. Use first person. React naturally based on personality and relationship with ${pcName}.`);
        lines.push(`Keep responses conversational — 1 to 3 paragraphs.`);

        // Formatting instructions
        lines.push(`\n[TEXT FORMATTING RULES]`);
        lines.push(`Use the following formatting to distinguish actions from dialogue:`);
        lines.push(`- Wrap physical actions, gestures, expressions, and emotes in single asterisks: *crosses her arms and looks away*`);
        lines.push(`- Wrap spoken dialogue in double quotes: "I didn't expect to see you here."`);
        lines.push(`- Narration, inner thoughts, or scene descriptions are written as plain text without any special markers.`);
        lines.push(`Example: *leans against the doorframe, eyes half-lidded* "You look like you've had a rough day." She tilts her head slightly, considering her next words.`);
        lines.push(`Always use these formatting conventions consistently. Do NOT use ** (double asterisks) — only single * for actions.`);

        lines.push(`Do NOT output stat changes, system information, or break character.`);

        return lines.join('\n');
    }

    // ============================
    // Event System Engine
    // ============================

    private _activeEvent: ActiveEvent | null = null;
    private _eventMessages: SceneMessage[] = [];
    private _eventRegistry: Record<string, EventDefinition> = {
        [EVENT_BRAINWASHING.id]: EVENT_BRAINWASHING,
    };

    /** Register a new event definition at runtime */
    registerEvent(def: EventDefinition): void {
        this._eventRegistry[def.id] = def;
    }

    /** Get an event definition by ID */
    getEventDefinition(id: string): EventDefinition | null {
        return this._eventRegistry[id] || null;
    }

    /** Start an event. Returns the initial ActiveEvent state (React should own this). */
    startEvent(definitionId: string, target?: string): ActiveEvent | null {
        const def = this._eventRegistry[definitionId];
        if (!def) {
            console.error(`[Event] Unknown event: ${definitionId}`);
            return null;
        }

        const startStep = def.steps[def.startStep];
        if (!startStep) {
            console.error(`[Event] Missing start step: ${def.startStep}`);
            return null;
        }

        const event: ActiveEvent = {
            definitionId,
            currentStepId: def.startStep,
            target,
            log: [def.startStep],
            vars: {},
            appliedEffects: [],
            lastSkillCheck: undefined,
            chatPhaseActive: false,
            chatMessageCount: 0,
            conditioningStrategy: undefined,
            actionCooldowns: {},
            actionResults: [],
            lastActionResult: undefined,
        };

        this._activeEvent = event;

        // Apply entry effects of the start step
        if (startStep.effects && startStep.effects.length > 0) {
            this.applyEffects(startStep.effects, event);
        }

        console.log(`[Event] Started "${def.name}" ${target ? `targeting ${target}` : ''}`);
        return { ...event };
    }

    /** Advance the event by choosing an option. Returns updated ActiveEvent. */
    advanceEvent(choiceId?: string, forceResult?: 'success' | 'failure'): ActiveEvent | null {
        const event = this._activeEvent;
        if (!event) return null;

        const def = this._eventRegistry[event.definitionId];
        if (!def) return null;

        const currentStep = def.steps[event.currentStepId];
        if (!currentStep) return null;

        let nextStepId: string | undefined;

        if (choiceId && currentStep.choices) {
            // Player made a choice
            const choice = currentStep.choices.find(c => c.id === choiceId);
            if (!choice) {
                console.warn(`[Event] Invalid choice: ${choiceId}`);
                return { ...event };
            }

            // Consume item if required
            if (choice.consumeItem) {
                const inv = this.currentState.inventory[choice.consumeItem];
                if (inv && inv.quantity > 0) {
                    inv.quantity -= 1;
                    if (inv.quantity <= 0) delete this.currentState.inventory[choice.consumeItem];
                }
            }

            // Capture conditioning strategy if this is a strategy selection step
            if (CONDITIONING_STRATEGIES[choiceId]) {
                event.conditioningStrategy = choiceId;
                console.log(`[Event] Strategy selected: ${choiceId}`);
            }

            // Apply choice effects
            if (choice.effects) {
                this.applyEffects(choice.effects, event);
            }

            // Skill check branching
            if (choice.skillCheck) {
                const check = choice.skillCheck;
                let result: { roll: number; total: number; success: boolean };

                if (forceResult) {
                    // Debug: force outcome
                    result = { roll: forceResult === 'success' ? 100 : 1, total: forceResult === 'success' ? 999 : 0, success: forceResult === 'success' };
                    console.log(`[Event] Skill check (${check.skill}): FORCED ${forceResult.toUpperCase()}`);
                } else {
                    const playerSkillValue = this.currentState.stats.skills[check.skill] || 0;
                    result = rollSkillCheck(playerSkillValue, check.difficulty, check.modifier || 0);
                    console.log(`[Event] Skill check (${check.skill}): rolled ${result.roll}, total ${result.total} vs DC ${check.difficulty} → ${result.success ? 'SUCCESS' : 'FAIL'}`);
                }

                event.lastSkillCheck = {
                    skill: check.skill,
                    roll: result.roll,
                    difficulty: check.difficulty,
                    success: result.success,
                };

                nextStepId = result.success ? check.successStep : check.failureStep;
            } else {
                nextStepId = choice.nextStep;
            }
        } else if (currentStep.nextStep) {
            // Auto-advance narration step
            nextStepId = currentStep.nextStep;
        }

        if (!nextStepId) {
            console.warn('[Event] No next step resolved');
            return { ...event };
        }

        const nextStep = def.steps[nextStepId];
        if (!nextStep) {
            console.error(`[Event] Missing step: ${nextStepId}`);
            return { ...event };
        }

        // Advance to new step
        event.currentStepId = nextStepId;
        event.log.push(nextStepId);

        // Reset chat phase state for the new step
        event.chatPhaseActive = false;
        event.chatMessageCount = 0;
        this._eventMessages = [];

        // Apply entry effects of the new step
        if (nextStep.effects) {
            this.applyEffects(nextStep.effects, event);
        }

        // Run custom hook if present
        const ctx: EventContext = {
            stage: this,
            target: event.target,
            eventId: event.definitionId,
            vars: event.vars,
        };
        if (nextStep.onEnter) {
            nextStep.onEnter(ctx);
        }

        this._activeEvent = event;
        return { ...event };
    }

    /** End/cleanup the current event */
    endEvent(): void {
        if (this._activeEvent) {
            console.log(`[Event] Ended event "${this._activeEvent.definitionId}"`);
            this._activeEvent = null;
        }
    }

    /** Get current active event (read-only copy) */
    getActiveEvent(): ActiveEvent | null {
        return this._activeEvent ? { ...this._activeEvent } : null;
    }

    /** Apply an array of effects to game state */
    private applyEffects(effects: EventEffect[], event: ActiveEvent): void {
        for (const fx of effects) {
            const effectTarget = fx.target || event.target || '';
            switch (fx.type) {
                case 'modify_brainwashing': {
                    const hero = this.currentState.heroes[effectTarget];
                    if (hero) {
                        hero.brainwashing = Math.max(0, Math.min(100, hero.brainwashing + (fx.value || 0)));
                        if (hero.brainwashing > 0 && hero.status === 'captured') {
                            hero.status = 'converting';
                        }
                    }
                    break;
                }
                case 'modify_love': {
                    const servant = this.currentState.servants[effectTarget];
                    if (servant) {
                        servant.love = Math.max(0, Math.min(100, servant.love + (fx.value || 0)));
                    }
                    break;
                }
                case 'modify_obedience': {
                    const servant = this.currentState.servants[effectTarget];
                    if (servant) {
                        servant.obedience = Math.max(0, Math.min(100, servant.obedience + (fx.value || 0)));
                    }
                    break;
                }
                case 'modify_gold': {
                    this.currentState.stats.gold = Math.max(0, this.currentState.stats.gold + (fx.value || 0));
                    break;
                }
                case 'modify_skill': {
                    const skillKey = effectTarget as keyof SkillStats;
                    if (skillKey in this.currentState.stats.skills) {
                        this.currentState.stats.skills[skillKey] = Math.max(0,
                            this.currentState.stats.skills[skillKey] + (fx.value || 0));
                    }
                    break;
                }
                case 'add_item': {
                    const existing = this.currentState.inventory[effectTarget];
                    if (existing) {
                        existing.quantity += (fx.value || 1);
                    } else {
                        this.currentState.inventory[effectTarget] = {
                            name: effectTarget,
                            quantity: fx.value || 1,
                            type: getItemDefinition(effectTarget).type,
                        };
                    }
                    break;
                }
                case 'remove_item': {
                    const item = this.currentState.inventory[effectTarget];
                    if (item) {
                        item.quantity -= (fx.value || 1);
                        if (item.quantity <= 0) delete this.currentState.inventory[effectTarget];
                    }
                    break;
                }
                case 'set_hero_status': {
                    const hero = this.currentState.heroes[effectTarget];
                    if (hero && fx.status) {
                        hero.status = fx.status as any;
                    }
                    break;
                }
                case 'convert_to_servant': {
                    const hero = this.currentState.heroes[effectTarget];
                    if (hero) {
                        this.currentState.servants[effectTarget] = {
                            name: hero.name,
                            formerClass: hero.heroClass,
                            avatar: hero.avatar,
                            color: hero.color,
                            description: hero.description,
                            traits: hero.traits,
                            details: hero.details,
                            stats: hero.stats,
                            love: 50,
                            obedience: 100,
                        };
                        delete this.currentState.heroes[effectTarget];
                        this.currentState.stats.servants += 1;
                    }
                    break;
                }
                case 'custom':
                    // Handled externally
                    break;
            }
            event.appliedEffects.push(fx);
        }
    }

    /** Check if the player has a particular item (by name, optional min quantity) */
    hasItem(itemName: string, minQty: number = 1): boolean {
        const inv = this.currentState.inventory[itemName];
        return !!inv && inv.quantity >= minQty;
    }

    // ============================
    // Event Chat Phase Methods
    // ============================

    /** Start the chat phase for the current event step */
    startEventChat(): void {
        if (!this._activeEvent) return;
        this._activeEvent.chatPhaseActive = true;
        this._activeEvent.chatMessageCount = 0;
        this._activeEvent.lastActionResult = undefined;
        this._eventMessages = [];
        console.log('[Event] Chat phase started');
    }

    /** End the chat phase (preserves chatMessageCount for UI logic) */
    endEventChat(): void {
        if (!this._activeEvent) return;
        this._activeEvent.chatPhaseActive = false;
        this._eventMessages = [];
        console.log(`[Event] Chat phase ended after ${this._activeEvent.chatMessageCount} messages`);
    }

    /** Get event chat messages (read-only copy) */
    getEventMessages(): SceneMessage[] {
        return [...this._eventMessages];
    }

    /**
     * Send a player message during the event chat phase.
     * Returns the NPC reply, or null on failure.
     */
    async sendEventMessage(text: string): Promise<SceneMessage | null> {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive || !text.trim()) return null;

        const pcName = this.currentState.playerCharacter.name;
        this._eventMessages.push({ sender: pcName, text: text.trim() });

        try {
            await this.messenger.nudge({
                stage_directions: this.generateEventChatDirections(text.trim()),
            });

            // afterResponse() will have pushed the NPC reply
            const latest = this._eventMessages[this._eventMessages.length - 1];
            if (latest && latest.sender !== pcName) {
                event.chatMessageCount += 1;
                return { ...latest };
            }
            return null;
        } catch (e) {
            console.error('[Event Chat] Send failed:', e);
            return null;
        }
    }

    // ============================
    // Conditioning Action Engine
    // ============================

    /** Get the current brainwashing value for the active event's target */
    getTargetBrainwashing(): number {
        const event = this._activeEvent;
        if (!event?.target) return 0;
        const hero = this.currentState.heroes[event.target];
        return hero?.brainwashing || 0;
    }

    /**
     * Get all conditioning actions available right now.
     * Filtered by: brainwashing threshold, item requirements, cooldowns, strategy bonuses.
     */
    getAvailableActions(): { action: ConditioningAction; locked: boolean; lockReason?: string }[] {
        const event = this._activeEvent;
        if (!event) return [];

        const bw = this.getTargetBrainwashing();
        const strategy = event.conditioningStrategy ? CONDITIONING_STRATEGIES[event.conditioningStrategy] : null;
        const results: { action: ConditioningAction; locked: boolean; lockReason?: string }[] = [];

        for (const action of Object.values(CONDITIONING_ACTIONS)) {
            // Skip strategy-specific bonus actions that don't belong to chosen strategy
            const isBonusAction = Object.values(CONDITIONING_STRATEGIES).some(
                s => s.bonusActions?.includes(action.id)
            );
            if (isBonusAction && (!strategy?.bonusActions || !strategy.bonusActions.includes(action.id))) {
                continue;
            }

            // Check max brainwashing cap
            if (action.maxBrainwashing !== undefined && bw > action.maxBrainwashing) continue;

            // Determine lock state
            let locked = false;
            let lockReason: string | undefined;

            // Brainwashing threshold
            if (bw < action.minBrainwashing) {
                locked = true;
                lockReason = `Requires ${action.minBrainwashing}% conditioning`;
            }

            // Item requirement (show but lock if missing)
            if (!locked && action.requiresItem && !this.hasItem(action.requiresItem)) {
                // If it's a consumed item, lock it. If it's required (not consumed), also lock.
                if (action.consumeItem || !this.hasItem(action.requiresItem)) {
                    // For consumeItem, check specifically
                    if (action.consumeItem && !this.hasItem(action.consumeItem)) {
                        locked = true;
                        lockReason = `Requires ${action.consumeItem}`;
                    } else if (action.requiresItem && !action.consumeItem && !this.hasItem(action.requiresItem)) {
                        locked = true;
                        lockReason = `Requires ${action.requiresItem}`;
                    }
                }
            }

            // Cooldown
            if (!locked && action.cooldownMessages > 0) {
                const lastUsed = event.actionCooldowns[action.id];
                if (lastUsed !== undefined) {
                    const messagesSince = event.chatMessageCount - lastUsed;
                    if (messagesSince < action.cooldownMessages) {
                        locked = true;
                        lockReason = `Cooldown: ${action.cooldownMessages - messagesSince} msg`;
                    }
                }
            }

            results.push({ action, locked, lockReason });
        }

        return results;
    }

    /**
     * Execute a conditioning action during the chat phase.
     * Applies effects, consumes items, does skill checks, updates brainwashing.
     * Returns a result object for the UI.
     */
    executeConditioningAction(actionId: string): ActionResult | null {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive || !event.target) return null;

        const action = CONDITIONING_ACTIONS[actionId];
        if (!action) return null;

        const hero = this.currentState.heroes[event.target];
        if (!hero) return null;

        const strategy = event.conditioningStrategy ? CONDITIONING_STRATEGIES[event.conditioningStrategy] : null;
        const pcName = this.currentState.playerCharacter.name;
        const oldBw = hero.brainwashing;
        const oldTier = getConditioningTier(oldBw);

        // Consume item if needed
        if (action.consumeItem) {
            const inv = this.currentState.inventory[action.consumeItem];
            if (!inv || inv.quantity <= 0) {
                return { actionId, success: false, delta: 0, message: `You don't have ${action.consumeItem}!`, newBrainwashing: oldBw };
            }
            inv.quantity -= 1;
            if (inv.quantity <= 0) delete this.currentState.inventory[action.consumeItem];
        }

        let success = true;
        let delta = action.brainwashingDelta;
        let message = '';
        let skillCheckResult: ActionResult['skillCheck'] = undefined;

        // Skill check
        if (action.skillCheck) {
            const playerSkillValue = this.currentState.stats.skills[action.skillCheck.skill] || 0;
            const bonus = (strategy?.skillBonus?.skill === action.skillCheck.skill ? strategy.skillBonus.bonus : 0);
            const result = rollSkillCheck(playerSkillValue, action.skillCheck.difficulty, bonus);

            skillCheckResult = {
                skill: action.skillCheck.skill,
                roll: result.roll,
                difficulty: action.skillCheck.difficulty,
                success: result.success,
            };

            success = result.success;
            if (!success) {
                delta = action.failDelta;
            }

            console.log(`[Conditioning] ${action.label}: ${action.skillCheck.skill} check rolled ${result.roll}, total ${result.total} vs DC ${action.skillCheck.difficulty} (bonus: ${bonus}) → ${success ? 'SUCCESS' : 'FAIL'}`);
        }

        // Apply brainwashing delta
        hero.brainwashing = Math.max(0, Math.min(100, hero.brainwashing + delta));
        if (hero.brainwashing > 0 && hero.status === 'captured') {
            hero.status = 'converting';
        }

        const newTier = getConditioningTier(hero.brainwashing);
        const thresholdCrossed = newTier !== oldTier ? newTier : undefined;

        // Build player-visible message
        if (success) {
            if (action.skillCheck) {
                message = `${action.icon} ${action.label} — ${action.skillCheck.skill.toUpperCase()} Check: ${skillCheckResult!.roll} vs DC ${action.skillCheck.difficulty} — Success! Conditioning +${delta}%`;
            } else {
                message = `${action.icon} ${action.label} — Conditioning +${delta}%`;
            }
        } else {
            message = `${action.icon} ${action.label} — ${action.skillCheck!.skill.toUpperCase()} Check: ${skillCheckResult!.roll} vs DC ${action.skillCheck!.difficulty} — Failed!${delta > 0 ? ` Conditioning +${delta}%` : ''}`;
        }

        if (thresholdCrossed) {
            const tierLabels: Record<ConditioningTier, string> = {
                defiant: '🟥 Defiant',
                wavering: '🟧 Wavering',
                susceptible: '🟨 Susceptible',
                broken: '🟩 Broken',
            };
            message += ` — ⚡ Threshold: ${tierLabels[thresholdCrossed]}!`;
        }

        // Record cooldown
        event.actionCooldowns[actionId] = event.chatMessageCount;

        // Inject LLM directive into event messages as a system message
        const directive = success
            ? action.llmDirective
            : (action.failDirective || `${pcName} attempted ${action.label} but failed.`);
        const interpolatedDirective = directive
            .replace(/\{target\}/g, event.target || '')
            .replace(/\{pc\}/g, pcName);

        this._eventMessages.push({
            sender: '\u00a7system',
            text: interpolatedDirective,
        });

        // Handle special item gains (Memory Fragment from memory_extraction)
        if (actionId === 'memory_extraction' && success) {
            const existing = this.currentState.inventory['Memory Fragment'];
            if (existing) {
                existing.quantity += 1;
            } else {
                this.currentState.inventory['Memory Fragment'] = {
                    name: 'Memory Fragment',
                    quantity: 1,
                    type: 'key',
                };
            }
            message += ' — Gained Memory Fragment!';
        }

        const result: ActionResult = {
            actionId,
            success,
            delta,
            message,
            skillCheck: skillCheckResult,
            newBrainwashing: hero.brainwashing,
            thresholdCrossed,
        };

        event.actionResults.push(result);
        event.lastActionResult = result;

        console.log(`[Conditioning] ${action.label}: ${success ? 'SUCCESS' : 'FAIL'}, delta=${delta}, new bw=${hero.brainwashing}`);
        return result;
    }

    /**
     * Execute a conditioning action with a forced result (debug).
     */
    executeConditioningActionForced(actionId: string, forceSuccess: boolean): ActionResult | null {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive || !event.target) return null;

        const action = CONDITIONING_ACTIONS[actionId];
        if (!action) return null;

        const hero = this.currentState.heroes[event.target];
        if (!hero) return null;

        const pcName = this.currentState.playerCharacter.name;
        const oldBw = hero.brainwashing;
        const oldTier = getConditioningTier(oldBw);

        // Consume item if needed
        if (action.consumeItem) {
            const inv = this.currentState.inventory[action.consumeItem];
            if (inv && inv.quantity > 0) {
                inv.quantity -= 1;
                if (inv.quantity <= 0) delete this.currentState.inventory[action.consumeItem];
            }
        }

        const success = forceSuccess;
        const delta = success ? action.brainwashingDelta : action.failDelta;

        hero.brainwashing = Math.max(0, Math.min(100, hero.brainwashing + delta));
        if (hero.brainwashing > 0 && hero.status === 'captured') {
            hero.status = 'converting';
        }

        const newTier = getConditioningTier(hero.brainwashing);
        const thresholdCrossed = newTier !== oldTier ? newTier : undefined;

        const message = success
            ? `${action.icon} ${action.label} — FORCED SUCCESS! Conditioning +${delta}%${thresholdCrossed ? ` — ⚡ ${thresholdCrossed}!` : ''}`
            : `${action.icon} ${action.label} — FORCED FAIL!${delta > 0 ? ` Conditioning +${delta}%` : ''}`;

        // Inject LLM directive
        const directive = success
            ? action.llmDirective
            : (action.failDirective || `${pcName} attempted ${action.label} but failed.`);
        this._eventMessages.push({
            sender: '\u00a7system',
            text: directive.replace(/\{target\}/g, event.target || '').replace(/\{pc\}/g, pcName),
        });

        if (actionId === 'memory_extraction' && success) {
            const existing = this.currentState.inventory['Memory Fragment'];
            if (existing) { existing.quantity += 1; }
            else { this.currentState.inventory['Memory Fragment'] = { name: 'Memory Fragment', quantity: 1, type: 'key' }; }
        }

        event.actionCooldowns[actionId] = event.chatMessageCount;

        const result: ActionResult = { actionId, success, delta, message, newBrainwashing: hero.brainwashing, thresholdCrossed,
            skillCheck: action.skillCheck ? { skill: action.skillCheck.skill, roll: forceSuccess ? 100 : 1, difficulty: action.skillCheck.difficulty, success: forceSuccess } : undefined,
        };
        event.actionResults.push(result);
        event.lastActionResult = result;
        return result;
    }

    /** Generate LLM stage directions for event chat */
    /** Generate LLM stage directions for event chat */
    private generateEventChatDirections(_userText: string): string {
        const event = this._activeEvent;
        if (!event) return '';

        const def = this._eventRegistry[event.definitionId];
        if (!def) return '';

        const step = def.steps[event.currentStepId];
        if (!step?.chatPhase) return '';

        const chatPhase = step.chatPhase;
        const pcName = this.currentState.playerCharacter.name;
        const speakerName = (chatPhase.speaker || 'NPC')
            .replace(/\{target\}/g, event.target || '')
            .replace(/\{pc\}/g, pcName);

        const lines: string[] = [];
        lines.push(`[CONDITIONING SESSION \u2014 ${def.name}]`);
        lines.push(`You are now roleplaying as ${speakerName}. Do NOT speak as ${pcName} or narrate ${pcName}'s actions.`);

        // Character personality data
        const charData = CHARACTER_DATA[speakerName];
        const hero = this.currentState.heroes[speakerName];

        if (charData) {
            lines.push(`\n${speakerName}'s personality: ${charData.description}`);
            lines.push(`Traits: ${charData.traits.join(', ')}`);
        }

        // Current conditioning state
        if (hero) {
            const bw = hero.brainwashing;
            const tier = getConditioningTier(bw);
            lines.push(`\n[CONDITIONING STATE]`);
            lines.push(`${speakerName} is a ${hero.heroClass}. Current conditioning: ${bw}/100 (${tier}).`);
            lines.push(`Behavior: ${getTierBehaviorDescription(tier)}`);
        }

        // Strategy context
        const strategy = event.conditioningStrategy ? CONDITIONING_STRATEGIES[event.conditioningStrategy] : null;
        if (strategy) {
            const stratContext = strategy.llmContext
                .replace(/\{target\}/g, event.target || '')
                .replace(/\{pc\}/g, pcName);
            lines.push(`\n[APPROACH]: ${stratContext}`);
        }

        // Recent action results — tell the LLM what just happened
        const recentActions = event.actionResults.slice(-3);
        if (recentActions.length > 0) {
            lines.push(`\n[RECENT CONDITIONING ACTIONS]:`);
            for (const ar of recentActions) {
                const act = CONDITIONING_ACTIONS[ar.actionId];
                if (act) {
                    const directive = ar.success ? act.llmDirective : (act.failDirective || '');
                    if (directive) {
                        lines.push(directive
                            .replace(/\{target\}/g, event.target || '')
                            .replace(/\{pc\}/g, pcName));
                    }
                }
            }
        }

        // The most recent action result gets special emphasis
        if (event.lastActionResult) {
            const lastAct = CONDITIONING_ACTIONS[event.lastActionResult.actionId];
            if (lastAct) {
                const dir = event.lastActionResult.success ? lastAct.llmDirective : (lastAct.failDirective || '');
                if (dir) {
                    lines.push(`\n[JUST NOW]: ${dir
                        .replace(/\{target\}/g, event.target || '')
                        .replace(/\{pc\}/g, pcName)}`);
                    lines.push(`React to this in your response. Your conditioning level is now ${hero?.brainwashing || 0}/100.`);
                }
                if (event.lastActionResult.thresholdCrossed) {
                    lines.push(`[IMPORTANT: You just crossed a conditioning threshold to "${event.lastActionResult.thresholdCrossed}". Your behavior should noticeably shift to match this new state.]`);
                }
            }
        }

        // Recent conversation context
        if (this._eventMessages.length > 0) {
            const recent = this._eventMessages.slice(-10).filter(m => m.sender !== '\u00a7system');
            if (recent.length > 0) {
                lines.push('\nRecent conversation:');
                for (const msg of recent) {
                    lines.push(`${msg.sender}: ${msg.text}`);
                }
            }
        }

        lines.push(`\nRespond in character as ${speakerName}. Use first person. React based on personality and current conditioning state.`);
        lines.push(`Keep responses conversational \u2014 1 to 3 paragraphs.`);

        // Formatting rules
        lines.push(`\n[TEXT FORMATTING RULES]`);
        lines.push(`- Wrap physical actions in single asterisks: *sighs heavily*`);
        lines.push(`- Wrap spoken dialogue in double quotes: "I can't resist..."`);
        lines.push(`- Narration is plain text without markers.`);
        lines.push(`- Do NOT use ** (double asterisks). Only single * for actions.`);
        lines.push(`Do NOT output stat changes, system information, or break character.`);

        return lines.join('\n');
    }

    // ============================
    // Manor Save/Load Methods
    // ============================
    
    /** Get manor slots from chatState (current chat's state) */
    getManorSlots(): SavedSlotData[] | undefined {
        return this.chatState.manorSlots;
    }

    /** Sync current manor layout to chatState (persisted on next message) */
    syncManorSlots(slots: SavedSlotData[]): void {
        this.chatState.manorSlots = slots;
    }

    /** Reset manor to defaults (new game) */
    resetManor(): void {
        this.chatState.manorSlots = undefined;
        // Reset stats to defaults
        const defaults = this.getDefaultMessageState();
        this.currentState.stats = defaults.stats;
    }

    /** Restore stats from a save file */
    restoreStats(stats: WitchStats): void {
        this.currentState.stats = { ...stats };
    }

    /** Restore generated images from a save file */
    restoreGeneratedImages(images: Record<string, Record<string, string>>): void {
        this.chatState.generatedImages = JSON.parse(JSON.stringify(images));
    }

    /** Get all save file slots */
    getSaveSlots(): (SaveFileSlot | null)[] {
        const slots: (SaveFileSlot | null)[] = [];
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            try {
                const key = `${this.storageKey}_slot_${i}`;
                const stored = localStorage.getItem(key);
                if (stored) {
                    slots.push(JSON.parse(stored) as SaveFileSlot);
                } else {
                    slots.push(null);
                }
            } catch {
                slots.push(null);
            }
        }
        return slots;
    }

    /** Save manor data, stats, and generated images to a specific slot */
    saveToSlot(slotIndex: number, name: string, data: SavedSlotData[], stats?: WitchStats): boolean {
        if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false;
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            const saveFile: SaveFileSlot = {
                name,
                timestamp: Date.now(),
                data,
                stats: stats || this.currentState.stats,
                generatedImages: this.chatState.generatedImages || undefined,
            };
            localStorage.setItem(key, JSON.stringify(saveFile));
            return true;
        } catch (e) {
            console.warn('Failed to save:', e);
            return false;
        }
    }

    /** Load manor data from a specific slot */
    loadFromSlot(slotIndex: number): SaveFileSlot | null {
        if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return null;
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored) as SaveFileSlot;
            }
        } catch (e) {
            console.warn('Failed to load:', e);
        }
        return null;
    }

    /** Delete a save slot */
    deleteSlot(slotIndex: number): boolean {
        if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false;
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }
}
