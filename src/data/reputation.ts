// ──────────────────────────────────────────
// REPUTATION SYSTEM — Town Suspicion Meter
// ──────────────────────────────────────────
// Reputation tracks how suspicious the town is of the player.
// 0 = trusted citizen, 100 = actively hunted.
// Suspicion rises when heroes go missing and falls when the player
// does good deeds or bribes officials.

export type ReputationTier = 'trusted' | 'respected' | 'unknown' | 'suspicious' | 'wanted' | 'hunted';

export interface ReputationTierDef {
    tier: ReputationTier;
    label: string;
    minRep: number;
    maxRep: number;
    color: string;
    icon: string;
    description: string;
    shopPriceModifier: number; // multiplier on shop prices (1.0 = normal)
    explorationModifier: number; // bonus/penalty to exploration skill checks
}

export const REPUTATION_TIERS: ReputationTierDef[] = [
    {
        tier: 'trusted', label: 'Trusted', minRep: 0, maxRep: 15,
        color: '#7ab87a', icon: 'shield-check',
        description: 'The townsfolk trust you implicitly. Merchants offer their best prices.',
        shopPriceModifier: 0.85, explorationModifier: 5,
    },
    {
        tier: 'respected', label: 'Respected', minRep: 16, maxRep: 30,
        color: '#7dd4a0', icon: 'thumbs-up',
        description: 'You are well-regarded in town. Business as usual.',
        shopPriceModifier: 0.95, explorationModifier: 2,
    },
    {
        tier: 'unknown', label: 'Unknown', minRep: 31, maxRep: 50,
        color: '#c8aa6e', icon: 'help-circle',
        description: 'The townsfolk don\'t know quite what to make of you.',
        shopPriceModifier: 1.0, explorationModifier: 0,
    },
    {
        tier: 'suspicious', label: 'Suspicious', minRep: 51, maxRep: 70,
        color: '#d4a07a', icon: 'eye',
        description: 'People whisper when you pass. Merchants are wary.',
        shopPriceModifier: 1.15, explorationModifier: -5,
    },
    {
        tier: 'wanted', label: 'Wanted', minRep: 71, maxRep: 90,
        color: '#c87d6e', icon: 'alert-triangle',
        description: 'Bounty posters with your likeness are appearing. Guards watch you closely.',
        shopPriceModifier: 1.35, explorationModifier: -10,
    },
    {
        tier: 'hunted', label: 'Hunted', minRep: 91, maxRep: 100,
        color: '#c85050', icon: 'skull',
        description: 'The town has dispatched investigators. Operating openly is extremely dangerous.',
        shopPriceModifier: 1.5, explorationModifier: -15,
    },
];

/** Get the current reputation tier */
export function getReputationTier(reputation: number): ReputationTierDef {
    for (const tier of REPUTATION_TIERS) {
        if (reputation >= tier.minRep && reputation <= tier.maxRep) return tier;
    }
    return REPUTATION_TIERS[REPUTATION_TIERS.length - 1];
}

/** Get shop price with reputation modifier applied */
export function getModifiedPrice(basePrice: number, reputation: number): number {
    const tier = getReputationTier(reputation);
    return Math.round(basePrice * tier.shopPriceModifier);
}

// ── Reputation Change Events ──

export interface ReputationChange {
    source: string;
    delta: number;
    description: string;
}

/** Standard reputation changes */
export const REPUTATION_CHANGES = {
    heroCaptured: { source: 'capture', delta: 12, description: 'A hero has gone missing near your territory.' },
    heroConverted: { source: 'conversion', delta: 5, description: 'Townsfolk noticed a familiar face acting... differently.' },
    bribeOfficial: { source: 'bribe', delta: -15, description: 'A well-placed bribe keeps the officials looking the other way.' },
    communityService: { source: 'service', delta: -8, description: 'Your servants performed good deeds in town.' },
    donateGold: { source: 'donation', delta: -5, description: 'A generous donation improves your standing.' },
    questCompleted: { source: 'quest', delta: -3, description: 'Completing a quest improved your public image.' },
    dailyDecay: { source: 'daily', delta: -1, description: 'Suspicion fades slowly with time.' },
    investigatorEncounter: { source: 'investigator', delta: 8, description: 'An investigator is asking questions about you.' },
} as const;

/** Apply a reputation change, clamping to 0-100 */
export function applyReputationChange(currentRep: number, change: ReputationChange): number {
    return Math.max(0, Math.min(100, currentRep + change.delta));
}
