import React, { FC, useState, useMemo, useCallback } from 'react';
import { Stage, CONDITIONING_ACTIONS, CONDITIONING_STRATEGIES, ConditioningAction } from '../Stage';
import { GameIcon } from './GameIcon';

// ── Category metadata ──
const SCHOOLS: { key: string; label: string; icon: string; color: string; desc: string }[] = [
    { key: 'enchantment', label: 'Enchantment', icon: 'sparkles', color: '#c8aa6e', desc: 'Weaving threads of will into the fabric of the mind, bending thought and desire to the caster\'s command.' },
    { key: 'hex', label: 'Hexes', icon: 'skull', color: '#c75050', desc: 'Dark incantations drawn from shadow and malice, cursing the target with afflictions of the spirit.' },
    { key: 'binding', label: 'Binding', icon: 'link', color: '#6eaac8', desc: 'Arcane chains and wards that shackle body and spirit to the caster\'s unyielding dominion.' },
    { key: 'alchemy', label: 'Alchemy', icon: 'flask', color: '#6ec87a', desc: 'Transmutation of essence through forbidden elixirs and reagents, reshaping form and mind alike.' },
    { key: 'beguile', label: 'Beguile', icon: 'heart', color: '#c86eb8', desc: 'The subtle mastery of charm and fascination, ensnaring hearts with whispered enchantments.' },
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * Each spread is: left = school header, right = spells.
 * If a school has more spells than fit on one page, it gets multiple spreads,
 * with the school header always repeated on the left.
 * First spread is always cover (left) + ToC (right).
 */
interface Spread {
    left: SpreadPage;
    right: SpreadPage;
}

interface SpreadPage {
    type: 'cover' | 'toc' | 'school-header' | 'spells' | 'blank';
    school?: typeof SCHOOLS[number];
    spells?: ConditioningAction[];
    tocSchools?: typeof SCHOOLS;
}

function buildSpreads(allActions: ConditioningAction[]): Spread[] {
    const spreads: Spread[] = [];

    // Spread 0: Cover + ToC
    const usedSchools = SCHOOLS.filter(s =>
        allActions.some(a => a.category === s.key)
    );
    spreads.push({
        left: { type: 'cover' },
        right: { type: 'toc', tocSchools: usedSchools },
    });

    // One spread per school: left = header, right = all spells (scrollable)
    for (const school of usedSchools) {
        const schoolSpells = allActions.filter(a => a.category === school.key);
        spreads.push({
            left: { type: 'school-header', school, spells: schoolSpells },
            right: { type: 'spells', school, spells: schoolSpells },
        });
    }

    return spreads;
}

// ── Component ──

interface GrimoireBookProps {
    stage: () => Stage;
    onClose: () => void;
}

export const GrimoireBook: FC<GrimoireBookProps> = ({ stage, onClose }) => {
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

    const spreads = useMemo(() => buildSpreads(allActions), [allActions]);
    const totalSpreads = spreads.length;

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
        const idx = spreads.findIndex(s =>
            s.left.type === 'school-header' && s.left.school?.key === schoolKey
        );
        if (idx >= 0) {
            setTurning('next');
            setTimeout(() => {
                setSpreadIdx(idx);
                setTurning(null);
            }, 500);
        }
    }, [spreads]);

    const spread = spreads[spreadIdx];

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
                            <PageContent page={spread.left} mana={mana} onSchoolClick={jumpToSchool} />
                        </div>
                    </div>

                    {/* Right page */}
                    <div className="grimoire-page grimoire-page-right">
                        <div className="grimoire-page-inner">
                            <PageContent page={spread.right} mana={mana} onSchoolClick={jumpToSchool} />
                        </div>
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
    page: SpreadPage;
    mana: number;
    onSchoolClick: (key: string) => void;
}> = ({ page, mana, onSchoolClick }) => {

    if (page.type === 'cover') {
        return (
            <div className="grimoire-cover">
                <div className="grimoire-cover-filigree tl" />
                <div className="grimoire-cover-filigree tr" />
                <div className="grimoire-cover-filigree bl" />
                <div className="grimoire-cover-filigree br" />
                <div className="grimoire-cover-ornament top" />
                <div className="grimoire-cover-sigil">
                    <div className="sigil-ring outer" />
                    <div className="sigil-ring inner" />
                    <GameIcon icon="sparkles" size={30} className="grimoire-cover-icon" />
                </div>
                <h2 className="grimoire-cover-title">Grimoire</h2>
                <div className="grimoire-cover-line" />
                <p className="grimoire-cover-sub">Spells & Incantations</p>
                <div className="grimoire-cover-ornament bottom" />
                <p className="grimoire-cover-edition">— Vol. I —</p>
            </div>
        );
    }

    if (page.type === 'toc') {
        return (
            <div className="grimoire-toc">
                <div className="grimoire-toc-header-ornament">✦</div>
                <h3 className="grimoire-toc-title">Table of Contents</h3>
                <div className="grimoire-toc-divider" />
                {page.tocSchools?.map((school, i) => (
                    <button
                        key={school.key}
                        className="grimoire-toc-entry"
                        onClick={() => onSchoolClick(school.key)}
                    >
                        <span className="grimoire-toc-numeral">{ROMAN[i]}</span>
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
            <div className="grimoire-school-header" style={{ '--school-color': page.school.color } as React.CSSProperties}>
                <div className="grimoire-arcane-sigil">
                    <div className="sigil-circle outer" />
                    <div className="sigil-circle middle" />
                    <div className="sigil-circle inner" />
                    <div className="sigil-glow" />
                    <GameIcon icon={page.school.icon} size={36} color={page.school.color} className="grimoire-school-icon" />
                </div>
                <h3 className="grimoire-school-name" style={{ color: page.school.color }}>
                    {page.school.label}
                </h3>
                <div className="grimoire-school-rule" />
                <p className="grimoire-school-desc">{page.school.desc}</p>
                <span className="grimoire-school-count">{page.spells?.length ?? 0} Incantations</span>
            </div>
        );
    }

    if (page.type === 'spells' && page.spells) {
        if (page.spells.length === 0) {
            return <div className="grimoire-blank" />;
        }
        return (
            <div className="grimoire-spell-list" style={{ '--school-color': page.school?.color } as React.CSSProperties}>
                {page.spells.map((spell, i) => {
                    const canAfford = mana >= spell.manaCost;
                    return (
                        <React.Fragment key={spell.id}>
                            {i > 0 && <div className="grimoire-spell-divider"><span className="divider-rune">◆</span></div>}
                            <div className={`grimoire-spell-card ${canAfford ? '' : 'no-mana'}`}>
                                <div className="spell-accent" />
                                <div className="spell-content">
                                    <div className="grimoire-spell-header">
                                        <div className="spell-icon-frame">
                                            <GameIcon icon={spell.icon} size={14} color={page.school?.color} />
                                        </div>
                                        <span className="grimoire-spell-name">{spell.label}</span>
                                        {spell.manaCost > 0 && (
                                            <span className={`grimoire-spell-mana ${canAfford ? '' : 'no-mana'}`}>
                                                <GameIcon icon="sparkles" size={8} className="icon-mana" />
                                                {spell.manaCost}
                                            </span>
                                        )}
                                    </div>
                                    <p className="grimoire-spell-desc">{spell.tooltip}</p>
                                    <div className="grimoire-spell-footer">
                                        {spell.skillCheck ? (
                                            <span className="grimoire-spell-dc">
                                                {spell.skillCheck.skill.substring(0, 3).toUpperCase()} DC {spell.skillCheck.difficulty}
                                            </span>
                                        ) : (
                                            <span className="grimoire-spell-badge no-check">NO CHECK</span>
                                        )}
                                        {(spell.requiresItem || spell.consumeItem) && (
                                            <span className="grimoire-spell-badge item-req">
                                                <GameIcon icon="flask" size={8} className="badge-icon" />
                                                {spell.requiresItem || spell.consumeItem}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    return null;
};

export default GrimoireBook;
