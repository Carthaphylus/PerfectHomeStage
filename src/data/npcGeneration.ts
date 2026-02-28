// ──────────────────────────────────────────
// NPC GENERATION SYSTEM
// Random NPC creation for the Woods capture minigame
// ──────────────────────────────────────────
import type { Hero } from './types';
import type { StatName } from './stats';

// ── Name Pools ──

const MALE_NAMES = [
    'Aldric', 'Bram', 'Caspian', 'Dorian', 'Edmund', 'Fendrel', 'Gareth', 'Hadwin',
    'Ivo', 'Jasper', 'Keiran', 'Lachlan', 'Marten', 'Nolen', 'Osric', 'Phelan',
    'Quillon', 'Roderic', 'Silas', 'Theron', 'Ulric', 'Varen', 'Wren', 'Yorick',
    'Zephyr', 'Ansel', 'Briar', 'Corwin', 'Deston', 'Elric', 'Finnian', 'Galen',
    'Harlan', 'Idris', 'Jorin', 'Kellan', 'Lorcan', 'Merrick', 'Niall', 'Orin',
    'Percival', 'Rune', 'Sterling', 'Tobias', 'Vale', 'Wystan',
];

const FEMALE_NAMES = [
    'Althea', 'Brenna', 'Celeste', 'Dahlia', 'Elara', 'Freya', 'Gwendolyn', 'Helena',
    'Isolde', 'Juniper', 'Kestrel', 'Liora', 'Maren', 'Nerys', 'Ophelia', 'Petra',
    'Quinn', 'Rosalind', 'Seraphina', 'Thalia', 'Una', 'Vespera', 'Willa', 'Yvaine',
    'Zinnia', 'Astrid', 'Bryony', 'Calla', 'Deirdre', 'Elowen', 'Fiora', 'Guinevere',
    'Hester', 'Iris', 'Jessamine', 'Katya', 'Lenora', 'Mirabel', 'Nessa', 'Orla',
    'Primrose', 'Rowena', 'Sylvana', 'Tamsin', 'Vesper', 'Wisteria',
];

// ── Species Pool ──

const SPECIES_POOL = [
    'Cat', 'Fox', 'Wolf', 'Rabbit', 'Deer', 'Otter', 'Raccoon', 'Mouse',
    'Badger', 'Hawk', 'Lynx', 'Bear', 'Hare', 'Ferret', 'Crow', 'Squirrel',
];

// ── Color Pool (for character accent color) ──

const COLOR_POOL = [
    '#c4943a', '#6a8caf', '#b84a4a', '#5a6abf', '#4a9e6a', '#e85d9a',
    '#8a7abf', '#bf7a4a', '#4abfbf', '#9e4a9e', '#6abf4a', '#bf4a6a',
    '#7a8abf', '#bfbf4a', '#4a6abf', '#bf6a4a', '#6a4abf', '#4abf6a',
];

// ── NPC Archetype System ──

export type CombatStyle = 'aggressive' | 'evasive' | 'defensive' | 'cunning' | 'panicked';

export interface NPCArchetype {
    id: string;
    className: string;
    icon: string;
    /** Weight for random selection (higher = more common) */
    weight: number;
    /** Possible combat styles this archetype can have */
    combatStyles: CombatStyle[];
    /** Trait pool — 3 will be picked at random */
    traitPool: string[];
    /** Stat range per stat — [min, max] */
    statRanges: Record<StatName, [number, number]>;
    /** Template for auto-generating details */
    detailTemplates: Record<string, string[]>;
    /** Description template — {name}, {species}, {gender}, {pronoun}, {possessive} are interpolated */
    descriptionTemplate: string;
    /** Short flavor line describing how they behave when cornered in the woods */
    captureFlavorTemplate: string;
    /** Difficulty modifier for the tracking phase (positive = harder) */
    trackingDifficulty: number;
    /** Difficulty modifier for the confrontation phase */
    confrontationDifficulty: number;
}

export const NPC_ARCHETYPES: NPCArchetype[] = [
    {
        id: 'wandering_knight',
        className: 'Knight',
        icon: 'shield',
        weight: 10,
        combatStyles: ['aggressive', 'defensive'],
        traitPool: ['Proud', 'Disciplined', 'Stubborn', 'Fearless', 'Loyal', 'Fierce'],
        statRanges: {
            prowess: [60, 85], expertise: [40, 60], attunement: [15, 35],
            presence: [50, 70], discipline: [55, 80], insight: [30, 50],
        },
        detailTemplates: {
            'Affiliation': ['Order of the Silver Dawn', 'The Crown\'s Guard', 'Independent freelancer', 'A fallen knightly order', 'House of the Iron Rose'],
            'Weakness': ['Rigid sense of honor', 'Overconfidence in combat', 'Cannot refuse a challenge', 'Easily goaded by insults to honor'],
            'Quirk': ['Polishes armor obsessively', 'Recites oaths under breath', 'Will not strike an unarmed foe', 'Salutes before fighting'],
        },
        descriptionTemplate: 'A {species} knight encountered wandering the forest trails, clad in worn but serviceable armor. {name} carries {pronoun_reflexive} with military bearing, hand never far from {possessive} blade. There is a weariness in {possessive} eyes that speaks of battles long past and loyalties tested.',
        captureFlavorTemplate: '{name} draws {possessive} sword and assumes a defensive stance, facing you with grim determination.',
        trackingDifficulty: 0,
        confrontationDifficulty: 5,
    },
    {
        id: 'village_farmer',
        className: 'Farmer',
        icon: 'wheat',
        weight: 12,
        combatStyles: ['panicked', 'defensive'],
        traitPool: ['Hardworking', 'Stubborn', 'Gentle', 'Resourceful', 'Humble', 'Simple'],
        statRanges: {
            prowess: [30, 55], expertise: [45, 70], attunement: [10, 25],
            presence: [25, 45], discipline: [40, 65], insight: [25, 45],
        },
        detailTemplates: {
            'Occupation': ['Wheat farmer', 'Herder', 'Orchardist', 'Beekeeper', 'Market gardener'],
            'Weakness': ['Trusting nature', 'Slow to react to threats', 'Homesick', 'Cannot read or write'],
            'Quirk': ['Talks to plants', 'Carries a lucky seed', 'Always knows the weather', 'Smells of hay'],
        },
        descriptionTemplate: 'A sturdy {species} farmer who wandered too far from the village fields. {name} wears simple homespun clothes and has the calloused hands of someone who works the earth. Despite {possessive} humble origins, there is a stubborn strength in {possessive} bearing.',
        captureFlavorTemplate: '{name} backs away with wide eyes, clutching a farming tool with trembling hands.',
        trackingDifficulty: -10,
        confrontationDifficulty: -10,
    },
    {
        id: 'traveling_merchant',
        className: 'Merchant',
        icon: 'coins',
        weight: 10,
        combatStyles: ['cunning', 'evasive'],
        traitPool: ['Witty', 'Cunning', 'Charismatic', 'Distrustful', 'Resourceful', 'Perceptive'],
        statRanges: {
            prowess: [20, 40], expertise: [50, 70], attunement: [20, 40],
            presence: [55, 75], discipline: [35, 55], insight: [50, 70],
        },
        detailTemplates: {
            'Trade': ['Spice trader', 'Gem dealer', 'Cloth merchant', 'Exotic goods peddler', 'Weapons dealer'],
            'Weakness': ['Greedy', 'Will bargain when cornered', 'Cowardly when outmatched', 'Values profit over loyalty'],
            'Quirk': ['Appraises everything by value', 'Always carries a weighted scale', 'Names prices under stress', 'Tries to bribe their way out'],
        },
        descriptionTemplate: 'A sharp-eyed {species} merchant found traveling the forest road between towns. {name} wears fine but practical traveling clothes and keeps a hand on a well-stocked satchel. {possessive_cap} eyes dart about constantly, evaluating threats and opportunities in equal measure.',
        captureFlavorTemplate: '"Now, now — let\'s not be hasty," {name} says, hands raised, already calculating an escape route.',
        trackingDifficulty: 5,
        confrontationDifficulty: 0,
    },
    {
        id: 'forest_hermit',
        className: 'Hermit',
        icon: 'tree-pine',
        weight: 8,
        combatStyles: ['evasive', 'cunning'],
        traitPool: ['Perceptive', 'Resourceful', 'Elusive', 'Stoic', 'Gentle', 'Distrustful'],
        statRanges: {
            prowess: [25, 45], expertise: [55, 75], attunement: [50, 70],
            presence: [20, 40], discipline: [45, 65], insight: [60, 80],
        },
        detailTemplates: {
            'Dwelling': ['A hollow tree', 'A cave network', 'A camouflaged lean-to', 'An abandoned watchtower', 'A treehouse'],
            'Weakness': ['Paranoid about outsiders', 'Fragile constitution', 'Talks to animals instead of people', 'Easily overwhelmed in confined spaces'],
            'Quirk': ['Covered in moss stains', 'Communicates in riddles', 'Accompanied by a tame bird', 'Moves without making sound'],
        },
        descriptionTemplate: 'A reclusive {species} hermit who has made the deep woods {possessive} home. {name} wears layers of bark-cloth and animal hide, blending into the forest like a living part of it. {possessive_cap} knowledge of the wild is encyclopedic, but {possessive} social skills have atrophied from years of solitude.',
        captureFlavorTemplate: '{name} melts into the undergrowth, moving with an unsettling familiarity through terrain that should be impassable.',
        trackingDifficulty: 15,
        confrontationDifficulty: 5,
    },
    {
        id: 'rogue_mercenary',
        className: 'Mercenary',
        icon: 'swords',
        weight: 10,
        combatStyles: ['aggressive', 'cunning'],
        traitPool: ['Fierce', 'Defiant', 'Agile', 'Restless', 'Distrustful', 'Impulsive'],
        statRanges: {
            prowess: [55, 80], expertise: [35, 55], attunement: [15, 30],
            presence: [45, 65], discipline: [25, 45], insight: [35, 55],
        },
        detailTemplates: {
            'Former Company': ['The Red Fang Battalion', 'Independent contract killer', 'Deserter from the King\'s Army', 'Exiled gladiator', 'Forest bandit turned sellsword'],
            'Weakness': ['Hot-headed', 'Easily distracted by gold', 'Fights dirty but predictably', 'Overestimates own skill'],
            'Quirk': ['Sharpens blade constantly', 'Counts coins when nervous', 'Bears a distinctive scar', 'Whistles before striking'],
        },
        descriptionTemplate: 'A battle-scarred {species} mercenary prowling the forest for work — or prey. {name} moves with the predatory confidence of someone accustomed to violence, weapons worn and well-used. {possessive_cap} eyes are cold and calculating, measuring you as either a threat or a payday.',
        captureFlavorTemplate: '{name} drops into a combat stance with practiced ease, blade drawn and teeth bared.',
        trackingDifficulty: 5,
        confrontationDifficulty: 10,
    },
    {
        id: 'runaway_noble',
        className: 'Noble',
        icon: 'crown',
        weight: 6,
        combatStyles: ['panicked', 'cunning'],
        traitPool: ['Proud', 'Charismatic', 'Stubborn', 'Ambitious', 'Perceptive', 'Witty'],
        statRanges: {
            prowess: [20, 40], expertise: [30, 50], attunement: [30, 50],
            presence: [65, 85], discipline: [40, 60], insight: [50, 70],
        },
        detailTemplates: {
            'House': ['House Ashford', 'House Valdris', 'The Thornwall Dynasty', 'An exiled royal line', 'Minor baronetcy'],
            'Weakness': ['Unused to hardship', 'Expects deference', 'Cannot fight', 'Relies on status that no longer applies'],
            'Quirk': ['Adjusts nonexistent finery', 'Introduces self with full title', 'Flinches at dirt', 'Commands with natural authority'],
        },
        descriptionTemplate: 'A {species} of clearly noble bearing, woefully out of place in the deep woods. {name} wears the tattered remnants of fine clothing, and despite the mud and bramble scratches, carries {pronoun_reflexive} with an unmistakable air of authority. Whatever drove {pronoun_object} from the safety of court must have been dire indeed.',
        captureFlavorTemplate: '"Do you know who I am?" {name} demands, voice trembling between authority and fear.',
        trackingDifficulty: -5,
        confrontationDifficulty: -5,
    },
    {
        id: 'wandering_pilgrim',
        className: 'Pilgrim',
        icon: 'footprints',
        weight: 8,
        combatStyles: ['defensive', 'panicked'],
        traitPool: ['Devout', 'Gentle', 'Compassionate', 'Selfless', 'Stubborn', 'Stoic'],
        statRanges: {
            prowess: [20, 40], expertise: [30, 50], attunement: [55, 75],
            presence: [40, 60], discipline: [50, 70], insight: [45, 65],
        },
        detailTemplates: {
            'Faith': ['Follower of the Moon Goddess', 'Seeker of the World-Tree', 'Devotee of the Healing Springs', 'Penitent of the Dawn Temple', 'Wandering mystic'],
            'Weakness': ['Pacifist by creed', 'Trusts in divine protection', 'Will not lie', 'Compassion can be exploited'],
            'Quirk': ['Recites prayers under breath', 'Carries a sacred relic', 'Fasts regularly', 'Blessing everything they touch'],
        },
        descriptionTemplate: 'A devout {species} pilgrim traveling the old forest paths between shrines. {name} wears simple robes marked with religious symbols, and carries little more than a walking staff and a prayer book. {possessive_cap} faith radiates from {pronoun_object} like warmth from a candle — sincere, gentle, and vulnerable.',
        captureFlavorTemplate: '{name} closes {possessive} eyes and begins to pray, trusting in a higher power that may not answer in time.',
        trackingDifficulty: -5,
        confrontationDifficulty: -5,
    },
    {
        id: 'traveling_minstrel',
        className: 'Minstrel',
        icon: 'music',
        weight: 8,
        combatStyles: ['evasive', 'cunning'],
        traitPool: ['Charismatic', 'Witty', 'Elusive', 'Perceptive', 'Impulsive', 'Cheerful'],
        statRanges: {
            prowess: [20, 40], expertise: [40, 60], attunement: [35, 55],
            presence: [60, 80], discipline: [25, 45], insight: [45, 65],
        },
        detailTemplates: {
            'Instrument': ['Lute', 'Fiddle', 'Harp', 'Flute', 'Hand drum'],
            'Weakness': ['Talks too much', 'Cannot resist an audience', 'Overly dramatic', 'Trades secrets for applause'],
            'Quirk': ['Narrates own actions', 'Hums when frightened', 'Composes songs about captors', 'Quotes poetry mid-conversation'],
        },
        descriptionTemplate: 'A lively {species} minstrel, instrument slung across {possessive} back, meandering through the woods in search of stories and songs. {name} has the bright eyes and quick tongue of a born performer, with a knack for turning any situation into material for {possessive} next ballad.',
        captureFlavorTemplate: '"This will make an *excellent* third act," {name} mutters, backing away while reaching for {possessive} instrument.',
        trackingDifficulty: 0,
        confrontationDifficulty: 0,
    },
    {
        id: 'hedge_witch',
        className: 'Hedge Witch',
        icon: 'sparkles',
        weight: 7,
        combatStyles: ['cunning', 'defensive'],
        traitPool: ['Perceptive', 'Resourceful', 'Cunning', 'Distrustful', 'Stoic', 'Territorial'],
        statRanges: {
            prowess: [20, 35], expertise: [50, 70], attunement: [65, 85],
            presence: [35, 55], discipline: [40, 60], insight: [55, 75],
        },
        detailTemplates: {
            'Specialty': ['Herbalism and potion-brewing', 'Curse-weaving', 'Fortune-telling', 'Spirit-binding', 'Weather-calling'],
            'Weakness': ['Physically frail', 'Mana-dependent', 'Paranoid about rival witches', 'Overprotective of familiar'],
            'Quirk': ['Eyes glow faintly in dim light', 'Surrounded by strange scents', 'Talks to a familiar only {pronoun} can see', 'Leaves no footprints'],
        },
        descriptionTemplate: 'A {species} witch of the wild variety, practicing old magic far from the academies and towers. {name} wears layers of herb-stained cloth and bone charms that click softly as {pronoun} moves. {possessive_cap} magic is raw and intuitive — less refined than yours, but potent in its own untamed way.',
        captureFlavorTemplate: '{name}\'s fingers begin tracing sigils in the air, wild magic crackling between {possessive} hands.',
        trackingDifficulty: 10,
        confrontationDifficulty: 10,
    },
    {
        id: 'forest_scout',
        className: 'Scout',
        icon: 'eye',
        weight: 9,
        combatStyles: ['evasive', 'aggressive'],
        traitPool: ['Agile', 'Vigilant', 'Perceptive', 'Resourceful', 'Elusive', 'Disciplined'],
        statRanges: {
            prowess: [40, 60], expertise: [45, 65], attunement: [20, 40],
            presence: [30, 50], discipline: [50, 70], insight: [55, 75],
        },
        detailTemplates: {
            'Allegiance': ['Town militia scout', 'Independent ranger', 'Hired pathfinder', 'Border patrol', 'Fugitive tracker'],
            'Weakness': ['Relies on distance', 'Panics in close quarters', 'Lone wolf mentality', 'Overestimates own stealth'],
            'Quirk': ['Marks trees with notches', 'Can mimic bird calls', 'Sleeps with eyes half-open', 'Speaks in clipped sentences'],
        },
        descriptionTemplate: 'A lithe {species} scout, moving through the woods with the grace of someone born to them. {name} wears muted greens and browns that blend with the foliage, a short bow slung across {possessive} back. {possessive_cap} sharp eyes miss nothing — every broken twig, every shifted leaf tells {pronoun_object} a story.',
        captureFlavorTemplate: '{name} darts behind a tree trunk and reaches for {possessive} bow, eyes scanning for an escape route.',
        trackingDifficulty: 10,
        confrontationDifficulty: 5,
    },
    {
        id: 'forest_bandit',
        className: 'Bandit',
        icon: 'flame',
        weight: 9,
        combatStyles: ['aggressive', 'evasive'],
        traitPool: ['Fierce', 'Defiant', 'Impulsive', 'Distrustful', 'Agile', 'Cunning'],
        statRanges: {
            prowess: [45, 65], expertise: [30, 50], attunement: [10, 25],
            presence: [40, 60], discipline: [20, 40], insight: [30, 50],
        },
        detailTemplates: {
            'Gang': ['Solo operator', 'Ex-member of the Forest Wolves', 'Operates a small crew', 'Highway robber', 'Poacher turned outlaw'],
            'Weakness': ['Reckless', 'Cannot resist easy marks', 'Deeply superstitious', 'Panics without backup'],
            'Quirk': ['Wears a mask even alone', 'Bites coins to check them', 'Keeps trophies from victims', 'Has a bounty poster of themselves'],
        },
        descriptionTemplate: 'A rough-and-ready {species} bandit lurking in the deep woods, preying on travelers foolish enough to take the forest paths alone. {name} wears a mishmash of stolen gear and has the hungry, alert look of someone who lives by the ambush. {possessive_cap} morals are flexible, but {possessive} survival instinct is razor-sharp.',
        captureFlavorTemplate: '{name} snarls and reaches for a hidden blade, eyes wild with cornered-animal aggression.',
        trackingDifficulty: 5,
        confrontationDifficulty: 5,
    },
    {
        id: 'herbalist',
        className: 'Herbalist',
        icon: 'leaf',
        weight: 8,
        combatStyles: ['panicked', 'evasive'],
        traitPool: ['Gentle', 'Resourceful', 'Compassionate', 'Perceptive', 'Cheerful', 'Selfless'],
        statRanges: {
            prowess: [20, 35], expertise: [55, 75], attunement: [40, 60],
            presence: [35, 55], discipline: [40, 60], insight: [50, 70],
        },
        detailTemplates: {
            'Specialty': ['Healing salves', 'Poisonous compounds', 'Tea blending', 'Aromatherapy', 'Dye-making'],
            'Weakness': ['Non-combatant', 'Allergic to own ingredients', 'Too curious for own safety', 'Terrible sense of direction'],
            'Quirk': ['Pockets full of dried leaves', 'Identifies every plant by name', 'Sniffs everything', 'Hands perpetually stained green'],
        },
        descriptionTemplate: 'A gentle {species} herbalist wandering the forest in search of rare ingredients. {name} carries a large basket overflowing with freshly picked plants, flowers, and fungi. {possessive_cap} knowledge of natural remedies is impressive, and {possessive} hands move with practiced delicacy among even the thorny specimens.',
        captureFlavorTemplate: '{name} stumbles backward, scattering herbs from {possessive} basket, eyes wide with fright.',
        trackingDifficulty: -10,
        confrontationDifficulty: -10,
    },
    {
        id: 'squire',
        className: 'Squire',
        icon: 'shield-half',
        weight: 7,
        combatStyles: ['defensive', 'panicked'],
        traitPool: ['Loyal', 'Disciplined', 'Humble', 'Stubborn', 'Fearless', 'Devoted'],
        statRanges: {
            prowess: [35, 55], expertise: [30, 50], attunement: [15, 30],
            presence: [35, 55], discipline: [50, 70], insight: [30, 50],
        },
        detailTemplates: {
            'Liege': ['A knight lost in battle', 'A lord of a distant province', 'Nobody — recently dismissed', 'A hedge knight of ill repute', 'Seeking a new master'],
            'Weakness': ['Young and inexperienced', 'Follows orders too readily', 'Easily intimidated by authority', 'Desperate to prove worth'],
            'Quirk': ['Calls everyone "sir" or "ma\'am"', 'Polishes everything', 'Carries a battered training sword', 'Stands at attention instinctively'],
        },
        descriptionTemplate: 'A young {species} squire, separated from {possessive} liege and lost in the woods. {name} wears ill-fitting borrowed armor and carries a practice sword with more determination than skill. Despite {possessive} youth, there is an earnest loyalty in {possessive} eyes that speaks of someone searching for a cause to serve.',
        captureFlavorTemplate: '{name} raises {possessive} practice sword with shaking hands, trying to remember the stance {possessive} master taught.',
        trackingDifficulty: -5,
        confrontationDifficulty: -5,
    },
    {
        id: 'blacksmith',
        className: 'Blacksmith',
        icon: 'hammer',
        weight: 8,
        combatStyles: ['aggressive', 'defensive'],
        traitPool: ['Hardworking', 'Stubborn', 'Fierce', 'Stoic', 'Proud', 'Resourceful'],
        statRanges: {
            prowess: [55, 75], expertise: [60, 80], attunement: [10, 25],
            presence: [35, 55], discipline: [50, 70], insight: [25, 45],
        },
        detailTemplates: {
            'Specialty': ['Weaponsmith', 'Armorsmith', 'Farrier', 'Locksmith', 'Jeweler-smith'],
            'Weakness': ['Slow and heavy', 'Stubborn to a fault', 'Poor at social situations', 'Overreliance on brute strength'],
            'Quirk': ['Arms like tree trunks', 'Smells of soot and iron', 'Taps surfaces to test material', 'Judges everything by craftsmanship'],
        },
        descriptionTemplate: 'A powerfully built {species} blacksmith, traveling between villages to ply {possessive} trade. {name} has the muscular frame and heat-scarred hands of someone who has spent years at the forge. {possessive_cap} heavy pack clinks with tools, and {pronoun} moves with the slow, purposeful gait of one who knows {possessive} own strength.',
        captureFlavorTemplate: '{name} hefts a heavy smithing hammer, planting {possessive} feet like an anvil — immovable and ready to endure.',
        trackingDifficulty: -5,
        confrontationDifficulty: 5,
    },
    {
        id: 'wandering_priest',
        className: 'Priest',
        icon: 'book-open',
        weight: 7,
        combatStyles: ['defensive', 'cunning'],
        traitPool: ['Devout', 'Compassionate', 'Perceptive', 'Stubborn', 'Charismatic', 'Stoic'],
        statRanges: {
            prowess: [20, 35], expertise: [35, 55], attunement: [55, 75],
            presence: [55, 75], discipline: [55, 75], insight: [50, 70],
        },
        detailTemplates: {
            'Order': ['Temple of the Golden Spiral', 'Brotherhood of Mercy', 'The Silent Order', 'Wandering preacher', 'Excommunicated cleric'],
            'Weakness': ['Physically weak', 'Relies on moral authority', 'Bound by religious oaths', 'Too principled to fight dirty'],
            'Quirk': ['Quotes scripture constantly', 'Carries a censer that never goes out', 'Blesses food before eating', 'Sees omens in everything'],
        },
        descriptionTemplate: 'A {species} priest of modest bearing, traveling the forest roads to bring spiritual comfort to isolated communities. {name} wears vestments that have seen better days, but {possessive} eyes burn with quiet conviction. {possessive_cap} faith is {possessive} armor — whether it will hold against your enchantments remains to be seen.',
        captureFlavorTemplate: '{name} raises a holy symbol, voice steady with conviction: "In the name of the light, stand down."',
        trackingDifficulty: -5,
        confrontationDifficulty: 0,
    },
    {
        id: 'hunter',
        className: 'Hunter',
        icon: 'target',
        weight: 9,
        combatStyles: ['evasive', 'aggressive'],
        traitPool: ['Vigilant', 'Agile', 'Resourceful', 'Stoic', 'Perceptive', 'Fierce'],
        statRanges: {
            prowess: [50, 70], expertise: [45, 65], attunement: [15, 30],
            presence: [30, 50], discipline: [40, 60], insight: [50, 70],
        },
        detailTemplates: {
            'Quarry': ['Big game specialist', 'Trapper and pelter', 'Monster hunter', 'Bounty hunter', 'Poacher'],
            'Weakness': ['Solitary by nature', 'Uncomfortable in crowds', 'Overreliant on ranged weapons', 'Distrustful of magic'],
            'Quirk': ['Wears trophies from kills', 'Can track anything', 'Speaks to prey before killing', 'Sets snares even while resting'],
        },
        descriptionTemplate: 'A weathered {species} hunter who knows the forest as intimately as their own heartbeat. {name} wears practical leathers and carries a well-used bow, every movement deliberate and efficient. {possessive_cap} eyes scan the canopy and undergrowth with predatory focus — the irony of becoming the hunted is not lost on {pronoun_object}.',
        captureFlavorTemplate: '{name} nocks an arrow with fluid precision, backing toward the tree line with measured steps.',
        trackingDifficulty: 10,
        confrontationDifficulty: 5,
    },
    {
        id: 'apothecary',
        className: 'Apothecary',
        icon: 'flask-round',
        weight: 7,
        combatStyles: ['cunning', 'evasive'],
        traitPool: ['Resourceful', 'Cunning', 'Perceptive', 'Distrustful', 'Meticulous', 'Witty'],
        statRanges: {
            prowess: [20, 35], expertise: [60, 80], attunement: [45, 65],
            presence: [35, 55], discipline: [45, 65], insight: [55, 75],
        },
        detailTemplates: {
            'Specialty': ['Antidotes and cures', 'Sleeping draughts', 'Performance enhancers', 'Hallucinogenics', 'Preservation compounds'],
            'Weakness': ['Physically fragile', 'Relies on preparations', 'Useless without ingredients', 'Overcomplicates simple problems'],
            'Quirk': ['Always mixing something', 'Taste-tests everything', 'Fingers stained with chemicals', 'Carries vials that clink ominously'],
        },
        descriptionTemplate: 'A {species} apothecary traveling the forest roads, gathering rare ingredients for {possessive} concoctions. {name} wears a heavy belt of pouches and vials, each one labeled in a meticulous hand. {possessive_cap} sharp mind and knowledge of chemistry make {pronoun_object} dangerous in unexpected ways — not all weapons are made of steel.',
        captureFlavorTemplate: '{name} reaches for a pouch of powder, eyes darting between you and the nearest exit.',
        trackingDifficulty: 0,
        confrontationDifficulty: 5,
    },
    {
        id: 'deserter',
        className: 'Deserter',
        icon: 'shield-off',
        weight: 7,
        combatStyles: ['evasive', 'panicked'],
        traitPool: ['Elusive', 'Distrustful', 'Restless', 'Agile', 'Impulsive', 'Resourceful'],
        statRanges: {
            prowess: [40, 60], expertise: [30, 50], attunement: [10, 25],
            presence: [25, 45], discipline: [15, 35], insight: [35, 55],
        },
        detailTemplates: {
            'Former Unit': ['The King\'s Third Regiment', 'Frontier garrison', 'Mercenary company', 'Town guard', 'Conscript levy'],
            'Weakness': ['Paranoid about being found', 'Exhausted from running', 'Morally compromised', 'Jumpy and irrational'],
            'Quirk': ['Flinches at loud noises', 'Hides face instinctively', 'Never sleeps in the same spot', 'Has discarded armor piece by piece'],
        },
        descriptionTemplate: 'A haggard {species} deserter, hiding in the woods to escape punishment for abandoning {possessive} post. {name} wears the remnants of a military uniform, stripped of insignia. {possessive_cap} eyes are hollow and jumpy — the look of someone who has been running for a long time and expects to run further still.',
        captureFlavorTemplate: '{name} freezes like a startled animal, then bolts — but there is nowhere left to run.',
        trackingDifficulty: 0,
        confrontationDifficulty: -5,
    },
    {
        id: 'traveling_bard',
        className: 'Bard',
        icon: 'music',
        weight: 7,
        combatStyles: ['cunning', 'evasive'],
        traitPool: ['Charismatic', 'Witty', 'Impulsive', 'Perceptive', 'Cheerful', 'Elusive'],
        statRanges: {
            prowess: [25, 40], expertise: [40, 60], attunement: [40, 60],
            presence: [60, 80], discipline: [20, 40], insight: [45, 65],
        },
        detailTemplates: {
            'Performance Style': ['Epic ballads', 'Satirical comedy', 'Dramatic monologues', 'Instrumental virtuosity', 'Storytelling and folklore'],
            'Weakness': ['All talk, no fight', 'Cannot resist performing', 'Easily flattered', 'Mouth faster than brain'],
            'Quirk': ['Speaks in rhyme when stressed', 'Has a song for every occasion', 'Winks at inappropriate moments', 'Carries a suspicious number of disguises'],
        },
        descriptionTemplate: 'A flamboyant {species} bard, traveling from tavern to tavern collecting stories and spreading songs. {name} wears colorful, slightly ridiculous traveling clothes and carries an instrument with the tenderness most reserve for children. {possessive_cap} silver tongue is both {possessive} greatest asset and the thing most likely to get {pronoun_object} into trouble.',
        captureFlavorTemplate: '"Before you do anything rash," {name} says with a disarming smile, "would you like to hear a song?"',
        trackingDifficulty: -5,
        confrontationDifficulty: 0,
    },
];

// ── NPC Generation Logic ──

/** Pronouns helper */
interface Pronouns {
    pronoun: string;           // he / she
    pronoun_object: string;    // him / her
    pronoun_reflexive: string; // himself / herself
    possessive: string;        // his / her
    possessive_cap: string;    // His / Her
}

function getPronouns(gender: 'Male' | 'Female'): Pronouns {
    if (gender === 'Male') {
        return { pronoun: 'he', pronoun_object: 'him', pronoun_reflexive: 'himself', possessive: 'his', possessive_cap: 'His' };
    }
    return { pronoun: 'she', pronoun_object: 'her', pronoun_reflexive: 'herself', possessive: 'her', possessive_cap: 'Her' };
}

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N unique random elements from an array */
function pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
}

/** Random int between min and max (inclusive) */
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Weighted random selection from archetypes */
function pickWeightedArchetype(): NPCArchetype {
    const totalWeight = NPC_ARCHETYPES.reduce((sum, a) => sum + a.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const archetype of NPC_ARCHETYPES) {
        roll -= archetype.weight;
        if (roll <= 0) return archetype;
    }
    return NPC_ARCHETYPES[NPC_ARCHETYPES.length - 1];
}

/** Interpolate template strings with NPC data */
function interpolate(template: string, data: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] ?? match);
}

/** Generated NPC data — everything needed to create a Hero entry + drive the minigame */
export interface GeneratedNPC {
    name: string;
    gender: 'Male' | 'Female';
    species: string;
    archetypeId: string;
    className: string;
    icon: string;
    color: string;
    combatStyle: CombatStyle;
    traits: string[];
    stats: Record<StatName, number>;
    details: Record<string, string>;
    description: string;
    captureFlavorText: string;
    trackingDifficulty: number;
    confrontationDifficulty: number;
}

/**
 * Generate a random NPC for the woods capture minigame.
 * Optionally pass existing hero/servant names to avoid name collisions.
 */
export function generateRandomNPC(existingNames?: string[]): GeneratedNPC {
    const archetype = pickWeightedArchetype();
    const gender: 'Male' | 'Female' = Math.random() < 0.5 ? 'Male' : 'Female';
    const namePool = gender === 'Male' ? MALE_NAMES : FEMALE_NAMES;

    // Avoid name collisions
    const usedNames = new Set(existingNames || []);
    let name = pick(namePool);
    let attempts = 0;
    while (usedNames.has(name) && attempts < 50) {
        name = pick(namePool);
        attempts++;
    }

    const species = pick(SPECIES_POOL);
    const pronouns = getPronouns(gender);
    const color = pick(COLOR_POOL);
    const combatStyle = pick(archetype.combatStyles);

    // Generate stats within archetype ranges
    const stats: Record<StatName, number> = {
        prowess: randInt(...archetype.statRanges.prowess),
        expertise: randInt(...archetype.statRanges.expertise),
        attunement: randInt(...archetype.statRanges.attunement),
        presence: randInt(...archetype.statRanges.presence),
        discipline: randInt(...archetype.statRanges.discipline),
        insight: randInt(...archetype.statRanges.insight),
    };

    // Pick traits
    const traits = pickN(archetype.traitPool, 3);

    // Generate details
    const details: Record<string, string> = {
        'Species': species,
        'Gender': gender === 'Male' ? '♂ Male' : '♀ Female',
        'Class': archetype.className,
    };
    for (const [key, options] of Object.entries(archetype.detailTemplates)) {
        details[key] = pick(options);
    }

    // Interpolate description
    const interpData: Record<string, string> = {
        name,
        species: species.toLowerCase(),
        gender: gender.toLowerCase(),
        ...pronouns,
    };
    const description = interpolate(archetype.descriptionTemplate, interpData);
    const captureFlavorText = interpolate(archetype.captureFlavorTemplate, interpData);

    return {
        name,
        gender,
        species,
        archetypeId: archetype.id,
        className: archetype.className,
        icon: archetype.icon,
        color,
        combatStyle,
        traits,
        stats,
        details,
        description,
        captureFlavorText,
        trackingDifficulty: archetype.trackingDifficulty,
        confrontationDifficulty: archetype.confrontationDifficulty,
    };
}

/** Convert a GeneratedNPC into a Hero entry for the game state */
export function npcToHero(npc: GeneratedNPC, avatar: string = ''): Hero {
    return {
        name: npc.name,
        status: 'captured',
        brainwashing: 0,
        heroClass: npc.className,
        avatar,
        color: npc.color,
        description: npc.description,
        traits: npc.traits,
        details: npc.details,
        stats: npc.stats,
        location: 'Woods',
    };
}

/** Get the combat style display name and description */
export function getCombatStyleInfo(style: CombatStyle): { label: string; description: string; strongAgainst: string } {
    switch (style) {
        case 'aggressive': return { label: 'Aggressive', description: 'Fights back with force when cornered.', strongAgainst: 'Enchant or Outwit' };
        case 'evasive': return { label: 'Evasive', description: 'Attempts to flee and dodge pursuit.', strongAgainst: 'Ambush or Set Trap' };
        case 'defensive': return { label: 'Defensive', description: 'Hunkers down and endures.', strongAgainst: 'Soothe or Intimidate' };
        case 'cunning': return { label: 'Cunning', description: 'Uses tricks and deception.', strongAgainst: 'Outwit or Enchant' };
        case 'panicked': return { label: 'Panicked', description: 'Reacts with fear and desperation.', strongAgainst: 'Intimidate or Soothe' };
    }
}
