import React, { FC, useState, useMemo, useCallback } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import {
    getItemDefinition, getRarityColor,
    type BaseLiquid, type BrewResult, type ElementProfile, type BrewOutputForm,
    type ElementType,
} from '../data';
import {
    ALL_ELEMENTS, ELEMENT_COLORS, ELEMENT_LABELS,
    BASE_LIQUID_MAP, BASE_LIQUID_ITEM_MAP, BASE_LIQUID_LABELS, BREW_OUTPUT_LABELS,
    BREW_RECIPE_REGISTRY, MAX_BREW_INGREDIENTS,
    sumElementProfiles, getElementTotal, getDominantElement,
} from '../data/brewing';
import { GameIcon } from './GameIcon';

interface BrewingScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

const DEFAULT_LIQUID_COLOR = 'rgba(90, 60, 130, 0.5)';

export const BrewingScreen: FC<BrewingScreenProps> = ({ stage, setScreenType }) => {
    const [selectedIngredients, setSelectedIngredients] = useState<{ itemName: string; quantity: number }[]>([]);
    const [selectedBase, setSelectedBase] = useState<BaseLiquid>('water');
    const [brewPhase, setBrewPhase] = useState<'selecting' | 'brewing' | 'result'>('selecting');
    const [brewResult, setBrewResult] = useState<BrewResult | null>(null);
    const [plopKey, setPlopKey] = useState(0);
    const [, setTick] = useState(0);

    const st = stage().currentState;
    const inventory = st.inventory;

    const availableIngredients = useMemo(() => {
        return Object.values(inventory)
            .filter(inv => {
                const def = getItemDefinition(inv.name);
                return def.type === 'ingredient' && def.elementProfile;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [inventory]);

    const previewProfile = useMemo<ElementProfile>(() => {
        const profiles: ElementProfile[] = [];
        for (const sel of selectedIngredients) {
            const def = getItemDefinition(sel.itemName);
            if (def.elementProfile) {
                for (let i = 0; i < sel.quantity; i++) profiles.push(def.elementProfile);
            }
        }
        return sumElementProfiles(profiles);
    }, [selectedIngredients]);

    const totalIngredients = selectedIngredients.reduce((sum, s) => sum + s.quantity, 0);
    const outputForm: BrewOutputForm = BASE_LIQUID_MAP[selectedBase];
    const maxElementValue = Math.max(...ALL_ELEMENTS.map(e => previewProfile[e] || 0), 1);

    const liquidColor = useMemo(() => {
        if (totalIngredients === 0) return DEFAULT_LIQUID_COLOR;
        const dominant = getDominantElement(previewProfile);
        if (dominant) return ELEMENT_COLORS[dominant];
        return DEFAULT_LIQUID_COLOR;
    }, [previewProfile, totalIngredients]);

    const liquidLevel = totalIngredients > 0
        ? Math.min(20 + (totalIngredients / MAX_BREW_INGREDIENTS) * 60, 80) : 0;

    const getAvailableQty = useCallback((itemName: string) => {
        const inInventory = inventory[itemName]?.quantity ?? 0;
        const inCauldron = selectedIngredients.find(s => s.itemName === itemName)?.quantity ?? 0;
        return inInventory - inCauldron;
    }, [inventory, selectedIngredients]);

    const addIngredient = useCallback((itemName: string) => {
        if (totalIngredients >= MAX_BREW_INGREDIENTS) return;
        if (getAvailableQty(itemName) <= 0) return;
        setSelectedIngredients(prev => {
            const existing = prev.find(s => s.itemName === itemName);
            if (existing) return prev.map(s => s.itemName === itemName ? { ...s, quantity: s.quantity + 1 } : s);
            return [...prev, { itemName, quantity: 1 }];
        });
        setPlopKey(k => k + 1);
    }, [totalIngredients, getAvailableQty]);

    const removeIngredient = useCallback((itemName: string) => {
        setSelectedIngredients(prev => {
            const existing = prev.find(s => s.itemName === itemName);
            if (!existing) return prev;
            if (existing.quantity <= 1) return prev.filter(s => s.itemName !== itemName);
            return prev.map(s => s.itemName === itemName ? { ...s, quantity: s.quantity - 1 } : s);
        });
    }, []);

    const clearAll = useCallback(() => { setSelectedIngredients([]); }, []);

    const hasBaseLiquid = useCallback((base: BaseLiquid) => {
        if (base === 'water') return true;
        const itemName = Object.entries(BASE_LIQUID_ITEM_MAP).find(([, b]) => b === base)?.[0];
        if (!itemName) return false;
        return (inventory[itemName]?.quantity ?? 0) > 0;
    }, [inventory]);

    const doBrew = useCallback(() => {
        if (totalIngredients === 0) return;
        setBrewPhase('brewing');
        setTimeout(() => {
            const ingredientNames: string[] = [];
            for (const sel of selectedIngredients) {
                for (let i = 0; i < sel.quantity; i++) ingredientNames.push(sel.itemName);
            }
            const result = stage().brewPotion(ingredientNames, selectedBase);
            setBrewResult(result);
            setBrewPhase('result');
            setSelectedIngredients([]);
            setTick(t => t + 1);
        }, 2500);
    }, [totalIngredients, selectedIngredients, selectedBase, stage]);

    const dismissResult = useCallback(() => { setBrewResult(null); setBrewPhase('selecting'); }, []);

    const discoveredRecipes = st.discoveredRecipes;
    const allRecipes = Object.values(BREW_RECIPE_REGISTRY);
    const cauldronClass = brewPhase === 'brewing'
        ? 'cauldron-brewing' : totalIngredients > 0 ? 'cauldron-idle' : 'cauldron-empty';

    return (
        <div className="brewing-screen">
            {/* ════════ MAIN LAYOUT ════════ */}
            <div className="pc-layout">

                {/* ═══ CENTER: Scene Area ═══ */}
                <div className="pc-center">
                    {/* Top bar: back button + rune stones + brew info */}
                    <div className="pc-topbar">
                        <button className="back-button" onClick={() => setScreenType(ScreenType.INVENTORY)}>&lt; Back</button>

                        <div className="pc-runes">
                            {ALL_ELEMENTS.map(element => {
                                const val = previewProfile[element] || 0;
                                const active = val > 0;
                                const color = ELEMENT_COLORS[element];
                                return (
                                    <div key={element} className={`pc-rune ${active ? 'active' : ''}`}
                                        title={`${ELEMENT_LABELS[element]}: ${val}`}>
                                        <svg viewBox="0 0 50 60" className="pc-rune-svg">
                                            {active && <ellipse cx="25" cy="30" rx="22" ry="26"
                                                style={{ fill: color, opacity: 0.1, filter: 'blur(3px)' }} />}
                                            <path d="M25,4 L42,16 L42,40 L25,52 L8,40 L8,16 Z"
                                                style={{ stroke: active ? color : 'rgba(200,170,110,0.1)', fill: active ? `${color}12` : 'rgba(20,15,25,0.5)', strokeWidth: 1.5 }} />
                                            {active && <circle cx="25" cy="28" r="8" style={{ fill: color, opacity: 0.25 }} />}
                                            <text x="25" y="33" textAnchor="middle" dominantBaseline="middle"
                                                style={{ fontSize: '13px', fontFamily: "'Press Start 2P', monospace", fill: active ? color : 'rgba(200,170,110,0.12)' }}>
                                                {ELEMENT_LABELS[element][0]}
                                            </text>
                                        </svg>
                                        <span className="pc-rune-val" style={{ color: active ? color : 'rgba(200,170,110,0.15)' }}>{val}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pc-topbar-right">
                            <div className="pc-bottles">
                                {(['water', 'oil', 'spirit', 'smoke'] as BaseLiquid[]).map(base => {
                                    const available = hasBaseLiquid(base);
                                    const isActive = selectedBase === base;
                                    return (
                                        <div key={base}
                                            className={`pc-bottle ${isActive ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                                            onClick={() => available && setSelectedBase(base)}
                                            title={!available ? 'Not in inventory' : BASE_LIQUID_LABELS[base]}>
                                            <svg viewBox="0 0 24 36" className="pc-bottle-svg">
                                                <path className="pc-bottle-body" d="M7,14 L7,28 Q7,33 12,33 Q17,33 17,28 L17,14 Z" />
                                                <rect className="pc-bottle-neck" x="9" y="8" width="6" height="7" rx="1" />
                                                <rect className="pc-bottle-cork" x="8" y="5" width="8" height="4" rx="2" />
                                                {isActive && <rect className="pc-bottle-liquid" x="8" y="20" width="8" height="12" rx="2" />}
                                            </svg>
                                            <span>{BASE_LIQUID_LABELS[base]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pc-brew-info">
                                <span>{BREW_OUTPUT_LABELS[outputForm]}</span>
                                <span>{getElementTotal(previewProfile)} ess.</span>
                                <span>{totalIngredients}/{MAX_BREW_INGREDIENTS}</span>
                            </div>

                            <button className="pc-brew-btn" onClick={doBrew}
                                disabled={totalIngredients === 0 || brewPhase !== 'selecting'}>
                                <GameIcon icon="flame" size={10} />
                                {brewPhase === 'brewing' ? ' Brewing...' : ' Brew Potion'}
                            </button>
                        </div>
                    </div>

                    {/* Cauldron scene — fills the remaining space */}
                    <div className="pc-scene">
                        {/* Cauldron */}
                        <div className={`pc-cauldron ${cauldronClass}`}>
                            <svg className="cauldron-svg" viewBox="0 40 260 270" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id="potClip"><path d="M52,114 L52,198 Q52,242 130,242 Q208,242 208,198 L208,114 Z" /></clipPath>
                                    <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.18)" /><stop offset="12%" stopColor="rgba(255,255,255,0)" />
                                    </linearGradient>
                                    <radialGradient id="emberGlow" cx="50%" cy="40%" r="60%">
                                        <stop offset="0%" stopColor="rgba(255,120,40,0.4)" />
                                        <stop offset="60%" stopColor="rgba(200,60,20,0.15)" />
                                        <stop offset="100%" stopColor="rgba(80,20,10,0)" />
                                    </radialGradient>
                                    {/* 3D shading gradient for pot body — light from upper-left */}
                                    <linearGradient id="potBodyGrad" x1="0" y1="0" x2="1" y2="0.6">
                                        <stop offset="0%" stopColor="#2a2040" />
                                        <stop offset="25%" stopColor="#221835" />
                                        <stop offset="70%" stopColor="#18102a" />
                                        <stop offset="100%" stopColor="#0e0a1a" />
                                    </linearGradient>
                                    {/* Rim metallic gradient */}
                                    <linearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6a5a48" />
                                        <stop offset="30%" stopColor="#4d3e30" />
                                        <stop offset="70%" stopColor="#3a2e24" />
                                        <stop offset="100%" stopColor="#4a3a2c" />
                                    </linearGradient>
                                    {/* Handle metallic gradient — solid iron tones */}
                                    <linearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7a6850" />
                                        <stop offset="40%" stopColor="#5a4a3a" />
                                        <stop offset="100%" stopColor="#4a3a2c" />
                                    </linearGradient>
                                    {/* Subtle specular highlight on pot */}
                                    <radialGradient id="potHighlight" cx="30%" cy="30%" r="50%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                    </radialGradient>
                                </defs>

                                {/* Steam */}
                                {totalIngredients > 0 && (
                                    <g className="cauldron-steam">
                                        <path className="steam s1" d="M100,100 Q92,85 102,72 Q110,62 100,52" />
                                        <path className="steam s2" d="M130,96 Q138,82 128,68 Q120,58 130,48" />
                                        <path className="steam s3" d="M160,100 Q168,85 158,72 Q150,62 160,52" />
                                    </g>
                                )}

                                {/* Handles — layered for metallic depth */}
                                <g className="cauldron-handle-group">
                                    {/* Left handle: dark edge → body → highlight */}
                                    <path className="handle-shadow" d="M48,130 Q16,146 16,162 Q16,180 48,188" />
                                    <path className="handle-body" d="M48,130 Q18,145 18,162 Q18,180 48,188" />
                                    <path className="handle-highlight" d="M48,131 Q22,146 22,162 Q22,178 48,186" />
                                    {/* Left mounting plates */}
                                    <rect className="bracket-shadow" x="43" y="126" width="12" height="10" rx="2" />
                                    <rect className="bracket-body" x="44" y="126" width="10" height="9" rx="2" />
                                    <rect className="bracket-highlight" x="45" y="127" width="8" height="3" rx="1" />
                                    <circle className="bracket-rivet" cx="49" cy="131" r="1.5" />
                                    <rect className="bracket-shadow" x="43" y="184" width="12" height="10" rx="2" />
                                    <rect className="bracket-body" x="44" y="184" width="10" height="9" rx="2" />
                                    <rect className="bracket-highlight" x="45" y="185" width="8" height="3" rx="1" />
                                    <circle className="bracket-rivet" cx="49" cy="189" r="1.5" />

                                    {/* Right handle: dark edge → body → highlight */}
                                    <path className="handle-shadow" d="M212,130 Q244,146 244,162 Q244,180 212,188" />
                                    <path className="handle-body" d="M212,130 Q242,145 242,162 Q242,180 212,188" />
                                    <path className="handle-highlight" d="M212,131 Q238,146 238,162 Q238,178 212,186" />
                                    {/* Right mounting plates */}
                                    <rect className="bracket-shadow" x="205" y="126" width="12" height="10" rx="2" />
                                    <rect className="bracket-body" x="206" y="126" width="10" height="9" rx="2" />
                                    <rect className="bracket-highlight" x="207" y="127" width="8" height="3" rx="1" />
                                    <circle className="bracket-rivet" cx="211" cy="131" r="1.5" />
                                    <rect className="bracket-shadow" x="205" y="184" width="12" height="10" rx="2" />
                                    <rect className="bracket-body" x="206" y="184" width="10" height="9" rx="2" />
                                    <rect className="bracket-highlight" x="207" y="185" width="8" height="3" rx="1" />
                                    <circle className="bracket-rivet" cx="211" cy="189" r="1.5" />
                                </g>

                                {/* Main pot body — layered edge like handles */}
                                {/* Outer dark edge */}
                                <path className="pot-shadow" d="M48,110 L48,200 Q48,245 130,245 Q212,245 212,200 L212,110 Z" />
                                {/* Pot fill */}
                                <path className="pot-fill" d="M48,110 L48,200 Q48,245 130,245 Q212,245 212,200 L212,110 Z" fill="url(#potBodyGrad)" />
                                {/* Specular highlight overlay */}
                                <path d="M48,110 L48,200 Q48,245 130,245 Q212,245 212,200 L212,110 Z" fill="url(#potHighlight)" />

                                {/* No seam lines — they looked like scratches */}

                                {/* Rivets along the top — just below rim */}
                                {[70, 90, 110, 130, 150, 170, 190].map(x => (
                                    <circle key={x} className="cauldron-rivet" cx={x} cy="122" r="2" />
                                ))}

                                {/* Decorative medallion on front */}
                                <g className="cauldron-medallion">
                                    <circle cx="130" cy="178" r="20" className="medallion-outer" />
                                    <circle cx="130" cy="178" r="16" className="medallion-inner" />
                                    {/* Simple triskele — three curved arms from center */}
                                    <path className="medallion-design" d="M130,178 C130,170 124,164 118,166 C124,166 128,170 130,178" />
                                    <path className="medallion-design" d="M130,178 C136,183 142,184 144,190 C140,185 135,183 130,178" />
                                    <path className="medallion-design" d="M130,178 C124,183 118,184 116,190 C120,185 125,183 130,178" />
                                </g>

                                {/* Liquid fill */}
                                {totalIngredients > 0 && (
                                    <g clipPath="url(#potClip)">
                                        <rect className="cauldron-liquid-fill" x="52" width="156"
                                            y={242 - (242 - 114) * (liquidLevel / 100)} height={(242 - 114) * (liquidLevel / 100)}
                                            style={{ fill: liquidColor, transition: 'fill 0.5s ease, y 0.5s ease, height 0.5s ease' }} />
                                        <rect className="cauldron-liquid-surface" x="52" width="156"
                                            y={242 - (242 - 114) * (liquidLevel / 100)} height={(242 - 114) * (liquidLevel / 100)}
                                            fill="url(#liquidGrad)" style={{ transition: 'y 0.5s ease, height 0.5s ease' }} />
                                    </g>
                                )}
                                {/* Bubbles */}
                                {totalIngredients > 0 && (
                                    <g clipPath="url(#potClip)" className="cauldron-bubbles">
                                        <circle className="bub b1" cx="90" cy="210" r="4" />
                                        <circle className="bub b2" cx="120" cy="220" r="3" />
                                        <circle className="bub b3" cx="150" cy="215" r="5" />
                                        <circle className="bub b4" cx="170" cy="225" r="3" />
                                        <circle className="bub b5" cx="105" cy="230" r="4" />
                                    </g>
                                )}
                                {/* Plop */}
                                {totalIngredients > 0 && (
                                    <g key={plopKey} className="cauldron-plop" clipPath="url(#potClip)">
                                        <circle className="plop-ring" cx="130" cy={242 - (242 - 114) * (liquidLevel / 100) + 5} r="8" style={{ stroke: liquidColor }} />
                                    </g>
                                )}

                                {/* Rim — thick with overhang lip */}
                                <rect className="cauldron-rim" x="34" y="100" width="192" height="18" rx="4" fill="url(#rimGrad)" />
                                {/* Rim top highlight */}
                                <rect className="cauldron-rim-highlight" x="36" y="101" width="188" height="4" rx="2" />

                                {/* Two stubby curved legs — stroke-based like handles */}
                                <g className="cauldron-legs">
                                    {/* Left leg: shadow → body → highlight (same technique as handles) */}
                                    <path className="leg-shadow" d="M82,240 Q58,252 52,272" />
                                    <path className="leg-body" d="M82,240 Q58,252 52,272" />
                                    <path className="leg-highlight" d="M84,241 Q62,252 56,270" />
                                    {/* Left foot */}
                                    <ellipse className="foot-shadow" cx="52" cy="274" rx="8" ry="4" />
                                    <ellipse className="foot-body" cx="52" cy="273" rx="7" ry="3.5" />
                                    <ellipse className="foot-highlight" cx="50" cy="272" rx="3.5" ry="1.5" />

                                    {/* Right leg */}
                                    <path className="leg-shadow" d="M178,240 Q202,252 208,272" />
                                    <path className="leg-body" d="M178,240 Q202,252 208,272" />
                                    <path className="leg-highlight" d="M176,241 Q198,252 204,270" />
                                    {/* Right foot */}
                                    <ellipse className="foot-shadow" cx="208" cy="274" rx="8" ry="4" />
                                    <ellipse className="foot-body" cx="208" cy="273" rx="7" ry="3.5" />
                                    <ellipse className="foot-highlight" cx="206" cy="272" rx="3.5" ry="1.5" />
                                </g>
                                <ellipse className="ember-ambient" cx="130" cy="275" rx="70" ry="18" fill="url(#emberGlow)" />
                                <g className="ember-bed">
                                    <ellipse className="ember-ash" cx="130" cy="282" rx="62" ry="10" />
                                    <ellipse className="coal c1" cx="88" cy="276" rx="9" ry="6" />
                                    <ellipse className="coal c2" cx="108" cy="280" rx="11" ry="7" />
                                    <ellipse className="coal c3" cx="130" cy="278" rx="12" ry="7" />
                                    <ellipse className="coal c4" cx="152" cy="280" rx="10" ry="6" />
                                    <ellipse className="coal c5" cx="172" cy="276" rx="9" ry="6" />
                                    <ellipse className="coal c6" cx="98" cy="283" rx="7" ry="5" />
                                    <ellipse className="coal c7" cx="120" cy="285" rx="8" ry="5" />
                                    <ellipse className="coal c8" cx="142" cy="284" rx="7" ry="5" />
                                    <ellipse className="coal c9" cx="162" cy="283" rx="7" ry="5" />
                                    <line className="ember-crack cr1" x1="96" y1="278" x2="102" y2="276" />
                                    <line className="ember-crack cr2" x1="118" y1="280" x2="124" y2="277" />
                                    <line className="ember-crack cr3" x1="138" y1="279" x2="144" y2="276" />
                                    <line className="ember-crack cr4" x1="158" y1="278" x2="164" y2="276" />
                                    <line className="ember-crack cr5" x1="108" y1="284" x2="114" y2="282" />
                                    <line className="ember-crack cr6" x1="148" y1="284" x2="154" y2="282" />
                                </g>
                                <g className="cauldron-fire">
                                    <path className="flame f1" d="M92,272 Q88,260 93,254 Q97,261 95,272 Z" />
                                    <path className="flame f2" d="M112,270 Q108,256 114,248 Q118,257 116,270 Z" />
                                    <path className="flame f3" d="M130,268 Q125,252 133,244 Q139,254 136,268 Z" />
                                    <path className="flame f4" d="M148,270 Q144,256 150,249 Q154,257 152,270 Z" />
                                    <path className="flame f5" d="M168,272 Q165,260 170,255 Q174,262 172,272 Z" />
                                    <path className="flame-core fc1" d="M93,270 Q91,264 94,261 Q96,265 95,270 Z" />
                                    <path className="flame-core fc2" d="M113,268 Q110,260 115,256 Q117,261 116,268 Z" />
                                    <path className="flame-core fc3" d="M132,266 Q128,256 134,252 Q137,258 136,266 Z" />
                                    <path className="flame-core fc4" d="M149,268 Q146,260 151,257 Q153,262 152,268 Z" />
                                    <path className="flame-core fc5" d="M169,270 Q167,264 171,261 Q173,266 172,270 Z" />
                                </g>
                                <g className="ember-sparks">
                                    <circle className="spark sp1" cx="100" cy="268" r="1.2" />
                                    <circle className="spark sp2" cx="122" cy="264" r="1" />
                                    <circle className="spark sp3" cx="140" cy="266" r="1.3" />
                                    <circle className="spark sp4" cx="158" cy="265" r="1" />
                                    <circle className="spark sp5" cx="130" cy="260" r="1.2" />
                                </g>
                            </svg>
                        </div>

                    </div>

                    {/* ═══ Cobblestone Footer ═══ */}
                    <div className="pc-cobble-footer">
                        <svg className="cobble-svg" viewBox="0 0 800 120" preserveAspectRatio="none">
                            {/* Top edge — uneven stone line */}
                            <path className="cobble-edge" d="M0,8 Q20,2 50,6 Q80,10 120,4 Q160,0 200,5 Q240,10 280,3 Q320,0 360,7 Q400,4 440,8 Q480,2 520,6 Q560,10 600,3 Q640,0 680,7 Q720,4 760,6 Q790,8 800,5 L800,12 L0,12 Z" />
                            {/* Main stone floor */}
                            <rect className="cobble-base" x="0" y="10" width="800" height="110" />
                            {/* Individual cobblestones — irregular shapes */}
                            {/* Row 1 */}
                            <path className="cobble-stone cs1" d="M5,14 Q8,12 30,13 Q55,11 58,14 L60,32 Q58,36 32,37 Q6,35 4,32 Z" />
                            <path className="cobble-stone cs2" d="M64,12 Q68,10 100,13 Q130,11 135,14 L137,34 Q134,37 100,36 Q66,38 63,34 Z" />
                            <path className="cobble-stone cs3" d="M141,13 Q145,10 185,12 Q220,10 225,14 L227,33 Q224,36 185,37 Q143,35 140,32 Z" />
                            <path className="cobble-stone cs4" d="M231,12 Q235,10 275,13 Q310,11 315,14 L316,34 Q313,37 275,35 Q233,37 230,33 Z" />
                            <path className="cobble-stone cs5" d="M320,13 Q324,11 360,12 Q400,10 405,14 L406,33 Q403,36 360,37 Q322,35 319,32 Z" />
                            <path className="cobble-stone cs6" d="M410,12 Q414,10 455,13 Q495,11 500,14 L501,34 Q498,37 455,36 Q412,38 409,34 Z" />
                            <path className="cobble-stone cs7" d="M505,13 Q510,10 550,12 Q590,10 595,14 L596,33 Q593,36 550,37 Q507,35 504,32 Z" />
                            <path className="cobble-stone cs8" d="M600,12 Q604,10 645,13 Q685,11 690,14 L691,34 Q688,37 645,35 Q602,37 599,33 Z" />
                            <path className="cobble-stone cs9" d="M695,13 Q700,11 740,12 Q775,10 780,14 L782,33 Q779,36 740,37 Q697,35 694,32 Z" />
                            {/* Row 2 — offset */}
                            <path className="cobble-stone cs10" d="M20,40 Q25,38 65,39 Q105,37 110,41 L112,60 Q108,63 65,62 Q22,64 19,60 Z" />
                            <path className="cobble-stone cs11" d="M116,39 Q120,37 165,40 Q205,38 210,41 L211,61 Q208,64 165,62 Q118,64 115,60 Z" />
                            <path className="cobble-stone cs12" d="M215,40 Q220,37 270,39 Q315,37 320,41 L321,60 Q318,63 270,62 Q217,64 214,60 Z" />
                            <path className="cobble-stone cs13" d="M325,39 Q330,37 375,40 Q420,38 425,41 L426,61 Q423,64 375,62 Q327,64 324,60 Z" />
                            <path className="cobble-stone cs14" d="M430,40 Q435,37 480,39 Q525,37 530,41 L531,60 Q528,63 480,62 Q432,64 429,60 Z" />
                            <path className="cobble-stone cs15" d="M535,39 Q540,37 585,40 Q630,38 635,41 L636,61 Q633,64 585,62 Q537,64 534,60 Z" />
                            <path className="cobble-stone cs16" d="M640,40 Q645,37 690,39 Q735,37 740,41 L741,60 Q738,63 690,62 Q642,64 639,60 Z" />
                            {/* Row 3 */}
                            <path className="cobble-stone cs17" d="M5,67 Q10,65 50,66 Q90,64 95,68 L97,86 Q93,89 50,88 Q7,90 4,86 Z" />
                            <path className="cobble-stone cs18" d="M100,66 Q105,64 150,67 Q195,65 200,68 L201,87 Q198,90 150,88 Q102,90 99,86 Z" />
                            <path className="cobble-stone cs19" d="M205,67 Q210,64 260,66 Q310,64 315,68 L316,86 Q313,89 260,88 Q207,90 204,86 Z" />
                            <path className="cobble-stone cs20" d="M320,66 Q325,64 375,67 Q425,65 430,68 L431,87 Q428,90 375,88 Q322,90 319,86 Z" />
                            <path className="cobble-stone cs21" d="M435,67 Q440,64 490,66 Q540,64 545,68 L546,86 Q543,89 490,88 Q437,90 434,86 Z" />
                            <path className="cobble-stone cs22" d="M550,66 Q555,64 605,67 Q655,65 660,68 L661,87 Q658,90 605,88 Q552,90 549,86 Z" />
                            <path className="cobble-stone cs23" d="M665,67 Q670,64 720,66 Q770,64 775,68 L776,86 Q773,89 720,88 Q667,90 664,86 Z" />
                            {/* Mortar/grout lines (gaps between stones) */}
                            <line className="cobble-grout" x1="0" y1="38" x2="800" y2="38" />
                            <line className="cobble-grout" x1="0" y1="64" x2="800" y2="64" />
                        </svg>
                    </div>
                </div>

                {/* ═══ RIGHT PANEL: Ingredients ═══ */}
                <div className="pc-right">
                    <div className="pc-panel-header">
                        <span className="pc-title">Ingredients</span>
                    </div>
                    {/* Noise texture overlay */}
                    <div className="panel-texture" />

                    <div className="pc-ing-grid">
                        {availableIngredients.length === 0 && (
                            <div className="pc-ing-empty">No ingredients in inventory</div>
                        )}
                        {availableIngredients.map(inv => {
                            const def = getItemDefinition(inv.name);
                            const available = getAvailableQty(inv.name);
                            const profile = def.elementProfile || {};
                            const elements = ALL_ELEMENTS.filter(e => (profile[e] || 0) > 0);
                            const dominant = elements[0];
                            return (
                                <div key={inv.name}
                                    className={`pc-ing-cell ${available <= 0 ? 'depleted' : ''}`}
                                    onClick={() => available > 0 && addIngredient(inv.name)}>
                                    <GameIcon icon={def.icon} size={26} />
                                    <span className="pc-ing-qty">{available}</span>
                                    {dominant && (
                                        <span className="pc-ing-element" style={{ backgroundColor: ELEMENT_COLORS[dominant] }} />
                                    )}
                                    {/* Tooltip */}
                                    <div className="pc-ing-tooltip">
                                        <div className="pc-ing-tooltip-name">{inv.name}</div>
                                        <div className="pc-ing-tooltip-els">
                                            {elements.map(e => (
                                                <span key={e} style={{ color: ELEMENT_COLORS[e] }}>
                                                    {ELEMENT_LABELS[e]}: {profile[e]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* In-cauldron items at bottom */}
                    {selectedIngredients.length > 0 && (
                        <div className="pc-right-added">
                            <div className="pc-section-label">In Cauldron <button className="pc-clear-sm" onClick={clearAll}>Clear</button></div>
                            {selectedIngredients.map(sel => {
                                const def = getItemDefinition(sel.itemName);
                                return (
                                    <div key={sel.itemName} className="pc-right-added-row">
                                        <GameIcon icon={def.icon} size={12} />
                                        <span className="pc-ra-name">{sel.itemName}</span>
                                        <span className="pc-ra-qty">x{sel.quantity}</span>
                                        <button className="pc-ra-btn" onClick={() => removeIngredient(sel.itemName)}>-</button>
                                        <button className="pc-ra-btn" onClick={() => addIngredient(sel.itemName)}
                                            disabled={getAvailableQty(sel.itemName) <= 0 || totalIngredients >= MAX_BREW_INGREDIENTS}>+</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Result overlay */}
            {brewPhase === 'result' && brewResult && (
                <div className="brew-result-overlay" onClick={dismissResult}>
                    <div className={`brew-result-card quality-${brewResult.quality}`}>
                        {brewResult.isNewDiscovery && <div className="brew-discovery-badge">New Discovery!</div>}
                        <div className="brew-result-icon"><GameIcon icon={getItemDefinition(brewResult.resultItemName).icon} size={32} /></div>
                        <div className="brew-result-name">{brewResult.resultItemName}</div>
                        <div className={`brew-result-quality ${brewResult.quality}`}>{brewResult.quality.toUpperCase()}</div>
                        <div className="brew-result-feedback">{brewResult.feedback}</div>
                        <div className="brew-result-dismiss">Click to continue</div>
                    </div>
                </div>
            )}
        </div>
    );
};
