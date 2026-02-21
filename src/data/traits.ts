// ──────────────────────────────────────────
// TRAIT SYSTEM
// ──────────────────────────────────────────

export type TraitScope = 'character' | 'role' | 'room' | 'situational';

export interface TraitDefinition {
    name: string;
    scope: TraitScope;
    summary: string;
    properties: string[];
    effects: string[];
}

export const TRAIT_REGISTRY: Record<string, TraitDefinition> = {
    enchantress: { name: 'Enchantress', scope: 'character', summary: 'Naturally manipulative magical presence.', properties: ['Arcane social pressure', 'High charisma aura'], effects: ['Improves persuasion outcomes in social scenes', 'Increases conversion momentum in narrative checks'] },
    cunning: { name: 'Cunning', scope: 'character', summary: 'Quick to exploit weaknesses and opportunities.', properties: ['Adaptive planning', 'Reads intent quickly'], effects: ['Better outcomes in deception and negotiation events', 'Boosts tactical options in scene generation'] },
    ambitious: { name: 'Ambitious', scope: 'character', summary: 'Driven to expand control and influence.', properties: ['Goal-focused behavior', 'High initiative'], effects: ['Prioritizes expansion and high-value actions', 'Increases pressure in long-term progression'] },
    charismatic: { name: 'Charismatic', scope: 'character', summary: 'Magnetic personality that draws others in.', properties: ['Social magnetism', 'Commanding tone'], effects: ['Raises success chance for rapport-building actions', 'Improves loyalty gains from interactions'] },
    possessive: { name: 'Possessive', scope: 'character', summary: 'Protective and controlling toward assets and allies.', properties: ['Territorial mindset', 'Protective dominance'], effects: ['Strengthens retention of converted characters', 'Can increase tension in contested scenes'] },
    devoted: { name: 'Devoted', scope: 'role', summary: 'Steadfast dedication to assigned duties.', properties: ['Reliable execution', 'Loyal temperament'], effects: ['Improves consistency of role output', 'Increases loyalty-oriented role efficiency'] },
    meticulous: { name: 'Meticulous', scope: 'role', summary: 'Careful and exacting in daily work.', properties: ['Detail-oriented', 'Low error rate'], effects: ['Improves storage/organization style role outcomes', 'Reduces inefficiency in upkeep routines'] },
    cheerful: { name: 'Cheerful', scope: 'character', summary: 'Maintains a bright and positive demeanor.', properties: ['Mood stabilizer', 'Friendly tone'], effects: ['Improves household morale flavor outcomes', 'Softens conflict-heavy dialogue beats'] },
    perceptive: { name: 'Perceptive', scope: 'character', summary: 'Notices subtle cues and hidden intent.', properties: ['Pattern recognition', 'Situational awareness'], effects: ['Improves discovery and insight-style checks', 'Better event interpretation in scenes'] },
    territorial: { name: 'Territorial', scope: 'character', summary: 'Protective over domain and hierarchy.', properties: ['Boundary enforcement', 'Status sensitivity'], effects: ['Increases defensive behavior in manor events', 'Strengthens reactions to intrusions'] },
    stoic: { name: 'Stoic', scope: 'character', summary: 'Emotionally controlled under pressure.', properties: ['Composed mindset', 'Stress resistance'], effects: ['Improves performance in high-pressure moments', 'Reduces volatility in adverse events'] },
    vigilant: { name: 'Vigilant', scope: 'role', summary: 'Constantly alert to risks and anomalies.', properties: ['Watchful discipline', 'Early warning focus'], effects: ['Improves security-oriented role contributions', 'Raises chance to catch negative events early'] },
    disciplined: { name: 'Disciplined', scope: 'character', summary: 'Strong self-control and routine adherence.', properties: ['Routine consistency', 'Controlled impulses'], effects: ['Improves reliability of assigned task completion', 'Synergizes with training and structured roles'] },
    resourceful: { name: 'Resourceful', scope: 'character', summary: 'Finds solutions with limited tools.', properties: ['Improvisation', 'Efficiency-minded'], effects: ['Improves fallback outcomes when resources are low', 'Increases utility in multi-role scenarios'] },
    loyal: { name: 'Loyal', scope: 'character', summary: 'Highly faithful to chosen leadership.', properties: ['Stable allegiance', 'Low betrayal risk'], effects: ['Improves loyalty retention over time', 'Reinforces team cohesion in events'] },
    elusive: { name: 'Elusive', scope: 'character', summary: 'Hard to predict or pin down.', properties: ['Evasive behavior', 'Low readability'], effects: ['Improves resistance to direct control attempts', 'Increases escape/avoidance flavor outcomes'] },
    witty: { name: 'Witty', scope: 'character', summary: 'Sharp verbal intelligence and timing.', properties: ['Quick retorts', 'Social dexterity'], effects: ['Improves conversational leverage in dialogue scenes', 'Enhances social event quality'] },
    distrustful: { name: 'Distrustful', scope: 'character', summary: 'Slow to accept motives at face value.', properties: ['High skepticism', 'Defensive interpretation'], effects: ['Raises resistance to persuasion effects', 'Increases caution in relationship progress'] },
    agile: { name: 'Agile', scope: 'character', summary: 'Fast and responsive in action.', properties: ['Quick movement', 'Rapid reaction'], effects: ['Improves speed-oriented checks and actions', 'Increases flexibility in dynamic scenarios'] },
    defiant: { name: 'Defiant', scope: 'character', summary: 'Resists authority and imposed structure.', properties: ['High willpower', 'Oppositional streak'], effects: ['Increases resistance against conversion pressure', 'Triggers stronger pushback flavor responses'] },
    compassionate: { name: 'Compassionate', scope: 'character', summary: 'Strong empathy toward others.', properties: ['Empathic insight', 'Protective kindness'], effects: ['Improves supportive interaction outcomes', 'Can reduce harsh-scene escalation'] },
    devout: { name: 'Devout', scope: 'character', summary: 'Guided by strong faith and conviction.', properties: ['Doctrinal adherence', 'Moral certainty'], effects: ['Improves resolve in value-conflict scenes', 'Adds resilience against corruption flavor checks'] },
    gentle: { name: 'Gentle', scope: 'character', summary: 'Soft approach that avoids unnecessary force.', properties: ['Calm tone', 'De-escalation tendency'], effects: ['Improves peaceful resolution paths', 'Lowers antagonistic tone in dialogue'] },
    stubborn: { name: 'Stubborn', scope: 'character', summary: 'Difficult to sway once decided.', properties: ['High persistence', 'Rigid preferences'], effects: ['Improves persistence in personal objectives', 'Reduces susceptibility to opposing influence'] },
    selfless: { name: 'Selfless', scope: 'character', summary: 'Prioritizes others over personal comfort.', properties: ['Sacrificial mindset', 'Support-first behavior'], effects: ['Improves team-benefit outcomes', 'Can trade personal gain for group stability'] },
    fierce: { name: 'Fierce', scope: 'character', summary: 'Intense and intimidating in confrontation.', properties: ['Aggressive confidence', 'High threat projection'], effects: ['Improves intimidation-forward interactions', 'Increases combat-adjacent narrative pressure'] },
    impulsive: { name: 'Impulsive', scope: 'character', summary: 'Acts quickly before full deliberation.', properties: ['Fast decision-making', 'Risk-prone choices'], effects: ['Can accelerate scene transitions', 'May cause unstable outcomes in careful tasks'] },
    fearless: { name: 'Fearless', scope: 'character', summary: 'Unafraid in dangerous or stressful conditions.', properties: ['Low fear response', 'High bravery'], effects: ['Improves outcomes in high-risk scenes', 'Reduces fear-based penalties in narrative checks'] },
    proud: { name: 'Proud', scope: 'character', summary: 'Strong sense of dignity and status.', properties: ['Honor sensitivity', 'Status-conscious behavior'], effects: ['Improves performance when respected', 'Can trigger friction when slighted'] },
    restless: { name: 'Restless', scope: 'character', summary: 'Needs movement and change to stay engaged.', properties: ['Low tolerance for idle time', 'High activity drive'], effects: ['Improves active-task throughput flavor', 'Reduces efficiency during passive assignments'] },
    nourishing: { name: 'Nourishing', scope: 'room', summary: 'Enhances wellbeing through food and care.', properties: ['Sustenance focus', 'Recovery support'], effects: ['Boosts comfort and morale-oriented room effects', 'Improves household upkeep quality in kitchen loops'] },
    hardworking: { name: 'Hardworking', scope: 'room', summary: 'Sustains output through demanding workloads.', properties: ['High stamina', 'Task persistence'], effects: ['Improves routine productivity for labor-heavy roles', 'Reduces downtime from repetitive tasks'] },
    alchemist: { name: 'Alchemist', scope: 'room', summary: 'Skilled at reagents, mixtures, and brews.', properties: ['Formula precision', 'Reagent optimization'], effects: ['Improves brewing and potion-oriented room outcomes', 'Increases reagent efficiency in crafting loops'] },
    educator: { name: 'Educator', scope: 'room', summary: 'Specialized in instruction and skill transfer.', properties: ['Teaching discipline', 'Structured lessons'], effects: ['Improves training progression and obedience growth', 'Raises value of classroom interactions'] },
    organized: { name: 'Organized', scope: 'room', summary: 'Maintains orderly systems and scheduling.', properties: ['Process clarity', 'Inventory structure'], effects: ['Improves assignment and storage efficiency', 'Reduces operational friction in manor routines'] },
    occultist: { name: 'Occultist', scope: 'room', summary: 'Practiced in arcane ritual procedures.', properties: ['Ritual expertise', 'Corruption tolerance'], effects: ['Improves ritual chamber performance', 'Amplifies ritual power-oriented effects'] },
    'beast friend': { name: 'Beast Friend', scope: 'room', summary: 'Naturally effective with animals and mounts.', properties: ['Animal handling', 'Calming presence'], effects: ['Improves stable-related outputs', 'Enhances creature care and travel support'] },
    intimidating: { name: 'Intimidating', scope: 'room', summary: 'Projects fear and authority.', properties: ['Threat presence', 'Dominance posture'], effects: ['Improves dungeon pressure/interrogation flavor outcomes', 'Increases fear-aligned role impact'] },
    relentless: { name: 'Relentless', scope: 'room', summary: 'Applies steady pressure without fatigue.', properties: ['Unyielding persistence', 'Low burnout'], effects: ['Improves containment and resistance-break style effects', 'Sustains long-duration control operations'] },
    charming: { name: 'Charming', scope: 'room', summary: 'Creates rapport quickly in social spaces.', properties: ['Social warmth', 'Persuasive style'], effects: ['Improves lounge/social influence style outcomes', 'Increases loyalty-leaning interaction effects'] },
};

function normalizeTraitKey(traitName: string): string {
    return traitName.trim().toLowerCase();
}

export function getTraitDefinition(traitName: string): TraitDefinition {
    const key = normalizeTraitKey(traitName);
    const found = TRAIT_REGISTRY[key];
    if (found) {
        return found;
    }
    return {
        name: traitName,
        scope: 'situational',
        summary: 'A unique trait with custom narrative behavior.',
        properties: ['Character-specific behavior'],
        effects: ['Applies context-dependent bonuses or penalties'],
    };
}
