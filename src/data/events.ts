// ──────────────────────────────────────────
// EVENT SYSTEM — Event Definitions & Helpers
// ──────────────────────────────────────────
import type { EventDefinition, SkillStats } from './types';

/** Roll a skill check: d100 + skill/2 + modifier vs difficulty */
export function rollSkillCheck(
    playerSkill: number,
    difficulty: number,
    modifier: number = 0
): { roll: number; total: number; success: boolean } {
    const roll = Math.floor(Math.random() * 100) + 1;
    const total = roll + Math.floor(playerSkill / 2) + modifier;
    return { roll, total, success: total >= difficulty };
}

// ==========================================
// Event Registry
// ==========================================

/**
 * Brainwashing Session event — the core conditioning event for captives.
 * Simplified to: intro → strategy selection → conditioning chat session.
 * All conditioning progress happens via in-chat actions during the chat phase.
 */
export const EVENT_BRAINWASHING: EventDefinition = {
    id: 'brainwashing_session',
    name: 'Conditioning Session',
    description: 'Attempt to break a captive\'s will through hypnotic conditioning.',
    icon: 'orbit',
    category: 'brainwashing',
    startStep: 'intro',
    steps: {
        intro: {
            id: 'intro',
            text: '*You enter the dungeon chamber where {target} is held. The enchanted shackles glow faintly as you approach, keeping the captive\'s resistance suppressed.*\n\n*You light a spiral incense and let the golden smoke fill the room, preparing the atmosphere for the session.*',
            speaker: 'Citrine',
            nextStep: 'strategy_select',
            effects: [],
        },
        strategy_select: {
            id: 'strategy_select',
            text: '*{target} watches you warily, muscles tense against the restraints. You can see the defiance in their eyes — but also the faintest flicker of uncertainty.*\n\nHow will you approach today\'s session?',
            choices: [
                {
                    id: 'gentle',
                    label: 'Gentle Persuasion',
                    tooltip: 'Soft words, soothing spirals, and patient coaxing. Charm bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'forceful',
                    label: 'Forceful Domination',
                    tooltip: 'Overwhelming arcane power and psychic assault. Power bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'alchemical',
                    label: 'Alchemical Approach',
                    tooltip: 'Elixirs, incense, and chemical manipulation. Wisdom bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'conversational',
                    label: 'Conversational',
                    tooltip: 'Understanding, manipulation, and psychological tactics. Wisdom bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'sensory',
                    label: 'Sensory Overload',
                    tooltip: 'Overwhelm their senses with magical stimuli. Charm bonus.',
                    nextStep: 'session',
                },
                {
                    id: 'ritualistic',
                    label: 'Ritualistic',
                    tooltip: 'Ancient binding circles and ceremonial enchantment. Power bonus.',
                    nextStep: 'session',
                },
            ],
        },
        session: {
            id: 'session',
            text: '*The session begins. {target} is before you — restrained, but their will is their own... for now.*',
            chatPhase: {
                context: 'Live conditioning session. Use the action panel to apply conditioning techniques during conversation.',
                speaker: '{target}',
                location: 'Dungeon',
                skippable: true,
                minMessages: 0,
            },
            isEnding: true,
        },
    },
};
