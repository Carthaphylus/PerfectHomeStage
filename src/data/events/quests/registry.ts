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

import {
    KOVA_QUEST,
    QUEST_KOVA_01_WOLFPACK,
    QUEST_KOVA_02_TERRITORY,
    QUEST_KOVA_03_SIGHTING,
    QUEST_KOVA_04_CHALLENGE,
    buildKovaConfrontation,
} from './barbarian';

import {
    VERIDIAN_QUEST,
    QUEST_VERIDIAN_01_SERMON,
    QUEST_VERIDIAN_02_DEBATE,
    QUEST_VERIDIAN_03_TRAIL,
    QUEST_VERIDIAN_04_SHRINE,
    buildVeridianConfrontation,
} from './cleric';

import {
    PERVIS_QUEST,
    QUEST_PERVIS_01_INTEL,
    QUEST_PERVIS_02_PERIMETER,
    QUEST_PERVIS_03_INFILTRATE,
    QUEST_PERVIS_04_SABOTAGE,
    QUEST_PERVIS_05_ADVANCE,
    buildPervisConfrontation,
} from './leader';

/** All quest definitions */
export const ALL_HERO_QUESTS: QuestDefinition[] = [
    SABLE_QUEST,
    KOVA_QUEST,
    VERIDIAN_QUEST,
    PERVIS_QUEST,
];

/** All events that belong to quests — registered at startup */
export function buildQuestEvents(): EventDefinition[] {
    return [
        // Sable
        QUEST_SABLE_01_RUMORS,
        QUEST_SABLE_02_STAKEOUT,
        QUEST_SABLE_03_CHASE,
        QUEST_SABLE_04_DEN,
        buildSableConfrontation(),
        // Kova
        QUEST_KOVA_01_WOLFPACK,
        QUEST_KOVA_02_TERRITORY,
        QUEST_KOVA_03_SIGHTING,
        QUEST_KOVA_04_CHALLENGE,
        buildKovaConfrontation(),
        // Veridian
        QUEST_VERIDIAN_01_SERMON,
        QUEST_VERIDIAN_02_DEBATE,
        QUEST_VERIDIAN_03_TRAIL,
        QUEST_VERIDIAN_04_SHRINE,
        buildVeridianConfrontation(),
        // Pervis
        QUEST_PERVIS_01_INTEL,
        QUEST_PERVIS_02_PERIMETER,
        QUEST_PERVIS_03_INFILTRATE,
        QUEST_PERVIS_04_SABOTAGE,
        QUEST_PERVIS_05_ADVANCE,
        buildPervisConfrontation(),
    ];
}
