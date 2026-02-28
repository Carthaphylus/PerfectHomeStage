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

// Event system (common mechanics)
export { rollSkillCheck } from './events/mechanics';

// Brainwashing system (conditioning, conversion, event)
export * from './brainwashing/conditioning';
export * from './brainwashing/conversion';
export * from './brainwashing/event';

// Exploration system (exploration events, capture event)
export * from './exploration/events';
export * from './exploration/capture';

// Task system
export * from './tasks';

// AI Chat Change system
export * from './chatChanges';

// NPC Generation
export * from './npcGeneration';
