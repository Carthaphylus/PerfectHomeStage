// ──────────────────────────────────────────
// DAILY EVENTS — Random passive events at end-of-day
// ──────────────────────────────────────────
// Each event has a weight (probability), conditions, and effects.
// The engine picks 0-2 events per day from the eligible pool.

import type { DailyEventResult, TurnChange, Servant, WitchStats, HouseholdStats } from './types';
import type { InventoryItem } from './items';

// ── Daily Event Definition ──

export interface DailyEventDef {
    id: string;
    name: string;
    icon: string;
    description: string;
    weight: number; // relative probability (higher = more likely)
    /** Condition check — return true if this event can fire */
    condition: (ctx: DailyEventContext) => boolean;
    /** Apply effects and return TurnChange entries for the summary */
    apply: (ctx: DailyEventContext) => TurnChange[];
    /** Cooldown in days — won't fire again for this many days after triggering */
    cooldown: number;
}

export interface DailyEventContext {
    day: number;
    stats: WitchStats;
    servants: Record<string, Servant>;
    inventory: Record<string, InventoryItem>;
    servantCount: number;
    capturedHeroCount: number;
    /** Days since each event last fired (undefined = never fired) */
    lastFired: Record<string, number>;
}

// ── Event Registry ──

export const DAILY_EVENT_REGISTRY: DailyEventDef[] = [

    // ════════════════════════════════════
    // POSITIVE EVENTS
    // ════════════════════════════════════

    {
        id: 'found_gold',
        name: 'Found Coin Stash',
        icon: 'coins',
        description: 'A servant discovers a forgotten coin stash while cleaning a dusty corner of the manor.',
        weight: 8,
        cooldown: 5,
        condition: (ctx) => ctx.servantCount >= 1,
        apply: (ctx) => {
            const amount = 10 + Math.floor(Math.random() * 20);
            ctx.stats.gold += amount;
            return [{
                icon: 'coins', label: 'Found Coins', detail: `A servant found ${amount} gold tucked behind a loose brick.`,
                delta: amount, category: 'finance', color: '#e8c84a',
            }];
        },
    },
    {
        id: 'herb_garden_bloom',
        name: 'Garden Bloom',
        icon: 'flower-2',
        description: 'Wild herbs have sprouted in the manor grounds overnight.',
        weight: 7,
        cooldown: 4,
        condition: () => true,
        apply: (ctx) => {
            const items = ['Dreamcatcher Herb', 'Moonpetal Blossom', 'Marshwater Moss'];
            const chosen = items[Math.floor(Math.random() * items.length)];
            const qty = 2 + Math.floor(Math.random() * 3);
            const inv = ctx.inventory[chosen];
            if (inv) inv.quantity += qty;
            else ctx.inventory[chosen] = { name: chosen, quantity: qty, type: 'ingredient' };
            return [{
                icon: 'leaf', label: chosen, detail: `${qty} sprouted in the manor grounds overnight.`,
                delta: qty, category: 'item', color: '#7ab87a',
            }];
        },
    },
    {
        id: 'servant_morale_boost',
        name: 'High Spirits',
        icon: 'smile',
        description: 'The servants are in unusually good spirits today.',
        weight: 6,
        cooldown: 5,
        condition: (ctx) => ctx.servantCount >= 2 && ctx.stats.household.comfort >= 40,
        apply: (ctx) => {
            ctx.stats.household.comfort = Math.min(100, ctx.stats.household.comfort + 5);
            return [{
                icon: 'smile', label: 'High Spirits', detail: 'The servants shared stories and laughter. Comfort +5.',
                delta: 5, category: 'household', color: '#7ab87a',
            }];
        },
    },
    {
        id: 'mana_surge',
        name: 'Mana Surge',
        icon: 'sparkles',
        description: 'A ley line beneath the manor pulses, flooding the air with arcane energy.',
        weight: 5,
        cooldown: 6,
        condition: (ctx) => ctx.stats.mana < ctx.stats.maxMana,
        apply: (ctx) => {
            const amount = 10 + Math.floor(Math.random() * 15);
            ctx.stats.mana = Math.min(ctx.stats.maxMana, ctx.stats.mana + amount);
            return [{
                icon: 'sparkles', label: 'Mana Surge', detail: `A ley line pulses beneath the manor. Mana +${amount}.`,
                delta: amount, category: 'mana', color: '#78a8d0',
            }];
        },
    },
    {
        id: 'skilled_servant',
        name: 'Self-Improvement',
        icon: 'trending-up',
        description: 'A servant has been practicing on their own time.',
        weight: 5,
        cooldown: 5,
        condition: (ctx) => ctx.servantCount >= 1,
        apply: (ctx) => {
            const servants = Object.values(ctx.servants);
            const servant = servants[Math.floor(Math.random() * servants.length)];
            const stats: (keyof typeof servant.stats)[] = ['prowess', 'expertise', 'attunement', 'presence', 'discipline', 'insight'];
            const stat = stats[Math.floor(Math.random() * stats.length)];
            const amount = 1 + Math.floor(Math.random() * 2);
            servant.stats[stat] = Math.min(100, servant.stats[stat] + amount);
            return [{
                icon: 'trending-up', label: `${servant.name} improved`,
                detail: `Practiced independently. ${stat.charAt(0).toUpperCase() + stat.slice(1)} +${amount}.`,
                delta: amount, category: 'stat', color: '#c8aa6e',
            }];
        },
    },

    // ════════════════════════════════════
    // NEGATIVE EVENTS
    // ════════════════════════════════════

    {
        id: 'servant_quarrel',
        name: 'Servant Quarrel',
        icon: 'angry',
        description: 'Two servants got into an argument, lowering household morale.',
        weight: 6,
        cooldown: 4,
        condition: (ctx) => ctx.servantCount >= 2,
        apply: (ctx) => {
            const drop = 3 + Math.floor(Math.random() * 5);
            ctx.stats.household.comfort = Math.max(0, ctx.stats.household.comfort - drop);
            const servants = Object.values(ctx.servants);
            const a = servants[Math.floor(Math.random() * servants.length)];
            let b = a;
            while (b === a && servants.length > 1) b = servants[Math.floor(Math.random() * servants.length)];
            return [{
                icon: 'angry', label: 'Servant Quarrel',
                detail: `${a.name} and ${b.name} had a heated argument. Comfort -${drop}.`,
                delta: -drop, category: 'household', color: '#c87d6e',
            }];
        },
    },
    {
        id: 'supply_spoilage',
        name: 'Supply Spoilage',
        icon: 'trash-2',
        description: 'Some supplies in the storeroom have gone bad.',
        weight: 5,
        cooldown: 6,
        condition: (ctx) => {
            return Object.values(ctx.inventory).some(i => i.type === 'ingredient' && i.quantity >= 3);
        },
        apply: (ctx) => {
            const ingredients = Object.values(ctx.inventory).filter(i => i.type === 'ingredient' && i.quantity >= 3);
            if (ingredients.length === 0) return [];
            const target = ingredients[Math.floor(Math.random() * ingredients.length)];
            const lost = 1 + Math.floor(Math.random() * 2);
            target.quantity = Math.max(0, target.quantity - lost);
            return [{
                icon: 'trash-2', label: 'Spoilage',
                detail: `${lost} ${target.name} spoiled in storage.`,
                delta: -lost, category: 'item', color: '#c87d6e',
            }];
        },
    },
    {
        id: 'servant_exhaustion',
        name: 'Exhausted Servant',
        icon: 'moon',
        description: 'A servant collapses from overwork.',
        weight: 4,
        cooldown: 5,
        condition: (ctx) => Object.values(ctx.servants).some(s => s.stamina < 30),
        apply: (ctx) => {
            const exhausted = Object.values(ctx.servants).filter(s => s.stamina < 30);
            if (exhausted.length === 0) return [];
            const servant = exhausted[Math.floor(Math.random() * exhausted.length)];
            const drop = 5 + Math.floor(Math.random() * 10);
            servant.stamina = Math.max(0, servant.stamina - drop);
            ctx.stats.household.obedience = Math.max(0, ctx.stats.household.obedience - 2);
            return [{
                icon: 'moon', label: `${servant.name} collapsed`,
                detail: `Overworked and exhausted. Stamina -${drop}, Obedience -2.`,
                delta: -drop, category: 'stamina', color: '#c87d6e',
            }];
        },
    },
    {
        id: 'disobedience',
        name: 'Minor Disobedience',
        icon: 'shield-off',
        description: 'A servant tested boundaries today.',
        weight: 5,
        cooldown: 4,
        condition: (ctx) => ctx.servantCount >= 1 && ctx.stats.household.obedience < 70,
        apply: (ctx) => {
            const servants = Object.values(ctx.servants).filter(s => s.obedience < 60);
            if (servants.length === 0) return [];
            const servant = servants[Math.floor(Math.random() * servants.length)];
            const drop = 2 + Math.floor(Math.random() * 4);
            ctx.stats.household.obedience = Math.max(0, ctx.stats.household.obedience - drop);
            servant.obedience = Math.max(0, servant.obedience - 3);
            return [{
                icon: 'shield-off', label: `${servant.name} disobeyed`,
                detail: `Refused a minor task. Household obedience -${drop}.`,
                delta: -drop, category: 'household', color: '#c87d6e',
            }];
        },
    },

    // ════════════════════════════════════
    // NEUTRAL / ATMOSPHERIC EVENTS
    // ════════════════════════════════════

    {
        id: 'strange_noise',
        name: 'Strange Noises',
        icon: 'volume-2',
        description: 'Odd sounds echo through the manor at night. No one is sure of the source.',
        weight: 4,
        cooldown: 7,
        condition: (ctx) => ctx.day >= 5,
        apply: () => {
            return [{
                icon: 'volume-2', label: 'Strange Noises',
                detail: 'Odd sounds echoed through the manor halls at night. The servants seem uneasy.',
                category: 'household', color: '#a888c8',
            }];
        },
    },
    {
        id: 'wandering_merchant',
        name: 'Wandering Merchant',
        icon: 'shopping-bag',
        description: 'A traveling merchant left a small gift at the manor gate.',
        weight: 4,
        cooldown: 8,
        condition: (ctx) => ctx.day >= 3,
        apply: (ctx) => {
            const gifts = ['Moonpetal Blossom', 'Ironbark Ash', 'Binding Cord'];
            const chosen = gifts[Math.floor(Math.random() * gifts.length)];
            const inv = ctx.inventory[chosen];
            if (inv) inv.quantity += 1;
            else ctx.inventory[chosen] = { name: chosen, quantity: 1, type: 'material' };
            return [{
                icon: 'shopping-bag', label: 'Wandering Merchant',
                detail: `A trader left 1 ${chosen} at the manor gate as a calling card.`,
                delta: 1, category: 'item', color: '#c8aa6e',
            }];
        },
    },
    {
        id: 'escaped_captive_rumor',
        name: 'Escape Attempt',
        icon: 'alert-triangle',
        description: 'A captured hero rattles their chains and shouts defiance through the night.',
        weight: 5,
        cooldown: 5,
        condition: (ctx) => ctx.capturedHeroCount >= 1,
        apply: (ctx) => {
            ctx.stats.household.obedience = Math.max(0, ctx.stats.household.obedience - 3);
            return [{
                icon: 'alert-triangle', label: 'Escape Attempt',
                detail: 'A captive hero rattled their chains all night. The servants are unsettled. Obedience -3.',
                delta: -3, category: 'household', color: '#d4807a',
            }];
        },
    },
];

// ── Engine ──

/** Roll daily events for the given context. Returns 0-2 events. */
export function rollDailyEvents(ctx: DailyEventContext): DailyEventResult[] {
    // Filter eligible events (condition passes + not on cooldown)
    const eligible = DAILY_EVENT_REGISTRY.filter(ev => {
        const lastDay = ctx.lastFired[ev.id];
        if (lastDay !== undefined && (ctx.day - lastDay) < ev.cooldown) return false;
        return ev.condition(ctx);
    });

    if (eligible.length === 0) return [];

    // Weighted random selection
    const totalWeight = eligible.reduce((sum, ev) => sum + ev.weight, 0);
    const results: DailyEventResult[] = [];

    // 60% chance of 1 event, 25% chance of 2 events, 15% chance of 0
    const roll = Math.random();
    const eventCount = roll < 0.15 ? 0 : roll < 0.75 ? 1 : 2;

    const used = new Set<string>();
    for (let i = 0; i < eventCount && eligible.length > used.size; i++) {
        let r = Math.random() * totalWeight;
        let chosen: DailyEventDef | null = null;
        for (const ev of eligible) {
            if (used.has(ev.id)) continue;
            r -= ev.weight;
            if (r <= 0) { chosen = ev; break; }
        }
        if (!chosen) continue;

        used.add(chosen.id);
        const effects = chosen.apply(ctx);
        ctx.lastFired[chosen.id] = ctx.day;

        results.push({
            id: chosen.id,
            name: chosen.name,
            icon: chosen.icon,
            description: chosen.description,
            effects,
        });
    }

    return results;
}
