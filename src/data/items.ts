// ──────────────────────────────────────────
// INVENTORY & ITEMS
// ──────────────────────────────────────────

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'equipment' | 'consumable' | 'material' | 'key' | 'currency';

export interface CraftingRecipe {
    id: string;
    ingredients: {
        itemName: string;
        quantity: number;
    }[];
}

export interface ItemDefinition {
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    icon: string;
    description: string;
    stackable: boolean;
    maxStack: number;
    craftable?: boolean;
    recipeId?: string;
}

export interface InventoryItem {
    name: string;
    quantity: number;
    type?: string;
}

export const ITEM_REGISTRY: Record<string, ItemDefinition> = {
    // ── Conditioning & Control Tools ──
    'Hypnotic Pendant': {
        name: 'Hypnotic Pendant', type: 'equipment', rarity: 'epic', icon: 'pendant-spiral',
        description: 'A golden pendant enchanted with a mesmerizing spiral pattern. Amplifies the wearer\'s hypnotic influence over weak-willed targets.',
        stackable: false, maxStack: 1,
    },
    'Arcane Visor': {
        name: 'Arcane Visor', type: 'equipment', rarity: 'legendary', icon: 'visor-eye',
        description: 'Citrine\'s signature headset. Projects a golden spiral directly into the target\'s vision, bypassing natural mental defenses.',
        stackable: false, maxStack: 1,
    },
    'Servant Collar': {
        name: 'Servant Collar', type: 'equipment', rarity: 'rare', icon: 'collar-lock',
        description: 'An ornate collar inscribed with binding runes. Worn by fully converted servants as a mark of devotion.',
        stackable: true, maxStack: 5,
    },
    'Enchanted Shackles': {
        name: 'Enchanted Shackles', type: 'key', rarity: 'rare', icon: 'shackles-chain',
        description: 'Arcane restraints that dampen a captive\'s willpower. Required to hold particularly strong-willed heroes.',
        stackable: true, maxStack: 5,
    },
    'Memory Fragment': {
        name: 'Memory Fragment', type: 'key', rarity: 'epic', icon: 'memory-shard',
        description: 'A shard of a hero\'s memories, extracted during conditioning. Can be used to unlock deeper obedience or returned to restore free will.',
        stackable: true, maxStack: 10,
    },

    // ── Alchemy Ingredients: Herbs ──
    'Dreamcatcher Herb': {
        name: 'Dreamcatcher Herb', type: 'material', rarity: 'common', icon: 'herb-dream',
        description: 'A fragrant herb found in the woods. Used to brew potions and burn as incense.',
        stackable: true, maxStack: 50,
    },
    'Moonflower Petals': {
        name: 'Moonflower Petals', type: 'material', rarity: 'uncommon', icon: 'herb-moon',
        description: 'Delicate petals that glow faintly under moonlight. Promote sleep and heighten suggestibility in potions.',
        stackable: true, maxStack: 40,
    },
    'Honeysuckle Blossoms': {
        name: 'Honeysuckle Blossoms', type: 'material', rarity: 'common', icon: 'herb-honey',
        description: 'Sweet-scented golden flowers. Add attraction and affection properties to brews.',
        stackable: true, maxStack: 50,
    },
    'Nightshade Leaf': {
        name: 'Nightshade Leaf', type: 'material', rarity: 'rare', icon: 'herb-nightshade',
        description: 'A dangerous dark herb with veins of purple. Dramatically increases potion potency but carries risks.',
        stackable: true, maxStack: 20,
    },
    'Mistletoe Sprigs': {
        name: 'Mistletoe Sprigs', type: 'material', rarity: 'uncommon', icon: 'herb-mistletoe',
        description: 'Sacred branches known for binding and connection magic. Enhances emotional bonding in potions.',
        stackable: true, maxStack: 30,
    },
    'Frostwhisper Moss': {
        name: 'Frostwhisper Moss', type: 'material', rarity: 'uncommon', icon: 'herb-frost',
        description: 'Cool, crystalline moss from deep forests. Imparts clarity and rational obedience to brews.',
        stackable: true, maxStack: 35,
    },

    // ── Alchemy Ingredients: Crystals & Minerals ──
    'Mana Crystal': {
        name: 'Mana Crystal', type: 'material', rarity: 'uncommon', icon: 'crystal-mana',
        description: 'A shard of crystallized arcane energy. Used in enchanting and manor upgrades.',
        stackable: true, maxStack: 99,
    },
    'Amethyst Shard': {
        name: 'Amethyst Shard', type: 'material', rarity: 'uncommon', icon: 'crystal-amethyst',
        description: 'A purple crystal fragment. Enhances spiritual and psychic aspects of magical potions.',
        stackable: true, maxStack: 50,
    },
    'Rose Quartz Dust': {
        name: 'Rose Quartz Dust', type: 'material', rarity: 'common', icon: 'dust-rose',
        description: 'Fine pink powder with gentle energy. Imparts love and affection aspects to brews.',
        stackable: true, maxStack: 60,
    },
    'Sapphire Fragment': {
        name: 'Sapphire Fragment', type: 'material', rarity: 'rare', icon: 'crystal-sapphire',
        description: 'A brilliant blue crystal shard. Strengthens obedience and discipline in potions.',
        stackable: true, maxStack: 30,
    },
    'Obsidian Powder': {
        name: 'Obsidian Powder', type: 'material', rarity: 'rare', icon: 'powder-obsidian',
        description: 'Black powder from volcanic glass. Adds darkness, control, and dominance to magical brews.',
        stackable: true, maxStack: 25,
    },
    'Moonstone Splinter': {
        name: 'Moonstone Splinter', type: 'material', rarity: 'uncommon', icon: 'crystal-moonstone',
        description: 'A silvery fragment that reflects light mystically. Enhances illusion and perception magic.',
        stackable: true, maxStack: 40,
    },
    'Phoenix Ash': {
        name: 'Phoenix Ash', type: 'material', rarity: 'epic', icon: 'ash-phoenix',
        description: 'Glowing ash from a phoenix\'s rebirth. Enables transformation and rebirth effects in powerful potions.',
        stackable: true, maxStack: 10,
    },
    'Dragon Scale Powder': {
        name: 'Dragon Scale Powder', type: 'material', rarity: 'legendary', icon: 'powder-dragon',
        description: 'Ground scales from an ancient dragon. The ultimate catalyst—exponentially amplifies all potion effects.',
        stackable: true, maxStack: 5,
    },
    'Siren\'s Tear': {
        name: 'Siren\'s Tear', type: 'material', rarity: 'rare', icon: 'tear-siren',
        description: 'A crystallized tear from a siren. Amplifies charm and attraction magic dramatically.',
        stackable: true, maxStack: 15,
    },
    'Wraith Essence': {
        name: 'Wraith Essence', type: 'material', rarity: 'epic', icon: 'essence-wraith',
        description: 'The distilled essence of a restless spirit. Enables memory and consciousness manipulation in brews.',
        stackable: true, maxStack: 8,
    },

    // ── Alchemy Results: Potions ──
    'Obedience Elixir': {
        name: 'Obedience Elixir', type: 'consumable', rarity: 'rare', icon: 'potion-obedience',
        description: 'A shimmering golden potion that temporarily heightens suggestibility. Increases brainwashing progress when administered.',
        stackable: true, maxStack: 10, craftable: true, recipeId: 'obedience_elixir',
    },
    'Spiral Incense': {
        name: 'Spiral Incense', type: 'consumable', rarity: 'uncommon', icon: 'incense-spiral',
        description: 'Burns with a hypnotic golden smoke that fills a room. Creates an atmosphere conducive to conditioning.',
        stackable: true, maxStack: 20,
    },
    'Binding Tincture': {
        name: 'Binding Tincture', type: 'consumable', rarity: 'uncommon', icon: 'potion-binding',
        description: 'A pale blue liquid with mystical shimmer. Provides light obedience boost when administered.',
        stackable: true, maxStack: 15, craftable: true, recipeId: 'binding_tincture',
    },
    'Thrall\'s Draught': {
        name: 'Thrall\'s Draught', type: 'consumable', rarity: 'rare', icon: 'potion-thrall',
        description: 'A deep crimson potion with an intoxicating aroma. Grants strong obedience and submission effects.',
        stackable: true, maxStack: 8, craftable: true, recipeId: 'thralls_draught',
    },
    'Domination Brew': {
        name: 'Domination Brew', type: 'consumable', rarity: 'epic', icon: 'potion-domination',
        description: 'A swirling black and gold elixir of immense power. Overwhelms resistance and enforces complete control.',
        stackable: true, maxStack: 5, craftable: true, recipeId: 'domination_brew',
    },
    'Sweetness Tonic': {
        name: 'Sweetness Tonic', type: 'consumable', rarity: 'uncommon', icon: 'potion-sweet',
        description: 'A rose-tinted liquid with honeyed scent. Encourages light romantic preference and attraction.',
        stackable: true, maxStack: 12, craftable: true, recipeId: 'sweetness_tonic',
    },
    'Admiration Nectar': {
        name: 'Admiration Nectar', type: 'consumable', rarity: 'rare', icon: 'potion-admire',
        description: 'A lustrous amber elixir. Fosters strong emotional attachment and admiration toward the witch.',
        stackable: true, maxStack: 8, craftable: true, recipeId: 'admiration_nectar',
    },
    'Devotion Elixir': {
        name: 'Devotion Elixir', type: 'consumable', rarity: 'epic', icon: 'potion-devotion',
        description: 'A radiant golden liquid infused with pure affection. Instills overwhelming love and loyalty.',
        stackable: true, maxStack: 5, craftable: true, recipeId: 'devotion_elixir',
    },
    'Clarity Potion': {
        name: 'Clarity Potion', type: 'consumable', rarity: 'uncommon', icon: 'potion-clarity',
        description: 'A crystalline blue draught. Temporarily enhances Insight and perception abilities.',
        stackable: true, maxStack: 15, craftable: true, recipeId: 'clarity_potion',
    },
    'Vigor Tincture': {
        name: 'Vigor Tincture', type: 'consumable', rarity: 'uncommon', icon: 'potion-vigor',
        description: 'A crimson liquid that glows faintly. Temporarily enhances Prowess and physical capability.',
        stackable: true, maxStack: 15, craftable: true, recipeId: 'vigor_tincture',
    },
    'Charm Cordial': {
        name: 'Charm Cordial', type: 'consumable', rarity: 'uncommon', icon: 'potion-charm',
        description: 'A shimmering rose-gold liquid. Temporarily enhances Presence and social influence.',
        stackable: true, maxStack: 15, craftable: true, recipeId: 'charm_cordial',
    },

    // ── Manor & Building Materials ──
    'Stone Blocks': {
        name: 'Stone Blocks', type: 'material', rarity: 'common', icon: 'mat-stone',
        description: 'Rough-hewn stone for basic construction. Essential for building and upgrading manor structures.',
        stackable: true, maxStack: 100,
    },
    'Wooden Planks': {
        name: 'Wooden Planks', type: 'material', rarity: 'common', icon: 'mat-wood',
        description: 'Sturdy wooden boards. Used for framing, walls, and basic structural elements.',
        stackable: true, maxStack: 100,
    },
    'Iron Bars': {
        name: 'Iron Bars', type: 'material', rarity: 'uncommon', icon: 'mat-iron',
        description: 'Heavy iron rods and gratings. Used for constructing cells, cages, and secure holding areas.',
        stackable: true, maxStack: 50,
    },
    'Marble Slabs': {
        name: 'Marble Slabs', type: 'material', rarity: 'rare', icon: 'mat-marble',
        description: 'Polished white marble stone. Adds luxury and aesthetic appeal to manor upgrades.',
        stackable: true, maxStack: 40,
    },
    'Obsidian Tiles': {
        name: 'Obsidian Tiles', type: 'material', rarity: 'epic', icon: 'mat-obsidian-tile',
        description: 'Dark lustrous tiles with arcane properties. Grant special properties to enchanted rooms.',
        stackable: true, maxStack: 25,
    },
    'Velvet Cloth': {
        name: 'Velvet Cloth', type: 'material', rarity: 'uncommon', icon: 'mat-velvet',
        description: 'Soft, luxurious fabric. Used for furnishings, cushions, and comfort upgrades.',
        stackable: true, maxStack: 50,
    },
    'Silk Tapestries': {
        name: 'Silk Tapestries', type: 'material', rarity: 'rare', icon: 'mat-silk',
        description: 'Intricately woven silk hangings. Decorate rooms and create atmosphere for conditioning.',
        stackable: true, maxStack: 30,
    },
    'Crystal Chandelier': {
        name: 'Crystal Chandelier', type: 'equipment', rarity: 'rare', icon: 'chandelier',
        description: 'An ornate chandelier with prismatic crystals. Illuminates rooms with enchanted light and grandeur.',
        stackable: true, maxStack: 8,
    },
    'Enchanted Mirror': {
        name: 'Enchanted Mirror', type: 'equipment', rarity: 'epic', icon: 'mirror-enchanted',
        description: 'A magical mirror inscribed with runes. Allows scrying and magical observation of captives.',
        stackable: true, maxStack: 3,
    },
    'Binding Circle Chalk': {
        name: 'Binding Circle Chalk', type: 'material', rarity: 'common', icon: 'chalk-circle',
        description: 'Powdered chalk infused with binding magic. Used to draw ritual circles and summoning marks.',
        stackable: true, maxStack: 80,
    },
    'Rune Stones': {
        name: 'Rune Stones', type: 'material', rarity: 'uncommon', icon: 'hexagon',
        description: 'Stones carved with ancient runes. Used as components in enchantments and protective wards.',
        stackable: true, maxStack: 45,
    },
    'Ward Crystals': {
        name: 'Ward Crystals', type: 'material', rarity: 'rare', icon: 'shield',
        description: 'Crystalline shards pulsing with protective magic. Used to create wards and containment chambers.',
        stackable: true, maxStack: 25,
    },

    // ── Equipment & Wearables ──
    'Mystical Robes': {
        name: 'Mystical Robes', type: 'equipment', rarity: 'rare', icon: 'robe-mystic',
        description: 'Dark silk robes enhanced with enchantments. Enhance spellcasting ability and presence.',
        stackable: false, maxStack: 1,
    },
    'Enchanted Ring': {
        name: 'Enchanted Ring', type: 'equipment', rarity: 'uncommon', icon: 'ring-enchanted',
        description: 'A simple band inscribed with glowing runes. Provides general magical amplification.',
        stackable: true, maxStack: 5,
    },
    'Amulet of Influence': {
        name: 'Amulet of Influence', type: 'equipment', rarity: 'rare', icon: 'amulet-influence',
        description: 'A pendant hanging from a chain, carved from unknown stone. Passively enhances Presence and social influence.',
        stackable: true, maxStack: 3,
    },
    'Silken Blindfold': {
        name: 'Silken Blindfold', type: 'equipment', rarity: 'uncommon', icon: 'blindfold-silk',
        description: 'Soft, enchanted silk cloth. Used for sensory deprivation and control during conditioning.',
        stackable: true, maxStack: 8,
    },
    'Binding Cord': {
        name: 'Binding Cord', type: 'equipment', rarity: 'common', icon: 'link-2',
        description: 'Strong cord infused with restraint magic. Used for binding and control during sessions.',
        stackable: true, maxStack: 15,
    },

    // ── Rewards & Treasure ──
    'Gemstone': {
        name: 'Gemstone', type: 'material', rarity: 'uncommon', icon: 'gem-treasure',
        description: 'A polished gemstone of moderate value. Collectable treasure from exploration.',
        stackable: true, maxStack: 50,
    },
    'Ancient Relic': {
        name: 'Ancient Relic', type: 'material', rarity: 'rare', icon: 'relic-ancient',
        description: 'An artifact of historical significance. Worth significant gold or trade value.',
        stackable: true, maxStack: 20,
    },
    'Enchanted Jewelry': {
        name: 'Enchanted Jewelry', type: 'equipment', rarity: 'rare', icon: 'jewelry-enchanted',
        description: 'Jewelry imbued with minor magic. Valuable personal treasures from captured heroes.',
        stackable: true, maxStack: 10,
    },
    'Spell Tome Fragment': {
        name: 'Spell Tome Fragment', type: 'material', rarity: 'uncommon', icon: 'tome-fragment',
        description: 'A page or excerpt from an ancient spellbook. Provides knowledge and lore about magical practices.',
        stackable: true, maxStack: 30,
    },
    'Adventurer\'s Badge': {
        name: 'Adventurer\'s Badge', type: 'material', rarity: 'uncommon', icon: 'badge-adventurer',
        description: 'A medal or insignia from a hero\'s past. Serves as a trophy of conquest.',
        stackable: true, maxStack: 20,
    },
    'Magical Talisman': {
        name: 'Magical Talisman', type: 'equipment', rarity: 'rare', icon: 'talisman-magic',
        description: 'A personal charm carried by a hero. Retains residual magical properties.',
        stackable: true, maxStack: 8,
    },
    'Heir\'s Ring': {
        name: 'Heir\'s Ring', type: 'equipment', rarity: 'epic', icon: 'ring-heir',
        description: 'An ornate signet ring bearing a noble\'s seal. A trophy of capturing nobility.',
        stackable: true, maxStack: 5,
    },

    // ── Consumables & Utility ──
    'Healing Salve': {
        name: 'Healing Salve', type: 'consumable', rarity: 'common', icon: 'salve-heal',
        description: 'A soothing ointment for wounds and injuries. Heals minor damages.',
        stackable: true, maxStack: 30,
    },
    'Stamina Draught': {
        name: 'Stamina Draught', type: 'consumable', rarity: 'uncommon', icon: 'draught-stamina',
        description: 'A refreshing liquid that restores energy. Replenishes stamina and endurance.',
        stackable: true, maxStack: 20,
    },
    'Luck Charm': {
        name: 'Luck Charm', type: 'consumable', rarity: 'uncommon', icon: 'charm-luck',
        description: 'A small token radiating fortune. Provides temporary boost to luck and favorable outcomes.',
        stackable: true, maxStack: 25,
    },
    'Antidote': {
        name: 'Antidote', type: 'consumable', rarity: 'uncommon', icon: 'antidote-bottle',
        description: 'A specialized remedy that counteracts poisons and conditions. Removes negative effects.',
        stackable: true, maxStack: 12,
    },
    'Scroll of Summoning': {
        name: 'Scroll of Summoning', type: 'consumable', rarity: 'rare', icon: 'scroll-summon',
        description: 'An ancient scroll inscribed with summoning runes. Can be used to call forth allies or effects.',
        stackable: true, maxStack: 6,
    },

    // ── Merchant Goods (Pip's Market Stall) ──
    'Traveler\'s Rations': {
        name: 'Traveler\'s Rations', type: 'consumable', rarity: 'common', icon: 'utensils',
        description: 'Dried meat, hard cheese, and trail bread wrapped in waxed cloth. Restores stamina on long expeditions.',
        stackable: true, maxStack: 20,
    },
    'Enchanted Candle': {
        name: 'Enchanted Candle', type: 'consumable', rarity: 'uncommon', icon: 'flame',
        description: 'A candle that burns with a soft violet flame. Creates a calming atmosphere that lowers mental defenses.',
        stackable: true, maxStack: 15,
    },
    'Whispering Vial': {
        name: 'Whispering Vial', type: 'consumable', rarity: 'rare', icon: 'flask-conical',
        description: 'A sealed glass vial that murmurs softly when held close. Contains a captured whisper of compliance — pour it into a captive\'s ear during conditioning.',
        stackable: true, maxStack: 8,
    },
    'Silver Pocket Mirror': {
        name: 'Silver Pocket Mirror', type: 'equipment', rarity: 'uncommon', icon: 'scan-eye',
        description: 'A palm-sized mirror with an ornate silver frame. Can be used to reflect hypnotic spirals, doubling their visual impact.',
        stackable: true, maxStack: 3,
    },
    'Mousefolk Cheese Wheel': {
        name: 'Mousefolk Cheese Wheel', type: 'consumable', rarity: 'common', icon: 'circle-dot',
        description: 'A miniature wheel of sharp, aromatic cheese — a mousefolk delicacy. Surprisingly restorative and delicious.',
        stackable: true, maxStack: 10,
    },
    'Bottled Starlight': {
        name: 'Bottled Starlight', type: 'consumable', rarity: 'rare', icon: 'sparkles',
        description: 'A corked bottle containing a swirl of captured starlight. Replenishes mana when consumed under the open sky.',
        stackable: true, maxStack: 5,
    },
    'Map Fragment': {
        name: 'Map Fragment', type: 'key', rarity: 'uncommon', icon: 'map',
        description: 'A torn piece of an old adventurer\'s map, showing a path to a hidden location. Pip swears it\'s genuine.',
        stackable: true, maxStack: 5,
    },
    'Suggestive Perfume': {
        name: 'Suggestive Perfume', type: 'consumable', rarity: 'uncommon', icon: 'wind',
        description: 'A floral perfume with subtle enchantment woven into its scent. Wearers find others more agreeable and pliable.',
        stackable: true, maxStack: 10,
    },
    'Pip\'s Lucky Trinket': {
        name: 'Pip\'s Lucky Trinket', type: 'equipment', rarity: 'rare', icon: 'star',
        description: 'A tiny brass figurine of a mouse holding a four-leaf clover. Pip claims it brought her nothing but good fortune. "Mostly."',
        stackable: false, maxStack: 1,
    },

    // ── Currency ──
    'Gold Coin': {
        name: 'Gold Coin', type: 'currency', rarity: 'common', icon: 'gold-coins',
        description: 'Standard currency. Used for manor improvements, hiring, and trade.',
        stackable: true, maxStack: 9999,
    },
};

export function getItemDefinition(itemName: string): ItemDefinition {
    return ITEM_REGISTRY[itemName] || {
        name: itemName, type: 'material' as ItemType, rarity: 'common' as ItemRarity,
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

// ──────────────────────────────────────────
// CRAFTING RECIPES
// ──────────────────────────────────────────

export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
    'binding_tincture': {
        id: 'binding_tincture',
        ingredients: [
            { itemName: 'Dreamcatcher Herb', quantity: 2 },
            { itemName: 'Rose Quartz Dust', quantity: 1 },
            { itemName: 'Mana Crystal', quantity: 1 },
        ],
    },
    'obedience_elixir': {
        id: 'obedience_elixir',
        ingredients: [
            { itemName: 'Dreamcatcher Herb', quantity: 3 },
            { itemName: 'Sapphire Fragment', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 2 },
            { itemName: 'Obsidian Powder', quantity: 1 },
        ],
    },
    'thralls_draught': {
        id: 'thralls_draught',
        ingredients: [
            { itemName: 'Nightshade Leaf', quantity: 2 },
            { itemName: 'Moonflower Petals', quantity: 3 },
            { itemName: 'Sapphire Fragment', quantity: 3 },
            { itemName: 'Obsidian Powder', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 2 },
        ],
    },
    'domination_brew': {
        id: 'domination_brew',
        ingredients: [
            { itemName: 'Nightshade Leaf', quantity: 3 },
            { itemName: 'Obsidian Powder', quantity: 3 },
            { itemName: 'Sapphire Fragment', quantity: 4 },
            { itemName: 'Phoenix Ash', quantity: 1 },
            { itemName: 'Wraith Essence', quantity: 1 },
            { itemName: 'Mana Crystal', quantity: 3 },
        ],
    },
    'sweetness_tonic': {
        id: 'sweetness_tonic',
        ingredients: [
            { itemName: 'Honeysuckle Blossoms', quantity: 3 },
            { itemName: 'Rose Quartz Dust', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 1 },
        ],
    },
    'admiration_nectar': {
        id: 'admiration_nectar',
        ingredients: [
            { itemName: 'Honeysuckle Blossoms', quantity: 4 },
            { itemName: 'Rose Quartz Dust', quantity: 3 },
            { itemName: 'Siren\'s Tear', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 2 },
        ],
    },
    'devotion_elixir': {
        id: 'devotion_elixir',
        ingredients: [
            { itemName: 'Honeysuckle Blossoms', quantity: 5 },
            { itemName: 'Rose Quartz Dust', quantity: 4 },
            { itemName: 'Siren\'s Tear', quantity: 3 },
            { itemName: 'Phoenix Ash', quantity: 1 },
            { itemName: 'Mana Crystal', quantity: 3 },
        ],
    },
    'clarity_potion': {
        id: 'clarity_potion',
        ingredients: [
            { itemName: 'Frostwhisper Moss', quantity: 3 },
            { itemName: 'Moonstone Splinter', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 1 },
        ],
    },
    'vigor_tincture': {
        id: 'vigor_tincture',
        ingredients: [
            { itemName: 'Dreamcatcher Herb', quantity: 3 },
            { itemName: 'Amethyst Shard', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 2 },
        ],
    },
    'charm_cordial': {
        id: 'charm_cordial',
        ingredients: [
            { itemName: 'Honeysuckle Blossoms', quantity: 2 },
            { itemName: 'Amethyst Shard', quantity: 2 },
            { itemName: 'Mana Crystal', quantity: 1 },
        ],
    },
};

// ──────────────────────────────────────────
// CRAFTING UTILITIES
// ──────────────────────────────────────────

export function getCraftingRecipe(recipeId: string): CraftingRecipe | null {
    return CRAFTING_RECIPES[recipeId] || null;
}

export function getItemRecipe(itemName: string): CraftingRecipe | null {
    const item = getItemDefinition(itemName);
    if (!item.recipeId) return null;
    return getCraftingRecipe(item.recipeId);
}

export function canCraftItem(itemName: string, inventory: Record<string, InventoryItem>): boolean {
    const recipe = getItemRecipe(itemName);
    if (!recipe) return false;

    for (const ingredient of recipe.ingredients) {
        const have = inventory[ingredient.itemName]?.quantity ?? 0;
        if (have < ingredient.quantity) return false;
    }
    return true;
}

export function getCraftingProgress(itemName: string, inventory: Record<string, InventoryItem>): { have: number; need: number } {
    const recipe = getItemRecipe(itemName);
    if (!recipe) return { have: 0, need: 0 };

    let have = 0;
    let need = recipe.ingredients.length;

    for (const ingredient of recipe.ingredients) {
        const haveAmount = inventory[ingredient.itemName]?.quantity ?? 0;
        if (haveAmount >= ingredient.quantity) {
            have++;
        }
    }

    return { have, need };
}

export function getAllItemDefinitions(): ItemDefinition[] {
    return Object.values(ITEM_REGISTRY);
}

export function getCraftableItems(): ItemDefinition[] {
    return Object.values(ITEM_REGISTRY).filter(item => item.craftable);
}
