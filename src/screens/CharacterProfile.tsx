import React, { FC, ReactNode } from 'react';
import { Stage, StatName, STAT_DEFINITIONS, numberToGrade, getGradeColor, getStatColor } from '../Stage';
import { CharacterGallery } from './CharacterGallery';
import { TraitChip } from './TraitChip';
import { GameIcon } from './GameIcon';

/**
 * Shared character data shape — every profile passes this.
 */
export interface CharacterProfileData {
    name: string;
    avatar: string;
    color: string;
    title: string;              // e.g. heroClass, formerClass, "The Witch of the Manor"
    description: string;
    traits: string[];
    details: Record<string, string>;
    stats?: Record<StatName, number>;
}

/**
 * Optional sections that differ per role.
 * Rendered between "About" and "Details" in the bio panel.
 */
export interface CharacterProfileProps {
    stage: () => Stage;
    character: CharacterProfileData;
    onBack: () => void;
    backLabel?: string;          // e.g. "< Back", "< Menu"

    /** Badge below the title (e.g. hero status) */
    statusBadge?: ReactNode;

    /** Action buttons under the card (Gallery is always included) */
    extraActions?: ReactNode;

    /** Extra bio sections rendered between About and Details */
    extraSections?: ReactNode;

    /** Assigned role with traits and color (for servants) */
    assignedRole?: {
        name: string;
        color: string;
        traits: string[];
    };
}

export const CharacterProfile: FC<CharacterProfileProps> = ({
    stage,
    character,
    onBack,
    backLabel = '< Back',
    statusBadge,
    extraActions,
    extraSections,
    assignedRole,
}) => {
    const [showGallery, setShowGallery] = React.useState(false);

    if (showGallery) {
        return (
            <CharacterGallery
                stage={stage}
                charName={character.name}
                charAvatar={character.avatar}
                charSpecies={character.details['Species'] || 'character'}
                charColor={character.color}
                onClose={() => setShowGallery(false)}
            />
        );
    }

    return (
        <div className="char-profile-screen" style={{ '--char-color': character.color } as React.CSSProperties}>
            <div className="screen-header">
                <button className="back-button" onClick={onBack}>
                    {backLabel}
                </button>
                <h2>{character.name}</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="char-profile-content">
                {/* ── Left: Card ── */}
                <div className="char-card">
                    <div className="char-avatar-frame">
                        <img src={character.avatar} alt={character.name} />
                    </div>
                    <div className="char-info">
                        <h3 className="char-name">{character.name}</h3>
                        <span className="char-title">{character.title}</span>
                        {statusBadge}
                    </div>
                    <div className="char-action-btns">
                        <button className="gallery-open-btn" onClick={() => setShowGallery(true)}>
                            <GameIcon icon="image" size={12} /> Gallery
                        </button>
                        {extraActions}
                    </div>
                </div>

                {/* ── Right: Bio Panel ── */}
                <div className="char-bio-panel">
                    <div className="char-bio-section">
                        <h4>About</h4>
                        <p>{character.description}</p>
                    </div>

                    {/* Role-specific sections */}
                    {extraSections}

                    <div className="char-bio-section">
                        <h4>Details</h4>
                        {Object.entries(character.details).map(([key, value]) => (
                            <div key={key} className="char-detail-row">
                                <span className="char-detail-label">{key}</span>
                                {key === 'Gender' ? (
                                    <span className="char-detail-value char-gender-value">
                                        <span className="gender-symbol">{value.split(' ')[0]}</span>
                                        <span>{value.split(' ').slice(1).join(' ')}</span>
                                    </span>
                                ) : (
                                    <span className="char-detail-value">{value}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {character.stats && (
                        <div className="char-bio-section">
                            <h4>Stats</h4>
                            <div className="char-stat-block">
                                {STAT_DEFINITIONS.map(statDef => {
                                    const value = (character.stats && character.stats[statDef.name]) || 0;
                                    const grade = numberToGrade(value);
                                    const gradeColor = getGradeColor(grade);
                                    const statColor = getStatColor(statDef.name);
                                    const totalBlocks = 20;
                                    const filledBlocks = Math.round((value / 100) * totalBlocks);
                                    return (
                                        <div key={statDef.name} className="stat-row">
                                            <div className="stat-row-left">
                                                <span 
                                                    className="stat-grade-letter" 
                                                    style={{ color: gradeColor }}
                                                >
                                                    {grade}
                                                </span>
                                                <span className="stat-name" style={{ color: statColor }}>
                                                    {statDef.label}
                                                </span>
                                            </div>
                                            <div className="stat-row-right">
                                                <div className="stat-blocks-container">
                                                    {Array.from({ length: totalBlocks }).map((_, i) => {
                                                        const isFilled = i < filledBlocks;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`stat-block ${isFilled ? 'filled' : ''}`}
                                                                style={isFilled ? {
                                                                    ['--stat-fill-color' as any]: statColor,
                                                                    borderColor: statColor,
                                                                } : {
                                                                    borderColor: statColor,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="char-bio-section">
                        <h4>Traits</h4>
                        <div className="char-trait-list">{character.traits.map(t => (
                                <TraitChip
                                    key={`innate-${t}`} 
                                    trait={t}
                                    className="char-trait char-trait-innate"
                                    color={character.color}
                                    source="character"
                                />
                            ))}
                            {assignedRole?.traits.map(t => (
                                <TraitChip
                                    key={`role-${t}`} 
                                    trait={t}
                                    className="char-trait char-trait-role"
                                    color={assignedRole.color}
                                    source="room"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
