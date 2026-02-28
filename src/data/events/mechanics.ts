// ──────────────────────────────────────────
// EVENT MECHANICS — Shared game rules & utilities
// ──────────────────────────────────────────

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
