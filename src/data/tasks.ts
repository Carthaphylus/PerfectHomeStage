// ──────────────────────────────────────────
// TASK SYSTEM — Registry & Helpers
// ──────────────────────────────────────────

import type { TaskDefinition, TaskCategory, Servant, Location } from './types';
import type { StatName } from './stats';

// ============================================================================
// Task Registry
// ============================================================================

export const TASK_REGISTRY: Record<string, TaskDefinition> = {

    // ────────────────────────────────────
    // ROOM-BASED TASKS
    // ────────────────────────────────────

    'prepare_feast': {
        id: 'prepare_feast',
        name: 'Prepare Feast',
        description: 'Cook a grand meal for the manor, boosting morale and comfort. A skilled cook can turn simple ingredients into something extraordinary.',
        category: 'room',
        icon: 'utensils',
        color: '#e8a85d',
        duration: 2,
        staminaCost: 40,
        roomType: 'kitchen',
        primaryStat: 'expertise',
        roleBonus: 'head_cook',
        requirements: [{ stat: 'expertise', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'nourishing', effect: 'bonus', magnitude: 15, description: 'Natural gift for nourishing food' },
            { traitKey: 'hardworking', effect: 'bonus', magnitude: 8, description: 'Puts in extra effort in the kitchen' },
            { traitKey: 'impulsive', effect: 'penalty', magnitude: 10, description: 'Rushes through preparation' },
            { traitKey: 'meticulous', effect: 'bonus', magnitude: 10, description: 'Careful, precise cooking' },
        ],
        rewards: [
            { type: 'household', stat: 'comfort', amount: 5, narrative: 'The feast lifts everyone\'s spirits' },
            { type: 'gold', amount: 10, narrative: 'Saved on outside provisions' },
        ],
    },

    'forage_ingredients': {
        id: 'forage_ingredients',
        name: 'Forage Ingredients',
        description: 'Scour the manor grounds and nearby areas for fresh herbs, mushrooms, and other culinary ingredients.',
        category: 'room',
        icon: 'leaf',
        color: '#7ab87a',
        duration: 1,
        staminaCost: 25,
        roomType: 'kitchen',
        primaryStat: 'insight',
        roleBonus: 'head_cook',
        requirements: [],
        traitModifiers: [
            { traitKey: 'perceptive', effect: 'bonus', magnitude: 12, description: 'Spots hidden ingredients' },
            { traitKey: 'resourceful', effect: 'bonus', magnitude: 10, description: 'Finds useful things everywhere' },
        ],
        rewards: [
            { type: 'item', itemName: 'Dreamcatcher Herb', amount: 3, narrative: 'Found some fragrant herbs growing wild' },
        ],
    },

    'brew_potions': {
        id: 'brew_potions',
        name: 'Brew Potions',
        description: 'Prepare a batch of potions in the brewing room. Requires alchemical knowledge and a steady hand.',
        category: 'room',
        icon: 'flask-conical',
        color: '#7dd4a0',
        duration: 3,
        staminaCost: 50,
        roomType: 'brewing',
        primaryStat: 'attunement',
        roleBonus: 'brewmaster',
        requirements: [{ stat: 'attunement', minimum: 35 }, { stat: 'expertise', minimum: 25 }],
        traitModifiers: [
            { traitKey: 'alchemist', effect: 'bonus', magnitude: 20, description: 'Expert reagent handling' },
            { traitKey: 'meticulous', effect: 'bonus', magnitude: 10, description: 'Precise measurements' },
            { traitKey: 'impulsive', effect: 'penalty', magnitude: 15, description: 'Careless mixing leads to waste' },
        ],
        rewards: [
            { type: 'item', itemName: 'Obedience Elixir', amount: 1, narrative: 'Successfully brewed a potent elixir' },
            { type: 'mana', amount: 5, narrative: 'Residual mana absorbed during brewing' },
        ],
    },

    'distill_reagents': {
        id: 'distill_reagents',
        name: 'Distill Reagents',
        description: 'Extract and purify raw materials into alchemical reagents for later use.',
        category: 'room',
        icon: 'droplets',
        color: '#78a8d0',
        duration: 2,
        staminaCost: 35,
        roomType: 'brewing',
        primaryStat: 'expertise',
        roleBonus: 'brewmaster',
        requirements: [{ stat: 'expertise', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'alchemist', effect: 'bonus', magnitude: 15, description: 'Skilled at extraction' },
            { traitKey: 'disciplined', effect: 'bonus', magnitude: 8, description: 'Patient, careful distillation' },
        ],
        rewards: [
            { type: 'item', itemName: 'Mana Crystal', amount: 2, narrative: 'Crystallized residual mana from the distillate' },
            { type: 'item', itemName: 'Spiral Incense', amount: 1, narrative: 'Produced a stick of fragrant incense' },
        ],
    },

    'conduct_lesson': {
        id: 'conduct_lesson',
        name: 'Conduct Lesson',
        description: 'Teach a class to the manor\'s servants, improving their discipline and obedience through structured instruction.',
        category: 'room',
        icon: 'book-open',
        color: '#a888c8',
        duration: 2,
        staminaCost: 35,
        roomType: 'classroom',
        primaryStat: 'insight',
        roleBonus: 'instructor',
        requirements: [{ stat: 'insight', minimum: 40 }, { stat: 'presence', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'educator', effect: 'bonus', magnitude: 20, description: 'Natural teaching ability' },
            { traitKey: 'charismatic', effect: 'bonus', magnitude: 10, description: 'Engaging teaching style' },
            { traitKey: 'stoic', effect: 'penalty', magnitude: 8, description: 'Stiff delivery alienates students' },
        ],
        rewards: [
            { type: 'household', stat: 'obedience', amount: 4, narrative: 'The lesson reinforced proper conduct' },
        ],
    },

    'study_texts': {
        id: 'study_texts',
        name: 'Study Texts',
        description: 'Pore over arcane manuscripts and manor records, expanding knowledge and uncovering useful information.',
        category: 'room',
        icon: 'scroll-text',
        color: '#c8b878',
        duration: 2,
        staminaCost: 30,
        roomType: 'classroom',
        primaryStat: 'insight',
        roleBonus: 'instructor',
        requirements: [{ stat: 'insight', minimum: 25 }],
        traitModifiers: [
            { traitKey: 'perceptive', effect: 'bonus', magnitude: 12, description: 'Catches details others miss' },
            { traitKey: 'disciplined', effect: 'bonus', magnitude: 8, description: 'Focused study pays off' },
            { traitKey: 'restless', effect: 'penalty', magnitude: 12, description: 'Can\'t sit still long enough to study' },
        ],
        rewards: [
            { type: 'mana', amount: 8, narrative: 'Discovered arcane insights in the texts' },
        ],
    },

    'perform_ritual': {
        id: 'perform_ritual',
        name: 'Perform Ritual',
        description: 'Conduct a dark ritual in the ritual chamber, channeling forbidden energies for power. Dangerous but rewarding.',
        category: 'room',
        icon: 'flame',
        color: '#c85a5a',
        duration: 3,
        staminaCost: 55,
        roomType: 'ritual',
        primaryStat: 'attunement',
        roleBonus: 'ritual_keeper',
        manaCost: 15,
        requirements: [{ stat: 'attunement', minimum: 50 }, { stat: 'discipline', minimum: 35 }],
        traitModifiers: [
            { traitKey: 'occultist', effect: 'bonus', magnitude: 20, description: 'Deep arcane knowledge' },
            { traitKey: 'devout', effect: 'penalty', magnitude: 15, description: 'Faith conflicts with dark magic' },
            { traitKey: 'fearless', effect: 'bonus', magnitude: 10, description: 'Unafraid of the ritual\'s dangers' },
        ],
        rewards: [
            { type: 'mana', amount: 25, narrative: 'The ritual unleashes a surge of power' },
            { type: 'item', itemName: 'Memory Fragment', amount: 1, narrative: 'A fragment of memory condensed from the ritual' },
        ],
    },

    'channel_corruption': {
        id: 'channel_corruption',
        name: 'Channel Corruption',
        description: 'Absorb ambient dark energy from the ritual chamber, converting it into usable mana. Slow but steady.',
        category: 'room',
        icon: 'zap',
        color: '#8c5a8c',
        duration: 1,
        staminaCost: 25,
        roomType: 'ritual',
        primaryStat: 'attunement',
        roleBonus: 'ritual_keeper',
        requirements: [{ stat: 'attunement', minimum: 25 }],
        traitModifiers: [
            { traitKey: 'occultist', effect: 'bonus', magnitude: 12, description: 'Attunes to dark energy easily' },
            { traitKey: 'stoic', effect: 'bonus', magnitude: 8, description: 'Endures the corrupting influence' },
        ],
        rewards: [
            { type: 'mana', amount: 12, narrative: 'Dark mana flows through the chamber' },
        ],
    },

    'interrogate_captive': {
        id: 'interrogate_captive',
        name: 'Interrogate Captive',
        description: 'Use psychological pressure and intimidation to break down a captive\'s resolve in the dungeon.',
        category: 'room',
        icon: 'shield-alert',
        color: '#a65050',
        duration: 2,
        staminaCost: 40,
        roomType: 'dungeon',
        primaryStat: 'presence',
        roleBonus: 'warden',
        requirements: [{ stat: 'presence', minimum: 40 }],
        traitModifiers: [
            { traitKey: 'intimidating', effect: 'bonus', magnitude: 20, description: 'Projects terrifying authority' },
            { traitKey: 'fierce', effect: 'bonus', magnitude: 10, description: 'Intensity breaks resistance' },
            { traitKey: 'compassionate', effect: 'penalty', magnitude: 15, description: 'Too soft-hearted for interrogation' },
            { traitKey: 'gentle', effect: 'penalty', magnitude: 12, description: 'Lacks the edge to be threatening' },
        ],
        rewards: [
            { type: 'household', stat: 'obedience', amount: 3, narrative: 'The captive\'s broken will ripples through the manor' },
        ],
    },

    'guard_prisoners': {
        id: 'guard_prisoners',
        name: 'Guard Prisoners',
        description: 'Stand watch over the dungeon cells, ensuring no captive escapes and order is maintained.',
        category: 'room',
        icon: 'shield',
        color: '#6a6a8c',
        duration: 1,
        staminaCost: 20,
        roomType: 'cell',
        primaryStat: 'discipline',
        roleBonus: 'jailer',
        requirements: [{ stat: 'discipline', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'vigilant', effect: 'bonus', magnitude: 15, description: 'Always alert to trouble' },
            { traitKey: 'relentless', effect: 'bonus', magnitude: 10, description: 'Never lets up surveillance' },
            { traitKey: 'restless', effect: 'penalty', magnitude: 10, description: 'Gets bored standing watch' },
        ],
        rewards: [
            { type: 'household', stat: 'obedience', amount: 2, narrative: 'The dungeon runs smoothly under watch' },
        ],
    },

    'tend_creatures': {
        id: 'tend_creatures',
        name: 'Tend Creatures',
        description: 'Feed, groom, and care for the creatures in the stable. Well-tended beasts are happier and more useful.',
        category: 'room',
        icon: 'paw-print',
        color: '#b8956a',
        duration: 1,
        staminaCost: 25,
        roomType: 'stable',
        primaryStat: 'expertise',
        roleBonus: 'stablehand',
        requirements: [],
        traitModifiers: [
            { traitKey: 'beast friend', effect: 'bonus', magnitude: 20, description: 'Natural bond with animals' },
            { traitKey: 'gentle', effect: 'bonus', magnitude: 10, description: 'Calms creatures with a soft touch' },
            { traitKey: 'fierce', effect: 'penalty', magnitude: 8, description: 'Frightens nervous animals' },
        ],
        rewards: [
            { type: 'household', stat: 'comfort', amount: 2, narrative: 'The creatures are content and well-cared for' },
        ],
    },

    'organize_stockpile': {
        id: 'organize_stockpile',
        name: 'Organize Stockpile',
        description: 'Sort and catalogue the storage room\'s contents. An organized stockpile means fewer wasted supplies.',
        category: 'room',
        icon: 'package',
        color: '#8c7d64',
        duration: 1,
        staminaCost: 20,
        roomType: 'storage',
        primaryStat: 'discipline',
        roleBonus: 'stockkeeper',
        requirements: [],
        traitModifiers: [
            { traitKey: 'organized', effect: 'bonus', magnitude: 18, description: 'Everything in its right place' },
            { traitKey: 'meticulous', effect: 'bonus', magnitude: 12, description: 'Thorough cataloguing' },
            { traitKey: 'impulsive', effect: 'penalty', magnitude: 10, description: 'Shoves things in random places' },
        ],
        rewards: [
            { type: 'gold', amount: 15, narrative: 'Found misplaced valuables during organization' },
        ],
    },

    'host_gathering': {
        id: 'host_gathering',
        name: 'Host Gathering',
        description: 'Welcome manor residents to the lounge for socializing. A good gathering strengthens bonds and boosts loyalty.',
        category: 'room',
        icon: 'wine',
        color: '#d4a0e0',
        duration: 2,
        staminaCost: 35,
        roomType: 'lounge',
        primaryStat: 'presence',
        roleBonus: 'host',
        requirements: [{ stat: 'presence', minimum: 35 }],
        traitModifiers: [
            { traitKey: 'charming', effect: 'bonus', magnitude: 18, description: 'Everyone feels welcome' },
            { traitKey: 'charismatic', effect: 'bonus', magnitude: 12, description: 'Life of the party' },
            { traitKey: 'witty', effect: 'bonus', magnitude: 8, description: 'Sharp conversation keeps things lively' },
            { traitKey: 'stoic', effect: 'penalty', magnitude: 10, description: 'Too reserved for social hosting' },
        ],
        rewards: [
            { type: 'household', stat: 'comfort', amount: 4, narrative: 'The gathering lifts everyone\'s mood' },
        ],
    },

    // ────────────────────────────────────
    // EXPLORATION TASKS
    // ────────────────────────────────────

    'town_errand': {
        id: 'town_errand',
        name: 'Town Errand',
        description: 'Send a servant to town to purchase supplies, gather intelligence, and handle business. A charismatic servant gets better deals.',
        category: 'exploration',
        icon: 'shopping-bag',
        color: '#c8b878',
        duration: 2,
        staminaCost: 40,
        location: 'Town',
        primaryStat: 'presence',
        requirements: [{ stat: 'presence', minimum: 20 }],
        traitModifiers: [
            { traitKey: 'charismatic', effect: 'bonus', magnitude: 15, description: 'Charms better deals from merchants' },
            { traitKey: 'cunning', effect: 'bonus', magnitude: 12, description: 'Negotiates shrewdly' },
            { traitKey: 'distrustful', effect: 'penalty', magnitude: 8, description: 'Alienates potential contacts' },
        ],
        rewards: [
            { type: 'gold', amount: 25, narrative: 'Secured favorable trade deals in town' },
            { type: 'item', itemName: 'Dreamcatcher Herb', amount: 2, narrative: 'Picked up herbs at the market' },
        ],
    },

    'forest_expedition': {
        id: 'forest_expedition',
        name: 'Forest Expedition',
        description: 'Venture into the dark woods to gather rare herbs, scout hidden paths, and uncover forest secrets.',
        category: 'exploration',
        icon: 'trees',
        color: '#5a8a5a',
        duration: 3,
        staminaCost: 55,
        location: 'Woods',
        primaryStat: 'prowess',
        requirements: [{ stat: 'prowess', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'perceptive', effect: 'bonus', magnitude: 15, description: 'Spots hidden trails and rare plants' },
            { traitKey: 'agile', effect: 'bonus', magnitude: 10, description: 'Navigates dense undergrowth easily' },
            { traitKey: 'fearless', effect: 'bonus', magnitude: 8, description: 'Ventures deep without hesitation' },
            { traitKey: 'restless', effect: 'bonus', magnitude: 5, description: 'Covers more ground' },
        ],
        rewards: [
            { type: 'item', itemName: 'Dreamcatcher Herb', amount: 5, narrative: 'Found a patch of rare herbs deep in the forest' },
            { type: 'item', itemName: 'Mana Crystal', amount: 1, narrative: 'Discovered a crystal formation near a stream' },
        ],
    },

    'ruin_delve': {
        id: 'ruin_delve',
        name: 'Ruin Delve',
        description: 'Explore the ancient ruins for forgotten artifacts, mana fragments, and relics of a lost civilization.',
        category: 'exploration',
        icon: 'compass',
        color: '#a88c50',
        duration: 4,
        staminaCost: 70,
        location: 'Ruins',
        primaryStat: 'prowess',
        requirements: [{ stat: 'prowess', minimum: 40 }, { stat: 'insight', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'fearless', effect: 'bonus', magnitude: 15, description: 'Delves into dangerous depths' },
            { traitKey: 'resourceful', effect: 'bonus', magnitude: 12, description: 'Improvises through obstacles' },
            { traitKey: 'perceptive', effect: 'bonus', magnitude: 10, description: 'Spots hidden passages and traps' },
        ],
        rewards: [
            { type: 'item', itemName: 'Memory Fragment', amount: 1, narrative: 'Unearthed a glowing relic from the ruins' },
            { type: 'gold', amount: 40, narrative: 'Found a cache of ancient coins' },
            { type: 'mana', amount: 10, narrative: 'Residual mana lingers in the ancient stones' },
        ],
    },

    'circus_reconnaissance': {
        id: 'circus_reconnaissance',
        name: 'Circus Reconnaissance',
        description: 'Infiltrate the circus to gather intelligence, observe performers, and search for potential recruits or hidden threats.',
        category: 'exploration',
        icon: 'drama',
        color: '#d4607a',
        duration: 2,
        staminaCost: 35,
        location: 'Circus',
        primaryStat: 'insight',
        requirements: [{ stat: 'insight', minimum: 30 }, { stat: 'presence', minimum: 25 }],
        traitModifiers: [
            { traitKey: 'cunning', effect: 'bonus', magnitude: 15, description: 'Blends in and extracts secrets' },
            { traitKey: 'elusive', effect: 'bonus', magnitude: 12, description: 'Avoids detection effortlessly' },
            { traitKey: 'witty', effect: 'bonus', magnitude: 8, description: 'Engages performers in revealing talk' },
            { traitKey: 'proud', effect: 'penalty', magnitude: 10, description: 'Stands out instead of blending in' },
        ],
        rewards: [
            { type: 'gold', amount: 20, narrative: 'Picked a few pockets during the show' },
            { type: 'mana', amount: 5, narrative: 'Sensed arcane undercurrents in the performance' },
        ],
    },

    // ────────────────────────────────────
    // TRAINING TASKS
    // ────────────────────────────────────

    'combat_drill': {
        id: 'combat_drill',
        name: 'Combat Drill',
        description: 'Rigorous physical training to sharpen combat skills in the servant quarters. Builds strength, endurance, and discipline through repeated drills.',
        category: 'training',
        icon: 'swords',
        color: '#d4807a',
        duration: 2,
        staminaCost: 45,
        roomType: 'quarters',
        primaryStat: 'prowess',
        roleBonus: 'quartermaster',
        requirements: [],
        traitModifiers: [
            { traitKey: 'fierce', effect: 'bonus', magnitude: 15, description: 'Thrives in physical challenge' },
            { traitKey: 'disciplined', effect: 'bonus', magnitude: 12, description: 'Follows drills precisely' },
            { traitKey: 'restless', effect: 'bonus', magnitude: 5, description: 'Enjoys the activity' },
            { traitKey: 'gentle', effect: 'penalty', magnitude: 10, description: 'Holds back during sparring' },
        ],
        rewards: [
            { type: 'stat', stat: 'prowess', amount: 3, narrative: 'Muscles honed through practice' },
            { type: 'stat', stat: 'discipline', amount: 1, narrative: 'The routine builds focus' },
        ],
    },

    'arcane_study': {
        id: 'arcane_study',
        name: 'Arcane Study',
        description: 'Meditative study of magical principles and arcane theory in the classroom. Deepens attunement and broadens magical expertise.',
        category: 'training',
        icon: 'sparkles',
        color: '#a888c8',
        duration: 3,
        staminaCost: 40,
        roomType: 'classroom',
        primaryStat: 'attunement',
        roleBonus: 'instructor',
        requirements: [{ stat: 'attunement', minimum: 15 }],
        traitModifiers: [
            { traitKey: 'occultist', effect: 'bonus', magnitude: 15, description: 'Innate affinity for magic' },
            { traitKey: 'disciplined', effect: 'bonus', magnitude: 10, description: 'Focuses deeply on study' },
            { traitKey: 'impulsive', effect: 'penalty', magnitude: 12, description: 'Lacks patience for slow study' },
            { traitKey: 'perceptive', effect: 'bonus', magnitude: 8, description: 'Catches subtle arcane patterns' },
        ],
        rewards: [
            { type: 'stat', stat: 'attunement', amount: 3, narrative: 'Deepened connection to the arcane' },
            { type: 'stat', stat: 'expertise', amount: 1, narrative: 'Theoretical understanding improves technique' },
        ],
    },

    'social_practice': {
        id: 'social_practice',
        name: 'Social Practice',
        description: 'Practice social skills through etiquette drills, role-playing conversations, and presence exercises in the lounge.',
        category: 'training',
        icon: 'crown',
        color: '#c8b878',
        duration: 2,
        staminaCost: 30,
        roomType: 'lounge',
        primaryStat: 'presence',
        roleBonus: 'host',
        requirements: [],
        traitModifiers: [
            { traitKey: 'charismatic', effect: 'bonus', magnitude: 12, description: 'Natural social talent' },
            { traitKey: 'witty', effect: 'bonus', magnitude: 10, description: 'Quick repartee improves fast' },
            { traitKey: 'charming', effect: 'bonus', magnitude: 8, description: 'Already halfway there' },
            { traitKey: 'stoic', effect: 'penalty', magnitude: 8, description: 'Struggles with emotional expressiveness' },
            { traitKey: 'distrustful', effect: 'penalty', magnitude: 10, description: 'Difficulty opening up' },
        ],
        rewards: [
            { type: 'stat', stat: 'presence', amount: 3, narrative: 'Growing more confident in social settings' },
            { type: 'stat', stat: 'insight', amount: 1, narrative: 'Learning to read others better' },
        ],
    },

    'focus_training': {
        id: 'focus_training',
        name: 'Focus Training',
        description: 'Intensive mental exercises in the classroom to sharpen concentration, willpower, and self-discipline. Meditation and obedience drills.',
        category: 'training',
        icon: 'target',
        color: '#60b890',
        duration: 2,
        staminaCost: 35,
        roomType: 'classroom',
        primaryStat: 'discipline',
        roleBonus: 'instructor',
        requirements: [],
        traitModifiers: [
            { traitKey: 'disciplined', effect: 'bonus', magnitude: 15, description: 'Already self-controlled' },
            { traitKey: 'stoic', effect: 'bonus', magnitude: 10, description: 'Mental fortitude aids training' },
            { traitKey: 'impulsive', effect: 'penalty', magnitude: 15, description: 'Constantly fights the urge to move' },
            { traitKey: 'restless', effect: 'penalty', magnitude: 10, description: 'Can\'t sit still' },
        ],
        rewards: [
            { type: 'stat', stat: 'discipline', amount: 3, narrative: 'Mind sharpened like a blade' },
        ],
    },

    // ────────────────────────────────────
    // UPKEEP TASKS
    // ────────────────────────────────────

    'manor_maintenance': {
        id: 'manor_maintenance',
        name: 'Manor Maintenance',
        description: 'General upkeep of the manor — cleaning, repairs, gardening, and pest control. Keeps everything running smoothly.',
        category: 'upkeep',
        icon: 'building',
        color: '#8c7d64',
        duration: 1,
        staminaCost: 25,
        primaryStat: 'discipline',
        requirements: [],
        traitModifiers: [
            { traitKey: 'hardworking', effect: 'bonus', magnitude: 15, description: 'Tireless worker' },
            { traitKey: 'organized', effect: 'bonus', magnitude: 12, description: 'Efficient maintenance routine' },
            { traitKey: 'meticulous', effect: 'bonus', magnitude: 8, description: 'Catches every detail' },
            { traitKey: 'restless', effect: 'penalty', magnitude: 5, description: 'Skips boring tasks' },
        ],
        rewards: [
            { type: 'household', stat: 'comfort', amount: 3, narrative: 'The manor gleams with care' },
        ],
    },

    'patrol_grounds': {
        id: 'patrol_grounds',
        name: 'Patrol Grounds',
        description: 'Walk the manor perimeter and patrol the grounds. Deters intruders and maintains order among the household.',
        category: 'upkeep',
        icon: 'eye',
        color: '#6a8caf',
        duration: 1,
        staminaCost: 25,
        primaryStat: 'prowess',
        roleBonus: 'groundskeeper',
        requirements: [{ stat: 'prowess', minimum: 20 }],
        traitModifiers: [
            { traitKey: 'vigilant', effect: 'bonus', magnitude: 18, description: 'Nothing escapes their watch' },
            { traitKey: 'territorial', effect: 'bonus', magnitude: 12, description: 'Fiercely protects the domain' },
            { traitKey: 'fearless', effect: 'bonus', magnitude: 8, description: 'Investigates every disturbance' },
        ],
        rewards: [
            { type: 'household', stat: 'obedience', amount: 2, narrative: 'Security presence keeps everyone in line' },
            { type: 'household', stat: 'comfort', amount: 1, narrative: 'The manor feels safe' },
        ],
    },

    'collect_tribute': {
        id: 'collect_tribute',
        name: 'Collect Tribute',
        description: 'Gather taxes, rent, and contributions from the manor\'s residents and nearby dependents.',
        category: 'upkeep',
        icon: 'coins',
        color: '#d8a060',
        duration: 2,
        staminaCost: 35,
        primaryStat: 'presence',
        requirements: [{ stat: 'presence', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'intimidating', effect: 'bonus', magnitude: 15, description: 'Nobody dares withhold payment' },
            { traitKey: 'charismatic', effect: 'bonus', magnitude: 10, description: 'People pay willingly' },
            { traitKey: 'compassionate', effect: 'penalty', magnitude: 12, description: 'Lets people off too easily' },
        ],
        rewards: [
            { type: 'gold', amount: 35, narrative: 'Tribute collected from the household' },
        ],
    },

    // ────────────────────────────────────
    // PERSONAL TASKS
    // ────────────────────────────────────

    'attend_mistress': {
        id: 'attend_mistress',
        name: 'Attend to Mistress',
        description: 'Serve the mistress directly — manage her schedule, prepare her chambers, and anticipate her needs. Deepens the bond of devotion.',
        category: 'personal',
        icon: 'heart',
        color: '#e85d9a',
        duration: 1,
        staminaCost: 20,
        primaryStat: 'discipline',
        roleBonus: 'personal_attendant',
        requirements: [{ stat: 'discipline', minimum: 30 }],
        traitModifiers: [
            { traitKey: 'devoted', effect: 'bonus', magnitude: 20, description: 'Lives to serve' },
            { traitKey: 'loyal', effect: 'bonus', magnitude: 12, description: 'Unwavering dedication' },
            { traitKey: 'meticulous', effect: 'bonus', magnitude: 8, description: 'Anticipates every need' },
            { traitKey: 'defiant', effect: 'penalty', magnitude: 15, description: 'Struggles with subservience' },
        ],
        rewards: [
            { type: 'stat', stat: 'love', amount: 5, narrative: 'The bond between servant and mistress deepens' },
            { type: 'stat', stat: 'obedience', amount: 2, narrative: 'Service reinforces devotion' },
        ],
    },

    'meditate': {
        id: 'meditate',
        name: 'Meditate',
        description: 'Quiet reflection and self-improvement. Calms the mind, improves focus, and builds inner strength.',
        category: 'personal',
        icon: 'moon',
        color: '#78a8d0',
        duration: 1,
        staminaCost: 10,
        primaryStat: 'discipline',
        requirements: [],
        traitModifiers: [
            { traitKey: 'stoic', effect: 'bonus', magnitude: 15, description: 'Finds peace in stillness' },
            { traitKey: 'disciplined', effect: 'bonus', magnitude: 10, description: 'Deep, focused meditation' },
            { traitKey: 'devout', effect: 'bonus', magnitude: 8, description: 'Spiritual connection aids reflection' },
            { traitKey: 'impulsive', effect: 'penalty', magnitude: 12, description: 'Mind wanders constantly' },
            { traitKey: 'restless', effect: 'penalty', magnitude: 10, description: 'Cannot stay still' },
        ],
        rewards: [
            { type: 'stat', stat: 'discipline', amount: 2, narrative: 'Mind grows calmer and sharper' },
            { type: 'stat', stat: 'insight', amount: 1, narrative: 'Self-awareness deepens through reflection' },
        ],
    },

    'personal_errand': {
        id: 'personal_errand',
        name: 'Personal Errand',
        description: 'Handle a private matter — visit someone in town, retrieve a personal item, or settle an old score.',
        category: 'personal',
        icon: 'map-pin',
        color: '#b4a58c',
        duration: 1,
        staminaCost: 20,
        primaryStat: 'insight',
        requirements: [],
        traitModifiers: [
            { traitKey: 'resourceful', effect: 'bonus', magnitude: 12, description: 'Gets things done efficiently' },
            { traitKey: 'cunning', effect: 'bonus', magnitude: 8, description: 'Handles complications smoothly' },
        ],
        rewards: [
            { type: 'stat', stat: 'love', amount: 3, narrative: 'Grateful for the freedom to handle personal matters' },
        ],
    },
};

// ============================================================================
// Helper Functions
// ============================================================================

/** Get a task definition by ID */
export function getTaskById(id: string): TaskDefinition | undefined {
    return TASK_REGISTRY[id];
}

/** Pretty label for a task category */
export function getTaskCategoryLabel(category: TaskCategory): string {
    const labels: Record<TaskCategory, string> = {
        room: 'Room Tasks',
        exploration: 'Exploration',
        training: 'Training',
        upkeep: 'Manor Upkeep',
        personal: 'Personal',
    };
    return labels[category];
}

/** Icon for task category headers */
export function getTaskCategoryIcon(category: TaskCategory): string {
    const icons: Record<TaskCategory, string> = {
        room: 'building',
        exploration: 'compass',
        training: 'dumbbell',
        upkeep: 'wrench',
        personal: 'user',
    };
    return icons[category];
}

/** Pretty room type label (reusable) */
export function getRoomTypeLabel(roomType: string): string {
    const labels: Record<string, string> = {
        kitchen: 'Kitchen', brewing: 'Brewing Room', classroom: 'Classroom',
        quarters: 'Servant Quarters', ritual: 'Ritual Room', storage: 'Storage',
        stable: 'Stable', dungeon: 'Dungeon', cell: 'Cell', lounge: 'Lounge',
    };
    return labels[roomType] || roomType;
}

/**
 * Get all tasks available to a specific servant,
 * filtered by discovered locations only.
 * Room tasks for unbuilt rooms are still included (shown as locked in UI).
 */
export function getAvailableTasksForServant(
    servant: Servant,
    builtRoomTypes: string[],
    discoveredLocations: Location[],
): TaskDefinition[] {
    return Object.values(TASK_REGISTRY).filter(task => {
        // Exploration tasks: must have the location discovered
        if (task.location && !discoveredLocations.includes(task.location)) {
            return false;
        }
        return true;
    });
}

/**
 * Check if a task's required room is built.
 * Returns true if the task has no room requirement, or the room is built.
 */
export function isTaskRoomBuilt(task: TaskDefinition, builtRoomTypes: string[]): boolean {
    if (!task.roomType) return true;
    return builtRoomTypes.includes(task.roomType);
}

/**
 * Check if a servant meets all stat requirements for a task.
 * Returns { met: boolean, failing: { stat, required, current }[] }
 */
export function checkTaskRequirements(
    servant: Servant,
    task: TaskDefinition,
): { met: boolean; failing: { stat: StatName; required: number; current: number }[] } {
    const failing: { stat: StatName; required: number; current: number }[] = [];
    for (const req of task.requirements) {
        const current = servant.stats[req.stat] ?? 0;
        if (current < req.minimum) {
            failing.push({ stat: req.stat, required: req.minimum, current });
        }
    }
    return { met: failing.length === 0, failing };
}

/**
 * Get the trait modifiers that actually apply to a servant for a specific task.
 * Returns only the modifiers whose traits the servant possesses (case-insensitive match).
 */
export function getApplicableTraitModifiers(
    servant: Servant,
    task: TaskDefinition,
): { modifier: typeof task.traitModifiers[0]; traitKey: string }[] {
    const allTraits = [...(servant.traits || []), ...(servant.archetypeTraits || [])];
    const lowerTraits = allTraits.map(t => t.toLowerCase());

    return task.traitModifiers
        .filter(mod => lowerTraits.includes(mod.traitKey.toLowerCase()))
        .map(mod => ({ modifier: mod, traitKey: mod.traitKey }));
}
