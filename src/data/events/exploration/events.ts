// ──────────────────────────────────────────
// EXPLORATION SYSTEM — Location Activities & Events
// ──────────────────────────────────────────
import type { Location, EventDefinition, EventShopPhase } from '../../types';

// ── Location Explore Data ──

/** A clickable activity at an exploration location */
export interface LocationActivity {
    id: string;
    label: string;
    icon: string;
    tooltip: string;
    eventId: string;
}

/** Hub configuration for a single explorable location */
export interface LocationExploreData {
    location: Location;
    name: string;
    intro: string;
    activities: LocationActivity[];
}

// ── Location Hub Definitions ──

export const EXPLORE_DATA: Partial<Record<Location, LocationExploreData>> = {
    Town: {
        location: 'Town',
        name: 'Town',
        intro: '*You arrive at the bustling town square. Merchants hawk their wares, townsfolk hurry about their errands, and the scent of fresh bread mingles with wood-smoke in the air. Somewhere amid the stalls, you can hear a bright, squeaky voice advertising "Pip\'s Emporium of Wonders and Sundries!" — a familiar haunt for anyone with gold to spend and discretion to spare.*',
        activities: [
            {
                id: 'town_market',
                label: 'Visit Pip\'s Emporium',
                icon: 'shopping-bag',
                tooltip: 'Browse the mouse merchant\'s stall for goods and gossip.',
                eventId: 'explore_town_market',
            },
            {
                id: 'town_streets',
                label: 'Explore the Streets',
                icon: 'footprints',
                tooltip: 'Wander the back-alleys and side streets.',
                eventId: 'explore_town_streets',
            },
            {
                id: 'town_tavern',
                label: 'Visit the Tavern',
                icon: 'wine',
                tooltip: 'Rest and listen for rumors at the local inn.',
                eventId: 'explore_town_tavern',
            },
        ],
    },
    Woods: {
        location: 'Woods',
        name: 'The Woods',
        intro: '*Ancient trees tower overhead, their canopy filtering the sunlight into dappled patterns on the mossy ground. The air is thick with the scent of earth and wildflowers. Strange sounds echo from deeper within — this forest holds many secrets for those willing to look.*',
        activities: [
            {
                id: 'woods_herbs',
                label: 'Search for Herbs',
                icon: 'leaf',
                tooltip: 'Forage for useful alchemical ingredients.',
                eventId: 'explore_woods_herbs',
            },
            {
                id: 'woods_trail',
                label: 'Follow a Trail',
                icon: 'compass',
                tooltip: 'A faint trail leads deeper into the woods.',
                eventId: 'explore_woods_trail',
            },
            {
                id: 'woods_hunt',
                label: 'Hunt',
                icon: 'target',
                tooltip: 'Track game through the underbrush.',
                eventId: 'explore_woods_hunt',
            },
            {
                id: 'woods_capture',
                label: 'Stalk Prey',
                icon: 'crosshair',
                tooltip: 'Hunt for a wanderer to capture for your household.',
                eventId: 'explore_woods_capture',
            },
        ],
    },
    Ruins: {
        location: 'Ruins',
        name: 'Ancient Ruins',
        intro: '*Crumbling stone arches and weathered pillars stretch before you, remnants of a civilization long forgotten. Arcane symbols still faintly glow on some surfaces, and the air hums with residual magical energy. Who knows what treasures — or dangers — lie buried here.*',
        activities: [
            {
                id: 'ruins_excavate',
                label: 'Excavate',
                icon: 'hammer',
                tooltip: 'Dig through the rubble for buried treasures.',
                eventId: 'explore_ruins_excavate',
            },
            {
                id: 'ruins_inscriptions',
                label: 'Study Inscriptions',
                icon: 'book-open',
                tooltip: 'Decipher the ancient writings on the walls.',
                eventId: 'explore_ruins_inscriptions',
            },
            {
                id: 'ruins_delve',
                label: 'Delve Deeper',
                icon: 'chevron-down',
                tooltip: 'Venture into the unexplored lower levels.',
                eventId: 'explore_ruins_delve',
            },
        ],
    },
    Circus: {
        location: 'Circus',
        name: 'Circus',
        intro: '*Colorful tents and flickering lanterns greet you as you approach the traveling circus. The sound of laughter and applause echoes through the grounds, but there is something unsettling beneath the revelry — a glint of knowing mischief in the performers\' eyes.*',
        activities: [
            {
                id: 'circus_show',
                label: 'Watch a Performance',
                icon: 'drama',
                tooltip: 'Enjoy the main show under the big top.',
                eventId: 'explore_circus_show',
            },
            {
                id: 'circus_stalls',
                label: 'Browse the Stalls',
                icon: 'shopping-bag',
                tooltip: 'See what curiosities the vendors have for sale.',
                eventId: 'explore_circus_stalls',
            },
            {
                id: 'circus_backstage',
                label: 'Investigate Backstage',
                icon: 'eye',
                tooltip: 'Sneak behind the curtain to see what they\'re hiding.',
                eventId: 'explore_circus_backstage',
            },
        ],
    },
};

// ══════════════════════════════════════════
// EXPLORE EVENT DEFINITIONS
// ══════════════════════════════════════════

// ── TOWN EVENTS ──

// ── Shop inventory for Pip's Emporium ──
const PIP_SHOP: EventShopPhase = {
    shopName: "Pip's Emporium",
    shopkeeperName: 'Pip',
    shopkeeperGreeting: '"Find what you need? I\'ve got more where that came from — just say the word! Squeak!"',
    categories: ['Supplies', 'Reagents', 'Pip\'s Finds'],
    exitStep: 'depart',
    items: [
        // ─ Supplies — practical frontier goods ─
        { itemName: 'Traveler\'s Rations',    price: 5,   quantity: 2, category: 'Supplies' },
        { itemName: 'Healing Salve',          price: 8,   quantity: 1, category: 'Supplies' },
        { itemName: 'Mousefolk Cheese Wheel',  price: 3,   quantity: 1, category: 'Supplies' },
        { itemName: 'Stamina Draught',        price: 12,  quantity: 1, category: 'Supplies' },
        { itemName: 'Antidote',               price: 10,  quantity: 1, category: 'Supplies' },
        { itemName: 'Binding Cord',           price: 6,   quantity: 2, category: 'Supplies' },
        { itemName: 'Binding Circle Chalk',   price: 4,   quantity: 3, category: 'Supplies' },
        // ─ Reagents — crafting herbs & minerals ─
        { itemName: 'Dreamcatcher Herb',      price: 8,   quantity: 3, category: 'Reagents' },
        { itemName: 'Honeysuckle Blossoms',   price: 6,   quantity: 3, category: 'Reagents' },
        { itemName: 'Moonflower Petals',      price: 10,  quantity: 2, category: 'Reagents' },
        { itemName: 'Frostwhisper Moss',      price: 9,   quantity: 2, category: 'Reagents' },
        { itemName: 'Rose Quartz Dust',       price: 6,   quantity: 3, category: 'Reagents' },
        { itemName: 'Mana Crystal',           price: 15,  quantity: 1, category: 'Reagents' },
        { itemName: 'Moonstone Splinter',     price: 12,  quantity: 1, category: 'Reagents' },
        // ─ Pip's Finds — rare things Pip "acquired" ─
        { itemName: 'Silver Pocket Mirror',   price: 20,  quantity: 1, category: 'Pip\'s Finds', stock: 1 },
        { itemName: 'Enchanted Candle',       price: 10,  quantity: 1, category: 'Pip\'s Finds' },
        { itemName: 'Map Fragment',           price: 12,  quantity: 1, category: 'Pip\'s Finds', stock: 1 },
        { itemName: 'Bottled Starlight',      price: 22,  quantity: 1, category: 'Pip\'s Finds', stock: 3 },
        { itemName: 'Suggestive Perfume',     price: 15,  quantity: 1, category: 'Pip\'s Finds', stock: 2 },
        { itemName: 'Luck Charm',             price: 14,  quantity: 1, category: 'Pip\'s Finds' },
    ],
};

const EXPLORE_TOWN_MARKET: EventDefinition = {
    id: 'explore_town_market',
    name: 'Pip\'s Emporium',
    description: 'Visit Pip the mouse merchant\'s bustling market stall.',
    icon: 'shopping-bag',
    category: 'exploration',
    startStep: 'arrive',
    steps: {
        // ── STEP 1: Arrival & Introduction ──
        arrive: {
            id: 'arrive',
            text: '*The market square is a riot of color and noise — barkers competing for attention, the clatter of coins, the sizzle of street food. You weave through the crowd, scanning the stalls for anything useful.*\n\n*A high, bright voice cuts through the din like a bell.*\n\n"Over here, over here! Yes, you — the one with the very impressive aura! Don\'t pretend you can\'t hear me, I\'ve got *excellent* projection for someone my size!"',
            nextStep: 'pip_intro',
        },
        // ── STEP 2: Pip's Introduction ──
        pip_intro: {
            id: 'pip_intro',
            text: '*You turn to find the source: a small stall draped in bright patchwork cloth, overflowing with goods of every description. Behind the counter — balanced on a tall stool with her legs dangling — sits a mousefolk girl no taller than your elbow. She has round, expressive ears that twitch with each new customer who passes, warm brown eyes, and a long pink tail that curls around the leg of a nearby shelf for balance.*\n\n*She\'s dressed in a patchwork vest covered in tiny pockets, each one bulging with trinkets and coin. A pair of oversized brass goggles sits perched atop her head, pushing back a wild mane of chestnut-brown hair.*\n\n"Welcome, welcome to Pip\'s Emporium of Wonders and Sundries! I\'m Pip — purveyor of fine goods, rare curiosities, and..." *she glances left and right conspiratorially* "...items of a more *specialized* nature, if you catch my meaning. Squeak squeak."',
            nextStep: 'shop_hub',
        },
        // ── STEP 3: Shop UI ──
        shop_hub: {
            id: 'shop_hub',
            text: '*Pip hops down from her stool and scurries along the counter with surprising agility, her tail trailing behind her like a rudder. She gestures grandly at her wares with both tiny hands.*\n\n"So! What catches your eye? Take your time — Pip doesn\'t rush a customer. Well, unless it\'s raining. Then Pip rushes everyone."',
            shopPhase: PIP_SHOP,
        },
        // ── STEP 4: Departure ──
        depart: {
            id: 'depart',
            text: '*You step away from the stall, your new purchases safely stowed. Behind you, Pip\'s voice rises above the market noise once again, already hawking at the next passerby.*\n\n"You there! The tall one! Yes, you look like someone who could use a good cheese! And possibly a potion of mind control! Pip has BOTH!"\n\n*You hear a distant, scandalized gasp from someone in the crowd, followed by Pip\'s cheerful damage control: "Kidding! Obviously kidding! ...Unless you\'re interested?"*\n\n*You shake your head and smile. That mouse is going to get herself arrested one of these days. But she does sell quality goods.*',
            isEnding: true,
        },
    },
};

const EXPLORE_TOWN_STREETS: EventDefinition = {
    id: 'explore_town_streets',
    name: 'The Streets',
    description: 'Wander through the town\'s winding streets.',
    icon: 'footprints',
    category: 'exploration',
    startStep: 'wander',
    steps: {
        wander: {
            id: 'wander',
            text: '*You drift through the narrow back-streets of town. Laundry hangs between buildings overhead, and children chase each other through the puddles. In a quiet alley, something glints beneath a loose cobblestone.*',
            choices: [
                {
                    id: 'investigate',
                    label: 'Pry up the Stone',
                    tooltip: 'See what\'s hidden beneath.',
                    nextStep: 'found_stash',
                },
                {
                    id: 'ignore',
                    label: 'Keep Walking',
                    tooltip: 'Not worth the trouble.',
                    nextStep: 'keep_walking',
                },
            ],
        },
        found_stash: {
            id: 'found_stash',
            text: '*You glance around to make sure nobody is watching, then lever the stone aside. Beneath it lies a small leather pouch — someone\'s hidden savings, now yours.*\n\n*You pocket the coins and replace the stone. Easy money.*',
            effects: [{ type: 'modify_gold', value: 25 }],
            isEnding: true,
        },
        keep_walking: {
            id: 'keep_walking',
            text: '*You continue your walk, enjoying the relative anonymity of the crowded streets. Near the town gate, a merchant offers you a sample of an herbal tea — not bad. The warmth settles your nerves and sharpens your focus.*\n\n*A pleasant enough outing.*',
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
    },
};

const EXPLORE_TOWN_TAVERN: EventDefinition = {
    id: 'explore_town_tavern',
    name: 'The Tavern',
    description: 'Relax and listen for rumors at the tavern.',
    icon: 'wine',
    category: 'exploration',
    startStep: 'enter',
    steps: {
        enter: {
            id: 'enter',
            text: '*The tavern is warm and dimly lit, filled with the hum of conversation and the clink of tankards. You settle into a corner booth and order an ale. The barmaid lingers, glancing at you with idle curiosity.*\n\n"You look like the sort who\'d be interested in a bit of gossip," *she says with a sly smile.*',
            choices: [
                {
                    id: 'listen',
                    label: 'Ask for Rumors',
                    tooltip: 'What\'s the word around town?',
                    nextStep: 'rumors',
                },
                {
                    id: 'drink',
                    label: 'Just Drink',
                    tooltip: 'Enjoy the ale in peace.',
                    nextStep: 'relax',
                },
            ],
        },
        rumors: {
            id: 'rumors',
            text: '*The barmaid leans in conspiratorially.*\n\n"Word is, an old wizard\'s stash was found out in the ruins — mana crystals, enchanted gewgaws, the lot. Adventurers have been pouring in trying to claim it. Might be worth a visit if you\'re quick about it."\n\n*Useful information. You tip her a coin and file it away for later.*',
            effects: [
                { type: 'modify_gold', value: -5 },
                { type: 'modify_skill', target: 'wisdom', value: 1 },
            ],
            isEnding: true,
        },
        relax: {
            id: 'relax',
            text: '*You lean back and nurse your ale, letting the ambient warmth of the tavern wash over you. There\'s something restorative about simply sitting and breathing. The tension drains from your shoulders.*\n\n*When you finally leave, you feel refreshed — your magical reserves subtly replenished.*',
            effects: [{ type: 'custom', target: 'mana', value: 15 }],
            isEnding: true,
        },
    },
};

// ── WOODS EVENTS ──

const EXPLORE_WOODS_HERBS: EventDefinition = {
    id: 'explore_woods_herbs',
    name: 'Herb Gathering',
    description: 'Search the forest floor for alchemical ingredients.',
    icon: 'leaf',
    category: 'exploration',
    startStep: 'search',
    steps: {
        search: {
            id: 'search',
            text: '*You kneel among the ferns and mossy roots, scanning the undergrowth with a practiced eye. The woods are generous to those who know what to look for — and you do.*\n\n*After a short while, you spot several promising specimens growing in a sunlit clearing.*',
            nextStep: 'gather',
        },
        gather: {
            id: 'gather',
            text: '*You carefully harvest the herbs, wrapping them in a cloth. Dreamcatcher Herb — perfect for brewing potions and burning as incense during conditioning sessions. A good haul.*',
            effects: [{ type: 'add_item', target: 'Dreamcatcher Herb', value: 3 }],
            isEnding: true,
        },
    },
};

const EXPLORE_WOODS_TRAIL: EventDefinition = {
    id: 'explore_woods_trail',
    name: 'The Hidden Trail',
    description: 'Follow a mysterious trail deeper into the woods.',
    icon: 'compass',
    category: 'exploration',
    startStep: 'discover',
    steps: {
        discover: {
            id: 'discover',
            text: '*A narrow, overgrown trail winds away from the main path, marked by subtle scratches on the bark of an old oak. Someone — or something — has been using this route regularly.*',
            choices: [
                {
                    id: 'follow',
                    label: 'Follow the Trail',
                    tooltip: 'See where it leads. Could be dangerous.',
                    nextStep: 'deeper',
                },
                {
                    id: 'turn_back',
                    label: 'Turn Back',
                    tooltip: 'Better safe than sorry.',
                    nextStep: 'retreat',
                },
            ],
        },
        deeper: {
            id: 'deeper',
            text: '*The trail leads to a small, hidden glade. In the center sits a crumbling stone shrine, overgrown with vines. On the altar — a shimmering mana crystal, pulsing faintly with residual energy.*\n\n*You carefully extract it. The forest seems to hum with approval — or perhaps warning.*',
            effects: [
                { type: 'add_item', target: 'Mana Crystal', value: 1 },
                { type: 'modify_gold', value: 10 },
            ],
            isEnding: true,
        },
        retreat: {
            id: 'retreat',
            text: '*Discretion being the better part of valor, you decide not to follow the unknown trail. On the way back, you spot a patch of useful herbs growing beside the path — not a wasted trip after all.*',
            effects: [{ type: 'add_item', target: 'Dreamcatcher Herb', value: 1 }],
            isEnding: true,
        },
    },
};

const EXPLORE_WOODS_HUNT: EventDefinition = {
    id: 'explore_woods_hunt',
    name: 'The Hunt',
    description: 'Track game through the forest underbrush.',
    icon: 'target',
    category: 'exploration',
    startStep: 'track',
    steps: {
        track: {
            id: 'track',
            text: '*You spot fresh tracks in the soft earth — deer, by the look of them. The prints are recent, and the wind is in your favor. A skilled tracker could catch up.*',
            choices: [
                {
                    id: 'pursue',
                    label: 'Pursue the Game',
                    tooltip: 'Follow the tracks. Requires speed and patience.',
                    nextStep: 'pursue',
                    skillCheck: {
                        skill: 'speed',
                        difficulty: 60,
                        successStep: 'hunt_success',
                        failureStep: 'hunt_fail',
                    },
                },
                {
                    id: 'set_trap',
                    label: 'Set a Snare',
                    tooltip: 'Lay a trap and wait. Slower but more reliable.',
                    nextStep: 'snare_result',
                },
            ],
        },
        hunt_success: {
            id: 'hunt_success',
            text: '*You move through the undergrowth with surprising grace, closing the distance on your quarry. A swift, clean take-down — the deer never saw you coming.*\n\n*You bring the carcass to a nearby tradesman\'s hut and exchange it for a tidy sum of coin.*',
            effects: [{ type: 'modify_gold', value: 30 }],
            isEnding: true,
        },
        hunt_fail: {
            id: 'hunt_fail',
            text: '*A twig snaps underfoot and the deer bolts before you can close the distance. You give chase, but the forest is the deer\'s domain, not yours.*\n\n*Winded and empty-handed, you trudge back. At least the exercise was bracing.*',
            effects: [{ type: 'modify_skill', target: 'speed', value: 1 }],
            isEnding: true,
        },
        pursue: {
            id: 'pursue',
            text: '*You set off through the trees, following the tracks...*',
            nextStep: 'hunt_success',
        },
        snare_result: {
            id: 'snare_result',
            text: '*You fashion a simple snare from vine and cord, placing it along the trail. After a patient wait, you\'re rewarded — a plump rabbit, tangled in the line.*\n\n*You trade it at the woodsman\'s hut for a few coins. Modest, but reliable.*',
            effects: [{ type: 'modify_gold', value: 15 }],
            isEnding: true,
        },
    },
};

// ── RUINS EVENTS ──

const EXPLORE_RUINS_EXCAVATE: EventDefinition = {
    id: 'explore_ruins_excavate',
    name: 'Excavation',
    description: 'Dig through the rubble for buried treasures.',
    icon: 'hammer',
    category: 'exploration',
    startStep: 'dig',
    steps: {
        dig: {
            id: 'dig',
            text: '*You pick your way through the collapsed stonework, shifting rubble and brushing away centuries of dust. Most of it is worthless debris — but then your fingers close around something solid.*\n\n*Two objects, half-buried in the dirt. You can only carry one safely.*',
            choices: [
                {
                    id: 'crystal',
                    label: 'Take the Crystal',
                    tooltip: 'A mana crystal, still faintly glowing.',
                    nextStep: 'take_crystal',
                },
                {
                    id: 'fragment',
                    label: 'Take the Fragment',
                    tooltip: 'A strange, iridescent shard that pulses with memory.',
                    nextStep: 'take_fragment',
                },
            ],
        },
        take_crystal: {
            id: 'take_crystal',
            text: '*You carefully extract the mana crystal from the earth. It hums warmly in your palm, its energy still potent despite the ages it has spent buried here.*\n\n*A fine find for any practitioner of the arcane arts.*',
            effects: [{ type: 'add_item', target: 'Mana Crystal', value: 1 }],
            isEnding: true,
        },
        take_fragment: {
            id: 'take_fragment',
            text: '*You pry the iridescent shard free. The moment your skin touches it, a flash of alien memory surges through you — a glimpse of a ritual, an ancient name, a spiral of golden light. Then silence.*\n\n*A memory fragment. These are rare and valuable, useful for deepening a servant\'s conditioning... or restoring a captive\'s free will.*',
            effects: [{ type: 'add_item', target: 'Memory Fragment', value: 1 }],
            isEnding: true,
        },
    },
};

const EXPLORE_RUINS_INSCRIPTIONS: EventDefinition = {
    id: 'explore_ruins_inscriptions',
    name: 'Ancient Inscriptions',
    description: 'Study the faded writings on the ruin walls.',
    icon: 'book-open',
    category: 'exploration',
    startStep: 'study',
    steps: {
        study: {
            id: 'study',
            text: '*You trace your fingers over the carved glyphs, deciphering their meaning through a combination of arcane knowledge and intuition. The inscriptions describe binding rituals used by the civilization that once stood here — practitioners of a magic not unlike your own.*\n\n*As you read, the symbols seem to glow faintly, and understanding flows into you. Your attunement to arcane forces sharpens.*',
            nextStep: 'insight',
        },
        insight: {
            id: 'insight',
            text: '*You spend a considerable time absorbing the ancient knowledge. By the time you step away from the wall, the sun has shifted significantly. But you can feel the difference — a deeper well of mana, a sharper instinct for enchantment.*\n\n*Time well spent.*',
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'custom', target: 'mana', value: 20 },
            ],
            isEnding: true,
        },
    },
};

const EXPLORE_RUINS_DELVE: EventDefinition = {
    id: 'explore_ruins_delve',
    name: 'Delve Deeper',
    description: 'Venture into the unexplored lower levels.',
    icon: 'chevron-down',
    category: 'exploration',
    startStep: 'entrance',
    steps: {
        entrance: {
            id: 'entrance',
            text: '*A staircase descends into darkness. The air rising from below is cool and carries the scent of damp stone and something faintly metallic. The glow of arcane wards flickers along the walls — whatever lies below was meant to be kept sealed.*',
            choices: [
                {
                    id: 'descend',
                    label: 'Descend',
                    tooltip: 'Steel yourself and go deeper. Requires power.',
                    nextStep: 'descend',
                    skillCheck: {
                        skill: 'power',
                        difficulty: 65,
                        successStep: 'delve_success',
                        failureStep: 'delve_fail',
                    },
                },
                {
                    id: 'stay',
                    label: 'Stay Above',
                    tooltip: 'The upper levels have plenty to offer.',
                    nextStep: 'stay_above',
                },
            ],
        },
        descend: {
            id: 'descend',
            text: '*You begin the descent...*',
            nextStep: 'delve_success',
        },
        delve_success: {
            id: 'delve_success',
            text: '*You press through the wards, feeling them crackle against your aura like static. The lower chamber opens into a vaulted hall, remarkably well-preserved. In the center, atop a stone pedestal, rests a collection of artifacts — gold, crystals, and a finely crafted pendant.*\n\n*You fill your pockets. The ancients were generous, if involuntarily.*',
            effects: [
                { type: 'modify_gold', value: 40 },
                { type: 'add_item', target: 'Mana Crystal', value: 2 },
            ],
            isEnding: true,
        },
        delve_fail: {
            id: 'delve_fail',
            text: '*The wards flare as you attempt to pass, sending a painful jolt through your body. You stumble back up the stairs, singed and smarting. Whatever is down there, your current power isn\'t enough to breach the protections.*\n\n*At least you learned something about the nature of these wards.*',
            effects: [{ type: 'modify_skill', target: 'power', value: 1 }],
            isEnding: true,
        },
        stay_above: {
            id: 'stay_above',
            text: '*Wisdom dictates caution. You explore the upper levels instead, finding a small cache of coins that some previous explorer overlooked. Not the motherload, but you\'ll live to delve another day.*',
            effects: [{ type: 'modify_gold', value: 15 }],
            isEnding: true,
        },
    },
};

// ── CIRCUS EVENTS ──

// ── Shop inventory for Madame Vesper's Curiosities ──
const VESPER_SHOP: EventShopPhase = {
    shopName: "Vesper's Curiosities",
    shopkeeperName: 'Madame Vesper',
    shopkeeperGreeting: '"Every item here has a story, dear. The question is — which story do *you* need?"',
    categories: ['Curiosities', 'Elixirs', 'Arcane Trinkets'],
    exitStep: 'depart',
    items: [
        // ─ Curiosities — carnival novelties & conditioning atmospherics ─
        { itemName: 'Fate-Woven Card',          price: 10,  quantity: 1, category: 'Curiosities' },
        { itemName: 'Fortune Bones',             price: 14,  quantity: 1, category: 'Curiosities' },
        { itemName: 'Stage Smoke Bomb',          price: 5,   quantity: 3, category: 'Curiosities' },
        { itemName: 'Trance Taffy',              price: 3,   quantity: 5, category: 'Curiosities' },
        { itemName: 'Carnival Prize Voucher',    price: 2,   quantity: 1, category: 'Curiosities' },
        { itemName: 'Illusionist\'s Dust',       price: 8,   quantity: 2, category: 'Curiosities' },
        // ─ Elixirs — potions, wines, and consumable mind-alterers ─
        { itemName: 'Hypnotist\'s Honey Wine',   price: 15,  quantity: 1, category: 'Elixirs' },
        { itemName: 'Spiral Incense',            price: 14,  quantity: 2, category: 'Elixirs' },
        { itemName: 'Obedience Elixir',          price: 35,  quantity: 1, category: 'Elixirs', stock: 2 },
        { itemName: 'Sweetness Tonic',           price: 18,  quantity: 1, category: 'Elixirs' },
        { itemName: 'Binding Tincture',          price: 20,  quantity: 1, category: 'Elixirs' },
        { itemName: 'Whispering Vial',           price: 28,  quantity: 1, category: 'Elixirs', stock: 1 },
        // ─ Arcane Trinkets — equipment & rare conditioning tools ─
        { itemName: 'Mind-Fog Candle',           price: 22,  quantity: 1, category: 'Arcane Trinkets', stock: 3 },
        { itemName: 'Mesmerist\'s Pendulum',     price: 30,  quantity: 1, category: 'Arcane Trinkets', stock: 2 },
        { itemName: 'Crystal Ball Shard',        price: 18,  quantity: 1, category: 'Arcane Trinkets' },
        { itemName: 'Enchanted Masquerade Mask', price: 60,  quantity: 1, category: 'Arcane Trinkets', stock: 1 },
        { itemName: 'Ringmaster\'s Baton',       price: 75,  quantity: 1, category: 'Arcane Trinkets', stock: 1 },
        { itemName: 'Silken Blindfold',          price: 16,  quantity: 1, category: 'Arcane Trinkets' },
    ],
};

const EXPLORE_CIRCUS_SHOW: EventDefinition = {
    id: 'explore_circus_show',
    name: 'The Main Show',
    description: 'Watch the circus performance under the big top.',
    icon: 'drama',
    category: 'exploration',
    startStep: 'take_seat',
    steps: {
        take_seat: {
            id: 'take_seat',
            text: '*You find a seat near the front of the big-top tent. The lights dim, and a spotlight fixes on the ringmaster — a tall, gaunt figure in a purple coat, their eyes glittering with showmanship.*\n\n"Ladies, gentlemen, and creatures of all persuasions — welcome to the Circus of the Crescent Moon! Prepare to be... enchanted."\n\n*The performances begin. Acrobats twist impossibly through the air, a fire-eater swallows golden flames, and a mesmerist puts a volunteer to sleep with a wave of their hand.*\n\n*You watch the mesmerist with professional interest...*',
            nextStep: 'reaction',
        },
        reaction: {
            id: 'reaction',
            text: '*The mesmerist\'s technique is crude but effective. You note a few tricks you hadn\'t considered — the use of rhythmic motion combined with verbal patter. The crowd is captivated, and the volunteer on stage is genuinely entranced.*\n\n*By the time the show ends, you feel inspired. New ideas for your own conditioning sessions are already forming.*',
            effects: [
                { type: 'modify_skill', target: 'charm', value: 1 },
                { type: 'custom', target: 'mana', value: 10 },
            ],
            isEnding: true,
        },
    },
};

const EXPLORE_CIRCUS_STALLS: EventDefinition = {
    id: 'explore_circus_stalls',
    name: 'Vesper\'s Curiosities',
    description: 'Browse Madame Vesper\'s exotic wares at the circus stalls.',
    icon: 'shopping-bag',
    category: 'exploration',
    startStep: 'arrive',
    steps: {
        // ── STEP 1: Arrival ──
        arrive: {
            id: 'arrive',
            text: '*The circus stalls are a bizarre bazaar of the strange and the arcane. Bottled whispers, enchanted candles, fortune bones, and jars of glowing substances line the shelves. Colored lanterns cast shifting hues over the crowd, and the air smells of caramel, smoke, and something faintly intoxicating.*\n\n*One stall dominates the row — draped in deep violet silk with constellations stitched in silver thread. A sign above reads: "Vesper\'s Curiosities — Fortunes Told, Fates Sold."*',
            nextStep: 'vesper_intro',
        },
        // ── STEP 2: Vesper's Introduction ──
        vesper_intro: {
            id: 'vesper_intro',
            text: '*Behind the counter sits a woman of indeterminate age, cloaked in dark fabric that shimmers like a night sky. Her amber eyes catch yours with an unsettling directness — as though she can see something behind your face that interests her greatly.*\n\n*Her fingers, adorned with silver rings, drum a slow rhythm on a crystal ball that sits before her. When she speaks, her voice is low and measured, like someone who already knows your answer.*\n\n"Ah. You again — or is it for the first time? Time gets strange around me, you understand. Come, come. Madame Vesper has *exactly* what you need. She always does."',
            nextStep: 'shop_hub',
        },
        // ── STEP 3: Shop UI ──
        shop_hub: {
            id: 'shop_hub',
            text: '*Vesper sweeps a ringed hand across her display, and the items seem to shimmer — each one catching the lantern light as if vying for your attention. The crystal ball pulses softly, casting shifting reflections across the merchandise.*\n\n"Browse at your leisure, dear. Everything here has a purpose — some just haven\'t found their purpose yet. Rather like *people*, wouldn\'t you say?"',
            shopPhase: VESPER_SHOP,
        },
        // ── STEP 4: Departure ──
        depart: {
            id: 'depart',
            text: '*You step away from the stall, your purchases carefully stowed. Behind you, Madame Vesper\'s voice follows like perfume on a breeze.*\n\n"Do come back when the stars align. I\'ll have something new for you — I always do."\n\n*As you glance back, you could swear the crystal ball is still watching you. But then a passing couple blocks your view, and when they pass, the stall looks perfectly ordinary again.*\n\n*Perfectly ordinary.*',
            isEnding: true,
        },
    },
};

const EXPLORE_CIRCUS_BACKSTAGE: EventDefinition = {
    id: 'explore_circus_backstage',
    name: 'Backstage',
    description: 'Sneak behind the scenes to investigate.',
    icon: 'eye',
    category: 'exploration',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: '*While the crowd is distracted by the main show, you slip behind the curtain of the performers\' area. Canvas corridors stretch between wagons and prop crates. The sounds of the audience are muffled here, replaced by hushed conversations and the clinking of arcane equipment.*\n\n*Up ahead, you spot two paths — one leads to the prop storage, the other toward the ringmaster\'s private wagon.*',
            choices: [
                {
                    id: 'props',
                    label: 'Search the Props',
                    tooltip: 'The storage area might contain useful items.',
                    nextStep: 'prop_storage',
                },
                {
                    id: 'wagon',
                    label: 'Investigate the Wagon',
                    tooltip: 'The ringmaster\'s wagon. Risky, but potentially rewarding.',
                    nextStep: 'wagon_check',
                    skillCheck: {
                        skill: 'charm',
                        difficulty: 60,
                        successStep: 'wagon_success',
                        failureStep: 'wagon_caught',
                    },
                },
            ],
        },
        prop_storage: {
            id: 'prop_storage',
            text: '*You rummage through crates of costumes, painted backdrops, and mechanical contraptions. Among the mess, you find a genuine enchanted spiral pendant — disguised as a stage prop, but unmistakably magical.*\n\n*They won\'t miss it among all this clutter.*',
            effects: [{ type: 'add_item', target: 'Spiral Incense', value: 2 }],
            isEnding: true,
        },
        wagon_check: {
            id: 'wagon_check',
            text: '*You approach the ringmaster\'s wagon...*',
            nextStep: 'wagon_success',
        },
        wagon_success: {
            id: 'wagon_success',
            text: '*You manage to slip past the enchanted lock with a deft application of charm magic. The wagon\'s interior is surprisingly luxurious — velvet curtains, crystal decanters, and a writing desk covered in correspondence.*\n\n*In a drawer, you find a pouch of gold and a pair of mana crystals. You help yourself and slip back out before anyone notices.*',
            effects: [
                { type: 'modify_gold', value: 35 },
                { type: 'add_item', target: 'Mana Crystal', value: 1 },
            ],
            isEnding: true,
        },
        wagon_caught: {
            id: 'wagon_caught',
            text: '*The lock resists your touch, and a ward flares to life with an alarming chime. Before you can react, a burly stagehand appears around the corner.*\n\n"Oi! What d\'you think you\'re doing back here?"\n\n*You talk your way out of it — barely — claiming you were looking for the lavatory. The stagehand escorts you firmly back to the public grounds.*\n\n*Embarrassing, but at least you didn\'t get arrested.*',
            effects: [{ type: 'modify_skill', target: 'charm', value: 1 }],
            isEnding: true,
        },
    },
};

// ── All Explore Events (exported as an array for easy registration) ──

// Import the capture event
import { EXPLORE_WOODS_CAPTURE } from './capture';

export const EXPLORE_EVENTS: EventDefinition[] = [
    // Town
    EXPLORE_TOWN_MARKET,
    EXPLORE_TOWN_STREETS,
    EXPLORE_TOWN_TAVERN,
    // Woods
    EXPLORE_WOODS_HERBS,
    EXPLORE_WOODS_TRAIL,
    EXPLORE_WOODS_HUNT,
    EXPLORE_WOODS_CAPTURE,
    // Ruins
    EXPLORE_RUINS_EXCAVATE,
    EXPLORE_RUINS_INSCRIPTIONS,
    EXPLORE_RUINS_DELVE,
    // Circus
    EXPLORE_CIRCUS_SHOW,
    EXPLORE_CIRCUS_STALLS,
    EXPLORE_CIRCUS_BACKSTAGE,
];
