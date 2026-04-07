// ──────────────────────────────────────────
// EXPLORATION SYSTEM — Location Activities & Events
// ──────────────────────────────────────────
import type { Location, EventDefinition, EventShopPhase, EventPrerequisite } from '../../types';

// ── Location Explore Data ──

/** A clickable activity at an exploration location */
export interface LocationActivity {
    id: string;
    label: string;
    icon: string;
    tooltip: string;
    eventId: string;
    /**
     * Optional gate conditions. If set, the activity is only shown when ALL
     * prerequisites pass. Evaluated live against the current stage state.
     * Use `custom` prerequisites for quest-step checks.
     */
    prerequisites?: EventPrerequisite[];
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
            // ── Permanent activities ──
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
            {
                id: 'town_alchemist',
                label: 'Visit the Alchemist',
                icon: 'flask-conical',
                tooltip: 'Browse rare ingredients and brewing supplies.',
                eventId: 'explore_town_alchemist',
            },
            {
                id: 'town_notice_board',
                label: 'Check the Notice Board',
                icon: 'scroll',
                tooltip: 'Read posted notices for rumors and bounties.',
                eventId: 'explore_town_notice_board',
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
            {
                id: 'ruins_ritual_site',
                label: 'Investigate Ritual Site',
                icon: 'sparkles',
                tooltip: 'A circle of standing stones hums with residual power.',
                eventId: 'explore_ruins_ritual_site',
            },
            {
                id: 'ruins_sealed_vault',
                label: 'Sealed Vault',
                icon: 'lock',
                tooltip: 'A heavy door sealed with ancient wards. What lies within?',
                eventId: 'explore_ruins_sealed_vault',
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
            {
                id: 'circus_fortune_teller',
                label: 'Visit the Fortune Teller',
                icon: 'eye',
                tooltip: 'A mysterious seer offers readings for a price.',
                eventId: 'explore_circus_fortune_teller',
            },
            {
                id: 'circus_menagerie',
                label: 'Explore the Menagerie',
                icon: 'bug',
                tooltip: 'Exotic creatures are kept in cages behind the big top.',
                eventId: 'explore_circus_menagerie',
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
    categories: ['Materials', 'Supplies'],
    exitStep: 'depart',
    items: [
        // Materials
        { itemName: 'Timber', price: 5, quantity: 5, category: 'Materials' },
        { itemName: 'Stone', price: 8, quantity: 5, category: 'Materials' },
        { itemName: 'Iron', price: 12, quantity: 3, category: 'Materials' },
        { itemName: 'Velvet Cloth', price: 15, quantity: 2, category: 'Materials' },
        // Supplies — existing consumables/ingredients
        { itemName: 'Dreamcatcher Herb', price: 5, quantity: 3, category: 'Supplies' },
        { itemName: 'Spiral Incense', price: 12, quantity: 2, category: 'Supplies' },
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
                // ── Quest step 2: Stakeout — watch the evening crowd for Sable's patterns ──
                {
                    id: 'watch_market',
                    label: 'Linger by the Evening Market',
                    tooltip: 'The market thins out at dusk. Worth watching who moves through it.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_sable');
                        return aq != null && !aq.completed && aq.currentStep === 1;
                    },
                    nextStep: 'market_stakeout',
                },
                // ── Quest step 3: Chase — spot Sable and give chase ──
                {
                    id: 'spot_sable',
                    label: 'A Figure Darts Across the Rooftops',
                    tooltip: 'Something moves fast overhead — that silhouette is unmistakable.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_sable');
                        return aq != null && !aq.completed && aq.currentStep === 2;
                    },
                    nextStep: 'rooftop_chase',
                },
                // ── Quest step 4: Den — head to the warehouse district to scout ──
                {
                    id: 'scout_warehouses',
                    label: 'Head to the Warehouse District',
                    tooltip: 'The barkeep mentioned the east-side grain storage. Sable\'s den is somewhere around there.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_sable');
                        return aq != null && !aq.completed && aq.currentStep === 3;
                    },
                    nextStep: 'warehouse_scout',
                },
                // ── Post-quest flavor — after step 4 is done ──
                {
                    id: 'pass_den',
                    label: 'Walk Past the Old Warehouse',
                    tooltip: 'You know what\'s in there now. Hard not to think about it.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_sable');
                        return aq != null && aq.currentStep > 3;
                    },
                    nextStep: 'den_recall',
                },
                // ── Veridian quest step 1 — spot her preaching in the square ──
                {
                    id: 'veridian_sermon',
                    label: 'A Crowd is Gathered Around a Preacher',
                    tooltip: '[Quest] A traveling cleric has drawn a crowd in the square. Could be worth a listen.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_veridian');
                        return aq != null && !aq.completed && aq.currentStep === 0;
                    },
                    nextStep: 'veridian_sermon_encounter',
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
        // ── PERMANENT quest step — appear during step 4 of The Shadow's Trail ──
        warehouse_scout: {
            id: 'warehouse_scout',
            text: '*You cut through the market alley and into the warren of narrow lanes that border the east-side docks. The afternoon air smells of brine and sawdust. Boarded-up storefronts and stacked crates crowd the passages.*\n\n*You slow your pace, scanning each building face. Old grain storage, the barkeep said. You count the loading bays, reading the rust patterns on the iron rings.*\n\n*There — a section of wall where the mortar is slightly too fresh. A replaced stone, recently disturbed. You crouch and examine the base of the door beside it: faint scratch marks on the flagstone, the kind a lock-pick leaves.*\n\n*You\'ve found the entrance.*\n\n*You memorize the location — the cracked sign of a defunct chandler\'s shop, two crates branded with a saltfish merchant\'s mark. You can find this again. Tonight.*',
            onEnter: (ctx) => {
                // Scouting the warehouse district organically completes the Den step
                ctx.stage.markEventCompleted('quest_sable_04_den');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        // ── Quest step 2: Stakeout ──
        market_stakeout: {
            id: 'market_stakeout',
            text: '*You find a shadow between two locked stalls and settle in, keeping your eyes on the flow of the thinning crowd. Carts trundle home. Lanterns flicker on. The market empties in layers.*\n\n*Then — there. Moving counter to every other person, unhurried but precise. A figure in a grey hood, touching nothing, drawing no eyes. You watch the route: past the fishmonger\'s, along the covered walkway, a deliberate pause at the corner of the cloth-sellers\' row.*\n\n*A pattern. You\'ve seen enough.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_sable_02_stakeout');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        // ── Quest step 3: Chase ──
        rooftop_chase: {
            id: 'rooftop_chase',
            text: '*You look up. There — a lean silhouette crosses the gap between two chimneys, moving fast and low. The calling card you\'ve been hunting.*\n\n*You break into a run, cutting through an alley, vaulting a crate. The figure glances back once — just once — and you catch a flash of amber eyes before he drops out of sight over the far edge of the roof.*\n\n*You reach the spot: nothing but a broken weathervane and three rooftop tiles disturbed in a line pointing east. Toward the warehouse district.*\n\n*You didn\'t catch him. But you\'ve rattled him — and he\'s run straight toward his den.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_sable_03_chase');
            },
            effects: [{ type: 'modify_skill', target: 'speed', value: 1 }],
            isEnding: true,
        },
        // ── Post-quest flavor — after step 4 is done ──
        den_recall: {
            id: 'den_recall',
            text: '*You pass the old chandler\'s sign without breaking stride, hands in your pockets.*\n\n*The entrance is barely visible if you know what to look for — that too-fresh mortar, the faint scratch-marks. Someone has been here since you last visited; there\'s a new scuff on the flagstone, a small feather lodged in the door-crack.*\n\n*You file it away and keep walking. The city has a short memory. But you don\'t.*',
            isEnding: true,
        },
        // ── PERMANENT quest step — Veridian step 1 (sermon) ──
        veridian_sermon_encounter: {
            id: 'veridian_sermon_encounter',
            text: '*The small crowd parts enough for you to hear her clearly — a doe with dappled brown fur and a travelling staff, standing on the low fountain wall.*\n\n*"...and fear is a choice. It masquerades as wisdom, but it is not wisdom — it is the absence of it. The manor on the hill has not harmed you. Your fear of it has."*\n\n*A few people grumble. A few nod. She steps down when the energy shifts, and catches your eye with quiet directness.*\n\n*"You were listening," she says. "Most people aren\'t."*\n\n*She introduces herself as Veridian — a cleric of the Forest Shrine, passing through to study the local spiritual disturbance. Principled, practical, and clearly unafraid of you.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_veridian_01_sermon');
            },
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
                // ── PERMANENT — visible during quest step 1, leads to organic quest completion ──
                {
                    id: 'ask_sable_rumors',
                    label: 'Press Her on the Phantom Thief',
                    tooltip: '[Quest] You\'ve accepted a hunt for an elusive cat burglar. The barkeep might know something.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_sable');
                        return aq != null && !aq.completed && aq.currentStep === 0;
                    },
                    nextStep: 'sable_barkeep_lead',
                },
                // ── PERMANENT — visible after quest step 1, post-quest flavor ──
                {
                    id: 'recall_phantom',
                    label: 'Ask If There\'s Any Word on That Thief',
                    tooltip: 'You remember those early leads — curious if the barkeep has heard anything since.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_sable');
                        return aq != null && aq.currentStep > 0;
                    },
                    nextStep: 'sable_followup_flavor',
                },
                // ── Veridian quest step 2 — find her in the tavern mid-debate ──
                {
                    id: 'veridian_debate',
                    label: 'A Cleric is Arguing With Someone',
                    tooltip: '[Quest] A heated theological debate is happening in the corner. The deer looks like she could use backup.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_veridian');
                        return aq != null && !aq.completed && aq.currentStep === 1;
                    },
                    nextStep: 'veridian_debate_encounter',
                },
                // ── Pervis quest step 1 — gather intel about the ruins encampment ──
                {
                    id: 'pervis_intel',
                    label: 'Listen for Word About the Ruins',
                    tooltip: '[Quest] Merchants have been avoiding the northern road. Someone at this bar knows why.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_pervis');
                        return aq != null && !aq.completed && aq.currentStep === 0;
                    },
                    nextStep: 'pervis_intel_gather',
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
        // ── PERMANENT quest step — appear during step 1 of The Shadow's Trail ──
        sable_barkeep_lead: {
            id: 'sable_barkeep_lead',
            text: '*You lower your voice and lean across the bar.*\n\n"I\'m looking for a particular thief. Goes by nothing, leaves calling cards — small silver cat silhouettes. Works the market district after dark."\n\n*The barmaid\'s expression shifts. She sets down her rag and studies you for a moment.*\n\n"Oh, *that* one." *She glances around the room, then drops her voice.* "Half the merchants are terrified of him. Quick as smoke, quiet as a shadow. Calls himself Sable — I heard that from Garren the fishmonger, who lost a pouch of silver to him last week."\n\n*She leans closer.* "Word is he keeps to the warehouse district on the east side. Has a den tucked in somewhere around the old grain storage. Hasn\'t been spotted in a week, but the calling cards keep showing up."\n\n*She straightens and picks up her rag again.* "You didn\'t hear any of that from me."',
            onEnter: (ctx) => {
                // Completing this path grants the same quest advancement as the full step 1 event
                ctx.stage.markEventCompleted('quest_sable_01_rumors');
            },
            effects: [
                { type: 'modify_gold', value: -10 },
                { type: 'modify_skill', target: 'wisdom', value: 1 },
            ],
            isEnding: true,
        },
        // ── PERMANENT post-quest flavor — appears after step 1 is done ──
        sable_followup_flavor: {
            id: 'sable_followup_flavor',
            text: '*The barmaid glances up at you.*\n\n"The phantom thief? Oh, people are still talking about him." *She shrugs, polishing a glass.* "Though the calling cards have slowed down lately. Some say he\'s gone to ground — knows someone is on to him."\n\n*She gives you a knowing look.* "You wouldn\'t know anything about that, would you?"\n\n*You smile and say nothing. She laughs.*\n\n"Thought so."',
            isEnding: true,
        },
        // ── PERMANENT quest step — Veridian step 2 (debate) ──
        veridian_debate_encounter: {
            id: 'veridian_debate_encounter',
            text: '*In the far corner, a doe in traveling clothes is deep in argument with a red-faced merchant. Her staff is propped against the wall; her hands are folded with careful patience on the table.*\n\n*"...burning the manor doesn\'t solve the problem," she\'s saying. "It relocates it. You cannot defeat something by giving it a reason to return angry."*\n\n*The merchant splutters. She spots you and, for just a moment, her expression asks a question.*\n\n*You sit down. Between the two of you, the argument winds down in a few minutes. When the merchant leaves, she lets out a long breath.*\n\n*"Veridian," she says. "Thank you. He\'s been at this for an hour." She tilts her head. "You\'re the one from the square, aren\'t you? I thought you might show up here."*\n\n*She mentions her plans: Forest Shrine, two days from now. A spiritual disturbance she needs to investigate directly.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_veridian_02_debate');
            },
            effects: [
                { type: 'modify_skill', target: 'charm', value: 1 },
                { type: 'modify_skill', target: 'wisdom', value: 1 },
            ],
            isEnding: true,
        },
        // ── PERMANENT quest step — Pervis step 1 (intel) ──
        pervis_intel_gather: {
            id: 'pervis_intel_gather',
            text: '*You lean back and let the conversation flow around you. Three separate threads confirm the same picture: a small force has occupied the old ruins, turned back two trading convoys, and set perimeter markers along the northern access roads.*\n\n*A carter who tried the route last week shakes his head over his ale. "Polite about it. Very polite. But not moving, either. Their commander — some composed rabbit fellow — just looked at you until you decided to turn around. Didn\'t say a word."*\n\n*You buy him another drink and let him keep talking. By the end of the evening, you have a solid picture: organized, patient, methodical. A full tactical setup, not a simple bandit camp.*\n\n*Whoever is in those ruins planned this carefully.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_pervis_01_intel');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
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
            text: '*You carefully harvest the herbs, wrapping them in a cloth. Dreamcatcher Herb — perfect for brewing potions and burning as incense during conditioning sessions. On the way back, you snap off several sturdy branches — good timber for the manor. A productive trip.*',
            effects: [
                { type: 'add_item', target: 'Dreamcatcher Herb', value: 3 },
                { type: 'add_item', target: 'Timber', value: 4 },
            ],
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
                // ── Kova quest step 1 — find wolf territorial markers ──
                {
                    id: 'kova_wolf_signs',
                    label: 'Examine the Claw Marks on the Trees',
                    tooltip: '[Quest] These aren\'t ordinary animal scratches — they\'re arranged too precisely.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_kova');
                        return aq != null && !aq.completed && aq.currentStep === 0;
                    },
                    nextStep: 'kova_wolfpack_signs',
                },
                // ── Kova quest step 3 — spot Kova from cover ──
                {
                    id: 'kova_alpha_watch',
                    label: 'Observe the Clearing Ahead',
                    tooltip: '[Quest] You can hear the pack moving beyond the next ridge. Worth taking a careful look.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_kova');
                        return aq != null && !aq.completed && aq.currentStep === 2;
                    },
                    nextStep: 'kova_sighting_encounter',
                },
                // ── Veridian quest step 3 — find her trail into the woods ──
                {
                    id: 'veridian_trail_marks',
                    label: 'These Marks Look Navigational, Not Territorial',
                    tooltip: '[Quest] Small carved marks on the bark — someone is leaving themselves a path to follow back.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_veridian');
                        return aq != null && !aq.completed && aq.currentStep === 2;
                    },
                    nextStep: 'veridian_trail_found',
                },
            ],
        },
        deeper: {
            id: 'deeper',
            text: '*The trail leads to a small, hidden glade. In the center sits a crumbling stone shrine, overgrown with vines. On the altar — a shimmering mana crystal, pulsing faintly with residual energy.*\n\n*You carefully extract it, and gather some quality timber from the ancient trees lining the glade. The forest seems to hum with approval — or perhaps warning.*',
            effects: [
                { type: 'add_item', target: 'Mana Crystal', value: 1 },
                { type: 'add_item', target: 'Timber', value: 5 },
                { type: 'modify_gold', value: 10 },
            ],
            isEnding: true,
        },
        retreat: {
            id: 'retreat',
            text: '*Discretion being the better part of valor, you decide not to follow the unknown trail. On the way back, you spot a patch of useful herbs growing beside the path, and collect some fallen timber — not a wasted trip after all.*',
            effects: [
                { type: 'add_item', target: 'Dreamcatcher Herb', value: 1 },
                { type: 'add_item', target: 'Timber', value: 3 },
            ],
            isEnding: true,
        },
        // ── PERMANENT quest step — Kova step 1 (wolfpack) ──
        kova_wolfpack_signs: {
            id: 'kova_wolfpack_signs',
            text: '*You crouch beside the marked oak and study the gouges — not random scratches, but deliberate notches cut at precise heights and intervals. You follow the line to a second tree, then a third. A perimeter.*\n\n*Someone is mapping territory the way a general maps a battlefield. The woodsmen\'s stories about an organized wolf pack suddenly seem a great deal more credible.*\n\n*You note the bearing and back away quietly. Whatever is out here, it watches its own borders.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_kova_01_wolfpack');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        // ── PERMANENT quest step — Kova step 3 (sighting) ──
        kova_sighting_encounter: {
            id: 'kova_sighting_encounter',
            text: '*You move carefully to the ridge and find cover in the canopy above. Below, in a wide clearing, a wolf pack runs its afternoon routines — patrol rotations, drills, a brief disciplinary moment dispatched with one sharp sound.*\n\n*Then she comes out.*\n\n*Kova. Exactly as described: massive, scarred, moving like something that has never been unsure of its footing. She surveys the camp and every wolf in it straightens. She says nothing. She doesn\'t need to.*\n\n*You watch her for twenty minutes. Impulsive in bursts, controlled in aggregate. Leads through display. Her weakness is pride — you can see it in the way she absorbs each acknowledgment from the pack.*\n\n*That\'s the key. File it away.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_kova_03_sighting');
            },
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'modify_skill', target: 'charm', value: 1 },
            ],
            isEnding: true,
        },
        // ── PERMANENT quest step — Veridian step 3 (trail) ──
        veridian_trail_found: {
            id: 'veridian_trail_found',
            text: '*You follow the navigational marks through the undergrowth — carved at eye level, subtle enough to miss if you weren\'t looking. They lead you to a small sunny clearing where Veridian is sitting against a tree, staff across her knees, apparently at rest.*\n\n*She opens her eyes before you\'re within ten meters.*\n\n*"I left those marks in case I needed to find my way back," she says. "I didn\'t expect anyone to follow them." A pause. "Though I suppose I\'m not surprised it was you."*\n\n*She explains what she\'s heading toward: the Forest Shrine, an hour north. A spiritual resonance disturbance she needs to examine directly. She mentions it the way someone mentions the weather — as plain fact, plainly concerning.*\n\n*"You\'re welcome to come," she says. "I\'d rather not walk alone into the deep woods."*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_veridian_03_trail');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
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
                // ── Kova quest step 2 — map the pack's territory ──
                {
                    id: 'kova_territory',
                    label: 'These Aren\'t Deer Tracks',
                    tooltip: '[Quest] Wolf prints — large ones, in disciplined formation. This is pack territory.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_kova');
                        return aq != null && !aq.completed && aq.currentStep === 1;
                    },
                    nextStep: 'kova_territory_tracks',
                },
                // ── Kova quest step 4 — encounter the lieutenant ──
                {
                    id: 'kova_lieutenant',
                    label: 'Something is Tracking You',
                    tooltip: '[Quest] You\'ve been in the pack\'s territory long enough — they\'ve noticed.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_kova');
                        return aq != null && !aq.completed && aq.currentStep === 3;
                    },
                    nextStep: 'kova_lieutenant_encounter',
                },
                // ── Veridian quest step 4 — find her at the shrine ──
                {
                    id: 'veridian_shrine',
                    label: 'A Soft Glow Through the Trees',
                    tooltip: '[Quest] Light that isn\'t sunlight. Someone is working at the old standing stones.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_veridian');
                        return aq != null && !aq.completed && aq.currentStep === 3;
                    },
                    nextStep: 'veridian_shrine_found',
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
        // ── PERMANENT quest step — Kova step 2 (territory) ──
        kova_territory_tracks: {
            id: 'kova_territory_tracks',
            text: '*You crouch beside the tracks and study them: large, widely-spaced wolf prints — but what stops you is the pattern. Three sets of tracks, parallel, all moving the same direction at what must have been the same pace. A formation.*\n\n*You follow them cautiously for twenty minutes. They lead you to the edge of a wide clearing backed against a rocky ridge — a natural stronghold, with the sightlines cleared and two dens dug into the hillside.*\n\n*You\'ve found Kova\'s camp. The pack moves through its routines below with military precision, and at the center, a massive gray wolf watches it all with the calm of absolute authority.*\n\n*You back away before they catch your scent. Enough.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_kova_02_territory');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        // ── PERMANENT quest step — Kova step 4 (challenge) ──
        kova_lieutenant_encounter: {
            id: 'kova_lieutenant_encounter',
            text: '*Three wolves step out of the undergrowth — not attacking. Herding. They move with practiced efficiency, steering you into a small clearing.*\n\n*Waiting there: a wolf almost as large as Kova, with a scar running through one eye. A lieutenant.*\n\n*"Alpha knows you\'ve been in her territory," she says. Flat, factual. "She wants to see if you\'re worth her time. Fight me. Win — you get an audience. Lose — we escort you out."*\n\n*The fight is brutal and short. She\'s formidable, but you\'ve been learning from watching the pack. You find the gaps.*\n\n*When it\'s over, she studies you with something that might be approval.*\n\n*"Come on," she says. "The alpha will want to see this."*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_kova_04_challenge');
            },
            effects: [{ type: 'modify_skill', target: 'power', value: 1 }],
            isEnding: true,
        },
        // ── PERMANENT quest step — Veridian step 4 (shrine) ──
        veridian_shrine_found: {
            id: 'veridian_shrine_found',
            text: '*The light leads you to the standing stones — a circle of ancient moss-covered columns with a shallow basin at the center. The air hums faintly.*\n\n*Veridian is at the basin, staff raised, deep in a resonance ritual. Her wards are open; her concentration is absolute.*\n\n*You wait until she lowers her staff and opens her eyes. She\'s paler than when you last saw her.*\n\n*"It\'s worse than I thought," she says. "There\'s a focal point — something concentrating the imbalance. Not just the manor. Something older."*\n\n*She turns to you, and her eyes are tired and very direct.* "You know more than you\'re saying. About the manor, about what\'s happening here."*\n\n*She waits.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_veridian_04_shrine');
            },
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'custom', target: 'mana', value: 15 },
            ],
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
                // ── Pervis quest step 2 — scout the ruins perimeter ──
                {
                    id: 'pervis_perimeter',
                    label: 'Study the Cleared Sightlines',
                    tooltip: '[Quest] This rubble has been moved deliberately — someone is creating defensive positions.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_pervis');
                        return aq != null && !aq.completed && aq.currentStep === 1;
                    },
                    nextStep: 'pervis_perimeter_scout',
                },
                // ── Pervis quest step 5 — breach the inner keep ──
                {
                    id: 'pervis_inner_keep',
                    label: 'The Eastern Rubble Pile Has a Gap',
                    tooltip: '[Quest] The supply sabotage has pulled guards away. There\'s a window now.',
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_pervis');
                        return aq != null && !aq.completed && aq.currentStep === 4;
                    },
                    nextStep: 'pervis_inner_advance',
                },
            ],
        },
        take_crystal: {
            id: 'take_crystal',
            text: '*You carefully extract the mana crystal from the earth. It hums warmly in your palm, its energy still potent despite the ages it has spent buried here. You also chip away several usable blocks of stone from the surrounding rubble.*\n\n*A fine find for any practitioner of the arcane arts.*',
            effects: [
                { type: 'add_item', target: 'Mana Crystal', value: 1 },
                { type: 'add_item', target: 'Stone', value: 4 },
            ],
            isEnding: true,
        },
        take_fragment: {
            id: 'take_fragment',
            text: '*You pry the iridescent shard free. The moment your skin touches it, a flash of alien memory surges through you — a glimpse of a ritual, an ancient name, a spiral of golden light. Then silence. You also salvage some stone blocks from the excavation site.*\n\n*A memory fragment. These are rare and valuable, useful for deepening a servant\'s conditioning... or restoring a captive\'s free will.*',
            effects: [
                { type: 'add_item', target: 'Memory Fragment', value: 1 },
                { type: 'add_item', target: 'Stone', value: 3 },
            ],
            isEnding: true,
        },
        // ── PERMANENT quest step — Pervis step 2 (perimeter) ──
        pervis_perimeter_scout: {
            id: 'pervis_perimeter_scout',
            text: '*You study the cleared rubble lines carefully. This wasn\'t done by accident — debris has been relocated to create open corridors with no natural cover. Sightlines, you realize. Every approach to the inner ruins is visible from at least two positions.*\n\n*You work around the perimeter for an hour, mapping patrol timing and coverage. Six and a half minutes between guard crossings. One overlap point near the eastern rubble pile has a four-second gap when both sentries face away.*\n\n*Not generous. But workable.*\n\n*Whoever designed this knows what they\'re doing. Military training, no question. You\'ll need to be careful.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_pervis_02_perimeter');
            },
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        // ── PERMANENT quest step — Pervis step 5 (advance) ──
        pervis_inner_advance: {
            id: 'pervis_inner_advance',
            text: '*The supply sabotage worked — the outer perimeter is thinner, forces pulled inward. There\'s a gap in the eastern watch that wasn\'t there before.*\n\n*You move through it fast and quiet, clearing the outer ring and pressing toward the inner keep. A stone alcove in the ruins\' core, well-chosen for sightlines and retreat options.*\n\n*And there he is.*\n\n*A compact rabbit in a commander\'s coat, standing at a stone table covered in maps. He doesn\'t look alarmed. He looks like someone who was expecting company.\n\n*"You\'re thorough," he says. He doesn\'t sound surprised. "I\'ve been watching your approach since the supply route collapsed." He folds his hands. "So. Now that you\'re here — what exactly do you plan to do?"*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_pervis_05_advance');
            },
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'modify_skill', target: 'charm', value: 1 },
            ],
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
            text: '*You spend a considerable time absorbing the ancient knowledge. By the time you step away from the wall, the sun has shifted significantly. But you can feel the difference — a deeper well of mana, a sharper instinct for enchantment.*\n\n*Among the rubble near the inscribed wall, you notice several stones still bearing intact runic script — too valuable to leave behind.*\n\n*Time well spent.*',
            onEnter: (ctx) => {
                // Passive: studying the ruins layout grants Pervis step 3 (infiltrate)
                // — the architectural knowledge reveals the hidden passages needed to bypass guards
                const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_pervis');
                if (aq && !aq.completed && aq.currentStep === 2) {
                    ctx.stage.markEventCompleted('quest_pervis_03_infiltrate');
                }
            },
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'custom', target: 'mana', value: 20 },
                { type: 'add_item', target: 'Rune Stones', value: 2 },
                { type: 'add_item', target: 'Stone', value: 3 },
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
                // ── Pervis quest step 4 — use the lower passages to sabotage supply lines ──
                {
                    id: 'pervis_sabotage',
                    label: 'The Supply Cache Is Down Here',
                    tooltip: "[Quest] The encampment's eastern provisions are stored in these lower passages. Now's your chance.",
                    condition: (ctx) => {
                        const aq = ctx.stage.currentState.activeQuests.find((q: any) => q.questId === 'quest_pervis');
                        return aq != null && !aq.completed && aq.currentStep === 3;
                    },
                    nextStep: 'pervis_supply_sabotage',
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
            text: '*You press through the wards, feeling them crackle against your aura like static. The lower chamber opens into a vaulted hall, remarkably well-preserved. In the center, atop a stone pedestal, rests a collection of artifacts — gold, crystals, and a finely crafted pendant.*\n\n*The walls here are lined with polished marble slabs and iron fittings, still intact after centuries. You salvage what you can carry.*',
            effects: [
                { type: 'modify_gold', value: 40 },
                { type: 'add_item', target: 'Mana Crystal', value: 2 },
                { type: 'add_item', target: 'Stone', value: 5 },
                { type: 'add_item', target: 'Marble Slab', value: 1 },
                { type: 'add_item', target: 'Iron', value: 2 },
            ],
            isEnding: true,
        },
        delve_fail: {
            id: 'delve_fail',
            text: '*The wards flare as you attempt to pass, sending a painful jolt through your body. You stumble back up the stairs, singed and smarting. Whatever is down there, your current power isn\'t enough to breach the protections.*\n\n*At least you salvage some usable stone from the stairwell.*',
            effects: [
                { type: 'modify_skill', target: 'power', value: 1 },
                { type: 'add_item', target: 'Stone', value: 2 },
            ],
            isEnding: true,
        },
        stay_above: {
            id: 'stay_above',
            text: '*Wisdom dictates caution. You explore the upper levels instead, finding a small cache of coins that some previous explorer overlooked. You also quarry several blocks of usable stone from the crumbling walls. Not the motherload, but you\'ll live to delve another day.*',
            effects: [
                { type: 'modify_gold', value: 15 },
                { type: 'add_item', target: 'Stone', value: 4 },
            ],
            isEnding: true,
        },
        // ── PERMANENT quest step — Pervis step 4 (sabotage) ──
        pervis_supply_sabotage: {
            id: 'pervis_supply_sabotage',
            text: '*You descend into the lower passage and find what you were looking for: the eastern supply cache, stacked carefully in an alcove off the main corridor. Provisions for at least two weeks.*\n\n*You work quickly and quietly — nothing as obvious as destruction. Instead, you compromise the stores in ways that won\'t be noticed immediately but will render them unusable within thirty-six hours.*\n\n*On the way back up, you hear a distant shout from somewhere in the encampment above. Not an alarm — a convoy being turned away at the outer perimeter. He\'s already tightening the logistics.*\n\n*Good. A tightening grip creates pressure, and pressure creates gaps.*',
            onEnter: (ctx) => {
                ctx.stage.markEventCompleted('quest_pervis_04_sabotage');
            },
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'modify_skill', target: 'power', value: 1 },
            ],
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
    categories: ['Arcane Materials', 'Curiosities'],
    exitStep: 'depart',
    items: [
        // Arcane Materials — rare construction materials
        { itemName: 'Rune Stones', price: 30, quantity: 1, stock: 3, category: 'Arcane Materials' },
        { itemName: 'Marble Slab', price: 40, quantity: 1, stock: 2, category: 'Arcane Materials' },
        // Curiosities — existing consumables/ingredients
        { itemName: 'Mana Crystal', price: 20, quantity: 1, category: 'Curiosities' },
        { itemName: 'Obedience Elixir', price: 35, quantity: 1, stock: 2, category: 'Curiosities' },
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

// ══════════════════════════════════════════
// NEW TOWN EVENTS
// ══════════════════════════════════════════

const EXPLORE_TOWN_ALCHEMIST: EventDefinition = {
    id: 'explore_town_alchemist',
    name: 'The Alchemist\'s Shop',
    description: 'A cramped shop filled with bubbling flasks and dried herbs.',
    icon: 'flask-conical',
    category: 'exploration',
    startStep: 'entrance',
    steps: {
        entrance: {
            id: 'entrance',
            text: '*You push open a heavy wooden door into a dimly lit shop. The air is thick with competing scents — lavender, sulfur, and something sweet you can\'t quite place. Shelves line every wall from floor to ceiling, crammed with bottles, jars, and dried bundles.*\n\n*Behind the counter, a thin fox with half-moon spectacles peers at you over a mortar and pestle.*\n\n"Ah, a customer. You look like someone who knows the difference between a decoction and a tincture. Browse at your leisure — but don\'t touch the green bottles on the third shelf. Those are... temperamental."',
            choices: [
                {
                    id: 'browse',
                    label: 'Browse the Wares',
                    tooltip: 'See what ingredients are for sale.',
                    nextStep: 'shop',
                },
                {
                    id: 'ask_advice',
                    label: 'Ask for Brewing Advice',
                    tooltip: 'The alchemist might share some wisdom.',
                    nextStep: 'advice',
                },
            ],
        },
        shop: {
            id: 'shop',
            text: '*The alchemist gestures broadly at the shelves.* "Take your time. Everything\'s labeled — mostly."',
            shopPhase: {
                shopName: "The Alchemist's Shop",
                shopkeeperName: 'The Alchemist',
                shopkeeperGreeting: '"Need something specific, or just browsing? I\'ve got fresh stock from the woods this morning."',
                categories: ['Ingredients', 'Bases', 'Rare'],
                exitStep: 'depart',
                items: [
                    { itemName: 'Dreamcatcher Herb', price: 6, quantity: 5, category: 'Ingredients' },
                    { itemName: 'Moonpetal Blossom', price: 5, quantity: 5, category: 'Ingredients' },
                    { itemName: 'Embervine Root', price: 10, quantity: 3, category: 'Ingredients' },
                    { itemName: 'Marshwater Moss', price: 4, quantity: 8, category: 'Ingredients' },
                    { itemName: 'Ironbark Ash', price: 4, quantity: 5, category: 'Ingredients' },
                    { itemName: "Alchemist's Oil", price: 8, quantity: 5, category: 'Bases' },
                    { itemName: 'Distilled Spirit', price: 12, quantity: 3, category: 'Bases' },
                    { itemName: 'Nightshade Extract', price: 25, quantity: 1, stock: 1, category: 'Rare' },
                    { itemName: 'Spiritbloom', price: 30, quantity: 1, stock: 1, category: 'Rare' },
                ],
            },
        },
        advice: {
            id: 'advice',
            text: '*The alchemist adjusts their spectacles and regards you with interest.*\n\n"Brewing advice? Well, the fundamentals are simple enough. Every ingredient carries elemental essence — fire, earth, water, shadow, light. When you combine them, the essences blend. Match the right ratios and you get something useful. Get them wrong and you get..." *they gesture at a stain on the ceiling* "...well. You get the idea."\n\n*They lean in conspiratorially.* "If you\'re looking for something specific, pay attention to the dominant element. A potion dominated by shadow will always tend toward mind-affecting brews. Fire leans toward physical enhancement. And if you can balance two elements in equal measure..." *they trail off with a knowing smile* "That\'s where the interesting recipes hide."',
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        depart: {
            id: 'depart',
            text: '*You thank the alchemist and step back into the street, your pack heavier with new supplies.*\n\n"Come back anytime. And remember — never brew on an empty stomach."',
            isEnding: true,
        },
    },
};

const EXPLORE_TOWN_NOTICE_BOARD: EventDefinition = {
    id: 'explore_town_notice_board',
    name: 'Town Notice Board',
    description: 'A weathered board covered in postings and notices.',
    icon: 'scroll',
    category: 'exploration',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: '*The town notice board stands at the crossroads, layered thick with postings — bounty notices, job listings, missing persons, and the occasional poorly-spelled love letter nailed up as a prank. You scan the notices for anything useful.*',
            choices: [
                {
                    id: 'bounty',
                    label: 'Read the Bounty Notices',
                    tooltip: 'Someone might be offering gold for services rendered.',
                    nextStep: 'bounty',
                },
                {
                    id: 'rumors',
                    label: 'Look for Rumors',
                    tooltip: 'Local gossip sometimes hides useful information.',
                    nextStep: 'rumors',
                },
                {
                    id: 'leave',
                    label: 'Move On',
                    tooltip: 'Nothing catches your eye.',
                    nextStep: 'leave',
                },
            ],
        },
        bounty: {
            id: 'bounty',
            text: '*One notice catches your attention — a request for rare herbs, posted by a local apothecary. The reward is generous.*\n\n"WANTED: Dreamcatcher Herb and Moonpetal Blossom in quantity. Will pay 30 gold for a bundle of each. Inquire at the apothecary."\n\n*You pocket the notice. Something to remember next time you\'re foraging.*',
            effects: [
                { type: 'modify_gold', value: 30 },
            ],
            isEnding: true,
        },
        rumors: {
            id: 'rumors',
            text: '*You piece together fragments of gossip from the various postings. A trader reports strange lights in the ruins at night. A farmer claims to have seen a massive wolf near the woods — bigger than any natural beast. And tucked behind a "LOST CAT" poster, someone has scrawled a cryptic note:*\n\n*"The circus fortune teller knows more than she lets on. Ask about the cards, not the crystal ball."*\n\n*Interesting. You file these tidbits away.*',
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        leave: {
            id: 'leave',
            text: '*Nothing particularly useful today. You turn away from the board and continue on your way.*',
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// NEW RUINS EVENTS
// ══════════════════════════════════════════

const EXPLORE_RUINS_RITUAL_SITE: EventDefinition = {
    id: 'explore_ruins_ritual_site',
    name: 'Ancient Ritual Site',
    description: 'A circle of standing stones thrums with residual magical energy.',
    icon: 'sparkles',
    category: 'exploration',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: '*Beyond the main ruins, half-hidden by overgrown brambles, you find a ring of standing stones. Each monolith is taller than you and carved with spiraling symbols that seem to shift when you look at them from the corner of your eye.*\n\n*The air here is different — charged, electric. You can feel mana pulsing through the earth beneath your feet. This was a place of great power, once.*',
            choices: [
                {
                    id: 'meditate',
                    label: 'Meditate at the Circle',
                    tooltip: 'Attune yourself to the residual energy.',
                    nextStep: 'meditate',
                    skillCheck: {
                        skill: 'wisdom',
                        difficulty: 55,
                        successStep: 'meditate_success',
                        failureStep: 'meditate_fail',
                    },
                },
                {
                    id: 'harvest',
                    label: 'Harvest the Crystals',
                    tooltip: 'Pry loose the crystals embedded in the stones.',
                    nextStep: 'harvest',
                },
                {
                    id: 'leave',
                    label: 'Leave It Be',
                    tooltip: 'Some things are better left undisturbed.',
                    nextStep: 'leave',
                },
            ],
        },
        meditate_success: {
            id: 'meditate_success',
            text: '*You settle into the center of the circle and close your eyes. The mana flows into you like water filling a vessel — steady, warm, and deep. Ancient knowledge brushes against your consciousness: fragments of rituals, ward-patterns, binding techniques from a civilization that mastered the art of subjugation.*\n\n*When you open your eyes, the sun has moved considerably. But you feel profoundly enriched.*',
            effects: [
                { type: 'custom', target: 'mana', value: 35 },
                { type: 'modify_skill', target: 'wisdom', value: 2 },
            ],
            isEnding: true,
        },
        meditate_fail: {
            id: 'meditate_fail',
            text: '*You attempt to attune to the circle, but the energy is overwhelming — chaotic, fragmented. A pulse of raw mana knocks you backwards, and you land in the dirt with ringing ears.*\n\n*Not a total loss — you absorbed some energy in the process — but the deeper knowledge remains locked away.*',
            effects: [
                { type: 'custom', target: 'mana', value: 10 },
            ],
            isEnding: true,
        },
        harvest: {
            id: 'harvest',
            text: '*You carefully extract several crystals from the base of the standing stones. They pulse with contained energy — perfect for ward construction or enchanting. The stones themselves seem unbothered by the removal, their carvings continuing to shimmer.*',
            effects: [
                { type: 'add_item', target: 'Ward Crystals', value: 2 },
                { type: 'add_item', target: 'Rune Stones', value: 1 },
            ],
            isEnding: true,
        },
        leave: {
            id: 'leave',
            text: '*You back away from the circle, leaving its power undisturbed. Perhaps another day, when you are better prepared.*',
            isEnding: true,
        },
    },
};

const EXPLORE_RUINS_SEALED_VAULT: EventDefinition = {
    id: 'explore_ruins_sealed_vault',
    name: 'The Sealed Vault',
    description: 'A heavy door covered in protective wards blocks the way forward.',
    icon: 'lock',
    category: 'exploration',
    startStep: 'door',
    steps: {
        door: {
            id: 'door',
            text: '*Deep within the ruins, behind a collapsed corridor you barely squeezed through, stands an imposing stone door. Wards glow across its surface in overlapping layers — whoever sealed this vault intended it to stay sealed.*\n\n*But wards are just magic, and magic can be undone.*',
            choices: [
                {
                    id: 'dispel',
                    label: 'Attempt to Dispel the Wards',
                    tooltip: 'Use your power to break through. Risky.',
                    nextStep: 'dispel',
                    skillCheck: {
                        skill: 'power',
                        difficulty: 70,
                        successStep: 'vault_open',
                        failureStep: 'ward_backlash',
                    },
                },
                {
                    id: 'key',
                    label: 'Use a Skeleton Key',
                    tooltip: 'The ancient lock might respond to the right key.',
                    nextStep: 'vault_open',
                    requiresItem: 'Skeleton Key',
                    consumeItem: 'Skeleton Key',
                },
                {
                    id: 'retreat',
                    label: 'Retreat',
                    tooltip: 'You\'re not ready for this yet.',
                    nextStep: 'retreat',
                },
            ],
        },
        vault_open: {
            id: 'vault_open',
            text: '*The wards flicker and die, one by one, and the stone door grinds open with a deep rumble. Beyond lies a small chamber, untouched for centuries. Dust motes swirl in the light from your mana-glow.*\n\n*The vault contains a cache of materials and relics — marble slabs stacked neatly, a rack of preserved ward crystals, and in the center, on a stone pedestal, a memory fragment that pulses with someone else\'s consciousness.*',
            effects: [
                { type: 'add_item', target: 'Marble Slab', value: 3 },
                { type: 'add_item', target: 'Ward Crystals', value: 2 },
                { type: 'add_item', target: 'Memory Fragment', value: 1 },
                { type: 'modify_gold', value: 50 },
            ],
            isEnding: true,
        },
        ward_backlash: {
            id: 'ward_backlash',
            text: '*You channel your power into the wards, but they resist — fiercely. A surge of energy lashes back at you, draining your mana and leaving you staggering. The wards flare brighter than before, as if mocking your attempt.*\n\n*You manage to grab a few loose stones from the corridor on your way out. Small consolation.*',
            effects: [
                { type: 'custom', target: 'mana', value: -20 },
                { type: 'add_item', target: 'Stone', value: 3 },
            ],
            isEnding: true,
        },
        retreat: {
            id: 'retreat',
            text: '*You study the wards carefully, memorizing their patterns for future reference. This vault will still be here when you\'re stronger.*',
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// NEW CIRCUS EVENTS
// ══════════════════════════════════════════

const EXPLORE_CIRCUS_FORTUNE_TELLER: EventDefinition = {
    id: 'explore_circus_fortune_teller',
    name: 'Madame Vesper\'s Tent',
    description: 'A mysterious seer offers glimpses of the future.',
    icon: 'eye',
    category: 'exploration',
    startStep: 'tent',
    steps: {
        tent: {
            id: 'tent',
            text: '*A purple tent stands apart from the rest, draped in star-patterned fabric. A sign reads: "Madame Vesper — Fortunes Told, Fates Revealed, No Refunds." Inside, the air is heavy with incense smoke. A raven-feathered woman sits behind a low table covered in tarot cards.*\n\n*She looks up with knowing eyes.* "I\'ve been expecting you. Sit. The cards have something to say."',
            choices: [
                {
                    id: 'reading',
                    label: 'Accept a Reading (15 gold)',
                    tooltip: 'Let her read your fortune.',
                    nextStep: 'reading',
                    effects: [{ type: 'modify_gold', value: -15 }],
                },
                {
                    id: 'ask_cards',
                    label: 'Ask About the Cards',
                    tooltip: 'Something about the cards themselves seems unusual.',
                    nextStep: 'cards',
                },
                {
                    id: 'decline',
                    label: 'Politely Decline',
                    tooltip: 'You don\'t trust fortune tellers.',
                    nextStep: 'decline',
                },
            ],
        },
        reading: {
            id: 'reading',
            text: '*Vesper lays three cards face-down, then turns them one by one.*\n\n*The first card shows a tower struck by lightning — change, upheaval.* "Something in your household will shift soon. Be ready."\n\n*The second card depicts a figure holding chains — control, dominion.* "Your methods are... effective. But the stronger the chain, the more brittle the link. Temper strength with understanding."\n\n*The third card is blank.* "Interesting. The future is unwritten here. That means you still have a choice that matters."\n\n*She sweeps the cards away.* "That will be fifteen gold. And here — take this. You may find it useful."',
            effects: [
                { type: 'add_item', target: 'Spiritbloom', value: 1 },
                { type: 'modify_skill', target: 'wisdom', value: 1 },
            ],
            isEnding: true,
        },
        cards: {
            id: 'cards',
            text: '*You look more closely at the deck. The cards are beautiful — hand-painted on thin slices of bone rather than paper. The illustrations seem to move in the candlelight.*\n\n*Vesper notices your interest.* "These cards were made by the same civilization that built those ruins north of here. They\'re not fortune-telling tools — they\'re focusing instruments for attunement magic. Each card is a binding pattern."\n\n*She taps the deck.* "I use them for readings, yes. But a clever witch could use them for... other purposes."*\n\n*She offers you a card from the deck — a spiraling pattern that makes your eyes water if you look at it too long.*',
            effects: [
                { type: 'add_item', target: 'Spiral Incense', value: 2 },
                { type: 'modify_skill', target: 'charm', value: 1 },
            ],
            isEnding: true,
        },
        decline: {
            id: 'decline',
            text: '*Vesper shrugs.* "Your loss. The future comes whether you look at it or not."\n\n*As you leave, she calls after you:* "Come back when you\'re ready to listen. I have things to tell you about the one with the shield." *You pause — does she mean one of the heroes?*\n\n*Something to consider.*',
            isEnding: true,
        },
    },
};

const EXPLORE_CIRCUS_MENAGERIE: EventDefinition = {
    id: 'explore_circus_menagerie',
    name: 'The Menagerie',
    description: 'Exotic creatures are kept in ornate cages behind the big top.',
    icon: 'bug',
    category: 'exploration',
    startStep: 'cages',
    steps: {
        cages: {
            id: 'cages',
            text: '*Behind the main tent, a row of elaborately decorated cages holds an assortment of creatures — a phoenix chick that flickers between existence and flame, a crystalline spider spinning prismatic webs, and something in a covered cage that growls deeply when you approach.*\n\n*A bored-looking handler sits nearby, whittling.* "Look but don\'t touch. Last person who touched the spider woke up three days later with no memory of their childhood."',
            choices: [
                {
                    id: 'phoenix',
                    label: 'Study the Phoenix Chick',
                    tooltip: 'Its flames might hold alchemical value.',
                    nextStep: 'phoenix',
                },
                {
                    id: 'spider',
                    label: 'Examine the Crystal Spider',
                    tooltip: 'Those webs look like they could be useful.',
                    nextStep: 'spider',
                    skillCheck: {
                        skill: 'charm',
                        difficulty: 50,
                        successStep: 'spider_success',
                        failureStep: 'spider_fail',
                    },
                },
                {
                    id: 'covered',
                    label: 'Peek Under the Cover',
                    tooltip: 'What\'s in the covered cage?',
                    nextStep: 'covered',
                },
            ],
        },
        phoenix: {
            id: 'phoenix',
            text: '*You crouch beside the phoenix chick\'s cage, studying the way its flames cycle through colors. Fascinating — the fire follows the same elemental spectrum as brewing ingredients. Fire and light, intertwined.*\n\n*As you watch, a few loose feathers drift through the bars. They\'re warm to the touch and shimmer with inner fire — genuine embervine-quality reagents, shed naturally.*',
            effects: [
                { type: 'add_item', target: 'Embervine Root', value: 2 },
                { type: 'add_item', target: 'Sunstone Shard', value: 1 },
            ],
            isEnding: true,
        },
        spider_success: {
            id: 'spider_success',
            text: '*You approach the spider carefully, extending a tendril of calming magic. The crystalline arachnid pauses its weaving and regards you with faceted eyes — then, seemingly satisfied, returns to its work.*\n\n*You carefully harvest a section of its discarded web. The strands are like spun glass, suffused with both shadow and light essence. A rare ingredient.*\n\n*The handler looks impressed.* "Huh. Usually it tries to erase people."',
            effects: [
                { type: 'add_item', target: 'Spiritbloom', value: 1 },
                { type: 'add_item', target: 'Obsidian Dust', value: 2 },
            ],
            isEnding: true,
        },
        spider_fail: {
            id: 'spider_fail',
            text: '*You reach toward the web and the spider\'s eyes flash. A pulse of prismatic energy hits you — your vision whites out for a moment, and when it clears, you\'ve stumbled back several paces with a splitting headache.*\n\n*The handler chuckles.* "Told you not to touch. Here, take this for the headache." *They toss you a small vial.*',
            effects: [
                { type: 'add_item', target: 'Moonpetal Blossom', value: 2 },
            ],
            isEnding: true,
        },
        covered: {
            id: 'covered',
            text: '*You lift the corner of the heavy cloth. Two enormous golden eyes stare back at you from the darkness — slitted, intelligent, and distinctly unimpressed. The creature is some kind of shadow-cat, its fur seeming to absorb the light around it.*\n\n*It rumbles deep in its chest — not quite a growl, more of a purr — and pushes something through the bars with one massive paw. A cluster of dark crystals, shed from its claws.*\n\n*The handler looks up sharply.* "It likes you. That\'s never happened before. Usually it just tries to eat people\'s shadows."',
            effects: [
                { type: 'add_item', target: 'Nightshade Extract', value: 1 },
                { type: 'add_item', target: 'Mana Crystal', value: 1 },
                { type: 'modify_skill', target: 'charm', value: 1 },
            ],
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
    EXPLORE_TOWN_ALCHEMIST,
    EXPLORE_TOWN_NOTICE_BOARD,
    // Woods
    EXPLORE_WOODS_HERBS,
    EXPLORE_WOODS_TRAIL,
    EXPLORE_WOODS_HUNT,
    EXPLORE_WOODS_CAPTURE,
    // Ruins
    EXPLORE_RUINS_EXCAVATE,
    EXPLORE_RUINS_INSCRIPTIONS,
    EXPLORE_RUINS_DELVE,
    EXPLORE_RUINS_RITUAL_SITE,
    EXPLORE_RUINS_SEALED_VAULT,
    // Circus
    EXPLORE_CIRCUS_SHOW,
    EXPLORE_CIRCUS_STALLS,
    EXPLORE_CIRCUS_BACKSTAGE,
    EXPLORE_CIRCUS_FORTUNE_TELLER,
    EXPLORE_CIRCUS_MENAGERIE,
];
