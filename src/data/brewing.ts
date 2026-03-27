// ──────────────────────────────────────────
// BREWING ENGINE
// ──────────────────────────────────────────
// Property-based brewing system. Ingredients have element profiles
// (fire, earth, water, shadow, light). When combined, their element
// values sum up. The resulting profile is matched against recipes
// that define element thresholds. Quality depends on match strength.

import type {
    ElementType, ElementProfile, BaseLiquid, BrewOutputForm,
    BrewQuality, BrewRecipe, BrewResult, InventoryItem,
} from './items';
import { getItemDefinition, ITEM_REGISTRY } from './items';

// ──────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────

export const ALL_ELEMENTS: ElementType[] = ['fire', 'earth', 'water', 'shadow', 'light'];

export const ELEMENT_COLORS: Record<ElementType, string> = {
    fire: '#e85d3a',
    earth: '#8b7355',
    water: '#4a9eca',
    shadow: '#7b5ea7',
    light: '#e8d44d',
};

export const ELEMENT_LABELS: Record<ElementType, string> = {
    fire: 'Fire',
    earth: 'Earth',
    water: 'Water',
    shadow: 'Shadow',
    light: 'Light',
};

/** Maps base liquid to the output form it produces */
export const BASE_LIQUID_MAP: Record<BaseLiquid, BrewOutputForm> = {
    water: 'potion',
    oil: 'salve',
    spirit: 'tincture',
    smoke: 'incense',
};

/** Maps item names to their base liquid type */
export const BASE_LIQUID_ITEM_MAP: Record<string, BaseLiquid> = {
    "Alchemist's Oil": 'oil',
    'Distilled Spirit': 'spirit',
    'Smoldering Incense Base': 'smoke',
};

export const BASE_LIQUID_LABELS: Record<BaseLiquid, string> = {
    water: 'Water',
    oil: 'Oil',
    spirit: 'Spirit',
    smoke: 'Smoke',
};

export const BREW_OUTPUT_LABELS: Record<BrewOutputForm, string> = {
    potion: 'Potion',
    salve: 'Salve',
    tincture: 'Tincture',
    incense: 'Incense',
};

/** Failure item names by output form */
const FAILURE_ITEMS: Record<BrewOutputForm, string> = {
    potion: 'Murky Sludge',
    salve: 'Foul Paste',
    tincture: 'Unstable Tincture',
    incense: 'Acrid Smoke',
};

/** Max ingredients per brew */
export const MAX_BREW_INGREDIENTS = 8;

// ──────────────────────────────────────────
// RECIPE REGISTRY
// ──────────────────────────────────────────

export const BREW_RECIPE_REGISTRY: Record<string, BrewRecipe> = {
    calming_draught: {
        id: 'calming_draught',
        name: 'Calming Draught',
        resultItemName: 'Calming Draught',
        elementThresholds: { water: 5, shadow: 2 },
        minimumTotal: 8,
        dominantElement: 'water',
        allowedForms: ['potion', 'incense'],
        discoveryHint: 'A soothing blend dominated by water essence, with a touch of shadow...',
    },
    obedience_elixir: {
        id: 'obedience_elixir',
        name: 'Obedience Elixir',
        resultItemName: 'Obedience Elixir',
        elementThresholds: { shadow: 5, water: 3 },
        minimumTotal: 10,
        dominantElement: 'shadow',
        allowedForms: ['potion'],
        discoveryHint: 'Deep shadow essence bound with water. A potent and dark concoction...',
    },
    fortifying_tonic: {
        id: 'fortifying_tonic',
        name: 'Fortifying Tonic',
        resultItemName: 'Fortifying Tonic',
        elementThresholds: { earth: 5, fire: 2 },
        minimumTotal: 8,
        dominantElement: 'earth',
        allowedForms: ['potion', 'salve'],
        discoveryHint: 'Earthy strength tempered by inner fire...',
    },
    blazebright_serum: {
        id: 'blazebright_serum',
        name: 'Blazebright Serum',
        resultItemName: 'Blazebright Serum',
        elementThresholds: { fire: 5, light: 2 },
        minimumTotal: 9,
        dominantElement: 'fire',
        allowedForms: ['potion', 'tincture'],
        discoveryHint: 'Fierce fire illuminated by light. Handle with care...',
    },
    clarity_philter: {
        id: 'clarity_philter',
        name: 'Clarity Philter',
        resultItemName: 'Clarity Philter',
        elementThresholds: { light: 5, water: 2 },
        minimumTotal: 8,
        dominantElement: 'light',
        allowedForms: ['potion', 'tincture'],
        discoveryHint: 'Pure light flowing through water. Crystal clear...',
    },
    binding_salve: {
        id: 'binding_salve',
        name: 'Binding Salve',
        resultItemName: 'Binding Salve',
        elementThresholds: { shadow: 3, earth: 3 },
        minimumTotal: 9,
        allowedForms: ['salve'],
        discoveryHint: 'Shadow and earth intertwined. Apply carefully...',
    },
    mindmist_incense: {
        id: 'mindmist_incense',
        name: 'Mindmist Incense',
        resultItemName: 'Mindmist Incense',
        elementThresholds: { shadow: 3, light: 3 },
        minimumTotal: 8,
        allowedForms: ['incense'],
        discoveryHint: 'Shadow and light in balance. The smoke reveals truths...',
    },
    vitality_balm: {
        id: 'vitality_balm',
        name: 'Vitality Balm',
        resultItemName: 'Vitality Balm',
        elementThresholds: { earth: 3, water: 3, fire: 1 },
        minimumTotal: 9,
        allowedForms: ['salve', 'potion'],
        discoveryHint: 'Earth and water warmed by fire. Life-giving...',
    },
};

// ──────────────────────────────────────────
// BREW ENGINE FUNCTIONS
// ──────────────────────────────────────────

/** Sum multiple element profiles into one */
export function sumElementProfiles(profiles: ElementProfile[]): ElementProfile {
    const result: ElementProfile = {};
    for (const profile of profiles) {
        for (const element of ALL_ELEMENTS) {
            const val = profile[element];
            if (val) {
                result[element] = (result[element] || 0) + val;
            }
        }
    }
    return result;
}

/** Get the total element sum of a profile */
export function getElementTotal(profile: ElementProfile): number {
    let total = 0;
    for (const element of ALL_ELEMENTS) {
        total += profile[element] || 0;
    }
    return total;
}

/** Get the dominant element (highest value) in a profile */
export function getDominantElement(profile: ElementProfile): ElementType | null {
    let best: ElementType | null = null;
    let bestVal = 0;
    for (const element of ALL_ELEMENTS) {
        const val = profile[element] || 0;
        if (val > bestVal) {
            bestVal = val;
            best = element;
        }
    }
    return best;
}

/**
 * Score how well a profile matches a recipe (0-100).
 * Checks: threshold satisfaction, total minimum, dominant element, form compatibility.
 */
export function getRecipeMatchScore(
    profile: ElementProfile,
    recipe: BrewRecipe,
    outputForm: BrewOutputForm,
): number {
    // Must be an allowed form
    if (!recipe.allowedForms.includes(outputForm)) return 0;

    // Check dominant element requirement
    if (recipe.dominantElement) {
        const dominant = getDominantElement(profile);
        if (dominant !== recipe.dominantElement) return 0;
    }

    const total = getElementTotal(profile);

    // Check minimum total
    if (total < recipe.minimumTotal * 0.5) return 0; // too far below minimum

    // Score each threshold
    const thresholdEntries = Object.entries(recipe.elementThresholds) as [ElementType, number][];
    if (thresholdEntries.length === 0) return 0;

    let thresholdScore = 0;
    for (const [element, required] of thresholdEntries) {
        const have = profile[element] || 0;
        const ratio = Math.min(have / required, 1.5); // cap at 150% satisfaction
        thresholdScore += ratio;
    }
    thresholdScore = (thresholdScore / thresholdEntries.length) * 70; // 70% weight on thresholds

    // Score total element minimum
    const totalRatio = Math.min(total / recipe.minimumTotal, 1.5);
    const totalScore = totalRatio * 30; // 30% weight on total

    return Math.min(Math.round(thresholdScore + totalScore), 100);
}

/** Convert a match score to a quality tier */
export function getBrewQuality(score: number): BrewQuality {
    if (score >= 90) return 'potent';
    if (score >= 70) return 'standard';
    if (score >= 50) return 'weak';
    return 'failed';
}

/** Quality tier flavor text */
function getQualityFeedback(quality: BrewQuality, recipeName: string): string {
    switch (quality) {
        case 'potent':
            return `A perfect brew! The ${recipeName} radiates with power.`;
        case 'standard':
            return `A solid ${recipeName}. It should serve its purpose well.`;
        case 'weak':
            return `A weak ${recipeName}. The essences didn't quite align.`;
        case 'failed':
            return 'The ingredients fizzle and collapse into useless sludge.';
    }
}

/** Get all ingredient items from the registry */
export function getAllIngredients(): string[] {
    return Object.values(ITEM_REGISTRY)
        .filter(item => item.type === 'ingredient' && item.elementProfile)
        .map(item => item.name);
}

/**
 * Resolve a brew attempt. Sums ingredient elements, finds best matching recipe,
 * and returns the result.
 */
export function resolveBrew(
    ingredientNames: string[],
    baseLiquid: BaseLiquid,
    discoveredRecipes: string[],
): BrewResult {
    const outputForm = BASE_LIQUID_MAP[baseLiquid];

    // Gather element profiles
    const profiles: ElementProfile[] = [];
    const consumed: { itemName: string; quantity: number }[] = [];

    // Count ingredient quantities
    const ingredientCounts: Record<string, number> = {};
    for (const name of ingredientNames) {
        ingredientCounts[name] = (ingredientCounts[name] || 0) + 1;
    }

    for (const [name, qty] of Object.entries(ingredientCounts)) {
        const item = getItemDefinition(name);
        if (item.elementProfile) {
            // Each unit contributes its full profile
            for (let i = 0; i < qty; i++) {
                profiles.push(item.elementProfile);
            }
        }
        consumed.push({ itemName: name, quantity: qty });
    }

    const combinedProfile = sumElementProfiles(profiles);

    // Score against all recipes
    let bestRecipe: BrewRecipe | null = null;
    let bestScore = 0;

    for (const recipe of Object.values(BREW_RECIPE_REGISTRY)) {
        const score = getRecipeMatchScore(combinedProfile, recipe, outputForm);
        if (score > bestScore) {
            bestScore = score;
            bestRecipe = recipe;
        }
    }

    const quality = getBrewQuality(bestScore);

    if (quality === 'failed' || !bestRecipe) {
        return {
            success: false,
            quality: 'failed',
            resultItemName: FAILURE_ITEMS[outputForm],
            outputForm,
            isNewDiscovery: false,
            matchScore: bestScore,
            feedback: getQualityFeedback('failed', ''),
            elementProfile: combinedProfile,
            ingredientsConsumed: consumed,
        };
    }

    const isNew = !discoveredRecipes.includes(bestRecipe.id);

    return {
        success: true,
        quality,
        resultItemName: bestRecipe.resultItemName,
        outputForm,
        isNewDiscovery: isNew,
        matchScore: bestScore,
        feedback: getQualityFeedback(quality, bestRecipe.name),
        elementProfile: combinedProfile,
        ingredientsConsumed: consumed,
    };
}
