// ──────────────────────────────────────────
// EXPLORATION SYSTEM — Location Activities & Events
// ──────────────────────────────────────────
import type { Location, EventDefinition } from './types';

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
        intro: '*You arrive at the bustling town square. Merchants hawk their wares, townsfolk hurry about their errands, and the scent of fresh bread mingles with wood-smoke in the air. A perfect place to gather supplies — or information.*',
        activities: [
            {
                id: 'town_market',
                label: 'Visit the Market',
                icon: 'shopping-bag',
                tooltip: 'Browse the stalls for useful goods.',
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

const EXPLORE_TOWN_MARKET: EventDefinition = {
    id: 'explore_town_market',
    name: 'The Market',
    description: 'Browse the town market for useful goods.',
    icon: 'shopping-bag',
    category: 'exploration',
    startStep: 'arrive',
    steps: {
        arrive: {
            id: 'arrive',
            text: '*The market is alive with activity. Stalls line both sides of the cobblestone path, and a hundred different scents compete for your attention. A merchant with a crooked grin catches your eye, gesturing at a table covered in glinting trinkets.*\n\n"Fine goods, fine goods! Something for the discerning buyer, perhaps?"',
            choices: [
                {
                    id: 'haggle',
                    label: 'Haggle for a Deal',
                    tooltip: 'Try to negotiate a better price. Costs 15 gold.',
                    nextStep: 'haggle_result',
                    effects: [{ type: 'modify_gold', value: -15 }],
                },
                {
                    id: 'browse',
                    label: 'Just Browse',
                    tooltip: 'Look around without buying anything.',
                    nextStep: 'browse_result',
                },
            ],
        },
        haggle_result: {
            id: 'haggle_result',
            text: '*After some spirited back-and-forth, the merchant relents with a theatrical sigh.*\n\n"You drive a hard bargain! Fine, fine — take it. But remember old Bertram when you need more supplies, yes?"\n\n*You pocket the goods, satisfied with the deal. A vial of Spiral Incense, quite useful for your particular line of work.*',
            effects: [{ type: 'add_item', target: 'Spiral Incense', value: 2 }],
            isEnding: true,
        },
        browse_result: {
            id: 'browse_result',
            text: '*You stroll through the market at a leisurely pace, taking in the sights without opening your purse. Near the fountain, a careless merchant drops a few coins — easy pickings.*\n\n*A productive enough outing, even without buying anything.*',
            effects: [{ type: 'modify_gold', value: 10 }],
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
    name: 'Curiosity Stalls',
    description: 'See what the circus vendors have for sale.',
    icon: 'shopping-bag',
    category: 'exploration',
    startStep: 'browse',
    steps: {
        browse: {
            id: 'browse',
            text: '*The circus stalls are a bizarre bazaar of the strange and the arcane. Bottled whispers, enchanted candles, fortune bones, and jars of glowing substances line the shelves. One stall catches your eye — "Madame Vesper\'s Exotic Elixirs."*\n\n*The proprietor, a cloaked figure with amber eyes, gestures at her wares.*\n\n"Something for the mind, perhaps? I can see you\'re the sort who appreciates... influence."',
            choices: [
                {
                    id: 'buy_elixir',
                    label: 'Buy an Obedience Elixir',
                    tooltip: 'A rare potion, useful for conditioning. Costs 25 gold.',
                    nextStep: 'buy_elixir',
                    effects: [{ type: 'modify_gold', value: -25 }],
                },
                {
                    id: 'buy_incense',
                    label: 'Buy Spiral Incense',
                    tooltip: 'Enchanted incense, good for setting the mood. Costs 10 gold.',
                    nextStep: 'buy_incense',
                    effects: [{ type: 'modify_gold', value: -10 }],
                },
                {
                    id: 'just_look',
                    label: 'Just Looking',
                    tooltip: 'Browse without buying.',
                    nextStep: 'window_shop',
                },
            ],
        },
        buy_elixir: {
            id: 'buy_elixir',
            text: '*Madame Vesper produces a shimmering golden vial from beneath the counter with a knowing smile.*\n\n"Obedience Elixir — my finest blend. One drop in their tea and they\'ll be... considerably more agreeable. Use it wisely, dear."\n\n*You tuck the vial into your coat. A worthwhile investment.*',
            effects: [{ type: 'add_item', target: 'Obedience Elixir', value: 1 }],
            isEnding: true,
        },
        buy_incense: {
            id: 'buy_incense',
            text: '*The amber-eyed vendor wraps three sticks of spiral incense in paper, tying them with a ribbon that seems to shimmer with its own light.*\n\n"Burn these during your sessions. The smoke carries a mild enchantment — it opens the mind, softens resistance. Subtle, but effective."\n\n*You pocket the incense. The price was fair for the quality.*',
            effects: [{ type: 'add_item', target: 'Spiral Incense', value: 3 }],
            isEnding: true,
        },
        window_shop: {
            id: 'window_shop',
            text: '*You browse the stalls without committing to a purchase. The variety is impressive, if eccentric. Near the edge of the grounds, a juggler tosses you a coin for catching one of his dropped balls.*\n\n"Nice reflexes, friend!"',
            effects: [{ type: 'modify_gold', value: 5 }],
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

export const EXPLORE_EVENTS: EventDefinition[] = [
    // Town
    EXPLORE_TOWN_MARKET,
    EXPLORE_TOWN_STREETS,
    EXPLORE_TOWN_TAVERN,
    // Woods
    EXPLORE_WOODS_HERBS,
    EXPLORE_WOODS_TRAIL,
    EXPLORE_WOODS_HUNT,
    // Ruins
    EXPLORE_RUINS_EXCAVATE,
    EXPLORE_RUINS_INSCRIPTIONS,
    EXPLORE_RUINS_DELVE,
    // Circus
    EXPLORE_CIRCUS_SHOW,
    EXPLORE_CIRCUS_STALLS,
    EXPLORE_CIRCUS_BACKSTAGE,
];
