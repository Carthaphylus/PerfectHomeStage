// ──────────────────────────────────────────
// AI Chat Change Scopes & Utilities
// ──────────────────────────────────────────
// Defines what the AI is allowed to change after a chat conversation.
// Each scope is a set of categories with min/max delta ranges.
// These are the primary tuning knobs for AI freedom.

import type { ChatChangeScope, ChatChangeScopeEntry, ChatChangeCategory } from './types';

// ── Default Scopes ──

/**
 * Scope for casual servant conversations.
 * Small love / obedience shifts, minor stamina drain.
 */
export const SERVANT_CHAT_SCOPE: ChatChangeScope = {
    entries: [
        { category: 'love',      min: -3, max: 5 },
        { category: 'obedience', min: -3, max: 3 },
        { category: 'stamina',   min: -2, max: 0 },
    ],
};

/**
 * Scope for multi-servant group chats.
 * Slightly wider ranges — group dynamics are more volatile.
 * Can affect gold (gifts, gambling, etc.).
 */
export const MULTI_CHAT_SCOPE: ChatChangeScope = {
    entries: [
        { category: 'love',      min: -3, max: 5 },
        { category: 'obedience', min: -4, max: 4 },
        { category: 'stamina',   min: -3, max: 0 },
        { category: 'gold',      min: -10, max: 10 },
    ],
};

/**
 * A generous scope for events that want the AI to have broader control.
 * Includes gold, mana, items, and character stats.
 * Individual events can restrict further via allowedItems / allowedStats.
 */
export const EVENT_CHAT_FULL_SCOPE: ChatChangeScope = {
    entries: [
        { category: 'love',                min: -5, max: 8 },
        { category: 'obedience',           min: -5, max: 5 },
        { category: 'stamina',             min: -5, max: 0 },
        { category: 'gold',                min: -20, max: 20 },
        { category: 'mana',                min: -5, max: 5 },
        { category: 'comfort',             min: -3, max: 3 },
        { category: 'household_obedience', min: -3, max: 3 },
        { category: 'item_add',            min: 1, max: 3 },
        { category: 'item_remove',         min: 1, max: 2 },
        { category: 'stat',                min: -2, max: 3 },
    ],
};

/**
 * A minimal scope: only love & obedience, small range.
 * Good for flavor chats that shouldn't change much.
 */
export const MINIMAL_CHAT_SCOPE: ChatChangeScope = {
    entries: [
        { category: 'love',      min: -1, max: 2 },
        { category: 'obedience', min: -1, max: 1 },
    ],
};

// ── Utility Functions ──

/**
 * Merge two scopes. The override scope's entries take priority.
 * Categories in the base that aren't overridden are kept.
 */
export function mergeScopes(base: ChatChangeScope, override: ChatChangeScope): ChatChangeScope {
    const merged = new Map<ChatChangeCategory, ChatChangeScopeEntry>();

    for (const entry of base.entries) {
        merged.set(entry.category, { ...entry });
    }
    for (const entry of override.entries) {
        merged.set(entry.category, { ...entry });
    }

    return {
        entries: Array.from(merged.values()),
        targetCharacters: override.targetCharacters ?? base.targetCharacters,
    };
}

/**
 * Look up a scope entry for a given category.
 */
export function getScopeEntry(scope: ChatChangeScope, category: ChatChangeCategory): ChatChangeScopeEntry | undefined {
    return scope.entries.find(e => e.category === category);
}

/**
 * Clamp a delta value to the allowed range for a category.
 * Returns 0 if the category isn't in scope.
 */
export function clampToScope(scope: ChatChangeScope, category: ChatChangeCategory, delta: number): number {
    const entry = getScopeEntry(scope, category);
    if (!entry) return 0;
    return Math.max(entry.min, Math.min(entry.max, Math.round(delta)));
}

/**
 * Build a human-readable description of a scope for the AI prompt.
 * Example: "love: -3 to +5, obedience: -3 to +3, stamina: -2 to 0"
 */
export function describeScopeForPrompt(scope: ChatChangeScope): string {
    return scope.entries.map(e => {
        const minStr = e.min >= 0 ? `+${e.min}` : `${e.min}`;
        const maxStr = e.max >= 0 ? `+${e.max}` : `${e.max}`;
        let desc = `${e.category}: ${minStr} to ${maxStr}`;
        if (e.allowedItems?.length) desc += ` (items: ${e.allowedItems.join(', ')})`;
        if (e.allowedStats?.length) desc += ` (stats: ${e.allowedStats.join(', ')})`;
        return desc;
    }).join('\n  ');
}

/**
 * Get a display label and icon for a change category.
 */
export function getCategoryDisplay(category: ChatChangeCategory): { label: string; icon: string; color: string } {
    switch (category) {
        case 'love':                return { label: 'Love',       icon: 'heart',     color: '#f472b6' };
        case 'obedience':           return { label: 'Obedience',  icon: 'crown',     color: '#c084fc' };
        case 'stamina':             return { label: 'Stamina',    icon: 'zap',       color: '#4ade80' };
        case 'gold':                return { label: 'Gold',       icon: 'coins',     color: '#facc15' };
        case 'mana':                return { label: 'Mana',       icon: 'sparkles',  color: '#60a5fa' };
        case 'comfort':             return { label: 'Comfort',    icon: 'home',      color: '#fb923c' };
        case 'household_obedience': return { label: 'Household',  icon: 'shield',    color: '#a78bfa' };
        case 'item_add':            return { label: 'Item Gained', icon: 'package',  color: '#34d399' };
        case 'item_remove':         return { label: 'Item Lost',   icon: 'package',  color: '#f87171' };
        case 'stat':                return { label: 'Stat',       icon: 'trending-up', color: '#38bdf8' };
    }
}
