// ──────────────────────────────────────────
// QUEST REGISTRY — All hero quest definitions
// ──────────────────────────────────────────
import type { QuestDefinition, EventDefinition } from '../../types';

import {
    SABLE_QUEST,
    QUEST_SABLE_01_RUMORS,
    QUEST_SABLE_02_STAKEOUT,
    QUEST_SABLE_03_CHASE,
    QUEST_SABLE_04_DEN,
    buildSableConfrontation,
} from './sable';

/** All quest definitions */
export const ALL_HERO_QUESTS: QuestDefinition[] = [
    SABLE_QUEST,
    // Veridian, Kova, Pervis quests to be added
];

/** All events that belong to quests — registered at startup */
export function buildQuestEvents(): EventDefinition[] {
    return [
        QUEST_SABLE_01_RUMORS,
        QUEST_SABLE_02_STAKEOUT,
        QUEST_SABLE_03_CHASE,
        QUEST_SABLE_04_DEN,
        buildSableConfrontation(),
    ];
}
