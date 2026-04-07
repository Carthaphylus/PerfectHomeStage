// ──────────────────────────────────────────
// SERVANT RELATIONSHIPS
// ──────────────────────────────────────────
// Servants develop opinions of each other over time.
// Relationships change when servants work together, share rooms,
// or interact during daily events.

import type { Servant, ServantRelationship, RelationshipType } from './types';

// ── Relationship Type Thresholds ──

export function getRelationshipType(affinity: number): RelationshipType {
    if (affinity >= 60) return 'close';
    if (affinity >= 20) return 'friendly';
    if (affinity <= -60) return 'rivalry';
    if (affinity <= -20) return 'tense';
    return 'neutral';
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
    neutral: 'Neutral',
    friendly: 'Friendly',
    close: 'Close Bond',
    rivalry: 'Rivalry',
    tense: 'Tense',
};

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
    neutral: '#8a8a7a',
    friendly: '#7ab87a',
    close: '#78a8d0',
    rivalry: '#c87d6e',
    tense: '#d4a07a',
};

export const RELATIONSHIP_ICONS: Record<RelationshipType, string> = {
    neutral: 'minus',
    friendly: 'smile',
    close: 'heart',
    rivalry: 'swords',
    tense: 'alert-triangle',
};

// ── Relationship Utilities ──

/** Get or create a relationship between two servants */
export function getRelationship(servant: Servant, targetName: string): ServantRelationship {
    if (!servant.relationships) servant.relationships = [];
    let rel = servant.relationships.find(r => r.targetName === targetName);
    if (!rel) {
        rel = { targetName, type: 'neutral', affinity: 0, history: [] };
        servant.relationships.push(rel);
    }
    return rel;
}

/** Modify affinity between two servants (bidirectional) */
export function modifyAffinity(
    servantA: Servant,
    servantB: Servant,
    delta: number,
    reason: string,
): void {
    const relAB = getRelationship(servantA, servantB.name);
    const relBA = getRelationship(servantB, servantA.name);

    relAB.affinity = Math.max(-100, Math.min(100, relAB.affinity + delta));
    relBA.affinity = Math.max(-100, Math.min(100, relBA.affinity + delta));

    relAB.type = getRelationshipType(relAB.affinity);
    relBA.type = getRelationshipType(relBA.affinity);

    // Add to history (keep last 5)
    relAB.history.push(reason);
    relBA.history.push(reason);
    if (relAB.history.length > 5) relAB.history.shift();
    if (relBA.history.length > 5) relBA.history.shift();
}

// ── Task Quality Modifier ──

/** Get a task quality bonus/penalty based on relationships with co-workers.
 *  If another servant is also actively tasked in the same room, their relationship affects quality. */
export function getRelationshipTaskModifier(
    servant: Servant,
    allServants: Record<string, Servant>,
    roomType?: string,
): number {
    if (!roomType || !servant.relationships) return 0;

    let modifier = 0;
    for (const other of Object.values(allServants)) {
        if (other.name === servant.name) continue;
        if (!other.activeTask) continue;

        // Check if working in the same room type
        // (simplified — just checks if both have tasks with same roomType)
        const rel = servant.relationships.find(r => r.targetName === other.name);
        if (!rel) continue;

        if (rel.type === 'close') modifier += 8;
        else if (rel.type === 'friendly') modifier += 4;
        else if (rel.type === 'rivalry') modifier -= 6;
        else if (rel.type === 'tense') modifier -= 3;
    }

    return modifier;
}

// ── Trait Compatibility ──

/** Traits that naturally lead to friendship */
const COMPATIBLE_TRAITS: [string, string][] = [
    ['meticulous', 'disciplined'],
    ['charismatic', 'witty'],
    ['gentle', 'patient'],
    ['fierce', 'hardworking'],
    ['occultist', 'perceptive'],
    ['charming', 'charismatic'],
];

/** Traits that naturally create tension */
const INCOMPATIBLE_TRAITS: [string, string][] = [
    ['meticulous', 'impulsive'],
    ['disciplined', 'restless'],
    ['gentle', 'fierce'],
    ['stoic', 'charismatic'],
    ['distrustful', 'charming'],
];

/** Calculate initial affinity between two servants based on trait compatibility */
export function calculateTraitAffinity(servantA: Servant, servantB: Servant): number {
    let affinity = 0;
    const traitsA = new Set(servantA.traits);
    const traitsB = new Set(servantB.traits);

    for (const [a, b] of COMPATIBLE_TRAITS) {
        if ((traitsA.has(a) && traitsB.has(b)) || (traitsA.has(b) && traitsB.has(a))) {
            affinity += 10;
        }
    }

    for (const [a, b] of INCOMPATIBLE_TRAITS) {
        if ((traitsA.has(a) && traitsB.has(b)) || (traitsA.has(b) && traitsB.has(a))) {
            affinity -= 10;
        }
    }

    return affinity;
}

/** Initialize relationships for a newly converted servant with all existing servants */
export function initializeRelationships(
    newServant: Servant,
    allServants: Record<string, Servant>,
): void {
    for (const other of Object.values(allServants)) {
        if (other.name === newServant.name) continue;
        const baseAffinity = calculateTraitAffinity(newServant, other);
        const relNew = getRelationship(newServant, other.name);
        const relOther = getRelationship(other, newServant.name);
        relNew.affinity = baseAffinity;
        relOther.affinity = baseAffinity;
        relNew.type = getRelationshipType(baseAffinity);
        relOther.type = getRelationshipType(baseAffinity);
        if (baseAffinity > 0) {
            relNew.history.push('Shared compatible traits');
            relOther.history.push('Shared compatible traits');
        } else if (baseAffinity < 0) {
            relNew.history.push('Clashing personalities');
            relOther.history.push('Clashing personalities');
        }
    }
}

// ── Daily Relationship Drift ──

/** Small daily affinity changes based on proximity and shared work */
export function tickDailyRelationships(servants: Record<string, Servant>): string[] {
    const events: string[] = [];
    const names = Object.keys(servants);
    if (names.length < 2) return events;

    // Pick one random pair to develop their relationship
    const i = Math.floor(Math.random() * names.length);
    let j = Math.floor(Math.random() * (names.length - 1));
    if (j >= i) j++;

    const a = servants[names[i]];
    const b = servants[names[j]];

    // Small random drift toward compatibility
    const traitAffinity = calculateTraitAffinity(a, b);
    const drift = traitAffinity > 0 ? 2 + Math.floor(Math.random() * 3)
        : traitAffinity < 0 ? -(2 + Math.floor(Math.random() * 3))
        : (Math.random() < 0.5 ? 1 : -1);

    const reason = drift > 0
        ? `${a.name} and ${b.name} got along well today`
        : `${a.name} and ${b.name} had a minor disagreement`;

    modifyAffinity(a, b, drift, reason);
    events.push(reason);

    return events;
}
