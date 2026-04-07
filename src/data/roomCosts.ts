// ──────────────────────────────────────────
// ROOM BUILD COSTS — Material profiles for room construction
// ──────────────────────────────────────────

import type { RoomBuildCost, MaterialCost } from './types';
import type { InventoryItem } from './items';

// ── Room Build Profiles ──
// Rooms are grouped into profiles that determine what materials they need.
// Each profile defines costs per level (1 = initial build, 2+ = upgrades).

export type RoomBuildProfile = 'structural' | 'comfort' | 'magical' | 'dark' | 'scholarly' | 'containment';

/** Maps room types to their build profile */
export const ROOM_BUILD_PROFILES: Record<string, RoomBuildProfile> = {
    // Structural — practical, functional rooms
    quarters: 'structural',
    storage: 'structural',
    kitchen: 'structural',
    stable: 'structural',
    training_grounds: 'structural',
    armory: 'structural',

    // Comfort — luxury, social, and aesthetic rooms
    lounge: 'comfort',
    bathhouse: 'comfort',
    boudoir: 'comfort',
    performance_hall: 'comfort',
    wine_cellar: 'comfort',

    // Magical — arcane crafting and research rooms
    brewing: 'magical',
    ritual: 'magical',
    observatory: 'magical',
    enchanting_workshop: 'magical',
    laboratory: 'magical',
    greenhouse: 'magical',

    // Dark — containment, death, and corruption rooms
    crypt: 'dark',
    chapel: 'dark',
    graveyard: 'dark',
    infirmary: 'dark',

    // Scholarly — knowledge and study rooms
    classroom: 'scholarly',
    study: 'scholarly',

    // Containment — cells and dungeon upgrades
    cell: 'containment',
    dungeon: 'containment',
};

// ── Profile Cost Tables ──
// Each profile defines costs at levels 1, 2, 3.
// Level 1 = initial build, 2-3 = upgrades.

interface ProfileCosts {
    [level: number]: RoomBuildCost;
}

function mc(itemName: string, quantity: number): MaterialCost {
    return { itemName, quantity };
}

const PROFILE_COSTS: Record<RoomBuildProfile, ProfileCosts> = {
    structural: {
        1: { gold: 200, materials: [mc('Timber', 8), mc('Stone', 5), mc('Iron', 3)] },
        2: { gold: 400, materials: [mc('Timber', 12), mc('Stone', 8), mc('Iron', 5)] },
        3: { gold: 700, materials: [mc('Timber', 18), mc('Stone', 12), mc('Iron', 8)] },
    },
    comfort: {
        1: { gold: 250, materials: [mc('Timber', 5), mc('Velvet Cloth', 4), mc('Marble Slab', 2)] },
        2: { gold: 500, materials: [mc('Timber', 8), mc('Velvet Cloth', 7), mc('Marble Slab', 3)] },
        3: { gold: 800, materials: [mc('Timber', 10), mc('Velvet Cloth', 10), mc('Marble Slab', 5)] },
    },
    magical: {
        1: { gold: 300, materials: [mc('Stone', 6), mc('Rune Stones', 3)] },
        2: { gold: 600, materials: [mc('Stone', 10), mc('Rune Stones', 6), mc('Ward Crystals', 2)] },
        3: { gold: 1000, materials: [mc('Stone', 15), mc('Rune Stones', 10), mc('Ward Crystals', 4)] },
    },
    dark: {
        1: { gold: 250, materials: [mc('Stone', 6), mc('Iron', 4), mc('Ward Crystals', 2)] },
        2: { gold: 500, materials: [mc('Stone', 10), mc('Iron', 6), mc('Ward Crystals', 4)] },
        3: { gold: 900, materials: [mc('Stone', 15), mc('Iron', 8), mc('Ward Crystals', 6)] },
    },
    scholarly: {
        1: { gold: 200, materials: [mc('Timber', 6), mc('Stone', 4), mc('Rune Stones', 2)] },
        2: { gold: 400, materials: [mc('Timber', 10), mc('Stone', 6), mc('Rune Stones', 4)] },
        3: { gold: 700, materials: [mc('Timber', 15), mc('Stone', 10), mc('Rune Stones', 6)] },
    },
    containment: {
        1: { gold: 150, materials: [mc('Stone', 4), mc('Iron', 6), mc('Ward Crystals', 1)] },
        2: { gold: 300, materials: [mc('Stone', 6), mc('Iron', 10), mc('Ward Crystals', 2)] },
        3: { gold: 500, materials: [mc('Stone', 10), mc('Iron', 15), mc('Ward Crystals', 4)] },
    },
};

// ── Public API ──

/**
 * Get the full build/upgrade cost for a room type at a given level.
 * Returns null if the room type has no build profile (non-buildable rooms).
 * Level is clamped to max 3.
 */
export function getRoomBuildCost(roomType: string, level: number): RoomBuildCost | null {
    const profile = ROOM_BUILD_PROFILES[roomType];
    if (!profile) return null;

    const clampedLevel = Math.min(Math.max(level, 1), 3);
    return PROFILE_COSTS[profile][clampedLevel] || null;
}

/**
 * Check if the player can afford to build/upgrade a room.
 * Checks both gold and all required materials in inventory.
 */
export function canAffordRoom(
    roomType: string,
    level: number,
    currentGold: number,
    inventory: Record<string, InventoryItem>,
): boolean {
    const cost = getRoomBuildCost(roomType, level);
    if (!cost) return false;

    if (currentGold < cost.gold) return false;

    for (const mat of cost.materials) {
        const have = inventory[mat.itemName]?.quantity ?? 0;
        if (have < mat.quantity) return false;
    }

    return true;
}

/**
 * Get a list of missing materials for a room build/upgrade.
 * Returns an array of { itemName, have, need } for materials the player is short on.
 */
export function getMissingMaterials(
    roomType: string,
    level: number,
    inventory: Record<string, InventoryItem>,
): { itemName: string; have: number; need: number }[] {
    const cost = getRoomBuildCost(roomType, level);
    if (!cost) return [];

    const missing: { itemName: string; have: number; need: number }[] = [];
    for (const mat of cost.materials) {
        const have = inventory[mat.itemName]?.quantity ?? 0;
        if (have < mat.quantity) {
            missing.push({ itemName: mat.itemName, have, need: mat.quantity });
        }
    }
    return missing;
}

/**
 * Deduct the build cost from gold and inventory.
 * Returns the updated gold amount. Mutates inventory in place (reduces quantities).
 * Caller should verify canAffordRoom() before calling this.
 */
export function deductRoomCost(
    roomType: string,
    level: number,
    currentGold: number,
    inventory: Record<string, InventoryItem>,
): number {
    const cost = getRoomBuildCost(roomType, level);
    if (!cost) return currentGold;

    for (const mat of cost.materials) {
        const item = inventory[mat.itemName];
        if (item) {
            item.quantity -= mat.quantity;
            if (item.quantity <= 0) {
                delete inventory[mat.itemName];
            }
        }
    }

    return currentGold - cost.gold;
}

/**
 * Get the build profile name for a room type.
 */
export function getRoomBuildProfile(roomType: string): RoomBuildProfile | null {
    return ROOM_BUILD_PROFILES[roomType] || null;
}
