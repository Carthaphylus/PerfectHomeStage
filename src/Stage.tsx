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

// Hero information
export interface Hero {
    name: string;
    status: HeroStatus;
    conversionProgress: number; // 0-100
    traits?: string[];
    location?: string;
}

// Servant information
export interface Servant {
    name: string;
    formerClass: string;
    loyalty: number; // 0-100
    assignedTask?: string;
}

// Manor upgrade
export interface ManorUpgrade {
    name: string;
    level: number;
    description?: string;
}

// Inventory item
export interface InventoryItem {
    name: string;
    quantity: number;
    type?: string;
}

// Dungeon progress
export interface DungeonProgress {
    currentFloor: number;
    maxFloor: number;
    lastBoss?: string;
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
    heroes: { [heroName: string]: Hero };
    servants: { [servantName: string]: Servant };
    inventory: { [itemName: string]: InventoryItem };
    manorUpgrades: { [upgradeName: string]: ManorUpgrade };
    dungeonProgress?: DungeonProgress;
    currentQuest?: string;
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
            heroes: {},
            servants: {},
            inventory: {},
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
        }
    }

    async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        // Parse user message for game commands or state changes
        const content = userMessage.content.toLowerCase();
        
        // Update location if mentioned
        this.parseLocation(content);
        
        // Parse any stat mentions
        this.parseStats(content);

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
        // Parse bot response for game state updates
        const content = botMessage.content;
        
        this.parseGameState(content);
        
        // Generate system message with current stats
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
        const heroNames = ['Citrine', 'Felicity', 'Locke', 'Rogue', 'Barbarian', 'Cleric'];
        
        for (const heroName of heroNames) {
            if (text.includes(heroName)) {
                if (!this.currentState.heroes[heroName]) {
                    this.currentState.heroes[heroName] = {
                        name: heroName,
                        status: 'encountered',
                        conversionProgress: 0,
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
                    this.currentState.servants[heroName] = {
                        name: heroName,
                        formerClass: this.getHeroClass(heroName),
                        loyalty: 100,
                    };
                    delete this.currentState.heroes[heroName];
                    this.chatState.totalServantsConverted++;
                }
            }
        }

        // Parse stats from bot response
        this.parseStats(text);
    }

    private getHeroClass(heroName: string): string {
        const classes: {[key: string]: string} = {
            'Citrine': 'Witch',
            'Felicity': 'Mage',
            'Locke': 'Rogue',
            'Rogue': 'Rogue',
            'Barbarian': 'Barbarian',
            'Cleric': 'Cleric',
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

    /** Save manor data and stats to a specific slot */
    saveToSlot(slotIndex: number, name: string, data: SavedSlotData[], stats?: WitchStats): boolean {
        if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false;
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            const saveFile: SaveFileSlot = {
                name,
                timestamp: Date.now(),
                data,
                stats: stats || this.currentState.stats,
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
