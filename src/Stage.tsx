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

// Witch stats
export interface WitchStats {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    corruption: number; // 0-100
    influence: number; // 0-100
    money: number;
    level?: number;
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

/***
 Perfect Home Stage Implementation
 ***/
export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {

    // Internal state for current game data
    public currentState: MessageStateType;
    public config: ConfigType;
    public chatState: ChatStateType;

    constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
        super(data);
        const { config, messageState, chatState } = data;

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
                health: 100,
                maxHealth: 100,
                mana: 50,
                maxMana: 50,
                corruption: 0,
                influence: 10,
                money: 100,
                level: 1,
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
        const healthMatch = text.match(/health[:\s]+(\d+)/i);
        const manaMatch = text.match(/mana[:\s]+(\d+)/i);
        const moneyMatch = text.match(/(?:money|gold|coins?)[:\s]+(\d+)/i);
        const corruptionMatch = text.match(/corruption[:\s]+(\d+)/i);

        if (healthMatch) this.currentState.stats.health = Math.min(parseInt(healthMatch[1]), this.currentState.stats.maxHealth);
        if (manaMatch) this.currentState.stats.mana = Math.min(parseInt(manaMatch[1]), this.currentState.stats.maxMana);
        if (moneyMatch) this.currentState.stats.money = parseInt(moneyMatch[1]);
        if (corruptionMatch) this.currentState.stats.corruption = Math.min(parseInt(corruptionMatch[1]), 100);
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
        
        directions.push(`[Current Location: ${this.currentState.location}]`);
        directions.push(`[Witch Stats - HP: ${this.currentState.stats.health}/${this.currentState.stats.maxHealth}, ` +
                       `Mana: ${this.currentState.stats.mana}/${this.currentState.stats.maxMana}, ` +
                       `Corruption: ${this.currentState.stats.corruption}%, Money: ${this.currentState.stats.money}]`);
        
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

        const stats = this.currentState.stats;
        return `━━━━━━━━━━━━━━━━━━
📊 Witch Status
HP: ${stats.health}/${stats.maxHealth} | Mana: ${stats.mana}/${stats.maxMana}
Corruption: ${stats.corruption}% | Influence: ${stats.influence}%
💰 Money: ${stats.money}
📍 Location: ${this.currentState.location}
━━━━━━━━━━━━━━━━━━`;
    }


    render(): ReactElement {
        return <BaseScreen stage={() => this} />;
    }

    // ============================
    // Manor Save/Load Methods
    // ============================
    
    /** Get saved manor slot data, or undefined if no save exists (use defaults) */
    getManorSlots(): SavedSlotData[] | undefined {
        return this.chatState.manorSlots;
    }

    /** Save manor slot data to persistent chat state */
    saveManorSlots(slots: SavedSlotData[]): void {
        this.chatState.manorSlots = slots;
    }
}
