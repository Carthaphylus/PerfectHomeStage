// ──────────────────────────────────────────
// STAT SYSTEM — Letter Grades (F- to S++)
// ──────────────────────────────────────────

export type StatName = 'prowess' | 'expertise' | 'attunement' | 'presence' | 'discipline' | 'insight';

export interface StatDefinition {
    name: StatName;
    label: string;
    description: string;
    icon: string;
}

export const STAT_DEFINITIONS: StatDefinition[] = [
    {
        name: 'prowess',
        label: 'Prowess',
        description: 'Physical capability - combat, labor, athletics',
        icon: 'swords',
    },
    {
        name: 'expertise',
        label: 'Expertise',
        description: 'Skill and craftsmanship - cooking, brewing, crafting',
        icon: 'wrench',
    },
    {
        name: 'attunement',
        label: 'Attunement',
        description: 'Magical sensitivity - rituals, potions, mysticism',
        icon: 'sparkles',
    },
    {
        name: 'presence',
        label: 'Presence',
        description: 'Social influence - charm, intimidation, leadership',
        icon: 'crown',
    },
    {
        name: 'discipline',
        label: 'Discipline',
        description: 'Self-control and focus - obedience, reliability',
        icon: 'target',
    },
    {
        name: 'insight',
        label: 'Insight',
        description: 'Perception and learning - teaching, investigation',
        icon: 'search',
    },
];

// Letter grade tiers (22 grades: F- to S++)
export const GRADE_TIERS = [
    'F-', 'F', 'F+',
    'E-', 'E', 'E+',
    'D-', 'D', 'D+',
    'C-', 'C', 'C+',
    'B-', 'B', 'B+',
    'A-', 'A', 'A+',
    'S-', 'S', 'S+', 'S++',
] as const;

export type StatGrade = typeof GRADE_TIERS[number];

/** Convert 0-100 numeric value to letter grade */
export function numberToGrade(value: number): StatGrade {
    const clamped = Math.max(0, Math.min(100, value));
    
    if (clamped <= 3) return 'F-';
    if (clamped <= 7) return 'F';
    if (clamped <= 11) return 'F+';
    if (clamped <= 15) return 'E-';
    if (clamped <= 19) return 'E';
    if (clamped <= 23) return 'E+';
    if (clamped <= 27) return 'D-';
    if (clamped <= 31) return 'D';
    if (clamped <= 35) return 'D+';
    if (clamped <= 39) return 'C-';
    if (clamped <= 43) return 'C';
    if (clamped <= 47) return 'C+';
    if (clamped <= 51) return 'B-';
    if (clamped <= 55) return 'B';
    if (clamped <= 59) return 'B+';
    if (clamped <= 63) return 'A-';
    if (clamped <= 67) return 'A';
    if (clamped <= 71) return 'A+';
    if (clamped <= 79) return 'S-';
    if (clamped <= 89) return 'S';
    if (clamped <= 96) return 'S+';
    return 'S++';
}

/** Convert letter grade to numeric midpoint (for reverse calculations) */
export function gradeToNumber(grade: StatGrade): number {
    const gradeMap: Record<StatGrade, number> = {
        'F-': 2, 'F': 6, 'F+': 10,
        'E-': 14, 'E': 18, 'E+': 22,
        'D-': 26, 'D': 30, 'D+': 34,
        'C-': 38, 'C': 42, 'C+': 46,
        'B-': 50, 'B': 54, 'B+': 58,
        'A-': 62, 'A': 66, 'A+': 70,
        'S-': 76, 'S': 85, 'S+': 93, 'S++': 99,
    };
    return gradeMap[grade] || 50;
}

/** Get color for stat grade tier */
export function getGradeColor(grade: StatGrade): string {
    const tier = grade.charAt(0);
    const colorMap: Record<string, string> = {
        'F': '#e63946',
        'E': '#77669b',
        'D': '#4e659e',
        'C': '#298f7f',
        'B': '#228417',
        'A': '#ff9100',
        'S': '#ffdd00',
    };
    return colorMap[tier] || '#888';
}

export function getStatColor(statName: StatName): string {
    const colorMap: Record<StatName, string> = {
        'prowess': '#c74e4e',
        'expertise': '#d87833',
        'attunement': '#9971bf',
        'presence': '#cebe7d',
        'discipline': '#4fba83',
        'insight': '#6ca0db',
    };
    return colorMap[statName] || '#888';
}
