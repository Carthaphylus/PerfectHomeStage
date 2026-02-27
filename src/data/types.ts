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

// ── Task System ──

export type TaskCategory = 'room' | 'exploration' | 'training' | 'upkeep' | 'personal';
export type TaskOutcomeQuality = 'poor' | 'standard' | 'excellent';

/** How a trait modifies task outcome */
export interface TaskTraitModifier {
    traitKey: string;
    effect: 'bonus' | 'penalty';
    magnitude: number; // added/subtracted from quality score
    description: string;
}

/** Stat requirement to unlock a task */
export interface TaskRequirement {
    stat: StatName;
    minimum: number; // 0-100 value
}

/** A single reward entry from a completed task */
export interface TaskReward {
    type: 'gold' | 'item' | 'stat' | 'household' | 'mana';
    amount?: number;
    itemName?: string;
    stat?: string; // stat key for 'stat' or 'household' reward types
    narrative?: string; // flavor text for this reward
}

/** A task definition in the registry */
export interface TaskDefinition {
    id: string;
    name: string;
    description: string;
    category: TaskCategory;
    icon: string;
    color: string;
    duration: number; // turns to complete
    requirements: TaskRequirement[];
    traitModifiers: TaskTraitModifier[];
    rewards: TaskReward[];
    roomType?: string; // required room type for room-based tasks
    location?: Location; // required location for exploration tasks
    roleBonus?: string; // role id that gives a quality bonus
    manaCost?: number;
    staminaCost?: number; // stamina cost deducted from the servant
    primaryStat?: StatName; // main stat used for quality calculation
}

/** Runtime state of an active task on a servant */
export interface ActiveTask {
    definitionId: string;
    turnsRemaining: number;
    totalDuration: number;
    assignedDay: number;
    outcome?: TaskOutcome;
}

/** Result after a task is completed */
export interface TaskOutcome {
    success: boolean;
    quality: TaskOutcomeQuality;
    rewards: TaskReward[];
    narrative?: string;
    statModifiers?: Record<string, number>;
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
    stamina: number; // 0-100 — current stamina
    maxStamina: number; // maximum stamina (default 100)
    servantTitle?: string;     // conversion archetype title e.g. "Handmaiden", "Loyal Pet"
    servantTitleColor?: string;  // hex color for the title badge
    activeTask?: ActiveTask;
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
    mana: number;
    maxMana: number;
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

// ── AI Chat Change System ──

/** Categories of state changes the AI can make during a chat */
export type ChatChangeCategory =
    | 'love'
    | 'obedience'
    | 'stamina'
    | 'gold'
    | 'mana'
    | 'comfort'
    | 'household_obedience'
    | 'item_add'
    | 'item_remove'
    | 'stat';  // character stat (prowess, expertise, etc.)

/** A single allowed change category with min/max range */
export interface ChatChangeScopeEntry {
    category: ChatChangeCategory;
    min: number;   // minimum delta (typically negative)
    max: number;   // maximum delta (typically positive)
    allowedItems?: string[];   // for item categories — restrict which items
    allowedStats?: StatName[]; // for 'stat' category — restrict which stats
}

/** Full scope of what the AI is allowed to change during a chat */
export interface ChatChangeScope {
    entries: ChatChangeScopeEntry[];
    targetCharacters?: string[];  // restrict which characters can be affected
}

/** A single AI-decided state change */
export interface AIChatChange {
    category: ChatChangeCategory;
    target?: string;     // character name (for love/obedience/stamina/stat)
    field?: string;      // stat name (for 'stat' category)
    delta?: number;      // numeric change
    itemName?: string;   // for item categories
    quantity?: number;   // for item categories (default 1)
    reasoning: string;   // AI's rationale for this change
}

/** Full AI judgment result for a chat */
export interface AIChatJudgment {
    changes: AIChatChange[];
    summary: string;   // brief rationale for all changes
}

/** Chat phase config — opens AI roleplay within an event step */
export interface EventChatPhase {
    context: string;
    speaker: string;
    location?: string;
    skippable: boolean;
    minMessages?: number;
    maxMessages?: number;
    changeScope?: ChatChangeScope;  // AI-driven state changes allowed during this chat
}

/** A single item in a shop's inventory */
export interface ShopItem {
    itemName: string;
    price: number;
    quantity?: number;   // quantity given per purchase (default 1)
    stock?: number;      // limited stock per visit (undefined = unlimited)
    category: string;    // for tab grouping
}

/** Shop phase config — opens a trading UI within an event step */
export interface EventShopPhase {
    shopName: string;
    shopkeeperName: string;
    shopkeeperGreeting: string;
    shopkeeperPortrait?: string;
    categories: string[];   // ordered list of tab labels
    items: ShopItem[];
    exitStep: string;       // step to go to when leaving the shop
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
    shopPhase?: EventShopPhase;
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
    manaCost: number;
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

/** Full game state snapshot — everything needed to restore a game */
export interface SaveFileSlot {
    /** Save metadata */
    name: string;
    timestamp: number;
    version: number;               // schema version for migration

    /** Player stats */
    stats: WitchStats;

    /** Player character */
    playerCharacter: PlayerCharacter;

    /** Manor grid layout */
    manorSlots: SavedSlotData[];

    /** Manor upgrades */
    manorUpgrades: { [upgradeName: string]: ManorUpgrade };

    /** All heroes (keyed by name) */
    heroes: { [heroName: string]: Hero };

    /** All servants (keyed by name) */
    servants: { [servantName: string]: Servant };

    /** Full inventory */
    inventory: { [itemName: string]: InventoryItem };

    /** Chat-level persistent data */
    discoveredLocations: Location[];
    totalHeroesCaptured: number;
    totalServantsConverted: number;
    achievements: string[];

    /** Generated images (portraits etc.) */
    generatedImages?: Record<string, Record<string, string>>;

    /** Current location */
    location?: Location;

    /** Dungeon state */
    dungeonProgress?: DungeonProgress;

    /** Quest state (placeholder for future quest system) */
    activeQuests?: {
        questId: string;
        currentStep: number;
        startedDay: number;
        data?: Record<string, any>;
    }[];

    /** Misc flags */
    nsfwMode?: boolean;
}

/** Current save format version — bump when schema changes */
export const SAVE_VERSION = 2;

export const MAX_SAVE_SLOTS = 5;

// ── Turn System ──

/** A single line-item change that happened during end-of-day */
export interface TurnChange {
    icon: string;
    label: string;
    detail: string;
    delta?: number;       // numeric change (+/-)
    category: 'finance' | 'item' | 'servant' | 'task' | 'stat' | 'household' | 'mana' | 'stamina';
    color?: string;
}

/** A completed-task entry shown in the summary */
export interface TurnTaskResult {
    servantName: string;
    taskName: string;
    quality: TaskOutcomeQuality;
    rewards: TaskReward[];
}

/** Full summary of what happened when the day ended */
export interface TurnSummary {
    dayEnded: number;
    dayStarting: number;
    goldBefore: number;
    goldAfter: number;
    manaBefore: number;
    manaAfter: number;
    comfortBefore: number;
    comfortAfter: number;
    obedienceBefore: number;
    obedienceAfter: number;
    completedTasks: TurnTaskResult[];
    changes: TurnChange[];
    servantStaminaChanges: { name: string; before: number; after: number }[];
    taskProgressions: { servantName: string; taskName: string; turnsRemaining: number; totalDuration: number }[];
}
