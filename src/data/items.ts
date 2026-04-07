// ──────────────────────────────────────────
// INVENTORY & ITEMS
// ──────────────────────────────────────────

import type { StatName } from './stats';

// ── Item Enums & Sub-types ──

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'equipment' | 'consumable' | 'ingredient' | 'material' | 'key' | 'currency';

/** Sub-categories for consumable items */
export type ConsumableSubtype = 'potion' | 'food' | 'incense' | 'scroll' | 'trinket';

/** Sub-categories for ingredient items */
export type IngredientCategory = 'herb' | 'crystal' | 'essence' | 'powder' | 'extract';

/** The five element essences used by the brewing system */
export type ElementType = 'fire' | 'earth' | 'water' | 'shadow' | 'light';

/** Numeric element values — each ingredient contributes some amount of each element */
export type ElementProfile = Partial<Record<ElementType, number>>;

/** Base liquid determines the output form of a brew */
export type BaseLiquid = 'water' | 'oil' | 'spirit' | 'smoke';

/** Output form of a brew, determined by the base liquid */
export type BrewOutputForm = 'potion' | 'salve' | 'tincture' | 'incense';

/** Quality tier of a brew result */
export type BrewQuality = 'failed' | 'weak' | 'standard' | 'potent';

// ── Item Source (UI hint for where to obtain an item) ──

export interface ItemSource {
    type: 'shop' | 'exploration' | 'task' | 'crafting' | 'quest' | 'conditioning';
    location?: string;
    details?: string;
}

// ── Brewing Types ──

/** Element-ratio-based brew recipe — defines element thresholds for producing a result */
export interface BrewRecipe {
    id: string;
    name: string;
    resultItemName: string;
    elementThresholds: ElementProfile;  // minimum element values needed
    minimumTotal: number;               // minimum sum of all elements
    dominantElement?: ElementType;      // highest element must be this
    allowedForms: BrewOutputForm[];     // which output forms this recipe supports
    discoveryHint: string;
    soulFragmentCost?: number;
}

/** Result of a brewing attempt */
export interface BrewResult {
    success: boolean;
    quality: BrewQuality;
    resultItemName: string;
    outputForm: BrewOutputForm;
    isNewDiscovery: boolean;
    matchScore: number;                 // 0-100 percentage match
    feedback: string;
    elementProfile: ElementProfile;     // what the player mixed
    ingredientsConsumed: { itemName: string; quantity: number }[];
}

// ── Core Item Definition ──

export interface ItemDefinition {
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    icon: string;
    description: string;
    stackable: boolean;
    maxStack: number;

    // ── Consumable-specific ──
    craftable?: boolean;
    recipeId?: string;
    consumableSubtype?: ConsumableSubtype;

    // ── Ingredient-specific ──
    ingredientCategory?: IngredientCategory;
    elementProfile?: ElementProfile; // element essence contribution for brewing

    // ── Equipment-specific ──
    statBonuses?: Partial<Record<StatName, number>>;
    conditioningBonus?: number; // bonus to brainwashing delta

    // ── Key item specific ──
    tradeable?: boolean; // false = cannot sell (default false for key items)

    // ── Source hints (for UI) ──
    sources?: ItemSource[];
}

export interface InventoryItem {
    name: string;
    quantity: number;
    type?: string;
}

// ──────────────────────────────────────────
// ITEM REGISTRY
// ──────────────────────────────────────────
// NOTE: This registry has been cleared for the item system rework.
// Only stub items that are actively referenced in events, conditioning,
// quests, and tasks are kept. All items are marked for redesign in
// future batches.

export const ITEM_REGISTRY: Record<string, ItemDefinition> = {

    // ── Equipment (stub — referenced in conditioning/capture) ──

    'Hypnotic Pendant': {
        name: 'Hypnotic Pendant', type: 'equipment', rarity: 'epic', icon: 'pendant-spiral',
        description: 'A golden pendant enchanted with a mesmerizing spiral pattern. Amplifies the wearer\'s hypnotic influence over weak-willed targets.',
        stackable: false, maxStack: 1,
        conditioningBonus: 5,
        statBonuses: { presence: 6, attunement: 4 },
        sources: [
            { type: 'quest', details: 'Reward from hero questlines' },
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities" },
        ],
    },
    'Arcane Visor': {
        name: 'Arcane Visor', type: 'equipment', rarity: 'legendary', icon: 'visor-eye',
        description: 'Citrine\'s signature headset. Projects a golden spiral directly into the target\'s vision, bypassing natural mental defenses.',
        stackable: false, maxStack: 1,
        conditioningBonus: 10,
        statBonuses: { attunement: 8, insight: 5, presence: 3 },
        sources: [
            { type: 'quest', details: 'Crafted by Citrine after unlocking the Ritual Room' },
        ],
    },
    'Servant Collar': {
        name: 'Servant Collar', type: 'equipment', rarity: 'rare', icon: 'collar-lock',
        description: 'An ornate collar inscribed with binding runes. Worn by fully converted servants as a mark of devotion.',
        stackable: true, maxStack: 5,
        statBonuses: { discipline: 8 },
        conditioningBonus: 3,
        sources: [
            { type: 'crafting', details: 'Brewed at the Enchanting Workshop' },
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities" },
        ],
    },
    'Enchanted Shackles': {
        name: 'Enchanted Shackles', type: 'equipment', rarity: 'rare', icon: 'shackles-chain',
        description: 'Arcane restraints that dampen a captive\'s willpower. Required to hold particularly strong-willed heroes.',
        stackable: true, maxStack: 5,
        statBonuses: { discipline: 5, prowess: 3 },
        conditioningBonus: 4,
        sources: [
            { type: 'crafting', details: 'Requires Iron and Ward Crystals' },
            { type: 'exploration', location: 'Dungeon', details: 'Rare find in deep chambers' },
        ],
    },
    'Binding Cord': {
        name: 'Binding Cord', type: 'equipment', rarity: 'common', icon: 'binding-cord',
        description: 'Strong cord infused with restraint magic. Used for binding and control during capture.',
        stackable: true, maxStack: 15,
        statBonuses: { discipline: 2 },
        conditioningBonus: 1,
        sources: [
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
            { type: 'task', details: 'Weave Cloth task' },
        ],
    },

    // ── Consumables (referenced in conditioning/tasks) ──

    'Obedience Elixir': {
        name: 'Obedience Elixir', type: 'consumable', rarity: 'rare', icon: 'potion-obedience',
        description: 'A shimmering golden potion that temporarily heightens suggestibility. Increases brainwashing progress when administered.',
        stackable: true, maxStack: 10,
        craftable: true, recipeId: 'obedience_elixir',
        consumableSubtype: 'potion',
        sources: [{ type: 'crafting', details: 'Brewed with shadow-dominant ingredients' }],
    },
    'Spiral Incense': {
        name: 'Spiral Incense', type: 'consumable', rarity: 'uncommon', icon: 'incense-spiral',
        description: 'Burns with a hypnotic golden smoke that fills a room. Creates an atmosphere conducive to conditioning.',
        stackable: true, maxStack: 20,
        consumableSubtype: 'incense',
        sources: [
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities" },
            { type: 'crafting', details: 'Brewed with shadow and light balance' },
        ],
    },

    // ── Ingredients (stub — referenced in tasks/exploration rewards) ──

    'Dreamcatcher Herb': {
        name: 'Dreamcatcher Herb', type: 'ingredient', rarity: 'common', icon: 'herb-dream',
        description: 'A fragrant herb found in the woods. Its petals exude a calming, shadowy aroma.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'herb',
        elementProfile: { water: 3, shadow: 2 },
        sources: [
            { type: 'exploration', location: 'Woods', details: 'Found while foraging herbs' },
            { type: 'task', details: 'Forage Ingredients task' },
        ],
    },
    'Mana Crystal': {
        name: 'Mana Crystal', type: 'ingredient', rarity: 'uncommon', icon: 'crystal-mana',
        description: 'A shard of crystallized arcane energy. Radiates pure light with a fiery core.',
        stackable: true, maxStack: 99,
        ingredientCategory: 'crystal',
        elementProfile: { light: 4, fire: 1 },
        sources: [
            { type: 'exploration', location: 'Ruins', details: 'Crystalline formations near ley lines' },
            { type: 'task', details: 'Forage Ingredients task' },
        ],
    },
    'Moonpetal Blossom': {
        name: 'Moonpetal Blossom', type: 'ingredient', rarity: 'common', icon: 'ing-moonpetal',
        description: 'Pale petals that bloom only under moonlight. Gentle and soothing.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'herb',
        elementProfile: { water: 2, light: 2 },
        sources: [
            { type: 'exploration', location: 'Woods', details: 'Blooms in moonlit clearings' },
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
        ],
    },
    'Embervine Root': {
        name: 'Embervine Root', type: 'ingredient', rarity: 'uncommon', icon: 'ing-embervine',
        description: 'A gnarled root from a vine that grows near volcanic vents. Warm to the touch.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'herb',
        elementProfile: { fire: 3, earth: 2 },
        sources: [
            { type: 'exploration', location: 'Dungeon', details: 'Near geothermal vents in deep levels' },
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities" },
        ],
    },
    'Obsidian Dust': {
        name: 'Obsidian Dust', type: 'ingredient', rarity: 'uncommon', icon: 'ing-obsidian',
        description: 'Finely ground volcanic glass. Dark and volatile when mixed.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'powder',
        elementProfile: { shadow: 3, fire: 2 },
        sources: [
            { type: 'exploration', location: 'Dungeon', details: 'Scraped from obsidian formations' },
            { type: 'exploration', location: 'Ruins', details: 'Found among ritual remnants' },
        ],
    },
    'Sunstone Shard': {
        name: 'Sunstone Shard', type: 'ingredient', rarity: 'uncommon', icon: 'ing-sunstone',
        description: 'A warm crystal that glows faintly in darkness. Prized for its clarity.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'crystal',
        elementProfile: { light: 3, fire: 2 },
        sources: [
            { type: 'exploration', location: 'Ruins', details: 'Uncovered in sunlit chambers' },
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
        ],
    },
    'Marshwater Moss': {
        name: 'Marshwater Moss', type: 'ingredient', rarity: 'common', icon: 'ing-marshmoss',
        description: 'Soggy moss from stagnant marshlands. Abundant and mildly useful.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'herb',
        elementProfile: { water: 3, earth: 1 },
        sources: [
            { type: 'exploration', location: 'Woods', details: 'Grows along streams and bogs' },
        ],
    },
    'Nightshade Extract': {
        name: 'Nightshade Extract', type: 'ingredient', rarity: 'rare', icon: 'ing-nightshade',
        description: 'A concentrated distillation of nightshade berries. Deeply shadowy and potent.',
        stackable: true, maxStack: 30,
        ingredientCategory: 'extract',
        elementProfile: { shadow: 4, earth: 1 },
        sources: [
            { type: 'exploration', location: 'Woods', details: 'Rare nightshade bushes in deep forest' },
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities (limited stock)" },
        ],
    },
    'Spiritbloom': {
        name: 'Spiritbloom', type: 'ingredient', rarity: 'rare', icon: 'ing-spiritbloom',
        description: 'An ethereal flower that exists half in the spirit realm. Balanced essence.',
        stackable: true, maxStack: 30,
        ingredientCategory: 'essence',
        elementProfile: { light: 2, shadow: 2, water: 2 },
        sources: [
            { type: 'exploration', location: 'Ruins', details: 'Grows near ancient shrines' },
            { type: 'quest', details: 'Reward from certain quest events' },
        ],
    },
    'Ironbark Ash': {
        name: 'Ironbark Ash', type: 'ingredient', rarity: 'common', icon: 'ing-ironbark',
        description: 'The charred remains of ironbark wood. Dense and earthy.',
        stackable: true, maxStack: 50,
        ingredientCategory: 'powder',
        elementProfile: { earth: 3, fire: 1 },
        sources: [
            { type: 'exploration', location: 'Woods', details: 'Burned ironbark stumps' },
            { type: 'task', details: 'Gather Timber task (byproduct)' },
        ],
    },

    // ── Key Items (stub — referenced in quests/tasks) ──

    'Memory Fragment': {
        name: 'Memory Fragment', type: 'key', rarity: 'epic', icon: 'memory-shard',
        description: 'A shard of a hero\'s memories, extracted during conditioning. Can be used to unlock deeper obedience or returned to restore free will.',
        stackable: true, maxStack: 10,
        tradeable: false,
        sources: [
            { type: 'conditioning', details: 'Extracted at high brainwashing levels' },
            { type: 'exploration', location: 'Ruins', details: 'Rare find among ancient relics' },
        ],
    },
    'Skeleton Key': {
        name: 'Skeleton Key', type: 'key', rarity: 'rare', icon: 'key',
        description: 'An old skeleton key that can open many locks. Useful for breaking into secured places.',
        stackable: true, maxStack: 5,
        tradeable: false,
        sources: [
            { type: 'exploration', location: 'Dungeon', details: 'Found in locked chests' },
            { type: 'quest', details: 'Reward from certain quest steps' },
        ],
    },

    // ── Materials (construction resources for rooms) ──

    'Timber': {
        name: 'Timber', type: 'material', rarity: 'common', icon: 'item-log',
        description: 'Sturdy planks and beams. The backbone of any construction project.',
        stackable: true, maxStack: 99,
        sources: [
            { type: 'exploration', location: 'Woods', details: 'Gathered from fallen trees and clearings' },
            { type: 'task', details: 'Gather Timber task' },
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
        ],
    },
    'Stone': {
        name: 'Stone', type: 'material', rarity: 'common', icon: 'item-rock',
        description: 'Rough-hewn blocks quarried from ancient ruins. Essential for foundations and walls.',
        stackable: true, maxStack: 99,
        sources: [
            { type: 'exploration', location: 'Ruins', details: 'Salvaged from crumbling structures' },
            { type: 'task', details: 'Quarry Stone task' },
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
        ],
    },
    'Iron': {
        name: 'Iron', type: 'material', rarity: 'uncommon', icon: 'item-ingot',
        description: 'Raw iron in bars and ingots. Used for reinforcement, fittings, and structural support.',
        stackable: true, maxStack: 99,
        sources: [
            { type: 'exploration', location: 'Dungeon', details: 'Salvaged from deep ruins and dungeon forges' },
            { type: 'task', details: 'Forge Fittings task (requires armory)' },
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
        ],
    },
    'Velvet Cloth': {
        name: 'Velvet Cloth', type: 'material', rarity: 'uncommon', icon: 'item-fabric',
        description: 'Soft luxurious fabric for furnishings, cushions, and drapes.',
        stackable: true, maxStack: 99,
        sources: [
            { type: 'task', details: 'Weave Cloth task' },
            { type: 'shop', location: 'Town', details: "Pip's Emporium" },
        ],
    },
    'Marble Slab': {
        name: 'Marble Slab', type: 'material', rarity: 'rare', icon: 'item-marble',
        description: 'Polished white stone. Adds elegance and permanence to a room.',
        stackable: true, maxStack: 50,
        sources: [
            { type: 'exploration', location: 'Ruins', details: 'Rare find among ancient architecture' },
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities" },
        ],
    },
    'Rune Stones': {
        name: 'Rune Stones', type: 'material', rarity: 'rare', icon: 'item-rune',
        description: 'Stones carved with ancient magical script. Required for enchanted rooms.',
        stackable: true, maxStack: 50,
        sources: [
            { type: 'exploration', location: 'Ruins', details: 'Found among ritual sites' },
            { type: 'task', details: 'Inscribe Runes task (requires ritual room)' },
            { type: 'shop', location: 'Circus', details: "Vesper's Curiosities" },
        ],
    },
    'Ward Crystals': {
        name: 'Ward Crystals', type: 'material', rarity: 'epic', icon: 'item-crystal',
        description: 'Crystalline shards pulsing with protective magic. For containment and magical infrastructure.',
        stackable: true, maxStack: 30,
        sources: [
            { type: 'exploration', location: 'Dungeon', details: 'Rare find in deep chambers' },
            { type: 'task', details: 'Enchanting tasks' },
        ],
    },

    // ── Base Liquids (brewing materials) ──

    "Alchemist's Oil": {
        name: "Alchemist's Oil", type: 'material', rarity: 'common', icon: 'base-oil',
        description: 'A refined oil base used for brewing salves and creams.',
        stackable: true, maxStack: 30,
        sources: [{ type: 'shop', location: 'Town', details: "Pip's Emporium" }],
    },
    'Distilled Spirit': {
        name: 'Distilled Spirit', type: 'material', rarity: 'uncommon', icon: 'base-spirit',
        description: 'A clear, potent spirit. Used as a base for tinctures.',
        stackable: true, maxStack: 30,
        sources: [{ type: 'shop', location: 'Town', details: "Pip's Emporium" }],
    },
    'Smoldering Incense Base': {
        name: 'Smoldering Incense Base', type: 'material', rarity: 'uncommon', icon: 'incense-spiral',
        description: 'A smoldering coal and resin base used for brewing incense blends.',
        stackable: true, maxStack: 30,
        sources: [{ type: 'shop', location: 'Circus', details: "Vesper's Curiosities" }],
    },

    // ── Brew Results (consumables produced by brewing) ──

    'Calming Draught': {
        name: 'Calming Draught', type: 'consumable', rarity: 'uncommon', icon: 'potion-calming',
        description: 'A cool, blue-tinged draught that soothes the mind. Lowers a captive\'s resistance.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'calming_draught',
        consumableSubtype: 'potion',
        conditioningBonus: 3,
        sources: [{ type: 'crafting', details: 'Water-dominant brew' }],
    },
    'Fortifying Tonic': {
        name: 'Fortifying Tonic', type: 'consumable', rarity: 'uncommon', icon: 'potion-fortify',
        description: 'A hearty, amber tonic that restores stamina and vigor. Grants +20 stamina to a servant.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'fortifying_tonic',
        consumableSubtype: 'potion',
        statBonuses: { prowess: 3 },
        sources: [{ type: 'crafting', details: 'Earth-dominant brew' }],
    },
    'Blazebright Serum': {
        name: 'Blazebright Serum', type: 'consumable', rarity: 'rare', icon: 'potion-blaze',
        description: 'A fiery red serum that enhances combat prowess. Temporarily boosts prowess by 5.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'blazebright_serum',
        consumableSubtype: 'potion',
        statBonuses: { prowess: 5 },
        sources: [{ type: 'crafting', details: 'Fire-dominant brew' }],
    },
    'Clarity Philter': {
        name: 'Clarity Philter', type: 'consumable', rarity: 'uncommon', icon: 'potion-clarity',
        description: 'A luminous, clear liquid that sharpens perception and insight. Temporarily boosts insight by 4.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'clarity_philter',
        consumableSubtype: 'potion',
        statBonuses: { insight: 4 },
        sources: [{ type: 'crafting', details: 'Light-dominant brew' }],
    },
    'Binding Salve': {
        name: 'Binding Salve', type: 'consumable', rarity: 'rare', icon: 'salve-binding',
        description: 'A thick, dark paste applied to restraints. Increases conditioning effectiveness by 5.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'binding_salve',
        consumableSubtype: 'potion',
        conditioningBonus: 5,
        sources: [{ type: 'crafting', details: 'Shadow + earth balanced brew (salve form)' }],
    },
    'Mindmist Incense': {
        name: 'Mindmist Incense', type: 'consumable', rarity: 'rare', icon: 'incense-mindmist',
        description: 'Burns with a shimmering haze that makes the mind pliable. Room-wide conditioning bonus of 4.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'mindmist_incense',
        consumableSubtype: 'incense',
        conditioningBonus: 4,
        sources: [{ type: 'crafting', details: 'Shadow + light balanced brew (incense form)' }],
    },
    'Vitality Balm': {
        name: 'Vitality Balm', type: 'consumable', rarity: 'uncommon', icon: 'balm-vitality',
        description: 'A warm, earthy balm that heals wounds and restores energy. Grants +30 stamina to a servant.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'vitality_balm',
        consumableSubtype: 'potion',
        statBonuses: { prowess: 2, expertise: 2 },
        sources: [{ type: 'crafting', details: 'Earth + water balanced brew' }],
    },

    // ── New Brew Results ──

    'Devotion Draught': {
        name: 'Devotion Draught', type: 'consumable', rarity: 'rare', icon: 'potion-devotion',
        description: 'A shimmering pink-gold potion that deepens feelings of adoration and loyalty. Increases a servant\'s love by 8.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'devotion_draught',
        consumableSubtype: 'potion',
        sources: [{ type: 'crafting', details: 'Light-dominant brew with strong water' }],
    },
    'Mana Restorative': {
        name: 'Mana Restorative', type: 'consumable', rarity: 'uncommon', icon: 'potion-mana',
        description: 'A radiant, sparkling elixir that replenishes arcane reserves. Restores 25 mana.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'mana_restorative',
        consumableSubtype: 'potion',
        sources: [{ type: 'crafting', details: 'Light-dominant brew fueled by fire' }],
    },
    'Ironhide Tonic': {
        name: 'Ironhide Tonic', type: 'consumable', rarity: 'uncommon', icon: 'potion-ironhide',
        description: 'A dense, brown-green tonic that toughens the body. Boosts discipline by 4 and prowess by 2 temporarily.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'ironhide_tonic',
        consumableSubtype: 'potion',
        statBonuses: { discipline: 4, prowess: 2 },
        sources: [{ type: 'crafting', details: 'Earth-dominant brew with water and fire' }],
    },
    'Shadow Veil': {
        name: 'Shadow Veil', type: 'consumable', rarity: 'rare', icon: 'incense-shadowveil',
        description: 'Dark smoke that clings to the user, concealing their presence. Boosts insight by 5 during exploration.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'shadow_veil',
        consumableSubtype: 'incense',
        statBonuses: { insight: 5 },
        sources: [{ type: 'crafting', details: 'Shadow-dominant brew grounded in earth' }],
    },
    'Ember Salve': {
        name: 'Ember Salve', type: 'consumable', rarity: 'uncommon', icon: 'salve-ember',
        description: 'A warm, tingling paste that invigorates the muscles. Boosts prowess by 4 and restores 15 stamina.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'ember_salve',
        consumableSubtype: 'potion',
        statBonuses: { prowess: 4 },
        sources: [{ type: 'crafting', details: 'Fire-dominant brew tempered with earth (salve form)' }],
    },
    'Tranquil Mist': {
        name: 'Tranquil Mist', type: 'consumable', rarity: 'uncommon', icon: 'incense-tranquil',
        description: 'Pale, luminous smoke that fills a room with serenity. Increases household comfort by 5.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'tranquil_mist',
        consumableSubtype: 'incense',
        sources: [{ type: 'crafting', details: 'Water-dominant brew carried by light (incense form)' }],
    },
    'Soulbind Tincture': {
        name: 'Soulbind Tincture', type: 'consumable', rarity: 'epic', icon: 'tincture-soulbind',
        description: 'A dark, swirling liquid that binds fragments of the soul. Increases conditioning effectiveness by 8 and extracts a Memory Fragment.',
        stackable: true, maxStack: 5, craftable: true, recipeId: 'soulbind_tincture',
        consumableSubtype: 'potion',
        conditioningBonus: 8,
        sources: [{ type: 'crafting', details: 'Shadow-dominant brew ignited by fire (tincture form). Costs 1 soul fragment.' }],
    },

    // ── Brew Failures ──

    'Murky Sludge': {
        name: 'Murky Sludge', type: 'consumable', rarity: 'common', icon: 'brew-sludge',
        description: 'A foul-smelling, bubbling mess. The result of a failed brew.',
        stackable: true, maxStack: 50, consumableSubtype: 'potion',
    },
    'Foul Paste': {
        name: 'Foul Paste', type: 'consumable', rarity: 'common', icon: 'brew-paste',
        description: 'A noxious, sticky paste. Nobody wants to touch this.',
        stackable: true, maxStack: 50, consumableSubtype: 'potion',
    },
    'Unstable Tincture': {
        name: 'Unstable Tincture', type: 'consumable', rarity: 'common', icon: 'brew-unstable',
        description: 'A fizzing, unstable liquid. Might be slightly dangerous.',
        stackable: true, maxStack: 50, consumableSubtype: 'potion',
    },
    'Acrid Smoke': {
        name: 'Acrid Smoke', type: 'consumable', rarity: 'common', icon: 'brew-acrid',
        description: 'A choking cloud of unpleasant smoke. At least it keeps the bugs away.',
        stackable: true, maxStack: 50, consumableSubtype: 'incense',
    },
};

// ──────────────────────────────────────────
// ITEM UTILITIES
// ──────────────────────────────────────────

export function getItemDefinition(itemName: string): ItemDefinition {
    return ITEM_REGISTRY[itemName] || {
        name: itemName, type: 'key' as ItemType, rarity: 'common' as ItemRarity,
        icon: 'package', description: 'An unknown item.', stackable: true, maxStack: 99,
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

export function getAllItemDefinitions(): ItemDefinition[] {
    return Object.values(ITEM_REGISTRY);
}

export function getCraftableItems(): ItemDefinition[] {
    return Object.values(ITEM_REGISTRY).filter(item => item.craftable);
}

/** Get the human-readable label for an item type */
export function getItemTypeLabel(type: ItemType): string {
    switch (type) {
        case 'equipment': return 'Equipment';
        case 'consumable': return 'Consumable';
        case 'ingredient': return 'Ingredient';
        case 'material': return 'Material';
        case 'key': return 'Key Item';
        case 'currency': return 'Currency';
    }
}

/** Get the icon name for an item type */
export function getItemTypeIcon(type: ItemType): string {
    switch (type) {
        case 'equipment': return 'swords';
        case 'consumable': return 'flask-conical';
        case 'ingredient': return 'leaf';
        case 'material': return 'hammer';
        case 'key': return 'key';
        case 'currency': return 'coins';
    }
}

// ──────────────────────────────────────────
// BREWING UTILITIES (legacy compat wrappers)
// ──────────────────────────────────────────
// These functions are kept for ItemLibrary compatibility.
// The real brewing engine is in brewing.ts.

/** Check if an item is brewable (has a recipeId linked to the brew system) */
export function getItemRecipe(itemName: string): { id: string } | null {
    const item = getItemDefinition(itemName);
    if (!item.recipeId) return null;
    return { id: item.recipeId };
}

/** Legacy compat — always returns false; real brewing uses the BrewingScreen */
export function canCraftItem(_itemName: string, _inventory: Record<string, InventoryItem>): boolean {
    return false;
}
