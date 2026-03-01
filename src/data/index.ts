// ──────────────────────────────────────────
// Data Module — Barrel Export
// ──────────────────────────────────────────

// Types & interfaces
export * from './types';

// Stat system
export * from './stats';

// Trait system
export * from './traits';

// Role system
export * from './roles';

// Character data
export * from './characters';

// Item system
export * from './items';

// Event system (common mechanics, brainwashing, exploration)
export { rollSkillCheck } from './events/mechanics';
export * from './events/brainwashing/conditioning';
export * from './events/brainwashing/conversion';
export * from './events/brainwashing/event';
export * from './events/exploration/events';
export * from './events/exploration/capture';

// Task system
export * from './tasks';

// AI Chat Change system
export * from './chatChanges';

// NPC Generation
export * from './npcGeneration';

// Quest system
export * from './events/quests/registry';
