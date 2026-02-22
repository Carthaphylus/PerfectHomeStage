// ──────────────────────────────────────────
// Shared Types & Interfaces
// ──────────────────────────────────────────
import type { StatName } from './stats';

// Hero status enum
export type HeroStatus = 'free' | 'encountered' | 'captured' | 'converting' | 'servant';

// Location types
export type Location = 'Manor' | 'Town' | 'Woods' | 'Ruins' | 'Circus' | 'Dungeon' | 'Unknown';

// ── Hero ──
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
    personalHistory?: string;
    backstory?: string;
}

// ── Servant ──
export interface Servant {
    name: string;
    formerClass: string;
    avatar: string;
    color: string;
    description: string;
    traits: string[];
    archetypeTraits?: string[];  // traits granted by the conversion archetype
    details: Record<string, string>;
    stats: Record<StatName, number>; // 0-100 values
    love: number; // 0-100
    obedience: number; // 0-100
    assignedTask?: string;
    assignedRole?: string; // role id from ROLE_REGISTRY
    personalHistory?: string;
    backstory?: string;
}

// ── Player Character ──
export interface PlayerCharacter {
    name: string;
    avatar: string;
    title: string;
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
    personalHistory?: string;
    backstory?: string;
}

// ── Manor / Dungeon ──
export interface ManorUpgrade {
    name: string;
    level: number;
    maxLevel: number;
    description: string;
    cost: number;
    effect: string;
}

export interface DungeonProgress {
    currentFloor: number;
    maxFloor: number;
    lastBoss?: string;
}

// ── Skill Stats ──
export interface SkillStats {
    power: number;
    wisdom: number;
    charm: number;
    speed: number;
}

export interface HouseholdStats {
    comfort: number;
    obedience: number;
}

export interface WitchStats {
    skills: SkillStats;
    household: HouseholdStats;
    gold: number;
    servants: number;
    maxServants: number;
    day: number;
}

// ── Scene ──
export interface SceneMessage {
    sender: string;
    text: string;
    _debugContext?: string;
    _edited?: boolean;
}

export interface SceneData {
    id: number;
    participants: string[];
    location: Location;
}

// ── Event System ──

/** Effect applied when entering a step or choosing an option */
export interface EventEffect {
    type:
        | 'modify_brainwashing'
        | 'modify_love'
        | 'modify_obedience'
        | 'modify_gold'
        | 'add_item'
        | 'remove_item'
        | 'set_hero_status'
        | 'convert_to_servant'
        | 'modify_skill'
        | 'custom';
    target?: string;
    value?: number;
    status?: string;
}

/** Skill check that gates a choice or determines branching */
export interface EventSkillCheck {
    skill: keyof SkillStats;
    difficulty: number;
    successStep: string;
    failureStep: string;
    modifier?: number;
}

/** Chat phase config — opens AI roleplay within an event step */
export interface EventChatPhase {
    context: string;
    speaker: string;
    location?: string;
    skippable: boolean;
    minMessages?: number;
    maxMessages?: number;
}

/** A player choice within a step */
export interface EventChoice {
    id: string;
    label: string;
    tooltip?: string;
    nextStep: string;
    skillCheck?: EventSkillCheck;
    requiresItem?: string;
    consumeItem?: string;
    effects?: EventEffect[];
    condition?: (ctx: EventContext) => boolean;
}

/** A single step/node in the event graph */
export interface EventStep {
    id: string;
    text: string;
    speaker?: string;
    image?: string;
    choices?: EventChoice[];
    effects?: EventEffect[];
    nextStep?: string;
    isEnding?: boolean;
    chatPhase?: EventChatPhase;
    onEnter?: (ctx: EventContext) => void;
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

/**
 * Runtime context passed to callbacks and used by the engine.
 * `stage` is typed as `any` here to avoid circular imports with Stage.tsx.
 * The Stage class passes itself as this field.
 */
export interface EventContext {
    stage: any;
    target?: string;
    eventId: string;
    vars: Record<string, any>;
}

/** Runtime state of an active event */
export interface ActiveEvent {
    definitionId: string;
    currentStepId: string;
    target?: string;
    log: string[];
    vars: Record<string, any>;
    appliedEffects: EventEffect[];
    lastSkillCheck?: {
        skill: string;
        roll: number;
        difficulty: number;
        success: boolean;
    };
    chatPhaseActive: boolean;
    chatMessageCount: number;
    conditioningStrategy?: string;
    actionCooldowns: Record<string, number>;
    actionResults: ActionResult[];
    lastActionResult?: ActionResult;
}

// ── Conditioning Types ──

/** Category of conditioning action */
export type ConditioningCategory = 'enchantment' | 'binding' | 'alchemy' | 'hex' | 'beguile';

/** Strategy the player picks at the start of a conditioning session */
export interface ConditioningStrategy {
    id: string;
    label: string;
    icon: string;
    color: string;
    tooltip: string;
    description: string;
    llmContext: string;
    bonusActions?: string[];
    skillBonus?: {
        skill: keyof SkillStats;
        bonus: number;
    };
}

/** An action the player can take during a conditioning chat session */
export interface ConditioningAction {
    id: string;
    label: string;
    icon: string;
    tooltip: string;
    category: ConditioningCategory;
    requiresItem?: string;
    consumeItem?: string;
    skillCheck?: {
        skill: keyof SkillStats;
        difficulty: number;
    };
    brainwashingDelta: number;
    failDelta: number;
    minBrainwashing: number;
    maxBrainwashing?: number;
    cooldownMessages: number;
    llmDirective: string;
    failDirective?: string;
}

/** Result of executing a conditioning action */
export interface ActionResult {
    actionId: string;
    success: boolean;
    delta: number;
    message: string;
    skillCheck?: {
        skill: string;
        roll: number;
        difficulty: number;
        success: boolean;
    };
    newBrainwashing: number;
    thresholdCrossed?: string;
}

// ── Message / Config / Init / Chat State ──

import type { InventoryItem } from './items';

/** Message-level state: Current game state at this message */
export type MessageStateType = {
    stats: WitchStats;
    location: Location;
    playerCharacter: PlayerCharacter;
    heroes: { [heroName: string]: Hero };
    servants: { [servantName: string]: Servant };
    inventory: { [itemName: string]: InventoryItem };
    manorUpgrades: { [upgradeName: string]: ManorUpgrade };
    dungeonProgress?: DungeonProgress;
    currentQuest?: string;
    nsfwMode?: boolean;
};

/** Configuration type for user preferences */
export type ConfigType = {
    theme?: 'dark' | 'light' | 'purple';
    showStats?: boolean;
    showHeroes?: boolean;
    showServants?: boolean;
    showManor?: boolean;
    showInventory?: boolean;
    showDungeon?: boolean;
    compactMode?: boolean;
};

/** Initialization state: One-time setup data */
export type InitStateType = {
    startDate: string;
    gameVersion?: string;
};

/** Chat-level state: Persistent across all branches */
export type ChatStateType = {
    discoveredLocations: Location[];
    totalHeroesCaptured: number;
    totalServantsConverted: number;
    achievements: string[];
    manorSlots?: SavedSlotData[];
    generatedImages?: Record<string, Record<string, string>>;
};

// ── Save System ──

/** Serializable manor slot data for saving/loading */
export interface SavedSlotData {
    slotId: string;
    roomType: string | null;
    level: number;
    occupant?: string;
}

/** A save file slot with metadata */
export interface SaveFileSlot {
    name: string;
    timestamp: number;
    data: SavedSlotData[];
    stats?: WitchStats;
    generatedImages?: Record<string, Record<string, string>>;
}

export const MAX_SAVE_SLOTS = 3;
