import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";
import { BaseScreen } from "./screens/BaseScreen";

// ── Data & Type imports (split from Stage.tsx) ──
import {
    // Types
    HeroStatus, Location, Hero, Servant, PlayerCharacter,
    ManorUpgrade, DungeonProgress, SceneMessage, SceneData,
    SkillStats, HouseholdStats, WitchStats,
    MessageStateType, ConfigType, InitStateType, ChatStateType,
    SavedSlotData, SaveFileSlot, MAX_SAVE_SLOTS,
    EventEffect, EventSkillCheck, EventChatPhase,
    EventChoice, EventStep, EventDefinition, EventContext, ActiveEvent,
    ConditioningCategory, ConditioningAction, ActionResult,
    // Stats
    StatName, StatDefinition, STAT_DEFINITIONS, GRADE_TIERS,
    StatGrade, numberToGrade, gradeToNumber, getGradeColor, getStatColor,
    // Traits
    TraitScope, TraitDefinition, TRAIT_REGISTRY, getTraitDefinition,
    // Roles
    Role, RoleBuff, UNIVERSAL_ROLES, ROOM_ROLES, ROLE_REGISTRY,
    getRoleById, getAvailableRoles, DEFAULT_BUILT_ROOM_TYPES,
    // Characters
    CHUB_USER, CHUB_CHARACTER_IDS, getChubAvatarUrl, CHUB_AVATARS, CHARACTER_DATA,
    // Items
    ItemRarity, ItemType, ItemDefinition, InventoryItem,
    ITEM_REGISTRY, getItemDefinition, getRarityColor,
    // Conversion
    ConversionArchetype, CONVERSION_ARCHETYPES, getConversionArchetype,
    // Conditioning
    ConditioningTier, ConditioningStrategy,
    getConditioningTier, getTierBehaviorDescription,
    getConditioningMilestoneDirections, getObedienceMilestoneDirections, getLoveMilestoneDirections,
    CONDITIONING_STRATEGIES, CONDITIONING_ACTIONS,
    // Events
    rollSkillCheck, EVENT_BRAINWASHING,
} from './data';

// Re-export types for backward compatibility with screen components
export type {
    HeroStatus, Location, Hero, Servant, PlayerCharacter,
    ManorUpgrade, DungeonProgress, SceneMessage, SceneData,
    SkillStats, HouseholdStats, WitchStats,
    MessageStateType, ConfigType, InitStateType, ChatStateType,
    SavedSlotData, SaveFileSlot,
    EventEffect, EventSkillCheck, EventChatPhase,
    EventChoice, EventStep, EventDefinition, EventContext, ActiveEvent,
    ConditioningCategory, ConditioningAction, ActionResult,
    StatName, StatDefinition,
    StatGrade,
    TraitScope, TraitDefinition,
    Role, RoleBuff,
    ItemRarity, ItemType, ItemDefinition, InventoryItem,
    ConversionArchetype,
    ConditioningTier, ConditioningStrategy,
};

// Re-export values for backward compatibility
export {
    MAX_SAVE_SLOTS,
    STAT_DEFINITIONS, GRADE_TIERS,
    numberToGrade, gradeToNumber, getGradeColor, getStatColor,
    TRAIT_REGISTRY, getTraitDefinition,
    UNIVERSAL_ROLES, ROOM_ROLES, ROLE_REGISTRY,
    getRoleById, getAvailableRoles, DEFAULT_BUILT_ROOM_TYPES,
    CHUB_USER, CHUB_CHARACTER_IDS, getChubAvatarUrl, CHUB_AVATARS, CHARACTER_DATA,
    ITEM_REGISTRY, getItemDefinition, getRarityColor,
    CONVERSION_ARCHETYPES, getConversionArchetype,
    getConditioningTier, getTierBehaviorDescription,
    getConditioningMilestoneDirections, getObedienceMilestoneDirections, getLoveMilestoneDirections,
    CONDITIONING_STRATEGIES, CONDITIONING_ACTIONS,
    rollSkillCheck, EVENT_BRAINWASHING,
};

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
            // Re-apply conditioning brainwashing from active event
            // (setState can overwrite in-memory changes made by executeConditioningAction)
            if (this._activeEvent?.target && this._activeEvent.actionResults.length > 0) {
                const hero = this.currentState.heroes[this._activeEvent.target];
                if (hero) {
                    const lastResult = this._activeEvent.actionResults[this._activeEvent.actionResults.length - 1];
                    hero.brainwashing = lastResult.newBrainwashing;
                    if (hero.brainwashing > 0 && hero.status === 'captured') {
                        hero.status = 'converting';
                    }
                }
            }
        }
    }

    async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        const content = userMessage.content;
        const scene = this._activeScene;

        // If an event chat phase is active, we use textGen directly — no stageDirections needed
        if (this._activeEvent?.chatPhaseActive) {
            return {
                stageDirections: null,
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

        // If an event chat phase is active, we manage messages manually via textGen — skip
        if (this._activeEvent?.chatPhaseActive) {
            // Don't push to _eventMessages here — sendEventMessage/regenerateEventResponse handle it
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
    private _textGenActive: boolean = false; // flag to prevent afterResponse from double-adding
    private _lastGeneratedPrompt: string = ''; // stored for debug context viewer
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

    // ============================
    // Conversion System
    // ============================

    /**
     * Convert a fully conditioned captive into a servant using a predefined archetype.
     * Rewrites their personality, keeps existing traits, and adds archetype-granted traits.
     */
    convertCaptiveWithArchetype(heroName: string, archetypeId: string): boolean {
        const hero = this.currentState.heroes[heroName];
        if (!hero || hero.brainwashing < 100) return false;

        const archetype = getConversionArchetype(archetypeId);
        if (!archetype) return false;

        // Build trait list: keep existing + add archetype traits (dedup)
        const existingTraits = [...hero.traits];
        const newTraits = archetype.grantedTraits.filter(t => !existingTraits.includes(t));
        const finalTraits = [...existingTraits, ...newTraits];

        // Create servant
        this.currentState.servants[heroName] = {
            name: hero.name,
            formerClass: hero.heroClass,
            avatar: hero.avatar,
            color: hero.color,
            description: archetype.personalityRewrite,
            traits: finalTraits,
            details: hero.details,
            stats: hero.stats,
            love: 50,
            obedience: 100,
            personalHistory: hero.personalHistory,
            backstory: hero.backstory,
        };

        delete this.currentState.heroes[heroName];
        this.currentState.stats.servants += 1;

        console.log(`[Conversion] ${heroName} converted with archetype "${archetype.name}" → Servant`);
        return true;
    }

    /**
     * Convert a captive using a chat-determined personality rewrite.
     * Called after the LLM chat produces a new personality description.
     */
    convertCaptiveWithCustom(heroName: string, newDescription: string, newTraits: string[]): boolean {
        const hero = this.currentState.heroes[heroName];
        if (!hero || hero.brainwashing < 100) return false;

        // Build trait list: keep existing + add new ones (dedup)
        const existingTraits = [...hero.traits];
        const addedTraits = newTraits.filter(t => !existingTraits.includes(t));
        const finalTraits = [...existingTraits, ...addedTraits];

        this.currentState.servants[heroName] = {
            name: hero.name,
            formerClass: hero.heroClass,
            avatar: hero.avatar,
            color: hero.color,
            description: newDescription,
            traits: finalTraits,
            details: hero.details,
            stats: hero.stats,
            love: 50,
            obedience: 100,
            personalHistory: hero.personalHistory,
            backstory: hero.backstory,
        };

        delete this.currentState.heroes[heroName];
        this.currentState.stats.servants += 1;

        console.log(`[Conversion] ${heroName} converted with custom personality → Servant`);
        return true;
    }

    /**
     * Generate a conversion scene response via the LLM.
     * Used during the final conversion chat — everything always succeeds.
     */
    async generateConversionResponse(heroName: string, archetypeId: string | null, playerText: string, messages: SceneMessage[]): Promise<SceneMessage | null> {
        const hero = this.currentState.heroes[heroName];
        if (!hero) return null;

        const pcName = this.currentState.playerCharacter.name;
        const charData = CHARACTER_DATA[heroName];
        const archetype = archetypeId ? getConversionArchetype(archetypeId) : null;

        const lines: string[] = [];

        // Role lock
        lines.push(`[SYSTEM INSTRUCTIONS]`);
        lines.push(`You are roleplaying as ${heroName}. You are ONLY ${heroName}.`);
        lines.push(`NEVER speak as ${pcName}, narrate ${pcName}'s actions, thoughts, or dialogue.`);
        lines.push(`Stay in character at all times.`);

        // Character identity
        lines.push(`\n[CHARACTER: ${heroName}]`);
        if (charData) {
            lines.push(`Original personality (before conversion): ${charData.description}`);
            lines.push(`Traits: ${charData.traits.join(', ')}`);
            if (charData.details) {
                lines.push(`Details: ${Object.entries(charData.details).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
            }
        }

        // Conversion context
        lines.push(`\n[CRITICAL CONTEXT — FINAL CONVERSION SCENE]`);
        lines.push(`${heroName}'s brainwashing is at 100%. Their will is COMPLETELY broken. This is the FINAL conversion scene where their personality is being permanently rewritten.`);
        lines.push(`Everything ${pcName} does in this scene SUCCEEDS. ${heroName} has NO resistance left. They accept everything.`);
        lines.push(`This is a transformative, climactic scene. ${heroName} is becoming someone new.`);

        if (archetype) {
            lines.push(`\n[CONVERSION TYPE: ${archetype.name}]`);
            lines.push(archetype.llmConversionDirective
                .replace(/\{target\}/g, heroName)
                .replace(/\{pc\}/g, pcName));
            lines.push(`\nNew personality being formed: ${archetype.personalityRewrite}`);
        } else {
            lines.push(`\n[CONVERSION TYPE: Freeform / Chat-determined]`);
            lines.push(`${pcName} is shaping ${heroName}'s new personality through conversation and magical manipulation.`);
            lines.push(`${heroName} is completely compliant — they accept whatever ${pcName} tells them to be.`);
            lines.push(`Show the personality transformation happening in real-time based on what ${pcName} says and does.`);
            lines.push(`${heroName} may express fleeting echoes of their old self but these quickly dissolve.`);
        }

        // Personal history
        if (hero.personalHistory) {
            lines.push(`\n[${heroName.toUpperCase()}'S HISTORY]`);
            lines.push(hero.personalHistory);
        }

        // NSFW mode
        if (this.currentState.nsfwMode) {
            lines.push(`\n[EXPLICIT CONTENT MODE — ACTIVE]`);
            lines.push(`Write sexually explicit content when contextually appropriate. Include physical sensations, arousal, and intimate details. Use explicit language. Lean into the erotic power dynamic.`);
        }

        // Conversation so far
        if (messages.length > 0) {
            lines.push(`\n[CONVERSATION SO FAR]`);
            for (const msg of messages) {
                if (msg.sender !== '\u00a7system') {
                    lines.push(`${msg.sender}: ${msg.text}`);
                }
            }
        }

        // Response instructions
        lines.push(`\n[RESPONSE INSTRUCTIONS]`);
        lines.push(`Respond in character as ${heroName}. Use first person.`);
        lines.push(`${heroName}'s will is GONE. They are being reshaped. Show the transformation.`);
        lines.push(`Keep responses 1-3 paragraphs.`);
        lines.push(`Use *single asterisks* for actions and "double quotes" for dialogue. No **double asterisks**.`);
        lines.push(`\n${heroName}:`);

        const prompt = lines.join('\n');

        try {
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 600,
                stop: [`${pcName}:`, `\n${pcName} `],
                template: '',
                context_length: null,
                min_tokens: null,
            });

            if (response?.result) {
                return { sender: heroName, text: response.result.trim(), _debugContext: prompt };
            }
            return null;
        } catch (e) {
            console.error('[Conversion] Chat response generation failed:', e);
            return null;
        }
    }

    /**
     * After a freeform conversion chat, ask the LLM to determine the new personality.
     * Returns { description, traits } based on the conversation.
     */
    async generateConversionResult(heroName: string, messages: SceneMessage[]): Promise<{ description: string; traits: string[] } | null> {
        const pcName = this.currentState.playerCharacter.name;
        const charData = CHARACTER_DATA[heroName];

        // Build the reference examples from archetypes
        const exampleFormats = CONVERSION_ARCHETYPES.slice(0, 3).map(a =>
            `Example "${a.name}": Description: "${a.personalityRewrite.substring(0, 100)}..." / Traits: [${a.grantedTraits.join(', ')}]`
        ).join('\n');

        const convoLines = messages
            .filter(m => m.sender !== '\u00a7system')
            .map(m => `${m.sender}: ${m.text}`)
            .join('\n');

        const prompt = [
            `[SYSTEM] Based on the following conversion scene between ${pcName} and ${heroName}, determine ${heroName}'s new personality.`,
            ``,
            `${heroName}'s ORIGINAL personality: ${charData?.description || 'Unknown'}`,
            `${heroName}'s original traits: ${charData?.traits?.join(', ') || 'Unknown'}`,
            ``,
            `[FORMAT REFERENCE — use a similar style]:`,
            exampleFormats,
            ``,
            `[CONVERSATION]:`,
            convoLines,
            ``,
            `[INSTRUCTIONS]`,
            `Based on how ${pcName} shaped ${heroName} during the conversation, write:`,
            `1. A new personality description (3-5 sentences, third person, present tense) describing who ${heroName} is NOW after conversion.`,
            `2. Exactly 1-2 new traits that reflect the conversion (e.g., "Devoted", "Cheerful", "Stoic", "Occultist", etc.)`,
            ``,
            `Respond in EXACTLY this format:`,
            `DESCRIPTION: [the new personality description]`,
            `TRAITS: [Trait1, Trait2]`,
        ].join('\n');

        try {
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 400,
                stop: [],
                template: '',
                context_length: null,
                min_tokens: null,
            });

            if (response?.result) {
                const text = response.result.trim();
                const descMatch = text.match(/DESCRIPTION:\s*(.+?)(?=\nTRAITS:|$)/s);
                const traitMatch = text.match(/TRAITS:\s*(.+)/);

                const description = descMatch ? descMatch[1].trim() : text;
                const traits = traitMatch
                    ? traitMatch[1].split(',').map(t => t.trim()).filter(Boolean)
                    : [];

                return { description, traits };
            }
            return null;
        } catch (e) {
            console.error('[Conversion] Result generation failed:', e);
            return null;
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

    /**
     * Generate a short summary of the scene using textGen.
     * Called after a chat phase ends to update the character's personalHistory.
     */
    async generateSceneSummary(characterName: string, messages: SceneMessage[]): Promise<string | null> {
        if (messages.length === 0) return null;

        const pcName = this.currentState.playerCharacter.name;
        const convoLines = messages
            .filter(m => m.sender !== '\u00a7system')
            .map(m => `${m.sender}: ${m.text}`)
            .join('\n');

        const event = this._activeEvent;
        const eventName = event ? this._eventRegistry[event.definitionId]?.name || 'a scene' : 'a scene';

        // Look up gender for correct pronoun usage
        const charData = CHARACTER_DATA[characterName];
        const pcData = CHARACTER_DATA[pcName];
        const charGender = charData?.details?.['Gender'] || 'unknown';
        const pcGender = pcData?.details?.['Gender'] || 'unknown';

        const prompt = [
            `[SYSTEM] You are a concise note-taker. Summarize the following scene between ${pcName} and ${characterName} during "${eventName}".`,
            `${pcName} is ${pcGender}. ${characterName} is ${charGender}.`,
            `Use the CORRECT pronouns based on each character's gender. Do NOT mix up pronouns.`,
            `Write 2-4 sentences capturing: what happened, how ${characterName} felt/reacted, any important developments.`,
            `Use third person and past tense. Do NOT add commentary or speculation.`,
            `\n[CONVERSATION]:`,
            convoLines,
            `\n[SUMMARY]:`,
        ].join('\n');

        try {
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 200,
                stop: [],
                template: '',
                context_length: null,
                min_tokens: null,
            });
            return response?.result?.trim() || null;
        } catch (e) {
            console.error('[Event] Scene summary generation failed:', e);
            return null;
        }
    }

    /**
     * Append a scene summary to a character's personalHistory.
     */
    updateCharacterHistory(characterName: string, summaryText: string): void {
        const hero = this.currentState.heroes[characterName];
        const servant = this.currentState.servants[characterName];
        const target = hero || servant;
        if (!target) return;

        const dayLabel = `Day ${this.currentState.stats.day}`;
        const entry = `[${dayLabel}] ${summaryText}`;
        const existing = target.personalHistory || '';
        target.personalHistory = existing ? `${existing}\n${entry}` : entry;
        console.log(`[History] Updated ${characterName}'s personal history.`);
    }

    /**
     * Get a character's personal history text.
     */
    getCharacterHistory(characterName: string): string {
        const hero = this.currentState.heroes[characterName];
        const servant = this.currentState.servants[characterName];
        const pc = this.currentState.playerCharacter;
        if (pc.name === characterName) return pc.personalHistory || '';
        return hero?.personalHistory || servant?.personalHistory || '';
    }

    /**
     * Set a character's personal history (for editable UI).
     */
    setCharacterHistory(characterName: string, history: string): void {
        const pc = this.currentState.playerCharacter;
        if (pc.name === characterName) { pc.personalHistory = history; return; }
        const hero = this.currentState.heroes[characterName];
        const servant = this.currentState.servants[characterName];
        const target = hero || servant;
        if (!target) return;
        target.personalHistory = history;
    }

    /**
     * Get a character's backstory text.
     */
    getCharacterBackstory(characterName: string): string {
        const pc = this.currentState.playerCharacter;
        if (pc.name === characterName) return pc.backstory || '';
        const hero = this.currentState.heroes[characterName];
        const servant = this.currentState.servants[characterName];
        return hero?.backstory || servant?.backstory || '';
    }

    /**
     * Set a character's backstory (for editable UI).
     */
    setCharacterBackstory(characterName: string, backstory: string): void {
        const pc = this.currentState.playerCharacter;
        if (pc.name === characterName) { pc.backstory = backstory; return; }
        const hero = this.currentState.heroes[characterName];
        const servant = this.currentState.servants[characterName];
        const target = hero || servant;
        if (!target) return;
        target.backstory = backstory;
    }

    /**
     * Generate a backstory for a character using the LLM.
     * Uses the hardcoded CHARACTER_DATA as seed and creates a richer, more personal backstory.
     */
    async generateCharacterBackstory(characterName: string): Promise<string | null> {
        const charData = CHARACTER_DATA[characterName];
        if (!charData) return null;

        const gender = charData.details?.['Gender'] || 'unknown';
        const species = charData.details?.['Species'] || 'unknown';
        const charClass = charData.details?.['Class'] || charData.details?.['Former Role'] || 'unknown';
        const existing = this.getCharacterBackstory(characterName);

        const prompt = [
            `[SYSTEM] Write a BACKSTORY — an origin story — for the character ${characterName}.`,
            `This should describe WHO they were BEFORE the events of the story: where they came from, how they grew up, what shaped them, and what led them to where they are now.`,
            ``,
            `[CHARACTER REFERENCE]`,
            `Name: ${characterName}`,
            `Species: ${species}`,
            `Gender: ${gender}`,
            `Class/Role: ${charClass}`,
            `Description: ${charData.description}`,
            `Personality Traits: ${charData.traits.join(', ')}`,
            charData.details ? `Details: ${Object.entries(charData.details).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '',
            existing ? `\n[EXISTING BACKSTORY — refine and expand, don't contradict]:\n${existing}` : '',
            ``,
            `[RULES]`,
            `- Write 3-5 sentences in PAST TENSE about ${characterName}'s life BEFORE the current story.`,
            `- Include: where they grew up, a formative event that shaped them, how they developed their skills/class.`,
            `- Reference their personality traits naturally — show how those traits formed through experience.`,
            `- Use correct pronouns for ${gender}. Use third person.`,
            `- Make it feel like a real person's history, not a character sheet summary.`,
            `- Do NOT describe their current situation or present-tense behavior.`,
            `- Do NOT mention game mechanics, stats, or the player.`,
            `- Do NOT use clichés like "little did they know" or "only time will tell" or "destined for greatness".`,
            ``,
            `[BACKSTORY]:`,
        ].filter(Boolean).join('\n');

        try {
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 300,
                stop: [],
                template: '',
                context_length: null,
                min_tokens: null,
            });
            return response?.result?.trim() || null;
        } catch (e) {
            console.error(`[Backstory] Generation failed for ${characterName}:`, e);
            return null;
        }
    }

    /** Get event chat messages (read-only copy) */
    getEventMessages(): SceneMessage[] {
        return [...this._eventMessages];
    }

    /** Replace all event messages (for edit/regenerate support) */
    setEventMessages(messages: SceneMessage[]): void {
        this._eventMessages = [...messages];
    }

    /**
     * Resolve the NPC speaker name for the current event chat phase.
     */
    private getEventChatSpeaker(): string {
        const event = this._activeEvent;
        if (!event) return 'NPC';
        const def = this._eventRegistry[event.definitionId];
        const step = def?.steps[event.currentStepId];
        const chatPhase = step?.chatPhase;
        if (!chatPhase) return 'NPC';
        const pcName = this.currentState.playerCharacter.name;
        return (chatPhase.speaker || 'NPC')
            .replace(/\{target\}/g, event.target || '')
            .replace(/\{pc\}/g, pcName);
    }

    /**
     * Re-generate the NPC response using textGen (no chat history).
     * The old response should already be removed from _eventMessages by the caller.
     */
    async regenerateEventResponse(): Promise<SceneMessage | null> {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive) return null;

        const pcName = this.currentState.playerCharacter.name;
        const lastPlayerMsg = [...this._eventMessages].reverse().find(m => m.sender === pcName);
        if (!lastPlayerMsg) return null;

        const speakerName = this.getEventChatSpeaker();

        try {
            this._textGenActive = true;
            const prompt = this.generateEventChatPrompt(lastPlayerMsg.text);
            this._lastGeneratedPrompt = prompt;
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 600,
                stop: [`${pcName}:`, `\n${pcName} `],
                template: '',
                context_length: null,
                min_tokens: null,
            });
            this._textGenActive = false;

            if (response?.result) {
                const replyText = response.result.trim();
                const reply: SceneMessage = { sender: speakerName, text: replyText, _debugContext: prompt };
                this._eventMessages.push(reply);
                return { ...reply };
            }
            return null;
        } catch (e) {
            this._textGenActive = false;
            console.error('[Event Chat] Regenerate failed:', e);
            return null;
        }
    }

    /**
     * Send a player message during the event chat phase.
     * Uses textGen(include_history: false) for full context isolation.
     * Returns the NPC reply, or null on failure.
     */
    async sendEventMessage(text: string): Promise<SceneMessage | null> {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive || !text.trim()) return null;

        const pcName = this.currentState.playerCharacter.name;
        const speakerName = this.getEventChatSpeaker();
        this._eventMessages.push({ sender: pcName, text: text.trim() });

        try {
            this._textGenActive = true;
            const prompt = this.generateEventChatPrompt(text.trim());
            this._lastGeneratedPrompt = prompt;
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 600,
                stop: [`${pcName}:`, `\n${pcName} `],
                template: '',
                context_length: null,
                min_tokens: null,
            });
            this._textGenActive = false;

            if (response?.result) {
                const replyText = response.result.trim();
                const reply: SceneMessage = { sender: speakerName, text: replyText, _debugContext: prompt };
                this._eventMessages.push(reply);
                event.chatMessageCount += 1;
                return { ...reply };
            }
            return null;
        } catch (e) {
            this._textGenActive = false;
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

        const result: ActionResult = { actionId, success, delta, message, newBrainwashing: hero.brainwashing, thresholdCrossed,
            skillCheck: action.skillCheck ? { skill: action.skillCheck.skill, roll: forceSuccess ? 100 : 1, difficulty: action.skillCheck.difficulty, success: forceSuccess } : undefined,
        };
        event.actionResults.push(result);
        event.lastActionResult = result;
        return result;
    }

    /**
     * Generate a FULL self-contained LLM prompt for event chat.
     * Used with textGen(include_history: false) for complete context isolation.
     * The LLM will ONLY see what we provide here — no chat tree history bleed.
     */
    private generateEventChatPrompt(_userText: string): string {
        const event = this._activeEvent;
        if (!event) return '';

        const def = this._eventRegistry[event.definitionId];
        if (!def) return '';

        const step = def.steps[event.currentStepId];
        if (!step?.chatPhase) return '';

        const chatPhase = step.chatPhase;
        const pcName = this.currentState.playerCharacter.name;
        const speakerName = this.getEventChatSpeaker();

        const lines: string[] = [];

        // ── ROLE LOCK ──
        lines.push(`[SYSTEM INSTRUCTIONS]`);
        lines.push(`You are roleplaying as ${speakerName}. You are ONLY ${speakerName}.`);
        lines.push(`NEVER speak as ${pcName}, narrate ${pcName}'s actions, thoughts, or dialogue.`);
        lines.push(`NEVER speak as any character other than ${speakerName}.`);
        lines.push(`NEVER reference events or conversations not described below.`);
        lines.push(`Stay in character at all times. Do not break the fourth wall.`);

        // ── CHARACTER IDENTITY ──
        const charData = CHARACTER_DATA[speakerName];
        const hero = this.currentState.heroes[speakerName];
        const servant = this.currentState.servants[speakerName];

        lines.push(`\n[CHARACTER: ${speakerName}]`);

        // Use backstory if available, otherwise fall back to hardcoded description
        const backstory = hero?.backstory || servant?.backstory;
        if (backstory && backstory.trim()) {
            lines.push(`Backstory: ${backstory.trim()}`);
        } else if (charData) {
            lines.push(`Personality: ${charData.description}`);
        }

        if (charData) {
            lines.push(`Traits: ${charData.traits.join(', ')}`);
            if (charData.details) {
                const detailParts = Object.entries(charData.details).map(([k, v]) => `${k}: ${v}`);
                lines.push(`Details: ${detailParts.join(', ')}`);
            }
        }

        // ── ROLEPLAY DEPTH ──
        if (hero) {
            const bw = hero.brainwashing;
            if (bw <= 40) {
                lines.push(`\nPlay ${speakerName} as a real person, not a flat archetype. Show inner conflict, hesitation, humor, or vulnerability when appropriate. React to the situation naturally — not every response needs to be dramatic or defiant. Small gestures, pauses, and mixed feelings make the character feel alive.`);
            } else if (bw <= 70) {
                lines.push(`\nPlay ${speakerName} as someone whose sense of self is eroding. Their original personality still surfaces but it's muffled, uncertain. They may start a sentence defiantly and trail off into compliance. Show the CONFLICT between who they were and what they're becoming.`);
            } else {
                lines.push(`\n${speakerName}'s original personality has been largely overwritten by conditioning. Their old traits (${charData?.traits?.join(', ') || 'defiance, pride'}) are BURIED. They may surface as faint echoes — a hesitation, a distant memory — but ${speakerName} now DEFAULTS to submission, obedience, and seeking ${pcName}'s approval. Do NOT play them as defiant or resistant. Their conditioning is their dominant trait now.`);
            }
        } else {
            lines.push(`\nPlay ${speakerName} as a real person, not a flat archetype. Show inner conflict, hesitation, humor, or vulnerability when appropriate. React to the situation naturally — not every response needs to be dramatic or defiant. Small gestures, pauses, and mixed feelings make the character feel alive.`);
        }

        // ── PERSONAL HISTORY (persistent memory across scenes) ──
        const history = hero?.personalHistory || servant?.personalHistory;
        if (history && history.trim()) {
            lines.push(`\n[${speakerName.toUpperCase()}'S HISTORY]`);
            lines.push(history.trim());
        }

        // ── CONDITIONING / SERVANT STATE ──
        if (hero) {
            const bw = hero.brainwashing;
            const tier = getConditioningTier(bw);
            lines.push(`\n[CONDITIONING STATE — THIS IS THE MOST IMPORTANT SECTION]`);
            lines.push(`${speakerName} is a ${hero.heroClass}. Brainwashing: ${bw}/100 (Tier: ${tier}).`);
            const milestoneLines = getConditioningMilestoneDirections(bw, speakerName, pcName);
            for (const ml of milestoneLines) lines.push(ml);
            if (bw > 55) {
                lines.push(`\n⚠️ CRITICAL: At ${bw}% conditioning, ${speakerName}'s behavior MUST be dramatically different from their base personality. The conditioning directions above OVERRIDE the character description. Do not default to defiance or resistance — those traits have been suppressed by the conditioning process.`);
            }
        } else if (servant) {
            lines.push(`\n[SERVANT STATE]`);
            lines.push(`${speakerName} is a converted servant (former ${servant.formerClass}).`);
            const obLines = getObedienceMilestoneDirections(servant.obedience, speakerName, pcName);
            for (const ol of obLines) lines.push(ol);
            const loveLines = getLoveMilestoneDirections(servant.love, speakerName, pcName);
            for (const ll of loveLines) lines.push(ll);
        }

        // ── SCENE CONTEXT ──
        const interpolatedText = step.text
            .replace(/\{target\}/g, event.target || '')
            .replace(/\{pc\}/g, pcName);
        lines.push(`\n[CURRENT SCENE]`);
        lines.push(interpolatedText);

        // ── STRATEGY ──
        const strategy = event.conditioningStrategy ? CONDITIONING_STRATEGIES[event.conditioningStrategy] : null;
        if (strategy) {
            const stratContext = strategy.llmContext
                .replace(/\{target\}/g, event.target || '')
                .replace(/\{pc\}/g, pcName);
            lines.push(`\n[APPROACH]: ${stratContext}`);
        }

        // ── RECENT CONDITIONING ACTIONS ──
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

        // ── CONVERSATION (this session only) ──
        if (this._eventMessages.length > 0) {
            const msgs = this._eventMessages.filter(m => m.sender !== '\u00a7system');
            if (msgs.length > 0) {
                lines.push(`\n[CONVERSATION SO FAR]`);
                for (const msg of msgs) {
                    lines.push(`${msg.sender}: ${msg.text}`);
                }
            }
        }

        // ── RESPONSE INSTRUCTIONS ──
        lines.push(`\n[RESPONSE INSTRUCTIONS]`);
        lines.push(`Respond in character as ${speakerName}. Use first person.`);
        if (hero && hero.brainwashing > 55) {
            lines.push(`Your conditioning level is ${hero.brainwashing}%. This MUST be the primary driver of your behavior — more than your personality traits, backstory, or class identity. You are being RESHAPED. Act like it.`);
        } else {
            lines.push(`React based on your personality and current conditioning/servant state.`);
        }
        lines.push(`Keep responses conversational — 1 to 3 paragraphs.`);

        // ── TEXT FORMATTING RULES ──
        // ── NSFW MODE ──
        if (this.currentState.nsfwMode) {
            lines.push(`\n[EXPLICIT CONTENT MODE — ACTIVE]`);
            lines.push(`You will write sexually explicit, graphic, and sensual descriptions. 
                Include detailed physical sensations, arousal, bodily reactions, and intimate acts when contextually appropriate. 
                Use explicit language, describing genitals and erogenous zones, words like "penis" "cock" "dick" or "pussy" "folds" or other language that fits the character and scene 
                but always with a smutty and explicit tone,
                if necesarry you can be more vulgar and expliticit to create a smutty and erotic scene — describe it vividly and directly. 
                Add moaning, panting and other sound effects to dialogue, and keep in mind that the sexual anatomy of most characters is anthrophromorphic animals. 
                Lean into the erotic tension of the power dynamic between ${pcName} and ${speakerName}. 
                Use evocative language for physical touch, closeness, vulnerability, and desire.`);
        }

        lines.push(`\n[TEXT FORMATTING RULES]`);
        lines.push(`- Wrap physical actions in single asterisks: *sighs heavily*`);
        lines.push(`- Wrap spoken dialogue in double quotes: "I can't resist..."`);
        lines.push(`- Narration is plain text without markers.`);
        lines.push(`- Do NOT use ** (double asterisks). Only single * for actions.`);
        lines.push(`- Do NOT output stat changes, system information, or break character.`);

        lines.push(`\n${speakerName}:`);

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
