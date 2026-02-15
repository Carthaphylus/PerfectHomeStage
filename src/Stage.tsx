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
    heroClass: string;
    avatar: string;
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
    location?: string;
}

// Servant information
export interface Servant {
    name: string;
    formerClass: string;
    avatar: string;
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
    loyalty: number; // 0-100
    assignedTask?: string;
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

// Chub.ai avatar URLs
export const CHUB_AVATARS = {
    citrine: 'https://avatars.charhub.io/avatars/Sauron275/citrine-9731bb4e10d9/chara_card_v2.png',
    felicity: 'https://avatars.charhub.io/avatars/Sauron275/felicity-79e6007def5a/chara_card_v2.png',
    locke: 'https://avatars.charhub.io/avatars/Sauron275/locke-ea98d94e3965/chara_card_v2.png',
    sable: 'https://avatars.charhub.io/avatars/Sauron275/sable-62ce8e0d06a3/chara_card_v2.png',
    veridian: 'https://avatars.charhub.io/avatars/Sauron275/the-cleric-ef8cef32f1ff/chara_card_v2.png',
    kova: 'https://avatars.charhub.io/avatars/Sauron275/the-barbarian-24e3aa6fd485/chara_card_v2.png',
    pervis: 'https://avatars.charhub.io/avatars/Sauron275/the-leader-8e93f3bc4f21/chara_card_v2.png',
};

// Character bio/profile data
export const CHARACTER_DATA: Record<string, { color: string; description: string; traits: string[]; details: Record<string, string> }> = {
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
    },
};

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

// Skit conversation message
export interface SkitMessage {
    sender: string;
    text: string;
}

// Active skit state
export interface ActiveSkitState {
    characterName: string;
    location: Location;
    messages: SkitMessage[];
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
    activeSkit?: ActiveSkitState | null;
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

    // Skit messages stored outside messageState so setState() can't wipe them
    public skitMessages: SkitMessage[] = [];

    // Monotonic skit version counter — increments every startSkit(), used as React key
    private _skitId: number = 0;

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
                    conversionProgress: 0,
                    heroClass: 'Thief',
                    avatar: CHUB_AVATARS.sable,
                    color: CHARACTER_DATA.Sable.color,
                    description: CHARACTER_DATA.Sable.description,
                    traits: CHARACTER_DATA.Sable.traits,
                    details: CHARACTER_DATA.Sable.details,
                    location: 'Unknown',
                },
                'Veridian': {
                    name: 'Veridian',
                    status: 'free',
                    conversionProgress: 0,
                    heroClass: 'Cleric',
                    avatar: CHUB_AVATARS.veridian,
                    color: CHARACTER_DATA.Veridian.color,
                    description: CHARACTER_DATA.Veridian.description,
                    traits: CHARACTER_DATA.Veridian.traits,
                    details: CHARACTER_DATA.Veridian.details,
                    location: 'Unknown',
                },
                'Kova': {
                    name: 'Kova',
                    status: 'free',
                    conversionProgress: 0,
                    heroClass: 'Barbarian',
                    avatar: CHUB_AVATARS.kova,
                    color: CHARACTER_DATA.Kova.color,
                    description: CHARACTER_DATA.Kova.description,
                    traits: CHARACTER_DATA.Kova.traits,
                    details: CHARACTER_DATA.Kova.details,
                    location: 'Unknown',
                },
                'Pervis': {
                    name: 'Pervis',
                    status: 'free',
                    conversionProgress: 0,
                    heroClass: 'Leader',
                    avatar: CHUB_AVATARS.pervis,
                    color: CHARACTER_DATA.Pervis.color,
                    description: CHARACTER_DATA.Pervis.description,
                    traits: CHARACTER_DATA.Pervis.traits,
                    details: CHARACTER_DATA.Pervis.details,
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
                    loyalty: 80,
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
                    loyalty: 75,
                    assignedTask: undefined,
                },
            },
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
        const skit = this.currentState.activeSkit;

        // If a skit is active, handle skit conversation
        if (skit) {
            // Only add to history if not already added by sendSkitMessage
            const lastMsg = this.skitMessages[this.skitMessages.length - 1];
            const pcName = this.currentState.playerCharacter.name;
            if (!lastMsg || lastMsg.sender !== pcName || lastMsg.text !== content) {
                this.skitMessages.push({
                    sender: pcName,
                    text: content,
                });
            }

            return {
                stageDirections: this.generateSkitDirections(skit, content),
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
        const skit = this.currentState.activeSkit;

        // If a skit is active, capture the bot response as the character's reply
        if (skit) {
            this.skitMessages.push({
                sender: skit.characterName,
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
                    const charData = CHARACTER_DATA[heroName] || { color: '#888', description: '', traits: [], details: {} };
                    this.currentState.heroes[heroName] = {
                        name: heroName,
                        status: 'encountered',
                        conversionProgress: 0,
                        heroClass: this.getHeroClass(heroName),
                        avatar: this.getHeroAvatar(heroName),
                        color: charData.color,
                        description: charData.description,
                        traits: charData.traits,
                        details: charData.details,
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
                    const charData = CHARACTER_DATA[heroName] || { color: '#888', description: '', traits: [], details: {} };
                    this.currentState.servants[heroName] = {
                        name: heroName,
                        formerClass: this.getHeroClass(heroName),
                        avatar: this.getHeroAvatar(heroName),
                        color: charData.color,
                        description: charData.description,
                        traits: charData.traits,
                        details: charData.details,
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
    // Skit Methods
    // ============================

    /** Get the current skit version (changes on every startSkit) */
    getSkitId(): number {
        return this._skitId;
    }

    /** Get the current active skit (or null) */
    getActiveSkit(): ActiveSkitState | null {
        return this.currentState.activeSkit || null;
    }

    /** Get the current skit messages array */
    getSkitMessages(): SkitMessage[] {
        return this.skitMessages;
    }

    /** Start a conversation skit with a character */
    startSkit(characterName: string, location: Location): void {
        // Wipe any previous skit state cleanly
        this.skitMessages = [];
        this._skitId++;
        this.currentState.activeSkit = {
            characterName,
            location,
            messages: [],
        };
        console.log(`[Skit] Started skit #${this._skitId} with ${characterName} at ${location}`);
    }

    /** End the active skit */
    endSkit(): void {
        const prev = this.currentState.activeSkit?.characterName || 'none';
        this.skitMessages = [];
        this.currentState.activeSkit = null;
        console.log(`[Skit] Ended skit with ${prev}`);
    }

    /**
     * Send a message in the active skit as Citrine.
     * Adds player message to local history, then uses nudge to get the LLM
     * to respond in character. We skip impersonate entirely — the conversation
     * is managed locally and passed via stage_directions.
     */
    async sendSkitMessage(text: string): Promise<boolean> {
        const skit = this.currentState.activeSkit;
        if (!skit || !text.trim()) return false;

        // Add to local skit history immediately (player side)
        this.skitMessages.push({
            sender: this.currentState.playerCharacter.name,
            text: text.trim(),
        });

        try {
            // Use nudge to trigger the bot to respond as the skit character.
            // The full conversation history + character info is passed via stage_directions.
            // No impersonate needed — we manage the skit conversation ourselves.
            await this.messenger.nudge({
                stage_directions: this.generateSkitDirections(skit, text.trim()),
            });

            return true;
        } catch (e) {
            console.error('Skit send failed:', e);
            return false;
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

    /** Generate stage directions for an active skit */
    private generateSkitDirections(skit: ActiveSkitState, _userText: string): string {
        const charData = CHARACTER_DATA[skit.characterName];
        const servant = this.currentState.servants[skit.characterName];
        const hero = this.currentState.heroes[skit.characterName];
        const pcName = this.currentState.playerCharacter.name;

        const lines: string[] = [];
        lines.push(`[SKIT MODE — Private Conversation at the ${skit.location}]`);
        lines.push(`You are now roleplaying as ${skit.characterName}. Do NOT speak as ${pcName} or narrate ${pcName}'s actions.`);

        if (charData) {
            lines.push(`${skit.characterName}'s personality: ${charData.description}`);
            lines.push(`Traits: ${charData.traits.join(', ')}`);
        }
        if (servant) {
            lines.push(`Loyalty: ${servant.loyalty}/100. ${skit.characterName} is a servant (former ${servant.formerClass}).`);
        } else if (hero) {
            lines.push(`Status: ${hero.status}. ${skit.characterName} is a ${hero.heroClass}.`);
        }

        // Include recent conversation history for context
        if (this.skitMessages.length > 0) {
            const recent = this.skitMessages.slice(-10);
            lines.push('\nRecent conversation:');
            for (const msg of recent) {
                lines.push(`${msg.sender}: ${msg.text}`);
            }
        }

        lines.push(`\nRespond in character as ${skit.characterName}. Use first person. React naturally based on personality and relationship with ${pcName}.`);
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
