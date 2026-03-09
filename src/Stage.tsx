import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message, AspectRatio} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";
import { BaseScreen } from "./screens/BaseScreen";

// ── Data & Type imports (split from Stage.tsx) ──
import {
    // Types
    HeroStatus, Location, Hero, Servant, PlayerCharacter,
    ManorUpgrade, DungeonProgress, SceneMessage, SceneData,
    SkillStats, HouseholdStats, WitchStats,
    MessageStateType, ConfigType, InitStateType, ChatStateType,
    SavedSlotData, SaveFileSlot, MAX_SAVE_SLOTS, SAVE_VERSION,
    EventEffect, EventSkillCheck, EventChatPhase, ShopItem, EventShopPhase,
    EventChoice, EventStep, EventDefinition, EventContext, ActiveEvent,
    EventPrerequisite, QuestDefinition, QuestStepDefinition, ActiveQuest,
    ConditioningCategory, ConditioningAction, ActionResult,
    // Turn system
    TurnSummary, TurnChange, TurnTaskResult,
    // Tasks
    TaskCategory, TaskOutcomeQuality, TaskTraitModifier, TaskRequirement,
    TaskReward, TaskDefinition, ActiveTask, TaskOutcome,
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
    // Exploration
    EXPLORE_EVENTS, EXPLORE_DATA, LocationActivity, LocationExploreData,
    // Tasks
    TASK_REGISTRY, getTaskById, getTaskCategoryLabel, getTaskCategoryIcon,
    getRoomTypeLabel, getAvailableTasksForServant, checkTaskRequirements,
    getApplicableTraitModifiers,
    // AI Chat Changes
    ChatChangeCategory, ChatChangeScope, ChatChangeScopeEntry, AIChatChange, AIChatJudgment,
    SERVANT_CHAT_SCOPE, MULTI_CHAT_SCOPE, EVENT_CHAT_FULL_SCOPE,
    getScopeEntry, clampToScope, describeScopeForPrompt,
    // NPC Generation
    GeneratedNPC, EXPLORE_WOODS_CAPTURE,
    // Quests
    ALL_HERO_QUESTS, buildQuestEvents,
} from './data';



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

    // Pending NPC async generation results
    private _pendingNPCPortraits: Record<string, string> = {};
    private _pendingNPCBackstories: Record<string, string> = {};

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

        // Register explore events
        for (const evt of EXPLORE_EVENTS) {
            this._eventRegistry[evt.id] = evt;
        }

        // Register quest events
        for (const evt of buildQuestEvents()) {
            this._eventRegistry[evt.id] = evt;
        }

        // Register quests
        for (const quest of ALL_HERO_QUESTS) {
            this._questRegistry[quest.id] = quest;
        }
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
                mana: 100,
                maxMana: 100,
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
                    stamina: 100,
                    maxStamina: 100,
                    servantTitle: 'Handmaiden',
                    servantTitleColor: '#e85d9a',
                    activeTask: undefined,
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
                    stamina: 100,
                    maxStamina: 100,
                    servantTitle: 'Butler',
                    servantTitleColor: '#6a8caf',
                    activeTask: undefined,
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
            completedEvents: [],
            activeQuests: [],
            completedQuests: [],
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
            // Backward compat: ensure mana stats exist
            if (this.currentState.stats.mana === undefined) {
                this.currentState.stats.mana = 100;
                this.currentState.stats.maxMana = 100;
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
                // Backward compat: migrate old assignedTask string → activeTask
                if ('assignedTask' in servant && typeof (servant as any).assignedTask === 'string') {
                    delete (servant as any).assignedTask;
                    if (!servant.activeTask) {
                        servant.activeTask = undefined;
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
        const manaMatch = text.match(/mana[:\s]+(\d+)/i);
        const powerMatch = text.match(/power[:\s]+(\d+)/i);
        const wisdomMatch = text.match(/wisdom[:\s]+(\d+)/i);
        const charmMatch = text.match(/charm[:\s]+(\d+)/i);
        const speedMatch = text.match(/speed[:\s]+(\d+)/i);
        const comfortMatch = text.match(/comfort[:\s]+(\d+)/i);
        const obedienceMatch = text.match(/obedience[:\s]+(\d+)/i);
        const dayMatch = text.match(/day[:\s]+(\d+)/i);

        if (goldMatch) this.currentState.stats.gold = parseInt(goldMatch[1]);
        if (manaMatch) this.currentState.stats.mana = Math.min(parseInt(manaMatch[1]), this.currentState.stats.maxMana);
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
                        stamina: 100,
                        maxStamina: 100,
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
    // Task Methods
    // ============================

    /** Get all tasks available for a servant, filtered by built rooms and discovered locations */
    getAvailableTasksForServantByName(servantName: string): TaskDefinition[] {
        const servant = this.currentState.servants[servantName];
        if (!servant) return [];
        return getAvailableTasksForServant(
            servant,
            this.getBuiltRoomTypes(),
            this.chatState.discoveredLocations || [],
        );
    }

    /** Assign a task to a servant. Returns true on success. */
    assignTask(servantName: string, taskId: string): { success: boolean; error?: string } {
        const servant = this.currentState.servants[servantName];
        if (!servant) return { success: false, error: 'Servant not found' };

        const task = getTaskById(taskId);
        if (!task) return { success: false, error: 'Task not found' };

        // Check if servant already has an active task
        if (servant.activeTask) {
            return { success: false, error: 'Servant already has an active task' };
        }

        // Check stat requirements
        const reqCheck = checkTaskRequirements(servant, task);
        if (!reqCheck.met) {
            const failNames = reqCheck.failing.map(f => `${f.stat} (${f.current}/${f.required})`).join(', ');
            return { success: false, error: `Requirements not met: ${failNames}` };
        }

        // Check room availability for room tasks
        if (task.roomType && !this.getBuiltRoomTypes().includes(task.roomType)) {
            return { success: false, error: `Requires ${getRoomTypeLabel(task.roomType)}` };
        }

        // Check location discovery for exploration tasks
        if (task.location && !(this.chatState.discoveredLocations || []).includes(task.location)) {
            return { success: false, error: `${task.location} not yet discovered` };
        }

        // Deduct mana cost if applicable
        if (task.manaCost && task.manaCost > 0) {
            if (this.currentState.stats.mana < task.manaCost) {
                return { success: false, error: `Not enough mana (${this.currentState.stats.mana}/${task.manaCost})` };
            }
            this.currentState.stats.mana -= task.manaCost;
        }

        // Deduct stamina cost if applicable
        if (task.staminaCost && task.staminaCost > 0) {
            const currentStamina = servant.stamina ?? 100;
            if (currentStamina < task.staminaCost) {
                return { success: false, error: `Not enough stamina (${currentStamina}/${task.staminaCost})` };
            }
            servant.stamina = currentStamina - task.staminaCost;
        }

        // Create active task
        servant.activeTask = {
            definitionId: taskId,
            turnsRemaining: task.duration,
            totalDuration: task.duration,
            assignedDay: this.currentState.stats.day,
        };

        return { success: true };
    }

    /** Cancel a servant's active task (no rewards) */
    cancelTask(servantName: string): boolean {
        const servant = this.currentState.servants[servantName];
        if (!servant || !servant.activeTask) return false;

        // Refund mana cost if cancelled on the same turn it was assigned
        const task = getTaskById(servant.activeTask.definitionId);
        if (task?.manaCost && servant.activeTask.turnsRemaining === task.duration) {
            this.currentState.stats.mana = Math.min(
                this.currentState.stats.maxMana,
                this.currentState.stats.mana + task.manaCost,
            );
        }

        // Refund stamina cost if cancelled on the same turn it was assigned
        if (task?.staminaCost && servant.activeTask.turnsRemaining === task.duration) {
            servant.stamina = Math.min(
                servant.maxStamina ?? 100,
                (servant.stamina ?? 0) + task.staminaCost,
            );
        }

        servant.activeTask = undefined;
        return true;
    }

    /**
     * Calculate task outcome quality based on servant stats, traits, and role bonuses.
     * Score breakdown:
     *   Base: primary stat value (0-100)
     *   + trait modifiers (positive/negative magnitude)
     *   + role bonus (+15 if servant's role matches task.roleBonus)
     *   + obedience factor (obedience/10, so 0-10 bonus)
     * Quality thresholds: 0-49 = poor, 50-74 = standard, 75+ = excellent
     */
    calculateTaskQuality(servant: Servant, task: TaskDefinition): TaskOutcomeQuality {
        let score = 0;

        // Primary stat contribution
        if (task.primaryStat) {
            score += servant.stats[task.primaryStat] ?? 0;
        } else {
            // Average all stats if no primary stat
            const statValues = Object.values(servant.stats);
            score += statValues.reduce((sum, v) => sum + v, 0) / statValues.length;
        }

        // Trait modifiers
        const applicable = getApplicableTraitModifiers(servant, task);
        for (const { modifier } of applicable) {
            if (modifier.effect === 'bonus') {
                score += modifier.magnitude;
            } else {
                score -= modifier.magnitude;
            }
        }

        // Role bonus
        if (task.roleBonus && servant.assignedRole === task.roleBonus) {
            score += 10;
        }

        // Obedience factor
        score += (servant.obedience || 0) / 10;

        // Clamp and determine quality
        score = Math.max(0, Math.min(120, score));
        if (score >= 75) return 'excellent';
        if (score >= 50) return 'standard';
        return 'poor';
    }

    /**
     * Complete a servant's active task — calculate outcome and apply rewards.
     * Returns the TaskOutcome or null if no active task.
     */
    completeTask(servantName: string): TaskOutcome | null {
        const servant = this.currentState.servants[servantName];
        if (!servant || !servant.activeTask) return null;

        const task = getTaskById(servant.activeTask.definitionId);
        if (!task) {
            servant.activeTask = undefined;
            return null;
        }

        const quality = this.calculateTaskQuality(servant, task);

        // Quality multipliers for rewards
        const qualityMultiplier = quality === 'excellent' ? 1.5 : quality === 'standard' ? 1.0 : 0.6;

        // Process rewards
        const earnedRewards: TaskReward[] = [];
        for (const reward of task.rewards) {
            const scaledAmount = Math.max(1, Math.round((reward.amount || 0) * qualityMultiplier));
            const earnedReward = { ...reward, amount: scaledAmount };

            switch (reward.type) {
                case 'gold':
                    this.currentState.stats.gold += scaledAmount;
                    break;
                case 'mana':
                    this.currentState.stats.mana = Math.min(
                        this.currentState.stats.maxMana,
                        this.currentState.stats.mana + scaledAmount,
                    );
                    break;
                case 'item':
                    if (reward.itemName) {
                        const inv = this.currentState.inventory;
                        if (inv[reward.itemName]) {
                            inv[reward.itemName].quantity += scaledAmount;
                        } else {
                            const def = getItemDefinition(reward.itemName);
                            inv[reward.itemName] = {
                                name: reward.itemName,
                                quantity: scaledAmount,
                                type: def.type,
                            };
                        }
                    }
                    break;
                case 'stat':
                    if (reward.stat) {
                        // Handle special "love" and "obedience" servant stats
                        if (reward.stat === 'love') {
                            servant.love = Math.min(100, servant.love + scaledAmount);
                        } else if (reward.stat === 'obedience') {
                            servant.obedience = Math.min(100, servant.obedience + scaledAmount);
                        } else {
                            // Character stat (prowess, expertise, etc.)
                            const statKey = reward.stat as StatName;
                            if (servant.stats[statKey] !== undefined) {
                                servant.stats[statKey] = Math.min(100, servant.stats[statKey] + scaledAmount);
                            }
                        }
                    }
                    break;
                case 'household':
                    if (reward.stat === 'comfort') {
                        this.currentState.stats.household.comfort += scaledAmount;
                    } else if (reward.stat === 'obedience') {
                        this.currentState.stats.household.obedience += scaledAmount;
                    }
                    break;
            }

            earnedRewards.push(earnedReward);
        }

        // Build the outcome
        const outcome: TaskOutcome = {
            success: quality !== 'poor',
            quality,
            rewards: earnedRewards,
        };

        // Store outcome on the task before clearing
        servant.activeTask.outcome = outcome;
        const result = outcome;

        // Clear active task
        servant.activeTask = undefined;

        return result;
    }

    /** Debug: immediately complete a task regardless of turns remaining */
    debugCompleteTask(servantName: string): TaskOutcome | null {
        const servant = this.currentState.servants[servantName];
        if (!servant || !servant.activeTask) return null;
        servant.activeTask.turnsRemaining = 0;
        return this.completeTask(servantName);
    }

    /**
     * Tick all active tasks — decrement turnsRemaining for every servant with an active task.
     * Auto-completes tasks that reach 0. Returns outcomes for completed tasks.
     * Called by the turn system's end-of-day handler.
     */
    tickTasks(): { servantName: string; taskDefinitionId: string; outcome: TaskOutcome }[] {
        const completed: { servantName: string; taskDefinitionId: string; outcome: TaskOutcome }[] = [];
        for (const [name, servant] of Object.entries(this.currentState.servants)) {
            if (servant.activeTask && servant.activeTask.turnsRemaining > 0) {
                const defId = servant.activeTask.definitionId;
                servant.activeTask.turnsRemaining--;
                if (servant.activeTask.turnsRemaining <= 0) {
                    const outcome = this.completeTask(name);
                    if (outcome) {
                        completed.push({ servantName: name, taskDefinitionId: defId, outcome });
                    }
                }
            }
        }
        return completed;
    }

    // ============================
    // Turn System — End of Day
    // ============================

    /** Base stamina recovery per turn (can be enhanced by manor upgrades later) */
    private getStaminaRecovery(): number {
        return 25;
    }

    /**
     * End the current day. Produces a TurnSummary capturing everything that changed:
     * - Tasks tick (progress & completion)
     * - Servant stamina recovery
     * - Gold/mana/household stat deltas
     * - Day counter advances
     */
    endDay(): TurnSummary {
        const st = this.currentState.stats;
        const dayEnded = st.day;
        const changes: TurnChange[] = [];

        // ── Snapshot "before" values ──
        const goldBefore = st.gold;
        const manaBefore = st.mana;
        const comfortBefore = st.household.comfort;
        const obedienceBefore = st.household.obedience;

        // Snapshot servant stamina before recovery
        const staminaSnapshots: Record<string, number> = {};
        for (const [name, servant] of Object.entries(this.currentState.servants)) {
            staminaSnapshots[name] = servant.stamina;
        }

        // ── 1. Tick tasks (progress & auto-complete) ──
        // First, capture active tasks that will just progress (not complete yet)
        const taskProgressions: TurnSummary['taskProgressions'] = [];
        const aboutToComplete: Set<string> = new Set();

        for (const [name, servant] of Object.entries(this.currentState.servants)) {
            if (servant.activeTask && servant.activeTask.turnsRemaining > 0) {
                if (servant.activeTask.turnsRemaining === 1) {
                    aboutToComplete.add(name);
                }
            }
        }

        const completed = this.tickTasks();

        // Build completed task summaries
        const completedTasks: TurnTaskResult[] = completed.map(c => {
            const def = getTaskById(c.taskDefinitionId);
            return {
                servantName: c.servantName,
                taskName: def?.name || 'Unknown Task',
                quality: c.outcome.quality,
                rewards: c.outcome.rewards,
            };
        });

        // Log completed task rewards as changes
        for (const ct of completedTasks) {
            changes.push({
                icon: 'check-circle',
                label: `${ct.servantName}: ${ct.taskName}`,
                detail: `Completed (${ct.quality})`,
                category: 'task',
                color: ct.quality === 'excellent' ? '#7dd4a0' : ct.quality === 'standard' ? '#c8aa6e' : '#c87d6e',
            });
            for (const r of ct.rewards) {
                switch (r.type) {
                    case 'gold':
                        changes.push({ icon: 'coins', label: 'Gold', detail: r.narrative || `+${r.amount} gold`, delta: r.amount, category: 'finance', color: '#e8c84a' });
                        break;
                    case 'mana':
                        changes.push({ icon: 'sparkles', label: 'Mana', detail: r.narrative || `+${r.amount} mana`, delta: r.amount, category: 'mana', color: '#78a8d0' });
                        break;
                    case 'item':
                        changes.push({ icon: 'package', label: r.itemName || 'Item', detail: r.narrative || `+${r.amount}`, delta: r.amount, category: 'item', color: '#a888c8' });
                        break;
                    case 'household':
                        changes.push({ icon: r.stat === 'comfort' ? 'sofa' : 'shield', label: r.stat === 'comfort' ? 'Comfort' : 'Obedience', detail: r.narrative || `+${r.amount}`, delta: r.amount, category: 'household', color: '#7ab87a' });
                        break;
                    case 'stat':
                        changes.push({ icon: 'trending-up', label: r.stat || 'Stat', detail: r.narrative || `+${r.amount}`, delta: r.amount, category: 'stat', color: '#c8aa6e' });
                        break;
                }
            }
        }

        // Track tasks still in progress (after ticking)
        for (const [name, servant] of Object.entries(this.currentState.servants)) {
            if (servant.activeTask && servant.activeTask.turnsRemaining > 0) {
                const def = getTaskById(servant.activeTask.definitionId);
                taskProgressions.push({
                    servantName: name,
                    taskName: def?.name || 'Unknown',
                    turnsRemaining: servant.activeTask.turnsRemaining,
                    totalDuration: servant.activeTask.totalDuration,
                });
                changes.push({
                    icon: 'clock',
                    label: `${name}: ${def?.name || 'Task'}`,
                    detail: `${servant.activeTask.turnsRemaining} turn${servant.activeTask.turnsRemaining !== 1 ? 's' : ''} remaining`,
                    category: 'task',
                    color: '#c8aa6e',
                });
            }
        }

        // ── 2. Servant stamina recovery ──
        const staminaRecovery = this.getStaminaRecovery();
        const servantStaminaChanges: TurnSummary['servantStaminaChanges'] = [];
        for (const [name, servant] of Object.entries(this.currentState.servants)) {
            const before = staminaSnapshots[name] ?? servant.stamina;
            if (servant.stamina < servant.maxStamina && !servant.activeTask) {
                // Only recover stamina if not currently working on a task
                servant.stamina = Math.min(servant.maxStamina, servant.stamina + staminaRecovery);
            }
            const after = servant.stamina;
            servantStaminaChanges.push({ name, before, after });
            if (after !== before) {
                const delta = after - before;
                changes.push({
                    icon: 'heart-pulse',
                    label: `${name} Stamina`,
                    detail: `${before} → ${after}`,
                    delta,
                    category: 'stamina',
                    color: delta > 0 ? '#7dd4a0' : '#c87d6e',
                });
            }
        }

        // ── 3. Advance the day ──
        st.day += 1;

        // ── 4. Calculate net changes for finance header ──
        const goldAfter = st.gold;
        const manaAfter = st.mana;
        const comfortAfter = st.household.comfort;
        const obedienceAfter = st.household.obedience;

        // Add finance summary at the top if there was gold movement
        if (goldAfter !== goldBefore) {
            const gd = goldAfter - goldBefore;
            changes.unshift({
                icon: 'coins',
                label: 'Net Gold',
                detail: `${goldBefore} → ${goldAfter} (${gd >= 0 ? '+' : ''}${gd})`,
                delta: gd,
                category: 'finance',
                color: gd >= 0 ? '#e8c84a' : '#c87d6e',
            });
        }

        return {
            dayEnded,
            dayStarting: st.day,
            goldBefore,
            goldAfter,
            manaBefore,
            manaAfter,
            comfortBefore,
            comfortAfter,
            obedienceBefore,
            obedienceAfter,
            completedTasks,
            changes,
            servantStaminaChanges,
            taskProgressions,
        };
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

    private _questRegistry: Record<string, QuestDefinition> = {};

    /** Register a new event definition at runtime */
    registerEvent(def: EventDefinition): void {
        this._eventRegistry[def.id] = def;
    }

    /** Get an event definition by ID */
    getEventDefinition(id: string): EventDefinition | null {
        return this._eventRegistry[id] || null;
    }

    // ============================
    // Event Prerequisite Engine
    // ============================

    /** Check if a single prerequisite is satisfied */
    checkPrerequisite(prereq: EventPrerequisite): boolean {
        const st = this.currentState;
        switch (prereq.type) {
            case 'event_completed':
                return prereq.eventId ? st.completedEvents.includes(prereq.eventId) : false;
            case 'hero_captured':
                return prereq.heroName
                    ? (st.heroes[prereq.heroName]?.status === 'captured'
                        || st.heroes[prereq.heroName]?.status === 'converting'
                        || st.heroes[prereq.heroName]?.status === 'servant'
                        || !!st.servants[prereq.heroName])
                    : false;
            case 'hero_status':
                return prereq.heroName && prereq.heroStatus
                    ? st.heroes[prereq.heroName]?.status === prereq.heroStatus
                    : false;
            case 'item':
                return prereq.itemName
                    ? (st.inventory[prereq.itemName]?.quantity ?? 0) > 0
                    : false;
            case 'stat':
                return prereq.stat && prereq.minValue !== undefined
                    ? (st.stats.skills[prereq.stat] ?? 0) >= prereq.minValue
                    : false;
            case 'gold':
                return prereq.minValue !== undefined
                    ? st.stats.gold >= prereq.minValue
                    : false;
            case 'quest_complete':
                return prereq.eventId
                    ? st.completedQuests.includes(prereq.eventId)
                    : false;
            case 'custom':
                return prereq.check ? prereq.check(this) : false;
            default:
                return false;
        }
    }

    /** Check if all prerequisites for an event are satisfied */
    checkEventPrerequisites(eventId: string): boolean {
        const def = this._eventRegistry[eventId];
        if (!def?.prerequisites || def.prerequisites.length === 0) return true;
        return def.prerequisites.every(p => this.checkPrerequisite(p));
    }

    /** Mark an event as completed */
    markEventCompleted(eventId: string): void {
        if (!this.currentState.completedEvents.includes(eventId)) {
            this.currentState.completedEvents.push(eventId);
            console.log(`[Event] Marked "${eventId}" as completed`);
            // Check if this advances any active quests
            this._checkQuestAdvancement(eventId);
        }
    }

    /** Get events whose prerequisites are met for a given location */
    getAvailableEventsForLocation(location: Location): EventDefinition[] {
        return Object.values(this._eventRegistry).filter(def =>
            def.location === location
            && def.prerequisites && def.prerequisites.length > 0
            && !this.currentState.completedEvents.includes(def.id)
            && this.checkEventPrerequisites(def.id)
        );
    }

    // ============================
    // Quest Tracking Engine
    // ============================

    /** Register a quest definition */
    registerQuest(def: QuestDefinition): void {
        this._questRegistry[def.id] = def;
        // Also register all quest step events
        for (const step of def.steps) {
            const eventDef = this._eventRegistry[step.eventId];
            if (eventDef) {
                eventDef.location = eventDef.location || step.location;
            }
        }
    }

    /** Get a quest definition by ID */
    getQuestDefinition(id: string): QuestDefinition | null {
        return this._questRegistry[id] || null;
    }

    /** Get all registered quest definitions */
    getAllQuests(): QuestDefinition[] {
        return Object.values(this._questRegistry);
    }

    /** Get quests that are available to start (prerequisites met, not started/complete) */
    getAvailableQuests(): QuestDefinition[] {
        const st = this.currentState;
        return Object.values(this._questRegistry).filter(def => {
            // Already active or complete
            if (st.activeQuests.some(aq => aq.questId === def.id)) return false;
            if (st.completedQuests.includes(def.id)) return false;
            // Check prerequisites
            if (def.prerequisites && def.prerequisites.length > 0) {
                return def.prerequisites.every(p => this.checkPrerequisite(p));
            }
            return true;
        });
    }

    /** Get all currently active quests */
    getActiveQuests(): ActiveQuest[] {
        return this.currentState.activeQuests.filter(aq => !aq.completed);
    }

    /** Start a quest */
    startQuest(questId: string): ActiveQuest | null {
        const def = this._questRegistry[questId];
        if (!def) {
            console.error(`[Quest] Unknown quest: ${questId}`);
            return null;
        }
        const st = this.currentState;
        if (st.activeQuests.some(aq => aq.questId === questId)) {
            console.warn(`[Quest] Quest "${questId}" already active`);
            return st.activeQuests.find(aq => aq.questId === questId) || null;
        }
        if (st.completedQuests.includes(questId)) {
            console.warn(`[Quest] Quest "${questId}" already completed`);
            return null;
        }

        const quest: ActiveQuest = {
            questId,
            currentStep: 0,
            startedDay: st.stats.day,
            completedSteps: [],
            data: {},
            completed: false,
        };
        st.activeQuests.push(quest);
        console.log(`[Quest] Started quest "${def.name}"`);
        return quest;
    }

    /** Get the current step definition for an active quest */
    getQuestCurrentStep(questId: string): QuestStepDefinition | null {
        const def = this._questRegistry[questId];
        const active = this.currentState.activeQuests.find(aq => aq.questId === questId);
        if (!def || !active || active.completed) return null;
        return def.steps[active.currentStep] || null;
    }

    /** Internal: check if a completed event advances any active quest */
    private _checkQuestAdvancement(completedEventId: string): void {
        const st = this.currentState;
        for (const active of st.activeQuests) {
            if (active.completed) continue;
            const def = this._questRegistry[active.questId];
            if (!def) continue;

            const currentStep = def.steps[active.currentStep];
            if (currentStep && currentStep.eventId === completedEventId) {
                active.completedSteps.push(active.currentStep);
                active.currentStep++;
                console.log(`[Quest] Advanced "${def.name}" to step ${active.currentStep}`);

                // Check if quest is now complete
                if (active.currentStep >= def.steps.length) {
                    active.completed = true;
                    st.completedQuests.push(active.questId);
                    console.log(`[Quest] Completed quest "${def.name}"!`);
                    // Apply quest completion rewards (create a minimal dummy event for effect application)
                    if (def.rewards && def.rewards.length > 0) {
                        const dummyEvent = {
                            definitionId: active.questId,
                            currentStepId: '',
                            vars: {},
                            log: [],
                            appliedEffects: [],
                            chatPhaseActive: false,
                            chatMessageCount: 0,
                            actionCooldowns: {},
                            actionResults: [],
                        };
                        this.applyEffects(def.rewards, dummyEvent as any);
                    }
                }
            }
        }
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

        // Run onEnter hook for start step (e.g. auto-start chat phase)
        if (startStep.onEnter) {
            const ctx: EventContext = {
                stage: this,
                target: event.target,
                eventId: event.definitionId,
                vars: event.vars,
            };
            startStep.onEnter(ctx);
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
            const eventId = this._activeEvent.definitionId;
            console.log(`[Event] Ended event "${eventId}"`);
            // Events can set vars.blockQuestAdvancement = true on failure paths
            // to prevent the quest from advancing (e.g. failed capture attempt).
            if (!this._activeEvent.vars?.blockQuestAdvancement) {
                this.markEventCompleted(eventId);
            } else {
                console.log(`[Event] Quest advancement blocked for "${eventId}" (failure path)`);
            }
            this._activeEvent = null;
        }
    }

    // ============================
    // Servant Chat (Event-based)
    // ============================

    /**
     * Start a servant chat as an event.
     * Creates a dynamic event definition with the correct location and auto-starts the chat phase.
     * Returns the ActiveEvent for React to own.
     */
    startServantChat(servantName: string, location: string): ActiveEvent | null {
        const eventId = 'servant_chat';
        const chatEvent: EventDefinition = {
            id: eventId,
            name: `Chat with ${servantName}`,
            description: `Have a casual conversation with ${servantName}.`,
            icon: 'message-circle',
            category: 'social',
            startStep: 'session',
            steps: {
                session: {
                    id: 'session',
                    text: `*You find {target} at the ${location}. They turn to face you as you approach.*`,
                    chatPhase: {
                        context: `Casual conversation with servant ${servantName} at the ${location}`,
                        speaker: '{target}',
                        location: location,
                        skippable: true,
                        minMessages: 0,
                        changeScope: { ...SERVANT_CHAT_SCOPE, targetCharacters: [servantName] },
                    },
                    isEnding: true,
                    onEnter: (ctx: EventContext) => {
                        ctx.stage.startEventChat();
                    },
                },
            },
        };

        this.registerEvent(chatEvent);
        return this.startEvent(eventId, servantName);
    }

    /**
     * Start a multi-servant chat as an event.
     * Creates a dynamic event definition with multiple participants.
     * Uses vars.participants to store the full list.
     * Uses vars.activeSpeaker to track who the LLM should respond as.
     */
    startMultiServantChat(servantNames: string[], location: string): ActiveEvent | null {
        if (servantNames.length === 0) return null;
        const eventId = 'multi_servant_chat';
        const participantList = servantNames.join(', ');
        const chatEvent: EventDefinition = {
            id: eventId,
            name: `Group Chat`,
            description: `A group conversation with ${participantList}.`,
            icon: 'users',
            category: 'social',
            startStep: 'session',
            steps: {
                session: {
                    id: 'session',
                    text: `*You gather ${participantList} at the ${location} for a conversation.*`,
                    chatPhase: {
                        context: `Group conversation with servants ${participantList} at the ${location}`,
                        speaker: servantNames[0],
                        location: location,
                        skippable: true,
                        minMessages: 0,
                        changeScope: { ...MULTI_CHAT_SCOPE, targetCharacters: [...servantNames] },
                    },
                    isEnding: true,
                    onEnter: (ctx: EventContext) => {
                        ctx.vars.participants = [...servantNames];
                        ctx.vars.activeSpeaker = servantNames[0];
                        ctx.stage.startEventChat();
                    },
                },
            },
        };

        this.registerEvent(chatEvent);
        const result = this.startEvent(eventId, servantNames[0]);
        // Ensure vars are set even if onEnter ran already
        if (this._activeEvent) {
            this._activeEvent.vars.participants = [...servantNames];
            this._activeEvent.vars.activeSpeaker = servantNames[0];
        }
        return result ? { ...this._activeEvent! } : null;
    }

    /** Set the active speaker for a multi-servant chat */
    setMultiChatSpeaker(speakerName: string): void {
        if (this._activeEvent) {
            this._activeEvent.vars.activeSpeaker = speakerName;
        }
    }

    /** Get multi-chat participants list */
    getMultiChatParticipants(): string[] {
        return this._activeEvent?.vars.participants || [];
    }

    /** Get the currently active speaker for multi-chat */
    getMultiChatActiveSpeaker(): string {
        return this._activeEvent?.vars.activeSpeaker || '';
    }

    /** Check if the current event is a multi-servant chat */
    isMultiServantChat(): boolean {
        return this._activeEvent?.definitionId === 'multi_servant_chat';
    }

    /**
     * Send a message in a multi-servant chat.
     * The response comes from the currently active speaker.
     */
    async sendMultiEventMessage(text: string, speakerOverride?: string): Promise<SceneMessage | null> {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive || !text.trim()) return null;

        const pcName = this.currentState.playerCharacter.name;
        const speakerName = speakerOverride || event.vars.activeSpeaker || this.getEventChatSpeaker();
        this._eventMessages.push({ sender: pcName, text: text.trim() });

        try {
            this._textGenActive = true;
            const prompt = this.generateMultiChatPrompt(text.trim(), speakerName);
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
            console.error('[Multi Chat] Send failed:', e);
            return null;
        }
    }

    /**
     * Generate a reply from a specific speaker in multi-chat WITHOUT adding a new player message.
     * Used when clicking a portrait to get that character's response to the existing conversation.
     */
    async generateMultiChatReply(speakerName: string): Promise<SceneMessage | null> {
        const event = this._activeEvent;
        if (!event?.chatPhaseActive) return null;

        const pcName = this.currentState.playerCharacter.name;

        try {
            this._textGenActive = true;
            // Use last player message or empty string for prompt context
            const lastPlayerMsg = [...this._eventMessages].reverse().find(m => m.sender === pcName);
            const prompt = this.generateMultiChatPrompt(lastPlayerMsg?.text || '', speakerName);
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
            console.error('[Multi Chat] Reply generation failed:', e);
            return null;
        }
    }

    /**
     * Generate a prompt for multi-servant chat.
     * Each character has their own personality/history but shares scene context.
     */
    private generateMultiChatPrompt(_userText: string, activeSpeaker: string): string {
        const event = this._activeEvent;
        if (!event) return '';

        const def = this._eventRegistry[event.definitionId];
        if (!def) return '';

        const step = def.steps[event.currentStepId];
        if (!step?.chatPhase) return '';

        const chatPhase = step.chatPhase;
        const pcName = this.currentState.playerCharacter.name;
        const participants: string[] = event.vars.participants || [activeSpeaker];

        const lines: string[] = [];

        // ── ROLE LOCK ──
        lines.push(`[SYSTEM INSTRUCTIONS]`);
        lines.push(`You are roleplaying as ${activeSpeaker}. You are ONLY ${activeSpeaker}.`);
        lines.push(`NEVER speak as ${pcName}, narrate ${pcName}'s actions, thoughts, or dialogue.`);
        lines.push(`NEVER speak as any character other than ${activeSpeaker}.`);
        lines.push(`Other characters present in this scene: ${participants.filter(p => p !== activeSpeaker).join(', ')}. Do NOT speak for them — they will respond on their own.`);
        lines.push(`NEVER reference events or conversations not described below.`);
        lines.push(`Stay in character at all times. Do not break the fourth wall.`);

        // ── CHARACTER IDENTITY for the active speaker ──
        const charData = CHARACTER_DATA[activeSpeaker];
        const servant = this.currentState.servants[activeSpeaker];

        lines.push(`\n[CHARACTER: ${activeSpeaker}]`);

        const backstory = servant?.backstory;
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

        lines.push(`\nPlay ${activeSpeaker} as a real person, not a flat archetype. Show inner conflict, hesitation, humor, or vulnerability when appropriate. React to the situation naturally — not every response needs to be dramatic or defiant. Small gestures, pauses, and mixed feelings make the character feel alive.`);

        // ── PERSONAL HISTORY ──
        const history = servant?.personalHistory;
        if (history && history.trim()) {
            lines.push(`\n[${activeSpeaker.toUpperCase()}'S HISTORY]`);
            lines.push(history.trim());
        }

        // ── SERVANT STATE ──
        if (servant) {
            lines.push(`\n[SERVANT STATE]`);
            lines.push(`${activeSpeaker} is a converted servant (former ${servant.formerClass}).`);
            if (servant.description) {
                lines.push(`Current Persona: ${servant.description}`);
            }
            if (servant.archetypeTraits && servant.archetypeTraits.length > 0) {
                lines.push(`Conversion Traits: ${servant.archetypeTraits.join(', ')}`);
            }
            lines.push(`Love: ${servant.love}/100. Obedience: ${servant.obedience}/100.`);
            const obLines = getObedienceMilestoneDirections(servant.obedience, activeSpeaker, pcName);
            for (const ol of obLines) lines.push(ol);
            const loveLines = getLoveMilestoneDirections(servant.love, activeSpeaker, pcName);
            for (const ll of loveLines) lines.push(ll);

            lines.push(`\n[CONVERSATION GUIDANCE]`);
            lines.push(`This is a casual group conversation — NOT a conditioning or training session.`);
            lines.push(`${activeSpeaker} should behave according to their love (${servant.love}/100) and obedience (${servant.obedience}/100) levels.`);
            lines.push(`Low love → cold, formal, resentful. High love → warm, affectionate, eager to please.`);
            lines.push(`Low obedience → willful, pushes back, tests boundaries. High obedience → compliant, deferential, anticipates commands.`);
            lines.push(`Show personality depth: opinions on manor life, memories of their past, reactions to ${pcName}, relationships with the other servants present.`);
            lines.push(`React naturally to ${pcName}'s words. Do NOT be a blank drone — even obedient servants have personality.`);
        }

        // ── OTHER CHARACTERS PRESENT (brief info for awareness) ──
        const otherParticipants = participants.filter(p => p !== activeSpeaker);
        if (otherParticipants.length > 0) {
            lines.push(`\n[OTHER CHARACTERS PRESENT]`);
            for (const name of otherParticipants) {
                const otherServant = this.currentState.servants[name];
                const otherData = CHARACTER_DATA[name];
                if (otherServant) {
                    lines.push(`- ${name}: ${otherServant.servantTitle || otherServant.formerClass}. Love ${otherServant.love}/100, Obedience ${otherServant.obedience}/100.${otherData ? ` (${otherData.traits.slice(0, 3).join(', ')})` : ''}`);
                }
            }
            lines.push(`${activeSpeaker} may react to or reference the other servants' presence, body language, or previous remarks in the conversation.`);
        }

        // ── SCENE CONTEXT ──
        const interpolatedText = step.text
            .replace(/\{target\}/g, event.target || '')
            .replace(/\{pc\}/g, pcName);
        lines.push(`\n[CURRENT SCENE]`);
        lines.push(interpolatedText);

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

        // ── NSFW MODE ──
        if (this.currentState.nsfwMode) {
            lines.push(`\n[EXPLICIT CONTENT MODE — ACTIVE]`);
            lines.push(`You will write sexually explicit, graphic, and sensual descriptions.
                Include detailed physical sensations, arousal, bodily reactions, and intimate acts when contextually appropriate.
                Use explicit language — but always with a tone that fits the character.
                Lean into the erotic tension of the power dynamic between ${pcName} and ${activeSpeaker}.`);
        }

        // ── RESPONSE INSTRUCTIONS ──
        lines.push(`\n[RESPONSE INSTRUCTIONS]`);
        lines.push(`Respond in character as ${activeSpeaker}. Use first person.`);
        lines.push(`React based on your personality and current servant state.`);
        lines.push(`You may reference the other characters present (${otherParticipants.join(', ')}) but do NOT speak for them.`);
        lines.push(`Keep responses conversational — 1 to 3 paragraphs.`);

        // ── TEXT FORMATTING RULES ──
        lines.push(`\n[TEXT FORMATTING RULES]`);
        lines.push(`- Wrap physical actions in single asterisks: *sighs heavily*`);
        lines.push(`- Wrap spoken dialogue in double quotes: "I can't resist..."`);
        lines.push(`- Narration is plain text without markers.`);
        lines.push(`- Do NOT use ** (double asterisks). Only single * for actions.`);
        lines.push(`- Do NOT output stat changes, system information, or break character.`);

        lines.push(`\n${activeSpeaker}:`);

        return lines.join('\n');
    }

    // ============================
    // Conversion System
    // ============================

    /**
     * Convert a fully conditioned captive into a servant using a predefined archetype.
     * Rewrites their personality, keeps existing traits, and adds archetype-granted traits.
     */
    convertCaptiveWithArchetype(heroName: string, archetypeId: string, overrideDescription?: string, servantTitle?: string, servantTitleColor?: string): boolean {
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
            description: overrideDescription || archetype.personalityRewrite,
            traits: finalTraits,
            archetypeTraits: newTraits,
            details: hero.details,
            stats: hero.stats,
            love: 50,
            obedience: 100,
            stamina: 100,
            maxStamina: 100,
            servantTitle: servantTitle || archetype.name,
            servantTitleColor: servantTitleColor || archetype.color,
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
    convertCaptiveWithCustom(heroName: string, newDescription: string, newTraits: string[], servantTitle?: string, servantTitleColor?: string): boolean {
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
            archetypeTraits: addedTraits,
            details: hero.details,
            stats: hero.stats,
            love: 50,
            obedience: 100,
            stamina: 100,
            maxStamina: 100,
            servantTitle: servantTitle,
            servantTitleColor: servantTitleColor,
            personalHistory: hero.personalHistory,
            backstory: hero.backstory,
        };

        delete this.currentState.heroes[heroName];
        this.currentState.stats.servants += 1;

        console.log(`[Conversion] ${heroName} converted with custom personality → Servant`);
        return true;
    }

    /**
     * Generate a personalized servant description for an archetype conversion.
     * Blends the archetype template with the character's original personality/backstory
     * to produce a unique narrative even when multiple characters share the same archetype.
     */
    async generateArchetypeNarrative(heroName: string, archetypeId: string): Promise<string | null> {
        const hero = this.currentState.heroes[heroName] || this.currentState.servants[heroName];
        const charData = CHARACTER_DATA[heroName];
        const archetype = getConversionArchetype(archetypeId);
        if (!charData || !archetype) return null;

        const pcName = this.currentState.playerCharacter.name;
        const originalDesc = charData.description;
        const backstory = hero?.backstory || originalDesc;
        const gender = charData.details?.['Gender'] || 'unknown';
        const species = charData.details?.['Species'] || 'unknown';
        const charClass = charData.details?.['Class'] || charData.details?.['Former Role'] || 'unknown';

        const prompt = [
            `[SYSTEM] Write a personalized servant description for ${heroName} after being converted into the "${archetype.name}" archetype by ${pcName}.`,
            ``,
            `[CHARACTER — BEFORE CONVERSION]`,
            `Name: ${heroName}`,
            `Species: ${species}`,
            `Gender: ${gender}`,
            `Class/Role: ${charClass}`,
            `Original Personality: ${originalDesc}`,
            `Traits: ${charData.traits.join(', ')}`,
            backstory !== originalDesc ? `Backstory: ${backstory}` : '',
            `Details: ${Object.entries(charData.details).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
            ``,
            `[ARCHETYPE TEMPLATE — "${archetype.name}"]`,
            `${archetype.personalityRewrite}`,
            ``,
            `[INSTRUCTIONS]`,
            `Write a 3-5 sentence description of ${heroName} as they are NOW — a brainwashed servant converted into the "${archetype.name}" archetype.`,
            `Use the archetype template as the FRAMEWORK, but personalize it with unique details from ${heroName}'s original personality, backstory, and identity.`,
            `Reference specific things about them: their species traits, former skills, mannerisms, quirks, or history — but recontextualized through their new converted identity.`,
            `Write in third person, present tense. Do NOT mention ${pcName} by name — refer to them as "their master" or "their owner".`,
            `The description should feel like it belongs to THIS specific character, not a generic template.`,
            `Do NOT use any formatting — no asterisks, no quotes, no headers. Just plain prose paragraphs.`,
        ].filter(Boolean).join('\n');

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
            return response?.result?.trim() || null;
        } catch (e) {
            console.error('[Conversion] Archetype narrative generation failed:', e);
            return null;
        }
    }

    /**
     * Update a servant's description (for user edits on the conversion complete screen).
     */
    updateServantDescription(heroName: string, description: string): void {
        const servant = this.currentState.servants[heroName];
        if (servant) {
            servant.description = description;
            console.log(`[Conversion] Updated ${heroName}'s servant description.`);
        }
    }

    updateServantTitle(heroName: string, title: string, color?: string): void {
        const servant = this.currentState.servants[heroName];
        if (servant) {
            servant.servantTitle = title;
            if (color) servant.servantTitleColor = color;
            console.log(`[Conversion] Updated ${heroName}'s servant title to "${title}".`);
        }
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
    async generateConversionResult(heroName: string, messages: SceneMessage[]): Promise<{ description: string; traits: string[]; title: string; color: string } | null> {
        const pcName = this.currentState.playerCharacter.name;
        const charData = CHARACTER_DATA[heroName];

        // Build the reference examples from archetypes
        const exampleFormats = CONVERSION_ARCHETYPES.slice(0, 5).map(a =>
            `Example — Title: "${a.name}" / Color: "${a.color}" / Description: "${a.personalityRewrite.substring(0, 80)}..." / Traits: [${a.grantedTraits.join(', ')}]`
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
            `1. A short TITLE (2-3 words) that captures what ${heroName} has become (e.g. "Loyal Pet", "Perfect Servant", "Broken Oracle", "Dark Thrall", "Enchanted Paramour")`,
            `2. A hex COLOR that fits the title's theme (e.g. "#fb7185" for something affectionate/pink, "#a78bfa" for something arcane/purple, "#60a5fa" for something disciplined/blue, "#34d399" for something useful/green, "#fbbf24" for devotion/gold, "#94a3b8" for something hollow/grey, "#f43f5e" for something passionate/red)`,
            `3. A new personality DESCRIPTION (3-5 sentences, third person, present tense) describing who ${heroName} is NOW after conversion.`,
            `4. Exactly 1-2 new TRAITS that reflect the conversion (e.g., "Devoted", "Cheerful", "Stoic", "Occultist", etc.)`,
            ``,
            `Respond in EXACTLY this format:`,
            `TITLE: [short title]`,
            `COLOR: [hex color]`,
            `DESCRIPTION: [the new personality description]`,
            `TRAITS: [Trait1, Trait2]`,
        ].join('\n');

        try {
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 500,
                stop: [],
                template: '',
                context_length: null,
                min_tokens: null,
            });

            if (response?.result) {
                const text = response.result.trim();
                const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n|$)/);
                const colorMatch = text.match(/COLOR:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/);
                const descMatch = text.match(/DESCRIPTION:\s*(.+?)(?=\nTRAITS:|$)/s);
                const traitMatch = text.match(/TRAITS:\s*(.+)/);

                const title = titleMatch ? titleMatch[1].trim() : 'Converted';
                const color = colorMatch ? colorMatch[1].trim() : '#c8aa6e';
                const description = descMatch ? descMatch[1].trim() : text;
                const traits = traitMatch
                    ? traitMatch[1].split(',').map(t => t.trim()).filter(Boolean)
                    : [];

                return { description, traits, title, color };
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
                            stamina: 100,
                            maxStamina: 100,
                        };
                        delete this.currentState.heroes[effectTarget];
                        this.currentState.stats.servants += 1;
                    }
                    break;
                }
                case 'custom':
                    // Handle known custom effect targets
                    if (fx.target === 'mana' && fx.value) {
                        this.currentState.stats.mana = Math.min(
                            this.currentState.stats.mana + fx.value,
                            this.currentState.stats.maxMana
                        );
                    }
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

    // ============================
    // AI Chat Judgment System
    // ============================

    /**
     * After a chat ends, ask the AI to evaluate the conversation and return
     * structured state changes (love, obedience, gold, items, stats, etc.).
     * Returns null on failure — the chat still works, just no AI-driven changes.
     */
    async generateChatJudgment(
        messages: SceneMessage[],
        scope: ChatChangeScope,
        participants: string[],
    ): Promise<AIChatJudgment | null> {
        if (messages.length === 0) return null;

        const pcName = this.currentState.playerCharacter.name;
        const filteredMessages = messages.filter(m => m.sender !== '\u00a7system');
        if (filteredMessages.length === 0) return null;

        // Build participant context
        const participantContext = participants.map(name => {
            const servant = this.currentState.servants[name];
            if (!servant) return `${name}: (not found)`;
            return [
                `${name}:`,
                `  Love: ${servant.love}/100, Obedience: ${servant.obedience}/100, Stamina: ${servant.stamina}/${servant.maxStamina}`,
                servant.stats ? `  Stats: ${Object.entries(servant.stats).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '',
            ].filter(Boolean).join('\n');
        }).join('\n');

        // Build the conversation transcript
        const transcript = filteredMessages
            .map(m => `${m.sender}: ${m.text}`)
            .join('\n');

        // Describe allowed changes
        const scopeDescription = describeScopeForPrompt(scope);

        const prompt = [
            `[SYSTEM] You are evaluating a conversation that just happened in a game. Based on how the conversation went, decide what state changes should occur.`,
            ``,
            `[PLAYER]: ${pcName}`,
            `[PARTICIPANTS]:`,
            participantContext,
            ``,
            `[ALLOWED CHANGES — you may ONLY use these categories with deltas in these ranges]:`,
            `  ${scopeDescription}`,
            ``,
            `[GUIDELINES]:`,
            `- Evaluate the TONE and CONTENT of the conversation.`,
            `- Positive, kind, or affectionate interactions should increase love.`,
            `- Commands obeyed, discipline shown, or submission should increase obedience.`,
            `- Defiance, rudeness, or resistance should decrease obedience.`,
            `- Harsh, cruel, or dismissive behavior from the player should decrease love.`,
            `- Conversations consume energy — stamina usually decreases slightly.`,
            `- Gold/mana changes should only happen if something was explicitly given, traded, or offered in the conversation.`,
            `- Item changes should only happen if an item was explicitly given, found, or lost in the narrative.`,
            `- Stat changes (prowess, expertise, etc.) should be rare — only if training or a learning moment occurred.`,
            `- It is ENTIRELY VALID to return an empty changes array if nothing notable happened.`,
            `- Each change should have a "reasoning" explaining why.`,
            `- If multiple participants are involved, you can make separate changes for each.`,
            `- Keep changes modest and proportional to the conversation length and intensity.`,
            ``,
            `[CONVERSATION]:`,
            transcript,
            ``,
            `[RESPONSE FORMAT — return ONLY valid JSON, no markdown, no explanation]:`,
            `{`,
            `  "changes": [`,
            `    { "category": "love", "target": "CharacterName", "delta": 3, "reasoning": "Player was affectionate" },`,
            `    { "category": "obedience", "target": "CharacterName", "delta": -1, "reasoning": "Character showed mild defiance" }`,
            `  ],`,
            `  "summary": "Brief overall summary of changes"`,
            `}`,
            ``,
            `For item changes use: { "category": "item_add", "itemName": "Item Name", "quantity": 1, "reasoning": "..." }`,
            `For stat changes use: { "category": "stat", "target": "CharacterName", "field": "prowess", "delta": 1, "reasoning": "..." }`,
            `For gold/mana use: { "category": "gold", "delta": 5, "reasoning": "..." }`,
            ``,
            `Return ONLY the JSON object:`,
        ].join('\n');

        try {
            console.log('[ChatJudgment] Generating AI judgment for chat...');
            const response = await this.generator.textGen({
                prompt,
                include_history: false,
                max_tokens: 500,
                stop: [],
                template: '',
                context_length: null,
                min_tokens: null,
            });

            const raw = response?.result?.trim();
            if (!raw) {
                console.warn('[ChatJudgment] Empty response from AI');
                return null;
            }

            return this.parseChatJudgment(raw, scope, participants);
        } catch (e) {
            console.error('[ChatJudgment] Generation failed:', e);
            return null;
        }
    }

    /**
     * Parse the AI's JSON response into a validated AIChatJudgment.
     * Clamps values to scope ranges, filters invalid targets/items.
     */
    parseChatJudgment(
        raw: string,
        scope: ChatChangeScope,
        participants: string[],
    ): AIChatJudgment | null {
        try {
            // Try to extract JSON — handle both raw JSON and ```json blocks
            let jsonStr = raw.trim();
            const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonBlockMatch) {
                jsonStr = jsonBlockMatch[1].trim();
            }
            // Also try to find just the JSON object if there's surrounding text
            const objMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (objMatch) {
                jsonStr = objMatch[0];
            }

            const parsed = JSON.parse(jsonStr);
            if (!parsed || !Array.isArray(parsed.changes)) {
                console.warn('[ChatJudgment] Invalid JSON structure:', raw);
                return null;
            }

            const validatedChanges: AIChatChange[] = [];

            for (const change of parsed.changes) {
                if (!change || typeof change !== 'object') continue;
                if (!change.category || typeof change.category !== 'string') continue;

                const category = change.category as ChatChangeCategory;
                const scopeEntry = getScopeEntry(scope, category);
                if (!scopeEntry) {
                    console.warn(`[ChatJudgment] Category "${category}" not in scope, skipping`);
                    continue;
                }

                // Validate target character for character-specific categories
                const charCategories: ChatChangeCategory[] = ['love', 'obedience', 'stamina', 'stat'];
                if (charCategories.includes(category)) {
                    const target = change.target;
                    if (!target || typeof target !== 'string') continue;

                    // Must be a valid servant (or in participants)
                    const servant = this.currentState.servants[target];
                    if (!servant) {
                        console.warn(`[ChatJudgment] Target "${target}" not found in servants, skipping`);
                        continue;
                    }

                    // If scope restricts targets, check
                    if (scope.targetCharacters && !scope.targetCharacters.includes(target)) {
                        console.warn(`[ChatJudgment] Target "${target}" not in allowed targets, skipping`);
                        continue;
                    }
                }

                // Validate and clamp delta
                let delta = typeof change.delta === 'number' ? change.delta : 0;
                delta = clampToScope(scope, category, delta);

                // For item categories, validate item
                if (category === 'item_add' || category === 'item_remove') {
                    const itemName = change.itemName;
                    if (!itemName || typeof itemName !== 'string') continue;

                    // Check against allowed items if specified
                    if (scopeEntry.allowedItems && !scopeEntry.allowedItems.includes(itemName)) {
                        console.warn(`[ChatJudgment] Item "${itemName}" not in allowed items, skipping`);
                        continue;
                    }

                    // For item_remove, check player actually has the item
                    if (category === 'item_remove' && !this.hasItem(itemName)) {
                        console.warn(`[ChatJudgment] Cannot remove "${itemName}" — not in inventory`);
                        continue;
                    }

                    validatedChanges.push({
                        category,
                        itemName,
                        quantity: Math.max(1, Math.min(change.quantity || 1, scopeEntry.max)),
                        reasoning: change.reasoning || '',
                    });
                    continue;
                }

                // For stat category, validate field
                if (category === 'stat') {
                    const field = change.field;
                    if (!field || typeof field !== 'string') continue;
                    const validStats: string[] = ['prowess', 'expertise', 'attunement', 'presence', 'discipline', 'insight'];
                    if (!validStats.includes(field)) continue;
                    if (scopeEntry.allowedStats && !scopeEntry.allowedStats.includes(field as StatName)) {
                        console.warn(`[ChatJudgment] Stat "${field}" not in allowed stats, skipping`);
                        continue;
                    }
                }

                // Skip zero deltas (no change — item categories already handled above)
                if (delta === 0) continue;

                validatedChanges.push({
                    category,
                    target: change.target,
                    field: change.field,
                    delta,
                    reasoning: change.reasoning || '',
                });
            }

            console.log(`[ChatJudgment] Validated ${validatedChanges.length} changes from AI response`);

            return {
                changes: validatedChanges,
                summary: typeof parsed.summary === 'string' ? parsed.summary : '',
            };
        } catch (e) {
            console.error('[ChatJudgment] Failed to parse AI response:', e, '\nRaw:', raw);
            return null;
        }
    }

    /**
     * Apply validated AI chat changes to the game state.
     * Returns the list of changes that were actually applied (for display).
     */
    applyChatChanges(judgment: AIChatJudgment): AIChatChange[] {
        const applied: AIChatChange[] = [];

        for (const change of judgment.changes) {
            try {
                switch (change.category) {
                    case 'love': {
                        const servant = this.currentState.servants[change.target || ''];
                        if (servant && change.delta) {
                            servant.love = Math.max(0, Math.min(100, servant.love + change.delta));
                            applied.push(change);
                        }
                        break;
                    }
                    case 'obedience': {
                        const servant = this.currentState.servants[change.target || ''];
                        if (servant && change.delta) {
                            servant.obedience = Math.max(0, Math.min(100, servant.obedience + change.delta));
                            applied.push(change);
                        }
                        break;
                    }
                    case 'stamina': {
                        const servant = this.currentState.servants[change.target || ''];
                        if (servant && change.delta) {
                            servant.stamina = Math.max(0, Math.min(servant.maxStamina, servant.stamina + change.delta));
                            applied.push(change);
                        }
                        break;
                    }
                    case 'gold': {
                        if (change.delta) {
                            this.currentState.stats.gold = Math.max(0, this.currentState.stats.gold + change.delta);
                            applied.push(change);
                        }
                        break;
                    }
                    case 'mana': {
                        if (change.delta) {
                            this.currentState.stats.mana = Math.max(0,
                                Math.min(this.currentState.stats.maxMana, this.currentState.stats.mana + change.delta));
                            applied.push(change);
                        }
                        break;
                    }
                    case 'comfort': {
                        if (change.delta) {
                            this.currentState.stats.household.comfort = Math.max(0,
                                this.currentState.stats.household.comfort + change.delta);
                            applied.push(change);
                        }
                        break;
                    }
                    case 'household_obedience': {
                        if (change.delta) {
                            this.currentState.stats.household.obedience = Math.max(0,
                                this.currentState.stats.household.obedience + change.delta);
                            applied.push(change);
                        }
                        break;
                    }
                    case 'item_add': {
                        const itemName = change.itemName || '';
                        const qty = change.quantity || 1;
                        const existing = this.currentState.inventory[itemName];
                        if (existing) {
                            existing.quantity += qty;
                        } else {
                            try {
                                this.currentState.inventory[itemName] = {
                                    name: itemName,
                                    quantity: qty,
                                    type: getItemDefinition(itemName).type,
                                };
                            } catch {
                                // Item not in registry — add as misc
                                this.currentState.inventory[itemName] = {
                                    name: itemName,
                                    quantity: qty,
                                    type: 'material',
                                };
                            }
                        }
                        applied.push(change);
                        break;
                    }
                    case 'item_remove': {
                        const itemName = change.itemName || '';
                        const qty = change.quantity || 1;
                        const item = this.currentState.inventory[itemName];
                        if (item) {
                            item.quantity -= qty;
                            if (item.quantity <= 0) delete this.currentState.inventory[itemName];
                            applied.push(change);
                        }
                        break;
                    }
                    case 'stat': {
                        const servant = this.currentState.servants[change.target || ''];
                        const statKey = change.field as StatName;
                        if (servant && statKey && servant.stats[statKey] !== undefined && change.delta) {
                            servant.stats[statKey] = Math.max(0, Math.min(100, servant.stats[statKey] + change.delta));
                            applied.push(change);
                        }
                        break;
                    }
                }
            } catch (e) {
                console.error(`[ChatJudgment] Failed to apply change:`, change, e);
            }
        }

        console.log(`[ChatJudgment] Applied ${applied.length} changes to game state`);
        return applied;
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

    // ============================
    // NPC Generation (Async Portrait & Backstory)
    // ============================

    /**
     * Fire-and-forget portrait generation for a generated NPC.
     * Stores result in _pendingNPCPortraits when complete.
     */
    /** Build the default portrait prompt for an NPC/hero. Public so the UI can show/edit it. */
    static buildPortraitPrompt(species: string, className: string, gender: string): string {
        const genderAdj = gender === 'Male' ? 'male' : 'female';
        return [
            `illustration, digital art, anime cel shading, by Tokifuji,`,
            `anthropomorphic ${species.toLowerCase()} character, kemono,`,
            `${genderAdj}, fur, animal ears, tail, non-human face, colored fur body,`,
            `${className.toLowerCase()}, medieval fantasy outfit,`,
            `upper body portrait, looking at viewer,`,
            `vibrant colors, soft lighting, dark background, high quality, detailed`,
        ].join(' ');
    }

    static readonly PORTRAIT_NEGATIVE = 'realistic, photorealistic, photograph, 3d render, human, human face, human skin, smooth skin, catgirl, nekomimi, kemonomimi, girl with animal ears, blurry, low quality, text, watermark, feral, muzzle';

    generateNPCPortraitAsync(npc: GeneratedNPC): void {
        const prompt = Stage.buildPortraitPrompt(npc.species, npc.className, npc.gender);

        this.generator.makeImage({
            prompt,
            negative_prompt: Stage.PORTRAIT_NEGATIVE,
            aspect_ratio: AspectRatio.PHOTO_VERTICAL,
            remove_background: false,
        }).then((response) => {
            if (response?.url) {
                this._pendingNPCPortraits[npc.name] = response.url;
                // Also apply to hero if already created
                const hero = this.currentState.heroes[npc.name];
                if (hero && !hero.avatar) {
                    hero.avatar = response.url;
                }
                // Store in generatedImages for persistence
                if (!this.chatState.generatedImages) {
                    this.chatState.generatedImages = {};
                }
                if (!this.chatState.generatedImages[npc.name]) {
                    this.chatState.generatedImages[npc.name] = {};
                }
                this.chatState.generatedImages[npc.name]['portrait'] = response.url;
                console.log(`[NPC] Portrait generated for ${npc.name}`);
            }
        }).catch((err) => {
            console.error(`[NPC] Portrait generation failed for ${npc.name}:`, err);
        });
    }

    /**
     * Regenerate a portrait for an existing hero using a custom or default prompt.
     * Returns a promise so the UI can show loading state.
     */
    async regeneratePortrait(heroName: string, customPrompt?: string): Promise<string | null> {
        // Look up the character across all stores: heroes, servants, and playerCharacter
        let character: { avatar: string; details: Record<string, string>; heroClass?: string; formerClass?: string; title?: string } | null = null;
        const hero = this.currentState.heroes[heroName];
        const servant = this.currentState.servants?.[heroName];
        const pc = this.currentState.playerCharacter;

        if (hero) {
            character = hero;
        } else if (servant) {
            character = servant;
        } else if (pc && pc.name === heroName) {
            character = pc;
        }
        if (!character) {
            console.warn(`[NPC] regeneratePortrait: character "${heroName}" not found in heroes, servants, or playerCharacter`);
            return null;
        }

        const classLabel = (character as any).heroClass || (character as any).formerClass || (character as any).title || 'adventurer';
        const prompt = customPrompt || Stage.buildPortraitPrompt(
            character.details['Species'] || 'animal',
            classLabel,
            character.details['Gender']?.includes('Male') ? 'Male' : 'Female',
        );

        try {
            const response = await this.generator.makeImage({
                prompt,
                negative_prompt: Stage.PORTRAIT_NEGATIVE,
                aspect_ratio: AspectRatio.PHOTO_VERTICAL,
                remove_background: false,
            });
            if (response?.url) {
                character.avatar = response.url;
                if (!this.chatState.generatedImages) this.chatState.generatedImages = {};
                if (!this.chatState.generatedImages[heroName]) this.chatState.generatedImages[heroName] = {};
                this.chatState.generatedImages[heroName]['portrait'] = response.url;
                console.log(`[NPC] Portrait regenerated for ${heroName}`);
                return response.url;
            }
        } catch (err) {
            console.error(`[NPC] Portrait regeneration failed for ${heroName}:`, err);
        }
        return null;
    }

    /**
     * Fire-and-forget backstory generation for a generated NPC.
     * Stores result in _pendingNPCBackstories when complete.
     */
    generateNPCBackstoryAsync(npc: GeneratedNPC): void {
        const genderStr = npc.gender === 'Male' ? 'male' : 'female';
        const pronouns = npc.gender === 'Male'
            ? { pronoun: 'he', possessive: 'his', object: 'him' }
            : { pronoun: 'she', possessive: 'her', object: 'her' };

        const prompt = [
            `[SYSTEM] Write a SHORT BACKSTORY for this NPC character.`,
            ``,
            `[CHARACTER]`,
            `Name: ${npc.name}`,
            `Species: ${npc.species}`,
            `Gender: ${genderStr}`,
            `Class: ${npc.className}`,
            `Description: ${npc.description}`,
            `Traits: ${npc.traits.join(', ')}`,
            `Details: ${Object.entries(npc.details).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
            ``,
            `[RULES]`,
            `- Write 3-4 sentences about ${npc.name}'s past BEFORE being found in the woods.`,
            `- Include where ${pronouns.pronoun} grew up, what shaped ${pronouns.object}, and why ${pronouns.pronoun} is now wandering the forest.`,
            `- Reference ${pronouns.possessive} personality traits naturally.`,
            `- Use third person, past tense. Correct pronouns for ${genderStr}.`,
            `- Do NOT mention game mechanics, the player, or capture.`,
            `- Keep it concise and atmospheric.`,
            ``,
            `[BACKSTORY]:`,
        ].filter(Boolean).join('\n');

        this.generator.textGen({
            prompt,
            include_history: false,
            max_tokens: 250,
            stop: [],
            template: '',
            context_length: null,
            min_tokens: null,
        }).then((response) => {
            const backstory = response?.result?.trim();
            if (backstory) {
                this._pendingNPCBackstories[npc.name] = backstory;
                // Also apply to hero if already created
                const hero = this.currentState.heroes[npc.name];
                if (hero && !hero.backstory) {
                    hero.backstory = backstory;
                }
                console.log(`[NPC] Backstory generated for ${npc.name}`);
            }
        }).catch((err) => {
            console.error(`[NPC] Backstory generation failed for ${npc.name}:`, err);
        });
    }

    /** Get a pending NPC portrait (may be null if still generating) */
    getPendingNPCPortrait(name: string): string | null {
        return this._pendingNPCPortraits[name] || null;
    }

    /** Get a pending NPC backstory (may be null if still generating) */
    getPendingNPCBackstory(name: string): string | null {
        return this._pendingNPCBackstories[name] || null;
    }

    /** Replace all event messages (for edit/regenerate support) */
    setEventMessages(messages: SceneMessage[]): void {
        this._eventMessages = [...messages];
    }

    /** Push a player message to event messages without generating a reply */
    pushPlayerEventMessage(text: string): void {
        const pcName = this.currentState.playerCharacter.name;
        this._eventMessages.push({ sender: pcName, text: text.trim() });
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

            // Mana cost check
            if (action.manaCost > 0 && this.currentState.stats.mana < action.manaCost) {
                locked = true;
                lockReason = `Requires ${action.manaCost} mana (you have ${this.currentState.stats.mana})`;
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

        // Deduct mana cost
        if (action.manaCost > 0) {
            if (this.currentState.stats.mana < action.manaCost) {
                return { actionId, success: false, delta: 0, message: `Not enough mana! Need ${action.manaCost}, have ${this.currentState.stats.mana}.`, newBrainwashing: oldBw };
            }
            this.currentState.stats.mana = Math.max(0, this.currentState.stats.mana - action.manaCost);
        }

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
            const playerSkillValue = this.currentState.stats.skills[action.skillCheck.skill as keyof SkillStats] || 0;
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

        // Deduct mana cost (debug still costs mana)
        if (action.manaCost > 0) {
            this.currentState.stats.mana = Math.max(0, this.currentState.stats.mana - action.manaCost);
        }

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
            if (servant.description) {
                lines.push(`Current Persona: ${servant.description}`);
            }
            if (servant.archetypeTraits && servant.archetypeTraits.length > 0) {
                lines.push(`Conversion Traits: ${servant.archetypeTraits.join(', ')}`);
            }
            lines.push(`Love: ${servant.love}/100. Obedience: ${servant.obedience}/100.`);
            const obLines = getObedienceMilestoneDirections(servant.obedience, speakerName, pcName);
            for (const ol of obLines) lines.push(ol);
            const loveLines = getLoveMilestoneDirections(servant.love, speakerName, pcName);
            for (const ll of loveLines) lines.push(ll);

            // Social event: add casual conversation guidance
            if (def.category === 'social') {
                lines.push(`\n[CONVERSATION GUIDANCE]`);
                lines.push(`This is a casual, everyday conversation — NOT a conditioning or training session.`);
                lines.push(`${speakerName} should behave according to their love (${servant.love}/100) and obedience (${servant.obedience}/100) levels.`);
                lines.push(`Low love → cold, formal, resentful. High love → warm, affectionate, eager to please.`);
                lines.push(`Low obedience → willful, pushes back, tests boundaries. High obedience → compliant, deferential, anticipates commands.`);
                lines.push(`Show personality depth: opinions on manor life, memories of their past, reactions to ${pcName}, relationships with other servants.`);
                lines.push(`React naturally to ${pcName}'s words. Do NOT be a blank drone — even obedient servants have personality.`);
            }
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
    // Save / Load System
    // ============================
    
    /** Get manor slots from chatState (current chat's state) */
    getManorSlots(): SavedSlotData[] | undefined {
        return this.chatState.manorSlots;
    }

    /** Sync current manor layout to chatState (persisted on next message) */
    syncManorSlots(slots: SavedSlotData[]): void {
        this.chatState.manorSlots = slots;
    }

    /** Reset all game state to defaults (new game) */
    resetManor(): void {
        this.chatState.manorSlots = undefined;
        this.chatState.generatedImages = undefined;
        this.chatState.discoveredLocations = [];
        this.chatState.totalHeroesCaptured = 0;
        this.chatState.totalServantsConverted = 0;
        this.chatState.achievements = [];
        const defaults = this.getDefaultMessageState();
        Object.assign(this.currentState, defaults);
    }

    /** Restore full game state from a loaded save file */
    restoreFromSave(save: SaveFileSlot): void {
        // Stats (always present)
        this.currentState.stats = JSON.parse(JSON.stringify(save.stats));

        // Player character
        if (save.playerCharacter) {
            this.currentState.playerCharacter = JSON.parse(JSON.stringify(save.playerCharacter));
        }

        // Manor grid
        if (save.manorSlots) {
            this.chatState.manorSlots = JSON.parse(JSON.stringify(save.manorSlots));
        }

        // Manor upgrades
        if (save.manorUpgrades) {
            this.currentState.manorUpgrades = JSON.parse(JSON.stringify(save.manorUpgrades));
        }

        // Heroes (merge back — uses Record<string, Hero>)
        if (save.heroes) {
            this.currentState.heroes = JSON.parse(JSON.stringify(save.heroes));
        }

        // Servants (full restore including stats, tasks, history, etc.)
        if (save.servants) {
            this.currentState.servants = JSON.parse(JSON.stringify(save.servants));
        }

        // Inventory
        if (save.inventory) {
            this.currentState.inventory = JSON.parse(JSON.stringify(save.inventory));
        }

        // Chat-level persistent data
        if (save.discoveredLocations) {
            this.chatState.discoveredLocations = [...save.discoveredLocations];
        }
        if (save.totalHeroesCaptured !== undefined) {
            this.chatState.totalHeroesCaptured = save.totalHeroesCaptured;
        }
        if (save.totalServantsConverted !== undefined) {
            this.chatState.totalServantsConverted = save.totalServantsConverted;
        }
        if (save.achievements) {
            this.chatState.achievements = [...save.achievements];
        }

        // Generated images (portraits)
        if (save.generatedImages) {
            this.chatState.generatedImages = JSON.parse(JSON.stringify(save.generatedImages));
        }

        // Location
        if (save.location) {
            this.currentState.location = save.location;
        }

        // Dungeon
        if (save.dungeonProgress) {
            this.currentState.dungeonProgress = JSON.parse(JSON.stringify(save.dungeonProgress));
        }

        // NSFW mode
        if (save.nsfwMode !== undefined) {
            this.currentState.nsfwMode = save.nsfwMode;
        }

        // Event & Quest tracking
        this.currentState.completedEvents = save.completedEvents || [];
        this.currentState.activeQuests = save.activeQuests
            ? JSON.parse(JSON.stringify(save.activeQuests))
            : [];
        this.currentState.completedQuests = save.completedQuests || [];
    }

    /** Build a save name from current state */
    buildSaveName(): string {
        const day = this.currentState.stats.day;
        const servantCount = Object.keys(this.currentState.servants).length;
        return `Day ${day} · ${servantCount} servant${servantCount !== 1 ? 's' : ''}`;
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

    /** Save full game state to a specific slot */
    saveToSlot(slotIndex: number): boolean {
        if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false;
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            const st = this.currentState;
            const cs = this.chatState;

            const saveFile: SaveFileSlot = {
                name: this.buildSaveName(),
                timestamp: Date.now(),
                version: SAVE_VERSION,

                stats: JSON.parse(JSON.stringify(st.stats)),
                playerCharacter: JSON.parse(JSON.stringify(st.playerCharacter)),
                manorSlots: JSON.parse(JSON.stringify(cs.manorSlots || [])),
                manorUpgrades: JSON.parse(JSON.stringify(st.manorUpgrades)),
                heroes: JSON.parse(JSON.stringify(st.heroes)),
                servants: JSON.parse(JSON.stringify(st.servants)),
                inventory: JSON.parse(JSON.stringify(st.inventory)),

                discoveredLocations: cs.discoveredLocations ? [...cs.discoveredLocations] : [],
                totalHeroesCaptured: cs.totalHeroesCaptured || 0,
                totalServantsConverted: cs.totalServantsConverted || 0,
                achievements: cs.achievements ? [...cs.achievements] : [],
                generatedImages: cs.generatedImages ? JSON.parse(JSON.stringify(cs.generatedImages)) : undefined,

                location: st.location,
                dungeonProgress: st.dungeonProgress ? JSON.parse(JSON.stringify(st.dungeonProgress)) : undefined,
                nsfwMode: st.nsfwMode,

                completedEvents: [...st.completedEvents],
                activeQuests: JSON.parse(JSON.stringify(st.activeQuests)),
                completedQuests: [...st.completedQuests],
            };

            localStorage.setItem(key, JSON.stringify(saveFile));
            return true;
        } catch (e) {
            console.warn('Failed to save:', e);
            return false;
        }
    }

    /** Load game data from a specific slot */
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
