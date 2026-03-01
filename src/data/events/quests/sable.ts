// ──────────────────────────────────────────
// SABLE'S QUESTLINE — "The Shadow's Trail"
// A 5-step quest to find and capture Sable the Thief
// Location: Town | Primary skills: Speed, Wisdom, Charm
// ──────────────────────────────────────────
import type { EventDefinition, EventContext, QuestDefinition } from '../../types';
import { rollSkillCheck } from '../mechanics';
import { CHUB_AVATARS } from '../../characters';

// ── Character reference ──
const SABLE_AVATAR = CHUB_AVATARS.sable;
const SABLE_COLOR = '#c4943a';

// ══════════════════════════════════════════
// STEP 1: Rumors of a Phantom (Town Tavern)
// ══════════════════════════════════════════
export const QUEST_SABLE_01_RUMORS: EventDefinition = {
    id: 'quest_sable_01_rumors',
    name: 'Rumors of a Phantom',
    description: 'Overhear gossip about a notorious thief at the tavern.',
    icon: 'message-circle',
    category: 'exploration',
    location: 'Town',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*The tavern is thick with smoke and idle chatter. You settle into a corner booth, nursing your drink, when a nearby conversation snags your attention.*\n\n*Two merchants are arguing in hushed, urgent tones. Something about a thief — one who works the market district like a ghost, leaving no trace except empty coin purses and baffled guards.*\n\n*This could be interesting...*`,
            choices: [
                {
                    id: 'listen_more',
                    label: 'Listen in (Wisdom)',
                    tooltip: 'Eavesdrop to piece together details. Wisdom check.',
                    nextStep: 'listen_check',
                },
                {
                    id: 'ask_barkeep',
                    label: 'Ask the Barkeep (Charm)',
                    tooltip: 'Charm the barkeep into sharing what they know.',
                    nextStep: 'charm_check',
                },
            ],
        },

        // Wisdom path — eavesdrop
        listen_check: {
            id: 'listen_check',
            text: '*You tilt your head, catching snatches of conversation through the noise...*',
            onEnter: (ctx: EventContext) => {
                const { roll, total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.wisdom, 45
                );
                ctx.vars.listenSuccess = success;
                const def = ctx.stage.getEventDefinition('quest_sable_01_rumors');
                if (def) {
                    def.steps['listen_check'].nextStep = success ? 'listen_success' : 'listen_fail';
                    def.steps['listen_check'].text = `*You focus through the tavern noise... [Wisdom ${total} vs DC 45 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'listen_success',
        },
        listen_success: {
            id: 'listen_success',
            text: `*You catch everything: amber-streaked tabby cat, moves like water, been hitting merchants for three weeks. Left a single amber coin — a calling card. Always works the same alley off the market square around dusk.*\n\n*More than enough to start a proper hunt.*`,
            effects: [{ type: 'custom' }], // placeholder for clue tracking
            nextStep: 'success_end',
        },
        listen_fail: {
            id: 'listen_fail',
            text: `*The conversation keeps dropping below the noise. You catch fragments — "tabby," "quick as smoke," "eastern market" — before a burst of laughter from the next table drowns them out.*\n\n*Enough to go on, but you'll need more.*`,
            nextStep: 'partial_end',
        },

        // Charm path — ask barkeep
        charm_check: {
            id: 'charm_check',
            text: '*You slide a coin across the bar with a disarming smile...*',
            onEnter: (ctx: EventContext) => {
                const { roll, total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.charm, 40
                );
                ctx.vars.charmSuccess = success;
                const def = ctx.stage.getEventDefinition('quest_sable_01_rumors');
                if (def) {
                    def.steps['charm_check'].nextStep = success ? 'charm_success' : 'charm_fail';
                    def.steps['charm_check'].text = `*You flash your most winning smile... [Charm ${total} vs DC 40 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'charm_success',
        },
        charm_success: {
            id: 'charm_success',
            text: `*The barkeep leans in conspiratorially. "Sable, they call him. Tabby cat, amber streaks, cocky grin — you'll know him when you see him. Works the market alleys near dusk. Leaves a calling card: a single amber coin. Never caught, never seen twice." He shakes his head with reluctant admiration. "Rumor is he's got a den somewhere under the warehouse district."*\n\n*A name and a pattern. That's all you need to begin.*`,
            onEnter: (ctx: EventContext) => {
                ctx.vars.learnedName = true;
                ctx.vars.learnedDen = true; // Charm path gets the den hint early
            },
            nextStep: 'success_end',
        },
        charm_fail: {
            id: 'charm_fail',
            text: `*The barkeep eyes the coin, pockets it, and shrugs. "Just some thief causing trouble. Tabby cat. Don't know more than that." He moves off to serve another customer.*\n\n*Not much, but it's a start.*`,
            nextStep: 'partial_end',
        },

        // Endings
        success_end: {
            id: 'success_end',
            text: `*You now know enough: a tabby cat named Sable, working the market district, with a hideout somewhere in the warehouse district. Time to stake him out.*`,
            image: SABLE_AVATAR,
            isEnding: true,
        },
        partial_end: {
            id: 'partial_end',
            text: `*Fragments, but a trail exists. A tabby cat working the eastern market — you'll find more if you watch the streets carefully.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 2: Staking Out (Town Market)
// ══════════════════════════════════════════
export const QUEST_SABLE_02_STAKEOUT: EventDefinition = {
    id: 'quest_sable_02_stakeout',
    name: 'Staking Out',
    description: 'Watch the market district at dusk to spot Sable\'s patterns.',
    icon: 'eye',
    category: 'exploration',
    location: 'Town',
    prerequisites: [{ type: 'event_completed', eventId: 'quest_sable_01_rumors' }],
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*The market district as the sun dips low. Merchants pack up their stalls, guards do their cursory rounds, and the real business of the evening begins in the shadows.*\n\n*Somewhere in these alleys, Sable is already at work. You need to spot him before he spots you.*`,
            choices: [
                {
                    id: 'watch_patterns',
                    label: 'Observe Patterns (Wisdom)',
                    tooltip: 'Study movement patterns to predict where Sable will strike.',
                    nextStep: 'wisdom_check',
                },
                {
                    id: 'tail_him',
                    label: 'Tail Him (Speed)',
                    tooltip: 'Move quickly through the crowd to follow your target.',
                    nextStep: 'speed_check',
                },
            ],
        },

        wisdom_check: {
            id: 'wisdom_check',
            text: '*You find a good vantage and begin reading the flow of the market...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.wisdom, 50
                );
                const def = ctx.stage.getEventDefinition('quest_sable_02_stakeout');
                if (def) {
                    def.steps['wisdom_check'].nextStep = success ? 'wisdom_success' : 'wisdom_fail';
                    def.steps['wisdom_check'].text = `*You study the crowd's patterns... [Wisdom ${total} vs DC 50 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'wisdom_success',
        },
        wisdom_success: {
            id: 'wisdom_success',
            text: `*There. A specific rhythm: a gap in the guard patrol, a particular merchant who always looks away at the same moment. You see Sable before you're looking for him — amber-streaked fur catching the last light as he slips between two stalls with practiced ease.*\n\n*He hasn't seen you. You have his pattern now. Time to follow without tipping him off.*`,
            nextStep: 'tail_check',
        },
        wisdom_fail: {
            id: 'wisdom_fail',
            text: `*Too many variables, too much noise. You catch a flash of amber fur at one point, but by the time you've processed it, the moment is gone. You're going to have to move faster.*`,
            nextStep: 'tail_check',
        },

        speed_check: {
            id: 'speed_check',
            text: '*You push through the evening crowd, trying to keep pace with your quarry...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.speed, 50
                );
                const def = ctx.stage.getEventDefinition('quest_sable_02_stakeout');
                if (def) {
                    def.steps['speed_check'].nextStep = success ? 'tail_check' : 'spotted_by_sable';
                    def.steps['speed_check'].text = `*You move quickly through the crowd... [Speed ${total} vs DC 50 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'tail_check',
        },
        spotted_by_sable: {
            id: 'spotted_by_sable',
            text: `*You move too fast, too obviously. As you round a corner, you nearly collide with an amber-streaked tabby who's leaning against the wall, coin dancing across his knuckles.*\n\n*He looks you over with sharp, golden eyes — then the coin vanishes and so does he, dissolving into the crowd before you can react.*\n\n*He's made you. This complicates things — but you got a good look at him.*`,
            onEnter: (ctx: EventContext) => {
                ctx.vars.sableSpottedYou = true;
            },
            nextStep: 'stakeout_end',
        },

        tail_check: {
            id: 'tail_check',
            text: '*You move to follow, keeping low, staying in shadow...*',
            onEnter: (ctx: EventContext) => {
                const modifier = ctx.vars.sableSpottedYou ? -15 : 0;
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.speed, 55, modifier
                );
                const def = ctx.stage.getEventDefinition('quest_sable_02_stakeout');
                if (def) {
                    def.steps['tail_check'].nextStep = success ? 'tail_success' : 'tail_fail';
                    def.steps['tail_check'].text = `*You shadow your quarry through the alleys... [Speed ${total} vs DC 55 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'tail_success',
        },
        tail_success: {
            id: 'tail_success',
            text: `*Perfect. You follow him through three alleys without a single scuff of gravel or flicker of shadow to give you away. You see him pause at a heavy iron grate set low in the warehouse district's eastern wall — then lift it, drop through, and pull it shut behind him.*\n\n*A den. You've found his den.*`,
            onEnter: (ctx: EventContext) => {
                ctx.vars.foundDen = true;
            },
            nextStep: 'stakeout_end',
        },
        tail_fail: {
            id: 'tail_fail',
            text: `*You lose him at a crossroads — three alleys, no idea which one he took. But you've mapped his general territory now. The warehouse district, eastern section.*`,
            nextStep: 'stakeout_end',
        },

        stakeout_end: {
            id: 'stakeout_end',
            text: `*Tonight's work wasn't wasted. You know his face, his territory, and possibly his route. Now you need to get ahead of him.*`,
            image: SABLE_AVATAR,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 3: The Rooftop Chase (Town)
// ══════════════════════════════════════════
export const QUEST_SABLE_03_CHASE: EventDefinition = {
    id: 'quest_sable_03_chase',
    name: 'The Rooftop Chase',
    description: 'Sable spots you — a chase through the rooftops and alleys.',
    icon: 'zap',
    category: 'exploration',
    location: 'Town',
    prerequisites: [{ type: 'event_completed', eventId: 'quest_sable_02_stakeout' }],
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*You're back in the market district the following evening, watching from a better position — when Sable suddenly turns and locks eyes with you across a crowded stall.*\n\n*For a single heartbeat, neither of you moves. Then his ears flatten and he bolts.*\n\n*The chase is on.*`,
            choices: [
                {
                    id: 'chase_rooftops',
                    label: 'Take the Rooftops (Speed)',
                    tooltip: 'Sprint across rooftops for a faster route. High speed needed.',
                    nextStep: 'rooftop_check',
                },
                {
                    id: 'chase_alleys',
                    label: 'Cut Through Alleys (Wisdom)',
                    tooltip: 'Predict his route and cut him off from below.',
                    nextStep: 'alley_check',
                },
                {
                    id: 'chase_enchant',
                    label: 'Enchant a Shortcut (Charm)',
                    tooltip: 'Weave a quick enchantment to close the distance. (15 mana)',
                    nextStep: 'enchant_check',
                    condition: (ctx: EventContext) => ctx.stage.currentState.stats.mana >= 15,
                },
            ],
        },

        rooftop_check: {
            id: 'rooftop_check',
            text: '*You vault onto a barrel, haul yourself up to the eaves, and run...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.speed, 60
                );
                const def = ctx.stage.getEventDefinition('quest_sable_03_chase');
                if (def) {
                    def.steps['rooftop_check'].nextStep = success ? 'chase_gain' : 'chase_stumble';
                    def.steps['rooftop_check'].text = `*You scramble onto the rooftops and run... [Speed ${total} vs DC 60 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'chase_gain',
        },
        alley_check: {
            id: 'alley_check',
            text: '*You don\'t chase — you predict, cutting through the lower alleys...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.wisdom, 55
                );
                const def = ctx.stage.getEventDefinition('quest_sable_03_chase');
                if (def) {
                    def.steps['alley_check'].nextStep = success ? 'chase_gain' : 'chase_lose';
                    def.steps['alley_check'].text = `*You read the district's layout and cut ahead... [Wisdom ${total} vs DC 55 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'chase_gain',
        },
        enchant_check: {
            id: 'enchant_check',
            text: '*You trace a quick glyph in the air — a blink-step enchantment...*',
            onEnter: (ctx: EventContext) => {
                ctx.stage.currentState.stats.mana -= 15;
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.charm, 50
                );
                const def = ctx.stage.getEventDefinition('quest_sable_03_chase');
                if (def) {
                    def.steps['enchant_check'].nextStep = success ? 'enchant_success' : 'chase_lose';
                    def.steps['enchant_check'].text = `*You pour mana into a quick displacement charm... [Charm ${total} vs DC 50 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'enchant_success',
        },

        enchant_success: {
            id: 'enchant_success',
            text: `*The world blurs — and you reappear half a block ahead of Sable's predicted route. He rounds the corner and nearly runs into you. The look on his face is worth the mana.*\n\n*He peels off immediately, but you're now close enough to really pressure him.*`,
            nextStep: 'chase_gain',
        },
        chase_gain: {
            id: 'chase_gain',
            text: `*You're gaining. Sable is fast — remarkably fast — but you're closing the gap. He glances back, and for the first time, something flickers in those golden eyes that might be concern.*\n\n*He cuts sharply, trying to lose you in the warren of alleyways near the warehouse district.*`,
            nextStep: 'final_sprint',
        },
        chase_stumble: {
            id: 'chase_stumble',
            text: `*A roof tile slips. You catch yourself on a chimney, losing precious seconds. Sable's already three rooftops ahead and pulling away.*\n\n*You drop back to street level — you'll have to try to cut him off.*`,
            nextStep: 'final_sprint',
        },
        chase_lose: {
            id: 'chase_lose',
            text: `*He's faster through these alleys than anyone has a right to be. By the time you've processed one route, he's already taken another. You lose him at a junction.*\n\n*But you know which direction he went. And he's rattled now — he knows you're specifically hunting him.*`,
            nextStep: 'chase_end_partial',
        },

        final_sprint: {
            id: 'final_sprint',
            text: '*The warehouse district. He\'s heading for his den. You press the advantage...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.speed, 55
                );
                const def = ctx.stage.getEventDefinition('quest_sable_03_chase');
                if (def) {
                    def.steps['final_sprint'].nextStep = success ? 'chase_end_close' : 'chase_end_partial';
                    def.steps['final_sprint'].text = `*You pour on speed for the final stretch... [Speed ${total} vs DC 55 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'chase_end_close',
        },

        chase_end_close: {
            id: 'chase_end_close',
            text: `*He ducks through an iron grate and it slams shut in your face. You grab the bars — locked from the inside.*\n\n*But through the grate, you see the tunnel he used. You know the entrance now, and more importantly, you know there's only one way out. You almost had him.*\n\n*Time to prepare properly before the final approach.*`,
            onEnter: (ctx: EventContext) => {
                ctx.vars.foundDen = true;
                ctx.vars.sableIsRattled = true;
            },
            isEnding: true,
        },
        chase_end_partial: {
            id: 'chase_end_partial',
            text: `*He's gone — but not without revealing something. The warehouse district's eastern section: that's his territory. He won't move to a new den quickly, not with his pride on the line.*\n\n*You'll find the entrance if you look carefully.*`,
            onEnter: (ctx: EventContext) => {
                ctx.vars.sableIsRattled = true;
            },
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 4: The Thieves' Den (Town Warehouse)
// ══════════════════════════════════════════
export const QUEST_SABLE_04_DEN: EventDefinition = {
    id: 'quest_sable_04_den',
    name: 'The Thieves\' Den',
    description: 'Find and enter Sable\'s hidden den in the warehouse district.',
    icon: 'door-open',
    category: 'exploration',
    location: 'Town',
    prerequisites: [{ type: 'event_completed', eventId: 'quest_sable_03_chase' }],
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*The warehouse district at night. Fog rolls in off the harbor, muffling sounds and obscuring sight lines. Somewhere beneath the cobblestones and rusting iron, Sable has made himself a lair.*\n\n*You need to find the entrance — and get through it.*`,
            choices: [
                {
                    id: 'search_carefully',
                    label: 'Search Carefully (Wisdom)',
                    tooltip: 'Methodically look for the hidden entrance.',
                    nextStep: 'search_check',
                },
                {
                    id: 'use_key',
                    label: 'Use Skeleton Key',
                    tooltip: 'A master lockpick\'s tool — bypasses any lock.',
                    nextStep: 'key_bypass',
                    requiresItem: 'Skeleton Key',
                    consumeItem: 'Skeleton Key',
                },
            ],
        },

        search_check: {
            id: 'search_check',
            text: '*You work along the warehouse wall, testing each iron grate and drain cover...*',
            onEnter: (ctx: EventContext) => {
                const modifier = ctx.vars.foundDen ? 15 : 0;
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.wisdom, 55, modifier
                );
                const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                if (def) {
                    def.steps['search_check'].nextStep = success ? 'entrance_found' : 'search_fail';
                    def.steps['search_check'].text = `*You search the warehouse perimeter... [Wisdom ${total} vs DC ${55 - modifier} — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'entrance_found',
        },
        search_fail: {
            id: 'search_fail',
            text: `*Nothing obvious. But there's a section of the wall where the mortar seems newer — a patch-up, recently done. Someone sealed something here.*\n\n*You probe along the brickwork until a section swings inward, hinged from the inside.*`,
            nextStep: 'entrance_found',
        },
        key_bypass: {
            id: 'key_bypass',
            text: `*The Skeleton Key practically hums in your hand. You slide it into the iron grate's lock — the mechanism surrenders without so much as a click. Thief-proof, except for a better thief.*`,
            nextStep: 'inside',
        },

        entrance_found: {
            id: 'entrance_found',
            text: `*There. An iron grate, slightly different from the others — the metal around the latch is worn smooth from use. The lock is complex, a six-pin tumbler with an unusual secondary mechanism.*`,
            choices: [
                {
                    id: 'pick_lock',
                    label: 'Pick the Lock (Speed)',
                    tooltip: 'Use dexterity to feel the mechanism and open it.',
                    nextStep: 'pick_check',
                },
                {
                    id: 'force_it',
                    label: 'Force It (Power)',
                    tooltip: 'Raw strength to break the lock. Noisy.',
                    nextStep: 'force_check',
                },
                {
                    id: 'use_key_here',
                    label: 'Use Skeleton Key',
                    tooltip: 'The easy solution.',
                    nextStep: 'key_bypass',
                    requiresItem: 'Skeleton Key',
                    consumeItem: 'Skeleton Key',
                },
            ],
        },

        pick_check: {
            id: 'pick_check',
            text: '*You get down to the lock\'s level and begin to work...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.speed, 60
                );
                const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                if (def) {
                    def.steps['pick_check'].nextStep = success ? 'inside' : 'pick_fail';
                    def.steps['pick_check'].text = `*You work the lock's pins with careful precision... [Speed ${total} vs DC 60 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'inside',
        },
        pick_fail: {
            id: 'pick_fail',
            text: `*One pin clicks wrong and the mechanism resets. Not your specialty. You'll need more force.*`,
            nextStep: 'force_check',
        },
        force_check: {
            id: 'force_check',
            text: '*You brace your foot against the wall and wrench...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.power, 55
                );
                const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                if (def) {
                    def.steps['force_check'].nextStep = success ? 'inside_loud' : 'cant_enter';
                    def.steps['force_check'].text = `*You put your full strength into it... [Power ${total} vs DC 55 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'inside_loud',
        },
        inside_loud: {
            id: 'inside_loud',
            text: `*The grate tears free with a screech of metal. Loud — Sable will have heard that. But you're in.*\n\n*The tunnel beyond is low-ceilinged, smelling of dust and old coin. Tiny glints of light ahead suggest another chamber.*`,
            onEnter: (ctx: EventContext) => {
                ctx.vars.enteredLoud = true;
            },
            nextStep: 'inside',
        },
        cant_enter: {
            id: 'cant_enter',
            text: `*The lock holds. And now you've rattled the grate enough that if Sable is inside, he knows someone's at the door.*\n\n*You'll need to come back with better tools — or try another way in.*`,
            isEnding: true,
        },

        inside: {
            id: 'inside',
            text: `*The den is a converted cellar — surprisingly comfortable. Maps on the walls, neatly arranged tools of the trade, a cot in the corner. A professional's workspace.*\n\n*And at the far end, perched on a stool like a cat in his own home, Sable. He's already watching the entrance. Arms crossed. A dagger resting very casually across his knee.*\n\n*"Didn't take you for a thief," he says, his voice light. "Though I suppose we're both professionals."*`,
            image: SABLE_AVATAR,
            onEnter: (ctx: EventContext) => {
                // Navigate trap check if entry was loud
                if (ctx.vars.enteredLoud) {
                    const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                    if (def) def.steps['inside'].nextStep = 'trap_check';
                }
            },
            nextStep: 'den_standoff',
        },

        trap_check: {
            id: 'trap_check',
            text: '*Your loud entry triggered something — a trip-wire?*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.speed, 50
                );
                const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                if (def) {
                    def.steps['trap_check'].nextStep = success ? 'den_standoff' : 'den_standoff_hurt';
                    def.steps['trap_check'].text = `*Something shifts under your foot... [Speed ${total} vs DC 50 — ${success ? '✓ Dodge' : '✗ Hit'}]*`;
                }
            },
            nextStep: 'den_standoff',
        },
        den_standoff_hurt: {
            id: 'den_standoff_hurt',
            text: `*A net drops from the ceiling. You rip through it — it was meant for someone smaller — but the surprise costs you. Sable watches with raised eyebrows.*\n\n*"Impressive. Most people go down for a minute." He tilts his head. "What do you want with me?"*`,
            effects: [{ type: 'modify_gold', value: -20 }], // Minor disadvantage, represented as cost
            nextStep: 'den_standoff',
        },
        den_standoff: {
            id: 'den_standoff',
            text: `*Sable watches you from across the room, golden eyes sharp and calculating. He hasn't moved from the stool, but the dagger is very much present.*\n\n*"You've been following me for three days," he says. "Nobody follows me for three days unless they're very good, very patient, or very stupid. I'm guessing not the last one." A pause. "So. What's your angle?"*\n\n*He's not running — yet. This conversation is a test.*`,
            choices: [
                {
                    id: 'be_direct',
                    label: 'Be Direct (Charm)',
                    tooltip: 'Tell him what you want — you\'re impressed by him.',
                    nextStep: 'direct_check',
                },
                {
                    id: 'offer_work',
                    label: 'Offer a Job (Wisdom)',
                    tooltip: 'Tell him you have a proposition. Play to his mercenary nature.',
                    nextStep: 'offer_check',
                },
            ],
        },

        direct_check: {
            id: 'direct_check',
            text: '*You hold his gaze and speak plainly...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.charm, 55
                );
                const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                if (def) {
                    def.steps['direct_check'].nextStep = success ? 'direct_success' : 'direct_fail';
                    def.steps['direct_check'].text = `*You meet his eyes and speak plainly... [Charm ${total} vs DC 55 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'direct_success',
        },
        offer_check: {
            id: 'offer_check',
            text: '*You offer a job, merchant-style — all business...*',
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(
                    ctx.stage.currentState.stats.skills.wisdom, 50
                );
                const def = ctx.stage.getEventDefinition('quest_sable_04_den');
                if (def) {
                    def.steps['offer_check'].nextStep = success ? 'offer_success' : 'direct_fail';
                    def.steps['offer_check'].text = `*You propose a professional arrangement... [Wisdom ${total} vs DC 50 — ${success ? '✓ Success' : '✗ Fail'}]*`;
                }
            },
            nextStep: 'offer_success',
        },

        direct_success: {
            id: 'direct_success',
            text: `*For a long moment, Sable holds your gaze. Then the dagger disappears — somewhere, you don't see where — and he leans back on the stool.*\n\n*"You're either telling the truth or you're a better liar than me," he says. "Either way, I'm intrigued." He stands, a fluid motion, and extends a hand. "We'll talk terms. I warn you — I'm not cheap, and I'm not tame."*\n\n*A beginning, not a surrender. But it's enough.*`,
            nextStep: 'den_end',
        },
        offer_success: {
            id: 'offer_success',
            text: `*Sable considers this. The mercenary angle — just business — is something he can wrap his instincts around. The suspicion in his eyes doesn't go away, but it shifts to calculation.*\n\n*"Fine," he says at last. "I'll hear the terms. But I'm keeping the knife." He grins. "Old habit."*`,
            nextStep: 'den_end',
        },
        direct_fail: {
            id: 'direct_fail',
            text: `*Something in your tone trips a wire. His eyes narrow, and the casual posture shifts to coiled readiness.*\n\n*"I think we're done talking," he says, and the dagger is suddenly in his hand. "I'm going to leave now. You can try to stop me — or not. I recommend not."*\n\n*He doesn't wait for an answer. A section of the wall swings open and he's gone, leaving you in the empty den.*\n\n*But he'll come back. This is his home. And now you know every inch of it.*`,
            nextStep: 'den_end',
        },

        den_end: {
            id: 'den_end',
            text: `*The pieces are in place. You've been in Sable's den, seen his face, mapped his routes. Now it's time to corner him — properly, this time, with no escape.*`,
            image: SABLE_AVATAR,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 5: Confrontation — "Cornering the Cat"
// Mechanic: Escape Prevention
// ══════════════════════════════════════════

const TOTAL_ESCAPE_ROUNDS = 4;
const ESCAPES_TO_WIN = 3;

const ESCAPE_ATTEMPTS = [
    {
        id: 'window',
        label: 'Window Leap',
        text: '*Sable makes his move — a sprint toward the high window, already calculating the drop.*',
        successText: '*He hits the glass and finds it sealed. Your preparation paid off.*',
        failText: '*The window shatters and he\'s gone — you hear him land cleanly one floor down. He scrambles back up, winded but free for now.*',
    },
    {
        id: 'trapdoor',
        label: 'Hidden Trapdoor',
        text: '*His foot finds the trapdoor in the floor — a backup he never thought you\'d find.*',
        successText: '*Click. You sealed the trapdoor with an enchantment on your way in. His expression when it doesn\'t open is almost worth the whole hunt.*',
        failText: '*He drops through before you can close the distance. Seconds later his hand appears in the gap and slams it shut behind him. You rip it open — the tunnel beyond is empty.*',
    },
    {
        id: 'secret_passage',
        label: 'Secret Passage',
        text: '*He moves to a specific brick — you\'ve seen this before. A hidden door behind the shelving.*',
        successText: '*You\'re already there, back against the passage entrance. He pulls the shelving aside and finds you smiling at him. The passage is blocked.*',
        failText: '*He slips behind the shelving and through the passage. You hear his footsteps — then silence. He circled back. You see the glint of amber eyes from the corner.*',
    },
    {
        id: 'smoke_bomb',
        label: 'Smoke Bomb',
        text: '*His hand moves to his belt — one of those little glass vials he keeps there.*',
        successText: '*"I wouldn\'t," you say, and the enchantment in your palm pulses. The vial shatters harmlessly in his hand, already neutralized by your aura.*',
        failText: '*The room fills with acrid smoke. You hear him moving — toward you? Away? When it clears, he\'s backed into the far corner, coughing, having lost the advantage.*',
    },
];

const BLOCK_ACTIONS = [
    {
        id: 'block_speed',
        label: 'Block Route (Speed)',
        tooltip: 'Move fast to physically cut off his escape.',
        skill: 'speed' as const,
        dc: 55,
    },
    {
        id: 'predict_wisdom',
        label: 'Predict Route (Wisdom)',
        tooltip: 'Anticipate where he\'s going and be there already.',
        skill: 'wisdom' as const,
        dc: 50,
    },
    {
        id: 'enchant_charm',
        label: 'Enchant Block (Charm)',
        tooltip: 'Seal the route with a binding enchantment. (20 mana)',
        skill: 'charm' as const,
        dc: 45,
        manaCost: 20,
    },
];

export function buildSableConfrontation(): EventDefinition {
    const steps: Record<string, any> = {};

    // ── INTRO ──
    steps['intro'] = {
        id: 'intro',
        text: '',
        onEnter: (ctx: EventContext) => {
            ctx.vars.escapesBlocked = 0;
            ctx.vars.escapesLost = 0;
            ctx.vars.overconfidenceTriggered = false;
            const def = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
            if (def) {
                def.steps['intro'].text = `*You've sealed the exits. Every window latched, every passage warded, the trapdoor's latch jammed. This time, there's nowhere for him to run.*\n\n*Sable stands in the centre of his den, arms loose at his sides, golden eyes tracking you with that maddening composure. The dagger is out — held easy, not threatening. Not yet.*\n\n*"You've been busy," he says. His tail flicks once. "I'm going to try to leave now. We'll see how this goes."*`;
            }
        },
        nextStep: 'round_1_escape',
    };

    // ── ROUNDS ──
    for (let i = 0; i < TOTAL_ESCAPE_ROUNDS; i++) {
        const round = i + 1;
        const escape = ESCAPE_ATTEMPTS[i];

        // Escape attempt announcement
        steps[`round_${round}_escape`] = {
            id: `round_${round}_escape`,
            text: '',
            onEnter: (ctx: EventContext) => {
                const blocked = ctx.vars.escapesBlocked ?? 0;
                const progressBar = '▓'.repeat(blocked) + '░'.repeat(ESCAPES_TO_WIN - blocked);
                const def = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
                if (def) {
                    def.steps[`round_${round}_escape`].text = `*${escape.text}*\n\n**Escape routes blocked: [${progressBar}] ${blocked}/${ESCAPES_TO_WIN}**`;
                }
                // Check for overconfidence trigger
                if (blocked >= 2 && !ctx.vars.overconfidenceTriggered) {
                    ctx.vars.overconfidenceTriggered = true;
                    const def2 = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
                    if (def2) {
                        def2.steps[`round_${round}_escape`].text += `\n\n*[icon:alert-triangle] A flash of something crosses Sable's face — not quite panic, but wounded pride. He's been blocked too many times. You can feel the shift in his posture: all that careful restraint replaced by reckless certainty. He's going to try something direct.*`;
                        def2.steps[`round_${round}_escape`].nextStep = 'overconfidence_moment';
                    }
                }
            },
            choices: BLOCK_ACTIONS.map(action => ({
                id: `${action.id}_r${round}`,
                label: action.label,
                tooltip: action.tooltip,
                nextStep: `round_${round}_resolve_${action.id}`,
                condition: action.manaCost
                    ? (ctx: EventContext) => ctx.stage.currentState.stats.mana >= action.manaCost
                    : undefined,
            })),
        };

        // Resolve each action
        for (const action of BLOCK_ACTIONS) {
            steps[`round_${round}_resolve_${action.id}`] = {
                id: `round_${round}_resolve_${action.id}`,
                text: '',
                onEnter: (ctx: EventContext) => {
                    if (action.manaCost) {
                        ctx.stage.currentState.stats.mana -= action.manaCost;
                    }
                    const { total, success } = rollSkillCheck(
                        ctx.stage.currentState.stats.skills[action.skill],
                        action.dc
                    );

                    let resultText = `*[${action.skill.charAt(0).toUpperCase() + action.skill.slice(1)} ${total} vs DC ${action.dc} — ${success ? '✓ Success' : '✗ Fail'}]*\n\n`;

                    if (success) {
                        ctx.vars.escapesBlocked = (ctx.vars.escapesBlocked ?? 0) + 1;
                        resultText += escape.successText;
                    } else {
                        ctx.vars.escapesLost = (ctx.vars.escapesLost ?? 0) + 1;
                        resultText += escape.failText;
                    }

                    const def = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
                    if (def) {
                        const blocked = ctx.vars.escapesBlocked ?? 0;
                        const nextRound = round + 1;
                        let nextStep: string;

                        if (blocked >= ESCAPES_TO_WIN) {
                            nextStep = 'victory';
                        } else if (nextRound > TOTAL_ESCAPE_ROUNDS) {
                            nextStep = 'last_stand';
                        } else {
                            nextStep = `round_${nextRound}_escape`;
                        }

                        def.steps[`round_${round}_resolve_${action.id}`].nextStep = nextStep;
                        def.steps[`round_${round}_resolve_${action.id}`].text = resultText;
                    }
                },
                nextStep: round < TOTAL_ESCAPE_ROUNDS ? `round_${round + 1}_escape` : 'last_stand',
            };
        }
    }

    // ── OVERCONFIDENCE MOMENT ──
    steps['overconfidence_moment'] = {
        id: 'overconfidence_moment',
        text: `*His overconfidence is your opening. Sable abandons his careful retreats and comes at you directly — dagger forward, fast and reckless. A beautiful opening.*`,
        onEnter: (ctx: EventContext) => {
            ctx.vars.escapesBlocked = (ctx.vars.escapesBlocked ?? 0) + 1;
        },
        nextStep: 'victory',
    };

    // ── LAST STAND ──
    steps['last_stand'] = {
        id: 'last_stand',
        text: '',
        onEnter: (ctx: EventContext) => {
            const blocked = ctx.vars.escapesBlocked ?? 0;
            const def = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
            if (def) {
                if (blocked >= 2) {
                    def.steps['last_stand'].text = `*He's run out of routes. Every exit sealed or occupied. Sable stands in the center of the room, chest heaving, golden eyes blazing with something between fury and reluctant respect.*\n\n*"Fine," he says at last, biting the word off. "Fine. You're better than I thought." A pause. "Don't expect this to become a habit."*`;
                    def.steps['last_stand'].nextStep = 'victory';
                } else {
                    def.steps['last_stand'].text = `*The den is getting smaller and smaller. Sable is running out of moves, but so are you — you're exhausted, and he still looks like he has options you haven't anticipated.*\n\n*Time to end this, one way or another.*`;
                }
            }
        },
        choices: [
            {
                id: 'final_enchant',
                label: 'Final Enchantment (Charm)',
                tooltip: 'Pour everything into a binding enchantment. (All remaining mana)',
                nextStep: 'final_check',
            },
            {
                id: 'final_corner',
                label: 'Drive Him Back (Speed)',
                tooltip: 'Force him into the last corner with sheer pressure.',
                nextStep: 'final_speed_check',
            },
        ],
    };

    steps['final_check'] = {
        id: 'final_check',
        text: '*You pour mana into the binding...*',
        onEnter: (ctx: EventContext) => {
            const mana = ctx.stage.currentState.stats.mana;
            const modifier = Math.floor(mana / 5);
            ctx.stage.currentState.stats.mana = 0;
            const { total, success } = rollSkillCheck(
                ctx.stage.currentState.stats.skills.charm, 55, modifier
            );
            const def = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
            if (def) {
                def.steps['final_check'].nextStep = success ? 'victory' : 'narrow_escape';
                def.steps['final_check'].text = `*You channel every drop of remaining mana... [Charm ${total} vs DC 55 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'victory',
    };

    steps['final_speed_check'] = {
        id: 'final_speed_check',
        text: '*You close the gap with everything you have...*',
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(
                ctx.stage.currentState.stats.skills.speed, 60
            );
            const def = ctx.stage.getEventDefinition('quest_sable_05_confrontation');
            if (def) {
                def.steps['final_speed_check'].nextStep = success ? 'victory' : 'narrow_escape';
                def.steps['final_speed_check'].text = `*You drive him into the corner... [Speed ${total} vs DC 60 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'victory',
    };

    // ── NARROW ESCAPE ──
    steps['narrow_escape'] = {
        id: 'narrow_escape',
        text: `*He slips through — barely. You catch a flash of amber as he scrambles through a gap you hadn't sealed properly, and then he's gone.*\n\n*But he left his dagger behind. And half his coin. He'll be back for both.*\n\n*This isn't over — but you learned something today. Next time, there's no gap you haven't checked.*`,
        isEnding: true,
    };

    // ── VICTORY ──
    steps['victory'] = {
        id: 'victory',
        text: `*It's over.*\n\n*Sable is backed into the last corner of the den, one hand raised — not in surrender, exactly. In acknowledgment. His golden eyes flick around the room one last time, cataloguing exits that no longer exist, and then something settles in his posture.*\n\n*"I'll give you this," he says, very quietly. "I didn't see this coming." A pause. "That's... rare."*\n\n*The binding enchantment settles around him like a second skin — subtle enough that a passerby wouldn't notice, firm enough that there's nowhere left to run.*\n\n*Sable has been captured.*`,
        image: SABLE_AVATAR,
        effects: [
            { type: 'set_hero_status', target: 'Sable', status: 'captured' },
        ],
        isEnding: true,
    };

    return {
        id: 'quest_sable_05_confrontation',
        name: 'Cornering the Cat',
        description: 'The final confrontation with Sable in his own den.',
        icon: 'zap',
        category: 'combat',
        location: 'Town',
        prerequisites: [{ type: 'event_completed', eventId: 'quest_sable_04_den' }],
        startStep: 'intro',
        steps,
    };
}

// ══════════════════════════════════════════
// SABLE'S QUEST DEFINITION
// ══════════════════════════════════════════
export const SABLE_QUEST: QuestDefinition = {
    id: 'quest_sable',
    name: 'The Shadow\'s Trail',
    description: 'Track down Sable, the elusive tabby thief, through the alleys and rooftops of town.',
    icon: 'eye',
    heroName: 'Sable',
    steps: [
        {
            id: 'rumors',
            name: 'Rumors of a Phantom',
            description: 'Gather information about a mysterious thief working the market district.',
            eventId: 'quest_sable_01_rumors',
            location: 'Town',
            icon: 'message-circle',
        },
        {
            id: 'stakeout',
            name: 'Staking Out',
            description: 'Stake out the market district at dusk to observe Sable\'s patterns.',
            eventId: 'quest_sable_02_stakeout',
            location: 'Town',
            icon: 'eye',
        },
        {
            id: 'chase',
            name: 'The Rooftop Chase',
            description: 'Sable has spotted you — give chase across rooftops and alleys.',
            eventId: 'quest_sable_03_chase',
            location: 'Town',
            icon: 'zap',
        },
        {
            id: 'den',
            name: 'The Thieves\' Den',
            description: 'Find and breach Sable\'s hidden den in the warehouse district.',
            eventId: 'quest_sable_04_den',
            location: 'Town',
            icon: 'door-open',
        },
        {
            id: 'confrontation',
            name: 'Cornering the Cat',
            description: 'The final showdown — corner Sable in his den with no escape.',
            eventId: 'quest_sable_05_confrontation',
            location: 'Town',
            icon: 'crosshair',
        },
    ],
};
