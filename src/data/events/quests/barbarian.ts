// ──────────────────────────────────────────
// KOVA'S QUESTLINE — "The Pack's Law"
// A 5-step quest to locate and capture Kova the Wolf Barbarian
// Location: Woods | Primary skills: Power, Speed, Wisdom
// ──────────────────────────────────────────
import type { EventDefinition, EventContext, QuestDefinition } from '../../types';
import { rollSkillCheck } from '../mechanics';
import { CHUB_AVATARS } from '../../characters';

// ── Character reference ──
const KOVA_AVATAR = CHUB_AVATARS.kova;

// ══════════════════════════════════════════
// STEP 1: Signs in the Forest (organic: EXPLORE_WOODS_TRAIL)
// ══════════════════════════════════════════
export const QUEST_KOVA_01_WOLFPACK: EventDefinition = {
    id: 'quest_kova_01_wolfpack',
    name: 'Signs in the Forest',
    description: 'Investigate reports of an organized wolf pack claiming territory in the eastern woods.',
    icon: 'paw-print',
    category: 'exploration',
    location: 'Woods',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*The woodsmen at the trading post are nervous. Their usual routes through the eastern stretch have been cut off — not by weather or fallen trees, but by wolves. And not ordinary wolves.*\n\n*"She runs them like soldiers," one trapper mutters, not quite meeting your eyes. "Marks the trees like a general marking a map. The whole east wood is hers now."*\n\n*He shows you a crude sketch — claw marks arranged with deliberate precision at regular intervals. This isn't animal instinct. This is a tactician.*`,
            choices: [
                {
                    id: 'investigate',
                    label: 'Scout the Eastern Woods',
                    tooltip: 'Follow the territorial markers yourself.',
                    nextStep: 'scout_check',
                },
                {
                    id: 'ask_more',
                    label: 'Ask About the Alpha',
                    tooltip: 'Learn what you can before going in.',
                    nextStep: 'ask_alpha',
                },
            ],
        },
        ask_alpha: {
            id: 'ask_alpha',
            text: `*The trapper leans in, voice dropping.*\n\n*"Calls herself Kova. Big as two men. Battle scars down her muzzle. She came through here six weeks back — hired sword, we thought. Then she just... stayed. Started organizing the wolves. We've seen her leading actual formations through the trees."*\n\n*He shakes his head.* "You'd have to be out of your mind to go looking for her."*\n\n*You smile politely and don't share your plans.*`,
            nextStep: 'scout_check',
        },
        scout_check: {
            id: 'scout_check',
            text: `*You head into the eastern woods, following the trapper's rough directions...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 45);
                const def = ctx.stage.getEventDefinition('quest_kova_01_wolfpack');
                if (def) {
                    if (success) {
                        def.steps['scout_check'].text = `*[Wisdom ${total} vs DC 45 — ✓ Success]*\n\n*The claw marks are exactly where the trapper said — carved into oaks at precise intervals, a perimeter as deliberate as any fortified wall. You trace the pattern and piece together the territory's shape: wide, well-chosen, with clear sightlines and natural choke points.*\n\n*Whoever Kova is, she knows what she's doing. This isn't just a wolf pack. It's a warband with fur.*`;
                        def.steps['scout_check'].nextStep = 'scout_success';
                    } else {
                        def.steps['scout_check'].text = `*[Wisdom ${total} vs DC 45 — ✗ Fail]*\n\n*You find some of the marks but can't piece together the full pattern before the undergrowth closes in. A low growl somewhere behind you suggests you've already pressed your luck.*\n\n*Still — the pack's territory is real, and larger than anyone let on.*`;
                        def.steps['scout_check'].nextStep = 'scout_partial';
                    }
                }
            },
            nextStep: 'scout_success',
        },
        scout_success: {
            id: 'scout_success',
            text: `*A picture forms in your mind: an organized territory, a pack that moves with intent, and an alpha who commands them like a general. You've found the edge of her domain. Now you need to find the center.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        scout_partial: {
            id: 'scout_partial',
            text: `*You got a bearing, at least. The pack claims the eastern forest and their alpha keeps them on a tight circuit. It's not much — but it's a start.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 2: Pack Territory (organic: EXPLORE_WOODS_HUNT)
// ══════════════════════════════════════════
export const QUEST_KOVA_02_TERRITORY: EventDefinition = {
    id: 'quest_kova_02_territory',
    name: 'Pack Territory',
    description: "Map the boundaries of the wolf pack's territory and locate the inner camp.",
    icon: 'map',
    category: 'exploration',
    location: 'Woods',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: `*You approach the territory boundary — the first of the claw-marked trees — and pause. Beyond, the forest has changed. The undergrowth is thinner, the paths wider and more deliberate. This isn't a natural wood anymore. It's been curated.*\n\n*Somewhere ahead, the sound of paws and low, purposeful communication.*`,
            choices: [
                {
                    id: 'track_pack',
                    label: 'Track the Pack (Speed)',
                    tooltip: 'Follow movement patterns to locate the camp.',
                    nextStep: 'track_check',
                },
                {
                    id: 'read_terrain',
                    label: 'Read the Terrain (Wisdom)',
                    tooltip: 'Use the modified landscape to find the center.',
                    nextStep: 'terrain_check',
                },
            ],
        },
        track_check: {
            id: 'track_check',
            text: `*You move quietly through the pack's domain...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.speed, 55);
                const def = ctx.stage.getEventDefinition('quest_kova_02_territory');
                if (def) {
                    if (success) {
                        def.steps['track_check'].text = `*[Speed ${total} vs DC 55 — ✓ Success]*\n\n*You move fast and light, slipping between patrols with practised ease. The wolves are everywhere — but their patterns have gaps, and you find them. At the end of a long loop, you catch a glimpse of the main camp: a wide clearing, several dens dug into a hillside, and at the center, a massive gray wolf directing others with barely a gesture.*\n\n*Kova. In the flesh. She's exactly as described — and considerably more.*`;
                        def.steps['track_check'].nextStep = 'camp_located';
                    } else {
                        def.steps['track_check'].text = `*[Speed ${total} vs DC 55 — ✗ Fail]*\n\n*A wolf catches your scent before you close in. You pull back before the alarm fully spreads, but you've lost the element of surprise and got only a vague sense of where the inner camp lies. A second, more careful approach will be needed.*`;
                        def.steps['track_check'].nextStep = 'camp_partial';
                    }
                }
            },
            nextStep: 'camp_located',
        },
        terrain_check: {
            id: 'terrain_check',
            text: `*You study the modified landscape, reading it like a map...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 50);
                const def = ctx.stage.getEventDefinition('quest_kova_02_territory');
                if (def) {
                    if (success) {
                        def.steps['terrain_check'].text = `*[Wisdom ${total} vs DC 50 — ✓ Success]*\n\n*The cleared paths, the dens carved into hillsides, the lookout positions in the trees — it all tells a story. You read the landscape like a campaign map and find the camp at its center: a wide clearing fortified by natural terrain, backing against a rocky outcrop.*\n\n*Kova chose well. She had military training before she had wolves.*`;
                        def.steps['terrain_check'].nextStep = 'camp_located';
                    } else {
                        def.steps['terrain_check'].text = `*[Wisdom ${total} vs DC 50 — ✗ Fail]*\n\n*The terrain gives up some information but not enough. You can tell the camp is somewhere in the northeastern quadrant, but the exact location eludes you. You'll need to observe the pack's movement patterns more closely.*`;
                        def.steps['terrain_check'].nextStep = 'camp_partial';
                    }
                }
            },
            nextStep: 'camp_located',
        },
        camp_located: {
            id: 'camp_located',
            text: `*You've found it. Kova's camp — her stronghold in the eastern woods. A fortified clearing backed by a rocky ridge, with natural barriers on three sides and wolf patrols covering the fourth.*\n\n*Impressive. But nothing without weaknesses. You start planning.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        camp_partial: {
            id: 'camp_partial',
            text: `*Not enough — yet. But you have a direction. The camp is deeper in, and now you know what to look for. A second approach, more careful, should pin it down.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 3: The Alpha Sighted (organic: EXPLORE_WOODS_TRAIL)
// ══════════════════════════════════════════
export const QUEST_KOVA_03_SIGHTING: EventDefinition = {
    id: 'quest_kova_03_sighting',
    name: 'The Alpha Sighted',
    description: 'Observe Kova in person and understand how she commands the pack.',
    icon: 'eye',
    category: 'exploration',
    location: 'Woods',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: `*You take a position in the canopy above the camp's southern approach. Below, the pack moves through its routines — patrol rotations, training runs, a hierarchy dispute that ends with one flat bark from a nearby wolf.*\n\n*Then Kova herself emerges from the largest den. She moves like something carved from threat — deliberate, powerful, unhurried. She surveys the camp, and every wolf in it straightens.*`,
            choices: [
                {
                    id: 'study_her',
                    label: 'Study Her Movements (Wisdom)',
                    tooltip: 'Observe carefully and look for patterns.',
                    nextStep: 'study_check',
                },
                {
                    id: 'assess_defenses',
                    label: 'Map the Camp Defenses',
                    tooltip: 'Plan how to approach when the time comes.',
                    nextStep: 'defense_map',
                },
            ],
        },
        study_check: {
            id: 'study_check',
            text: `*You watch Kova move through her camp...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 55);
                const def = ctx.stage.getEventDefinition('quest_kova_03_sighting');
                if (def) {
                    if (success) {
                        def.steps['study_check'].text = `*[Wisdom ${total} vs DC 55 — ✓ Success]*\n\n*You watch her for the better part of an hour, and you start to see it: she's impulsive, but in controlled bursts. She leads through display — every gesture calculated to project dominance. Her weakness is pride. When challenged, she doesn't retreat; she escalates.*\n\n*That's exploitable. Provoke her, and she'll abandon her tactics for pure rage.*`;
                        def.steps['study_check'].nextStep = 'observation_success';
                    } else {
                        def.steps['study_check'].text = `*[Wisdom ${total} vs DC 55 — ✗ Fail]*\n\n*She moves too far, too fast. You get impressions: she's big, she's fast, she commands obedience without apparent effort. Beyond that, you'll have to face her directly to learn what makes her tick.*`;
                        def.steps['study_check'].nextStep = 'observation_partial';
                    }
                }
            },
            nextStep: 'observation_success',
        },
        defense_map: {
            id: 'defense_map',
            text: `*You mentally map the camp's approach vectors, patrol timings, and escape routes. Three viable entry points. None of them easy.*\n\n*Kova paces the center of the clearing once more, then gives a long look in exactly your direction. You stay very, very still.*\n\n*She doesn't give the alarm. But she knew. She knew something was there.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        observation_success: {
            id: 'observation_success',
            text: `*Pride. That's the key. Push her hard enough and she'll abandon tactical caution and come at you directly — exactly where you want her.*\n\n*You file the insight away and retreat before a patrol gets too close.*`,
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'modify_skill', target: 'charm', value: 1 },
            ],
            isEnding: true,
        },
        observation_partial: {
            id: 'observation_partial',
            text: `*You pull back with more questions than answers. What's certain: she's formidable, she's in control, and she won't be taken lightly. You'll need to face her directly to learn what she's truly capable of.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 4: The Lieutenant's Test (organic: EXPLORE_WOODS_HUNT)
// ══════════════════════════════════════════
export const QUEST_KOVA_04_CHALLENGE: EventDefinition = {
    id: 'quest_kova_04_challenge',
    name: "The Lieutenant's Test",
    description: "Face one of Kova's senior wolves to earn the right to speak with the alpha.",
    icon: 'swords',
    category: 'exploration',
    location: 'Woods',
    startStep: 'encounter',
    steps: {
        encounter: {
            id: 'encounter',
            text: `*You're moving through the territory boundary when they find you — three large wolves, moving with that unsettling military precision. They don't attack. They herd.*\n\n*They push you into a small clearing, and there, standing with arms crossed and a scar running through one eye, is a wolf nearly as large as Kova herself. A lieutenant.*\n\n*"Alpha says you've been watching," she says flatly. "She wants to see if you're worth her time. Fight me. Win — and you get to talk to Kova. Lose..." she glances at the wolves flanking you, "...we escort you out. Permanently."*`,
            choices: [
                {
                    id: 'accept_fight',
                    label: 'Accept the Challenge (Power)',
                    tooltip: 'Prove yourself through direct combat.',
                    nextStep: 'fight_check',
                },
                {
                    id: 'talk_out',
                    label: 'Argue Your Way Through (Charm)',
                    tooltip: 'Make the case that the fight is unnecessary.',
                    nextStep: 'talk_check',
                },
            ],
        },
        fight_check: {
            id: 'fight_check',
            text: `*You set your stance and face the lieutenant...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.power, 65);
                const def = ctx.stage.getEventDefinition('quest_kova_04_challenge');
                if (def) {
                    if (success) {
                        def.steps['fight_check'].text = `*[Power ${total} vs DC 65 — ✓ Success]*\n\n*The fight is fierce — the lieutenant is every bit as dangerous as she looks. But you read her patterns fast: she favors her left, telegraphs her haymaker with a shoulder drop, and gets reckless when frustrated.*\n\n*You don't win so much as outlast her, turning her momentum against her until she's on one knee with a grudging expression.*\n\n*"Hnh," she says. "Alright. You earned it."*`;
                        def.steps['fight_check'].nextStep = 'lieutenant_won';
                    } else {
                        def.steps['fight_check'].text = `*[Power ${total} vs DC 65 — ✗ Fail]*\n\n*She's too strong, too experienced. You hold longer than she expected — but not long enough. She pins you with a forearm to your chest until you stop struggling.*\n\n*"Better than most," she says, releasing you. "But the alpha doesn't meet with 'better than most'. Come back stronger."*`;
                        def.steps['fight_check'].nextStep = 'lieutenant_lost';
                    }
                }
            },
            nextStep: 'lieutenant_won',
        },
        talk_check: {
            id: 'talk_check',
            text: `*You make your case as directly as possible...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.charm, 70);
                const def = ctx.stage.getEventDefinition('quest_kova_04_challenge');
                if (def) {
                    if (success) {
                        def.steps['talk_check'].text = `*[Charm ${total} vs DC 70 — ✓ Success]*\n\n*You appeal not to her hierarchy but to her intelligence. Why waste energy on a fight she doesn't need? A strong leader evaluates by more than brute force — what does Kova gain from only accepting those who can hit hard?*\n\n*The lieutenant is still for a long moment. Then she laughs — short, surprised.*\n\n*"That's actually a decent argument," she says. "Come on. The alpha will find you interesting, at least."*`;
                        def.steps['talk_check'].nextStep = 'lieutenant_won';
                    } else {
                        def.steps['talk_check'].text = `*[Charm ${total} vs DC 70 — ✗ Fail]*\n\n*She listens politely, then closes the distance in one step and looks down at you from about half a head of height.*\n\n*"Are you done?"*\n\n*You are, in fact, done. She's unimpressed and slightly annoyed. "Fight or leave."*\n\n*You decide to leave. For now.*`;
                        def.steps['talk_check'].nextStep = 'lieutenant_lost';
                    }
                }
            },
            nextStep: 'lieutenant_won',
        },
        lieutenant_won: {
            id: 'lieutenant_won',
            text: `*The lieutenant leads you to Kova's den and speaks to her briefly. Kova emerges, looks you over with cold, calculating eyes, and nods.*\n\n*"You're the one who's been watching my territory," she says. Not a question. "You have moves. I'll give you that."*\n\n*She studies you the way a commander studies a problem.*\n\n*"Come back when you're ready to talk terms. Come alone — backup is an insult, and I don't forgive insults."*\n\n*She goes back inside. That was, apparently, the audience.*`,
            effects: [{ type: 'modify_skill', target: 'power', value: 1 }],
            isEnding: true,
        },
        lieutenant_lost: {
            id: 'lieutenant_lost',
            text: `*The wolves escort you to the territory boundary with professional efficiency that suggests they've done this before. Often.*\n\n*You'll need to be stronger. But you've made contact — they know you're here, and the door isn't fully closed.*`,
            effects: [{ type: 'modify_skill', target: 'power', value: 1 }],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 5: Battle of the Alpha (Quest panel — final, captureQuest)
// ══════════════════════════════════════════
const CHARGE_ROUNDS = 4;
const CHARGES_TO_WIN = 3;

interface ChargeAttempt {
    text: string;
    successText: string;
    failText: string;
}

const CHARGE_ATTEMPTS: ChargeAttempt[] = [
    {
        text: "Kova launches her opening charge — a straight-line sprint that bends saplings aside as she comes.",
        successText: `*You side-step the charge, letting her momentum carry her into the undergrowth. She wheels, snarling — surprised that you moved that fast.*`,
        failText: `*She clips you on the way through, a glancing blow that still sends you spinning. She's faster than anything her size has any right to be.*`,
    },
    {
        text: "She changes tactic — a feint left, driving right, trying to catch you off-balance.",
        successText: `*You read the feint from the shoulder drop and move the right way. For a moment, something crosses her face: respect.*`,
        failText: `*She fakes you out perfectly, catching your guard down on the right. The impact rattles your teeth.*`,
    },
    {
        text: "Pure fury now — she's committed, both hands forward, trying to pin you against the treeline.",
        successText: `*You duck under her arms and use her own weight, redirecting the charge into a tree. She rebounds, momentarily stunned.*`,
        failText: `*She gets a hold of your shoulder before you clear her. For a terrifying second, you're completely in her grip.*`,
    },
    {
        text: "Kova is breathing harder now, but she hasn't slowed. She comes in low — trying to take your legs.",
        successText: `*You leap clear, landing behind her. She misses by a hand's width and turns, chest heaving.*`,
        failText: `*She takes your legs and you go down hard. You scramble back up, but she's already circling.*`,
    },
];

const DODGE_ACTIONS = [
    { id: 'dodge',   label: 'Dodge (Speed)',         tooltip: 'Use your speed to avoid the charge.',              skill: 'speed'  as const, dc: 62 },
    { id: 'counter', label: 'Counter-Strike (Power)', tooltip: 'Meet her strength head-on and redirect it.',      skill: 'power'  as const, dc: 65 },
    { id: 'bait',    label: 'Bait Her Pride (Charm)', tooltip: "Use her impulsive pride to make her overcommit.", skill: 'charm'  as const, dc: 60 },
];

export function buildKovaConfrontation(): EventDefinition {
    const steps: EventDefinition['steps'] = {};

    steps['intro'] = {
        id: 'intro',
        text: '',
        onEnter: (ctx: EventContext) => {
            ctx.vars.chargesBlocked = 0;
            ctx.vars.chargesFailed = 0;
            ctx.vars.prideTriggered = false;
            const def = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
            if (def) {
                def.steps['intro'].text = `*Kova's clearing. No pack this time — she sent them away, which is either a courtesy or a sign that she doesn't need them.*\n\n*She stands in the center, arms loose, battle scars catching the afternoon light. She's been waiting.*\n\n*"I wondered when you'd finally come," she says. Not hostile. Appraising. "You've done your homework." She cracks her knuckles. "Let's see if it was enough."*`;
            }
        },
        nextStep: 'round_1_charge',
    };

    for (let i = 0; i < CHARGE_ROUNDS; i++) {
        const round = i + 1;
        const charge = CHARGE_ATTEMPTS[i];

        steps[`round_${round}_charge`] = {
            id: `round_${round}_charge`,
            text: '',
            onEnter: (ctx: EventContext) => {
                const blocked = ctx.vars.chargesBlocked ?? 0;
                const progressBar = '▓'.repeat(blocked) + '░'.repeat(CHARGES_TO_WIN - blocked);
                const def = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
                if (def) {
                    def.steps[`round_${round}_charge`].text = `*${charge.text}*\n\n**Charges redirected: [${progressBar}] ${blocked}/${CHARGES_TO_WIN}**`;
                }
                if (blocked >= 2 && !ctx.vars.prideTriggered) {
                    ctx.vars.prideTriggered = true;
                    const def2 = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
                    if (def2) {
                        def2.steps[`round_${round}_charge`].text += `\n\n*[icon:alert-triangle] Something shifts in Kova's expression. She's been blocked too many times — her controlled fury is giving way to wounded pride. She's about to stop being careful.*`;
                        def2.steps[`round_${round}_charge`].nextStep = 'pride_break';
                    }
                }
            },
            choices: DODGE_ACTIONS.map(action => ({
                id: `${action.id}_r${round}`,
                label: action.label,
                tooltip: action.tooltip,
                nextStep: `round_${round}_resolve_${action.id}`,
            })),
        };

        for (const action of DODGE_ACTIONS) {
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
                        ctx.vars.chargesBlocked = (ctx.vars.chargesBlocked ?? 0) + 1;
                        resultText += charge.successText;
                    } else {
                        ctx.vars.chargesFailed = (ctx.vars.chargesFailed ?? 0) + 1;
                        resultText += charge.failText;
                    }
                    const def = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
                    if (def) {
                        const blocked = ctx.vars.chargesBlocked ?? 0;
                        const nextRound = round + 1;
                        let nextStep: string;
                        if (blocked >= CHARGES_TO_WIN) {
                            nextStep = 'exhausted';
                        } else if (nextRound > CHARGE_ROUNDS) {
                            nextStep = 'last_stand';
                        } else {
                            nextStep = `round_${nextRound}_charge`;
                        }
                        def.steps[`round_${round}_resolve_${action.id}`].nextStep = nextStep;
                        def.steps[`round_${round}_resolve_${action.id}`].text = resultText;
                    }
                },
                nextStep: round < CHARGE_ROUNDS ? `round_${round + 1}_charge` : 'last_stand',
            };
        }
    }

    // ── PRIDE BREAK ──
    steps['pride_break'] = {
        id: 'pride_break',
        text: `*Her restraint breaks. Kova abandons tactical charges and comes at you in a direct, furious rush — all her considerable mass and rage at once. It's reckless. And it's exactly what you needed.*\n\n*You step aside at the last moment, and her momentum carries her into the ground. She's up in an instant — but slower now, the rage burning away the precision.*`,
        onEnter: (ctx: EventContext) => {
            ctx.vars.chargesBlocked = (ctx.vars.chargesBlocked ?? 0) + 1;
        },
        nextStep: 'exhausted',
    };

    // ── LAST STAND ──
    steps['last_stand'] = {
        id: 'last_stand',
        text: '',
        onEnter: (ctx: EventContext) => {
            const blocked = ctx.vars.chargesBlocked ?? 0;
            const def = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
            if (def) {
                if (blocked >= 2) {
                    def.steps['last_stand'].text = `*She's breathing heavily — not beaten, but at the edge of her reserves. You're in the same shape. This ends here, one way or another.*`;
                } else {
                    def.steps['last_stand'].text = `*She's still going, and you're starting to flag. The next exchange decides everything.*`;
                }
            }
        },
        choices: [
            {
                id: 'final_speed',
                label: 'Final Dodge and Counter (Speed)',
                tooltip: 'Use your last burst of speed to dodge and strike.',
                nextStep: 'final_speed_check',
            },
            {
                id: 'final_power',
                label: 'Match Her Strength (Power)',
                tooltip: 'Go blow for blow and see who breaks first.',
                nextStep: 'final_power_check',
            },
        ],
    };

    steps['final_speed_check'] = {
        id: 'final_speed_check',
        text: `*You commit everything to one final movement...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.speed, 65);
            const def = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
            if (def) {
                def.steps['final_speed_check'].nextStep = success ? 'exhausted' : 'kova_escape';
                def.steps['final_speed_check'].text = `*You push for everything you have left... [Speed ${total} vs DC 65 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'exhausted',
    };

    steps['final_power_check'] = {
        id: 'final_power_check',
        text: `*You plant your feet and refuse to move...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.power, 68);
            const def = ctx.stage.getEventDefinition('quest_kova_05_confrontation');
            if (def) {
                def.steps['final_power_check'].nextStep = success ? 'exhausted' : 'kova_escape';
                def.steps['final_power_check'].text = `*You hold your ground against everything she has... [Power ${total} vs DC 68 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'exhausted',
    };

    // ── KOVA ESCAPE ──
    steps['kova_escape'] = {
        id: 'kova_escape',
        text: `*She breaks through your last defense and hits you hard enough to put you on the ground. You're conscious — barely — when she stands over you.*\n\n*She waits. You don't get up.*\n\n*"Strong," she says finally. "Not strong enough." She turns and walks back into the camp without another word. Three wolves appear at the clearing's edge to escort you out.*\n\n*But she didn't finish you. That means something, in whatever code she follows.*`,
        onEnter: (ctx: EventContext) => {
            // Block quest advancement — Kova wasn't captured, confrontation can be attempted again.
            ctx.vars.blockQuestAdvancement = true;
        },
        isEnding: true,
    };

    // ── VICTORY ──
    steps['exhausted'] = {
        id: 'exhausted',
        text: `*It's over.*\n\n*Kova is on one knee, chest heaving, finally spent. Her charges have run dry — every reckless push was turned or countered, and there's nothing left in the tank.*\n\n*She looks up at you from under her heavy brow, breathing hard, and something in her expression settles.*\n\n*"You beat me," she says. Flat, factual, without self-pity. "I don't say that often." A long pause. "I won't say it again."*\n\n*The binding settles around her as her defenses lower — she growls at the feeling of it, but she doesn't fight it. There's nothing left to fight with.*\n\n*Kova has been captured.*`,
        image: KOVA_AVATAR,
        effects: [
            { type: 'set_hero_status', target: 'Kova', status: 'captured' },
        ],
        isEnding: true,
    };

    return {
        id: 'quest_kova_05_confrontation',
        name: 'Battle of the Alpha',
        description: "Face Kova alone in her clearing and prove you can redirect her unstoppable charges.",
        icon: 'swords',
        category: 'combat',
        location: 'Woods',
        prerequisites: [{ type: 'event_completed', eventId: 'quest_kova_04_challenge' }],
        startStep: 'intro',
        steps,
    };
}

// ══════════════════════════════════════════
// KOVA'S QUEST DEFINITION
// ══════════════════════════════════════════
export const KOVA_QUEST: QuestDefinition = {
    id: 'quest_kova',
    name: "The Pack's Law",
    description: "Earn the right to challenge Kova, the wolf alpha who rules the eastern forest.",
    icon: 'shield',
    heroName: 'Kova',
    captureQuest: true,
    steps: [
        {
            id: 'wolfpack',
            name: 'Signs in the Forest',
            description: 'Investigate wolf pack activity in the eastern woods.',
            eventId: 'quest_kova_01_wolfpack',
            location: 'Woods',
            icon: 'paw-print',
        },
        {
            id: 'territory',
            name: 'Pack Territory',
            description: "Map the pack's territory and locate Kova's camp.",
            eventId: 'quest_kova_02_territory',
            location: 'Woods',
            icon: 'map',
        },
        {
            id: 'sighting',
            name: 'The Alpha Sighted',
            description: 'Observe Kova in person and understand how she fights.',
            eventId: 'quest_kova_03_sighting',
            location: 'Woods',
            icon: 'eye',
        },
        {
            id: 'challenge',
            name: "The Lieutenant's Test",
            description: "Face Kova's senior wolf and earn the right to stand before the alpha.",
            eventId: 'quest_kova_04_challenge',
            location: 'Woods',
            icon: 'swords',
        },
        {
            id: 'confrontation',
            name: 'Battle of the Alpha',
            description: 'Face Kova alone in her clearing. No pack. No escape.',
            eventId: 'quest_kova_05_confrontation',
            location: 'Woods',
            icon: 'crosshair',
        },
    ],
};
