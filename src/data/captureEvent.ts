// ──────────────────────────────────────────
// CAPTURE EVENT — Woods NPC Capture Minigame
// Three-phase structured hunt: Tracking → Confrontation → Binding
// ──────────────────────────────────────────
import type { EventDefinition, EventContext, EventChoice, SkillStats } from './types';
import { rollSkillCheck } from './events';
import { generateRandomNPC, npcToHero, getCombatStyleInfo } from './npcGeneration';
import type { GeneratedNPC, CombatStyle } from './npcGeneration';

// ══════════════════════════════════════════
// CAPTURE ACTION DEFINITIONS
// ══════════════════════════════════════════

/** Maps combat style → which actions get a bonus against it */
const STYLE_BONUSES: Record<CombatStyle, string[]> = {
    aggressive: ['enchant', 'outwit'],
    evasive: ['ambush', 'set_trap'],
    defensive: ['soothe', 'intimidate'],
    cunning: ['outwit', 'enchant'],
    panicked: ['intimidate', 'soothe'],
};

/** Maps combat style → which actions are penalized against it */
const STYLE_PENALTIES: Record<CombatStyle, string[]> = {
    aggressive: ['soothe', 'intimidate'],
    evasive: ['intimidate', 'soothe'],
    defensive: ['ambush', 'set_trap'],
    cunning: ['ambush', 'set_trap'],
    panicked: ['outwit', 'enchant'],
};

interface CaptureAction {
    id: string;
    label: string;
    icon: string;
    skill: keyof SkillStats;
    baseDC: number;
    baseScore: number;
    failPenalty: number;
    bonusScore: number;       // extra score when action is strong against NPC's combat style
    penaltyScore: number;     // score reduction when action is weak against NPC's combat style
    manaCost: number;
    requiresItem?: string;
    consumesItem?: boolean;
    description: string;
    successNarrative: string;
    failNarrative: string;
    bonusNarrative: string;   // extra narration when combat-style bonus applies
}

export const CAPTURE_ACTIONS: Record<string, CaptureAction> = {
    ambush: {
        id: 'ambush',
        label: 'Ambush',
        icon: 'zap',
        skill: 'speed',
        baseDC: 55,
        baseScore: 3,
        failPenalty: -1,
        bonusScore: 2,
        penaltyScore: -1,
        manaCost: 0,
        description: 'Strike from the shadows with speed and surprise. High reward but risky.',
        successNarrative: '*You burst from concealment, closing the distance before {name} can react. A perfect ambush — {pronoun} stumbles back, disoriented by the sudden assault.*',
        failNarrative: '*You spring your ambush, but {name} spots you at the last moment and sidesteps. Your momentum carries you past, and you scramble to recover.*',
        bonusNarrative: '*{name}\'s evasive instincts work against {pronoun_object} — the feint-and-strike catches {pronoun_object} mid-dodge, twice as effective as a direct approach.*',
    },
    intimidate: {
        id: 'intimidate',
        label: 'Intimidate',
        icon: 'volume-2',
        skill: 'power',
        baseDC: 50,
        baseScore: 2,
        failPenalty: -1,
        bonusScore: 2,
        penaltyScore: -1,
        manaCost: 0,
        description: 'Project overwhelming authority and menace. Effective against fear.',
        successNarrative: '*You step forward with commanding presence, letting your aura of authority wash over {name}. {possessive_cap} resolve visibly wavers — knees trembling, eyes downcast.*',
        failNarrative: '*{name} meets your gaze defiantly, unimpressed by the display. If anything, the attempt seems to have steeled {possessive} resolve.*',
        bonusNarrative: '*{name}\'s panicked state amplifies the effect — your mere presence is enough to make {pronoun_object} freeze in terror.*',
    },
    enchant: {
        id: 'enchant',
        label: 'Enchant',
        icon: 'sparkles',
        skill: 'charm',
        baseDC: 55,
        baseScore: 3,
        failPenalty: 0,
        bonusScore: 2,
        penaltyScore: -1,
        manaCost: 10,
        description: 'Weave a subtle enchantment to cloud their mind. Costs mana but reliable.',
        successNarrative: '*Your fingers trace a golden spiral in the air, and a soft, hypnotic glow settles over {name}\'s eyes. {possessive_cap} movements slow, thoughts thickening like honey.*',
        failNarrative: '*The enchantment glimmers and fades — {name}\'s willpower proves stronger than expected, shaking off the spell with a defiant snarl.*',
        bonusNarrative: '*{name}\'s aggressive focus makes {pronoun_object} easy to entrance — all that intensity channeled right into your spiral.*',
    },
    outwit: {
        id: 'outwit',
        label: 'Outwit',
        icon: 'brain',
        skill: 'wisdom',
        baseDC: 50,
        baseScore: 2,
        failPenalty: 0,
        bonusScore: 2,
        penaltyScore: -1,
        manaCost: 0,
        description: 'Outthink and outmaneuver them. Low risk, steady progress.',
        successNarrative: '*You anticipate {name}\'s next move before {pronoun} makes it, positioning yourself perfectly to cut off every escape route. {possessive_cap} options are narrowing.*',
        failNarrative: '*{name} proves sharper than expected, slipping through a gap in your strategy you hadn\'t considered. A temporary setback.*',
        bonusNarrative: '*{name}\'s cunning tricks are transparent to you — each ploy unraveled before it can take effect.*',
    },
    set_trap: {
        id: 'set_trap',
        label: 'Set Trap',
        icon: 'git-branch',
        skill: 'speed',
        baseDC: 45,
        baseScore: 4,
        failPenalty: -1,
        bonusScore: 2,
        penaltyScore: -1,
        manaCost: 0,
        requiresItem: 'Binding Cord',
        consumesItem: true,
        description: 'Lay a physical snare. Requires Binding Cord, but highly effective.',
        successNarrative: '*The binding cord snaps taut around {name}\'s ankle as {pronoun} steps into your trap. {pronoun_cap} crashes to the ground, tangled and struggling.*',
        failNarrative: '*{name} spots the cord at the last moment and leaps over it. The trap lies there uselessly as {pronoun} gives you a withering look.*',
        bonusNarrative: '*{name}\'s panicked flight carries {pronoun_object} straight into the snare — the faster they run, the harder they\'re caught.*',
    },
    soothe: {
        id: 'soothe',
        label: 'Soothe',
        icon: 'heart',
        skill: 'charm',
        baseDC: 45,
        baseScore: 2,
        failPenalty: 0,
        bonusScore: 2,
        penaltyScore: -1,
        manaCost: 5,
        description: 'Gentle, calming words and gestures. No risk, slow but safe.',
        successNarrative: '*"Easy now," you murmur, voice like warm silk. {name}\'s tension eases fractionally — the fight draining from {possessive} posture, replaced by a treacherous calm.*',
        failNarrative: '*{name} narrows {possessive} eyes at your gentle tone. "Don\'t patronize me," {pronoun} snaps, though the words carry less venom than intended.*',
        bonusNarrative: '*{name}\'s defensive walls are no match for genuine warmth — each kind word chips away at the armor.*',
    },
};

// ══════════════════════════════════════════
// NARRATIVE HELPERS
// ══════════════════════════════════════════

/** Interpolate NPC data into narrative templates */
function narrate(template: string, npc: GeneratedNPC): string {
    const genderLower = npc.gender.toLowerCase();
    const pronoun = genderLower === 'male' ? 'he' : 'she';
    const pronoun_object = genderLower === 'male' ? 'him' : 'her';
    const pronoun_cap = genderLower === 'male' ? 'He' : 'She';
    const possessive = genderLower === 'male' ? 'his' : 'her';
    const possessive_cap = genderLower === 'male' ? 'His' : 'Her';

    return template
        .replace(/\{name\}/g, npc.name)
        .replace(/\{pronoun\}/g, pronoun)
        .replace(/\{pronoun_object\}/g, pronoun_object)
        .replace(/\{pronoun_cap\}/g, pronoun_cap)
        .replace(/\{possessive\}/g, possessive)
        .replace(/\{possessive_cap\}/g, possessive_cap)
        .replace(/\{class\}/g, npc.className)
        .replace(/\{species\}/g, npc.species.toLowerCase())
        .replace(/\{combat_style\}/g, npc.combatStyle);
}

/** Build a score display — filled stars for progress */
function scoreDisplay(score: number, max: number = 12): string {
    const stars = Math.max(0, Math.min(max, score));
    return '★'.repeat(stars) + '☆'.repeat(Math.max(0, max - stars));
}

/** Get tracking difficulty as a named DC */
function getTrackingDC(npc: GeneratedNPC, baseDC: number = 55): number {
    return baseDC + npc.trackingDifficulty;
}

/** Get confrontation action DC adjusted for NPC */
function getActionDC(action: CaptureAction, npc: GeneratedNPC): number {
    return action.baseDC + npc.confrontationDifficulty;
}

/** Calculate score delta for an action against a particular NPC */
function getActionScore(actionId: string, npc: GeneratedNPC, success: boolean): { score: number; isBonus: boolean; isPenalty: boolean } {
    const action = CAPTURE_ACTIONS[actionId];
    if (!action) return { score: 0, isBonus: false, isPenalty: false };

    const bonusActions = STYLE_BONUSES[npc.combatStyle] || [];
    const penaltyActions = STYLE_PENALTIES[npc.combatStyle] || [];
    const isBonus = bonusActions.includes(actionId);
    const isPenalty = penaltyActions.includes(actionId);

    if (success) {
        let score = action.baseScore;
        if (isBonus) score += action.bonusScore;
        if (isPenalty) score += action.penaltyScore;
        return { score: Math.max(0, score), isBonus, isPenalty };
    } else {
        let score = action.failPenalty;
        if (isPenalty) score -= 1; // extra penalty when using wrong type
        return { score, isBonus: false, isPenalty };
    }
}

// ══════════════════════════════════════════
// THE CAPTURE EVENT DEFINITION
// ══════════════════════════════════════════

/**
 * Build the array of confrontation choices from CAPTURE_ACTIONS.
 * Each becomes an EventChoice with a skillCheck that routes to generated result steps.
 */
function buildRoundChoices(round: number): EventChoice[] {
    return Object.values(CAPTURE_ACTIONS).map(action => ({
        id: `${action.id}_r${round}`,
        label: action.label,
        tooltip: action.description + (action.manaCost > 0 ? ` (${action.manaCost} mana)` : '') + (action.requiresItem ? ` [Requires ${action.requiresItem}]` : ''),
        nextStep: `round_${round}_resolve_${action.id}`,
        requiresItem: action.requiresItem,
        consumeItem: action.consumesItem ? action.requiresItem : undefined,
        condition: action.manaCost > 0
            ? (ctx: EventContext) => ctx.stage.currentState.stats.mana >= action.manaCost
            : undefined,
    }));
}

/**
 * Build the complete capture event with all three phases.
 * Steps are generated dynamically from the action definitions.
 */
export function buildCaptureEvent(): EventDefinition {
    const TOTAL_ROUNDS = 3;
    const steps: Record<string, any> = {};

    // ── PHASE 1: INTRO ──
    steps['intro'] = {
        id: 'intro',
        text: '', // Set dynamically by onEnter
        onEnter: (ctx: EventContext) => {
            // Generate the NPC
            const existingNames = [
                ...Object.keys(ctx.stage.currentState.heroes),
                ...Object.keys(ctx.stage.currentState.servants),
            ];
            const npc = generateRandomNPC(existingNames);
            ctx.vars.npc = npc;
            ctx.vars.captureScore = 0;
            ctx.vars.roundsPlayed = 0;
            ctx.vars.totalRounds = TOTAL_ROUNDS;
            ctx.vars.roundResults = [];

            // Fire off async portrait + backstory generation
            ctx.stage.generateNPCPortraitAsync(npc);
            ctx.stage.generateNPCBackstoryAsync(npc);

            // Dynamically set the intro text
            const styleInfo = getCombatStyleInfo(npc.combatStyle);
            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (def) {
                def.steps['intro'].text = `*Deep in the ancient woods, you sense a presence among the trees. Your magical instincts tingle — someone is nearby, and they would make a fine addition to your household.*\n\n*Through the foliage, you catch a glimpse of your quarry:*\n\n**${npc.name}** — *${npc.className}*\n*${npc.description}*\n\n[icon:clipboard-list] **Combat Style: ${styleInfo.label}** — ${styleInfo.description}\n[icon:lightbulb] *Effective approaches: ${styleInfo.strongAgainst}*`;
            }
        },
        nextStep: 'tracking_phase',
    };

    // ── PHASE 1: TRACKING ──
    steps['tracking_phase'] = {
        id: 'tracking_phase',
        text: '', // Set dynamically
        onEnter: (ctx: EventContext) => {
            const npc = ctx.vars.npc as GeneratedNPC;
            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (def) {
                def.steps['tracking_phase'].text = `*You begin to stalk ${npc.name} through the woods, keeping to the shadows and reading the signs of ${npc.gender === 'Male' ? 'his' : 'her'} passage — bent branches, disturbed leaves, the faintest scent on the breeze.*\n\n*This ${npc.className.toLowerCase()} won't be easy to corner. You need to close the distance without being detected.*`;
            }
        },
        choices: [
            {
                id: 'track_speed',
                label: 'Run Them Down',
                tooltip: 'Use raw speed to close the distance. (Speed check)',
                nextStep: 'tracking_resolve_speed',
            },
            {
                id: 'track_wisdom',
                label: 'Read the Signs',
                tooltip: 'Use awareness and cunning to predict their path. (Wisdom check)',
                nextStep: 'tracking_resolve_wisdom',
            },
            {
                id: 'track_charm',
                label: 'Lure Them Out',
                tooltip: 'Create a magical lure to draw them closer. (Charm check, costs 10 mana)',
                nextStep: 'tracking_resolve_charm',
                condition: (ctx: EventContext) => ctx.stage.currentState.stats.mana >= 10,
            },
        ],
    };

    // Tracking resolve steps
    for (const approach of ['speed', 'wisdom', 'charm'] as const) {
        steps[`tracking_resolve_${approach}`] = {
            id: `tracking_resolve_${approach}`,
            text: '*You make your approach...*',
            onEnter: (ctx: EventContext) => {
                const npc = ctx.vars.npc as GeneratedNPC;
                const dc = getTrackingDC(npc);
                const skillKey = approach === 'speed' ? 'speed' : approach === 'wisdom' ? 'wisdom' : 'charm';
                const skill = ctx.stage.currentState.stats.skills[skillKey];

                // Deduct mana for charm approach
                if (approach === 'charm') {
                    ctx.stage.currentState.stats.mana = Math.max(0, ctx.stage.currentState.stats.mana - 10);
                }

                const result = rollSkillCheck(skill, dc);
                ctx.vars.trackingResult = result;
                ctx.vars.trackingApproach = approach;

                const def = ctx.stage.getEventDefinition('explore_woods_capture');
                if (!def) return;

                if (result.success) {
                    ctx.vars.captureScore += 2; // Bonus for good tracking
                    const successTexts: Record<string, string> = {
                        speed: `*Your feet are swift and sure — you close the distance in moments, appearing before ${npc.name} like a shadow made flesh. ${npc.gender === 'Male' ? 'He' : 'She'} startles, caught off guard.*\n\n[icon:check] **Tracking Success!** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})* — +2 bonus capture score\n\nYou've cornered your prey. Now comes the confrontation.`,
                        wisdom: `*You read the broken twigs and subtle tracks like a book, anticipating ${npc.name}'s path perfectly. When ${npc.gender === 'Male' ? 'he' : 'she'} rounds the next oak, you're already there, waiting.*\n\n[icon:check] **Tracking Success!** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})* — +2 bonus capture score\n\nYou've cornered your prey. Now comes the confrontation.`,
                        charm: `*A shimmer of gold light drifts through the trees, carrying with it a whispered promise of warmth and safety. ${npc.name} follows it, curiosity overriding caution — right into your waiting presence.*\n\n[icon:check] **Tracking Success!** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})* — +2 bonus capture score\n\nYou've cornered your prey. Now comes the confrontation.`,
                    };
                    def.steps[`tracking_resolve_${approach}`].text = successTexts[approach];
                    def.steps[`tracking_resolve_${approach}`].nextStep = 'confrontation_intro';
                } else {
                    const failTexts: Record<string, string> = {
                        speed: `*You dart through the trees, but a snapping branch gives you away. ${npc.name} bolts deeper into the woods.*\n\n[icon:x] **Tracking Failed** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})*\n\nYou lose the trail, but stumble upon something useful in the undergrowth.`,
                        wisdom: `*You follow what you think is ${npc.name}'s trail, but your quarry is cannier than expected. The tracks loop back on themselves — a false trail.*\n\n[icon:x] **Tracking Failed** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})*\n\nThe prey escapes, but the effort wasn't entirely wasted.`,
                        charm: `*The magical lure drifts through the trees, but ${npc.name} senses the enchantment and flees in the opposite direction.*\n\n[icon:x] **Tracking Failed** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})*\n\nYou lose them, but the ambient mana in the forest replenishes you slightly.`,
                    };
                    def.steps[`tracking_resolve_${approach}`].text = failTexts[approach];
                    def.steps[`tracking_resolve_${approach}`].nextStep = 'tracking_failed';
                }
            },
        };
    }

    // Tracking failure — consolation prize and exit
    steps['tracking_failed'] = {
        id: 'tracking_failed',
        text: '*Your quarry vanishes into the deep forest. Perhaps next time you\'ll be quicker — or smarter.*\n\n*At least the trek wasn\'t entirely fruitless. On the way back, you find some useful herbs growing along the trail.*',
        effects: [
            { type: 'add_item', target: 'Dreamcatcher Herb', value: 2 },
            { type: 'modify_skill', target: 'speed', value: 1 },
        ],
        isEnding: true,
    };

    // ── PHASE 2: CONFRONTATION INTRO ──
    steps['confrontation_intro'] = {
        id: 'confrontation_intro',
        text: '',
        onEnter: (ctx: EventContext) => {
            const npc = ctx.vars.npc as GeneratedNPC;
            const styleInfo = getCombatStyleInfo(npc.combatStyle);
            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (def) {
                def.steps['confrontation_intro'].text = `${npc.captureFlavorText}\n\n*The confrontation begins. You have **${TOTAL_ROUNDS} rounds** to wear down ${npc.name}'s resistance and prepare them for capture. Choose your actions wisely — some approaches work better against ${npc.gender === 'Male' ? 'his' : 'her'} **${styleInfo.label}** fighting style than others.*\n\n[icon:chart] **Capture Progress:** ${scoreDisplay(ctx.vars.captureScore, 12)}  (${ctx.vars.captureScore}/12)`;
            }
        },
        nextStep: 'round_1',
    };

    // ── PHASE 2: CONFRONTATION ROUNDS ──
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        // Round choice step
        steps[`round_${round}`] = {
            id: `round_${round}`,
            text: '',
            onEnter: (ctx: EventContext) => {
                const npc = ctx.vars.npc as GeneratedNPC;
                const styleInfo = getCombatStyleInfo(npc.combatStyle);
                const def = ctx.stage.getEventDefinition('explore_woods_capture');
                if (def) {
                    def.steps[`round_${round}`].text = `**— Round ${round} of ${TOTAL_ROUNDS} —**\n\n*${npc.name} ${round === 1 ? 'faces you' : 'is still standing'}, ${npc.combatStyle === 'panicked' ? 'trembling with fear' : npc.combatStyle === 'aggressive' ? 'teeth gritted with defiance' : npc.combatStyle === 'evasive' ? 'poised to flee' : npc.combatStyle === 'defensive' ? 'hunkered down stubbornly' : 'watching you with calculating eyes'}.*\n\n[icon:chart] **Capture Progress:** ${scoreDisplay(ctx.vars.captureScore, 12)}  (${ctx.vars.captureScore}/12)\n[icon:lightbulb] **Style:** ${styleInfo.label} — *weak to ${styleInfo.strongAgainst}*\n\nWhat do you do?`;
                }
            },
            choices: buildRoundChoices(round),
        };

        // Generate resolve steps for each action in each round
        for (const action of Object.values(CAPTURE_ACTIONS)) {
            const resolveId = `round_${round}_resolve_${action.id}`;
            steps[resolveId] = {
                id: resolveId,
                text: '*You make your move...*',
                onEnter: (ctx: EventContext) => {
                    const npc = ctx.vars.npc as GeneratedNPC;
                    const dc = getActionDC(action, npc);
                    const skill = ctx.stage.currentState.stats.skills[action.skill];

                    // Deduct mana if needed
                    if (action.manaCost > 0) {
                        ctx.stage.currentState.stats.mana = Math.max(0, ctx.stage.currentState.stats.mana - action.manaCost);
                    }

                    const result = rollSkillCheck(skill, dc);
                    const scoreResult = getActionScore(action.id, npc, result.success);
                    ctx.vars.captureScore = Math.max(0, (ctx.vars.captureScore || 0) + scoreResult.score);
                    ctx.vars.roundsPlayed = round;
                    ctx.vars.roundResults.push({ action: action.id, success: result.success, score: scoreResult.score, isBonus: scoreResult.isBonus });

                    const def = ctx.stage.getEventDefinition('explore_woods_capture');
                    if (!def) return;

                    let text = '';
                    if (result.success) {
                        text = narrate(action.successNarrative, npc);
                        if (scoreResult.isBonus) {
                            text += '\n\n' + narrate(action.bonusNarrative, npc);
                        }
                        text += `\n\n[icon:check] **${action.label} — Success!** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})*`;
                        text += `\n[icon:chart] **+${scoreResult.score} capture progress** → ${scoreDisplay(ctx.vars.captureScore, 12)}  (${ctx.vars.captureScore}/12)`;
                    } else {
                        text = narrate(action.failNarrative, npc);
                        text += `\n\n[icon:x] **${action.label} — Failed** *(Roll: ${result.roll} + ${Math.floor(skill/2)} = ${result.total} vs DC ${dc})*`;
                        if (scoreResult.score < 0) {
                            text += `\n[icon:chart] **${scoreResult.score} capture progress** → ${scoreDisplay(ctx.vars.captureScore, 12)}  (${ctx.vars.captureScore}/12)`;
                        } else {
                            text += `\n[icon:chart] Capture progress unchanged → ${scoreDisplay(ctx.vars.captureScore, 12)}  (${ctx.vars.captureScore}/12)`;
                        }
                        if (scoreResult.isPenalty) {
                            text += `\n[icon:alert-triangle] *This approach is less effective against ${npc.name}'s ${npc.combatStyle} style.*`;
                        }
                    }

                    def.steps[resolveId].text = text;

                    // Route to next round or binding phase
                    if (round < TOTAL_ROUNDS) {
                        def.steps[resolveId].nextStep = `round_${round + 1}`;
                    } else {
                        def.steps[resolveId].nextStep = 'binding_attempt';
                    }
                },
            };
        }
    }

    // ── PHASE 3: BINDING ATTEMPT ──
    steps['binding_attempt'] = {
        id: 'binding_attempt',
        text: '',
        onEnter: (ctx: EventContext) => {
            const npc = ctx.vars.npc as GeneratedNPC;
            const score = ctx.vars.captureScore as number;
            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (!def) return;

            // Score thresholds:
            // 8+ = guaranteed capture
            // 4-7 = final skill check (wisdom)
            // 0-3 = guaranteed escape

            if (score >= 8) {
                def.steps['binding_attempt'].text = `*${npc.name} sinks to ${npc.gender === 'Male' ? 'his' : 'her'} knees, resistance utterly shattered. Your approaches have left ${npc.gender === 'Male' ? 'him' : 'her'} dazed, confused, and unable to muster the will to flee.*\n\n[icon:chart] **Final Score: ${scoreDisplay(score, 12)}  (${score}/12)** — *Overwhelming success!*\n\n*The binding is almost a formality.*`;
                def.steps['binding_attempt'].nextStep = 'capture_success';
            } else if (score <= 3) {
                def.steps['binding_attempt'].text = `*${npc.name} gathers ${npc.gender === 'Male' ? 'his' : 'her'} remaining strength, finding a reserve of defiance you failed to break. With a desperate surge, ${npc.gender === 'Male' ? 'he' : 'she'} breaks free of your encirclement.*\n\n[icon:chart] **Final Score: ${scoreDisplay(score, 12)}  (${score}/12)** — *Insufficient — the prey escapes!*\n\n*The ${npc.className.toLowerCase()} vanishes into the deep woods, leaving you empty-handed.*`;
                def.steps['binding_attempt'].nextStep = 'capture_fail';
            } else {
                // Medium score → final check
                const finalDC = 60 - (score * 3); // Higher score = easier final check
                def.steps['binding_attempt'].text = `*${npc.name} is weakened but not yet broken. ${npc.gender === 'Male' ? 'He' : 'She'} makes one last desperate bid for freedom — this is your final chance to secure the capture!*\n\n[icon:chart] **Final Score: ${scoreDisplay(score, 12)}  (${score}/12)** — *One final check to seal the binding! (DC ${finalDC})*`;
                def.steps['binding_attempt'].choices = [
                    {
                        id: 'final_bind',
                        label: 'Complete the Binding',
                        tooltip: `Final wisdom check (DC ${finalDC}) — your accumulated advantage matters!`,
                        nextStep: 'final_binding_check',
                    },
                ];
            }
        },
    };

    // Final binding skill check (for medium scores)
    steps['final_binding_check'] = {
        id: 'final_binding_check',
        text: '*You reach out with your will...*',
        onEnter: (ctx: EventContext) => {
            const npc = ctx.vars.npc as GeneratedNPC;
            const score = ctx.vars.captureScore as number;
            const finalDC = 60 - (score * 3);
            const wisdom = ctx.stage.currentState.stats.skills.wisdom;
            const result = rollSkillCheck(wisdom, finalDC);

            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (!def) return;

            if (result.success) {
                def.steps['final_binding_check'].text = `*You summon every ounce of your enchantress's will and channel it into a binding spiral. Golden light wraps around ${npc.name} like silken chains, and ${npc.gender === 'Male' ? 'his' : 'her'} eyes glaze with enforced submission.*\n\n[icon:check] **Binding Successful!** *(Roll: ${result.roll} + ${Math.floor(wisdom/2)} = ${result.total} vs DC ${finalDC})*\n\n*${npc.name} is yours.*`;
                def.steps['final_binding_check'].nextStep = 'capture_success';
            } else {
                def.steps['final_binding_check'].text = `*You reach out with your binding magic, but ${npc.name} summons a final reserve of willpower. The golden spiral shatters, and ${npc.gender === 'Male' ? 'he' : 'she'} tears free, stumbling into the undergrowth.*\n\n[icon:x] **Binding Failed** *(Roll: ${result.roll} + ${Math.floor(wisdom/2)} = ${result.total} vs DC ${finalDC})*\n\n*So close... but the prey escapes. Perhaps next time.*`;
                def.steps['final_binding_check'].nextStep = 'capture_fail';
            }
        },
    };

    // ── CAPTURE SUCCESS ──
    steps['capture_success'] = {
        id: 'capture_success',
        text: '',
        onEnter: (ctx: EventContext) => {
            const npc = ctx.vars.npc as GeneratedNPC;

            // Retrieve the async-generated portrait and backstory if available
            const portrait = ctx.stage.getPendingNPCPortrait(npc.name);
            const backstory = ctx.stage.getPendingNPCBackstory(npc.name);

            // Create the Hero entry
            const hero = npcToHero(npc, portrait || '');
            if (backstory) {
                hero.backstory = backstory;
            }
            ctx.stage.currentState.heroes[npc.name] = hero;

            // Track in chat state
            ctx.stage.chatState.totalHeroesCaptured = (ctx.stage.chatState.totalHeroesCaptured || 0) + 1;

            // Store name for pending portrait completion
            if (!portrait) {
                ctx.vars.pendingPortrait = npc.name;
            }

            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (def) {
                const roundSummary = (ctx.vars.roundResults as any[]).map((r: any, i: number) =>
                    `  Round ${i + 1}: ${CAPTURE_ACTIONS[r.action]?.label || r.action} — ${r.success ? '[icon:check]' : '[icon:x]'} (${r.score >= 0 ? '+' : ''}${r.score})`
                ).join('\n');

                def.steps['capture_success'].text = `*${npc.name} slumps, all fight gone, eyes unfocused and glassy. Your enchantments hold firm — the ${npc.className.toLowerCase()} is thoroughly captured.*\n\n*You bind ${npc.gender === 'Male' ? 'his' : 'her'} wrists with enchanted cord and lead your new acquisition back toward the manor. Another soul for the household.*\n\n[icon:trophy] **Capture Complete!**\n\n**${npc.name}** — ${npc.className}\n${roundSummary}\n\n*${npc.name} has been added to your **Captives**. Visit the dungeon to begin conditioning.*`;
            }
        },
        effects: [
            { type: 'modify_gold', value: 15 },
            { type: 'modify_skill', target: 'charm', value: 1 },
        ],
        isEnding: true,
    };

    // ── CAPTURE FAILURE ──
    steps['capture_fail'] = {
        id: 'capture_fail',
        text: '',
        onEnter: (ctx: EventContext) => {
            const npc = ctx.vars.npc as GeneratedNPC;
            const def = ctx.stage.getEventDefinition('explore_woods_capture');
            if (def) {
                const roundSummary = (ctx.vars.roundResults as any[]).map((r: any, i: number) =>
                    `  Round ${i + 1}: ${CAPTURE_ACTIONS[r.action]?.label || r.action} — ${r.success ? '[icon:check]' : '[icon:x]'} (${r.score >= 0 ? '+' : ''}${r.score})`
                ).join('\n');

                def.steps['capture_fail'].text = `*${npc.name} disappears into the depths of the forest, leaving you alone among the ancient trees. A frustrating outcome — but not a total loss.*\n\n*The pursuit has sharpened your instincts and you found some useful materials scattered along the trail.*\n\n[icon:clipboard-list] **Hunt Summary:**\n${roundSummary}\n\n*Better luck next time. The woods always have new wanderers...*`;
            }
        },
        effects: [
            { type: 'modify_gold', value: 10 },
            { type: 'modify_skill', target: 'speed', value: 1 },
            { type: 'add_item', target: 'Dreamcatcher Herb', value: 1 },
        ],
        isEnding: true,
    };

    return {
        id: 'explore_woods_capture',
        name: 'Stalk Prey',
        description: 'Hunt a wanderer in the deep woods and attempt to capture them.',
        icon: 'crosshair',
        category: 'exploration',
        startStep: 'intro',
        steps,
    };
}

/** The capture event instance — built once at import time */
export const EXPLORE_WOODS_CAPTURE: EventDefinition = buildCaptureEvent();
