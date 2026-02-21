// ──────────────────────────────────────────
// ROLE SYSTEM
// ──────────────────────────────────────────

export interface RoleBuff {
    stat: string;
    value: number;
    label: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    roomType: string | null;
    buffs: RoleBuff[];
    traits: string[];
    icon: string;
    unique: boolean;
    color: string;
}

// ── Universal Roles — always available ──
export const UNIVERSAL_ROLES: Role[] = [
    {
        id: 'personal_attendant',
        name: 'Personal Attendant',
        description: 'Serves the master directly, tending to personal needs and errands.',
        roomType: null,
        buffs: [
            { stat: 'loyalty', value: 5, label: '+5 Loyalty' },
            { stat: 'comfort', value: 2, label: '+2 Comfort' },
        ],
        traits: ['Devoted'],
        icon: 'user-round',
        unique: true,
        color: '#d4a0e0',
    },
    {
        id: 'groundskeeper',
        name: 'Groundskeeper',
        description: 'Maintains the manor grounds, gardens, and perimeter security.',
        roomType: null,
        buffs: [
            { stat: 'comfort', value: 3, label: '+3 Comfort' },
            { stat: 'security', value: 2, label: '+2 Security' },
        ],
        traits: ['Vigilant'],
        icon: 'leaf',
        unique: true,
        color: '#7ab87a',
    },
];

// ── Room Roles — keyed by room type ──
export const ROOM_ROLES: Record<string, Role[]> = {
    kitchen: [
        {
            id: 'head_cook', name: 'Head Cook',
            description: 'Oversees meal preparation and keeps the kitchen running smoothly.',
            roomType: 'kitchen',
            buffs: [{ stat: 'morale', value: 4, label: '+4 Morale' }, { stat: 'comfort', value: 2, label: '+2 Comfort' }],
            traits: ['Nourishing'], icon: 'chef-hat', unique: true, color: '#e8a85d',
        },
        {
            id: 'scullery_hand', name: 'Scullery Hand',
            description: 'Handles the dirty work in the kitchen — washing, scrubbing, peeling.',
            roomType: 'kitchen',
            buffs: [{ stat: 'kitchen_efficiency', value: 3, label: '+3 Kitchen Efficiency' }],
            traits: ['Hardworking'], icon: 'paintbrush', unique: false, color: '#b8956a',
        },
    ],
    brewing: [{
        id: 'brewmaster', name: 'Brewmaster',
        description: 'An expert at preparing potions, tonics, and other mysterious concoctions.',
        roomType: 'brewing',
        buffs: [{ stat: 'potion_potency', value: 5, label: '+5 Potion Potency' }, { stat: 'reagents', value: 2, label: '+2 Reagent Yield' }],
        traits: ['Alchemist'], icon: 'flask', unique: true, color: '#7dd4a0',
    }],
    classroom: [{
        id: 'instructor', name: 'Instructor',
        description: 'Conducts lessons and training sessions for the household.',
        roomType: 'classroom',
        buffs: [{ stat: 'obedience', value: 3, label: '+3 Obedience (all)' }, { stat: 'skills', value: 2, label: '+2 Skill Training' }],
        traits: ['Educator'], icon: 'book-open', unique: true, color: '#7db8d4',
    }],
    quarters: [{
        id: 'quartermaster', name: 'Quartermaster',
        description: 'Manages servant housing, assignments, and daily routines.',
        roomType: 'quarters',
        buffs: [{ stat: 'servant_capacity', value: 5, label: '+5 Servant Capacity' }, { stat: 'obedience', value: 2, label: '+2 Obedience' }],
        traits: ['Organized'], icon: 'bed-double', unique: true, color: '#a8b8d0',
    }],
    ritual: [{
        id: 'ritual_keeper', name: 'Ritual Keeper',
        description: 'Maintains the ritual chamber and assists with dark ceremonies.',
        roomType: 'ritual',
        buffs: [{ stat: 'ritual_power', value: 4, label: '+4 Ritual Power' }, { stat: 'corruption', value: 3, label: '+3 Corruption' }],
        traits: ['Occultist'], icon: 'pentagram', unique: true, color: '#c46ac4',
    }],
    storage: [{
        id: 'stockkeeper', name: 'Stockkeeper',
        description: 'Keeps meticulous track of all stored goods and supplies.',
        roomType: 'storage',
        buffs: [{ stat: 'item_capacity', value: 10, label: '+10 Item Capacity' }, { stat: 'organization', value: 3, label: '+3 Organization' }],
        traits: ['Meticulous'], icon: 'package', unique: true, color: '#c4a86a',
    }],
    stable: [{
        id: 'stablehand', name: 'Stablehand',
        description: 'Tends to the creatures in the stable, ensuring they are fed and healthy.',
        roomType: 'stable',
        buffs: [{ stat: 'creature_care', value: 4, label: '+4 Creature Care' }, { stat: 'travel_speed', value: 2, label: '+2 Travel Speed' }],
        traits: ['Beast Friend'], icon: 'footprints', unique: false, color: '#8a6e4a',
    }],
    dungeon: [{
        id: 'warden', name: 'Warden',
        description: 'Oversees the dungeon, ensuring prisoners are contained and interrogations run smoothly.',
        roomType: 'dungeon',
        buffs: [{ stat: 'interrogation', value: 4, label: '+4 Interrogation' }, { stat: 'fear', value: 3, label: '+3 Fear' }],
        traits: ['Intimidating'], icon: 'link', unique: true, color: '#8a5a5a',
    }],
    cell: [{
        id: 'jailer', name: 'Jailer',
        description: 'Watches over the cells, wearing down captive resistance day by day.',
        roomType: 'cell',
        buffs: [{ stat: 'resistance_break', value: 3, label: '+3 Resistance Breakdown' }, { stat: 'fear', value: 2, label: '+2 Fear' }],
        traits: ['Relentless'], icon: 'lock', unique: false, color: '#7a6a8a',
    }],
    lounge: [{
        id: 'host', name: 'Host',
        description: 'Welcomes visitors and ensures everyone in the lounge feels at ease.',
        roomType: 'lounge',
        buffs: [{ stat: 'social', value: 4, label: '+4 Social' }, { stat: 'loyalty', value: 3, label: '+3 Loyalty' }],
        traits: ['Charming'], icon: 'armchair', unique: true, color: '#d4a07d',
    }],
};

/** Flat list of all roles (universal + room) for lookup */
export const ROLE_REGISTRY: Role[] = [
    ...UNIVERSAL_ROLES,
    ...Object.values(ROOM_ROLES).flat(),
];

/** Look up a role by id */
export function getRoleById(roleId: string): Role | undefined {
    return ROLE_REGISTRY.find(r => r.id === roleId);
}

/** Get all roles available for a given set of built room types (de-duplicated) */
export function getAvailableRoles(builtRoomTypes: string[]): Role[] {
    const roles: Role[] = [...UNIVERSAL_ROLES];
    const seen = new Set(roles.map(r => r.id));
    for (const roomType of builtRoomTypes) {
        const roomRoles = ROOM_ROLES[roomType];
        if (roomRoles) {
            for (const role of roomRoles) {
                if (!seen.has(role.id)) {
                    seen.add(role.id);
                    roles.push(role);
                }
            }
        }
    }
    return roles;
}

/** Default room types built in a fresh manor */
export const DEFAULT_BUILT_ROOM_TYPES = [
    'ritual', 'quarters', 'classroom', 'storage', 'kitchen',
    'lounge', 'brewing', 'stable', 'dungeon', 'cell',
];
