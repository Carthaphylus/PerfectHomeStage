// ──────────────────────────────────────────
// PERVIS'S QUESTLINE — "The Iron Command"
// A 6-step quest to locate and capture Pervis the Tactical Leader
// Location: Ruins | Primary skills: Wisdom, Charm, Power
// The hardest questline — highest DCs, most steps
// ──────────────────────────────────────────
import type { EventDefinition, EventContext, QuestDefinition } from '../../types';
import { rollSkillCheck } from '../mechanics';
import { CHUB_AVATARS } from '../../characters';

// ── Character reference ──
const PERVIS_AVATAR = CHUB_AVATARS.pervis;

// ══════════════════════════════════════════
// STEP 1: Gathering Intel (organic: EXPLORE_TOWN_TAVERN)
// ══════════════════════════════════════════
export const QUEST_PERVIS_01_INTEL: EventDefinition = {
    id: 'quest_pervis_01_intel',
    name: 'Gathering Intel',
    description: 'Gather intelligence about a mysterious armed encampment in the ruins.',
    icon: 'search',
    category: 'exploration',
    location: 'Town',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: `*The tavern crowd has been jumpier than usual. You've heard fragments in passing — soldiers seen near the old ruins, a supply convoy turned back at the eastern road, merchants refusing the northern trade route.*\n\n*Someone has fortified the ruins. Someone organized enough to establish perimeter checkpoints and supply lines in under a month.*`,
            choices: [
                {
                    id: 'eavesdrop',
                    label: 'Listen for Gossip (Wisdom)',
                    tooltip: 'Piece together what the merchants know.',
                    nextStep: 'listen_check',
                },
                {
                    id: 'ask_directly',
                    label: 'Ask the Barkeep Directly',
                    tooltip: 'Pay for information.',
                    nextStep: 'ask_barkeep',
                },
            ],
        },
        listen_check: {
            id: 'listen_check',
            text: `*You nurse your drink and let the conversation flow around you...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 50);
                const def = ctx.stage.getEventDefinition('quest_pervis_01_intel');
                if (def) {
                    if (success) {
                        def.steps['listen_check'].text = `*[Wisdom ${total} vs DC 50 — ✓ Success]*\n\n*Three separate conversations yield consistent details: the force arrived about three weeks ago, moving in from the east. They've set perimeter markers, cleared sightlines, and turned away two separate trading parties with polite but absolute authority. Their leader was described as "a composed rabbit in a commander's coat, with the patience of something waiting to strike."*\n\n*Pervis. And he's had three weeks to dig in.*`;
                        def.steps['listen_check'].nextStep = 'intel_solid';
                    } else {
                        def.steps['listen_check'].text = `*[Wisdom ${total} vs DC 50 — ✗ Fail]*\n\n*The gossip is scattered and contradictory — you can't tell if it's a small band of mercenaries or a full garrison. Someone is in the ruins. How many and how well-prepared is unclear.*`;
                        def.steps['listen_check'].nextStep = 'intel_partial';
                    }
                }
            },
            nextStep: 'intel_solid',
        },
        ask_barkeep: {
            id: 'ask_barkeep',
            text: `*You slide a coin across the bar. The barkeep glances at it, then at you.*\n\n*"The ruins?" He keeps his voice low. "Fortified, couple weeks back. Small force but disciplined — like a military advance unit. Their leader came in here twice for supplies. Polite. Said nothing you could object to. Paid fair. But his eyes..." He shakes his head. "Always counting exits."*\n\n*He pockets the coin.* "Stay off the northern road if you value your schedule. They don't let travelers through."*`,
            nextStep: 'intel_solid',
        },
        intel_solid: {
            id: 'intel_solid',
            text: `*A complete picture: organized, fortified, patient. Whoever commands the ruins encampment is operating with a plan, not a whim. You'll need to approach carefully.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        intel_partial: {
            id: 'intel_partial',
            text: `*Not enough to work from — yet. But the pattern suggests someone with military discipline. You'll need to get closer to the ruins to understand what you're dealing with.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 2: The Outer Walls (organic: EXPLORE_RUINS_EXCAVATE)
// ══════════════════════════════════════════
export const QUEST_PERVIS_02_PERIMETER: EventDefinition = {
    id: 'quest_pervis_02_perimeter',
    name: 'The Outer Walls',
    description: "Approach the ruins perimeter and assess the encampment's defenses.",
    icon: 'shield',
    category: 'exploration',
    location: 'Ruins',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: `*The ruins perimeter is marked by a series of cleared lines in the rubble — not walls, but sightlines. Wherever you look, there's no cover for more than twenty meters. They've been dismantling debris strategically.*\n\n*Two sentries move at the edge of visibility, following a timed circuit. Clockwork precision.*`,
            choices: [
                {
                    id: 'study_patrol',
                    label: 'Map the Patrol Pattern (Wisdom)',
                    tooltip: 'Watch long enough to find the timing gaps.',
                    nextStep: 'patrol_check',
                },
                {
                    id: 'probe_defenses',
                    label: 'Test a Weak Point (Speed)',
                    tooltip: 'Look for gaps in the sightlines.',
                    nextStep: 'probe_check',
                },
            ],
        },
        patrol_check: {
            id: 'patrol_check',
            text: `*You observe from cover, watching the sentries make their rounds...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 55);
                const def = ctx.stage.getEventDefinition('quest_pervis_02_perimeter');
                if (def) {
                    if (success) {
                        def.steps['patrol_check'].text = `*[Wisdom ${total} vs DC 55 — ✓ Success]*\n\n*Six and a half minutes between patrol crossings. The sentries stagger their circuit to prevent easy timing. There are three overlap points — but one, near the eastern rubble pile, has a four-second gap when both are facing away.*\n\n*It's not generous. But it's enough. Someone designed this carefully. Whoever is in charge, they've done this before.*`;
                        def.steps['patrol_check'].nextStep = 'perimeter_mapped';
                    } else {
                        def.steps['patrol_check'].text = `*[Wisdom ${total} vs DC 55 — ✗ Fail]*\n\n*The pattern is too consistent to find a gap from this angle. You'd need a different vantage point or an inside source to map the timing properly.*`;
                        def.steps['patrol_check'].nextStep = 'perimeter_partial';
                    }
                }
            },
            nextStep: 'perimeter_mapped',
        },
        probe_check: {
            id: 'probe_check',
            text: `*You move quickly toward a gap in the rubble line...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.speed, 60);
                const def = ctx.stage.getEventDefinition('quest_pervis_02_perimeter');
                if (def) {
                    if (success) {
                        def.steps['probe_check'].text = `*[Speed ${total} vs DC 60 — ✓ Success]*\n\n*You slip through the gap and get close enough to see the inner camp's structure before retreating safely: three main positions, a command tent at the rear, supply caches at the flanks. Tight. Efficient. The commander has positioned everything to funnel approaching threats.*`;
                        def.steps['probe_check'].nextStep = 'perimeter_mapped';
                    } else {
                        def.steps['probe_check'].text = `*[Speed ${total} vs DC 60 — ✗ Fail]*\n\n*A sentry's circuit brings them too close and you're forced to retreat before you see much. But your movement was spotted — when you look back, the patrol has altered its timing. They know someone probed the perimeter.*`;
                        def.steps['probe_check'].nextStep = 'perimeter_partial';
                    }
                }
            },
            nextStep: 'perimeter_mapped',
        },
        perimeter_mapped: {
            id: 'perimeter_mapped',
            text: `*Thorough. Methodical. Whoever commands this position has an eye for terrain and the patience to use it properly. Breaching the inner camp will require disrupting the system rather than overpowering it.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        perimeter_partial: {
            id: 'perimeter_partial',
            text: `*Not enough — but more than you had. The defenses are professional-grade. You'll need a different angle of approach before pressing further in.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 3: Past the Guards (organic: EXPLORE_RUINS_INSCRIPTIONS — passive)
// ══════════════════════════════════════════
export const QUEST_PERVIS_03_INFILTRATE: EventDefinition = {
    id: 'quest_pervis_03_infiltrate',
    name: 'Past the Guards',
    description: 'Use knowledge of the ruins layout to slip past the inner guard positions.',
    icon: 'eye-off',
    category: 'exploration',
    location: 'Ruins',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: `*The inner guard positions are layered — three checkpoints between the outer perimeter and the command tent, each one covering the others' blind spots. A direct approach is impossible.*\n\n*But the ruins themselves offer alternatives. The ancient structure has passages the encampment's soldiers haven't found — or haven't mapped.*`,
            choices: [
                {
                    id: 'use_passages',
                    label: 'Find the Hidden Passages (Wisdom)',
                    tooltip: 'Use knowledge of the ruins layout to navigate around guards.',
                    nextStep: 'passage_check',
                },
                {
                    id: 'create_distraction',
                    label: 'Create a Distraction (Charm)',
                    tooltip: 'Manufacture an incident to draw guards away.',
                    nextStep: 'distraction_check',
                },
            ],
        },
        passage_check: {
            id: 'passage_check',
            text: `*You search for the architectural gaps in the ruin structure...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 60);
                const def = ctx.stage.getEventDefinition('quest_pervis_03_infiltrate');
                if (def) {
                    if (success) {
                        def.steps['passage_check'].text = `*[Wisdom ${total} vs DC 60 — ✓ Success]*\n\n*The ancient inscriptions you've studied paid off: a maintenance passage runs beneath the northeastern section, emerging inside the guard's second checkpoint. You move through it quietly and come up behind the inner ring.*\n\n*The command tent is visible from here. You can see the shape of someone inside, bent over what looks like maps.*`;
                        def.steps['passage_check'].nextStep = 'inside';
                    } else {
                        def.steps['passage_check'].text = `*[Wisdom ${total} vs DC 60 — ✗ Fail]*\n\n*You find a passage but it's partially collapsed. You get partway in before being forced back. Still — you know it's there. With the right equipment or a different entry point, it might be useable.*`;
                        def.steps['passage_check'].nextStep = 'partial_in';
                    }
                }
            },
            nextStep: 'inside',
        },
        distraction_check: {
            id: 'distraction_check',
            text: `*You arrange a carefully staged distraction on the western side...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.charm, 62);
                const def = ctx.stage.getEventDefinition('quest_pervis_03_infiltrate');
                if (def) {
                    if (success) {
                        def.steps['distraction_check'].text = `*[Charm ${total} vs DC 62 — ✓ Success]*\n\n*The distraction draws two of the three checkpoints west. The gap is narrow — maybe forty seconds — but you're through it and in the inner compound before they return.*\n\n*The command tent is twenty meters ahead. Someone inside moves with deliberate, unhurried purpose.*`;
                        def.steps['distraction_check'].nextStep = 'inside';
                    } else {
                        def.steps['distraction_check'].text = `*[Charm ${total} vs DC 62 — ✗ Fail]*\n\n*The distraction draws attention, but not from the guards you needed to move. A checkpoint you hadn't accounted for spots you and you're turned back with professional courtesy and an unmistakable message: don't try this again.*`;
                        def.steps['distraction_check'].nextStep = 'partial_in';
                    }
                }
            },
            nextStep: 'inside',
        },
        inside: {
            id: 'inside',
            text: `*You're inside the inner compound. Through the tent canvas, you can hear a low, measured voice — calm even giving orders. The tent flap is inches away.*\n\n*Then: "I know you're there."*\n\n*The voice doesn't change in pitch or speed. "You may as well come in. We have a great deal to discuss."*\n\n*He already knew. He's been waiting.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
        partial_in: {
            id: 'partial_in',
            text: `*You've found the approach, but the inner guards held. Next time, you'll know exactly what to expect — and what to bring.*`,
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 4: Supply Sabotage (organic: EXPLORE_RUINS_DELVE)
// ══════════════════════════════════════════
export const QUEST_PERVIS_04_SABOTAGE: EventDefinition = {
    id: 'quest_pervis_04_sabotage',
    name: 'Supply Sabotage',
    description: "Disrupt the encampment's supply lines to weaken their position.",
    icon: 'zap',
    category: 'exploration',
    location: 'Ruins',
    startStep: 'plan',
    steps: {
        plan: {
            id: 'plan',
            text: `*The encampment is well-provisioned — too well-provisioned to take head-on. But supply chains have chokepoints. Three routes in, two of them funneled through passages in the ruins that could be disrupted.*\n\n*Disrupting his logistics won't break Pervis. But it will force him to redeploy and reveal his priorities.*`,
            choices: [
                {
                    id: 'collapse_passage',
                    label: 'Collapse a Supply Route (Power)',
                    tooltip: 'Use the ruins structure to block a key supply passage.',
                    nextStep: 'collapse_check',
                },
                {
                    id: 'corrupt_cache',
                    label: 'Compromise a Supply Cache (Wisdom)',
                    tooltip: 'Subtly contaminate provisions without triggering alarms.',
                    nextStep: 'corrupt_check',
                },
            ],
        },
        collapse_check: {
            id: 'collapse_check',
            text: `*You find the load-bearing point in the narrowest supply passage...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.power, 65);
                const def = ctx.stage.getEventDefinition('quest_pervis_04_sabotage');
                if (def) {
                    if (success) {
                        def.steps['collapse_check'].text = `*[Power ${total} vs DC 65 — ✓ Success]*\n\n*A controlled collapse — just enough to block the passage without triggering a full cave-in. The northern supply route is gone. You're watching from cover when the next resupply convoy arrives and finds it blocked.*\n\n*Within the hour, you can hear the encampment rearranging. Pervis is adapting — but he's moving, and moving troops reveals positions.*`;
                        def.steps['collapse_check'].nextStep = 'sabotage_done';
                    } else {
                        def.steps['collapse_check'].text = `*[Power ${total} vs DC 65 — ✗ Fail]*\n\n*The collapse is too broad. It seals the passage but also brings down two sections you needed intact. The sound alarms the nearest checkpoint, and you're forced to retreat before achieving your goal.*`;
                        def.steps['collapse_check'].nextStep = 'sabotage_partial';
                    }
                }
            },
            nextStep: 'sabotage_done',
        },
        corrupt_check: {
            id: 'corrupt_check',
            text: `*You locate the eastern supply cache, tucked into an alcove behind collapsed stones...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 63);
                const def = ctx.stage.getEventDefinition('quest_pervis_04_sabotage');
                if (def) {
                    if (success) {
                        def.steps['corrupt_check'].text = `*[Wisdom ${total} vs DC 63 — ✓ Success]*\n\n*You compromise the provisions subtly — not with poison, but with something that will sour them within a day. Untraceable, slow. By the time they notice, the supply run will already be delayed.*\n\n*Within two days, the encampment is running shorter rations. Pervis reacts by consolidating his forces — which puts more of them in fewer locations.*`;
                        def.steps['corrupt_check'].nextStep = 'sabotage_done';
                    } else {
                        def.steps['corrupt_check'].text = `*[Wisdom ${total} vs DC 63 — ✗ Fail]*\n\n*The cache has been moved since your last scouting pass. You find only a decoy. Someone anticipated this move.*\n\n*He's already thinking several steps ahead. You'll need to disrupt him differently.*`;
                        def.steps['corrupt_check'].nextStep = 'sabotage_partial';
                    }
                }
            },
            nextStep: 'sabotage_done',
        },
        sabotage_done: {
            id: 'sabotage_done',
            text: `*He's responding to pressure — exactly as intended. The encampment has shifted from static to reactive, and reactive forces make predictable mistakes. The next step is exploiting the gaps his redeployment creates.*`,
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'modify_skill', target: 'power', value: 1 },
            ],
            isEnding: true,
        },
        sabotage_partial: {
            id: 'sabotage_partial',
            text: `*Partial disruption — enough to create noise, not enough to force his hand. He's aware something is coming. But you've learned something: he adapts fast, and he doesn't panic.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 5: The Inner Keep (organic: EXPLORE_RUINS_EXCAVATE — second visit)
// ══════════════════════════════════════════
export const QUEST_PERVIS_05_ADVANCE: EventDefinition = {
    id: 'quest_pervis_05_advance',
    name: 'The Inner Keep',
    description: "Breach the encampment's final defensive layer and reach Pervis's command position.",
    icon: 'door-open',
    category: 'exploration',
    location: 'Ruins',
    startStep: 'approach',
    steps: {
        approach: {
            id: 'approach',
            text: `*The sabotage worked. The outer perimeter is thinner — forces pulled in, patrols consolidated. But the inner keep is tighter: Pervis has compressed his defense into a smaller, harder core, abandoning ground he couldn't hold to strengthen the ground he could.*\n\n*A smaller perimeter, but tougher. He traded breadth for depth.*`,
            choices: [
                {
                    id: 'use_gaps',
                    label: 'Exploit the Redeployment Gaps (Speed)',
                    tooltip: 'Move fast through the sparser outer perimeter.',
                    nextStep: 'speed_check',
                },
                {
                    id: 'negotiate_entry',
                    label: 'Negotiate Entry (Charm)',
                    tooltip: 'Approach openly and demand a meeting.',
                    nextStep: 'negotiate_check',
                },
            ],
        },
        speed_check: {
            id: 'speed_check',
            text: `*You identify the gap and move through it quickly...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.speed, 65);
                const def = ctx.stage.getEventDefinition('quest_pervis_05_advance');
                if (def) {
                    if (success) {
                        def.steps['speed_check'].text = `*[Speed ${total} vs DC 65 — ✓ Success]*\n\n*You move through the outer gap while the patrol is at its far point. Inside the inner keep, you find what you've been working toward: Pervis's command position, a stone alcove in the ruins' core with sightlines in every direction.*\n\n*He's there. Alone, as far as you can tell. Maps on the table. And his eyes already on you as you step inside.*\n\n*"You're thorough," he says. He doesn't sound surprised.*`;
                        def.steps['speed_check'].nextStep = 'keep_reached';
                    } else {
                        def.steps['speed_check'].text = `*[Speed ${total} vs DC 65 — ✗ Fail]*\n\n*The gap was smaller than you measured — he tightened it after the sabotage. A guard catches your movement and the alarm goes up. You're pushed back to the perimeter.*\n\n*He adjusted exactly as you would have. You're fighting someone who thinks the way you do.*`;
                        def.steps['speed_check'].nextStep = 'keep_partial';
                    }
                }
            },
            nextStep: 'keep_reached',
        },
        negotiate_check: {
            id: 'negotiate_check',
            text: `*You approach the inner gate openly, hands visible...*`,
            onEnter: (ctx: EventContext) => {
                const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.charm, 67);
                const def = ctx.stage.getEventDefinition('quest_pervis_05_advance');
                if (def) {
                    if (success) {
                        def.steps['negotiate_check'].text = `*[Charm ${total} vs DC 67 — ✓ Success]*\n\n*The guards hesitate — your approach is unexpected enough that they don't have a procedure for it. You ask for Pervis directly, by name, and state that you have information he'll want.*\n\n*After a long pause and a whispered exchange, they let you through. Pervis is at a stone table when you're shown in. He looks up once, then back at his maps.*\n\n*"I wondered how long before you tried this," he says. "Sit down."*`;
                        def.steps['negotiate_check'].nextStep = 'keep_reached';
                    } else {
                        def.steps['negotiate_check'].text = `*[Charm ${total} vs DC 67 — ✗ Fail]*\n\n*The guards are professional enough not to be swayed by a confident approach without a compelling argument. You're turned back politely but firmly, with a note that any further attempts will be considered hostile.*\n\n*He's anticipated this too. You'll need to find another angle.*`;
                        def.steps['negotiate_check'].nextStep = 'keep_partial';
                    }
                }
            },
            nextStep: 'keep_reached',
        },
        keep_reached: {
            id: 'keep_reached',
            text: `*You're inside. Face to face with Pervis for the first time.*\n\n*He's smaller than the descriptions suggested — compact, still, with sapphire eyes that move quickly and miss nothing. He watches you take in the room and seems to be cataloguing something in turn.*\n\n*"You've been thorough," he says at last. "The sabotage was well-executed. The perimeter probe before that, less so — but you learned from it."*\n\n*A pause. He folds his hands.* "So. Now that you're here. What exactly do you plan to do?"*`,
            effects: [
                { type: 'modify_skill', target: 'wisdom', value: 1 },
                { type: 'modify_skill', target: 'charm', value: 1 },
            ],
            isEnding: true,
        },
        keep_partial: {
            id: 'keep_partial',
            text: `*Not yet. He's still one step ahead. But the gap is closing — you understand his patterns now. One more careful approach, and you'll have him.*`,
            effects: [{ type: 'modify_skill', target: 'wisdom', value: 1 }],
            isEnding: true,
        },
    },
};

// ══════════════════════════════════════════
// STEP 6: Checkmate (Quest panel — final, captureQuest, hardest)
// ══════════════════════════════════════════
const TACTICAL_ROUNDS = 5;
const POSITIONS_TO_NEUTRALIZE = 4;

interface TacticalPosition {
    text: string;
    successText: string;
    failText: string;
}

const TACTICAL_POSITIONS: TacticalPosition[] = [
    {
        text: "Pervis deploys his first gambit — a controlled retreat to a prepared secondary position, buying time and forcing you to overextend.",
        successText: `*You hold your ground instead of pursuing, denying him the overextension he baited. He notes this with a slight nod.*`,
        failText: `*You follow the retreat and find yourself committed to an angle he's already accounted for. He's repositioned without losing ground.*`,
    },
    {
        text: "He opens a negotiation — a tactical conversation designed to gather information while revealing nothing.",
        successText: `*You steer the conversation without giving him what he's fishing for. After a moment, he closes that line of inquiry.*`,
        failText: `*He gets what he wanted — a sense of your actual objective. His posture shifts subtly. He knows more now.*`,
    },
    {
        text: "A feint: he gestures toward the camp's exit as if offering departure. It's an offer you'd be a fool to take — and a test of whether you're a fool.",
        successText: `*You don't move. "That's not an offer," you say. He almost smiles. "No," he agrees. "It wasn't."*`,
        failText: `*You take a step toward the exit before catching yourself. He marks it. Advantage lost.*`,
    },
    {
        text: "He signals something to a guard — a movement you don't quite follow. Whatever tactical shift he made, you need to anticipate it.",
        successText: `*You read the signal and countermand it with a move of your own — cutting off the angle he just created.*`,
        failText: `*The movement creates a blind spot you didn't account for. He's reshuffled the deck.*`,
    },
    {
        text: "Final position. He's running out of options — but so are you. He's composing his last counter-move with the calm of someone who's done this before.",
        successText: `*You anticipate it and close the last escape route before he can execute it. He sees it happen and goes still.*`,
        failText: `*He executes it cleanly. He's opened a door you didn't know was there.*`,
    },
];

const COUNTER_ACTIONS = [
    { id: 'outmaneuver', label: 'Outmaneuver (Wisdom)', tooltip: 'Use strategic thinking to stay one step ahead.', skill: 'wisdom' as const, dc: 65 },
    { id: 'negotiate',   label: 'Control the Exchange (Charm)', tooltip: 'Steer the conversation to your advantage.',  skill: 'charm'  as const, dc: 65 },
    { id: 'force',       label: 'Force the Position (Power)',   tooltip: 'Apply direct pressure to collapse his plan.', skill: 'power'  as const, dc: 68 },
];

export function buildPervisConfrontation(): EventDefinition {
    const steps: EventDefinition['steps'] = {};

    steps['intro'] = {
        id: 'intro',
        text: '',
        onEnter: (ctx: EventContext) => {
            ctx.vars.positionsNeutralized = 0;
            ctx.vars.positionsFailed = 0;
            ctx.vars.composureTriggered = false;
            const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
            if (def) {
                def.steps['intro'].text = `*The inner keep, stripped of guards on his own order. Just the two of you.*\n\n*Pervis stands at the center of the room, maps folded and stowed. Whatever he was working on, he's finished with it.*\n\n*"You've been methodical," he says. "The rumors. The perimeter survey. The sabotage — that was well-done. Less noise than I'd have expected." He tilts his head. "I want you to know: I don't take this personally. You're pursuing your objective. So am I."*\n\n*He steps back, and you notice that every position in the room has been subtly optimized. He's already playing.*\n\n*"Shall we finish this?"*`;
            }
        },
        nextStep: 'round_1_position',
    };

    for (let i = 0; i < TACTICAL_ROUNDS; i++) {
        const round = i + 1;
        const position = TACTICAL_POSITIONS[i];

        steps[`round_${round}_position`] = {
            id: `round_${round}_position`,
            text: '',
            onEnter: (ctx: EventContext) => {
                const neutralized = ctx.vars.positionsNeutralized ?? 0;
                const progressBar = '▓'.repeat(neutralized) + '░'.repeat(POSITIONS_TO_NEUTRALIZE - neutralized);
                const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
                if (def) {
                    def.steps[`round_${round}_position`].text = `*${position.text}*\n\n**Positions neutralized: [${progressBar}] ${neutralized}/${POSITIONS_TO_NEUTRALIZE}**`;
                }
                if (neutralized >= 3 && !ctx.vars.composureTriggered) {
                    ctx.vars.composureTriggered = true;
                    const def2 = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
                    if (def2) {
                        def2.steps[`round_${round}_position`].text += `\n\n*[icon:alert-triangle] Three positions neutralized. For the first time, something shifts behind Pervis's composure — not alarm, but recalculation. He's running out of prepared responses. Whatever comes next will be improvised.*`;
                        def2.steps[`round_${round}_position`].nextStep = 'improvised_move';
                    }
                }
            },
            choices: COUNTER_ACTIONS.map(action => ({
                id: `${action.id}_r${round}`,
                label: action.label,
                tooltip: action.tooltip,
                nextStep: `round_${round}_resolve_${action.id}`,
            })),
        };

        for (const action of COUNTER_ACTIONS) {
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
                        ctx.vars.positionsNeutralized = (ctx.vars.positionsNeutralized ?? 0) + 1;
                        resultText += position.successText;
                    } else {
                        ctx.vars.positionsFailed = (ctx.vars.positionsFailed ?? 0) + 1;
                        resultText += position.failText;
                    }
                    const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
                    if (def) {
                        const neutralized = ctx.vars.positionsNeutralized ?? 0;
                        const nextRound = round + 1;
                        let nextStep: string;
                        if (neutralized >= POSITIONS_TO_NEUTRALIZE) {
                            nextStep = 'checkmated';
                        } else if (nextRound > TACTICAL_ROUNDS) {
                            nextStep = 'last_stand';
                        } else {
                            nextStep = `round_${nextRound}_position`;
                        }
                        def.steps[`round_${round}_resolve_${action.id}`].nextStep = nextStep;
                        def.steps[`round_${round}_resolve_${action.id}`].text = resultText;
                    }
                },
                nextStep: round < TACTICAL_ROUNDS ? `round_${round + 1}_position` : 'last_stand',
            };
        }
    }

    // ── IMPROVISED MOVE ──
    steps['improvised_move'] = {
        id: 'improvised_move',
        text: `*He improvises — and even improvised, Pervis is formidable. But improvisation is a different thing from preparation, and you've been reading him all day.*\n\n*You anticipate the move before he completes it, and close the angle.*`,
        onEnter: (ctx: EventContext) => {
            ctx.vars.positionsNeutralized = (ctx.vars.positionsNeutralized ?? 0) + 1;
        },
        nextStep: 'checkmated',
    };

    // ── LAST STAND ──
    steps['last_stand'] = {
        id: 'last_stand',
        text: '',
        onEnter: (ctx: EventContext) => {
            const neutralized = ctx.vars.positionsNeutralized ?? 0;
            const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
            if (def) {
                if (neutralized >= 3) {
                    def.steps['last_stand'].text = `*The board is almost empty. You've neutralized nearly everything he prepared — but there's one more move. He's considering it now, very carefully.*`;
                } else {
                    def.steps['last_stand'].text = `*He's still in the game, and the advantage has shifted back and forth too many times to call. One final exchange. Everything hangs on it.*`;
                }
            }
        },
        choices: [
            {
                id: 'final_wisdom',
                label: 'Final Countermove (Wisdom)',
                tooltip: 'Anticipate his last position and block it.',
                nextStep: 'final_wisdom_check',
            },
            {
                id: 'final_charm',
                label: 'Final Negotiation (Charm)',
                tooltip: 'Make a direct appeal that cuts through everything else.',
                nextStep: 'final_charm_check',
            },
            {
                id: 'final_power',
                label: 'Collapse the Board (Power)',
                tooltip: 'Remove the tactical game entirely with direct force.',
                nextStep: 'final_power_check',
            },
        ],
    };

    steps['final_wisdom_check'] = {
        id: 'final_wisdom_check',
        text: `*You read the situation and make your move...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.wisdom, 68);
            const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
            if (def) {
                def.steps['final_wisdom_check'].nextStep = success ? 'checkmated' : 'pervis_retreat';
                def.steps['final_wisdom_check'].text = `*[Wisdom ${total} vs DC 68 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'checkmated',
    };

    steps['final_charm_check'] = {
        id: 'final_charm_check',
        text: `*You speak plainly, cutting through all the tactics...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.charm, 68);
            const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
            if (def) {
                def.steps['final_charm_check'].nextStep = success ? 'checkmated' : 'pervis_retreat';
                def.steps['final_charm_check'].text = `*[Charm ${total} vs DC 68 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'checkmated',
    };

    steps['final_power_check'] = {
        id: 'final_power_check',
        text: `*You stop playing the game and apply direct force...*`,
        onEnter: (ctx: EventContext) => {
            const { total, success } = rollSkillCheck(ctx.stage.currentState.stats.skills.power, 72);
            const def = ctx.stage.getEventDefinition('quest_pervis_06_confrontation');
            if (def) {
                def.steps['final_power_check'].nextStep = success ? 'checkmated' : 'pervis_retreat';
                def.steps['final_power_check'].text = `*[Power ${total} vs DC 72 — ${success ? '✓ Success' : '✗ Fail'}]*`;
            }
        },
        nextStep: 'checkmated',
    };

    // ── PERVIS RETREAT ──
    steps['pervis_retreat'] = {
        id: 'pervis_retreat',
        text: `*He executes his retreat with the same unhurried precision he does everything else — three steps to a prepared exit route you didn't know existed, and he's through it before you can close the distance.*\n\n*His voice comes from somewhere in the dark beyond the doorway.*\n\n*"Well played. Most of it."*\n\n*Then silence.*\n\n*He's gone. But not far — and not for long. He didn't abandon the encampment. He just bought time. You'll meet again.*`,
        onEnter: (ctx: EventContext) => {
            // Block quest advancement — Pervis wasn't captured, confrontation can be attempted again.
            ctx.vars.blockQuestAdvancement = true;
        },
        isEnding: true,
    };

    // ── VICTORY ──
    steps['checkmated'] = {
        id: 'checkmated',
        text: `*The last position falls.*\n\n*Pervis stands in the center of the room, every prepared move exhausted, every exit accounted for. He looks at the board — metaphorically and literally — and then he looks at you.*\n\n*"I have one question," he says. His voice is perfectly level. "How long have you been planning this?"*\n\n*The binding settles around him — quiet, precise, exactly fitted. He feels it immediately, and his nose twitches, and for just a moment something crosses his face that might be, against all odds, appreciation.*\n\n*"Longer than I planned for," he says. "That's... uncommon."*\n\n*Pervis has been captured.*`,
        image: PERVIS_AVATAR,
        effects: [
            { type: 'set_hero_status', target: 'Pervis', status: 'captured' },
        ],
        isEnding: true,
    };

    return {
        id: 'quest_pervis_06_confrontation',
        name: 'Checkmate',
        description: "Face Pervis in his inner keep and neutralize every tactical move he makes.",
        icon: 'crosshair',
        category: 'combat',
        location: 'Ruins',
        prerequisites: [{ type: 'event_completed', eventId: 'quest_pervis_05_advance' }],
        startStep: 'intro',
        steps,
    };
}

// ══════════════════════════════════════════
// PERVIS'S QUEST DEFINITION
// ══════════════════════════════════════════
export const PERVIS_QUEST: QuestDefinition = {
    id: 'quest_pervis',
    name: 'The Iron Command',
    description: "Breach the ruins encampment layer by layer and outmaneuver the tactical leader within.",
    icon: 'flag',
    heroName: 'Pervis',
    captureQuest: true,
    prerequisites: [
        { type: 'quest_complete', eventId: 'quest_sable' },
        { type: 'quest_complete', eventId: 'quest_kova' },
        { type: 'quest_complete', eventId: 'quest_veridian' },
    ],
    steps: [
        {
            id: 'intel',
            name: 'Gathering Intel',
            description: 'Gather intelligence about the fortified ruins encampment.',
            eventId: 'quest_pervis_01_intel',
            location: 'Town',
            icon: 'search',
        },
        {
            id: 'perimeter',
            name: 'The Outer Walls',
            description: "Map the encampment's outer defenses.",
            eventId: 'quest_pervis_02_perimeter',
            location: 'Ruins',
            icon: 'shield',
        },
        {
            id: 'infiltrate',
            name: 'Past the Guards',
            description: 'Use knowledge of the ruins to slip past the inner guard positions.',
            eventId: 'quest_pervis_03_infiltrate',
            location: 'Ruins',
            icon: 'eye-off',
        },
        {
            id: 'sabotage',
            name: 'Supply Sabotage',
            description: "Disrupt the encampment's supply lines.",
            eventId: 'quest_pervis_04_sabotage',
            location: 'Ruins',
            icon: 'zap',
        },
        {
            id: 'advance',
            name: 'The Inner Keep',
            description: "Breach the encampment's final defensive layer.",
            eventId: 'quest_pervis_05_advance',
            location: 'Ruins',
            icon: 'door-open',
        },
        {
            id: 'confrontation',
            name: 'Checkmate',
            description: 'Face Pervis in his inner keep and neutralize every tactical position he deploys.',
            eventId: 'quest_pervis_06_confrontation',
            location: 'Ruins',
            icon: 'crosshair',
        },
    ],
};
