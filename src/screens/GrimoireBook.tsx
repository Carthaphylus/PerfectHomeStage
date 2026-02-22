import React, { FC, useState, useMemo, useCallback } from 'react';
import { Stage, CONDITIONING_ACTIONS, CONDITIONING_STRATEGIES, ConditioningAction } from '../Stage';
import { GameIcon } from './GameIcon';

// ── Category metadata ──
const SCHOOLS: { key: string; label: string; icon: string; color: string }[] = [
    { key: 'enchantment', label: 'Enchantment', icon: 'sparkles', color: '#c8aa6e' },
    { key: 'hex', label: 'Hexes', icon: 'skull', color: '#c75050' },
    { key: 'binding', label: 'Binding', icon: 'link', color: '#6eaac8' },
    { key: 'alchemy', label: 'Alchemy', icon: 'flask', color: '#6ec87a' },
    { key: 'beguile', label: 'Beguile', icon: 'heart', color: '#c86eb8' },
];

/** Build a page-pair (left + right) from the spell list grouped by school */
interface SpellPage {
    type: 'cover' | 'toc' | 'school-header' | 'spells';
    school?: typeof SCHOOLS[number];
    spells?: ConditioningAction[];
    tocSchools?: typeof SCHOOLS;
    pageLabel?: string;
}

function buildPages(allActions: ConditioningAction[]): SpellPage[] {
    const pages: SpellPage[] = [];

    // Cover (takes left side of first spread)
    pages.push({ type: 'cover' });

    // Table of Contents (right side of first spread)
    const usedSchools = SCHOOLS.filter(s =>
        allActions.some(a => a.category === s.key)
    );
    pages.push({ type: 'toc', tocSchools: usedSchools });

    // Each school: header page then spell pages (≤5 spells per page)
    const SPELLS_PER_PAGE = 5;
    for (const school of usedSchools) {
        const schoolSpells = allActions.filter(a => a.category === school.key);
        pages.push({ type: 'school-header', school });
        for (let i = 0; i < schoolSpells.length; i += SPELLS_PER_PAGE) {
            pages.push({
                type: 'spells',
                school,
                spells: schoolSpells.slice(i, i + SPELLS_PER_PAGE),
            });
        }
    }

    // Pad to even count for left/right spreads
    if (pages.length % 2 !== 0) {
        pages.push({ type: 'spells', spells: [] }); // blank filler
    }

    return pages;
}

// ── Component ──

interface GrimoireBookProps {
    stage: () => Stage;
    onClose: () => void;
}

export const GrimoireBook: FC<GrimoireBookProps> = ({ stage, onClose }) => {
    // spread index: 0-based, each spread = 2 pages
    const [spreadIdx, setSpreadIdx] = useState(0);
    const [turning, setTurning] = useState<'next' | 'prev' | null>(null);

    const stats = stage().currentState.stats;
    const mana = stats.mana;
    const maxMana = stats.maxMana;

    // Filter to non-bonus spells
    const allActions = useMemo(() => {
        return Object.values(CONDITIONING_ACTIONS).filter(action => {
            const isBonusAction = Object.values(CONDITIONING_STRATEGIES).some(
                s => s.bonusActions?.includes(action.id)
            );
            return !isBonusAction;
        });
    }, []);

    const pages = useMemo(() => buildPages(allActions), [allActions]);
    const totalSpreads = Math.ceil(pages.length / 2);

    const goNext = useCallback(() => {
        if (spreadIdx >= totalSpreads - 1 || turning) return;
        setTurning('next');
        setTimeout(() => {
            setSpreadIdx(i => i + 1);
            setTurning(null);
        }, 500);
    }, [spreadIdx, totalSpreads, turning]);

    const goPrev = useCallback(() => {
        if (spreadIdx <= 0 || turning) return;
        setTurning('prev');
        setTimeout(() => {
            setSpreadIdx(i => i - 1);
            setTurning(null);
        }, 500);
    }, [spreadIdx, turning]);

    // Jump to a specific school
    const jumpToSchool = useCallback((schoolKey: string) => {
        const idx = pages.findIndex(p => p.type === 'school-header' && p.school?.key === schoolKey);
        if (idx >= 0) {
            const targetSpread = Math.floor(idx / 2);
            setTurning('next');
            setTimeout(() => {
                setSpreadIdx(targetSpread);
                setTurning(null);
            }, 500);
        }
    }, [pages]);

    // Current spread pages
    const leftPage = pages[spreadIdx * 2] || null;
    const rightPage = pages[spreadIdx * 2 + 1] || null;

    return (
        <div className="grimoire-overlay" onClick={onClose}>
            <div className="grimoire-book" onClick={e => e.stopPropagation()}>

                {/* Close button */}
                <button className="grimoire-close" onClick={onClose}>
                    <GameIcon icon="x" size={14} />
                </button>

                {/* Mana display */}
                <div className="grimoire-mana-strip">
                    <GameIcon icon="sparkles" size={12} className="icon-mana" />
                    <div className="grimoire-mana-bar">
                        <div className="grimoire-mana-fill" style={{ width: `${maxMana > 0 ? (mana / maxMana) * 100 : 0}%` }} />
                    </div>
                    <span className="grimoire-mana-text">{mana} / {maxMana}</span>
                </div>

                {/* Book body */}
                <div className={`grimoire-spread ${turning ? `turning-${turning}` : ''}`}>
                    {/* Spine highlight */}
                    <div className="grimoire-spine" />

                    {/* Left page */}
                    <div className="grimoire-page grimoire-page-left">
                        <div className="grimoire-page-inner">
                            {leftPage && <PageContent page={leftPage} mana={mana} onSchoolClick={jumpToSchool} />}
                        </div>
                        <div className="grimoire-page-number">{spreadIdx * 2 + 1}</div>
                    </div>

                    {/* Right page */}
                    <div className="grimoire-page grimoire-page-right">
                        <div className="grimoire-page-inner">
                            {rightPage && <PageContent page={rightPage} mana={mana} onSchoolClick={jumpToSchool} />}
                        </div>
                        <div className="grimoire-page-number">{spreadIdx * 2 + 2}</div>
                    </div>

                    {/* Page turn overlay (animated element) */}
                    {turning && (
                        <div className={`grimoire-turning-page ${turning}`}>
                            <div className="grimoire-turning-front" />
                            <div className="grimoire-turning-back" />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="grimoire-nav">
                    <button
                        className="grimoire-nav-btn"
                        onClick={goPrev}
                        disabled={spreadIdx === 0 || !!turning}
                    >
                        ◂ Prev
                    </button>
                    <span className="grimoire-nav-pages">{spreadIdx + 1} / {totalSpreads}</span>
                    <button
                        className="grimoire-nav-btn"
                        onClick={goNext}
                        disabled={spreadIdx >= totalSpreads - 1 || !!turning}
                    >
                        Next ▸
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Page Content Renderer ──

const PageContent: FC<{
    page: SpellPage;
    mana: number;
    onSchoolClick: (key: string) => void;
}> = ({ page, mana, onSchoolClick }) => {

    if (page.type === 'cover') {
        return (
            <div className="grimoire-cover">
                <div className="grimoire-cover-ornament top" />
                <GameIcon icon="sparkles" size={36} className="grimoire-cover-icon" />
                <h2 className="grimoire-cover-title">Grimoire</h2>
                <div className="grimoire-cover-line" />
                <p className="grimoire-cover-sub">Spells & Incantations</p>
                <div className="grimoire-cover-ornament bottom" />
            </div>
        );
    }

    if (page.type === 'toc') {
        return (
            <div className="grimoire-toc">
                <h3 className="grimoire-toc-title">Table of Contents</h3>
                <div className="grimoire-toc-divider" />
                {page.tocSchools?.map(school => (
                    <button
                        key={school.key}
                        className="grimoire-toc-entry"
                        onClick={() => onSchoolClick(school.key)}
                    >
                        <GameIcon icon={school.icon} size={14} color={school.color} />
                        <span className="grimoire-toc-label" style={{ color: school.color }}>
                            {school.label}
                        </span>
                        <span className="grimoire-toc-dots" />
                    </button>
                ))}
            </div>
        );
    }

    if (page.type === 'school-header' && page.school) {
        return (
            <div className="grimoire-school-header">
                <div className="grimoire-school-ornament" />
                <GameIcon icon={page.school.icon} size={40} color={page.school.color} className="grimoire-school-icon" />
                <h3 className="grimoire-school-name" style={{ color: page.school.color }}>
                    {page.school.label}
                </h3>
                <div className="grimoire-school-rule" style={{ borderColor: page.school.color }} />
            </div>
        );
    }

    if (page.type === 'spells' && page.spells) {
        if (page.spells.length === 0) {
            return <div className="grimoire-blank" />;
        }
        return (
            <div className="grimoire-spell-list">
                {page.spells.map(spell => {
                    const canAfford = mana >= spell.manaCost;
                    return (
                        <div key={spell.id} className={`grimoire-spell-card ${canAfford ? '' : 'no-mana'}`}>
                            <div className="grimoire-spell-header">
                                <GameIcon
                                    icon={spell.icon}
                                    size={16}
                                    color={page.school?.color}
                                />
                                <span className="grimoire-spell-name">{spell.label}</span>
                                {spell.manaCost > 0 && (
                                    <span className={`grimoire-spell-mana ${canAfford ? '' : 'no-mana'}`}>
                                        <GameIcon icon="sparkles" size={8} className="icon-mana" />
                                        {spell.manaCost}
                                    </span>
                                )}
                            </div>
                            <p className="grimoire-spell-desc">{spell.tooltip}</p>
                            {spell.skillCheck && (
                                <span className="grimoire-spell-dc">
                                    {spell.skillCheck.skill.substring(0, 3).toUpperCase()} DC {spell.skillCheck.difficulty}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return null;
};

export default GrimoireBook;
