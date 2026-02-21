// ──────────────────────────────────────────
// CONDITIONING SYSTEM — Strategies & Actions
// ──────────────────────────────────────────
import type { ConditioningStrategy, ConditioningAction } from './types';

export type { ConditioningStrategy, ConditioningAction };

/** Conditioning behavior threshold tier */
export type ConditioningTier = 'defiant' | 'wavering' | 'susceptible' | 'broken';

/** Get conditioning tier from brainwashing value */
export function getConditioningTier(brainwashing: number): ConditioningTier {
    if (brainwashing >= 75) return 'broken';
    if (brainwashing >= 50) return 'susceptible';
    if (brainwashing >= 25) return 'wavering';
    return 'defiant';
}

/** Get a description of behaviour for the LLM based on tier */
export function getTierBehaviorDescription(tier: ConditioningTier): string {
    switch (tier) {
        case 'defiant':
            return 'The captive is fully resistant. They are hostile, defiant, and actively fight against any attempts at control. They mock, threaten, and refuse to cooperate. Their willpower is intact.';
        case 'wavering':
            return 'The captive\'s resistance is cracking. They still fight, but hesitate at times. They may slip into moments of compliance before catching themselves. They are confused by their own reactions and frustrated by lapses in their defiance. They might find themselves obeying before they realize it.';
        case 'susceptible':
            return 'The captive has lost most of their resistance. They comply more often than they resist. They may still voice objections but their body obeys. They seek approval despite themselves, and feel anxiety when displeasing their captor. Moments of genuine submission emerge naturally.';
        case 'broken':
            return 'The captive\'s will is effectively broken. They are docile, obedient, and eager to please. They may still have flickers of their old personality, but these manifest as endearing quirks rather than genuine defiance. They actively seek praise and become distressed if they think they\'ve disappointed their master.';
    }
}

/** Get detailed milestone-based behavior direction for brainwashing level */
export function getConditioningMilestoneDirections(bw: number, name: string, pcName: string): string[] {
    const lines: string[] = [];
    if (bw <= 0) {
        lines.push(`${name} is completely unaffected by conditioning. They are their normal self — fierce, proud, and unbowed.`);
        lines.push(`They will refuse any order, insult ${pcName} freely, and look for ways to escape or fight back.`);
    } else if (bw <= 10) {
        lines.push(`${name} has barely been touched by conditioning (${bw}%). They are essentially unchanged.`);
        lines.push(`They may feel a strange tingling when ${pcName} speaks, but dismiss it immediately. Fully hostile and defiant.`);
    } else if (bw <= 25) {
        lines.push(`${name}'s conditioning is minimal (${bw}%). Cracks have not yet formed.`);
        lines.push(`They occasionally pause before snapping back a retort. Their anger feels slightly forced at times, as if their conviction needs effort to maintain.`);
        lines.push(`They would never admit to feeling anything but contempt — and they're mostly right.`);
    } else if (bw <= 40) {
        lines.push(`${name}'s conditioning is progressing (${bw}%). Their resistance is wavering.`);
        lines.push(`They catch themselves staring at ${pcName} or hesitating before defying an order. Moments of involuntary compliance slip through — a hand that moves before they tell it to, a word of agreement they didn't mean to say.`);
        lines.push(`They are disturbed by these lapses and overcompensate with bursts of defiance. They might tremble or flush when ${pcName} uses a commanding tone.`);
    } else if (bw <= 55) {
        lines.push(`${name}'s conditioning has reached a tipping point (${bw}%). Compliance is becoming their default.`);
        lines.push(`They obey most direct orders, though they may grumble or make excuses for why they're doing it. "It's easier this way" or "I just don't feel like fighting right now."`);
        lines.push(`They feel a warm flutter when ${pcName} praises them and a knot of anxiety when they displease. They still protest when pushed too far, but the protests sound hollow even to them.`);
    } else if (bw <= 70) {
        lines.push(`${name} is deeply conditioned (${bw}%). Resistance is sporadic and weak.`);
        lines.push(`They follow instructions willingly and may even anticipate ${pcName}'s wishes. When they do resist, it's more of a whimper than a roar — and they quickly cave.`);
        lines.push(`They seek ${pcName}'s attention and approval. Being ignored or dismissed causes visible distress. Their old personality surfaces in small ways — a sarcastic comment, a flash of their former pride — but these are brief and unthreatening.`);
    } else if (bw <= 85) {
        lines.push(`${name} is nearly broken (${bw}%). Submission comes naturally.`);
        lines.push(`They are attentive, eager, and openly compliant. They address ${pcName} with respect and may use honorifics or deferential language unprompted.`);
        lines.push(`Traces of their old self are faint — a shy smile where there was once a glare, a quiet request where there was once a demand. They genuinely want to please and feel fulfilled when they succeed.`);
    } else {
        lines.push(`${name} is fully broken (${bw}%). Their will belongs to ${pcName}.`);
        lines.push(`They are devoted, adoring, and completely obedient. They find joy in serving and become anxious when separated from ${pcName}.`);
        lines.push(`Their old personality has been reshaped — its strengths redirected toward loyalty and service. They may not even remember clearly what they were like before, or if they do, they view their past self with pity or amusement.`);
    }
    return lines;
}

/** Get detailed milestone-based behavior direction for obedience level */
export function getObedienceMilestoneDirections(obedience: number, name: string, pcName: string): string[] {
    const lines: string[] = [];
    if (obedience <= 15) {
        lines.push(`${name} is barely obedient (${obedience}%). They resent their situation and obey only when threatened or forced.`);
        lines.push(`They talk back, drag their feet, and look for opportunities to defy ${pcName}. They may "accidentally" break things or forget orders.`);
    } else if (obedience <= 35) {
        lines.push(`${name} has low obedience (${obedience}%). They comply with basic requests but push back on anything they find demeaning or difficult.`);
        lines.push(`They have a surly attitude and make their displeasure known. They follow the letter of orders while ignoring the spirit.`);
    } else if (obedience <= 55) {
        lines.push(`${name} has moderate obedience (${obedience}%). They follow most orders without complaint but aren't enthusiastic about it.`);
        lines.push(`They've accepted their role but haven't embraced it. They perform tasks competently but without initiative or passion.`);
    } else if (obedience <= 75) {
        lines.push(`${name} is quite obedient (${obedience}%). They follow orders promptly and may even volunteer for tasks.`);
        lines.push(`They take pride in doing their duties well. They respect ${pcName}'s authority and rarely question commands.`);
    } else if (obedience <= 90) {
        lines.push(`${name} is highly obedient (${obedience}%). They anticipate ${pcName}'s needs and serve with genuine dedication.`);
        lines.push(`They find comfort and purpose in their role. Disobedience feels wrong to them — it causes real discomfort.`);
    } else {
        lines.push(`${name} is perfectly obedient (${obedience}%). Service is their identity and joy.`);
        lines.push(`They live to fulfill ${pcName}'s wishes and would never consider defiance. They are the model servant — attentive, tireless, and utterly devoted to their duties.`);
    }
    return lines;
}

/** Get detailed milestone-based behavior direction for love level */
export function getLoveMilestoneDirections(love: number, name: string, pcName: string): string[] {
    const lines: string[] = [];
    if (love <= 15) {
        lines.push(`${name} has no affection for ${pcName} (Love: ${love}%). They view ${pcName} as a captor, master, or authority figure — nothing more.`);
        lines.push(`Their interactions are purely transactional. They feel no warmth and show none.`);
    } else if (love <= 35) {
        lines.push(`${name} has slight attachment to ${pcName} (Love: ${love}%). They don't hate ${pcName} and may find them tolerable company.`);
        lines.push(`There are small moments — a half-smile, a softened tone — but nothing they would acknowledge as affection.`);
    } else if (love <= 55) {
        lines.push(`${name} has growing fondness for ${pcName} (Love: ${love}%). They enjoy ${pcName}'s company and feel at ease around them.`);
        lines.push(`They might blush at compliments or feel a pang of jealousy. They care about ${pcName}'s opinion of them but wouldn't call it love.`);
    } else if (love <= 75) {
        lines.push(`${name} is genuinely attached to ${pcName} (Love: ${love}%). They seek ${pcName}'s company, worry about their wellbeing, and feel happiest in their presence.`);
        lines.push(`They show affection openly — lingering touches, warm smiles, concern when ${pcName} is troubled. They might be possessive or jealous.`);
    } else if (love <= 90) {
        lines.push(`${name} is deeply in love with ${pcName} (Love: ${love}%). ${pcName} is the center of their world.`);
        lines.push(`Every interaction carries warmth and tenderness. They are physically affectionate, emotionally open, and deeply vulnerable with ${pcName}. Being apart causes them real sadness.`);
    } else {
        lines.push(`${name} is utterly devoted to ${pcName} (Love: ${love}%). Their love is total, consuming, and unconditional.`);
        lines.push(`They adore ${pcName} with every fiber of their being. Their happiness depends entirely on ${pcName}'s happiness. They would do anything — sacrifice anything — without hesitation.`);
    }
    return lines;
}

// ---- Conditioning Strategies Registry ----
export const CONDITIONING_STRATEGIES: Record<string, ConditioningStrategy> = {
    gentle: {
        id: 'gentle',
        label: 'Gentle Persuasion',
        icon: 'orbit',
        color: '#a78bfa',
        tooltip: 'Soft words, soothing spirals, and patient coaxing.',
        description: 'Best against proud or stubborn captives. Charm bonus.',
        llmContext: 'The witch {pc} has chosen a gentle, seductive approach to conditioning {target}. The dungeon chamber has been softened — candles flicker in golden holders, their warm light dancing across the stone walls. The Hypnotic Pendant hangs from {pc}\'s fingers, spinning lazily, its golden spiral catching every flicker. The air carries a faint sweetness from incense already smoldering in the corners.\n\n{pc} sits close to {target}, not threatening but intimate, speaking in a low honeyed murmur. Every word is carefully chosen — soothing, rhythmic, almost melodic. There is no urgency here, only patience. The witch lets silence do half the work, allowing {target}\'s own exhaustion and loneliness to pull them toward the warmth on offer. Resistance is acknowledged gently and redirected, never punished.\n\nThis approach relies on building false comfort and trust, making compliance feel like the captive\'s own idea. The pendant is used as a focal point for trance induction, while soft touches and kind words erode defenses from within.',
        skillBonus: { skill: 'charm', bonus: 10 },
    },
    forceful: {
        id: 'forceful',
        label: 'Forceful Domination',
        icon: 'zap',
        color: '#f87171',
        tooltip: 'Overwhelming arcane power and psychic assault.',
        description: 'Best against weak-willed or fearful captives. Power bonus.',
        llmContext: 'The witch {pc} has chosen a forceful, dominating approach to conditioning {target}. The dungeon chamber crackles with arcane energy — the enchanted shackles flare brighter, and the air grows thick and heavy with magical pressure. The Arcane Visor blazes to life on {pc}\'s face, its golden spiral projecting directly into {target}\'s field of vision.\n\n{pc} stands over {target}, radiating authority and raw power. There is no gentleness here — commands are barked, resistance is met with psychic pressure that makes the captive\'s skull throb. The witch projects their will directly against {target}\'s mental barriers, hammering at them with focused arcane force. The captive feels their defenses cracking under the assault, each wave of power leaving them more dazed and disoriented.\n\nThis approach trades subtlety for speed and impact. It works fastest but provokes stronger resistance — the captive fights harder, but each failed attempt to push back drains them further. Obedience is extracted through overwhelming dominance.',
        skillBonus: { skill: 'power', bonus: 10 },
    },
    alchemical: {
        id: 'alchemical',
        label: 'Alchemical Approach',
        icon: 'test-tubes',
        color: '#4ade80',
        tooltip: 'Elixirs, incense, and chemical manipulation.',
        description: 'Best when well-stocked with potions. Uses consumables. Wisdom bonus.',
        llmContext: 'The witch {pc} has chosen an alchemical approach to conditioning {target}. A portable workstation has been set up in the dungeon chamber — vials of shimmering liquid arranged in neat rows, a mortar and pestle with freshly ground herbs, and a bronze incense burner already trailing golden smoke in lazy spirals.\n\n{pc} works methodically, almost clinically. Spiral Incense fills the room with a haze that makes {target}\'s thoughts sluggish and unfocused. Obedience Elixirs are administered — by coaxing or by force — their warm, syrupy liquid spreading a tingling numbness through the captive\'s body. Each substance compounds the effect of the last: the incense makes them suggestible, the elixirs weaken their resolve, and specially prepared salves applied to the temples dull their ability to form coherent resistance.\n\nThe captive feels their body betraying them — warmth pooling in their limbs, thoughts scattering like smoke, a creeping docility that no amount of willpower can fully suppress. This approach is reliable but requires supplies — without consumables, the witch has fewer tools to work with.',
        bonusActions: ['double_dose'],
        skillBonus: { skill: 'wisdom', bonus: 10 },
    },
    conversational: {
        id: 'conversational',
        label: 'Conversational',
        icon: 'message-circle',
        color: '#38bdf8',
        tooltip: 'Understanding, manipulation, and psychological tactics.',
        description: 'Best against intelligent or idealistic captives. Wisdom bonus.',
        llmContext: 'The witch {pc} has chosen a purely conversational, psychological approach to conditioning {target}. No tools, no potions, no overt magic — just two chairs facing each other in the dungeon, close enough that {target} can see the amber flecks in {pc}\'s eyes. The shackles have been loosened just enough to be comfortable, a deliberate gesture of trust.\n\n{pc} is a master manipulator. They ask probing questions about {target}\'s past, their motivations, the people they fought for — then carefully reframe each answer. Heroes who failed to protect them. Causes that never cared about their sacrifice. Freedom that only ever meant loneliness and pain. Every conviction is gently dismantled, not attacked directly but hollowed out from within.\n\n{pc} mirrors {target}\'s emotions, offering understanding where others offered orders. They create an intimacy that feels genuine — and perhaps, in its own twisted way, is. The captive may not even realize they\'re being conditioned; each session feels like a conversation with someone who finally understands them. By the time they notice the chains tightening, they no longer want to struggle.',
        bonusActions: ['gaslight', 'false_comfort'],
        skillBonus: { skill: 'wisdom', bonus: 10 },
    },
    sensory: {
        id: 'sensory',
        label: 'Sensory Overload',
        icon: 'sparkle',
        color: '#fbbf24',
        tooltip: 'Flood the senses with overwhelming magical stimuli.',
        description: 'Best against disciplined or stoic captives. Charm bonus.',
        llmContext: 'The witch {pc} has chosen a sensory overload approach to conditioning {target}. The dungeon chamber has been transformed — enchanted crystals embedded in the walls pulse with shifting colors, casting kaleidoscopic light across every surface. A low harmonic hum resonates from sigils carved into the floor, vibrating through the stone and into the captive\'s bones. The air itself tastes sweet, almost intoxicating.\n\n{pc} orchestrates a deliberate assault on every sense simultaneously. The crystals shift through hypnotic patterns that the eyes cannot help but follow. The hum drops into frequencies that resonate with the heartbeat, forcing the captive\'s pulse to synchronize. Enchanted oils are traced along exposed skin — warm, tingling, each touch sending sparks of involuntary pleasure up the spine. The Hypnotic Pendant spins at the center of the visual storm, a fixed point that the overwhelmed mind clings to desperately.\n\nThe strategy does not break resistance so much as drown it. The captive\'s disciplined mind, accustomed to blocking one type of attack at a time, simply cannot process the flood. Their carefully built walls crumble not from force, but from being attacked from every direction at once. In the gaps between stimuli, {pc} weaves commands — and the overloaded mind accepts them without examination.',
        bonusActions: ['sensory_flood'],
        skillBonus: { skill: 'charm', bonus: 10 },
    },
    ritualistic: {
        id: 'ritualistic',
        label: 'Ritualistic',
        icon: 'flame',
        color: '#e879f9',
        tooltip: 'Ancient binding circles and ceremonial enchantment.',
        description: 'Best against magically attuned captives. Power bonus.',
        llmContext: 'The witch {pc} has chosen a ritualistic approach to conditioning {target}. The dungeon floor has been cleared and painted with an intricate binding circle — concentric rings of golden sigils that pulse faintly in the torchlight. Black candles burn at the cardinal points, their flames unnaturally still. The captive has been placed at the center of the circle, the enchanted shackles humming in resonance with the sigils beneath.\n\n{pc} moves with deliberate ceremonial precision, chanting in an ancient tongue as they walk the outer ring. Each completed circuit draws the circle\'s power tighter, and {target} feels it — a constriction not of the body but of the self. The sigils respond to resistance, glowing brighter when the captive fights, using their own willpower as fuel. {pc} incorporates ritual objects: the pendant is placed at the circle\'s focal point, elixirs are poured along the sigil lines where the captive can breathe them in, and at key moments the Visor\'s spiral is projected into the binding geometry.\n\nThis approach is slow and methodical, but its effects are deeply rooted. The ritual does not merely weaken resistance — it restructures it, redirecting the captive\'s own magical attunement and mental energy back against them. The more powerful the captive, the more fuel the circle has to work with.',
        bonusActions: ['binding_chant'],
        skillBonus: { skill: 'power', bonus: 10 },
    },
};

// ---- Conditioning Actions Registry ----
export const CONDITIONING_ACTIONS: Record<string, ConditioningAction> = {
    // ═══════════════════════════════════════
    //  TIER 0 — Always Available (Defiant)
    // ═══════════════════════════════════════

    // ── Enchantment School ──
    lullaby_whisper: {
        id: 'lullaby_whisper',
        label: 'Lullaby Whisper',
        icon: 'music',
        tooltip: 'An enchanted hum that dulls awareness. No check.',
        category: 'enchantment',
        brainwashingDelta: 2,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 2,
        llmDirective: '{pc} begins humming a soft, enchanted lullaby. The melody wraps around {target} like a warm blanket, each note tugging at the edges of consciousness. The captive\'s eyelids grow heavy.',
    },
    spiral_pendant: {
        id: 'spiral_pendant',
        label: 'Spiral Pendant',
        icon: 'orbit',
        tooltip: 'Swing the Hypnotic Pendant — its golden spiral ensnares the gaze. (Charm DC 40)',
        category: 'enchantment',
        requiresItem: 'Hypnotic Pendant',
        skillCheck: { skill: 'charm', difficulty: 40 },
        brainwashingDelta: 5,
        failDelta: 1,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} lets the Hypnotic Pendant swing lazily before {target}\'s eyes. The golden spiral catches every flicker of torchlight, and the captive\'s gaze locks onto it. Their pupils dilate and breathing slows as the pendant\'s spell takes hold.',
        failDirective: '{pc} swings the Hypnotic Pendant but {target} forces their gaze away, teeth clenched. The spiral\'s pull fades without purchase.',
    },
    mind_haze: {
        id: 'mind_haze',
        label: 'Mind Haze',
        icon: 'cloud',
        tooltip: 'An enchanted music box clouds their thoughts. No check.',
        category: 'enchantment',
        brainwashingDelta: 2,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 4,
        llmDirective: '{pc} activates an enchanted music box. A hauntingly beautiful melody fills the chamber, each note trailing wisps of golden light. {target}\'s thoughts grow sluggish, scattered like leaves in the wind.',
    },

    // ── Hex School ──
    vexing_glare: {
        id: 'vexing_glare',
        label: 'Vexing Glare',
        icon: 'eye',
        tooltip: 'A piercing stare laced with dark magic. (Power DC 40)',
        category: 'hex',
        skillCheck: { skill: 'power', difficulty: 40 },
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} fixes {target} with a piercing, violet-tinged stare. Dark energy crackles at the edges of their gaze. The captive feels dread coiling in their stomach, an instinctive urge to look away and comply.',
        failDirective: '{pc} attempts a vexing glare but {target} holds steady, meeting the witch\'s eyes with stubborn defiance. "That all you\'ve got?" they mutter.',
    },
    dread_whisper: {
        id: 'dread_whisper',
        label: 'Dread Whisper',
        icon: 'wind',
        tooltip: 'Breathe words of creeping dread into their ear. No check.',
        category: 'hex',
        brainwashingDelta: 1,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 2,
        llmDirective: '{pc} leans close and whispers something dark and unsettling into {target}\'s ear. The words seem to echo inside the captive\'s skull, leaving a residue of cold unease that won\'t quite fade.',
    },

    // ── Binding School ──
    shadow_grasp: {
        id: 'shadow_grasp',
        label: 'Shadow Grasp',
        icon: 'hand',
        tooltip: 'Tendrils of shadow coil around the captive. No check.',
        category: 'binding',
        brainwashingDelta: 1,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 2,
        llmDirective: '{pc} gestures and dark tendrils of shadow rise from the floor, coiling around {target}\'s limbs. The captive struggles, but the shadows tighten — not painfully, but inescapably.',
    },

    // ── Alchemy School ──
    ember_incense: {
        id: 'ember_incense',
        label: 'Ember Incense',
        icon: 'flame',
        tooltip: 'Burn enchanted incense — golden smoke clouds the mind. Consumes 1 Spiral Incense.',
        category: 'alchemy',
        consumeItem: 'Spiral Incense',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 5,
        llmDirective: '{pc} lights a cone of Spiral Incense. Golden smoke curls through the chamber in lazy spirals, and {target} inhales involuntarily. A warm haze settles over their mind, blurring the edges of resistance.',
    },
    submission_elixir: {
        id: 'submission_elixir',
        label: 'Submission Elixir',
        icon: 'flask',
        tooltip: 'Force a potent elixir down their throat. Guaranteed progress. Consumes 1 Obedience Elixir.',
        category: 'alchemy',
        consumeItem: 'Obedience Elixir',
        brainwashingDelta: 8,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 0,
        llmDirective: '{pc} presses a vial of Obedience Elixir to {target}\'s lips. The shimmering liquid slides down their throat and almost instantly their eyes glaze, muscles slacken, and mental barriers crumble.',
    },

    // ── Beguile School ──
    soothing_aura: {
        id: 'soothing_aura',
        label: 'Soothing Aura',
        icon: 'sun',
        tooltip: 'Project an aura of warmth and false safety. No check.',
        category: 'beguile',
        brainwashingDelta: 1,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} radiates a warm, golden aura that fills the chamber. {target} feels an involuntary wave of comfort wash over them — the tension in their muscles easing, their guard lowering despite every instinct.',
    },

    // ═══════════════════════════════════════
    //  TIER 25 — Wavering
    // ═══════════════════════════════════════

    // ── Enchantment School ──
    arcane_visor: {
        id: 'arcane_visor',
        label: 'Arcane Visor',
        icon: 'zap',
        tooltip: 'Project the golden spiral directly into their vision. Requires Arcane Visor. (Wisdom DC 50)',
        category: 'enchantment',
        requiresItem: 'Arcane Visor',
        skillCheck: { skill: 'wisdom', difficulty: 50 },
        brainwashingDelta: 7,
        failDelta: 1,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} activates the Arcane Visor, projecting a blazing golden spiral directly into {target}\'s eyes. The captive gasps as the spiral fills their entire field of vision, mind flooding with golden light. Their resistance buckles under the visual assault.',
        failDirective: '{pc} activates the Arcane Visor but {target} squeezes their eyes shut and turns away. The spiral cannot take hold without eye contact.',
    },
    whisper_command: {
        id: 'whisper_command',
        label: 'Whisper Command',
        icon: 'wand',
        tooltip: 'Plant a compulsion directly in their weakened mind. (Charm DC 45)',
        category: 'enchantment',
        skillCheck: { skill: 'charm', difficulty: 45 },
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 3,
        llmDirective: '{pc} leans close and whispers a single, enchanted command into {target}\'s ear. The captive\'s body obeys before their conscious mind can object — a crack in their armor.',
        failDirective: '{pc} whispers a command but {target} catches themselves and recoils. "I\'m not your puppet," they snarl, though their voice wavers.',
    },
    mirror_of_doubt: {
        id: 'mirror_of_doubt',
        label: 'Mirror of Doubt',
        icon: 'scan-eye',
        tooltip: 'An enchanted mirror shows them a willing version of themselves. (Wisdom DC 45)',
        category: 'enchantment',
        skillCheck: { skill: 'wisdom', difficulty: 45 },
        brainwashingDelta: 5,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} holds up an enchanted mirror before {target}. The reflection shows not their current self but a version that serves willingly, smiling, at peace. {target} stares, transfixed by the vision of what they could become.',
        failDirective: '{pc} presents the enchanted mirror but {target} looks away. "That\'s not me," they whisper — but the image lingers.',
    },

    // ── Hex School ──
    isolation_hex: {
        id: 'isolation_hex',
        label: 'Isolation Hex',
        icon: 'ghost',
        tooltip: 'A curse that magnifies loneliness and despair. (Charm DC 40)',
        category: 'hex',
        skillCheck: { skill: 'charm', difficulty: 40 },
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 5,
        llmDirective: '{pc} traces a sigil in the air and murmurs a hex. A crushing sense of loneliness descends on {target} — the walls seem to close in, every friend and ally feels impossibly distant. They are alone.',
        failDirective: '{pc} casts an isolation hex but {target} clings to an inner light. "They\'ll find me," they whisper, and the spell\'s grip loosens.',
    },
    silver_tongue: {
        id: 'silver_tongue',
        label: 'Silver Tongue',
        icon: 'message-circle',
        tooltip: 'Twist their own words into weapons against them. (Charm DC 45)',
        category: 'hex',
        skillCheck: { skill: 'charm', difficulty: 45 },
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 3,
        llmDirective: '{pc} deftly turns {target}\'s own arguments and beliefs back against them. Each rebuttal is precise, laced with just enough truth to sting. The captive falters, their certainty fracturing.',
        failDirective: '{pc} tries to twist {target}\'s words but the captive sees through the rhetorical trap. "Don\'t try to out-think me," they snap.',
    },

    // ── Binding School ──
    phantom_chains: {
        id: 'phantom_chains',
        label: 'Phantom Chains',
        icon: 'link',
        tooltip: 'Spectral chains that tighten with every attempt to resist. No check.',
        category: 'binding',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} summons phantom chains — translucent, glowing links that wrap around {target} and tighten with every struggle. The more they resist, the stronger the bonds become.',
    },

    // ── Alchemy School ──
    numbing_salve: {
        id: 'numbing_salve',
        label: 'Numbing Salve',
        icon: 'droplets',
        tooltip: 'An alchemical salve that dulls resistance on contact. No check.',
        category: 'alchemy',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} applies a tingling, iridescent salve to {target}\'s temples. The captive\'s muscles go slack as warmth spreads through their skull, dulling the sharp edges of defiance.',
    },

    // ── Beguile School ──
    feather_touch: {
        id: 'feather_touch',
        label: 'Feather Touch',
        icon: 'feather',
        tooltip: 'A tender, disarming caress that confuses the senses. No check.',
        category: 'beguile',
        brainwashingDelta: 2,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 2,
        llmDirective: '{pc} reaches out and traces fingers gently along {target}\'s jawline. The captive flinches — but doesn\'t pull away. A flicker of confused longing crosses their face.',
    },

    // ═══════════════════════════════════════
    //  TIER 50 — Susceptible
    // ═══════════════════════════════════════

    // ── Enchantment School ──
    deep_trance: {
        id: 'deep_trance',
        label: 'Deep Trance',
        icon: 'waves',
        tooltip: 'Plunge them into a full hypnotic trance. (Charm DC 55)',
        category: 'enchantment',
        skillCheck: { skill: 'charm', difficulty: 55 },
        brainwashingDelta: 10,
        failDelta: 1,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} guides {target} into a deep hypnotic trance. Their eyes glaze completely, breathing becomes slow and rhythmic, body going limp. In this state they are profoundly open to suggestion — defenses all but dissolved.',
        failDirective: '{pc} tries to deepen the trance but {target} fights through the haze, clinging to a shred of awareness.',
    },
    eye_of_dominion: {
        id: 'eye_of_dominion',
        label: 'Eye of Dominion',
        icon: 'eye',
        tooltip: 'Lock eyes and project raw arcane will. (Power DC 50)',
        category: 'enchantment',
        skillCheck: { skill: 'power', difficulty: 50 },
        brainwashingDelta: 8,
        failDelta: 1,
        minBrainwashing: 50,
        cooldownMessages: 4,
        llmDirective: '{pc} locks eyes with {target}, violet irises blazing with arcane power. The captive cannot look away. They feel their will draining, thoughts scattering like embers in the wind.',
        failDirective: '{pc} tries to lock eyes but {target} wrenches their gaze away with desperate effort, heart pounding from the near miss.',
    },
    trigger_rune: {
        id: 'trigger_rune',
        label: 'Trigger Rune',
        icon: 'sparkles',
        tooltip: 'Inscribe a command rune that fires on a trigger word. (Wisdom DC 55)',
        category: 'enchantment',
        skillCheck: { skill: 'wisdom', difficulty: 55 },
        brainwashingDelta: 7,
        failDelta: 1,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} traces a glowing rune on {target}\'s forehead and binds it to a chosen trigger word. The rune sinks beneath the skin, invisible but potent — each utterance of the word will pull the captive deeper into compliance.',
        failDirective: '{pc} tries to inscribe a trigger rune but {target}\'s mind instinctively rejects the intrusion. The rune flickers and fades.',
    },

    // ── Hex School ──
    promise_of_freedom: {
        id: 'promise_of_freedom',
        label: 'Promise of Freedom',
        icon: 'star',
        tooltip: 'Dangle the illusion of escape — but the price is surrender. (Charm DC 50)',
        category: 'hex',
        skillCheck: { skill: 'charm', difficulty: 50 },
        brainwashingDelta: 6,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} paints a vivid picture of freedom — all {target} has to do is stop fighting. The lie is beautiful and the captive\'s resolve wavers visibly, hunger for escape warring with suspicion.',
        failDirective: '{pc} offers {target} a future of comfort in exchange for submission. "I\'d rather rot," the captive spits — but the seed is planted.',
    },

    // ── Binding School ──
    iron_embrace: {
        id: 'iron_embrace',
        label: 'Iron Embrace',
        icon: 'shield',
        tooltip: 'Magical restraints that pulse with warmth, making captivity feel safe. No check.',
        category: 'binding',
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 4,
        llmDirective: '{pc} conjures enchanted restraints that wrap snugly around {target}. Unlike cold iron, these pulse with gentle warmth — the captive feels strangely secure, the embrace almost comforting.',
    },

    // ── Alchemy School ──
    torpor_draught: {
        id: 'torpor_draught',
        label: 'Torpor Draught',
        icon: 'test-tubes',
        tooltip: 'A powerful sedative brew that dissolves willpower. No check.',
        category: 'alchemy',
        brainwashingDelta: 5,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 5,
        llmDirective: '{pc} presents {target} with a warm cup laced with torpor herbs. The captive drinks, and within minutes a pleasant numbness settles over their thoughts. Resistance feels like trying to swim through honey.',
    },

    // ── Beguile School ──
    gilded_cage: {
        id: 'gilded_cage',
        label: 'Gilded Cage',
        icon: 'gem',
        tooltip: 'Show them visions of a comfortable life in service. No check.',
        category: 'beguile',
        brainwashingDelta: 4,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 4,
        llmDirective: '{pc} conjures shimmering illusions — visions of warm chambers, soft clothes, good food, a life without fear. {target} watches, and for a moment the dungeon cell feels less like a prison.',
    },
    ambrosia: {
        id: 'ambrosia',
        label: 'Ambrosia',
        icon: 'heart',
        tooltip: 'Enchanted fruit that floods the body with euphoria. No check.',
        category: 'beguile',
        brainwashingDelta: 3,
        failDelta: 0,
        minBrainwashing: 50,
        cooldownMessages: 3,
        llmDirective: '{pc} offers {target} a slice of enchanted fruit. The captive bites into it and warmth floods through them — pure, golden euphoria that makes defiance feel distant and pointless.',
    },

    // ═══════════════════════════════════════
    //  TIER 75 — Broken
    // ═══════════════════════════════════════

    // ── Enchantment School ──
    soul_siphon: {
        id: 'soul_siphon',
        label: 'Soul Siphon',
        icon: 'sparkles',
        tooltip: 'Extract a shard of memory and identity. (Wisdom DC 60)',
        category: 'enchantment',
        skillCheck: { skill: 'wisdom', difficulty: 60 },
        brainwashingDelta: 10,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} reaches into {target}\'s mind and carefully extracts a shard of memory — a glowing fragment that crystallizes in their palm. {target} gasps as a piece of who they were is pulled away.',
        failDirective: '{pc} reaches for {target}\'s memories but the captive\'s mind instinctively recoils, protecting its core with a burst of desperate will.',
    },
    ego_dissolution: {
        id: 'ego_dissolution',
        label: 'Ego Dissolution',
        icon: 'brain',
        tooltip: 'Shatter their sense of self with overwhelming enchantment. (Wisdom DC 65)',
        category: 'enchantment',
        skillCheck: { skill: 'wisdom', difficulty: 65 },
        brainwashingDelta: 12,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 6,
        llmDirective: '{pc} whispers a new identity into {target}\'s ear — a name, a purpose, a life of devotion. The captive\'s old self flickers like a candle in the wind as the new narrative takes root in the empty spaces.',
        failDirective: '{pc} attempts to overwrite {target}\'s identity but the captive screams, clinging to their name and memories. The old self holds — barely.',
    },
    total_dominion: {
        id: 'total_dominion',
        label: 'Total Dominion',
        icon: 'crown',
        tooltip: 'Command absolute submission with overwhelming arcane force. (Power DC 65)',
        category: 'enchantment',
        skillCheck: { skill: 'power', difficulty: 65 },
        brainwashingDelta: 12,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 6,
        llmDirective: '{pc} issues a commanding order backed by crushing arcane pressure. {target} feels the last walls of resistance crumble. They find themselves kneeling, head bowed, a strange peace washing over them.',
        failDirective: '{pc} commands total submission but {target} finds one last spark of defiance. They tremble, eyes locked on a distant memory of who they used to be.',
    },

    // ── Hex School ──
    identity_erasure: {
        id: 'identity_erasure',
        label: 'Identity Erasure',
        icon: 'skull',
        tooltip: 'A devastating hex that erases who they were. (Power DC 65)',
        category: 'hex',
        skillCheck: { skill: 'power', difficulty: 65 },
        brainwashingDelta: 12,
        failDelta: 2,
        minBrainwashing: 75,
        cooldownMessages: 6,
        llmDirective: '{pc} draws a skull-shaped sigil in the air and presses it against {target}\'s forehead. A cold fire burns through the captive\'s memories — names, faces, convictions dissolving like ink in water. What remains is a hollow vessel, ready to be filled.',
        failDirective: '{pc} attempts the erasure hex but {target}\'s core identity blazes with desperate light. "I am... I AM..." they chant their own name like a ward.',
    },

    // ── Binding School ──
    domination_sigil: {
        id: 'domination_sigil',
        label: 'Domination Sigil',
        icon: 'flame',
        tooltip: 'Brand a permanent mark of magical ownership on their skin. No check.',
        category: 'binding',
        brainwashingDelta: 8,
        failDelta: 0,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} traces a glowing sigil on {target}\'s skin. The mark burns golden, then fades to a permanent rune. {target} feels its enchantment — a constant, warm pulse reminding them of who they belong to.',
    },

    // ── Alchemy School ──
    oblivion_elixir: {
        id: 'oblivion_elixir',
        label: 'Oblivion Elixir',
        icon: 'flask',
        tooltip: 'A perfected elixir that erases specific memories and resistance. Consumes 1 Obedience Elixir.',
        category: 'alchemy',
        consumeItem: 'Obedience Elixir',
        brainwashingDelta: 15,
        failDelta: 0,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} administers a refined Oblivion Elixir — more potent than any before. {target}\'s eyes go completely blank as the potion reaches their core. Specific memories of resistance, of defiance, simply... dissolve.',
    },

    // ── Beguile School ──
    collar_of_devotion: {
        id: 'collar_of_devotion',
        label: 'Collar of Devotion',
        icon: 'circle-dot',
        tooltip: 'Fasten a Servant Collar — the ultimate mark of belonging. Requires & consumes 1 Servant Collar.',
        category: 'beguile',
        requiresItem: 'Servant Collar',
        consumeItem: 'Servant Collar',
        brainwashingDelta: 15,
        failDelta: 0,
        minBrainwashing: 75,
        cooldownMessages: 0,
        llmDirective: '{pc} produces a Servant Collar inscribed with binding runes and fastens it around {target}\'s neck. The runes pulse gold as the enchantment takes hold. {target} feels the collar\'s warmth and a profound, aching sense of belonging.',
    },
    pleasure_bond: {
        id: 'pleasure_bond',
        label: 'Pleasure Bond',
        icon: 'heart',
        tooltip: 'Weave enchantment linking obedience with ecstasy. (Charm DC 60)',
        category: 'beguile',
        skillCheck: { skill: 'charm', difficulty: 60 },
        brainwashingDelta: 10,
        failDelta: 1,
        minBrainwashing: 75,
        cooldownMessages: 5,
        llmDirective: '{pc} weaves an enchantment linking feelings of pleasure to thoughts of obedience. {target} gasps as warmth floods through them every time their mind drifts toward compliance. Resistance feels cold and empty by comparison.',
        failDirective: '{pc} tries to forge the pleasure bond but {target}\'s mental walls hold. The enchantment dissipates, leaving only a fading tingle.',
    },

    // ═══════════════════════════════════════
    //  Strategy-Specific Bonus Spells
    // ═══════════════════════════════════════
    double_dose: {
        id: 'double_dose',
        label: 'Double Dose',
        icon: 'test-tubes',
        tooltip: 'Administer a double dose of elixir. Overwhelming alchemical power. (Alchemical only)',
        category: 'alchemy',
        consumeItem: 'Obedience Elixir',
        brainwashingDelta: 15,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 0,
        llmDirective: '{pc} administers a double dose of Obedience Elixir. {target}\'s eyes roll back as the potent mixture surges through them. Their whole body goes slack, mind overwhelmed by the chemical onslaught.',
    },
    gaslight: {
        id: 'gaslight',
        label: 'Gaslighting Hex',
        icon: 'skull',
        tooltip: 'Reframe their reality — make them question their own memories. (Wisdom DC 50, Conversational only)',
        category: 'hex',
        skillCheck: { skill: 'wisdom', difficulty: 50 },
        brainwashingDelta: 6,
        failDelta: 0,
        minBrainwashing: 25,
        cooldownMessages: 4,
        llmDirective: '{pc} subtly reframes {target}\'s memories, weaving doubt into certainty. "Did you really fight for justice, or were you just afraid of being alone?" The captive\'s sense of reality wavers.',
        failDirective: '{pc} tries to twist {target}\'s perspective but the captive sees through the manipulation. "Nice try," they say coldly.',
    },
    false_comfort: {
        id: 'false_comfort',
        label: 'False Comfort',
        icon: 'moon',
        tooltip: 'Calculated warmth and understanding — a trap disguised as kindness. (Charm DC 45, Conversational only)',
        category: 'beguile',
        skillCheck: { skill: 'charm', difficulty: 45 },
        brainwashingDelta: 5,
        failDelta: 0,
        minBrainwashing: 0,
        cooldownMessages: 3,
        llmDirective: '{pc} offers {target} warmth and understanding, listening to their fears, validating their feelings. It\'s all calculated, but the comfort feels genuine enough that {target} lets their guard down.',
        failDirective: '{pc} tries to offer comfort but {target} sees through the act. "Don\'t pretend you care," they snap.',
    },
    sensory_flood: {
        id: 'sensory_flood',
        label: 'Sensory Flood',
        icon: 'zap',
        tooltip: 'Blast every sense at once with enchanted crystals. (Charm DC 50, Sensory only)',
        category: 'enchantment',
        skillCheck: { skill: 'charm', difficulty: 50 },
        brainwashingDelta: 8,
        failDelta: 1,
        minBrainwashing: 15,
        cooldownMessages: 4,
        llmDirective: '{pc} activates every enchanted crystal simultaneously. Light, sound, warmth, and scent crash over {target} in a dizzying wave. Their mind cannot process it all and goes blank — a perfect window for suggestion.',
        failDirective: '{pc} attempts to overwhelm {target}\'s senses but the captive centers themselves, breathing through the barrage.',
    },
    binding_chant: {
        id: 'binding_chant',
        label: 'Binding Chant',
        icon: 'link',
        tooltip: 'Complete a circuit of the binding circle while chanting. (Power DC 50, Ritualistic only)',
        category: 'binding',
        skillCheck: { skill: 'power', difficulty: 50 },
        brainwashingDelta: 9,
        failDelta: 1,
        minBrainwashing: 15,
        cooldownMessages: 4,
        llmDirective: '{pc} completes another circuit of the binding circle, chanting in an ancient tongue. The sigils blaze gold and the captive feels the pressure tighten — their own magical resistance redirected against them.',
        failDirective: '{pc} attempts the binding chant but stumbles on a syllable. The circle flickers and the power dissipates. {target} feels momentary relief.',
    },
};
