import React, { FC } from 'react';

interface CustomIconProps {
    size?: number | string;
    className?: string;
    color?: string;
}

/** Base SVG props — stroke-only (no fill), single color */
const svg = (size: number | string, className: string, color?: string) => ({
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color || 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
});

/** Colored SVG props — faces use their own fill/stroke, no inherited color */
const svgColored = (size: number | string, className: string) => ({
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'none',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
});

/** Stack of 3 logs (end view, triangular pile) */
export const LogIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Bottom-left log */}
        <circle cx="7" cy="16" r="4.5" fill="#8b6840" stroke="#5c3d1e" />
        <circle cx="7" cy="16" r="1.5" fill="#c8a878" stroke="#8b6840" />
        {/* Bottom-right log */}
        <circle cx="17" cy="16" r="4.5" fill="#9c7548" stroke="#5c3d1e" />
        <circle cx="17" cy="16" r="1.5" fill="#d4b888" stroke="#9c7548" />
        {/* Top log */}
        <circle cx="12" cy="8" r="4.5" fill="#a88050" stroke="#5c3d1e" />
        <circle cx="12" cy="8" r="1.5" fill="#dcc898" stroke="#a88050" />
    </svg>
);

/** Angular boulder / rock chunk with shaded faces */
export const RockIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Back-right face — lightest */}
        <path d="M15 3 L21 7 L22 14 L13 12 Z" fill="#b0aaaa" stroke="#6a6464" />
        {/* Top-left face — mid tone */}
        <path d="M8 5 L15 3 L13 12 Z" fill="#9a9494" stroke="#6a6464" />
        {/* Left face — darker */}
        <path d="M3 10 L8 5 L13 12 L8 20 L4 17 Z" fill="#807878" stroke="#6a6464" />
        {/* Bottom-right face — darkest */}
        <path d="M13 12 L22 14 L18 20 L8 20 Z" fill="#706868" stroke="#6a6464" />
    </svg>
);

/** Diagonal metal ingot bar — iron colored with shaded faces */
export const IngotIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Top face — polished iron, catches light */}
        <path d="M15 4 L22 8 L21 11 L3 14 L3 11 Z" fill="#a8b0b8" stroke="#4a5560" />
        {/* Front face — darker iron body */}
        <path d="M3 14 L21 11 L21 14 L9 21 L2 17 Z" fill="#707880" stroke="#4a5560" />
        {/* Left end face */}
        <path d="M3 11 L3 14 L2 17 Z" fill="#606870" stroke="#4a5560" />
        {/* Right end face */}
        <path d="M22 8 L21 11 L21 14 Z" fill="#889098" stroke="#4a5560" />
    </svg>
);

/** Folded velvet cloth with layered folds and wavy drape edge */
export const FabricIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Top fold — lightest velvet */}
        <path d="M4 3 L20 3 L20 8 L4 8 Z" fill="#9b3050" stroke="#5a1830" />
        {/* Middle fold — mid tone */}
        <path d="M4 8 L20 8 L20 13 L4 13 Z" fill="#802848" stroke="#5a1830" />
        {/* Bottom drape — darkest with wavy edge */}
        <path d="M4 13 L20 13 L20 18 C17 15 14 20 12 18 C10 15 7 20 4 18 Z" fill="#681840" stroke="#5a1830" />
    </svg>
);

/** Polished marble slab — flat isometric tile with per-face coloring */
export const MarbleCubeIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Top face — polished white marble */}
        <path d="M12 4 L22 10 L12 16 L2 10 Z" fill="#e8e0d8" stroke="#8a8078" />
        {/* Front-left face — mid shadow */}
        <path d="M2 10 L2 14 L12 20 L12 16 Z" fill="#c0b8b0" stroke="#8a8078" />
        {/* Front-right face — darker shadow */}
        <path d="M22 10 L22 14 L12 20 L12 16 Z" fill="#a8a098" stroke="#8a8078" />
        {/* Marble vein across top face */}
        <line x1="7" y1="7" x2="17" y2="13" stroke="#c8c0b8" strokeWidth="1" />
    </svg>
);

/** Stone tablet with glowing carved rune marks */
export const RuneStoneIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Stone body */}
        <rect x="5" y="2" width="14" height="20" rx="2" fill="#4a4450" stroke="#2e2a34" />
        {/* Glowing rune marks */}
        <path d="M9 7 L9 12 L12 9" fill="none" stroke="#60b8ff" strokeWidth="1.5" />
        <path d="M15 8 L15 13" fill="none" stroke="#60b8ff" strokeWidth="1.5" />
        <path d="M9 16 L15 16 L12 19" fill="none" stroke="#60b8ff" strokeWidth="1.5" />
    </svg>
);

/** Crystal prism shard — tall pointed crystal with facets and inner glow */
export const CrystalIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Front face — main body */}
        <path d="M11 2 L6 9 L7 21 L14 21 L14 7 Z" fill="#8858b8" stroke="none" />
        {/* Side face — lighter, catches light */}
        <path d="M14 7 L18 10 L17 21 L14 21 Z" fill="#a070d0" stroke="none" />
        {/* Top facet bevel on front face */}
        <path d="M11 2 L14 7 L10 9 L6 9 Z" fill="#7448a0" stroke="none" />
        {/* Inner glow facet — bright highlight on front */}
        <path d="M10 9 L9 16 L12 17 L14 7 Z" fill="#9870c8" stroke="none" />
        {/* Outline */}
        <path d="M11 2 L6 9 L7 21 L17 21 L18 10 L14 7 Z" fill="none" stroke="#3a1860" />
        {/* Internal edges */}
        <line x1="14" y1="7" x2="14" y2="21" stroke="#3a1860" />
        <line x1="11" y1="2" x2="14" y2="7" stroke="#3a1860" />
        <line x1="6" y1="9" x2="10" y2="9" stroke="#3a1860" strokeWidth="1" />
        <line x1="10" y1="9" x2="14" y2="7" stroke="#3a1860" strokeWidth="1" />
    </svg>
);

/** Golden pendant with hypnotic spiral center */
export const HypnoticPendantIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Chain */}
        <path d="M8 2 L12 6 L16 2" fill="none" stroke="#c8a050" strokeWidth="1.5" />
        {/* Gem body — diamond shape */}
        <path d="M12 6 L6 13 L12 22 L18 13 Z" fill="none" stroke="#8a6820" />
        {/* Left facet */}
        <path d="M12 6 L6 13 L12 22 Z" fill="#d4a830" stroke="none" />
        {/* Right facet */}
        <path d="M12 6 L18 13 L12 22 Z" fill="#e8c050" stroke="none" />
        {/* Spiral in center */}
        <path d="M12 11 Q14 11 14 13 Q14 15 12 15 Q10 15 10 13.5" fill="none" stroke="#8a6820" strokeWidth="1.5" />
    </svg>
);

/** Golden headset visor with spiral lens */
export const ArcaneVisorIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Headband */}
        <path d="M2 10 Q2 4 12 4 Q22 4 22 10" fill="none" stroke="#c8a050" strokeWidth="2" />
        {/* Left earpiece */}
        <rect x="1" y="9" width="4" height="5" rx="1" fill="#d4a830" stroke="#8a6820" />
        {/* Right earpiece */}
        <rect x="19" y="9" width="4" height="5" rx="1" fill="#d4a830" stroke="#8a6820" />
        {/* Visor lens — left */}
        <circle cx="8" cy="15" r="4" fill="#4a3010" stroke="#8a6820" />
        {/* Visor lens — right */}
        <circle cx="16" cy="15" r="4" fill="#4a3010" stroke="#8a6820" />
        {/* Spiral in left lens */}
        <path d="M8 13.5 Q9.5 13.5 9.5 15 Q9.5 16.5 8 16.5" fill="none" stroke="#f0a830" strokeWidth="1" />
        {/* Spiral in right lens */}
        <path d="M16 13.5 Q17.5 13.5 17.5 15 Q17.5 16.5 16 16.5" fill="none" stroke="#f0a830" strokeWidth="1" />
        {/* Bridge */}
        <line x1="12" y1="14" x2="12" y2="16" stroke="#8a6820" strokeWidth="1.5" />
    </svg>
);

/** Ornate collar ring with rune lock */
export const ServantCollarIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Collar band — thick oval */}
        <ellipse cx="12" cy="12" rx="9" ry="7" fill="#3a3040" stroke="#2a2030" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="6" ry="4.5" fill="#1e1828" stroke="#2a2030" strokeWidth="1.5" />
        {/* Rune engravings on band */}
        <line x1="4" y1="10" x2="5" y2="14" stroke="#7060a0" strokeWidth="1" />
        <line x1="19" y1="10" x2="20" y2="14" stroke="#7060a0" strokeWidth="1" />
        {/* Lock at front center */}
        <rect x="10" y="16" width="4" height="4" rx="0.5" fill="#c8a050" stroke="#8a6820" />
        <circle cx="12" cy="18.5" r="0.8" fill="#8a6820" stroke="none" />
    </svg>
);

/** Chain link shackles with arcane glow */
export const EnchantedShacklesIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Left cuff */}
        <path d="M3 7 Q3 3 7 3 Q11 3 11 7 Q11 11 7 11 Q3 11 3 7 Z" fill="#5a5060" stroke="#3a3040" />
        <path d="M5 7 Q5 5 7 5 Q9 5 9 7 Q9 9 7 9 Q5 9 5 7 Z" fill="#1e1828" stroke="#3a3040" />
        {/* Right cuff */}
        <path d="M13 13 Q13 9 17 9 Q21 9 21 13 Q21 17 17 17 Q13 17 13 13 Z" fill="#5a5060" stroke="#3a3040" />
        <path d="M15 13 Q15 11 17 11 Q19 11 19 13 Q19 15 17 15 Q15 15 15 13 Z" fill="#1e1828" stroke="#3a3040" />
        {/* Chain links connecting */}
        <path d="M9 9 L13 11" fill="none" stroke="#5a5060" strokeWidth="2" />
        <path d="M10 8 L14 12" fill="none" stroke="#3a3040" strokeWidth="1" />
        {/* Arcane glow on cuffs */}
        <path d="M5 3.5 L7 2 L9 3.5" fill="none" stroke="#b882ff" strokeWidth="1" />
        <path d="M15 9.5 L17 8 L19 9.5" fill="none" stroke="#b882ff" strokeWidth="1" />
    </svg>
);

/** Coiled magical binding rope */
export const BindingCordIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Coiled rope body */}
        <ellipse cx="12" cy="14" rx="8" ry="5" fill="#8a7860" stroke="#5a4830" />
        <ellipse cx="12" cy="11" rx="8" ry="5" fill="#a09070" stroke="#5a4830" />
        <ellipse cx="12" cy="8" rx="8" ry="5" fill="#b8a888" stroke="#5a4830" />
        {/* Rope end dangling */}
        <path d="M18 10 Q20 12 19 16" fill="none" stroke="#8a7860" strokeWidth="1.5" />
        {/* Rope texture lines */}
        <line x1="6" y1="7" x2="8" y2="9" stroke="#907850" strokeWidth="1" />
        <line x1="14" y1="6" x2="16" y2="8" stroke="#907850" strokeWidth="1" />
    </svg>
);

/** Golden potion flask with swirling liquid */
export const ObedienceElixirIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Flask neck */}
        <rect x="10" y="2" width="4" height="5" rx="1" fill="#c0b0a0" stroke="#6a6060" />
        {/* Cork */}
        <rect x="10.5" y="1" width="3" height="2" rx="0.5" fill="#a08060" stroke="#6a4830" />
        {/* Flask body */}
        <path d="M10 7 L6 12 L6 19 Q6 22 12 22 Q18 22 18 19 L18 12 L14 7 Z" fill="#d4a830" stroke="#8a6820" />
        {/* Liquid highlight */}
        <path d="M8 13 L8 18 Q8 20 12 20 Q14 20 14 18 L14 14" fill="#e8c050" stroke="none" />
        {/* Spiral in liquid */}
        <path d="M11 14 Q13 14 13 16 Q13 18 11 18" fill="none" stroke="#8a6820" strokeWidth="1" />
    </svg>
);

/** Burning incense stick with spiral smoke */
export const SpiralIncenseIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Incense holder base */}
        <path d="M4 21 L20 21 L18 19 L6 19 Z" fill="#6a6060" stroke="#4a4040" />
        {/* Incense stick */}
        <line x1="12" y1="19" x2="12" y2="12" stroke="#a08060" strokeWidth="2" />
        {/* Ember tip */}
        <circle cx="12" cy="11.5" r="1" fill="#f08030" stroke="none" />
        {/* Smoke wisps — spiral rising */}
        <path d="M12 10 Q15 8 12 6" fill="none" stroke="#c8a868" strokeWidth="1.5" strokeOpacity="0.8" />
        <path d="M12 6 Q9 4 12 2" fill="none" stroke="#c8a868" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
);

/** Leafy herb with crescent moon glow */
export const DreamcatcherHerbIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Stem */}
        <path d="M12 22 L12 10" fill="none" stroke="#4a7838" strokeWidth="1.5" />
        {/* Left leaf */}
        <path d="M12 16 Q6 14 5 10 Q8 12 12 13" fill="#5a9848" stroke="#3a6828" />
        {/* Right leaf */}
        <path d="M12 13 Q18 11 19 7 Q16 9 12 10" fill="#68a858" stroke="#3a6828" />
        {/* Small top leaf */}
        <path d="M12 10 Q15 7 14 5 Q13 7 12 8" fill="#78b868" stroke="#3a6828" />
        {/* Moon glow — small crescent top-right */}
        <path d="M19 3 Q21 5 19 7 Q20 5.5 19 3 Z" fill="#a0c0f0" stroke="none" />
    </svg>
);

/** Glowing brain fragment — extracted memory shard */
export const MemoryShardIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Brain left hemisphere */}
        <path d="M12 5 Q6 5 5 9 Q4 12 6 14 Q5 16 7 17 Q8 19 12 19" fill="#c8a050" stroke="#8a6820" />
        {/* Brain right hemisphere */}
        <path d="M12 5 Q18 5 19 9 Q20 12 18 14 Q19 16 17 17 Q16 19 12 19" fill="#d4b060" stroke="#8a6820" />
        {/* Center fissure */}
        <line x1="12" y1="5" x2="12" y2="19" stroke="#8a6820" strokeWidth="1" />
        {/* Brain folds — left */}
        <path d="M7 9 Q9 10 10 8" fill="none" stroke="#8a6820" strokeWidth="1" />
        <path d="M6 13 Q9 13 10 11" fill="none" stroke="#8a6820" strokeWidth="1" />
        {/* Brain folds — right */}
        <path d="M17 9 Q15 10 14 8" fill="none" stroke="#8a6820" strokeWidth="1" />
        <path d="M18 13 Q15 13 14 11" fill="none" stroke="#8a6820" strokeWidth="1" />
        {/* Golden sparkle top-right */}
        <line x1="20" y1="2" x2="20" y2="6" stroke="#f0a830" strokeWidth="1" />
        <line x1="18" y1="4" x2="22" y2="4" stroke="#f0a830" strokeWidth="1" />
        {/* Small sparkle bottom-left */}
        <line x1="3" y1="18" x2="3" y2="20" stroke="#f0a830" strokeWidth="0.8" />
        <line x1="2" y1="19" x2="4" y2="19" stroke="#f0a830" strokeWidth="0.8" />
    </svg>
);

/** Blue arcane mana crystal shard */
export const ManaCrystalIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Front face */}
        <path d="M11 2 L6 9 L7 21 L14 21 L14 7 Z" fill="#3878c8" stroke="none" />
        {/* Side face — lighter */}
        <path d="M14 7 L18 10 L17 21 L14 21 Z" fill="#50a0e8" stroke="none" />
        {/* Top facet bevel */}
        <path d="M11 2 L14 7 L10 9 L6 9 Z" fill="#2860a8" stroke="none" />
        {/* Inner glow facet */}
        <path d="M10 9 L9 16 L12 17 L14 7 Z" fill="#4890d8" stroke="none" />
        {/* Outline */}
        <path d="M11 2 L6 9 L7 21 L17 21 L18 10 L14 7 Z" fill="none" stroke="#183868" />
        {/* Internal edges */}
        <line x1="14" y1="7" x2="14" y2="21" stroke="#183868" />
        <line x1="11" y1="2" x2="14" y2="7" stroke="#183868" />
        <line x1="6" y1="9" x2="10" y2="9" stroke="#183868" strokeWidth="1" />
        <line x1="10" y1="9" x2="14" y2="7" stroke="#183868" strokeWidth="1" />
    </svg>
);

// ──────────────────────────────────────────
// Brewing Ingredient Icons
// ──────────────────────────────────────────

/** Pale moonlit flower — bold petals with moon accent */
export const MoonpetalIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Stem */}
        <line x1="12" y1="22" x2="12" y2="13" stroke="#3a6828" strokeWidth="2" />
        {/* Leaf on stem */}
        <path d="M12 18 Q8 16 7 13" fill="#5a9848" stroke="#3a6828" strokeWidth="1" />
        {/* Left petal */}
        <path d="M12 11 Q5 9 4 3 Q9 7 12 9" fill="#c8c0e0" stroke="#7070a0" strokeWidth="1" />
        {/* Right petal */}
        <path d="M12 9 Q19 7 20 1 Q15 5 12 8" fill="#d8d0e8" stroke="#7070a0" strokeWidth="1" />
        {/* Center petal — tallest */}
        <path d="M12 8 Q9 2 12 0 Q15 2 12 8" fill="#e0d8f0" stroke="#7070a0" strokeWidth="1" />
        {/* Flower center */}
        <circle cx="12" cy="10" r="2" fill="#e8d44d" stroke="#b0a030" strokeWidth="1" />
    </svg>
);

/** Gnarled fire-veined root — bold S-curve with branches */
export const EmbervineIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Main root body — thick S-curve */}
        <path d="M14 1 Q9 4 8 9 Q7 14 9 18 Q11 22 13 23" fill="#8b6840" stroke="#4a3018" strokeWidth="1.5" />
        {/* Right branch */}
        <path d="M10 7 Q15 5 18 7 Q16 9 13 8" fill="#9c7548" stroke="#5c3d1e" strokeWidth="1" />
        {/* Left branch */}
        <path d="M8 14 Q4 13 3 15 Q5 16 8 15" fill="#9c7548" stroke="#5c3d1e" strokeWidth="1" />
        {/* Fire vein — main */}
        <path d="M12 3 Q10 8 10 13 Q10 17 11 21" fill="none" stroke="#e85d3a" strokeWidth="1.5" />
        {/* Fire vein — branch */}
        <path d="M11 8 Q14 7 16 7" fill="none" stroke="#e85d3a" strokeWidth="1" />
        {/* Ember glow at top */}
        <circle cx="13" cy="2" r="2" fill="#f08030" stroke="#e85d3a" strokeWidth="1" />
    </svg>
);

/** Dark obsidian shards in a pile */
export const ObsidianDustIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Base mound */}
        <path d="M2 21 Q6 13 12 11 Q18 13 22 21 Z" fill="#2a2030" stroke="#1a1020" strokeWidth="1" />
        {/* Tall shard — left */}
        <path d="M8 18 L7 10 L10 8 L11 18 Z" fill="#3a2840" stroke="#7b5ea7" strokeWidth="1" />
        {/* Tall shard — right */}
        <path d="M13 17 L14 7 L17 9 L16 17 Z" fill="#4a3858" stroke="#7b5ea7" strokeWidth="1" />
        {/* Small shard — center */}
        <path d="M10 19 L11 14 L13 14 L13 19 Z" fill="#352545" stroke="#5a4070" strokeWidth="1" />
        {/* Fire glint */}
        <circle cx="14" cy="8" r="1.2" fill="#e85d3a" stroke="none" />
    </svg>
);

/** Warm golden crystal shard — sunstone */
export const SunstoneIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Front face */}
        <path d="M11 2 L6 9 L7 21 L14 21 L14 7 Z" fill="#e8b830" stroke="none" />
        {/* Side face */}
        <path d="M14 7 L18 10 L17 21 L14 21 Z" fill="#f0d050" stroke="none" />
        {/* Top bevel */}
        <path d="M11 2 L14 7 L10 9 L6 9 Z" fill="#c89820" stroke="none" />
        {/* Inner glow facet */}
        <path d="M10 9 L9 16 L12 17 L14 7 Z" fill="#e8c840" stroke="none" />
        {/* Outline */}
        <path d="M11 2 L6 9 L7 21 L17 21 L18 10 L14 7 Z" fill="none" stroke="#886018" strokeWidth="1" />
        {/* Internal edges */}
        <line x1="14" y1="7" x2="14" y2="21" stroke="#886018" />
        <line x1="11" y1="2" x2="14" y2="7" stroke="#886018" />
    </svg>
);

/** Wet moss clump with water drops */
export const MarshwaterMossIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Base mound */}
        <ellipse cx="12" cy="17" rx="9" ry="5" fill="#3a6030" stroke="#2a4820" strokeWidth="1" />
        {/* Upper moss dome */}
        <ellipse cx="12" cy="13" rx="7" ry="5" fill="#4a7838" stroke="#2a4820" strokeWidth="1" />
        {/* Moss tufts — left */}
        <path d="M7 10 Q6 6 9 8" fill="none" stroke="#68a858" strokeWidth="2" />
        {/* Moss tufts — right */}
        <path d="M15 9 Q14 5 17 7" fill="none" stroke="#68a858" strokeWidth="2" />
        {/* Water drops */}
        <path d="M18 11 L19 9 L20 11 Q20 12.5 19 12.5 Q18 12.5 18 11 Z" fill="#4a9eca" stroke="#2870a0" strokeWidth="1" />
        <path d="M4 13 L5 11.5 L6 13 Q6 14 5 14 Q4 14 4 13 Z" fill="#4a9eca" stroke="#2870a0" strokeWidth="1" />
    </svg>
);

/** Dark vial of nightshade — skull-shaped bottle */
export const NightshadeIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork */}
        <rect x="10" y="1" width="4" height="3" rx="1" fill="#5a3050" stroke="#3a1830" strokeWidth="1" />
        {/* Vial neck */}
        <rect x="10" y="4" width="4" height="3" rx="0.5" fill="#4a3060" stroke="#2a1840" strokeWidth="1" />
        {/* Vial body — bulbous */}
        <path d="M10 7 Q6 9 6 14 Q6 20 12 21 Q18 20 18 14 Q18 9 14 7 Z" fill="#3a2050" stroke="#2a1040" strokeWidth="1" />
        {/* Dark liquid fill */}
        <path d="M8 11 Q8 18 12 19 Q16 18 16 11" fill="#5a3070" stroke="none" />
        {/* Shadow swirl */}
        <path d="M10 13 Q12 11 14 13 Q12 15 10 13" fill="none" stroke="#9070b0" strokeWidth="1.5" />
        {/* Drip from cork */}
        <path d="M13 4 Q14 5 13.5 7" fill="none" stroke="#7b5ea7" strokeWidth="1" />
    </svg>
);

/** Ethereal spirit flower — half-transparent with sparkles */
export const SpiritbloomIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Stem */}
        <line x1="12" y1="22" x2="12" y2="12" stroke="#3a6828" strokeWidth="2" />
        {/* Left petal — purple tint */}
        <path d="M12 10 Q5 8 4 2 Q9 6 12 8" fill="#b0a0d0" stroke="#7b5ea7" strokeWidth="1" />
        {/* Right petal — blue tint */}
        <path d="M12 8 Q19 6 20 0 Q15 4 12 7" fill="#a0c0e0" stroke="#4a8eca" strokeWidth="1" />
        {/* Center petal */}
        <path d="M12 7 Q9 1 12 0 Q15 1 12 7" fill="#d0c8e8" stroke="#7b5ea7" strokeWidth="1" />
        {/* Flower center — glowing */}
        <circle cx="12" cy="9" r="2" fill="#e8d44d" stroke="#c8a030" strokeWidth="1" />
        {/* Spirit sparkles */}
        <line x1="6" y1="4" x2="6" y2="6" stroke="#e8d44d" strokeWidth="1.5" />
        <line x1="5" y1="5" x2="7" y2="5" stroke="#e8d44d" strokeWidth="1.5" />
    </svg>
);

/** Charcoal ash pile with glowing embers */
export const IronbarkAshIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Ash pile — main mound */}
        <path d="M2 21 Q6 13 12 11 Q18 13 22 21 Z" fill="#6a6060" stroke="#4a4040" strokeWidth="1" />
        {/* Lighter ash top layer */}
        <path d="M5 21 Q8 16 12 14 Q16 16 19 21 Z" fill="#8a8078" stroke="none" />
        {/* Charred wood chunk — left */}
        <path d="M6 19 L5 15 L8 14 L9 18 Z" fill="#4a3828" stroke="#302018" strokeWidth="1" />
        {/* Charred wood chunk — right */}
        <path d="M14 18 L15 13 L18 14 L17 19 Z" fill="#4a3828" stroke="#302018" strokeWidth="1" />
        {/* Glowing embers */}
        <circle cx="10" cy="16" r="1.5" fill="#e85d3a" stroke="#c04020" strokeWidth="1" />
        <circle cx="15" cy="17" r="1" fill="#f08030" stroke="#c04020" strokeWidth="1" />
    </svg>
);

// ──────────────────────────────────────────
// Brewing Potion/Result Icons
// ──────────────────────────────────────────

/** Calming draught — round-bottomed flask, blue */
export const CalmingDraughtIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork */}
        <rect x="10" y="1" width="4" height="3" rx="1" fill="#a08060" stroke="#6a4830" strokeWidth="1" />
        {/* Neck */}
        <rect x="10" y="4" width="4" height="4" rx="0.5" fill="#3a6890" stroke="#204060" strokeWidth="1" />
        {/* Round body */}
        <circle cx="12" cy="15" r="7" fill="#3a6890" stroke="#204060" strokeWidth="1" />
        {/* Liquid fill */}
        <path d="M6 15 Q6 20 12 21 Q18 20 18 15" fill="#4a9eca" stroke="none" />
        {/* Wave line */}
        <path d="M7 15 Q9.5 13 12 15 Q14.5 17 17 15" fill="none" stroke="#70c0e8" strokeWidth="1.5" />
    </svg>
);

/** Fortifying tonic — square bottle, amber */
export const FortifyingTonicIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork */}
        <rect x="10" y="1" width="4" height="3" rx="1" fill="#a08060" stroke="#6a4830" strokeWidth="1" />
        {/* Square body */}
        <rect x="5" y="4" width="14" height="17" rx="2" fill="#7a6040" stroke="#504030" strokeWidth="1" />
        {/* Label area */}
        <rect x="7" y="7" width="10" height="11" rx="1" fill="#c89830" stroke="#8a6820" strokeWidth="1" />
        {/* Earth diamond symbol */}
        <path d="M10 13 L12 10 L14 13 L12 16 Z" fill="#8b7355" stroke="#6a5a40" strokeWidth="1" />
    </svg>
);

/** Blazebright serum — narrow tall vial, red-orange */
export const BlazebrightSerumIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork */}
        <rect x="10" y="1" width="4" height="2" rx="1" fill="#a08060" stroke="#6a4830" strokeWidth="1" />
        {/* Tall narrow vial */}
        <path d="M10 3 L9 6 L9 20 Q9 22 12 22 Q15 22 15 20 L15 6 L14 3 Z" fill="#8a3020" stroke="#5a1810" strokeWidth="1" />
        {/* Fiery liquid */}
        <path d="M10 10 L10 19 Q10 21 12 21 Q14 21 14 19 L14 10" fill="#e85d3a" stroke="none" />
        {/* Flame inside */}
        <path d="M11 14 Q12 10 13 14 Q12 12 11 14" fill="#f0a830" stroke="none" />
        {/* Heat lines */}
        <line x1="7" y1="8" x2="6" y2="5" stroke="#e85d3a" strokeWidth="1.5" />
        <line x1="17" y1="8" x2="18" y2="5" stroke="#e85d3a" strokeWidth="1.5" />
    </svg>
);

/** Clarity philter — teardrop flask, golden-clear */
export const ClarityPhilterIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork */}
        <rect x="10" y="1" width="4" height="3" rx="1" fill="#a08060" stroke="#6a4830" strokeWidth="1" />
        {/* Neck */}
        <path d="M10 4 L10 8 L14 8 L14 4 Z" fill="#b0a870" stroke="#807840" strokeWidth="1" />
        {/* Teardrop body */}
        <path d="M10 8 Q4 14 6 19 Q8 22 12 22 Q16 22 18 19 Q20 14 14 8 Z" fill="#b0a870" stroke="#807840" strokeWidth="1" />
        {/* Golden liquid */}
        <path d="M8 14 Q7 18 12 20 Q17 18 16 14" fill="#e8d44d" stroke="none" />
        {/* Light cross */}
        <line x1="12" y1="11" x2="12" y2="19" stroke="#f8f0a0" strokeWidth="1.5" />
        <line x1="8" y1="15" x2="16" y2="15" stroke="#f8f0a0" strokeWidth="1.5" />
    </svg>
);

/** Binding salve — wide squat jar, dark purple */
export const BindingSalveIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Lid */}
        <rect x="6" y="2" width="12" height="3" rx="1" fill="#5a5060" stroke="#3a3040" strokeWidth="1" />
        {/* Lid knob */}
        <rect x="10" y="1" width="4" height="2" rx="1" fill="#6a6070" stroke="#4a4050" strokeWidth="1" />
        {/* Wide jar body */}
        <path d="M5 5 L5 17 Q5 21 12 21 Q19 21 19 17 L19 5 Z" fill="#3a2840" stroke="#2a1830" strokeWidth="1" />
        {/* Paste fill */}
        <path d="M7 7 L7 16 Q7 19 12 19 Q17 19 17 16 L17 7 Z" fill="#5a3870" stroke="none" />
        {/* Binding sigil — eye shape */}
        <path d="M8 13 Q12 9 16 13 Q12 17 8 13 Z" fill="none" stroke="#9070b0" strokeWidth="1.5" />
        <circle cx="12" cy="13" r="1.5" fill="#7b5ea7" stroke="#9070b0" strokeWidth="1" />
    </svg>
);

/** Mindmist incense — cone on plate with dual smoke */
export const MindmistIncenseIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Plate base */}
        <ellipse cx="12" cy="20" rx="9" ry="2.5" fill="#6a6060" stroke="#4a4040" strokeWidth="1" />
        {/* Incense cone */}
        <path d="M9 20 L12 12 L15 20 Z" fill="#5a4060" stroke="#3a2840" strokeWidth="1" />
        {/* Ember tip */}
        <circle cx="12" cy="12" r="1.5" fill="#b882ff" stroke="#9060d0" strokeWidth="1" />
        {/* Smoke — purple */}
        <path d="M12 10 Q16 7 12 5" fill="none" stroke="#7b5ea7" strokeWidth="2" />
        {/* Smoke — gold */}
        <path d="M12 5 Q8 2 12 0" fill="none" stroke="#e8d44d" strokeWidth="1.5" />
    </svg>
);

/** Vitality balm — round pot with leaf emblem, warm green */
export const VitalityBalmIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Lid */}
        <rect x="6" y="2" width="12" height="3" rx="1" fill="#8b7355" stroke="#5a4830" strokeWidth="1" />
        {/* Pot body — rounded */}
        <path d="M5 5 Q4 8 4 12 Q4 20 12 21 Q20 20 20 12 Q20 8 19 5 Z" fill="#7a6040" stroke="#504030" strokeWidth="1" />
        {/* Balm fill */}
        <path d="M6 8 Q6 18 12 19 Q18 18 18 8" fill="#a09040" stroke="none" />
        {/* Leaf emblem */}
        <path d="M12 9 Q8 12 12 17 Q16 12 12 9 Z" fill="#68a858" stroke="#3a6828" strokeWidth="1" />
        {/* Leaf vein */}
        <line x1="12" y1="10" x2="12" y2="16" stroke="#3a6828" strokeWidth="1" />
    </svg>
);

/** Failed brew — cracked flask with murky sludge */
export const MurkySludgeIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork — popped off */}
        <rect x="15" y="1" width="4" height="2" rx="1" fill="#a08060" stroke="#6a4830" strokeWidth="1" transform="rotate(30 17 2)" />
        {/* Flask neck */}
        <rect x="10" y="3" width="4" height="4" rx="0.5" fill="#4a4838" stroke="#2a2820" strokeWidth="1" />
        {/* Round body */}
        <circle cx="12" cy="14" r="7" fill="#4a4838" stroke="#2a2820" strokeWidth="1" />
        {/* Sludge liquid */}
        <path d="M6 14 Q6 20 12 20 Q18 20 18 14" fill="#5a5830" stroke="none" />
        {/* Crack line */}
        <path d="M15 9 L13 13 L16 16" fill="none" stroke="#2a2820" strokeWidth="1.5" />
        {/* Bubbles */}
        <circle cx="10" cy="16" r="1.5" fill="#6a6830" stroke="#4a4820" strokeWidth="1" />
        <circle cx="14" cy="15" r="1" fill="#6a6830" stroke="#4a4820" strokeWidth="1" />
    </svg>
);

/** Failed salve — overflowing jar of foul paste */
export const FoulPasteIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Lid — askew */}
        <rect x="5" y="2" width="12" height="3" rx="1" fill="#6a6060" stroke="#4a4040" strokeWidth="1" transform="rotate(-10 11 3.5)" />
        {/* Jar body */}
        <path d="M5 5 L5 17 Q5 21 12 21 Q19 21 19 17 L19 5 Z" fill="#4a4838" stroke="#2a2820" strokeWidth="1" />
        {/* Paste — overflowing */}
        <path d="M7 7 L7 16 Q7 19 12 19 Q17 19 17 16 L17 7 Z" fill="#5a6830" stroke="none" />
        {/* Overflow drip — left */}
        <path d="M6 5 Q4 7 5 10" fill="none" stroke="#5a6830" strokeWidth="2" />
        {/* Overflow drip — right */}
        <path d="M18 6 Q20 8 19 11" fill="none" stroke="#5a6830" strokeWidth="2" />
        {/* Stink lines */}
        <path d="M9 4 Q8 1 9 0" fill="none" stroke="#8a8030" strokeWidth="1.5" />
        <path d="M15 3 Q14 0 15 -1" fill="none" stroke="#8a8030" strokeWidth="1.5" />
    </svg>
);

/** Failed tincture — fizzing cracked vial */
export const UnstableTinctureIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cork flying off */}
        <rect x="10" y="0" width="4" height="2" rx="1" fill="#a08060" stroke="#6a4830" strokeWidth="1" />
        {/* Tall vial body */}
        <path d="M10 2 L9 6 L9 20 Q9 22 12 22 Q15 22 15 20 L15 6 L14 2 Z" fill="#5a4050" stroke="#3a2030" strokeWidth="1" />
        {/* Unstable liquid */}
        <path d="M10 10 L10 19 Q10 21 12 21 Q14 21 14 19 L14 10" fill="#8a5070" stroke="none" />
        {/* Crack */}
        <path d="M14 8 L12 12 L15 15" fill="none" stroke="#3a2030" strokeWidth="1.5" />
        {/* Fizz bubbles escaping */}
        <circle cx="8" cy="5" r="1.5" fill="#b882ff" stroke="#9060d0" strokeWidth="1" />
        <circle cx="16" cy="3" r="1" fill="#b882ff" stroke="#9060d0" strokeWidth="1" />
        <circle cx="6" cy="2" r="1" fill="#b882ff" stroke="none" />
    </svg>
);

/** Failed incense — broken with acrid smoke */
export const AcridSmokeIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Plate base */}
        <ellipse cx="12" cy="20" rx="9" ry="2.5" fill="#6a6060" stroke="#4a4040" strokeWidth="1" />
        {/* Broken incense — two pieces */}
        <path d="M9 20 L11 15 L13 20 Z" fill="#4a3828" stroke="#302018" strokeWidth="1" />
        <path d="M13 18 L15 14 L16 18 Z" fill="#4a3828" stroke="#302018" strokeWidth="1" />
        {/* Acrid smoke — thick ugly cloud */}
        <path d="M12 14 Q17 10 12 7" fill="none" stroke="#8a7830" strokeWidth="2.5" />
        <path d="M12 7 Q7 3 12 1" fill="none" stroke="#6a6030" strokeWidth="2" />
        {/* Spark */}
        <circle cx="13" cy="14" r="1.5" fill="#a08030" stroke="#806020" strokeWidth="1" />
    </svg>
);

/** Oil jug — round with handle, golden */
export const OilFlaskIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Spout */}
        <path d="M10 3 L10 7 L14 7 L14 3 Q14 1 12 1 Q10 1 10 3 Z" fill="#c8a050" stroke="#8a6820" strokeWidth="1" />
        {/* Round body */}
        <circle cx="12" cy="14" r="7" fill="#c8a050" stroke="#8a6820" strokeWidth="1" />
        {/* Handle — right side */}
        <path d="M19 10 Q22 12 22 15 Q22 18 19 18" fill="none" stroke="#8a6820" strokeWidth="2" />
        {/* Oil liquid — amber */}
        <path d="M6 14 Q6 20 12 20 Q18 20 18 14" fill="#e8c860" stroke="none" />
        {/* Oil sheen highlight */}
        <line x1="9" y1="10" x2="9" y2="15" stroke="#f0d870" strokeWidth="1.5" />
    </svg>
);

/** Spirit bottle — tall elegant, clear glass */
export const SpiritBottleIcon: FC<CustomIconProps> = ({ size = 24, className = '' }) => (
    <svg {...svgColored(size, className)}>
        {/* Cap */}
        <rect x="10" y="1" width="4" height="2" rx="0.5" fill="#808890" stroke="#606870" strokeWidth="1" />
        {/* Tall neck */}
        <rect x="10" y="3" width="4" height="6" rx="0.5" fill="#c0c8d0" stroke="#808890" strokeWidth="1" />
        {/* Body — slightly wider */}
        <path d="M8 9 L8 19 Q8 22 12 22 Q16 22 16 19 L16 9 Z" fill="#d0d8e0" stroke="#808890" strokeWidth="1" />
        {/* Spirit liquid */}
        <path d="M9 12 L9 18 Q9 21 12 21 Q15 21 15 18 L15 12" fill="#e0e8f0" stroke="none" />
        {/* Label band */}
        <rect x="8" y="14" width="8" height="3" rx="0.5" fill="#a0a8b0" stroke="#808890" strokeWidth="1" />
    </svg>
);
