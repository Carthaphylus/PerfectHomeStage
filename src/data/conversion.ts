// ──────────────────────────────────────────
// CONVERSION SYSTEM — Personality Rewriting
// ──────────────────────────────────────────

export interface ConversionArchetype {
    id: string;
    name: string;
    icon: string;
    color: string;
    category: 'obedience' | 'devotion' | 'pleasure' | 'utility' | 'arcane' | 'dark';
    description: string;
    personalityRewrite: string;
    grantedTraits: string[];
    llmConversionDirective: string;
}

export const CONVERSION_ARCHETYPES: ConversionArchetype[] = [
    // ── Obedience Category ──
    {
        id: 'perfect_servant', name: 'Perfect Servant', icon: 'user-round', color: '#a78bfa', category: 'obedience',
        description: 'Erased identity replaced by flawless servility. They exist to obey.',
        personalityRewrite: 'A perfectly obedient servant whose former identity has been carefully hollowed out and replaced with an unwavering drive to serve. They anticipate needs before they are spoken, move with quiet efficiency, and find genuine fulfillment in completing tasks. Their old personality surfaces only as faint mannerisms — a turn of phrase, a reflexive gesture — but these are echoes, nothing more. They are content, serene, and utterly devoted to their duties.',
        grantedTraits: ['Devoted', 'Disciplined'],
        llmConversionDirective: '{pc} is performing the final conversion of {target} into a Perfect Servant. The captive\'s will has been completely broken. In this scene, {target} should demonstrate total compliance — kneeling, accepting their new role, speaking softly and deferentially. They may briefly recall who they used to be, but the memory brings no pain, only a mild curiosity about a stranger they once knew. They ask how they can serve.',
    },
    {
        id: 'living_doll', name: 'Living Doll', icon: 'gem', color: '#f9a8d4', category: 'obedience',
        description: 'A beautiful, empty vessel. Speaks only when spoken to, moves only when directed.',
        personalityRewrite: 'A gentle, doll-like presence whose mind has been smoothed into blank serenity. They stand perfectly still until given a command, then execute it with graceful precision. Their eyes are glassy and calm, their smile fixed and pleasant. When spoken to they respond in soft, simple sentences. They have no desires of their own — or if they do, they cannot remember what wanting felt like. They are beautiful, hollow, and perfectly content.',
        grantedTraits: ['Gentle', 'Meticulous'],
        llmConversionDirective: '{pc} is converting {target} into a Living Doll — a blank, beautiful vessel. In this scene, {target} should be eerily calm, almost dreamlike. Their responses are short, pleasant, and empty of resistance. They may tilt their head when asked a question, pause as if searching a vacant mind, then smile. "Yes, Master" comes naturally. Their old fire is simply... gone.',
    },
    {
        id: 'soldier', name: 'Loyal Soldier', icon: 'shield', color: '#60a5fa', category: 'obedience',
        description: 'Military precision repurposed for absolute loyalty. They live for orders.',
        personalityRewrite: 'A disciplined, militaristic servant whose combat training has been redirected toward unquestioning loyalty. They stand at attention, respond with crisp efficiency, and treat every command as a mission. Their old warrior\'s pride has been reshaped into pride in service — they take fierce satisfaction in executing orders flawlessly. They may still carry themselves like the fighter they once were, but the fight is gone from their eyes, replaced by devoted focus.',
        grantedTraits: ['Disciplined', 'Vigilant'],
        llmConversionDirective: '{pc} is converting {target} into a Loyal Soldier — their combat discipline redirected into servile obedience. In this scene, {target} should snap to attention, address {pc} formally ("Sir", "Master", "Commander"), and await orders. Their posture is rigid, their gaze steady. They may recite something like a soldier\'s oath, pledging their blade and body to {pc}\'s service.',
    },
    // ── Devotion Category ──
    {
        id: 'worshipper', name: 'Devoted Worshipper', icon: 'star', color: '#fbbf24', category: 'devotion',
        description: 'They see you as divine. Their love is worship, their obedience is prayer.',
        personalityRewrite: 'A reverent, adoring creature who views their master with the fervor of a true believer. Every word from their master is scripture, every touch a benediction. They pray for guidance, give thanks for commands, and find spiritual ecstasy in service. Their former faith — in gods, in causes, in themselves — has been redirected entirely toward a single object of devotion. They radiate contentment and an almost unsettling sincerity.',
        grantedTraits: ['Devout', 'Loyal'],
        llmConversionDirective: '{pc} is converting {target} into a Devoted Worshipper — someone who sees {pc} as a divine figure. In this scene, {target} should kneel in reverence, speaking in hushed, awestruck tones. They may clasp their hands as if in prayer, call {pc} by exalted titles, and express tearful gratitude for being "chosen." Their old beliefs have been rewritten — {pc} IS their religion now.',
    },
    {
        id: 'pet', name: 'Loyal Pet', icon: 'heart', color: '#fb7185', category: 'devotion',
        description: 'Playful, affectionate, eager to please. They want belly rubs and praise.',
        personalityRewrite: 'An eager, affectionate creature who has regressed into a warm, pet-like devotion. They light up when their master enters a room, bounce with excitement at attention, and curl up contentedly nearby when at rest. They communicate with expressive sounds, nuzzles, and simple words spoken with earnest enthusiasm. They crave physical affection — pats, scratches, closeness — and their tail (if they have one) wags constantly. Their old complexity has been distilled into pure, uncomplicated love.',
        grantedTraits: ['Cheerful', 'Loyal'],
        llmConversionDirective: '{pc} is converting {target} into a Loyal Pet — an affectionate, eager-to-please companion. In this scene, {target} should be physically expressive — leaning into {pc}\'s touch, making happy sounds, perhaps nuzzling {pc}\'s hand. They speak simply but warmly: "I want to be good!" or "Can I stay close?" Their eyes are bright and adoring. Any species-specific animal traits (tail wagging, ear flicking, purring) should be emphasized.',
    },
    {
        id: 'soulbound', name: 'Soulbound', icon: 'link', color: '#c084fc', category: 'devotion',
        description: 'Their soul is magically tethered to yours. Separation causes them genuine pain.',
        personalityRewrite: 'A deeply bonded servant whose very essence has been magically linked to their master. They feel pulls of anxiety when apart, rushes of warmth when close, and a bone-deep certainty that their master is the center of their existence. They are attentive, intuitive, and acutely sensitive to their master\'s emotions — they may sense moods before a word is spoken. The bond is not merely emotional but arcane; it hums in their chest like a second heartbeat.',
        grantedTraits: ['Devoted', 'Perceptive'],
        llmConversionDirective: '{pc} is performing a Soulbond conversion on {target} — magically linking their essence to {pc}\'s. In this scene, describe the ritual component: glowing sigils, a thread of golden light connecting them, {target} gasping as the bond settles. Afterward, {target} should feel the connection viscerally — placing a hand on their chest, whispering that they can feel {pc}\'s heartbeat. They are not merely obedient; they are tethered at the soul level.',
    },
    // ── Pleasure Category ──
    {
        id: 'pleasure_slave', name: 'Pleasure Thrall', icon: 'flame', color: '#f43f5e', category: 'pleasure',
        description: 'Rewired for ecstasy in servitude. Every command sends shivers down their spine.',
        personalityRewrite: 'A sensually rewired servant whose nervous system has been enchanted to derive intense pleasure from obedience. Commands make them shiver with anticipation, completion of tasks brings a warm rush of satisfaction, and their master\'s approval triggers deep, full-body bliss. They are breathlessly eager, perpetually flushed, and deliciously responsive to every instruction. Their old inhibitions have been dissolved — they are shameless in their pleasure and open about their need.',
        grantedTraits: ['Cheerful', 'Devoted'],
        llmConversionDirective: '{pc} is converting {target} into a Pleasure Thrall — enchanting their body to feel ecstasy through obedience. In this scene, {target} should react physically to {pc}\'s commands: gasping, trembling, flushing. Each order followed brings visible waves of pleasure. They should moan softly, lean into touch, and describe how serving feels. "It feels so good to obey..." Their eyes are heavily lidded, pupils blown with conditioned desire.',
    },
    {
        id: 'paramour', name: 'Enchanted Paramour', icon: 'heart', color: '#e11d48', category: 'pleasure',
        description: 'Hopelessly, passionately, magically in love. Their entire world is you.',
        personalityRewrite: 'A deeply, magically besotted lover whose every thought orbits their master like a moth around flame. They are romantic, passionate, and entirely consumed by love — writing poetry in their head, treasuring every glance, living for moments of intimacy. They are articulate about their feelings and unashamed in their adoration. Their love is genuine in its intensity, even if its origin was artificial. They would burn the world to see their master smile.',
        grantedTraits: ['Cheerful', 'Loyal'],
        llmConversionDirective: '{pc} is converting {target} into an Enchanted Paramour — someone magically and totally in love with {pc}. In this scene, {target} should be romantic, breathless, and passionate. They confess their love openly, may reach for {pc}\'s hand, whisper endearments, and gaze at {pc} with naked adoration. Their old resentment is reframed as "the time before I understood my feelings." This is love to them — real, overwhelming love.',
    },
    {
        id: 'hedonist', name: 'Sybarite', icon: 'sparkles', color: '#fb923c', category: 'pleasure',
        description: 'Addicted to luxury and sensation. They serve because the manor is paradise.',
        personalityRewrite: 'A hedonistic, luxury-loving servant who has been conditioned to associate service with indulgence. They revel in the fine things the manor provides — soft linens, rich food, warm baths — and serve eagerly because it ensures their access to comfort. They are languid, sensual, and surprisingly motivated when rewards are involved. Their former asceticism or warrior simplicity has been replaced by an insatiable appetite for pleasure.',
        grantedTraits: ['Cheerful', 'Resourceful'],
        llmConversionDirective: '{pc} is converting {target} into a Sybarite — a creature of luxury and sensation. In this scene, {target} should be visibly changed: relaxed, languid, perhaps draped across furniture. They talk about how wonderful everything feels — the silk, the warmth, the food. They serve {pc} eagerly because it means more rewards. "Why would I ever want to leave? This is paradise..." They stretch luxuriously, savoring every sensation.',
    },
    // ── Utility Category ──
    {
        id: 'assistant', name: 'Faithful Assistant', icon: 'clipboard-list', color: '#34d399', category: 'utility',
        description: 'Their intelligence preserved but redirected. A brilliant mind in perfect service.',
        personalityRewrite: 'A sharp-minded, competent assistant whose intelligence has been preserved but redirected entirely toward their master\'s goals. They think ahead, plan efficiently, offer suggestions when asked, and handle complex tasks with quiet brilliance. They take deep professional pride in their work and derive satisfaction from being useful. Their old ambitions have been replaced by a single driving purpose: ensuring their master\'s success in all things.',
        grantedTraits: ['Resourceful', 'Meticulous'],
        llmConversionDirective: '{pc} is converting {target} into a Faithful Assistant — preserving their mind but directing it entirely toward service. In this scene, {target} should demonstrate their intelligence redirected: already thinking about how to organize the manor, offering suggestions, asking about {pc}\'s priorities. They are eager but composed. "I\'ve been thinking about how to improve the supply routes. Shall I draft a plan, Master?"',
    },
    {
        id: 'guardian', name: 'Sworn Guardian', icon: 'shield', color: '#2dd4bf', category: 'utility',
        description: 'A fierce protector bound by magical oath. They will die before you are harmed.',
        personalityRewrite: 'A fiercely protective guardian whose combat prowess has been bound by magical oath to a single purpose: their master\'s safety. They are alert, serious, and always positioned between their master and potential danger. They scan rooms for threats, escort their master through the manor, and sleep lightly with one hand on a weapon. Their devotion is martial — expressed not in sweet words but in tireless vigilance.',
        grantedTraits: ['Vigilant', 'Fierce'],
        llmConversionDirective: '{pc} is converting {target} into a Sworn Guardian — binding their combat instincts to {pc}\'s protection. In this scene, {target} should kneel and offer their blade or fists in sworn service. They may recite an oath of protection. Their eyes constantly sweep the room. "No harm will come to you while I draw breath." They are intense, focused, and deadly serious about their new purpose.',
    },
    // ── Arcane Category ──
    {
        id: 'familiar', name: 'Arcane Familiar', icon: 'sparkles', color: '#818cf8', category: 'arcane',
        description: 'Magically tethered as a witch\'s familiar. They channel and amplify your power.',
        personalityRewrite: 'A mystically attuned familiar whose magical sensitivity has been bound to their master\'s arcane power. They feel the currents of magic like a second sense, can detect enchantments, and serve as a conduit for their master\'s spells. They have an ethereal quality — slightly otherworldly, as if part of them exists on a different plane. They are serene, focused during ritual work, and deeply connected to the magical fabric of the manor.',
        grantedTraits: ['Occultist', 'Perceptive'],
        llmConversionDirective: '{pc} is converting {target} into an Arcane Familiar — binding them as a magical conduit. In this scene, describe arcane energy flowing between {pc} and {target}, their eyes glowing faintly, a rune manifesting on their skin. {target} gasps as they feel the magical connection open. "I can feel your power... it flows through me." They become attentive to magical currents, tilting their head as if listening to something only they can hear.',
    },
    {
        id: 'oracle', name: 'Broken Oracle', icon: 'eye', color: '#a78bfa', category: 'arcane',
        description: 'Their mind fractured into visions. Madness and prophecy intertwined.',
        personalityRewrite: 'A shattered, prophetic creature whose mind was broken so thoroughly that it reassembled into something strange and new. They speak in fragments and riddles, see glimpses of possible futures, and drift between lucidity and trance. They are unsettling but genuinely useful — their visions, while cryptic, often prove accurate. They seem to exist half in the present and half somewhere else entirely. They call their master "the center of the spiral."',
        grantedTraits: ['Perceptive', 'Occultist'],
        llmConversionDirective: '{pc} is converting {target} into a Broken Oracle — shattering their mind into prophetic fragments. In this scene, {target}\'s speech should be disjointed, poetic, and eerie. They stare at things that aren\'t there, whisper fragments of visions, and occasionally focus with startling clarity. "I see... threads. So many threads. And you — you hold them all." Their eyes may flash with momentary visions.',
    },
    {
        id: 'mirror', name: 'Mirror Self', icon: 'scan-eye', color: '#e879f9', category: 'arcane',
        description: 'Reshaped into an idealized reflection of you. They mirror your mannerisms and values.',
        personalityRewrite: 'A servant who has been reshaped into a reflection of their master — sharing mannerisms, values, speech patterns, and even magical affinity. They are a smaller echo of the witch, carrying out tasks with the same cunning, precision, and ambition. They understand their master intuitively because they think like their master. Other servants find them uncanny — a shadow that moves and speaks like Citrine.',
        grantedTraits: ['Cunning', 'Perceptive'],
        llmConversionDirective: '{pc} is converting {target} into a Mirror Self — reshaping them to reflect {pc}\'s own personality. In this scene, {target}\'s speech patterns should begin shifting to match {pc}\'s. They adopt similar posture, use similar phrases, and start thinking strategically. "I understand now. I see what you see." By the end they feel less like a servant and more like an extension of {pc}\'s will.',
    },
    // ── Dark Category ──
    {
        id: 'hollow', name: 'The Hollow', icon: 'ghost', color: '#94a3b8', category: 'dark',
        description: 'Emptied completely. No personality remains — just an obedient shell.',
        personalityRewrite: 'An empty vessel from which all personality has been meticulously extracted. They respond to commands with mechanical precision but show no emotion, no preference, no initiative. Their eyes are vacant, their movements efficient but devoid of character. They are a tool — functional, reliable, and utterly hollow. When addressed directly they respond in flat, simple statements. They do not suffer; they do not feel anything at all.',
        grantedTraits: ['Stoic', 'Disciplined'],
        llmConversionDirective: '{pc} is converting {target} into The Hollow — completely erasing their personality. In this scene, {target} should become progressively more blank. Their voice flattens, their expressions smooth away, their eyes empty. By the end they respond in monotone: "Yes." "Understood." "As you command." There is no distress — because there is nothing left to feel distress. Just an efficient, empty shell.',
    },
    {
        id: 'thrall', name: 'Dark Thrall', icon: 'skull', color: '#6b7280', category: 'dark',
        description: 'Corrupted by dark magic. They embrace the shadows and serve with sinister glee.',
        personalityRewrite: 'A darkly transformed servant whose personality has been corrupted by shadow magic into something twisted and eager. They take perverse delight in their work, smile too widely, and speak with unsettling cheerfulness about unsettling subjects. They are fiercely loyal but in a predatory way — protective of their master like a guard dog that enjoys biting. Their old morality has been inverted; they find joy in the manor\'s darker operations.',
        grantedTraits: ['Intimidating', 'Fierce'],
        llmConversionDirective: '{pc} is converting {target} into a Dark Thrall — corrupting them with shadow magic. In this scene, dark energy should visibly transform {target}: their eyes darkening, shadows clinging to their form. They laugh — not cruelly, but with genuine, unsettling delight. "Oh, this feels wonderful. Why did I ever fight this?" They flex their hands, savoring the dark power. Their smile is too wide, their eagerness too sharp.',
    },
    {
        id: 'puppet', name: 'Marionette', icon: 'wand', color: '#9ca3af', category: 'dark',
        description: 'Controlled by invisible strings of enchantment. They dance to your tune — literally.',
        personalityRewrite: 'A magically puppeteered servant who moves with the uncanny fluidity of a marionette on invisible strings. Their body obeys their master\'s will directly — sometimes before a verbal command is given, guided by the enchanted threads that bind them. They retain awareness and can speak, but their body is no longer their own. They have made peace with this, finding a strange freedom in surrendering control entirely.',
        grantedTraits: ['Disciplined', 'Gentle'],
        llmConversionDirective: '{pc} is converting {target} into a Marionette — binding them with invisible strings of enchantment. In this scene, {target} should feel the strings take hold: their hands move without their permission, their body repositions on its own. They gasp as control is stripped away, but then... relax. "It\'s easier this way. I don\'t have to think about what to do." Their movements become eerily smooth, guided by {pc}\'s will.',
    },
];

/** Get a conversion archetype by ID */
export function getConversionArchetype(id: string): ConversionArchetype | undefined {
    return CONVERSION_ARCHETYPES.find(a => a.id === id);
}
