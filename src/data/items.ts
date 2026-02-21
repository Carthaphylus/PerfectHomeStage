// ──────────────────────────────────────────
// INVENTORY & ITEMS
// ──────────────────────────────────────────

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

export const ITEM_REGISTRY: Record<string, ItemDefinition> = {
    'Hypnotic Pendant': {
        name: 'Hypnotic Pendant', type: 'equipment', rarity: 'epic', icon: 'gem',
        description: 'A golden pendant enchanted with a mesmerizing spiral pattern. Amplifies the wearer\'s hypnotic influence over weak-willed targets.',
        stackable: false, maxStack: 1,
    },
    'Arcane Visor': {
        name: 'Arcane Visor', type: 'equipment', rarity: 'legendary', icon: 'eye',
        description: 'Citrine\'s signature headset. Projects a golden spiral directly into the target\'s vision, bypassing natural mental defenses.',
        stackable: false, maxStack: 1,
    },
    'Mana Crystal': {
        name: 'Mana Crystal', type: 'material', rarity: 'uncommon', icon: 'diamond',
        description: 'A shard of crystallized arcane energy. Used in enchanting and manor upgrades.',
        stackable: true, maxStack: 99,
    },
    'Obedience Elixir': {
        name: 'Obedience Elixir', type: 'consumable', rarity: 'rare', icon: 'test-tubes',
        description: 'A shimmering golden potion that temporarily heightens suggestibility. Increases brainwashing progress when administered.',
        stackable: true, maxStack: 10,
    },
    'Servant Collar': {
        name: 'Servant Collar', type: 'equipment', rarity: 'rare', icon: 'circle-dot',
        description: 'An ornate collar inscribed with binding runes. Worn by fully converted servants as a mark of devotion.',
        stackable: true, maxStack: 5,
    },
    'Spiral Incense': {
        name: 'Spiral Incense', type: 'consumable', rarity: 'uncommon', icon: 'orbit',
        description: 'Burns with a hypnotic golden smoke that fills a room. Creates an atmosphere conducive to conditioning.',
        stackable: true, maxStack: 20,
    },
    'Enchanted Shackles': {
        name: 'Enchanted Shackles', type: 'key', rarity: 'rare', icon: 'link',
        description: 'Arcane restraints that dampen a captive\'s willpower. Required to hold particularly strong-willed heroes.',
        stackable: true, maxStack: 5,
    },
    'Gold Coin': {
        name: 'Gold Coin', type: 'currency', rarity: 'common', icon: 'coins',
        description: 'Standard currency. Used for manor improvements, hiring, and trade.',
        stackable: true, maxStack: 9999,
    },
    'Dreamcatcher Herb': {
        name: 'Dreamcatcher Herb', type: 'material', rarity: 'common', icon: 'leaf',
        description: 'A fragrant herb found in the woods. Used to brew potions and burn as incense.',
        stackable: true, maxStack: 50,
    },
    'Memory Fragment': {
        name: 'Memory Fragment', type: 'key', rarity: 'epic', icon: 'sparkle',
        description: 'A shard of a hero\'s memories, extracted during conditioning. Can be used to unlock deeper obedience or returned to restore free will.',
        stackable: true, maxStack: 10,
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
