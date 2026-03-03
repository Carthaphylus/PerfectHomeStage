// ──────────────────────────────────────────
// VERIDIAN'S QUESTLINE — "The Wandering Shepherd"
// A 5-step quest to find and capture Veridian the Forest Cleric
// Location: Town → Woods | Primary skills: Charm, Wisdom, Power
// ──────────────────────────────────────────
import type { EventDefinition, EventContext, QuestDefinition } from '../../types';
import { rollSkillCheck } from '../mechanics';
import { CHUB_AVATARS } from '../../characters';

// ── Character reference ──
const VERIDIAN_AVATAR = CHUB_AVATARS.veridian;

// ══════════════════════════════════════════
// STEP 1: The Street Sermon (organic: EXPLORE_TOWN_STREETS)
// ══════════════════════════════════════════
export const QUEST_VERIDIAN_01_SERMON: EventDefinition = {
    id: 'quest_veridian_01_sermon',
    name: 'The Street Sermon',
    description: 'Find the forest cleric preaching in the town square.',
    icon: 'heart',
    category: 'exploration',
    location: 'Town',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*The town square is louder than usual. A small crowd has gathered around a figure standing on the low stone wall beside the fountain — a doe with dappled brown fur and a travelling cleric's staff. She speaks in a clear, earnest voice.*\n\n*"...and this corruption does not come from the forest. It comes from within — from the fear that turns neighbors into strangers and strangers into enemies. The witch you speak of is a symptom, not the cause."*\n\n*The crowd is mixed: a few nodding, a few grumbling, several who look genuinely moved. She's interesting.*`,
            choices: [
                {
                    id: 'listen',
                    label: 'Listen to the Sermon',
                    tooltip: 'Hear what she has to say.',
                    nextStep: 'listen_sermon',
                },
                {
                    id: 'approach',
                    label: 'Approach After She Finishes',
                    tooltip: 'Wait for the crowd to thin and introduce yourself.',
                    nextStep: 'approach_after',
                },
            ],
        },
        listen_sermon: {
            id: 'listen_sermon',
            text: `*You stay for the rest of the sermon. She's sincere — not a performer, not a grifter. She genuinely believes every word, and it shows in the way her voice catches when she speaks about the sick she's treated, the villages hollowed out by fear.*\n\n*When she climbs down, you're one of three people still standing nearby. She notices.*\n\n*"You were listening carefully," she says. Not an accusation — curious. Her amber eyes are warm but direct.*`,
            nextStep: 'first_exchange',
        },
        approach_after: {
            id: 'approach_after',
            text: `*The crowd disperses slowly. She stows her staff and accepts a cup of water from an old woman in the front — you note the easy warmth between them. She's been here before.*\n\n*When the last stragglers drift away, you step forward. She sees you coming and doesn't back away.*\n\n*"Were you listening?" she asks.*`,
            nextStep: 'first_exchange',
        },
        first_exchange: {
            id: 'first_exchange',
            text: `*"A little," you say.*\n\n*"The witch's name is Citrine," she says, without preamble. "The people here are afraid of the manor. I've spent a month trying to tell them that fear is the real danger."*\n\n*She pauses.* "I would rather speak with Citrine directly. I believe in direct conversation — it tends to clarify things."*\n\n*That is either very principled or very naive. Quite possibly both.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 2: The Tavern Debate (organic: EXPLORE_TOWN_TAVERN)
// ══════════════════════════════════════════
export const QUEST_VERIDIAN_02_DEBATE: EventDefinition = {
    id: 'quest_veridian_02_debate',
    name: 'The Tavern Debate',
    description: 'Find Veridian debating the townspeople about the nature of corruption.',
    icon: 'message-circle',
    category: 'exploration',
    location: 'Town',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*You find Veridian at a corner table, deep in what appears to be a theological argument with a merchant twice her size. The merchant is red in the face; she is completely calm.*\n\n*"I'm not saying the manor isn't dangerous," she's saying. "I'm saying that burning it down only displaces the problem. You cannot defeat darkness by making more of it."*\n\n*The merchant splutters. She sees you come in and, after a moment, gives you a look that is clearly asking for rescue.*`,
            choices: [
                {
                    id: 'join_debate',
                    label: 'Join the Debate (Charm)',
                    tooltip: 'Help defuse the argument diplomatically.',
                    nextStep: 'debate_check',
                },
                {
                    id: 'wait',
                    label: 'Wait for It to End',
                    tooltip: "Let her handle it — you'll talk after.",
                    nextStep: 'wait_end',
                },
            ],
        },
        debate_check: {
            id: 'debate_check',
            text: `*You step in with a few well-chosen words...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.charm, 50);
                const def = ctx.stage.getEventDefinition('quest_veridian_02_debate');
                if (def) {
                    if (success) {
                        def.steps['debate_check'].text = `*[Charm ${total} vs DC 50 — ✓ Success]*\n\n*You redirect the merchant's fury toward something more practical — economic concerns, seasonal crops, things he can actually do something about. He grumbles himself out the door.*\n\n*Veridian watches him go and turns to you with a small, tired smile. "Thank you. He's been like that for an hour."*`;
                        def.steps['debate_check'].nextStep = 'gratitude';
                    } else {
                        def.steps['debate_check'].text = `*[Charm ${total} vs DC 50 — ✗ Fail]*\n\n*Your attempt to intervene gives the merchant a new target. Veridian skillfully extracts both of you from the argument with a polite deflection, but it takes another ten minutes.*\n\n*"The effort was appreciated," she says diplomatically.*`;
                        def.steps['debate_check'].nextStep = 'after_debate';
                    }
                }
            },
            nextStep: 'gratitude',
        },
        wait_end: {
            id: 'wait_end',
            text: `*The merchant eventually runs out of steam under her patient counter-arguments. He leaves more frustrated than convinced.*\n\n*She sighs, takes a long drink, and notices you're still there.*`,
            nextStep: 'after_debate',
        },
        gratitude: {
            id: 'gratitude',
            text: `*She's an unusual cleric — practical, wry, not inclined toward sanctimony. She asks questions before she offers opinions, which is rare.*\n\n*"I'm going to the Forest Shrine in a day or two," she says at last. "I believe something is causing the local unrest — a spiritual imbalance, old magic disturbed. I'd rather see it myself than guess."*\n\n*She stands, gathering her things. "The Forest Shrine, if you're curious."*\n\n*You find that you are.*`,
            effects: [
                { type: 'modify_skill', target: 'charm', value: 1 },
                { type: 'modify_skill', target: 'wisdom', value: 1 },
            ],
            isEnding: true,
        },
        after_debate: {
            id: 'after_debate',
            text: `*She mentions, in passing, that she's heading to the Forest Shrine soon — she believes something there is causing the local unrest, and she'd rather see it herself.*\n\n*"The old magic doesn't lie," she says. "People do."*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 3: Into the Woods (organic: EXPLORE_WOODS_TRAIL)
// ══════════════════════════════════════════
export const QUEST_VERIDIAN_03_TRAIL: EventDefinition = {
    id: 'quest_veridian_03_trail',
    name: 'Into the Woods',
    description: "Follow Veridian's trail as she heads toward the Forest Shrine.",
    icon: 'compass',
    category: 'exploration',
    location: 'Woods',
    startStep: 'trail',
    steps: {
        trail: {
            id: 'trail',
            text: `*The path into the woods carries signs of recent passage — a heel mark here, a bent branch there, small careful marks scratched into bark at intervals. Not territorial. Navigational. Someone leaving themselves a trail to follow back.*\n\n*Veridian. She's been this way recently.*`,
            choices: [
                {
                    id: 'follow_signs',
                    label: 'Follow the Trail Markers (Wisdom)',
                    tooltip: 'Track her path through the forest.',
                    nextStep: 'trail_check',
                },
                {
                    id: 'call_out',
                    label: 'Call Out',
                    tooltip: 'Simply announce your presence.',
                    nextStep: 'call_end',
                },
            ],
        },
        trail_check: {
            id: 'trail_check',
            text: `*You follow the subtle marks through the underbrush...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 50);
                const def = ctx.stage.getEventDefinition('quest_veridian_03_trail');
                if (def) {
                    if (success) {
                        def.steps['trail_check'].text = `*[Wisdom ${total} vs DC 50 — ✓ Success]*\n\n*The marks lead you to a small clearing where Veridian is resting, sitting with her back to a tree and her staff across her knees. She doesn't look alarmed when she hears you approach.*\n\n*"I wondered if you'd follow," she says, without opening her eyes.*`;
                        def.steps['trail_check'].nextStep = 'found_her';
                    } else {
                        def.steps['trail_check'].text = `*[Wisdom ${total} vs DC 50 — ✗ Fail]*\n\n*You lose the trail where it crosses a stream. You spend time searching before finding her by chance — sitting in a patch of sunlight, eating bread and reading.*\n\n*She looks up. "You went wide," she says helpfully.*`;
                        def.steps['trail_check'].nextStep = 'found_her';
                    }
                }
            },
            nextStep: 'found_her',
        },
        call_end: {
            id: 'call_end',
            text: `*You call her name into the trees.*\n\n*A pause, and then: "Over here."*\n\n*She's sitting on a log about thirty meters off the path, staff beside her, giving you an expression that suggests she finds your directness either refreshing or alarming.*`,
            nextStep: 'found_her',
        },
        found_her: {
            id: 'found_her',
            text: `*She explains what she's looking for: a resonance disturbance near the Forest Shrine, old magic agitated by something. She's been feeling it for weeks — a wrongness in the spiritual frequency of the eastern forest.*\n\n*"Something has disturbed the balance," she says. "I need to see the shrine to understand what." She pauses, studying you. "You're not here by accident, are you?"*\n\n*You give her a neutral smile. She sighs.*\n\n*"The shrine is another hour north. Try to keep up."*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 4: The Forest Shrine (organic: EXPLORE_WOODS_HUNT)
// ══════════════════════════════════════════
export const QUEST_VERIDIAN_04_SHRINE: EventDefinition = {
    id: 'quest_veridian_04_shrine',
    name: 'The Forest Shrine',
    description: 'Find Veridian performing a ritual at the ancient Forest Shrine.',
    icon: 'sparkles',
    category: 'exploration',
    location: 'Woods',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: `*The Forest Shrine is a circle of standing stones, ancient and moss-covered, with a shallow basin at the center. The air around it hums faintly — not unpleasant, more like standing near a waterfall.*\n\n*Veridian is at the basin, staff raised, eyes closed. The glow around her hands is soft and steady — serious working, not ceremony. She's deep in something.*`,
            choices: [
                {
                    id: 'observe',
                    label: 'Study the Ritual (Wisdom)',
                    tooltip: "Watch with a practitioner's eye.",
                    nextStep: 'observe_check',
                },
                {
                    id: 'wait_quietly',
                    label: 'Wait Quietly',
                    tooltip: "Don't interrupt sacred work.",
                    nextStep: 'wait_end',
                },
            ],
        },
        observe_check: {
            id: 'observe_check',
            text: `*You study the ritual carefully...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 55);
                const def = ctx.stage.getEventDefinition('quest_veridian_04_shrine');
                if (def) {
                    if (success) {
                        def.steps['observe_check'].text = `*[Wisdom ${total} vs DC 55 — ✓ Success]*\n\n*You recognize the pattern — a resonance check, using the shrine as an amplifier to map spiritual disturbances. And you can see what she's finding: there is a disturbance here, something that wasn't there before.*\n\n*Her wards are open during the ritual. She's concentrating so deeply that her defenses are down — a fact that doesn't escape your notice.*`;
                        def.steps['observe_check'].nextStep = 'ritual_complete';
                    } else {
                        def.steps['observe_check'].text = `*[Wisdom ${total} vs DC 55 — ✗ Fail]*\n\n*The ritual is clearly powerful but the specifics escape you — different tradition, different notation. You can tell she's working hard, and that whatever she's finding isn't reassuring.*`;
                        def.steps['observe_check'].nextStep = 'ritual_complete';
                    }
                }
            },
            nextStep: 'ritual_complete',
        },
        wait_end: {
            id: 'wait_end',
            text: `*You find a stone to sit on and wait. The ritual takes about twenty minutes. When she lowers her staff and opens her eyes, she's paler than before.*`,
            nextStep: 'ritual_complete',
        },
        ritual_complete: {
            id: 'ritual_complete',
            text: `*"It's worse than I thought," she says.*\n\n*She turns, and for the first time she looks genuinely troubled. "There's a focal point. Something concentrating the imbalance. It isn't the witch in the manor — or at least, not only. There's something older involved."*\n\n*She looks at you with those warm, direct eyes.* "You know more than you're saying. About the manor, about what's happening here."*\n\n*She waits.*`,
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'custom', target: 'mana', value: 15 },
            ],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 5: The Gentle Breaking (Quest panel — final, captureQuest)
// ══════════════════════════════════════════
const WARD_ROUNDS = 4;
const WARDS_TO_BREACH = 3;

interface WardAttempt {
    text: string;
    successText: string;
    failText: string;
}

const WARD_ATTEMPTS: WardAttempt[] = [
    {
        text: "Her first ward — a gentle but firm barrier of divine light — pulses as you step forward. She stands her ground, staff raised, expression resolute.",
        successText: `*Your words find a crack in the light. She flinches — not from pain, but from recognition. Something you said touched something real.*`,
        failText: `*The ward holds. She shakes her head, sad rather than triumphant. "You don't have to do this," she says.*`,
    },
    {
        text: "The second ward rises — deeper, more personal. It reflects something back at you: the weight of what you're asking her to consider.",
        successText: `*You meet the reflection honestly and push through it. The ward wavers, surprised by the sincerity.*`,
        failText: `*You can't quite find the right approach. The ward holds, and she takes a slow step back toward the shrine's center.*`,
    },
    {
        text: "Her wards are fraying, but she's reaching for more — calling on her faith like armor, reinforcing it with prayer.",
        successText: `*You meet faith with vulnerability. Not manipulation — something real. The armor softens where it shouldn't be hard.*`,
        failText: `*Her faith is stronger than you anticipated. The ward firms up, brighter than before.*`,
    },
    {
        text: "One more. She's running low but not empty — her compassion and her stubbornness are fighting each other now.",
        successText: `*Compassion wins. It always does, with her. You see the exact moment she reaches the end of her resistance.*`,
        failText: `*Stubbornness wins this round. She sets her jaw and holds.*`,
    },
];

const REACH_ACTIONS = [
    { id: 'appeal',      label: 'Emotional Appeal (Charm)',     tooltip: 'Reach her through her compassion.',          skill: 'charm' as const, dc: 58 },
    { id: 'theological', label: 'Theological Argument (Wisdom)', tooltip: 'Engage her faith on its own terms.',         skill: 'wisdom' as const, dc: 60 },
    { id: 'suppress',    label: 'Suppress the Ward (Power)',     tooltip: 'Use raw magical force to push through.',     skill: 'power' as const, dc: 63 },
];

export function buildVeridianConfrontation(): EventDefinition {
    const steps: EventDefinition['steps'] = {};

    steps['intro'] = {
        id: 'intro',
        text: '',
        onEnter: (ctx: EventContext) => {
            ctx.vars.wardsBreached = 0;
            ctx.vars.wardsFailed = 0;
            ctx.vars.compassionTriggered = false;
            const def = ctx.stage.getEventDefinition('quest_veridian_05_confrontation');
            if (def) {
                def.steps['intro'].text = `*The Forest Shrine, at dusk. Veridian is at the basin — but she turns before you clear the last standing stone.*\n\n*"You're here to take me to the manor," she says. Not a question.*\n\n*"I've seen what it does to people," she continues quietly. "I've treated three who escaped. I know what Citrine is." She lifts her staff. "And I know you work for him."*\n\n*The light around her intensifies. Her wards are fully raised.*\n\n*"I don't want to hurt you," she says. "But I won't go quietly."*`;
            }
        },
        nextStep: 'round_1_ward',
    };

    for (let i = 0; i < WARD_ROUNDS; i++) {
        const round = i + 1;
        const ward = WARD_ATTEMPTS[i];

        steps[`round_${round}_ward`] = {
            id: `round_${round}_ward`,
            text: '',
            onEnter: (ctx: EventContext) => {
                const breached = ctx.vars.wardsBreached ?? 0;
                const progressBar = '▓'.repeat(breached) + '░'.repeat(WARDS_TO_BREACH - breached);
                const def = ctx.stage.getEventDefinition('quest_veridian_05_confrontation');
                if (def) {
                    def.steps[`round_${round}_ward`].text = `*${ward.text}*\n\n**Wards breached: [${progressBar}] ${breached}/${WARDS_TO_BREACH}**`;
                }
                if (breached >= 2 && !ctx.vars.compassionTriggered) {
                    ctx.vars.compassionTriggered = true;
                    const def2 = ctx.stage.getEventDefinition('quest_veridian_05_confrontation');
                    if (def2) {
                        def2.steps[`round_${round}_ward`].text += `\n\n*[icon:heart] Her wards are faltering and something crosses her face — not defeat, but exhaustion. She's been fighting her own compassion as much as she's fighting you. She wants to help. That's the crack in everything.*`;
                        def2.steps[`round_${round}_ward`].nextStep = 'compassion_break';
                    }
                }
            },
            choices: REACH_ACTIONS.map(action => ({
                id: `${action.id}_r${round}`,
                label: action.label,
                tooltip: action.tooltip,
                nextStep: `round_${round}_resolve_${action.id}`,
            })),
        };

        for (const action of REACH_ACTIONS) {
            steps[`round_${round}_resolve_${action.id}`] = {
                id: `round_${round}_resolve_${action.id}`,
                text: '',
                onEnter: (ctx: EventContext) => {
                    const { total, success } = rollSkillCheck(
                        ctx.stage.currentState.stats.skills[action.skill],
                        action.dc
                    );
                    const label = action.skill.charAt(0).toUpperCase() + action.skill.slice(1);
                    let resultText = `*[${label} ${total} vs DC ${action.dc} — ${success ? '✓ Success' : '✗ Fail'}]*\n\n`;
                    if (success) {
                        ctx.vars.wardsBreached = (ctx.vars.wardsBreached ?? 0) + 1;
                        resultText += ward.successText;
                    } else {
                        ctx.vars.wardsFailed = (ctx.vars.wardsFailed ?? 0) + 1;
                        resultText += ward.failText;
                    }
                    const def = ctx.stage.getEventDefinition('quest_veridian_05_confrontation');
                    if (def) {
                        const breached = ctx.vars.wardsBreached ?? 0;
                        const nextRound = round + 1;
                        let nextStep: string;
                        if (breached >= WARDS_TO_BREACH) {
                            nextStep = 'wards_down';
                        } else if (nextRound > WARD_ROUNDS) {
                            nextStep = 'last_stand';
                        } else {
                            nextStep = `round_${nextRound}_ward`;
                        }
                        def.steps[`round_${round}_resolve_${action.id}`].nextStep = nextStep;
                        def.steps[`round_${round}_resolve_${action.id}`].text = resultText;
                    }
                },
                nextStep: round < WARD_ROUNDS ? `round_${round + 1}_ward` : 'last_stand',
            };
        }
    }

    // ── COMPASSION BREAK ──
    steps['compassion_break'] = {
        id: 'compassion_break',
        text: `*Her compassion wins. It couldn't not — it's the whole of her. She can't maintain wards against someone she's trying to help, and you've made it clear enough that you need it.*\n\n*The light fades. She lowers her staff, slowly.*`,
        onEnter: (ctx: EventContext) => {
            ctx.vars.wardsBreached = (ctx.vars.wardsBreached ?? 0) + 1;
        },
        nextStep: 'wards_down',
    };

    // ── LAST STAND ──
    steps['last_stand'] = {
        id: 'last_stand',
        text: `*She's down to her last reserves — and so are you. One final exchange decides everything.*`,
        choices: [
            {
                id: 'final_appeal',
                label: 'Final Appeal to Her Heart (Charm)',
                tooltip: 'Reach her at the deepest level.',
                nextStep: 'final_charm_check',
            },
            {
                id: 'final_suppress',
                label: 'Overwhelm the Last Ward (Power)',
                tooltip: 'Force through the final defense.',
                nextStep: 'final_power_check',
            },
        ],
    };

    steps['final_charm_check'] = {
        id: 'final_charm_check',
        text: `*You reach for her with everything you have...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.charm, 62);
            const def = ctx.stage.getEventDefinition('quest_veridian_05_confrontation');
            if (def) {
                def.steps['final_charm_check'].nextStep = success ? 'wards_down' : 'veridian_flees';
                def.steps['final_charm_check'].text = `*[Charm ${total} vs DC 62 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'wards_down',
    };

    steps['final_power_check'] = {
        id: 'final_power_check',
        text: `*You push against the last ward with everything you have...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.power, 65);
            const def = ctx.stage.getEventDefinition('quest_veridian_05_confrontation');
            if (def) {
                def.steps['final_power_check'].nextStep = success ? 'wards_down' : 'veridian_flees';
                def.steps['final_power_check'].text = `*[Power ${total} vs DC 65 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'wards_down',
    };

    // ── VERIDIAN FLEES ──
    steps['veridian_flees'] = {
        id: 'veridian_flees',
        text: `*The last ward flares — bright and sudden — and the light pushes you back. When your vision clears, the shrine is empty.*\n\n*She's gone. Not fled in panic — the trail she left is deliberate, careful, leading deeper into the old forest. She planned for this.*\n\n*She's harder than she looks. But she didn't leave the region. She's still out there, still working. You'll find her again.*`,
        onEnter: (ctx: EventContext) => {
            // Block quest advancement — Veridian wasn't captured, confrontation can be attempted again.
            ctx.vars.blockQuestAdvancement = true;
        },
        isEnding: true,
    };

    // ── VICTORY ──
    steps['wards_down'] = {
        id: 'wards_down',
        text: `*The light fades.*\n\n*Veridian stands in the center of the shrine, her staff lowered, her wards exhausted. She doesn't look defeated — just very, very tired.*\n\n*"You're better than I expected," she says quietly. "And worse." She studies you for a long moment. "There's still something there. Something worth reaching."*\n\n*The binding settles around her like a second skin — gentle, as befits her. She closes her eyes.*\n\n*"I will pray," she says, "that you find a better path than this one."*\n\n*Veridian has been captured.*`,
        image: VERIDIAN_AVATAR,
        effects: [
            { type: 'set_hero_status', target: 'Veridian', status: 'captured' },
        ],
        isEnding: true,
    };

    return {
        id: 'quest_veridian_05_confrontation',
        name: 'The Gentle Breaking',
        description: "Breach Veridian's divine wards at the Forest Shrine.",
        icon: 'sparkles',
        category: 'combat',
        location: 'Woods',
        prerequisites: [{ type: 'event_completed', eventId: 'quest_veridian_04_shrine' }],
        startStep: 'intro',
        steps,
    };
}

// ══════════════════════════════════════════
// VERIDIAN'S QUEST DEFINITION
// ══════════════════════════════════════════
export const VERIDIAN_QUEST: QuestDefinition = {
    id: 'quest_veridian',
    name: 'The Wandering Shepherd',
    description: 'Find and capture Veridian, the forest cleric who preaches against the manor.',
    icon: 'heart',
    heroName: 'Veridian',
    captureQuest: true,
    steps: [
        {
            id: 'sermon',
            name: 'The Street Sermon',
            description: 'Find Veridian preaching in the town square.',
            eventId: 'quest_veridian_01_sermon',
            location: 'Town',
            icon: 'heart',
        },
        {
            id: 'debate',
            name: 'The Tavern Debate',
            description: 'Engage Veridian in theological debate at the tavern.',
            eventId: 'quest_veridian_02_debate',
            location: 'Town',
            icon: 'message-circle',
        },
        {
            id: 'trail',
            name: 'Into the Woods',
            description: "Follow Veridian's trail into the forest.",
            eventId: 'quest_veridian_03_trail',
            location: 'Woods',
            icon: 'compass',
        },
        {
            id: 'shrine',
            name: 'The Forest Shrine',
            description: 'Find Veridian performing a ritual at the Forest Shrine.',
            eventId: 'quest_veridian_04_shrine',
            location: 'Woods',
            icon: 'sparkles',
        },
        {
            id: 'confrontation',
            name: 'The Gentle Breaking',
            description: "Face Veridian at the shrine and breach her divine wards.",
            eventId: 'quest_veridian_05_confrontation',
            location: 'Woods',
            icon: 'crosshair',
        },
    ],
};
